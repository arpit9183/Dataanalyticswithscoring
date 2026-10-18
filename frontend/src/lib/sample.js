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
};
