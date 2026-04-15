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

	db.AutoMigrate(&models.User{})
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
