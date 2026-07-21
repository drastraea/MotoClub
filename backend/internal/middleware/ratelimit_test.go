package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func ctxFromIP(ip string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = httptest.NewRequest(http.MethodPost, "/", nil)
	c.Request.RemoteAddr = ip + ":12345"
	return c, w
}

func TestRateLimit(t *testing.T) {
	t.Run("allows requests within burst", func(t *testing.T) {
		limit := RateLimit(1, 2)
		for i := 0; i < 2; i++ {
			c, w := ctxFromIP("1.2.3.4")
			limit(c)
			assert.Equal(t, http.StatusOK, w.Code)
			assert.False(t, c.IsAborted())
		}
	})

	t.Run("rejects once burst is exhausted", func(t *testing.T) {
		limit := RateLimit(1, 1)
		c1, w1 := ctxFromIP("5.6.7.8")
		limit(c1)
		assert.False(t, c1.IsAborted())
		assert.NotEqual(t, http.StatusTooManyRequests, w1.Code)

		c2, w2 := ctxFromIP("5.6.7.8")
		limit(c2)
		assert.True(t, c2.IsAborted())
		assert.Equal(t, http.StatusTooManyRequests, w2.Code)
	})

	t.Run("tracks distinct IPs independently", func(t *testing.T) {
		limit := RateLimit(1, 1)
		c1, _ := ctxFromIP("9.9.9.9")
		limit(c1)
		assert.False(t, c1.IsAborted())

		c2, _ := ctxFromIP("8.8.8.8")
		limit(c2)
		assert.False(t, c2.IsAborted())
	})
}
