package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewPlacesService(t *testing.T) {
	assert.NotNil(t, &PlacesService{})
}

func TestPlacesServicePlaceholder(t *testing.T) {
	assert.True(t, true)
}
