import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, reducedMotion, isTouch } from '../lib/motion';
import { createLatentField } from '../three/LatentField';

/**
 * The latent-space field lives behind the whole site, not just the hero.
 * Full strength in the hero, then it settles to a quiet backdrop that keeps
 * turning as you scroll and still answers the cursor with its KNN links.
 */
export default function FieldLayer() {
  const wrap = useRef(null);

  useEffect(() => {
    const mobile = window.innerWidth < 760 || isTouch;
    let f;
    try {
      f = createLatentField(wrap.current, { mobile, reduced: reducedMotion });
    } catch {
      return undefined; // no WebGL — the site stands without it
    }

    const hero = document.getElementById('top');
    const heroST = ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top',
      onUpdate: (self) => f.setScroll(self.progress),
    });
    const pageST = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => f.setPage(self.progress),
    });
    const fade = gsap.fromTo(wrap.current, { opacity: 1 }, {
      opacity: mobile ? 0.28 : 0.42, ease: 'none',
      scrollTrigger: { trigger: hero, start: '35% top', end: 'bottom top', scrub: true },
    });

    // pause when the tab is hidden
    const vis = () => (document.hidden ? f.stop() : f.start());
    document.addEventListener('visibilitychange', vis);
    f.start();

    return () => {
      heroST.kill(); pageST.kill(); fade.scrollTrigger && fade.scrollTrigger.kill(); fade.kill();
      document.removeEventListener('visibilitychange', vis);
      f.dispose();
    };
  }, []);

  return <div className="field" ref={wrap} aria-hidden="true" />;
}
