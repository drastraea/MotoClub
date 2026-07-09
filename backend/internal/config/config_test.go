package config

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const sample = `
local:
  port: "9090"
  database:
    host: db
    port: 5432
    user: motoclub
    password: secret
    name: motoclub
    sslmode: disable
  jwt_secret: dev-secret
  google_client_id: client-123
  access_ttl_minutes: 30
  refresh_ttl_hours: 72
  cors_allowed_origins:
    - http://localhost:3000
    - " "
  log:
    level: debug
    format: text

minimal:
  database:
    url: postgres://u:p@h:5432/db?sslmode=disable
  jwt_secret: s
  google_client_id: c

incomplete:
  database:
    url: postgres://x
  google_client_id: c
`

func TestParse_Local(t *testing.T) {
	cfg, err := Parse([]byte(sample), "local")
	require.NoError(t, err)
	assert.Equal(t, "local", cfg.Env)
	assert.Equal(t, "9090", cfg.Port)
	assert.Equal(t, "postgres://motoclub:secret@db:5432/motoclub?sslmode=disable", cfg.DatabaseURL)
	assert.Equal(t, "dev-secret", cfg.JWTSecret)
	assert.Equal(t, "client-123", cfg.GoogleClientID)
	assert.Equal(t, 30*time.Minute, cfg.AccessTTL)
	assert.Equal(t, 72*time.Hour, cfg.RefreshTTL)
	assert.Equal(t, []string{"http://localhost:3000"}, cfg.AllowedOrigins)
	assert.Equal(t, "debug", cfg.LogLevel)
	assert.Equal(t, "text", cfg.LogFormat)
}

func TestParse_MinimalDefaults(t *testing.T) {
	cfg, err := Parse([]byte(sample), "minimal")
	require.NoError(t, err)
	assert.Equal(t, "8080", cfg.Port)
	assert.Equal(t, "postgres://u:p@h:5432/db?sslmode=disable", cfg.DatabaseURL)
	assert.Equal(t, 15*time.Minute, cfg.AccessTTL)   // default when unset
	assert.Equal(t, 168*time.Hour, cfg.RefreshTTL) // default when unset
	assert.Equal(t, "info", cfg.LogLevel)
	assert.Equal(t, "json", cfg.LogFormat)
}

func TestParse_UnknownEnv(t *testing.T) {
	_, err := Parse([]byte(sample), "staging")
	assert.ErrorIs(t, err, ErrMissing)
}

func TestParse_MissingRequired(t *testing.T) {
	_, err := Parse([]byte(sample), "incomplete") // no jwt_secret
	assert.ErrorIs(t, err, ErrMissing)
}

func TestParse_InvalidYAML(t *testing.T) {
	_, err := Parse([]byte("::: not yaml"), "local")
	assert.Error(t, err)
}

func TestDatabaseURL_DefaultsPortAndSSL(t *testing.T) {
	yaml := `
local:
  database:
    host: h
    user: u
    password: p
    name: n
  jwt_secret: s
  google_client_id: c
`
	cfg, err := Parse([]byte(yaml), "local")
	require.NoError(t, err)
	assert.Equal(t, "postgres://u:p@h:5432/n?sslmode=disable", cfg.DatabaseURL)
}

func TestLoadFromOS_WithInterpolation(t *testing.T) {
	dir := t.TempDir()
	path := filepath.Join(dir, "config.yaml")
	content := `
prod:
  database:
    url: "${TEST_DB_URL}"
  jwt_secret: "${TEST_JWT}"
  google_client_id: c
`
	require.NoError(t, os.WriteFile(path, []byte(content), 0o600))

	t.Setenv("CONFIG_PATH", path)
	t.Setenv("APP_ENV", "prod")
	t.Setenv("TEST_DB_URL", "postgres://interp")
	t.Setenv("TEST_JWT", "jwt-from-env")

	cfg, err := LoadFromOS()
	require.NoError(t, err)
	assert.Equal(t, "postgres://interp", cfg.DatabaseURL)
	assert.Equal(t, "jwt-from-env", cfg.JWTSecret)
}

func TestLoadFromOS_MissingFile(t *testing.T) {
	t.Setenv("CONFIG_PATH", filepath.Join(t.TempDir(), "nope.yaml"))
	t.Setenv("APP_ENV", "local")
	_, err := LoadFromOS()
	assert.Error(t, err)
}
