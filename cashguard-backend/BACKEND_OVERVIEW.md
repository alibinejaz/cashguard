# CashGuard Backend Overview

Last updated: 2026-05-14

This is the living backend reference for CashGuard. Keep it updated whenever API routes, controllers, Prisma models, auth behavior, or finance calculations change.

## Backend Summary

The CashGuard backend is an Express API that handles authentication, user-owned finance data, dashboard calculations, expense warnings, budgets, reports, settings, and warning history.

The frontend currently calls this API at:

```text
http://localhost:5050
```

## Tech Stack

- Node.js with ES modules
- Express 5
- Prisma ORM
- PostgreSQL
- JWT authentication
- Bcrypt password hashing
- Dotenv for environment variables
- Nodemon for local development

## Backend Folder Structure

Backend root:

```text
cashguard-backend/
```

Important files:

- `src/server.js`: Express app setup, middleware, health routes, and route mounting.
- `src/config/db.js`: Prisma client instance.
- `src/middleware/authMiddleware.js`: JWT bearer token protection.
- `src/routes/`: route files that connect URLs to controllers.
- `src/controllers/`: business logic and response shaping.
- `prisma/schema.prisma`: database schema.
- `prisma/migrations/`: database migration history.
- `package.json`: backend scripts and dependencies.

## Runtime Setup

Expected environment variables:

```text
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=5050
```

Run locally:

```bash
cd cashguard-backend
npm run dev
```

Production-style start:

```bash
cd cashguard-backend
npm start
```

Current scripts:

- `npm run dev`: runs `nodemon src/server.js`.
- `npm start`: runs `node src/server.js`.

Current note: there are no package scripts yet for Prisma generate, migrate, or seed.

## Server Setup

File: `cashguard-backend/src/server.js`

What it does:

- Loads environment variables with `dotenv.config()`.
- Creates an Express app.
- Enables CORS with default settings.
- Enables JSON body parsing with `express.json()`.
- Provides basic root and health endpoints.
- Provides a test protected endpoint.
- Mounts all API route modules.
- Starts listening on `process.env.PORT || 5050`.

Mounted route groups:

- `/api/auth`
- `/api/settings`
- `/api/expenses`
- `/api/budgets`
- `/api/dashboard`
- `/api/plans`
- `/api/reports`
- `/api/warnings`

## Database Connection

File: `cashguard-backend/src/config/db.js`

The backend creates one Prisma client:

```js
const prisma = new PrismaClient();
```

Controllers import this shared client to query and update PostgreSQL.

## Authentication

### Middleware

File: `cashguard-backend/src/middleware/authMiddleware.js`

The `protect` middleware:

- Reads the `Authorization` header.
- Requires the format `Bearer <token>`.
- Verifies the token using `process.env.JWT_SECRET`.
- Stores decoded token data on `req.user`.
- Returns `401` for missing, malformed, or invalid tokens.

The JWT payload currently contains:

```js
{ id: user.id }
```

Tokens are created with a 7-day expiry.

### Auth Controller

File: `cashguard-backend/src/controllers/authController.js`

`signup`

- Requires `name`, `email`, and `password`.
- Rejects duplicate email addresses.
- Hashes password with bcrypt using salt rounds of `10`.
- Creates the user.
- Creates a related `FinanceProfile` with salary `0`, ignored warnings `0`, and streak `0`.
- Returns a safe user object and JWT.

`login`

- Requires `email` and `password`.
- Finds user by email.
- Compares password using bcrypt.
- Returns a safe user object and JWT.

`getMe`

- Requires auth.
- Finds the current user by `req.user.id`.
- Returns `id`, `name`, `email`, and `createdAt`.

## API Routes

### Health And Root

`GET /`

- Returns plain text: `CashGuard API running`.

`GET /api/health`

- Returns `{ status: "ok", message: "CashGuard API running" }`.

`GET /api/protected`

- Protected test route.
- Returns the decoded authenticated user payload.

### Auth Routes

File: `cashguard-backend/src/routes/authRoutes.js`

`POST /api/auth/signup`

