import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isTouch =
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;

let lenis = null;

export function startLenis() {
  if (lenis || reducedMotion) return lenis;
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis && lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function getLenis() {
  return lenis;
}

/** Smooth-scroll to a section id, falling back to native scrolling. */
export function scrollToId(id) {
  const el = id === 'top' ? 0 : document.getElementById(id);
  if (el === null) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.6, offset: 0 });
  else if (el === 0) window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
}

export { gsap, ScrollTrigger };
