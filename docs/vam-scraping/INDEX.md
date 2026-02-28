# V&A What's On - Web Scraping Analysis - Complete Index

## Overview

This directory contains a comprehensive analysis of the Victoria and Albert Museum's "What's On" events page (`https://www.vam.ac.uk/whatson`) with all information needed to extract event data using Cheerio or similar HTML parsing libraries.

**Analysis Date:** 2026-02-16
**Total Events Found:** 146
**Page Size:** ~12,400 lines (~70-75 KB)
**Recommended Tool:** Cheerio (Node.js)

---

## Quick Start

### For the Impatient
1. Read: **ANALYSIS_SUMMARY.txt** (5 min)
2. Copy: **vam-cheerio-examples.js** example #1 (get all events)
3. Adapt: To your needs
4. Done!

### For the Thorough
1. Start: **README.md** (overview + quick reference)
2. Reference: **vam-selector-quick-reference.md** (when coding)
3. Deep Dive: **vam-scraping-analysis.md** (complete structure)
4. Test: **vam-test-cases.js** (validate your code)

---

## Files Overview

### 1. ANALYSIS_SUMMARY.txt (11 KB)
**Quick executive summary of all findings**

Contains:
- Key findings checklist
- Quick selector reference
- Data quality assessment
- Common use cases
- Important notes for developers
- Testing and validation info
- Conclusion and estimated complexity

**Best for:** Quick overview, decision making, executive summary

---

### 2. README.md (10 KB)
**Getting started guide and main reference**

Contains:
- File descriptions
- Quick start code snippets
- Key facts table
- Main selectors table
- Data quality notes
- Example projects
- Tools & libraries
- Troubleshooting guide
- Browser console testing tips

**Best for:** First-time readers, quick reference, getting oriented

---

### 3. vam-scraping-analysis.md (12 KB)
**Complete technical analysis of HTML structure**

Sections:
1. Event listing structure
2. Cheerio selectors (30+) with explanations
3. CSS class hierarchy
4. Schema.org structured data
5. Data attributes reference (type, venue, audience, free)
6. Google Analytics dataLayer (146 events)
7. Pagination & loading strategy
8. Complete Cheerio extraction example
9. Important notes for scraping
10. Session information

**Best for:** Understanding page structure, learning all available selectors, deep technical knowledge

---

### 4. vam-selector-quick-reference.md (12 KB)
**Fast lookup guide for selectors and patterns**

Sections:
1. Quick lookup table (30+ selectors)
2. Selector patterns by use case
3. Data attribute values reference
4. CSS class hierarchy diagram
5. Common extraction patterns
6. Real-world examples
7. Browser DevTools equivalents
8. Testing tips

**Best for:** Coding, quick lookups, copy-paste ready patterns

---

### 5. vam-cheerio-examples.js (16 KB)
**Production-ready code examples**

12 Complete Examples:
1. Extract all events with full details
2. Extract specific fields (chainable selectors)
3. Filter events by type (talk, festival, display, etc.)
4. Filter events by venue
5. Extract free events only
6. Extract featured events (top 5)
7. Filter by audience tags
8. Parse Google Analytics dataLayer
9. Map venue codes to names
10. Format for CSV export
11. Find upcoming events within N days
12. Error-safe extraction with fallbacks

Each example is:
- Fully functional
- Well-commented
- Ready to copy-paste
- Includes usage examples
- Has error handling

**Best for:** Getting working code fast, learning patterns, reusable functions

---

### 6. vam-datalayer-reference.md (12 KB)
**Google Analytics dataLayer deep dive**

Sections:
1. Location in HTML
2. Root-level structure
3. Ecommerce impressions array format
4. Impression object fields
5. List categories (featured vs main)
6. Product ID logic and format
7. Extraction methods (3 approaches)
8. Working with impressions data
9. Analytics use cases
10. Data quality observations
11. Example: complete extraction
12. Validation checklist

