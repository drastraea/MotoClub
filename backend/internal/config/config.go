// Package config loads and validates runtime configuration from the environment.
package config

import (
	"errors"
	"os"
	"strconv"
	"time"
)

// Config holds all runtime configuration.
type Config struct {
	Port           string
	DatabaseURL    string
	JWTSecret      string
	GoogleClientID string
	TokenTTL       time.Duration
}

// ErrMissing is returned when a required environment variable is absent.
var ErrMissing = errors.New("missing required environment variable")

// Load reads configuration from the environment, applying defaults and
// validating that required values are present.
func Load(getenv func(string) string) (Config, error) {
	cfg := Config{
		Port:           def(getenv("PORT"), "8080"),
		DatabaseURL:    getenv("DATABASE_URL"),
		JWTSecret:      getenv("JWT_SECRET"),
		GoogleClientID: getenv("GOOGLE_CLIENT_ID"),
		TokenTTL:       24 * time.Hour,
	}

	if v := getenv("TOKEN_TTL_HOURS"); v != "" {
		hours, err := strconv.Atoi(v)
		if err != nil {
			return Config{}, err
		}
		cfg.TokenTTL = time.Duration(hours) * time.Hour
	}

	if cfg.DatabaseURL == "" || cfg.JWTSecret == "" || cfg.GoogleClientID == "" {
		return Config{}, ErrMissing
	}
	return cfg, nil
}

// LoadFromOS loads configuration from the process environment.
func LoadFromOS() (Config, error) { return Load(os.Getenv) }

func def(v, fallback string) string {
	if v == "" {
		return fallback
	}
	return v
}
