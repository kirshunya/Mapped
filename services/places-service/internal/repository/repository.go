package repository

import (
	"fmt"

	"github.com/mapsocial/places-service/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type PlacesRepository struct {
	db *gorm.DB
}

func NewPlacesRepository(databaseURL string) *PlacesRepository {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}
	db.AutoMigrate(&models.Place{})
	return &PlacesRepository{db: db}
}

func (r *PlacesRepository) Create(place *models.Place) error {
	return r.db.Create(place).Error
}

func (r *PlacesRepository) GetByID(id uint) (*models.Place, error) {
	var place models.Place
	err := r.db.Where("is_deleted = ?", false).First(&place, id).Error
	return &place, err
}

func (r *PlacesRepository) GetNearby(lat, lng, radius float64, userID uint) ([]models.Place, error) {
	var places []models.Place

	// No coordinate filter when lat/lng are both zero (fetch-all mode from frontend)
	db := r.db.Where("is_deleted = ?", false)
	if lat != 0 || lng != 0 {
		db = db.Where("latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?",
			lat-radius, lat+radius, lng-radius, lng+radius)
	}

	// Visibility rules:
	//   - approved public places → visible to everyone
	//   - any place owned by the requester → always visible (pending/private/etc.)
	//   - group places → visible to group members
	if userID > 0 {
		// Get group IDs where user is a member
		var groupIDs []uint
		r.db.Model(&models.GroupMember{}).Where("user_id = ?", userID).Pluck("group_id", &groupIDs)

		if len(groupIDs) > 0 {
			db = db.Where("(approval = ? AND privacy = ?) OR user_id = ? OR (privacy = ? AND group_id IN ?)",
				models.ApprovalApproved, models.PrivacyPublic, userID, models.PrivacyGroup, groupIDs)
		} else {
			db = db.Where("(approval = ? AND privacy = ?) OR user_id = ?",
				models.ApprovalApproved, models.PrivacyPublic, userID)
		}
	} else {
		db = db.Where("approval = ? AND privacy = ?",
			models.ApprovalApproved, models.PrivacyPublic)
	}

	err := db.Order("created_at DESC").Find(&places).Error
	return places, err
}

func (r *PlacesRepository) GetAll(userID uint, limit, offset int, category, approval string) ([]models.Place, error) {
	var places []models.Place

	db := r.db.Where("is_deleted = ?", false)

	// Visibility rules for listing places:
	//   - approved public places → visible to everyone
	//   - any place owned by the requester → always visible
	//   - group places → visible to group members
	if userID > 0 {
		// Get group IDs where user is a member
		var groupIDs []uint
		r.db.Model(&models.GroupMember{}).Where("user_id = ?", userID).Pluck("group_id", &groupIDs)

		if len(groupIDs) > 0 {
			db = db.Where("(approval = ? AND privacy = ?) OR user_id = ? OR (privacy = ? AND group_id IN ?)",
				models.ApprovalApproved, models.PrivacyPublic, userID, models.PrivacyGroup, groupIDs)
		} else {
			db = db.Where("(approval = ? AND privacy = ?) OR user_id = ?",
				models.ApprovalApproved, models.PrivacyPublic, userID)
		}
	} else {
		db = db.Where("approval = ? AND privacy = ?",
			models.ApprovalApproved, models.PrivacyPublic)
	}

	// Optional filters
	if category != "" {
		db = db.Where("category = ?", category)
	}
	if approval != "" {
		db = db.Where("approval = ?", approval)
	}

	if limit <= 0 {
		limit = 100
	}

	err := db.Order("created_at DESC").Offset(offset).Limit(limit).Find(&places).Error
	return places, err
}

func (r *PlacesRepository) GetRecommendations(userID uint, recommendationType, category string, maxDistance float64, limit int) ([]models.Place, error) {
	var places []models.Place
	if limit <= 0 {
		limit = 12
	}

	db := r.db.Where("is_deleted = ?", false)

	// Visibility rules for recommendations:
	//   - approved public places → visible to everyone
	//   - any place owned by the requester → always visible
	//   - group places → visible to group members
	if userID > 0 {
		// Get group IDs where user is a member
		var groupIDs []uint
		r.db.Model(&models.GroupMember{}).Where("user_id = ?", userID).Pluck("group_id", &groupIDs)

		if len(groupIDs) > 0 {
			db = db.Where("(approval = ? AND privacy = ?) OR user_id = ? OR (privacy = ? AND group_id IN ?)",
				models.ApprovalApproved, models.PrivacyPublic, userID, models.PrivacyGroup, groupIDs)
		} else {
			db = db.Where("(approval = ? AND privacy = ?) OR user_id = ?",
				models.ApprovalApproved, models.PrivacyPublic, userID)
		}
	} else {
		db = db.Where("approval = ? AND privacy = ?",
			models.ApprovalApproved, models.PrivacyPublic)
	}

	if category != "" && category != "all" {
		db = db.Where("category = ?", category)
	}

	switch recommendationType {
	case "popular":
		db = db.Order("rating DESC, review_count DESC, created_at DESC")
	case "nearby":
		db = db.Order("created_at DESC")
	case "random":
		db = db.Order("RANDOM()")
	default:
		db = db.Order("rating DESC, like_count DESC, created_at DESC")
	}

	err := db.Limit(limit).Find(&places).Error
	return places, err
}

