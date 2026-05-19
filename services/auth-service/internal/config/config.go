package config

import (
	"os"
	"time"
)

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	JWTExpiry   time.Duration
	KafkaBroker string
}

func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", "8081"),
		DatabaseURL: getEnv("DATABASE_URL", "host=postgres user=mapsocial password=mapsocial123 dbname=mapsocial port=5432 sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "mapsocial-super-secret-key-2024"),
		JWTExpiry:   720 * time.Hour,
		KafkaBroker: getEnv("KAFKA_BROKER", "kafka:29092"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
