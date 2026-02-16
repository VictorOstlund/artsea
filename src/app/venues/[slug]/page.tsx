import { db } from "@/lib/db";
import { events, venues } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { EventCard } from "@/components/EventCard";
import { EmptyState } from "@/components/EmptyState";
import type { Metadata } from "next";

async function getVenue(slug: string) {
  const result = await db
    .select()
    .from(venues)
    .where(eq(venues.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

async function getVenueEvents(venueId: string) {
  return db
    .select({
      id: events.id,
      title: events.title,
      slug: events.slug,
      description: events.description,
      eventType: events.eventType,
      startDate: events.startDate,
      endDate: events.endDate,
      imageUrl: events.imageUrl,
      sourceUrl: events.sourceUrl,
      isFree: events.isFree,
      isSoldOut: events.isSoldOut,
    })
    .from(events)
    .where(eq(events.venueId, venueId))
    .orderBy(asc(events.startDate));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) return { title: "Venue Not Found — ArtSea" };
  return {
    title: `${venue.name} — ArtSea`,
    description: `Upcoming art and creative events at ${venue.name}, ${venue.area} London.`,
    openGraph: {
      title: `${venue.name} — ArtSea`,
      description: `Upcoming art and creative events at ${venue.name}, ${venue.area} London.`,
      type: "website",
      locale: "en_GB",
    },
  };
}

export default async function VenuePage({ params }: Props) {
  const { slug } = await params;
  const venue = await getVenue(slug);
  if (!venue) notFound();

  const venueEvents = await getVenueEvents(venue.id);

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg
          className="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to events
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {venue.name}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span>{venue.area} London</span>
          <span className="text-gray-300">·</span>
          <a
            href={venue.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:underline"
          >
            Visit website
          </a>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {venueEvents.length} upcoming event{venueEvents.length !== 1 ? "s" : ""}
      </h2>

      {venueEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {venueEvents.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              venueName={venue.name}
              startDate={event.startDate}
              endDate={event.endDate}
              eventType={event.eventType}
              imageUrl={event.imageUrl}
              slug={event.slug}
              sourceUrl={event.sourceUrl}
              isFree={event.isFree}
              isSoldOut={event.isSoldOut}
            />
          ))}
        </div>
      )}
    </div>
  );
}
