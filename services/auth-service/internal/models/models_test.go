package models

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestRoleConstants(t *testing.T) {
	assert.Equal(t, Role("user"), RoleUser)
	assert.Equal(t, Role("moderator"), RoleModerator)
	assert.Equal(t, Role("admin"), RoleAdmin)
}

func TestUserStruct(t *testing.T) {
	user := User{
		ID:       1,
		Email:    "test@example.com",
		Username: "testuser",
		Password: "hashedpass",
		Role:     RoleUser,
		IsActive: true,
	}

	assert.Equal(t, uint(1), user.ID)
	assert.Equal(t, "test@example.com", user.Email)
	assert.Equal(t, "testuser", user.Username)
	assert.Equal(t, RoleUser, user.Role)
	assert.Equal(t, true, user.IsActive)
}

func TestUserWithHashtags(t *testing.T) {
	user := User{
		ID:       1,
		Email:    "test@example.com",
		Username: "testuser",
		Hashtags: "golang,maps,travel",
		Bio:      "Go developer",
	}

	assert.Equal(t, "golang,maps,travel", user.Hashtags)
	assert.Equal(t, "Go developer", user.Bio)
}

func TestRegisterRequest(t *testing.T) {
	req := RegisterRequest{
		Email:    "test@example.com",
		Username: "testuser",
		Password: "password123",
	}

	assert.Equal(t, "test@example.com", req.Email)
	assert.Equal(t, "testuser", req.Username)
	assert.Equal(t, "password123", req.Password)
}

func TestLoginRequest(t *testing.T) {
	req := LoginRequest{
		Email:    "test@example.com",
		Password: "password123",
	}

	assert.Equal(t, "test@example.com", req.Email)
	assert.Equal(t, "password123", req.Password)
}

func TestAuthResponse(t *testing.T) {
	user := User{
		ID:       1,
		Email:    "test@example.com",
		Username: "testuser",
	}

	resp := AuthResponse{
		Token: "jwt-token",
		User:  user,
	}

	assert.Equal(t, "jwt-token", resp.Token)
	assert.Equal(t, user, resp.User)
}

func TestUpdateUserRequest(t *testing.T) {
	req := UpdateUserRequest{
		Username: "newusername",
		Avatar:   "https://example.com/avatar.jpg",
		Bio:      "New bio",
		Hashtags: "golang,go",
	}

	assert.Equal(t, "newusername", req.Username)
	assert.Equal(t, "https://example.com/avatar.jpg", req.Avatar)
	assert.Equal(t, "New bio", req.Bio)
	assert.Equal(t, "golang,go", req.Hashtags)
}

func TestChangeRoleRequest(t *testing.T) {
	req := ChangeRoleRequest{
		UserID: 1,
		Role:   RoleModerator,
	}

	assert.Equal(t, uint(1), req.UserID)
	assert.Equal(t, RoleModerator, req.Role)
}

func TestFollowStruct(t *testing.T) {
	now := time.Now()
	follow := Follow{
		ID:          1,
		FollowerID:  2,
		FollowingID: 3,
		CreatedAt:   now,
	}

	assert.Equal(t, uint(1), follow.ID)
	assert.Equal(t, uint(2), follow.FollowerID)
	assert.Equal(t, uint(3), follow.FollowingID)
	assert.Equal(t, now, follow.CreatedAt)
}

func TestUserProfileStruct(t *testing.T) {
	now := time.Now()
	profile := UserProfile{
		ID:             1,
		Email:          "test@example.com",
		Username:       "testuser",
		Avatar:         "https://example.com/avatar.jpg",
		Bio:            "Test bio",
		Hashtags:       "golang,maps",
		IsActive:       true,
		CreatedAt:      now,
		FollowerCount:  10,
		FollowingCount: 5,
		IsFollowing:    true,
		IsFollower:     false,
	}

	assert.Equal(t, uint(1), profile.ID)
	assert.Equal(t, "test@example.com", profile.Email)
	assert.Equal(t, "testuser", profile.Username)
	assert.Equal(t, 10, profile.FollowerCount)
	assert.Equal(t, 5, profile.FollowingCount)
	assert.Equal(t, true, profile.IsFollowing)
	assert.Equal(t, false, profile.IsFollower)
}

func TestFollowResponse(t *testing.T) {
	now := time.Now()
	resp := FollowResponse{
		ID:          1,
		FollowingID: 2,
		Username:    "user2",
		Avatar:      "https://example.com/avatar.jpg",
		CreatedAt:   now,
	}

	assert.Equal(t, uint(1), resp.ID)
	assert.Equal(t, uint(2), resp.FollowingID)
	assert.Equal(t, "user2", resp.Username)
}

func TestFollowerResponse(t *testing.T) {
	now := time.Now()
	resp := FollowerResponse{
		ID:         1,
		FollowerID: 2,
		Username:   "follower",
		Avatar:     "https://example.com/avatar.jpg",
		CreatedAt:  now,
	}

	assert.Equal(t, uint(1), resp.ID)
	assert.Equal(t, uint(2), resp.FollowerID)
	assert.Equal(t, "follower", resp.Username)
}
