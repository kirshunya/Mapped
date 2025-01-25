package place_handlers

import (
	"github.com/gin-gonic/gin"
	"mapped/initializers"
	"mapped/model"
	"net/http"
)

func GetAllPlaces(c *gin.Context) {
	var places []model.Place

	if err := initializers.DB.Preload("Reviews").Find(&places).Error; err != nil {
		c.JSON(http.StatusBadGateway, gin.H{
			"error": "No places found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"places": places,
	})
}

func CreatePlace(c *gin.Context) {
	var place model.Place

	if err := c.ShouldBind(&place); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	result := initializers.DB.Create(&place)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to create place",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "Place created",
		"place":  place,
	})
}

func CreateReview(c *gin.Context) {
	var review model.Review

	if err := c.ShouldBind(&review); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	var place model.Place
	if err := initializers.DB.First(&place, review.PlaceID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Place not found",
		})
		return
	}

	result := initializers.DB.Create(&review)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to create review",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "Review created",
		"data":   review,
	})
}
