package service

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/mapsocial/reviews-service/internal/models"
	"github.com/mapsocial/reviews-service/internal/repository"
)

type ReviewsService struct {
	repo *repository.ReviewsRepository
}

func NewReviewsService(repo *repository.ReviewsRepository) *ReviewsService {
	return &ReviewsService{repo: repo}
}

func (s *ReviewsService) CreateReview(userID uint, username, userRole string, req *models.CreateReviewRequest) (*models.Review, error) {
	mediaJSON, _ := json.Marshal(req.MediaURLs)
	review := &models.Review{
		PlaceID:   req.PlaceID,
		UserID:    userID,
		Username:  username,
		UserRole:  userRole,
		Content:   req.Content,
		Rating:    req.Rating,
		MediaURLs: string(mediaJSON),
	}
	if err := s.repo.Create(review); err != nil {
		return nil, err
	}

	// Update place rating asynchronously via places-service internal call
	go s.updatePlaceRating(req.PlaceID)

	return review, nil
}

// updatePlaceRating recalculates the average rating for a place via the places-service.
func (s *ReviewsService) updatePlaceRating(placeID uint) {
	reviews, err := s.repo.GetByPlaceID(placeID)
	if err != nil || len(reviews) == 0 {
		return
	}
	var sum float64
	for _, r := range reviews {
		sum += r.Rating
	}
	avg := sum / float64(len(reviews))

	placesHost := os.Getenv("PLACES_SERVICE_URL")
	if placesHost == "" {
		placesHost = "http://places-service:8082"
	}
	body, _ := json.Marshal(map[string]interface{}{
		"rating":       avg,
		"review_count": len(reviews),
	})
	url := fmt.Sprintf("%s/places/%d/rating", placesHost, placeID)
	req, err := http.NewRequest(http.MethodPut, url, bytes.NewBuffer(body))
	if err != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")
	client := &http.Client{}
	resp, err := client.Do(req)
	if err == nil {
		resp.Body.Close()
	}
}

func (s *ReviewsService) GetPlaceReviews(placeID uint) ([]models.Review, error) {
	return s.repo.GetByPlaceID(placeID)
}

func (s *ReviewsService) GetUserReviews(userID uint) ([]models.Review, error) {
	return s.repo.GetByUserID(userID)
}
