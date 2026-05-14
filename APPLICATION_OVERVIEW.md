# CashGuard Application Overview

Last updated: 2026-05-14

This document is the living map of the CashGuard app. Keep it updated whenever frontend pages, backend APIs, data models, or major behavior changes.

## Product Summary

CashGuard is a personal finance control app focused on spending discipline. Users create an account, set their monthly salary, log expenses, define category budgets, and review reports. The app does more than store numbers: it calculates safe daily spending, projects month-end overspend risk, flags unsafe expenses, tracks ignored warnings, and shows behavior-based suggestions.

The currency shown in the UI is Pakistani rupees using `Rs.` formatting.

## Tech Stack

Frontend:

- React 19 with Vite
- React Router for routing
- Zustand for client-side persisted auth/toast state
- Tailwind CSS v4 utility styling
- Framer Motion for page/card/toast animation
- Lucide React for icons
- Recharts for reports charts

Backend:

- Node.js with Express
- Prisma ORM
- PostgreSQL database
- JWT authentication
- Bcrypt password hashing
- CORS and JSON request parsing

## Project Structure

Frontend source lives in `src/`.

- `src/App.jsx`: application routes and protected app layout.
- `src/main.jsx`: React app bootstrap.
- `src/pages/`: route-level screens.
- `src/components/layout/`: shared app shell and sidebar.
- `src/components/ui/`: shared modal/toast UI.
- `src/components/charts/`: Recharts visualizations.
- `src/components/common/`: reusable shared UI blocks (headers, cards, fields, empty states).
- `src/components/dashboard/`: dashboard-specific reusable UI blocks.
- `src/components/reports/`: reports-specific reusable UI blocks.
- `src/store/`: Zustand stores.
- `src/utils/`: older/local finance helper functions. Some logic has since moved to the backend.
- `src/index.css`: Tailwind import plus shared `.input` utility.

Backend source lives in `cashguard-backend/`.

- `src/server.js`: Express app setup and API route mounting.
- `src/routes/`: API route definitions.
- `src/controllers/`: request handlers and business logic.
- `src/middleware/authMiddleware.js`: JWT bearer-token protection.
- `src/config/db.js`: Prisma client.
- `prisma/schema.prisma`: database schema.

Generated/dependency folders:

- `node_modules/` and `cashguard-backend/node_modules/` are installed dependencies.
- `dist/` is the built frontend output.

## Frontend Routing

Routes are defined in `src/App.jsx`.

- `/login`: public login page.
- `/signup`: public signup page.
- `/`: protected dashboard inside `AppLayout`.
- `/expenses`: protected expense logging and recent expenses.
- `/budget`: protected category budget limit management.
- `/reports`: protected reporting and charts.
- `/settings`: protected salary, stats, and reset controls.
- `/how-cashguard-works`: protected plain-language explanation page for app calculations and warnings.
- `*`: redirects to `/`.

Protected pages are wrapped by `ProtectedRoute`, which checks for a persisted auth token in `useAuthStore`. If there is no token, the user is sent to `/login`.

## Frontend State

`src/store/useAuthStore.js`

- Persists `user` and `token` under `cashguard-auth`.
- Exposes `login`, `signup`, and `logout`.
- Used by protected routing, API calls, and sidebar logout.

`src/store/useToastStore.js`

- Holds one active toast at a time.
- `showToast(message, type)` supports `success`, `warning`, `error`, and `info`.
- Toasts auto-hide after 3 seconds.

`src/store/useFinanceStore.js`

- Persists local finance data under `cashguard-storage`.
- Contains salary, expenses, budget limits, ignored warnings, streak, and helper calculations.
- Important current note: most active pages now fetch finance data from the backend instead of this local finance store. This file appears to be legacy or fallback logic and should be reviewed before relying on it for new features.

## Shared Layout And UI

`AppLayout`

- Provides the logged-in shell.
- Renders a desktop sidebar, plus a mobile top bar and toggleable drawer navigation.
- Uses a light slate app background for readability across devices.

`Sidebar`

- Displays CashGuard branding and route links.
- Links to Dashboard, Expenses, Budget Plan, Reports, and Settings.
- Includes logout, which clears auth state and navigates to `/login`.
- Uses icon-based nav items.
- Includes a mobile drawer with backdrop and close button for phone navigation.

