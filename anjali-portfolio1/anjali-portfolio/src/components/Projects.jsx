import { useRef, useState } from 'react';
import { projects } from '../data/portfolio';
import SectionHead from './SectionHead';
import ProjectViz from './ProjectViz';
import Line from './Line';
import { getLenis } from '../lib/motion';

function Project({ p, open, onToggle }) {
  const el = useRef(null);

  // accent light follows the cursor inside the module
  const onMove = (e) => {
    const r = el.current.getBoundingClientRect();
    el.current.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.current.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <li className={`proj rv ${open ? 'is-open' : ''}`} ref={el} onPointerMove={onMove}>
      <span className="proj__light" aria-hidden="true" />
      <button
        className="proj__head"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`proj-${p.id}`}
        data-cursor={open ? 'Close' : 'Open'}
      >
        <span className="proj__num">P—{p.id}</span>
        <span className="mega proj__title">{p.title}</span>
        <span className="proj__domain mono">{p.domain}</span>
        <span className="proj__plus" aria-hidden="true" />
      </button>

      <div className="proj__peek" aria-hidden="true"><ProjectViz kind={p.viz} /></div>

      <div className="proj__body" id={`proj-${p.id}`} role="region" aria-label={p.title}>
        <div className="proj__inner">
          <div className="proj__detail">
            <span className="mono mono--ink3">// Brief</span>
            <div>
              <p className="proj__desc">{p.desc}</p>
              {p.metric && (
                <div className="proj__metric">
                  <b>{p.metric.v}</b>
                  <span className="mono mono--ink2">{p.metric.k}</span>
                </div>
              )}
              <ul className="proj__tech mono">
                {p.tech.map((t, i) => (
                  <li key={t}><span>{t}</span><span className="mono--ink3">{String(i + 1).padStart(2, '0')}</span></li>
                ))}
              </ul>
            </div>
            <figure className="proj__viz">
              {open && <ProjectViz kind={p.viz} />}
              <figcaption className="mono mono--ink3"><span>Fig. {p.id}</span><span>{p.domain}</span></figcaption>
            </figure>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Projects() {
  const [open, setOpen] = useState(null);

  const toggle = (id) => () => {
    setOpen((cur) => (cur === id ? null : id));
    // page height changes while a module expands — let ScrollTrigger/Lenis re-measure after
    setTimeout(() => { const l = getLenis(); l && l.resize(); window.dispatchEvent(new Event('resize')); }, 950);
  };

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHead index="03" label="Projects" from="Experience" to="Projects" />
        <h2 id="projects-title" className="mega projects__title">
          <span>
            <Line>Selected</Line>
            <Line d={0.08}><span className="outline">Artifacts</span></Line>
          </span>
          <span className="mono mono--ink2 rv" style={{ letterSpacing: '0.08em' }}>
            {String(projects.length).padStart(2, "0")} projects / select to expand
          </span>
        </h2>
        <ul className="plist">
          {projects.map((p) => <Project key={p.id} p={p} open={open === p.id} onToggle={toggle(p.id)} />)}
        </ul>
      </div>
    </section>
  );
}
