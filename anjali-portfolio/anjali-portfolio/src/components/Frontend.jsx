import { useRef } from 'react';
import { frontend } from '../data/portfolio';
import SectionHead from './SectionHead';
import WebViz from './WebViz';
import Line from './Line';

function WebCard({ p }) {
  const el = useRef(null);

  const onMove = (e) => {
    const r = el.current.getBoundingClientRect();
    el.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <article className={`web rv web--${p.theme}`} ref={el} onPointerMove={onMove}>
      <span className="web__light" aria-hidden="true" />

      <header className="web__top">
        <span className="mono web__id">{p.id}</span>
        <span className="mono mono--ink3">{p.kind}</span>
        <span className="mono mono--ink3 web__year">{p.year}</span>
      </header>

      <WebViz theme={p.theme} />

      <h3 className="web__title">{p.title}</h3>
      <p className="web__desc">{p.desc}</p>

      <dl className="web__stats">
        {p.stats.map((s) => (
          <div key={s.k}>
            <dt>{s.v}</dt>
            <dd className="mono mono--ink3">{s.k}</dd>
          </div>
        ))}
      </dl>

      <ul className="web__tags mono">
        {p.tech.map((t) => <li key={t}>{t}</li>)}
      </ul>

      <div className="web__actions">
        {p.live && (
          <a className="web__btn web__btn--solid mono" href={p.live} target="_blank" rel="noopener noreferrer" data-cursor="Visit">
            Live site <span aria-hidden="true">&#8599;</span>
          </a>
        )}
        <a className="web__btn mono" href={p.repo} target="_blank" rel="noopener noreferrer" data-cursor="Open">
          Source <span aria-hidden="true">&#8599;</span>
        </a>
      </div>
    </article>
  );
}

export default function Frontend() {
  return (
    <section id="web" className="section section--web" aria-labelledby="web-title">
      <div className="wrap">
        <SectionHead index="03.1" label="Front-end" from="Projects" to="Interfaces" />
        <h2 id="web-title" className="mega projects__title">
          <span>
            <Line>Web</Line>
            <Line d={0.08}><span className="outline">Builds</span></Line>
          </span>
          <span className="mono mono--ink2 rv" style={{ letterSpacing: '0.08em' }}>
            {String(frontend.length).padStart(2, '0')} interfaces / shipped to the browser
          </span>
        </h2>
        <div className="webgrid">
          {frontend.map((p) => <WebCard key={p.id} p={p} />)}
        </div>
      </div>
    </section>
  );
}
