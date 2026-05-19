package config

import "os"

type Config struct {
	Port        string
	StoragePath string
	PublicURL   string
}

func Load() *Config {
	publicURL := getEnv("MEDIA_PUBLIC_URL", "http://localhost:8080/media")
	return &Config{
		Port:        getEnv("PORT", "8084"),
		StoragePath: getEnv("MEDIA_STORAGE_PATH", "./storage"),
		PublicURL:   publicURL,
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
