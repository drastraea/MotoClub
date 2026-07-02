package config

import (
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func env(m map[string]string) func(string) string {
	return func(k string) string { return m[k] }
}

func TestLoad_Defaults(t *testing.T) {
	cfg, err := Load(env(map[string]string{
		"DATABASE_URL":     "postgres://x",
		"JWT_SECRET":       "secret",
		"GOOGLE_CLIENT_ID": "client",
	}))
	require.NoError(t, err)
	assert.Equal(t, "8080", cfg.Port)
	assert.Equal(t, "postgres://x", cfg.DatabaseURL)
	assert.Equal(t, 24*time.Hour, cfg.TokenTTL)
}

func TestLoad_OverridesAndTTL(t *testing.T) {
	cfg, err := Load(env(map[string]string{
		"PORT":             "9090",
		"DATABASE_URL":     "postgres://x",
		"JWT_SECRET":       "secret",
		"GOOGLE_CLIENT_ID": "client",
		"TOKEN_TTL_HOURS":  "1",
	}))
	require.NoError(t, err)
	assert.Equal(t, "9090", cfg.Port)
	assert.Equal(t, time.Hour, cfg.TokenTTL)
}

func TestLoad_BadTTL(t *testing.T) {
	_, err := Load(env(map[string]string{
		"DATABASE_URL":     "postgres://x",
		"JWT_SECRET":       "secret",
		"GOOGLE_CLIENT_ID": "client",
		"TOKEN_TTL_HOURS":  "abc",
	}))
	assert.Error(t, err)
}

func TestLoad_MissingRequired(t *testing.T) {
	_, err := Load(env(map[string]string{"JWT_SECRET": "secret"}))
	assert.ErrorIs(t, err, ErrMissing)
}

func TestLoadFromOS(t *testing.T) {
	t.Setenv("DATABASE_URL", "postgres://x")
	t.Setenv("JWT_SECRET", "secret")
	t.Setenv("GOOGLE_CLIENT_ID", "client")
	cfg, err := LoadFromOS()
	require.NoError(t, err)
	assert.Equal(t, "postgres://x", cfg.DatabaseURL)
}

func TestLoadFromOS_Missing(t *testing.T) {
	t.Setenv("DATABASE_URL", "")
	t.Setenv("JWT_SECRET", "")
	t.Setenv("GOOGLE_CLIENT_ID", "")
	_, err := LoadFromOS()
	assert.True(t, errors.Is(err, ErrMissing))
}
