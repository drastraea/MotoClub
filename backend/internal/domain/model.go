// Package domain holds the core business entities and value objects shared
// across the application. It intentionally depends on nothing internal so it
// can be imported by every other layer without creating cycles.
package domain

import "time"

// Role enumerates the access levels a member can hold.
type Role string

const (
	// RoleVisitor is a registered but not-yet-approved member. Visitors may only
	// view their own profile.
	RoleVisitor    Role = "visitor"
	RoleMember     Role = "member"
	RoleAdmin      Role = "admin"
	RoleSuperadmin Role = "superadmin"
)

// Valid reports whether r is one of the known roles.
func (r Role) Valid() bool {
	switch r {
	case RoleVisitor, RoleMember, RoleAdmin, RoleSuperadmin:
		return true
	default:
		return false
	}
}

// Status enumerates the lifecycle states of a member registration.
type Status string

const (
	StatusPending  Status = "PENDING_APPROVAL"
	StatusApproved Status = "APPROVED"
	StatusRejected Status = "REJECTED"
)

// Principal is the authenticated identity extracted from a JWT and carried
// through the request context.
type Principal struct {
	ID        int64
	Role      Role
	JTI       string
	ExpiresAt time.Time
}

// HasRole reports whether the principal's role is one of the supplied roles.
func (p Principal) HasRole(roles ...Role) bool {
	for _, role := range roles {
		if p.Role == role {
			return true
		}
	}
	return false
}

// Member is the full member record.
type Member struct {
	ID                          int64
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
	Role                        Role
	Status                      Status
	Remarks                     *string
	ApprovedAt                  *time.Time
	CreatedAt                   time.Time
	LastUpdatedAt               time.Time
}

// Registration is the reduced view of a pending member used by the admin panel.
type Registration struct {
	MemberID     int64
	Name         string
	Email        string
	RegisteredAt time.Time
}

// Event is a club event.
type Event struct {
	ID            int64
	Title         string
	Description   string
	Date          time.Time
	Location      *string
	CreatedAt     time.Time
	LastUpdatedAt time.Time
}

// Announcement is a club announcement.
type Announcement struct {
	ID            int64
	Title         string
	Description   string
	CreatedAt     time.Time
	LastUpdatedAt time.Time
}

// GalleryItem is a single gallery entry (a link to externally-stored media).
type GalleryItem struct {
	ID        int64
	Link      string
	CreatedAt time.Time
}
