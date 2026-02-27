# ArtSea

Art event aggregator for the Sea (Thessaloniki). Scrapes exhibition and event listings from local galleries, museums, and cultural venues, and displays them in a clean Next.js web app.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Database:** Neon (serverless Postgres) via Drizzle ORM
- **Scrapers:** Cheerio + tsx
- **CI/CD:** GitHub Actions + Vercel

## Setup

```bash
# Install dependencies
npm ci

# Set up environment
cp .env.example .env   # then fill in DATABASE_URL

# Run database migrations
npx drizzle-kit push

# Start dev server
npm run dev
```

## Running the Scraper Locally

```bash
# Requires DATABASE_URL in .env
npm run scrape
```

This fetches current exhibitions/events from all configured venues and upserts them into the database.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run scrape` | Run all venue scrapers |
| `npm run seed` | Seed the database |
| `npm test` | Run tests |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |

## GitHub Actions

### Daily Scrape (`.github/workflows/scrape.yml`)

Runs daily at 02:00 UTC. Can also be triggered manually via `workflow_dispatch`.

### Deploy (`.github/workflows/deploy.yml`)

Deploys to Vercel on push to `main`.

## Required GitHub Secrets

| Secret | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel organization/team ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `VERCEL_REVALIDATE_URL` | *(Optional)* URL to POST to after scrape for ISR revalidation |
