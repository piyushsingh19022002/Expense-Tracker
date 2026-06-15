# Authentication Module

Prompt:
Implement JWT authentication using Prisma and bcrypt.

AI Output:
Generated auth service and controller.

Review:
Verified password hashing manually.

Result:
Accepted with modifications.

## Authentication UI

Prompt:
Build Login and Register screens using React Hook Form.

Issue:
AI generated forms without loading states.

How I Caught It:
Button remained clickable during API request.

Fix:
Added loading state and disabled submit button during requests.

## Auth Context and Protected Routes

Prompt:
Implement Auth Context and Protected Routes.

Issue:
AI forgot session restoration after page refresh.

How I Found It:
User was logged out after browser refresh.

Fix:
Added localStorage token persistence and restore logic.

## Group Management APIs

Prompt:
Implement Group Management APIs.

Issue:
AI suggested deleting membership records.

How I Found It:
Historical expense calculations would lose member history.

Fix:
Used leftAt timestamp instead of deletion.

## Group UI Components

Prompt:
Build Group Management UI.

Issue:
AI placed API calls directly inside every component.

How I Found It:
Code duplication and maintenance issues.

Fix:
Created centralized groupService.js.

## Expense Management APIs

Prompt:
Implement Expense APIs.

Issue:
AI suggested storing participants as JSON array.

How I Found It:
Would complicate joins and balance calculations.

Fix:
Used ExpenseParticipant relational table.

## Expense Management UI

Prompt:
Build Expense Management UI.

Issue:
AI generated separate forms for create and edit.

How I Found It:
Large amount of duplicated code.

Fix:
Created reusable ExpenseForm component.

## Expense Calculation Engine

Prompt:
Implement equal, exact, and percentage split engine.

Issue:
AI ignored rounding differences in equal split.

How I Found It:
₹1000 split among 3 users resulted in total ₹999.99.

Fix:
Adjusted final participant share to absorb rounding difference.

## Balance Calculation Engine

Prompt:
Implement balance calculation engine.

Issue:
AI suggested storing balances in database.

How I Found It:
Balances can become stale after expense updates.

Fix:
Calculate balances dynamically from expenses and shares.

## Settlement Module

Prompt:
Implement settlement module.

Issue:
AI suggested updating balances directly in database.

How I Found It:
Balances would become inconsistent after expense edits.

Fix:
Store settlement records and calculate balances dynamically.

## Balance Dashboard

Prompt:
Build Balance Dashboard.

Issue:
AI displayed only net balances.

How I Found It:
Users still had to manually calculate payments.

Fix:
Added "Who Owes Whom" section showing debtor-creditor relationships.

## CSV Parser

Prompt:
Implement CSV parser infrastructure.

Issue:
AI ignored row numbers during parsing.

How I Found It:
Future anomaly reports could not reference original CSV rows.

Fix:
Added rowNumber field to every parsed record.

## CSV Upload Interface

Prompt:
Build CSV Upload Interface.

Issue:
AI forgot upload progress handling.

How I Found It:
Large file uploads gave no user feedback.

Fix:
Added Axios upload progress tracking.

## Anomaly Detection

Prompt:
Implement anomaly detection engine.

Issue:
AI automatically corrected ambiguous dates.

How I Found It:
Could silently convert 01/02/2026 into wrong date.

Fix:
Marked as AMBIGUOUS_DATE anomaly requiring review 

## Import Report Generation

Prompt:
Generate import report from anomaly results.

Issue:
AI attempted to rerun anomaly detection during report generation.

How I Found It:
Duplicate logic existed in report service.

Fix:
Report service only reads ImportBatch and ImportAnomaly data.

## Import Review Workflow

Prompt:
Implement anomaly review workflow.

Issue:
AI suggested directly updating imported rows.

How I Found It:
Original imported values were lost.

Fix:
Introduced RowCorrection table and audit trail.

## Anomaly Review UI

Prompt:
Build anomaly review dashboard.

Issue:
AI generated card-based anomaly list.

How I Found It:
Large imports became difficult to review.

Fix:
Switched to table-based interface with filtering.

## Import Report Page

Prompt:
Build import report page.

Issue:
AI generated a single huge report component.

How I Found It:
Difficult to maintain and extend.

Fix:
Split report into focused reusable components.