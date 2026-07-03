-- +goose Up
-- Registered-but-unapproved members are "visitors". Registration now defaults to
-- visitor; approval promotes them to member.
ALTER TABLE members DROP CONSTRAINT members_role_check;
ALTER TABLE members ADD CONSTRAINT members_role_check
    CHECK (role IN ('visitor', 'member', 'admin', 'superadmin'));
ALTER TABLE members ALTER COLUMN role SET DEFAULT 'visitor';

-- +goose Down
ALTER TABLE members ALTER COLUMN role SET DEFAULT 'member';
ALTER TABLE members DROP CONSTRAINT members_role_check;
ALTER TABLE members ADD CONSTRAINT members_role_check
    CHECK (role IN ('member', 'admin', 'superadmin'));
