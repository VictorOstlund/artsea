import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollHeader } from "@/components/ScrollHeader";
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
        <ScrollHeader>
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-10">
            <Link href="/" className="group block">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                ArtSea
              </span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/about"
                className="text-xs font-medium tracking-widest uppercase text-muted transition-colors hover:text-foreground"
              >
                About
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </ScrollHeader>

        <main className="mx-auto max-w-7xl px-6 py-12 sm:px-10">
          {children}
        </main>

        <footer className="border-t border-edge bg-surface-alt mt-24">
          <div className="mx-auto max-w-7xl px-6 py-10 sm:px-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-serif text-lg font-semibold text-foreground">
                  ArtSea
                </p>
                <p className="mt-1 text-sm text-muted">
                  London&apos;s art and cultural events, in one place.
                </p>
              </div>
              <div className="flex items-center gap-6">
                <Link
                  href="/about"
                  className="text-xs font-medium tracking-widest uppercase text-muted transition-colors hover:text-foreground"
                >
                  About
                </Link>
              </div>
            </div>
            <p className="mt-8 text-xs text-subtle">
              All events link back to their original source. ArtSea is not
              affiliated with any venue listed.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
