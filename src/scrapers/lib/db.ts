import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import * as schema from "../../lib/schema";
import type { ScrapedEvent } from "./types";

export function createDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

function hashSource(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

export async function upsertEvents(
  venueSlug: string,
  events: ScrapedEvent[],
): Promise<{ inserted: number; updated: number; errors: number }> {
  const db = createDb();
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  // Get venue ID
  const venueResult = await db
    .select({ id: schema.venues.id })
    .from(schema.venues)
    .where(eq(schema.venues.slug, venueSlug))
    .limit(1);

  if (venueResult.length === 0) {
    throw new Error(`Venue not found: ${venueSlug}`);
  }
  const venueId = venueResult[0].id;

  // Get existing slugs to avoid collisions
  const existingSlugs = new Set(
    (await db.select({ slug: schema.events.slug }).from(schema.events)).map(
      (r) => r.slug,
    ),
  );

  for (const event of events) {
    try {
      const sourceHash = hashSource(event.sourceUrl);
      let slug = slugify(event.title);

      // Check for collision with other events (not same source)
      const existing = await db
        .select({ id: schema.events.id })
        .from(schema.events)
        .where(eq(schema.events.sourceHash, sourceHash))
        .limit(1);

      if (existing.length > 0) {
        // Update existing event
        await db
          .update(schema.events)
          .set({
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            imageUrl: event.imageUrl,
            sourceUrl: event.sourceUrl,
            isFree: event.isFree,
            isSoldOut: event.isSoldOut,
            updatedAt: new Date(),
          })
          .where(eq(schema.events.id, existing[0].id));
        updated++;
      } else {
        // Handle slug collision
        if (existingSlugs.has(slug)) {
          let i = 2;
          while (existingSlugs.has(`${slug}-${i}`)) i++;
          slug = `${slug}-${i}`;
        }
        existingSlugs.add(slug);

        await db.insert(schema.events).values({
          venueId,
          title: event.title,
          slug,
          description: event.description,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          imageUrl: event.imageUrl,
          sourceUrl: event.sourceUrl,
          isFree: event.isFree,
          isSoldOut: event.isSoldOut,
          sourceHash,
        });
        inserted++;
      }
    } catch (err) {
      console.error(`  Error upserting "${event.title}":`, err);
      errors++;
    }
  }

  return { inserted, updated, errors };
}
