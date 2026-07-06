// Package config loads runtime configuration from a per-environment YAML file
// (config.yaml). The active environment is chosen with APP_ENV; the file path
// with CONFIG_PATH. ${VAR} references in values are expanded from the process
// environment so secrets can be injected at deploy time instead of committed.
package config

import (
	"errors"
	"fmt"
	"os"
	"strings"
	"time"

	"gopkg.in/yaml.v3"
)

// Config holds the resolved runtime configuration for one environment.
type Config struct {
	Env            string
	Port           string
	DatabaseURL    string
	JWTSecret      string
	GoogleClientID string
	TokenTTL       time.Duration
	AllowedOrigins []string
	LogLevel       string
	LogFormat      string
}

// ErrMissing is returned when required configuration is absent.
var ErrMissing = errors.New("missing required configuration")

type dbSection struct {
	URL      string `yaml:"url"`
	Host     string `yaml:"host"`
	Port     int    `yaml:"port"`
	User     string `yaml:"user"`
	Password string `yaml:"password"`
	Name     string `yaml:"name"`
	SSLMode  string `yaml:"sslmode"`
}

type logSection struct {
	Level  string `yaml:"level"`
	Format string `yaml:"format"`
}

type envSection struct {
	Port               string      `yaml:"port"`
	Database           dbSection   `yaml:"database"`
	JWTSecret          string      `yaml:"jwt_secret"`
	GoogleClientID     string      `yaml:"google_client_id"`
	TokenTTLHours      int         `yaml:"token_ttl_hours"`
	CORSAllowedOrigins []string    `yaml:"cors_allowed_origins"`
	Log                logSection  `yaml:"log"`
}

// Parse resolves the config for appEnv from raw YAML (already env-expanded).
func Parse(data []byte, appEnv string) (Config, error) {
	file := map[string]envSection{}
	if err := yaml.Unmarshal(data, &file); err != nil {
		return Config{}, err
	}
	sec, ok := file[appEnv]
	if !ok {
		return Config{}, fmt.Errorf("%w: no section for environment %q", ErrMissing, appEnv)
	}

	cfg := Config{
		Env:            appEnv,
		Port:           def(sec.Port, "8080"),
		DatabaseURL:    sec.Database.url(),
		JWTSecret:      sec.JWTSecret,
		GoogleClientID: sec.GoogleClientID,
		TokenTTL:       ttl(sec.TokenTTLHours),
		AllowedOrigins: cleanOrigins(sec.CORSAllowedOrigins),
		LogLevel:       def(sec.Log.Level, "info"),
		LogFormat:      def(sec.Log.Format, "json"),
	}

	if cfg.DatabaseURL == "" || cfg.JWTSecret == "" || cfg.GoogleClientID == "" {
		return Config{}, ErrMissing
	}
	return cfg, nil
}

// LoadFromOS reads CONFIG_PATH (default config.yaml), expands ${VAR} references,
// and resolves the APP_ENV (default local) section.
func LoadFromOS() (Config, error) {
	path := def(os.Getenv("CONFIG_PATH"), "config.yaml")
	appEnv := def(os.Getenv("APP_ENV"), "local")

	data, err := os.ReadFile(path)
	if err != nil {
		return Config{}, err
	}
	return Parse([]byte(os.ExpandEnv(string(data))), appEnv)
}

func (d dbSection) url() string {
	if d.URL != "" {
		return d.URL
	}
	if d.Host == "" {
		return ""
	}
	port := d.Port
	if port == 0 {
		port = 5432
	}
	ssl := def(d.SSLMode, "disable")
	return fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s", d.User, d.Password, d.Host, port, d.Name, ssl)
}

func ttl(hours int) time.Duration {
	if hours <= 0 {
		return 24 * time.Hour
	}
	return time.Duration(hours) * time.Hour
}

func cleanOrigins(origins []string) []string {
	out := make([]string, 0, len(origins))
	for _, o := range origins {
		if trimmed := strings.TrimSpace(o); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func def(v, fallback string) string {
	if v == "" {
		return fallback
	}
	return v
}
