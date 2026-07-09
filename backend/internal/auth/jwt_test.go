package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/edberto/motoclub-backend/internal/domain"
)

type fixedClock struct{ t time.Time }

func (c fixedClock) Now() time.Time { return c.t }

const secret = "test-secret"

func sign(t *testing.T, claims jwt.MapClaims) string {
	t.Helper()
	tok := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	s, err := tok.SignedString([]byte(secret))
	require.NoError(t, err)
	return s
}

func TestIssueAndParse_RoundTrip(t *testing.T) {
	now := time.Date(2026, 7, 2, 10, 0, 0, 0, time.UTC)
	m := NewHMACManager(secret, time.Hour, 24*time.Hour, fixedClock{now})

	token, jti, exp, err := m.IssueAccess(42, domain.RoleAdmin)
	require.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.NotEmpty(t, jti)
	assert.Equal(t, now.Add(time.Hour).Unix(), exp.Unix())

	claims, err := m.Parse(token)
	require.NoError(t, err)
	assert.Equal(t, int64(42), claims.MemberID)
	assert.Equal(t, domain.RoleAdmin, claims.Role)
	assert.Equal(t, jti, claims.JTI)
	assert.Equal(t, TokenTypeAccess, claims.Type)
	assert.Equal(t, exp.Unix(), claims.ExpiresAt.Unix())
}

func TestIssueRefresh_RoundTrip(t *testing.T) {
	now := time.Date(2026, 7, 2, 10, 0, 0, 0, time.UTC)
	m := NewHMACManager(secret, time.Hour, 24*time.Hour, fixedClock{now})

	token, jti, exp, err := m.IssueRefresh(7, domain.RoleMember)
	require.NoError(t, err)
	assert.NotEmpty(t, jti)
	assert.Equal(t, now.Add(24*time.Hour).Unix(), exp.Unix()) // refresh TTL

	claims, err := m.Parse(token)
	require.NoError(t, err)
	assert.Equal(t, int64(7), claims.MemberID)
	assert.Equal(t, TokenTypeRefresh, claims.Type)
}

func TestParse_Expired(t *testing.T) {
	issue := NewHMACManager(secret, time.Hour, 24*time.Hour, fixedClock{time.Unix(1000, 0)})
	token, _, _, err := issue.IssueAccess(1, domain.RoleMember)
	require.NoError(t, err)

	later := NewHMACManager(secret, time.Hour, 24*time.Hour, fixedClock{time.Unix(1000, 0).Add(2 * time.Hour)})
	_, err = later.Parse(token)
	assert.ErrorIs(t, err, ErrInvalidToken)
}

func TestParse_WrongSigningMethod(t *testing.T) {
	tok := jwt.NewWithClaims(jwt.SigningMethodNone, jwt.MapClaims{
		"sub": "1", "role": "member", "jti": "x",
		"exp": time.Now().Add(time.Hour).Unix(),
	})
	s, err := tok.SignedString(jwt.UnsafeAllowNoneSignatureType)
	require.NoError(t, err)

	m := NewHMACManager(secret, time.Hour, 24*time.Hour, fixedClock{time.Now()})
	_, err = m.Parse(s)
	assert.ErrorIs(t, err, ErrInvalidToken)
}

func TestParse_Malformed(t *testing.T) {
	m := NewHMACManager(secret, time.Hour, 24*time.Hour, fixedClock{time.Now()})
	_, err := m.Parse("not.a.jwt")
	assert.ErrorIs(t, err, ErrInvalidToken)
}

func TestParse_ClaimErrors(t *testing.T) {
	future := time.Now().Add(time.Hour).Unix()
	m := NewHMACManager(secret, time.Hour, 24*time.Hour, fixedClock{time.Now()})

	cases := map[string]jwt.MapClaims{
		"bad sub":      {"sub": "notint", "role": "member", "jti": "x", "typ": "access", "exp": future},
		"invalid role": {"sub": "1", "role": "ghost", "jti": "x", "typ": "access", "exp": future},
		"missing jti":  {"sub": "1", "role": "member", "typ": "access", "exp": future},
		"missing typ":  {"sub": "1", "role": "member", "jti": "x", "exp": future},
		"invalid typ":  {"sub": "1", "role": "member", "jti": "x", "typ": "bogus", "exp": future},
		"missing exp":  {"sub": "1", "role": "member", "jti": "x", "typ": "access"},
	}
	for name, claims := range cases {
		t.Run(name, func(t *testing.T) {
			_, err := m.Parse(sign(t, claims))
			assert.ErrorIs(t, err, ErrInvalidToken)
		})
	}
}
