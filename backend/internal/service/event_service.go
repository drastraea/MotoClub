package service

import (
	"context"
	"time"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
)

// EventInput carries the mutable fields of an event.
type EventInput struct {
	Title       string
	Description string
	Date        time.Time
	Location    *string
}

// EventService implements event management.
type EventService struct {
	events repository.EventRepository
}

// NewEventService constructs an EventService.
func NewEventService(events repository.EventRepository) *EventService {
	return &EventService{events: events}
}

// List returns events on or after startFrom (nil = all).
func (s *EventService) List(ctx context.Context, startFrom *time.Time) ([]domain.Event, error) {
	return s.events.List(ctx, startFrom)
}

// Get returns a single event by id.
func (s *EventService) Get(ctx context.Context, id int64) (domain.Event, error) {
	return s.events.GetByID(ctx, id)
}

// Create adds a new event.
func (s *EventService) Create(ctx context.Context, in EventInput) (domain.Event, error) {
	return s.events.Create(ctx, repository.CreateEventInput{
		Title:       in.Title,
		Description: in.Description,
		Date:        in.Date,
		Location:    in.Location,
	})
}

// Update modifies an existing event.
func (s *EventService) Update(ctx context.Context, id int64, in EventInput) (domain.Event, error) {
	return s.events.Update(ctx, repository.UpdateEventInput{
		ID:          id,
		Title:       in.Title,
		Description: in.Description,
		Date:        in.Date,
		Location:    in.Location,
	})
}

// Delete soft-deletes an event.
func (s *EventService) Delete(ctx context.Context, id int64) error {
	return s.events.SoftDelete(ctx, id)
}
