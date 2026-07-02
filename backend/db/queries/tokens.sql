-- name: RevokeToken :exec
INSERT INTO revoked_tokens (jti, member_id, expires_at)
VALUES ($1, $2, $3)
ON CONFLICT (jti) DO NOTHING;

-- name: IsTokenRevoked :one
SELECT EXISTS (
    SELECT 1 FROM revoked_tokens WHERE jti = $1
) AS revoked;

-- name: PruneExpiredTokens :execrows
DELETE FROM revoked_tokens
WHERE expires_at < now();
