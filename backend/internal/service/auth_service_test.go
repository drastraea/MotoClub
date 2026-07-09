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
	jwtMgr.On("IssueAccess", int64(3), domain.RoleMember).Return("tok", "jti", time.Now(), nil)
	jwtMgr.On("IssueRefresh", int64(3), domain.RoleMember).Return("rtok", "rjti", time.Now(), nil)
	s := NewAuthService(members, nil, ver, jwtMgr)

	res, err := s.Login(context.Background(), "a@b.com", validToken)
	require.NoError(t, err)
	assert.Equal(t, int64(3), res.ID)
	assert.Equal(t, "tok", res.Token)
	assert.Equal(t, "rtok", res.RefreshToken)
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
	jwtMgr.On("IssueAccess", int64(4), domain.RoleSuperadmin).Return("tok", "jti", time.Now(), nil)
	jwtMgr.On("IssueRefresh", int64(4), domain.RoleSuperadmin).Return("rtok", "rjti", time.Now(), nil)
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
	jwtMgr.On("IssueAccess", int64(3), domain.RoleMember).Return("", "", time.Time{}, errBoom)
	s := NewAuthService(members, nil, ver, jwtMgr)

	_, err := s.Login(context.Background(), "a@b.com", validToken)
	assert.ErrorIs(t, err, errBoom)
}

func TestLogin_RefreshIssueError(t *testing.T) {
	ver := authmocks.NewMockGoogleVerifier(t)
	ver.On("Verify", mock.Anything, validToken).Return(identity(), nil)
	members := repomocks.NewMockMemberRepository(t)
	members.On("GetByGoogleSub", mock.Anything, "sub-1").Return(domain.Member{ID: 3, Role: domain.RoleMember}, nil)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("IssueAccess", int64(3), domain.RoleMember).Return("tok", "jti", time.Now(), nil)
	jwtMgr.On("IssueRefresh", int64(3), domain.RoleMember).Return("", "", time.Time{}, errBoom)
	s := NewAuthService(members, nil, ver, jwtMgr)

	_, err := s.Login(context.Background(), "a@b.com", validToken)
	assert.ErrorIs(t, err, errBoom)
}

func refreshClaims(exp time.Time) auth.Claims {
	return auth.Claims{MemberID: 5, Role: domain.RoleMember, JTI: "old-jti", Type: auth.TokenTypeRefresh, ExpiresAt: exp}
}

func TestRefresh_Success(t *testing.T) {
	exp := time.Now().Add(time.Hour)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "rtok").Return(refreshClaims(exp), nil)
	jwtMgr.On("IssueAccess", int64(5), domain.RoleMember).Return("new-access", "a-jti", time.Now(), nil)
	jwtMgr.On("IssueRefresh", int64(5), domain.RoleMember).Return("new-refresh", "r-jti", time.Now(), nil)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("IsRevoked", mock.Anything, "old-jti").Return(false, nil)
	tokens.On("Revoke", mock.Anything, "old-jti", int64(5), exp).Return(nil)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	res, err := s.Refresh(context.Background(), "rtok")
	require.NoError(t, err)
	assert.Equal(t, "new-access", res.Token)
	assert.Equal(t, "new-refresh", res.RefreshToken)
}

func TestRefresh_ParseError(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "bad").Return(auth.Claims{}, auth.ErrInvalidToken)
	s := NewAuthService(nil, nil, nil, jwtMgr)

	_, err := s.Refresh(context.Background(), "bad")
	assert.ErrorIs(t, err, apperr.ErrUnauthorized)
}

func TestRefresh_WrongType(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "atok").Return(auth.Claims{MemberID: 5, Type: auth.TokenTypeAccess}, nil)
	s := NewAuthService(nil, nil, nil, jwtMgr)

	_, err := s.Refresh(context.Background(), "atok")
	assert.ErrorIs(t, err, apperr.ErrUnauthorized)
}

func TestRefresh_Revoked(t *testing.T) {
	exp := time.Now().Add(time.Hour)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "rtok").Return(refreshClaims(exp), nil)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("IsRevoked", mock.Anything, "old-jti").Return(true, nil)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	_, err := s.Refresh(context.Background(), "rtok")
	assert.ErrorIs(t, err, apperr.ErrUnauthorized)
}

