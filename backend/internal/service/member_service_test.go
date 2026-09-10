package service

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
	repomocks "github.com/edberto/motoclub-backend/internal/repository/mocks"
	utilmocks "github.com/edberto/motoclub-backend/internal/util/mocks"
)

func TestMember_Passthroughs(t *testing.T) {
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByID", mock.Anything, int64(1)).Return(domain.Member{ID: 1}, nil)
	members.On("CountPending", mock.Anything).Return(int64(3), nil)
	members.On("Count", mock.Anything).Return(int64(7), nil)
	members.On("ListPending", mock.Anything).Return([]domain.Registration{{MemberID: 1}}, nil)
	members.On("List", mock.Anything).Return([]domain.Member{{ID: 1}}, nil)
	s := NewMemberService(members, utilmocks.NewMockClock(t))

	m, err := s.GetProfile(context.Background(), 1)
	require.NoError(t, err)
	assert.Equal(t, int64(1), m.ID)

	cnt, err := s.CountPending(context.Background())
	require.NoError(t, err)
	assert.Equal(t, int64(3), cnt)

	total, err := s.CountMembers(context.Background())
	require.NoError(t, err)
	assert.Equal(t, int64(7), total)

	regs, err := s.ListPending(context.Background())
	require.NoError(t, err)
	assert.Len(t, regs, 1)

	all, err := s.ListMembers(context.Background(), nil)
	require.NoError(t, err)
	assert.Len(t, all, 1)
}

func TestListMembers_StatusFilter(t *testing.T) {
	now := time.Date(2026, 7, 2, 0, 0, 0, 0, time.UTC)
	past := now.AddDate(-1, 0, 0)
	future := now.AddDate(1, 0, 0)

	t.Run("filters by effective status", func(t *testing.T) {
		clock := utilmocks.NewMockClock(t)
		clock.On("Now").Return(now)
		members := repomocks.NewMockMemberRepository(t)
		members.On("List", mock.Anything).Return([]domain.Member{
			{ID: 1, Status: domain.StatusApproved, MembershipExpiresAt: &past},   // EXPIRED
			{ID: 2, Status: domain.StatusApproved, MembershipExpiresAt: &future}, // APPROVED
			{ID: 3, Status: domain.StatusPending},
		}, nil)
		s := NewMemberService(members, clock)

		want := domain.StatusExpired
		got, err := s.ListMembers(context.Background(), &want)
		require.NoError(t, err)
		require.Len(t, got, 1)
		assert.Equal(t, int64(1), got[0].ID)
	})

	t.Run("repo error is returned without filtering", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("List", mock.Anything).Return(nil, errBoom)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		want := domain.StatusApproved
		_, err := s.ListMembers(context.Background(), &want)
		assert.ErrorIs(t, err, errBoom)
	})
}

func TestExtendMembership(t *testing.T) {
	now := time.Date(2026, 7, 2, 0, 0, 0, 0, time.UTC)

	t.Run("extends from current expiry when still valid", func(t *testing.T) {
		clock := utilmocks.NewMockClock(t)
		clock.On("Now").Return(now)
		current := now.AddDate(1, 0, 0)
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(1)).
			Return(domain.Member{ID: 1, MembershipExpiresAt: &current}, nil)
		members.On("SetMembershipExpiry", mock.Anything, int64(1), mock.MatchedBy(func(t *time.Time) bool {
			return t != nil && t.Equal(current.AddDate(3, 0, 0))
		})).Return(domain.Member{}, nil)
		s := NewMemberService(members, clock)
		assert.NoError(t, s.ExtendMembership(context.Background(), 1))
	})

	t.Run("extends from now when already expired", func(t *testing.T) {
		clock := utilmocks.NewMockClock(t)
		clock.On("Now").Return(now)
		expired := now.AddDate(-1, 0, 0)
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(1)).
			Return(domain.Member{ID: 1, MembershipExpiresAt: &expired}, nil)
		members.On("SetMembershipExpiry", mock.Anything, int64(1), mock.MatchedBy(func(t *time.Time) bool {
			return t != nil && t.Equal(now.AddDate(3, 0, 0))
		})).Return(domain.Member{}, nil)
		s := NewMemberService(members, clock)
		assert.NoError(t, s.ExtendMembership(context.Background(), 1))
	})

	t.Run("member not found", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(1)).Return(domain.Member{}, apperr.ErrNotFound)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.ExtendMembership(context.Background(), 1), apperr.ErrNotFound)
	})
}

