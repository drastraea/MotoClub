// Package handler contains the Gin HTTP handlers. Each handler binds and
// validates the request, delegates to a service, and maps the result (or a
// sentinel error) onto an HTTP response. Handlers hold no business logic.
package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/util"
)

// Handlers bundles the per-domain handler groups.
type Handlers struct {
	Auth         *AuthHandler
	Member       *MemberHandler
	Event        *EventHandler
	Announcement *AnnouncementHandler
	Gallery      *GalleryHandler
	Upload       *UploadHandler
}

// publicOnly reports whether reads should be restricted to public rows. Only
// approved members and up (member/admin/superadmin) may see non-public items;
// anonymous callers and visitors (registered-but-unapproved) are limited to
// public. The optional-auth middleware sets a principal only for valid tokens.
func publicOnly(c *gin.Context) bool {
	p, ok := httpx.Principal(c)
	return !ok || !p.HasRole(domain.RoleMember, domain.RoleAdmin, domain.RoleSuperadmin)
}

// parseIDParam reads the {id} path parameter as an int64, writing a 400 and
// returning false when it is missing or malformed.
func parseIDParam(c *gin.Context) (int64, bool) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		httpx.AbortStatus(c, http.StatusBadRequest, "invalid id")
		return 0, false
	}
	return id, true
}

// parseStartFrom reads an optional startFrom query parameter (YYYY-MM-DD in
// Asia/Jakarta). Absent → (nil, true); malformed → writes 400 and returns false.
func parseStartFrom(c *gin.Context) (*time.Time, bool) {
	raw := c.Query("startFrom")
	if raw == "" {
		return nil, true
	}
	t, err := util.ParseJakartaDate(raw)
	if err != nil {
		httpx.AbortStatus(c, http.StatusBadRequest, "invalid startFrom, expected YYYY-MM-DD")
		return nil, false
	}
	return &t, true
}

// bindJSON binds and validates the request body, writing a 400 on failure.
func bindJSON(c *gin.Context, dst any) bool {
	if err := c.ShouldBindJSON(dst); err != nil {
		httpx.AbortStatus(c, http.StatusBadRequest, err.Error())
		return false
	}
	return true
}
