# ANJALI.OS — Portfolio

Anjali Kumari — AI / Machine Learning Engineer.

React + Vite, GSAP (ScrollTrigger), Lenis smooth scroll, and a small Three.js scene for the hero.

## Run locally

```bash
npm install
npm run dev
```

## Deploy

Push to the GitHub repo connected to Vercel; it builds automatically (`npm run build` → `dist`).

## Edit content

Everything text-related lives in `src/data/portfolio.js` — experience, projects, stack, education, certifications, links.

Keep `public/Anjali-Kumari-Resume.pdf` in the repo — the Download / View résumé buttons (hero, nav, footer) point to it. Replace the file to update the résumé.

Hero portrait: `public/img/anjali-1300.webp` + `anjali-820.webp` (background removed, colour-graded).

## Structure

```
src/
  App.jsx
  data/portfolio.js       all content
  lib/motion.js           GSAP + Lenis setup
  hooks/useReveal.js      scroll reveals
  three/LatentField.js    3D hero: embedding clusters + live KNN on the cursor
  components/             Loader, Cursor, Navbar, Hero, Marquee, About, Experience,
                          Projects, ProjectViz, Skills, Education, Hackathon,
                          Certifications, Contact, Footer
  styles/global.css       design system
```
