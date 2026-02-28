# V&A What's On Page - HTML Structure & Cheerio Selectors

## Overview
The V&A What's On page (`https://www.vam.ac.uk/whatson`) is a static server-rendered page with ~146 events. All events are rendered on the initial page load with no pagination or infinite scroll.

---

## 1. Event Listing Structure

### Container
```
.main.whatson
```

All events are contained within a single `<ul>` list.

### Individual Event Item
```html
<li class="b-event-teaser js-wo-event" id="[event-id]"
    data-wo-type="[type]"
    data-wo-audience="[audience]"
    data-wo-venue="[venue-code]"
    data-wo-free="[free-status]">
  <!-- article content -->
</li>
```

---

## 2. Cheerio Selectors for Event Data Extraction

### List All Events
```javascript
const events = $('li.b-event-teaser.js-wo-event');
```

### Per-Event Data Extraction

#### Event ID
```javascript
const eventId = $('li#john-constable-and-david-lucas-a-unison-of-feeling').attr('id');
// Returns: "john-constable-and-david-lucas-a-unison-of-feeling"
```
**Cheerio selector:**
```javascript
$(event).attr('id')
```

#### Event Type
```javascript
// From data attribute: display, festival, talk, exhibition, etc.
const type = $(event).attr('data-wo-type');
// Returns: "display", "festival", "talk"
```

#### Event Title
```javascript
// Primary source: schema.org meta tag (most reliable)
const title = $(event).find('meta[itemprop="name"]').attr('content');

// Alternative: from h2.b-event-teaser__title
const titleAlt = $(event).find('h2.b-event-teaser__title').text().trim();
// Returns: "John Constable and David Lucas: A Unison of Feeling"
```

#### Event URL
```javascript
const url = $(event).find('a.b-event-teaser__link').attr('href');
// Returns: "/exhibitions/john-constable-and-david-lucas-a-unison-of-feeling"
// Full URL: "https://www.vam.ac.uk" + url
```

#### Image URL
```javascript
// From srcset attribute (responsive images available)
const imageSrcset = $(event).find('img.b-event-teaser__media-image').attr('srcset');

// Or use primary src (smallest resolution)
const imageSrc = $(event).find('img.b-event-teaser__media-image').attr('src');
// Returns: "https://assets-cdn.vam.ac.uk/2025/10/21/10/35/01/ecd0a298-4018-467c-81b3-484db92b0b55/320.jpg"
```

#### Start Date
```javascript
// ISO format from schema.org meta tag
const startDate = $(event).find('meta[itemprop="startDate"]').attr('content');
// Returns: "2025-11-15" or "2026-02-20 11:00:00 +0000"
```

#### End Date
```javascript
const endDate = $(event).find('meta[itemprop="endDate"]').attr('content');
// Returns: "2026-06-14" or "2026-02-20 20:00:00 +0000"
```

#### Description
```javascript
const description = $(event).find('meta[itemprop="description"]').attr('content');
// Returns: Full text description of the event
```

#### Location/Venue
```javascript
// Venue code from data attribute
const venueCode = $(event).attr('data-wo-venue');
// Returns: "south-kensington", "young"

// Full venue name from schema.org
const venueName = $(event).find('meta[itemprop="name"][itemtype*="Place"]')
  .siblings('meta[itemprop="name"]').attr('content');
// Alternative: Extract from displayed text
const venueDisplay = $(event).find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim();
// Returns: "V&A South Kensington", "Young V&A"
```

#### Price/Admission
```javascript
// From schema.org Offer
const price = $(event).find('span[itemprop="price"]').attr('content');
const priceDisplay = $(event).find('span[itemprop="price"]').text().trim();

// Free status from data attribute
const isFree = $(event).attr('data-wo-free') === '';
// Returns: true/false
```

#### Category/Type Display
```javascript
const displayType = $(event).find('.b-event-teaser__type').text().trim();
// Returns: "Display", "Festival", "Talk", "Exhibition"
```

