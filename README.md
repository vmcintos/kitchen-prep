# Kitchen Prep

Household food & inventory management for coordinating meals, inventory, and shopping.

## What's Built (Phase 1)

- **Household login** — one shared password for the whole household
- **Inventory tracking** — add items by category/location, toggle in/out of stock, search and filter
- **Recipe storage** — save recipes with ingredients, equipment, complexity level, and toddler notes
- **Household profiles** — track allergies, dislikes, cook skill levels and availability
- **Dashboard** — quick stats and this week's meal plan preview

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Neon (free tier) |
| ORM | Prisma |
| Hosting | Vercel (free tier) |

---

## Setup Instructions

### Step 1: Create a Neon Database (free)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (e.g., "kitchen-prep")
3. From the **Connection Details** panel, copy:
   - **Pooled connection string** → `DATABASE_URL`
   - **Direct connection string** → `DIRECT_URL`
   - The direct URL is the same but without `?pgbouncer=true`

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Neon connection strings:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Run Database Migration

```bash
npm run db:push
```

This creates all the tables in Neon.

### Step 4: Seed Sample Data (optional)

```bash
npm run db:seed
```

This creates a household called **"Our Kitchen"** with password **`kitchen2024`** and sample members (Katrina, Kathy, Robin) plus a few inventory items and recipes to start.

### Step 5: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npx vercel --prod
```

When prompted, add environment variables or use Vercel dashboard afterward.

### Option B: GitHub → Vercel (recommended)

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. In **Environment Variables**, add:
   - `DATABASE_URL` — pooled Neon connection string
   - `DIRECT_URL` — direct Neon connection string
   - `NEXT_PUBLIC_APP_URL` — your Vercel URL (e.g., `https://kitchen-prep.vercel.app`)
4. Deploy

Vercel auto-detects Next.js and runs `prisma generate && next build`.

### After Deploying

Run the migration against your production database once:

```bash
DATABASE_URL="your-production-url" DIRECT_URL="your-direct-url" npm run db:push
```

Or run it from the Neon SQL editor.

---

## Usage

### First Visit

1. Go to your app URL
2. Click **"Create Household"** and set a household name + password
3. Share the name + password with family members so they can log in from any device

### Adding Household Members

1. Go to **Profiles**
2. Click **+ Add Member**
3. Enter name, allergies, dislikes, and whether they cook
4. If they cook, set their skill level (1=heat & eat, 2=simple prep, 3=from scratch) and available days

### Tracking Inventory

1. Go to **Inventory**
2. Click **+ Add Item** to add pantry/fridge/freezer items
3. Check/uncheck the green box to toggle in-stock status
4. Filter by category, location, or stock status

### Adding Recipes

1. Go to **Recipes**
2. Click **+ Add Recipe**
3. Fill in complexity level, ingredients, and instructions
4. Click a recipe card to view details or edit

---

## Upcoming Phases

- **Phase 2** — Weekly meal planning calendar, assign cooks per meal
- **Phase 3** — Par list system, recipe suggestions from inventory
- **Phase 4** — Auto-generate shopping lists from meal plans
- **Phase 5** — Barcode scanning, seasonal suggestions
- **Phase 6** — Multi-user login per household member
