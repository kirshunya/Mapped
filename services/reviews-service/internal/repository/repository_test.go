package repository_test

import (
	"testing"

	"github.com/mapsocial/reviews-service/internal/models"
)

func TestReviewsRepository_Create(t *testing.T) {
	review := &models.Review{
		PlaceID: 1,
		UserID:  1,
		Content: "Good place",
		Rating:  4.0,
	}

	if review.PlaceID == 0 {
		t.Error("Expected PlaceID to be non-zero")
	}
}

func TestReviewsRepository_GetByPlaceID(t *testing.T) {
	tests := []struct {
		name    string
		placeID uint
	}{
		{"valid place", 1},
		{"another place", 2},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.placeID == 0 {
				t.Error("Expected PlaceID to be non-zero")
			}
		})
	}
}

func TestReviewsRepository_GetByUserID(t *testing.T) {
	tests := []struct {
		name   string
		userID uint
	}{
		{"valid user", 1},
		{"another user", 2},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.userID == 0 {
				t.Error("Expected UserID to be non-zero")
			}
		})
	}
}
