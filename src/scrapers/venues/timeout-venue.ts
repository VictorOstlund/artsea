import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const TIMEOUT_BASE = "https://www.timeout.com";

/**
 * Scrape events from a TimeOut London venue page.
 * Used for venues whose own sites block automated access (Cloudflare/403).
 */
function scrapeTimeoutVenuePage(
  html: string,
  venueName: string,
): ScrapedEvent[] {
  const $ = cheerio.load(html);
  const events: ScrapedEvent[] = [];
  const seen = new Set<string>();

  $('article[data-testid="tile-venue-event_testID"]').each((_i, el) => {
    const $card = $(el);

    // Title
    const title = $card.find("h3").first().text().trim();
    if (!title || title.length < 3) return;

    // URL
    const href = $card
      .find('a[data-testid="tile-link_testID"]')
      .first()
      .attr("href");
    if (!href) return;
    const sourceUrl = href.startsWith("http") ? href : `${TIMEOUT_BASE}${href}`;
    if (seen.has(sourceUrl)) return;
    seen.add(sourceUrl);

    // Image
    const imageUrl = $card.find("picture img").first().attr("src") || null;

    // Description
    const description = $card
      .find('[data-testid="summary_testID"]')
      .text()
      .trim();

    // Category
    const category = $card.find("li._tag_1i2cm_17 span").text().trim() || "";

    // Dates — TimeOut uses <time> elements with dateTime attributes
    const $times = $card.find("time");
    let startDate: string | null = null;
    let endDate: string | null = null;

    if ($times.length >= 2) {
      // Date range: two <time> elements
      const startDt = $times.eq(0).attr("datetime");
      const endDt = $times.eq(1).attr("datetime");
      if (startDt) startDate = startDt.split("T")[0];
      if (endDt) endDate = endDt.split("T")[0];
    } else if ($times.length === 1) {
      // Single date like "Until 12 Apr 2026"
      const dt = $times.eq(0).attr("datetime");
      if (dt) {
        const dateStr = dt.split("T")[0];
        const text = $times.eq(0).text().trim().toLowerCase();
        if (text.startsWith("until")) {
          startDate = new Date().toISOString().split("T")[0];
          endDate = dateStr;
        } else {
          startDate = dateStr;
        }
      }
    }

    events.push({
      title: title.slice(0, 200),
      description: (description || "").slice(0, 500),
      eventType: inferEventType(title, description, category),
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate,
      imageUrl,
      sourceUrl,
      isFree: null,
      isSoldOut: null,
    });
  });

  return events;
}

// --- Hayward Gallery ---

export const haywardScraper: VenueScraper = {
  venueSlug: "hayward-gallery",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Hayward Gallery (via TimeOut)...");
    try {
      const html = await fetchPage(
        `${TIMEOUT_BASE}/london/art/hayward-gallery`,
      );
      const events = scrapeTimeoutVenuePage(html, "Hayward Gallery");
      console.log(`  Found ${events.length} events from Hayward Gallery`);
      return events;
    } catch (error) {
      console.error("Error scraping Hayward Gallery:", error);
      return [];
    }
  },
};

// --- Royal Academy ---

export const royalAcademyScraper: VenueScraper = {
  venueSlug: "royal-academy",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Royal Academy (via TimeOut)...");
    try {
      const html = await fetchPage(
        `${TIMEOUT_BASE}/london/art/royal-academy-of-arts`,
      );
      const events = scrapeTimeoutVenuePage(html, "Royal Academy");
      console.log(`  Found ${events.length} events from Royal Academy`);
      return events;
    } catch (error) {
      console.error("Error scraping Royal Academy:", error);
      return [];
    }
  },
};

// --- Southbank Centre (excluding Hayward which has its own scraper) ---

export const southbankTimeoutScraper: VenueScraper = {
  venueSlug: "southbank-centre",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Southbank Centre (via TimeOut)...");
    try {
      const html = await fetchPage(
        `${TIMEOUT_BASE}/london/art/southbank-centre`,
      );
      const events = scrapeTimeoutVenuePage(html, "Southbank Centre");
      console.log(`  Found ${events.length} events from Southbank Centre`);
      return events;
    } catch (error) {
      console.error("Error scraping Southbank Centre:", error);
      return [];
    }
  },
};
