import { useEffect, useRef, useState } from 'react';
import { gsap, reducedMotion } from '../lib/motion';
import { bootLines } from '../data/portfolio';

/** ~2s system boot. Calls onReveal when the hero should start animating, onDone when removed. */
export default function Loader({ onReveal, onDone }) {
  const root = useRef(null);
  const count = useRef(null);
  const bar = useRef(null);
  const [step, setStep] = useState(-1);

  useEffect(() => {
    const speed = reducedMotion ? 0.35 : 1;
    const state = { n: 0 };
    const tl = gsap.timeline();
    tl.to(state, {
      n: 100,
      duration: 1.7 * speed,
      ease: 'power2.inOut',
      onUpdate: () => { if (count.current) count.current.textContent = String(Math.round(state.n)).padStart(3, '0'); },
    }, 0);
    tl.to(bar.current, { scaleX: 1, duration: 1.7 * speed, ease: 'power2.inOut' }, 0);
    bootLines.forEach((_, i) => tl.call(() => setStep(i), null, (i * 0.3) * speed));
    tl.call(() => onReveal && onReveal(), null, 1.95 * speed);
    tl.to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.9 * speed, ease: 'expo.inOut' }, 1.9 * speed);
    tl.call(() => onDone && onDone(), null, 2.85 * speed);
    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="loader" ref={root} style={{ clipPath: 'inset(0% 0% 0% 0%)' }} aria-live="polite" role="status">
      <div className="loader__top mono">
        <span>ANJALI.OS <span className="mono--ink3">v26.0</span></span>
        <span className="mono--ink3">Boot sequence</span>
      </div>
      <div className="loader__log mono">
        {bootLines.map((l, i) => {
          const last = i === bootLines.length - 1;
          const cls = [
            'loader__row',
            i <= step ? 'is-on' : '',
            i < step ? 'is-done' : '',
            last && i <= step ? 'is-final' : '',
          ].join(' ');
          return (
            <div key={l} className={cls}>
              <span className="loader__ok">{i < step ? '[ OK ]' : i === step ? (last ? '[ ✓ ]' : '[ .. ]') : '[    ]'}</span>
              <span>{l}{last ? '.' : '...'}</span>
            </div>
          );
        })}
      </div>
      <div className="loader__bot">
        <span className="loader__count" ref={count}>000</span>
        <span className="mono mono--ink3" style={{ alignSelf: 'flex-end' }}>AI / Machine Learning Engineer</span>
      </div>
      <span className="loader__bar" ref={bar} />
    </div>
  );
}
