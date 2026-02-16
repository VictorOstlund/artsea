import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — ArtSea",
  description:
    "ArtSea aggregates art and creative event listings from major London galleries and cultural venues.",
  openGraph: {
    title: "About — ArtSea",
    description:
      "ArtSea aggregates art and creative event listings from major London galleries and cultural venues.",
    type: "website",
    locale: "en_GB",
  },
};

const VENUES = [
  { name: "Barbican Centre", url: "https://www.barbican.org.uk" },
  { name: "V&A Museum", url: "https://www.vam.ac.uk" },
  { name: "Tate Modern", url: "https://www.tate.org.uk" },
  { name: "Southbank Centre", url: "https://www.southbankcentre.co.uk" },
];

export default function AboutPage() {
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

      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        About ArtSea
      </h1>

      <div className="mt-6 space-y-4 text-gray-700 leading-relaxed">
        <p>
          ArtSea is a free discovery platform for art and creative events
          happening across London. We automatically aggregate public event
          listings from major galleries and cultural venues, so you can find
          everything in one place.
        </p>
        <p>
          Events are updated daily. Every listing links back to the original
          venue page where you can find full details and book tickets.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">
        Venues we cover
      </h2>
      <ul className="mt-4 space-y-2">
        {VENUES.map((venue) => (
          <li key={venue.url}>
            <a
              href={venue.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-gray-900 hover:underline"
            >
              {venue.name}
            </a>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-xl font-semibold text-gray-900">Attribution</h2>
      <p className="mt-4 text-gray-700 leading-relaxed">
        All event information is sourced from publicly available listings on
        venue websites. We respect each venue&apos;s robots.txt directives and
        link back to original sources. ArtSea is not affiliated with any of the
        venues listed.
      </p>
    </div>
  );
}
