package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestReviewStruct(t *testing.T) {
	review := Review{ID: 1}
	assert.NotZero(t, review.ID)
}

func TestReactionStruct(t *testing.T) {
	reaction := Reaction{ID: 1}
	assert.NotZero(t, reaction.ID)
}
