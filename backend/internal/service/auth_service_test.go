package service

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/auth"
	authmocks "github.com/edberto/motoclub-backend/internal/auth/mocks"
	"github.com/edberto/motoclub-backend/internal/domain"
	repomocks "github.com/edberto/motoclub-backend/internal/repository/mocks"
)

var errBoom = errors.New("boom")

const validToken = "google-token"

func identity() auth.GoogleIdentity {
	return auth.GoogleIdentity{Sub: "sub-1", Email: "a@b.com", Name: "Alice"}
}

func registerInput() RegisterInput {
	return RegisterInput{Name: "Alice", Email: "a@b.com", GoogleToken: validToken}
}

func TestRegister_VerifyFails(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(auth.GoogleIdentity{}, errBoom)
	s := NewAuthService(repomocks.NewMockMemberRepository(t), nil, ver, nil)

	_, err := s.Register(context.Background(), registerInput())
	assert.ErrorIs(t, err, apperr.ErrUnauthorized)
}

func TestRegister_EmailMismatch(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	s := NewAuthService(repomocks.NewMockMemberRepository(t), nil, ver, nil)

	in := registerInput()
	in.Email = "other@b.com"
	_, err := s.Register(context.Background(), in)
	assert.ErrorIs(t, err, apperr.ErrValidation)
}

func TestRegister_ConflictByGoogleSub(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{ID: 1}, nil)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Register(context.Background(), registerInput())
	assert.ErrorIs(t, err, apperr.ErrConflict)
}

func TestRegister_GoogleSubLookupError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, errBoom)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Register(context.Background(), registerInput())
	assert.ErrorIs(t, err, errBoom)
}

func TestRegister_ConflictByEmail(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("GetByEmail", mock.Anything, "a@b.com").Return(domain.Member{ID: 2}, nil)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Register(context.Background(), registerInput())
	assert.ErrorIs(t, err, apperr.ErrConflict)
}

func TestRegister_EmailLookupError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("GetByEmail", mock.Anything, "a@b.com").Return(domain.Member{}, errBoom)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Register(context.Background(), registerInput())
	assert.ErrorIs(t, err, errBoom)
}

func TestRegister_Success(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("GetByEmail", mock.Anything, "a@b.com").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("Create", mock.Anything, mock.Anything).Return(domain.Member{ID: 10}, nil)
	s := NewAuthService(members, nil, ver, nil)

	m, err := s.Register(context.Background(), registerInput())
	require.NoError(t, err)
	assert.Equal(t, int64(10), m.ID)
}

func TestRegister_CreateError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("GetByEmail", mock.Anything, "a@b.com").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("Create", mock.Anything, mock.Anything).Return(domain.Member{}, errBoom)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Register(context.Background(), registerInput())
	assert.ErrorIs(t, err, errBoom)
}

func TestLogin_VerifyFails(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(auth.GoogleIdentity{}, errBoom)
	s := NewAuthService(repomocks.NewMockMemberRepository(t), nil, ver, nil)

	_, err := s.Login(context.Background(), "a@b.com", validToken)
	assert.ErrorIs(t, err, apperr.ErrUnauthorized)
}

func TestLogin_EmailMismatch(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	s := NewAuthService(repomocks.NewMockMemberRepository(t), nil, ver, nil)

	_, err := s.Login(context.Background(), "other@b.com", validToken)
	assert.ErrorIs(t, err, apperr.ErrValidation)
}

func TestLogin_FoundByGoogleSub(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{ID: 3, Role: domain.RoleMember}, nil)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Issue", int64(3), domain.RoleMember).Return("tok", "jti", time.Now(), nil)
	s := NewAuthService(members, nil, ver, jwtMgr)

	res, err := s.Login(context.Background(), "a@b.com", validToken)
	require.NoError(t, err)
	assert.Equal(t, int64(3), res.ID)
	assert.Equal(t, "tok", res.Token)
}

func TestLogin_GoogleSubLookupError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, errBoom)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Login(context.Background(), "a@b.com", validToken)
	assert.ErrorIs(t, err, errBoom)
}

func TestLogin_BackfillPath(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("GetByEmail", mock.Anything, "a@b.com").Return(domain.Member{ID: 4}, nil)
	members.On("BackfillGoogleSub", mock.Anything, int64(4), "sub-1").
		Return(domain.Member{ID: 4, Role: domain.RoleSuperadmin}, nil)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Issue", int64(4), domain.RoleSuperadmin).Return("tok", "jti", time.Now(), nil)
	s := NewAuthService(members, nil, ver, jwtMgr)

	res, err := s.Login(context.Background(), "a@b.com", validToken)
	require.NoError(t, err)
	assert.Equal(t, int64(4), res.ID)
}

func TestLogin_EmailLookupError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("GetByEmail", mock.Anything, "a@b.com").Return(domain.Member{}, apperr.ErrNotFound)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Login(context.Background(), "a@b.com", validToken)
	assert.ErrorIs(t, err, apperr.ErrNotFound)
}

func TestLogin_BackfillError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{}, apperr.ErrNotFound)
	members.On("GetByEmail", mock.Anything, "a@b.com").Return(domain.Member{ID: 4}, nil)
	members.On("BackfillGoogleSub", mock.Anything, int64(4), "sub-1").Return(domain.Member{}, errBoom)
	s := NewAuthService(members, nil, ver, nil)

	_, err := s.Login(context.Background(), "a@b.com", validToken)
	assert.ErrorIs(t, err, errBoom)
}

func TestLogin_IssueError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{ID: 3, Role: domain.RoleMember}, nil)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Issue", int64(3), domain.RoleMember).Return("", "", time.Time{}, errBoom)
	s := NewAuthService(members, nil, ver, jwtMgr)

	_, err := s.Login(context.Background(), "a@b.com", validToken)
	assert.ErrorIs(t, err, errBoom)
}

func TestLogout(t *testing.T) {
	tokens := repomocks.NewMockTokenRepository(t)
	exp := time.Now().Add(time.Hour)
	tokens.On("Revoke", mock.Anything, "jti", int64(5), exp).Return(nil)
	s := NewAuthService(repomocks.NewMockMemberRepository(t), tokens, nil, nil)

	err := s.Logout(context.Background(), domain.Principal{ID: 5, JTI: "jti", ExpiresAt: exp})
	assert.NoError(t, err)
}
