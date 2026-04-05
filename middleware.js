import { next } from '@vercel/functions';

const COOKIE = 'lb_staff';

/**
 * @param {string} token
 * @param {string} secret
 */
async function verifySessionToken(token, secret) {
  if (!token || !secret) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payloadPart = token.slice(0, dot);
  const sigPart = token.slice(dot + 1);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payloadPart));
  const expected = base64Url(new Uint8Array(sigBuf));
  if (expected.length !== sigPart.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sigPart.charCodeAt(i);
  }
  if (diff !== 0) return false;

  let json;
  try {
    const raw = base64UrlDecodeToString(payloadPart);
    json = JSON.parse(raw);
  } catch {
    return false;
  }
  if (typeof json.exp !== 'number' || json.exp <= Date.now()) return false;
  return true;
}

/** @param {Uint8Array} bytes */
function base64Url(bytes) {
  let bin = '';
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  const b64 = btoa(bin);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** @param {string} b64url */
function base64UrlDecodeToString(b64url) {
  const pad = b64url.length % 4 === 0 ? '' : '='.repeat(4 - (b64url.length % 4));
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(out);
}

/** @param {string | null} cookieHeader */
function getCookie(name, cookieHeader) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';');
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx === -1) continue;
    const k = p.slice(0, idx).trim();
    if (k === name) return decodeURIComponent(p.slice(idx + 1).trim());
  }
  return null;
}

/** @param {Request} request */
export default async function middleware(request) {
  if (process.env.STAFF_AUTH_DISABLED === '1') {
    return next();
  }

  const secret = process.env.AUTH_SECRET || '';
  const url = new URL(request.url);
  const p = url.pathname;

  if (p === '/login.html' || p === '/api/login' || p === '/api/logout') {
    return next();
  }
  if (p.startsWith('/assets/') || p.startsWith('/_vercel')) {
    return next();
  }
  if (/\.(js|mjs|css|png|jpg|jpeg|gif|webp|svg|ico|woff2?|map)$/i.test(p)) {
    return next();
  }

  const raw = getCookie(COOKIE, request.headers.get('cookie'));
  const ok = raw && secret ? await verifySessionToken(raw, secret) : false;

  if (ok) {
    return next();
  }

  const login = new URL('/login.html', request.url);
  login.searchParams.set('from', p + url.search);
  return Response.redirect(login.toString(), 302);
}

export const config = {
  matcher: '/:path*',
};
