import { createHmac } from 'node:crypto';

const COOKIE = 'lb_staff';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).setHeader('Allow', 'POST').json({ error: 'Method not allowed' });
    return;
  }

  const password = req.body && typeof req.body.password === 'string' ? req.body.password : '';

  const expected = process.env.STAFF_SITE_PASSWORD || '';
  const secret = process.env.AUTH_SECRET || '';

  if (!expected || !secret) {
    res.status(503).json({ error: 'Server not configured (set STAFF_SITE_PASSWORD and AUTH_SECRET on Vercel).' });
    return;
  }

  if (password !== expected) {
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const sig = createHmac('sha256', secret).update(payload).digest('base64url');
  const token = `${payload}.${sig}`;

  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const cookieParts = [
    `${COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=604800',
  ];
  if (secure) cookieParts.push('Secure');

  res.setHeader('Set-Cookie', cookieParts.join('; '));
  res.status(200).json({ ok: true });
}