#### Audience Tags
```javascript
const audiences = $(event).attr('data-wo-audience');
// Returns: "for-members evening-event african-heritage" (space-separated)
// Values can be empty string
```

#### Status Badge
```javascript
// Optional: Some events have status badges
const statusBadge = $(event).find('.u-label-tag').text().trim();
// Returns: "Book soon" (if present)
```

---

## 3. Google Analytics DataLayer Structure

### Location
The dataLayer is pushed in a `<script>` tag near the top of the page (after line 73).

### Structure
```javascript
dataLayer.push({
  "pageRole": "whats-on",
  "title": "What's On · Exhibitions, Events & Courses",
  "slug": "whats-on",
  "ecommerce": {
    "impressions": [
      {
        "name": "Friday Late: To Ebb is To Flow",
        "id": 786570534196370,
        "pid": "786570534196370FL",  // Product ID: [id][list-suffix]
        "list": "whats-on - featured", // "whats-on - featured" or "whats-on - main-list"
        "position": 1                   // Position in list
      },
      {
        "name": "February Half Term: Create! Connect! Play!",
        "id": null,                     // null for some events
        "pid": "FL",                    // Falls back to just list suffix
        "list": "whats-on - featured",
        "position": 2
      },
      // ... 146 total impressions
    ]
  }
})
```

### Key Observations
- **Featured List**: Events at top of page (5 items) have `"list": "whats-on - featured"`
- **Main List**: Remaining events have `"list": "whats-on - main-list"`
- **Product ID Format**: `[numeric-id][list-suffix]` where suffix is "FL" (featured) or "ML" (main-list)
- **Missing IDs**: Some events have `id: null`, in which case `pid` is just the suffix
- **Positions**: Reset to 1 for each list section (featured and main-list)

### JavaScript Extraction
```javascript
// Extract from window.dataLayer
const ecommerceData = window.dataLayer[0].ecommerce.impressions;
// OR parse from <script> tag
```

---

## 4. Schema.org Structured Data

Each event includes **full Schema.org Event markup**:

```html
<article itemscope itemprop="event" itemtype="http://schema.org/Event">
  <meta itemprop="name" content="...">
  <meta itemprop="startDate" content="...">
  <meta itemprop="endDate" content="...">
  <meta itemprop="description" content="...">
  <meta itemprop="image" content="...">
  <div itemscope itemprop="location" itemtype="http://schema.org/Place">
    <meta itemprop="name" content="...">
    <meta itemprop="address" content="...">
  </div>
  <p itemprop="offers" itemscope itemtype="http://schema.org/Offer">
    <meta itemprop="priceCurrency" content="GBP">
    <span itemprop="price" content="...">
</article>
```

This makes the page highly structured and easy to parse with any microdata extraction library.

---

## 5. Data Attributes Summary

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `id` | `event-slug` | Unique event identifier |
| `data-wo-type` | `display`, `festival`, `talk`, `exhibition`, `course`, `screening`, etc. | Event category |
| `data-wo-venue` | `south-kensington`, `young`, `museum-of-childhood`, etc. | V&A location code |
| `data-wo-audience` | `for-members`, `evening-event`, `african-heritage`, etc. (space-separated) | Audience tags |
| `data-wo-free` | `""` (empty) or `false` | Indicates if event is free |

---

## 6. Pagination & Loading

### Static Page Rendering
- **No pagination controls** in HTML
- **No infinite scroll** implementation
- **All 146 events** are rendered in the initial page load
- **Size**: ~12,400 lines of HTML (~70-75 KB)

