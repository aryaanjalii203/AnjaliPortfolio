import { principles, identity } from '../data/portfolio';
import Line from './Line';

/** The quote and the working principles — a quieter beat right before the closing section. */
export default function Principles() {
  return (
    <section id="principles" className="section princ" aria-labelledby="princ-title">
      <div className="wrap wrap--l wrap--md">
        <div className="princ__panel">
        <div className="princ__head">
          <h2 id="princ-title" className="mega princ__title">
            <Line>Beyond</Line>
            <Line d={0.08}><span className="outline">the Model.</span></Line>
          </h2>
          <p className="princ__lede rv">The habits behind the work — how I think about models, data and the people who use them.</p>
        </div>
        <div className="princ__grid">
          <figure className="princ__quote rv">
            <span className="mono mono--ink3">A line I write by</span>
            <blockquote>&ldquo;{principles.quote}&rdquo;</blockquote>
            <figcaption className="mono mono--ink2">&mdash; {identity.first[0]}{identity.first.slice(1).toLowerCase()} {identity.last[0]}{identity.last.slice(1).toLowerCase()}</figcaption>
          </figure>
          <ul className="princ__list">
            {principles.points.map((p, i) => (
              <li key={p.t} className="rv" style={{ '--d': `${i * 0.06}s` }}>
                <b>{p.t}</b>
                <span>{p.d}</span>
              </li>
            ))}
          </ul>
        </div>
        </div>
      </div>
    </section>
  );
}
