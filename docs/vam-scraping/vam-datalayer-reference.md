# V&A What's On - Google Analytics dataLayer Reference

## Overview

The V&A What's On page implements **Google Analytics 4 with ecommerce tracking** using the `dataLayer` JavaScript object. This document covers the structure, fields, and extraction methods.

---

## DataLayer Structure

### Location in HTML
The dataLayer is pushed in a `<script>` tag, approximately line 73-80 of the page HTML.

```html
<script>
  if (typeof dataLayer !== 'undefined') {
    dataLayer.push({
      // ... full data object ...
    })
  }
</script>
```

### Root-Level Fields

```javascript
{
  "pageRole": "whats-on",
  "title": "What's On · Exhibitions, Events & Courses",
  "slug": "whats-on",
  "ecommerce": {
    "impressions": [ /* array of 146 event objects */ ]
  }
}
```

| Field | Type | Value | Purpose |
|-------|------|-------|---------|
| `pageRole` | string | `"whats-on"` | Identifies page type |
| `title` | string | `"What's On · Exhibitions, Events & Courses"` | Page title (HTML entities) |
| `slug` | string | `"whats-on"` | URL slug |
| `ecommerce` | object | Analytics data | Container for ecommerce tracking |

---

## Ecommerce Impressions Array

### Structure
```javascript
{
  "ecommerce": {
    "impressions": [
      {
        "name": "Event Name",
        "id": 786570534196370,         // numeric ID or null
        "pid": "786570534196370FL",    // product ID
        "list": "whats-on - featured", // list category
        "position": 1                   // position in list
      },
      // ... 145 more events ...
    ]
  }
}
```

### Impression Object Fields

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `name` | string | Event title | May have trailing spaces |
| `id` | number or null | `786570534196370` or `null` | Numeric event identifier (sometimes absent) |
| `pid` | string | `"786570534196370FL"` or `"FL"` | **Product ID**: `[id][suffix]` or just `[suffix]` if id is null |
| `list` | string | `"whats-on - featured"` or `"whats-on - main-list"` | Which section event appears in |
| `position` | integer | 1-5 (featured) or 1-141 (main) | Position within the list |

---

## List Categories

### Featured List
- Contains the **first 5 events** on the page
- List name: `"whats-on - featured"`
- Position counter: 1-5
- Product ID suffix: `"FL"` (Featured List)

### Main List
- Contains the **remaining ~141 events**
- List name: `"whats-on - main-list"`
- Position counter: 1-141 (resets from 1)
- Product ID suffix: `"ML"` (Main List)

### Example
```javascript
// Featured events
[
  { name: "Friday Late: To Ebb is To Flow", id: 786570534196370, pid: "786570534196370FL", list: "whats-on - featured", position: 1 },
  { name: "February Half Term: Create! Connect! Play!", id: null, pid: "FL", list: "whats-on - featured", position: 2 },
  // ... 3 more featured events ...
]

// Main list events
[
  { name: "David Bowie Centre", id: 1000447, pid: "1000447ML", list: "whats-on - main-list", position: 1 },
  { name: "Enthoven Unboxed: 100 Years of Collecting Performance", id: false, pid: "falseML", list: "whats-on - main-list", position: 2 },
  // ... 139 more main list events ...
]
```

---

## Product ID Logic

The `pid` field follows a pattern based on the `id` value:

| Condition | `pid` Format | Example |
|-----------|-------------|---------|
| `id` is a number | `{id}{suffix}` | `"786570534196370FL"` |
| `id` is `null` | `{suffix}` | `"FL"` |
| `id` is `false` | `"false{suffix}"` | `"falseML"` |

The suffix depends on which list:
- Featured list: `"FL"`
- Main list: `"ML"`

---

## Extraction Methods

### Method 1: Parse from Script Tag (Recommended)

