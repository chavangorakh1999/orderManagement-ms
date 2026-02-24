# FoodDash — Order Management Microservice

A full-stack Order Management feature for a food delivery application, built as a Senior Full Stack Developer assessment.

**Live Demo:** `https://your-app.vercel.app` *(replace after deployment)*
**Loom Walkthrough:** `https://loom.com/your-video` *(replace after recording)*

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Key Design Decisions](#key-design-decisions)
- [API Reference](#api-reference)
- [Real-Time Events](#real-time-events)
- [Running Locally](#running-locally)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Deployment](#deployment)
- [Evaluation Criteria Mapping](#evaluation-criteria-mapping)
- [AI Usage](#ai-usage)

---

## Overview

FoodDash allows users to:

1. **Browse** a seeded menu of 12 food items across 8 categories
2. **Add items** to a persistent cart with quantity controls
3. **Checkout** with delivery details (name, address, phone) — validated on both client and server
4. **Track orders in real-time** via Socket.io — status auto-advances every N seconds (configurable via env)
5. **View order history** filtered by phone number with live status badges

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Client (Vite)                │
│                                                     │
│  Pages: Menu → Cart → Checkout → Order Status       │
│  State: useReducer + Context (CartContext)          │
│  Real-time: Socket.io client (SocketContext)        │
│  Routing: React Router v6                          │
│  Styling: Tailwind CSS v4                          │
└───────────────┬─────────────────────────┬───────────┘
                │ REST (axios)             │ WebSocket
                ▼                         ▼
┌─────────────────────────────────────────────────────┐
│               Express API Server (Node.js)          │
│                                                     │
│  Route → Controller → Service → MongoDB (Mongoose)  │
│  Validation: Zod schemas                           │
│  Rate Limiting: rate-limiter-flexible              │
│  Real-time: Socket.io + Redis adapter              │
└───────────────────────────┬─────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              ▼                            ▼
    ┌─────────────────┐         ┌─────────────────────┐
    │    MongoDB       │         │       Redis          │
    │ • Orders         │         │ • Socket.io adapter  │
    │ • Menu items     │         │ • Menu cache (60s)   │
    └─────────────────┘         └─────────────────────┘
```

### Layered Backend Architecture

```
Request
  └── Route (express Router)
        └── Validate middleware (Zod)
              └── Controller (HTTP layer only)
                    └── Service (business logic, validation)
                          └── Model (Mongoose — MongoDB)
```

---

## Tech Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend framework | React 19 + Vite 7 | Fast DX, modern concurrent features |
| Styling | Tailwind CSS v4 | Utility-first, no runtime overhead |
| State management | useReducer + Context | Right-sized for this scope; no Redux boilerplate |
| Routing | React Router v6 | Industry standard SPA routing |
| HTTP client | Axios | Interceptors, consistent error shape |
| Real-time | Socket.io client | Room-based subscriptions, auto-reconnect |
| Backend | Express.js (Node.js) | Minimal, composable, wide ecosystem |
| Database | MongoDB + Mongoose | Persistent storage, rich query API, schema validation |
| Validation | Zod | Type-safe schemas, excellent error messages |
| Real-time server | Socket.io + Redis adapter | Scales horizontally across multiple server instances |
| Caching | Redis (ioredis) | 60s TTL on menu, invalidated on writes |
| Rate limiting | rate-limiter-flexible | Redis-backed, memory fallback |
| Testing | Jest + Supertest + React Testing Library | TDD across both layers |
| Monorepo | npm workspaces | Single `npm install`, shared scripts |

---

## Project Structure

```
orderManagement-ms/
├── package.json              # npm workspaces root
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/
│   │   │   ├── cart/         # Cart, CartItem, CartSummary
│   │   │   ├── checkout/     # CheckoutForm, FormField
│   │   │   ├── common/       # Toast
│   │   │   ├── layout/       # Header, Footer
│   │   │   ├── menu/         # MenuItem, MenuList (with skeletons)
│   │   │   └── order/        # OrderStatusTracker, StatusStep, OrderConfirmation
│   │   ├── context/          # CartContext (useReducer), SocketContext
│   │   ├── hooks/            # useMenu, useCart, useOrder, useOrders, useOrderStatus
│   │   ├── pages/            # MenuPage, CartPage, CheckoutPage, OrderStatusPage, OrdersPage
│   │   └── utils/            # formatters (INR currency), validators
│   └── __tests__/            # Component + utility tests (35 tests)
└── server/                   # Express API server
    ├── ecosystem.config.js   # PM2 cluster config (instances=max, env_production)
    ├── Procfile              # Railway/Render: pm2-runtime start ecosystem.config.js
    ├── src/
    │   ├── app.js            # Express app (importable without starting HTTP)
    │   ├── index.js          # HTTP server + Socket.io + DB connect + seeding (entry point)
    │   ├── config/
    │   │   ├── db.js         # connectDB / disconnectDB (Mongoose)
    │   │   └── redis.js      # Redis client with graceful fallback
    │   ├── controllers/      # Thin HTTP handlers
    │   ├── middleware/       # validate (Zod), errorHandler, rateLimiter
    │   ├── models/
    │   │   ├── MenuItem.js   # Mongoose schema + id virtual
    │   │   └── Order.js      # Mongoose schema + STATUS_TRANSITIONS + ORDER_STATUSES
    │   ├── routes/           # menuRoutes, orderRoutes
    │   ├── seed/             # 12 menu items across 8 categories
    │   ├── services/         # Business logic + orderStatusSimulator
    │   ├── socket/           # orderSocket (room-per-order pattern)
    │   ├── utils/            # generateId (nanoid)
    │   └── validators/       # Zod schemas for menu and orders
    └── __tests__/            # API + Socket.io tests (34 tests)
```

---

## Key Design Decisions

### 1. `app.js` separated from `index.js`
Express app is exported from `app.js` with no side effects. `index.js` creates the HTTP server, attaches Socket.io, connects to MongoDB, and seeds data. This makes Supertest-based integration tests clean — they import `app` directly without starting a server.

### 2. MongoDB + Mongoose (replacing in-memory stores)

`MenuItem` and `Order` are Mongoose models with schemas, validation, and an `id` virtual (maps `_id` to `id`, removes `__v` via `toJSON` transform). Using MongoDB provides persistent storage across restarts and enables queries like filtering orders by phone number.

```js
// id virtual applied to all models
schema.virtual('id').get(function () { return this._id.toString(); });
schema.set('toJSON', { virtuals: true, transform: (_, ret) => { delete ret._id; delete ret.__v; } });
```

### 3. Status Transition Enforcement
A `STATUS_TRANSITIONS` map in `Order.js` defines valid next states. The service layer rejects any transition that isn't explicitly allowed — no skipping steps, no going backward.

```js
received → preparing → out_for_delivery → delivered
```

### 4. Server-Side Total Calculation
`totalAmount` is always computed on the server by summing `price × quantity` from menu items fetched from MongoDB. The client-submitted price is used for display only — it's never trusted for the total.

### 5. Real-Time: Room-Per-Order
Each order gets its own Socket.io room (`order:${orderId}`). Clients subscribe only to the room they care about. Status updates are emitted only to that room — efficient at any scale.

### 6. Status Simulation
`orderStatusSimulator.js` auto-advances order statuses using `setTimeout` chains. The interval is controlled by `STATUS_UPDATE_INTERVAL_MS` env var. Set to `0` or omit to disable.

```
t=0s   received   (on order creation)
t+N    preparing  (Socket.io push)
t+2N   out_for_delivery
t+3N   delivered
```

### 7. useReducer + Context over Redux
For this scope, `useReducer` + Context provides the same predictable state updates as Redux but with zero additional dependencies. The `cartReducer` is pure and fully testable in isolation.

### 8. Zod Validation (Middleware Factory)
A single `validate(schema)` middleware factory wraps all endpoints. It parses `req.body` against a Zod schema and returns a structured `400 VALIDATION_ERROR` response with per-field details before the request reaches the controller.

### 9. PM2 Cluster Mode

The server runs under PM2 (`pm2-runtime`) in `cluster` exec mode with `instances: 'max'`, spawning one worker per CPU core. `pm2-runtime` keeps the process in the foreground (required for PaaS platforms like Railway). The Socket.io Redis adapter ensures events are broadcast across all workers.

```bash
# Production (from repo root)
npm run start:prod --workspace=server

# Local process management (ecosystem.config.js lives in server/)
cd server
npx pm2 start ecosystem.config.js --env development
npx pm2 logs fooddash-api
npx pm2 monit                  # real-time terminal dashboard (CPU, memory, logs)
npx pm2 restart fooddash-api
npx pm2 delete fooddash-api
```

### 10. Redis Graceful Fallback

Both Redis caching (menu) and rate limiting fall back to in-memory equivalents when Redis is unavailable. The server starts and functions correctly without Redis — it just loses cache and distributed rate limiting.

---

## API Reference

### Menu

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/menu` | List all menu items (cached 60s) |
| `GET` | `/api/menu/:id` | Get single item — `404` if not found |
| `POST` | `/api/menu` | Create item (Zod validated) |
| `PUT` | `/api/menu/:id` | Update item — `404` if not found |
| `DELETE` | `/api/menu/:id` | Delete item — `404` if not found |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/orders` | List all orders — `200 { orders: [] }` when empty |
| `GET` | `/api/orders?phone=<phone>` | Filter orders by customer phone number |
| `GET` | `/api/orders/:id` | Get single order — `404` if not found |
| `POST` | `/api/orders` | Place order (validates items exist, calculates total server-side) |
| `PATCH` | `/api/orders/:id/status` | Advance status (enforces transition rules) |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Returns `{ status: "ok" }` — used by Railway health checks |

### Error Shape

All errors follow a consistent envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR | NOT_FOUND | TRANSITION_ERROR",
    "message": "Human-readable description",
    "details": [{ "field": "customer.phone", "message": "Invalid phone format" }]
  }
}
```

---

## Real-Time Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `order:subscribe` | `{ orderId }` | Join the order's room |
| `order:unsubscribe` | `{ orderId }` | Leave the room |

### Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `order:statusUpdate` | `{ orderId, status, updatedAt }` | Status changed (API call or simulator) |
| `order:error` | `{ message }` | Subscribe attempt with missing orderId |

---

## Running Locally

### Prerequisites
- Node.js ≥ 18
- MongoDB running on `localhost:27017` (or a MongoDB Atlas URI)
- Redis running on `localhost:6379` (optional — app works without it)

### Setup

```bash
git clone https://github.com/your-username/orderManagement-ms.git
cd orderManagement-ms
npm install          # installs both client and server workspaces
```

### Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env — set MONGODB_URI and STATUS_UPDATE_INTERVAL_MS
```

### Start

```bash
npm run dev          # starts both server (:3001) and client (:5173) concurrently
```

Open `http://localhost:5173`

### Individual workspaces

```bash
npm run dev --workspace=server     # API only
npm run dev --workspace=client     # Frontend only
```

---

## Environment Variables

### Server (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | HTTP server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed client origin |
| `MONGODB_URI` | `mongodb://localhost:27017/orderManagement` | MongoDB connection string |
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL (optional) |
| `STATUS_UPDATE_INTERVAL_MS` | `0` (disabled) | Auto-advance order status every N ms. Set to `5000` for 5s intervals. `0` = disabled. |

### Client (`client/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `""` (proxy) | Backend base URL (empty = use Vite proxy in dev) |
| `VITE_SOCKET_URL` | `""` (proxy) | Socket.io server URL |

---

## Testing

```bash
npm test                          # run all tests (server + client)
npm run test:server               # server tests only
npm run test:client               # client tests only
```

### Test Summary

| Suite | Tests | Coverage |
|-------|-------|---------|
| `server/__tests__/menu.test.js` | 15 | Full CRUD + validation + 404 |
| `server/__tests__/order.test.js` | 15 | Lifecycle, server-side total, transition enforcement |
| `server/__tests__/orderSocket.test.js` | 4 | Subscribe/unsubscribe, event emission, room isolation |
| `client/__tests__/utils/validators.test.js` | 13 | All validator functions |
| `client/__tests__/components/MenuItem.test.jsx` | 5 | Render, add to cart, quantity stepper |
| `client/__tests__/components/Cart.test.jsx` | 3 | Empty state, items, item count |
| `client/__tests__/components/CheckoutForm.test.jsx` | 9 | Fields, blur validation, submit behaviour |
| `client/__tests__/components/OrderStatusTracker.test.jsx` | 5 | All status states including delivered = completed |
| **Total** | **69** | |

### TDD Approach

Tests were written **before** implementation for all API endpoints. The test file structure follows **AAA (Arrange-Act-Assert)**. Server tests use `mongodb-memory-server` to spin up an in-process MongoDB instance — no mocking of business logic, no shared state between tests.

---

## Deployment

> **Important constraint:** The backend **cannot** be deployed to Vercel or any serverless platform.
> Two reasons:
>
> 1. **Socket.io** — requires a persistent, long-lived TCP connection. Serverless functions terminate immediately after returning a response; WebSocket upgrades are not supported.
> 2. **Status simulator** — runs `setTimeout` chains in the background; serverless functions have no persistent process to run them.
>
> The split is: **frontend → Vercel** (static files only), **backend → Railway/Render/Fly.io** (persistent Node.js process).

### Frontend → Vercel

1. Connect the GitHub repo to Vercel
2. Set root directory to `client/`
3. Add environment variables:
   - `VITE_API_URL` = your Railway backend URL (e.g. `https://fooddash-api.railway.app`)
   - `VITE_SOCKET_URL` = same Railway backend URL
4. `vercel.json` is pre-configured to handle SPA routing (404 → `index.html`)

### Backend → Railway

Railway runs a **persistent Node.js process** — MongoDB, Socket.io, and the status simulator all work correctly. The server uses **PM2** in cluster mode to utilise all available CPU cores and automatically restart on crashes.

1. Connect the GitHub repo to Railway
2. Set root directory to `server/`
3. Add environment variables:
   - `CORS_ORIGIN` = your Vercel frontend URL
   - `MONGODB_URI` = provisioned MongoDB URL (Railway MongoDB addon or MongoDB Atlas)
   - `REDIS_URL` = provisioned Redis URL (Railway Redis addon — **required** for PM2 cluster mode so Socket.io events are shared across workers)
   - `STATUS_UPDATE_INTERVAL_MS` = `5000` (or your preferred interval)
4. `Procfile` is pre-configured: `web: pm2-runtime start ecosystem.config.js --env production`

### MongoDB → Railway MongoDB addon or Atlas

Provision via Railway dashboard → New Service → MongoDB, or use a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster. Copy the connection string as `MONGODB_URI`.

### Alternatives to Railway

| Platform | Persistent process | WebSockets | Free tier |
| -------- | ------------------ | ---------- | --------- |
| Railway | ✅ | ✅ | ✅ (limited) |
| Render | ✅ | ✅ | ✅ (spins down on idle) |
| Fly.io | ✅ | ✅ | ✅ |
| Vercel | ❌ serverless | ❌ | ✅ — frontend only |
| Netlify | ❌ serverless | ❌ | ✅ — frontend only |

---

## Evaluation Criteria Mapping

### 1. Problem-Solving Approach

- Requirements decomposed into phases: scaffolding → middleware → menu API → order API → sockets → MongoDB integration → frontend → testing → polish → deployment
- Scalability addressed via: MongoDB (persistent, queryable data store), Socket.io Redis adapter (horizontal scaling), Redis caching (menu read throughput), rate limiting (abuse prevention)
- Each feature built independently and tested before the next begins

### 2. Code Quality

- **Layered architecture**: Route → Controller → Service → Model (each layer has one responsibility)
- **69 tests** passing across server and client
- TDD: tests written before implementation for all API endpoints
- Zod schemas shared between validation middleware and type inference
- Pure functions throughout (reducers, validators, formatters)
- `app.js` / `index.js` separation enables clean testing without server startup

### 3. UI/UX

- Sticky header with live cart badge count
- Skeleton loaders while menu fetches
- Inline form validation (validates on blur, re-validates on change)
- Sticky checkout CTA bar on menu page when cart is non-empty
- Toast notifications for success/error
- Live order tracker with 4-step progress indicator
- All-steps-completed state when delivered (no false "in progress" state)
- Customer info persisted to localStorage, shown as a pill on cart page
- Order history page filtered by phone number
- Fully responsive (1–4 column grid)

### 4. Back-End

- **Input validation**: Zod schemas on all write endpoints — rejects before reaching service layer
- **Status transitions**: Hard-enforced map — no skipping, no backward transitions
- **Server-side total**: `totalAmount` always recomputed from MongoDB menu items; client price is display-only
- **Structured error responses**: Consistent `{ error: { code, message, details } }` envelope
- **Rate limiting**: 10 req/s per IP (Redis-backed with memory fallback)
- **Health endpoint**: `/health` for platform health checks
- **404 vs 200**: List endpoints always return `200` with empty array; `404` reserved for missing single entities
- **Phone-based order lookup**: `GET /api/orders?phone=<phone>` returns orders belonging to a specific customer

### 5. Use of AI

See [AI Usage](#ai-usage) section below.

---

## AI Usage

Claude Code (Claude Sonnet 4.6) was used as a **pair-programming collaborator** throughout this project. Specific contributions:

**Architecture Planning**
- Helped design the layered backend (Route → Controller → Service → Model) and articulate why `app.js` / `index.js` separation enables clean testing
- Recommended the Room-per-order Socket.io pattern over broadcasting to all clients
- Suggested the Redis graceful fallback strategy (app works with or without Redis)
- Guided MongoDB/Mongoose migration from in-memory stores (schema design, `id` virtual, `toJSON` transform)

**Code Generation**
- Generated boilerplate for all layers (models, validators, services, controllers, routes) following the established pattern
- Scaffolded all React components and hooks from architecture decisions
- Generated deployment configs (`vercel.json`, `Procfile`, `.env.example`)

**Debugging**
- Diagnosed the shared object mutation bug in order tests (`customer: validCustomer` reference vs `{ ...validCustomer }` spread) — caught by methodically running tests in isolation
- Identified the `setupFilesAfterSetup` → `setupFilesAfterEnv` typo in Jest config
- Fixed the React "Cannot update during render" error in CheckoutPage (`navigate()` inside render → moved to `useEffect`)
- Identified that `dotenv` was not being loaded — `STATUS_UPDATE_INTERVAL_MS` was always `undefined`

**Testing**
- Wrote all 69 tests following TDD discipline (tests before implementation)
- Configured `mongodb-memory-server` for isolated, deterministic server tests


**Best Practices Enforcement**
- Flagged that `totalAmount` must never be trusted from the client
- Recommended `--runInBand` for Jest when tests share a MongoDB connection
- Pointed out that list endpoints should always return `200` with empty array, never `404`

The AI was used to **accelerate implementation** while architectural and design decisions were made collaboratively. All generated code was reviewed, understood, and adapted to requirements before being committed.
