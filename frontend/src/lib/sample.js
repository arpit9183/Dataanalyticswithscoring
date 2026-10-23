// A made-up result in the same shape as the backend's /upload response.
// Lets you see the report without running the backend.
export const sampleResult = {
  batch_id: null,
  filename: "sample_orders.csv",
  profiling: {
    row_count: 5000,
    column_count: 7,
    columns: {
      order_id: { dtype: "int64", null_count: 0, null_percent: 0, unique_count: 5000, mean: 2500.5, min: 1, max: 5000 },
      customer_id: { dtype: "int64", null_count: 0, null_percent: 0, unique_count: 3184, mean: 5120.4, min: 1002, max: 9998 },
      amount: { dtype: "float64", null_count: 160, null_percent: 3.2, unique_count: 2961, mean: 1284.37, min: 49, max: 99999 },
      coupon_code: { dtype: "str", null_count: 1900, null_percent: 38, unique_count: 12 },
      city: { dtype: "str", null_count: 20, null_percent: 0.4, unique_count: 41 },
      status: { dtype: "str", null_count: 0, null_percent: 0, unique_count: 4 },
      currency: { dtype: "str", null_count: 0, null_percent: 0, unique_count: 1 },
    },
  },
  // Made-up numbers, calculated with the same formulas as the backend's scoring.py.
  scoring: {
    "score": 97.9,
    "assessed_weight": 65,
    "total_weight": 100,
    "criteria": [
      {
        "key": "completeness",
        "label": "Completeness",
        "weight": 20,
        "status": "scored",
        "score": 94.1,
        "issues": 2080,
        "checked": 35000,
        "worst_columns": [
          {
            "column": "coupon_code",
            "count": 1900
          },
          {
            "column": "amount",
            "count": 160
          },
          {
            "column": "city",
            "count": 20
          }
        ]
      },
      {
        "key": "accuracy",
        "label": "Accuracy",
        "weight": 20,
        "status": "not_assessed",
        "score": null,
        "reason": "Needs reference rules to compare against, such as allowed ranges."
      },
      {
        "key": "validity",
        "label": "Validity",
        "weight": 15,
        "status": "scored",
        "score": 99.9,
        "issues": 14,
        "checked": 18080,
        "worst_columns": [
          {
            "column": "city",
            "count": 14
          }
        ]
      },
      {
        "key": "consistency",
        "label": "Consistency",
        "weight": 15,
        "status": "scored",
        "score": 98.8,
        "issues": 212,
        "checked": 18080,
        "worst_columns": [
          {
            "column": "city",
            "count": 212
          }
        ]
      },
      {
        "key": "uniqueness",
        "label": "Uniqueness",
        "weight": 10,
        "status": "scored",
        "score": 100.0,
        "issues": 0,
        "checked": 5000,
        "worst_columns": []
      },
      {
        "key": "referential_integrity",
        "label": "Referential integrity",
        "weight": 10,
        "status": "not_assessed",
        "score": null,
        "reason": "Needs a second table with matching keys."
      },
      {
        "key": "outliers",
        "label": "Outliers & anomalies",
        "weight": 5,
        "status": "scored",
        "score": 99.8,
        "issues": 37,
        "checked": 14840,
        "worst_columns": [
          {
            "column": "amount",
            "count": 37
          }
        ]
      },
      {
        "key": "timeliness",
        "label": "Timeliness & freshness",
        "weight": 5,
        "status": "not_assessed",
        "score": null,
        "reason": "Needs a date column and how fresh the data should be."
      }
    ]
  },
};
