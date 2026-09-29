import { useEffect, useRef } from 'react';
import { ScrollTrigger, reducedMotion } from '../lib/motion';
import { about } from '../data/portfolio';
import SectionHead from './SectionHead';
import Line from './Line';

const HIGHLIGHT = new Set(['AI/ML', 'LLM', 'pipelines.']);

export default function About() {
  const lead = useRef(null);

  // words light up as the paragraph scrolls through the viewport
  useEffect(() => {
    const words = lead.current.querySelectorAll('.w');
    if (reducedMotion) { words.forEach((w) => w.classList.add('on')); return undefined; }
    const st = ScrollTrigger.create({
      trigger: lead.current,
      start: 'top 82%',
      end: 'bottom 45%',
      onUpdate: (self) => {
        const n = Math.round(self.progress * words.length);
        words.forEach((w, i) => w.classList.toggle('on', i < n));
      },
    });
    return () => st.kill();
  }, []);

  const text = `${about.lead} ${about.body}`.split(' ');

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="wrap">
        <SectionHead index="01" label="About" from="Boot" to="Identity" />
        <h2 id="about-title" className="mega about__title">
          <Line>About</Line>
          <Line d={0.08}><span className="outline">The</span> Engineer</Line>
        </h2>

        <div className="about__grid">
          <div className="about__side mono mono--ink3 rv">
            <span>// Profile.md</span>
            <span>Status: <span style={{ color: 'var(--live)' }}>Open to work</span></span>
          </div>
          <p className="about__lead" ref={lead}>
            {text.map((w, i) => (
              <span key={i} className={`w ${HIGHLIGHT.has(w) ? 'hl' : ''}`}>{w} </span>
            ))}
          </p>
          <p className="about__close rv">{about.close}</p>
        </div>

        <dl className="meta">
          {about.meta.map((m, i) => (
            <div className="meta__cell rv" style={{ '--d': `${i * 0.08}s` }} key={m.k}>
              <dt className="mono mono--ink3">{String(i + 1).padStart(2, '0')} — {m.k}</dt>
              <dd className="meta__v">{m.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
