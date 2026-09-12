# Prepare this design for Netlify deployment

Create a deployment-ready pack from the current design:

1. **Bundle to a single file.** Export the design as one fully self-contained HTML file — inline all stylesheets, scripts, fonts, images and other assets so it works offline with zero external requests. If any asset is referenced only from JavaScript (not an HTML attribute), lift it so the bundler captures it. Include a lightweight branded splash/thumbnail so something meaningful shows while the page unpacks.

2. **Name it `index.html`** and place it in a folder named after the site (e.g. `newco-community/`) — Netlify serves `index.html` at the site root. If the design has multiple standalone pages, bundle each one and place them in the same folder with clean lowercase filenames (`events.html`, `about.html`), keeping internal links relative.

3. **Verify before delivery.** Check the bundler output for any assets it could not resolve, then load the bundled file and confirm it renders with no console errors and no broken images or fonts. Fix and re-bundle if anything is missing.

4. **Deliver as a download.** Present the folder as a downloadable zip **named after the site** (e.g. `newco-community.zip`) — the folder name from step 2 ensures the zip inherits it. Confirm the final file size.

## Notes

- Do not include source files, design-system folders, or build intermediates in the pack — only what Netlify should serve.
- If the design calls the Claude API or any other live backend, stop and tell the user — that won't work as a static deploy.
- Tell the user anything that behaves differently in the static build (e.g. forms don't actually submit).
