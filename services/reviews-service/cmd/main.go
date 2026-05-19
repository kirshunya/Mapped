package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/reviews-service/internal/config"
	"github.com/mapsocial/reviews-service/internal/handlers"
	"github.com/mapsocial/reviews-service/internal/repository"
	"github.com/mapsocial/reviews-service/internal/service"
)

func main() {
	cfg := config.Load()

	repo := repository.NewReviewsRepository(cfg.DatabaseURL)
	svc := service.NewReviewsService(repo)
	hdl := handlers.NewReviewsHandler(svc)

	router := gin.Default()
	hdl.SetupRoutes(router)

	log.Printf("Reviews service starting on port %s", cfg.Port)
	router.Run(":" + cfg.Port)
}
