package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/mapsocial/chat-service/internal/models"
	"github.com/mapsocial/chat-service/internal/service"
)

type ChatHandler struct {
	service *service.ChatService
	hub     *wsHub
}

func NewChatHandler(s *service.ChatService) *ChatHandler {
	hub := newHub()
	go hub.run()
	return &ChatHandler{service: s, hub: hub}
}

func (h *ChatHandler) SetupRoutes(r *gin.Engine) {
	r.GET("/chats", h.GetChats)
	r.POST("/chats", h.CreateChat)
	r.GET("/chats/:id/messages", h.GetMessages)
	r.POST("/chats/:id/messages", h.SendMessage)
	r.GET("/ws/chats/:id", h.ChatWS)
	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
}

func getUserID(c *gin.Context) uint {
	id, _ := strconv.ParseUint(c.GetHeader("X-User-ID"), 10, 64)
	return uint(id)
}

func getUsername(c *gin.Context) string {
	return c.GetHeader("X-Username")
}

func (h *ChatHandler) GetChats(c *gin.Context) {
	userID := getUserID(c)
	chats, err := h.service.GetChats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"chats": chats})
}

func (h *ChatHandler) CreateChat(c *gin.Context) {
	userID := getUserID(c)
	username := getUsername(c)
	var req models.CreateChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	chat, err := h.service.CreateChat(userID, username, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, chat)
}

func (h *ChatHandler) GetMessages(c *gin.Context) {
	chatID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)
	if !h.service.CanAccessChat(uint(chatID), userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	messages, err := h.service.GetMessages(uint(chatID), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"messages": messages})
}

func (h *ChatHandler) SendMessage(c *gin.Context) {
	chatID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)
	if !h.service.CanAccessChat(uint(chatID), userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}
	username := getUsername(c)
	var req models.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	msg, err := h.service.SendMessage(uint(chatID), userID, username, req.Text)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	b, _ := json.Marshal(msg)
	h.hub.broadcast(uint(chatID), b)
	c.JSON(http.StatusCreated, msg)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (h *ChatHandler) ChatWS(c *gin.Context) {
	chatID64, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	chatID := uint(chatID64)
	userID := getUserID(c)
	if !h.service.CanAccessChat(chatID, userID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		return
	}
	client := &wsClient{conn: conn, chatID: chatID}
	h.hub.register <- client

	go func() {
		defer func() {
			h.hub.unregister <- client
			_ = conn.Close()
		}()
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}()

	ticker := time.NewTicker(20 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case msg, ok := <-client.send:
			if !ok {
				return
			}
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				return
			}
		case <-ticker.C:
			if err := conn.WriteMessage(websocket.PingMessage, []byte("ping")); err != nil {
				return
			}
		}
	}
}

type wsClient struct {
	conn   *websocket.Conn
	chatID uint
	send   chan []byte
}

type wsHub struct {
	clients    map[uint]map[*wsClient]bool
	register   chan *wsClient
	unregister chan *wsClient
	broadcasts chan wsBroadcast
	mu         sync.RWMutex
}

type wsBroadcast struct {
	chatID  uint
	message []byte
}

func newHub() *wsHub {
	return &wsHub{
		clients:    make(map[uint]map[*wsClient]bool),
		register:   make(chan *wsClient),
		unregister: make(chan *wsClient),
		broadcasts: make(chan wsBroadcast, 64),
	}
}

func (h *wsHub) run() {
	for {
		select {
		case c := <-h.register:
			h.mu.Lock()
			if h.clients[c.chatID] == nil {
				h.clients[c.chatID] = make(map[*wsClient]bool)
			}
			c.send = make(chan []byte, 32)
			h.clients[c.chatID][c] = true
			h.mu.Unlock()
		case c := <-h.unregister:
			h.mu.Lock()
			if set, ok := h.clients[c.chatID]; ok {
				if _, exists := set[c]; exists {
					delete(set, c)
					close(c.send)
				}
				if len(set) == 0 {
					delete(h.clients, c.chatID)
				}
			}
			h.mu.Unlock()
		case b := <-h.broadcasts:
			h.mu.RLock()
			set := h.clients[b.chatID]
			for c := range set {
				select {
				case c.send <- b.message:
				default:
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *wsHub) broadcast(chatID uint, msg []byte) {
	h.broadcasts <- wsBroadcast{chatID: chatID, message: msg}
}
