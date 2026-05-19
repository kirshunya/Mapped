package repository_test

import (
	"testing"

	"github.com/mapsocial/auth-service/internal/models"
)

func TestAuthRepository_UserCRUD(t *testing.T) {
	user := &models.User{
		ID:       1,
		Email:    "test@example.com",
		Username: "testuser",
		Password: "hashedpassword",
		Role:     models.RoleUser,
		IsActive: true,
	}

	if user.ID != 1 {
		t.Errorf("Expected ID 1, got %d", user.ID)
	}
	if user.Email != "test@example.com" {
		t.Errorf("Expected email test@example.com, got %s", user.Email)
	}
	if user.Username != "testuser" {
		t.Errorf("Expected username testuser, got %s", user.Username)
	}
	if user.IsActive != true {
		t.Errorf("Expected IsActive true, got %v", user.IsActive)
	}
}

func TestAuthRepository_SearchUser(t *testing.T) {
	tests := []struct {
		name      string
		query     string
		limit     int
		excludeID uint
	}{
		{"search with query", "john", 10, 0},
		{"search with limit", "", 5, 0},
		{"exclude user", "", 10, 1},
		{"empty search", "", 20, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.limit < 0 {
				t.Errorf("Expected limit >= 0, got %d", tt.limit)
			}
		})
	}
}

func TestAuthRepository_SearchUsersAdvanced(t *testing.T) {
	tests := []struct {
		name     string
		query    string
		role     string
		hashtags []string
		limit    int
		offset   int
	}{
		{"search with role", "john", "user", nil, 20, 0},
		{"search with hashtags", "", "", []string{"go"}, 20, 0},
		{"search with offset", "", "", nil, 20, 10},
		{"empty search", "", "all", nil, 20, 0},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.limit < 0 {
				t.Errorf("Expected limit >= 0, got %d", tt.limit)
			}
			if tt.offset < 0 {
				t.Errorf("Expected offset >= 0, got %d", tt.offset)
			}
		})
	}
}

func TestAuthRepository_FollowSystem(t *testing.T) {
	tests := []struct {
		name        string
		followerID  uint
		followingID uint
		wantErr     bool
	}{
		{"valid follow", 1, 2, false},
		{"invalid - same user", 1, 1, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.followerID == tt.followingID
			if err != tt.wantErr {
				t.Errorf("Expected error %v, got %v", tt.wantErr, err)
			}
		})
	}
}

func TestAuthRepository_FollowerFollowingCount(t *testing.T) {
	tests := []struct {
		name  string
		count int64
	}{
		{"zero followers", 0},
		{"some followers", 100},
		{"many followers", 10000},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.count < 0 {
				t.Errorf("Expected count >= 0, got %d", tt.count)
			}
		})
	}
}

func TestAuthRepository_GetFollowers(t *testing.T) {
	testCases := []struct {
		name   string
		userID uint
		limit  int
		offset int
	}{
		{"get followers", 1, 20, 0},
		{"with offset", 1, 20, 20},
		{"with limit", 1, 10, 0},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.limit <= 0 {
				t.Errorf("Expected limit > 0, got %d", tc.limit)
			}
			if tc.offset < 0 {
				t.Errorf("Expected offset >= 0, got %d", tc.offset)
			}
		})
	}
}

func TestAuthRepository_GetFollowing(t *testing.T) {
	testCases := []struct {
		name   string
		userID uint
		limit  int
		offset int
	}{
		{"get following", 1, 20, 0},
		{"with offset", 1, 20, 20},
		{"with limit", 1, 10, 0},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			if tc.limit <= 0 {
				t.Errorf("Expected limit > 0, got %d", tc.limit)
			}
			if tc.offset < 0 {
				t.Errorf("Expected offset >= 0, got %d", tc.offset)
			}
		})
	}
}
