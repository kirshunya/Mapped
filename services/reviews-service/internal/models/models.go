package models

import "time"

type Review struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PlaceID    uint      `gorm:"index" json:"place_id"`
	UserID     uint      `gorm:"index" json:"user_id"`
	Username   string    `json:"username"`
	UserAvatar string    `json:"user_avatar"`
	UserRole   string    `json:"user_role"`
	Content    string    `json:"content"`
	Rating     float64   `gorm:"not null" json:"rating"`
	MediaURLs  string    `json:"media_urls"`
	LikeCount  int       `gorm:"default:0" json:"like_count"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type CreateReviewRequest struct {
	PlaceID   uint     `json:"place_id" binding:"required"`
	Content   string   `json:"content"`
	Rating    float64  `json:"rating" binding:"required,min=0,max=5"`
	MediaURLs []string `json:"media_urls"`
}

type Reaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ReviewID  uint      `gorm:"index" json:"review_id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Type      string    `gorm:"type:varchar(20)" json:"type"`
	CreatedAt time.Time `json:"created_at"`
}

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ReviewID  uint      `gorm:"index" json:"review_id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Content   string    `json:"content"`
	ParentID  *uint     `gorm:"index" json:"parent_id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CreateReactionRequest struct {
	ReviewID uint   `json:"review_id" binding:"required"`
	Type     string `json:"type" binding:"required"`
}

type CreateCommentRequest struct {
	ReviewID uint   `json:"review_id" binding:"required"`
	Content  string `json:"content" binding:"required"`
	ParentID *uint  `json:"parent_id"`
}
