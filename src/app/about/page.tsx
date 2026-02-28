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
  { name: "National Gallery", url: "https://www.nationalgallery.org.uk" },
  { name: "Design Museum", url: "https://designmuseum.org" },
  { name: "Whitechapel Gallery", url: "https://www.whitechapelgallery.org" },
  { name: "Somerset House", url: "https://www.somersethouse.org.uk" },
  { name: "Serpentine Galleries", url: "https://www.serpentinegalleries.org" },
  { name: "Saatchi Gallery", url: "https://www.saatchigallery.com" },
  {
    name: "Hayward Gallery",
    url: "https://www.southbankcentre.co.uk/venues/hayward-gallery",
  },
  { name: "Royal Academy of Arts", url: "https://www.royalacademy.org.uk" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/"
        className="inline-flex items-center text-xs font-medium tracking-[0.08em] uppercase text-muted hover:text-foreground transition-colors mb-10"
      >
        <svg
          className="mr-1.5 h-3.5 w-3.5"
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

      <p className="text-xs font-medium tracking-[0.15em] uppercase text-accent mb-4">
        About
      </p>
      <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
        About ArtSea
      </h1>
      <div className="accent-rule mt-6 mb-10" />

      <div className="space-y-5 text-muted leading-relaxed text-[1.05rem]">
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

      <section className="mt-16">
        <p className="text-xs font-medium tracking-[0.15em] uppercase text-accent mb-4">
          Venues
        </p>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Venues we cover
        </h2>
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VENUES.map((venue) => (
            <li key={venue.url}>
              <a
                href={venue.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted hover:text-accent transition-colors"
              >
                {venue.name}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-16 border-t border-edge pt-10">
        <p className="text-xs font-medium tracking-[0.15em] uppercase text-accent mb-4">
          Credits
        </p>
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          Attribution
        </h2>
        <p className="mt-4 text-muted leading-relaxed">
          Event information is sourced from publicly available listings on venue
          websites and third-party listing platforms including{" "}
          <a
            href="https://www.timeout.com/london"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover transition-colors"
          >
            TimeOut London
          </a>
          . Every listing links back to its original source. ArtSea is not
          affiliated with any of the venues or platforms listed.
        </p>
      </section>
    </div>
  );
}
