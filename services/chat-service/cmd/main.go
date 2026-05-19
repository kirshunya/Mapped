package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mapsocial/chat-service/internal/config"
	"github.com/mapsocial/chat-service/internal/handlers"
	"github.com/mapsocial/chat-service/internal/repository"
	"github.com/mapsocial/chat-service/internal/service"
)

func main() {
	cfg := config.Load()
	repo := repository.NewChatRepository(cfg.Database)
	svc := service.NewChatService(repo)
	h := handlers.NewChatHandler(svc)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-User-ID", "X-Username"},
		AllowCredentials: true,
	}))

	h.SetupRoutes(r)

	log.Printf("chat service on %s", cfg.Port)
	_ = r.Run(":" + cfg.Port)
}
