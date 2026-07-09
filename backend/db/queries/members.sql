-- name: CreateMember :one
INSERT INTO members (
    google_sub, email, name, phone_number, place_of_birth, date_of_birth,
    address, instagram_username, blood_type, emergency_contact_name,
    emergency_contact_phone_number, motorbike_name, motorbike_selfie_link_path
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
)
RETURNING *;

-- name: GetMemberByID :one
SELECT * FROM members
WHERE id = $1 AND deleted_at IS NULL;

-- name: GetMemberByGoogleSub :one
SELECT * FROM members
WHERE google_sub = $1 AND deleted_at IS NULL;

-- name: GetMemberByEmail :one
SELECT * FROM members
WHERE email = $1 AND deleted_at IS NULL;

-- name: BackfillGoogleSub :one
UPDATE members
SET google_sub = $2
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: CountPendingRegistrations :one
SELECT count(*) FROM members
WHERE status = 'PENDING_APPROVAL' AND deleted_at IS NULL;

-- name: CountMembers :one
SELECT count(*) FROM members
WHERE deleted_at IS NULL;

-- name: ListPendingRegistrations :many
SELECT id, name, email, created_at FROM members
WHERE status = 'PENDING_APPROVAL' AND deleted_at IS NULL
ORDER BY created_at;

-- name: ListMembers :many
SELECT * FROM members
WHERE deleted_at IS NULL
ORDER BY created_at;

-- name: UpdateMemberStatus :one
UPDATE members
SET status = $2, remarks = $3, approved_at = $4, role = $5
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: UpdateMemberRole :one
UPDATE members
SET role = $2
WHERE id = $1 AND deleted_at IS NULL
RETURNING *;

-- name: SoftDeleteMember :execrows
UPDATE members
SET deleted_at = now()
WHERE id = $1 AND deleted_at IS NULL;

-- name: CountSuperadmins :one
SELECT count(*) FROM members
WHERE role = 'superadmin' AND deleted_at IS NULL;
