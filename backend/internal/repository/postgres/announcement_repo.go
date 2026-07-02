package postgres

import (
	"context"
	"time"

	"github.com/edberto/motoclub-backend/db/sqlc"
	"github.com/edberto/motoclub-backend/internal/domain"
)

// AnnouncementRepo implements repository.AnnouncementRepository.
type AnnouncementRepo struct {
	q sqlc.Querier
}

func toDomainAnnouncement(a sqlc.Announcement) domain.Announcement {
	return domain.Announcement{
		ID:            a.ID,
		Title:         a.Title,
		Description:   a.Description,
		CreatedAt:     a.CreatedAt,
		LastUpdatedAt: a.LastUpdatedAt,
	}
}

// List returns announcements created on or after startFrom (or all when nil).
func (r *AnnouncementRepo) List(ctx context.Context, startFrom *time.Time) ([]domain.Announcement, error) {
	rows, err := r.q.ListAnnouncements(ctx, startFrom)
	if err != nil {
		return nil, err
	}
	out := make([]domain.Announcement, 0, len(rows))
	for _, a := range rows {
		out = append(out, toDomainAnnouncement(a))
	}
	return out, nil
}

// Create inserts a new announcement.
func (r *AnnouncementRepo) Create(ctx context.Context, title, description string) (domain.Announcement, error) {
	a, err := r.q.CreateAnnouncement(ctx, sqlc.CreateAnnouncementParams{Title: title, Description: description})
	if err != nil {
		return domain.Announcement{}, err
	}
	return toDomainAnnouncement(a), nil
}

// Update modifies an existing announcement.
func (r *AnnouncementRepo) Update(ctx context.Context, id int64, title, description string) (domain.Announcement, error) {
	a, err := r.q.UpdateAnnouncement(ctx, sqlc.UpdateAnnouncementParams{ID: id, Title: title, Description: description})
	if err != nil {
		return domain.Announcement{}, mapGetErr(err)
	}
	return toDomainAnnouncement(a), nil
}

// SoftDelete soft-deletes an announcement.
func (r *AnnouncementRepo) SoftDelete(ctx context.Context, id int64) error {
	return affected(r.q.SoftDeleteAnnouncement(ctx, id))
}
