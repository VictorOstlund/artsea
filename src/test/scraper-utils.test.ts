import { describe, it, expect } from "vitest";
import { createHash } from "crypto";

// Test the slugify and hash functions used across scrapers
function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80)
    .replace(/^-|-$/g, "");
}

function hashSource(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

describe("slugify", () => {
  it("converts simple title to slug", () => {
    expect(slugify("Yoko Ono Exhibition")).toBe("yoko-ono-exhibition");
  });

  it("removes special characters", () => {
    expect(slugify("Hallyu! The Korean Wave")).toBe("hallyu-the-korean-wave");
  });

  it("handles colons and punctuation", () => {
    expect(slugify("Artist Talk: Olafur Eliasson")).toBe(
      "artist-talk-olafur-eliasson",
    );
  });

  it("collapses multiple spaces and hyphens", () => {
    expect(slugify("Some   Event --- Title")).toBe("some-event-title");
  });

  it("truncates to 80 characters", () => {
    const longTitle = "A".repeat(100);
    expect(slugify(longTitle).length).toBeLessThanOrEqual(80);
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles unicode characters", () => {
    expect(slugify("Café & Résumé")).toBe("caf-rsum");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });
});

describe("hashSource", () => {
  it("produces consistent hash for same URL", () => {
    const hash1 = hashSource("https://example.com/event/1");
    const hash2 = hashSource("https://example.com/event/1");
    expect(hash1).toBe(hash2);
  });

  it("produces different hash for different URLs", () => {
    const hash1 = hashSource("https://example.com/event/1");
    const hash2 = hashSource("https://example.com/event/2");
    expect(hash1).not.toBe(hash2);
  });

  it("produces 16-character hex string", () => {
    const hash = hashSource("https://example.com");
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
  });
});
