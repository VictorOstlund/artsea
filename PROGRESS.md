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
- ~436 real scraped events across 9 active venues
- Home page: chronological event feed with responsive 3-column grid
- Event detail page (/events/[slug]) with dynamic metadata
- Venue page (/venues/[slug]) with event listings
- About page with attribution
- FilterBar: event type, date range, area, venue (combinable, URL-based)
- Full-text search using Postgres ts_vector + plainto_tsquery
- Scrapers (9 venues):
  - Barbican Centre (66 events) — Drupal Views .views-row + data-day + pagination
  - V&A Museum (150 events) — dataLayer extraction enriched with HTML images
  - Tate Modern (15 events) — static HTML cards
  - National Gallery (134 events) — exhibitions HTML + AJAX events endpoint (/umbraco/Surface/Events/EventsCards)
  - Design Museum (8 events) — static HTML, CSS background-image in figure style
  - Whitechapel Gallery (11 events) — WordPress exhibitions + events pages
  - Somerset House (12 events) — embedded GraphQL JSON in script tags
  - Serpentine Galleries (14 events) — WordPress with link[rel=next] pagination
  - Saatchi Gallery (20 events) — WordPress REST API (/wp-json/wp/v2/exhibitions)
- next/image with remotePatterns for all venue CDNs (proxies through Vercel)
- GitHub Actions workflow: daily cron at 3 AM UTC
- Revalidation API route for cache busting after scrape
- 24 tests passing (EventCard rendering, date formatting, scraper utils)
- Pre-commit hooks: Husky + lint-staged (ESLint + Prettier)
- Clean minimal design (gallery aesthetic)
- Deployed on Vercel (auto-deploy from GitHub)
- GitHub repo with gh CLI authenticated

## Blocked Venues (Can't Scrape with Cheerio)

### Southbank Centre / Hayward Gallery
- **Problem**: Cloudflare JS challenge blocks all automated access (403)
- **Options**:
  1. **Skiddle API** (best) — free key from https://www.skiddle.com/api/join.php, covers Southbank + Hayward
  2. **Playwright headless browser** — can solve JS challenges, but heavy dependency for GitHub Actions
  3. **Manual data entry** — small number of exhibitions, could maintain by hand

### Royal Academy of Arts
- **Problem**: Cloudflare JS challenge on all endpoints including /api/ and /graphql (403)
- **Options**:
  1. **Playwright headless browser** — only option to solve Cloudflare challenges
  2. **TimeOut/external aggregator** — scrape event data from listing sites instead
  3. **Manual data entry** — small number of major exhibitions

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
- Saatchi Gallery HTML is JS-rendered but WP REST API is wide open (/wp-json/wp/v2/exhibitions)
- Royal Academy is fully Cloudflare-protected — even /api/ and /graphql endpoints return 403
- WP REST API `title.rendered` contains HTML entities (&#8211; etc.) — decode after stripping tags
