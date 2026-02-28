# V&A What's On - Cheerio Selectors Quick Reference

## Quick Lookup Table

| Data | Cheerio Selector | Example Value | Notes |
|------|------------------|----------------|-------|
| **Event ID** | `$(event).attr('id')` | `john-constable-and-david-lucas-a-unison-of-feeling` | Unique slug identifier |
| **Event Type** | `$(event).attr('data-wo-type')` | `display`, `talk`, `festival` | From data attribute |
| **Title** | `$(event).find('meta[itemprop="name"]').eq(0).attr('content')` | `John Constable and David Lucas: A Unison of Feeling` | From Schema.org |
| **Description** | `$(event).find('meta[itemprop="description"]').attr('content')` | Long text... | Full event description |
| **Start Date** | `$(event).find('meta[itemprop="startDate"]').attr('content')` | `2025-11-15` or `2026-02-20 11:00:00 +0000` | ISO 8601 format |
| **End Date** | `$(event).find('meta[itemprop="endDate"]').attr('content')` | `2026-06-14` | ISO 8601 format |
| **Image URL (Small)** | `$(event).find('img.b-event-teaser__media-image').attr('src')` | `https://assets-cdn.vam.ac.uk/.../320.jpg` | Base image, 320px width |
| **Image Srcset** | `$(event).find('img.b-event-teaser__media-image').attr('srcset')` | `...320w, ...640w, ...960w...` | Responsive images |
| **Event URL** | `$(event).find('a.b-event-teaser__link').attr('href')` | `/exhibitions/john-constable...` | Relative path, prepend domain |
| **Venue Code** | `$(event).attr('data-wo-venue')` | `south-kensington`, `young` | Location identifier |
| **Venue Display Name** | `$(event).find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim()` | `V&A South Kensington` | User-facing name |
| **Venue Address** | `$(event).find('div[itemtype*="Place"] meta[itemprop="address"]').attr('content')` | `Cromwell Road, London SW7 2RL` | Full address |
| **Display Type** | `$(event).find('.b-event-teaser__type').text().trim()` | `Display`, `Festival`, `Talk` | Category label |
| **Price Amount** | `$(event).find('span[itemprop="price"]').attr('content')` | `0.0`, `20.00` | Numeric value |
| **Price Display** | `$(event).find('span[itemprop="price"]').text().trim()` | `Free`, `£20.00` | Formatted for display |
| **Currency** | `$(event).find('meta[itemprop="priceCurrency"]').attr('content')` | `GBP` | Currency code |
| **Is Free (Flag)** | `$(event).attr('data-wo-free') === ''` | `true` / `false` | Empty string = free |
| **Audiences** | `$(event).attr('data-wo-audience')` | `for-members evening-event` | Space-separated tags |
| **Status Badge** | `$(event).find('.u-label-tag').text().trim()` | `Book soon` | Optional, may not exist |
| **Location Name (Schema)** | `$(event).find('div[itemtype*="Place"] meta[itemprop="name"]').eq(0).attr('content')` | `Victoria and Albert Museum, South Kensington` | Full location from schema |

---

## Selector Patterns by Use Case

### Get Event Container
```javascript
// All events
$('li.b-event-teaser.js-wo-event')

// Single event by ID
$('li#john-constable-and-david-lucas-a-unison-of-feeling')

// Specific type
$('li[data-wo-type="talk"]')

// Specific venue
$('li[data-wo-venue="south-kensington"]')

// Free events only
$('li[data-wo-free=""]')

// By audience
$('li[data-wo-audience*="for-members"]')  // Contains 'for-members'
```

### Extract Single Field

