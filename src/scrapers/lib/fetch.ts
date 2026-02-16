const USER_AGENT =
  "ArtSea Bot/1.0 (+https://artsea.london/about) - London art events aggregator";

const DELAY_MS = 2000; // 2 seconds between requests per venue

export async function fetchPage(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-GB,en;q=0.9",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  return response.text();
}

export function delay(ms: number = DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function inferEventType(
  title: string,
  description: string,
  category?: string,
): string {
  const text = `${title} ${description} ${category || ""}`.toLowerCase();

  if (
    text.includes("exhibition") ||
    text.includes("gallery") ||
    text.includes("art") ||
    text.includes("sculpture") ||
    text.includes("painting") ||
    text.includes("photography") ||
    text.includes("installation")
  )
    return "visual-arts";
  if (
    text.includes("theatre") ||
    text.includes("theater") ||
    text.includes("play") ||
    text.includes("drama")
  )
    return "theatre";
  if (
    text.includes("dance") ||
    text.includes("ballet") ||
    text.includes("choreograph")
  )
    return "dance";
  if (
    text.includes("workshop") ||
    text.includes("class") ||
    text.includes("masterclass") ||
    text.includes("course")
  )
    return "workshop";
  if (
    text.includes("talk") ||
    text.includes("lecture") ||
    text.includes("discussion") ||
    text.includes("conversation") ||
    text.includes("panel")
  )
    return "talk";
  if (
    text.includes("market") ||
    text.includes("fair") ||
    text.includes("craft")
  )
    return "market";
  if (
    text.includes("film") ||
    text.includes("cinema") ||
    text.includes("screening") ||
    text.includes("movie")
  )
    return "film";
  if (
    text.includes("concert") ||
    text.includes("music") ||
    text.includes("orchestra") ||
    text.includes("recital") ||
    text.includes("gig") ||
    text.includes("dj")
  )
    return "music";

  return "visual-arts"; // default for gallery/museum venues
}
