"""Weighted data quality score.

The score combines several criteria. Each criterion has a weight and gets its own
0-100 score. A criterion that cannot be measured from one uploaded file is reported
as "not_assessed" instead of being guessed, and the final score is calculated only
from the criteria that were measured (weights are re-scaled to add up to 100%).
"""
import warnings

import pandas as pd

# Weights add up to 100. Keep them in one place so they are easy to change.
WEIGHTS = {
    "completeness": 20,
    "accuracy": 20,
    "validity": 15,
    "consistency": 15,
    "uniqueness": 10,
    "referential_integrity": 10,
    "outliers": 5,
    "timeliness": 5,
}

LABELS = {
    "completeness": "Completeness",
    "accuracy": "Accuracy",
    "validity": "Validity",
    "consistency": "Consistency",
    "uniqueness": "Uniqueness",
    "referential_integrity": "Referential integrity",
    "outliers": "Outliers & anomalies",
    "timeliness": "Timeliness & freshness",
}

# Criteria that need information a single file cannot give.
NOT_ASSESSED_REASONS = {
    "accuracy": "Needs reference rules to compare against, such as allowed ranges.",
    "referential_integrity": "Needs a second table with matching keys.",
    "timeliness": "Needs a date column and how fresh the data should be.",
}

# A column must have at least this share of values that parse as numbers (or dates)
# before we treat it as "meant to be numeric (or a date)". The rest are invalid.
TYPE_SHARE = 0.8


def percent_score(bad: int, total: int) -> float:
    """100 means nothing is wrong. Never rounds up to 100 when something is wrong."""
    if total <= 0:
        return 0.0
    score = 100 * (1 - bad / total)
    if bad > 0:
        score = min(score, 99.9)
    return round(score, 1)


def _text_columns(df: pd.DataFrame) -> list[str]:
    return [
        c
        for c in df.columns
        if df[c].dtype == object or pd.api.types.is_string_dtype(df[c])
    ]


def _numeric_columns(df: pd.DataFrame) -> list[str]:
    return [
        c
        for c in df.columns
        if pd.api.types.is_numeric_dtype(df[c]) and not pd.api.types.is_bool_dtype(df[c])
    ]


def _top(counts: dict, n: int = 5) -> list[dict]:
    ranked = sorted(((c, k) for c, k in counts.items() if k > 0), key=lambda x: -x[1])
    return [{"column": c, "count": int(k)} for c, k in ranked[:n]]


def _scored(key: str, bad: int, checked: int, worst: list[dict] | None = None) -> dict:
    return {
        "key": key,
        "label": LABELS[key],
        "weight": WEIGHTS[key],
        "status": "scored",
        "score": percent_score(bad, checked),
        "issues": int(bad),
        "checked": int(checked),
        "worst_columns": worst or [],
    }


def _not_assessed(key: str, reason: str) -> dict:
    return {
        "key": key,
        "label": LABELS[key],
        "weight": WEIGHTS[key],
        "status": "not_assessed",
        "score": None,
        "reason": reason,
    }


def completeness(df: pd.DataFrame) -> dict:
    cells = df.shape[0] * df.shape[1]
    if cells == 0:
        return _not_assessed("completeness", "The file has no data cells.")
    missing_by_col = df.isna().sum()
    return _scored(
        "completeness",
        int(missing_by_col.sum()),
        cells,
        _top(missing_by_col.to_dict()),
    )


def uniqueness(df: pd.DataFrame) -> dict:
    if len(df) < 2:
        return _not_assessed("uniqueness", "Needs at least two rows to compare.")
    duplicates = int(df.duplicated().sum())
    return _scored("uniqueness", duplicates, len(df))


def validity(df: pd.DataFrame) -> dict:
    """In a text column that is mostly numbers (or dates), count entries that are neither."""
    checked = 0
    bad_by_col = {}
    for col in _text_columns(df):
        values = df[col].dropna().astype(str).str.strip()
        values = values[values != ""]
        if values.empty:
            continue
        checked += len(values)

        numeric_ok = pd.to_numeric(values, errors="coerce").notna()
        if TYPE_SHARE <= numeric_ok.mean() < 1.0:
            bad_by_col[col] = int((~numeric_ok).sum())
            continue
        if numeric_ok.mean() >= 1.0:
            continue

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            date_ok = pd.to_datetime(values, errors="coerce", format="mixed").notna()
        if TYPE_SHARE <= date_ok.mean() < 1.0:
            bad_by_col[col] = int((~date_ok).sum())

    if checked == 0:
        return _not_assessed("validity", "No text columns to check.")
    return _scored("validity", sum(bad_by_col.values()), checked, _top(bad_by_col))


def consistency(df: pd.DataFrame) -> dict:
    """Same value written in different ways, such as 'Delhi', 'delhi' and ' Delhi '."""
    checked = 0
    bad_by_col = {}
    for col in _text_columns(df):
        raw = df[col].dropna().astype(str)
        raw = raw[raw.str.strip() != ""]
        if raw.empty:
            continue
        key = raw.str.strip().str.replace(r"\s+", " ", regex=True).str.casefold()
        # Skip free text and IDs. Only compare columns that behave like categories.
        if key.nunique() > 0.5 * len(raw):
            continue
        checked += len(raw)
        frame = pd.DataFrame({"raw": raw, "key": key})
        # In each group of look-alike values, the most common spelling is the "right" one.
        dominant = frame.groupby("key")["raw"].agg(lambda s: s.value_counts().index[0])
        bad_by_col[col] = int((frame["raw"] != frame["key"].map(dominant)).sum())

    if checked == 0:
        return _not_assessed("consistency", "No category-like text columns to compare.")
    return _scored("consistency", sum(bad_by_col.values()), checked, _top(bad_by_col))


def outliers(df: pd.DataFrame) -> dict:
    """Values far outside the usual range of a number column (1.5 x IQR rule)."""
    checked = 0
    bad_by_col = {}
    for col in _numeric_columns(df):
        values = df[col].dropna()
        if len(values) < 8:
            continue
        q1, q3 = values.quantile(0.25), values.quantile(0.75)
        iqr = q3 - q1
        if iqr == 0:
            continue
        checked += len(values)
        bad_by_col[col] = int(((values < q1 - 1.5 * iqr) | (values > q3 + 1.5 * iqr)).sum())

    if checked == 0:
        return _not_assessed("outliers", "No number columns with enough spread to check.")
    return _scored("outliers", sum(bad_by_col.values()), checked, _top(bad_by_col))


def score_dataframe(df: pd.DataFrame) -> dict:
    results = {
        "completeness": completeness(df),
        "validity": validity(df),
        "consistency": consistency(df),
        "uniqueness": uniqueness(df),
        "outliers": outliers(df),
    }
    for key, reason in NOT_ASSESSED_REASONS.items():
        results[key] = _not_assessed(key, reason)

    # Same order as the weight table: biggest weight first.
    criteria = sorted(results.values(), key=lambda c: -c["weight"])
    scored = [c for c in criteria if c["status"] == "scored"]
    assessed_weight = sum(c["weight"] for c in scored)

    if assessed_weight == 0:
        total = None
    else:
        total = sum(c["weight"] * c["score"] for c in scored) / assessed_weight
        if any(c["score"] < 100 for c in scored):
            total = min(total, 99.9)
        total = round(total, 1)

    return {
        "score": total,
        "assessed_weight": assessed_weight,
        "total_weight": sum(WEIGHTS.values()),
        "criteria": criteria,
    }
