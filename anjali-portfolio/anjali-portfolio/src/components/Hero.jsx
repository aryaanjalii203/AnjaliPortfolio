import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, reducedMotion, isTouch } from '../lib/motion';
import { createLatentField } from '../three/LatentField';
import { identity } from '../data/portfolio';
import Line from './Line';

const ROWS = [identity.first.slice(0, 3), identity.first.slice(3)]; // ANJ / ALI (stacks on mobile)

function istTime() {
  return new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function Name({ fill = false }) {
  let n = 0;
  return (
    <span className={`mega hero__layer ${fill ? 'hero__layer--fill' : 'hero__layer--line'}`} aria-hidden="true">
      {ROWS.map((row) => (
        <span className="row" key={row}>
          {row.split('').map((c) => (
            <span className="ch" data-i={n++} key={c + n}>{c}</span>
          ))}
        </span>
      ))}
    </span>
  );
}

export default function Hero({ ready }) {
  const root = useRef(null);
  const canvasWrap = useRef(null);
  const nameRef = useRef(null);
  const fillRef = useRef(null);
  const field = useRef(null);
  const [time, setTime] = useState(istTime);

  // live IST clock
  useEffect(() => {
    const id = setInterval(() => setTime(istTime()), 1000);
    return () => clearInterval(id);
  }, []);

  // 3D latent field
  useEffect(() => {
    const mobile = window.innerWidth < 760 || isTouch;
    let f;
    try {
      f = createLatentField(canvasWrap.current, { mobile, reduced: reducedMotion });
    } catch (err) {
      // WebGL unavailable: the typographic hero still stands on its own
      return undefined;
    }
    field.current = f;
    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom top',
      onUpdate: (self) => f.setScroll(self.progress),
      onToggle: (self) => (self.isActive ? f.start() : f.stop()),
    });
    if (st.isActive || window.scrollY < window.innerHeight) f.start();
    return () => { st.kill(); f.dispose(); field.current = null; };
  }, []);

  // cursor spotlight on the name + subtle parallax
  useEffect(() => {
    const name = nameRef.current;
    const fill = fillRef.current;
    const px = gsap.quickTo(name, 'x', { duration: 1.4, ease: 'power3' });
    const py = gsap.quickTo(name, 'y', { duration: 1.4, ease: 'power3' });
    const spot = { x: 0.5, y: 0.5 };
    const setSpot = () => {
      const r = fill.getBoundingClientRect();
      fill.style.setProperty('--mx', `${spot.x * r.width}px`);
      fill.style.setProperty('--my', `${spot.y * r.height}px`);
    };

    if (isTouch || reducedMotion) {
      // no pointer: let the spotlight drift slowly across the letters
      const tw = reducedMotion ? null : gsap.to(spot, {
        keyframes: [{ x: 0.15, y: 0.3 }, { x: 0.8, y: 0.7 }, { x: 0.45, y: 0.2 }, { x: 0.5, y: 0.5 }],
        duration: 16, repeat: -1, ease: 'sine.inOut', onUpdate: setSpot,
      });
      setSpot();
      return () => tw && tw.kill();
    }

    const tSpot = { x: 0.5, y: 0.5 };
    const tick = () => {
      spot.x += (tSpot.x - spot.x) * 0.12;
      spot.y += (tSpot.y - spot.y) * 0.12;
      setSpot();
    };
    gsap.ticker.add(tick);
    const move = (e) => {
      const r = fill.getBoundingClientRect();
      tSpot.x = (e.clientX - r.left) / r.width;
      tSpot.y = (e.clientY - r.top) / r.height;
      px(((e.clientX / window.innerWidth) - 0.5) * -36);
      py(((e.clientY / window.innerHeight) - 0.5) * -18);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { gsap.ticker.remove(tick); window.removeEventListener('pointermove', move); };
  }, []);

  // intro + scroll distortion
  useEffect(() => {
    if (!ready) return undefined;
    const ctx = gsap.context(() => {
      const chars = gsap.utils.toArray('.hero__layer--line .ch');
      const fchars = gsap.utils.toArray('.hero__layer--fill .ch');
      const all = chars.map((c, i) => [c, fchars[i]]);
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        .from(all.flat(), { yPercent: 110, opacity: 0, duration: 1.6, stagger: { each: 0.06, from: 'center' } }, 0)
        .from(canvasWrap.current, { opacity: 0, scale: 1.12, duration: 2.4, ease: 'power2.out' }, 0.1)
        .from('.hero__grid, .hero__glow', { opacity: 0, duration: 2 }, 0.2)
        .add(() => root.current && root.current.classList.add('in'), 0.35)
        .from('.hero__top, .hero__coords', { opacity: 0, duration: 1.2 }, 0.8);

      if (!reducedMotion) {
        // letters separate and stretch as you leave the hero — subtle, per-letter
        all.forEach(([a, b], i) => {
          const dir = i % 2 === 0 ? 1 : -1;
          gsap.to([a, b], {
            yPercent: dir * (18 + i * 4),
            scaleY: 1 + (i % 3) * 0.08,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
          });
        });
        gsap.to('.hero__name-inner', {
          scale: 1.18, opacity: 0.25, ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
        });
        gsap.to('.hero__foot', {
          yPercent: -40, opacity: 0, ease: 'none',
          scrollTrigger: { trigger: root.current, start: '30% top', end: 'bottom top', scrub: true },
        });
      }
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="top" className="hero" ref={root} aria-label="Introduction">
      <div className="hero__grid" aria-hidden="true" />
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__name" ref={nameRef}>
        <div className="hero__name-inner">
          <Name />
          <div className="hero__fill" ref={fillRef}><Name fill /></div>
        </div>
      </div>

      <div className="hero__canvas" ref={canvasWrap} aria-hidden="true" />

      <div className="hero__top mono mono--ink2">
        <span className="hero__top-id">
          <i className="hero__top-dot" />
          {identity.first} / {identity.title} &middot; {identity.location}
        </span>
        <span className="mono--ink3">20.59°N 78.96°E &nbsp;/&nbsp; IST {time}</span>
      </div>

      <dl className="hero__hud mono" aria-label="Availability">
        <div><dt className="mono--ink3">Available for</dt><dd>{identity.year}</dd></div>
        <div><dt className="mono--ink3">Base</dt><dd>India &middot; Remote / Hybrid</dd></div>
        <div><dt className="mono--ink3">Focus</dt><dd>AI &middot; ML &middot; Interfaces</dd></div>
        <div><dt className="mono--ink3">Status</dt><dd><i className="status-dot" />System online</dd></div>
      </dl>

      <div className="hero__coords mono mono--ink3" aria-hidden="true">
        <span>Latent space / k = 10</span>
        <span>Move to query</span>
      </div>

      <h1 className="sr-only">{identity.first} {identity.last} — {identity.title}</h1>

      <div aria-hidden="true" />
      <div className="hero__foot">
        <div>
          <Line className="mega hero__kumari" d={0.05}>{identity.last}</Line>
        </div>
        <div className="hero__role">
          <Line className="mono mono--ink3" d={0.15}>[ Role ]</Line>
          <Line d={0.2}><strong>{identity.title}</strong></Line>
          <Line className="mono mono--ink2" d={0.25}>Based in {identity.location}</Line>
        </div>
        <p className="hero__tag">
          <Line d={0.3}>Building systems that turn</Line>
          <Line d={0.36}>data into <em>intelligence.</em></Line>
        </p>
        <div className="hero__scroll mono mono--ink3">
          <span>Scroll</span>
          <i />
        </div>
      </div>
    </section>
  );
}
