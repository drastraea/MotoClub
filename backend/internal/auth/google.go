package auth

import (
	"context"
	"errors"
	"log/slog"

	"google.golang.org/api/idtoken"
)

// ErrInvalidGoogleToken is returned when a Google ID token fails verification.
var ErrInvalidGoogleToken = errors.New("invalid google token")

// GoogleIdentity is the subset of Google ID-token claims we consume.
type GoogleIdentity struct {
	Sub   string
	Email string
	Name  string
}

// GoogleVerifier verifies a Google ID token and returns the identity it asserts.
type GoogleVerifier interface {
	Verify(ctx context.Context, idToken string) (GoogleIdentity, error)
}

// googleVerifier is the production GoogleVerifier backed by google.golang.org/api/idtoken.
type googleVerifier struct {
	clientID string
}

// NewGoogleVerifier constructs a GoogleVerifier that validates tokens against
// the given OAuth client ID.
func NewGoogleVerifier(clientID string) GoogleVerifier {
	return &googleVerifier{clientID: clientID}
}

func (g *googleVerifier) Verify(ctx context.Context, idToken string) (GoogleIdentity, error) {
	payload, err := idtoken.Validate(ctx, idToken, g.clientID)
	if err != nil {
		// Log the real reason (audience mismatch, expired token, bad signature,
		// ...) server-side; the caller only ever sees a sanitized error. This is
		// the line to check when a login/register returns "unauthorized".
		slog.Warn("google id token validation failed",
			"error", err.Error(), "expected_aud", g.clientID)
		return GoogleIdentity{}, ErrInvalidGoogleToken
	}

	identity := GoogleIdentity{Sub: payload.Subject}
	if email, ok := payload.Claims["email"].(string); ok {
		identity.Email = email
	}
	if name, ok := payload.Claims["name"].(string); ok {
		identity.Name = name
	}
	if identity.Sub == "" || identity.Email == "" {
		slog.Warn("google id token missing required claims",
			"has_sub", identity.Sub != "", "has_email", identity.Email != "")
		return GoogleIdentity{}, ErrInvalidGoogleToken
	}
	return identity, nil
}
