package models

import (
	"time"

	"gorm.io/gorm"
)

type Role string

const (
	RoleUser      Role = "user"
	RoleModerator Role = "moderator"
	RoleAdmin     Role = "admin"
)

type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"uniqueIndex;not null" json:"email"`
	Username  string         `gorm:"uniqueIndex;not null" json:"username"`
	Password  string         `gorm:"not null" json:"-"`
	Role      Role           `gorm:"type:varchar(20);default:user" json:"role"`
	Avatar    string         `json:"avatar,omitempty"`
	Bio       string         `json:"bio,omitempty"`
	Hashtags  string         `gorm:"type:text" json:"hashtags,omitempty"` // JSON array stored as text or comma-separated
	IsActive  bool           `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Username string `json:"username" binding:"required,min=3,max=30"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type UpdateUserRequest struct {
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
	Bio      string `json:"bio"`
	Hashtags string `json:"hashtags"` // Comma-separated or JSON array
}

type ChangeRoleRequest struct {
	UserID uint `json:"user_id" binding:"required"`
	Role   Role `json:"role" binding:"required"`
}

// Follow relationship model
type Follow struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	FollowerID  uint      `gorm:"index;not null" json:"follower_id"`
	FollowingID uint      `gorm:"index;not null" json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}

// User Profile Response with follow info
type UserProfile struct {
	ID             uint      `json:"id"`
	Email          string    `json:"email"`
	Username       string    `json:"username"`
	Avatar         string    `json:"avatar,omitempty"`
	Bio            string    `json:"bio,omitempty"`
	Hashtags       string    `json:"hashtags,omitempty"`
	IsActive       bool      `json:"is_active"`
	CreatedAt      time.Time `json:"created_at"`
	FollowerCount  int       `json:"follower_count"`
	FollowingCount int       `json:"following_count"`
	IsFollowing    bool      `json:"is_following"` // True if current user follows this user
	IsFollower     bool      `json:"is_follower"`  // True if this user follows current user
}

// Follow Response
type FollowResponse struct {
	ID          uint      `json:"id"`
	FollowingID uint      `json:"following_id"`
	Username    string    `json:"username"`
	Avatar      string    `json:"avatar"`
	CreatedAt   time.Time `json:"created_at"`
}

// Follower Response (user following the requested user)
type FollowerResponse struct {
	ID         uint      `json:"id"`
	FollowerID uint      `json:"follower_id"`
	Username   string    `json:"username"`
	Avatar     string    `json:"avatar"`
	CreatedAt  time.Time `json:"created_at"`
}
