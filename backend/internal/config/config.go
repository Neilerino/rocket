package config

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	HostName    string
	Port        string
	DatabaseURL string
	JWTSecret   string
	Environment string
}

func Load() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, errors.New("failed to load environment variables")
	}

	config := &Config{
		HostName:    getEnv("HOST_NAME", "dev.rocket"),
		Port:        getEnv("PORT", "8080"),
		DatabaseURL: getEnv("DATABASE_URL", "postgresql://rocket:password@localhost:5432/rocket?sslmode=disable"),
		JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
		Environment: getEnv("ENV", "development"),
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}
