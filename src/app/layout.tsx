import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
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
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 flex items-center justify-between">
            <Link href="/" className="block">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                ArtSea
              </h1>
              <p className="mt-1 text-sm text-gray-500">London Art Events</p>
            </Link>
            <Link
              href="/about"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              About
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
        <footer className="border-t border-gray-200 bg-white mt-16">
          <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <p className="text-sm text-gray-400">
              ArtSea aggregates public event listings from London cultural
              venues. All events link back to their original source.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
