package models

import "time"

type Chat struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"size:200" json:"name"`
	Type      string    `gorm:"size:20;default:direct" json:"type"`
	OwnerID   uint      `gorm:"index" json:"owner_id"`
	CreatedAt time.Time `json:"created_at"`
}

type ChatMember struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	ChatID   uint   `gorm:"index" json:"chat_id"`
	UserID   uint   `gorm:"index" json:"user_id"`
	Username string `gorm:"size:100" json:"username"`
	Role     string `gorm:"size:20;default:member" json:"role"`
}

type ChatMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ChatID    uint      `gorm:"index" json:"chat_id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Username  string    `gorm:"size:100" json:"username"`
	Text      string    `gorm:"type:text" json:"text"`
	CreatedAt time.Time `json:"created_at"`
}

type CreateChatRequest struct {
	Name          string `json:"name"`
	Type          string `json:"type"`
	UserID        uint   `json:"user_id"`
	User2ID       uint   `json:"user2_id"`
	User2Username string `json:"user2_username"`
}

type SendMessageRequest struct {
	Text string `json:"text" binding:"required"`
}
