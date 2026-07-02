package service

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
	repomocks "github.com/edberto/motoclub-backend/internal/repository/mocks"
)

func TestEventService(t *testing.T) {
	loc := "track"
	from := time.Now()

	events := repomocks.NewMockEventRepository(t)
	events.On("List", mock.Anything, &from).Return([]domain.Event{{ID: 1}}, nil)
	events.On("GetByID", mock.Anything, int64(1)).Return(domain.Event{ID: 1}, nil)
	events.On("Create", mock.Anything, mock.MatchedBy(func(in repository.CreateEventInput) bool {
		return in.Title == "t" && in.Location == &loc
	})).Return(domain.Event{ID: 2}, nil)
	events.On("Update", mock.Anything, mock.MatchedBy(func(in repository.UpdateEventInput) bool {
		return in.ID == 3 && in.Description == "d"
	})).Return(domain.Event{ID: 3}, nil)
	events.On("SoftDelete", mock.Anything, int64(4)).Return(nil)

	s := NewEventService(events)

	list, err := s.List(context.Background(), &from)
	require.NoError(t, err)
	assert.Len(t, list, 1)

	got, err := s.Get(context.Background(), 1)
	require.NoError(t, err)
	assert.Equal(t, int64(1), got.ID)

	created, err := s.Create(context.Background(), EventInput{Title: "t", Location: &loc})
	require.NoError(t, err)
	assert.Equal(t, int64(2), created.ID)

	updated, err := s.Update(context.Background(), 3, EventInput{Description: "d"})
	require.NoError(t, err)
	assert.Equal(t, int64(3), updated.ID)

	assert.NoError(t, s.Delete(context.Background(), 4))
}

func TestAnnouncementService(t *testing.T) {
	ann := repomocks.NewMockAnnouncementRepository(t)
	ann.On("List", mock.Anything, (*time.Time)(nil)).Return([]domain.Announcement{{ID: 1}}, nil)
	ann.On("Create", mock.Anything, "t", "d").Return(domain.Announcement{ID: 2}, nil)
	ann.On("Update", mock.Anything, int64(3), "t2", "d2").Return(domain.Announcement{ID: 3}, nil)
	ann.On("SoftDelete", mock.Anything, int64(4)).Return(nil)

	s := NewAnnouncementService(ann)

	list, err := s.List(context.Background(), nil)
	require.NoError(t, err)
	assert.Len(t, list, 1)

	created, err := s.Create(context.Background(), "t", "d")
	require.NoError(t, err)
	assert.Equal(t, int64(2), created.ID)

	updated, err := s.Update(context.Background(), 3, "t2", "d2")
	require.NoError(t, err)
	assert.Equal(t, int64(3), updated.ID)

	assert.NoError(t, s.Delete(context.Background(), 4))
}

func TestGalleryService(t *testing.T) {
	gal := repomocks.NewMockGalleryRepository(t)
	gal.On("List", mock.Anything).Return([]domain.GalleryItem{{ID: 1}}, nil)
	gal.On("Create", mock.Anything, "http://x").Return(domain.GalleryItem{ID: 2}, nil)
	gal.On("SoftDelete", mock.Anything, int64(3)).Return(nil)

	s := NewGalleryService(gal)

	list, err := s.List(context.Background())
	require.NoError(t, err)
	assert.Len(t, list, 1)

	created, err := s.Create(context.Background(), "http://x")
	require.NoError(t, err)
	assert.Equal(t, int64(2), created.ID)

	assert.NoError(t, s.Delete(context.Background(), 3))
}
