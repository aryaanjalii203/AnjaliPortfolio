import { certifications } from '../data/portfolio';
import Line from './Line';

export default function Certifications() {
  return (
    <section id="certifications" className="section" aria-labelledby="certs-title">
      <div className="wrap wrap--r wrap--sm">
        <div className="certs__head">
          <h2 id="certs-title" className="mega certs__title">
            <Line>Certi</Line>
            <Line d={0.08}><span className="outline">fications</span></Line>
          </h2>
          <span className="mono mono--ink3 rv">[04.1] &nbsp;{String(certifications.length).padStart(2, '0')} selected credentials</span>
        </div>
        <ol>
          {certifications.map((c, i) => (
            <li className="cert rv" style={{ '--d': `${i * 0.05}s` }} key={c.name}>
              <span className="mono mono--ink3">{String(i + 1).padStart(2, '0')}</span>
              <span className="cert__name">{c.name}</span>
              <span className="cert__iss mono mono--ink2">{c.issuer}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
