const STEPS = [
  {
    title: "Choose a file",
    text: "On the Home tab, drag a CSV or JSON file onto the dashed box, or click Choose a file.",
  },
  {
    title: "Wait a moment",
    text: "The file is sent to your own server and checked there. Small files take a second or two.",
  },
  {
    title: "Read the summary",
    text: "The ring gives a score out of 100. Below it you'll see how many rows, columns and empty cells the file has.",
  },
  {
    title: "Fix what needs attention",
    text: "The list names each column with a problem, worst first. Open the file, fill or remove those values, then check it again.",
  },
];

const TERMS = [
  ["Score", "The share of cells that are filled in, out of 100. A file with no empty cells scores 100. For now it counts missing values only."],
  ["Missing cells", "Cells with no value. A blank in a CSV, or null in a JSON file."],
  ["Complete", "How much of one column is filled in. The bar turns amber or red as more values go missing."],
  ["Unique", "How many different values a column holds. A column that should vary but shows 1 is worth a look."],
  ["Min, Average, Max", "The smallest, typical and largest value. Shown for number columns only."],
];

const LEVELS = [
  ["High", "20% or more of a column is missing, or the column is empty."],
  ["Medium", "5% to 20% of a column is missing."],
  ["Low", "Under 5% is missing, or every row holds the same value."],
];

export default function HowToUse() {
  return (
    <div className="howto">
      <header className="page-head">
        <div>
          <h1>How to use Kimiko</h1>
          <p>Check a file in four steps, then read the report.</p>
        </div>
      </header>

      <section className="panel howto-block" aria-labelledby="steps-title">
        <h2 id="steps-title" className="panel-title">Checking a file</h2>
        <ol className="steps">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <span className="step-num" aria-hidden="true">{i + 1}</span>
              <div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="howto-tip">
          Want to see a report first? On Home, choose <strong>View example report</strong>. It uses made-up data.
        </p>
      </section>

      <div className="howto-grid">
        <section className="panel howto-block" aria-labelledby="terms-title">
          <h2 id="terms-title" className="panel-title">What the report says</h2>
          <dl className="terms">
            {TERMS.map(([term, text]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="howto-side">
          <section className="panel howto-block" aria-labelledby="levels-title">
            <h2 id="levels-title" className="panel-title">How serious is it?</h2>
            <dl className="terms">
              {LEVELS.map(([term, text]) => (
                <div key={term}>
                  <dt>{term}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="panel howto-block" aria-labelledby="files-title">
            <h2 id="files-title" className="panel-title">Files and privacy</h2>
            <p className="howto-text">
              Kimiko accepts <strong>.csv</strong> and <strong>.json</strong> files. Your file goes only to the server this
              site is connected to. If you are signed in, the report is saved to History. The file itself is never kept.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
