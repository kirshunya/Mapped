package models

import "time"

type Privacy string
type ApprovalStatus string

const (
	PrivacyPublic  Privacy = "public"
	PrivacyPrivate Privacy = "private"
	PrivacyGroup   Privacy = "group"
)

const (
	ApprovalPending  ApprovalStatus = "pending"
	ApprovalApproved ApprovalStatus = "approved"
	ApprovalRejected ApprovalStatus = "rejected"
)

type Place struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"not null" json:"name"`
	Description string         `json:"description"`
	Latitude    float64        `gorm:"not null" json:"latitude"`
	Longitude   float64        `gorm:"not null" json:"longitude"`
	Address     string         `json:"address"`
	Category    string         `json:"category"`
	Privacy     Privacy        `gorm:"type:varchar(20);default:public" json:"privacy"`
	Approval    ApprovalStatus `gorm:"type:varchar(20);default:pending" json:"approval"`
	GroupID     *uint          `gorm:"index" json:"group_id,omitempty"`
	Rating      float64        `gorm:"default:0" json:"rating"`
	ReviewCount int            `gorm:"default:0" json:"review_count"`
	LikeCount   int            `gorm:"default:0" json:"like_count"`
	UserID      uint           `gorm:"index" json:"user_id"`
	Username    string         `json:"username"`
	UserAvatar  string         `json:"user_avatar"`
	MediaURLs   string         `json:"media_urls"`
	IsVerified  bool           `gorm:"default:false" json:"is_verified"`
	IsDeleted   bool           `gorm:"default:false" json:"is_deleted"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type CreatePlaceRequest struct {
	Name        string   `json:"name" binding:"required"`
	Description string   `json:"description"`
	Latitude    float64  `json:"latitude" binding:"required"`
	Longitude   float64  `json:"longitude" binding:"required"`
	Address     string   `json:"address"`
	Category    string   `json:"category"`
	Privacy     Privacy  `json:"privacy"`
	MediaURLs   []string `json:"media_urls"`
}

type UpdatePlaceRequest struct {
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Category    string   `json:"category"`
	Privacy     Privacy  `json:"privacy"`
	GroupID     *uint    `json:"group_id"`
	MediaURLs   []string `json:"media_urls"`
}

type PlaceResponse struct {
	Place
	Liked    bool `json:"liked"`
	Disliked bool `json:"disliked"`
}

type Group struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	OwnerID     uint      `gorm:"index" json:"owner_id"`
	CreatedAt   time.Time `json:"created_at"`
}

type GroupResponse struct {
	Group
	IsMember bool `json:"is_member"`
}

type GroupMember struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	GroupID    uint      `gorm:"index" json:"group_id"`
	UserID     uint      `gorm:"index" json:"user_id"`
	Role       string    `gorm:"default:member" json:"role"`
	Username   string    `gorm:"size:100" json:"username"`
	UserAvatar string    `gorm:"size:500" json:"user_avatar"`
	JoinedAt   time.Time `json:"joined_at"`
}

type ApprovalRequest struct {
	PlaceID uint `json:"place_id" binding:"required"`
}
