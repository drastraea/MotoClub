// Package repository declares the persistence interfaces the service layer
// depends on. Concrete implementations live in the postgres subpackage; this
// package is intentionally free of any database-specific types so services and
// their tests never import sqlc/pgx.
package repository

import (
	"context"
	"time"

	"github.com/edberto/motoclub-backend/internal/domain"
)

// CreateMemberInput carries the fields required to register a new member.
type CreateMemberInput struct {
	GoogleSub                   string
	Email                       string
	Name                        string
	PhoneNumber                 string
	PlaceOfBirth                string
	DateOfBirth                 time.Time
	Address                     string
	InstagramUsername           string
	BloodType                   string
	EmergencyContactName        string
	EmergencyContactPhoneNumber string
	MotorbikeName               string
	MotorbikeSelfieLinkPath     string
}

// UpdateStatusInput carries an approve/reject decision (and the resulting role).
type UpdateStatusInput struct {
	ID         int64
	Status     domain.Status
	Remarks    *string
	ApprovedAt *time.Time
	Role       domain.Role
}

// CreateEventInput carries the fields for creating an event.
type CreateEventInput struct {
	Title       string
	Description string
	Date        time.Time
	Location    *string
	IsPublic    bool
}

// UpdateEventInput carries the fields for updating an event.
type UpdateEventInput struct {
	ID          int64
	Title       string
	Description string
	Date        time.Time
	Location    *string
	IsPublic    bool
}

// MemberRepository persists members.
type MemberRepository interface {
	Create(ctx context.Context, in CreateMemberInput) (domain.Member, error)
	GetByID(ctx context.Context, id int64) (domain.Member, error)
	GetByGoogleSub(ctx context.Context, googleSub string) (domain.Member, error)
	GetByEmail(ctx context.Context, email string) (domain.Member, error)
	BackfillGoogleSub(ctx context.Context, id int64, googleSub string) (domain.Member, error)
	CountPending(ctx context.Context) (int64, error)
	ListPending(ctx context.Context) ([]domain.Registration, error)
	List(ctx context.Context) ([]domain.Member, error)
	UpdateStatus(ctx context.Context, in UpdateStatusInput) (domain.Member, error)
	UpdateRole(ctx context.Context, id int64, role domain.Role) (domain.Member, error)
	SoftDelete(ctx context.Context, id int64) error
	CountSuperadmins(ctx context.Context) (int64, error)
}

// EventRepository persists events. publicOnly restricts reads to public rows.
type EventRepository interface {
	List(ctx context.Context, startFrom *time.Time, publicOnly bool) ([]domain.Event, error)
	GetByID(ctx context.Context, id int64, publicOnly bool) (domain.Event, error)
	Create(ctx context.Context, in CreateEventInput) (domain.Event, error)
	Update(ctx context.Context, in UpdateEventInput) (domain.Event, error)
	SoftDelete(ctx context.Context, id int64) error
}

// AnnouncementRepository persists announcements. publicOnly restricts reads to
// public rows.
type AnnouncementRepository interface {
	List(ctx context.Context, startFrom *time.Time, publicOnly bool) ([]domain.Announcement, error)
	Create(ctx context.Context, title, description string, isPublic bool) (domain.Announcement, error)
	Update(ctx context.Context, id int64, title, description string, isPublic bool) (domain.Announcement, error)
	SoftDelete(ctx context.Context, id int64) error
}

// GalleryRepository persists gallery items. publicOnly restricts reads to public
// rows.
type GalleryRepository interface {
	List(ctx context.Context, publicOnly bool) ([]domain.GalleryItem, error)
	Create(ctx context.Context, link string, isPublic bool) (domain.GalleryItem, error)
	Update(ctx context.Context, id int64, isPublic bool) (domain.GalleryItem, error)
	SoftDelete(ctx context.Context, id int64) error
}

// TokenRepository persists JWT revocations.
type TokenRepository interface {
	Revoke(ctx context.Context, jti string, memberID int64, expiresAt time.Time) error
	IsRevoked(ctx context.Context, jti string) (bool, error)
	PruneExpired(ctx context.Context) (int64, error)
}
