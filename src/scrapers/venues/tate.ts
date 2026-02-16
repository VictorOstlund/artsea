import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.tate.org.uk";
const WHATS_ON_URL = `${BASE_URL}/whats-on?gallery=tate-modern`;

function parseDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr.trim());
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
    return { startDate: parseDate(startStr), endDate: parseDate(endStr) };
  }

  const singleMatch = text.match(/(\d{1,2}\s+\w+\s+\d{4})/);
  if (singleMatch) {
    return { startDate: parseDate(singleMatch[1]), endDate: null };
  }

  return { startDate: null, endDate: null };
}

export const tateScraper: VenueScraper = {
  venueSlug: "tate-modern",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Tate Modern...");
    const events: ScrapedEvent[] = [];

    try {
      const html = await fetchPage(WHATS_ON_URL);
      const $ = cheerio.load(html);

      // Look for exhibition/event cards
      $(
        "a[href*='/whats-on/tate-modern/'], a[href*='/whats-on/tate-britain/']",
      ).each((_i, el) => {
        const $el = $(el);
        const href = $el.attr("href");
        if (!href) return;

        // Skip navigation/filter links
        if (href.includes("?") && !href.includes("/exhibition/")) return;

        const title =
          $el.find("h2, h3, [class*='title']").first().text().trim() ||
          $el.text().trim().split("\n")[0]?.trim();
        if (!title || title.length < 3 || title.length > 200) return;

        const dateText = $el
          .find("[class*='date'], time, [class*='subtitle']")
          .text()
          .trim();
        const { startDate, endDate } = parseDateRange(dateText);

        const description =
          $el
            .find("[class*='description'], [class*='summary']")
            .text()
            .trim() || "";

        const imageUrl =
          $el.find("img").attr("src") ||
          $el.find("img").attr("data-src") ||
          null;

        const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;

        const isFreeText = $el.text().toLowerCase();
        const isFree = isFreeText.includes("free")
          ? true
          : isFreeText.includes("member")
            ? false
            : null;

        events.push({
          title: title.slice(0, 200),
          description: description.slice(0, 500),
          eventType: inferEventType(title, description),
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate,
          imageUrl: imageUrl?.startsWith("http")
            ? imageUrl
            : imageUrl
              ? `${BASE_URL}${imageUrl}`
              : null,
          sourceUrl,
          isFree,
        });
      });

      await delay();
    } catch (error) {
      console.error("Error scraping Tate:", error);
    }

    // Deduplicate by source URL
    const seen = new Set<string>();
    const unique = events.filter((e) => {
      if (seen.has(e.sourceUrl)) return false;
      seen.add(e.sourceUrl);
      return true;
    });

    console.log(`  Found ${unique.length} events from Tate Modern`);
    return unique;
  },
};
