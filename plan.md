# cellphoneLT — Project Plan & Structure

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | API Routes (Next.js) + Node.js worker |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 |
| Auth | NextAuth.js v5 |
| AI – Vision | Google Cloud Vision API |
| AI – LLM | Gemini 1.5 Pro (Structured JSON Output) |
| Image CDN | Cloudinary (background removal + delivery) |
| Messaging | Zalo OA + ZNS API |
| Queue | BullMQ + Redis |
| BI Charts | Recharts |
| Monorepo | pnpm workspaces |

---

## Phased Delivery

| Phase | Scope | Weeks |
|---|---|---|
| 1 | Foundation: monorepo, DB schema, storefront, admin CRUD | 1–4 |
| 2 | AI Product Pipeline: Vision + Gemini + draft review UI | 5–7 |
| 3 | Repair Service Module: booking, ticketing, IMEI inventory | 8–10 |
| 4 | Trade-In Valuation: wizard, pricing matrix, appraisal session | 11–13 |
| 5 | Zalo OA + ZNS integration, SMS failover | 14–15 |
| 6 | BI Dashboard + SEO (Schema.org, sitemap, local SEO) | 16–18 |
| 7 | Polish: Core Web Vitals, Docker, CI/CD, security | 19–20 |

---

## Project Folder Structure

```
cellphoneLT/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── .env.example
├── docker-compose.yml
│
├── packages/
│   ├── db/
│   │   ├── schema/
│   │   │   ├── products.ts
│   │   │   ├── inventory.ts
│   │   │   ├── repair_tickets.ts
│   │   │   ├── trade_ins.ts
│   │   │   ├── customers.ts
│   │   │   └── ticket_parts.ts
│   │   ├── migrations/
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── shared-types/
│   │   ├── product.schema.ts
│   │   ├── repair.schema.ts
│   │   ├── trade-in.schema.ts
│   │   └── package.json
│   │
│   └── ai-pipeline/
│       ├── vision.ts
│       ├── llm.ts
│       ├── image.ts
│       ├── queue.ts
│       └── package.json
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (storefront)/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   ├── repair/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── track/[ticketId]/page.tsx
│   │   │   │   ├── trade-in/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (admin)/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── products/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── inventory/page.tsx
│   │   │   │   ├── repairs/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [ticketId]/page.tsx
│   │   │   │   ├── trade-ins/page.tsx
│   │   │   │   ├── customers/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── api/
│   │   │   │   ├── products/route.ts
│   │   │   │   ├── repairs/route.ts
│   │   │   │   ├── trade-ins/route.ts
│   │   │   │   ├── ai/generate-product/route.ts
│   │   │   │   ├── zalo/webhook/route.ts
│   │   │   │   └── auth/[...nextauth]/route.ts
│   │   │   │
│   │   │   ├── sitemap.ts
│   │   │   └── robots.ts
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── storefront/
│   │   │   ├── admin/
│   │   │   └── shared/
│   │   │
│   │   ├── lib/
│   │   │   ├── auth.ts
│   │   │   ├── zalo.ts
│   │   │   └── schema-org.ts
│   │   │
│   │   ├── public/
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── worker/
│       ├── processors/ai-product.processor.ts
│       ├── index.ts
│       └── package.json
│
├── description.md
├── plan.md                  ← this file
└── README.md
```

---

## Core Database Entities

| Entity | Key Fields |
|---|---|
| `products` | id, name, slug, sku, brand_id, category_id, base_price, ai_specs (JSONB), is_serialized, status |
| `inventory_items` | id, product_id, imei_serial, quantity, condition_grade, stock_status, trade_in_id |
| `repair_tickets` | id, customer_id, device_model, reported_issue, technician_id, status, estimated_cost, device_photos |
| `trade_in_appraisals` | id, customer_id, device_brand, device_model, physical_condition (JSONB), ai_offered_price, status |
| `customers` | id, full_name, phone_number, email, zalo_oa_id, loyalty_points, total_lifetime_spend |
| `ticket_parts` | id, ticket_id, item_id, quantity, warranty_days, cost_applied |

---

## AI Product Pipeline

1. Admin uploads image + enters {brand, price}
2. API route enqueues job to BullMQ
3. Worker: Cloudinary removes background
4. Worker: Google Cloud Vision labels image + OCR
5. Worker: Gemini 1.5 Pro generates structured JSON (title, description, SEO, specs)
6. Product saved as **draft** in DB
7. Admin reviews draft → edits if needed → publishes

---

## KPI Dashboard Metrics

| KPI | Formula |
|---|---|
| Average Order Value | Revenue / Transactions |
| Gross Margin % | (Revenue - COGS) / Revenue * 100 |
| Technician Utilization | Billable Hours / Paid Hours |
| Inventory Turnover | COGS / Avg Inventory Value |
| Repeat Customer Rate | Returning Customers / Total Customers * 100 |