# ArtSea - Progress

## Status: MVP Deployed & Live

## Live URL
https://artsea-london.vercel.app

## GitHub
https://github.com/VictorOstlund/artsea

## Completed
- Next.js 16 project with TypeScript, Tailwind CSS, App Router
- Neon Postgres database (eu-west-2 London) with Drizzle ORM
- Database schema: venues + events tables with full-text search GIN index
- 228 real scraped events across 3 venues (Barbican, V&A, Tate Modern)
- Home page: chronological event feed with responsive 3-column grid
- Event detail page (/events/[slug]) with dynamic metadata
- Venue page (/venues/[slug]) with event listings
- About page with attribution
- FilterBar: event type, date range, area, venue (combinable, URL-based)
- Full-text search using Postgres ts_vector + plainto_tsquery
- Scrapers: Barbican (66 events), V&A (150 events), Tate Modern (15 events)
- V&A scraper: dataLayer extraction enriched with HTML images
- Barbican scraper: Drupal Views .views-row + data-day + pagination
- next/image with remotePatterns for all venue CDNs (proxies through Vercel)
- GitHub Actions workflow: daily cron at 3 AM UTC
- Revalidation API route for cache busting after scrape
- 24 tests passing (EventCard rendering, date formatting, scraper utils)
- Pre-commit hooks: Husky + lint-staged (ESLint + Prettier)
- Clean minimal design (gallery aesthetic)
- Deployed on Vercel (auto-deploy from GitHub)
- GitHub repo with gh CLI authenticated

## Not Working
- Southbank Centre: Cloudflare protection blocks all automated access
  - Best option: Skiddle API (free key) — https://www.skiddle.com/api/join.php
  - Alternative: Playwright headless browser (heavy dependency)

## Architecture
```
Frontend: Next.js 16 (App Router) on Vercel
Database: Neon Postgres (512MB free tier, eu-west-2 London)
Scraping: Cheerio (per-venue modules) via GitHub Actions
Images: next/image with Vercel proxy (remotePatterns)
Testing: Vitest + Testing Library
Styling: Tailwind CSS
CI/CD: GitHub Actions (daily scrape) + Vercel (auto-deploy)
```

## GitHub Actions Secrets Needed
- `DATABASE_URL` — Neon connection string
- `VERCEL_DEPLOY_URL` — https://artsea-london.vercel.app
- `VERCEL_REVALIDATE_TOKEN` — a1b2c3d4e5f6

## Learnings
- Drizzle Kit needs dotenv/config import since it doesn't read .env.local
- Neon serverless driver requires tagged template syntax for SQL
- @testing-library/react needs explicit cleanup() in vitest
- Next.js 16 uses Promise-based params in page components
- Barbican uses Drupal Views with data-day attribute on parent .views-row (no date inside card)
- V&A dataLayer has event data but no images — must enrich from HTML cards
- Southbank Centre is fully behind Cloudflare JS challenge — 403 on all endpoints
- next/image proxies through Vercel, solving venue hotlinking blocks
- Vercel CLI scope issues in non-interactive environments — use web dashboard instead
- GitHub OAuth needs `workflow` scope to push .github/workflows files
