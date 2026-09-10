-- +goose Up
-- Editable landing-page content, stored as a single JSON document (one row).
CREATE TABLE site_content (
    id              smallint    PRIMARY KEY DEFAULT 1,
    data            jsonb       NOT NULL,
    last_updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT site_content_singleton CHECK (id = 1)
);

-- +goose Down
DROP TABLE site_content;
