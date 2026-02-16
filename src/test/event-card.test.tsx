import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { EventCard, formatDateRange } from "@/components/EventCard";

afterEach(() => {
  cleanup();
});

describe("formatDateRange", () => {
  it("formats single-day event (no end date)", () => {
    const result = formatDateRange("2026-03-15", null);
    expect(result).toContain("15");
    expect(result).toContain("Mar");
    expect(result).toContain("2026");
  });

  it("formats date range with end date", () => {
    const result = formatDateRange("2026-03-15", "2026-06-20");
    expect(result).toContain("15");
    expect(result).toContain("Mar");
    expect(result).toContain("20");
    expect(result).toContain("Jun");
    expect(result).toContain("2026");
    expect(result).toContain("—");
  });

  it("handles same start and end date", () => {
    const result = formatDateRange("2026-03-15", "2026-03-15");
    expect(result).toContain("15");
    expect(result).toContain("Mar");
  });
});

describe("EventCard", () => {
  const defaultProps = {
    title: "Test Exhibition",
    venueName: "Test Gallery",
    startDate: "2026-03-15",
    endDate: null,
    eventType: "visual-arts",
    imageUrl: null,
    slug: "test-exhibition",
    sourceUrl: "https://example.com/event",
    isFree: null,
    isSoldOut: null,
  };

  it("renders event title", () => {
    render(<EventCard {...defaultProps} />);
    expect(screen.getByText("Test Exhibition")).toBeInTheDocument();
  });

  it("renders venue name", () => {
    render(<EventCard {...defaultProps} />);
    expect(screen.getByText("Test Gallery")).toBeInTheDocument();
  });

  it("renders event type badge", () => {
    render(<EventCard {...defaultProps} />);
    expect(screen.getByText("Visual Arts")).toBeInTheDocument();
  });

  it("renders Free badge when isFree is true", () => {
    render(<EventCard {...defaultProps} isFree={true} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("does not render Free badge when isFree is false", () => {
    render(<EventCard {...defaultProps} isFree={false} />);
    expect(screen.queryByText("Free")).not.toBeInTheDocument();
  });

  it("does not render Free badge when isFree is null", () => {
    render(<EventCard {...defaultProps} isFree={null} />);
    expect(screen.queryByText("Free")).not.toBeInTheDocument();
  });

  it("links to internal event page", () => {
    render(<EventCard {...defaultProps} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/events/test-exhibition");
  });

  it("shows placeholder when no image", () => {
    const { container } = render(
      <EventCard {...defaultProps} imageUrl={null} />,
    );
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("shows image when imageUrl provided", () => {
    render(
      <EventCard {...defaultProps} imageUrl="https://example.com/img.jpg" />,
    );
    const img = screen.getByAltText("Test Exhibition");
    expect(img.getAttribute("src")).toContain(
      "https%3A%2F%2Fexample.com%2Fimg.jpg",
    );
  });

  it("renders Sold Out badge when isSoldOut is true", () => {
    render(<EventCard {...defaultProps} isSoldOut={true} />);
    expect(screen.getByText("Sold Out")).toBeInTheDocument();
  });

  it("applies reduced opacity when sold out", () => {
    const { container } = render(
      <EventCard {...defaultProps} isSoldOut={true} />,
    );
    const link = container.querySelector("a");
    expect(link?.className).toContain("opacity-60");
  });

  it("does not show Free badge when sold out", () => {
    render(<EventCard {...defaultProps} isFree={true} isSoldOut={true} />);
    expect(screen.getByText("Sold Out")).toBeInTheDocument();
    expect(screen.queryByText("Free")).not.toBeInTheDocument();
  });

  it("handles unknown event type gracefully", () => {
    render(<EventCard {...defaultProps} eventType="unknown-type" />);
    expect(screen.getByText("unknown-type")).toBeInTheDocument();
  });
});