```javascript
// Title (MOST RELIABLE - from schema.org)
const title = $event.find('meta[itemprop="name"]').eq(0).attr('content');

// Alternative title (from h2)
const titleAlt = $event.find('h2.b-event-teaser__title').text().trim();

// Image (primary)
const imageSrc = $event.find('img.b-event-teaser__media-image').attr('src');

// Image (responsive - all sizes)
const imageSrcset = $event.find('img.b-event-teaser__media-image').attr('srcset');

// URL (relative)
const relativeUrl = $event.find('a.b-event-teaser__link').attr('href');

// Full URL
const fullUrl = 'https://www.vam.ac.uk' + $event.find('a.b-event-teaser__link').attr('href');

// Dates
const startDate = $event.find('meta[itemprop="startDate"]').attr('content');
const endDate = $event.find('meta[itemprop="endDate"]').attr('content');

// Price
const priceAmount = $event.find('span[itemprop="price"]').attr('content');
const priceDisplay = $event.find('span[itemprop="price"]').text().trim();

// Venue
const venueCode = $event.attr('data-wo-venue');
const venueName = $event.find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim();

// Type
const eventType = $event.attr('data-wo-type');
const displayType = $event.find('.b-event-teaser__type').text().trim();

// Free status
const isFree = $event.attr('data-wo-free') === '';

// Audiences (as array)
const audiences = ($event.attr('data-wo-audience') || '').split(' ').filter(Boolean);
```

---

## Data Attribute Lookup

### `data-wo-type` Values
- `talk` - Lectures, symposiums
- `festival` - Multi-day events
- `display` - Exhibitions
- `exhibition` - Major exhibitions
- `course` - Educational courses
- `screening` - Film screenings
- `workshop` - Hands-on workshops
- `event` - General events

### `data-wo-venue` Values
- `south-kensington` - Main V&A museum
- `young` - Young V&A
- `museum-of-childhood` - V&A Museum of Childhood
- (others discovered during scraping)

### `data-wo-audience` Possible Values
- `for-members` - Members-only event
- `evening-event` - Evening event
- `african-heritage` - African heritage focus
- (space-separated, multiple allowed)

### `data-wo-free` Values
- `""` (empty string) - Event is FREE
- `"false"` - Event is PAID
- Empty or missing - Check price field

---

## CSS Class Hierarchy

```
li.b-event-teaser.js-wo-event
├── article[itemscope][itemtype="http://schema.org/Event"]
│   ├── meta[itemprop="name"]
│   ├── meta[itemprop="startDate"]
│   ├── meta[itemprop="endDate"]
│   ├── meta[itemprop="description"]
│   ├── meta[itemprop="image"]
│   │
│   ├── div[itemscope][itemtype="http://schema.org/Place"]
│   │   ├── meta[itemprop="name"]
│   │   └── meta[itemprop="address"]
│   │
│   └── a.b-event-teaser__link
│       ├── div.b-event-teaser__media
│       │   └── img.b-event-teaser__media-image
│       │       ├── @src
│       │       ├── @srcset
│       │       └── @alt
│       │
│       ├── div.b-event-teaser__description
│       │   ├── div.b-event-teaser__type
│       │   ├── h2.b-event-teaser__title
│       │   └── div.b-icon-list
│       │       └── li.b-icon-list__icon--calendar
│       │       └── li.b-icon-list__icon--pin
│       │
│       └── div.b-icon-list.b-event-teaser__footer
│           └── li.b-icon-list__icon--ticket
│               └── span[itemprop="price"]
```

---

## Common Extraction Patterns

### Iterate All Events
```javascript
const $ = cheerio.load(html);
$('li.b-event-teaser.js-wo-event').each((index, element) => {
  const $event = $(element);
  // Extract data here
});
```

### Get Nested Meta Tag (Schema.org)
```javascript
const title = $event.find('meta[itemprop="name"]').eq(0).attr('content');
// Note: .eq(0) because there may be multiple meta tags with same itemprop
```

### Extract from Data Attributes
```javascript
const type = $event.attr('data-wo-type');
const venue = $event.attr('data-wo-venue');
const audiences = ($event.attr('data-wo-audience') || '').split(' ').filter(Boolean);
```

### Build Full URL
```javascript
const relativePath = $event.find('a.b-event-teaser__link').attr('href');
const fullUrl = `https://www.vam.ac.uk${relativePath}`;
```

### Parse Multiple Responsive Images
```javascript
const srcset = $event.find('img.b-event-teaser__media-image').attr('srcset');
// Format: "url1 320w, url2 640w, url3 960w, ..."
const images = srcset.split(', ').map(item => {
  const [url, size] = item.trim().split(' ');
  return { url, size };
});
```

### Extract All Text from Venue Location
```javascript
const $place = $event.find('div[itemtype*="Place"]');
const venueName = $place.find('meta[itemprop="name"]').eq(0).attr('content');
const address = $place.find('meta[itemprop="address"]').attr('content');
```

### Safe Extraction with Defaults
```javascript
const getData = (selector, attr = null) => {
  if (attr) {
    return $event.find(selector).attr(attr) || null;
  }
  const text = $event.find(selector).text();
  return text ? text.trim() : null;
};

