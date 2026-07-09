package postgres

import (
	"context"

	"github.com/edberto/motoclub-backend/db/sqlc"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
)

// MemberRepo implements repository.MemberRepository.
type MemberRepo struct {
	q sqlc.Querier
}

func toDomainMember(m sqlc.Member) domain.Member {
	return domain.Member{
		ID:                          m.ID,
		GoogleSub:                   m.GoogleSub,
		Email:                       m.Email,
		Name:                        m.Name,
		PhoneNumber:                 m.PhoneNumber,
		PlaceOfBirth:                m.PlaceOfBirth,
		DateOfBirth:                 m.DateOfBirth,
		Address:                     m.Address,
		InstagramUsername:           m.InstagramUsername,
		BloodType:                   m.BloodType,
		EmergencyContactName:        m.EmergencyContactName,
		EmergencyContactPhoneNumber: m.EmergencyContactPhoneNumber,
		MotorbikeName:               m.MotorbikeName,
		MotorbikeSelfieLinkPath:     m.MotorbikeSelfieLinkPath,
		Role:                        domain.Role(m.Role),
		Status:                      domain.Status(m.Status),
		Remarks:                     m.Remarks,
		ApprovedAt:                  m.ApprovedAt,
		CreatedAt:                   m.CreatedAt,
		LastUpdatedAt:               m.LastUpdatedAt,
	}
}

// Create inserts a new member.
func (r *MemberRepo) Create(ctx context.Context, in repository.CreateMemberInput) (domain.Member, error) {
	m, err := r.q.CreateMember(ctx, sqlc.CreateMemberParams{
		GoogleSub:                   in.GoogleSub,
		Email:                       in.Email,
		Name:                        in.Name,
		PhoneNumber:                 in.PhoneNumber,
		PlaceOfBirth:                in.PlaceOfBirth,
		DateOfBirth:                 in.DateOfBirth,
		Address:                     in.Address,
		InstagramUsername:           in.InstagramUsername,
		BloodType:                   in.BloodType,
		EmergencyContactName:        in.EmergencyContactName,
		EmergencyContactPhoneNumber: in.EmergencyContactPhoneNumber,
		MotorbikeName:               in.MotorbikeName,
		MotorbikeSelfieLinkPath:     in.MotorbikeSelfieLinkPath,
	})
	if err != nil {
		return domain.Member{}, err
	}
	return toDomainMember(m), nil
}

// GetByID fetches a member by id.
func (r *MemberRepo) GetByID(ctx context.Context, id int64) (domain.Member, error) {
	m, err := r.q.GetMemberByID(ctx, id)
	if err != nil {
		return domain.Member{}, mapGetErr(err)
	}
	return toDomainMember(m), nil
}

// GetByGoogleSub fetches a member by Google subject id.
func (r *MemberRepo) GetByGoogleSub(ctx context.Context, googleSub string) (domain.Member, error) {
	m, err := r.q.GetMemberByGoogleSub(ctx, googleSub)
	if err != nil {
		return domain.Member{}, mapGetErr(err)
	}
	return toDomainMember(m), nil
}

// GetByEmail fetches a member by email.
func (r *MemberRepo) GetByEmail(ctx context.Context, email string) (domain.Member, error) {
	m, err := r.q.GetMemberByEmail(ctx, email)
	if err != nil {
		return domain.Member{}, mapGetErr(err)
	}
	return toDomainMember(m), nil
}

// BackfillGoogleSub sets the google_sub for an existing member (used when a
// manually-provisioned member logs in with Google for the first time).
func (r *MemberRepo) BackfillGoogleSub(ctx context.Context, id int64, googleSub string) (domain.Member, error) {
	m, err := r.q.BackfillGoogleSub(ctx, sqlc.BackfillGoogleSubParams{ID: id, GoogleSub: googleSub})
	if err != nil {
		return domain.Member{}, mapGetErr(err)
	}
	return toDomainMember(m), nil
}

// CountPending counts members awaiting approval.
func (r *MemberRepo) CountPending(ctx context.Context) (int64, error) {
	return r.q.CountPendingRegistrations(ctx)
}

// Count returns the total number of non-deleted members.
func (r *MemberRepo) Count(ctx context.Context) (int64, error) {
	return r.q.CountMembers(ctx)
}

// ListPending returns the pending registrations.
func (r *MemberRepo) ListPending(ctx context.Context) ([]domain.Registration, error) {
	rows, err := r.q.ListPendingRegistrations(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]domain.Registration, 0, len(rows))
	for _, row := range rows {
		out = append(out, domain.Registration{
			MemberID:     row.ID,
			Name:         row.Name,
			Email:        row.Email,
			RegisteredAt: row.CreatedAt,
		})
	}
	return out, nil
}

// List returns all members.
func (r *MemberRepo) List(ctx context.Context) ([]domain.Member, error) {
	rows, err := r.q.ListMembers(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]domain.Member, 0, len(rows))
	for _, m := range rows {
		out = append(out, toDomainMember(m))
	}
	return out, nil
}

// UpdateStatus applies an approve/reject decision.
func (r *MemberRepo) UpdateStatus(ctx context.Context, in repository.UpdateStatusInput) (domain.Member, error) {
	m, err := r.q.UpdateMemberStatus(ctx, sqlc.UpdateMemberStatusParams{
		ID:         in.ID,
		Status:     string(in.Status),
		Remarks:    in.Remarks,
		ApprovedAt: in.ApprovedAt,
		Role:       string(in.Role),
	})
	if err != nil {
		return domain.Member{}, mapGetErr(err)
	}
	return toDomainMember(m), nil
}

// UpdateRole changes a member's role.
func (r *MemberRepo) UpdateRole(ctx context.Context, id int64, role domain.Role) (domain.Member, error) {
	m, err := r.q.UpdateMemberRole(ctx, sqlc.UpdateMemberRoleParams{ID: id, Role: string(role)})
	if err != nil {
		return domain.Member{}, mapGetErr(err)
	}
	return toDomainMember(m), nil
}

// SoftDelete soft-deletes a member.
func (r *MemberRepo) SoftDelete(ctx context.Context, id int64) error {
	return affected(r.q.SoftDeleteMember(ctx, id))
}

// CountSuperadmins counts active superadmins.
func (r *MemberRepo) CountSuperadmins(ctx context.Context) (int64, error) {
	return r.q.CountSuperadmins(ctx)
}
