# Footer update

This is the complete frontend source, including the previous donation, events,
newsletter, image and domain updates.

Extract the ZIP, open `al-burhaniya-manchester`, and copy its contents into your
existing frontend project. Keep your existing local environment settings.
Deploy the frontend using the same Vercel project and domain as before.
No backend update or new environment variables are needed for this footer update.

The footer navigation links only to standalone pages: Home, Events, Articles,
Gallery and Donate. Donate opens `/donate`. About, Activities, Contact and
Get Involved have been removed from the footer navigation.
The configured email and telephone are clickable, and the address is displayed.
Empty or invalid social links are hidden. Valid social URLs open in a new tab.

Placeholder legal links and duplicate programme, membership and space-hire links
are no longer rendered, including when old content is already saved in the CMS.
The obsolete footer fields are hidden in the admin editor. Footer headings,
branding and contact details remain editable in Website Content.

Validation: `npm run build`, `npm test`, and `npm run test:footer:browser`.
