# ANJALI.OS — Portfolio

Anjali Kumari — AI / Machine Learning Engineer.

React + Vite, GSAP (ScrollTrigger), Lenis smooth scroll, and one persistent Three.js world behind the whole site — scrolling walks the camera from the hero's moonlit hillside, past the cabin, down a lantern-lit path through flowering trees to the main house.

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
  three/World.js          the persistent 3D world + scroll-driven camera journey
  components/             WorldLayer (maps sections → camera chapters), Loader, Cursor, Navbar,
                          Hero, Marquee, Experience, Projects, Frontend, ProjectCard, Skills,
                          Education, Hackathon, Certifications, Contact (+ footer)
  styles/global.css       design system
```
