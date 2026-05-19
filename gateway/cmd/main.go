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

func getServiceURL(serviceName string, defaultPort string) string {
	// Перво проверим переменную окружения для явного указания URL
	// Например: AUTH_SERVICE_URL, PLACES_SERVICE_URL и т.д.
	envVar := strings.ToUpper(serviceName) + "_SERVICE_URL"
	if url := os.Getenv(envVar); url != "" {
		return url
	}

	// Если не задана явно, используем localhost для локального развития
	// или имя контейнера для docker-compose
	return "http://" + serviceName + ":" + defaultPort
}

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
			authURL := getServiceURL("auth", "8081")
			auth.POST("/register", proxyTo(authURL))
			auth.POST("/login", proxyTo(authURL))
			auth.GET("/me", proxyTo(authURL))
			auth.PUT("/me", proxyTo(authURL))
			auth.GET("/users/search", proxyTo(authURL))
			auth.GET("/users/:user_id", proxyTo(authURL))
			auth.POST("/users/:user_id/follow", proxyTo(authURL))
			auth.DELETE("/users/:user_id/follow", proxyTo(authURL))
			auth.GET("/users/:user_id/followers", proxyTo(authURL))
			auth.GET("/users/:user_id/following", proxyTo(authURL))
		}

		admin := api.Group("/admin")
		{
			authURL := getServiceURL("auth", "8081")
			admin.GET("/users", proxyTo(authURL))
			admin.PUT("/users/role", proxyTo(authURL))
		}

		places := api.Group("/places")
		{
			placesURL := getServiceURL("places", "8082")
			reviewsURL := getServiceURL("reviews", "8083")
			places.GET("/recommendations", proxyTo(placesURL))
			places.GET("/all", proxyTo(placesURL))
			places.GET("", proxyTo(placesURL))
			places.POST("", proxyTo(placesURL))
			places.GET("/:id", proxyTo(placesURL))
			places.PUT("/:id", proxyTo(placesURL))
			places.DELETE("/:id", proxyTo(placesURL))
			places.PUT("/:id/approve", proxyTo(placesURL))
			places.GET("/:id/reviews", proxyTo(reviewsURL))
		}

		reviews := api.Group("/reviews")
		{
			reviewsURL := getServiceURL("reviews", "8083")
			reviews.GET("", proxyTo(reviewsURL))
			reviews.POST("", proxyTo(reviewsURL))
			reviews.GET("/:id", proxyTo(reviewsURL))
			reviews.PUT("/:id", proxyTo(reviewsURL))
			reviews.DELETE("/:id", proxyTo(reviewsURL))
			reviews.GET("/:id/comments", proxyTo(reviewsURL))
		}

		reviewsURL := getServiceURL("reviews", "8083")
		api.POST("/reactions", proxyTo(reviewsURL))
		api.POST("/comments", proxyTo(reviewsURL))

		placesURL := getServiceURL("places", "8082")
		reviewsURL2 := getServiceURL("reviews", "8083")
		api.GET("/users/:user_id/places", proxyTo(placesURL))
		api.GET("/users/:user_id/reviews", proxyTo(reviewsURL2))
		api.GET("/search", proxyTo(placesURL))

		groups := api.Group("/groups")
		{
			placesURL := getServiceURL("places", "8082")
			groups.GET("", proxyTo(placesURL))
			groups.POST("", proxyTo(placesURL))
			groups.GET("/:id", proxyTo(placesURL))
			groups.POST("/:id/join", proxyTo(placesURL))
			groups.POST("/:id/leave", proxyTo(placesURL))
			groups.GET("/:id/members", proxyTo(placesURL))
			groups.POST("/:id/members", proxyTo(placesURL))
		}

		posts := api.Group("/posts")
		{
			postsURL := getServiceURL("posts", "8085")
			posts.GET("", proxyTo(postsURL))
			posts.POST("", proxyTo(postsURL))
			posts.GET("/:id", proxyTo(postsURL))
			posts.DELETE("/:id", proxyTo(postsURL))
			posts.GET("/:id/comments", proxyTo(postsURL))
			posts.POST("/:id/comments", proxyTo(postsURL))
			posts.POST("/:id/reactions", proxyTo(postsURL))
		}

		postsURL := getServiceURL("posts", "8085")
		api.GET("/users/:user_id/posts", proxyTo(postsURL))
		api.DELETE("/comments/:id", proxyTo(postsURL))
		api.POST("/comments/:id/reactions", proxyTo(postsURL))

		chats := api.Group("/chats")
		{
			chatURL := getServiceURL("chat", "8086")
			chats.GET("", proxyTo(chatURL))
			chats.POST("", proxyTo(chatURL))
			chats.GET("/:id/messages", proxyTo(chatURL))
			chats.POST("/:id/messages", proxyTo(chatURL))
		}
		chatURL := getServiceURL("chat", "8086")
		api.GET("/ws/chats/:id", proxyTo(chatURL))

		media := api.Group("/media")
		{
			mediaURL := getServiceURL("media", "8084")
			media.POST("/upload", proxyMultipart(mediaURL))
		}
	}

	r.GET("/media/uploads/*rest", func(c *gin.Context) {
		rest := c.Param("rest")
		mediaURL := getServiceURL("media", "8084")
		targetURL := mediaURL + "/uploads" + rest

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
