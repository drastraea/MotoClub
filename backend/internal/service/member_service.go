package service

import (
	"context"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
	"github.com/edberto/motoclub-backend/internal/util"
)

// StatusAction is an approve/reject instruction for a pending registration.
type StatusAction string

const (
	ActionApprove StatusAction = "APPROVE"
	ActionReject  StatusAction = "REJECT"
)

// MemberService implements member management for the profile and admin panels.
type MemberService struct {
	members repository.MemberRepository
	clock   util.Clock
}

// NewMemberService constructs a MemberService.
func NewMemberService(members repository.MemberRepository, clock util.Clock) *MemberService {
	return &MemberService{members: members, clock: clock}
}

// GetProfile returns a single member by id.
func (s *MemberService) GetProfile(ctx context.Context, id int64) (domain.Member, error) {
	return s.members.GetByID(ctx, id)
}

// CountPending returns the number of pending registrations.
func (s *MemberService) CountPending(ctx context.Context) (int64, error) {
	return s.members.CountPending(ctx)
}

// CountMembers returns the total number of members.
func (s *MemberService) CountMembers(ctx context.Context) (int64, error) {
	return s.members.Count(ctx)
}

// ListPending returns the pending registrations.
func (s *MemberService) ListPending(ctx context.Context) ([]domain.Registration, error) {
	return s.members.ListPending(ctx)
}

// ListMembers returns all members.
func (s *MemberService) ListMembers(ctx context.Context) ([]domain.Member, error) {
	return s.members.List(ctx)
}

// SetStatus approves or rejects a registration. Approval promotes the member
// from visitor to member; rejection leaves them as a visitor.
func (s *MemberService) SetStatus(ctx context.Context, id int64, action StatusAction, remarks *string) error {
	in := repository.UpdateStatusInput{ID: id, Remarks: remarks}
	switch action {
	case ActionApprove:
		now := s.clock.Now()
		in.Status = domain.StatusApproved
		in.ApprovedAt = &now
		in.Role = domain.RoleMember
	case ActionReject:
		in.Status = domain.StatusRejected
		in.Role = domain.RoleVisitor
	default:
		return apperr.ErrValidation
	}
	_, err := s.members.UpdateStatus(ctx, in)
	return err
}

// UpdateRole changes a member's role. Only ADMIN and MEMBER are assignable via
// the API (superadmin is provisioned manually in the database).
func (s *MemberService) UpdateRole(ctx context.Context, id int64, role domain.Role) error {
	if role != domain.RoleAdmin && role != domain.RoleMember {
		return apperr.ErrValidation
	}
	_, err := s.members.UpdateRole(ctx, id, role)
	return err
}

// Delete soft-deletes a member, enforcing the deletion authorization rules:
// admins may only delete plain members, and the final superadmin cannot be
// deleted.
func (s *MemberService) Delete(ctx context.Context, actor domain.Principal, targetID int64) error {
	target, err := s.members.GetByID(ctx, targetID)
	if err != nil {
		return err
	}

	if actor.Role == domain.RoleAdmin && target.Role != domain.RoleMember {
		return apperr.ErrForbidden
	}

	if target.Role == domain.RoleSuperadmin {
		count, err := s.members.CountSuperadmins(ctx)
		if err != nil {
			return err
		}
		if count <= 1 {
			return apperr.ErrForbidden
		}
	}

	return s.members.SoftDelete(ctx, targetID)
}
