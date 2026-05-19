package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/mapsocial/posts-service/internal/config"
	"github.com/mapsocial/posts-service/internal/handlers"
	"github.com/mapsocial/posts-service/internal/models"
	"github.com/mapsocial/posts-service/internal/repository"
	"github.com/mapsocial/posts-service/internal/service"
)

func main() {
	cfg := config.Load()

	db, err := cfg.ConnectDB()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate
	if err := db.AutoMigrate(
		&models.Post{},
		&models.PostComment{},
		&models.PostReaction{},
		&models.CommentReaction{},
	); err != nil {
		log.Fatal("Migration failed:", err)
	}
	log.Println("✅ Database migrated")

	// Setup layers
	repo := repository.NewPostsRepository(db)
	svc := service.NewPostsService(repo)
	handler := handlers.NewPostsHandler(svc)

	// Gin setup
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	handler.SetupRoutes(r)

	log.Printf("🚀 Posts service started on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
