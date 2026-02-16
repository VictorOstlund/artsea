import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { createHash } from "crypto";
import * as schema from "../lib/schema";

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

const venueData = [
  {
    name: "Barbican Centre",
    slug: "barbican-centre",
    websiteUrl: "https://www.barbican.org.uk",
    area: "Central",
  },
  {
    name: "V&A Museum",
    slug: "va-museum",
    websiteUrl: "https://www.vam.ac.uk",
    area: "Central",
  },
  {
    name: "Tate Modern",
    slug: "tate-modern",
    websiteUrl: "https://www.tate.org.uk",
    area: "South",
  },
  {
    name: "Southbank Centre",
    slug: "southbank-centre",
    websiteUrl: "https://www.southbankcentre.co.uk",
    area: "South",
  },
];

const eventsByVenue: Record<
  string,
  Array<{
    title: string;
    description: string;
    eventType: string;
    startDate: string;
    endDate: string | null;
    isFree: boolean | null;
    sourceUrl: string;
  }>
> = {
  "barbican-centre": [
    {
      title: "Yoko Ono: Music of the Mind",
      description:
        "A major retrospective exploring seven decades of Yoko Ono's groundbreaking art, music, film, and activism.",
      eventType: "visual-arts",
      startDate: "2026-03-01",
      endDate: "2026-06-15",
      isFree: false,
      sourceUrl:
        "https://www.barbican.org.uk/whats-on/2026/event/yoko-ono-music-of-the-mind",
    },
    {
      title: "London Contemporary Orchestra: Steve Reich",
      description:
        "An evening of Steve Reich's minimalist masterpieces performed live in the Barbican Hall.",
      eventType: "music",
      startDate: "2026-03-22",
      endDate: null,
      isFree: false,
      sourceUrl:
        "https://www.barbican.org.uk/whats-on/2026/event/lco-steve-reich",
    },
    {
      title: "Barbican Open Workshop: Printmaking",
      description:
        "Drop-in printmaking workshop open to all skill levels. Materials provided.",
      eventType: "workshop",
      startDate: "2026-04-05",
      endDate: null,
      isFree: true,
      sourceUrl:
        "https://www.barbican.org.uk/whats-on/2026/event/open-workshop-printmaking",
    },
  ],
  "va-museum": [
    {
      title: "Hallyu! The Korean Wave",
      description:
        "Explore the global phenomenon of Korean culture, from K-pop and K-drama to fashion, beauty, and cinema.",
      eventType: "visual-arts",
      startDate: "2026-03-10",
      endDate: "2026-07-20",
      isFree: false,
      sourceUrl: "https://www.vam.ac.uk/exhibitions/hallyu-the-korean-wave",
    },
    {
      title: "Friday Late: Neon Dreams",
      description:
        "The V&A stays open late with live music, DJ sets, workshops, and pop-up performances inspired by neon art.",
      eventType: "music",
      startDate: "2026-03-27",
      endDate: null,
      isFree: true,
      sourceUrl: "https://www.vam.ac.uk/event/friday-late-neon-dreams",
    },
    {
      title: "Ceramics Masterclass: Raku Firing",
      description:
        "Learn the ancient Japanese technique of raku firing in this hands-on masterclass led by expert potters.",
      eventType: "workshop",
      startDate: "2026-04-12",
      endDate: null,
      isFree: false,
      sourceUrl: "https://www.vam.ac.uk/event/ceramics-masterclass-raku",
    },
  ],
  "tate-modern": [
    {
      title: "Zanele Muholi: Faces and Phases",
      description:
        "A powerful photographic series documenting the lives of Black LGBTQIA+ individuals in South Africa.",
      eventType: "visual-arts",
      startDate: "2026-03-05",
      endDate: "2026-05-30",
      isFree: false,
      sourceUrl:
        "https://www.tate.org.uk/whats-on/tate-modern/zanele-muholi-faces-and-phases",
    },
    {
      title: "Artist Talk: Olafur Eliasson on Light and Space",
      description:
        "Join Olafur Eliasson for a talk about his practice exploring perception, movement, and embodied experience.",
      eventType: "talk",
      startDate: "2026-03-18",
      endDate: null,
      isFree: false,
      sourceUrl:
        "https://www.tate.org.uk/whats-on/tate-modern/olafur-eliasson-talk",
    },
    {
      title: "Tate Lates: Sound and Vision",
      description:
        "After-hours event with live performances, film screenings, and immersive sound installations throughout the galleries.",
      eventType: "film",
      startDate: "2026-04-03",
      endDate: null,
      isFree: true,
      sourceUrl:
        "https://www.tate.org.uk/whats-on/tate-modern/tate-lates-sound-and-vision",
    },
  ],
  "southbank-centre": [
    {
      title: "Imagine Children's Festival 2026",
      description:
        "A week-long festival of family-friendly theatre, music, dance, and storytelling for children of all ages.",
      eventType: "theatre",
      startDate: "2026-03-14",
      endDate: "2026-03-22",
      isFree: null,
      sourceUrl:
        "https://www.southbankcentre.co.uk/whats-on/festivals/imagine-childrens-festival",
    },
    {
      title: "Purcell Room: New Voices in Dance",
      description:
        "Emerging choreographers present bold new works blending contemporary and traditional dance forms.",
      eventType: "dance",
      startDate: "2026-04-08",
      endDate: null,
      isFree: false,
      sourceUrl:
        "https://www.southbankcentre.co.uk/whats-on/new-voices-in-dance",
    },
    {
      title: "Hayward Gallery: Light Play",
      description:
        "An exhibition exploring how contemporary artists use light as a medium, featuring immersive installations.",
      eventType: "visual-arts",
      startDate: "2026-03-20",
      endDate: "2026-06-01",
      isFree: false,
      sourceUrl:
        "https://www.southbankcentre.co.uk/whats-on/hayward-gallery-light-play",
    },
  ],
};

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("Seeding venues...");

  // Insert venues and collect their IDs
  const venueIds: Record<string, string> = {};
  for (const venue of venueData) {
    const result = await db
      .insert(schema.venues)
      .values(venue)
      .onConflictDoUpdate({
        target: schema.venues.slug,
        set: {
          name: venue.name,
          websiteUrl: venue.websiteUrl,
          area: venue.area,
        },
      })
      .returning({ id: schema.venues.id });
    venueIds[venue.slug] = result[0].id;
    console.log(`  Venue: ${venue.name} (${result[0].id})`);
  }

  console.log("Seeding events...");

  const usedSlugs = new Set<string>();
  for (const [venueSlug, events] of Object.entries(eventsByVenue)) {
    const venueId = venueIds[venueSlug];
    for (const event of events) {
      let slug = slugify(event.title);
      if (usedSlugs.has(slug)) {
        let i = 2;
        while (usedSlugs.has(`${slug}-${i}`)) i++;
        slug = `${slug}-${i}`;
      }
      usedSlugs.add(slug);

      await db
        .insert(schema.events)
        .values({
          venueId,
          title: event.title,
          slug,
          description: event.description,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          isFree: event.isFree,
          sourceUrl: event.sourceUrl,
          sourceHash: hashSource(event.sourceUrl),
        })
        .onConflictDoUpdate({
          target: schema.events.slug,
          set: {
            title: event.title,
            description: event.description,
            eventType: event.eventType,
            startDate: event.startDate,
            endDate: event.endDate,
            isFree: event.isFree,
            sourceUrl: event.sourceUrl,
            sourceHash: hashSource(event.sourceUrl),
            updatedAt: new Date(),
          },
        });
      console.log(`  Event: ${event.title} (${slug})`);
    }
  }

  console.log("Seeding complete! 4 venues, 12 events.");
}

main().catch(console.error);
