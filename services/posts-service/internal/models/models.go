package models

import "time"

type Post struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	UserID       uint      `gorm:"index;not null" json:"user_id"`
	Username     string    `gorm:"size:100" json:"username"`
	UserAvatar   string    `gorm:"size:500" json:"user_avatar"`
	Content      string    `gorm:"type:text" json:"content"`
	MediaURLs    string    `json:"media_urls"` // JSON array string
	PlaceID      *uint     `gorm:"index" json:"place_id,omitempty"`
	PlaceName    string    `gorm:"size:200" json:"place_name,omitempty"`
	LikeCount    int       `gorm:"default:0" json:"like_count"`
	CommentCount int       `gorm:"default:0" json:"comment_count"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type PostComment struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	PostID     uint      `gorm:"index;not null" json:"post_id"`
	UserID     uint      `gorm:"index;not null" json:"user_id"`
	Username   string    `gorm:"size:100" json:"username"`
	UserAvatar string    `gorm:"size:500" json:"user_avatar"`
	Content    string    `gorm:"type:text;not null" json:"content"`
	MediaURLs  string    `json:"media_urls"` // JSON array string
	CreatedAt  time.Time `json:"created_at"`
}

type PostReaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	PostID    uint      `gorm:"index;not null" json:"post_id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Type      string    `gorm:"size:20;not null" json:"type"` // like, dislike
	CreatedAt time.Time `json:"created_at"`
}

type CommentReaction struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CommentID uint      `gorm:"index;not null" json:"comment_id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Type      string    `gorm:"size:20;not null" json:"type"` // like, dislike
	CreatedAt time.Time `json:"created_at"`
}

// Request/Response DTOs
type CreatePostRequest struct {
	Content   string   `json:"content"`
	MediaURLs []string `json:"media_urls"`
	PlaceID   *uint    `json:"place_id"`
	PlaceName string   `json:"place_name"`
}

type CreateCommentRequest struct {
	Content   string   `json:"content" binding:"required"`
	MediaURLs []string `json:"media_urls"`
}

type ReactRequest struct {
	Type string `json:"type" binding:"required,oneof=like dislike"`
}

type PostResponse struct {
	Post
	UserLiked    bool `json:"user_liked"`
	UserDisliked bool `json:"user_disliked"`
}

type CommentResponse struct {
	PostComment
	UserLiked    bool `json:"user_liked"`
	UserDisliked bool `json:"user_disliked"`
	LikeCount    int  `json:"like_count"`
	DislikeCount int  `json:"dislike_count"`
}

type FeedResponse struct {
	Posts []PostResponse `json:"posts"`
	Total int            `json:"total"`
}

type CommentsResponse struct {
	Comments []CommentResponse `json:"comments"`
	Total    int               `json:"total"`
}
