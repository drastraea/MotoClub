package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
)

// maxSiteContentSize caps the landing-page JSON document.
const maxSiteContentSize = 1 << 20 // 1MB

// SiteContentHandler serves the public GET and admin PUT for editable
// landing-page content.
type SiteContentHandler struct {
	svc service.SiteContentServicer
}

// NewSiteContentHandler constructs a SiteContentHandler.
func NewSiteContentHandler(svc service.SiteContentServicer) *SiteContentHandler {
	return &SiteContentHandler{svc: svc}
}

// Get handles GET /site-content. Returns the raw JSON document; 404 when nothing
// has been saved yet (the frontend then renders its built-in defaults).
func (h *SiteContentHandler) Get(c *gin.Context) {
	data, err := h.svc.Get(c.Request.Context())
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.Data(http.StatusOK, "application/json; charset=utf-8", data)
}

// Update handles PUT /site-content (admin). The body is stored verbatim after a
// JSON-object check in the service.
func (h *SiteContentHandler) Update(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxSiteContentSize)
	body, err := io.ReadAll(c.Request.Body)
	if err != nil {
		httpx.AbortStatus(c, http.StatusRequestEntityTooLarge, "body too large (max 1MB)")
		return
	}
	if err := h.svc.Update(c.Request.Context(), body); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
