package handler

import (
	"strconv"

	"github.com/edberto/motoclub-backend/internal/domain"
	"github.com/edberto/motoclub-backend/internal/util"
)

func idString(id int64) string { return strconv.FormatInt(id, 10) }

// --- Gallery ---

type galleryContent struct {
	ID        string `json:"id"`
	Link      string `json:"link"`
	IsPublic  bool   `json:"is_public"`
	CreatedAt string `json:"created_at"`
}

type galleryListResponse struct {
	Contents []galleryContent `json:"contents"`
}

func toGalleryList(items []domain.GalleryItem) galleryListResponse {
	contents := make([]galleryContent, 0, len(items))
	for _, it := range items {
		contents = append(contents, galleryContent{
			ID:        idString(it.ID),
			Link:      it.Link,
			IsPublic:  it.IsPublic,
			CreatedAt: util.FormatJakartaDate(it.CreatedAt),
		})
	}
	return galleryListResponse{Contents: contents}
}

// --- Events ---

type eventSummary struct {
	ID            string  `json:"id"`
	Title         string  `json:"title"`
	Date          string  `json:"date"`
	ImageLink     *string `json:"image_link"`
	IsPublic      bool    `json:"is_public"`
	LastUpdatedAt string  `json:"last_updated_at"`
}

type eventListResponse struct {
	Events []eventSummary `json:"events"`
}

func toEventList(events []domain.Event) eventListResponse {
	out := make([]eventSummary, 0, len(events))
	for _, e := range events {
		out = append(out, eventSummary{
			ID:            idString(e.ID),
			Title:         e.Title,
			Date:          util.FormatJakartaDate(e.Date),
			ImageLink:     e.ImageLink,
			IsPublic:      e.IsPublic,
			LastUpdatedAt: util.FormatJakartaDate(e.LastUpdatedAt),
		})
	}
	return eventListResponse{Events: out}
}

type eventDetail struct {
	ID            string  `json:"id"`
	Title         string  `json:"title"`
	Date          string  `json:"date"`
	Location      *string `json:"location"`
	Description   string  `json:"description"`
	ImageLink     *string `json:"image_link"`
	IsPublic      bool    `json:"is_public"`
	LastUpdatedAt string  `json:"last_updated_at"`
}

func toEventDetail(e domain.Event) eventDetail {
	return eventDetail{
		ID:            idString(e.ID),
		Title:         e.Title,
		Date:          util.FormatJakartaDate(e.Date),
		Location:      e.Location,
		Description:   e.Description,
		ImageLink:     e.ImageLink,
		IsPublic:      e.IsPublic,
		LastUpdatedAt: util.FormatJakartaDate(e.LastUpdatedAt),
	}
}

type idResponse struct {
	ID string `json:"id"`
}

// --- Announcements ---

type announcementItem struct {
	ID            string `json:"id"`
	Title         string `json:"title"`
	Description   string `json:"description"`
	IsPublic      bool   `json:"is_public"`
	LastUpdatedAt string `json:"last_updated_at"`
}

type announcementListResponse struct {
	Announcements []announcementItem `json:"announcements"`
}

func toAnnouncementItem(a domain.Announcement) announcementItem {
	return announcementItem{
		ID:            idString(a.ID),
		Title:         a.Title,
		Description:   a.Description,
		IsPublic:      a.IsPublic,
		LastUpdatedAt: util.FormatJakartaDate(a.LastUpdatedAt),
	}
}

func toAnnouncementList(items []domain.Announcement) announcementListResponse {
	out := make([]announcementItem, 0, len(items))
	for _, a := range items {
		out = append(out, toAnnouncementItem(a))
	}
	return announcementListResponse{Announcements: out}
}

// --- Members ---

type profileResponse struct {
	Name                        string  `json:"name"`
	Email                       string  `json:"email"`
	PhoneNumber                 string  `json:"phoneNumber"`
	PlaceOfBirth                string  `json:"placeOfBirth"`
	DateOfBirth                 string  `json:"dateofBirth"`
	Address                     string  `json:"address"`
	InstagramUsername           string  `json:"instagramUsername"`
	BloodType                   string  `json:"bloodType"`
	EmergencyContactName        string  `json:"emergencyContactName"`
	EmergencyContactPhoneNumber string  `json:"emergencyContactPhoneNumber"`
	MotorbikeName               string  `json:"motorbikeName"`
	MotorbikeSelfieLinkPath     string  `json:"motorbikeSelfieLinkPath"`
	Status                      string  `json:"status"`
	CreatedAt                   string  `json:"created_at"`
	ApprovedAt                  *string `json:"approved_at"`
}

func toProfile(m domain.Member) profileResponse {
	return profileResponse{
		Name:                        m.Name,
		Email:                       m.Email,
		PhoneNumber:                 m.PhoneNumber,
		PlaceOfBirth:                m.PlaceOfBirth,
		DateOfBirth:                 util.FormatJakartaDate(m.DateOfBirth),
		Address:                     m.Address,
		InstagramUsername:           m.InstagramUsername,
		BloodType:                   m.BloodType,
		EmergencyContactName:        m.EmergencyContactName,
		EmergencyContactPhoneNumber: m.EmergencyContactPhoneNumber,
		MotorbikeName:               m.MotorbikeName,
		MotorbikeSelfieLinkPath:     m.MotorbikeSelfieLinkPath,
		Status:                      string(m.Status),
		CreatedAt:                   util.FormatJakartaDate(m.CreatedAt),
		ApprovedAt:                  util.FormatJakartaDatePtr(m.ApprovedAt),
	}
}

type registrationItem struct {
	MemberID     string `json:"member_id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	RegisteredAt string `json:"registered_at"`
}

type registrationListResponse struct {
	Registrations []registrationItem `json:"registrations"`
}

func toRegistrationList(regs []domain.Registration) registrationListResponse {
	out := make([]registrationItem, 0, len(regs))
	for _, r := range regs {
		out = append(out, registrationItem{
			MemberID:     idString(r.MemberID),
			Name:         r.Name,
			Email:        r.Email,
			RegisteredAt: util.FormatJakartaDate(r.RegisteredAt),
		})
	}
	return registrationListResponse{Registrations: out}
}

type memberItem struct {
	ID               string  `json:"id"`
	Email            string  `json:"email"`
	Role             string  `json:"role"`
	RegistrationDate string  `json:"registration_date"`
	ApprovalDate     *string `json:"approval_date"`
}

type memberListResponse struct {
	Members []memberItem `json:"members"`
}

func toMemberList(members []domain.Member) memberListResponse {
	out := make([]memberItem, 0, len(members))
	for _, m := range members {
		out = append(out, memberItem{
			ID:               idString(m.ID),
			Email:            m.Email,
			Role:             string(m.Role),
			RegistrationDate: util.FormatJakartaDate(m.CreatedAt),
			ApprovalDate:     util.FormatJakartaDatePtr(m.ApprovedAt),
		})
	}
	return memberListResponse{Members: out}
}

type countResponse struct {
	Count int64 `json:"count"`
}
