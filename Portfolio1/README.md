# Anjali Kumari — Portfolio

A fast, single-page static portfolio. No build step, no framework — just open it.

## Files
```
index.html      → all the page content
styles.css      → the design (light "lab" theme, violet/coral accents)
script.js       → hero data-graph canvas + scroll reveals
assets/
  anjali.jpeg               → profile photo (web-optimised)
  Anjali-Kumari-Resume.pdf  → résumé, linked by the Resume buttons
```

## Run it locally (VS Code)
- Easiest: install the **Live Server** extension, right-click `index.html` → "Open with Live Server".
- Or just double-click `index.html` to open it in a browser.
- Or from a terminal in this folder: `python -m http.server 5500` then visit `http://localhost:5500`.

## Deploy to Vercel
1. Push this folder to a GitHub repo.
2. On vercel.com → New Project → import the repo.
3. Framework preset: **Other**. Build command: leave empty. Output dir: `./` (root).
4. Deploy. That's it — it's a static site.

## Things you'll likely want to edit
- **Email / links:** in `index.html`, search for `aryaanjali203@gmail.com`, `github.com/aryaanjalii203`, `linkedin.com/in/anjalikumari`.
- **Add a project:** copy one `<article class="card">…</article>` block in the `#work` section and edit it.
- **Add certificate links:** wrap each `<li>` in the `#certs` list with an `<a href="…">` to the credential URL.
- **Colors:** change the `--violet` / `--coral` values at the top of `styles.css`.
- **Privacy note:** your phone number is intentionally NOT on the public page. Add it only if you want it public.
