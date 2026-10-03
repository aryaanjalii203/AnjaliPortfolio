import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from '../lib/motion';
import { experience } from '../data/portfolio';
import SectionHead from './SectionHead';
import Line from './Line';

export default function Experience() {
  const list = useRef(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const spine = ScrollTrigger.create({
      trigger: list.current,
      start: 'top 70%',
      end: 'bottom 60%',
      onUpdate: (self) => list.current.style.setProperty('--p', self.progress.toFixed(4)),
    });
    const jobs = list.current.querySelectorAll('.job');
    const sts = Array.from(jobs).map((el, i) =>
      ScrollTrigger.create({ trigger: el, start: 'top 55%', end: 'bottom 55%', onToggle: (s) => s.isActive && setIdx(i) })
    );
    return () => { spine.kill(); sts.forEach((s) => s.kill()); };
  }, []);

  const current = experience[idx];

  return (
    <section id="experience" className="section" aria-labelledby="xp-title">
      <div className="wrap wrap--l wrap--md">
        <SectionHead index="01" label="Experience" from="Intro" to="Experience" />
        <h2 id="xp-title" className="sr-only">Experience</h2>

        <div className="xp">
          <aside className="xp__aside" aria-hidden="true">
            <div className="mega xp__big">
              {experience.map((_, i) => (
                <span key={i} style={{ transform: `translateY(${(i - idx) * 100}%)` }}>{String(i + 1).padStart(2, '0')}</span>
              ))}
            </div>
            <div className="xp__label mono">
              <span className="mono--ink3">Now reading</span>
              <span>{current.org || current.role}</span>
              <span className="mono--ink3">{current.period}</span>
            </div>
          </aside>

          <ol className="xp__list" ref={list}>
            <span className="xp__spine" aria-hidden="true"><i /></span>
            {experience.map((job) => (
              <li className="job" key={job.role} data-rv>
                <span className="job__node" aria-hidden="true" />
                <div className="job__top mono">
                  <span className={`pill-status pill-status--${job.status}`}>
                    <i />{job.status === 'active' ? 'Active' : 'Shipped'}
                  </span>
                  <span className="mono--ink2">{job.period}</span>
                  <span className="mono--ink3">{job.mode}</span>
                </div>
                <h3 className="mega job__role">
                  {job.role.split(' / ').length > 1
                    ? <Line>{job.role}</Line>
                    : job.role.split(' ').reduce((acc, w, i, arr) => {
                        // two balanced lines for long titles
                        const half = Math.ceil(arr.length / 2);
                        (i < half ? acc[0] : acc[1]).push(w);
                        return acc;
                      }, [[], []]).filter((l) => l.length).map((l, i) => <Line key={i} d={i * 0.08}>{l.join(' ')}</Line>)}
                </h3>
                {job.org && (
                  <p className="job__org">
                    <span>@ {job.org}</span>
                  </p>
                )}
                {job.summary && <p className="job__summary rv">{job.summary}</p>}
                <ul className="job__pts">
                  {job.points.map((p, i) => (
                    <li className="job__pt rv" style={{ '--d': `${i * 0.06}s` }} key={i}>
                      <span className="mono mono--ink3">→ {String(i + 1).padStart(2, '0')}</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="job__tags mono mono--ink2">
                  {job.tags.map((t) => <span key={t}>{t}</span>)}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
