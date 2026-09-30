import { useEffect, useRef } from 'react';
import { gsap, reducedMotion } from '../lib/motion';
import { identity } from '../data/portfolio';

/**
 * A scroll-scrubbed band of the name between chapters. The outline drifts
 * sideways while a filled copy wipes in, so the name "writes itself" as you pass.
 */
export default function NameBand({ reverse = false, words = [] }) {
  const root = useRef(null);
  const items = [];
  for (let i = 0; i < 4; i++) {
    items.push(<span key={`n${i}`} className="nband__name">{identity.first}</span>);
    items.push(<span key={`w${i}`} className="nband__word mono">{words[i % words.length]}</span>);
  }

  useEffect(() => {
    if (reducedMotion) return undefined;
    const ctx = gsap.context(() => {
      const st = { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 };
      gsap.fromTo('.nband__track', { xPercent: reverse ? -28 : 0 }, { xPercent: reverse ? 0 : -28, ease: 'none', scrollTrigger: st });
      gsap.fromTo(root.current, { '--wipe': '0%' }, { '--wipe': '100%', ease: 'none', scrollTrigger: { ...st, start: 'top 85%', end: 'bottom 25%' } });
    }, root);
    return () => ctx.revert();
  }, [reverse]);

  return (
    <div className="nband" ref={root} aria-hidden="true">
      <div className="nband__track">
        <div className="nband__line mega">{items}</div>
        <div className="nband__fill mega">{items}</div>
      </div>
    </div>
  );
}
