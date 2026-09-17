# PDF Workspace 2.1 — usability and reliability update

This is the complete portfolio repository, including Git history and the revised PDF workspace.
Original upstream base: `fa5dde7f9159f0c85e97a4daeaa505922ffe515c`.
Current feature branch: `feat/pdf-workspace-ux-v2` (includes the first workspace implementation).

## Open the updated interface

1. Extract the archive and open the repository folder in VS Code.
2. Open `resume-builder.html` using Live Server. Alternatively, run `python3 -m http.server 8765` in this folder, then visit `http://localhost:8765/resume-builder.html`.
3. Click **PDF Tools**. On a small screen, use **More → PDF Tools**.
4. Add PDFs or JPG/PNG images, arrange pages, and use **Prepare download → Download PDF**.

No build or npm install is needed to use the page. Serve it over HTTP; workers cannot run reliably from a file:// URL. All PDF dependencies are included locally.

## Improvements in this update

- **Work is retained when you close PDF Tools.** Reopen it in the same tab to continue. **Reset** asks for confirmation before clearing files and history. Refreshing or closing the browser tab still clears the session; there is no persistent PDF autosave.
- **Grid and Large pages views**, thumbnail size adjustment, collapsible Tools and Export panels, and document tabs. On phones, tabs switch the visible document, and tools remain available through the Tools button.
- **Real selection buttons** on every page, clearer selected-page counts, consistent tool icons, loading/error states, and a page-count summary before export.
- **Selection belongs to the active document.** Switching documents clears stale selection. Shift selects a range, Ctrl/Cmd toggles pages, and the round check button supports touch selection.
- **Copies stay selected** after duplication or copying to another document. Moves activate their destination. Final-position controls place the selected group at the requested position in the resulting order.
- **Drag before or after a page** with an insertion marker; in Large pages view, the upper/lower half sets placement. The bottom drop area appends. Alt-drag copies. Edge scrolling continues while the pointer stays near the edge.
- **Keyboard page menus** support arrows, Home, End and Escape. Button Enter/Space no longer accidentally selects the underlying page. ContextMenu or Shift+F10 opens the selected page menu.
- **Large preview fits width and height**, supports zoom and previous/next navigation, shows rendering failures within the preview, and prevents keyboard edits to pages behind it.
- **Undo/redo only records real changes.** No-op moves no longer consume history or clear redo. Failed operations restore the prior workspace.
- **Stable export targets.** Active document follows the selected tab; a specifically selected document or All documents stays fixed. Harmless page selection does not discard a completed full-document export. Selected-only exports explain when their scope is empty.
- **Import and export cancellation** avoids committing a cancelled import. A rejected file leaves existing pages and a previously prepared download intact. File drops outside a page pane no longer navigate the browser away from the editor.
- **Progress feedback** for import and image exports. Only sources actually used in the output are sent to the PDF worker.
- **Memory-conscious thumbnails:** visible pages render at an appropriate resolution; offscreen canvases are released, cache entries are bounded, and page-shaped placeholders reduce layout shifts.
- **PDF fixes:** blank pages resize correctly, negative rotations normalize correctly, crop regions are intersected with media boxes when fitting to paper, and pasted en-dash page ranges are accepted.

## Available tools

Up to three document panes; multi-page selection; rotate left/right; duplicate; remove; extract copies to a new pane; move to first/last or a final numbered position; earlier/later; move/copy between documents; combine documents during export; preview; and 40-step undo/redo.

Export original sizes, A4, Letter or Legal. Fixed paper sizes fit and center content without stretching. Full high quality preserves original PDF content and selectable text with lossless PDF compression. Best / Good / Normal create image PDFs at nominal 200 / 144 / 96 DPI with JPEG qualities 94% / 85% / 72%. Image modes flatten text and links and may not reduce every PDF's size. Rendering is capped at approximately 24 megapixels and 6000 pixels per dimension for large pages.

The result is reopened and its page count checked before download. This check does not prove every visual detail in an arbitrary PDF is correct.

## Verification completed

- **18 PDF/model regression tests pass**: range parsing, merge/extract/remove, forms, image conversion, lossless optimization, exact page sequence, duplicates, crop boxes, rotation, paper sizes, cross-pane transfer, selection boundaries, final positions, grouping, history, source packing, invalid transfers and blank pages.
- **12 DOM integration tests pass** against the actual UI script: upload, touch selection, duplicates, undo/redo, close/reopen persistence, confirmed reset, pane/export consistency, keyboard menu and preview protection, rejection handling, PDF export order, empty selected scope, cancellation, drag insertion/copy, and all three image-preset export pipelines.
- DOM tests use real pdf-lib parsing/export, with worker transport and canvas rendering simulated. They do **not** establish visual rendering accuracy, native drag behavior or real-browser compatibility.
- Syntax and whitespace checks pass. Two reordered sample pages rendered through Poppler match their source renders pixel-for-pixel. Rotated landscape-to-A4 output was also rendered and reviewed.
- PDF evidence is supplied separately as `PDF_Workspace_v2_Export_Check.png`.

### Remaining validation

Actual browser screenshots, responsive visual review, native drag-and-drop, and actual PDF.js canvas rasterization were **not** verified here. The session's browser policy blocks the local preview. The included real-browser test is prepared for your local environment or GitHub Actions, but has not completed in this session. This package should not be described as 100% verified.

## Run checks

Node 22 or newer:

```sh
npm ci --ignore-scripts
npm test
npm run test:ui
```

For real-browser checks:

```sh
npx playwright install --with-deps chromium
python3 -m http.server 8765
# In a second terminal, from the same folder:
npm run test:browser
```

The browser test saves screenshots and PDFs in `test-results/`. The included GitHub Actions workflow runs the PDF tests, DOM checks and browser smoke test, then uploads those results. It has not run remotely in this session.

## Limits and unsupported PDF features

- Up to 20 imported sources, 50 MB total imported bytes, and 500 page instances. Sources retained for undo count toward the session limit. Export your work and Reset to begin another session.
- Password-protected/damaged files, signature fields and interactive forms are rejected. Use an unlocked, unsigned, flattened copy.
- Original-size export preserves copied page content, crop boxes, rotations and page annotations. Document-level bookmarks, attachments, tagging, signatures and form-field trees are not preserved by this page assembly workflow.
- Fixed-size vector export rejects annotated pages instead of misplacing their annotations. Keep original sizes or use an image preset for visible appearances.
- Use move/copy/position buttons on touch devices where native page drag is unavailable.
- Uploaded content stays in browser memory and is not transmitted to a server.

## Git status and publishing

No remote update or deployment was made. Earlier attempts received GitHub `403 Resource not accessible by integration`. The full local Git history and feature branch are included.

From your authenticated Git environment:

```sh
git push -u origin feat/pdf-workspace-ux-v2
```

Review the Actions run and your own PDFs, then open a pull request into `main`.

## Main files

- `pdf-tools.js`: controls, UI events, preview rendering, exports and session lifecycle.
- `pdf-tools.css`: desktop, tablet and phone layouts and interaction styling.
- `pdf-workspace-model.js`: selection, movement, history and export plans.
- `pdf-tools-core.js` / `pdf-tools-worker.js`: PDF processing and worker boundary.
- `tests/pdf-workspace.test.cjs`, `tests/pdf-workspace.ui.mjs`, `tests/pdf-workspace.browser.cjs`: regression, DOM and browser checks.
