package handler

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/service"
	svcmocks "github.com/edberto/motoclub-backend/internal/service/mocks"
)

// --- Events ---

func TestEventList(t *testing.T) {
	t.Run("bad startFrom", func(t *testing.T) {
		c, w := ctxJSON(http.MethodGet, "/events?startFrom=nope", "")
		NewEventHandler(svcmocks.NewMockEventServicer(t)).List(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("List", mock.Anything, mock.Anything).Return(nil, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/events", "")
		NewEventHandler(svc).List(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success with filter", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("List", mock.Anything, mock.Anything).Return([]domain.Event{{ID: 1, Title: "t"}}, nil)
		c, w := ctxJSON(http.MethodGet, "/events?startFrom=2026-01-01", "")
		NewEventHandler(svc).List(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"id":"1"`)
	})
}

func TestEventGet(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodGet, "/event/x", "")
		setParam(c, "id", "x")
		NewEventHandler(svcmocks.NewMockEventServicer(t)).Get(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("not found", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Get", mock.Anything, int64(1)).Return(domain.Event{}, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/event/1", "")
		setParam(c, "id", "1")
		NewEventHandler(svc).Get(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Get", mock.Anything, int64(1)).Return(domain.Event{ID: 1, Title: "t", Description: "d"}, nil)
		c, w := ctxJSON(http.MethodGet, "/event/1", "")
		setParam(c, "id", "1")
		NewEventHandler(svc).Get(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"description":"d"`)
	})
}

const validEventBody = `{"title":"t","description":"d","date":"2026-05-01","location":"track"}`

func TestEventCreate(t *testing.T) {
	t.Run("bind error", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/events", `{"title":"t"}`)
		NewEventHandler(svcmocks.NewMockEventServicer(t)).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bad date", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/events", `{"title":"t","description":"d","date":"nope"}`)
		NewEventHandler(svcmocks.NewMockEventServicer(t)).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Create", mock.Anything, mock.Anything).Return(domain.Event{}, apperr.ErrValidation)
		c, w := ctxJSON(http.MethodPost, "/events", validEventBody)
		NewEventHandler(svc).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Create", mock.Anything, mock.MatchedBy(func(in service.EventInput) bool {
			return in.Title == "t" && in.Location != nil && *in.Location == "track" && in.Date.Year() == 2026
		})).Return(domain.Event{ID: 9}, nil)
		c, w := ctxJSON(http.MethodPost, "/events", validEventBody)
		NewEventHandler(svc).Create(c)
		assert.Equal(t, http.StatusCreated, w.Code)
		assert.JSONEq(t, `{"id":"9"}`, w.Body.String())
	})
}

