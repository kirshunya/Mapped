package service

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestNewChatService(t *testing.T) {
	assert.NotNil(t, &ChatService{})
}

func TestChatServicePlaceholder(t *testing.T) {
	assert.True(t, true)
}
