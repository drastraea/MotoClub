package postgres

import (
	"context"
	"time"

	"github.com/edberto/motoclub-backend/db/sqlc"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
)

// EventRepo implements repository.EventRepository.
type EventRepo struct {
	q sqlc.Querier
}

func toDomainEvent(e sqlc.Event) domain.Event {
	return domain.Event{
		ID:            e.ID,
		Title:         e.Title,
		Description:   e.Description,
		Date:          e.EventDate,
		Location:      e.Location,
		IsPublic:      e.IsPublic,
		CreatedAt:     e.CreatedAt,
		LastUpdatedAt: e.LastUpdatedAt,
	}
}

// List returns events on or after startFrom (or all when startFrom is nil),
// restricted to public rows when publicOnly is set.
func (r *EventRepo) List(ctx context.Context, startFrom *time.Time, publicOnly bool) ([]domain.Event, error) {
	rows, err := r.q.ListEvents(ctx, sqlc.ListEventsParams{StartFrom: startFrom, PublicOnly: publicOnly})
	if err != nil {
		return nil, err
	}
	out := make([]domain.Event, 0, len(rows))
	for _, e := range rows {
		out = append(out, toDomainEvent(e))
	}
	return out, nil
}

// GetByID fetches an event by id (public rows only when publicOnly is set).
func (r *EventRepo) GetByID(ctx context.Context, id int64, publicOnly bool) (domain.Event, error) {
	e, err := r.q.GetEventByID(ctx, sqlc.GetEventByIDParams{ID: id, PublicOnly: publicOnly})
	if err != nil {
		return domain.Event{}, mapGetErr(err)
	}
	return toDomainEvent(e), nil
}

// Create inserts a new event.
func (r *EventRepo) Create(ctx context.Context, in repository.CreateEventInput) (domain.Event, error) {
	e, err := r.q.CreateEvent(ctx, sqlc.CreateEventParams{
		Title:       in.Title,
		Description: in.Description,
		EventDate:   in.Date,
		Location:    in.Location,
		IsPublic:    in.IsPublic,
	})
	if err != nil {
		return domain.Event{}, err
	}
	return toDomainEvent(e), nil
}

// Update modifies an existing event.
func (r *EventRepo) Update(ctx context.Context, in repository.UpdateEventInput) (domain.Event, error) {
	e, err := r.q.UpdateEvent(ctx, sqlc.UpdateEventParams{
		ID:          in.ID,
		Title:       in.Title,
		Description: in.Description,
		EventDate:   in.Date,
		Location:    in.Location,
		IsPublic:    in.IsPublic,
	})
	if err != nil {
		return domain.Event{}, mapGetErr(err)
	}
	return toDomainEvent(e), nil
}

// SoftDelete soft-deletes an event.
func (r *EventRepo) SoftDelete(ctx context.Context, id int64) error {
	return affected(r.q.SoftDeleteEvent(ctx, id))
}
