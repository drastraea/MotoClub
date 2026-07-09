-- +goose Up
-- Optional banner image (a link to externally-hosted media, like gallery items).
ALTER TABLE events ADD COLUMN image_link text;

-- +goose Down
ALTER TABLE events DROP COLUMN image_link;
