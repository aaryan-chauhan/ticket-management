# Customer Support Ticket Management System

A minimal full-stack practice app implementing an ERP-style CRUD workflow for
managing customers and their support tickets.

- **Frontend:** React (JavaScript) + Vite
- **Backend:** NestJS + TypeScript
- **Database:** PostgreSQL via TypeORM
- **HTTP client:** Axios

No authentication, notifications, email, AI, file uploads, or Docker — this is
intentionally a small practice project focused on working CRUD APIs and
frontend/backend wiring.

## Project structure

```
ticket-management-system/
├── backend/    NestJS REST API (customers, tickets)
└── frontend/   React + Vite single-page app
```

## Prerequisites

- Node.js 18+ and npm
- A running PostgreSQL server (local or remote)

## 1. Create the database

Create an empty database for the app (name can be anything, just match your `.env`):

```bash
psql -U postgres -c "CREATE DATABASE ticket_db;"
```

## 2. Backend setup

```bash
cd backend
cp .env.example .env
# edit .env if your DB credentials differ from the defaults
npm install
npm run start:dev
```

The API listens on `http://localhost:3003` by default (`PORT` in `.env`).

`DB_SYNCHRONIZE=true` tells TypeORM to auto-create/update tables from the
entity definitions — convenient for local development. **In a real
production deployment, set `DB_SYNCHRONIZE=false` and use TypeORM
migrations instead**, since `synchronize` can drop/alter columns
unexpectedly against a live database.

### Backend environment variables (`backend/.env.example`)

| Variable        | Description                              | Default        |
|-----------------|-------------------------------------------|----------------|
| `PORT`          | Port the API listens on                   | `3003`         |
| `FRONTEND_URL`  | Allowed CORS origin                       | `*`            |
| `DB_HOST`       | PostgreSQL host                           | `localhost`    |
| `DB_PORT`       | PostgreSQL port                           | `5432`         |
| `DB_USERNAME`   | PostgreSQL username                       | `postgres`     |
| `DB_PASSWORD`   | PostgreSQL password                       | `postgres`     |
| `DB_NAME`       | Database name                             | `ticket_db`    |
| `DB_SYNCHRONIZE`| Auto-create schema from entities (`true`/`false`) | `true` |

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env
# edit .env if your backend runs somewhere other than localhost:3003
npm install
npm run dev
```

Vite prints a local URL (typically `http://localhost:5173`) — open it in a
browser.

### Frontend environment variables (`frontend/.env.example`)

| Variable        | Description                     | Default                  |
|-----------------|----------------------------------|---------------------------|
| `VITE_API_URL`  | Base URL of the backend API      | `http://localhost:3003`   |

## Using the app

The app has two tabs, switched with plain buttons (no router):

- **Tickets** — a table of all tickets (`Title | Customer | Priority | Status
  | Actions`). Create a ticket by picking a customer from the dropdown,
  entering a title/description and priority. Edit a ticket to change its
  title, description, priority, status, or reassign it to a different
  customer. Delete asks for confirmation first.
- **Customers** — list, add, edit, and delete customers. Deleting a customer
  is confirmed first and **also deletes all of that customer's tickets**
  (see "Cascade delete" note below).

### Allowed values

- **Status:** `OPEN`, `IN_PROGRESS`, `RESOLVED` (defaults to `OPEN` on create)
- **Priority:** `LOW`, `MEDIUM`, `HIGH` (defaults to `MEDIUM` on create)

Sending any other value for `status` or `priority` to the API returns a
`400 Bad Request` (validated with `class-validator`'s `@IsEnum`).

### Cascade delete behavior

Tickets belong to a customer via `customerId` with `onDelete: 'CASCADE'` at
the database level. **Deleting a customer permanently deletes all of their
tickets too** — there is no "orphaned ticket" state. The frontend's delete
confirmation for customers mentions this explicitly.

## API overview

```
POST   /customers          Create a customer
GET    /customers          List customers
GET    /customers/:id      Get one customer
PATCH  /customers/:id      Update a customer
DELETE /customers/:id      Delete a customer (cascades to their tickets)

POST   /tickets            Create a ticket (requires an existing customerId)
GET    /tickets            List tickets (includes nested `customer`)
GET    /tickets/:id        Get one ticket (includes nested `customer`)
PATCH  /tickets/:id        Update a ticket (status, priority, fields, or reassign customer)
DELETE /tickets/:id        Delete a ticket
```

## Deployment

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for deploying this project to an EC2
Ubuntu instance.
