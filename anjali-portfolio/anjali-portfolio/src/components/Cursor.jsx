import { useEffect, useRef } from 'react';
import { gsap } from '../lib/motion';

/**
 * Dot + delayed ring. Grows over [data-cursor], a, button.
 * [data-cursor="Open"] shows a text label inside the ring.
 */
export default function Cursor() {
  const root = useRef(null);
  const dot = useRef(null);
  const ring = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    document.documentElement.classList.add('has-cursor');
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.08, ease: 'power3' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.08, ease: 'power3' });
    const rx = gsap.quickTo(ring.current, 'x', { duration: 0.5, ease: 'power3' });
    const ry = gsap.quickTo(ring.current, 'y', { duration: 0.5, ease: 'power3' });
    const el = root.current;
    el.classList.add('is-hidden');

    const move = (e) => {
      el.classList.remove('is-hidden');
      dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    };
    const over = (e) => {
      const t = e.target.closest('[data-cursor], a, button');
      el.classList.toggle('is-hover', !!t);
      const text = t && t.getAttribute('data-cursor');
      el.classList.toggle('is-label', !!text);
      if (text) label.current.textContent = text;
    };
    const leave = () => el.classList.add('is-hidden');

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <span className="cursor__dot" ref={dot} />
      <span className="cursor__ring" ref={ring}><span className="cursor__label" ref={label} /></span>
    </div>
  );
}
