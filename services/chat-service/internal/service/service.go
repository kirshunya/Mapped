package service

import (
	"errors"

	"github.com/mapsocial/chat-service/internal/models"
	"github.com/mapsocial/chat-service/internal/repository"
)

type ChatService struct {
	repo *repository.ChatRepository
}

func NewChatService(repo *repository.ChatRepository) *ChatService {
	return &ChatService{repo: repo}
}

func (s *ChatService) CreateChat(ownerID uint, username string, req *models.CreateChatRequest) (*models.Chat, error) {
	if ownerID == 0 {
		return nil, errors.New("unauthorized")
	}
	chatType := req.Type
	if chatType == "" {
		chatType = "direct"
	}

	// For direct chats, check if one already exists between these two users
	if chatType == "direct" {
		otherUserID := req.UserID
		if otherUserID == 0 {
			otherUserID = req.User2ID
		}
		if otherUserID > 0 && otherUserID != ownerID {
			existingChat, err := s.repo.FindDirectChat(ownerID, otherUserID)
			if err == nil && existingChat != nil {
				// Return existing chat instead of creating duplicate
				return existingChat, nil
			}
		}
	}

	chat := &models.Chat{
		Name:    req.Name,
		Type:    chatType,
		OwnerID: ownerID,
	}
	if err := s.repo.CreateChat(chat); err != nil {
		return nil, err
	}
	_ = s.repo.AddMember(&models.ChatMember{ChatID: chat.ID, UserID: ownerID, Username: username, Role: "owner"})
	if req.UserID > 0 && req.UserID != ownerID {
		memberUsername := "member"
		_ = s.repo.AddMember(&models.ChatMember{ChatID: chat.ID, UserID: req.UserID, Username: memberUsername, Role: "member"})
	}
	if req.User2ID > 0 && req.User2ID != ownerID {
		memberUsername := req.User2Username
		if memberUsername == "" {
			memberUsername = "member"
		}
		_ = s.repo.AddMember(&models.ChatMember{ChatID: chat.ID, UserID: req.User2ID, Username: memberUsername, Role: "member"})
	}
	return chat, nil
}

func (s *ChatService) GetChats(userID uint) ([]models.Chat, error) {
	if userID == 0 {
		return nil, errors.New("unauthorized")
	}
	return s.repo.GetChats(userID)
}

func (s *ChatService) SendMessage(chatID, userID uint, username, text string) (*models.ChatMessage, error) {
	if userID == 0 {
		return nil, errors.New("unauthorized")
	}
	if !s.repo.IsChatMember(chatID, userID) {
		return nil, errors.New("forbidden")
	}
	if text == "" {
		return nil, errors.New("message required")
	}
	msg := &models.ChatMessage{ChatID: chatID, UserID: userID, Username: username, Text: text}
	if err := s.repo.CreateMessage(msg); err != nil {
		return nil, err
	}
	return msg, nil
}

func (s *ChatService) GetMessages(chatID uint, limit int) ([]models.ChatMessage, error) {
	if chatID == 0 {
		return nil, errors.New("chat required")
	}
	return s.repo.GetMessages(chatID, limit)
}

func (s *ChatService) CanAccessChat(chatID, userID uint) bool {
	if userID == 0 {
		return false
	}
	return s.repo.IsChatMember(chatID, userID)
}
