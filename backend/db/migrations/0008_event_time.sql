-- +goose Up
-- Optional start time of an event as HH:MM (Asia/Jakarta). Empty means no time.
ALTER TABLE events ADD COLUMN event_time text NOT NULL DEFAULT ''
    CHECK (event_time = '' OR event_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$');

-- +goose Down
ALTER TABLE events DROP COLUMN event_time;
