import { useEffect } from 'react';

/** Adds `.in` to every .rv / .rv-line / .rv-rule / [data-rv] element once it enters the viewport. */
export default function useReveal(enabled) {
  useEffect(() => {
    if (!enabled) return undefined;
    const els = document.querySelectorAll('.rv, .rv-line, .rv-rule, [data-rv]');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
}
