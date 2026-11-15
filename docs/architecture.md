# CellphoneLT — Architecture & System Documentation

> Last updated: 2026-05-19
> Stack: Next.js 15 · Mongoose · MongoDB · NextAuth v5 · Turborepo · pnpm

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Tech Stack](#3-tech-stack)
4. [Frontend — Storefront (B2C)](#4-frontend--storefront-b2c)
5. [Frontend — Admin Dashboard](#5-frontend--admin-dashboard)
6. [Backend — API Routes](#6-backend--api-routes)
7. [Backend — Server Actions](#7-backend--server-actions)
8. [Database Schema](#8-database-schema)
9. [Authentication Flow](#9-authentication-flow)
10. [Key Data Flows](#10-key-data-flows)
11. [Component Architecture](#11-component-architecture)
12. [Configuration & Build](#12-configuration--build)
13. [Phased Delivery Roadmap](#13-phased-delivery-roadmap)

---

## 1. Project Overview

**CellphoneLT** is a Vietnamese phone retail platform with two distinct portals:

| Portal | URL prefix | Audience |
|---|---|---|
| Storefront | `/` | Customers (B2C) |
| Admin Dashboard | `/admin` | Staff (superadmin, admin, technician, sales) |

Core business domains:
- **Product catalog** — phones and accessories with AI-generated specs
- **E-commerce** — cart → checkout → order tracking
- **Repair service** — multi-status ticket workflow with technician assignment
- **Trade-in appraisals** — AI instant price → inspection → accepted units enter inventory
- **Inventory** — dual-mode: serialized by IMEI (used phones) or by quantity (accessories)
- **Customer management** — B2C self-registration + CRM records

---

## 2. Monorepo Structure

```
cellphoneLT/                        # Turborepo root
├── apps/
│   └── web/                        # Next.js 15 app (frontend + backend in one)
│       ├── app/                    # App Router pages, layouts, API routes
│       │   ├── (storefront)/       # B2C route group
│       │   ├── admin/              # Admin route group
│       │   └── api/                # REST API endpoints
│       ├── components/             # React components
│       │   ├── admin/              # Admin-only UI
│       │   ├── shared/             # Used by both portals
│       │   └── storefront/         # Customer-facing UI
│       ├── lib/                    # auth.ts, auth.config.ts
│       ├── middleware.ts           # Route protection
│       ├── public/images/          # Static assets (hero, product images)
│       └── scripts/                # Seed/utility scripts (ts-node)
│
├── packages/
│   ├── db/                         # @cellphonelt/db  — Mongoose (MongoDB) layer
│   │   ├── models/                 # Mongoose models (one file per domain)
│   │   ├── connection.ts           # Cached MongoDB connection
│   │   ├── scripts/                # seed.ts, seed-admin.ts
│   │   └── index.ts                # Re-exports connection helpers + all models
│   │
│   └── shared-types/               # @cellphonelt/shared-types — Zod schemas
│       ├── product.schema.ts       # Product + AI specs validation
│       ├── repair-tradein.schema.ts
│       └── index.ts
│
├── turbo.json                      # Task pipeline config
├── package.json                    # Root — pnpm workspaces
└── .env                            # MONGODB_URI, AUTH_SECRET, etc.
```

**Workspace packages:**

| Package | Internal name | Purpose |
|---|---|---|
| `apps/web` | `@cellphonelt/web` | Next.js app |
| `packages/db` | `@cellphonelt/db` | Database client + schema |
| `packages/shared-types` | `@cellphonelt/shared-types` | Shared Zod schemas |

---

## 3. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15.3 (App Router) | React 19, Turbopack in dev |
| Language | TypeScript | Strict mode off (loose typing) |
| Styling | Tailwind CSS v4 + shadcn/ui | |
| Animations | Framer Motion | PageTransition, ScrollReveal, FloatingElement |
| Charts | Recharts | Admin dashboard |
| Auth | NextAuth v5 (beta) | JWT, two credentials providers |
| ODM | Mongoose 8 | Models + schema validation, `.lean()` reads |
| Database | MongoDB 7+ | String-UUID `_id`s, connection cached on `globalThis` |
| Validation | Zod | Form input + AI spec schemas |
| Excel import | xlsx | Bulk product import |
| Monorepo | Turborepo + pnpm workspaces | Task caching, parallel builds |
| Package manager | pnpm 9.15 | Node ≥ 20 required |
| Passwords | bcryptjs | Salt rounds: 12 |
| Images | Cloudinary | Background removal + CDN delivery |
| AI (planned) | Google Cloud Vision + Gemini 1.5 Pro | Phase 2 AI pipeline |
| Messaging (planned) | Zalo OA + ZNS | Phase 5 |
| Queue (planned) | BullMQ + Redis | Phase 2+ |

---

## 4. Frontend — Storefront (B2C)

### Route Group: `app/(storefront)/`

All customer-facing pages live inside the `(storefront)` route group. The group shares a single layout that wraps every page with `CartProvider`, `Navbar`, `Footer`, and `PageTransition`.

```
app/(storefront)/
├── layout.tsx                          # CartProvider + Navbar + Footer + PageTransition
├── page.tsx                            # Homepage — hero, featured products, service cards
├── products/
│   ├── page.tsx                        # Product listing — filter by category/brand
│   └── [slug]/page.tsx                 # Product detail — specs, images, AddToCartButtons
├── cart/
│   └── page.tsx                        # Cart summary — items, quantities, totals
├── checkout/
│   ├── page.tsx                        # Checkout form — address, payment method
│   ├── actions.ts                      # placeOrder server action
│   └── confirmation/[orderId]/page.tsx # Order confirmation — thank you, order summary
└── account/
    ├── page.tsx                        # Customer dashboard (requires auth)
    ├── login/page.tsx                  # Customer login form
    ├── register/page.tsx               # Self-registration form
    ├── orders/
    │   ├── page.tsx                    # Order history list
    │   └── [id]/page.tsx               # Order detail
    └── actions.ts                      # registerCustomer server action
```

### Storefront Pages Summary

| Route | What it renders | Auth required |
|---|---|---|
| `/` | Hero banner, animated marquee, featured products grid, service cards | No |
| `/products` | Paginated product list with filters | No |
| `/products/[slug]` | Product detail — images, AI specs, price, Add to Cart | No |
| `/cart` | Cart items, quantity controls, proceed to checkout button | No |
| `/checkout` | Shipping address form, COD / bank transfer selection | No |
| `/checkout/confirmation/[orderId]` | Confirmation page with order ID | No |
| `/account` | Customer dashboard overview | Yes (customer) |
| `/account/login` | Sign-in form for customers | Redirect if logged in |
| `/account/register` | Registration form | Redirect if logged in |
| `/account/orders` | List of customer's past orders | Yes (customer) |
| `/account/orders/[id]` | Single order detail + status | Yes (customer) |

### Cart State

Cart is managed via React Context (`CartProvider`) backed by `localStorage` (key: `cellphonelt_cart`). No server state — the cart exists purely client-side until checkout is submitted.

```
CartProvider (context)
  └── useCart() hook
        ├── addItem(product)
        ├── removeItem(id)
        ├── updateQty(id, qty)
        └── clearCart()
```

---

## 5. Frontend — Admin Dashboard

### Route Group: `app/admin/`

The admin area has its own layout. `AdminLayoutWrapper` conditionally renders the `AdminSidebar` (hidden on the login page). All admin routes except `/admin/login` require authentication with `role === "staff"`.

```
app/admin/
├── layout.tsx                          # AdminLayoutWrapper — sidebar toggle logic
├── AdminLayoutWrapper.tsx              # Client component — hides sidebar on /admin/login
├── login/
│   ├── page.tsx                        # Staff login page
│   ├── LoginForm.tsx                   # Client form component
│   └── actions.ts                      # authenticateStaff server action
├── dashboard/
│   ├── page.tsx                        # Dashboard overview — KPI cards
│   └── DashboardCharts.tsx             # Client charts (Recharts) fetching /api/admin/metrics
├── products/
│   ├── page.tsx                        # Products table with search, status filter
│   ├── actions.ts                      # createProduct, updateProduct, delete, toggleStatus
│   ├── QuickStatusToggle.tsx           # Inline status toggle button
│   ├── new/
│   │   ├── page.tsx
│   │   └── NewProductForm.tsx          # Product creation form
│   ├── [id]/edit/
│   │   ├── page.tsx
│   │   └── EditProductForm.tsx         # Product edit form
│   └── import/
│       ├── page.tsx
│       ├── ImportProductsClient.tsx    # Excel/CSV drag-and-drop import
│       └── actions.ts                  # Bulk insert from parsed rows
├── inventory/
│   ├── page.tsx                        # Stock list — IMEI / quantity view
│   ├── actions.ts
│   ├── new/
│   │   ├── page.tsx
│   │   └── NewInventoryForm.tsx
│   └── [id]/
│       ├── page.tsx
│       └── EditInventoryForm.tsx
├── orders/
│   ├── page.tsx                        # Orders table — filter by status
│   ├── actions.ts                      # updateOrderStatus, updatePaymentStatus
│   ├── SalesDashboardClient.tsx        # Sales summary mini-widget
│   └── [id]/
│       ├── page.tsx
│       └── OrderDetails.tsx            # Order detail + status/payment controls
├── customers/
│   ├── page.tsx
│   ├── actions.ts                      # create, update, delete (blocks if has orders)
│   ├── DeleteCustomerButton.tsx
│   ├── new/
│   │   ├── page.tsx
│   │   └── NewCustomerForm.tsx
│   └── [id]/
│       ├── page.tsx
│       └── EditCustomerForm.tsx
├── repairs/
│   ├── page.tsx                        # Repair tickets — filter by status
│   ├── actions.ts                      # create, updateStatus, delete
│   ├── DeleteRepairButton.tsx
│   ├── new/
│   │   ├── page.tsx
│   │   └── NewRepairForm.tsx
│   └── [ticketId]/
│       ├── page.tsx
│       └── RepairDetails.tsx           # Ticket detail + status workflow
└── trade-ins/
    ├── page.tsx
    ├── actions.ts                      # updateStatus (accepted → auto-creates inventory), updateFinalPrice
    └── [id]/
        ├── page.tsx
        └── TradeInDetails.tsx
```

### Admin Sections Summary

| Section | Key capabilities |
|---|---|
| Dashboard | KPI cards + Recharts line/bar/pie charts from `/api/admin/metrics` |
| Products | CRUD, status toggle (draft/active/archived), bulk Excel import |
| Inventory | Add stock by product, track by IMEI (serialized) or quantity |
| Orders | View all orders, update fulfillment status, update payment status |
| Customers | CRM list, create/edit, delete (blocked if has linked orders/repairs) |
| Repairs | Create tickets, assign technician, 8-stage status workflow |
| Trade-Ins | Review appraisals, set final price, accept → auto-creates inventory item |

---

## 6. Backend — API Routes

Only one REST endpoint exists; all mutations use Server Actions.

### `GET /api/admin/metrics`

**File**: `apps/web/app/api/admin/metrics/route.ts`

Returns aggregate data for the dashboard charts. No authentication check on the route itself (protected by middleware upstream for `/admin`).

**Response shape:**
```json
{
  "revenueData":       [{ "name": "Jan", "total": 150000000, "orders": 12 }],
  "repairData":        [{ "name": "Intake", "value": 5 }],
  "lowStock":          [{ "id": "...", "productId": "...", "quantity": 2 }],
  "totalProductsSold": 43,
  "overallOrdersCount": 27,
  "topSellingData":    [{ "name": "iPhone 15", "quantity": 8 }]
}
```

### `GET|POST /api/auth/[...nextauth]`

NextAuth catch-all route. Handles OAuth callbacks, sign-in/sign-out, and CSRF tokens.

---

## 7. Backend — Server Actions

All mutations use Next.js Server Actions (`"use server"`). The pattern is consistent across modules:

```
1. Parse FormData → Zod schema validation
2. Return { error } on validation failure
3. Execute DB operation via Mongoose models
4. revalidatePath() to bust Next.js cache
5. redirect() to the list/detail page on success
6. Catch DB errors → return { error: message }
```

### Actions by Module

#### Products — `app/admin/products/actions.ts`

| Action | What it does |
|---|---|
| `createProductAction` | Inserts new product row, generates slug from name |
| `updateProductAction` | Updates product fields by ID |
| `deleteProductAction` | Deletes product (hard delete) |
| `updateProductStatusAction` | Toggles status: draft → active → archived |

#### Orders — `app/admin/orders/actions.ts`

| Action | What it does |
|---|---|
| `updateOrderStatusAction` | Changes order fulfillment status |
| `updatePaymentStatusAction` | Changes payment status (pending/paid/refunded) |

#### Repairs — `app/admin/repairs/actions.ts`

| Action | What it does |
|---|---|
| `createRepairAction` | Creates repair ticket with Zod-validated intake data |
| `updateRepairStatusAction` | Advances ticket through 8-stage workflow |
| `deleteRepairAction` | Removes ticket |

#### Trade-Ins — `app/admin/trade-ins/actions.ts`

| Action | What it does |
|---|---|
| `updateTradeInStatusAction` | Updates status; if "accepted" → auto-creates `inventory_items` row |
| `updateFinalPriceAction` | Sets the final agreed trade-in price |

#### Customers — `app/admin/customers/actions.ts`

| Action | What it does |
|---|---|
| `createCustomerAction` | Inserts customer with duplicate-email check |
| `updateCustomerAction` | Updates customer fields |
| `deleteCustomerAction` | Deletes customer; blocked if has orders or repair tickets |

#### Storefront Checkout — `app/(storefront)/checkout/actions.ts`

| Action | What it does |
|---|---|
| `placeOrder` | Validates stock → creates order + order_items → deducts inventory → marks sold if qty ≤ 0 → redirects to confirmation |

#### Storefront Account — `app/(storefront)/account/actions.ts`

| Action | What it does |
|---|---|
| `registerCustomer` | Checks unique email → hashes password (bcrypt 12) → inserts customer → auto signs-in |

#### Admin Login — `app/admin/login/actions.ts`

| Action | What it does |
|---|---|
| `authenticateStaff` | Calls `signIn("staff-credentials", formData)` → redirects to dashboard |

---

## 8. Database Schema

**Engine**: MongoDB · **ODM**: Mongoose 8 · **Migrations**: none (indexes via `pnpm db:indexes`)

```
packages/db/
├── index.ts            # connectDB/disconnectDB, plain(), ilike()/iequals() helpers, all models
├── connection.ts       # Cached Mongoose connection (MONGODB_URI)
├── plugins.ts          # UUID _id + lean plugin that maps _id → id
└── models/
    ├── lookup.ts       # Brand, Category, Staff
    ├── customers.ts    # Customer
    ├── products.ts     # Product
    ├── inventory.ts    # InventoryItem
    ├── orders.ts       # Order, OrderItem
    ├── repair_tickets.ts # RepairTicket, TicketPart
    ├── trade_ins.ts    # TradeInAppraisal
    └── chats.ts        # ChatSession, ChatMessage
```

> **Type mapping.** The tables below keep their original column names — each is now a MongoDB collection with the same
> camelCase fields. `uuid PK` → string UUID `_id` (exposed as `id` on `.lean()` results); `uuid` FKs → string ids;
> `decimal` money columns → `Number` (VND); `jsonb` → `Mixed` / sub-document; `timestamp` → `Date`
> (`createdAt`/`updatedAt` maintained by Mongoose timestamps); Postgres enums → string fields with `enum` validation.
> Unique nullable columns (customer email/phone, product SKU) use partial unique indexes.

### Entity Relationship Overview

```
staff ──────────────────────────────────┐
                                        │ technicianId
brands ──┐                              ▼
         ├──► products ──► inventory_items ◄── trade_in_appraisals ──┐
categories ──┘                                                        │
                                                                      │
customers ──► orders ──► order_items                                  │
    │                                                                 │
    └──► repair_tickets ──► ticket_parts                              │
              │              (itemId → inventory_items)               │
              └──────────────────────────────────────────────────────┘
```

---

### Table: `brands`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | auto-generated |
| `name` | varchar(100) | unique |
| `slug` | varchar(100) | unique |
| `logoUrl` | varchar(500) | nullable |
| `createdAt` | timestamp | |

---

### Table: `categories`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | varchar(100) | |
| `slug` | varchar(100) | unique |
| `parentId` | uuid | nullable — self-referential for sub-categories |
| `sortOrder` | integer | default 0 |
| `createdAt` | timestamp | |

---

### Table: `staff`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `fullName` | varchar(255) | |
| `email` | varchar(255) | unique |
| `passwordHash` | varchar(255) | bcrypt |
| `role` | varchar(50) | `superadmin \| admin \| technician \| sales` |
| `isActive` | boolean | default true |
| `createdAt` | timestamp | |

---

### Table: `products`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | varchar(255) | |
| `slug` | varchar(255) | unique |
| `sku` | varchar(100) | nullable, unique |
| `brandId` | uuid FK → brands | |
| `categoryId` | uuid FK → categories | |
| `basePrice` | numeric(14,0) | VND |
| `minPrice` | numeric(14,0) | nullable — price floor |
| `maxPrice` | numeric(14,0) | nullable — price ceiling |
| `aiSpecs` | jsonb | See shape below |
| `isSerialized` | boolean | true = IMEI tracking; false = quantity tracking |
| `images` | jsonb | `string[]` of Cloudinary URLs |
| `status` | enum | `draft \| active \| archived` |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**`aiSpecs` JSON shape:**
```json
{
  "seoTitle":          "string",
  "metaDescription":   "string",
  "description":       "string",
  "features":          ["string"],
  "specs":             [{ "label": "string", "value": "string" }],
  "tags":              ["string"],
  "compatibleModels":  ["string"],
  "colors":            ["string"],
  "material":          "string (optional)"
}
```

---

### Table: `inventory_items`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `productId` | uuid FK → products | |
| `imeiSerial` | varchar(50) | nullable — only for serialized products |
| `quantity` | integer | default 1 — only meaningful for non-serialized |
| `conditionGrade` | enum | `new \| grade_a \| grade_b \| grade_c` |
| `warehouseLocation` | varchar(100) | nullable |
| `stockStatus` | enum | `available \| reserved \| in_repair \| sold \| returned` |
| `tradeInId` | uuid | nullable — links to originating trade-in |
| `costPrice` | varchar(20) | nullable — for margin calculation |
| `notes` | varchar(500) | nullable |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

### Table: `customers`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `fullName` | varchar(255) | |
| `phoneNumber` | varchar(20) | nullable, unique |
| `email` | varchar(255) | nullable, unique |
| `passwordHash` | varchar(255) | nullable — only set for self-registered customers |
| `emailVerified` | boolean | default false |
| `zaloOaId` | varchar(100) | nullable — for Zalo OA integration (Phase 5) |
| `loyaltyPoints` | integer | default 0 |
| `totalLifetimeSpend` | numeric(16,0) | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

---

### Table: `orders`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `customerId` | uuid FK → customers | onDelete: restrict |
| `status` | enum | `pending \| processing \| shipped \| delivered \| cancelled` |
| `totalAmount` | numeric(16,0) | VND |
| `shippingAddress` | jsonb | See shape below |
| `paymentMethod` | enum | `cod \| bank_transfer` |
| `paymentStatus` | enum | `pending \| paid \| refunded` |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**`shippingAddress` JSON shape:**
```json
{
  "fullName":    "string",
  "phoneNumber": "string",
  "address":     "string",
  "city":        "string",
  "note":        "string (optional)"
}
```

---

### Table: `order_items`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `orderId` | uuid FK → orders | onDelete: cascade |
| `productId` | uuid FK → products | nullable, onDelete: set null |
| `productName` | varchar(255) | snapshot at time of purchase |
| `unitPrice` | numeric(14,0) | snapshot at time of purchase |
| `quantity` | integer | default 1 |
| `subtotal` | numeric(16,0) | |
| `createdAt` | timestamp | |

---

### Table: `repair_tickets`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `customerId` | uuid FK → customers | |
| `technicianId` | uuid FK → staff | nullable |
| `deviceBrand` | varchar(100) | |
| `deviceModel` | varchar(150) | |
| `deviceImei` | varchar(50) | nullable |
| `deviceColor` | varchar(50) | nullable |
| `reportedIssue` | text | min 10 chars |
| `technicianNotes` | text | nullable |
| `intakeCondition` | jsonb | `{ scratches, screenCracks, missingButtons }` |
| `devicePhotos` | jsonb | `string[]` Cloudinary URLs |
| `estimatedCost` | numeric(12,0) | nullable |
| `finalCost` | numeric(12,0) | nullable |
| `status` | enum | 8-stage workflow — see below |
| `priority` | enum | `normal \| urgent \| vip` |
| `appointmentAt` | timestamp | nullable |
| `completedAt` | timestamp | nullable |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**Repair status workflow:**
```
intake → diagnosing → awaiting_parts → in_progress → quality_check → done → delivered
                                                                           ↘ cancelled (any stage)
```

---

### Table: `ticket_parts`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `ticketId` | uuid FK → repair_tickets | onDelete: cascade |
| `itemId` | uuid | references `inventory_items.id` |
| `quantity` | integer | default 1 |
| `warrantyDays` | integer | default 90 |
| `costApplied` | numeric(12,0) | nullable |
| `createdAt` | timestamp | |

---

### Table: `trade_in_appraisals`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `customerId` | uuid FK → customers | |
| `deviceBrand` | varchar(100) | |
| `deviceModel` | varchar(150) | |
| `deviceStorage` | varchar(50) | nullable |
| `deviceImei` | varchar(50) | nullable |
| `deviceColor` | varchar(50) | nullable |
| `physicalCondition` | jsonb | Screen, body, battery, accessories — see shape |
| `functionalStatus` | jsonb | Power, touch, speakers, sensors — see shape |
| `aiOfferedPrice` | numeric(12,0) | nullable — instant AI estimate |
| `finalAgreedPrice` | numeric(12,0) | nullable — set after in-person inspection |
| `status` | enum | `pending → inspecting → offer_sent → accepted → rejected \| cancelled` |
| `appointmentAt` | timestamp | nullable |
| `acceptedAt` | timestamp | nullable |
| `notes` | varchar(500) | nullable |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

**`physicalCondition` JSON shape:**
```json
{
  "screenCondition": "perfect|minor_scratches|cracked|shattered",
  "bodyCondition":   "perfect|minor_dents|heavy_dents",
  "cameraWorking":   true,
  "batteryHealth":   85,
  "hasOriginalBox":  false,
  "hasCharger":      true,
  "hasEarphones":    false
}
```

**`functionalStatus` JSON shape:**
```json
{
  "powersOn":       true,
  "touchscreenOk":  true,
  "speakerOk":      true,
  "micOk":          true,
  "wifiOk":         true,
  "bluetoothOk":    true,
  "simSlotOk":      true,
  "faceIdOk":       true,
  "fingerprintOk":  false
}
```

---

### Indexes

Indexes are declared on the Mongoose schemas and created with `pnpm db:indexes` (also run by `pnpm db:seed`).

---

## 9. Authentication Flow

### Two Provider System

NextAuth v5 is configured with **two credentials providers** in `lib/auth.config.ts`:

```
Provider ID               Who it authenticates       Table queried
────────────────────────  ─────────────────────────  ─────────────
staff-credentials         Admin staff                staff
customer-credentials      B2C customers              customers
```

Both providers share the same pattern:
1. Look up user by email
2. Compare password with `bcryptjs.compare(plain, hash)`
3. Check active status (`isActive` for staff, `passwordHash` non-null for customers)
4. Return `{ id, name, email, role }` or `null`

### JWT Callbacks

```typescript
// jwt callback — runs on login and every subsequent request
jwt({ token, user }) {
  if (user) {
    token.role = user.role;   // "staff" | "customer"
    token.id   = user.id;
  }
  return token;
}

// session callback — shapes what client code sees via useSession()
session({ session, token }) {
  session.user.role = token.role;
  session.user.id   = token.id;
  return session;
}
```

### Route Protection (Middleware)

**File**: `apps/web/middleware.ts`  
**Matcher**: `/admin/:path*`, `/account/:path*`

```
Request path          Logged in?  Role       Action
────────────────────  ──────────  ─────────  ─────────────────────────────────
/admin/login          Yes         staff      Redirect → /admin/dashboard
/admin/*              Yes         staff      Allow
/admin/*              No / other  any        Redirect → /admin/login

/account/login        Yes         customer   Redirect → /account
/account/register     Yes         customer   Redirect → /account
/account/*            Yes         customer   Allow
/account/*            No / other  any        Redirect → /account/login

/ (storefront)        any         any        Always allow (public)
```

### Session Usage in Server Components

```typescript
import { auth } from "@/lib/auth";

// Any server component or server action can call:
const session = await auth();
if (!session) redirect("/admin/login");
```

---

## 10. Key Data Flows

### 10.1 Customer Purchase Flow

```
Customer adds items → CartProvider (localStorage)
                              ↓
                   /checkout — fills address form
                              ↓
                   placeOrder() server action
                     ├── Validate stock availability
                     ├── Order.create(...)
                     ├── OrderItem.insertMany(...) for the cart items
                     ├── InventoryItem.updateOne(...) — deduct quantity
                     │     └── if quantity ≤ 0 → set stockStatus = "sold"
                     └── redirect(/checkout/confirmation/[orderId])
                              ↓
                   CartProvider.clearCart() on confirmation page
```

### 10.2 Customer Registration Flow

```
/account/register form submit
        ↓
registerCustomer() server action
  ├── Check email uniqueness in customers table
  ├── bcryptjs.hash(password, 12)
  ├── Customer.create(...) — with passwordHash
  └── signIn("customer-credentials") — auto login
        ↓
  redirect(/account)
```

### 10.3 Admin Staff Login Flow

```
/admin/login form submit
        ↓
authenticateStaff() server action
  └── signIn("staff-credentials", { email, password })
        ↓
NextAuth authorize()
  ├── Staff.findOne({ email }).lean()
  ├── bcryptjs.compare(password, passwordHash)
  ├── check isActive === true
  └── return { id, name, email, role: "staff" }
        ↓
JWT written → cookie set → redirect(/admin/dashboard)
```

### 10.4 Trade-In Acceptance Flow

```
Admin reviews trade-in appraisal
        ↓
updateTradeInStatusAction(id, "accepted")
  ├── TradeInAppraisal.updateOne({ _id }, { $set: { status: "accepted", acceptedAt: now } })
  ├── Find matching product by deviceBrand + deviceModel (slug lookup)
  └── InventoryItem.create({
        productId:      matched product (or null if no match)
        tradeInId:      appraisal.id
        conditionGrade: "grade_b"       ← default assumption
        stockStatus:    "available"
        costPrice:      finalAgreedPrice ?? aiOfferedPrice
      }
```

### 10.5 Repair Ticket Workflow

```
Create ticket (intake)
  └── status: "intake"
         ↓ updateRepairStatusAction
     "diagnosing"
         ↓
     "awaiting_parts"   ← if parts need to be ordered
         ↓
     "in_progress"      ← technician working
         ↓
     "quality_check"    ← QA pass
         ↓
     "done"             ← ready for pickup
         ↓
     "delivered"        ← customer collected
         
     ↘ "cancelled"      ← available at any stage
```

### 10.6 Admin Dashboard Data Flow

```
DashboardCharts.tsx (client component)
  └── useEffect → fetch("/api/admin/metrics")
                      ↓
              GET /api/admin/metrics
                ├── Monthly revenue aggregation from orders + order_items
                ├── Repair ticket counts by status
                ├── Low stock inventory items (quantity ≤ 5)
                ├── Total products sold
                ├── Total orders count
                └── Top selling products by quantity
                      ↓
              Recharts renders:
                ├── LineChart  — monthly revenue trend
                ├── BarChart   — top selling products
                └── PieChart   — repair status breakdown
```

### 10.7 Product Import Flow

```
/admin/products/import
  └── ImportProductsClient.tsx (drag-and-drop)
        ↓
  xlsx.read(file) → parse rows → validate with Zod
        ↓
  importProductsAction(rows[])
    ├── Loop each row
    ├── Find/create brand slug
    ├── Find category by name
    ├── Product.create(...) for each valid row
    └── revalidatePath("/admin/products")
```

---

## 11. Component Architecture

### Shared Components (`components/shared/`)

| Component | Purpose |
|---|---|
| `Navbar` | Customer-facing header — logo, nav links, cart icon with count |
| `Footer` | Site footer — contact info, links, social |
| `PageTransition` | Framer Motion wrapper for page entry/exit animations |

### Storefront Components (`components/storefront/`)

| Component | Purpose |
|---|---|
| `CartProvider` | React Context + localStorage — provides `useCart()` |
| `ProductCard` | Product tile — image, name, brand, price, add to cart |
| `ServiceCards` | Feature/service highlight cards on homepage |
| `AddToCartButtons` | Quantity selector + Add to Cart on product detail page |
| `ScrollReveal` | Framer Motion wrapper that animates children on scroll into view |
| `FloatingElement` | Decorative floating phone mockup for hero section |
| `InfiniteMarquee` | Auto-scrolling brand/partner logo strip |

### Admin Components (`components/admin/`)

| Component | Purpose |
|---|---|
| `AdminSidebar` | Left nav — links to all admin sections, active state highlighting |
| `DataTable` | Generic sortable/filterable table used across admin list pages |
| `StatusBadge` | Color-coded pill badge for order/repair/trade-in statuses |

### Admin Page-Level Components (co-located in `app/admin/`)

These are larger form/detail components kept next to their route pages:

| Component | Purpose |
|---|---|
| `NewProductForm` / `EditProductForm` | Product create/edit with image URLs, specs, pricing |
| `NewInventoryForm` / `EditInventoryForm` | Stock entry with IMEI or quantity input |
| `OrderDetails` | Order header + items table + status controls |
| `NewRepairForm` | Ticket intake with device info, issue description, priority |
| `RepairDetails` | Full ticket view with status stepper + part tracking |
| `TradeInDetails` | Appraisal view with condition inputs + pricing controls |
| `DashboardCharts` | Client component fetching and rendering Recharts |
| `LoginForm` | Staff credential login form |
| `AdminLayoutWrapper` | Determines whether sidebar renders |

---

## 12. Configuration & Build

### Turborepo Pipeline (`turbo.json`)

```json
{
  "build":       { "dependsOn": ["^build"] },   // packages/db builds before apps/web
  "dev":         { "cache": false, "persistent": true }
}
```

### Root Scripts (`package.json`)

| Script | What it runs |
|---|---|
| `pnpm dev` | `turbo dev` — starts Next.js dev server (Turbopack) |
| `pnpm build` | `turbo build` — production build of all packages |
| `pnpm db:indexes` | Create/update MongoDB indexes for every model |
| `pnpm db:seed` | Seed Super Admin (`admin@cellphonelt.com` / `password123`), brands, categories, sample products |

### Environment Variables (`.env`)

| Variable | Used by | Purpose |
|---|---|---|
| `MONGODB_URI` | `packages/db` | MongoDB connection string (default `mongodb://127.0.0.1:27017/cellphonelt`) |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | `apps/web/lib/auth.ts` | JWT signing secret |
| `OPENAI_API_KEY` | `app/api/chat/*` | Admin Copilot + customer chatbot |
| `RESEND_API_KEY` | `lib/email.ts` | Order emails (skipped when unset) |
| `NEXTAUTH_URL` | NextAuth | Canonical app URL |
| `CLOUDINARY_CLOUD_NAME` | Image upload (Phase 2) | Cloudinary account |
| `CLOUDINARY_API_KEY` | Image upload (Phase 2) | |
| `CLOUDINARY_API_SECRET` | Image upload (Phase 2) | |
| `GOOGLE_CLOUD_VISION_KEY` | AI pipeline (Phase 2) | Vision API |
| `GEMINI_API_KEY` | AI pipeline (Phase 2) | Gemini LLM |

### Next.js Config (`next.config.ts`)

- Loads the repo-root `.env` (Next.js otherwise only reads `apps/web/.env*`)
- `serverExternalPackages: ["mongoose"]` — keep the MongoDB driver server-only
- Image domains: `res.cloudinary.com`, `lh3.googleusercontent.com`
- Turbopack enabled for faster hot reload in development

---

## 13. Phased Delivery Roadmap

| Phase | Status | Scope |
|---|---|---|
| 1 | ✅ Done | Foundation: monorepo, DB schema, storefront shell, admin CRUD, auth |
| 2 | 🔄 In Progress | AI Product Pipeline: Cloud Vision + Gemini JSON output + draft review UI |
| 3 | ⏳ Pending | Repair Service: booking portal, technician app, IMEI inventory integration |
| 4 | ⏳ Pending | Trade-In Wizard: self-service form, AI instant pricing, appraisal session |
| 5 | ⏳ Pending | Zalo OA + ZNS: order notifications, repair updates, SMS failover |
| 6 | ⏳ Pending | BI Dashboard + SEO: Schema.org markup, sitemap.xml, local SEO |
| 7 | ⏳ Pending | Polish: Core Web Vitals, CI/CD pipeline, security hardening |

---

## Quick Reference: Where to Find Things

| "I want to change..." | File |
|---|---|
| How orders are created | `apps/web/app/(storefront)/checkout/actions.ts` |
| Admin route protection | `apps/web/middleware.ts` |
| Auth providers | `apps/web/lib/auth.config.ts` |
| Database models | `packages/db/models/*.ts` |
| Dashboard chart data | `apps/web/app/api/admin/metrics/route.ts` |
| Cart state | `apps/web/components/storefront/CartProvider.tsx` |
| Product validation schema | `packages/shared-types/product.schema.ts` |
| Trade-in acceptance logic | `apps/web/app/admin/trade-ins/actions.ts` |
| Repair status workflow | `apps/web/app/admin/repairs/actions.ts` |
| Bulk product import | `apps/web/app/admin/products/import/` |
| Admin sidebar navigation | `apps/web/components/admin/AdminSidebar.tsx` |
| DB connection config | `packages/db/connection.ts` |
