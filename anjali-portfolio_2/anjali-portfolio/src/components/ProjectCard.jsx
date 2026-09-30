import { useRef } from 'react';

/**
 * One card system for every project — ML and web share the same frame,
 * rhythm, hover light and actions so the two sections read as one body of work.
 */
export default function ProjectCard({ id, kind, year, frameLabel, visual, title, desc, stats = [], tech = [], live, repo, index = 0 }) {
  const el = useRef(null);

  const onMove = (e) => {
    const r = el.current.getBoundingClientRect();
    el.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <article className="web rv" ref={el} onPointerMove={onMove} style={{ '--d': `${index * 0.08}s` }}>
      <span className="web__light" aria-hidden="true" />

      <header className="web__top">
        <span className="mono web__id">{id}</span>
        <span className="mono mono--ink3">{kind}</span>
        {year && <span className="mono mono--ink3 web__year">{year}</span>}
      </header>

      <div className="webviz" aria-hidden="true">
        <div className="webviz__bar">
          <i /><i /><i />
          <span className="mono">{frameLabel}</span>
        </div>
        <div className="webviz__screen">{visual}</div>
      </div>

      <h3 className="web__title">{title}</h3>
      <p className="web__desc">{desc}</p>

      {stats.length > 0 && (
        <dl className="web__stats">
          {stats.map((s) => (
            <div key={s.k}>
              <dt>{s.v}</dt>
              <dd className="mono mono--ink3">{s.k}</dd>
            </div>
          ))}
        </dl>
      )}

      <ul className="web__tags mono">
        {tech.map((t) => <li key={t}>{t}</li>)}
      </ul>

      <div className="web__actions">
        {live && (
          <a className="web__btn web__btn--solid mono" href={live} target="_blank" rel="noopener noreferrer" data-cursor="Visit">
            Live site <span aria-hidden="true">&#8599;</span>
          </a>
        )}
        {repo ? (
          <a className="web__btn mono" href={repo} target="_blank" rel="noopener noreferrer" data-cursor="Open">
            Source <span aria-hidden="true">&#8599;</span>
          </a>
        ) : (
          !live && <span className="web__btn web__btn--muted mono">Source on request</span>
        )}
      </div>
    </article>
  );
}
