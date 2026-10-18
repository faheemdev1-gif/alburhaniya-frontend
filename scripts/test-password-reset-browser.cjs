// Browser -> actual Express auth routes; database and SMTP are isolated fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const jwt = require('../server/node_modules/jsonwebtoken');
const nodemailer = require('../server/node_modules/nodemailer');
process.env.JWT_SECRET = 'isolated-browser-password-reset';
Object.assign(process.env, { SMTP_HOST: 'smtp.example.test', SMTP_PORT: '465', SMTP_USER: 'resend', SMTP_PASS: 'test-only', CONTACT_FROM_EMAIL: 'info@example.test' });
const app = require('../server/dist/app').default;
const User = require('../server/dist/models/User').default;
const { passwordResetFixture } = require('../server/tests/helpers/passwordResetFixture.cjs');
const f = passwordResetFixture(User, nodemailer);
const admin = f.seed({ email: 'owner@example.test' });

async function main() {
  const backend = app.listen(0, '127.0.0.1'); await new Promise(r => backend.once('listening', r));
  const base = `http://127.0.0.1:${backend.address().port}`;
  const dist = path.resolve(__dirname, '../dist');
  const frontend = http.createServer((req, res) => {
    let file = path.join(dist, new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(dist) || !fs.existsSync(file) || !fs.statSync(file).isFile()) file = path.join(dist, 'index.html');
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' })[path.extname(file)] || 'application/octet-stream'); res.end(fs.readFileSync(file));
  });
  await new Promise(r => frontend.listen(0, '127.0.0.1', r));
  const origin = `http://127.0.0.1:${frontend.address().port}`; process.env.ADMIN_SITE_URL = origin;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'], ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}) });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const failures = []; page.on('pageerror', error => failures.push(error.message));
    await page.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.origin === origin) return route.continue();
      if (url.pathname.startsWith('/api/auth')) return route.fulfill({ response: await route.fetch({ url: base + url.pathname + url.search }) });
      if (!url.pathname.startsWith('/api/')) return route.abort();
      const data = url.pathname === '/api/articles' ? { articles: [], total: 0 } : url.pathname === '/api/events' ? { events: [], total: 0 } : url.pathname === '/api/gallery' ? { items: [], total: 0 } : {};
      return route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
    });
    await page.goto(origin + '/admin/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await page.getByLabel('Account email').fill(admin.email);
    const pass = process.env.SMTP_PASS; delete process.env.SMTP_PASS;
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await page.getByRole('alert').filter({ hasText: 'temporarily unavailable' }).waitFor();
    assert.equal(await page.getByLabel('Account email').inputValue(), admin.email); process.env.SMTP_PASS = pass;
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await page.getByRole('status').filter({ hasText: 'If an account exists' }).waitFor();
    for (let i = 0; i < 100 && !f.mail.length; i++) await new Promise(r => setTimeout(r, 10));
    const link = f.mail[0].text.match(/http:\/\/[^\s]+\/admin\/reset-password#token=[a-f0-9]{64}/)[0];
    assert.equal(f.mail[0].to, admin.email);
    const oldToken = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET);
    await page.evaluate(token => localStorage.setItem('communitas_token', token), oldToken);
    await page.goto(link);
    await page.getByRole('heading', { name: 'Reset password', exact: true }).waitFor();
    await page.waitForFunction(() => location.hash === '');
    assert.equal(await page.locator('meta[name="referrer"]').getAttribute('content'), 'no-referrer');
    await page.getByLabel('New password', { exact: true }).fill('Updated-password-123');
    await page.getByLabel('Confirm password').fill('Different-password');
    await page.getByRole('button', { name: 'Reset password', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'do not match' }).waitFor();
    await page.getByLabel('Confirm password').fill('Updated-password-123');
    f.state.failStore = true;
    await page.getByRole('button', { name: 'Reset password', exact: true }).click();
    await page.getByRole('alert').filter({ hasText: 'could not be reset' }).waitFor();
    assert.equal(await page.getByLabel('New password', { exact: true }).inputValue(), 'Updated-password-123'); f.state.failStore = false;
    await page.screenshot({ path: path.resolve(__dirname, '../../../password-reset-desktop.png') });
    await page.getByRole('button', { name: 'Reset password', exact: true }).click();
    await page.getByRole('status').filter({ hasText: 'Your password has been reset' }).waitFor();
    assert.equal(await page.evaluate(() => localStorage.getItem('communitas_token')), null);
    assert.equal((await fetch(base + '/api/auth/me', { headers: { Authorization: 'Bearer ' + oldToken } })).status, 401);
    await page.getByRole('link', { name: 'Back to sign in' }).click();
    await page.getByLabel('Email', { exact: true }).fill(admin.email); await page.getByLabel('Password', { exact: true }).fill('Old-password-123');
    await page.getByRole('button', { name: 'Sign In' }).click(); await page.getByRole('alert').waitFor();
    await page.getByLabel('Password', { exact: true }).fill('Updated-password-123'); await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL(origin + '/admin');
    console.log('Email recovery, SMTP/storage errors, matching passwords, old-session revocation and real new-password sign-in passed.');

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(link); await page.getByLabel('New password', { exact: true }).fill('Another-password-123'); await page.getByLabel('Confirm password').fill('Another-password-123');
    await page.getByRole('button', { name: 'Reset password', exact: true }).click(); await page.getByRole('link', { name: 'Request a new reset link' }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Reset password', exact: true }).count(), 0);
    await page.getByRole('link', { name: 'Request a new reset link' }).click(); await page.getByLabel('Account email').waitFor();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.resolve(__dirname, '../../../password-reset-mobile.png') });
    await page.goto(origin + '/admin/reset-password'); await page.getByRole('alert').filter({ hasText: 'invalid or has expired' }).waitFor();
    await page.goto(origin + '/admin/reset-password#token=invalid'); await page.getByRole('link', { name: 'Request a new reset link' }).waitFor();
    assert.deepEqual(failures, []);
    console.log('Mobile recovery, missing/invalid/consumed reset links and safe token handling passed.');
  } finally {
    if (browser) await browser.close(); f.restore();
    for (const server of [frontend, backend]) { server.closeAllConnections(); await new Promise(r => server.close(r)); }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
