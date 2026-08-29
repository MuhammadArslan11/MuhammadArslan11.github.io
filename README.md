# Muhammad Arsalan Portfolio

Static GitHub Pages portfolio built with semantic HTML, CSS and vanilla JavaScript.

## Site structure

- `index.html`, `styles.css`, `script.js` — portfolio homepage, themes, navigation and motion
- `support-lab.html`, `support-lab.css`, `ai-support.js` — guided IT Support Assistant
- `academy.html`, `academy.css`, `academy.js`, `academy-data.js` — static Academy OS learning platform
- `admin.html`, `admin.css`, `admin.js` — isolated local Admin Dashboard and course CRUD

## Academy OS static architecture

- `academy-data.js` is the content source of truth: course → modules → topics → prerequisites → reusable content blocks → practical work → quizzes.
- `academy.js` contains the reusable dependency, progression, mastery, recommendation, readiness, and versioned browser-storage services.
- Hash routes (`#home`, `#course`, `#performance`, and `#topic/{id}`) keep important views directly addressable on static hosting.
- Progress is local to the current browser for this static phase. Authentication, server persistence, secure administration, and cross-device sync are intentionally postponed; they must replace the storage adapter rather than be simulated in client code.
- The Admin Dashboard is available at `admin.html`. Use **Update record** to apply the open form, then **Save library** to persist the full content library. Export JSON backups regularly.
- The isolated admin supports create, update, duplicate, reorder, publish/unpublish, delete, and undo-delete operations for courses, modules, topics, content blocks, practical tasks, prerequisites, and quiz questions.
- `resume-builder.html`, `resume-builder.css`, `resume-builder.js` — résumé editor and PDF export
- `assets/` — current logos, portrait, project diagrams, résumé, social preview and the shared PDF library
- `design-system/` — typography, color, spacing, content and interaction rules for future updates

## Maintenance

Keep the site framework-free and compatible with GitHub Pages. Reuse the design tokens at the top of `styles.css`, keep page-specific styles isolated, and update stylesheet or script version parameters in HTML after visible changes so browsers do not serve stale files.

The Resume Builder is an independent protected tool. Avoid applying homepage styles or scripts to it.
