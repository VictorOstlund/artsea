import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.whitechapelgallery.org";
const EXHIBITIONS_URL = `${BASE_URL}/exhibitions/`;
const EVENTS_URL = `${BASE_URL}/events-2-2/`;

function parseDateText(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  // "17 Feb 2026"
  const singleMatch = text.match(/(\d{1,2}\s+\w+\s+\d{4})/);
  if (singleMatch) {
    return { startDate: tryParseDate(singleMatch[1]), endDate: null };
  }

  // "8 Oct - 1 Mar 2026"
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

export const whitechapelScraper: VenueScraper = {
  venueSlug: "whitechapel-gallery",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Whitechapel Gallery...");
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    try {
      // 1. Scrape exhibitions page
      const exHtml = await fetchPage(EXHIBITIONS_URL);
      const $ex = cheerio.load(exHtml);

      // Current exhibitions use .oneHalfMedia or .oneThirdMedia with .mediaBlock
      $ex("div.mediaBlock").each((_i, el) => {
        const $card = $ex(el);

        // Exhibition cards use h4.category_name > a
        const titleLink =
          $card.find("h4.category_name > a").first() ||
          $card.find("h4 > a").first();
        const title = titleLink.text().trim();
        if (!title || title.length < 3) return;

        const href = titleLink.attr("href");
        if (!href) return;
        const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (seen.has(sourceUrl)) return;
        seen.add(sourceUrl);

        const dateText = $card.find("p").last().text().trim();
        const { startDate, endDate } = parseDateText(dateText);

        const imageUrl = $card.find("img").attr("src") || null;

        events.push({
          title: title.slice(0, 200),
          description: "",
          eventType: "visual-arts",
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate,
          imageUrl,
          sourceUrl,
          isFree: null,
          isSoldOut: null,
        });
      });

      await delay();

      // 2. Scrape events page
      const evHtml = await fetchPage(EVENTS_URL);
      const $ev = cheerio.load(evHtml);

      $ev("#AJAXcurrentEvents div.mediaBlock").each((_i, el) => {
        const $card = $ev(el);

        const titleLink = $card.find("p.category_name--new > a").first();
        const title = titleLink.text().trim();
        if (!title || title.length < 3) return;

        const href = titleLink.attr("href");
        if (!href) return;
        const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (seen.has(sourceUrl)) return;
        seen.add(sourceUrl);

        const dateText = $card.find("p.category_date").text().trim();
        const { startDate, endDate } = parseDateText(dateText);

        const category = $card.find("p.category_orange").text().trim();
        const description = $card.find("p.category_meta_title").text().trim();
        const imageUrl = $card.find("img").attr("src") || null;

        events.push({
          title: title.slice(0, 200),
          description: (description || "").slice(0, 500),
          eventType: inferEventType(title, description || "", category),
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate,
          imageUrl,
          sourceUrl,
          isFree: null,
          isSoldOut: null,
        });
      });
    } catch (error) {
      console.error("Error scraping Whitechapel Gallery:", error);
    }

    console.log(`  Found ${events.length} events from Whitechapel Gallery`);
    return events;
  },
};