`GlobalToaster`

- Renders animated global toast notifications.
- Uses Framer Motion and Lucide icons.

`ConfirmModal`

- Used by the Expenses page when the backend blocks an unsafe expense with a warning and asks for confirmation.

## Frontend Pages

### Login

File: `src/pages/Login.jsx`

What it does:

- Collects email and password.
- Calls `POST http://localhost:5050/api/auth/login`.
- Stores `{ user, token }` in auth store on success.
- Navigates to `/`.
- Shows validation and backend reachability errors through toasts.

### Signup

File: `src/pages/Signup.jsx`

What it does:

- Collects name, email, and password.
- Requires all fields and password length of at least 6.
- Calls `POST http://localhost:5050/api/auth/signup`.
- Stores `{ user, token }` in auth store on success.
- Navigates to `/`.

### Dashboard

File: `src/pages/Dashboard.jsx`

What it does:

- Calls both:
  - `GET /api/dashboard`
  - `GET /api/auth/me`
- Shows user initials/name/email in the dashboard hero.
- Shows salary, total spent, remaining balance, daily safe budget, monthly usage percentage, projection, warning behavior, streak, and smart suggestions.
- Lets the user update salary through `PUT /api/settings/salary`.
- Lets the user open ignored warnings by calling `GET /api/warnings`.

Important behavior:

- Hero tone changes from empty/safe/warning/danger based on backend health status.
- Dashboard calculation logic is backend-driven.
- The displayed streak currently comes from the profile, but there is no visible frontend call that updates streak daily.

### Expenses

File: `src/pages/Expenses.jsx`

What it does:

- Fetches expenses from `GET /api/expenses`.
- Lets the user add an expense with amount, category, note, and date.
- Sends new expenses to `POST /api/expenses`.
- Deletes expenses with `DELETE /api/expenses/:id`.
- Shows recent expenses newest first.

Categories currently used in the UI:

- Food
- Transport
- Bills
- Shopping
- Family
- Health
- Other

Warning flow:

- The first add attempt sends `confirm: false`.
- If the backend returns HTTP `409` with a `warning`, the page opens `ConfirmModal`.
- If the user confirms, the same expense is sent again with `confirm: true`.
- Confirmed unsafe spending increments ignored warnings and creates a warning log on the backend.

### Budget Plan

File: `src/pages/Budget.jsx`

What it does:

- Fetches category budgets from `GET /api/budgets`.
- Fetches expenses from `GET /api/expenses`.
- Converts budget array data into a category-to-limit object for UI rendering.
- Lets the user set/update category limits with `PUT /api/budgets/:category`.
- Shows per-category spent amount, configured limit, progress percentage, and status.

Important behavior:

- Status is calculated in the frontend for display:
  - No limit set
  - Within budget
  - Close to limit at 75 percent or above
  - Budget exceeded at 100 percent or above

### Reports

File: `src/pages/Reports.jsx`

What it does:

- Fetches report data from `GET /api/reports` with month filtering support.
- Shows salary, total spent, remaining, and daily safe budget cards.
- Shows the biggest spending category as “Biggest Leak”.
- Displays a spending breakdown pie chart.
- Shows category summaries with progress bars.
- Shows weekly comparison: this week, last week, and trend.
- Lists all expense records in a table.
- Includes month selector and download dropdown for month-specific `CSV` and `PDF`.

Chart:

- `src/components/charts/SpendingBreakdownChart.jsx` builds category totals from expenses and renders a Recharts donut chart with a matching legend.

### Settings

File: `src/pages/Settings.jsx`

What it does:

- Fetches profile/settings from `GET /api/settings`.
- Fetches expenses and budgets to show counts.
- Lets the user update salary through `PUT /api/settings/salary`.
- Lets the user reset finance data with `POST /api/settings/reset`.

Reset behavior:

- Backend deletes expenses, budget limits, and warning logs.
- Backend resets salary, ignored warnings, streak, and last checked date.

## Backend API

Base URL used by the frontend today:

```text
http://localhost:5050
```

Important current limitation: the frontend hardcodes this URL in page components. There is no shared API client or environment-based API base URL yet.

Health:

- `GET /`: returns plain “CashGuard API running”.
- `GET /api/health`: returns JSON status.
- `GET /api/protected`: test protected route.

