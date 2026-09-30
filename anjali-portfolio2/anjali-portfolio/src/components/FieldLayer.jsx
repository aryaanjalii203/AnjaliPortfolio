import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, reducedMotion, isTouch } from '../lib/motion';
import { createLatentField } from '../three/LatentField';

/**
 * The latent-space field sits behind every section after the hero: a quiet
 * backdrop that keeps turning as you scroll and answers the cursor with KNN links.
 * It sleeps while the hero's night scene is on screen.
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
    // the hero has its own night scene; the field takes over once you leave it
    let on = false;
    const setOn = (v) => { if (v === on) return; on = v; v ? f.start() : f.stop(); };
    const heroST = ScrollTrigger.create({
      trigger: hero, start: 'top top', end: 'bottom top',
      onUpdate: (self) => { f.setScroll(self.progress); setOn(self.progress > 0.3); },
      onLeave: () => setOn(true),
      onEnterBack: () => setOn(false),
    });
    const pageST = ScrollTrigger.create({
      start: 0, end: 'max',
      onUpdate: (self) => f.setPage(self.progress),
    });
    const fade = gsap.fromTo(wrap.current, { opacity: 0 }, {
      opacity: mobile ? 0.28 : 0.42, ease: 'none',
      scrollTrigger: { trigger: hero, start: '40% top', end: 'bottom top', scrub: true },
    });

    // pause when the tab is hidden
    const vis = () => (document.hidden ? f.stop() : on && f.start());
    document.addEventListener('visibilitychange', vis);
    setOn(window.scrollY > window.innerHeight * 0.3);

    return () => {
      heroST.kill(); pageST.kill(); fade.scrollTrigger && fade.scrollTrigger.kill(); fade.kill();
      document.removeEventListener('visibilitychange', vis);
      f.dispose();
    };
  }, []);

  return <div className="field" ref={wrap} aria-hidden="true" />;
}