func TestRefresh_IsRevokedError(t *testing.T) {
	exp := time.Now().Add(time.Hour)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "rtok").Return(refreshClaims(exp), nil)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("IsRevoked", mock.Anything, "old-jti").Return(false, errBoom)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	_, err := s.Refresh(context.Background(), "rtok")
	assert.ErrorIs(t, err, errBoom)
}

func TestRefresh_IssueAccessError(t *testing.T) {
	exp := time.Now().Add(time.Hour)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "rtok").Return(refreshClaims(exp), nil)
	jwtMgr.On("IssueAccess", int64(5), domain.RoleMember).Return("", "", time.Time{}, errBoom)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("IsRevoked", mock.Anything, "old-jti").Return(false, nil)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	_, err := s.Refresh(context.Background(), "rtok")
	assert.ErrorIs(t, err, errBoom)
}

func TestRefresh_IssueRefreshError(t *testing.T) {
	exp := time.Now().Add(time.Hour)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "rtok").Return(refreshClaims(exp), nil)
	jwtMgr.On("IssueAccess", int64(5), domain.RoleMember).Return("new-access", "a-jti", time.Now(), nil)
	jwtMgr.On("IssueRefresh", int64(5), domain.RoleMember).Return("", "", time.Time{}, errBoom)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("IsRevoked", mock.Anything, "old-jti").Return(false, nil)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	_, err := s.Refresh(context.Background(), "rtok")
	assert.ErrorIs(t, err, errBoom)
}

func TestRefresh_RevokeError(t *testing.T) {
	exp := time.Now().Add(time.Hour)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "rtok").Return(refreshClaims(exp), nil)
	jwtMgr.On("IssueAccess", int64(5), domain.RoleMember).Return("new-access", "a-jti", time.Now(), nil)
	jwtMgr.On("IssueRefresh", int64(5), domain.RoleMember).Return("new-refresh", "r-jti", time.Now(), nil)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("IsRevoked", mock.Anything, "old-jti").Return(false, nil)
	tokens.On("Revoke", mock.Anything, "old-jti", int64(5), exp).Return(errBoom)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	_, err := s.Refresh(context.Background(), "rtok")
	assert.ErrorIs(t, err, errBoom)
}

func TestLogout_AccessOnly(t *testing.T) {
	tokens := repomocks.NewMockTokenRepository(t)
	exp := time.Now().Add(time.Hour)
	tokens.On("Revoke", mock.Anything, "jti", int64(5), exp).Return(nil)
	s := NewAuthService(nil, tokens, nil, nil)

	err := s.Logout(context.Background(), domain.Principal{ID: 5, JTI: "jti", ExpiresAt: exp}, "")
	assert.NoError(t, err)
}

func TestLogout_AccessRevokeError(t *testing.T) {
	tokens := repomocks.NewMockTokenRepository(t)
	exp := time.Now().Add(time.Hour)
	tokens.On("Revoke", mock.Anything, "jti", int64(5), exp).Return(errBoom)
	s := NewAuthService(nil, tokens, nil, nil)

	err := s.Logout(context.Background(), domain.Principal{ID: 5, JTI: "jti", ExpiresAt: exp}, "")
	assert.ErrorIs(t, err, errBoom)
}

func TestLogout_WithRefreshToken(t *testing.T) {
	accessExp := time.Now().Add(time.Hour)
	refreshExp := time.Now().Add(24 * time.Hour)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("Revoke", mock.Anything, "jti", int64(5), accessExp).Return(nil)
	tokens.On("Revoke", mock.Anything, "rjti", int64(5), refreshExp).Return(nil)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "rtok").Return(auth.Claims{MemberID: 5, JTI: "rjti", Type: auth.TokenTypeRefresh, ExpiresAt: refreshExp}, nil)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	err := s.Logout(context.Background(), domain.Principal{ID: 5, JTI: "jti", ExpiresAt: accessExp}, "rtok")
	assert.NoError(t, err)
}

func TestLogout_InvalidRefreshTokenIgnored(t *testing.T) {
	accessExp := time.Now().Add(time.Hour)
	tokens := repomocks.NewMockTokenRepository(t)
	tokens.On("Revoke", mock.Anything, "jti", int64(5), accessExp).Return(nil)
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "bad").Return(auth.Claims{}, auth.ErrInvalidToken)
	s := NewAuthService(nil, tokens, nil, jwtMgr)

	err := s.Logout(context.Background(), domain.Principal{ID: 5, JTI: "jti", ExpiresAt: accessExp}, "bad")
	assert.NoError(t, err)
}