func (r *PlacesRepository) GetByUserID(userID uint) ([]models.Place, error) {
	var places []models.Place
	err := r.db.Where("user_id = ? AND is_deleted = ?", userID, false).Order("created_at DESC").Find(&places).Error
	return places, err
}

func (r *PlacesRepository) Update(place *models.Place) error {
	return r.db.Save(place).Error
}

func (r *PlacesRepository) Delete(id uint) error {
	return r.db.Model(&models.Place{}).Where("id = ?", id).Update("is_deleted", true).Error
}

func (r *PlacesRepository) Search(query string) ([]models.Place, error) {
	var places []models.Place
	err := r.db.Where(
		"name ILIKE ? OR description ILIKE ? OR address ILIKE ?",
		"%"+query+"%", "%"+query+"%", "%"+query+"%",
	).Where("is_deleted = ? AND privacy = ?", false, models.PrivacyPublic).Find(&places).Error
	return places, err
}

func (r *PlacesRepository) GetPublicByUserID(userID uint) ([]models.Place, error) {
	var places []models.Place
	err := r.db.Where("user_id = ? AND privacy = ? AND is_deleted = ?", userID, models.PrivacyPublic, false).
		Order("created_at DESC").Find(&places).Error
	return places, err
}

func (r *PlacesRepository) UpdateApproval(placeID uint, status models.ApprovalStatus) error {
	return r.db.Model(&models.Place{}).Where("id = ?", placeID).Update("approval", status).Error
}

func (r *PlacesRepository) UpdateRating(placeID uint, rating float64, reviewCount int) error {
	return r.db.Model(&models.Place{}).Where("id = ?", placeID).
		Updates(map[string]interface{}{"rating": rating, "review_count": reviewCount}).Error
}

func (r *PlacesRepository) GetPendingPublic() ([]models.Place, error) {
	var places []models.Place
	err := r.db.Where("approval = ? AND privacy = ? AND is_deleted = ?", models.ApprovalPending, models.PrivacyPublic, false).
		Order("created_at DESC").Find(&places).Error
	return places, err
}

// ── Groups ────────────────────────────────────────────────────────────────────

func (r *PlacesRepository) CreateGroup(group *models.Group) error {
	r.db.AutoMigrate(&models.Group{}, &models.GroupMember{})
	return r.db.Create(group).Error
}

func (r *PlacesRepository) GetGroupByID(id uint) (*models.Group, error) {
	var group models.Group
	err := r.db.First(&group, id).Error
	return &group, err
}

func (r *PlacesRepository) GetGroups(userID uint) ([]models.GroupResponse, error) {
	var groups []models.Group
	if err := r.db.Find(&groups).Error; err != nil {
		return nil, err
	}
	result := make([]models.GroupResponse, len(groups))
	for i, g := range groups {
		result[i] = models.GroupResponse{
			Group:    g,
			IsMember: userID > 0 && r.IsGroupMember(g.ID, userID),
		}
	}
	return result, nil
}

func (r *PlacesRepository) AddGroupMember(groupID, userID uint, username, avatar, role string) error {
	r.db.AutoMigrate(&models.GroupMember{})
	if r.IsGroupMember(groupID, userID) {
		return nil
	}
	member := &models.GroupMember{GroupID: groupID, UserID: userID, Username: username, UserAvatar: avatar, Role: role}
	return r.db.Create(member).Error
}

func (r *PlacesRepository) IsGroupOwner(groupID, userID uint) bool {
	var group models.Group
	if err := r.db.First(&group, groupID).Error; err != nil {
		return false
	}
	return group.OwnerID == userID
}

func (r *PlacesRepository) RemoveGroupMember(groupID, userID uint) error {
	return r.db.Where("group_id = ? AND user_id = ?", groupID, userID).Delete(&models.GroupMember{}).Error
}

func (r *PlacesRepository) IsGroupMember(groupID, userID uint) bool {
	var count int64
	r.db.Model(&models.GroupMember{}).Where("group_id = ? AND user_id = ?", groupID, userID).Count(&count)
	return count > 0
}

func (r *PlacesRepository) GetGroupMembers(groupID uint) ([]models.GroupMember, error) {
	var members []models.GroupMember
	err := r.db.Where("group_id = ?", groupID).Find(&members).Error
	return members, err
}
