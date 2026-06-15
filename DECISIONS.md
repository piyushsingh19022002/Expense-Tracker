# Architectural & Design Decision Log

This document records significant technical and product decisions made during development of the Expense Tracker application.

---

# Decision 1: Database Selection

## Problem

The application requires managing users, groups, memberships, expenses, settlements, and audit history.

## Options Considered

1. MongoDB
2. MySQL
3. PostgreSQL

## Decision

Use PostgreSQL.

## Reason

The application contains highly relational data and requires joins, constraints, and transactional consistency. PostgreSQL provides strong relational modeling and data integrity.

---

# Decision 2: Membership Modeling

## Problem

Users can join and leave groups over time.

## Options Considered

1. Store members directly inside Group
2. Separate Membership table

## Decision

Use a dedicated Membership table.

## Reason

Allows tracking membership history and supports former-member anomaly detection.

---

# Decision 3: Authentication State Management

## Problem

Frontend requires authenticated sessions and protected routes.

## Options Considered

1. Redux
2. Zustand
3. React Context API

## Decision

Use React Context API.

## Reason

Authentication state is relatively small and does not require a full state-management library.

---

# Decision 4: Membership History Preservation

## Problem

Users may leave groups, but historical expenses must remain valid.

## Options Considered

1. Delete members permanently
2. Maintain membership history

## Decision

Maintain membership history.

## Reason

Historical balances and audit records must remain accurate.

---

# Decision 5: Expense Participant Modeling

## Problem

Expenses can be shared among multiple users.

## Options Considered

1. Store participant list as JSON
2. Use ExpenseParticipant table

## Decision

Use ExpenseParticipant table.

## Reason

Provides relational integrity, easier querying, and cleaner split calculations.

---

# Decision 6: Store Participant Shares

## Problem

Participant allocations are required for balance calculations.

## Options Considered

1. Recalculate shares every time
2. Persist participant shares

## Decision

Persist participant shares.

## Reason

Improves performance and preserves historical calculations.

---

# Decision 7: Balance Calculation Strategy

## Problem

User balances must remain accurate after expense changes.

## Options Considered

1. Store balances in database
2. Calculate balances dynamically

## Decision

Calculate balances dynamically.

## Reason

Balances are derived values and storing them risks inconsistency.

---

# Decision 8: Settlement Handling

## Problem

Users need to record payments made between members.

## Options Considered

1. Modify balances directly
2. Store settlement transactions separately

## Decision

Store settlements separately.

## Reason

Provides a complete financial history and improves auditability.

---

# Decision 9: Debt Visualization

## Problem

Users need actionable information for settling debts.

## Options Considered

1. Display net balances only
2. Display debtor-creditor relationships

## Decision

Display debtor-creditor relationships.

## Reason

Provides clear information about who owes whom.

---

# Decision 10: Import Tracking

## Problem

CSV imports must be traceable and reviewable.

## Options Considered

1. Process CSV directly
2. Track imports using ImportBatch

## Decision

Use ImportBatch records.

## Reason

Supports auditability, reporting, and historical tracking.

---

# Decision 11: Anomaly Detection Storage

## Problem

Import anomalies must be reviewed after detection.

## Options Considered

1. Recalculate anomalies on demand
2. Store anomaly records

## Decision

Store anomaly records.

## Reason

Improves consistency and avoids duplicate business logic.

---

# Decision 12: Data Correction Strategy

## Problem

Imported data may require manual corrections.

## Options Considered

1. Overwrite original values
2. Preserve original values and store corrections

## Decision

Preserve originals and store corrections separately.

## Reason

Maintains a complete audit trail.

---

# Decision 13: Review Interface Design

## Problem

Users need to review large numbers of anomalies efficiently.

## Options Considered

1. Card-based UI
2. Table-based dashboard

## Decision

Use a table-based dashboard.

## Reason

Review workflows are data-heavy and easier to manage in tabular form.

---

# Decision 14: Import Report Generation

## Problem

Users need visibility into import results.

## Options Considered

1. Display report only in UI
2. Generate downloadable reports

## Decision

Generate downloadable reports.

## Reason

Reports can be archived, shared, and reviewed later.

---

# Decision 15: Ambiguous Date Handling

## Problem

Certain dates can be interpreted in multiple formats.

Example:

03/04/2025

## Options Considered

1. Automatically convert dates
2. Flag as anomaly

## Decision

Flag as AMBIGUOUS_DATE anomaly.

## Reason

Financial data should not be modified based on assumptions.

---

# Decision 16: Unknown Member Handling

## Problem

CSV may reference members not found in the selected group.

## Options Considered

1. Automatically create users
2. Flag anomaly

## Decision

Flag UNKNOWN_MEMBER anomaly.

## Reason

Automatically creating users could introduce invalid financial records.

---

# Decision 17: Former Member Handling

## Problem

Expenses may reference users who previously belonged to the group.

## Options Considered

1. Treat as unknown member
2. Create dedicated anomaly type

## Decision

Create FORMER_MEMBER anomaly.

## Reason

The user exists, but membership validity must be reviewed separately.

---

# Decision 18: Settlement Recognition

## Problem

Settlement transactions may be imported as expenses.

## Options Considered

1. Import as expense
2. Flag for review

## Decision

Flag SETTLEMENT_AS_EXPENSE anomaly.

## Reason

Settlements and expenses represent different financial operations and should be handled separately.
