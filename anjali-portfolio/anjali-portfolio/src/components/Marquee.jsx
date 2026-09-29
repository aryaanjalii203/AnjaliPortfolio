import { marquee } from '../data/portfolio';

/** Two counter-running rows of technical vocabulary. Content is doubled for a seamless loop. */
export default function Marquee({ items = marquee, reverse = false }) {
  const row = [...items, ...items];
  return (
    <div className={`marquee ${reverse ? 'marquee--rev' : ''}`} aria-hidden="true">
      <div className="marquee__track">
        {row.map((t, i) => (
          <span className="marquee__item" key={i}>{t}<i /></span>
        ))}
      </div>
    </div>
  );
}
