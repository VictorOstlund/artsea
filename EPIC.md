# ArtSea - London Art Events Discovery Platform

## Requirements (IMMUTABLE)

1. Website auto-aggregates art/creative event listings from 5-10 major London venues (Barbican, V&A, Tate, Southbank Centre, + others)
2. Events displayed in a chronological feed/timeline, filterable by event type, date range, London area, and venue
3. Full-text search across event titles, descriptions, and venue names
4. Each event links back to the original source URL (attribution)
5. Scrapers run daily via GitHub Actions, writing to Neon Postgres
6. Site is responsive (mobile-first), fast, and SEO-friendly
7. Clean, minimal visual design (gallery aesthetic, white space, let images speak)
8. Deployed on Vercel (free tier), database on Neon Postgres (free tier)
9. Built with Next.js (App Router) and TypeScript
10. Event types supported: visual arts, theatre, dance, workshops, talks, markets, film, music

## Success Criteria (MUST ALL BE TRUE)

- [ ] Home page shows chronological feed of upcoming events from at least 4 venues
- [ ] Filter bar works: filter by event type, date range, area, venue (combinable)
- [ ] Full-text search returns relevant results ranked by relevance then date
- [ ] Event detail page shows title, description, dates, venue, image, and link to source
- [ ] Venue pages show all events at that venue
- [ ] Scrapers successfully extract events from at least 4 London venues
- [ ] GitHub Actions workflow runs daily and populates database
- [ ] Site scores 90+ on Lighthouse (performance, accessibility, SEO)
- [ ] Fully responsive: works well on mobile, tablet, desktop
- [ ] All pages have proper meta tags and Open Graph tags for sharing
- [ ] All tests passing
- [ ] Pre-commit hooks passing (lint, format)

## Anti-Patterns (FORBIDDEN)

