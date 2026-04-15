package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/places-service/internal/models"
	"github.com/mapsocial/places-service/internal/service"
)

type PlacesHandler struct {
	service *service.PlacesService
}

func NewPlacesHandler(svc *service.PlacesService) *PlacesHandler {
	return &PlacesHandler{service: svc}
}

func (h *PlacesHandler) SetupRoutes(r *gin.Engine) {
	r.POST("/places", h.CreatePlace)
	r.GET("/places/recommendations", h.GetRecommendations)
	r.GET("/places/all", h.GetAllPlaces)
	r.GET("/places/:id", h.GetPlace)
	r.GET("/places", h.GetNearbyPlaces)
	r.PUT("/places/:id", h.UpdatePlace)
	r.DELETE("/places/:id", h.DeletePlace)
	r.PUT("/places/:id/rating", h.UpdateRating)
	r.GET("/users/:user_id/places", h.GetUserPlaces)
	r.GET("/search", h.SearchPlaces)
	r.PUT("/places/:id/approve", h.ApprovePlace)

	// Groups
	r.GET("/groups", h.GetGroups)
	r.POST("/groups", h.CreateGroup)
	r.GET("/groups/:id", h.GetGroup)
	r.POST("/groups/:id/join", h.JoinGroup)
	r.POST("/groups/:id/leave", h.LeaveGroup)
	r.GET("/groups/:id/members", h.GetGroupMembers)
	r.POST("/groups/:id/members", h.AddGroupMember)

	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
}

// getUserID extracts user ID from X-User-ID header set by gateway.
func getUserID(c *gin.Context) uint {
	id, _ := strconv.ParseUint(c.GetHeader("X-User-ID"), 10, 64)
	return uint(id)
}

// getUserRole extracts role from X-User-Role header set by gateway.
func getUserRole(c *gin.Context) string {
	return strings.TrimSpace(c.GetHeader("X-User-Role"))
}

// getUserUsername extracts username from X-Username header set by gateway.
func getUserUsername(c *gin.Context) string {
	return c.GetHeader("X-Username")
}

func (h *PlacesHandler) CreatePlace(c *gin.Context) {
	var req models.CreatePlaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID := getUserID(c)
	username := getUserUsername(c)
	place, err := h.service.CreatePlace(userID, username, "", &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, place)
}

func (h *PlacesHandler) GetPlace(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)
	place, err := h.service.GetPlace(uint(id), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *PlacesHandler) GetNearbyPlaces(c *gin.Context) {
	lat, _ := strconv.ParseFloat(c.Query("lat"), 64)
	lng, _ := strconv.ParseFloat(c.Query("lng"), 64)
	radius, _ := strconv.ParseFloat(c.Query("radius"), 64)
	if radius == 0 {
		radius = 0.5
	}
	userID := getUserID(c)
	places, err := h.service.GetNearbyPlaces(lat, lng, radius, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, places)
}

func (h *PlacesHandler) GetAllPlaces(c *gin.Context) {
	userID := getUserID(c)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "100"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	category := c.Query("category")
	approval := c.Query("approval")

	places, err := h.service.GetAllPlaces(userID, limit, offset, category, approval)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"places": places})
}

func (h *PlacesHandler) GetRecommendations(c *gin.Context) {
	userID := getUserID(c)
	recommendationType := c.DefaultQuery("type", "smart")
	category := c.Query("category")
	maxDistance, _ := strconv.ParseFloat(c.DefaultQuery("maxDistance", "50"), 64)
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))

	places, err := h.service.GetRecommendations(userID, recommendationType, category, maxDistance, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"places": places})
}

func (h *PlacesHandler) UpdatePlace(c *gin.Context) {
	placeID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)
	var req models.UpdatePlaceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	place, err := h.service.UpdatePlace(uint(placeID), userID, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, place)
}

func (h *PlacesHandler) DeletePlace(c *gin.Context) {
	placeID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	userID := getUserID(c)
	role := getUserRole(c)
	if err := h.service.DeletePlace(uint(placeID), userID, role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}

func (h *PlacesHandler) GetUserPlaces(c *gin.Context) {
	targetUserID, _ := strconv.ParseUint(c.Param("user_id"), 10, 64)
	requesterID := getUserID(c)
	places, err := h.service.GetUserPlaces(uint(targetUserID), requesterID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, places)
}

func (h *PlacesHandler) SearchPlaces(c *gin.Context) {
	q := c.Query("q")
	places, err := h.service.SearchPlaces(q)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, places)
}

func (h *PlacesHandler) ApprovePlace(c *gin.Context) {
	role := getUserRole(c)
	if role != "moderator" && role != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "moderators only"})
		return
	}
	placeID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	status := models.ApprovalStatus(body.Status)
	if status != models.ApprovalApproved && status != models.ApprovalRejected {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status must be 'approved' or 'rejected'"})
		return
	}
	if err := h.service.ApprovePlace(uint(placeID), status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

// UpdateRating is called internally by reviews-service to recalculate a place's avg rating.
func (h *PlacesHandler) UpdateRating(c *gin.Context) {
	placeID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct {
		Rating      float64 `json:"rating"`
		ReviewCount int     `json:"review_count"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.service.UpdateRating(uint(placeID), body.Rating, body.ReviewCount); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

// ── Groups ────────────────────────────────────────────────────────────────────

func (h *PlacesHandler) GetGroups(c *gin.Context) {
	userID := getUserID(c)
	groups, err := h.service.GetGroups(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, groups)
}

func (h *PlacesHandler) CreateGroup(c *gin.Context) {
	userID := getUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	username := getUserUsername(c)
	var body struct {
		Name        string `json:"name" binding:"required"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	group, err := h.service.CreateGroup(userID, username, "", body.Name, body.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, group)
}

func (h *PlacesHandler) GetGroup(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	group, err := h.service.GetGroup(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, group)
}

func (h *PlacesHandler) JoinGroup(c *gin.Context) {
	userID := getUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	username := getUserUsername(c)
	groupID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.service.JoinGroup(uint(groupID), userID, username, ""); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "joined"})
}

func (h *PlacesHandler) LeaveGroup(c *gin.Context) {
	userID := getUserID(c)
	if userID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	groupID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	if err := h.service.LeaveGroup(uint(groupID), userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "left"})
}

func (h *PlacesHandler) GetGroupMembers(c *gin.Context) {
	groupID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	members, err := h.service.GetGroupMembers(uint(groupID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, members)
}

func (h *PlacesHandler) AddGroupMember(c *gin.Context) {
	requesterID := getUserID(c)
	if requesterID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	groupID, _ := strconv.ParseUint(c.Param("id"), 10, 64)
	var body struct {
		UserID   uint   `json:"user_id" binding:"required"`
		Username string `json:"username"`
		Avatar   string `json:"avatar"`
		Role     string `json:"role"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.Role == "" {
		body.Role = "member"
	}

	if err := h.service.AddGroupMember(uint(groupID), requesterID, body.UserID, body.Username, body.Avatar, body.Role); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "member added"})
}
