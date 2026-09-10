package service

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/edberto/motoclub-backend/internal/apperr"
	repomocks "github.com/edberto/motoclub-backend/internal/repository/mocks"
)

func TestSiteContentService_Get(t *testing.T) {
	t.Run("returns stored document", func(t *testing.T) {
		repo := repomocks.NewMockSiteContentRepository(t)
		repo.On("Get", mock.Anything).Return([]byte(`{"hero":{}}`), nil)
		s := NewSiteContentService(repo)
		got, err := s.Get(context.Background())
		require.NoError(t, err)
		assert.JSONEq(t, `{"hero":{}}`, string(got))
	})

	t.Run("propagates not found", func(t *testing.T) {
		repo := repomocks.NewMockSiteContentRepository(t)
		repo.On("Get", mock.Anything).Return(nil, apperr.ErrNotFound)
		s := NewSiteContentService(repo)
		_, err := s.Get(context.Background())
		assert.ErrorIs(t, err, apperr.ErrNotFound)
	})
}

func TestSiteContentService_Update(t *testing.T) {
	t.Run("stores a JSON object", func(t *testing.T) {
		repo := repomocks.NewMockSiteContentRepository(t)
		body := []byte(`{"hero":{"eyebrow":"x"}}`)
		repo.On("Upsert", mock.Anything, body).Return(nil)
		s := NewSiteContentService(repo)
		assert.NoError(t, s.Update(context.Background(), body))
	})

	t.Run("rejects non-JSON", func(t *testing.T) {
		s := NewSiteContentService(repomocks.NewMockSiteContentRepository(t))
		assert.ErrorIs(t, s.Update(context.Background(), []byte("not json")), apperr.ErrValidation)
	})

	t.Run("rejects a JSON array", func(t *testing.T) {
		s := NewSiteContentService(repomocks.NewMockSiteContentRepository(t))
		assert.ErrorIs(t, s.Update(context.Background(), []byte(`[1,2,3]`)), apperr.ErrValidation)
	})

	t.Run("propagates repo error", func(t *testing.T) {
		repo := repomocks.NewMockSiteContentRepository(t)
		repo.On("Upsert", mock.Anything, mock.Anything).Return(errBoom)
		s := NewSiteContentService(repo)
		assert.ErrorIs(t, s.Update(context.Background(), []byte(`{}`)), errBoom)
	})
}
