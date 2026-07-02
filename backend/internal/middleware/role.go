package middleware

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
)

// RequireRole allows the request only if the principal holds one of the roles.
func RequireRole(roles ...domain.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		principal, ok := httpx.Principal(c)
		if !ok {
			httpx.AbortStatus(c, http.StatusUnauthorized, "unauthenticated")
			return
		}
		if !principal.HasRole(roles...) {
			httpx.AbortStatus(c, http.StatusForbidden, "insufficient role")
			return
		}
		c.Next()
	}
}

// RequireSelfOrRole allows the request if the principal holds one of the roles,
// or otherwise only if the {id} path parameter matches the principal's own id.
// Per the API contract, a mismatch yields 400 (not 403).
func RequireSelfOrRole(roles ...domain.Role) gin.HandlerFunc {
	return func(c *gin.Context) {
		principal, ok := httpx.Principal(c)
		if !ok {
			httpx.AbortStatus(c, http.StatusUnauthorized, "unauthenticated")
			return
		}
		if principal.HasRole(roles...) {
			c.Next()
			return
		}

		id, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil || id != principal.ID {
			httpx.AbortStatus(c, http.StatusBadRequest, "cannot access another member's resource")
			return
		}
		c.Next()
	}
}
