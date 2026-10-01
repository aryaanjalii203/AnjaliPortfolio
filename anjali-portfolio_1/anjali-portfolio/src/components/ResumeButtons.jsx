import { identity } from '../data/portfolio';

const FILE = 'Anjali-Kumari-Resume.pdf';

/** Primary "Download Resume" (forces a download) + secondary "View" (opens the PDF in a new tab). */
export default function ResumeButtons({ compact = false, tabIndex }) {
  return (
    <div className={`resume ${compact ? 'resume--compact' : ''}`}>
      <a className="resume__dl mono" href={identity.resume} download={FILE} tabIndex={tabIndex}>
        <span>Download Resume</span>
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v9M4 7.5 8 11.5 12 7.5M3 14h10" /></svg>
      </a>
      <a className="resume__view mono" href={identity.resume} target="_blank" rel="noopener noreferrer" tabIndex={tabIndex}>
        View <span aria-hidden="true">&#8599;</span>
      </a>
    </div>
  );
}
