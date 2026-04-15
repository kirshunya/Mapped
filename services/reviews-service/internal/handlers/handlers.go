package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/reviews-service/internal/models"
	"github.com/mapsocial/reviews-service/internal/service"
)

type ReviewsHandler struct {
	service *service.ReviewsService
}

func NewReviewsHandler(svc *service.ReviewsService) *ReviewsHandler {
	return &ReviewsHandler{service: svc}
}

func (h *ReviewsHandler) SetupRoutes(r *gin.Engine) {
	r.POST("/reviews", h.CreateReview)
	r.GET("/places/:place_id/reviews", h.GetPlaceReviews)
	r.GET("/users/:user_id/reviews", h.GetUserReviews)
	r.GET("/health", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })
}

func (h *ReviewsHandler) CreateReview(c *gin.Context) {
	var req models.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	userID, _ := strconv.ParseUint(c.GetHeader("X-User-ID"), 10, 32)
	username := c.GetHeader("X-Username")
	userRole := c.GetHeader("X-User-Role")
	review, err := h.service.CreateReview(uint(userID), username, userRole, &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, review)
}

func (h *ReviewsHandler) GetPlaceReviews(c *gin.Context) {
	placeID, _ := strconv.ParseUint(c.Param("place_id"), 10, 32)
	reviews, err := h.service.GetPlaceReviews(uint(placeID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reviews)
}

func (h *ReviewsHandler) GetUserReviews(c *gin.Context) {
	userID, _ := strconv.ParseUint(c.Param("user_id"), 10, 32)
	reviews, err := h.service.GetUserReviews(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reviews)
}
