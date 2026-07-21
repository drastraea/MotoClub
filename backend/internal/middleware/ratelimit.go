package middleware

import (
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"

	"github.com/edberto/motoclub-backend/internal/httpx"
)

// RateLimit throttles requests per client IP using a token bucket (rps steady
// rate, burst allowed in one go). Intended for public, unauthenticated
// endpoints (e.g. /uploads) where a role check isn't available to bound abuse.
//
// ponytail: limiters live in an unbounded in-memory map, keyed by IP, for the
// life of the process — fine at this traffic scale; move to a shared/expiring
// store (e.g. Redis) if the process restarts often or distinct-IP abuse grows
// the map meaningfully.
func RateLimit(rps float64, burst int) gin.HandlerFunc {
	var mu sync.Mutex
	limiters := make(map[string]*rate.Limiter)

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		lim, ok := limiters[ip]
		if !ok {
			lim = rate.NewLimiter(rate.Limit(rps), burst)
			limiters[ip] = lim
		}
		mu.Unlock()

		if !lim.Allow() {
			httpx.AbortStatus(c, http.StatusTooManyRequests, "too many requests, slow down")
			return
		}
		c.Next()
	}
}
