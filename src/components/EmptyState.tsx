export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="accent-rule mb-8" />
      <h2 className="font-serif text-2xl font-semibold text-foreground">
        No upcoming events found
      </h2>
      <p className="mt-3 text-sm text-muted max-w-xs">
        Check back soon — new events are added daily from London&apos;s cultural
        venues.
      </p>
    </div>
  );
}
