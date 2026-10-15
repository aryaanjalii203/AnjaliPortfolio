import { useEffect, useRef } from 'react';
import { ScrollTrigger, reducedMotion, isTouch } from '../lib/motion';
import { createWorld } from '../three/World';

/**
 * The persistent 3D world behind the whole portfolio.
 * Each chapter of the page is pinned to a key on the camera's journey, so scrolling
 * from one section to the next walks the camera from one place in the world to the next.
 */
const CHAPTERS = ['top', 'experience', 'projects', 'web', 'stack', 'education', 'contact'];

export default function WorldLayer({ ready }) {
  const wrap = useRef(null);
  const api = useRef(null);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  useEffect(() => {
    const small = window.innerWidth < 760;
    const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
    let world;
    try {
      world = createWorld(wrap.current, { tier: small || isTouch || weak ? 'low' : 'high', reduced: reducedMotion });
    } catch {
      document.documentElement.classList.add('no-world');
      return undefined;
    }

    // scroll position → journey (0 … chapters-1), piecewise between section tops
    let anchors = [];
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      anchors = CHAPTERS.map((id, i) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const top = el.getBoundingClientRect().top + window.scrollY;
        // arrive at each place a little before its section reaches the top
        return Math.min(max, Math.max(0, i === 0 ? 0 : top - window.innerHeight * 0.35));
      }).filter((v) => v !== null);
      anchors[anchors.length - 1] = Math.min(anchors[anchors.length - 1], max);
      for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
    };
    const journeyAt = (y) => {
      if (!anchors.length) return 0;
      if (y <= anchors[0]) return 0;
      for (let i = 0; i < anchors.length - 1; i++) {
        if (y < anchors[i + 1]) return i + (y - anchors[i]) / (anchors[i + 1] - anchors[i]);
      }
      return anchors.length - 1;
    };
    const veil = (j) => {
      // the world stays visible but steps back behind reading-heavy chapters
      const end = window.innerWidth < 760 ? 0.5 : 0.32; // phones keep more veil — text sits right over the lit house
      const v = j < 1 ? j * 0.52 : j > anchors.length - 2 ? 0.52 + (end - 0.52) * (j - (anchors.length - 2)) : 0.52;
      document.documentElement.style.setProperty('--veil', v.toFixed(3));
    };
    const update = () => { const j = journeyAt(window.scrollY); world.setJourney(j); veil(j); };
    measure();
    const st = ScrollTrigger.create({ start: 0, end: 'max', onUpdate: update, onRefresh: () => { measure(); update(); } });
    update();

    const run = () => (readyRef.current && !document.hidden ? world.start() : world.stop());
    document.addEventListener('visibilitychange', run);
    api.current = { run };
    return () => { st.kill(); document.removeEventListener('visibilitychange', run); world.dispose(); api.current = null; };
  }, []);

  useEffect(() => { if (ready && api.current) api.current.run(); }, [ready]);

  return (
    <>
      <div className="world" ref={wrap} aria-hidden="true" />
      <div className="world__veil" aria-hidden="true" />
    </>
  );
}
