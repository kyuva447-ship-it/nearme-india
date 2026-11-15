import crypto from 'crypto';
import { cookies } from 'next/headers';

function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.RAZORPAY_KEY_SECRET ||
    process.env.OWNER_PASSWORD ||
    'nearme-india-dev-session-secret'
  ).trim();
}

export function signSessionToken(phone: string): string {
  const payload = Buffer.from(JSON.stringify({ phone, iat: Date.now() })).toString('base64url');
  const sig = crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;

  const expected = crypto
    .createHmac('sha256', getSessionSecret())
    .update(payload)
    .digest('base64url');

  const sigBuf = Buffer.from(sig, 'utf8');
  const expectedBuf = Buffer.from(expected, 'utf8');
  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof parsed.phone === 'string' && parsed.phone.length >= 10 ? parsed.phone : null;
  } catch {
    return null;
  }
}

export function getVerifiedSessionPhone(): string | null {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get('nearme_session')?.value;
    return verifySessionToken(raw);
  } catch {
    return null;
  }
}

function getExpectedOwnerCredential(): string {
  return (process.env.OWNER_PASSWORD || process.env.OWNER_PIN || '748599').trim();
}

export function isOwnerPasswordConfigured(): boolean {
  return Boolean(getExpectedOwnerCredential());
}

export function isAuthorizedOwnerRequest(req: Request, bodyCredential?: unknown): boolean {
  const expected = getExpectedOwnerCredential();
  if (!expected) return false;

  const headerCred =
    req.headers.get('x-owner-password')?.trim() ||
    req.headers.get('x-owner-pin')?.trim() ||
    '';
  const authHeader = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() || '';
  const supplied =
    typeof bodyCredential === 'string' && bodyCredential.trim()
      ? bodyCredential.trim()
      : headerCred || authHeader;

  if (!supplied) return false;

  const a = Buffer.from(supplied, 'utf8');
  const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function isAuthorizedCronOrOwner(req: Request, bodyCredential?: unknown): boolean {
  const cronSecret = (process.env.CRON_SECRET || '').trim();
  const authHeader = req.headers.get('authorization')?.trim() || '';
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  return isAuthorizedOwnerRequest(req, bodyCredential);
}
