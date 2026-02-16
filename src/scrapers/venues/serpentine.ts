import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.serpentinegalleries.org";
const WHATS_ON_URL = `${BASE_URL}/whats-on/`;
const MAX_PAGES = 5;

function parseDateText(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  // "Ongoing"
  if (/ongoing/i.test(text)) {
    const today = new Date().toISOString().split("T")[0];
    return { startDate: today, endDate: null };
  }

  // "12 March - 23 August 2026" or "4 October 2024 - 22 February 2026"
  const rangeMatch = text.match(
    /(\d{1,2}\s+\w+(?:\s+\d{4})?)\s*[-–—]\s*(\d{1,2}\s+\w+\s+\d{4})/,
  );
  if (rangeMatch) {
    let startStr = rangeMatch[1];
    const endStr = rangeMatch[2];
    if (!/\d{4}/.test(startStr)) {
      const yearMatch = endStr.match(/\d{4}/);
      if (yearMatch) startStr += ` ${yearMatch[0]}`;
    }
    return { startDate: tryParseDate(startStr), endDate: tryParseDate(endStr) };
  }

  // "26 February 2026, 7pm" or "26 February 2026"
  const singleMatch = text.match(/(\d{1,2}\s+\w+\s+\d{4})/);
  if (singleMatch) {
    return { startDate: tryParseDate(singleMatch[1]), endDate: null };
  }

  return { startDate: null, endDate: null };
}

function tryParseDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr.trim());
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

export const serpentineScraper: VenueScraper = {
  venueSlug: "serpentine-galleries",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Serpentine Galleries...");
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    try {
      let currentUrl: string | null = WHATS_ON_URL;
      let pageCount = 0;

      while (currentUrl && pageCount < MAX_PAGES) {
        const html = await fetchPage(currentUrl);
        const $ = cheerio.load(html);

        const cards = $("section.teaser");
        if (cards.length === 0) break;

        cards.each((_i, el) => {
          const $card = $(el);

          const titleLink = $card.find("h3.teaser__title a").first();
          const title = titleLink.text().trim();
          if (!title || title.length < 3) return;

          const href = titleLink.attr("href");
          if (!href) return;
          const sourceUrl = href.startsWith("http")
            ? href
            : `${BASE_URL}${href}`;
          if (seen.has(sourceUrl)) return;
          seen.add(sourceUrl);

          // Image from CloudFront CDN
          const imageUrl = $card.find("img.teaser__img").attr("src") || null;

          // Event types/categories
          const types: string[] = [];
          $card.find(".teaser__pretitle a").each((_j, typeEl) => {
            types.push($(typeEl).text().trim());
          });
          const typeStr = types.join(" ");

          // Dates — typically in the last .meta__row
          const dateText = $card.find(".meta__row").last().text().trim();
          const { startDate, endDate } = parseDateText(dateText);

          // Description
          const description = $card.find("p.teaser__text").text().trim();

          events.push({
            title: title.slice(0, 200),
            description: (description || "").slice(0, 500),
            eventType: inferEventType(title, description || "", typeStr),
            startDate: startDate || new Date().toISOString().split("T")[0],
            endDate,
            imageUrl,
            sourceUrl,
            isFree: null,
            isSoldOut: null,
          });
        });

        // Check for next page via WordPress <link rel="next">
        const nextPageUrl = $('link[rel="next"]').attr("href") || null;
        currentUrl = nextPageUrl;
        pageCount++;

        if (currentUrl) await delay();
      }
    } catch (error) {
      console.error("Error scraping Serpentine Galleries:", error);
    }

    console.log(`  Found ${events.length} events from Serpentine Galleries`);
    return events;
  },
};
