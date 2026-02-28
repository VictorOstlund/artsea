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
      isSoldOut: events.isSoldOut,
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
    <div className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted hover:text-foreground transition-colors mb-8"
      >
        <svg
          className="mr-1.5 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to events
      </Link>

      {event.imageUrl && (
        <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-surface-alt mb-8 relative">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-5">
        <span className="rounded-full bg-tag px-3 py-1 text-xs font-medium text-tag-text">
          {typeLabel}
        </span>
        {event.isSoldOut === true && (
          <span className="rounded-full bg-foreground px-3 py-1 text-xs font-medium text-surface">
            Sold Out
          </span>
        )}
        {event.isFree === true && (
          <span className="rounded-full bg-tag px-3 py-1 text-xs font-medium text-accent">
            Free
          </span>
        )}
      </div>

      <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
        {event.title}
      </h1>

      <div className="mt-5 space-y-2">
        <p className="text-base text-muted">
          {formatDateRange(event.startDate, event.endDate)}
        </p>
        <p className="text-base text-muted">
          <Link
            href={`/venues/${event.venueSlug}`}
            className="font-medium text-foreground hover:text-accent transition-colors"
          >
            {event.venueName}
          </Link>
          <span className="text-subtle"> · {event.venueArea} London</span>
        </p>
      </div>

      {event.description && (
        <div className="mt-8">
          <p className="text-muted leading-relaxed text-[1.05rem]">
            {event.description}
          </p>
        </div>
      )}

      <div className="mt-10">
        <a
          href={event.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-xl bg-accent px-6 py-3 text-sm font-medium text-white hover:bg-accent-hover transition-colors"
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
