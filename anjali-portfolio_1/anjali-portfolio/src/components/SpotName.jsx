import { useEffect, useRef } from 'react';
import { gsap, reducedMotion, isTouch } from '../lib/motion';

/**
 * The name as a light-sensitive surface: an outline layer, plus a filled
 * copy revealed only where the cursor "shines". Used by the footer signature
 * (the hero has its own tuned version with the portrait).
 */
export default function SpotName({ text, className = '' }) {
  const box = useRef(null);
  const fill = useRef(null);

  useEffect(() => {
    const el = box.current;
    const f = fill.current;
    const spot = { x: 0.5, y: 0.5 };
    const target = { x: 0.5, y: 0.5 };
    const set = () => {
      f.style.setProperty('--mx', `${spot.x * 100}%`);
      f.style.setProperty('--my', `${spot.y * 100}%`);
    };
    set();
    if (reducedMotion) return undefined;

    if (isTouch) {
      const tw = gsap.to(spot, {
        keyframes: [{ x: 0.1, y: 0.4 }, { x: 0.9, y: 0.6 }, { x: 0.5, y: 0.5 }],
        duration: 14, repeat: -1, ease: 'sine.inOut', onUpdate: set,
      });
      return () => tw.kill();
    }

    let on = false;
    const tick = () => {
      spot.x += (target.x - spot.x) * 0.1;
      spot.y += (target.y - spot.y) * 0.1;
      set();
    };
    const move = (e) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = (e.clientY - r.top) / r.height;
    };
    // only tick while the name is on screen
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting && !on) { on = true; gsap.ticker.add(tick); window.addEventListener('pointermove', move, { passive: true }); }
      if (!en.isIntersecting && on) { on = false; gsap.ticker.remove(tick); window.removeEventListener('pointermove', move); }
    });
    io.observe(el);
    return () => { io.disconnect(); gsap.ticker.remove(tick); window.removeEventListener('pointermove', move); };
  }, []);

  return (
    <div className={`spotname ${className}`} ref={box} aria-hidden="true">
      <span className="spotname__line mega">{text}</span>
      <span className="spotname__fill mega" ref={fill}>{text}</span>
    </div>
  );
}
