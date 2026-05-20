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
		// Если отправлен массив user_ids, используем первый элемент для direct чата
		if otherUserID == 0 && len(req.UserIDs) > 0 {
			otherUserID = req.UserIDs[0]
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

	// Обработка участников из user_ids (для групповых и новых чатов)
	if len(req.UserIDs) > 0 {
		for _, userID := range req.UserIDs {
			if userID > 0 && userID != ownerID {
				_ = s.repo.AddMember(&models.ChatMember{ChatID: chat.ID, UserID: userID, Username: "member", Role: "member"})
			}
		}
	}

	// Старая логика для обратной совместимости
	if req.UserID > 0 && req.UserID != ownerID && len(req.UserIDs) == 0 {
		memberUsername := "member"
		_ = s.repo.AddMember(&models.ChatMember{ChatID: chat.ID, UserID: req.UserID, Username: memberUsername, Role: "member"})
	}
	if req.User2ID > 0 && req.User2ID != ownerID && len(req.UserIDs) == 0 {
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

func (s *ChatService) SendMessage(chatID, userID uint, username, text, locationName string, locationLat, locationLng float64) (*models.ChatMessage, error) {
	if userID == 0 {
		return nil, errors.New("unauthorized")
	}
	if !s.repo.IsChatMember(chatID, userID) {
		return nil, errors.New("forbidden")
	}
	if text == "" && locationName == "" {
		return nil, errors.New("message or location required")
	}
	msg := &models.ChatMessage{
		ChatID:       chatID,
		UserID:       userID,
		Username:     username,
		Text:         text,
		LocationName: locationName,
		LocationLat:  locationLat,
		LocationLng:  locationLng,
	}
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
