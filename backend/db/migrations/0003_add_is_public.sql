-- +goose Up
-- Public visibility flag for landing-page content. Defaults to false so newly
-- created items stay private until an admin opts them in.
ALTER TABLE events ADD COLUMN is_public boolean NOT NULL DEFAULT false;
ALTER TABLE announcements ADD COLUMN is_public boolean NOT NULL DEFAULT false;
ALTER TABLE gallery ADD COLUMN is_public boolean NOT NULL DEFAULT false;

-- +goose Down
ALTER TABLE events DROP COLUMN is_public;
ALTER TABLE announcements DROP COLUMN is_public;
ALTER TABLE gallery DROP COLUMN is_public;
