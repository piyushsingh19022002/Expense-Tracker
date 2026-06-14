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