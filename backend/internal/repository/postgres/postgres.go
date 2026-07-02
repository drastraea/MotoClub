// Package postgres implements the repository interfaces on top of the
// sqlc-generated queries and a pgx connection pool. It is the only package that
// imports db/sqlc; everything above it works in terms of domain types.
package postgres

import (
	"errors"

	"github.com/jackc/pgx/v5"

	"github.com/edberto/motoclub-backend/db/sqlc"
	"github.com/edberto/motoclub-backend/internal/apperr"
)

// mapGetErr normalises a sqlc "get" error into the shared sentinel set.
func mapGetErr(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return apperr.ErrNotFound
	}
	return err
}

// affected converts a soft-delete rows-affected count into an error, treating
// zero rows as a not-found.
func affected(rows int64, err error) error {
	if err != nil {
		return err
	}
	if rows == 0 {
		return apperr.ErrNotFound
	}
	return nil
}

// Repositories bundles the concrete repositories sharing one Queries handle.
type Repositories struct {
	Members       *MemberRepo
	Events        *EventRepo
	Announcements *AnnouncementRepo
	Gallery       *GalleryRepo
	Tokens        *TokenRepo
}

// New builds all repositories from a sqlc DBTX (e.g. a *pgxpool.Pool).
func New(db sqlc.DBTX) *Repositories {
	q := sqlc.New(db)
	return &Repositories{
		Members:       &MemberRepo{q: q},
		Events:        &EventRepo{q: q},
		Announcements: &AnnouncementRepo{q: q},
		Gallery:       &GalleryRepo{q: q},
		Tokens:        &TokenRepo{q: q},
	}
}
