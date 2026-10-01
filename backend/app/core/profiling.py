import pandas as pd

def profile_dataframe(df: pd.DataFrame) -> dict:
    profile = {}
    for col in df.columns:
        profile[col] = {
            "dtype": str(df[col].dtype),
            "null_count": int(df[col].isnull().sum()),
            "null_percent": round(df[col].isnull().mean() * 100, 2),
            "unique_count": int(df[col].nunique()),
        }
        if pd.api.types.is_numeric_dtype(df[col]):
            profile[col]["mean"] = float(df[col].mean()) if not df[col].isnull().all() else None
            profile[col]["min"] = float(df[col].min()) if not df[col].isnull().all() else None
            profile[col]["max"] = float(df[col].max()) if not df[col].isnull().all() else None

    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": profile,
    }