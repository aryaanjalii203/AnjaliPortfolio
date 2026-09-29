import { useState } from 'react';
import { identity } from '../data/portfolio';
import SectionHead from './SectionHead';
import Line from './Line';

const Arrow = () => (
  <svg className="clink__arrow" viewBox="0 0 40 40" aria-hidden="true"><path d="M10 30 L30 10 M14 10 H30 V26" /></svg>
);

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const links = [
    { k: 'Email', v: identity.email, href: `mailto:${identity.email}` },
    { k: 'GitHub', v: 'github.com/aryaanjalii203', href: identity.github, ext: true },
    { k: 'LinkedIn', v: 'linkedin.com/in/anjalikumari', href: identity.linkedin, ext: true },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(identity.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${identity.email}`;
    }
  };

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="wrap" style={{ width: '100%' }}>
        <SectionHead index="06" label="Contact" from="Education" to="Connection" />
        <div className="contact__term mono mono--ink3 rv" aria-hidden="true">
          <span>&gt; handshake --target visitor</span>
          <span>&gt; channel: <span className="mono--ink2">open</span></span>
          <span className="ok">&gt; connection established_</span>
        </div>
        <h2 id="contact-title" className="mega contact__big">
          <Line>Let&rsquo;s</Line>
          <Line d={0.1}>Build<span className="accent">.</span></Line>
        </h2>
        <div className="contact__links">
          {links.map((l, i) => (
            <a
              key={l.k}
              href={l.href}
              className="clink rv"
              style={{ '--d': `${i * 0.08}s` }}
              data-cursor={l.k === 'Email' ? 'Write' : 'Visit'}
              {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="mono mono--ink3">{String(i + 1).padStart(2, '0')} / {l.k}</span>
              <span className="clink__v">{l.v}</span>
              <Arrow />
            </a>
          ))}
        </div>
        <div className="contact__row">
          <button className="contact__copy mono" onClick={copy} aria-live="polite">
            {copied ? 'Copied to clipboard ✓' : 'Copy email address'}
          </button>
          <a className="contact__copy mono" href={identity.resume} target="_blank" rel="noopener noreferrer">Résumé (PDF) ↗</a>
        </div>
      </div>
    </section>
  );
}
