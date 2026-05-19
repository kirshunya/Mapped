package main

import (
	"log"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/media-service/internal/config"
	"github.com/mapsocial/media-service/internal/handler"
	"github.com/mapsocial/media-service/internal/presenter"
	"github.com/mapsocial/media-service/internal/repository"
)

func main() {
	cfg := config.Load()

	repo := repository.NewMediaRepository(
		cfg.StoragePath,
	)
	pres := presenter.NewMediaPresenter(repo, cfg.PublicURL)
	hdl := handler.NewMediaHandler(pres, cfg.StoragePath)

	router := gin.Default()
	hdl.SetupRoutes(router)

	log.Printf("Media service starting on port %s", cfg.Port)
	router.Run(":" + cfg.Port)
}
