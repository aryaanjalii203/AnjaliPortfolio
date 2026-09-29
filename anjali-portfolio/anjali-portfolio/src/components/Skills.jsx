import { useState } from 'react';
import { stack, marquee } from '../data/portfolio';
import SectionHead from './SectionHead';
import Marquee from './Marquee';
import Line from './Line';

/** Stack as a module loader: pick a subsystem, its modules load in as oversized type. */
export default function Skills() {
  const [cur, setCur] = useState(0);
  const total = stack.reduce((n, s) => n + s.items.length, 0);
  const active = stack[cur];

  return (
    <section id="stack" aria-labelledby="stack-title">
      <div className="section" style={{ paddingBottom: 0 }}>
        <div className="wrap">
          <SectionHead index="04" label="Stack" from="Interfaces" to="Intelligence" />
          <h2 id="stack-title" className="mega stack__title">
            <Line>Intelli</Line>
            <Line d={0.08}><span className="outline">gence</span> Layer</Line>
          </h2>
          <div className="stack__intro">
            <p className="rv">
              {total} modules across {stack.length} subsystems — the tools used to train, evaluate and ship the work above.
            </p>
          </div>

          <div className="stack">
            <div className="stack__tabs" role="tablist" aria-label="Stack categories">
              {stack.map((s, i) => (
                <button
                  key={s.code}
                  role="tab"
                  id={`tab-${s.code}`}
                  aria-selected={cur === i}
                  aria-controls="stack-panel"
                  className={`stack__tab ${cur === i ? 'is-on' : ''}`}
                  onClick={() => setCur(i)}
                  onMouseEnter={() => window.matchMedia('(hover: hover)').matches && setCur(i)}
                >
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  <strong>{s.name}</strong>
                  <span className="mono">{String(s.items.length).padStart(2, '0')}</span>
                </button>
              ))}
            </div>

            <div className="stack__panel" id="stack-panel" role="tabpanel" aria-labelledby={`tab-${active.code}`}>
              <div className="stack__phead mono">
                <span className="mono--ink3">$ load --module <span className="accent">{active.code.toLowerCase()}</span></span>
                <span style={{ color: 'var(--live)' }}>{active.items.length} loaded</span>
              </div>
              <ul className="stack__items" key={active.code}>
                {active.items.map((it, i) => (
                  <li className="stack__item" style={{ '--i': i }} key={it}>
                    {it}<sup>{String(i + 1).padStart(2, '0')}</sup>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 'clamp(80px, 14vh, 160px)' }}>
        <Marquee items={marquee} />
        <Marquee items={[...marquee].reverse()} reverse />
      </div>
    </section>
  );
}
