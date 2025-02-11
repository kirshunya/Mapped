package recommendation_handlers

import (
	"github.com/gin-gonic/gin"
	"mapped/initializers"
	"mapped/model"
	"mapped/recommendation-service/internal"
	"net/http"
)

func GetPlaces(c *gin.Context) {
	var criteria model.Criteria

	if err := c.ShouldBindJSON(&criteria); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var places []model.Place

	query := initializers.DB.Where("rating >= ? AND admission_fee <= ?", criteria.MinRating, criteria.MaxPrice)

	if err := query.Find(&places).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if criteria.Lat != 0 && criteria.Lon != 0 && criteria.Radius > 0 {
		var filteredPlaces []model.Place
		for _, place := range places {
			distance := recom_internal.Haversine(criteria.Lat, criteria.Lon, place.Latitude, place.Longitude)
			if distance <= criteria.Radius {
				filteredPlaces = append(filteredPlaces, place)
			}
		}
		places = filteredPlaces
	}

	c.JSON(http.StatusOK, places)
}
