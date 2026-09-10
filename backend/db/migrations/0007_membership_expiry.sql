-- +goose Up
-- Membership runs three years from approval. The EXPIRED state is derived at
-- read time from this column, so the status CHECK constraint is left untouched.
ALTER TABLE members ADD COLUMN membership_expires_at timestamptz;

UPDATE members
SET membership_expires_at = approved_at + interval '3 years'
WHERE status = 'APPROVED' AND approved_at IS NOT NULL;

-- +goose Down
ALTER TABLE members DROP COLUMN membership_expires_at;