func TestSetStatus_Approve(t *testing.T) {
	now := time.Date(2026, 7, 2, 0, 0, 0, 0, time.UTC)
	clock := utilmocks.NewMockClock(t)
	clock.On("Now").Return(now)
	members := repomocks.NewMockMemberRepository(t)
	members.On("UpdateStatus", mock.Anything, mock.MatchedBy(func(in repository.UpdateStatusInput) bool {
		return in.ID == 1 && in.Status == domain.StatusApproved && in.ApprovedAt != nil &&
			in.ApprovedAt.Equal(now) && in.Role == domain.RoleMember &&
			in.MembershipExpiresAt != nil && in.MembershipExpiresAt.Equal(now.AddDate(3, 0, 0))
	})).Return(domain.Member{}, nil)
	s := NewMemberService(members, clock)

	assert.NoError(t, s.SetStatus(context.Background(), 1, ActionApprove, nil))
}

func TestSetStatus_Reject(t *testing.T) {
	members := repomocks.NewMockMemberRepository(t)
	remarks := "no"
	members.On("UpdateStatus", mock.Anything, mock.MatchedBy(func(in repository.UpdateStatusInput) bool {
		return in.Status == domain.StatusRejected && in.ApprovedAt == nil &&
			in.Remarks == &remarks && in.Role == domain.RoleVisitor
	})).Return(domain.Member{}, nil)
	s := NewMemberService(members, utilmocks.NewMockClock(t))

	assert.NoError(t, s.SetStatus(context.Background(), 1, ActionReject, &remarks))
}

func TestSetStatus_InvalidAction(t *testing.T) {
	s := NewMemberService(repomocks.NewMockMemberRepository(t), utilmocks.NewMockClock(t))
	err := s.SetStatus(context.Background(), 1, StatusAction("MAYBE"), nil)
	assert.ErrorIs(t, err, apperr.ErrValidation)
}

func TestSetStatus_RepoError(t *testing.T) {
	members := repomocks.NewMockMemberRepository(t)
	members.On("UpdateStatus", mock.Anything, mock.Anything).Return(domain.Member{}, errBoom)
	s := NewMemberService(members, utilmocks.NewMockClock(t))
	assert.ErrorIs(t, s.SetStatus(context.Background(), 1, ActionReject, nil), errBoom)
}

func TestUpdateRole(t *testing.T) {
	t.Run("invalid role", func(t *testing.T) {
		s := NewMemberService(repomocks.NewMockMemberRepository(t), utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.UpdateRole(context.Background(), 1, domain.RoleSuperadmin), apperr.ErrValidation)
	})
	t.Run("valid", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("UpdateRole", mock.Anything, int64(1), domain.RoleAdmin).Return(domain.Member{}, nil)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.NoError(t, s.UpdateRole(context.Background(), 1, domain.RoleAdmin))
	})
	t.Run("repo error", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("UpdateRole", mock.Anything, int64(1), domain.RoleMember).Return(domain.Member{}, errBoom)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.UpdateRole(context.Background(), 1, domain.RoleMember), errBoom)
	})
}

func TestDelete(t *testing.T) {
	admin := domain.Principal{ID: 99, Role: domain.RoleAdmin}
	super := domain.Principal{ID: 1, Role: domain.RoleSuperadmin}

	t.Run("target not found", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(2)).Return(domain.Member{}, apperr.ErrNotFound)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.Delete(context.Background(), admin, 2), apperr.ErrNotFound)
	})
	t.Run("admin cannot delete non-member", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(2)).Return(domain.Member{ID: 2, Role: domain.RoleAdmin}, nil)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.Delete(context.Background(), admin, 2), apperr.ErrForbidden)
	})
	t.Run("admin deletes member", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(2)).Return(domain.Member{ID: 2, Role: domain.RoleMember}, nil)
		members.On("SoftDelete", mock.Anything, int64(2)).Return(nil)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.NoError(t, s.Delete(context.Background(), admin, 2))
	})
	t.Run("cannot delete last superadmin", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(2)).Return(domain.Member{ID: 2, Role: domain.RoleSuperadmin}, nil)
		members.On("CountSuperadmins", mock.Anything).Return(int64(1), nil)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.Delete(context.Background(), super, 2), apperr.ErrForbidden)
	})
	t.Run("count error", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(2)).Return(domain.Member{ID: 2, Role: domain.RoleSuperadmin}, nil)
		members.On("CountSuperadmins", mock.Anything).Return(int64(0), errBoom)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.Delete(context.Background(), super, 2), errBoom)
	})
	t.Run("superadmin deletes another superadmin", func(t *testing.T) {
		members := repomocks.NewMockMemberRepository(t)
		members.On("GetByID", mock.Anything, int64(2)).Return(domain.Member{ID: 2, Role: domain.RoleSuperadmin}, nil)
		members.On("CountSuperadmins", mock.Anything).Return(int64(2), nil)
		members.On("SoftDelete", mock.Anything, int64(2)).Return(errBoom)
		s := NewMemberService(members, utilmocks.NewMockClock(t))
		assert.ErrorIs(t, s.Delete(context.Background(), super, 2), errBoom)
	})
}
