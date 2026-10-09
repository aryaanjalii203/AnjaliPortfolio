/**
 * Abstract, code-drawn visuals for each project — no fake screenshots.
 * conv: stacked feature maps narrowing into a classifier
 * face: facial landmark lattice with an emotion readout
 * knn:  scatter plot, a query point and its k nearest neighbours
 * flow: ingestion → processing → matching pipeline
 */

function Conv() {
  const layers = [
    { x: 30, s: 120, n: 3 },
    { x: 118, s: 92, n: 4 },
    { x: 196, s: 66, n: 5 },
    { x: 262, s: 42, n: 6 },
  ];
  return (
    <svg className="viz" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
      {layers.map((l, li) =>
        Array.from({ length: l.n }).map((_, i) => (
          <rect key={`${li}-${i}`} className={li === 3 && i === 0 ? 'ac' : 'ln'} x={l.x + i * 6} y={150 - l.s / 2 - i * 6} width={l.s * 0.55} height={l.s} />
        ))
      )}
      <rect className="ac scan" style={{ '--scan': '44px' }} x="36" y="110" width="22" height="22" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <line className="ln" x1="316" y1="150" x2="360" y2={80 + i * 28} />
          <circle className={i === 2 ? 'dotA pulse' : 'dot'} cx="364" cy={80 + i * 28} r="3.5" />
        </g>
      ))}
      <text className="lbl" x="30" y="270">input</text>
      <text className="lbl" x="118" y="270">conv / pool</text>
      <text className="lbl" x="330" y="270">class</text>
    </svg>
  );
}

function Face() {
  // symmetric landmark set (normalised) — eyes, brows, nose, mouth, jaw
  const pts = [
    [-0.55, -0.35], [-0.35, -0.42], [-0.15, -0.36], [0.15, -0.36], [0.35, -0.42], [0.55, -0.35],
    [-0.45, -0.2], [-0.3, -0.24], [-0.15, -0.2], [0.15, -0.2], [0.3, -0.24], [0.45, -0.2],
    [0, -0.12], [0, 0.02], [-0.12, 0.12], [0, 0.15], [0.12, 0.12],
    [-0.32, 0.36], [-0.15, 0.31], [0, 0.33], [0.15, 0.31], [0.32, 0.36], [0.15, 0.44], [0, 0.46], [-0.15, 0.44],
    [-0.72, -0.1], [-0.68, 0.2], [-0.56, 0.46], [-0.34, 0.66], [0, 0.74], [0.34, 0.66], [0.56, 0.46], [0.68, 0.2], [0.72, -0.1],
  ];
  const P = pts.map(([x, y]) => [150 + x * 110, 150 + y * 110]);
  const mouth = [17, 18, 19, 20, 21, 22, 23, 24, 17];
  const jaw = [25, 26, 27, 28, 29, 30, 31, 32, 33];
  const bars = [['Neutral', 0.22], ['Happy', 0.64], ['Surprise', 0.09], ['Sad', 0.05]];
  return (
    <svg className="viz" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
      <rect className="ln" x="40" y="40" width="220" height="220" />
      <polyline className="ln2" points={jaw.map((i) => P[i].join(',')).join(' ')} />
      <polyline className="ac" points={mouth.map((i) => P[i].join(',')).join(' ')} />
      {P.map(([x, y], i) => <circle key={i} className={i >= 17 && i <= 24 ? 'dotA' : 'dot'} cx={x} cy={y} r="2.2" />)}
      <line className="ac scanY" style={{ '--scan': '200px' }} x1="40" y1="50" x2="260" y2="50" />
      {bars.map(([k, v], i) => (
        <g key={k}>
          <text className="lbl" x="282" y={90 + i * 40}>{k}</text>
          <line className="ln" x1="282" y1={100 + i * 40} x2="372" y2={100 + i * 40} />
          <line className={i === 1 ? 'ac' : 'ln2'} x1="282" y1={100 + i * 40} x2={282 + 90 * v} y2={100 + i * 40} strokeWidth="3" />
        </g>
      ))}
      <text className="lbl" x="40" y="280">illustrative output</text>
    </svg>
  );
}

function Knn() {
  // deterministic pseudo-random scatter
  let s = 7;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const pts = Array.from({ length: 70 }, () => [40 + rnd() * 320, 30 + rnd() * 220]);
  const q = [205, 140];
  const near = pts.map((p, i) => ({ i, d: Math.hypot(p[0] - q[0], p[1] - q[1]) })).sort((a, b) => a.d - b.d).slice(0, 5);
  const set = new Set(near.map((n) => n.i));
  const r = near[near.length - 1].d + 6;
  return (
    <svg className="viz" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
      <line className="ln" x1="30" y1="260" x2="370" y2="260" />
      <line className="ln" x1="30" y1="20" x2="30" y2="260" />
      {pts.map((p, i) => <circle key={i} className={set.has(i) ? 'dotA' : i % 3 === 0 ? 'dotB' : 'dot'} cx={p[0]} cy={p[1]} r={set.has(i) ? 3.5 : 2.2} opacity={set.has(i) ? 1 : 0.6} />)}
      {near.map((n) => <line key={n.i} className="ac flow" x1={q[0]} y1={q[1]} x2={pts[n.i][0]} y2={pts[n.i][1]} />)}
      <circle className="ac pulse" cx={q[0]} cy={q[1]} r={r} strokeDasharray="2 4" />
      <rect x={q[0] - 4} y={q[1] - 4} width="8" height="8" fill="var(--ink)" transform={`rotate(45 ${q[0]} ${q[1]})`} />
      <text className="lbl" x="36" y="282">user–item space · k = 5</text>
    </svg>
  );
}

function Flow() {
  const src = ['CSV', 'JSON', 'Sheets', 'Gmail'];
  return (
    <svg className="viz" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet">
      {src.map((t, i) => (
        <g key={t}>
          <rect className="ln2" x="24" y={50 + i * 52} width="74" height="30" />
          <text className="lbl" x="34" y={69 + i * 52}>{t}</text>
          <path className="ac flow" d={`M98 ${65 + i * 52} C 140 ${65 + i * 52}, 140 150, 170 150`} />
        </g>
      ))}
      <rect className="ac" x="170" y="120" width="80" height="60" />
      <text className="lbl" x="180" y="146">ingest</text>
      <text className="lbl" x="180" y="162">+ match</text>
      <path className="ac flow" d="M250 150 L 290 150" />
      <rect className="ln2" x="290" y="96" width="86" height="108" />
      <text className="lbl" x="300" y="116">dashboard</text>
      {[0, 1, 2, 3].map((i) => <line key={i} className="ln" x1="300" y1={132 + i * 16} x2={300 + 30 + (i * 17) % 40} y2={132 + i * 16} />)}
      <circle className="dotA pulse" cx="366" cy="110" r="3" />
      <text className="lbl" x="24" y="282">sources → pipeline → app</text>
    </svg>
  );
}

const MAP = { conv: Conv, face: Face, knn: Knn, flow: Flow };

export default function ProjectViz({ kind }) {
  const C = MAP[kind] || Conv;
  return <C />;
}
