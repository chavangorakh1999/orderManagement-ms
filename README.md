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
5. **View order history** with live status badges

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
│  Route → Controller → Service → Store (in-memory)  │
│  Validation: Zod schemas                           │
│  Rate Limiting: rate-limiter-flexible              │
│  Real-time: Socket.io + Redis adapter              │
└───────────────────────────┬─────────────────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │   Redis          │
                  │ • Socket.io pub/sub adapter │
                  │ • Menu cache (60s TTL)       │
                  └─────────────────┘
```

### Layered Backend Architecture

```
Request
  └── Route (express Router)
        └── Validate middleware (Zod)
              └── Controller (HTTP layer only)
                    └── Service (business logic, validation)
                          └── Store (in-memory Map — swappable)
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
| Validation | Zod | Type-safe schemas, excellent error messages |
| Real-time server | Socket.io + Redis adapter | Scales horizontally across multiple server instances |
| Caching | Redis (ioredis) | 60s TTL on menu, invalidated on writes |
| Rate limiting | rate-limiter-flexible | Redis-backed, memory fallback |
| ID generation | nanoid v3 | URL-safe, collision-resistant |
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
    ├── src/
    │   ├── app.js            # Express app (importable without starting HTTP)
    │   ├── index.js          # HTTP server + Socket.io + seeding (entry point)
    │   ├── config/           # Redis client with graceful fallback
    │   ├── controllers/      # Thin HTTP handlers
    │   ├── middleware/        # validate (Zod), errorHandler, rateLimiter
    │   ├── routes/           # menuRoutes, orderRoutes
    │   ├── seed/             # 12 menu items across 8 categories
    │   ├── services/         # Business logic + orderStatusSimulator
    │   ├── socket/           # orderSocket (room-per-order pattern)
    │   ├── store/            # In-memory Map stores (Repository pattern)
    │   ├── utils/            # generateId (nanoid)
    │   └── validators/       # Zod schemas for menu and orders
    └── __tests__/            # API + Socket.io tests (34 tests)
```

---

## Key Design Decisions

### 1. `app.js` separated from `index.js`
Express app is exported from `app.js` with no side effects. `index.js` creates the HTTP server, attaches Socket.io, and seeds data. This makes Supertest-based integration tests clean — they import `app` directly without starting a server.

### 2. Repository Pattern (Stores)
`menuStore` and `orderStore` are Map-based classes with a consistent interface (`getAll`, `getById`, `create`, `update`, `delete`). Swapping to MongoDB/PostgreSQL requires only changing the store implementation — nothing above it changes.

### 3. Status Transition Enforcement
A `STATUS_TRANSITIONS` map in `orderStore` defines valid next states. The service layer rejects any transition that isn't explicitly allowed — no skipping steps, no going backward.

```js
received → preparing → out_for_delivery → delivered
```

### 4. Server-Side Total Calculation
`totalAmount` is always computed on the server by summing `price × quantity` from menu items. The client-submitted price is used for display only — it's never trusted for the total.

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

### 9. Redis Graceful Fallback
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
# Edit server/.env — set STATUS_UPDATE_INTERVAL_MS=5000 to enable simulation
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
| `REDIS_URL` | `redis://localhost:6379` | Redis connection URL |
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

Tests were written **before** implementation for all API endpoints. The test file structure follows **AAA (Arrange-Act-Assert)**. Server tests use Supertest against the real Express app (with in-memory store) — no mocking of business logic.

---

## Deployment

> **Important constraint:** The backend **cannot** be deployed to Vercel or any serverless platform.
> Two reasons:
>
> 1. **In-memory store** — serverless functions are stateless and ephemeral; each invocation may be a fresh process, so all stored orders/menu data would be lost between requests.
> 2. **Socket.io** — requires a persistent, long-lived TCP connection. Serverless functions terminate immediately after returning a response; WebSocket upgrades are not supported.
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

Railway runs a **persistent Node.js process** — in-memory state and Socket.io both work correctly.

1. Connect the GitHub repo to Railway
2. Set root directory to `server/`
3. Add environment variables:
   - `CORS_ORIGIN` = your Vercel frontend URL
   - `REDIS_URL` = provisioned Redis URL (Railway Redis addon)
   - `STATUS_UPDATE_INTERVAL_MS` = `5000` (or your preferred interval)
4. `Procfile` is pre-configured: `web: node src/index.js`

### Redis → Railway Redis addon

Provision via Railway dashboard → New Service → Redis. Copy the `REDIS_URL` into the server service's environment variables.

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

- Requirements decomposed into 12 phases: scaffolding → middleware → menu API → order API → sockets → frontend components → pages → testing → polish → deployment
- Scalability addressed via: Socket.io Redis adapter (horizontal scaling), Redis caching (menu read throughput), rate limiting (abuse prevention), and swappable Repository pattern (in-memory → DB, zero upstream changes)
- Each feature built independently and tested before the next begins

### 2. Code Quality

- **Layered architecture**: Route → Controller → Service → Store (each layer has one responsibility)
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
- Fully responsive (1–4 column grid)

### 4. Back-End

- **Input validation**: Zod schemas on all write endpoints — rejects before reaching service layer
- **Status transitions**: Hard-enforced map — no skipping, no backward transitions
- **Server-side total**: `totalAmount` always recomputed; client price is display-only
- **Structured error responses**: Consistent `{ error: { code, message, details } }` envelope
- **Rate limiting**: 10 req/s per IP (Redis-backed with memory fallback)
- **Health endpoint**: `/health` for platform health checks
- **404 vs 200**: List endpoints always return `200 { items/orders: [] }`; `404` reserved for missing single entities

### 5. Use of AI

See [AI Usage](#ai-usage) section below.

---

## AI Usage

Claude Code (Claude Sonnet 4.6) was used as a **pair-programming collaborator** throughout this project. Specific contributions:

**Architecture Planning**
- Helped design the layered backend (Route → Controller → Service → Store) and articulate why `app.js` / `index.js` separation enables clean testing
- Recommended the Room-per-order Socket.io pattern over broadcasting to all clients
- Suggested the Redis graceful fallback strategy (app works with or without Redis)

**Code Generation**
- Generated boilerplate for all layers (stores, validators, services, controllers, routes) following the established pattern
- Scaffolded all React components and hooks from architecture decisions
- Generated deployment configs (`vercel.json`, `Procfile`, `.env.example`)

**Debugging**
- Diagnosed the shared object mutation bug in order tests (`customer: validCustomer` reference vs `{ ...validCustomer }` spread) — caught by methodically running tests in isolation
- Identified the `setupFilesAfterSetup` → `setupFilesAfterEnv` typo in Jest config
- Fixed the React "Cannot update during render" error in CheckoutPage (`navigate()` inside render → moved to `useEffect`)
- Identified that `dotenv` was not being loaded — `STATUS_UPDATE_INTERVAL_MS` was always `undefined`

**Testing**
- Wrote all 69 tests following TDD discipline (tests before implementation)
- Helped debug the `delivered` status showing as "in progress" instead of "completed" in `OrderStatusTracker` (the `isFinalStatus` guard fix)

**Best Practices Enforcement**
- Flagged that `totalAmount` must never be trusted from the client
- Recommended `--runInBand` for Jest when tests share singleton stores
- Pointed out that list endpoints should always return `200` with empty array, never `404`

The AI was used to **accelerate implementation** while architectural and design decisions were made collaboratively. All generated code was reviewed, understood, and adapted to requirements before being committed.
