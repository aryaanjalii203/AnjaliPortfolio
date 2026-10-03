import { useEffect, useRef } from 'react';
import { ScrollTrigger } from '../lib/motion';
import { education } from '../data/portfolio';
import SectionHead from './SectionHead';
import Line from './Line';

export default function Education() {
  const years = useRef(null);
  const span = [];
  for (let y = education.from; y <= education.to; y++) span.push(y);

  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: years.current,
      start: 'top 90%',
      end: 'top 45%',
      scrub: true,
      onUpdate: (s) => years.current.style.setProperty('--p', s.progress.toFixed(4)),
    });
    return () => st.kill();
  }, []);

  return (
    <section id="education" className="section" aria-labelledby="edu-title">
      <div className="wrap wrap--l wrap--sm">
        <SectionHead index="04" label="Education" from="Intelligence" to="Education" />
        <div className="edu">
          <div>
            <h2 id="edu-title" className="mega edu__deg"><Line>{education.degree}</Line></h2>
            <p className="edu__field">
              <Line d={0.1}>Computer Science</Line>
              <Line d={0.16}>&amp; Engineering</Line>
            </p>
          </div>
          <div className="rv">
            <div className="edu__card mono">
              <div className="edu__row"><span className="mono--ink3">Institution</span><span>{education.school}</span></div>
              <div className="edu__row"><span className="mono--ink3">Location</span><span>{education.place}</span></div>
              <div className="edu__row"><span className="mono--ink3">Period</span><span>{education.from} — {education.to}</span></div>
            </div>
          </div>
        </div>
        <div className="years" ref={years} aria-hidden="true">
          <div className="years__track"><i className="years__fill" /></div>
          <div className="years__ticks mono mono--ink2">
            {span.map((y) => <span key={y}>{y}</span>)}
          </div>
        </div>
      </div>
    </section>
  );
}
