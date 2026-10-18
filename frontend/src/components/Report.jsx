import { useEffect, useMemo, useState } from "react";
import { analyze, formatNumber, formatPercent } from "../lib/analyze.js";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const SEVERITY_LABEL = { high: "High", medium: "Medium", low: "Low", none: "None" };

function ScoreRing({ score, tone }) {
  // Starts empty, then fills once. The only automatic motion on the page.
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(score));
    return () => cancelAnimationFrame(id);
  }, [score]);

  return (
    <div className="ring" role="img" aria-label={`Completeness score ${score} out of 100`}>
      <svg viewBox="0 0 128 128" width="132" height="132" aria-hidden="true">
        <circle className="ring-track" cx="64" cy="64" r={RADIUS} />
        <circle
          className={`ring-fill tone-${tone}`}
          cx="64"
          cy="64"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - shown / 100)}
          transform="rotate(-90 64 64)"
        />
      </svg>
      <div className="ring-number">
        <span className="ring-score">{score}</span>
        <span className="ring-of">out of 100</span>
      </div>
    </div>
  );
}

function CompletenessBar({ nullPercent, severity }) {
  const complete = Math.max(0, 100 - nullPercent);
  return (
    <div className="cbar">
      <div className="cbar-track" aria-hidden="true">
        <div className={`cbar-fill sev-${severity}`} style={{ width: `${complete}%` }} />
      </div>
      <span className="cbar-value">{formatPercent(complete)}</span>
    </div>
  );
}

export default function Report({ result, isSample }) {
  const a = useMemo(() => analyze(result), [result]);
  const [sort, setSort] = useState("original");

  const columns = useMemo(() => {
    if (sort === "worst") return [...a.columns].sort((x, y) => y.nullPercent - x.nullPercent);
    return a.columns;
  }, [a.columns, sort]);

  const missingPct = a.cells ? (a.missing / a.cells) * 100 : 0;
  const numericCount = a.columns.filter((c) => c.isNumeric).length;
  const otherCount = a.columns.length - numericCount;

  return (
    <section className="report" aria-label="Report">
      {isSample && (
        <p className="sample-note">This is an example report with made-up data. Upload a file to check your own.</p>
      )}

      <div className="summary">
        <div className="summary-score">
          <ScoreRing score={a.score} tone={a.verdict.tone} />
          <div>
            <h2 className={`verdict tone-${a.verdict.tone}`}>{a.verdict.title}</h2>
            <p className="verdict-detail">{a.verdict.detail}</p>
            <p className="score-note">Score counts missing values only.</p>
          </div>
        </div>

        <dl className="stats">
          <div>
            <dt>Rows</dt>
            <dd>
              {formatNumber(a.rows)}
              <span className="stat-sub">{formatNumber(a.cells)} cells in total</span>
            </dd>
          </div>
          <div>
            <dt>Columns</dt>
            <dd>
              {formatNumber(a.columns.length)}
              <span className="stat-sub">{numericCount} numeric, {otherCount} other</span>
            </dd>
          </div>
          <div>
            <dt>Missing cells</dt>
            <dd>
              {formatNumber(a.missing)}
              <span className="stat-sub">{formatPercent(missingPct)} of all cells</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="detail-grid">
        <div className="panel findings">
          <h3 className="panel-title">What needs attention</h3>
          {a.findings.length === 0 ? (
            <p className="empty">Nothing to fix. Every column is complete and varies across rows.</p>
          ) : (
            <ul>
              {a.findings.map((f, i) => (
                <li key={`${f.column}-${i}`}>
                  <span className={`dot sev-${f.severity}`} aria-hidden="true" />
                  <p>
                    <strong>{f.column}</strong> {f.text}
                  </p>
                  <span className={`tag sev-${f.severity}`}>{SEVERITY_LABEL[f.severity]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel columns">
          <div className="panel-head">
            <h3 className="panel-title">Columns</h3>
            <div className="segmented" role="group" aria-label="Sort columns">
              <button type="button" className={sort === "original" ? "is-on" : ""} aria-pressed={sort === "original"} onClick={() => setSort("original")}>
                File order
              </button>
              <button type="button" className={sort === "worst" ? "is-on" : ""} aria-pressed={sort === "worst"} onClick={() => setSort("worst")}>
                Most missing first
              </button>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <caption className="sr-only">Quality of each column</caption>
              <thead>
                <tr>
                  <th scope="col">Column</th>
                  <th scope="col">Type</th>
                  <th scope="col">Complete</th>
                  <th scope="col" className="num">Unique</th>
                  <th scope="col" className="num">Min</th>
                  <th scope="col" className="num">Average</th>
                  <th scope="col" className="num">Max</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((c) => (
                  <tr key={c.name}>
                    <th scope="row" className="col-name">{c.name}</th>
                    <td><span className="type" title={c.dtype}>{c.type}</span></td>
                    <td><CompletenessBar nullPercent={c.nullPercent} severity={c.severity} /></td>
                    <td className="num">{formatNumber(c.unique)}</td>
                    <td className="num">{c.isNumeric ? formatNumber(c.min) : "–"}</td>
                    <td className="num">{c.isNumeric ? formatNumber(c.mean) : "–"}</td>
                    <td className="num">{c.isNumeric ? formatNumber(c.max) : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
