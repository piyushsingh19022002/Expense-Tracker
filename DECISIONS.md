# Decision 1

Decision:
Use PostgreSQL

Alternatives:
- MongoDB
- MySQL

Reason:
Assignment explicitly requires a relational database.

# Decision 2

Decision:
Use Membership table

Reason:
Members can join and leave groups over time.
Historical balances must remain accurate.

# Decision 3

Decision:
Use React Context for authentication.

Alternatives:
Redux
Zustand

Reason:
Authentication state is small.
Context API is sufficient.

# Decision 4

Decision:
Use Membership History

Alternative:
Delete members directly

Reason:
Users join and leave over time.
Historical balances must remain accurate.

# Decision 5

Decision:
Use ExpenseParticipant table.

Alternative:
Store participants as JSON.

Reason:
Relational integrity.
Split calculations become easier.

# Decision 6

Decision:
Store calculated participant shares.

Alternative:
Calculate every time.

Reason:
Performance and auditability.

# Decision 7

Decision:
Calculate balances dynamically.

Alternative:
Store balances in database.

Reason:
Balances are derived values and may become inconsistent.

# Decision 8

Decision:
Store settlements separately.

Alternative:
Update balances directly.

Reason:
Balances are derived values.
Settlement history must remain auditable.

# Decision 9

Decision:
Show debtor-creditor relationships.

Alternative:
Show only net balances.

Reason:
Provides actionable settlement information.

# Decision 10

Decision:
Store ImportBatch records.

Alternative:
Process CSV directly without history.

Reason:
Auditability and import tracking.


# Decision 11

Decision:
Generate import reports from stored anomaly records.

Alternative:
Recalculate anomalies during report generation.

Reason:
Avoid duplicate business logic and ensure consistency.

# Decision 12

Decision:
Store corrections separately.

Alternative:
Overwrite imported values.

Reason:
Maintain complete audit trail.

# Decision 13

Decision:
Use table-based review dashboard.

Alternative:
Card-based review UI.

Reason:
Review workflows are data-intensive and benefit from tabular display.

# Decision 14

Decision:
Provide downloadable import reports.

Alternative:
Display report only in UI.

Reason:
Reports may be shared, archived, or reviewed later.