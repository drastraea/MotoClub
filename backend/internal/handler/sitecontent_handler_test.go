package handler

import (
	"net/http"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/edberto/motoclub-backend/internal/apperr"
	svcmocks "github.com/edberto/motoclub-backend/internal/service/mocks"
)

func TestSiteContentGet(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockSiteContentServicer(t)
		svc.On("Get", mock.Anything).Return([]byte(`{"hero":{"eyebrow":"x"}}`), nil)
		c, w := ctxJSON(http.MethodGet, "/site-content", "")
		NewSiteContentHandler(svc).Get(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.JSONEq(t, `{"hero":{"eyebrow":"x"}}`, w.Body.String())
	})

	t.Run("not found", func(t *testing.T) {
		svc := svcmocks.NewMockSiteContentServicer(t)
		svc.On("Get", mock.Anything).Return(nil, apperr.ErrNotFound)
		c, w := ctxJSON(http.MethodGet, "/site-content", "")
		NewSiteContentHandler(svc).Get(c)
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}

func TestSiteContentUpdate(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockSiteContentServicer(t)
		svc.On("Update", mock.Anything, mock.Anything).Return(nil)
		c, _ := ctxJSON(http.MethodPut, "/site-content", `{"hero":{}}`)
		NewSiteContentHandler(svc).Update(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})

	t.Run("validation error", func(t *testing.T) {
		svc := svcmocks.NewMockSiteContentServicer(t)
		svc.On("Update", mock.Anything, mock.Anything).Return(apperr.ErrValidation)
		c, w := ctxJSON(http.MethodPut, "/site-content", `not json`)
		NewSiteContentHandler(svc).Update(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	t.Run("body too large", func(t *testing.T) {
		svc := svcmocks.NewMockSiteContentServicer(t)
		c, w := ctxJSON(http.MethodPut, "/site-content", strings.Repeat("a", (1<<20)+16))
		NewSiteContentHandler(svc).Update(c)
		assert.Equal(t, http.StatusRequestEntityTooLarge, w.Code)
	})
}
