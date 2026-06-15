# Production Deployment Checklist

This document details the configuration requirements and steps to successfully deploy the Shared Expense Management application to production.

---

## Backend Deployment (Render)

### 1. Render Setup
- **Service Type**: Web Service
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Region**: Recommend same region as your database for optimal performance.

### 2. Environment Variables
In the Render Web Service Settings, configure the following Environment Variables:

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection string | `postgresql://user:pass@host:port/db?sslmode=require` |
| `JWT_SECRET` | Secret key for signing JWT tokens | *Generate a secure random string* |
| `JWT_EXPIRY` | Token expiration duration | `24h` |
| `JWT_COOKIE_NAME`| Name of the session cookie | `auth_token` |
| `NODE_ENV` | Run environment | `production` |
| `CORS_ORIGIN` | Allowed cross-domain origins | `https://your-frontend-domain.vercel.app` (or `*` to dynamically allow) |

### 3. Health Check Verification
Verify the backend is live by hitting the health endpoint:
- **Endpoint**: `GET <YOUR_BACKEND_URL>/api/health`
- **Expected Status**: `200 OK`
- **Expected Payload**:
  ```json
  {
    "success": true,
    "message": "API Running"
  }
  ```

---

## Frontend Deployment (Vercel)

### 1. Vercel Setup
- **Framework Preset**: `Vite` (Vercel automatically detects this if the root is set to `frontend`)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2. Environment Variables
In the Vercel project configuration, add the following environment variable:

| Variable Name | Description | Example / Value |
| :--- | :--- | :--- |
| `VITE_API_URL` | Absolute URL to the backend API root | `https://expense-tracker-m6o9.onrender.com/api/v1` |

### 3. Routing Verification & Build Check
- Confirm that Vite compiles the assets with `npm run build` (outputs to `dist/`).
- `vercel.json` rewrite settings will automatically redirect all page refreshes to `/index.html`, ensuring React Router works seamlessly in production.
- Make sure that no references to `localhost` or `127.0.0.1` exist in the production source files.
