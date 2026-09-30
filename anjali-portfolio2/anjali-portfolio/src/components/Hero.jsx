import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, reducedMotion, isTouch } from '../lib/motion';
import { createNightScene } from '../three/NightScene';
import { identity } from '../data/portfolio';
import Line from './Line';
import ResumeButtons from './ResumeButtons';

/** Giant name drawn twice: an outline layer, and a filled layer revealed by a spotlight. */
function Name({ fill = false }) {
  return (
    <span className={`mega hero__layer ${fill ? 'hero__layer--fill' : 'hero__layer--line'}`} aria-hidden="true">
      {identity.first.split('').map((c, i) => <span className="ch" key={i}>{c}</span>)}
    </span>
  );
}

export default function Hero({ ready }) {
  const root = useRef(null);
  const nameRef = useRef(null);
  const fillRef = useRef(null);
  const photoRef = useRef(null);
  const nightRef = useRef(null);
  const nightApi = useRef(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  // 3D night environment behind everything in the hero
  useEffect(() => {
    const small = window.innerWidth < 760;
    const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    let night;
    try {
      night = createNightScene(nightRef.current, { tier: small || isTouch || weak ? 'low' : 'high', reduced: reducedMotion });
    } catch {
      return undefined; // no WebGL: the CSS stage lighting still carries the hero
    }
    // animate only after the boot screen is gone, while the hero is on screen and the tab is visible
    const run = (on) => (on && readyRef.current && !document.hidden ? night.start() : night.stop());
    const st = ScrollTrigger.create({
      trigger: root.current, start: 'top top', end: 'bottom top',
      onUpdate: (self) => night.setScroll(self.progress),
      onToggle: (self) => run(self.isActive),
    });
    const vis = () => run(st.isActive || window.scrollY < window.innerHeight);
    document.addEventListener('visibilitychange', vis);
    nightApi.current = { night, vis };
    return () => { st.kill(); document.removeEventListener('visibilitychange', vis); night.dispose(); nightApi.current = null; };
  }, []);

  useEffect(() => {
    if (ready && nightApi.current) nightApi.current.vis();
  }, [ready]);

  // cursor spotlight on the name + opposing parallax on name and portrait (depth)
  useEffect(() => {
    const fill = fillRef.current;
    const spot = { x: 0.5, y: 0.5 };
    const setSpot = () => {
      const r = fill.getBoundingClientRect();
      fill.style.setProperty('--mx', `${spot.x * r.width}px`);
      fill.style.setProperty('--my', `${spot.y * r.height}px`);
    };

    if (isTouch || reducedMotion) {
      const tw = reducedMotion ? null : gsap.to(spot, {
        keyframes: [{ x: 0.15, y: 0.4 }, { x: 0.85, y: 0.6 }, { x: 0.4, y: 0.3 }, { x: 0.5, y: 0.5 }],
        duration: 16, repeat: -1, ease: 'sine.inOut', onUpdate: setSpot,
      });
      setSpot();
      return () => tw && tw.kill();
    }

    const nx = gsap.quickTo(nameRef.current, 'x', { duration: 1.4, ease: 'power3' });
    const px = gsap.quickTo(photoRef.current, 'x', { duration: 1.6, ease: 'power3' });
    const py = gsap.quickTo(photoRef.current, 'y', { duration: 1.6, ease: 'power3' });
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
      const dx = e.clientX / window.innerWidth - 0.5;
      const dy = e.clientY / window.innerHeight - 0.5;
      nx(dx * -40);
      px(dx * 18);
      py(dy * 8);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => { gsap.ticker.remove(tick); window.removeEventListener('pointermove', move); };
  }, []);

  // intro + scroll-out
  useEffect(() => {
    if (!ready) return undefined;
    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
      intro
        .from('.hero__portrait', { opacity: 0, yPercent: 6, scale: 1.04, duration: 2.2, ease: 'power3.out' }, 0)
        .from('.hero__stage', { opacity: 0, duration: 2.4 }, 0)
        .from('.hero__layer .ch', { yPercent: 100, opacity: 0, duration: 1.6, stagger: { each: 0.05, from: 'center' } }, 0.15)
        .add(() => root.current && root.current.classList.add('in'), 0.3)
        .from('.hero__small, .hero__cta', { opacity: 0, y: 14, duration: 1.2, stagger: 0.08 }, 0.7);

      if (!reducedMotion) {
        const st = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.8 };
        gsap.to('.hero__portrait', { yPercent: 10, scale: 0.94, opacity: 0.2, ease: 'none', scrollTrigger: st });
        gsap.to('.hero__name-inner', { yPercent: -18, letterSpacing: '0.04em', opacity: 0.15, ease: 'none', scrollTrigger: st });
        gsap.to('.hero__statement--a', { xPercent: -12, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
        gsap.to('.hero__statement--b', { xPercent: 12, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '60% top' } });
      }
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section id="top" className="hero" ref={root} aria-label="Introduction">
      <div className="hero__stage" aria-hidden="true">
        <div className="hero__night" ref={nightRef} />
        <span className="hero__beam" />
        <span className="hero__halo" />
      </div>

      <div className="hero__name" ref={nameRef}>
        <div className="hero__name-inner">
          <Name />
          <div className="hero__fill" ref={fillRef}><Name fill /></div>
        </div>
      </div>

      <figure className="hero__portrait" ref={photoRef}>
        <img
          src="/img/anjali-1300.webp"
          srcSet="/img/anjali-820.webp 470w, /img/anjali-1300.webp 745w"
          sizes="(max-width: 760px) 90vw, 46vh"
          width="745" height="1300"
          alt={`Portrait of ${identity.first} ${identity.last}`}
          fetchpriority="high"
          decoding="async"
        />
      </figure>
      <div className="hero__floor" aria-hidden="true" />

      <div className="hero__col hero__col--a">
      <h1 className="hero__statement hero__statement--a">
        <span className="sr-only">{identity.first} {identity.last} — {identity.title}. </span>
        <Line d={0.1}>Building</Line>
        <Line d={0.16}>systems that</Line>
        <Line d={0.22}><em>learn.</em></Line>
      </h1>

      <p className="hero__small hero__small--a mono">
        CS graduate &rsquo;26 working across deep learning, computer vision, LLM evaluation and the data pipelines that feed them.
      </p>
      </div>

      <div className="hero__col hero__col--b">
      <div className="hero__small hero__small--b mono" aria-hidden="true">
        <span className="hero__squares"><i /><i /></span>
        <span>Currently evaluating LLMs<br />@ Handshake AI</span>
      </div>

      <p className="hero__statement hero__statement--b" aria-hidden="true">
        <Line d={0.2}>Turning data</Line>
        <Line d={0.26}>into <span className="hero__grad">intelligence</span></Line>
      </p>
      </div>

      <div className="hero__cta">
        <ResumeButtons />
        <dl className="hero__hud mono">
          <div><dt className="mono--ink3">Role</dt><dd>{identity.title}</dd></div>
          <div><dt className="mono--ink3">Base</dt><dd>India &middot; Remote / Hybrid</dd></div>
          <div><dt className="mono--ink3">Status</dt><dd><i className="status-dot" />Open to roles &middot; {identity.year}</dd></div>
        </dl>
      </div>

      <div className="hero__scroll mono mono--ink3" aria-hidden="true">
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
