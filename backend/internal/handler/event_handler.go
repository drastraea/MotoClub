package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
	"github.com/edberto/motoclub-backend/internal/util"
)

// EventHandler serves public and admin event endpoints.
type EventHandler struct {
	svc service.EventServicer
}

// NewEventHandler constructs an EventHandler.
func NewEventHandler(svc service.EventServicer) *EventHandler {
	return &EventHandler{svc: svc}
}

// List handles GET /events.
func (h *EventHandler) List(c *gin.Context) {
	startFrom, ok := parseStartFrom(c)
	if !ok {
		return
	}
	events, err := h.svc.List(c.Request.Context(), startFrom, publicOnly(c))
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toEventList(events))
}

// Count handles GET /events/count (total events).
func (h *EventHandler) Count(c *gin.Context) {
	count, err := h.svc.Count(c.Request.Context())
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, countResponse{Count: count})
}

// Get handles GET /event/{id}.
func (h *EventHandler) Get(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	event, err := h.svc.Get(c.Request.Context(), id, publicOnly(c))
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toEventDetail(event))
}

type eventRequest struct {
	Title       string  `json:"title" binding:"required"`
	Description string  `json:"description" binding:"required"`
	Date        string  `json:"date" binding:"required"`
	Location    *string `json:"location"`
	ImageLink   *string `json:"image_link"`
	IsPublic    bool    `json:"is_public"`
}

func (r eventRequest) toInput(c *gin.Context) (service.EventInput, bool) {
	date, err := util.ParseJakartaDate(r.Date)
	if err != nil {
		httpx.AbortStatus(c, http.StatusBadRequest, "invalid date, expected YYYY-MM-DD")
		return service.EventInput{}, false
	}
	return service.EventInput{
		Title:       r.Title,
		Description: r.Description,
		Date:        date,
		Location:    r.Location,
		ImageLink:   r.ImageLink,
		IsPublic:    r.IsPublic,
	}, true
}

// Create handles POST /events.
func (h *EventHandler) Create(c *gin.Context) {
	var req eventRequest
	if !bindJSON(c, &req) {
		return
	}
	in, ok := req.toInput(c)
	if !ok {
		return
	}
	event, err := h.svc.Create(c.Request.Context(), in)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusCreated, idResponse{ID: idString(event.ID)})
}

// Update handles PUT /events/{id}.
func (h *EventHandler) Update(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req eventRequest
	if !bindJSON(c, &req) {
		return
	}
	in, ok := req.toInput(c)
	if !ok {
		return
	}
	if _, err := h.svc.Update(c.Request.Context(), id, in); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// Delete handles DELETE /events/{id}.
func (h *EventHandler) Delete(c *gin.Context) {
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
