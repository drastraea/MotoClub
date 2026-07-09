package handler

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
	svcmocks "github.com/edberto/motoclub-backend/internal/service/mocks"
)

func TestGetProfile(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodGet, "/members/x/profile", "")
		setParam(c, "id", "x")
		NewMemberHandler(svcmocks.NewMockMemberServicer(t)).GetProfile(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("not found", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("GetProfile", mock.Anything, int64(1)).Return(domain.Member{}, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/members/1/profile", "")
		setParam(c, "id", "1")
		NewMemberHandler(svc).GetProfile(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("GetProfile", mock.Anything, int64(1)).Return(domain.Member{ID: 1, Email: "a@b.com", Status: domain.StatusApproved}, nil)
		c, w := ctxJSON(http.MethodGet, "/members/1/profile", "")
		setParam(c, "id", "1")
		NewMemberHandler(svc).GetProfile(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"email":"a@b.com"`)
	})
}

func TestRegistrationCountAndLists(t *testing.T) {
	t.Run("count error", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("CountPending", mock.Anything).Return(int64(0), apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/members/registration/count", "")
		NewMemberHandler(svc).GetRegistrationCount(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("count success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("CountPending", mock.Anything).Return(int64(5), nil)
		c, w := ctxJSON(http.MethodGet, "/members/registration/count", "")
		NewMemberHandler(svc).GetRegistrationCount(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.JSONEq(t, `{"count":5}`, w.Body.String())
	})
	t.Run("total count error", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("CountMembers", mock.Anything).Return(int64(0), apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/members/count", "")
		NewMemberHandler(svc).GetCount(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("total count success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("CountMembers", mock.Anything).Return(int64(12), nil)
		c, w := ctxJSON(http.MethodGet, "/members/count", "")
		NewMemberHandler(svc).GetCount(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.JSONEq(t, `{"count":12}`, w.Body.String())
	})
	t.Run("registrations error", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("ListPending", mock.Anything).Return(nil, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/members/registration", "")
		NewMemberHandler(svc).ListRegistrations(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("registrations success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("ListPending", mock.Anything).Return([]domain.Registration{{MemberID: 1, Email: "a@b.com"}}, nil)
		c, w := ctxJSON(http.MethodGet, "/members/registration", "")
		NewMemberHandler(svc).ListRegistrations(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"member_id":"1"`)
	})
	t.Run("members error", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("ListMembers", mock.Anything).Return(nil, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/members", "")
		NewMemberHandler(svc).ListMembers(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("members success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("ListMembers", mock.Anything).Return([]domain.Member{{ID: 1, Email: "a@b.com", Role: domain.RoleMember}}, nil)
		c, w := ctxJSON(http.MethodGet, "/members", "")
		NewMemberHandler(svc).ListMembers(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"role":"member"`)
	})
}

func TestSetStatus(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/members/x/status", `{"action":"APPROVE"}`)
		setParam(c, "id", "x")
		NewMemberHandler(svcmocks.NewMockMemberServicer(t)).SetStatus(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bind error", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/members/1/status", `{"action":"MAYBE"}`)
		setParam(c, "id", "1")
		NewMemberHandler(svcmocks.NewMockMemberServicer(t)).SetStatus(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("SetStatus", mock.Anything, int64(1), service.ActionApprove, mock.Anything).Return(apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodPost, "/members/1/status", `{"action":"APPROVE"}`)
		setParam(c, "id", "1")
		NewMemberHandler(svc).SetStatus(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("SetStatus", mock.Anything, int64(1), service.ActionReject, mock.Anything).Return(nil)
		c, _ := ctxJSON(http.MethodPost, "/members/1/status", `{"action":"REJECT","remarks":"no"}`)
		setParam(c, "id", "1")
		NewMemberHandler(svc).SetStatus(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}

func TestUpdateRole(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/members/x", `{"role":"ADMIN"}`)
		setParam(c, "id", "x")
		NewMemberHandler(svcmocks.NewMockMemberServicer(t)).UpdateRole(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bind error", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/members/1", `{"role":"KING"}`)
		setParam(c, "id", "1")
		NewMemberHandler(svcmocks.NewMockMemberServicer(t)).UpdateRole(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("UpdateRole", mock.Anything, int64(1), domain.RoleAdmin).Return(apperr.ErrValidation)
		c, w := ctxJSON(http.MethodPost, "/members/1", `{"role":"ADMIN"}`)
		setParam(c, "id", "1")
		NewMemberHandler(svc).UpdateRole(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("UpdateRole", mock.Anything, int64(1), domain.RoleMember).Return(nil)
		c, _ := ctxJSON(http.MethodPost, "/members/1", `{"role":"MEMBER"}`)
		setParam(c, "id", "1")
		NewMemberHandler(svc).UpdateRole(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}

func TestDeleteMember(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodDelete, "/members/x", "")
		setParam(c, "id", "x")
		NewMemberHandler(svcmocks.NewMockMemberServicer(t)).Delete(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("unauthenticated", func(t *testing.T) {
		c, w := ctxJSON(http.MethodDelete, "/members/1", "")
		setParam(c, "id", "1")
		NewMemberHandler(svcmocks.NewMockMemberServicer(t)).Delete(c)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("Delete", mock.Anything, mock.Anything, int64(2)).Return(apperr.ErrForbidden)
		c, w := ctxJSON(http.MethodDelete, "/members/2", "")
		setParam(c, "id", "2")
		httpx.SetPrincipal(c, domain.Principal{ID: 1, Role: domain.RoleAdmin})
		NewMemberHandler(svc).Delete(c)
		assert.Equal(t, http.StatusForbidden, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockMemberServicer(t)
		svc.On("Delete", mock.Anything, mock.Anything, int64(2)).Return(nil)
		c, _ := ctxJSON(http.MethodDelete, "/members/2", "")
		setParam(c, "id", "2")
		httpx.SetPrincipal(c, domain.Principal{ID: 1, Role: domain.RoleSuperadmin})
		NewMemberHandler(svc).Delete(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}
