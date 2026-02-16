import { db } from "@/lib/db";
import { events, venues } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

const EVENT_TYPE_LABELS: Record<string, string> = {
  "visual-arts": "Visual Arts",
  theatre: "Theatre",
  dance: "Dance",
  workshop: "Workshop",
  talk: "Talk",
  market: "Market",
  film: "Film",
  music: "Music",
};

function formatDateRange(startDate: string, endDate: string | null): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
  const start = new Date(startDate + "T00:00:00");
  if (!endDate) return formatter.format(start);
  const end = new Date(endDate + "T00:00:00");
  return `${formatter.format(start)} — ${formatter.format(end)}`;
}

async function getEvent(slug: string) {
  const result = await db
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
      venueName: venues.name,
      venueSlug: venues.slug,
      venueArea: venues.area,
    })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(eq(events.slug, slug))
    .limit(1);
  return result[0] ?? null;
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event Not Found — ArtSea" };
  return {
    title: `${event.title} — ArtSea`,
    description: event.description || `${event.title} at ${event.venueName}`,
    openGraph: {
      title: event.title,
      description: event.description || `${event.title} at ${event.venueName}`,
      type: "article",
      locale: "en_GB",
    },
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const typeLabel = EVENT_TYPE_LABELS[event.eventType] || event.eventType;

  return (
    <div className="mx-auto max-w-2xl">
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

      {event.imageUrl && (
        <div className="aspect-[16/9] overflow-hidden rounded-lg bg-gray-100 mb-6 relative">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            priority
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          {typeLabel}
        </span>
        {event.isFree === true && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Free
          </span>
        )}
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        {event.title}
      </h1>

      <div className="mt-4 space-y-2">
        <p className="text-base text-gray-600">
          {formatDateRange(event.startDate, event.endDate)}
        </p>
        <p className="text-base text-gray-600">
          <Link
            href={`/venues/${event.venueSlug}`}
            className="font-medium text-gray-900 hover:underline"
          >
            {event.venueName}
          </Link>
          <span className="text-gray-400"> · {event.venueArea} London</span>
        </p>
      </div>

      {event.description && (
        <div className="mt-6 prose prose-gray max-w-none">
          <p className="text-gray-700 leading-relaxed">{event.description}</p>
        </div>
      )}

      <div className="mt-8">
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
        >
          View on {event.venueName}
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}
