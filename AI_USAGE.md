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