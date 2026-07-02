// Package apperr defines the sentinel errors that flow from the repository and
// service layers up to the HTTP handlers, where they are mapped to status codes.
package apperr

import "errors"

var (
	// ErrNotFound indicates a requested resource does not exist (or is soft-deleted).
	ErrNotFound = errors.New("resource not found")
	// ErrConflict indicates a uniqueness or state conflict (e.g. duplicate email).
	ErrConflict = errors.New("resource conflict")
	// ErrValidation indicates the request was well-formed but semantically invalid.
	ErrValidation = errors.New("validation failed")
	// ErrUnauthorized indicates missing or invalid authentication.
	ErrUnauthorized = errors.New("unauthorized")
	// ErrForbidden indicates the caller is authenticated but not permitted.
	ErrForbidden = errors.New("forbidden")
)
