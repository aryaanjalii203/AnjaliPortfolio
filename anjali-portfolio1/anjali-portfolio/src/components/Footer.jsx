import { identity } from '../data/portfolio';
import { scrollToId } from '../lib/motion';

export default function Footer() {
  return (
    <footer className="footer mono mono--ink2">
      <span style={{ color: 'var(--ink)' }}>{identity.first} {identity.last}</span>
      <span>{identity.title}</span>
      <span>{identity.location} / {identity.year}</span>
      <button className="mono" onClick={() => scrollToId('top')}>Back to top ↑</button>
    </footer>
  );
}
