package middleware

import (
	"bytes"
	"errors"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/edberto/motoclub-backend/internal/httpx"
)

func TestRequestLogger_Levels(t *testing.T) {
	cases := []struct {
		name   string
		status int
		attach bool
		expect string
	}{
		{"info 2xx", http.StatusOK, false, "level=INFO"},
		{"warn 4xx", http.StatusBadRequest, false, "level=WARN"},
		{"error 5xx", http.StatusInternalServerError, true, "level=ERROR"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			var buf bytes.Buffer
			logger := slog.New(slog.NewTextHandler(&buf, &slog.HandlerOptions{Level: slog.LevelDebug}))

			r := gin.New()
			r.Use(RequestLogger(logger))
			r.GET("/x", func(c *gin.Context) {
				if tc.attach {
					httpx.Error(c, errors.New("boom"))
					return
				}
				c.Status(tc.status)
			})

			req := httptest.NewRequest(http.MethodGet, "/x?q=1", nil)
			r.ServeHTTP(httptest.NewRecorder(), req)

			out := buf.String()
			assert.Contains(t, out, tc.expect)
			assert.Contains(t, out, "/x?q=1")
			assert.Contains(t, out, "method=GET")
			if tc.attach {
				assert.Contains(t, out, "boom")
			}
		})
	}
}
