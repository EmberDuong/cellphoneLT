# cellphoneLT 📱

**cellphoneLT** is an AI-powered e-commerce and multi-service management platform tailored for phone accessory stores, repair ticketing, and automated used-device trade-ins. 

The system leverages Next.js 15, MongoDB (via Mongoose), BullMQ, and Google Cloud Vertex AI / Gemini to completely automate SEO-friendly product cataloging and operations.

---

## 🛠 Tech Stack
- **Frontend & App Framework:** Next.js 15 (App Router), React 19
- **Design System:** Tailwind CSS v4 + Custom Dark Mode UI Components
- **Language:** TypeScript
- **Database:** MongoDB 7+
- **ODM:** Mongoose 8
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
- **MongoDB** (a local instance on `mongodb://127.0.0.1:27017`, or a MongoDB Atlas URI)
- **Redis** *(optional)* — only needed for the AI product-generation worker (BullMQ)

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
Ensure `MONGODB_URI` and `AUTH_SECRET` are set (generate a secret with `npx auth secret` or any random string). `OPENAI_API_KEY` enables the chatbots, `REDIS_URL` + Google/Cloudinary keys enable the AI worker. The single root `.env` is loaded by both Next.js and the scripts.

### 4. Start Local Services
Ensure MongoDB is running (on Windows it usually runs as the `MongoDB` service). Start Redis only if you want to use the AI worker.

### 5. Setup Database & Seed Data
MongoDB needs no migrations — collections are created on first write. Create the indexes and seed the default Super Admin, brands, categories and sample products:
```bash
pnpm db:indexes
```
```bash
pnpm db:seed
```
Both commands are idempotent and safe to re-run.

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
│   ├── db/                    # Mongoose models, MongoDB connection, seed scripts
│   ├── shared-types/          # Zod schema definitions (Product, Form validation)
│   └── ai-pipeline/           # Cloudinary + Google Vision + Gemini product pipeline
├── apps/worker/               # BullMQ worker that runs the AI pipeline
├── pnpm-workspace.yaml        # Workspaces definition
└── turbo.json                 # Turbo pipeline cache config
```
