interface DecodedAccessToken {
  sub: string;
  role: string;
  exp: number;
}

/**
 * Decodes a JWT payload WITHOUT verifying its signature. This is only ever
 * used for UX purposes (role-based redirect, showing/hiding nav items) —
 * the backend is the sole authority for actual authorization (section 27).
 * Never trust this for anything security-sensitive.
 */
export function decodeAccessToken(token: string): DecodedAccessToken | null {
  try {
    const [, payloadB64] = token.split('.');
    if (!payloadB64) return null;
    // atob() gives back a raw byte string; JWT payloads are UTF-8 JSON (the
    // `role` claim carries Vietnamese text like "Quản trị hệ thống"), so a
    // plain atob()+JSON.parse() would silently mojibake every non-ASCII
    // role name. Re-decode the byte string as UTF-8 before parsing.
    const binary = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const utf8Json = decodeURIComponent(
      Array.from(binary, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(utf8Json) as DecodedAccessToken;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const decoded = decodeAccessToken(token);
  if (!decoded) return true;
  return decoded.exp * 1000 <= Date.now();
}
