// Turns the backend's profiling result into what the report shows.
// Everything here is derived from the profiling data only. When the backend
// adds validation, drift and anomaly results, extend `findings` and `score`.

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

export function friendlyType(dtype = "") {
  const d = dtype.toLowerCase();
  if (d.startsWith("int") || d.startsWith("uint")) return "Whole number";
  if (d.startsWith("float")) return "Decimal";
  if (d.startsWith("bool")) return "Yes / No";
  if (d.startsWith("datetime")) return "Date";
  return "Text";
}

export function severityOf(percentMissing) {
  if (percentMissing >= 20) return "high";
  if (percentMissing >= 5) return "medium";
  if (percentMissing > 0) return "low";
  return "none";
}

export function analyze(result) {
  const profiling = result?.profiling ?? { row_count: 0, column_count: 0, columns: {} };
  const rows = profiling.row_count ?? 0;
  const columns = Object.entries(profiling.columns ?? {}).map(([name, c]) => ({
    name,
    dtype: c.dtype,
    type: friendlyType(c.dtype),
    nullCount: c.null_count ?? 0,
    nullPercent: c.null_percent ?? 0,
    unique: c.unique_count ?? 0,
    min: c.min ?? null,
    mean: c.mean ?? null,
    max: c.max ?? null,
    isNumeric: c.mean !== undefined || c.min !== undefined,
    severity: severityOf(c.null_percent ?? 0),
  }));

  const cells = rows * columns.length;
  const missing = columns.reduce((sum, c) => sum + c.nullCount, 0);

  // Never round a file with gaps up to a perfect 100.
  let score = cells === 0 ? 0 : Math.round((1 - missing / cells) * 100);
  if (missing > 0 && score === 100) score = 99;

  const findings = [];
  for (const c of columns) {
    if (rows > 0 && c.nullCount === rows) {
      findings.push({ column: c.name, severity: "high", text: "is empty in every row" });
    } else if (c.nullCount > 0) {
      findings.push({
        column: c.name,
        severity: c.severity,
        text: `is missing ${formatPercent(c.nullPercent)} of values (${c.nullCount} of ${rows} rows)`,
      });
    }
    if (rows > 1 && c.unique === 1 && c.nullCount === 0) {
      findings.push({ column: c.name, severity: "low", text: "has the same value in every row" });
    }
  }
  findings.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

  const hasHigh = findings.some((f) => f.severity === "high");
  const hasMedium = findings.some((f) => f.severity === "medium");

  let verdict = { tone: "good", title: "Looks healthy", detail: "No missing values or constant columns found." };
  if (rows === 0) {
    verdict = { tone: "bad", title: "No rows found", detail: "The file has column names but no data." };
  } else if (hasHigh) {
    verdict = { tone: "bad", title: "Needs attention", detail: `${countLabel(findings, "high")} to fix before you rely on this data.` };
  } else if (hasMedium || score < 95) {
    verdict = { tone: "warn", title: "Some gaps", detail: "A few columns have missing values worth a look." };
  } else if (findings.length > 0) {
    verdict = { tone: "good", title: "Mostly healthy", detail: "Only minor issues found." };
  }

  return { rows, columns, cells, missing, score, findings, verdict };
}

function countLabel(findings, severity) {
  const n = findings.filter((f) => f.severity === severity).length;
  return n === 1 ? "1 serious issue" : `${n} serious issues`;
}

export function formatPercent(p) {
  return `${Number(p.toFixed(2))}%`;
}

export function formatNumber(n) {
  if (n === null || n === undefined) return "–";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
}
