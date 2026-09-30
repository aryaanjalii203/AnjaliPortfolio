import { useEffect, useRef, useState } from 'react';
import { nav, identity } from '../data/portfolio';
import { scrollToId, getLenis } from '../lib/motion';
import ResumeButtons from './ResumeButtons';

// Every section id maps to a phase of the "system" — shown in the HUD.
const PHASES = [
  ['top', 'Identity'],
  ['experience', 'Experience'],
  ['projects', 'Projects'],
  ['web', 'Interfaces'],
  ['stack', 'Intelligence'],
  ['education', 'Education'],
  ['hackathon', 'Education'],
  ['certifications', 'Education'],
  ['contact', 'Connection'],
];

export default function Navbar() {
  const [active, setActive] = useState('top');
  const [open, setOpen] = useState(false);
  const hud = useRef(null);
  const pct = useRef(null);

  // active section
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    PHASES.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  // scroll progress → HUD (no React re-render)
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (hud.current) hud.current.style.setProperty('--p', p.toFixed(4));
      if (pct.current) pct.current.textContent = String(Math.round(p * 100)).padStart(3, '0');
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // lock scroll while the mobile menu is open
  useEffect(() => {
    const l = getLenis();
    if (open) { l ? l.stop() : (document.body.style.overflow = 'hidden'); }
    else { l ? l.start() : (document.body.style.overflow = ''); }
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    // wait for the menu to start closing so lenis is running again
    requestAnimationFrame(() => scrollToId(id));
  };

  const phase = (PHASES.find(([id]) => id === active) || PHASES[0])[1];
  const navActive = active === 'hackathon' || active === 'certifications' || active === 'education' ? 'stack' : active;

  return (
    <>
      <header className={`nav ${active === 'contact' ? 'is-outro' : ''}`}>
        <a href="#top" className="nav__brand mono" onClick={go('top')} aria-label="Back to top">
          <b>{identity.first[0]}{identity.last[0]}</b><span className="mono--ink3">/ {identity.year}</span>
        </a>
        <nav aria-label="Primary">
          <ul className="nav__list">
            {nav.map((n, i) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={go(n.id)} className={`nav__link mono ${navActive === n.id ? 'is-active' : ''}`}>
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <i className="nav__tick" />
                  <span>{n.label}</span>
                </a>
              </li>
            ))}
            <li className="nav__resume">
              <a href={identity.resume} download="Anjali-Kumari-Resume.pdf" className="nav__cv mono" data-cursor="Save">
                Résumé <span aria-hidden="true">&darr;</span>
              </a>
            </li>
          </ul>
        </nav>
        <button className={`nav__menu mono ${open ? 'is-open' : ''}`} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="menu">
          <span>{open ? 'Close' : 'Menu'}</span><i />
        </button>
      </header>

      <div id="menu" className={`menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        {nav.map((n, i) => (
          <a key={n.id} href={`#${n.id}`} className="menu__link" onClick={go(n.id)} tabIndex={open ? 0 : -1}>
            <span className="mono accent">{String(i + 1).padStart(2, '0')}</span>
            <b>{n.label}</b>
          </a>
        ))}
        <div className="menu__resume"><ResumeButtons tabIndex={open ? 0 : -1} /></div>
        <div className="menu__foot mono mono--ink2">
          <a href={`mailto:${identity.email}`} tabIndex={open ? 0 : -1}>{identity.email}</a>
          <span className="mono--ink3">{identity.location} / {identity.year}</span>
        </div>
      </div>

      <div className={`hud mono ${active === 'top' || active === 'contact' ? 'is-hidden' : ''}`} ref={hud} aria-hidden="true">
        <span ref={pct}>000</span>
        <span className="hud__bar"><i /></span>
        <span className="hud__sec">{phase}</span>
      </div>
    </>
  );
}
