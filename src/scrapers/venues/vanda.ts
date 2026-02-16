import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.vam.ac.uk";
const WHATS_ON_URL = `${BASE_URL}/whatson`;

function parseDateRange(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  // V&A formats: "15 Mar 2026", "15 Mar - 20 Jun 2026", "Until 20 Jun 2026"
  const untilMatch = text.match(/until\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  if (untilMatch) {
    const endDate = parseDate(untilMatch[1]);
    // If "until" format, start date is now
    const today = new Date().toISOString().split("T")[0];
    return { startDate: today, endDate };
  }

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

function parseDate(dateStr: string): string | null {
  try {
    const date = new Date(dateStr.trim());
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

export const vandaScraper: VenueScraper = {
  venueSlug: "va-museum",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping V&A Museum...");
    const events: ScrapedEvent[] = [];

    try {
      const html = await fetchPage(WHATS_ON_URL);
      const $ = cheerio.load(html);

      // Try to extract from Google Analytics dataLayer first
      const scripts = $("script")
        .toArray()
        .map((s) => $(s).html())
        .filter(Boolean);

      for (const script of scripts) {
        if (!script || !script.includes("dataLayer")) continue;
        try {
          const dlMatch = script.match(/dataLayer\.push\((\{[\s\S]*?\})\)/);
          if (dlMatch) {
            const data = JSON.parse(dlMatch[1]);
            if (data?.ecommerce?.impressions) {
              for (const item of data.ecommerce.impressions) {
                events.push({
                  title: item.name || "Untitled",
                  description: "",
                  eventType: inferEventType(item.name || "", "", item.category),
                  startDate: new Date().toISOString().split("T")[0],
                  endDate: null,
                  imageUrl: null,
                  sourceUrl: `${BASE_URL}/event/${item.id}`,
                  isFree: null,
                });
              }
            }
          }
        } catch {
          // Continue to HTML fallback
        }
      }

      // HTML fallback: find event cards
      if (events.length === 0) {
        $("a[href*='/event/'], a[href*='/exhibitions/']").each((_i, el) => {
          const $el = $(el);
          const href = $el.attr("href");
          if (!href) return;

          const title =
            $el.find("h2, h3, [class*='title']").first().text().trim() ||
            $el.text().trim().split("\n")[0]?.trim();
          if (!title || title.length < 3) return;

          const dateText = $el.find("[class*='date'], time").text().trim();
          const { startDate, endDate } = parseDateRange(dateText);

          const description =
            $el.find("[class*='description'], p").first().text().trim() || "";

          const imageUrl =
            $el.find("img").attr("src") ||
            $el.find("img").attr("data-src") ||
            null;

          const sourceUrl = href.startsWith("http")
            ? href
            : `${BASE_URL}${href}`;

          const isFreeText = $el.text().toLowerCase();
          const isFree = isFreeText.includes("free") ? true : null;

          if (startDate || !dateText) {
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
          }
        });
      }

      await delay();
    } catch (error) {
      console.error("Error scraping V&A:", error);
    }

    console.log(`  Found ${events.length} events from V&A`);
    return events;
  },
};
