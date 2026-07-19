import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, EFFECTIVE_JWT_SECRET } from "../config";

const router = express.Router();

router.get('/google', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  res.cookie('oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 5 * 60 * 1000 });

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email%20profile&access_type=offline&state=${state}`;
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.cookies?.oauth_state;
  res.clearCookie('oauth_state');

  if (!expectedState || state !== expectedState) {
    console.warn('OAuth state mismatch — possible CSRF attempt.');
    return res.send(`<html><body><script>
      window.opener.postMessage({ type: 'OAUTH_ERROR', reason: 'state_mismatch' }, window.location.origin);
      window.close();
    </script></body></html>`);
  }

  const protocol = req.headers['x-forwarded-proto'] || req.protocol;
  const host = req.get('host');
  const redirectUri = `${protocol}://${host}/api/auth/google/callback`;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      }).toString()
    });
    
    const tokenData = await tokenResponse.json();
    if (tokenData.error) throw new Error(tokenData.error);
    
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const userInfo = await userInfoResponse.json();

    const token = jwt.sign(userInfo, EFFECTIVE_JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    
    const csrfToken = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', csrfToken, { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
    
    res.send(`
      <html><body><script>
        window.opener.postMessage({ type: 'OAUTH_SUCCESS', user: ${JSON.stringify(userInfo)} }, window.location.origin);
        window.close();
      </script></body></html>
    `);
  } catch (error: unknown) {
    console.error('OAuth error:', error);
    res.send(`
      <html><body><script>
        window.opener.postMessage({ type: 'OAUTH_ERROR' }, window.location.origin);
        window.close();
      </script></body></html>
    `);
  }
});

export default router;
