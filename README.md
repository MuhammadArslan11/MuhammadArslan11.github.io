# Muhammad Arsalan Portfolio

Static GitHub Pages frontend built with semantic HTML, CSS and vanilla JavaScript, with a shared backend API adapter and offline-safe browser caching.

## Site structure

- `index.html`, `styles.css`, `script.js` — portfolio homepage, themes, navigation and motion
- `support-lab.html`, `support-lab.css`, `ai-support.js` — guided IT Support Assistant
- `academy.html`, `academy.css`, `academy.js`, `academy-data.js` — static Academy OS learning platform
- `admin.html`, `admin.css`, `admin.js` — isolated local Admin Dashboard and course CRUD
- `resume-builder.html`, `resume-builder.css`, `resume-builder-v2.css`, `resume-builder.js`, `resume-builder-v2.js` — résumé editor and PDF export
- `backend-client.js` — shared browser-to-API adapter with offline-safe behavior
- `cloudflare/` — Cloudflare Worker and D1 backend implementation
- `assets/` — production images, diagrams, résumé PDF, and the PDF export library

## Academy OS static architecture

- `academy-data.js` is the content source of truth: course → modules → topics → prerequisites → reusable content blocks → practical work → quizzes.
- `academy.js` contains the reusable dependency, progression, mastery, recommendation, readiness, and versioned browser-storage services.
- Hash routes (`#home`, `#course`, `#performance`, and `#topic/{id}`) keep important views directly addressable on static hosting.
- Academy progress, course content, resume drafts, and support sessions are backend-ready through `backend-client.js`. Local storage remains an offline cache. Admin write endpoints must enforce server-side authentication; no admin secret belongs in this frontend.

## Backend contract

Set the API origin with the `portfolio-api-base` meta tag on each lab page. The frontend expects JSON at:

- `GET|PUT /academy/progress/:deviceId` — `{ progress }`
- `GET /academy/library` — public learner library
- `GET /admin/session` and `PUT /admin/library` — Cloudflare Access-protected Admin session and publishing
- `GET|PUT /resume/draft/:deviceId` — `{ draft }`
- `GET /assistant/session/:id` and `POST /assistant/session` — support chat persistence

Allow only the portfolio origin through CORS. Protect `/admin/*` with a Cloudflare Access Allow policy containing only the owner's exact email address. Device IDs are sync locators, not authentication; use real accounts before storing private user data in production.
- The Admin Dashboard is available at `admin.html`. Use **Apply to draft** for the open form, then **Publish changes** to persist the full content library. Export JSON backups regularly.
- The isolated admin supports create, update, duplicate, reorder, publish/unpublish, delete, and undo-delete operations for courses, modules, topics, content blocks, practical tasks, prerequisites, and quiz questions.
- Topic editing uses guided content-block, practical-activity, and quiz builders; authors do not need to write JSON. Use **Apply to draft** while editing and **Publish changes** when the library is ready. `Ctrl/Cmd + S` also publishes after validation.
- `cloudflare/` contains a Cloudflare Worker + D1 migration that implements the existing frontend API contract. See `cloudflare/README.md` for deployment and Cloudflare Access requirements.
- `design-system/` — typography, color, spacing, content and interaction rules for future updates

## Maintenance

Keep the site framework-free and compatible with GitHub Pages. Reuse the design tokens at the top of `styles.css`, keep page-specific styles isolated, and update stylesheet or script version parameters in HTML after visible changes so browsers do not serve stale files.

The Resume Builder is an independent protected tool. Avoid applying homepage styles or scripts to it.
