/**
 * V&A What's On Page - Cheerio Extraction Examples
 * Comprehensive code examples for extracting event data using Cheerio
 */

const cheerio = require('cheerio');

// ============================================================================
// EXAMPLE 1: Extract All Events with Full Details
// ============================================================================

async function extractAllEvents(html) {
  const $ = cheerio.load(html);
  const events = [];

  $('li.b-event-teaser.js-wo-event').each((index, element) => {
    const $event = $(element);

    events.push({
      position: index + 1,

      // Identifiers
      id: $event.attr('id'),
      type: $event.attr('data-wo-type'),
      venue_code: $event.attr('data-wo-venue'),
      audiences: ($event.attr('data-wo-audience') || '').split(' ').filter(Boolean),
      is_free: $event.attr('data-wo-free') === '',

      // Content - Schema.org meta tags (most reliable)
      title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
      description: $event.find('meta[itemprop="description"]').attr('content'),
      start_date: $event.find('meta[itemprop="startDate"]').attr('content'),
      end_date: $event.find('meta[itemprop="endDate"]').attr('content'),

      // Media
      image_url: $event.find('img.b-event-teaser__media-image').attr('src'),
      image_alt: $event.find('img.b-event-teaser__media-image').attr('alt'),

      // Responsive image sources (all available sizes)
      image_srcset: $event.find('img.b-event-teaser__media-image').attr('srcset'),

      // URL and navigation
      url: $event.find('a.b-event-teaser__link').attr('href'),
      full_url: 'https://www.vam.ac.uk' + ($event.find('a.b-event-teaser__link').attr('href') || ''),

      // Display information
      display_type: $event.find('.b-event-teaser__type').text().trim(),
      status_badge: $event.find('.u-label-tag').text().trim() || null,

      // Location
      venue_display: $event.find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim(),
      location_name: $event.find('div[itemtype*="Place"] meta[itemprop="name"]').eq(0).attr('content'),
      location_address: $event.find('div[itemtype*="Place"] meta[itemprop="address"]').attr('content'),

      // Pricing
      price_amount: $event.find('span[itemprop="price"]').attr('content'),
      price_currency: $event.find('meta[itemprop="priceCurrency"]').attr('content') || 'GBP',
      price_display: $event.find('span[itemprop="price"]').text().trim(),
    });
  });

  return events;
}

// ============================================================================
// EXAMPLE 2: Extract Specific Fields Using Chainable Selectors
// ============================================================================

function getEventTitle($, element) {
  return $(element).find('meta[itemprop="name"]').eq(0).attr('content');
}

function getEventURL($, element) {
  const path = $(element).find('a.b-event-teaser__link').attr('href');
  return path ? `https://www.vam.ac.uk${path}` : null;
}

function getEventImage($, element) {
  return {
    src: $(element).find('img.b-event-teaser__media-image').attr('src'),
    alt: $(element).find('img.b-event-teaser__media-image').attr('alt'),
    srcset: $(element).find('img.b-event-teaser__media-image').attr('srcset'),
  };
}

function getEventDates($, element) {
  return {
    start: $(element).find('meta[itemprop="startDate"]').attr('content'),
    end: $(element).find('meta[itemprop="endDate"]').attr('content'),
    display: $(element).find('.b-icon-list__icon--calendar .b-icon-list__item-text').text().trim(),
  };
}

function getEventPricing($, element) {
  const price = $(element).find('span[itemprop="price"]').attr('content');
  return {
    amount: price === '0.0' ? 0 : parseFloat(price),
    currency: 'GBP',
    is_free: $(element).attr('data-wo-free') === '',
    display: $(element).find('span[itemprop="price"]').text().trim(),
  };
}

function getEventVenue($, element) {
  return {
    code: $(element).attr('data-wo-venue'),
    name: $(element).find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim(),
    address: $(element).find('div[itemtype*="Place"] meta[itemprop="address"]').attr('content'),
  };
}

// ============================================================================
// EXAMPLE 3: Extract by Event Type
// ============================================================================

function extractEventsByType(html, eventType) {
  const $ = cheerio.load(html);
  const events = [];

  $(`li.b-event-teaser[data-wo-type="${eventType}"]`).each((index, element) => {
    const $event = $(element);

    events.push({
      id: $event.attr('id'),
      title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
      type: eventType,
      url: `https://www.vam.ac.uk${$event.find('a.b-event-teaser__link').attr('href')}`,
      image: $event.find('img.b-event-teaser__media-image').attr('src'),
      start_date: $event.find('meta[itemprop="startDate"]').attr('content'),
    });
  });

  return events;
}

