package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/places-service/internal/config"
	"github.com/mapsocial/places-service/internal/handlers"
	"github.com/mapsocial/places-service/internal/repository"
	"github.com/mapsocial/places-service/internal/service"
)

func main() {
	cfg := config.Load()

	repo := repository.NewPlacesRepository(cfg.DatabaseURL)
	svc := service.NewPlacesService(repo)
	hdl := handlers.NewPlacesHandler(svc)

	router := gin.Default()
	hdl.SetupRoutes(router)

	log.Printf("Places service starting on port %s", cfg.Port)
	router.Run(":" + cfg.Port)
}
