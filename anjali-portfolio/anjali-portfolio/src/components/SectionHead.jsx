/** "[02] ——— EXPERIENCE ———— IDENTITY → EXPERIENCE" — keeps every section in one system. */
export default function SectionHead({ index, label, from, to }) {
  return (
    <div className="shead rv">
      <span className="mono">
        <span className="accent">[{index}]</span>&nbsp;&nbsp;{label}
      </span>
      <span className="mono shead__path">
        {from} &rarr; <b>{to}</b>
      </span>
      <span className="shead__rule rv-rule" />
    </div>
  );
}
