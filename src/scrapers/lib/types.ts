export interface ScrapedEvent {
  title: string;
  description: string;
  eventType: string;
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  isFree: boolean | null;
}

export interface VenueScraper {
  venueSlug: string;
  scrape(): Promise<ScrapedEvent[]>;
}
