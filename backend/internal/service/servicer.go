package service

import (
	"context"
	"time"

	"github.com/edberto/motoclub-backend/internal/domain"
)

// The Servicer interfaces are what the handler layer depends on, so handlers
// can be unit-tested against mocks. The concrete *XService types implement them.

// AuthServicer is the auth-facing behaviour used by handlers.
type AuthServicer interface {
	Register(ctx context.Context, in RegisterInput) (domain.Member, error)
	Login(ctx context.Context, email, googleToken string) (LoginResult, error)
	Logout(ctx context.Context, principal domain.Principal) error
}

// MemberServicer is the member-facing behaviour used by handlers.
type MemberServicer interface {
	GetProfile(ctx context.Context, id int64) (domain.Member, error)
	CountPending(ctx context.Context) (int64, error)
	ListPending(ctx context.Context) ([]domain.Registration, error)
	ListMembers(ctx context.Context) ([]domain.Member, error)
	SetStatus(ctx context.Context, id int64, action StatusAction, remarks *string) error
	UpdateRole(ctx context.Context, id int64, role domain.Role) error
	Delete(ctx context.Context, actor domain.Principal, targetID int64) error
}

// EventServicer is the event-facing behaviour used by handlers.
type EventServicer interface {
	List(ctx context.Context, startFrom *time.Time) ([]domain.Event, error)
	Get(ctx context.Context, id int64) (domain.Event, error)
	Create(ctx context.Context, in EventInput) (domain.Event, error)
	Update(ctx context.Context, id int64, in EventInput) (domain.Event, error)
	Delete(ctx context.Context, id int64) error
}

// AnnouncementServicer is the announcement-facing behaviour used by handlers.
type AnnouncementServicer interface {
	List(ctx context.Context, startFrom *time.Time) ([]domain.Announcement, error)
	Create(ctx context.Context, title, description string) (domain.Announcement, error)
	Update(ctx context.Context, id int64, title, description string) (domain.Announcement, error)
	Delete(ctx context.Context, id int64) error
}

// GalleryServicer is the gallery-facing behaviour used by handlers.
type GalleryServicer interface {
	List(ctx context.Context) ([]domain.GalleryItem, error)
	Create(ctx context.Context, link string) (domain.GalleryItem, error)
	Delete(ctx context.Context, id int64) error
}

var (
	_ AuthServicer         = (*AuthService)(nil)
	_ MemberServicer       = (*MemberService)(nil)
	_ EventServicer        = (*EventService)(nil)
	_ AnnouncementServicer = (*AnnouncementService)(nil)
	_ GalleryServicer      = (*GalleryService)(nil)
)
