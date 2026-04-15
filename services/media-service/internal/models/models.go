package models

import "time"

type MediaFile struct {
	ID        uint      `json:"id"`
	URL       string    `json:"url"`
	Name      string    `json:"name"`
	Size      int64     `json:"size"`
	MimeType  string    `json:"mime_type"`
	OwnerID   uint      `json:"owner_id"`
	CreatedAt time.Time `json:"created_at"`
}

type UploadResponse struct {
	URL string `json:"url"`
}

type UploadRequest struct {
	FileName string `json:"file_name"`
}
