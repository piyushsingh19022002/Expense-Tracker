# Expense Tracker - Backend Foundation

A production-grade, highly scalable Node.js backend template using Express, CORS, Morgan, and dotenv.

---

## Tech Stack

*   **Runtime**: Node.js (with standard ES Modules `"type": "module"`)
*   **Framework**: Express.js
*   **Logging**: Winston (structured logging formats) & Morgan (HTTP request logging streaming to Winston)
*   **Environment**: Dotenv for configuration loading and validation

---

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   npm (v9+)

### Installation

1.  Install the required dependencies:
    ```bash
    npm install
    ```

2.  Environment configuration setup:
    The application reads environment variables from a `.env` file in the root. A template `.env.example` is provided:
    ```bash
    cp .env.example .env
    ```

### Execution Scripts

*   **Development Mode** (re-runs automatically on file changes using `nodemon`):
    ```bash
    npm run dev
    ```

*   **Production Mode**:
    ```bash
    npm start
    ```

---

## Project Directory Layout

```text
├── src/
│   ├── config/             # Validation & loading of environment configuration
│   ├── constants/          # Static domain, HTTP, and system constants
│   ├── controllers/        # Handles incoming requests, formatting outgoing responses
│   ├── middlewares/        # Express custom middlewares (security, logging, validation, error handler)
│   ├── routes/             # App routing and endpoint routing declarations
│   ├── services/           # Reusable business logic layers
│   ├── utils/              # Helper utilities (ApiError, ApiResponse, asyncHandler, logger)
│   ├── app.js              # Express app setup and middleware registration
│   └── server.js           # HTTP server bootstrapping and process listeners
```

---

## Standardized API Endpoints

### Health Check

*   **Endpoint**: `/api/v1/health`
*   **Method**: `GET`
*   **Description**: Verifies if the backend server is running healthily.
*   **Response Code**: `200 OK`
*   **Response Shape**:
    ```json
    {
      "success": true,
      "statusCode": 200,
      "message": "Server is running healthily.",
      "data": {
        "status": "UP",
        "uptime": 12,
        "timestamp": "2026-06-14T23:55:00.000Z"
      }
    }
    ```

### Error Handling

All failed operations (e.g. database failures, validation errors) return standardized error formats:
```json
{
  "success": false,
  "message": "API resource not found: GET /api/v1/invalid-route",
  "errors": [],
  "stack": "ApiError: API resource not found... (only visible in development mode)"
}
```

Implemented:

- Group Management
- Member Management
- Membership Timeline Support

Implemented:

- Expense Management
- Expense CRUD
- Participant Selection

Implemented:

- Balance Dashboard
- User Balance Summary
- Settlement History
- Who Owes Whom View

Implemented:

- CSV Upload UI
- Upload Progress
- Parsed Data Preview
- Import Summary

Implemented:

- Anomaly Review Dashboard
- Filtering
- Approval Workflow
- Rejection Workflow
- Edit Workflow
- Review History

- Import Report Page
- Search Functionality
- JSON Export
- CSV Export
- Report Summary

---

## Production Deployment

This project is configured for production deployment:
* **Backend**: Deployed on [Render](https://render.com) (Web Service).
* **Frontend**: Deployed on [Vercel](https://vercel.com) (Single Page App).

### Production Setup & Deployment Steps

#### Backend (Render)
1. Register/Login to Render and create a new **Web Service**.
2. Connect your Git repository.
3. Configure the following environment variables in the Render Dashboard:
   - `DATABASE_URL`: Your production PostgreSQL connection string.
   - `JWT_SECRET`: A secure secret string for JWT signing.
   - `JWT_EXPIRY`: Lifespan of session tokens (e.g. `24h`).
   - `JWT_COOKIE_NAME`: Session cookie name (default `auth_token`).
   - `NODE_ENV`: Set to `production`.
   - `CORS_ORIGIN`: Set to your Vercel URL (e.g., `https://expense-tracker.vercel.app`) or `*`.
4. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
5. Deploy the service and verify it is running via `GET /api/health`.

#### Frontend (Vercel)
1. Register/Login to Vercel and import your repository.
2. Edit project settings:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add the following environment variable:
   - `VITE_API_URL`: Set to your deployed backend URL, e.g., `https://expense-tracker-m6o9.onrender.com/api/v1`.
4. Trigger the deployment. Vercel automatically reads [vercel.json](file:///Users/piyushsengar/Desktop/Expense%20Tracker/frontend/vercel.json) to handle SPA routing redirects.