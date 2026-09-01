# Cloudflare backend migration

This Worker preserves the frontend API contract while moving Academy content, progress, and résumé drafts from browser-only storage to Cloudflare D1. The frontend continues to keep an offline cache.

## Set up

1. Run `npm install` in this directory.
2. Run `npm run db:create` and copy the returned database ID into `wrangler.toml`.
3. Run `npm run db:migrate`.
4. Set `ALLOWED_ORIGIN` to the exact production website origin.
5. Protect the Worker application with Cloudflare Access. Allow public GET requests if learners do not sign in, but require an Access identity for `PUT /academy/library`. Keep `REQUIRE_ACCESS = "true"` in production.
6. Run `npm run deploy`, then set the `portfolio-api-base` meta value in the frontend pages to the deployed Worker URL.

Do not put an admin token in frontend JavaScript. Cloudflare Access should validate the user at the edge and provide the signed assertion header. Before the first publish, export the current library from Admin as a recovery backup.

## Data model

- `documents` stores the versioned Academy library and its last editor.
- `device_data` stores namespaced progress and résumé draft documents.
- The library endpoint returns an `ETag`; the Worker accepts `If-Match` to prevent accidental overwrites when conflict handling is enabled in the client.

