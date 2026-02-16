# ArtSea - Progress

## Status: MVP Feature Complete

## Completed
- Next.js 15 project with TypeScript, Tailwind CSS, App Router
- Neon Postgres database (eu-west-2 London) with Drizzle ORM
- Database schema: venues + events tables with full-text search GIN index
- Seed data: 4 venues, 12 sample events
- Home page: chronological event feed with responsive 3-column grid
- Event detail page (/events/[slug]) with dynamic metadata
- Venue page (/venues/[slug]) with event listings
- About page with attribution
- FilterBar: event type, date range, area, venue (combinable, URL-based)
- Full-text search using Postgres ts_vector + plainto_tsquery
- Scrapers: Barbican, V&A, Tate Modern, Southbank Centre (Cheerio-based)
- GitHub Actions workflow: daily cron at 3 AM UTC
- Revalidation API route for cache busting after scrape
- 24 tests passing (EventCard rendering, date formatting, scraper utils)
- Pre-commit hooks: Husky + lint-staged (ESLint + Prettier)
- Clean minimal design (gallery aesthetic)

## Architecture
```
Frontend: Next.js 15 (App Router) on Vercel
Database: Neon Postgres (512MB free tier)
Scraping: Cheerio (per-venue modules) via GitHub Actions
Testing: Vitest + Testing Library
Styling: Tailwind CSS
```

## Learnings
- Drizzle Kit needs dotenv/config import since it doesn't read .env.local
- Neon serverless driver requires tagged template syntax for SQL
- @testing-library/react needs explicit cleanup() in vitest
- Next.js 16 uses Promise-based params in page components
