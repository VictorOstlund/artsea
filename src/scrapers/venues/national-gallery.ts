import * as cheerio from "cheerio";
import { fetchPage, delay, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.nationalgallery.org.uk";
const EVENTS_API = `${BASE_URL}/umbraco/Surface/Events/EventsCards`;
const EXHIBITIONS_URL = `${BASE_URL}/exhibitions`;

function parseDateText(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  // "Until 10 May 2026"
  const untilMatch = text.match(/until\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  if (untilMatch) {
    const endDate = tryParseDate(untilMatch[1]);
    const today = new Date().toISOString().split("T")[0];
    return { startDate: today, endDate };
  }

  // "15 January – 5 April 2026"
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

  // "Tuesday, 17 February 2026"
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

function extractBgImage(style: string | undefined): string | null {
  if (!style) return null;
  const match = style.match(/url\(['"]?([^'")\s]+)['"]?\)/);
  if (!match) return null;
  const url = match[1];
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

export const nationalGalleryScraper: VenueScraper = {
  venueSlug: "national-gallery",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping National Gallery...");
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    try {
      // 1. Fetch exhibitions page (static HTML)
      const exHtml = await fetchPage(EXHIBITIONS_URL);
      const $ex = cheerio.load(exHtml);

      $ex("article.exhibition-card").each((_i, el) => {
        const $card = $ex(el);
        const title = $card.find("h3.exhibition-heading").text().trim();
        if (!title || title.length < 3) return;

        const href = $card.find("a.card-link").attr("href");
        if (!href) return;
        const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (seen.has(sourceUrl)) return;
        seen.add(sourceUrl);

        const dateText = $card.find(".exhibition-date").text().trim();
        const { startDate, endDate } = parseDateText(dateText);

        const imageUrl = extractBgImage(
          $card.find(".card-img-top > div[style]").attr("style"),
        );

        const paymentType = $card.attr("data-payment-type") || "";
        const isFree = paymentType.toLowerCase().includes("free") ? true : null;

        const description = $card.find(".exhibition-description").text().trim();

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

      await delay();

      // 2. Fetch events via AJAX endpoint
      const evHtml = await fetchPage(EVENTS_API);
      const $ev = cheerio.load(evHtml);

      $ev("li.ng-card-wrap").each((_i, el) => {
        const $card = $ev(el);
        const $article = $card.find("article.ng-event-card");

        const title =
          $article.attr("data-dl-name") ||
          $card.find("h3.trimmed").text().trim();
        if (!title || title.length < 3) return;

        const href = $card.find("a.dl-product-link").attr("href");
        if (!href) return;
        const sourceUrl = href.startsWith("http") ? href : `${BASE_URL}${href}`;
        if (seen.has(sourceUrl)) return;
        seen.add(sourceUrl);

        const dateText = $card.find(".date").text().trim();
        const { startDate, endDate } = parseDateText(dateText);

        const imageUrl = extractBgImage(
          $card.find(".thumbnail-inner > div[style]").attr("style"),
        );

        const category = $card.find(".category").text().trim();
        const costText = $card.find(".cost").text().trim();
        const isFree = costText.toLowerCase() === "free" ? true : null;

        events.push({
          title: title.slice(0, 200),
          description: "",
          eventType: inferEventType(title, "", category),
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate,
          imageUrl,
          sourceUrl,
          isFree,
          isSoldOut: null,
        });
      });
    } catch (error) {
      console.error("Error scraping National Gallery:", error);
    }

    console.log(`  Found ${events.length} events from National Gallery`);
    return events;
  },
};