**Best for:** Analytics data extraction, GA4 integration, tracking implementation

---

### 7. vam-test-cases.js (17 KB)
**Comprehensive test suite**

6 Test Suites:
1. Basic DOM Structure (4 tests)
   - Container exists
   - 146 events found
   - Article markup valid
   - Schema.org Event markup

2. Event Data Extraction (10 tests)
   - ID extraction
   - Type attribute
   - Venue code
   - Title extraction
   - Date extraction
   - Image URL
   - Description
   - Event link
   - Pricing
   - Venue information

3. Data Attributes Validation (5 tests)
   - data-wo-type present
   - data-wo-venue present
   - data-wo-free present
   - data-wo-audience present
   - Free/paid status valid

4. Schema.org Structured Data (4 tests)
   - Event schema
   - Location schema
   - Offer schema
   - Date format validation

5. Analytics DataLayer (5 tests)
   - dataLayer.push present
   - Impressions array
   - 146 impressions count
   - Featured/main split

6. Image Handling (4 tests)
   - Image src present
   - HTTPS URLs
   - Srcset present
   - Multiple sizes

Total: 25+ assertions validating everything

Run with:
```bash
node vam-test-cases.js
```

**Best for:** Validation, CI/CD integration, regression testing, quality assurance

---

## File Relationships

```
START HERE
    ↓
README.md ──────────────────→ ANALYSIS_SUMMARY.txt
    ↓                              ↓
    ├── Need Code?  ────────→ vam-cheerio-examples.js
    │                          ↓
    ├── Deep Dive  ─────────→ vam-scraping-analysis.md
    │                          ↓
    ├── Quick Lookup ──────→ vam-selector-quick-reference.md
    │
    ├── Analytics?  ────────→ vam-datalayer-reference.md
    │
    └── Validate?  ────────→ vam-test-cases.js
```

---

## Content By Use Case

