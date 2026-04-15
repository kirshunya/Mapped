package handler

import (
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mapsocial/media-service/internal/presenter"
)

type MediaHandler struct {
	presenter   *presenter.MediaPresenter
	storagePath string
}

func NewMediaHandler(p *presenter.MediaPresenter, storagePath string) *MediaHandler {
	return &MediaHandler{presenter: p, storagePath: storagePath}
}

func (h *MediaHandler) SetupRoutes(r *gin.Engine) {
	r.POST("/upload", h.Upload)
	r.DELETE("/:filename", h.Delete)
	r.Static("/uploads", filepath.Join(h.storagePath, "uploads"))
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})
}

func (h *MediaHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file uploaded"})
		return
	}

	userIDStr := c.GetHeader("X-User-ID")
	userID, _ := strconv.ParseUint(userIDStr, 10, 64)

	url, err := h.presenter.UploadFile(file, uint(userID))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"url": url})
}

func (h *MediaHandler) Delete(c *gin.Context) {
	url := c.Param("filename")
	if err := h.presenter.DeleteFile(url); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
