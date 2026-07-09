package handler

import (
	"errors"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"github.com/edberto/motoclub-backend/internal/apperr"
	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
	svcmocks "github.com/edberto/motoclub-backend/internal/service/mocks"
)

const validRegisterBody = `{
	"name":"Alice","email":"a@b.com","phoneNumber":"08","placeOfBirth":"Jakarta",
	"dateofBirth":"1990-01-01","address":"addr","instagramUsername":"al","bloodType":"O",
	"emergencyContactName":"Bob","emergencyContactPhoneNumber":"09","motorbikeName":"Vespa",
	"motorbikeSelfieLinkPath":"http://x","googleToken":"tok"
}`

func TestRegister(t *testing.T) {
	t.Run("bind error", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		c, w := ctxJSON(http.MethodPost, "/register", `{"name":"only"}`)
		NewAuthHandler(svc).Register(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("bad date", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		body := `{"name":"Alice","email":"a@b.com","phoneNumber":"08","placeOfBirth":"J","dateofBirth":"bad","address":"a","instagramUsername":"i","bloodType":"O","emergencyContactName":"B","emergencyContactPhoneNumber":"09","motorbikeName":"V","motorbikeSelfieLinkPath":"http://x","googleToken":"t"}`
		c, w := ctxJSON(http.MethodPost, "/register", body)
		NewAuthHandler(svc).Register(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service conflict", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Register", mock.Anything, mock.Anything).Return(domain.Member{}, apperr.ErrConflict)
		c, w := ctxJSON(http.MethodPost, "/register", validRegisterBody)
		NewAuthHandler(svc).Register(c)
		assert.Equal(t, http.StatusConflict, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Register", mock.Anything, mock.MatchedBy(func(in service.RegisterInput) bool {
			return in.Email == "a@b.com" && in.DateOfBirth.Year() == 1990
		})).Return(domain.Member{ID: 7}, nil)
		c, w := ctxJSON(http.MethodPost, "/register", validRegisterBody)
		NewAuthHandler(svc).Register(c)
		assert.Equal(t, http.StatusCreated, w.Code)
		assert.JSONEq(t, `{"id":"7"}`, w.Body.String())
	})
}

func TestLogin(t *testing.T) {
	t.Run("bind error", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		c, w := ctxJSON(http.MethodPost, "/login", `{}`)
		NewAuthHandler(svc).Login(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Login", mock.Anything, "a@b.com", "tok").Return(service.LoginResult{}, apperr.ErrUnauthorized)
		c, w := ctxJSON(http.MethodPost, "/login", `{"email":"a@b.com","googleToken":"tok"}`)
		NewAuthHandler(svc).Login(c)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Login", mock.Anything, "a@b.com", "tok").Return(service.LoginResult{ID: 3, Token: "jwt", RefreshToken: "rjwt"}, nil)
		c, w := ctxJSON(http.MethodPost, "/login", `{"email":"a@b.com","googleToken":"tok"}`)
		NewAuthHandler(svc).Login(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.JSONEq(t, `{"id":"3","token":"jwt","refresh_token":"rjwt"}`, w.Body.String())
	})
}

func TestRefresh(t *testing.T) {
	t.Run("bind error", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		c, w := ctxJSON(http.MethodPost, "/refresh", `{}`)
		NewAuthHandler(svc).Refresh(c)
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Refresh", mock.Anything, "rtok").Return(service.RefreshResult{}, apperr.ErrUnauthorized)
		c, w := ctxJSON(http.MethodPost, "/refresh", `{"refreshToken":"rtok"}`)
		NewAuthHandler(svc).Refresh(c)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Refresh", mock.Anything, "rtok").Return(service.RefreshResult{Token: "a", RefreshToken: "r"}, nil)
		c, w := ctxJSON(http.MethodPost, "/refresh", `{"refreshToken":"rtok"}`)
		NewAuthHandler(svc).Refresh(c)
		assert.Equal(t, http.StatusOK, w.Code)
		assert.JSONEq(t, `{"token":"a","refresh_token":"r"}`, w.Body.String())
	})
}

func TestLogout(t *testing.T) {
	t.Run("unauthenticated", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		c, w := ctxJSON(http.MethodPost, "/logout", "")
		NewAuthHandler(svc).Logout(c)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
	t.Run("service error", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Logout", mock.Anything, mock.Anything, mock.Anything).Return(errors.New("x"))
		c, w := ctxJSON(http.MethodPost, "/logout", "")
		httpx.SetPrincipal(c, domain.Principal{ID: 1})
		NewAuthHandler(svc).Logout(c)
		assert.Equal(t, http.StatusInternalServerError, w.Code)
	})
	t.Run("success", func(t *testing.T) {
		svc := svcmocks.NewMockAuthServicer(t)
		svc.On("Logout", mock.Anything, mock.Anything, mock.Anything).Return(nil)
		c, _ := ctxJSON(http.MethodPost, "/logout", "")
		httpx.SetPrincipal(c, domain.Principal{ID: 1})
		NewAuthHandler(svc).Logout(c)
		assert.Equal(t, http.StatusNoContent, c.Writer.Status())
	})
}