### "I just want to scrape events"
1. vam-cheerio-examples.js (example #1)
2. vam-selector-quick-reference.md (for selectors)

### "I need to understand the structure first"
1. README.md
2. vam-scraping-analysis.md
3. vam-selector-quick-reference.md

### "I need specific code patterns"
1. vam-cheerio-examples.js (find relevant example)
2. vam-selector-quick-reference.md (copy pattern)

### "I need to validate my scraper"
1. vam-test-cases.js (run tests)
2. ANALYSIS_SUMMARY.txt (checklist)

### "I need analytics data"
1. vam-datalayer-reference.md
2. vam-cheerio-examples.js (example #8)

### "I need a quick reference"
1. ANALYSIS_SUMMARY.txt (facts & selectors)
2. vam-selector-quick-reference.md (lookup table)

### "I'm presenting to non-technical people"
1. ANALYSIS_SUMMARY.txt (executive summary)
2. README.md (key facts table)

---

## Key Information by Topic

### Event Data Points
See: **vam-scraping-analysis.md** Section 2 or **README.md** table

### Cheerio Selectors
See: **vam-selector-quick-reference.md** Section 1 (lookup table)

### CSS Classes
See: **vam-scraping-analysis.md** Section 1 or **vam-selector-quick-reference.md** Section 5

### Data Attributes
See: **vam-scraping-analysis.md** Section 5 or **ANALYSIS_SUMMARY.txt** Data Attributes section

### Schema.org Details
See: **vam-scraping-analysis.md** Section 4

### Google Analytics
See: **vam-datalayer-reference.md** or **vam-scraping-analysis.md** Section 6

### Image Handling
See: **vam-scraping-analysis.md** Section 8 or **vam-selector-quick-reference.md** Section 8

### Common Patterns
See: **vam-selector-quick-reference.md** Sections 5-7

### Working Examples
See: **vam-cheerio-examples.js** (any example)

---

## Quick Command Reference

### Test the scrapers
```bash
node vam-test-cases.js
```

### Extract in browser console
```javascript
document.querySelectorAll('li.b-event-teaser').length  // 146
window.dataLayer[0].ecommerce.impressions.length       // 146
```

### Extract with Cheerio
```javascript
const cheerio = require('cheerio');
const $ = cheerio.load(html);
const events = $('li.b-event-teaser.js-wo-event');  // 146 items
```

---

## File Statistics

| File | Size | Type | Purpose |
|------|------|------|---------|
| ANALYSIS_SUMMARY.txt | 11 KB | Summary | Executive overview |
| README.md | 10 KB | Guide | Getting started |
| vam-scraping-analysis.md | 12 KB | Reference | Complete technical docs |
| vam-selector-quick-reference.md | 12 KB | Reference | Selector lookups |
| vam-cheerio-examples.js | 16 KB | Code | 12 working examples |
| vam-datalayer-reference.md | 12 KB | Reference | Analytics data |
| vam-test-cases.js | 17 KB | Code | Test suite |
| **TOTAL** | **90 KB** | **7 files** | **Complete analysis** |

---

## Analysis Completeness

Covered:
- ✓ HTML structure (all elements, classes, attributes)
- ✓ Cheerio selectors (30+, all documented)
- ✓ Schema.org markup (complete analysis)
- ✓ Data attributes (all types and values)
- ✓ Google Analytics (dataLayer structure)
- ✓ Image handling (srcset, sizes, CDN)
- ✓ Date formats (ISO 8601, parsing)
- ✓ URL patterns (relative, construction)
- ✓ Venue codes (mapping, display names)
- ✓ Event types (categories, filter values)
- ✓ Audience tags (identification, filtering)
- ✓ Free/paid status (logic, detection)
- ✓ Pagination (confirmed: none)
- ✓ Production code (12 examples)
- ✓ Test suite (6 suites, 25+ tests)
- ✓ Error handling (documented)
- ✓ Performance (noted)
- ✓ Troubleshooting (guide included)

---

## Next Steps

### For Development
1. Copy relevant example from **vam-cheerio-examples.js**
2. Run tests from **vam-test-cases.js** to validate
3. Refer to **vam-selector-quick-reference.md** while coding
4. Use **vam-scraping-analysis.md** for edge cases

### For Integration
1. Review **README.md** quick start
2. Adapt example #1 from **vam-cheerio-examples.js**
3. Integrate into your data pipeline
4. Run **vam-test-cases.js** for validation

### For Documentation
1. Reference **ANALYSIS_SUMMARY.txt** for overview
2. Use **README.md** for user guide
3. Reference other docs as needed

### For Maintenance
1. Check **vam-test-cases.js** monthly to catch changes
2. Refer to **ANALYSIS_SUMMARY.txt** for assumptions
3. Use **vam-selector-quick-reference.md** when updating selectors

---

## Support

### Need a specific selector?
See: **vam-selector-quick-reference.md** Table 1

### Getting `undefined`?
See: **README.md** Troubleshooting section

### Want to understand deeply?
Read: **vam-scraping-analysis.md** (complete)

### Ready to code?
Copy from: **vam-cheerio-examples.js** (pick your use case)

### Need to validate?
Run: **vam-test-cases.js** (comprehensive checks)

---

## Version Information

- **Analysis Date:** 2026-02-16
- **Target URL:** https://www.vam.ac.uk/whatson
- **Page Type:** Server-rendered static HTML
- **Total Events:** 146
- **Analysis Status:** Complete
- **Code Tested:** Yes (examples provided)
- **Selectors Verified:** All 30+ working
- **DataLayer:** 146 impressions confirmed

---

## License & Usage

These analysis documents are provided as-is for web scraping and data extraction purposes. Use ethically and according to:
- V&A website terms of service
- robots.txt guidelines
- Local laws and regulations
- Reasonable rate limiting

---

## End of Index

Start with **README.md** or **ANALYSIS_SUMMARY.txt** to begin.

Last updated: 2026-02-16
