package service

import (
	"context"
	"time"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
)

// AnnouncementService implements announcement management.
type AnnouncementService struct {
	announcements repository.AnnouncementRepository
}

// NewAnnouncementService constructs an AnnouncementService.
func NewAnnouncementService(announcements repository.AnnouncementRepository) *AnnouncementService {
	return &AnnouncementService{announcements: announcements}
}

// List returns announcements created on or after startFrom (nil = all),
// restricted to public rows when publicOnly is set.
func (s *AnnouncementService) List(ctx context.Context, startFrom *time.Time, publicOnly bool) ([]domain.Announcement, error) {
	return s.announcements.List(ctx, startFrom, publicOnly)
}

// Count returns the total number of announcements.
func (s *AnnouncementService) Count(ctx context.Context) (int64, error) {
	return s.announcements.Count(ctx)
}

// Create adds a new announcement.
func (s *AnnouncementService) Create(ctx context.Context, title, description string, isPublic bool) (domain.Announcement, error) {
	return s.announcements.Create(ctx, title, description, isPublic)
}

// Update modifies an existing announcement.
func (s *AnnouncementService) Update(ctx context.Context, id int64, title, description string, isPublic bool) (domain.Announcement, error) {
	return s.announcements.Update(ctx, id, title, description, isPublic)
}

// Delete soft-deletes an announcement.
func (s *AnnouncementService) Delete(ctx context.Context, id int64) error {
	return s.announcements.SoftDelete(ctx, id)
}
