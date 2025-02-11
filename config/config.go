package config

import (
	"log"
	"os"

	"github.com/ilyakaznacheev/cleanenv"
)

type Config struct {
	Env            string         `yaml:"env" env-default:"local"`
	Postgres       PostgresConfig `yaml:"postgres"`
	User           ServiceConfig  `yaml:"user_service"`
	Place          ServiceConfig  `yaml:"place_service"`
	Recommendation ServiceConfig  `yaml:"recommendation_service"`
	Kafka          KafkaConfig    `yaml:"kafka"`
	Jwt            JWTConfig      `yaml:"jwt"`
}

type PostgresConfig struct {
	Host     string `yaml:"host" env-required:"true"`
	Port     string `yaml:"port" env-default:"5432"`
	User     string `yaml:"user" env-required:"true"`
	Password string `yaml:"password" env-required:"true"`
	DBName   string `yaml:"dbname" env-required:"true"`
	SSLMode  string `yaml:"sslmode" env-default:"disable"`
}

type ServiceConfig struct {
	Port string `yaml:"port"`
}

type KafkaConfig struct {
	FirstBrokerPort string `yaml:"first_broker_port"`
}

type JWTConfig struct {
	Secret string `yaml:"secret"`
}

func MustLoad() *Config {
	configPath := os.Getenv("CONFIG_PATH")
	if configPath == "" {
		log.Fatal("CONFIG_PATH environment variable is not set")
	}

	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		log.Fatalf("config file (.yaml) does not exist: %s", configPath)
	}

	var cfg Config

	if err := cleanenv.ReadConfig(configPath, &cfg); err != nil {
		log.Fatalf("cannot read config: %s", err)
	}

	return &cfg
}
