/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const EVENT_TYPE_COLORS: Record<string, string> = {
  "visual-arts": "bg-violet-100 text-violet-700",
  theatre: "bg-rose-100 text-rose-700",
  dance: "bg-pink-100 text-pink-700",
  workshop: "bg-amber-100 text-amber-700",
  talk: "bg-sky-100 text-sky-700",
  market: "bg-emerald-100 text-emerald-700",
  film: "bg-indigo-100 text-indigo-700",
  music: "bg-orange-100 text-orange-700",
};

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
}: EventCardProps) {
  const typeColor = EVENT_TYPE_COLORS[eventType] || "bg-gray-100 text-gray-700";
  const typeLabel = EVENT_TYPE_LABELS[eventType] || eventType;

  return (
    <Link
      href={`/events/${slug}`}
      className="group block overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-shadow hover:shadow-md"
    >
      {/* Image area */}
      <div className="aspect-[16/9] bg-gray-100 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
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
        <span
          className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColor}`}
        >
          {typeLabel}
        </span>
        {isFree === true && (
          <span className="absolute top-3 right-3 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Free
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 group-hover:text-gray-700 line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">{venueName}</p>
        <p className="mt-2 text-sm text-gray-600">
          {formatDateRange(startDate, endDate)}
        </p>
      </div>
    </Link>
  );
}
