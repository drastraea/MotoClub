/**
 * The member id inside a scanned QR payload. A member card encodes
 * `<origin>/admin/members/<id>`; a bare number (typed in by hand) also works.
 * Returns null for anything else, so a random QR code is ignored.
 */
export function parseMemberId(text: string): string | null {
  const t = text.trim();
  if (/^\d{1,18}$/.test(t)) return t;
  try {
    const m = new URL(t).pathname.match(/^\/admin\/members\/(\d{1,18})\/?$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}