### Filtering Available
The page includes filter buttons in the UI:
```html
<a data-wo-dateselect="all" class="wo-nav__button js-wo-date wo-nav__button--active" href="/whatson">
<a data-wo-dateselect="day" class="wo-nav__button js-wo-date" href="/whatson/2026/02/16/day">
<a data-wo-dateselect="week" class="wo-nav__button js-wo-date" href="/whatson/2026/02/16/week">
<a data-wo-dateselect="month" class="wo-nav__button js-wo-date" href="/whatson/2026/02/16/month">
```

These are **server-side filters** that load different page versions, not client-side JavaScript filtering.

---

## 7. Complete Cheerio Extraction Example

```javascript
const cheerio = require('cheerio');
const fetch = require('node-fetch');

async function scrapeVAEvents() {
  const response = await fetch('https://www.vam.ac.uk/whatson');
  const html = await response.text();
  const $ = cheerio.load(html);

  const events = [];

  $('li.b-event-teaser.js-wo-event').each((index, element) => {
    const $event = $(element);

    const event = {
      // Identifiers
      id: $event.attr('id'),
      type: $event.attr('data-wo-type'),
      venue_code: $event.attr('data-wo-venue'),
      audiences: $event.attr('data-wo-audience')?.split(' ').filter(Boolean) || [],
      is_free: $event.attr('data-wo-free') === '',

      // Content from schema.org meta tags
      title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
      description: $event.find('meta[itemprop="description"]').attr('content'),
      start_date: $event.find('meta[itemprop="startDate"]').attr('content'),
      end_date: $event.find('meta[itemprop="endDate"]').attr('content'),

      // Image
      image_url: $event.find('img.b-event-teaser__media-image').attr('src'),
      image_srcset: $event.find('img.b-event-teaser__media-image').attr('srcset'),

      // Event details
      url: $event.find('a.b-event-teaser__link').attr('href'),
      display_type: $event.find('.b-event-teaser__type').text().trim(),
      venue_display: $event.find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim(),
      price: $event.find('span[itemprop="price"]').attr('content'),
      price_display: $event.find('span[itemprop="price"]').text().trim(),

      // Optional: Status badge
      status: $event.find('.u-label-tag').text().trim() || null,

      // Location schema
      location_name: $event.find('div[itemtype*="Place"] meta[itemprop="name"]').attr('content'),
      location_address: $event.find('div[itemtype*="Place"] meta[itemprop="address"]').attr('content'),
    };

    events.push(event);
  });

  return events;
}
```

---

## 8. Important Notes for Web Scraping

### HTML Consistency
- All events follow the same DOM structure
- Schema.org markup is complete and reliable
- Data attributes are consistent across all events

### Responsive Images
- Events include `srcset` with multiple resolutions (320w, 640w, 960w, 1280w, 1920w, 2560w)
- Use appropriate resolution for your use case to save bandwidth

### Date Parsing
- Dates are in ISO 8601 format: `YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS +ZZZZ`
- Some events have only dates (no times)
- Always handle timezone information if present

### Venue Codes
The `data-wo-venue` attribute uses short codes that must be mapped to full names:
- `south-kensington` → "V&A South Kensington"
- `young` → "Young V&A"
- `museum-of-childhood` → "V&A Museum of Childhood"
- etc.

### URL Construction
- Event URLs are relative paths (start with `/`)
- Full URL: `https://www.vam.ac.uk` + relative path
- Examples: `/exhibitions/john-constable-and-david-lucas-a-unison-of-feeling`, `/event/w9oOYBK91k/p25135-lancelot-ribeiro-a-risen-voice-symposium`

### Free vs Paid
- `data-wo-free=""` indicates free event
- `data-wo-free="false"` indicates paid event (check `price` field for amount)
- Some paid events may have `data-wo-free=""` with a non-zero price (check both)

---

## 9. Session Information

**Page analyzed**: 2026-02-16
**Total events rendered**: 146 (5 featured + 141 main list)
**HTML size**: ~12,400 lines (~70-75 KB)
**Load strategy**: Server-side rendered, static HTML
**DataLayer entries**: 146 (one per visible event)
