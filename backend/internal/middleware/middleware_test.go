package middleware

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"

	"github.com/edberto/motoclub-backend/internal/auth"
	authmocks "github.com/edberto/motoclub-backend/internal/auth/mocks"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
	mwmocks "github.com/edberto/motoclub-backend/internal/middleware/mocks"
)

func init() { gin.SetMode(gin.TestMode) }

func ctxWithAuth(header string) (*gin.Context, *httptest.ResponseRecorder) {
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	if header != "" {
		req.Header.Set("Authorization", header)
	}
	c.Request = req
	return c, w
}

func TestJWTAuth_MissingHeader(t *testing.T) {
	c, w := ctxWithAuth("")
	JWTAuth(authmocks.NewMockJWTManager(t), mwmocks.NewMockRevocationChecker(t))(c)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.True(t, c.IsAborted())
}

func TestJWTAuth_NotBearer(t *testing.T) {
	c, w := ctxWithAuth("Basic abc")
	JWTAuth(authmocks.NewMockJWTManager(t), mwmocks.NewMockRevocationChecker(t))(c)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestJWTAuth_ParseError(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{}, auth.ErrInvalidToken)

	c, w := ctxWithAuth("Bearer tok")
	JWTAuth(jwtMgr, mwmocks.NewMockRevocationChecker(t))(c)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestJWTAuth_WrongTokenType(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 1, Role: domain.RoleMember, JTI: "j", Type: auth.TokenTypeRefresh}, nil)

	c, w := ctxWithAuth("Bearer tok")
	JWTAuth(jwtMgr, mwmocks.NewMockRevocationChecker(t))(c)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestJWTAuth_RevocationError(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 1, Role: domain.RoleMember, JTI: "j", Type: auth.TokenTypeAccess}, nil)
	rev := mwmocks.NewMockRevocationChecker(t)
	rev.On("IsRevoked", mock.Anything, "j").Return(false, errors.New("boom"))

	c, w := ctxWithAuth("Bearer tok")
	JWTAuth(jwtMgr, rev)(c)
	assert.Equal(t, http.StatusInternalServerError, w.Code)
}

func TestJWTAuth_Revoked(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 1, Role: domain.RoleMember, JTI: "j", Type: auth.TokenTypeAccess}, nil)
	rev := mwmocks.NewMockRevocationChecker(t)
	rev.On("IsRevoked", mock.Anything, "j").Return(true, nil)

	c, w := ctxWithAuth("Bearer tok")
	JWTAuth(jwtMgr, rev)(c)
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}

func TestJWTAuth_Success(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 9, Role: domain.RoleAdmin, JTI: "j", Type: auth.TokenTypeAccess}, nil)
	rev := mwmocks.NewMockRevocationChecker(t)
	rev.On("IsRevoked", mock.Anything, "j").Return(false, nil)

	c, w := ctxWithAuth("Bearer tok")
	JWTAuth(jwtMgr, rev)(c)

	assert.False(t, c.IsAborted())
	assert.Equal(t, http.StatusOK, w.Code)
	p, ok := httpx.Principal(c)
	require.True(t, ok)
	assert.Equal(t, int64(9), p.ID)
	assert.Equal(t, domain.RoleAdmin, p.Role)
}

func TestOptionalAuth_NoHeader(t *testing.T) {
	c, w := ctxWithAuth("")
	OptionalAuth(authmocks.NewMockJWTManager(t), mwmocks.NewMockRevocationChecker(t))(c)
	assert.False(t, c.IsAborted())
	assert.Equal(t, http.StatusOK, w.Code)
	_, ok := httpx.Principal(c)
	assert.False(t, ok)
}

func TestOptionalAuth_ParseErrorIgnored(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{}, auth.ErrInvalidToken)

	c, w := ctxWithAuth("Bearer tok")
	OptionalAuth(jwtMgr, mwmocks.NewMockRevocationChecker(t))(c)
	assert.False(t, c.IsAborted())
	_, ok := httpx.Principal(c)
	assert.False(t, ok)
	_ = w
}

func TestOptionalAuth_WrongTypeIgnored(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 1, Role: domain.RoleMember, JTI: "j", Type: auth.TokenTypeRefresh}, nil)

	c, _ := ctxWithAuth("Bearer tok")
	OptionalAuth(jwtMgr, mwmocks.NewMockRevocationChecker(t))(c)
	assert.False(t, c.IsAborted())
	_, ok := httpx.Principal(c)
	assert.False(t, ok)
}

