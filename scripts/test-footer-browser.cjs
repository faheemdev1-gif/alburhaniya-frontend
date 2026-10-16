const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');

async function main() {
  const dist = path.resolve(__dirname, '../dist');
  const server = http.createServer((req, res) => {
    let name = path.join(dist, new URL(req.url, 'http://localhost').pathname);
    if (!name.startsWith(dist) || !fs.existsSync(name) || !fs.statSync(name).isFile()) name = path.join(dist, 'index.html');
    res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' })[path.extname(name)] || 'application/octet-stream');
    res.end(fs.readFileSync(name));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH } : {}), args: ['--no-sandbox', '--disable-dev-shm-usage'] });
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === origin) return route.continue();
        if (!url.pathname.startsWith('/api/')) return route.abort();
        let data = {};
        if (url.pathname === '/api/site-content') data = {
          branding: {
            footerLinks: [{ label: 'Hire Our Space', href: '/missing-page' }],
            programmeLinks: [{ label: 'Old programme', href: '#' }],
            infoLinks: [{ label: 'Privacy Policy', href: '#' }],
          },
          contact: { facebook: '#', instagram: 'javascript:alert(1)', twitter: 'not-a-url', youtube: 'https://www.youtube.com/@example', whatsapp: '' },
        };
        else if (url.pathname === '/api/events') data = { events: [], total: 0, pages: 1, page: 1 };
        else if (url.pathname === '/api/articles') data = { articles: [], total: 0, pages: 1, page: 1 };
        else if (url.pathname === '/api/articles/featured') data = null;
        else if (url.pathname === '/api/gallery') data = { items: [], total: 0 };
        await route.fulfill({ contentType: 'application/json', body: JSON.stringify(data) });
      });
      await page.goto(origin);
      const footer = page.locator('#footer');
      await footer.locator('a[aria-label="youtube"]').waitFor();
      assert.equal(await footer.getByText(/Privacy Policy|Old programme|Hire Our Space/).count(), 0, 'Saved obsolete CMS links must not reappear');
      const hrefs = await footer.locator('a').evaluateAll(links => links.map(link => link.getAttribute('href')));
      assert.deepEqual(hrefs, ['/', '/', '/events', '/articles', '/gallery', '/donate', 'mailto:info@alburhaniyainternational.org.uk', 'tel:+447459424579', 'https://www.youtube.com/@example']);
      const social = footer.locator('a[aria-label="youtube"]');
      assert.equal(await social.getAttribute('target'), '_blank');
      assert.match(await social.getAttribute('rel'), /noopener/);

      assert.equal(await footer.locator('a[href*="#"]').count(), 0, 'Footer navigation must link only to standalone pages');
      assert.equal(await footer.getByText(/^(About|Activities|Contact|Get Involved)$/).count(), 0);
      for (const href of ['/events', '/articles', '/gallery', '/donate', '/']) {
        await footer.locator(`.footer-links a[href="${href}"]`).click();
        await page.waitForURL(origin + href);
        assert.equal(await page.getByRole('heading', { name: 'Page not found' }).count(), 0);
        await page.waitForFunction(() => scrollY < 5);
      }
      await footer.scrollIntoViewIfNeeded();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Footer must fit the viewport');
      await footer.screenshot({ path: path.resolve(__dirname, `../../../footer-${viewport.width}.png`) });
      assert.deepEqual(errors, []);
      console.log(`Footer standalone pages, contact links, saved placeholders and mobile width passed at ${viewport.width}px.`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
