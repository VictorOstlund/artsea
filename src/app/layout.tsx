import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "ArtSea — London Art Events",
  description:
    "Discover art exhibitions, theatre, dance, workshops, and creative events happening across London. Updated daily from major galleries and cultural venues.",
  openGraph: {
    title: "ArtSea — London Art Events",
    description:
      "Discover art exhibitions, theatre, dance, workshops, and creative events happening across London.",
    type: "website",
    locale: "en_GB",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('artsea-theme');if(t)document.documentElement.setAttribute('data-theme',t)})()`,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased bg-surface`}
      >
        <header className="sticky top-0 z-50 border-b border-edge bg-surface/80 backdrop-blur-lg">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
            <Link href="/" className="group block">
              <h1 className="font-serif text-2xl font-bold tracking-tight text-foreground">
                ArtSea
              </h1>
              <p className="text-xs tracking-widest uppercase text-muted">
                London Art Events
              </p>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/about"
                className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              >
                About
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</main>

        <footer className="border-t border-edge bg-surface-alt mt-20">
          <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-semibold text-foreground">
                  ArtSea
                </p>
                <p className="mt-1 text-sm text-muted">
                  Aggregating public event listings from London cultural venues.
                </p>
              </div>
              <div className="flex items-center gap-6 text-sm text-muted">
                <Link
                  href="/about"
                  className="transition-colors hover:text-foreground"
                >
                  About
                </Link>
              </div>
            </div>
            <p className="mt-6 text-xs text-subtle">
              All events link back to their original source. ArtSea is not
              affiliated with any venue listed.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