const title = getData('meta[itemprop="name"]', 'content') || 'Unknown';
const venue = getData('.b-icon-list__icon--pin .b-icon-list__item-text') || 'Unknown';
```

---

## Real-World Examples

### Example 1: Get Event Summary
```javascript
const getSummary = ($, element) => {
  const $event = $(element);
  return {
    title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
    type: $event.attr('data-wo-type'),
    date: $event.find('meta[itemprop="startDate"]').attr('content'),
    image: $event.find('img.b-event-teaser__media-image').attr('src'),
    url: 'https://www.vam.ac.uk' + $event.find('a.b-event-teaser__link').attr('href'),
  };
};
```

### Example 2: Check if Free & Get Price
```javascript
const getPriceInfo = ($, element) => {
  const $event = $(element);
  const isFree = $event.attr('data-wo-free') === '';
  const amount = $event.find('span[itemprop="price"]').attr('content');

  return {
    is_free: isFree,
    amount: amount ? parseFloat(amount) : null,
    display: $event.find('span[itemprop="price"]').text().trim(),
  };
};
```

### Example 3: Filter Events by Date Range
```javascript
const getEventsByDateRange = ($, startDate, endDate) => {
  const results = [];

  $('li.b-event-teaser.js-wo-event').each((i, el) => {
    const $event = $(el);
    const eventStart = $event.find('meta[itemprop="startDate"]').attr('content');

    if (eventStart >= startDate && eventStart <= endDate) {
      results.push({
        title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
        date: eventStart,
      });
    }
  });

  return results;
};
```

### Example 4: Group Events by Type
```javascript
const groupByType = ($) => {
  const grouped = {};

  $('li.b-event-teaser.js-wo-event').each((i, el) => {
    const $event = $(el);
    const type = $event.attr('data-wo-type');
    const title = $event.find('meta[itemprop="name"]').eq(0).attr('content');

    if (!grouped[type]) {
      grouped[type] = [];
    }
    grouped[type].push(title);
  });

  return grouped;
};
```

---

## Important Notes

1. **Schema.org is Most Reliable**: Always use `meta[itemprop="..."]` tags first
2. **Relative URLs**: Event URLs are relative paths starting with `/` - prepend `https://www.vam.ac.uk`
3. **Multiple Meta Tags**: Some attributes have multiple meta tags - use `.eq(0)` to get first
4. **Free Events**: Check `data-wo-free=""` (empty string = free) or `data-wo-free="false"` (paid)
5. **Responsive Images**: Use `srcset` for different resolutions instead of just `src`
6. **Date Parsing**: Dates are ISO 8601 - handle timezone info if present
7. **HTML Entities**: Price might be `&amp;` - Cheerio auto-decodes these
8. **No Pagination**: All 146 events load on single page - no lazy loading

---

## Testing Your Selectors

Quick test with Node REPL:
```javascript
const cheerio = require('cheerio');
const fs = require('fs');

const html = fs.readFileSync('/path/to/whatson.html', 'utf8');
const $ = cheerio.load(html);

// Test a selector
console.log($('li.b-event-teaser.js-wo-event').length); // Should be ~146
console.log($('li.b-event-teaser').eq(0).find('meta[itemprop="name"]').eq(0).attr('content'));
```

---

## Browser DevTools Equivalent

| Browser DevTools | Cheerio |
|------------------|---------|
| `$x('//li[@class="b-event-teaser"]')` | `$('li.b-event-teaser')` |
| Right-click > Copy selector | `$(element).selector` |
| `document.querySelector('h2')` | `$('h2').eq(0)` |
| `document.querySelectorAll('li')` | `$('li')` |
| `element.getAttribute('data-id')` | `$(element).attr('data-id')` |
| `element.textContent` | `$(element).text()` |
| `element.innerHTML` | `$(element).html()` |

