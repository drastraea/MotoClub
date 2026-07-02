package handler

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
)

// MemberHandler serves profile and admin member-management endpoints.
type MemberHandler struct {
	svc service.MemberServicer
}

// NewMemberHandler constructs a MemberHandler.
func NewMemberHandler(svc service.MemberServicer) *MemberHandler {
	return &MemberHandler{svc: svc}
}

// GetProfile handles GET /members/{id}/profile.
func (h *MemberHandler) GetProfile(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	member, err := h.svc.GetProfile(c.Request.Context(), id)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toProfile(member))
}

// GetRegistrationCount handles GET /members/registration/count.
func (h *MemberHandler) GetRegistrationCount(c *gin.Context) {
	count, err := h.svc.CountPending(c.Request.Context())
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, countResponse{Count: count})
}

// ListRegistrations handles GET /members/registration.
func (h *MemberHandler) ListRegistrations(c *gin.Context) {
	regs, err := h.svc.ListPending(c.Request.Context())
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toRegistrationList(regs))
}

// ListMembers handles GET /members.
func (h *MemberHandler) ListMembers(c *gin.Context) {
	members, err := h.svc.ListMembers(c.Request.Context())
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, toMemberList(members))
}

type statusRequest struct {
	Action  string  `json:"action" binding:"required,oneof=APPROVE REJECT"`
	Remarks *string `json:"remarks"`
}

// SetStatus handles POST /members/{id}/status.
func (h *MemberHandler) SetStatus(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req statusRequest
	if !bindJSON(c, &req) {
		return
	}
	if err := h.svc.SetStatus(c.Request.Context(), id, service.StatusAction(req.Action), req.Remarks); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

type roleRequest struct {
	Role string `json:"role" binding:"required,oneof=ADMIN MEMBER"`
}

// UpdateRole handles POST /members/{id}.
func (h *MemberHandler) UpdateRole(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	var req roleRequest
	if !bindJSON(c, &req) {
		return
	}
	role := domain.Role(strings.ToLower(req.Role))
	if err := h.svc.UpdateRole(c.Request.Context(), id, role); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

// Delete handles DELETE /members/{id}.
func (h *MemberHandler) Delete(c *gin.Context) {
	id, ok := parseIDParam(c)
	if !ok {
		return
	}
	principal, ok := httpx.Principal(c)
	if !ok {
		httpx.AbortStatus(c, http.StatusUnauthorized, "unauthenticated")
		return
	}
	if err := h.svc.Delete(c.Request.Context(), principal, id); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
