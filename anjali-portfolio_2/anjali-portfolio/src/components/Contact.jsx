import { useState } from 'react';
import { identity } from '../data/portfolio';
import { scrollToId } from '../lib/motion';
import Line from './Line';

/** Closing section + footer in one: a big closing question and contact links. */
export default function Contact() {
  const [copied, setCopied] = useState(false);

  const links = [
    { k: 'Email', v: identity.email, href: `mailto:${identity.email}` },
    { k: 'LinkedIn', v: 'in/anjalikumari', href: identity.linkedin, ext: true },
    { k: 'GitHub', v: 'aryaanjalii203', href: identity.github, ext: true },
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
    <footer id="contact" className="outro" aria-labelledby="contact-title">
      <div className="outro__grid">
        <div className="outro__left">
          <p className="mono mono--ink2 outro__eyebrow rv">05 / Open to AI &middot; ML roles &mdash; {identity.year}</p>
          <h2 id="contact-title" className="outro__title">
            <Line>Got a model</Line>
            <Line d={0.08}><span className="outro__outline">to ship?</span></Line>
          </h2>
          <p className="outro__copy rv">
            If you&rsquo;re hiring for an early-career AI/ML role, need LLM outputs evaluated against a rubric, or want a data
            pipeline or automation taken from rough requirements to a working release &mdash; let&rsquo;s connect.
          </p>
        </div>

        <ul className="outro__links">
          {links.map((l, i) => (
            <li key={l.k} className="rv" style={{ '--d': `${0.06 * i}s` }}>
              <a
                href={l.href}
                className="olink"
                data-cursor={l.k === 'Email' ? 'Write' : 'Open'}
                {...(l.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="mono olink__k">{l.k} <span aria-hidden="true">&#8599;</span></span>
                <span className="olink__v">{l.v}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="outro__bar mono mono--ink2">
        <span>&copy; {identity.year} <b>{identity.first} {identity.last}</b></span>
        <span className="outro__bar-mid">{identity.title} &middot; {identity.location}</span>
        <span className="outro__bar-end">
          <button className="mono" onClick={copy} aria-live="polite">{copied ? 'Email copied ✓' : 'Copy email'}</button>
          <button className="mono" onClick={() => scrollToId('top')}>Back to top &uarr;</button>
        </span>
      </div>
    </footer>
  );
}
