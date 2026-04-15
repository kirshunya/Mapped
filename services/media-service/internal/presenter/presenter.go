package presenter

import (
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/mapsocial/media-service/internal/repository"
)

type MediaPresenter struct {
	repo      *repository.MediaRepository
	publicURL string
}

func NewMediaPresenter(repo *repository.MediaRepository, publicURL string) *MediaPresenter {
	return &MediaPresenter{repo: repo, publicURL: publicURL}
}

func (p *MediaPresenter) UploadFile(file *multipart.FileHeader, userID uint) (string, error) {
	if !p.repo.IsAvailable() {
		return "", fmt.Errorf("storage not available")
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowedExts := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true,
		".gif": true, ".webp": true, ".mp4": true,
		".pdf": true,
	}
	if !allowedExts[ext] {
		return "", fmt.Errorf("file type not allowed: %s", ext)
	}

	maxSize := int64(10 << 20)
	if file.Size > maxSize {
		return "", fmt.Errorf("file too large (max 10MB)")
	}

	uid := strconv.Itoa(int(userID))
	path := fmt.Sprintf("uploads/%s/%d_%s", uid, time.Now().UnixNano(), file.Filename)

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	contentType := file.Header.Get("Content-Type")
	_, err = p.repo.Upload(path, src, file.Size, contentType)
	if err != nil {
		return "", err
	}

	base := strings.TrimSuffix(p.publicURL, "/")
	if base == "" {
		base = "http://localhost:8080/media"
	}
	return fmt.Sprintf("%s/%s", base, path), nil
}

func (p *MediaPresenter) DeleteFile(url string) error {
	if !p.repo.IsAvailable() {
		return fmt.Errorf("storage not available")
	}
	path := strings.TrimPrefix(url, strings.TrimSuffix(p.publicURL, "/")+"/")
	path = strings.TrimPrefix(path, "http://localhost:8080/media/")
	path = strings.TrimPrefix(path, "/")
	return p.repo.Delete(path)
}
