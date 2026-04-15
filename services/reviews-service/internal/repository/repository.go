package repository

import (
	"fmt"

	"github.com/mapsocial/reviews-service/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type ReviewsRepository struct {
	db *gorm.DB
}

func NewReviewsRepository(databaseURL string) *ReviewsRepository {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}
	db.AutoMigrate(&models.Review{})
	return &ReviewsRepository{db: db}
}

func (r *ReviewsRepository) Create(review *models.Review) error {
	return r.db.Create(review).Error
}

func (r *ReviewsRepository) GetByPlaceID(placeID uint) ([]models.Review, error) {
	var reviews []models.Review
	err := r.db.Where("place_id = ?", placeID).Order("created_at DESC").Find(&reviews).Error
	return reviews, err
}

func (r *ReviewsRepository) GetByUserID(userID uint) ([]models.Review, error) {
	var reviews []models.Review
	err := r.db.Where("user_id = ?", userID).Find(&reviews).Error
	return reviews, err
}
