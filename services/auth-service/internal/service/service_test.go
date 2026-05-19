package service

import (
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

func TestNewAuthService(t *testing.T) {
	jwtSecret := "test-secret"
	jwtExpiry := time.Hour

	svc := NewAuthService(nil, jwtSecret, jwtExpiry)

	require.NotNil(t, svc)
	require.Equal(t, jwtSecret, svc.jwtSecret)
}

func TestAuthServiceFields(t *testing.T) {
	jwtSecret := "my-secret"
	jwtExpiry := 2 * time.Hour

	svc := NewAuthService(nil, jwtSecret, jwtExpiry)

	require.Equal(t, jwtSecret, svc.jwtSecret)
	require.Equal(t, jwtExpiry, svc.jwtExpiry)
}
