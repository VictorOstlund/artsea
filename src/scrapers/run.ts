import "dotenv/config";
import { barbicanScraper } from "./venues/barbican";
import { vandaScraper } from "./venues/vanda";
import { tateScraper } from "./venues/tate";
import { southbankScraper } from "./venues/southbank";
import { upsertEvents } from "./lib/db";
import type { VenueScraper } from "./lib/types";

const scrapers: VenueScraper[] = [
  barbicanScraper,
  vandaScraper,
  tateScraper,
  southbankScraper,
];

async function main() {
  console.log("=== ArtSea Scraper ===");
  console.log(`Started at ${new Date().toISOString()}\n`);

  const results: Array<{
    venue: string;
    scraped: number;
    inserted: number;
    updated: number;
    errors: number;
  }> = [];

  for (const scraper of scrapers) {
    try {
      const events = await scraper.scrape();

      if (events.length > 0) {
        const { inserted, updated, errors } = await upsertEvents(
          scraper.venueSlug,
          events,
        );
        results.push({
          venue: scraper.venueSlug,
          scraped: events.length,
          inserted,
          updated,
          errors,
        });
        console.log(
          `  DB: ${inserted} inserted, ${updated} updated, ${errors} errors\n`,
        );
      } else {
        results.push({
          venue: scraper.venueSlug,
          scraped: 0,
          inserted: 0,
          updated: 0,
          errors: 0,
        });
        console.log(`  No events found\n`);
      }
    } catch (error) {
      console.error(`  FAILED: ${error}\n`);
      results.push({
        venue: scraper.venueSlug,
        scraped: 0,
        inserted: 0,
        updated: 0,
        errors: 1,
      });
    }
  }

  console.log("=== Summary ===");
  console.table(results);

  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0);
  if (totalErrors > 0) {
    console.log(`\nWarning: ${totalErrors} error(s) occurred during scraping`);
    process.exit(1);
  }

  console.log("\nScraping complete!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
