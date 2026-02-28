import Image from "next/image";
import Link from "next/link";

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

export function formatDateRange(
  startDate: string,
  endDate: string | null,
): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });

  const start = new Date(startDate + "T00:00:00");

  if (!endDate) {
    return formatter.format(start);
  }

  const end = new Date(endDate + "T00:00:00");
  const startShort = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "Europe/London",
  }).format(start);

  return `${startShort} — ${formatter.format(end)}`;
}

interface EventCardProps {
  title: string;
  venueName: string;
  startDate: string;
  endDate: string | null;
  eventType: string;
  imageUrl: string | null;
  slug: string;
  sourceUrl: string;
  isFree: boolean | null;
  isSoldOut: boolean | null;
}

export function EventCard({
  title,
  venueName,
  startDate,
  endDate,
  eventType,
  imageUrl,
  slug,
  isFree,
  isSoldOut,
}: EventCardProps) {
  const typeLabel = EVENT_TYPE_LABELS[eventType] || eventType;
  const soldOut = isSoldOut === true;

  return (
    <Link
      href={`/events/${slug}`}
      className={`group block overflow-hidden rounded-xl bg-card card-shadow transition-all duration-300 hover:card-shadow-hover hover:scale-[1.02] ${soldOut ? "opacity-60 grayscale-[30%]" : ""}`}
    >
      {/* Image */}
      <div className="aspect-[3/2] bg-surface-alt relative overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-subtle">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
              />
            </svg>
          </div>
        )}
        {/* Type badge */}
        <span className="absolute bottom-3 left-3 rounded-full bg-badge-overlay backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground">
          {typeLabel}
        </span>
        {/* Status badges */}
        {soldOut ? (
          <span className="absolute top-3 right-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-medium text-surface">
            Sold Out
          </span>
        ) : isFree === true ? (
          <span className="absolute top-3 right-3 rounded-full bg-badge-overlay backdrop-blur-sm px-3 py-1 text-xs font-medium text-foreground">
            Free
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors duration-200">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted">{venueName}</p>
        <p className="mt-1 text-sm text-subtle">
          {formatDateRange(startDate, endDate)}
        </p>
      </div>
    </Link>
  );
}
