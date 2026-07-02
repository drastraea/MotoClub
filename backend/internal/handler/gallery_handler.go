package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
)

// GalleryHandler serves public and admin gallery endpoints.
type GalleryHandler struct {
	svc service.GalleryServicer
}

// NewGalleryHandler constructs a GalleryHandler.
func NewGalleryHandler(svc service.GalleryServicer) *GalleryHandler {
	return &GalleryHandler{svc: svc}
}

// List handles GET /gallery.
func (h *GalleryHandler) List(c *gin.Context) {
	items, err := h.svc.List(c.Request.Context())
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toGalleryList(items))
}

type galleryRequest struct {
	Link string `json:"link" binding:"required"`
}

// Create handles POST /gallery.
func (h *GalleryHandler) Create(c *gin.Context) {
	var req galleryRequest
	if !bindJSON(c, &req) {
		return
	}
	item, err := h.svc.Create(c.Request.Context(), req.Link)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusCreated, idResponse{ID: idString(item.ID)})
}

// Delete handles DELETE /gallery/{id}.
func (h *GalleryHandler) Delete(c *gin.Context) {
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
