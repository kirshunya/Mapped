package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestMediaFile_Struct(t *testing.T) {
	tests := []struct {
		name string
		file MediaFile
	}{
		{
			name: "basic file",
			file: MediaFile{
				ID:       1,
				URL:      "https://example.com/image.jpg",
				Name:     "image.jpg",
				Size:     1024,
				MimeType: "image/jpeg",
				OwnerID:  1,
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, uint(1), tt.file.ID)
			assert.Equal(t, "https://example.com/image.jpg", tt.file.URL)
			assert.Equal(t, "image/jpeg", tt.file.MimeType)
		})
	}
}

func TestMediaFileGetters(t *testing.T) {
	file := MediaFile{
		ID:        1,
		URL:       "https://example.com/photo.jpg",
		Name:      "photo.jpg",
		Size:      2048,
		MimeType:  "image/png",
		OwnerID:   1,
		CreatedAt: time.Now(),
	}

	assert.Equal(t, uint(1), file.ID)
	assert.Equal(t, "photo.jpg", file.Name)
	assert.Equal(t, int64(2048), file.Size)
	assert.Equal(t, "image/png", file.MimeType)
}

func TestUploadResponse_Struct(t *testing.T) {
	resp := UploadResponse{
		URL: "https://example.com/image.jpg",
	}

	assert.Equal(t, "https://example.com/image.jpg", resp.URL)
}

func TestUploadRequest_Struct(t *testing.T) {
	req := UploadRequest{
		FileName: "image.jpg",
	}

	assert.Equal(t, "image.jpg", req.FileName)
}
