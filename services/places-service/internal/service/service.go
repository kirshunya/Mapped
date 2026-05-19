package service

import (
	"encoding/json"
	"errors"

	"github.com/mapsocial/places-service/internal/models"
	"github.com/mapsocial/places-service/internal/repository"
)

type PlacesService struct {
	repo *repository.PlacesRepository
}

func NewPlacesService(repo *repository.PlacesRepository) *PlacesService {
	return &PlacesService{repo: repo}
}

func (s *PlacesService) CreatePlace(userID uint, username, userAvatar string, req *models.CreatePlaceRequest) (*models.Place, error) {
	mediaJSON, _ := json.Marshal(req.MediaURLs)

	privacy := req.Privacy
	if privacy == "" {
		privacy = models.PrivacyPublic
	}

	// If GroupID is provided, validate user is a group member and set privacy to group
	if req.GroupID != nil && *req.GroupID > 0 {
		if !s.repo.IsGroupMember(*req.GroupID, userID) {
			return nil, errors.New("user is not a member of this group")
		}
		privacy = models.PrivacyGroup
	}

	// Private and group places are visible immediately — no moderation needed.
	// Only public places require moderator approval.
	approval := models.ApprovalPending
	if privacy == models.PrivacyPrivate || privacy == models.PrivacyGroup {
		approval = models.ApprovalApproved
	}

	place := &models.Place{
		Name:        req.Name,
		Description: req.Description,
		Latitude:    req.Latitude,
		Longitude:   req.Longitude,
		Address:     req.Address,
		Category:    req.Category,
		Privacy:     privacy,
		Approval:    approval,
		MediaURLs:   string(mediaJSON),
		UserID:      userID,
		Username:    username,
		UserAvatar:  userAvatar,
		GroupID:     req.GroupID,
	}

	err := s.repo.Create(place)
	return place, err
}

func (s *PlacesService) GetPlace(id, userID uint) (*models.PlaceResponse, error) {
	place, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}

	if place.Privacy == models.PrivacyPrivate && place.UserID != userID {
		return nil, errors.New("access denied")
	}

	return &models.PlaceResponse{Place: *place}, nil
}

func (s *PlacesService) GetNearbyPlaces(lat, lng, radius float64, userID uint) ([]models.Place, error) {
	if radius == 0 {
		radius = 0.5
	}
	return s.repo.GetNearby(lat, lng, radius, userID)
}

func (s *PlacesService) GetAllPlaces(userID uint, limit, offset int, category, approval string) ([]models.Place, error) {
	return s.repo.GetAll(userID, limit, offset, category, approval)
}

func (s *PlacesService) GetRecommendations(userID uint, recommendationType, category string, maxDistance float64, limit int) ([]models.Place, error) {
	return s.repo.GetRecommendations(userID, recommendationType, category, maxDistance, limit)
}

func (s *PlacesService) GetUserPlaces(userID, requesterID uint) ([]models.Place, error) {
	if userID != requesterID {
		return s.repo.GetPublicByUserID(userID)
	}
	return s.repo.GetByUserID(userID)
}

func (s *PlacesService) UpdatePlace(placeID, userID uint, req *models.UpdatePlaceRequest) (*models.Place, error) {
	place, err := s.repo.GetByID(placeID)
	if err != nil {
		return nil, err
	}

	if place.UserID != userID {
		return nil, errors.New("not authorized")
	}

	if req.Name != "" {
		place.Name = req.Name
	}
	if req.Description != "" {
		place.Description = req.Description
	}
	if req.Category != "" {
		place.Category = req.Category
	}
	if req.Privacy != "" {
		place.Privacy = req.Privacy
	}
	if req.GroupID != nil {
		// If GroupID is being set, validate user is a group member
		if *req.GroupID > 0 && !s.repo.IsGroupMember(*req.GroupID, userID) {
			return nil, errors.New("user is not a member of this group")
		}
		place.GroupID = req.GroupID
		// If assigning to group, ensure privacy is set to group
		if *req.GroupID > 0 {
			place.Privacy = models.PrivacyGroup
		}
	}
	if req.MediaURLs != nil {
		mediaJSON, _ := json.Marshal(req.MediaURLs)
		place.MediaURLs = string(mediaJSON)
	}

	err = s.repo.Update(place)
	return place, err
}

func (s *PlacesService) DeletePlace(placeID, userID uint, role string) error {
	place, err := s.repo.GetByID(placeID)
	if err != nil {
		return err
	}

	if place.UserID != userID && role != "admin" && role != "moderator" {
		return errors.New("not authorized")
	}

	return s.repo.Delete(placeID)
}

func (s *PlacesService) SearchPlaces(query string) ([]models.Place, error) {
	return s.repo.Search(query)
}

func (s *PlacesService) ApprovePlace(placeID uint, status models.ApprovalStatus) error {
	return s.repo.UpdateApproval(placeID, status)
}

func (s *PlacesService) UpdateRating(placeID uint, rating float64, reviewCount int) error {
	return s.repo.UpdateRating(placeID, rating, reviewCount)
}

// ── Groups ────────────────────────────────────────────────────────────────────

func (s *PlacesService) GetGroups(userID uint) ([]models.GroupResponse, error) {
	return s.repo.GetGroups(userID)
}

func (s *PlacesService) CreateGroup(ownerID uint, ownerUsername, ownerAvatar, name, description string) (*models.Group, error) {
	group := &models.Group{
		Name:        name,
		Description: description,
		OwnerID:     ownerID,
	}
	if err := s.repo.CreateGroup(group); err != nil {
		return nil, err
	}
	if err := s.repo.AddGroupMember(group.ID, ownerID, ownerUsername, ownerAvatar, "admin"); err != nil {
		return nil, errors.New("failed to add group owner as member: " + err.Error())
	}
	return group, nil
}

func (s *PlacesService) GetGroup(id uint) (*models.Group, error) {
	return s.repo.GetGroupByID(id)
}

func (s *PlacesService) JoinGroup(groupID, userID uint, username, avatar string) error {
	if s.repo.IsGroupMember(groupID, userID) {
		return errors.New("already a member")
	}
	return s.repo.AddGroupMember(groupID, userID, username, avatar, "member")
}

func (s *PlacesService) LeaveGroup(groupID, userID uint) error {
	return s.repo.RemoveGroupMember(groupID, userID)
}

func (s *PlacesService) GetGroupMembers(groupID uint) ([]models.GroupMember, error) {
	return s.repo.GetGroupMembers(groupID)
}

func (s *PlacesService) AddGroupMember(groupID, requesterID, targetUserID uint, username, avatar, role string) error {
	if !s.repo.IsGroupOwner(groupID, requesterID) {
		return errors.New("only group owner can add members")
	}
	return s.repo.AddGroupMember(groupID, targetUserID, username, avatar, role)
}
