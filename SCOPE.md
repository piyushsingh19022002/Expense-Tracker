# Import Scope

CSV files are imported through ImportBatch records.

Every row retains original row number for anomaly tracking.

## Detected Anomalies

- Duplicate Expense
- Invalid Date
- Ambiguous Date
- Missing Currency
- Negative Amount
- Unknown Member
- Former Member
- Settlement Logged As Expense

## Review Workflow

Users can:

- Approve anomalies
- Reject anomalies
- Edit imported values

All actions preserve audit history.