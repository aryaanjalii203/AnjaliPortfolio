import { marquee } from '../data/portfolio';

/**
 * A thin ticker line. `dir` sets the travel direction; `ghost` draws outlined text.
 * Items are repeated four times so the loop (−50%) is seamless even on very wide screens.
 */
export default function Marquee({ items = marquee, dir = 'left', ghost = false, slow = false }) {
  const row = [...items, ...items, ...items, ...items];
  return (
    <div className={`marquee marquee--${dir} ${ghost ? 'marquee--ghost' : ''} ${slow ? 'marquee--slow' : ''}`} aria-hidden="true">
      <div className="marquee__track">
        {row.map((t, i) => (
          <span className="marquee__item" key={i}>{t}<i /></span>
        ))}
      </div>
    </div>
  );
}
