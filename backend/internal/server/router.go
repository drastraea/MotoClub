// Package server assembles the Gin router and runs the HTTP server.
package server

import (
	"log/slog"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/auth"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/handler"
	"github.com/edberto/motoclub-backend/internal/middleware"
)

// NewRouter builds the full route table with its middleware chain.
func NewRouter(h *handler.Handlers, jwtMgr auth.JWTManager, revocations middleware.RevocationChecker, logger *slog.Logger, allowedOrigins []string) *gin.Engine {
	r := gin.New()
	r.Use(middleware.RequestLogger(logger), gin.Recovery(), middleware.CORS(allowedOrigins))
	r.HandleMethodNotAllowed = true

	r.GET("/healthz", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"status": "ok"}) })

	// Public endpoints.
	r.POST("/register", h.Auth.Register)
	r.POST("/login", h.Auth.Login)

	// Authenticated endpoints available to any role, including visitors
	// (registered-but-unapproved members).
	authed := r.Group("/", middleware.JWTAuth(jwtMgr, revocations))
	authed.POST("/logout", h.Auth.Logout)
	authed.GET("/members/:id/profile",
		middleware.RequireSelfOrRole(domain.RoleAdmin, domain.RoleSuperadmin), h.Member.GetProfile)

	// Member area — approved members and up (visitors are excluded).
	memberArea := authed.Group("/", middleware.RequireRole(domain.RoleMember, domain.RoleAdmin, domain.RoleSuperadmin))
	memberArea.GET("/gallery", h.Gallery.List)
	memberArea.GET("/events", h.Event.List)
	memberArea.GET("/event/:id", h.Event.Get)
	memberArea.GET("/announcements", h.Announcement.List)

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
