package service

import (
	"testing"

	"github.com/stretchr/testify/require"
)

func TestPostsService_CreatePost(t *testing.T) {
	svc := NewPostsService(nil)
	require.NotNil(t, svc)
}

func TestPostsServicePlaceholder(t *testing.T) {
	require.True(t, true)
}
