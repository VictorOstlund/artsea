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

const AREAS = ["Central", "East", "South", "West", "North"];

const DATE_RANGES = [
  { value: "", label: "Any date" },
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "weekend", label: "This weekend" },
  { value: "month", label: "This month" },
];

interface FilterBarProps {
  venues: Array<{ slug: string; name: string }>;
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

  const clearAll = useCallback(() => {
    router.push("/");
  }, [router]);

  const hasFilters = currentType || currentArea || currentDate || currentVenue;

  return (
    <div className="space-y-4">
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
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            name="q"
            defaultValue={currentSearch}
            placeholder="Search events..."
            className="w-full rounded-xl border border-edge bg-input py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-subtle focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </form>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <select
          value={currentType}
          onChange={(e) => updateParams("type", e.target.value)}
          className="rounded-full border border-edge bg-input px-4 py-2 text-sm text-foreground focus:border-accent focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        <select
          value={currentDate}
          onChange={(e) => updateParams("date", e.target.value)}
          className="rounded-full border border-edge bg-input px-4 py-2 text-sm text-foreground focus:border-accent focus:outline-none transition-colors cursor-pointer"
        >
          {DATE_RANGES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={currentArea}
          onChange={(e) => updateParams("area", e.target.value)}
          className="rounded-full border border-edge bg-input px-4 py-2 text-sm text-foreground focus:border-accent focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All areas</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {a} London
            </option>
          ))}
        </select>

        <select
          value={currentVenue}
          onChange={(e) => updateParams("venue", e.target.value)}
          className="rounded-full border border-edge bg-input px-4 py-2 text-sm text-foreground focus:border-accent focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All venues</option>
          {venues.map((v) => (
            <option key={v.slug} value={v.slug}>
              {v.name}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="rounded-full border border-edge bg-tag px-4 py-2 text-sm text-tag-text hover:text-foreground transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
