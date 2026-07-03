// Package httpx holds HTTP glue shared by the middleware and handler layers:
// the JSON error envelope, sentinel-error-to-status mapping, and helpers for
// reading the authenticated principal off the Gin context.
package httpx

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/domain"
)

const principalKey = "principal"

// ErrorResponse is the uniform error body.
type ErrorResponse struct {
	Error string `json:"error"`
}

// SetPrincipal stores the authenticated principal on the context.
func SetPrincipal(c *gin.Context, p domain.Principal) {
	c.Set(principalKey, p)
}

// Principal retrieves the authenticated principal, reporting whether one is set.
func Principal(c *gin.Context) (domain.Principal, bool) {
	v, ok := c.Get(principalKey)
	if !ok {
		return domain.Principal{}, false
	}
	p, ok := v.(domain.Principal)
	return p, ok
}

// StatusFor maps a sentinel error to an HTTP status code.
func StatusFor(err error) int {
	switch {
	case errors.Is(err, apperr.ErrNotFound):
		return http.StatusNotFound
	case errors.Is(err, apperr.ErrConflict):
		return http.StatusConflict
	case errors.Is(err, apperr.ErrValidation):
		return http.StatusBadRequest
	case errors.Is(err, apperr.ErrUnauthorized):
		return http.StatusUnauthorized
	case errors.Is(err, apperr.ErrForbidden):
		return http.StatusForbidden
	default:
		return http.StatusInternalServerError
	}
}

// Error writes err as a JSON envelope with the mapped status and aborts. The
// underlying error is attached to the context (c.Error) so the request logger
// records the real cause even when the client sees a sanitized message.
func Error(c *gin.Context, err error) {
	_ = c.Error(err)
	status := StatusFor(err)
	msg := err.Error()
	if status == http.StatusInternalServerError {
		msg = "internal server error"
	}
	c.AbortWithStatusJSON(status, ErrorResponse{Error: msg})
}

// AbortStatus writes a bare status + message and aborts.
func AbortStatus(c *gin.Context, status int, msg string) {
	c.AbortWithStatusJSON(status, ErrorResponse{Error: msg})
}
