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
	events.On("List", mock.Anything, &from, true).Return([]domain.Event{{ID: 1}}, nil)
	events.On("GetByID", mock.Anything, int64(1), false).Return(domain.Event{ID: 1}, nil)
	events.On("Create", mock.Anything, mock.MatchedBy(func(in repository.CreateEventInput) bool {
		return in.Title == "t" && in.Location == &loc && in.IsPublic
	})).Return(domain.Event{ID: 2}, nil)
	events.On("Update", mock.Anything, mock.MatchedBy(func(in repository.UpdateEventInput) bool {
		return in.ID == 3 && in.Description == "d"
	})).Return(domain.Event{ID: 3}, nil)
	events.On("SoftDelete", mock.Anything, int64(4)).Return(nil)

	s := NewEventService(events)

	list, err := s.List(context.Background(), &from, true)
	require.NoError(t, err)
	assert.Len(t, list, 1)

	got, err := s.Get(context.Background(), 1, false)
	require.NoError(t, err)
	assert.Equal(t, int64(1), got.ID)

	created, err := s.Create(context.Background(), EventInput{Title: "t", Location: &loc, IsPublic: true})
	require.NoError(t, err)
	assert.Equal(t, int64(2), created.ID)

	updated, err := s.Update(context.Background(), 3, EventInput{Description: "d"})
	require.NoError(t, err)
	assert.Equal(t, int64(3), updated.ID)

	assert.NoError(t, s.Delete(context.Background(), 4))
}

func TestAnnouncementService(t *testing.T) {
	ann := repomocks.NewMockAnnouncementRepository(t)
	ann.On("List", mock.Anything, (*time.Time)(nil), true).Return([]domain.Announcement{{ID: 1}}, nil)
	ann.On("Create", mock.Anything, "t", "d", true).Return(domain.Announcement{ID: 2}, nil)
	ann.On("Update", mock.Anything, int64(3), "t2", "d2", false).Return(domain.Announcement{ID: 3}, nil)
	ann.On("SoftDelete", mock.Anything, int64(4)).Return(nil)

	s := NewAnnouncementService(ann)

	list, err := s.List(context.Background(), nil, true)
	require.NoError(t, err)
	assert.Len(t, list, 1)

	created, err := s.Create(context.Background(), "t", "d", true)
	require.NoError(t, err)
	assert.Equal(t, int64(2), created.ID)

	updated, err := s.Update(context.Background(), 3, "t2", "d2", false)
	require.NoError(t, err)
	assert.Equal(t, int64(3), updated.ID)

	assert.NoError(t, s.Delete(context.Background(), 4))
}

func TestGalleryService(t *testing.T) {
	gal := repomocks.NewMockGalleryRepository(t)
	gal.On("List", mock.Anything, true).Return([]domain.GalleryItem{{ID: 1}}, nil)
	gal.On("Create", mock.Anything, "http://x", true).Return(domain.GalleryItem{ID: 2}, nil)
	gal.On("Update", mock.Anything, int64(5), false).Return(domain.GalleryItem{ID: 5}, nil)
	gal.On("SoftDelete", mock.Anything, int64(3)).Return(nil)

	s := NewGalleryService(gal)

	list, err := s.List(context.Background(), true)
	require.NoError(t, err)
	assert.Len(t, list, 1)

	created, err := s.Create(context.Background(), "http://x", true)
	require.NoError(t, err)
	assert.Equal(t, int64(2), created.ID)

	updated, err := s.Update(context.Background(), 5, false)
	require.NoError(t, err)
	assert.Equal(t, int64(5), updated.ID)

	assert.NoError(t, s.Delete(context.Background(), 3))
}
