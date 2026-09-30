import { useEffect, useRef } from 'react';
import { gsap, reducedMotion } from '../lib/motion';
import { hackathon } from '../data/portfolio';
import Line from './Line';

export default function Hackathon() {
  const root = useRef(null);
  useEffect(() => {
    if (reducedMotion) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo('.hack__bg', { xPercent: 4 }, {
        xPercent: -34, ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="hackathon" className="hack" ref={root} aria-labelledby="hack-title">
      <div className="hack__bg" aria-hidden="true"><span className="mega">HackOn HackOn</span></div>
      <div className="wrap">
        <div className="shead rv">
          <span className="mono"><span className="accent">[04.1]</span>&nbsp;&nbsp;Featured event</span>
          <span className="mono shead__path">Education &rarr; <b>Field test</b></span>
          <span className="shead__rule rv-rule" />
        </div>
        <div className="hack__inner">
          <h2 id="hack-title" className="mega hack__name">
            <Line>Amazon</Line>
            <Line d={0.08}>HackOn<span className="dot">.</span></Line>
          </h2>
          <div className="rv">
            <div className="hack__meta mono">
              <span className="accent">{hackathon.season}</span>
              <span>{hackathon.role}</span>
              <span className="mono--ink2">{hackathon.date}</span>
            </div>
            <p className="hack__desc">{hackathon.desc}</p>
            <div className="hack__sys">
              {hackathon.focus.map((f, i) => (
                <div className="hack__node" key={f}>
                  <span className="mono mono--ink3">{String(i + 1).padStart(2, '0')}</span>
                  <b>{f}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
