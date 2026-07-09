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
	items, err := h.svc.List(c.Request.Context(), publicOnly(c))
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toGalleryList(items))
}

type galleryRequest struct {
	Link     string `json:"link" binding:"required"`
	IsPublic bool   `json:"is_public"`
}

// Create handles POST /gallery.
func (h *GalleryHandler) Create(c *gin.Context) {
	var req galleryRequest
	if !bindJSON(c, &req) {
		return
	}
	item, err := h.svc.Create(c.Request.Context(), req.Link, req.IsPublic)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusCreated, idResponse{ID: idString(item.ID)})
}

type galleryUpdateRequest struct {
	IsPublic bool `json:"is_public"`
}

// Update handles PUT /gallery/{id}: toggle a gallery item's public visibility.
func (h *GalleryHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req galleryUpdateRequest
	if !bindJSON(c, &req) {
		return
	}
	if _, err := h.svc.Update(c.Request.Context(), id, req.IsPublic); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
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
