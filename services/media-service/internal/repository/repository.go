package repository

import (
	"io"
	"os"
	"path/filepath"

	"github.com/mapsocial/media-service/internal/models"
)

type MediaRepository struct {
	storagePath string
}

func NewMediaRepository(storagePath string) *MediaRepository {
	if storagePath == "" {
		storagePath = "./storage"
	}
	_ = os.MkdirAll(filepath.Join(storagePath, "uploads"), 0o755)
	return &MediaRepository{
		storagePath: storagePath,
	}
}

func (r *MediaRepository) IsAvailable() bool {
	return true
}

func (r *MediaRepository) Upload(path string, reader io.Reader, size int64, contentType string) (string, error) {
	_ = size
	_ = contentType
	fullPath := filepath.Join(r.storagePath, filepath.FromSlash(path))
	if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
		return "", err
	}

	f, err := os.Create(fullPath)
	if err != nil {
		return "", err
	}
	defer f.Close()

	if _, err = io.Copy(f, reader); err != nil {
		return "", err
	}

	return path, nil
}

func (r *MediaRepository) Delete(path string) error {
	fullPath := filepath.Join(r.storagePath, filepath.FromSlash(path))
	if err := os.Remove(fullPath); err != nil && !os.IsNotExist(err) {
		return err
	}
	return nil
}

func (r *MediaRepository) ToMediaFile(url, name, mimeType string, ownerID uint) *models.MediaFile {
	return &models.MediaFile{
		URL:      url,
		Name:     name,
		MimeType: mimeType,
		OwnerID:  ownerID,
	}
}
