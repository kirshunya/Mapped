package repository

import (
	"fmt"
	"github.com/mapsocial/chat-service/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type ChatRepository struct {
	db *gorm.DB
}

func NewChatRepository(dsn string) *ChatRepository {
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic(err)
	}
	if err := db.AutoMigrate(&models.Chat{}, &models.ChatMember{}, &models.ChatMessage{}); err != nil {
		panic(fmt.Sprintf("Failed to migrate database: %v", err))
	}
	return &ChatRepository{db: db}
}

func (r *ChatRepository) CreateChat(chat *models.Chat) error {
	return r.db.Create(chat).Error
}

func (r *ChatRepository) AddMember(member *models.ChatMember) error {
	var count int64
	r.db.Model(&models.ChatMember{}).Where("chat_id = ? AND user_id = ?", member.ChatID, member.UserID).Count(&count)
	if count > 0 {
		return nil
	}
	return r.db.Create(member).Error
}

func (r *ChatRepository) GetChats(userID uint) ([]models.Chat, error) {
	var chats []models.Chat
	err := r.db.Table("chats").
		Joins("JOIN chat_members ON chat_members.chat_id = chats.id").
		Where("chat_members.user_id = ?", userID).
		Order("chats.created_at DESC").
		Find(&chats).Error
	return chats, err
}

func (r *ChatRepository) CreateMessage(message *models.ChatMessage) error {
	return r.db.Create(message).Error
}

func (r *ChatRepository) GetMessages(chatID uint, limit int) ([]models.ChatMessage, error) {
	if limit <= 0 {
		limit = 50
	}
	var messages []models.ChatMessage
	err := r.db.Where("chat_id = ?", chatID).Order("created_at ASC").Limit(limit).Find(&messages).Error
	return messages, err
}

func (r *ChatRepository) IsChatMember(chatID, userID uint) bool {
	var count int64
	r.db.Model(&models.ChatMember{}).Where("chat_id = ? AND user_id = ?", chatID, userID).Count(&count)
	return count > 0
}

// FindDirectChat finds existing direct chat between two users
func (r *ChatRepository) FindDirectChat(user1ID, user2ID uint) (*models.Chat, error) {
	var chat models.Chat
	// Find a direct chat where both users are members
	err := r.db.Raw(`
		SELECT c.* FROM chats c
		JOIN chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = ?
		JOIN chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = ?
		WHERE c.type = 'direct'
		LIMIT 1
	`, user1ID, user2ID).Scan(&chat).Error

	if err != nil {
		return nil, err
	}
	if chat.ID == 0 {
		return nil, nil // Not found
	}
	return &chat, nil
}
