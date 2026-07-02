package server

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/edberto/motoclub-backend/internal/auth"
	"github.com/edberto/motoclub-backend/internal/handler"
)

func TestNewRouter_NoConflictAndHealthz(t *testing.T) {
	gin.SetMode(gin.TestMode)

	handlers := &handler.Handlers{
		Auth:         handler.NewAuthHandler(nil),
		Member:       handler.NewMemberHandler(nil),
		Event:        handler.NewEventHandler(nil),
		Announcement: handler.NewAnnouncementHandler(nil),
		Gallery:      handler.NewGalleryHandler(nil),
	}

	var r *gin.Engine
	require.NotPanics(t, func() {
		r = NewRouter(handlers, auth.JWTManager(nil), nil)
	})

	req := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	assert.Equal(t, http.StatusOK, w.Code)
}
