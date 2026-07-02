package util

import "time"

// Clock abstracts the current time so that time-dependent logic can be tested
// deterministically.
type Clock interface {
	Now() time.Time
}

// RealClock returns the actual wall-clock time.
type RealClock struct{}

// Now returns time.Now().
func (RealClock) Now() time.Time { return time.Now() }
