import { useEffect, useState } from 'react';
import Loader from './components/Loader';
import Cursor from './components/Cursor';
import WorldLayer from './components/WorldLayer';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import Experience from './components/Experience';
import EvalSpotlight from './components/EvalSpotlight';
import Projects from './components/Projects';
import Frontend from './components/Frontend';
import Skills from './components/Skills';
import Education from './components/Education';
import Certifications from './components/Certifications';
import Principles from './components/Principles';
import Contact from './components/Contact';
import useReveal from './hooks/useReveal';
import { startLenis, ScrollTrigger, isTouch } from './lib/motion';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    document.body.classList.add('is-loading');
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.body.classList.remove('is-loading');
    startLenis();
    // fonts shift layout slightly; re-measure triggers once they settle
    document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, [ready]);

  useReveal(ready);

  return (
    <>
      <a href="#main" className="skip">Skip to content</a>
      {booting && <Loader onReveal={() => setReady(true)} onDone={() => setBooting(false)} />}
      {!isTouch && <Cursor />}
      <WorldLayer ready={ready} />
      <Navbar />
      <main id="main">
        <Hero ready={ready} />
        <Marquee dir="right" />
        <Experience />
        <EvalSpotlight />
        <Projects />
        <Frontend />
        <Skills />
        <Education />
        <Certifications />
        <Principles />
      </main>
      <Contact />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
