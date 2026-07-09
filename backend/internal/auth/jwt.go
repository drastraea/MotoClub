// Package auth provides token issuing/verification concerns: our own JWTs and
// verification of Google ID tokens. External dependencies are hidden behind
// interfaces so services can be unit-tested without real crypto or network.
package auth

import (
	"errors"
	"strconv"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/util"
)

// ErrInvalidToken is returned when a JWT cannot be validated.
var ErrInvalidToken = errors.New("invalid token")

// Token types, carried in the "typ" claim. Access tokens are short-lived and
// authenticate requests; refresh tokens are long-lived and only exchange for a
// new access token at POST /refresh.
const (
	TokenTypeAccess  = "access"
	TokenTypeRefresh = "refresh"
)

// Claims is the parsed content of one of our JWTs.
type Claims struct {
	MemberID  int64
	Role      domain.Role
	JTI       string
	Type      string
	ExpiresAt time.Time
}

// JWTManager issues and parses application JWTs.
type JWTManager interface {
	IssueAccess(memberID int64, role domain.Role) (token, jti string, expiresAt time.Time, err error)
	IssueRefresh(memberID int64, role domain.Role) (token, jti string, expiresAt time.Time, err error)
	Parse(token string) (Claims, error)
}

// HMACManager is a JWTManager backed by an HMAC-SHA256 signing key.
type HMACManager struct {
	secret     []byte
	accessTTL  time.Duration
	refreshTTL time.Duration
	clock      util.Clock
	newID      func() string
}

// NewHMACManager constructs an HMACManager.
func NewHMACManager(secret string, accessTTL, refreshTTL time.Duration, clock util.Clock) *HMACManager {
	return &HMACManager{
		secret:     []byte(secret),
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
		clock:      clock,
		newID:      func() string { return uuid.NewString() },
	}
}

// IssueAccess creates a signed short-lived access token for the given member.
func (m *HMACManager) IssueAccess(memberID int64, role domain.Role) (string, string, time.Time, error) {
	return m.issue(memberID, role, TokenTypeAccess, m.accessTTL)
}

// IssueRefresh creates a signed long-lived refresh token for the given member.
func (m *HMACManager) IssueRefresh(memberID int64, role domain.Role) (string, string, time.Time, error) {
	return m.issue(memberID, role, TokenTypeRefresh, m.refreshTTL)
}

func (m *HMACManager) issue(memberID int64, role domain.Role, typ string, ttl time.Duration) (string, string, time.Time, error) {
	now := m.clock.Now()
	expiresAt := now.Add(ttl)
	jti := m.newID()

	claims := jwt.MapClaims{
		"sub":  strconv.FormatInt(memberID, 10),
		"role": string(role),
		"jti":  jti,
		"typ":  typ,
		"iat":  now.Unix(),
		"exp":  expiresAt.Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString(m.secret)
	if err != nil {
		return "", "", time.Time{}, err
	}
	return signed, jti, expiresAt, nil
}

// Parse validates the token signature and expiry and extracts the claims.
func (m *HMACManager) Parse(tokenString string) (Claims, error) {
	parsed, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, ErrInvalidToken
		}
		return m.secret, nil
	}, jwt.WithValidMethods([]string{"HS256"}), jwt.WithTimeFunc(m.clock.Now))
	if err != nil {
		return Claims{}, ErrInvalidToken
	}

	mapClaims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok || !parsed.Valid {
		return Claims{}, ErrInvalidToken
	}

	sub, _ := mapClaims["sub"].(string)
	memberID, err := strconv.ParseInt(sub, 10, 64)
	if err != nil {
		return Claims{}, ErrInvalidToken
	}
	roleStr, _ := mapClaims["role"].(string)
	role := domain.Role(roleStr)
	if !role.Valid() {
		return Claims{}, ErrInvalidToken
	}
	jti, _ := mapClaims["jti"].(string)
	if jti == "" {
		return Claims{}, ErrInvalidToken
	}
	typ, _ := mapClaims["typ"].(string)
	if typ != TokenTypeAccess && typ != TokenTypeRefresh {
		return Claims{}, ErrInvalidToken
	}
	exp, err := mapClaims.GetExpirationTime()
	if err != nil || exp == nil {
		return Claims{}, ErrInvalidToken
	}

	return Claims{MemberID: memberID, Role: role, JTI: jti, Type: typ, ExpiresAt: exp.Time}, nil
}
