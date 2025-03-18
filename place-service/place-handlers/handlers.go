package place_handlers

import (
	"github.com/gin-gonic/gin"
	"mapped/initializers"
	"mapped/model"
	"net/http"
)

// Получение всех мест
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

// Получение места по координатам
func GetPlaceByCoordinates(c *gin.Context) {
	latitude := c.Query("latitude")
	longitude := c.Query("longitude")

	var place model.Place

	if err := initializers.DB.Where("latitude = ? AND longitude = ?", latitude, longitude).Preload("Reviews").First(&place).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Place not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"place": place,
	})
}

// Создание нового места
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

// Получение места по ID
func GetPlaceByID(c *gin.Context) {
	id := c.Param("id")
	var place model.Place

	if err := initializers.DB.Preload("Reviews").First(&place, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Place not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": place})
}

// Обновление места
func UpdatePlace(c *gin.Context) {
	id := c.Param("id")
	var place model.Place

	if err := initializers.DB.First(&place, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Place not found"})
		return
	}

	if err := c.ShouldBind(&place); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	initializers.DB.Save(&place)
	c.JSON(http.StatusOK, gin.H{"data": place})
}

// Удаление места
func DeletePlace(c *gin.Context) {
	id := c.Param("id")

	if err := initializers.DB.Delete(&model.Place{}, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Place not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Place deleted"})
}

// Создание отзыва
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
