import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.barbican.org.uk";
const WHATS_ON_URL = `${BASE_URL}/whats-on`;

function parseDate(dateStr: string): string | null {
  try {
    const cleaned = dateStr.trim();
    const date = new Date(cleaned);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

function parseDateRange(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  // Common formats: "15 Mar 2026", "15 Mar - 20 Jun 2026", "15 Mar 2026 - 20 Jun 2026"
  const rangeMatch = text.match(
    /(\d{1,2}\s+\w+(?:\s+\d{4})?)\s*[-–—]\s*(\d{1,2}\s+\w+\s+\d{4})/,
  );
  if (rangeMatch) {
    let startStr = rangeMatch[1];
    const endStr = rangeMatch[2];
    // If start date has no year, infer from end date
    if (!/\d{4}/.test(startStr)) {
      const yearMatch = endStr.match(/\d{4}/);
      if (yearMatch) startStr += ` ${yearMatch[0]}`;
    }
    return { startDate: parseDate(startStr), endDate: parseDate(endStr) };
  }

  // Single date
  const singleMatch = text.match(/(\d{1,2}\s+\w+\s+\d{4})/);
  if (singleMatch) {
    return { startDate: parseDate(singleMatch[1]), endDate: null };
  }

  return { startDate: null, endDate: null };
}

export const barbicanScraper: VenueScraper = {
  venueSlug: "barbican-centre",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Barbican Centre...");
    const events: ScrapedEvent[] = [];

    try {
      const html = await fetchPage(WHATS_ON_URL);
      const $ = cheerio.load(html);

      // Find event links/cards on the page
      $("a[href*='/whats-on/']").each((_i, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href || href === "/whats-on" || href === "/whats-on/") return;

        const title =
          $el.find("h2, h3, .title, [class*='title']").first().text().trim() ||
          $el.text().trim().split("\n")[0]?.trim();
        if (!title || title.length < 3) return;

        const dateText =
          $el.find("[class*='date'], time, .subtitle").text().trim() ||
          $el.find("p").first().text().trim();
        const { startDate, endDate } = parseDateRange(dateText);

        const description =
          $el
            .find("[class*='description'], [class*='summary'], p")
            .last()
            .text()
            .trim() || "";

        const imageUrl =
          $el.find("img").attr("src") ||
          $el.find("img").attr("data-src") ||
          null;

        const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

        const isFreeText = $el.text().toLowerCase();
        const isFree = isFreeText.includes("free") ? true : null;

        if (startDate) {
          events.push({
            title: title.slice(0, 200),
            description: description.slice(0, 500),
            eventType: inferEventType(title, description),
            startDate,
            endDate,
            imageUrl: imageUrl?.startsWith("http")
              ? imageUrl
              : imageUrl
                ? `${BASE_URL}${imageUrl}`
                : null,
            sourceUrl,
            isFree,
          });
        }
      });

      await delay();
    } catch (error) {
      console.error("Error scraping Barbican:", error);
    }

    console.log(`  Found ${events.length} events from Barbican`);
    return events;
  },
};
