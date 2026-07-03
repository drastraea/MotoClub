// Central runtime configuration. Values come from NEXT_PUBLIC_* environment
// variables so the backend hostname (and Google OAuth client) can differ between
// local and production without code changes.
//
// NOTE: NEXT_PUBLIC_* vars are inlined at BUILD time. For Docker, they are passed
// as build args (see Dockerfile / compose.yaml). Change them per environment by
// rebuilding with the appropriate values.

export const config = {
  /** Base URL of the Go backend API, e.g. http://localhost:8080 (local) or
   *  https://api.motoclub.example (prod). */
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080").replace(/\/$/, ""),

  /** Google OAuth Client ID used for Google Sign-In. Must match the backend's
   *  GOOGLE_CLIENT_ID and have http://localhost:3000 (and the prod origin) as an
   *  authorized JavaScript origin. Empty string disables Sign-In. */
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
} as const;
