package config

import "os"

type Config struct {
	Port     string
	Database string
}

func Load() *Config {
	return &Config{
		Port:     getEnv("PORT", "8086"),
		Database: getEnv("DATABASE_URL", "host=postgres user=mapsocial password=mapsocial123 dbname=mapsocial port=5432 sslmode=disable"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
