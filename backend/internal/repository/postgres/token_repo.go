package postgres

import (
	"context"
	"time"

	"github.com/edberto/motoclub-backend/db/sqlc"
)

// TokenRepo implements repository.TokenRepository.
type TokenRepo struct {
	q sqlc.Querier
}

// Revoke records a token's jti so it is rejected on subsequent requests.
func (r *TokenRepo) Revoke(ctx context.Context, jti string, memberID int64, expiresAt time.Time) error {
	return r.q.RevokeToken(ctx, sqlc.RevokeTokenParams{Jti: jti, MemberID: memberID, ExpiresAt: expiresAt})
}

// IsRevoked reports whether a token's jti has been revoked.
func (r *TokenRepo) IsRevoked(ctx context.Context, jti string) (bool, error) {
	return r.q.IsTokenRevoked(ctx, jti)
}

// PruneExpired deletes revocation rows whose tokens have already expired.
func (r *TokenRepo) PruneExpired(ctx context.Context) (int64, error) {
	return r.q.PruneExpiredTokens(ctx)
}
