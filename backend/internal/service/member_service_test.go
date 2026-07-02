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
	members.On("ListPending", mock.Anything).Return([]domain.Registration{{MemberID: 1}}, nil)
	members.On("List", mock.Anything).Return([]domain.Member{{ID: 1}}, nil)
	s := NewMemberService(members, utilmocks.NewMockClock(t))

	m, err := s.GetProfile(context.Background(), 1)
	require.NoError(t, err)
	assert.Equal(t, int64(1), m.ID)

	cnt, err := s.CountPending(context.Background())
	require.NoError(t, err)
	assert.Equal(t, int64(3), cnt)

	regs, err := s.ListPending(context.Background())
	require.NoError(t, err)
	assert.Len(t, regs, 1)

	all, err := s.ListMembers(context.Background())
	require.NoError(t, err)
	assert.Len(t, all, 1)
}

func TestSetStatus_Approve(t *testing.T) {
	now := time.Date(2026, 7, 2, 0, 0, 0, 0, time.UTC)
	clock := utilmocks.NewMockClock(t)
	clock.On("Now").Return(now)
	members := repomocks.NewMockMemberRepository(t)
	members.On("UpdateStatus", mock.Anything, mock.MatchedBy(func(in repository.UpdateStatusInput) bool {
		return in.ID == 1 && in.Status == domain.StatusApproved && in.ApprovedAt != nil && in.ApprovedAt.Equal(now)
	})).Return(domain.Member{}, nil)
	s := NewMemberService(members, clock)

	assert.NoError(t, s.SetStatus(context.Background(), 1, ActionApprove, nil))
}

func TestSetStatus_Reject(t *testing.T) {
	members := repomocks.NewMockMemberRepository(t)
	remarks := "no"
	members.On("UpdateStatus", mock.Anything, mock.MatchedBy(func(in repository.UpdateStatusInput) bool {
		return in.Status == domain.StatusRejected && in.ApprovedAt == nil && in.Remarks == &remarks
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