Body:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "createdAt": "..."
  },
  "token": "..."
}
```

`POST /api/auth/login`

Body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Success response:

```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "...",
    "createdAt": "..."
  },
  "token": "..."
}
```

`GET /api/auth/me`

- Protected.
- Returns the authenticated user.

### Settings Routes

File: `cashguard-backend/src/routes/settingsRoutes.js`

`GET /api/settings`

- Protected.
- Returns the current user finance profile.

`PUT /api/settings/salary`

- Protected.
- Updates or creates the current user's finance profile salary.

Body:

```json
{
  "salary": 150000
}
```

Validation:

- `salary` is required.
- `salary` cannot be negative.

`POST /api/settings/reset`

- Protected.
- Deletes the current user's expenses.
- Deletes the current user's budget limits.
- Deletes the current user's warning logs.
- Deletes the current user's saving plans.
- Resets profile salary to `0`.
- Resets ignored warnings to `0`.
- Resets streak to `0`.
- Resets last checked date to `null`.

### Expense Routes

File: `cashguard-backend/src/routes/expenseRoutes.js`

`GET /api/expenses`

- Protected.
- Returns the current user's expenses ordered by `date` descending.

`POST /api/expenses`

- Protected.
- Adds an expense, unless warning confirmation is required.

Body:

```json
{
  "amount": 1200,
  "category": "Food",
  "note": "Lunch",
  "date": "2026-05-14",
  "confirm": false
}
```

Validation:

- `amount` is required and must be greater than `0`.
- `category` is required.
- User must have a finance profile with salary greater than `0`.

Warning behavior:

- If a warning is generated and `confirm` is false, the backend returns HTTP `409`.
- If the same expense is resent with `confirm: true`, the backend creates the expense, increments ignored warnings, and logs the warning.

Success response:

```json
{
  "expense": {
    "id": "...",
    "userId": "...",
    "amount": 1200,
    "category": "Food",
    "note": "Lunch",
    "date": "...",
    "createdAt": "..."
  },
  "warningUsed": false
}
```

`DELETE /api/expenses/:id`

- Protected.
- Verifies the expense belongs to the current user.
- Deletes the expense.

### Budget Routes

File: `cashguard-backend/src/routes/budgetRoutes.js`

`GET /api/budgets`

- Protected.
- Returns the current user's budget limits ordered by category.

`PUT /api/budgets/:category`

- Protected.
- Upserts the budget limit for one category.

Body:

```json
{
  "limit": 25000
}
```

Validation:

- `category` is required from the route parameter.
- `limit` is required.
- `limit` cannot be negative.

The Prisma model enforces one budget per user/category pair with `@@unique([userId, category])`.

### Dashboard Route

File: `cashguard-backend/src/routes/dashboardRoutes.js`

`GET /api/dashboard`

- Protected.
- Returns the current user's dashboard metrics.

Response includes:

- `salary`
- `totalSpent`
- `remaining`
- `normalDailyBudget`
- `planPressure`
- `dailyBudget`
- `dailyBudgetMessage`
- `projected`
- `projectedOverspend`
- `spentPercentage`
- `health`
- `ignoredWarnings`
- `behavior`
- `streak`
- `suggestions`

### Reports Route

File: `cashguard-backend/src/routes/reportsRoutes.js`

`GET /api/reports`

- Protected.
- Returns report data for the current user.

Response includes:

- `salary`
- `totalSpent`
- `remaining`
- `dailyBudget`
- `biggestLeak`
- `categorySummary`
- `weeklyTrends`
- `expenses`

### Plans Routes

File: `cashguard-backend/src/routes/planRoutes.js`

Protected endpoints:

- `GET /api/plans`: returns all user-owned saving plans with computed metrics.
- `POST /api/plans`: creates a new saving plan.
- `PUT /api/plans/:id`: updates a user-owned saving plan.
- `DELETE /api/plans/:id`: deletes a user-owned saving plan.
- `POST /api/plans/:id/add-saving`: adds saved amount to a user-owned plan.

### Warning Routes

File: `cashguard-backend/src/routes/warningRoutes.js`

`GET /api/warnings`

- Protected.
- Returns ignored warning logs for the current user ordered by newest first.

## Prisma Data Model

File: `cashguard-backend/prisma/schema.prisma`

### User

Stores account identity and password hash.

Fields:

- `id`: UUID primary key.
- `name`: user display name.
- `email`: unique email.
- `password`: bcrypt hash.
- `createdAt`: creation timestamp.

Relations:

- One optional `FinanceProfile`.
- Many `Expense` records.
- Many `BudgetLimit` records.
- Many `WarningLog` records.
- Many `SavingPlan` records.

### FinanceProfile

Stores one user's finance settings and behavior counters.

Fields:

- `id`: UUID primary key.
- `userId`: unique user relation.
- `salary`: monthly salary, default `0`.
- `ignoredWarnings`: number of confirmed unsafe-warning skips.
- `streak`: budget discipline streak.
- `lastCheckedDate`: date used for streak tracking.
- `createdAt`
- `updatedAt`

Current note: dashboard reads `streak`, but the active backend controllers do not currently update daily streak behavior.

### Expense

Stores individual spending records.

Fields:

- `id`: UUID primary key.
- `userId`: owner.
- `amount`: expense amount.
- `category`: spending category.
- `note`: description, default `"-"`.
- `date`: expense date.
- `createdAt`

### BudgetLimit

Stores category limits.

Fields:

- `id`: UUID primary key.
- `userId`: owner.
- `category`: category name.
- `limit`: numeric spending limit.
- `createdAt`
- `updatedAt`

Unique constraint:

- One limit per `userId` and `category`.

### WarningLog

Stores warnings the user chose to ignore.

Fields:

- `id`: UUID primary key.
- `userId`: owner.
- `type`: warning type, such as `category` or `projection`.
- `reason`: short reason.
- `message`: user-facing warning details.
- `amount`: expense amount involved.
- `category`: expense category involved.
- `createdAt`

### SavingPlan

Stores user future-goal plans that influence safe daily spending.

Fields:

- `id`: UUID primary key.
- `userId`: owner.
- `name`: plan name (e.g., Dubai Trip 2027).
- `targetAmount`: target amount to reach.
- `savedAmount`: current saved amount.
- `deadline`: plan deadline date.
- `description`: optional user note.
- `status`: plan status (`active`, `paused`, `completed`).
- `createdAt`
- `updatedAt`

## Business Logic

### Dashboard Metrics

File: `cashguard-backend/src/controllers/dashboardController.js`

Calculations:

- `totalSpent`: sum of all expense amounts.
- `remaining`: salary minus total spent.
- `remainingDays`: days left in current month including today.
- `dailyBudget`: remaining divided by remaining days, floored and clamped to at least `0`.
- `normalDailyBudget`: base daily budget before plan protection.
- `planPressure`: sum of required daily saving across active plans.
- `dailyBudget`: real spend-safe budget after subtracting plan pressure.
- `projected`: current spending pace projected across the full month.
- `projectedOverspend`: projected spending minus salary.
- `spentPercentage`: total spent as percent of salary, capped at `100`.

Health status:

- `empty`: salary is missing or `0`.
- `danger`: projected spending exceeds salary.
- `danger`: remaining balance is below `0`.
- `warning`: daily budget is below `1000`.
- `safe`: otherwise.

Behavior message:

- `0` ignored warnings: safe.
- `1-2`: warning.
- `3-5`: danger.
- More than `5`: danger, strongest message.

Suggestions:

- Ask user to set salary if missing.
- Ask user to add first expense if there are none.
- Warn about over-budget state.
- Suggest survival mode if daily budget is below `1000`.
- Identify highest spending category.

### Expense Warning Logic

File: `cashguard-backend/src/controllers/expenseController.js`

Warning checks happen before an expense is created.

Priority 1: category budget crossing

- Finds the current user's budget limit for the submitted category.
- Sums previous spending in that category.
- Warns if `currentCategorySpent + amount > categoryLimit`.

Priority 2: daily safe budget crossing

- Calculates safe daily budget from monthly remaining amount and subtracts active plan pressure.
- Warns when an expense pushes spending beyond this plan-protected daily budget.

Priority 3: active plan damage risk

- Detects if expense threatens required saving pace for active plans.
- Adds warning message including plan names when possible.
- Calculates today's spending total after adding this expense.
- Warns if today's spending after this expense is greater than the safe daily budget.

Combined warning behavior

- If both category limit and daily safe budget are crossed, one warning response includes both reasons/messages so the frontend modal can show both in the same prompt.

Priority 3: projection danger fallback

- If category and daily-budget warnings are not triggered, backend still checks projection risk.
- Warns if projected spending exceeds salary and the expense is greater than 30 percent of salary.

Confirmation behavior:

- Without confirmation, warning returns HTTP `409`.
- With confirmation, the backend:
  - increments `FinanceProfile.ignoredWarnings`;
  - creates a `WarningLog`;
  - creates the expense.

### Reports Logic

File: `cashguard-backend/src/controllers/reportsController.js`

Reports calculate:

- Salary, total spent, remaining, and daily budget.
- Category totals from all expenses.
- Category percentages based on total spent.
- Biggest leak as the highest spending category.
- Current week spending from start of week to today.
- Last week spending from previous week range.
- Trend as `none`, `stable`, `increasing`, or `decreasing`.

Current week starts on JavaScript day `0`, which is Sunday.

## Error Handling Pattern

Most controllers:

- Use `try/catch`.
- Return validation errors with `400`.
- Return auth errors from middleware with `401`.
- Return missing user-owned records with `404`.
- Return warning confirmations with `409`.
- Return unexpected errors with `500` and `{ error: err.message }`.

Current note: raw error messages are returned to clients in `500` responses. That is useful during development, but should be tightened before production.

## Security Notes

Implemented:

- Passwords are hashed with bcrypt.
- JWT is required for finance routes.
- Controllers scope reads/writes by `req.user.id`.
- Expense deletion checks ownership before deleting.

Needs attention before production:

- Configure CORS to trusted frontend origins only.
- Validate environment variables on boot.
- Avoid returning raw `err.message` for server errors.
- Add request validation middleware or schemas.
- Add rate limiting for auth routes.
- Move frontend API base URL to environment config.

## Current Backend Limitations

- No automated backend tests are configured.
- No Prisma scripts are defined in `package.json`.
- No centralized request validation.
- No centralized error middleware.
- No pagination for expenses, reports, or warnings.
- Streak is stored but not actively updated by backend routes.
- Expense/report/dashboard calculations currently use all expenses, not only current-month expenses. This may or may not match intended product behavior.
- API URLs are hardcoded on the frontend rather than handled through a shared client.

## Keep This File Updated

Update this document when:

- A route is added, removed, or renamed.
- A controller response shape changes.
- Warning, dashboard, report, streak, or budget logic changes.
- Prisma models, relations, indexes, or migrations change.
- Auth/token behavior changes.
- Backend setup scripts or environment variables change.
