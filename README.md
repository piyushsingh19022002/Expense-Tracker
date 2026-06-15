# Expense Tracker & CSV Import Review System

## Overview

Expense Tracker is a shared expense management application designed to manage groups, expenses, settlements, balances, and CSV-based expense imports.

The application supports anomaly detection and review workflows to ensure imported financial data remains accurate and auditable.

This project was developed as part of the Spreetail Software Developer Assignment.

---

# Features

## Authentication

* User Registration
* User Login
* JWT Authentication
* Protected Routes

## Group Management

* Create Groups
* Add Members
* Remove Members
* Membership Timeline Tracking

## Expense Management

* Create Expenses
* Edit Expenses
* Delete Expenses
* Participant Management

## Balance Dashboard

* Total Paid
* Total Owed
* Net Balance
* Who Owes Whom View

## Settlements

* Record Settlements
* Settlement History

## CSV Import System

* CSV Upload
* Parsed Data Preview
* Import Summary

## Anomaly Detection

The system detects:

* Duplicate Expense
* Invalid Date
* Ambiguous Date
* Missing Currency
* Negative Amount
* Unknown Member
* Former Member
* Settlement Recorded As Expense

## Anomaly Review Workflow

* Approve
* Reject
* Edit
* Review History

## Import Reports

* Import Summary
* Search
* CSV Export
* JSON Export

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

## Backend

* Node.js
* Express.js
* JWT Authentication
* Multer

## Database

* PostgreSQL
* Prisma ORM

## Deployment

* Frontend: Vercel
* Backend: Render
* Database: Neon PostgreSQL

---

# Setup Instructions

## Clone Repository

```bash
git clone <repository-url>
cd expense-tracker
```

## Install Backend Dependencies

```bash
npm install
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

# Environment Variables

## Backend (.env)

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRY=24h
JWT_COOKIE_NAME=auth_token
NODE_ENV=development
CORS_ORIGIN=*
CSV_IMPORT_MAX_FILE_SIZE_BYTES=5242880
```

## Frontend (.env)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

# Running The Application

## Backend

```bash
npm run dev
```

Backend starts on:

```text
http://localhost:8000
```

## Frontend

```bash
cd frontend
npm run dev
```

Frontend starts on:

```text
http://localhost:5173
```

---

# API Health Check

```http
GET /api/v1/health
```

Example Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server is running healthily."
}
```

---

# Project Structure

```text
root
│
├── frontend
│
├── prisma
│
├── src
│   ├── config
│   ├── constants
│   ├── controllers
│   ├── middlewares
│   ├── routes
│   ├── services
│   ├── utils
│   ├── app.js
│   └── server.js
│
├── README.md
├── SCOPE.md
├── DECISIONS.md
├── AI_USAGE.md
```

---

# Deployment

## Backend (Render)

Environment Variables:

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRY=
JWT_COOKIE_NAME=
NODE_ENV=production
CORS_ORIGIN=
```

Build Command:

```bash
npm install && npx prisma generate
```

Start Command:

```bash
npm start
```

## Frontend (Vercel)

Root Directory:

```text
frontend
```

Environment Variable:

```env
VITE_API_URL=https://your-render-backend-url/api/v1
```

---

# AI Usage

The following AI tools were used during development:

* ChatGPT
* Claude

AI was used for:

* Architecture discussions
* Prisma schema design suggestions
* CSV anomaly detection brainstorming
* Documentation generation
* Deployment troubleshooting

All generated code was manually reviewed, tested, modified, and validated before inclusion in the final project.

Detailed AI usage, prompts, mistakes, and corrections are documented in:

```text
AI_USAGE.md
```

---

# Additional Documentation

* README.md
* SCOPE.md
* DECISIONS.md
* AI_USAGE.md

---

# Author

Piyush Sengar
