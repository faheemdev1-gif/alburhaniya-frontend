# Website Content editor

The site already has an admin for articles, events, gallery items, and users. This update adds **Website Content** at `/admin/content` for the homepage, navigation, page introductions, branding, and footer.

## Deploy

1. Deploy the updated `server` and frontend together. Existing `MONGODB_URI`, `JWT_SECRET`, and admin account remain in use. The new MongoDB collections are created automatically on first save or image upload. No migration or seed is needed.
2. Set the frontend's `VITE_API_URL` at build time to the backend's URL ending in `/api`, as with the existing project. Rebuild and deploy the frontend after changing it. The server CORS list in `server/src/server.ts` must contain your frontend domain.
3. Log in with an **admin** account, open **Website Content**, choose a section, edit text or upload images, and select **Publish changes**. Editors without the admin role can view the admin interface but cannot save website content.
4. Uploaded Website Content images are stored in MongoDB, and their URLs are saved when you publish. The existing Gallery feature still uses the original upload implementation.

The site displays the current built-in text until its first content save. If the content API is unavailable, the public site uses these defaults and the editor disables publishing. Slider titles and headings accept `<em>` and `<br/>` for emphasis and line breaks. Images accept a URL or an uploaded JPG, PNG, GIF, or WebP (the current backend default is 5 MB). Reorder cards, slides, and testimonials with the arrows.

Some existing forms (contact and newsletter) display success messages but have no delivery/subscription backend; this content editor changes their displayed wording, not their submission behavior. Existing event and article records remain managed in their dedicated admin pages. Stripe product/payment configuration is outside this content editor.

## Local build

```sh
npm ci && npm run build
cd server && npm ci && npm run build
```

For local development, start the backend with `npm run dev` in `server` and the frontend with `npm run dev` at the project root. Supply your environment values separately; no credentials are included in this ZIP.