// Usage:
// const talks = extractEventsByType(html, 'talk');
// const festivals = extractEventsByType(html, 'festival');
// const displays = extractEventsByType(html, 'display');

// ============================================================================
// EXAMPLE 4: Extract by Venue
// ============================================================================

function extractEventsByVenue(html, venueCode) {
  const $ = cheerio.load(html);
  const events = [];

  $(`li.b-event-teaser[data-wo-venue="${venueCode}"]`).each((index, element) => {
    const $event = $(element);

    events.push({
      id: $event.attr('id'),
      title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
      venue: $event.find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim(),
      type: $event.attr('data-wo-type'),
      url: `https://www.vam.ac.uk${$event.find('a.b-event-teaser__link').attr('href')}`,
    });
  });

  return events;
}

// Usage:
// const southKensingtonEvents = extractEventsByVenue(html, 'south-kensington');
// const youngVAEvents = extractEventsByVenue(html, 'young');

// ============================================================================
// EXAMPLE 5: Extract Free Events
// ============================================================================

function extractFreeEvents(html) {
  const $ = cheerio.load(html);
  const events = [];

  $('li.b-event-teaser[data-wo-free=""]').each((index, element) => {
    const $event = $(element);

    events.push({
      id: $event.attr('id'),
      title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
      type: $event.attr('data-wo-type'),
      url: `https://www.vam.ac.uk${$event.find('a.b-event-teaser__link').attr('href')}`,
      image: $event.find('img.b-event-teaser__media-image').attr('src'),
      start_date: $event.find('meta[itemprop="startDate"]').attr('content'),
    });
  });

  return events;
}

// ============================================================================
// EXAMPLE 6: Extract Featured Events Only
// ============================================================================

function extractFeaturedEvents(html) {
  const $ = cheerio.load(html);

  // Featured events are the first 5 items
  const featured = [];

  $('li.b-event-teaser.js-wo-event').slice(0, 5).each((index, element) => {
    const $event = $(element);

    featured.push({
      position: index + 1,
      id: $event.attr('id'),
      title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
      type: $event.attr('data-wo-type'),
      url: `https://www.vam.ac.uk${$event.find('a.b-event-teaser__link').attr('href')}`,
    });
  });

  return featured;
}

// ============================================================================
// EXAMPLE 7: Extract Events with Specific Audiences
// ============================================================================

function extractEventsByAudience(html, audience) {
  const $ = cheerio.load(html);
  const events = [];

  $('li.b-event-teaser.js-wo-event').each((index, element) => {
    const $event = $(element);
    const audiences = ($event.attr('data-wo-audience') || '').split(' ').filter(Boolean);

    if (audiences.includes(audience)) {
      events.push({
        id: $event.attr('id'),
        title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
        audiences: audiences,
        url: `https://www.vam.ac.uk${$event.find('a.b-event-teaser__link').attr('href')}`,
      });
    }
  });

  return events;
}

// Usage:
// const memberEvents = extractEventsByAudience(html, 'for-members');
// const eveningEvents = extractEventsByAudience(html, 'evening-event');
// const africanHeritageEvents = extractEventsByAudience(html, 'african-heritage');

// ============================================================================
// EXAMPLE 8: Extract Google Analytics DataLayer
// ============================================================================

function extractGoogleAnalyticsData(html) {
  const $ = cheerio.load(html);

  // Find the script tag containing dataLayer
  let analyticsData = null;

  $('script').each((index, element) => {
    const scriptContent = $(element).html();

    if (scriptContent && scriptContent.includes('dataLayer.push')) {
      // Extract JSON from script
      const jsonMatch = scriptContent.match(/dataLayer\.push\(([\s\S]*?)\)/);

      if (jsonMatch) {
        try {
          analyticsData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error('Failed to parse dataLayer JSON:', e);
        }
      }
    }
  });

  return analyticsData;
}

// Usage:
// const gaData = extractGoogleAnalyticsData(html);
// console.log(gaData.ecommerce.impressions);

// ============================================================================
// EXAMPLE 9: Map Venue Codes to Display Names
// ============================================================================

const venueCodeMap = {
  'south-kensington': 'V&A South Kensington',
  'young': 'Young V&A',
  'museum-of-childhood': 'V&A Museum of Childhood',
  // Add more as discovered
};

function expandVenueCodes(events) {
  return events.map(event => ({
    ...event,
    venue_display: venueCodeMap[event.venue_code] || event.venue_code,
  }));
}

// ============================================================================
// EXAMPLE 10: Format Event Data for CSV Export
// ============================================================================

