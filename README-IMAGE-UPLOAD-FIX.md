# Image upload fix

## What caused the reported error

The screenshot shows **Route not found**. Website Content calls `POST /api/media`.
The supplied ZIP already had that route and the older `POST /api/site-content/image`
route. A missing-route response therefore indicates a deployment or API URL
mismatch: an older backend, a different backend, or an incorrect API base path.
Inspection of the live frontend subsequently found the website backend at
https://peru-nightingale-490437.hostingersite.com. The earlier health response
lacked the new contract and the media route returned Route not found.
This is separate from image format or storage failures.

## Changes in this version

- `/api/media` remains the primary upload endpoint. The frontend retries
  `/api/site-content/image` only after a 404 with the exact `Route not found`
  response. It does not retry timeouts, authentication failures, or storage
  errors because those could create duplicate assets.
- An older backend's `{url}` response is supported. If both endpoints are
  missing, the admin sees a useful deployment message.
- Multipart files keep their browser-generated boundary. The shared API client
  removes a forced Content-Type for FormData instead of serializing uploads as JSON.
- Frontend and gallery validation accept JPG/PNG/WebP/GIF, reject empty files,
  and accept originals up to 20 MB. All upload controls resize images to at most 1920 px and compress below 900 KiB before sending them. The backend defaults to 10 MB, configurable
  between 1 and 20 MB with MAX_FILE_SIZE_MB. The backend limit applies to the already-compressed file.
- The backend verifies actual image bytes, strips metadata, auto-orients images,
  and creates a 1920 px WebP and a 640 px thumbnail. Input limit is 40 megapixels;
  the frontend resizes large camera photos before sending them. GIFs become still images. HEIC requires conversion
  to JPG. Upload errors have explicit codes and safe messages.
- Optional Cloudinary storage is implemented. MongoDB remains the default and
  old MongoDB media URLs still work after switching providers.
- Multer is upgraded to version 2; lockfiles are updated. Environment values load
  before startup, and upload size settings are read at request time.
- `/api/health` includes `uploadContract: image-upload-v3`, storage configuration
  status, and upload endpoint/limit details. It is a deployment diagnostic, not
  a test of external storage connectivity.

## Coverage of image uploads

| Admin area | Supported image fields |
| --- | --- |
| Website Content | All slider backgrounds, About collage images, activity-card backgrounds, testimonial portraits, main and inverted logos |
| Articles | Cover image, author avatar, inline images inserted at the body cursor |
| Events | Main image with generated thumbnail, separately uploaded thumbnail, images appended to the description |
| Gallery | Create photo entries and replace existing photos without deleting their records |
| Previews | Dashboard, article/event lists and forms, gallery, all public image rendering |

Every control uses the same browser preparation logic. Originals may be up to
20 MB, and the output is reduced to less than 900 KiB so ordinary photos fit even
a 1 MB backend limit. Transparent logos retain their transparency. WebP is used
where supported, with PNG fallback. Images over 80 megapixels and HEIC files must
be converted/resized separately; animated GIFs are stored as still images.

Do not save an article or event while an image upload is running. The save
buttons now enforce this, and a failed upload keeps the previous field value.
Unused media is retained because another page may reuse its URL.

The browser check used the original every-voice.JPG (5,485,679 bytes) and reduced
it to 137,864 bytes at 1920 x 1280. This is an example result, not a fixed output
size for every image.

## Deploy the fix

Deploy BOTH the backend and frontend from this project. A frontend-only update
cannot add a route to an old backend.

### Backend (Render or another Node host)

Use Node 22 or newer. Do not upload node_modules from a Mac; install dependencies
on the host so Sharp receives the correct native binary.

For Render, set Root Directory to `server`, Build Command to
`npm ci --include=optional && npm run build`, and Start Command to `npm start`.
On another Node host, run those commands from the server directory.
Keep your existing MONGODB_URI, JWT_SECRET and other admin settings. Environment
files and credentials are excluded from the deliverable; use your host's existing
settings or a private local .env.

For the existing MongoDB storage, set:

```
MEDIA_STORAGE=mongodb
MAX_FILE_SIZE_MB=10
```

No additional account is needed. Confirm MongoDB has storage available.

### Frontend

The included .env.production supplies this website's public backend URL by default. Set `VITE_API_URL=https://peru-nightingale-490437.hostingersite.com/api` in the frontend hosting settings
before building. Use the backend for this website, not the separate Burhaniya
library connector. The uploaded ZIP's local development setting was localhost;
that is not a production backend address. Rebuild/redeploy with `npm ci && npm run build`.

Existing production website domains remain allowed by the backend CORS configuration.
If you use another frontend domain, add its exact origin to `server/src/app.ts`.

### Confirm the deployment

Open `https://YOUR-WEBSITE-BACKEND/api/health` and confirm the upload contract is
`image-upload-v3`. From the server directory you can also run:

```
node scripts/check-image-routes.cjs https://YOUR-WEBSITE-BACKEND/api
```

The script makes unauthenticated requests only; it does not save images or content.
Each upload endpoint should return 401, confirming the route exists and requires
login. A 404 indicates the wrong URL or an older deployment. Health should report
`mediaStorage.configured: true`.

Log in as admin, upload a JPG in Website Content, publish changes and reload the
public homepage. Test an article cover, event image and gallery photo too. If
it still fails, record the failed request URL, status and response message from
the browser Network tab; never share a token or password.

## Optional: Cloudinary (recommended for a growing image archive)

Cloudinary provides dedicated image storage and CDN delivery. It is an
improvement for media delivery, not a fix for a missing backend route. Create an
account at https://cloudinary.com and get the Cloud name, API key and API secret
from the console. Set these only in the backend environment:

```
MEDIA_STORAGE=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=al-burhaniya
```

Redeploy the backend. No unsigned upload preset is required: authenticated admins
upload through the backend, which uses a signed SDK upload. Do not put the secret
in frontend settings or source code. Check your account's storage, bandwidth and
transformation limits.

New images use Cloudinary HTTPS URLs, with thumbnail delivery transformations.
Existing MongoDB images remain in MongoDB; there is no automatic migration or
silently changing providers if Cloudinary fails. Gallery deletion keeps media
because another page may reuse the same URL. Unused uploads remain until you
remove them manually after checking references.

Old `/uploads/` references still depend on the old files being accessible. Review
README-CONTENT-EDITOR.md before replacing an older backend that serves those files.

Cloudinary docs: https://cloudinary.com/documentation/node_image_and_video_upload
Render disk behavior: https://render.com/docs/free

## Validation

From project root: `npm test` and `npm run build`.
For real browser checks, install Chromium with `npx playwright install chromium`,
install the server dependencies, then run `npm run test:images:browser`.
An existing Chromium executable can be selected with CHROMIUM_EXECUTABLE_PATH.
From server: `npm test` (also builds the backend).

Tests exercise real local HTTP multipart requests, image processing, URL serving,
authentication, gallery creation, bad/oversized files, malformed multipart requests,
storage errors, and frontend compatibility logic. MongoDB writes and Cloudinary
responses are isolated mocks; they do not use production data or credentials.
A real upload against your deployed backend and Cloudinary account remains to
be verified after deployment and configuration.
