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

// List returns all gallery items (public rows only when publicOnly is set).
func (s *GalleryService) List(ctx context.Context, publicOnly bool) ([]domain.GalleryItem, error) {
	return s.gallery.List(ctx, publicOnly)
}

// Create adds a new gallery item.
func (s *GalleryService) Create(ctx context.Context, link string, isPublic bool) (domain.GalleryItem, error) {
	return s.gallery.Create(ctx, link, isPublic)
}

// Update sets the public visibility of a gallery item.
func (s *GalleryService) Update(ctx context.Context, id int64, isPublic bool) (domain.GalleryItem, error) {
	return s.gallery.Update(ctx, id, isPublic)
}

// Delete soft-deletes a gallery item.
func (s *GalleryService) Delete(ctx context.Context, id int64) error {
	return s.gallery.SoftDelete(ctx, id)
}
