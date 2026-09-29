import { useEffect, useState } from 'react';
import Loader from './components/Loader';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Education from './components/Education';
import Hackathon from './components/Hackathon';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
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
      <Navbar />
      <main id="main">
        <Hero ready={ready} />
        <Marquee />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Education />
        <Hackathon />
        <Certifications />
        <Contact />
      </main>
      <Footer />
      <div className="grain" aria-hidden="true" />
    </>
  );
}
