package handlers

import (
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/posts-service/internal/models"
	"github.com/mapsocial/posts-service/internal/service"
)

type PostsHandler struct {
	service *service.PostsService
}

func NewPostsHandler(svc *service.PostsService) *PostsHandler {
	return &PostsHandler{service: svc}
}

func (h *PostsHandler) SetupRoutes(r *gin.Engine) {
	// Posts
	r.POST("/posts", h.CreatePost)
	r.GET("/posts", h.GetFeed)
	r.GET("/posts/recommended", h.GetRecommendedPosts)
	r.GET("/posts/:id", h.GetPost)
	r.DELETE("/posts/:id", h.DeletePost)
	r.GET("/users/:user_id/posts", h.GetUserPosts)

	// Comments
	r.POST("/posts/:id/comments", h.CreateComment)
	r.GET("/posts/:id/comments", h.GetComments)
	r.DELETE("/comments/:id", h.DeleteComment)

	// Reactions
	r.POST("/posts/:id/reactions", h.ReactToPost)
	r.POST("/comments/:id/reactions", h.ReactToComment)

	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
}

func getUserID(c *gin.Context) uint {
	id, _ := strconv.ParseUint(c.GetHeader("X-User-ID"), 10, 64)
	return uint(id)
}

func getUserUsername(c *gin.Context) string {
	return strings.TrimSpace(c.GetHeader("X-Username"))
}

func getUserAvatar(c *gin.Context) string {
	return c.GetHeader("X-Avatar")
}

func (h *PostsHandler) CreatePost(c *gin.Context) {
	var req models.CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := getUserID(c)
	username := getUserUsername(c)
	avatar := getUserAvatar(c)

	log.Printf("📝 CreatePost request: userID=%d, username='%s', content='%s'", userID, username, req.Content)

	post, err := h.service.CreatePost(userID, username, avatar, &req)
	if err != nil {
		log.Printf("❌ CreatePost failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("✅ CreatePost success: postID=%d, userID=%d", post.ID, post.UserID)
	c.JSON(http.StatusCreated, post)
}

func (h *PostsHandler) GetPost(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)

	post, err := h.service.GetPost(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, post)
}

func (h *PostsHandler) GetFeed(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	userID := getUserID(c)

	log.Printf("📖 GetFeed request: userID=%d, limit=%d, offset=%d", userID, limit, offset)

	posts, err := h.service.GetFeed(userID, limit, offset)
	if err != nil {
		log.Printf("❌ GetFeed failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("✅ GetFeed success: returned %d posts", len(posts))
	c.JSON(http.StatusOK, gin.H{"posts": posts, "total": len(posts)})
}

func (h *PostsHandler) GetUserPosts(c *gin.Context) {
	targetUserID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	requesterID := getUserID(c)

	posts, err := h.service.GetUserPosts(uint(targetUserID), requesterID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"posts": posts, "total": len(posts)})
}

func (h *PostsHandler) DeletePost(c *gin.Context) {
	postID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)

	if err := h.service.DeletePost(uint(postID), userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *PostsHandler) CreateComment(c *gin.Context) {
	postID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)
	username := getUserUsername(c)
	avatar := getUserAvatar(c)

	var req models.CreateCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	comment, err := h.service.CreateComment(uint(postID), userID, username, avatar, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, comment)
}

func (h *PostsHandler) GetComments(c *gin.Context) {
	postID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)

	comments, err := h.service.GetComments(uint(postID), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"comments": comments, "total": len(comments)})
}

func (h *PostsHandler) DeleteComment(c *gin.Context) {
	commentID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)

	if err := h.service.DeleteComment(uint(commentID), userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *PostsHandler) ReactToPost(c *gin.Context) {
	postID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)

	var req models.ReactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.ReactToPost(uint(postID), userID, req.Type); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *PostsHandler) ReactToComment(c *gin.Context) {
	commentID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)

	var req models.ReactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.service.ReactToComment(uint(commentID), userID, req.Type); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func (h *PostsHandler) GetRecommendedPosts(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	userID := getUserID(c)

	log.Printf("📊 GetRecommendedPosts request: userID=%d, limit=%d, offset=%d", userID, limit, offset)

	posts, err := h.service.GetRecommendedPosts(userID, limit, offset)
	if err != nil {
		log.Printf("❌ GetRecommendedPosts failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log.Printf("✅ GetRecommendedPosts success: returned %d posts", len(posts))
	c.JSON(http.StatusOK, gin.H{"posts": posts, "total": len(posts)})
}
