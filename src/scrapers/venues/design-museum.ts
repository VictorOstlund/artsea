import * as cheerio from "cheerio";
import { fetchPage, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://designmuseum.org";
const EXHIBITIONS_URL = `${BASE_URL}/exhibitions`;

function parseDateText(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  // "Until 29 March 2026"
  const untilMatch = text.match(/until\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  if (untilMatch) {
    const endDate = tryParseDate(untilMatch[1]);
    const today = new Date().toISOString().split("T")[0];
    return { startDate: today, endDate };
  }

  // "Until August 2026" (no day)
  const untilMonthMatch = text.match(/until\s+(\w+\s+\d{4})/i);
  if (untilMonthMatch) {
    const endDate = tryParseDate(`1 ${untilMonthMatch[1]}`);
    const today = new Date().toISOString().split("T")[0];
    return { startDate: today, endDate };
  }

  // "1 May – 4 October 2026"
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

function extractBgImage(style: string | undefined): string | null {
  if (!style) return null;
  const match = style.match(/url\(([^)]+)\)/);
  if (!match) return null;
  const url = match[1].replace(/['"]/g, "");
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

export const designMuseumScraper: VenueScraper = {
  venueSlug: "design-museum",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Design Museum...");
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    try {
      const html = await fetchPage(EXHIBITIONS_URL);
      const $ = cheerio.load(html);

      $("div.page-item.clearfix").each((_i, el) => {
        const $card = $(el);

        const title = $card.find("h2").first().text().trim();
        if (!title || title.length < 3) return;

        // Skip non-exhibition items like "Past exhibitions: Find out more" or "Ticket Mate Fund"
        const href = $card.find("a").first().attr("href");
        if (!href) return;
        if (
          href.includes("past-exhibitions") ||
          href.includes("support-us") ||
          href.includes("ticket-mate")
        )
          return;

        const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (seen.has(sourceUrl)) return;
        seen.add(sourceUrl);

        const dateText = $card.find("time.icon-date").text().trim();
        if (!dateText || dateText.includes("Permanent Collection")) return;

        const { startDate, endDate } = parseDateText(dateText);

        const imageUrl = extractBgImage($card.find("figure").attr("style"));

        const description = $card.find("div.rich-text").text().trim();

        // Detect free from date text
        const isFree = dateText.toLowerCase().includes("free") ? true : null;

        events.push({
          title: title.slice(0, 200),
          description: (description || "").slice(0, 500),
          eventType: inferEventType(title, description || ""),
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate,
          imageUrl,
          sourceUrl,
          isFree,
          isSoldOut: null,
        });
      });
    } catch (error) {
      console.error("Error scraping Design Museum:", error);
    }

    console.log(`  Found ${events.length} events from Design Museum`);
    return events;
  },
};