Auth:

- `POST /api/auth/signup`: creates user, creates default finance profile, returns user and JWT.
- `POST /api/auth/login`: validates credentials, returns user and JWT.
- `GET /api/auth/me`: returns the current authenticated user.

Settings:

- `GET /api/settings`: returns the authenticated user finance profile.
- `PUT /api/settings/salary`: updates or creates profile salary.
- `POST /api/settings/reset`: deletes finance data and resets profile counters.

Expenses:

- `GET /api/expenses`: returns expenses ordered by date descending.
- `POST /api/expenses`: validates and creates an expense, with warning confirmation support.
- `DELETE /api/expenses/:id`: deletes a user-owned expense.

Budgets:

- `GET /api/budgets`: returns user budget limits ordered by category.
- `PUT /api/budgets/:category`: upserts a category budget limit.

Dashboard:

- `GET /api/dashboard`: returns calculated salary, spending, projection, health, behavior, streak, and suggestions.

Reports:

- `GET /api/reports`: returns summary cards, biggest leak, category summary, weekly trends, and expenses.

Warnings:

- `GET /api/warnings`: returns ignored warning logs ordered newest first.

## Backend Data Model

Defined in `cashguard-backend/prisma/schema.prisma`.

`User`

- `id`, `name`, `email`, `password`, `createdAt`
- Has one `FinanceProfile`
- Has many `Expense`, `BudgetLimit`, and `WarningLog`

`FinanceProfile`

- One per user through unique `userId`
- Stores salary, ignored warning count, streak, and last checked date
- Used by dashboard/settings/expense warning logic

`Expense`

- Belongs to one user
- Stores amount, category, note, date, and createdAt

`BudgetLimit`

- Belongs to one user
- Stores category and limit
- Unique by `(userId, category)`

`WarningLog`

- Belongs to one user
- Stores warning type, reason, message, amount, category, and createdAt
- Created when a user confirms an unsafe expense

## Key Backend Logic

Dashboard calculations:

- Total spent is the sum of all user expenses.
- Remaining is salary minus total spent.
- Daily budget is remaining divided by remaining days in the current month, floored and never below 0.
- Projection estimates month-end spending from spending so far this month.
- Health status can be empty, safe, warning, or danger.
- Behavior message depends on ignored warning count.
- Suggestions are generated from salary, expenses, remaining balance, daily budget, and highest spending category.

Expense warning logic:

- Salary must be set before adding expenses.
- Category limit warnings are checked first.
- A warning is returned if the new expense would cross the category limit.
- A projection warning is returned if the expense makes projected monthly spending exceed salary and the expense is more than 30 percent of salary.
- If a warning exists and `confirm` is false, backend returns HTTP `409`.
- If a warning exists and `confirm` is true, backend increments ignored warnings and writes a `WarningLog`.

Reports calculations:

- Category summary groups all expenses by category and calculates each category percentage of total spending.
- Biggest leak is the highest-spending category.
- Weekly trends compare spending since the start of the current week against the previous week.

## Current Development Notes

- Frontend API calls are centralized with React Query hooks and a shared API utility.
- API base URL is centralized and can be overridden with `VITE_API_BASE_URL`.
- Frontend local finance utilities duplicate some backend logic and may be stale.
- `useFinanceStore` appears mostly unused by current backend-backed pages.
- Shared layout and page spacing are tuned for phone + desktop responsive behavior.
- There are no automated tests currently visible in the project scripts.
- Backend JWT requires `JWT_SECRET` in environment variables.
- Backend database requires `DATABASE_URL` for PostgreSQL.
- The backend package does not define Prisma migrate/generate scripts yet, even though Prisma schema and migrations exist.

## How To Run

Frontend:

```bash
npm run dev
```

Backend:

```bash
cd cashguard-backend
npm run dev
```

Backend expected environment:

```text
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=5050
```

## Keep This File Updated

Update this document when:

- A page is added, renamed, removed, or significantly redesigned.
- A new API route is added or an existing response shape changes.
- Prisma models or migrations change the data model.
- Business logic changes for budget health, warnings, reports, streaks, or suggestions.
- A shared frontend pattern changes, such as introducing an API client, environment variables, or mobile navigation.
- Local-only logic is removed or replaced by backend-backed behavior.
