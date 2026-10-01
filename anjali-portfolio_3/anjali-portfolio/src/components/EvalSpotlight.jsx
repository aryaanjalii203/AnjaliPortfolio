import Line from './Line';

/**
 * A closer look at the Handshake AI work: what one evaluation pass actually involves.
 * The "session" card is an illustrative walk-through of the loop, not a real transcript.
 */
const LOOP = [
  { s: '›', t: 'read prompt + constraints', c: '' },
  { s: '›', t: 'read model response', c: '' },
  { s: '✓', t: 'reasoning steps hold together', c: 'ok' },
  { s: '✓', t: 'code runs on the stated example', c: 'ok' },
  { s: '!', t: 'fails on empty input — edge case missed', c: 'warn' },
  { s: '!', t: 'cites a function the library doesn’t have', c: 'warn' },
  { s: '✓', t: 'rubric scored + written justification', c: 'ok' },
  { s: '✓', t: 'reference solution drafted', c: 'ok' },
];

const RUBRIC = ['Correctness', 'Instruction following', 'Reasoning quality', 'Code quality', 'Honesty / no hallucination'];

export default function EvalSpotlight() {
  return (
    <section id="evaluation" className="section evals" aria-labelledby="evals-title">
      <div className="wrap">
        <div className="evals__head">
          <h2 id="evals-title" className="mega evals__title">
            <Line>Under</Line>
            <Line d={0.08}><span className="outline">Evaluation</span></Line>
          </h2>
          <p className="evals__lede rv">
            Since November 2025 I have been on the other side of the model at Handshake AI — not asking it questions,
            but deciding whether its answers deserve to be trusted.
          </p>
        </div>

        <div className="evals__grid">
          <div className="evals__card rv">
            <span className="mono mono--ink3 evals__kicker">LLM evaluation / coding / reasoning / RLHF feedback</span>
            <h3 className="evals__big">A fluent answer isn&rsquo;t a correct one. My job is telling them apart.</h3>
            <p className="evals__body">
              Every task starts with a prompt and one or more model responses. I check the logic step by step, run the code
              when there is code, look for the edge case nobody tested, and score the response against a detailed rubric.
              The score is the easy part — the written justification is what matters, because that explanation is what the
              training team turns into better model behaviour.
            </p>
            <ul className="evals__rubric mono" aria-label="Rubric dimensions">
              {RUBRIC.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <p className="mono mono--ink3 evals__flow">
              read the task &rarr; verify the reasoning &rarr; execute &amp; test &rarr; find the failure &rarr; score &amp; justify &rarr; write the better answer
            </p>
          </div>

          <div className="evals__term rv" style={{ '--d': '0.1s' }} aria-label="Illustrative evaluation pass">
            <div className="webviz__bar"><i /><i /><i /><span className="mono">eval / response_b</span></div>
            <pre className="mono">
              <span className="evals__cmd"><b>$</b> evaluate --task coding --rubric v4</span>
              {LOOP.map((l) => (
                <span key={l.t} className={`evals__line ${l.c}`}><b>{l.s}</b> {l.t}</span>
              ))}
              <span className="evals__res"><b>verdict:</b> response A preferred — correct and honest about its limits</span>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
