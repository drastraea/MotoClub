// Package server assembles the Gin router and runs the HTTP server.
package server

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/auth"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/handler"
	"github.com/edberto/motoclub-backend/internal/middleware"
)

// NewRouter builds the full route table with its middleware chain.
func NewRouter(h *handler.Handlers, jwtMgr auth.JWTManager, revocations middleware.RevocationChecker) *gin.Engine {
	r := gin.New()
	r.Use(gin.Recovery())
	r.HandleMethodNotAllowed = true

	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })

	// Public endpoints.
	r.POST("/register", h.Auth.Register)
	r.POST("/login", h.Auth.Login)

	// Authenticated endpoints (any role).
	authed := r.Group("/", middleware.JWTAuth(jwtMgr, revocations))
	authed.POST("/logout", h.Auth.Logout)
	authed.GET("/gallery", h.Gallery.List)
	authed.GET("/events", h.Event.List)
	authed.GET("/event/:id", h.Event.Get)
	authed.GET("/announcements", h.Announcement.List)
	authed.GET("/members/:id/profile",
		middleware.RequireSelfOrRole(domain.RoleAdmin, domain.RoleSuperadmin), h.Member.GetProfile)

	// Admin + superadmin endpoints.
	admin := authed.Group("/", middleware.RequireRole(domain.RoleAdmin, domain.RoleSuperadmin))
	admin.GET("/members/registration/count", h.Member.GetRegistrationCount)
	admin.GET("/members/registration", h.Member.ListRegistrations)
	admin.GET("/members", h.Member.ListMembers)
	admin.POST("/members/:id/status", h.Member.SetStatus)
	admin.DELETE("/members/:id", h.Member.Delete)

	admin.POST("/events", h.Event.Create)
	admin.PUT("/events/:id", h.Event.Update)
	admin.DELETE("/events/:id", h.Event.Delete)

	admin.POST("/gallery", h.Gallery.Create)
	admin.DELETE("/gallery/:id", h.Gallery.Delete)

	admin.POST("/announcements", h.Announcement.Create)
	admin.PUT("/announcements/:id", h.Announcement.Update)
	admin.DELETE("/announcements/:id", h.Announcement.Delete)

	// Superadmin-only endpoints.
	superadmin := authed.Group("/", middleware.RequireRole(domain.RoleSuperadmin))
	superadmin.POST("/members/:id", h.Member.UpdateRole)

	return r
}
