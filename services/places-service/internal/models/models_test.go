package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestPlaceStruct(t *testing.T) {
	place := Place{ID: 1, Name: "Test"}
	assert.NotZero(t, place.ID)
	assert.NotEmpty(t, place.Name)
}

func TestGroupStruct(t *testing.T) {
	group := Group{ID: 1, Name: "Test"}
	assert.NotZero(t, group.ID)
}
