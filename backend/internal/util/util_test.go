package util

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestRealClockNow(t *testing.T) {
	before := time.Now()
	got := RealClock{}.Now()
	assert.False(t, got.Before(before.Add(-time.Second)))
}

func TestLoadLocation(t *testing.T) {
	loc := loadLocation("Asia/Jakarta")
	require.NotNil(t, loc)
	assert.Equal(t, "Asia/Jakarta", loc.String())

	// Unknown zone falls back to a fixed +07:00 offset.
	fallback := loadLocation("Totally/Bogus")
	require.NotNil(t, fallback)
	_, offset := time.Date(2026, 1, 1, 0, 0, 0, 0, fallback).Zone()
	assert.Equal(t, 7*60*60, offset)
}

func TestJakarta(t *testing.T) {
	assert.Equal(t, "Asia/Jakarta", Jakarta().String())
}

func TestFormatJakartaDate(t *testing.T) {
	// 2026-01-01T18:00:00Z is 2026-01-02 01:00 in Jakarta (+07:00).
	utc := time.Date(2026, 1, 1, 18, 0, 0, 0, time.UTC)
	assert.Equal(t, "2026-01-02", FormatJakartaDate(utc))
}

func TestFormatJakartaDatePtr(t *testing.T) {
	assert.Nil(t, FormatJakartaDatePtr(nil))

	ts := time.Date(2026, 3, 15, 5, 0, 0, 0, time.UTC)
	got := FormatJakartaDatePtr(&ts)
	require.NotNil(t, got)
	assert.Equal(t, "2026-03-15", *got)
}

func TestParseJakartaDate(t *testing.T) {
	got, err := ParseJakartaDate("2026-07-02")
	require.NoError(t, err)
	assert.Equal(t, 2026, got.Year())
	assert.Equal(t, time.July, got.Month())
	assert.Equal(t, 2, got.Day())
	assert.Equal(t, Jakarta(), got.Location())

	_, err = ParseJakartaDate("not-a-date")
	assert.Error(t, err)
}
