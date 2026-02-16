import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.barbican.org.uk";
const WHATS_ON_URL = `${BASE_URL}/whats-on`;

function parseDayAttr(dayStr: string): string {
  // data-day format: "Mon 16 Feb" (no year) — assume current or next occurrence
  const match = dayStr.match(/\w+\s+(\d{1,2})\s+(\w+)/);
  if (!match) return new Date().toISOString().split("T")[0];

  const day = match[1];
  const monthStr = match[2];
  const now = new Date();
  const year = now.getFullYear();
  const todayStr = now.toISOString().split("T")[0];

  // Try current year first, if date is in the past use next year
  const attempt = new Date(`${day} ${monthStr} ${year}`);
  if (isNaN(attempt.getTime())) return todayStr;

  const attemptStr = attempt.toISOString().split("T")[0];
  if (attemptStr < todayStr) {
    attempt.setFullYear(year + 1);
  }
  return attempt.toISOString().split("T")[0];
}

export const barbicanScraper: VenueScraper = {
  venueSlug: "barbican-centre",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Barbican Centre...");
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    try {
      // Fetch multiple pages (pagination is ?page=N, 0-indexed)
      for (let page = 0; page < 5; page++) {
        const url = page === 0 ? WHATS_ON_URL : `${WHATS_ON_URL}?page=${page}`;
        let html: string;
        try {
          html = await fetchPage(url);
        } catch {
          break; // No more pages
        }
        const $ = cheerio.load(html);

        const rows = $(".views-row");
        if (rows.length === 0) break;

        rows.each((_i, row) => {
          const $row = $(row);
          const $card = $row.find(".search-listing--event");
          if ($card.length === 0) return;

          // Title
          const title = $card
            .find("h2.listing-title, .listing-title--event")
            .first()
            .text()
            .trim();
          if (!title || title.length < 3) return;

          // URL
          const href =
            $card.find("a.search-listing__link").attr("href") ||
            $card.find(".search-listing__cta a").attr("href");
          if (!href) return;
          const sourceUrl = href.startsWith("http")
            ? href
            : `${BASE_URL}${href}`;

          // Deduplicate
          if (seen.has(sourceUrl)) return;
          seen.add(sourceUrl);

          // Date from parent row's data-day attribute
          const dayAttr = $row.attr("data-day") || "";
          const startDate = parseDayAttr(dayAttr);

          // Image
          const imgEl = $card.find(".search-listing__image img");
          let imageUrl = imgEl.attr("src") || imgEl.attr("data-src") || null;
          if (imageUrl && !imageUrl.startsWith("http")) {
            imageUrl = `${BASE_URL}${imageUrl}`;
          }

          // Tags / categories
          const tags = $card
            .find(".tag__plain")
            .map((_i, el) => $(el).text().trim())
            .get();

          // Free?
          const isFree =
            $card.find(".search-listing__label--promoted").length > 0;

          // Description
          const description = $card
            .find(".search-listing__intro p")
            .text()
            .trim();

          events.push({
            title: title.slice(0, 200),
            description: (description || "").slice(0, 500),
            eventType: inferEventType(title, description || "", tags.join(" ")),
            startDate,
            endDate: null,
            imageUrl,
            sourceUrl,
            isFree: isFree || null,
            isSoldOut: null,
          });
        });

        // Check if there's a next page
        const hasNext =
          $("ul[data-drupal-views-infinite-scroll-pager] a").length > 0;
        if (!hasNext) break;

        await delay();
      }
    } catch (error) {
      console.error("Error scraping Barbican:", error);
    }

    console.log(`  Found ${events.length} events from Barbican`);
    return events;
  },
};
