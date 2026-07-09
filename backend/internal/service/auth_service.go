// Package service holds the application's business logic. Services depend only
// on repository and auth interfaces (never on Gin, pgx, or sqlc) so they can be
// exhaustively unit-tested with mocks.
package service

import (
	"context"
	"errors"
	"time"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/auth"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/repository"
)

// RegisterInput is the payload for member self-registration.
type RegisterInput struct {
	Name                        string
	Email                       string
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
	GoogleToken                 string
}

// LoginResult is returned on a successful login.
type LoginResult struct {
	ID           int64
	Token        string
	RefreshToken string
}

// RefreshResult is returned on a successful token refresh.
type RefreshResult struct {
	Token        string
	RefreshToken string
}

// AuthService implements registration, login and logout.
type AuthService struct {
	members  repository.MemberRepository
	tokens   repository.TokenRepository
	verifier auth.GoogleVerifier
	jwt      auth.JWTManager
}

// NewAuthService constructs an AuthService.
func NewAuthService(
	members repository.MemberRepository,
	tokens repository.TokenRepository,
	verifier auth.GoogleVerifier,
	jwt auth.JWTManager,
) *AuthService {
	return &AuthService{members: members, tokens: tokens, verifier: verifier, jwt: jwt}
}

// Register verifies the Google token, ensures the account is new, and creates a
// PENDING_APPROVAL member.
func (s *AuthService) Register(ctx context.Context, in RegisterInput) (domain.Member, error) {
	identity, err := s.verifier.Verify(ctx, in.GoogleToken)
	if err != nil {
		return domain.Member{}, apperr.ErrUnauthorized
	}
	if identity.Email != in.Email {
		return domain.Member{}, apperr.ErrValidation
	}

	// Reject if a member already exists for this Google account or email.
	if _, err := s.members.GetByGoogleSub(ctx, identity.Sub); err == nil {
		return domain.Member{}, apperr.ErrConflict
	} else if !errors.Is(err, apperr.ErrNotFound) {
		return domain.Member{}, err
	}
	if _, err := s.members.GetByEmail(ctx, in.Email); err == nil {
		return domain.Member{}, apperr.ErrConflict
	} else if !errors.Is(err, apperr.ErrNotFound) {
		return domain.Member{}, err
	}

	return s.members.Create(ctx, repository.CreateMemberInput{
		GoogleSub:                   identity.Sub,
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
}

// Login verifies the Google token, resolves the member (backfilling google_sub
// for manually-provisioned members), and issues an application JWT. Any
// non-soft-deleted member may log in.
func (s *AuthService) Login(ctx context.Context, email, googleToken string) (LoginResult, error) {
	identity, err := s.verifier.Verify(ctx, googleToken)
	if err != nil {
		return LoginResult{}, apperr.ErrUnauthorized
	}
	if identity.Email != email {
		return LoginResult{}, apperr.ErrValidation
	}

	member, err := s.resolveMember(ctx, identity)
	if err != nil {
		return LoginResult{}, err
	}

	access, _, _, err := s.jwt.IssueAccess(member.ID, member.Role)
	if err != nil {
		return LoginResult{}, err
	}
	refresh, _, _, err := s.jwt.IssueRefresh(member.ID, member.Role)
	if err != nil {
		return LoginResult{}, err
	}
	return LoginResult{ID: member.ID, Token: access, RefreshToken: refresh}, nil
}

// Refresh validates a refresh token, rotates it (revoking the old one), and
// issues a fresh access token. Rejects anything that is not a valid, unrevoked
// refresh token.
func (s *AuthService) Refresh(ctx context.Context, refreshToken string) (RefreshResult, error) {
	claims, err := s.jwt.Parse(refreshToken)
	if err != nil || claims.Type != auth.TokenTypeRefresh {
		return RefreshResult{}, apperr.ErrUnauthorized
	}

	revoked, err := s.tokens.IsRevoked(ctx, claims.JTI)
	if err != nil {
		return RefreshResult{}, err
	}
	if revoked {
		return RefreshResult{}, apperr.ErrUnauthorized
	}

	access, _, _, err := s.jwt.IssueAccess(claims.MemberID, claims.Role)
	if err != nil {
		return RefreshResult{}, err
	}
	newRefresh, _, _, err := s.jwt.IssueRefresh(claims.MemberID, claims.Role)
	if err != nil {
		return RefreshResult{}, err
	}

	// Rotate: revoke the presented refresh token so it cannot be replayed.
	if err := s.tokens.Revoke(ctx, claims.JTI, claims.MemberID, claims.ExpiresAt); err != nil {
		return RefreshResult{}, err
	}
	return RefreshResult{Token: access, RefreshToken: newRefresh}, nil
}

func (s *AuthService) resolveMember(ctx context.Context, identity auth.GoogleIdentity) (domain.Member, error) {
	member, err := s.members.GetByGoogleSub(ctx, identity.Sub)
	if err == nil {
		return member, nil
	}
	if !errors.Is(err, apperr.ErrNotFound) {
		return domain.Member{}, err
	}

	// No member for this google_sub yet: a superadmin/admin may have been
	// provisioned by email. Match by email and backfill the google_sub.
	member, err = s.members.GetByEmail(ctx, identity.Email)
	if err != nil {
		return domain.Member{}, err
	}
	return s.members.BackfillGoogleSub(ctx, member.ID, identity.Sub)
}

// Logout revokes the caller's access token, plus the paired refresh token when
// one is supplied, until their natural expiry.
func (s *AuthService) Logout(ctx context.Context, principal domain.Principal, refreshToken string) error {
	if err := s.tokens.Revoke(ctx, principal.JTI, principal.ID, principal.ExpiresAt); err != nil {
		return err
	}
	if refreshToken == "" {
		return nil
	}
	// Best-effort: revoke the refresh token too if it is a valid refresh token.
	claims, err := s.jwt.Parse(refreshToken)
	if err != nil || claims.Type != auth.TokenTypeRefresh {
		return nil
	}
	return s.tokens.Revoke(ctx, claims.JTI, claims.MemberID, claims.ExpiresAt)
}
