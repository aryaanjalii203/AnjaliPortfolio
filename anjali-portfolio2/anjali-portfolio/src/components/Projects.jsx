import { projects } from '../data/portfolio';
import SectionHead from './SectionHead';
import ProjectViz from './ProjectViz';
import ProjectCard from './ProjectCard';
import Line from './Line';

export default function Projects() {
  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="wrap">
        <SectionHead index="03" label="ML Projects" from="Experience" to="Models" />
        <h2 id="projects-title" className="mega projects__title">
          <span>
            <Line>Selected</Line>
            <Line d={0.08}><span className="outline">Models</span></Line>
          </span>
          <span className="mono mono--ink2 rv projects__count">
            {String(projects.length).padStart(2, '0')} AI / ML systems / trained, evaluated, shipped
          </span>
        </h2>
        <div className="cardrow cardrow--4" role="list">
          {projects.map((p, i) => (
            <div role="listitem" key={p.id} className="cardrow__cell">
              <ProjectCard
                index={i}
                id={`P—${p.id}`}
                kind={p.domain}
                year={p.year}
                frameLabel={`fig.${p.id} / ${p.viz}`}
                visual={<ProjectViz kind={p.viz} />}
                title={p.title}
                desc={p.desc}
                stats={p.stats}
                tech={p.tech}
                repo={p.repo}
              />
            </div>
          ))}
        </div>
        <p className="cardrow__hint mono mono--ink3" aria-hidden="true">Swipe &rarr;</p>
      </div>
    </section>
  );
}
