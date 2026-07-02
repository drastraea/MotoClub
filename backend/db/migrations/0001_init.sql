-- +goose Up
-- +goose StatementBegin
CREATE FUNCTION set_last_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.last_updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- +goose StatementEnd

-- +goose StatementBegin
CREATE TABLE members (
    id                             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    google_sub                     text        NOT NULL,
    email                          text        NOT NULL,
    name                           text        NOT NULL,
    phone_number                   text        NOT NULL,
    place_of_birth                 text        NOT NULL,
    date_of_birth                  timestamptz NOT NULL,
    address                        text        NOT NULL,
    instagram_username             text        NOT NULL,
    blood_type                     text        NOT NULL,
    emergency_contact_name         text        NOT NULL,
    emergency_contact_phone_number text        NOT NULL,
    motorbike_name                 text        NOT NULL,
    motorbike_selfie_link_path     text        NOT NULL,
    role                           text        NOT NULL DEFAULT 'member'
        CHECK (role IN ('member', 'admin', 'superadmin')),
    status                         text        NOT NULL DEFAULT 'PENDING_APPROVAL'
        CHECK (status IN ('PENDING_APPROVAL', 'APPROVED', 'REJECTED')),
    remarks                        text,
    approved_at                    timestamptz,
    created_at                     timestamptz NOT NULL DEFAULT now(),
    last_updated_at                timestamptz NOT NULL DEFAULT now(),
    deleted_at                     timestamptz
);
-- +goose StatementEnd

CREATE UNIQUE INDEX members_google_sub_key ON members (google_sub) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX members_email_key ON members (email) WHERE deleted_at IS NULL;
CREATE INDEX members_status_idx ON members (status) WHERE deleted_at IS NULL;

CREATE TRIGGER members_set_last_updated_at
    BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION set_last_updated_at();

-- +goose StatementBegin
CREATE TABLE events (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title           text        NOT NULL,
    description     text        NOT NULL,
    event_date      timestamptz NOT NULL,
    location        text,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
-- +goose StatementEnd

CREATE INDEX events_event_date_idx ON events (event_date) WHERE deleted_at IS NULL;

CREATE TRIGGER events_set_last_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION set_last_updated_at();

-- +goose StatementBegin
CREATE TABLE announcements (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title           text        NOT NULL,
    description     text        NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
-- +goose StatementEnd

CREATE INDEX announcements_created_at_idx ON announcements (created_at) WHERE deleted_at IS NULL;

CREATE TRIGGER announcements_set_last_updated_at
    BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION set_last_updated_at();

-- +goose StatementBegin
CREATE TABLE gallery (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    link            text        NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
-- +goose StatementEnd

CREATE INDEX gallery_created_at_idx ON gallery (created_at) WHERE deleted_at IS NULL;

CREATE TRIGGER gallery_set_last_updated_at
    BEFORE UPDATE ON gallery
    FOR EACH ROW EXECUTE FUNCTION set_last_updated_at();

-- +goose StatementBegin
CREATE TABLE revoked_tokens (
    jti             text        PRIMARY KEY,
    member_id       bigint      NOT NULL,
    expires_at      timestamptz NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now(),
    last_updated_at timestamptz NOT NULL DEFAULT now(),
    deleted_at      timestamptz
);
-- +goose StatementEnd

CREATE INDEX revoked_tokens_expires_at_idx ON revoked_tokens (expires_at);

CREATE TRIGGER revoked_tokens_set_last_updated_at
    BEFORE UPDATE ON revoked_tokens
    FOR EACH ROW EXECUTE FUNCTION set_last_updated_at();

-- +goose Down
DROP TABLE IF EXISTS revoked_tokens;
DROP TABLE IF EXISTS gallery;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS members;
DROP FUNCTION IF EXISTS set_last_updated_at;
