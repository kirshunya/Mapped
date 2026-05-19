package main

import (
	"bytes"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret []byte

func main() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "mapsocial-super-secret-key-2024"
	}
	jwtSecret = []byte(secret)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	api := r.Group("/api/v1")
	api.Use(jwtMiddleware())
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", proxyTo("http://auth-service:8081"))
			auth.POST("/login", proxyTo("http://auth-service:8081"))
			auth.GET("/me", proxyTo("http://auth-service:8081"))
			auth.PUT("/me", proxyTo("http://auth-service:8081"))
			auth.GET("/users/search", proxyTo("http://auth-service:8081"))
			auth.GET("/users/:user_id", proxyTo("http://auth-service:8081"))
			auth.POST("/users/:user_id/follow", proxyTo("http://auth-service:8081"))
			auth.DELETE("/users/:user_id/follow", proxyTo("http://auth-service:8081"))
			auth.GET("/users/:user_id/followers", proxyTo("http://auth-service:8081"))
			auth.GET("/users/:user_id/following", proxyTo("http://auth-service:8081"))
		}

		admin := api.Group("/admin")
		{
			admin.GET("/users", proxyTo("http://auth-service:8081"))
			admin.PUT("/users/role", proxyTo("http://auth-service:8081"))
		}

		places := api.Group("/places")
		{
			places.GET("/recommendations", proxyTo("http://places-service:8082"))
			places.GET("/all", proxyTo("http://places-service:8082"))
			places.GET("", proxyTo("http://places-service:8082"))
			places.POST("", proxyTo("http://places-service:8082"))
			places.GET("/:id", proxyTo("http://places-service:8082"))
			places.PUT("/:id", proxyTo("http://places-service:8082"))
			places.DELETE("/:id", proxyTo("http://places-service:8082"))
			places.PUT("/:id/approve", proxyTo("http://places-service:8082"))
			places.GET("/:id/reviews", proxyTo("http://reviews-service:8083"))
		}

		reviews := api.Group("/reviews")
		{
			reviews.GET("", proxyTo("http://reviews-service:8083"))
			reviews.POST("", proxyTo("http://reviews-service:8083"))
			reviews.GET("/:id", proxyTo("http://reviews-service:8083"))
			reviews.PUT("/:id", proxyTo("http://reviews-service:8083"))
			reviews.DELETE("/:id", proxyTo("http://reviews-service:8083"))
			reviews.GET("/:id/comments", proxyTo("http://reviews-service:8083"))
		}

		api.POST("/reactions", proxyTo("http://reviews-service:8083"))
		api.POST("/comments", proxyTo("http://reviews-service:8083"))

		api.GET("/users/:user_id/places", proxyTo("http://places-service:8082"))
		api.GET("/users/:user_id/reviews", proxyTo("http://reviews-service:8083"))
		api.GET("/search", proxyTo("http://places-service:8082"))

		groups := api.Group("/groups")
		{
			groups.GET("", proxyTo("http://places-service:8082"))
			groups.POST("", proxyTo("http://places-service:8082"))
			groups.GET("/:id", proxyTo("http://places-service:8082"))
			groups.POST("/:id/join", proxyTo("http://places-service:8082"))
			groups.POST("/:id/leave", proxyTo("http://places-service:8082"))
			groups.GET("/:id/members", proxyTo("http://places-service:8082"))
			groups.POST("/:id/members", proxyTo("http://places-service:8082"))
		}

		posts := api.Group("/posts")
		{
			posts.GET("", proxyTo("http://posts-service:8085"))
			posts.POST("", proxyTo("http://posts-service:8085"))
			posts.GET("/:id", proxyTo("http://posts-service:8085"))
			posts.DELETE("/:id", proxyTo("http://posts-service:8085"))
			posts.GET("/:id/comments", proxyTo("http://posts-service:8085"))
			posts.POST("/:id/comments", proxyTo("http://posts-service:8085"))
			posts.POST("/:id/reactions", proxyTo("http://posts-service:8085"))
		}

		api.GET("/users/:user_id/posts", proxyTo("http://posts-service:8085"))
		api.DELETE("/comments/:id", proxyTo("http://posts-service:8085"))
		api.POST("/comments/:id/reactions", proxyTo("http://posts-service:8085"))

		chats := api.Group("/chats")
		{
			chats.GET("", proxyTo("http://chat-service:8086"))
			chats.POST("", proxyTo("http://chat-service:8086"))
			chats.GET("/:id/messages", proxyTo("http://chat-service:8086"))
			chats.POST("/:id/messages", proxyTo("http://chat-service:8086"))
		}
		api.GET("/ws/chats/:id", proxyTo("http://chat-service:8086"))

		media := api.Group("/media")
		{
			media.POST("/upload", proxyMultipart("http://media-service:8084"))
		}
	}

	r.GET("/media/uploads/*rest", func(c *gin.Context) {
		rest := c.Param("rest")
		targetURL := "http://media-service:8084/uploads" + rest

		req, err := http.NewRequest(http.MethodGet, targetURL, nil)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "proxy error"})
			return
		}

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		body, _ := io.ReadAll(io.LimitReader(resp.Body, 2<<20))

		for k, v := range resp.Header {
			if len(v) > 0 && k != "Transfer-Encoding" {
				c.Header(k, v[0])
			}
		}
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), body)
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Serve React static files
	r.Static("/static", "/app/web-app/build/static")
	r.StaticFile("/favicon.ico", "/app/web-app/build/favicon.ico")
	r.StaticFile("/manifest.json", "/app/web-app/build/manifest.json")

	// SPA fallback - serve index.html for all unmatched routes
	r.NoRoute(func(c *gin.Context) {
		c.File("/app/web-app/build/index.html")
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Gateway starting on port %s", port)
	r.Run(":" + port)
}

func jwtMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		tokenStr := ""
		if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}
		if tokenStr == "" {
			tokenStr = strings.TrimSpace(c.Query("token"))
		}

		if tokenStr != "" {
			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
				}
				return jwtSecret, nil
			})
			if err == nil && token.Valid {
				if claims, ok := token.Claims.(jwt.MapClaims); ok {
					if uid, ok := claims["user_id"].(float64); ok {
						c.Request.Header.Set("X-User-ID", fmt.Sprintf("%d", uint(uid)))
					}
					if role, ok := claims["role"].(string); ok {
						c.Request.Header.Set("X-User-Role", role)
					}
					if username, ok := claims["username"].(string); ok {
						c.Request.Header.Set("X-Username", username)
					}
					if avatar, ok := claims["avatar"].(string); ok {
						c.Request.Header.Set("X-Avatar", avatar)
					}
				}
			}
		}
		c.Next()
	}
}

