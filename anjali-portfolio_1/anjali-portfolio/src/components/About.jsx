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
          <aside className="about__card rv">
            <div className="mono mono--ink3" style={{ marginBottom: 14 }}>// profile.md</div>
            <dl className="mono">
              <div className="r"><dt className="mono--ink3">Status</dt><dd className="v" style={{ color: 'var(--live)' }}>Open to work</dd></div>
              <div className="r"><dt className="mono--ink3">Based</dt><dd className="v">India</dd></div>
              <div className="r"><dt className="mono--ink3">Remote</dt><dd className="v">Yes</dd></div>
              <div className="r"><dt className="mono--ink3">Notice</dt><dd className="v">Immediate</dd></div>
            </dl>
            <div className="about__spark" aria-hidden="true">
              {[38, 52, 31, 66, 44, 78, 59, 87, 71, 94, 82, 100].map((h, i) => (
                <i key={i} style={{ height: `${h}%`, opacity: 0.35 + (i / 12) * 0.65 }} className={i > 9 ? 'on' : ''} />
              ))}
            </div>
            <div className="mono mono--ink3" style={{ marginTop: 9, fontSize: 9 }}>Commitment / 2022 → 2026</div>
          </aside>
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
