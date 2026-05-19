package repository

import (
	"fmt"

	"github.com/mapsocial/auth-service/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type AuthRepository struct {
	db *gorm.DB
}

func NewAuthRepository(databaseURL string) *AuthRepository {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}

	db.AutoMigrate(&models.User{}, &models.Follow{})
	seedAdmin(db)
	return &AuthRepository{db: db}
}

func seedAdmin(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Count(&count)
	if count == 0 {
		admin := models.User{
			Email:    "admin@mapped.local",
			Username: "admin",
			Password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // password: admin123
			Role:     models.RoleAdmin,
			IsActive: true,
		}
		db.Create(&admin)
	}
}

func (r *AuthRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *AuthRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) GetUserByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *AuthRepository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	err := r.db.Find(&users).Error
	return users, err
}

func (r *AuthRepository) UpdateUser(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *AuthRepository) UpdateRole(userID uint, role models.Role) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("role", role).Error
}

func (r *AuthRepository) DeleteUser(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

func (r *AuthRepository) SearchUsers(query string, limit int, excludeID uint) ([]models.User, error) {
	if limit <= 0 {
		limit = 10
	}
	var users []models.User
	db := r.db.Model(&models.User{}).Where("id <> ?", excludeID)
	if query != "" {
		like := "%" + query + "%"
		db = db.Where("username ILIKE ? OR email ILIKE ?", like, like)
	}
	err := db.Order("username ASC").Limit(limit).Find(&users).Error
	return users, err
}

// SearchUsersAdvanced searches users with multiple filters
// Filters: query (username/email), role, minFollowers, hashtags, limit, offset
func (r *AuthRepository) SearchUsersAdvanced(query string, role string, minFollowers int, hashtags []string, limit int, offset int, excludeID uint) ([]map[string]interface{}, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	// Build the base query
	db := r.db.Table("users").Where("id <> ?", excludeID)

	// Filter by search query (username or email)
	if query != "" {
		like := "%" + query + "%"
		db = db.Where("username ILIKE ? OR email ILIKE ?", like, like)
	}

	// Filter by role
	if role != "" && role != "all" {
		db = db.Where("role = ?", role)
	}

	// Filter by hashtags (if any provided)
	if len(hashtags) > 0 {
		for _, hashtag := range hashtags {
			like := "%" + hashtag + "%"
			db = db.Where("hashtags ILIKE ?", like)
		}
	}

	// Get the IDs of users that match the above filters
	var userIDs []uint
	if err := db.Select("id").Scan(&userIDs).Error; err != nil {
		return nil, err
	}

	if len(userIDs) == 0 {
		return []map[string]interface{}{}, nil
	}

	// Now get full user data with follower counts
	var results []map[string]interface{}
	err := r.db.Raw(`
		SELECT 
			u.id,
			u.email,
			u.username,
			u.avatar,
			u.bio,
			u.hashtags,
			u.role,
			u.is_active,
			u.created_at,
			(SELECT COUNT(*) FROM follows WHERE following_id = u.id) as follower_count,
			(SELECT COUNT(*) FROM follows WHERE follower_id = u.id) as following_count,
			(SELECT COUNT(*) FROM follows WHERE follower_id = ? AND following_id = u.id) > 0 as is_following,
			(SELECT COUNT(*) FROM follows WHERE follower_id = u.id AND following_id = ?) > 0 as is_follower
		FROM users u
		WHERE u.id IN ?
		ORDER BY follower_count DESC, u.username ASC
		LIMIT ? OFFSET ?
	`, excludeID, excludeID, userIDs, limit, offset).
		Scan(&results).Error

	if err != nil {
		return nil, err
	}

	// Filter by minimum follower count
	if minFollowers > 0 {
		var filtered []map[string]interface{}
		for _, result := range results {
			if followerCount, ok := result["follower_count"].(int64); ok && followerCount >= int64(minFollowers) {
				filtered = append(filtered, result)
			}
		}
		return filtered, nil
	}

	return results, nil
}

// ── Following System Methods ────────────────────────────────────────────

// FollowUser creates a follow relationship
func (r *AuthRepository) FollowUser(followerID, followingID uint) error {
	if followerID == followingID {
		return fmt.Errorf("cannot follow yourself")
	}

	follow := models.Follow{
		FollowerID:  followerID,
		FollowingID: followingID,
	}
	return r.db.Create(&follow).Error
}

// UnfollowUser removes a follow relationship
func (r *AuthRepository) UnfollowUser(followerID, followingID uint) error {
	return r.db.Where("follower_id = ? AND following_id = ?", followerID, followingID).Delete(&models.Follow{}).Error
}

// IsFollowing checks if followerID follows followingID
func (r *AuthRepository) IsFollowing(followerID, followingID uint) bool {
	var count int64
	r.db.Model(&models.Follow{}).Where("follower_id = ? AND following_id = ?", followerID, followingID).Count(&count)
	return count > 0
}

// GetFollowers gets list of users following the specified user
func (r *AuthRepository) GetFollowers(userID uint, limit int, offset int) ([]models.FollowerResponse, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	var followers []models.FollowerResponse
	err := r.db.Table("follows f").
		Select("f.id, f.follower_id, u.username, u.avatar, f.created_at").
		Joins("JOIN users u ON f.follower_id = u.id").
		Where("f.following_id = ?", userID).
		Order("f.created_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(&followers).Error

	return followers, err
}

// GetFollowing gets list of users that the specified user is following
func (r *AuthRepository) GetFollowing(userID uint, limit int, offset int) ([]models.FollowResponse, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	var following []models.FollowResponse
	err := r.db.Table("follows f").
		Select("f.id, f.following_id, u.username, u.avatar, f.created_at").
		Joins("JOIN users u ON f.following_id = u.id").
		Where("f.follower_id = ?", userID).
		Order("f.created_at DESC").
		Limit(limit).
		Offset(offset).
		Scan(&following).Error

	return following, err
}

// GetFollowerCount gets the number of followers for a user
func (r *AuthRepository) GetFollowerCount(userID uint) int64 {
	var count int64
	r.db.Model(&models.Follow{}).Where("following_id = ?", userID).Count(&count)
	return count
}

// GetFollowingCount gets the number of users a user is following
func (r *AuthRepository) GetFollowingCount(userID uint) int64 {
	var count int64
	r.db.Model(&models.Follow{}).Where("follower_id = ?", userID).Count(&count)
	return count
}
