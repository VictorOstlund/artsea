import type { ScrapedEvent, VenueScraper } from "../lib/types";

// Southbank Centre uses Cloudflare protection that blocks all automated requests.
// To add Southbank events in the future, options are:
// 1. Skiddle API (free, non-commercial) — https://www.skiddle.com/api/join.php
// 2. Headless browser (Playwright) — adds heavy dependency
// 3. Partner API access from Southbank Centre directly

export const southbankScraper: VenueScraper = {
  venueSlug: "southbank-centre",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Southbank Centre...");
    console.log("  Skipped: Cloudflare protection blocks automated access.");
    console.log(
      "  To enable: apply for Skiddle API key at https://www.skiddle.com/api/join.php",
    );
    return [];
  },
};
