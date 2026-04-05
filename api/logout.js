const COOKIE = 'lb_staff';

export default function handler(req, res) {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const parts = [`${COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));

  if (req.method === 'GET' || req.method === 'HEAD') {
    res.redirect(302, '/login.html');
    return;
  }
  res.status(204).end();
}
