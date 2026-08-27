# Muhammad Arsalan Portfolio

Static GitHub Pages portfolio built with semantic HTML, CSS and vanilla JavaScript.

## Site structure

- `index.html`, `styles.css`, `script.js` — portfolio homepage, themes, navigation and motion
- `support-lab.html`, `support-lab.css`, `ai-support.js` — guided IT Support Assistant
- `academy.html`, `academy.css`, `academy.js` — IT Support Learning Lab
- `resume-builder.html`, `resume-builder.css`, `resume-builder.js` — résumé editor and PDF export
- `assets/` — current logos, portrait, project diagrams, résumé, social preview and the shared PDF library
- `design-system/` — typography, color, spacing, content and interaction rules for future updates

## Maintenance

Keep the site framework-free and compatible with GitHub Pages. Reuse the design tokens at the top of `styles.css`, keep page-specific styles isolated, and update stylesheet or script version parameters in HTML after visible changes so browsers do not serve stale files.

The Resume Builder is an independent protected tool. Avoid applying homepage styles or scripts to it.
