package postgres

import (
	"context"

	"github.com/edberto/motoclub-backend/db/sqlc"
	"github.com/edberto/motoclub-backend/internal/domain"
)

// GalleryRepo implements repository.GalleryRepository.
type GalleryRepo struct {
	q sqlc.Querier
}

func toDomainGallery(g sqlc.Gallery) domain.GalleryItem {
	return domain.GalleryItem{
		ID:        g.ID,
		Link:      g.Link,
		CreatedAt: g.CreatedAt,
	}
}

// List returns all gallery items.
func (r *GalleryRepo) List(ctx context.Context) ([]domain.GalleryItem, error) {
	rows, err := r.q.ListGallery(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]domain.GalleryItem, 0, len(rows))
	for _, g := range rows {
		out = append(out, toDomainGallery(g))
	}
	return out, nil
}

// Create inserts a new gallery item.
func (r *GalleryRepo) Create(ctx context.Context, link string) (domain.GalleryItem, error) {
	g, err := r.q.CreateGalleryItem(ctx, link)
	if err != nil {
		return domain.GalleryItem{}, err
	}
	return toDomainGallery(g), nil
}

// SoftDelete soft-deletes a gallery item.
func (r *GalleryRepo) SoftDelete(ctx context.Context, id int64) error {
	return affected(r.q.SoftDeleteGalleryItem(ctx, id))
}
