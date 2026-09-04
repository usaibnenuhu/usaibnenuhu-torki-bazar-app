# Torki Bazar — Retail Management System

Standalone, offline-first retail management system for Torki Bazar. Runs entirely locally on SQLite today; the data-access layer is Prisma, so migrating to MySQL later only requires changing the datasource — no business-logic rewrite.

## Architecture

```
apps/desktop        Electron + React (Vite) desktop application
packages/database    Prisma schema, migrations, seed script (SQLite now, MySQL-ready)
packages/core        Business logic & services (auth, RBAC, inventory/FIFO, sales, purchases, ...)
packages/shared      Cross-cutting constants: roles, permissions, invoice prefixes, error types
```

`UI (React) → IPC → main process handlers → @torki-bazar/core services → Prisma (@torki-bazar/database) → SQLite`

## First-time setup

```bash
npm install
npm run db:migrate     # creates packages/database/prisma/dev.db and seeds default data
npm run dev             # launches the Electron app (electron-vite)
```

Default login: `owner` / `ChangeMe123!` — change this immediately from Settings after first login.

## Rebuilding workspace packages

`apps/desktop` consumes `@torki-bazar/shared`, `@torki-bazar/database`, and `@torki-bazar/core` as compiled CommonJS (Electron's main process requires compiled JS, not raw TypeScript). After changing code in those packages, rebuild them:

```bash
npm run build --workspace=@torki-bazar/shared
npm run build --workspace=@torki-bazar/database
npm run build --workspace=@torki-bazar/core
```

## Implemented so far

Foundation & architecture, SQLite schema (users/roles/permissions, audit log, products/categories/brands/units, inventory/batches/stock movements, suppliers/purchases/payables, customers/receivables, membership, sales/POS with FIFO COGS, returns, employees/salary, expenses, notifications, daily closing, backups, sync-queue tables prepared for later), authentication with RBAC (Owner/Admin vs Manager), and a working desktop UI (login, dashboard, POS, products, categories, inventory, suppliers, purchases, customers, membership, returns, employees, expenses, reports, notifications, settings/backup).

## Not yet implemented (roadmap)

- PDF invoice generation/printing (sales & purchase invoices, membership card export)
- Full report suite beyond daily closing (sales/purchase/COGS/expiry/etc. as dedicated report screens with filters & export)
- Dashboard charts (currently stat cards only)
- Manual online-order entry screen (the `Sale.onlineOrderNumber` field exists; needs a dedicated UI form)
- Automated test suite
- Sync queue processing (schema exists; no online server/sync engine yet)
- MySQL migration validation
- electron-builder packaging for distributable installers
- Richer demo/sample data set
