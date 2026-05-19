package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/auth-service/internal/models"
	"github.com/mapsocial/auth-service/internal/service"
)

type AuthHandler struct {
	service *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{service: svc}
}

func (h *AuthHandler) SetupRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", h.Register)
			auth.POST("/login", h.Login)
			auth.GET("/me", h.GetMe)
			auth.PUT("/me", h.UpdateMe)
			auth.GET("/users/search", h.SearchUsers)
			auth.GET("/users/search/advanced", h.SearchUsersAdvanced)
			auth.GET("/users/:user_id", h.GetUserProfile)
			auth.POST("/users/:user_id/follow", h.FollowUser)
			auth.DELETE("/users/:user_id/follow", h.UnfollowUser)
			auth.GET("/users/:user_id/followers", h.GetFollowers)
			auth.GET("/users/:user_id/following", h.GetFollowing)
		}

		admin := api.Group("/admin")
		admin.Use(h.AdminMiddleware())
		{
			admin.GET("/users", h.GetAllUsers)
			admin.PUT("/users/role", h.ChangeRole)
		}
	}
	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.Register(&req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, resp)
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := h.service.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}

func (h *AuthHandler) GetMe(c *gin.Context) {
	userID, _, err := h.getUserFromToken(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	user, err := h.service.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) UpdateMe(c *gin.Context) {
	userID, _, err := h.getUserFromToken(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var req models.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.service.UpdateUser(userID, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) SearchUsers(c *gin.Context) {
	userID, _, err := h.getUserFromToken(c)
	if err != nil || userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	query := strings.TrimSpace(c.Query("q"))
	limit := 10
	users, err := h.service.SearchUsers(query, limit, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

// SearchUsersAdvanced handles advanced user search with multiple filters
func (h *AuthHandler) SearchUsersAdvanced(c *gin.Context) {
	userID, _, err := h.getUserFromToken(c)
	if err != nil || userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	// Parse query parameters
	query := strings.TrimSpace(c.Query("q"))
	role := strings.TrimSpace(c.Query("role"))
	minFollowersStr := c.DefaultQuery("min_followers", "0")
	hashtagsStr := c.Query("hashtags") // Comma-separated hashtags
	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	// Convert to integers
	minFollowers, _ := strconv.Atoi(minFollowersStr)
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	// Parse hashtags (comma-separated)
	var hashtags []string
	if hashtagsStr != "" {
		hashtagsStr = strings.TrimSpace(hashtagsStr)
		parts := strings.Split(hashtagsStr, ",")
		for _, part := range parts {
			trimmed := strings.TrimSpace(part)
			if trimmed != "" {
				hashtags = append(hashtags, trimmed)
			}
		}
	}

	// Call service to search
	results, err := h.service.SearchUsersAdvanced(query, role, minFollowers, hashtags, limit, offset, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"users":  results,
		"total":  len(results),
		"limit":  limit,
		"offset": offset,
	})
}

// ── Following System Handlers ────────────────────────────────────────────

func (h *AuthHandler) GetUserProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	// Get requester ID from token (optional)
	requesterID, _, _ := h.getUserFromToken(c)

	profile, err := h.service.GetUserProfile(userID, requesterID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, profile)
}

func (h *AuthHandler) FollowUser(c *gin.Context) {
	followerID, _, err := h.getUserFromToken(c)
	if err != nil || followerID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	followingID := c.GetUint("user_id")
	if followingID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	err = h.service.FollowUser(followerID, followingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "followed"})
}

func (h *AuthHandler) UnfollowUser(c *gin.Context) {
	followerID, _, err := h.getUserFromToken(c)
	if err != nil || followerID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	followingID := c.GetUint("user_id")
	if followingID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	err = h.service.UnfollowUser(followerID, followingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "unfollowed"})
}

func (h *AuthHandler) GetFollowers(c *gin.Context) {
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limitInt, _ := strconv.Atoi(limitStr)
	offsetInt, _ := strconv.Atoi(offsetStr)

	if limitInt <= 0 {
		limitInt = 20
	}
	if offsetInt < 0 {
		offsetInt = 0
	}

	followers, err := h.service.GetFollowers(userID, limitInt, offsetInt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"followers": followers})
}

func (h *AuthHandler) GetFollowing(c *gin.Context) {
	userID := c.GetUint("user_id")
	if userID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")

	limitInt, _ := strconv.Atoi(limitStr)
	offsetInt, _ := strconv.Atoi(offsetStr)

	if limitInt <= 0 {
		limitInt = 20
	}
	if offsetInt < 0 {
		offsetInt = 0
	}

	following, err := h.service.GetFollowing(userID, limitInt, offsetInt)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"following": following})
}

func (h *AuthHandler) GetAllUsers(c *gin.Context) {
	users, err := h.service.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, users)
}

func (h *AuthHandler) ChangeRole(c *gin.Context) {
	var req models.ChangeRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID, _, _ := h.getUserFromToken(c)
	err := h.service.ChangeRole(adminID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "role updated"})
}

func (h *AuthHandler) AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		_, role, err := h.getUserFromToken(c)
		if err != nil || (role != string(models.RoleAdmin) && role != string(models.RoleModerator)) {
			c.JSON(http.StatusForbidden, gin.H{"error": "admin only"})
			c.Abort()
			return
		}
		c.Next()
	}
}

func (h *AuthHandler) getUserFromToken(c *gin.Context) (uint, string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return 0, "", nil
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	return h.service.ValidateToken(tokenString)
}
