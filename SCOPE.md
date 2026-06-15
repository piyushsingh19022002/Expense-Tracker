# Expense Tracker Import Scope & Anomaly Log

## Overview

The application imports shared-expense data from CSV files and converts valid records into structured expense data.

Each import operation is tracked through an Import Batch.

Every CSV row retains:

* Original Row Number
* Raw CSV Values
* Import Status
* Detected Anomalies
* Review Actions

This ensures complete auditability of imported financial data.

---

# CSV Import Scope

The import system supports:

* Expense Records
* Group Members
* Expense Participants
* Settlement Records
* Historical Expense Data

The import workflow is:

CSV Upload
→ Parse CSV
→ Validate Data
→ Detect Anomalies
→ Generate Import Report
→ Manual Review
→ Final Import

---

# Anomaly Log

The following anomalies were identified and handled during import.

---

## 1. Duplicate Expense

### Description

Multiple rows represent the same expense.

### Detection Logic

Records with matching:

* Amount
* Description
* Expense Date
* Paid By

are flagged as duplicates.

### Handling

* Mark as anomaly
* Require manual review
* Prevent automatic import

---

## 2. Invalid Date

### Description

Date value cannot be parsed into a valid date.

### Examples

```text
32/13/2025
abc
2025-99-01
```

### Handling

* Row rejected
* Logged in import report

---

## 3. Ambiguous Date

### Description

Date format may be interpreted in multiple ways.

### Example

```text
03/04/2025
```

Could mean:

```text
3 April 2025
```

or

```text
4 March 2025
```

### Handling

* Mark for manual review
* Prevent automatic import

---

## 4. Missing Currency

### Description

Currency column is empty.

### Handling

* Flag anomaly
* Require review before import

---

## 5. Negative Amount

### Description

Expense amount is less than zero.

### Example

```text
-500
```

### Handling

* Reject row
* Log anomaly

---

## 6. Unknown Member

### Description

Referenced member does not exist in the selected group.

### Detection Logic

Member lookup fails in:

* User Table
* Group Membership Table

### Handling

* Flag anomaly
* Require manual correction

---

## 7. Former Member

### Description

Expense references a member who previously belonged to the group but had already left.

### Detection Logic

Expense Date > Membership End Date

### Handling

* Flag anomaly
* Manual review required

---

## 8. Settlement Logged As Expense

### Description

A settlement transaction was incorrectly recorded as an expense.

### Example

```text
Paid back
Transfer to Rohan
Settlement
```

### Handling

* Flag anomaly
* Allow conversion into settlement record

---

# Review Workflow

Detected anomalies can be:

## Approved

The reviewer confirms the record is valid.

## Rejected

The row is excluded from import.

## Edited

The reviewer corrects imported values and resubmits the row.

All review actions are stored and remain auditable.

---

# Database Schema

## User

Stores application users.

Fields:

* id
* name
* email
* password
* createdAt

---

## Group

Stores expense groups.

Fields:

* id
* name
* createdBy
* createdAt

---

## Membership

Tracks user membership within groups.

Fields:

* id
* groupId
* userId
* joinedAt
* leftAt

---

## Expense

Stores expense records.

Fields:

* id
* groupId
* description
* amount
* paidBy
* expenseDate
* createdAt

---

## ExpenseParticipant

Stores participant allocations.

Fields:

* id
* expenseId
* userId
* shareAmount

---

## Settlement

Stores settlement transactions.

Fields:

* id
* payerId
* receiverId
* amount
* settlementDate

---

## ImportBatch

Tracks each CSV import operation.

Fields:

* id
* fileName
* uploadedAt
* uploadedBy
* status

---

## ImportAnomaly

Stores detected anomalies.

Fields:

* id
* batchId
* rowNumber
* anomalyType
* severity
* status
* description

---

# Auditability

The system preserves:

* Original CSV Data
* Import Reports
* Anomaly Records
* Review Decisions
* User Actions

This ensures every imported financial record remains traceable and reviewable.
