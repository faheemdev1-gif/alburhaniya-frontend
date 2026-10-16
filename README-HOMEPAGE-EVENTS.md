# Homepage events visibility fix — 16 October 2026

The live API returns “Teen Behaviour & Life Skills Sessions: Empowering Young People for Success” for 21 October 2026, but the previous homepage rendered it inside an invisible animation wrapper. The API and admin event record were present; the homepage display was broken.

## Fixed

- Removed the homepage event list's `reveal-up` wrapper and the separate code that initially hid every event card. Event visibility no longer depends on scroll-animation callbacks.
- Added readable loading and empty states, a visible error message and a Try again button. A failed request no longer looks like an empty calendar.
- Added a 15-second timeout to event-list requests and cancelled homepage requests when leaving the page.
- Converted formatted event summaries to plain readable text, including HTML entity decoding, without inserting event HTML into the page.
- Improved the homepage card spacing and summary length on mobile.

## Deploy this frontend update

1. Copy the contents of `al-burhaniya-manchester` into the existing frontend repository. Preserve your `.git` directory and existing Vercel configuration. Do not add the `server` folder as a new frontend submodule.
2. Changed application files:
   - `src/pages/HomePage.tsx`
   - `src/services/eventService.ts`
   - `src/style.css`
3. Also copy `scripts/test-homepage-events-browser.cjs`, `package.json`, and this guide if keeping the regression test.
4. Build with `npm ci` and `npm run build`, then commit/push the frontend changes and deploy on Vercel. No backend change is required for this visibility fix.
5. After deployment, open the homepage, refresh, and scroll to Upcoming Events. The existing 21 October event should be visible with its Details link.

Keep `VITE_API_URL=https://peru-nightingale-490437.hostingersite.com/api` in Vercel.

## Verified

The new browser regression failed against the previous build because the event's ancestor had opacity 0. It passed against the fixed build using a fresh snapshot of the actual public event response. It checks delayed responses, painted desktop/mobile content, event title and Details link, formatted descriptions, missing animation callbacks, empty results, API failures, malformed responses and retry. The production build and frontend unit tests also passed.

Run the regression locally with Playwright Chromium installed:

```bash
npm run test:homepage:browser
```

The separate broken image in your admin screenshot comes from the event's saved image and thumbnail values: both contain a Windows folder path. Edit the event and upload an actual image through the image-upload control; a computer folder path is not a public image URL. This is separate from the homepage event visibility bug, and no live event data was modified by this update.
