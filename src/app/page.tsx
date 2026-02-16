import { db } from "@/lib/db";
import { events, venues } from "@/lib/schema";
import { eq, gte, lte, asc, and, sql, desc } from "drizzle-orm";
import { EventCard } from "@/components/EventCard";
import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { Suspense } from "react";

function getDateRange(range: string): { start: string; end?: string } {
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  switch (range) {
    case "today":
      return { start: today, end: today };
    case "week": {
      const endOfWeek = new Date(now);
      endOfWeek.setDate(now.getDate() + (7 - now.getDay()));
      return { start: today, end: endOfWeek.toISOString().split("T")[0] };
    }
    case "weekend": {
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (6 - now.getDay()));
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      return {
        start: saturday.toISOString().split("T")[0],
        end: sunday.toISOString().split("T")[0],
      };
    }
    case "month": {
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return { start: today, end: endOfMonth.toISOString().split("T")[0] };
    }
    default:
      return { start: today };
  }
}

async function getFilteredEvents(searchParams: {
  type?: string;
  area?: string;
  date?: string;
  venue?: string;
  q?: string;
}) {
  const { type, area, date, venue, q } = searchParams;
  const dateRange = getDateRange(date || "");

  const conditions = [gte(events.startDate, dateRange.start)];

  if (dateRange.end) {
    conditions.push(lte(events.startDate, dateRange.end));
  }
  if (type) {
    conditions.push(eq(events.eventType, type));
  }
  if (area) {
    conditions.push(eq(venues.area, area));
  }
  if (venue) {
    conditions.push(eq(venues.slug, venue));
  }

  // Full-text search
  if (q) {
    conditions.push(
      sql`to_tsvector('english', ${events.title} || ' ' || ${events.description}) @@ plainto_tsquery('english', ${q})`,
    );
  }

  const orderBy = q
    ? [
        desc(
          sql`ts_rank(to_tsvector('english', ${events.title} || ' ' || ${events.description}), plainto_tsquery('english', ${q}))`,
        ),
        asc(events.startDate),
      ]
    : [asc(events.startDate)];

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
      venueName: venues.name,
      venueSlug: venues.slug,
    })
    .from(events)
    .innerJoin(venues, eq(events.venueId, venues.id))
    .where(and(...conditions))
    .orderBy(...orderBy);
}

async function getAllVenues() {
  return db
    .select({ slug: venues.slug, name: venues.name })
    .from(venues)
    .orderBy(asc(venues.name));
}

type Props = {
  searchParams: Promise<{
    type?: string;
    area?: string;
    date?: string;
    venue?: string;
    q?: string;
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const [filteredEvents, allVenues] = await Promise.all([
    getFilteredEvents(params),
    getAllVenues(),
  ]);

  const hasFilters =
    params.type || params.area || params.date || params.venue || params.q;

  return (
    <div>
      <div className="mb-8">
        <Suspense>
          <FilterBar venues={allVenues} />
        </Suspense>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-500">
          {filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}
          {hasFilters ? " matching your filters" : " across London"}
        </p>
      </div>

      {filteredEvents.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              venueName={event.venueName}
              startDate={event.startDate}
              endDate={event.endDate}
              eventType={event.eventType}
              imageUrl={event.imageUrl}
              slug={event.slug}
              sourceUrl={event.sourceUrl}
              isFree={event.isFree}
            />
          ))}
        </div>
      )}
    </div>
  );
}
