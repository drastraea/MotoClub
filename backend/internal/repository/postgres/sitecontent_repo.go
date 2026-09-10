package postgres

import (
	"context"

	"github.com/edberto/motoclub-backend/db/sqlc"
)

// SiteContentRepo implements repository.SiteContentRepository.
type SiteContentRepo struct {
	q sqlc.Querier
}

// Get returns the raw JSON document, or apperr.ErrNotFound if it has never been
// written.
func (r *SiteContentRepo) Get(ctx context.Context) ([]byte, error) {
	data, err := r.q.GetSiteContent(ctx)
	if err != nil {
		return nil, mapGetErr(err)
	}
	return data, nil
}

// Upsert replaces the single content document.
func (r *SiteContentRepo) Upsert(ctx context.Context, data []byte) error {
	return r.q.UpsertSiteContent(ctx, data)
}
