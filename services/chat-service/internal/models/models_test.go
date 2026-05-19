package models

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestChatStruct(t *testing.T) {
	chat := Chat{ID: 1, Type: "direct"}
	assert.NotZero(t, chat.ID)
}

func TestChatMessageStruct(t *testing.T) {
	msg := ChatMessage{ID: 1, Text: "Hello"}
	assert.NotZero(t, msg.ID)
}
