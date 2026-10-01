import { frontend } from '../data/portfolio';
import SectionHead from './SectionHead';
import WebViz from './WebViz';
import ProjectCard from './ProjectCard';
import Line from './Line';

const FRAME = { arena: 'playforge / arena', cafe: 'ember-oak / index', shop: 'aryas-belmond / shop' };

export default function Frontend() {
  return (
    <section id="web" className="section section--web" aria-labelledby="web-title">
      <div className="wrap wrap--l wrap--lg">
        <SectionHead index="02.1" label="Front-end" from="Models" to="Interfaces" />
        <h2 id="web-title" className="mega projects__title">
          <span>
            <Line>Web</Line>
            <Line d={0.08}><span className="outline">Builds</span></Line>
          </span>
          <span className="mono mono--ink2 rv projects__count">
            {String(frontend.length).padStart(2, '0')} interfaces / shipped to the browser
          </span>
        </h2>
        <div className="cardrow cardrow--3" role="list">
          {frontend.map((p, i) => (
            <div role="listitem" key={p.id} className="cardrow__cell">
              <ProjectCard
                index={i}
                id={p.id}
                kind={p.kind}
                year={p.year}
                frameLabel={FRAME[p.theme]}
                visual={<WebViz theme={p.theme} />}
                title={p.title}
                desc={p.desc}
                stats={p.stats}
                tech={p.tech}
                live={p.live}
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
