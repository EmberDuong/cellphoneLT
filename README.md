# cellphoneLT 📱

**cellphoneLT** is an AI-powered e-commerce and multi-service management platform tailored for phone accessory stores, repair ticketing, and automated used-device trade-ins. 

The system leverages Next.js 15, PostgreSQL (via Drizzle ORM), BullMQ, and Google Cloud Vertex AI / Gemini to completely automate SEO-friendly product cataloging and operations.

---

## 🛠 Tech Stack
- **Frontend & App Framework:** Next.js 15 (App Router), React 19
- **Design System:** Tailwind CSS v4 + Custom Dark Mode UI Components
- **Language:** TypeScript
- **Database:** PostgreSQL 16
- **ORM:** Drizzle ORM
- **Authentication:** NextAuth.js v5 (beta) + bcryptjs
- **Background Jobs:** BullMQ + Redis 7
- **Monorepo Manager:** pnpm workspaces + Turborepo

---

## 🚀 How to Run Locally

Follow these steps to set up the development environment from scratch.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v20 or higher recommended)
- **pnpm** (install via `npm install -g pnpm`)
- **PostgreSQL** (Ensure a local instance is running)
- **Redis** (Ensure a local instance is running for background jobs)

### 2. Install Dependencies
Open your terminal at the root of the project (`cellphoneLT/`) and run:
```bash
pnpm install
```

### 3. Environment Variables
Create a `.env` file at the root path based on the example structure. 
You can quickly copy the template if you haven't already:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL`, `REDIS_URL`, and `AUTH_SECRET` are present. (The defaults in `.env.example` are fine for local development).

### 4. Start Local Services
Ensure your local PostgreSQL database and Redis cache are running. Update your `.env` file to point to your local instances.

### 5. Setup Database & Seed Data
Initialize the database structure and create the default Super Admin user.
Run this single command from your terminal:
```bash
pnpm --filter @cellphonelt/db db:migrate && npx tsx --env-file=.env packages/db/scripts/seed.ts
```
*(If on Windows and the `&&` command rejects, run them separately):*
```powershell
pnpm --filter @cellphonelt/db db:migrate
npx tsx --env-file=.env packages/db/scripts/seed.ts
```

### 6. Start the Next.js Server
Spins up the web frontend, storefront, and admin panel with Turbopack enabled:
```bash
pnpm --filter @cellphonelt/web dev
```

---

## 🔑 Default Login Credentials

Access the storefront normally at [http://localhost:3000](http://localhost:3000).

To access the highly secure **Admin Dashboard**, head to [http://localhost:3000/login](http://localhost:3000/login).
Use the seeded credentials:
- **Email:** `admin@cellphonelt.com`
- **Mật khẩu:** `password123`

*(The NextAuth Edge Middleware protects all routes starting with `/admin`)*

---

## 📂 Monorepo Structure

```text
cellphoneLT/
├── apps/
│   └── web/                   # Main Next.js 15 Website (Storefront + Admin)
├── packages/
│   ├── db/                    # Drizzle ORM Schema, Postgres Client & Migrations
│   ├── shared-types/          # Zod schema definitions (Product, Form validation)
│   └── ai-pipeline/           # (Pending) BullMQ AI Worker Node.js logic
├── pnpm-workspace.yaml        # Workspaces definition
└── turbo.json                 # Turbo pipeline cache config
```
