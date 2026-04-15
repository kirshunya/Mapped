package main

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/auth-service/internal/config"
	"github.com/mapsocial/auth-service/internal/handlers"
	"github.com/mapsocial/auth-service/internal/repository"
	"github.com/mapsocial/auth-service/internal/service"
)

func main() {
	cfg := config.Load()

	repo := repository.NewAuthRepository(cfg.DatabaseURL)
	svc := service.NewAuthService(repo, cfg.JWTSecret, time.Hour*720)
	hdl := handlers.NewAuthHandler(svc)

	router := gin.Default()
	hdl.SetupRoutes(router)

	log.Printf("Auth service starting on port %s", cfg.Port)
	if err := router.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
