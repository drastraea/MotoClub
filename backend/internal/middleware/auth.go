// Package middleware provides the Gin middleware chain: JWT authentication,
// role gating, and the self-or-role ownership check.
package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/auth"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
)

// RevocationChecker reports whether a token's jti has been revoked.
type RevocationChecker interface {
	IsRevoked(ctx context.Context, jti string) (bool, error)
}

// JWTAuth authenticates the request from the Authorization header, rejects
// expired/invalid/revoked tokens, and stores the resulting principal.
func JWTAuth(jwtMgr auth.JWTManager, revocations RevocationChecker) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		token, ok := bearerToken(header)
		if !ok {
			httpx.AbortStatus(c, http.StatusUnauthorized, "missing bearer token")
			return
		}

		claims, err := jwtMgr.Parse(token)
		if err != nil || claims.Type != auth.TokenTypeAccess {
			httpx.AbortStatus(c, http.StatusUnauthorized, "invalid token")
			return
		}

		revoked, err := revocations.IsRevoked(c.Request.Context(), claims.JTI)
		if err != nil {
			httpx.AbortStatus(c, http.StatusInternalServerError, "internal server error")
			return
		}
		if revoked {
			httpx.AbortStatus(c, http.StatusUnauthorized, "token revoked")
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

func bearerToken(header string) (string, bool) {
	const prefix = "Bearer "
	if len(header) <= len(prefix) || !strings.EqualFold(header[:len(prefix)], prefix) {
		return "", false
	}
	token := strings.TrimSpace(header[len(prefix):])
	if token == "" {
		return "", false
	}
	return token, true
}
