# AI Usage Report

## AI Tools Used

### ChatGPT

Used for:

* Architecture planning
* Prisma schema design
* API implementation guidance
* CSV import workflow design
* Anomaly detection strategy
* Deployment troubleshooting
* Documentation generation

### Claude

Used for:

* Code review
* UI implementation suggestions
* Refactoring recommendations
* Edge-case analysis
* Import workflow improvements

---

# Key Prompts Used

## Prompt 1

Implement JWT authentication using Prisma and bcrypt.

---

## Prompt 2

Build Login and Register screens using React Hook Form.

---

## Prompt 3

Design a PostgreSQL schema for users, groups, memberships, expenses, settlements, and CSV imports.

---

## Prompt 4

Implement anomaly detection for CSV imports supporting duplicate expenses, invalid dates, ambiguous dates, unknown members, former members, and settlement detection.

---

## Prompt 5

Review the application for deployment on Render and Vercel and identify production issues.

---

# AI Review & Correction Log

All AI-generated code was manually reviewed before being accepted.

---

## Case 1: Authentication UI

### Prompt

Build Login and Register screens using React Hook Form.

### AI Output

Generated functional authentication forms.

### Issue

Loading states were missing.

### How I Caught It

The submit button remained clickable during API requests, allowing duplicate submissions.

### Change Made

Added:

* Loading indicators
* Disabled submit button during requests
* Better error handling

### Result

Accepted with modifications.

---

## Case 2: Session Persistence

### Prompt

Implement Auth Context and Protected Routes.

### AI Output

Generated authentication context and route protection.

### Issue

User session was lost after page refresh.

### How I Caught It

Refreshing the browser redirected authenticated users back to login.

### Change Made

Added:

* Token persistence using localStorage
* Session restoration logic on application startup

### Result

Accepted with modifications.

---

## Case 3: Membership Deletion

### Prompt

Implement Group Management APIs.

### AI Output

Suggested deleting membership records when removing users.

### Issue

Historical expense records would lose membership history.

### How I Caught It

Historical balances became impossible to validate accurately.

### Change Made

Used:

leftAt timestamp

instead of deleting records.

### Result

Accepted with modifications.

---

## Case 4: Group UI Architecture

### Prompt

Build Group Management UI.

### AI Output

Placed API calls directly inside components.

### Issue

Code duplication and maintenance problems.

### How I Caught It

Multiple components repeated identical API logic.

### Change Made

Created:

groupService.js

for centralized API access.

### Result

Accepted with modifications.

---

## Case 5: Expense Participant Modeling

### Prompt

Implement Expense APIs.

### AI Output

Suggested storing participants as JSON.

### Issue

Complicated joins, balance calculations, and data integrity.

### How I Caught It

Relational queries became unnecessarily complex.

### Change Made

Created:

ExpenseParticipant

relational table.

### Result

Accepted with modifications.

---

## Case 6: Expense Form Reusability

### Prompt

Build Expense Management UI.

### AI Output

Generated separate Create and Edit forms.

### Issue

Large amount of duplicated code.

### How I Caught It

Both forms contained nearly identical logic.

### Change Made

Created reusable:

ExpenseForm

component.

### Result

Accepted with modifications.

---

## Case 7: Split Calculation Engine

### Prompt

Implement equal, exact, and percentage split calculations.

### AI Output

Ignored rounding discrepancies.

### Issue

₹1000 split among 3 users produced ₹999.99 total allocation.

### How I Caught It

Verified totals after split calculations.

### Change Made

Adjusted final participant share to absorb rounding differences.

### Result

Accepted with modifications.

---

## Case 8: Balance Calculation Strategy

### Prompt

Implement balance calculation engine.

### AI Output

Suggested storing balances directly in database.

### Issue

Balances could become stale after expense updates.

### How I Caught It

Expense edits produced inconsistent balance data.

### Change Made

Balances are calculated dynamically from:

* Expenses
* Participants
* Settlements

### Result

Accepted with modifications.

---

## Case 9: Settlement Handling

### Prompt

Implement settlement module.

### AI Output

Suggested directly updating balances.

### Issue

Historical consistency would be lost.

### How I Caught It

Balance recalculation became impossible to audit.

### Change Made

Stored settlement transactions separately.

### Result

Accepted with modifications.

---

## Case 10: Balance Dashboard

### Prompt

Build Balance Dashboard.

### AI Output

Displayed only net balances.

### Issue

Users still had to manually determine who should pay whom.

### How I Caught It

Dashboard lacked actionable settlement information.

### Change Made

Added:

Who Owes Whom

view.

### Result

Accepted with modifications.

---

## Case 11: CSV Parsing

### Prompt

Implement CSV parser infrastructure.

### AI Output

Ignored row numbers.

### Issue

Anomaly reports could not reference original CSV rows.

### How I Caught It

Import reports lacked traceability.

### Change Made

Added:

rowNumber

to all parsed records.

### Result

Accepted with modifications.

---

## Case 12: Upload Progress

### Prompt

Build CSV Upload Interface.

### AI Output

Did not include upload progress tracking.

### Issue

Users received no feedback during large uploads.

### How I Caught It

UI appeared frozen while uploading.

### Change Made

Added Axios upload progress tracking.

### Result

Accepted with modifications.

---

## Case 13: Ambiguous Date Handling

### Prompt

Implement anomaly detection engine.

### AI Output

Automatically converted ambiguous dates.

### Issue

Financial data could be incorrectly modified.

### How I Caught It

Reviewed examples such as:

01/02/2026

which can represent multiple dates.

### Change Made

Created:

AMBIGUOUS_DATE

anomaly requiring manual review.

### Result

Accepted with modifications.

---

## Case 14: Import Report Generation

### Prompt

Generate import report from anomaly results.

### AI Output

Re-ran anomaly detection during report generation.

### Issue

Duplicate business logic.

### How I Caught It

Report generation duplicated existing anomaly services.

### Change Made

Reports read directly from:

* ImportBatch
* ImportAnomaly

records.

### Result

Accepted with modifications.

---

## Case 15: Import Review Workflow

### Prompt

Implement anomaly review workflow.

### AI Output

Suggested overwriting imported values.

### Issue

Original imported values were lost.

### How I Caught It

Audit history became impossible.

### Change Made

Introduced:

RowCorrection

audit records.

### Result

Accepted with modifications.

---

# Conclusion

AI tools accelerated development, but every generated output was manually reviewed, tested, and modified where necessary.

No AI-generated code was accepted without validation against application requirements, data integrity requirements, and production deployment constraints.
