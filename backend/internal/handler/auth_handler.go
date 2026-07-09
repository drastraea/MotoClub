package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"github.com/edberto/motoclub-backend/internal/httpx"
	"github.com/edberto/motoclub-backend/internal/service"
	"github.com/edberto/motoclub-backend/internal/util"
)

// AuthHandler serves registration, login and logout.
type AuthHandler struct {
	svc service.AuthServicer
}

// NewAuthHandler constructs an AuthHandler.
func NewAuthHandler(svc service.AuthServicer) *AuthHandler {
	return &AuthHandler{svc: svc}
}

type registerRequest struct {
	Name                        string `json:"name" binding:"required"`
	Email                       string `json:"email" binding:"required,email"`
	PhoneNumber                 string `json:"phoneNumber" binding:"required"`
	PlaceOfBirth                string `json:"placeOfBirth" binding:"required"`
	DateOfBirth                 string `json:"dateofBirth" binding:"required"`
	Address                     string `json:"address" binding:"required"`
	InstagramUsername           string `json:"instagramUsername" binding:"required"`
	BloodType                   string `json:"bloodType" binding:"required"`
	EmergencyContactName        string `json:"emergencyContactName" binding:"required"`
	EmergencyContactPhoneNumber string `json:"emergencyContactPhoneNumber" binding:"required"`
	MotorbikeName               string `json:"motorbikeName" binding:"required"`
	MotorbikeSelfieLinkPath     string `json:"motorbikeSelfieLinkPath" binding:"required"`
	GoogleToken                 string `json:"googleToken" binding:"required"`
}

// Register handles POST /register.
func (h *AuthHandler) Register(c *gin.Context) {
	var req registerRequest
	if !bindJSON(c, &req) {
		return
	}
	dob, err := util.ParseJakartaDate(req.DateOfBirth)
	if err != nil {
		httpx.AbortStatus(c, http.StatusBadRequest, "invalid dateofBirth, expected YYYY-MM-DD")
		return
	}

	member, err := h.svc.Register(c.Request.Context(), service.RegisterInput{
		Name:                        req.Name,
		Email:                       req.Email,
		PhoneNumber:                 req.PhoneNumber,
		PlaceOfBirth:                req.PlaceOfBirth,
		DateOfBirth:                 dob,
		Address:                     req.Address,
		InstagramUsername:           req.InstagramUsername,
		BloodType:                   req.BloodType,
		EmergencyContactName:        req.EmergencyContactName,
		EmergencyContactPhoneNumber: req.EmergencyContactPhoneNumber,
		MotorbikeName:               req.MotorbikeName,
		MotorbikeSelfieLinkPath:     req.MotorbikeSelfieLinkPath,
		GoogleToken:                 req.GoogleToken,
	})
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusCreated, idResponse{ID: idString(member.ID)})
}

type loginRequest struct {
	Email       string `json:"email" binding:"required,email"`
	GoogleToken string `json:"googleToken" binding:"required"`
}

type loginResponse struct {
	ID           string `json:"id"`
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
}

// Login handles POST /login.
func (h *AuthHandler) Login(c *gin.Context) {
	var req loginRequest
	if !bindJSON(c, &req) {
		return
	}
	result, err := h.svc.Login(c.Request.Context(), req.Email, req.GoogleToken)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, loginResponse{
		ID:           idString(result.ID),
		Token:        result.Token,
		RefreshToken: result.RefreshToken,
	})
}

type refreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

type refreshResponse struct {
	Token        string `json:"token"`
	RefreshToken string `json:"refresh_token"`
}

// Refresh handles POST /refresh: exchange a refresh token for a new token pair.
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req refreshRequest
	if !bindJSON(c, &req) {
		return
	}
	result, err := h.svc.Refresh(c.Request.Context(), req.RefreshToken)
	if err != nil {
		httpx.Error(c, err)
		return
	}
	c.JSON(http.StatusOK, refreshResponse{Token: result.Token, RefreshToken: result.RefreshToken})
}

// Logout handles POST /logout. The refresh token may be supplied in the body so
// it can be revoked alongside the access token.
func (h *AuthHandler) Logout(c *gin.Context) {
	principal, ok := httpx.Principal(c)
	if !ok {
		httpx.AbortStatus(c, http.StatusUnauthorized, "unauthenticated")
		return
	}
	var req struct {
		RefreshToken string `json:"refreshToken"`
	}
	_ = c.ShouldBindJSON(&req) // body is optional
	if err := h.svc.Logout(c.Request.Context(), principal, req.RefreshToken); err != nil {
		httpx.Error(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}
