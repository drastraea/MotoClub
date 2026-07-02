package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
)

// AnnouncementHandler serves public and admin announcement endpoints.
type AnnouncementHandler struct {
	svc service.AnnouncementServicer
}

// NewAnnouncementHandler constructs an AnnouncementHandler.
func NewAnnouncementHandler(svc service.AnnouncementServicer) *AnnouncementHandler {
	return &AnnouncementHandler{svc: svc}
}

// List handles GET /announcements.
func (h *AnnouncementHandler) List(c *gin.Context) {
	startFrom, ok := parseStartFrom(c)
	if !ok {
		return
	}
	items, err := h.svc.List(c.Request.Context(), startFrom)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toAnnouncementList(items))
}

type announcementRequest struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
}

// Create handles POST /announcements.
func (h *AnnouncementHandler) Create(c *gin.Context) {
	var req announcementRequest
	if !bindJSON(c, &req) {
		return
	}
	item, err := h.svc.Create(c.Request.Context(), req.Title, req.Description)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusCreated, idResponse{ID: idString(item.ID)})
}

// Update handles PUT /announcements/{id}.
func (h *AnnouncementHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req announcementRequest
	if !bindJSON(c, &req) {
		return
	}
	if _, err := h.svc.Update(c.Request.Context(), id, req.Title, req.Description); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// Delete handles DELETE /announcements/{id}.
func (h *AnnouncementHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	if err := h.svc.Delete(c.Request.Context(), id); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
