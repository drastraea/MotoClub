package util

import (
	// Embed the timezone database so time.LoadLocation("Asia/Jakarta") works
	// even on minimal (distroless/scratch) runtime images.
	_ "time/tzdata"

	"time"
)

// jakarta is the Asia/Jakarta location. Loaded once at package init; with the
// embedded tzdata this never fails, but we fall back to a fixed +07:00 offset
// defensively so the process can never panic at startup.
var jakarta = loadLocation("Asia/Jakarta")

func loadLocation(name string) *time.Location {
	loc, err := time.LoadLocation(name)
	if err != nil {
		return time.FixedZone("WIB", 7*60*60)
	}
	return loc
}

// Jakarta returns the Asia/Jakarta location.
func Jakarta() *time.Location { return jakarta }

// FormatJakartaDate renders t as YYYY-MM-DD in Asia/Jakarta.
func FormatJakartaDate(t time.Time) string {
	return t.In(jakarta).Format("2006-01-02")
}

// FormatJakartaDatePtr renders a nullable timestamp, returning nil when t is nil.
func FormatJakartaDatePtr(t *time.Time) *string {
	if t == nil {
		return nil
	}
	s := FormatJakartaDate(*t)
	return &s
}

// ParseJakartaDate parses a YYYY-MM-DD string as midnight in Asia/Jakarta.
func ParseJakartaDate(s string) (time.Time, error) {
	return time.ParseInLocation("2006-01-02", s, jakarta)
}
