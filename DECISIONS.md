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