func TestOptionalAuth_RevocationError(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 1, Role: domain.RoleMember, JTI: "j", Type: auth.TokenTypeAccess}, nil)
	rev := mwmocks.NewMockRevocationChecker(t)
	rev.On("IsRevoked", mock.Anything, "j").Return(false, errors.New("boom"))

	c, w := ctxWithAuth("Bearer tok")
	OptionalAuth(jwtMgr, rev)(c)
	assert.Equal(t, http.StatusInternalServerError, w.Code)
	assert.True(t, c.IsAborted())
}

func TestOptionalAuth_RevokedIgnored(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 1, Role: domain.RoleMember, JTI: "j", Type: auth.TokenTypeAccess}, nil)
	rev := mwmocks.NewMockRevocationChecker(t)
	rev.On("IsRevoked", mock.Anything, "j").Return(true, nil)

	c, _ := ctxWithAuth("Bearer tok")
	OptionalAuth(jwtMgr, rev)(c)
	assert.False(t, c.IsAborted())
	_, ok := httpx.Principal(c)
	assert.False(t, ok)
}

func TestOptionalAuth_Success(t *testing.T) {
	jwtMgr := authmocks.NewMockJWTManager(t)
	jwtMgr.On("Parse", "tok").Return(auth.Claims{MemberID: 9, Role: domain.RoleAdmin, JTI: "j", Type: auth.TokenTypeAccess}, nil)
	rev := mwmocks.NewMockRevocationChecker(t)
	rev.On("IsRevoked", mock.Anything, "j").Return(false, nil)

	c, _ := ctxWithAuth("Bearer tok")
	OptionalAuth(jwtMgr, rev)(c)
	assert.False(t, c.IsAborted())
	p, ok := httpx.Principal(c)
	require.True(t, ok)
	assert.Equal(t, int64(9), p.ID)
}

func TestRequireRole(t *testing.T) {
	t.Run("unauthenticated", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		RequireRole(domain.RoleAdmin)(c)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
	t.Run("forbidden", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		httpx.SetPrincipal(c, domain.Principal{Role: domain.RoleMember})
		RequireRole(domain.RoleAdmin)(c)
		assert.Equal(t, http.StatusForbidden, w.Code)
	})
	t.Run("allowed", func(t *testing.T) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		httpx.SetPrincipal(c, domain.Principal{Role: domain.RoleAdmin})
		RequireRole(domain.RoleAdmin, domain.RoleSuperadmin)(c)
		assert.False(t, c.IsAborted())
	})
}

func TestRequireSelfOrRole(t *testing.T) {
	setup := func(p *domain.Principal, id string) (*gin.Context, *httptest.ResponseRecorder) {
		w := httptest.NewRecorder()
		c, _ := gin.CreateTestContext(w)
		if p != nil {
			httpx.SetPrincipal(c, *p)
		}
		if id != "" {
			c.Params = gin.Params{{Key: "id", Value: id}}
		}
		return c, w
	}

	t.Run("unauthenticated", func(t *testing.T) {
		c, w := setup(nil, "1")
		RequireSelfOrRole(domain.RoleAdmin)(c)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
	t.Run("privileged role bypasses id", func(t *testing.T) {
		c, w := setup(&domain.Principal{ID: 1, Role: domain.RoleAdmin}, "999")
		RequireSelfOrRole(domain.RoleAdmin)(c)
		assert.False(t, c.IsAborted())
		assert.Equal(t, http.StatusOK, w.Code)
	})
	t.Run("self match", func(t *testing.T) {
		c, _ := setup(&domain.Principal{ID: 5, Role: domain.RoleMember}, "5")
		RequireSelfOrRole(domain.RoleAdmin)(c)
		assert.False(t, c.IsAborted())
	})
	t.Run("id mismatch is 400", func(t *testing.T) {
		c, w := setup(&domain.Principal{ID: 5, Role: domain.RoleMember}, "6")
		RequireSelfOrRole(domain.RoleAdmin)(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bad id param is 400", func(t *testing.T) {
		c, w := setup(&domain.Principal{ID: 5, Role: domain.RoleMember}, "abc")
		RequireSelfOrRole(domain.RoleAdmin)(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
}
