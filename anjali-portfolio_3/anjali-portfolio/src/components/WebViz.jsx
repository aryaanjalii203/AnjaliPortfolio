/** Abstract wireframes drawn per front-end project — no screenshots needed. */

function Arena() {
  return (
    <svg viewBox="0 0 400 190" className="webviz__svg" role="img" aria-label="Multiplayer arena wireframe">
      <defs>
        <linearGradient id="wa" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.26" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="20" y="14" width="360" height="162" fill="url(#wa)" opacity="0.7" />
      <rect x="20" y="14" width="360" height="162" fill="none" stroke="currentColor" strokeOpacity="0.28" />
      <line x1="200" y1="14" x2="200" y2="176" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="3 6" />
      <circle cx="200" cy="95" r="34" fill="none" stroke="currentColor" strokeOpacity="0.2" />
      {/* paddles */}
      <rect className="webviz__p1" x="33" y="72" width="6" height="46" fill="currentColor" opacity="0.85" />
      <rect className="webviz__p2" x="361" y="58" width="6" height="46" fill="var(--accent)" />
      {/* puck + predicted path */}
      <path d="M140 108 L 228 66 L 296 116" fill="none" stroke="var(--accent)" strokeOpacity="0.32" strokeDasharray="2 5" />
      <circle className="webviz__ball" cx="140" cy="108" r="5" fill="var(--accent)" />
      {/* hud ticks */}
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <rect key={i} x={34 + i * 42} y={166} width={i === 2 ? 26 : 14} height="2" fill="currentColor" opacity={i === 2 ? 0.7 : 0.22} />
      ))}
    </svg>
  );
}

function Cafe() {
  return (
    <svg viewBox="0 0 400 190" className="webviz__svg" role="img" aria-label="Landing page wireframe">
      <defs>
        <radialGradient id="wc" cx="0.5" cy="0.15" r="0.85">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.2" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="20" y="14" width="360" height="162" fill="url(#wc)" />
      <rect x="20" y="14" width="360" height="162" fill="none" stroke="currentColor" strokeOpacity="0.28" />
      {/* steam */}
      <path className="webviz__s1" d="M187 56 c 6 -9 -6 -14 0 -23" fill="none" stroke="var(--accent)" strokeOpacity="0.6" />
      <path className="webviz__s2" d="M200 52 c 6 -9 -6 -14 0 -23" fill="none" stroke="var(--accent)" strokeOpacity="0.45" />
      <path className="webviz__s3" d="M213 56 c 6 -9 -6 -14 0 -23" fill="none" stroke="var(--accent)" strokeOpacity="0.6" />
      {/* cup */}
      <path d="M172 68 h56 v26 a28 28 0 0 1 -56 0 z" fill="none" stroke="currentColor" strokeOpacity="0.55" />
      <path d="M228 73 h12 a13 13 0 0 1 0 26 h-12" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <path d="M172 68 h56 v8 h-56 z" fill="var(--accent)" opacity="0.5" />
      {/* type blocks */}
      <rect x="140" y="132" width="120" height="6" fill="currentColor" opacity="0.5" />
      <rect x="164" y="146" width="72" height="4" fill="currentColor" opacity="0.25" />
      <rect x="176" y="158" width="48" height="12" fill="none" stroke="var(--accent)" strokeOpacity="0.7" />
    </svg>
  );
}

function Shop() {
  // beaded bag: a grid of beads in a bag silhouette, with a product-card strip below
  const beads = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 9; c++) {
      const x = 164 + c * 9 + (r % 2 ? 4.5 : 0);
      const y = 62 + r * 9;
      if (x > 238) continue;
      beads.push(<circle key={`${r}-${c}`} className={(r * 9 + c) % 7 === 3 ? 'webviz__bead' : undefined} cx={x} cy={y} r="3.2" fill={(r + c) % 5 === 0 ? 'var(--accent)' : 'currentColor'} opacity={(r + c) % 5 === 0 ? 0.9 : 0.35} />);
    }
  }
  return (
    <svg viewBox="0 0 400 190" className="webviz__svg" role="img" aria-label="Storefront wireframe">
      <rect x="20" y="14" width="360" height="162" fill="none" stroke="currentColor" strokeOpacity="0.28" />
      {/* sidebar filters */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="34" y={34 + i * 14} width={i === 1 ? 44 : 34} height="4" fill={i === 1 ? 'var(--accent)' : 'currentColor'} opacity={i === 1 ? 0.8 : 0.25} />
      ))}
      {/* bag */}
      <path d="M180 56 q 21 -26 42 0" fill="none" stroke="currentColor" strokeOpacity="0.5" />
      <rect x="156" y="54" width="90" height="62" rx="6" fill="none" stroke="currentColor" strokeOpacity="0.4" />
      {beads}
      {/* product rail */}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={112 + i * 62} y="128" width="52" height="34" fill="none" stroke="currentColor" strokeOpacity={i === 1 ? 0.6 : 0.22} />
          <rect x={118 + i * 62} y="154" width="24" height="3" fill="currentColor" opacity="0.4" />
        </g>
      ))}
      {/* cart */}
      <circle cx="352" cy="32" r="8" fill="none" stroke="var(--accent)" strokeOpacity="0.8" />
      <circle className="webviz__ping" cx="358" cy="26" r="3" fill="var(--accent)" />
    </svg>
  );
}

/** Just the drawing — the browser frame comes from ProjectCard. */
export default function WebViz({ theme }) {
  if (theme === 'cafe') return <Cafe />;
  if (theme === 'shop') return <Shop />;
  return <Arena />;
}
