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

// List returns announcements created on or after startFrom (nil = all).
func (s *AnnouncementService) List(ctx context.Context, startFrom *time.Time) ([]domain.Announcement, error) {
	return s.announcements.List(ctx, startFrom)
}

// Create adds a new announcement.
func (s *AnnouncementService) Create(ctx context.Context, title, description string) (domain.Announcement, error) {
	return s.announcements.Create(ctx, title, description)
}

// Update modifies an existing announcement.
func (s *AnnouncementService) Update(ctx context.Context, id int64, title, description string) (domain.Announcement, error) {
	return s.announcements.Update(ctx, id, title, description)
}

// Delete soft-deletes an announcement.
func (s *AnnouncementService) Delete(ctx context.Context, id int64) error {
	return s.announcements.SoftDelete(ctx, id)
}