```javascript
function extractDataLayerFromHTML(html) {
  const scriptMatch = html.match(
    /dataLayer\.push\(([\s\S]*?)\)\s*<\/script>/
  );

  if (scriptMatch && scriptMatch[1]) {
    try {
      return JSON.parse(scriptMatch[1]);
    } catch (error) {
      console.error('Failed to parse dataLayer:', error);
      return null;
    }
  }

  return null;
}

// Usage
const datalayer = extractDataLayerFromHTML(htmlContent);
console.log(datalayer.ecommerce.impressions.length); // 146
```

### Method 2: Cheerio Extraction

```javascript
const cheerio = require('cheerio');

function extractDataLayerCheerio(html) {
  const $ = cheerio.load(html);

  let analyticsData = null;

  // Find script containing dataLayer
  $('script').each((index, element) => {
    const content = $(element).html();

    if (content && content.includes('dataLayer.push')) {
      const jsonMatch = content.match(/dataLayer\.push\(([\s\S]*?)\)/);

      if (jsonMatch) {
        try {
          analyticsData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error('JSON parse error:', e);
        }
      }
    }
  });

  return analyticsData;
}
```

### Method 3: Client-Side (JavaScript in Browser)

```javascript
// In browser console on vam.ac.uk/whatson
console.log(window.dataLayer[0].ecommerce.impressions);

// Export to JSON
copy(JSON.stringify(window.dataLayer[0].ecommerce.impressions, null, 2));
```

---

## Working with Impressions Data

### Count Events by List

```javascript
const countByList = (impressions) => {
  const featured = impressions.filter(e => e.list === 'whats-on - featured').length;
  const main = impressions.filter(e => e.list === 'whats-on - main-list').length;

  return {
    featured, // 5
    main,     // 141
    total: featured + main // 146
  };
};
```

### Map Product IDs

```javascript
const buildProductIDMap = (impressions) => {
  return impressions.reduce((map, event) => {
    map[event.pid] = {
      name: event.name,
      id: event.id,
      list: event.list,
      position: event.position
    };
    return map;
  }, {});
};

// Usage
const pidMap = buildProductIDMap(impressions);
console.log(pidMap['786570534196370FL']);
// { name: 'Friday Late: To Ebb is To Flow', id: 786570534196370, list: '...', position: 1 }
```

### Find Events by Position

```javascript
const getEventAtPosition = (impressions, list, position) => {
  return impressions.find(e =>
    e.list === list && e.position === position
  );
};

// Usage
const firstFeatured = getEventAtPosition(impressions, 'whats-on - featured', 1);
console.log(firstFeatured.name); // "Friday Late: To Ebb is To Flow"
```

### Extract Unique Event Names

```javascript
const getEventNames = (impressions) => {
  return impressions
    .map(e => e.name.trim())
    .filter((name, index, arr) => arr.indexOf(name) === index); // Remove duplicates
};
```

### Find Events by Name

```javascript
const findByName = (impressions, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return impressions.filter(e =>
    e.name.toLowerCase().includes(term)
  );
};

// Usage
const half_term = findByName(impressions, 'half term');
```

---

## Data Quality Notes

### Missing IDs
Some events have `id: null` or `id: false`:

```javascript
// Events with null IDs
const nullIdEvents = impressions.filter(e => e.id === null);
// These still have valid pids (just the suffix: "FL" or "ML")

// Events with false IDs (boolean)
const falseIdEvents = impressions.filter(e => e.id === false);
// These have pids like "falseML"
```

### Duplicate Event Names
Some events appear multiple times (featured + main list):

```javascript
// Find duplicates
const getDuplicateNames = (impressions) => {
  const names = impressions.map(e => e.name);
  return names.filter((name, i) => names.indexOf(name) !== i);
};

// Events appearing in both lists
// Example: "February Half Term: Create! Connect! Play!" appears as both featured and main
```

### Trailing Spaces
Event names may have trailing spaces:

```javascript
const cleanNames = impressions.map(e => ({
  ...e,
  name: e.name.trim()
}));
```

