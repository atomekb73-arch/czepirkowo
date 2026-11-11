import crypto from 'crypto';

const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'czepirkowo-atelier-secret-key-salt-2026';
const VALID_PIN = process.env.ADMIN_PIN || 'czepirkowo';

export function verifyAdminPin(candidate: string): boolean {
  if (!candidate) return false;
  const cleanCandidate = candidate.trim().toLowerCase();
  const cleanValid = VALID_PIN.trim().toLowerCase();
  
  // Bezpieczne porównanie odporne na timing attacks
  const bufA = Buffer.from(cleanCandidate);
  const bufB = Buffer.from(cleanValid);
  
  if (bufA.length !== bufB.length) {
    // Też porównujemy stałoczasowo dla utrudnienia analizy długości
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  
  return crypto.timingSafeEqual(bufA, bufB);
}

export function createSessionToken(): string {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`czepirkowo-admin-${timestamp}`)
    .digest('hex');
  return `${timestamp}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Sesja ważna przez 7 dni (604800000 ms)
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`czepirkowo-admin-${timestampStr}`)
    .digest('hex');

  const bufProvided = Buffer.from(providedSignature);
  const bufExpected = Buffer.from(expectedSignature);

  if (bufProvided.length !== bufExpected.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}
