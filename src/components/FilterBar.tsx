"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const EVENT_TYPES = [
  { value: "visual-arts", label: "Visual Arts" },
  { value: "theatre", label: "Theatre" },
  { value: "dance", label: "Dance" },
  { value: "workshop", label: "Workshop" },
  { value: "talk", label: "Talk" },
  { value: "market", label: "Market" },
  { value: "film", label: "Film" },
  { value: "music", label: "Music" },
];

const AREAS = [
  { value: "Central", label: "Central" },
  { value: "East", label: "East" },
  { value: "South", label: "South" },
  { value: "West", label: "West" },
  { value: "North", label: "North" },
];

const DATE_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "weekend", label: "Weekend" },
  { value: "month", label: "This Month" },
];

interface FilterBarProps {
  venues: Array<{ slug: string; name: string }>;
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase transition-all duration-200 cursor-pointer ${
        active
          ? "bg-accent text-white"
          : "border border-edge text-muted hover:border-accent hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

export function FilterBar({ venues }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "";
  const currentArea = searchParams.get("area") || "";
  const currentDate = searchParams.get("date") || "";
  const currentVenue = searchParams.get("venue") || "";
  const currentSearch = searchParams.get("q") || "";

  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams],
  );

  const toggleParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`/?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearAll = useCallback(() => {
    router.push("/");
  }, [router]);

  const hasFilters =
    currentType || currentArea || currentDate || currentVenue || currentSearch;

  return (
    <div className="space-y-5">
      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          updateParams("q", formData.get("q") as string);
        }}
      >
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={currentSearch}
            placeholder="Search events..."
            className="w-full border-b border-edge bg-transparent py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      </form>

      {/* Date chips */}
      <div className="flex gap-2 overflow-x-auto chip-scroll pb-1">
        {DATE_RANGES.map((d) => (
          <Chip
            key={d.value}
            label={d.label}
            active={currentDate === d.value}
            onClick={() => toggleParam("date", d.value)}
          />
        ))}
        <span className="mx-1 self-center text-edge-subtle">|</span>
        {EVENT_TYPES.map((t) => (
          <Chip
            key={t.value}
            label={t.label}
            active={currentType === t.value}
            onClick={() => toggleParam("type", t.value)}
          />
        ))}
      </div>

      {/* Area + Venue chips */}
      <div className="flex gap-2 overflow-x-auto chip-scroll pb-1">
        {AREAS.map((a) => (
          <Chip
            key={a.value}
            label={a.label}
            active={currentArea === a.value}
            onClick={() => toggleParam("area", a.value)}
          />
        ))}
        <span className="mx-1 self-center text-edge-subtle">|</span>
        {venues.map((v) => (
          <Chip
            key={v.slug}
            label={v.name}
            active={currentVenue === v.slug}
            onClick={() => toggleParam("venue", v.slug)}
          />
        ))}
        {hasFilters && (
          <>
            <span className="mx-1 self-center text-edge-subtle">|</span>
            <button
              onClick={clearAll}
              className="shrink-0 rounded-full px-4 py-1.5 text-xs font-medium tracking-wide uppercase text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </>
        )}
      </div>
    </div>
  );
}
