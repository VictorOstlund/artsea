# V&A What's On Page - Web Scraping Analysis

This directory contains comprehensive documentation for scraping events from the Victoria and Albert Museum's "What's On" page using Cheerio and other tools.

## Files Included

### 1. **vam-scraping-analysis.md** (Main Reference)
Complete HTML structure analysis covering:
- Event listing structure and DOM hierarchy
- 30+ Cheerio selectors for extracting event data
- Schema.org structured data implementation
- Data attributes (type, venue, audience, free status)
- Google Analytics dataLayer structure (146 events tracked)
- Pagination and loading strategy (static page, no infinite scroll)
- Notes on date formats, venue codes, and URL construction

**Start here for understanding the page structure.**

### 2. **vam-selector-quick-reference.md** (Quick Lookup)
Fast reference guide with:
- Quick lookup table of all selectors
- Data attribute values and meanings
- CSS class hierarchy diagram
- Common extraction patterns
- Real-world examples
- Browser DevTools equivalents
- Testing tips

**Use this when you need to quickly find the right selector.**

### 3. **vam-cheerio-examples.js** (Code Examples)
12 complete, production-ready code examples:
1. Extract all events with full details
2. Extract specific fields using chainable selectors
3. Filter events by type (talk, festival, display, etc.)
4. Filter events by venue (South Kensington, Young V&A, etc.)
5. Extract free events only
6. Extract featured events (top 5)
7. Filter by audience tags (for-members, evening-event, etc.)
8. Parse Google Analytics dataLayer
9. Map venue codes to display names
10. Format events for CSV export
11. Find upcoming events within N days
12. Error-safe extraction with fallbacks

Each example is self-contained and ready to use.

**Copy-paste ready code for your project.**

### 4. **vam-datalayer-reference.md** (Analytics Data)
Detailed analysis of Google Analytics dataLayer:
- dataLayer structure and location
- Ecommerce impressions array (146 events)
- Product ID logic and format
- List categories (featured vs main)
- Extraction methods (HTML parsing, Cheerio, browser)
- Data quality notes (missing IDs, duplicates, etc.)
- Working with impressions data
- Analytics use cases

**Needed if you want to extract GA data or understand tracking.**

---

## Quick Start

### 1. Fetch the Page
```javascript
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const response = await fetch('https://www.vam.ac.uk/whatson');
const html = await response.text();
const $ = cheerio.load(html);
```

### 2. Extract All Events
```javascript
const events = [];

$('li.b-event-teaser.js-wo-event').each((index, element) => {
  const $event = $(element);

  events.push({
    id: $event.attr('id'),
    title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
    type: $event.attr('data-wo-type'),
    start_date: $event.find('meta[itemprop="startDate"]').attr('content'),
    url: 'https://www.vam.ac.uk' + $event.find('a.b-event-teaser__link').attr('href'),
    image: $event.find('img.b-event-teaser__media-image').attr('src'),
    is_free: $event.attr('data-wo-free') === '',
  });
});

console.log(`Found ${events.length} events`); // 146
```

### 3. Filter By Type
```javascript
const talks = $('li[data-wo-type="talk"]');
const festivals = $('li[data-wo-type="festival"]');
const displays = $('li[data-wo-type="display"]');
```

### 4. Extract Google Analytics Data
```javascript
function extractDataLayer(html) {
  const match = html.match(/dataLayer\.push\(([\s\S]*?)\)/);
  return match ? JSON.parse(match[1]) : null;
}

const gaData = extractDataLayer(html);
console.log(gaData.ecommerce.impressions.length); // 146 events tracked
```

---

## Key Facts

| Aspect | Detail |
|--------|--------|
| **Total Events** | 146 (5 featured + 141 main list) |
| **Page Size** | ~12,400 lines (~70-75 KB HTML) |
| **Loading Strategy** | Static server-rendered, no pagination or infinite scroll |
| **Structured Data** | Complete Schema.org Event markup on every event |
| **Analytics** | Google Analytics 4 with ecommerce tracking |
| **Date Format** | ISO 8601 (YYYY-MM-DD or with timestamps) |
| **Images** | Responsive srcset with 6 sizes (320w to 2560w) |
| **Data Attributes** | Type, venue, audience, free status |

---

## Main Selectors

| What | Selector | Returns |
|------|----------|---------|
| All events | `$('li.b-event-teaser.js-wo-event')` | jQuery collection of 146 items |
| Event title | `$(event).find('meta[itemprop="name"]').eq(0).attr('content')` | String |
| Event URL | `$(event).find('a.b-event-teaser__link').attr('href')` | Relative path |
| Event type | `$(event).attr('data-wo-type')` | talk, festival, display, etc. |
| Start date | `$(event).find('meta[itemprop="startDate"]').attr('content')` | ISO 8601 |
| Image URL | `$(event).find('img.b-event-teaser__media-image').attr('src')` | HTTPS URL |
| Is free | `$(event).attr('data-wo-free') === ''` | Boolean |
| Venue | `$(event).attr('data-wo-venue')` | south-kensington, young, etc. |
| Price | `$(event).find('span[itemprop="price"]').text().trim()` | Free, £20.00, etc. |

---

## Data Quality

