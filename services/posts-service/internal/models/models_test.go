package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPostStruct(t *testing.T) {
	post := Post{
		ID:           1,
		UserID:       1,
		Username:     "testuser",
		Content:      "Hello world",
		MediaURLs:    `["img1.jpg"]`,
		LikeCount:    10,
		CommentCount: 5,
	}

	assert.Equal(t, uint(1), post.ID)
	assert.Equal(t, "testuser", post.Username)
}

func TestCreatePostRequest(t *testing.T) {
	req := CreatePostRequest{
		Content:   "Test post",
		MediaURLs: []string{"https://example.com/img.jpg"},
	}

	assert.NotEmpty(t, req.Content)
}

func TestPostResponse(t *testing.T) {
	post := Post{ID: 1, Content: "Test"}

	resp := PostResponse{
		Post:         post,
		UserLiked:    true,
		UserDisliked: false,
	}

	assert.True(t, resp.UserLiked)
}

func TestPostCommentStruct(t *testing.T) {
	comment := PostComment{
		ID:      1,
		PostID:  1,
		UserID:  1,
		Content: "Nice!",
	}

	assert.Equal(t, "Nice!", comment.Content)
}

func TestCommentResponse(t *testing.T) {
	comment := PostComment{ID: 1, Content: "Test"}

	resp := CommentResponse{
		PostComment:  comment,
		LikeCount:    3,
		DislikeCount: 1,
	}

	assert.Equal(t, 3, resp.LikeCount)
}

func TestPostReactionStruct(t *testing.T) {
	reaction := PostReaction{
		ID:     1,
		PostID: 1,
		Type:   "like",
	}

	assert.Equal(t, "like", reaction.Type)
}

func TestCreateCommentRequest(t *testing.T) {
	req := CreateCommentRequest{
		Content: "Great post!",
	}

	assert.Equal(t, "Great post!", req.Content)
}