func TestEventUpdate(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPut, "/events/x", validEventBody)
		setParam(c, "id", "x")
		NewEventHandler(svcmocks.NewMockEventServicer(t)).Update(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bind error", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPut, "/events/1", `{}`)
		setParam(c, "id", "1")
		NewEventHandler(svcmocks.NewMockEventServicer(t)).Update(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bad date", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPut, "/events/1", `{"title":"t","description":"d","date":"nope"}`)
		setParam(c, "id", "1")
		NewEventHandler(svcmocks.NewMockEventServicer(t)).Update(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Update", mock.Anything, int64(1), mock.Anything).Return(domain.Event{}, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodPut, "/events/1", validEventBody)
		setParam(c, "id", "1")
		NewEventHandler(svc).Update(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Update", mock.Anything, int64(1), mock.Anything).Return(domain.Event{ID: 1}, nil)
		c, _ := ctxJSON(http.MethodPut, "/events/1", validEventBody)
		setParam(c, "id", "1")
		NewEventHandler(svc).Update(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}

func TestEventDelete(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodDelete, "/events/x", "")
		setParam(c, "id", "x")
		NewEventHandler(svcmocks.NewMockEventServicer(t)).Delete(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Delete", mock.Anything, int64(1)).Return(apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodDelete, "/events/1", "")
		setParam(c, "id", "1")
		NewEventHandler(svc).Delete(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockEventServicer(t)
		svc.On("Delete", mock.Anything, int64(1)).Return(nil)
		c, _ := ctxJSON(http.MethodDelete, "/events/1", "")
		setParam(c, "id", "1")
		NewEventHandler(svc).Delete(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}

// --- Announcements ---

func TestAnnouncementList(t *testing.T) {
	t.Run("bad startFrom", func(t *testing.T) {
		c, w := ctxJSON(http.MethodGet, "/announcements?startFrom=nope", "")
		NewAnnouncementHandler(svcmocks.NewMockAnnouncementServicer(t)).List(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("List", mock.Anything, mock.Anything).Return(nil, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/announcements", "")
		NewAnnouncementHandler(svc).List(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("List", mock.Anything, mock.Anything).Return([]domain.Announcement{{ID: 1, Title: "t"}}, nil)
		c, w := ctxJSON(http.MethodGet, "/announcements", "")
		NewAnnouncementHandler(svc).List(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"announcements"`)
	})
}

func TestAnnouncementCreate(t *testing.T) {
	t.Run("bind error", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/announcements", `{"title":"t"}`)
		NewAnnouncementHandler(svcmocks.NewMockAnnouncementServicer(t)).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("Create", mock.Anything, "t", "d").Return(domain.Announcement{}, apperr.ErrValidation)
		c, w := ctxJSON(http.MethodPost, "/announcements", `{"title":"t","description":"d"}`)
		NewAnnouncementHandler(svc).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("Create", mock.Anything, "t", "d").Return(domain.Announcement{ID: 5}, nil)
		c, w := ctxJSON(http.MethodPost, "/announcements", `{"title":"t","description":"d"}`)
		NewAnnouncementHandler(svc).Create(c)
		assert.Equal(t, http.StatusCreated, w.Code)
		assert.JSONEq(t, `{"id":"5"}`, w.Body.String())
	})
}

func TestAnnouncementUpdate(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPut, "/announcements/x", `{"title":"t","description":"d"}`)
		setParam(c, "id", "x")
		NewAnnouncementHandler(svcmocks.NewMockAnnouncementServicer(t)).Update(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bind error", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPut, "/announcements/1", `{}`)
		setParam(c, "id", "1")
		NewAnnouncementHandler(svcmocks.NewMockAnnouncementServicer(t)).Update(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("Update", mock.Anything, int64(1), "t", "d").Return(domain.Announcement{}, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodPut, "/announcements/1", `{"title":"t","description":"d"}`)
		setParam(c, "id", "1")
		NewAnnouncementHandler(svc).Update(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("Update", mock.Anything, int64(1), "t", "d").Return(domain.Announcement{ID: 1}, nil)
		c, _ := ctxJSON(http.MethodPut, "/announcements/1", `{"title":"t","description":"d"}`)
		setParam(c, "id", "1")
		NewAnnouncementHandler(svc).Update(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}

func TestAnnouncementDelete(t *testing.T) {
	t.Run("bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodDelete, "/announcements/x", "")
		setParam(c, "id", "x")
		NewAnnouncementHandler(svcmocks.NewMockAnnouncementServicer(t)).Delete(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("Delete", mock.Anything, int64(1)).Return(apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodDelete, "/announcements/1", "")
		setParam(c, "id", "1")
		NewAnnouncementHandler(svc).Delete(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAnnouncementServicer(t)
		svc.On("Delete", mock.Anything, int64(1)).Return(nil)
		c, _ := ctxJSON(http.MethodDelete, "/announcements/1", "")
		setParam(c, "id", "1")
		NewAnnouncementHandler(svc).Delete(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}

// --- Gallery ---

func TestGallery(t *testing.T) {
	t.Run("list error", func(t *testing.T) {
		svc := svcmocks.NewMockGalleryServicer(t)
		svc.On("List", mock.Anything).Return(nil, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/gallery", "")
		NewGalleryHandler(svc).List(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("list success", func(t *testing.T) {
		svc := svcmocks.NewMockGalleryServicer(t)
		svc.On("List", mock.Anything).Return([]domain.GalleryItem{{ID: 1, Link: "http://x"}}, nil)
		c, w := ctxJSON(http.MethodGet, "/gallery", "")
		NewGalleryHandler(svc).List(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"link":"http://x"`)
	})
	t.Run("create bind error", func(t *testing.T) {
		c, w := ctxJSON(http.MethodPost, "/gallery", `{}`)
		NewGalleryHandler(svcmocks.NewMockGalleryServicer(t)).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("create service error", func(t *testing.T) {
		svc := svcmocks.NewMockGalleryServicer(t)
		svc.On("Create", mock.Anything, "http://x").Return(domain.GalleryItem{}, apperr.ErrValidation)
		c, w := ctxJSON(http.MethodPost, "/gallery", `{"link":"http://x"}`)
		NewGalleryHandler(svc).Create(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("create success", func(t *testing.T) {
		svc := svcmocks.NewMockGalleryServicer(t)
		svc.On("Create", mock.Anything, "http://x").Return(domain.GalleryItem{ID: 8}, nil)
		c, w := ctxJSON(http.MethodPost, "/gallery", `{"link":"http://x"}`)
		NewGalleryHandler(svc).Create(c)
		assert.Equal(t, http.StatusCreated, w.Code)
		assert.JSONEq(t, `{"id":"8"}`, w.Body.String())
	})
	t.Run("delete bad id", func(t *testing.T) {
		c, w := ctxJSON(http.MethodDelete, "/gallery/x", "")
		setParam(c, "id", "x")
		NewGalleryHandler(svcmocks.NewMockGalleryServicer(t)).Delete(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("delete service error", func(t *testing.T) {
		svc := svcmocks.NewMockGalleryServicer(t)
		svc.On("Delete", mock.Anything, int64(1)).Return(apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodDelete, "/gallery/1", "")
		setParam(c, "id", "1")
		NewGalleryHandler(svc).Delete(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
	t.Run("delete success", func(t *testing.T) {
		svc := svcmocks.NewMockGalleryServicer(t)
		svc.On("Delete", mock.Anything, int64(1)).Return(nil)
		c, _ := ctxJSON(http.MethodDelete, "/gallery/1", "")
		setParam(c, "id", "1")
		NewGalleryHandler(svc).Delete(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}