function formatEventsForCSV(events) {
  return events.map(event => ({
    'Event ID': event.id,
    'Title': event.title,
    'Type': event.type,
    'Start Date': event.start_date,
    'End Date': event.end_date,
    'Venue': event.venue_display,
    'Price': event.price_display,
    'URL': event.full_url,
    'Image URL': event.image_url,
    'Is Free': event.is_free ? 'Yes' : 'No',
    'Audiences': (event.audiences || []).join('; '),
  }));
}

// ============================================================================
// EXAMPLE 11: Extract Events Happening This Week
// ============================================================================

function extractUpcomingEvents(html, daysAhead = 7) {
  const $ = cheerio.load(html);
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const events = [];

  $('li.b-event-teaser.js-wo-event').each((index, element) => {
    const $event = $(element);
    const startDateStr = $event.find('meta[itemprop="startDate"]').attr('content');

    if (startDateStr) {
      const startDate = new Date(startDateStr);

      if (startDate > today && startDate <= weekFromNow) {
        events.push({
          id: $event.attr('id'),
          title: $event.find('meta[itemprop="name"]').eq(0).attr('content'),
          start_date: startDateStr,
          days_until: Math.ceil((startDate - today) / (1000 * 60 * 60 * 24)),
          url: `https://www.vam.ac.uk${$event.find('a.b-event-teaser__link').attr('href')}`,
        });
      }
    }
  });

  return events.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
}

// ============================================================================
// EXAMPLE 12: Error-Safe Extraction with Fallbacks
// ============================================================================

function safeExtractEvent($, element) {
  const $event = $(element);

  const getAttr = (selector, attr) => {
    const value = $event.find(selector).attr(attr);
    return value === undefined ? null : value;
  };

  const getText = (selector) => {
    const text = $event.find(selector).text();
    return text ? text.trim() : null;
  };

  return {
    // Use try-catch for each field to prevent failures
    id: $event.attr('id') || null,

    title: getAttr('meta[itemprop="name"]', 'content') ||
            getText('.b-event-teaser__title') ||
            'Unknown Title',

    type: $event.attr('data-wo-type') || 'unknown',

    venue_code: $event.attr('data-wo-venue') || null,

    start_date: getAttr('meta[itemprop="startDate"]', 'content') || null,

    end_date: getAttr('meta[itemprop="endDate"]', 'content') || null,

    url: (() => {
      const path = $event.find('a.b-event-teaser__link').attr('href');
      return path ? `https://www.vam.ac.uk${path}` : null;
    })(),

    image_url: getAttr('img.b-event-teaser__media-image', 'src') || null,

    price_amount: (() => {
      const price = getAttr('span[itemprop="price"]', 'content');
      return price ? parseFloat(price) : null;
    })(),

    is_free: $event.attr('data-wo-free') === '',

    audiences: ($event.attr('data-wo-audience') || '')
      .split(' ')
      .filter(a => a.length > 0),

    description: getAttr('meta[itemprop="description"]', 'content') || null,
  };
}

// ============================================================================
// COMPLETE EXAMPLE: Full Scrape with Fetch
// ============================================================================

async function completeVAEventScrape() {
  try {
    // Fetch the page
    const response = await fetch('https://www.vam.ac.uk/whatson');
    const html = await response.text();

    // Load into Cheerio
    const $ = cheerio.load(html);

    // Extract all events
    const allEvents = extractAllEvents(html);

    // Extract featured events
    const featuredEvents = extractFeaturedEvents(html);

    // Extract free events
    const freeEvents = extractFreeEvents(html);

    // Extract by type
    const talks = extractEventsByType(html, 'talk');
    const festivals = extractEventsByType(html, 'festival');

    // Extract upcoming events
    const upcoming = extractUpcomingEvents(html, 14);

    // Extract Google Analytics data
    const gaData = extractGoogleAnalyticsData(html);

    return {
      total_events: allEvents.length,
      featured_count: featuredEvents.length,
      free_count: freeEvents.length,
      events: allEvents,
      featured: featuredEvents,
      free_events: freeEvents,
      talks: talks,
      festivals: festivals,
      upcoming_events: upcoming,
      analytics: gaData,
      scraped_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  extractAllEvents,
  extractEventsByType,
  extractEventsByVenue,
  extractFreeEvents,
  extractFeaturedEvents,
  extractEventsByAudience,
  extractGoogleAnalyticsData,
  extractUpcomingEvents,
  safeExtractEvent,
  formatEventsForCSV,
  venueCodeMap,
  getEventTitle,
  getEventURL,
  getEventImage,
  getEventDates,
  getEventPricing,
  getEventVenue,
  completeVAEventScrape,
};
