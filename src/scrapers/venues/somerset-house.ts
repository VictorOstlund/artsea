import * as cheerio from "cheerio";
import { fetchPage, inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const BASE_URL = "https://www.somersethouse.org.uk";
const WHATS_ON_URL = `${BASE_URL}/whats-on`;

function parseDateText(text: string): {
  startDate: string | null;
  endDate: string | null;
} {
  // "Until 22 Feb 2026"
  const untilMatch = text.match(/until\s+(\d{1,2}\s+\w+\s+\d{4})/i);
  if (untilMatch) {
    const endDate = tryParseDate(untilMatch[1]);
    const today = new Date().toISOString().split("T")[0];
    return { startDate: today, endDate };
  }

  // "30 Oct 2025 – 22 Feb 2026" or similar ranges
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

interface SomersetNode {
  id?: string;
  title?: string;
  url?: string;
  dateText?: string;
  dateStart?: string;
  dateEnd?: string;
  priceFree?: boolean;
  eventTypes?: Array<{ title?: string }>;
  listingImage?: { src?: string };
  __typename?: string;
}

export const somersetHouseScraper: VenueScraper = {
  venueSlug: "somerset-house",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Somerset House...");
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    try {
      const html = await fetchPage(WHATS_ON_URL);
      const $ = cheerio.load(html);

      // Somerset House embeds GraphQL data in a script tag
      let jsonData: SomersetNode[] = [];

      $("script").each((_i, el) => {
        const content = $(el).html();
        if (!content || !content.includes('"EventDetailPage"')) return;

        try {
          // Try parsing the entire script content as JSON
          const parsed = JSON.parse(content);
          const edges =
            parsed?.data?.page?.items?.edges ||
            parsed?.page?.items?.edges ||
            parsed?.props?.pageProps?.data?.page?.items?.edges;

          if (edges && Array.isArray(edges)) {
            jsonData = edges.map((e: { node: SomersetNode }) => e.node);
          }
        } catch {
          // Try extracting JSON from within the script
          const jsonMatch = content.match(
            /"items"\s*:\s*\{\s*"edges"\s*:\s*(\[[\s\S]*?\])\s*,\s*"pageInfo"/,
          );
          if (jsonMatch) {
            try {
              const edges = JSON.parse(jsonMatch[1]);
              jsonData = edges.map((e: { node: SomersetNode }) => e.node);
            } catch {
              // Ignore parse errors
            }
          }
        }
      });

      for (const node of jsonData) {
        if (!node.title || !node.url) continue;

        const sourceUrl = node.url.startsWith("http")
          ? node.url
          : `${BASE_URL}${node.url}`;
        if (seen.has(sourceUrl)) continue;
        seen.add(sourceUrl);

        // Use ISO dates if available, fallback to text parsing
        let startDate: string | null = null;
        let endDate: string | null = null;

        if (node.dateStart) {
          startDate = node.dateStart.split("T")[0];
        }
        if (node.dateEnd) {
          endDate = node.dateEnd.split("T")[0];
        }

        // Fallback to text parsing
        if (!startDate && node.dateText) {
          const parsed = parseDateText(node.dateText);
          startDate = parsed.startDate;
          endDate = parsed.endDate;
        }

        const eventTypeStr =
          node.eventTypes?.map((t) => t.title || "").join(" ") || "";

        events.push({
          title: node.title.slice(0, 200),
          description: "",
          eventType: inferEventType(node.title, "", eventTypeStr),
          startDate: startDate || new Date().toISOString().split("T")[0],
          endDate,
          imageUrl: node.listingImage?.src || null,
          sourceUrl,
          isFree: node.priceFree === true ? true : null,
        });
      }

      // Fallback: if no JSON data found, try HTML parsing
      if (events.length === 0) {
        $('a[href*="/whats-on/"]').each((_i, el) => {
          const $el = $(el);
          const href = $el.attr("href");
          if (!href || href === "/whats-on" || href === "/whats-on/") return;

          const title = $el.find("h3").text().trim() || $el.text().trim();
          if (!title || title.length < 3 || title.length > 200) return;

          const sourceUrl = href.startsWith("http")
            ? href
            : `${BASE_URL}${href}`;
          if (seen.has(sourceUrl)) return;
          seen.add(sourceUrl);

          events.push({
            title: title.slice(0, 200),
            description: "",
            eventType: "visual-arts",
            startDate: new Date().toISOString().split("T")[0],
            endDate: null,
            imageUrl: null,
            sourceUrl,
            isFree: null,
          });
        });
      }
    } catch (error) {
      console.error("Error scraping Somerset House:", error);
    }

    console.log(`  Found ${events.length} events from Somerset House`);
    return events;
  },
};
