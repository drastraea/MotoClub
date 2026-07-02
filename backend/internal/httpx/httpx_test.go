package httpx

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/domain"
)

func init() { gin.SetMode(gin.TestMode) }

func TestStatusFor(t *testing.T) {
	cases := map[error]int{
		apperr.ErrNotFound:     http.StatusNotFound,
		apperr.ErrConflict:     http.StatusConflict,
		apperr.ErrValidation:   http.StatusBadRequest,
		apperr.ErrUnauthorized: http.StatusUnauthorized,
		apperr.ErrForbidden:    http.StatusForbidden,
		errors.New("other"):    http.StatusInternalServerError,
	}
	for err, want := range cases {
		assert.Equal(t, want, StatusFor(err))
	}
}

func TestPrincipalRoundTrip(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	SetPrincipal(c, domain.Principal{ID: 7, Role: domain.RoleAdmin})

	p, ok := Principal(c)
	assert.True(t, ok)
	assert.Equal(t, int64(7), p.ID)
}

func TestPrincipal_Absent(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	_, ok := Principal(c)
	assert.False(t, ok)
}

func TestPrincipal_WrongType(t *testing.T) {
	c, _ := gin.CreateTestContext(httptest.NewRecorder())
	c.Set(principalKey, "not-a-principal")
	_, ok := Principal(c)
	assert.False(t, ok)
}

func TestError_MasksInternal(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	Error(c, errors.New("db exploded"))
	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.JSONEq(t, `{"error":"internal server error"}`, w.Body.String())
	assert.True(t, c.IsAborted())
}

func TestError_PropagatesSentinelMessage(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	Error(c, apperr.ErrNotFound)
	assert.Equal(t, http.StatusNotFound, w.Code)
	assert.JSONEq(t, `{"error":"resource not found"}`, w.Body.String())
}

func TestAbortStatus(t *testing.T) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	AbortStatus(c, http.StatusTeapot, "nope")
	assert.Equal(t, http.StatusTeapot, w.Code)
	assert.JSONEq(t, `{"error":"nope"}`, w.Body.String())
	assert.True(t, c.IsAborted())
}