---

## HTML Entity Decoding

The title field contains HTML entities:

```javascript
const title = "What's On \u0026middot; Exhibitions, Events \u0026amp; Courses";

// Decode using built-in method or library
const he = require('he');
const decoded = he.decode(title);
// "What's On · Exhibitions, Events & Courses"

// Or use simple replacements
const simpleDecoded = title
  .replace(/\u0026middot;/g, '·')
  .replace(/\u0026amp;/g, '&');
```

---

## Analytics Use Cases

### Track Featured vs Main Events
```javascript
const analyzeByList = (impressions) => {
  const byList = {
    featured: impressions.filter(e => e.list === 'whats-on - featured'),
    main: impressions.filter(e => e.list === 'whats-on - main-list')
  };

  return {
    featured_count: byList.featured.length,
    main_count: byList.main.length,
    featured_names: byList.featured.map(e => e.name.trim()),
  };
};
```

### Create Position-Based Index
```javascript
const createPositionIndex = (impressions) => {
  return impressions.reduce((index, event) => {
    const key = `${event.list}:${event.position}`;
    index[key] = event;
    return index;
  }, {});
};

// Usage
const index = createPositionIndex(impressions);
console.log(index['whats-on - featured:1'].name);
```

### Find Most Promoted Events
```javascript
const getMostPromoted = (impressions) => {
  // Featured events are promoted (appear first)
  return impressions.filter(e => e.list === 'whats-on - featured');
};

// Get their IDs for linking to event pages
const promotedIds = getMostPromoted(impressions)
  .map(e => e.id)
  .filter(id => id !== null && id !== false);
```

---

## Important Observations

1. **Static Data**: The dataLayer contains all 146 events on page load - no dynamic updates
2. **Two Lists**: Data is split into "featured" (top 5) and "main-list" (remaining)
3. **Position Resets**: Each list has its own position counter (both start at 1)
4. **Null/False IDs**: Some events don't have numeric IDs but still get product IDs
5. **Duplicates**: A few events appear in both featured and main lists with different positions
6. **Product IDs**: Useful for GA4 tracking, format is predictable

---

## Example: Complete Analytics Extraction

```javascript
function completeAnalyticsExtraction(html) {
  const datalayer = extractDataLayerFromHTML(html);

  if (!datalayer) {
    return null;
  }

  const impressions = datalayer.ecommerce.impressions;

  return {
    page_title: datalayer.title,
    page_role: datalayer.pageRole,
    page_slug: datalayer.slug,
    analytics: {
      total_events: impressions.length,
      featured_events: impressions.filter(e => e.list === 'whats-on - featured'),
      main_list_events: impressions.filter(e => e.list === 'whats-on - main-list'),
      events_with_ids: impressions.filter(e => typeof e.id === 'number'),
      events_without_ids: impressions.filter(e => e.id === null || e.id === false),
      duplicate_names: findDuplicateNames(impressions),
    },
    raw_impressions: impressions,
  };
}

function findDuplicateNames(impressions) {
  const nameMap = {};
  const duplicates = [];

  impressions.forEach(event => {
    const name = event.name.trim();
    if (nameMap[name]) {
      duplicates.push({
        name,
        occurrences: [
          { ...nameMap[name] },
          { ...event }
        ]
      });
    } else {
      nameMap[name] = event;
    }
  });

  return duplicates;
}
```

---

## Validation Checklist

When extracting dataLayer data:

- [ ] Total impressions = 146
- [ ] Featured list has exactly 5 items
- [ ] Main list has exactly 141 items
- [ ] Position counter resets for each list (both start at 1)
- [ ] All `pid` values follow the pattern `[id][suffix]` or `[suffix]`
- [ ] No `position` value exceeds list size
- [ ] All `list` values are either `"whats-on - featured"` or `"whats-on - main-list"`
- [ ] Event names may have trailing spaces (trim before using)