### Schema.org Implementation
- All events have complete Schema.org Event markup
- Reliable source for titles, dates, descriptions
- Use `meta[itemprop="..."]` selectors for maximum accuracy

### Responsive Images
- All events include 6 image sizes: 320w, 640w, 960w, 1280w, 1920w, 2560w
- Use 320px version for thumbnails, larger versions for display

### Date Formats
- Most dates: ISO 8601 (YYYY-MM-DD) e.g., `2025-11-15`
- Some dates include time: `2026-02-20 11:00:00 +0000`
- Always handle timezone if present

### Venue Codes
- `south-kensington` → V&A South Kensington
- `young` → Young V&A
- Other locations exist - see analysis for complete list

---

## Common Use Cases

### Extract for CSV
See example #10 in `vam-cheerio-examples.js` - produces clean CSV-friendly objects

### Find Upcoming Events
See example #11 - filters events happening within N days from today

### Group by Type
See example #4 - organizes events by category (talk, festival, etc.)

### Extract Free Events
See example #5 - filters to `data-wo-free=""` events

### Get Featured Events
See example #6 - first 5 events on page with higher visibility

---

## Important Notes for Web Scraping

1. **All Events Load Initially**: No pagination or lazy loading - all 146 events are in the HTML on first load

2. **Schema.org is Reliable**: Use `meta[itemprop="..."]` tags first - they're the most accurate

3. **Relative URLs**: Event URLs are relative (start with `/`) - prepend `https://www.vam.ac.uk`

4. **Free Status**: Check `data-wo-free=""` (empty string = free) vs `data-wo-free="false"` (paid)

5. **Responsive Images**: Use the appropriate size from srcset to save bandwidth

6. **HTML Entities**: Cheerio auto-decodes HTML entities - no manual decoding needed

7. **No JavaScript Required**: Page is fully server-rendered - no need for headless browser

8. **Data Attributes Useful**: `data-wo-type`, `data-wo-venue`, `data-wo-audience` provide filtering

9. **Google Analytics**: dataLayer contains tracking data for all 146 events if needed

10. **Trim Whitespace**: Event names may have trailing spaces - always `.trim()`

---

## Example Projects

### Build an Event Calendar
1. Extract all events (example #1)
2. Parse dates with moment.js or date-fns
3. Group by month or week
4. Render calendar view

### Create Event Finder App
1. Extract events by type (example #3)
2. Filter by venue (example #4)
3. Filter by audience (example #7)
4. Sort by date
5. Display results

### Generate Email Digest
1. Find upcoming events (example #11)
2. Format for CSV (example #10)
3. Filter to specific venue/type
4. Send as weekly email

### Analytics Dashboard
1. Extract dataLayer (vam-datalayer-reference.md)
2. Analyze event distribution
3. Track featured vs main list events
4. Visualize event types

---

## Tools & Libraries

### Recommended
- **cheerio** - HTML parsing and jQuery-like DOM traversal
- **node-fetch** or **axios** - HTTP requests
- **papaparse** - CSV generation
- **date-fns** or **moment** - Date parsing and formatting

### Optional
- **he** - HTML entity decoding
- **lodash** - Utility functions
- **jest** - Testing extraction code

---

## Testing Your Selectors

Quick validation:
```javascript
const $ = cheerio.load(html);

// Should be 146
console.assert($('li.b-event-teaser.js-wo-event').length === 146);

// Should be 5
console.assert($('li[data-wo-type="talk"]').length > 0);

// First event should have title
const firstTitle = $('li.b-event-teaser').eq(0)
  .find('meta[itemprop="name"]').eq(0).attr('content');
console.assert(firstTitle && firstTitle.length > 0);
```

---

## Browser Console Testing

Test selectors directly in browser (vam.ac.uk/whatson):

```javascript
// Count events
document.querySelectorAll('li.b-event-teaser').length // 146

// Get first event title
document.querySelector('meta[itemprop="name"]').content

// Export analytics data
copy(window.dataLayer[0].ecommerce.impressions)

// Count by type
document.querySelectorAll('li[data-wo-type="talk"]').length
```

---

## Troubleshooting

### "Events not found"
- Check selector: `li.b-event-teaser.js-wo-event` (both classes required)
- Verify HTML loaded correctly
- Check that you're loading in Cheerio first

### "Title is undefined"
- Use `.eq(0)` to get first meta tag: `find('meta[itemprop="name"]').eq(0)`
- Check `.attr('content')` not `.text()`

### "URL has no domain"
- Event URLs are relative - prepend: `https://www.vam.ac.uk` + path

### "Date format wrong"
- Use ISO 8601 parser, not custom regex
- Some dates include timestamps - handle with `new Date()`

---

## Further Resources

- **Schema.org Event**: https://schema.org/Event
- **Cheerio Documentation**: https://cheerio.js.org/
- **Google Tag Manager**: https://tagmanager.google.com/
- **V&A Website**: https://www.vam.ac.uk/

---

## Analysis Details

- **Analyzed**: 2026-02-16
- **Page URL**: https://www.vam.ac.uk/whatson
- **Total Events Found**: 146
- **HTML Lines**: 12,403
- **Schema Markup**: Complete on all events
- **Analytics Implementation**: GA4 with ecommerce

