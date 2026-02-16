import {
  pgTable,
  uuid,
  text,
  date,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const venues = pgTable("venues", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  websiteUrl: text("website_url").notNull(),
  area: text("area").notNull(), // 'Central' | 'East' | 'South' | 'West' | 'North'
  scraperModule: text("scraper_module"),
});

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    eventType: text("event_type").notNull(), // 'visual-arts' | 'theatre' | 'dance' | 'workshop' | 'talk' | 'market' | 'film' | 'music'
    startDate: date("start_date").notNull(),
    endDate: date("end_date"),
    imageUrl: text("image_url"),
    sourceUrl: text("source_url").notNull(),
    isFree: boolean("is_free"),
    isSoldOut: boolean("is_sold_out"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    sourceHash: text("source_hash").notNull(),
  },
  (table) => [
    index("events_search_idx").using(
      "gin",
      sql`to_tsvector('english', ${table.title} || ' ' || ${table.description})`,
    ),
    index("events_start_date_idx").on(table.startDate),
    index("events_venue_id_idx").on(table.venueId),
    index("events_event_type_idx").on(table.eventType),
  ],
);
