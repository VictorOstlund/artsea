import { inferEventType } from "../lib/fetch";
import type { ScrapedEvent, VenueScraper } from "../lib/types";

const API_BASE = "https://www.saatchigallery.com/wp-json/wp/v2";
const EXHIBITIONS_URL = `${API_BASE}/exhibitions?per_page=20&_embed`;

const USER_AGENT =
  "ArtSea Bot/1.0 (+https://artsea.london/about) - London art events aggregator";

interface WPExhibition {
  id: number;
  slug: string;
  link: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
    }>;
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, " ")
    .trim();
}

export const saatchiScraper: VenueScraper = {
  venueSlug: "saatchi-gallery",

  async scrape(): Promise<ScrapedEvent[]> {
    console.log("Scraping Saatchi Gallery (WP REST API)...");
    const events: ScrapedEvent[] = [];
    const seen = new Set<string>();

    try {
      const response = await fetch(EXHIBITIONS_URL, {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} fetching Saatchi API`);
      }

      const exhibitions: WPExhibition[] = await response.json();

      for (const ex of exhibitions) {
        const sourceUrl = ex.link;
        if (seen.has(sourceUrl)) continue;
        seen.add(sourceUrl);

        const title = stripHtml(ex.title.rendered);
        if (!title || title.length < 3) continue;

        const description = stripHtml(ex.excerpt.rendered);

        // Image from embedded featured media
        const imageUrl =
          ex._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

        events.push({
          title: title.slice(0, 200),
          description: (description || "").slice(0, 500),
          eventType: inferEventType(title, description),
          startDate: new Date().toISOString().split("T")[0],
          endDate: null,
          imageUrl,
          sourceUrl,
          isFree: null,
        });
      }
    } catch (error) {
      console.error("Error scraping Saatchi Gallery:", error);
    }

    console.log(`  Found ${events.length} events from Saatchi Gallery`);
    return events;
  },
};
