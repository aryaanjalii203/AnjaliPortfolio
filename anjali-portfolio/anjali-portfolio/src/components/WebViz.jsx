/** Abstract browser-frame mock drawn per front-end project — no screenshots needed. */

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

export default function WebViz({ theme }) {
  return (
    <div className="webviz" aria-hidden="true">
      <div className="webviz__bar">
        <i /><i /><i />
        <span className="mono">{theme === 'cafe' ? 'ember-oak / index' : 'playforge / arena'}</span>
      </div>
      <div className="webviz__screen">{theme === 'cafe' ? <Cafe /> : <Arena />}</div>
    </div>
  );
}
