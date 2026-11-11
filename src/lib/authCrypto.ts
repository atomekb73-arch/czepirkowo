import crypto from 'crypto';

const SECRET_KEY = process.env.ADMIN_SESSION_SECRET || 'czepirkowo-atelier-secret-key-salt-2026';
const DEFAULT_PIN = process.env.ADMIN_PIN || 'czepirkowo';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://biqchlceydqjbisbocrh.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_J_97ulbIpob2_ak_ERbGBQ_uVunvLzw';

// Ścieżka do przechowywania hasha w Storage
const PIN_STORAGE_PATH = '_sys_sec/pin_hash.json';

export function hashPin(pin: string): string {
  return crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`czepirkowo-pin-${pin.trim().toLowerCase()}`)
    .digest('hex');
}

export async function getStoredPinHash(): Promise<string | null> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/public/product-images/${PIN_STORAGE_PATH}?t=${Date.now()}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.hash || null;
  } catch {
    return null;
  }
}

export async function saveNewPin(newPin: string): Promise<boolean> {
  try {
    const hash = hashPin(newPin);
    const body = JSON.stringify({
      hash,
      updatedAt: new Date().toISOString(),
    });

    const res = await fetch(
      `${SUPABASE_URL}/storage/v1/object/product-images/${PIN_STORAGE_PATH}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'x-upsert': 'true',
        },
        body,
      }
    );

    return res.ok;
  } catch (err) {
    console.error('Błąd zapisu nowego PIN-u:', err);
    return false;
  }
}

export async function verifyAdminPin(candidate: string): Promise<boolean> {
  if (!candidate) return false;
  const cleanCandidate = candidate.trim().toLowerCase();

  // Sprawdzamy czy Magda ustawiła własny PIN w bazie
  const storedHash = await getStoredPinHash();

  if (storedHash) {
    const candidateHash = hashPin(cleanCandidate);
    const bufA = Buffer.from(candidateHash);
    const bufB = Buffer.from(storedHash);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }

  // W przeciwnym razie porównaj z domyślnym PIN-em
  const cleanValid = DEFAULT_PIN.trim().toLowerCase();
  const bufA = Buffer.from(cleanCandidate);
  const bufB = Buffer.from(cleanValid);
  if (bufA.length !== bufB.length) {
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
