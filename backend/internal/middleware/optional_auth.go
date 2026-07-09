package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/auth"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
)

// OptionalAuth authenticates the request if a valid, non-revoked access token
// is present, storing the principal — but never rejects. A missing, expired,
// malformed, revoked, or non-access token simply proceeds as anonymous (no
// principal). Handlers branch on httpx.Principal presence to decide what to
// return (e.g. public-only vs all rows). A revocation-store error is the one
// hard failure, since silently trusting a possibly-revoked token would be
// unsafe.
func OptionalAuth(jwtMgr auth.JWTManager, revocations RevocationChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, ok := bearerToken(c.GetHeader("Authorization"))
		if !ok {
			c.Next()
			return
		}

		claims, err := jwtMgr.Parse(token)
		if err != nil || claims.Type != auth.TokenTypeAccess {
			c.Next()
			return
		}

		revoked, err := revocations.IsRevoked(c.Request.Context(), claims.JTI)
		if err != nil {
			httpx.AbortStatus(c, http.StatusInternalServerError, "internal server error")
			return
		}
		if revoked {
			c.Next()
			return
		}

		httpx.SetPrincipal(c, domain.Principal{
			ID:        claims.MemberID,
			Role:      claims.Role,
			JTI:       claims.JTI,
			ExpiresAt: claims.ExpiresAt,
		})
		c.Next()
	}
}
