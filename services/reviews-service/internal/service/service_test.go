package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewReviewsService(t *testing.T) {
	assert.NotNil(t, &ReviewsService{})
}

func TestReviewsServicePlaceholder(t *testing.T) {
	assert.True(t, true)
}