- NO hardcoded event data (all events must come from scrapers/database, not static JSON files)
- NO client-side-only rendering for event listings (must be SSR/SSG for SEO)
- NO scraping personal data from venue sites (only public event info: title, dates, description, image, URL)
- NO ignoring robots.txt directives (respect each venue's crawling rules)
- NO single monolithic scraper (each venue gets its own parser module for maintainability)
- NO storing full event descriptions verbatim if copyrighted (use summaries + link to source)
- NO paid services in MVP (must run entirely on free tiers: Vercel Hobby, Neon Free, GitHub Actions free)
- NO user authentication in MVP (deferred to post-launch)
- NO complex state management libraries (keep it simple: React Server Components + URL state for filters)

## Approach

Build a Next.js 15 App Router application deployed on Vercel. The site serves as a read-only discovery platform — users browse, search, and filter events, then click through to the original venue page for details/booking.

Event data is sourced by venue-specific scraper modules that run as a GitHub Actions workflow on a daily cron schedule. Each venue has its own parser (Cheerio for static HTML, Playwright if needed for JS-rendered content). Scrapers write to a Neon Postgres database. After scraping completes, the workflow triggers Vercel's on-demand revalidation to refresh cached pages.

The frontend uses React Server Components for fast initial loads and SEO. Filters and search use URL query parameters (no client state library needed). Styling via Tailwind CSS for rapid, consistent design.

## Architecture

### Pages
- `/` — Home feed (upcoming events, filters, search)
- `/events/[slug]` — Event detail page
- `/venues/[slug]` — Venue page (all events at venue)
- `/type/[type]` — Events filtered by type
- `/search?q=...` — Search results
- `/about` — About the project, attribution

### Data Model
```
venues
  - id (uuid)
  - name (text)
  - slug (text, unique)
  - website_url (text)
  - area (text) — Central/East/South/West/North London
  - scraper_module (text) — reference to scraper file

events
  - id (uuid)
  - venue_id (uuid, FK)
  - title (text)
  - slug (text, unique)
  - description (text)
  - event_type (text) — visual-arts, theatre, dance, etc.
  - start_date (date)
  - end_date (date, nullable)
  - image_url (text, nullable)
  - source_url (text) — link back to original listing
  - is_free (boolean, nullable)
  - created_at (timestamp)
  - updated_at (timestamp)
  - source_hash (text) — for deduplication
```

### Scraping Architecture
```
/scrapers
  /venues
    barbican.ts    — Cheerio, parses /whats-on HTML
    vanda.ts       — Extracts GA dataLayer JSON
    tate.ts        — Cheerio, parses event listing HTML
    southbank.ts   — Cheerio, parses /whats-on HTML
  /lib
    scraper-base.ts — Common scraping utilities
    db.ts           — Database write operations
    dedup.ts        — Deduplication logic (source_hash)
```

### Infrastructure
- **Hosting:** Vercel (Hobby plan, free)
- **Database:** Neon Postgres (free tier, 512MB)
- **Scraping:** GitHub Actions (daily cron, free for public repos)
- **Styling:** Tailwind CSS
- **Search:** Postgres full-text search (tsvector index)

## Design Rationale

### Problem
London has hundreds of art and creative events happening weekly across galleries, theatres, and cultural venues. No single platform automatically aggregates these — existing options (Time Out, ArtRabbit, FAD) rely on manual curation or user submissions, leading to incomplete and often outdated listings.

### Research Findings

**Codebase:** New project, no existing code.

**External:**
- **Competitors:** ArtRabbit (user submissions), Time Out (editorial curation), FAD (editorial). None do automated aggregation — this is the gap.
- **Barbican:** Clean HTML structure at /whats-on, Spektrix API endpoint discovered. Scrapability: HIGH.
- **V&A:** Google Analytics dataLayer contains structured JSON with all events on page load. Scrapability: HIGH.
- **Tate:** HTML scraping needed, robots.txt permissive (allows /). Scrapability: MEDIUM.
- **Southbank Centre:** HTML scraping, no API found. Scrapability: MEDIUM.
- **UK scraping law:** Low-medium risk for public event listings. Legal when respecting robots.txt, rate-limiting, and attributing sources.

### Approaches Considered

#### 1. Next.js + Neon Postgres + GitHub Actions scraper (CHOSEN)

**What it is:** Single Next.js app on Vercel with Neon Postgres database. Scrapers run as GitHub Actions on daily cron. Cheerio for HTML parsing, Playwright as fallback for JS-heavy sites.

**Investigation:**
- Vercel Hobby plan supports daily cron, 60s function timeout (sufficient for revalidation)
- Neon free tier: 512MB, no inactivity pause (unlike Supabase which pauses after 7 days)
- GitHub Actions: free for public repos, 2000 min/month for private
- Postgres full-text search sufficient for hundreds of events

**Pros:**
- $0/month total cost
- Single repo, single deployment pipeline
- Proven stack, large community
- Claude can build the entire thing

**Cons:**
- Requires GitHub account for deployment
- Scraper maintenance when venue sites change layout

**Chosen because:** Free, fully featured, maintainable, and buildable in this workspace.

#### 2. No-code (Webflow + Airtable + Zapier)

**What it is:** Visual site builder with Airtable database and Zapier for automation.

**Why we looked at this:** User is non-technical, visual builders are easier to modify.

**Investigation:**
- Zapier/Make scraping capabilities are very limited (no HTML parsing)
- Would need a separate scraping service anyway
- Monthly cost: $30-50+ for Zapier + Airtable paid tiers

**Pros:** Visual editor, user can modify design themselves.
**Cons:** Scraping not feasible in no-code, monthly costs, less flexible.

**REJECTED BECAUSE:** Can't handle the core feature (scraping) well. Monthly costs add up.

**DO NOT REVISIT UNLESS:** Scraping is replaced by manual curation or an API-only approach.

#### 3. Static site (Astro) rebuilt daily

**What it is:** Scrape events, generate static HTML, deploy. No runtime database.

**Why we looked at this:** Simplest possible architecture, fastest page loads.

**Investigation:**
- Astro excels at static content sites
- No runtime database needed (events baked into HTML at build time)
- But: filtering and search require client-side JS anyway

**Pros:** Ultra-fast, simplest deployment, cheapest.
**Cons:** No real-time interactivity without client JS, rebuild takes time.

**REJECTED BECAUSE:** Search and filtering are core features that need interactivity. Would end up adding client-side complexity that negates Astro's simplicity.

**DO NOT REVISIT UNLESS:** Search and filtering are removed from requirements.

### Scope Boundaries

**In scope (MVP):**
- Automated scraping of 5-10 major London venues
- Chronological feed with filters and search
- Event detail and venue pages
- Mobile-responsive, SEO-friendly
- Daily data refresh

**Out of scope (deferred):**
- User accounts / bookmarks — deferred to post-launch
- Email newsletter — deferred to post-launch
- Ad placements — need traffic first
- More than ~10 venues — scale after proving concept
- Ticket purchasing — out of scope (link to source only)
- Social features — out of scope

## Future Ideas (Backlog)

### Venues
- Add more venue scrapers: Serpentine, Hayward Gallery, National Gallery, Design Museum, Saatchi, Whitechapel Gallery, Royal Academy, Somerset House
- Southbank Centre via Skiddle API (free key needed from https://www.skiddle.com/api/join.php)

### Features
- **PWA / Mobile app** — offline support, install prompt, push notifications
- **Email alerts** — weekly digest of new events matching user preferences
- **Map view** — events plotted on a London map (Mapbox/Leaflet)
- **Favourites / save events** — local storage or with user accounts
- **Calendar integration** — "Add to Google Calendar / iCal" button per event
- **Similar events** — "you might also like" recommendations
- **Event reminders** — notify before an event starts
- **Social sharing** — share buttons, OG image generation

### Design & SEO
- Custom branding, logo, colour palette
- OG images per event (dynamic generation)
- sitemap.xml generation
- JSON-LD structured data (Event schema) for Google rich results
- Lighthouse score optimisation (target 90+)

### Infrastructure
- GitHub Actions secrets setup (DATABASE_URL, VERCEL_DEPLOY_URL, VERCEL_REVALIDATE_TOKEN)
- Scraper health monitoring / alerting when a venue scraper breaks
- Image caching (download venue images to own storage vs hotlinking)
- Analytics (Plausible / Umami — privacy-friendly, free self-hosted)

### Open Questions
- Exact list of launch venues beyond the big 4 (Barbican, V&A, Tate, Southbank)
- Image handling: hotlink to venue images vs. download and host (copyright implications)
- How to detect "free" vs "paid" events from scraped data (venue-specific)

## Design Discovery (Reference Context)

### Key Decisions Made

| Question | User Answer | Implication |
|----------|-------------|-------------|
| Core purpose | Event discovery | No ticketing needed, link to source |
| Content source | Aggregated automatically | Need scraping pipeline |
| Event types | All creative events | Broad taxonomy needed |
| Build strategy | Responsive web app | Single codebase |
| Revenue model | Advertising/sponsorship | Need traffic before monetisation |
| Technical level | Non-technical | Must be low-maintenance |
| Build approach | Claude builds it | Full codebase built here |
| UX style | Feed/timeline | Chronological default sort |
| Data sources | Gallery/museum websites | Scraping, not APIs |
| Initial scope | 5-10 major venues | Start focused, grow later |
| Hosting | Vercel | Free, beginner-friendly |
| Design style | Clean & minimal | Gallery aesthetic |
| Project name | ArtSea | Domain: artsea.co.uk / artsea.london (check availability) |
| Search | Yes | Postgres full-text search |

### Research Deep-Dives

#### Venue Scraping Feasibility
**Question explored:** Can we reliably scrape major London gallery websites?
**Sources consulted:**
- Barbican /whats-on page structure
- V&A /whatson page structure and GA dataLayer
- Tate robots.txt and event pages
- Southbank Centre /whats-on pages

**Findings:**
- Barbican and V&A are highly scrapable (clean HTML, structured data)
- Tate and Southbank are medium difficulty (standard HTML scraping)
- All allow general crawling in robots.txt
- No crawl-delay specified (use 1-2s between requests)

**Conclusion:** Start with Barbican and V&A (easiest), then add Tate and Southbank.

#### Database Selection
**Question explored:** Which free Postgres provider is best?
**Sources consulted:**
- Supabase free tier (pauses after 7 days inactivity)
- Neon free tier (512MB, no pause)
- Turso (SQLite, 10GB but less flexible)

**Conclusion:** Neon Postgres — no inactivity pause is critical for a production site.

#### UK Scraping Legality
**Question explored:** Is scraping public event listings legal in the UK?
**Sources consulted:**
- Data Protection Act 2018, UK GDPR
- Computer Misuse Act 1990
- Copyright, Designs and Patents Act 1988

**Conclusion:** Low-medium risk. Legal when scraping public, non-personal event data, respecting robots.txt, and attributing sources.

### Dead-End Paths

#### No-code approach
**Why explored:** User is non-technical, seemed like a natural fit.
**Why abandoned:** No-code tools can't handle HTML scraping. Would still need a technical scraping solution, negating the no-code benefit.

#### Static site generation
**Why explored:** Simplest architecture, fastest performance.
**Why abandoned:** Search and filtering (core features) require runtime interactivity that defeats the purpose of static generation.

### Open Concerns Raised
- Scraper maintenance when sites change layout — mitigated by modular per-venue scrapers; breakage is isolated
- Non-technical user maintaining code — mitigated by clear documentation, simple architecture
- Image copyright — deferred decision on hotlinking vs hosting