func proxyTo(targetHost string) gin.HandlerFunc {
	target, err := url.Parse(targetHost)
	if err != nil {
		return func(c *gin.Context) {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid target"})
		}
	}

	rp := httputil.NewSingleHostReverseProxy(target)
	rp.Director = func(req *http.Request) {
		req.Header.Add("X-Forwarded-Host", req.Host)

		// Preserve custom headers from jwtMiddleware
		if userID := req.Header.Get("X-User-ID"); userID != "" {
			req.Header.Set("X-User-ID", userID)
		}
		if role := req.Header.Get("X-User-Role"); role != "" {
			req.Header.Set("X-User-Role", role)
		}
		if username := req.Header.Get("X-Username"); username != "" {
			req.Header.Set("X-Username", username)
		}
		if avatar := req.Header.Get("X-Avatar"); avatar != "" {
			req.Header.Set("X-Avatar", avatar)
		}

		req.URL.Scheme = target.Scheme
		req.URL.Host = target.Host
		path := req.URL.Path
		if strings.HasPrefix(path, "/api/v1/auth") || strings.HasPrefix(path, "/api/v1/admin") {
			req.URL.Path = strings.Replace(path, "/api/v1/", "/api/", 1)
		} else {
			req.URL.Path = strings.TrimPrefix(path, "/api/v1")
			if req.URL.Path == "" {
				req.URL.Path = "/"
			}
		}
	}

	return func(c *gin.Context) {
		rp.ServeHTTP(c.Writer, c.Request)
	}
}

func proxyMultipart(targetHost string) gin.HandlerFunc {
	return func(c *gin.Context) {
		target, err := url.Parse(targetHost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "invalid target"})
			return
		}

		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read body"})
			return
		}

		authH := c.GetHeader("Authorization")
		xUserID := c.GetHeader("X-User-ID")
		xRole := c.GetHeader("X-User-Role")
		xUser := c.GetHeader("X-Username")
		xAvatar := c.GetHeader("X-Avatar")

		req, err := http.NewRequest(http.MethodPost, target.String()+"/upload", bytes.NewReader(body))
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": "proxy error"})
			return
		}

		req.Header.Set("Content-Type", c.GetHeader("Content-Type"))
		if authH != "" {
			req.Header.Set("Authorization", authH)
		}
		if xUserID != "" {
			req.Header.Set("X-User-ID", xUserID)
		}
		if xRole != "" {
			req.Header.Set("X-User-Role", xRole)
		}
		if xUser != "" {
			req.Header.Set("X-Username", xUser)
		}
		if xAvatar != "" {
			req.Header.Set("X-Avatar", xAvatar)
		}

		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
			return
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		for k, v := range resp.Header {
			if len(v) > 0 {
				c.Header(k, v[0])
			}
		}
		c.Data(resp.StatusCode, resp.Header.Get("Content-Type"), respBody)
	}
}
