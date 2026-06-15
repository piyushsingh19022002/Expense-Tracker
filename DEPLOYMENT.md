# Production Deployment Checklist

This document details the configuration requirements, steps, and validation checks required to successfully deploy the Shared Expense Management application to production.

---

## Backend Deployment (Render)

### 1. Render Setup
- **Service Type**: Web Service
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Region**: Recommend matching region to database cluster (e.g., US East for AWS Neon).

### 2. Environment Variables
In the Render Web Service Settings, configure the following Environment Variables:

| Variable Name | Description | Example / Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection string (SSL required) | `postgresql://neondb_owner:***@ep-***.aws.neon.tech/neondb?sslmode=require` |
| `JWT_SECRET` | Secret key for signing JWT cookies | *Generate a secure random string (64-char hex)* |
| `JWT_EXPIRY` | Token expiration duration | `24h` |
| `JWT_COOKIE_NAME`| Name of the session cookie | `auth_token` |
| `NODE_ENV` | Run environment | `production` |
| `CORS_ORIGIN` | Allowed cross-domain origins | `https://your-frontend-domain.vercel.app` (or `*`) |
| `CSV_IMPORT_MAX_FILE_SIZE_BYTES` | Maximum CSV file size in bytes | `5242880` (5MB) |

---

## Deployment Validation Checklist

### 1. Health & Root Endpoints Validation
Verify the backend is live by hitting the root and health endpoints:

*   **API Root Route**: `GET <YOUR_BACKEND_URL>/`
    - **Expected Status**: `200 OK`
    - **Expected Payload**:
      ```json
      {
        "success": true,
        "service": "Expense Tracker API",
        "status": "running"
      }
      ```
*   **API Health Route**: `GET <YOUR_BACKEND_URL>/api/health`
    - **Expected Status**: `200 OK`
    - **Expected Payload**:
      ```json
      {
        "success": true,
        "message": "API Running"
      }
      ```

### 2. Database Validation
Ensure schema is applied to the production database and Prisma client is compiled:
- Run Prisma migrations inside the Render build script or manually:
  ```bash
  npx prisma migrate deploy
  ```
- Check that the database contains tables: `User`, `Group`, `Membership`, `Expense`, `ExpenseSplit`, `Settlement`, `ImportBatch`, `ImportRow`, `ImportAnomaly`.
- Confirm connection health by checking that user registration creates entries in the database.

### 3. API & Controller Validation
Verify the core operational endpoints are functional and return structured JSON payloads:

*   **Auth Endpoints**:
    - `POST /api/v1/auth/register` (Registers accounts, returns `201 Created` with user details, passwords obfuscated)
    - `POST /api/v1/auth/login` (Authenticates credentials, returns `200 OK` and sets secure, HttpOnly, SameSite `'none'` cookie)
    - `GET /api/v1/auth/me` (Fetches active profile context, requires auth token cookie/bearer)
*   **Groups Endpoints**:
    - `GET /api/v1/groups` (Lists memberships)
    - `POST /api/v1/groups` (Creates a group, assigns creator as active admin)
*   **Expenses Endpoints**:
    - `POST /api/v1/groups/:groupId/expenses` (Creates an expense, splits and validates balances dynamically)
*   **Imports & Anomalies**:
    - `POST /api/v1/imports/upload` (Ephemerally handles CSVs in memory, runs the anomaly detector engine, returns batch ID)
    - `GET /api/v1/imports/:batchId/report` (Compiles summary reports, classifying rows based on anomaly approvals)

---

## Frontend Deployment (Vercel)

### 1. Vercel Settings
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2. Environment Variables
- `VITE_API_URL`: Root backend URL (e.g. `https://expense-tracker-m6o9.onrender.com/api`)

### 3. SPA Routing verification
- React Router routes are mapped under `vercel.json` rewrites to prevent 404s on browser reloads.
