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
- ~445 real scraped events across 12 active venues
- Home page: chronological event feed with responsive 3-column grid
- Event detail page (/events/[slug]) with dynamic metadata
- Venue page (/venues/[slug]) with event listings
- About page with attribution
- FilterBar: event type, date range, area, venue (combinable, URL-based)
- Full-text search using Postgres ts_vector + plainto_tsquery
- Scrapers (12 venues):
  - Barbican Centre (66 events) — Drupal Views .views-row + data-day + pagination
  - V&A Museum (150 events) — dataLayer extraction enriched with HTML images
  - Tate Modern (15 events) — static HTML cards
  - National Gallery (134 events) — exhibitions HTML + AJAX events endpoint (/umbraco/Surface/Events/EventsCards)
  - Design Museum (8 events) — static HTML, CSS background-image in figure style
  - Whitechapel Gallery (11 events) — WordPress exhibitions + events pages
  - Somerset House (12 events) — embedded GraphQL JSON in script tags
  - Serpentine Galleries (14 events) — WordPress with link[rel=next] pagination
  - Saatchi Gallery (20 events) — WordPress REST API (/wp-json/wp/v2/exhibitions)
  - Hayward Gallery (2 events) — via TimeOut London (Cloudflare blocks direct access)
  - Royal Academy (3 events) — via TimeOut London (Cloudflare blocks direct access)
  - Southbank Centre (4 events) — via TimeOut London (Cloudflare blocks direct access)
- Sold-out status: isSoldOut boolean column, V&A detects "sold out" / "fully booked"
- EventCard shows "Sold Out" badge with reduced opacity + grayscale
- next/image with remotePatterns for all venue CDNs (proxies through Vercel)
- GitHub Actions workflow: daily cron at 3 AM UTC
- Revalidation API route for cache busting after scrape
- 27 tests passing (EventCard rendering, date formatting, scraper utils, sold-out behavior)
- Pre-commit hooks: Husky + lint-staged (ESLint + Prettier)
- Clean minimal design (gallery aesthetic)
- Deployed on Vercel (auto-deploy from GitHub)
- GitHub repo with gh CLI authenticated

## Previously Blocked Venues (Now Resolved via TimeOut)
- Southbank Centre, Hayward Gallery, Royal Academy — all Cloudflare-protected
- Solved by scraping TimeOut London venue pages (legal, public data)
- TimeOut uses stable `data-testid` selectors and `<time>` elements with ISO dates

## Upcoming Features (Deferred)
- **User/login functionality** — authentication system for personalized features
- **Art marketplace** — listings-only MVP (similar to Facebook Marketplace for art, no liability)

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
- TimeOut London uses `data-testid` attributes (stable vs hashed CSS classes) for scraping
- TimeOut `<time>` elements have ISO 8601 dateTime attributes — reliable date extraction
