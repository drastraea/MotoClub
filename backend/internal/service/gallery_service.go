package service

import (
	"context"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
)

// GalleryService implements gallery management.
type GalleryService struct {
	gallery repository.GalleryRepository
}

// NewGalleryService constructs a GalleryService.
func NewGalleryService(gallery repository.GalleryRepository) *GalleryService {
	return &GalleryService{gallery: gallery}
}

// List returns all gallery items.
func (s *GalleryService) List(ctx context.Context) ([]domain.GalleryItem, error) {
	return s.gallery.List(ctx)
}

// Create adds a new gallery item.
func (s *GalleryService) Create(ctx context.Context, link string) (domain.GalleryItem, error) {
	return s.gallery.Create(ctx, link)
}

// Delete soft-deletes a gallery item.
func (s *GalleryService) Delete(ctx context.Context, id int64) error {
	return s.gallery.SoftDelete(ctx, id)
}
