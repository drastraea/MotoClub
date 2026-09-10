package service

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/repository"
)

// SiteContentService implements editable landing-page content. The document is
// treated as an opaque JSON object; its shape is owned by the frontend.
type SiteContentService struct {
	repo repository.SiteContentRepository
}

// NewSiteContentService constructs a SiteContentService.
func NewSiteContentService(repo repository.SiteContentRepository) *SiteContentService {
	return &SiteContentService{repo: repo}
}

// Get returns the stored JSON document, or apperr.ErrNotFound if none has been
// saved yet (the frontend then falls back to its built-in defaults).
func (s *SiteContentService) Get(ctx context.Context) ([]byte, error) {
	return s.repo.Get(ctx)
}

// Update replaces the content document. The body must be a JSON object.
func (s *SiteContentService) Update(ctx context.Context, data []byte) error {
	var obj map[string]json.RawMessage
	if err := json.Unmarshal(data, &obj); err != nil {
		return fmt.Errorf("%w: body must be a JSON object", apperr.ErrValidation)
	}
	return s.repo.Upsert(ctx, data)
}
