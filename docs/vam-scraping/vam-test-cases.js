/**
 * V&A What's On - Test Cases for Cheerio Extraction
 * Unit tests to validate your scrapers
 */

const cheerio = require('cheerio');
const assert = require('assert');

// ============================================================================
// TEST SETUP
// ============================================================================

/**
 * Load the page and test all selectors
 * Run with: node vam-test-cases.js
 */

async function loadPageForTesting() {
  const fetch = require('node-fetch');
  const response = await fetch('https://www.vam.ac.uk/whatson');
  return response.text();
}

// ============================================================================
// TEST SUITE 1: Basic DOM Structure
// ============================================================================

function testBasicStructure(html) {
  console.log('\n=== Test Suite 1: Basic DOM Structure ===');

  const $ = cheerio.load(html);

  // Test 1.1: Page should have main.whatson container
  try {
    const mainElement = $('.main.whatson');
    assert(mainElement.length > 0, 'Missing main.whatson container');
    console.log('✓ Test 1.1: main.whatson found');
  } catch (e) {
    console.error('✗ Test 1.1:', e.message);
  }

  // Test 1.2: Should have exactly 146 events
  try {
    const events = $('li.b-event-teaser.js-wo-event');
    assert.strictEqual(
      events.length,
      146,
      `Expected 146 events, got ${events.length}`
    );
    console.log('✓ Test 1.2: Found 146 events');
  } catch (e) {
    console.error('✗ Test 1.2:', e.message);
  }

  // Test 1.3: Each event should have article[itemscope] element
  try {
    const events = $('li.b-event-teaser.js-wo-event');
    let count = 0;
    events.each((i, el) => {
      if ($(el).find('article[itemscope]').length > 0) count++;
    });
    assert(count >= 145, `Only ${count}/146 events have article[itemscope]`);
    console.log(`✓ Test 1.3: ${count}/146 events have proper article markup`);
  } catch (e) {
    console.error('✗ Test 1.3:', e.message);
  }

  // Test 1.4: Should have Schema.org Event markup
  try {
    const eventMarkup = $('article[itemtype*="schema.org/Event"]');
    assert(eventMarkup.length > 100, 'Missing Schema.org Event markup');
    console.log(`✓ Test 1.4: Found ${eventMarkup.length} Schema.org Event items`);
  } catch (e) {
    console.error('✗ Test 1.4:', e.message);
  }
}

// ============================================================================
// TEST SUITE 2: Event Data Extraction
// ============================================================================

function testEventDataExtraction(html) {
  console.log('\n=== Test Suite 2: Event Data Extraction ===');

  const $ = cheerio.load(html);
  const firstEvent = $('li.b-event-teaser.js-wo-event').eq(0);

  // Test 2.1: Event should have ID
  try {
    const eventId = firstEvent.attr('id');
    assert(eventId && eventId.length > 0, 'Event missing id attribute');
    assert(typeof eventId === 'string', 'Event id should be string');
    console.log(`✓ Test 2.1: Event ID found: "${eventId}"`);
  } catch (e) {
    console.error('✗ Test 2.1:', e.message);
  }

  // Test 2.2: Event should have type
  try {
    const eventType = firstEvent.attr('data-wo-type');
    assert(eventType && eventType.length > 0, 'Event missing data-wo-type');
    const validTypes = [
      'talk', 'festival', 'display', 'exhibition',
      'course', 'screening', 'workshop', 'event'
    ];
    assert(
      validTypes.includes(eventType),
      `Unknown event type: "${eventType}"`
    );
    console.log(`✓ Test 2.2: Event type found: "${eventType}"`);
  } catch (e) {
    console.error('✗ Test 2.2:', e.message);
  }

  // Test 2.3: Event should have venue code
  try {
    const venue = firstEvent.attr('data-wo-venue');
    assert(venue !== undefined, 'Event missing data-wo-venue attribute');
    assert(venue.length > 0, 'Venue code should not be empty');
    console.log(`✓ Test 2.3: Venue code found: "${venue}"`);
  } catch (e) {
    console.error('✗ Test 2.3:', e.message);
  }

  // Test 2.4: Event should have title
  try {
    const title = firstEvent.find('meta[itemprop="name"]').eq(0).attr('content');
    assert(title && title.length > 0, 'Event missing title');
    assert(title.length > 3, 'Title seems too short');
    console.log(`✓ Test 2.4: Title found: "${title}"`);
  } catch (e) {
    console.error('✗ Test 2.4:', e.message);
  }

  // Test 2.5: Event should have start date
  try {
    const startDate = firstEvent.find('meta[itemprop="startDate"]').attr('content');
    assert(startDate && startDate.length > 0, 'Event missing startDate');
    // Validate ISO date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    assert(dateRegex.test(startDate), `Invalid date format: "${startDate}"`);
    console.log(`✓ Test 2.5: Start date found: "${startDate}"`);
  } catch (e) {
    console.error('✗ Test 2.5:', e.message);
  }

  // Test 2.6: Event should have image URL
  try {
    const imageUrl = firstEvent.find('img.b-event-teaser__media-image').attr('src');
    assert(imageUrl && imageUrl.length > 0, 'Event missing image');
    assert(
      imageUrl.startsWith('https://'),
      `Image URL should be HTTPS: "${imageUrl}"`
    );
    console.log(`✓ Test 2.6: Image URL found: "${imageUrl.substring(0, 60)}..."`);
  } catch (e) {
    console.error('✗ Test 2.6:', e.message);
  }

  // Test 2.7: Event should have description
  try {
    const description = firstEvent.find('meta[itemprop="description"]').attr('content');
    assert(description && description.length > 0, 'Event missing description');
    assert(description.length > 20, 'Description seems too short');
    console.log(`✓ Test 2.7: Description found (${description.length} chars)`);
  } catch (e) {
    console.error('✗ Test 2.7:', e.message);
  }

  // Test 2.8: Event should have event link
  try {
    const eventLink = firstEvent.find('a.b-event-teaser__link').attr('href');
    assert(eventLink && eventLink.length > 0, 'Event missing link');
    assert(eventLink.startsWith('/'), 'Link should be relative path');
    console.log(`✓ Test 2.8: Event link found: "${eventLink}"`);
  } catch (e) {
    console.error('✗ Test 2.8:', e.message);
  }

  // Test 2.9: Event should have pricing information
  try {
    const price = firstEvent.find('span[itemprop="price"]').attr('content');
    assert(price !== undefined, 'Event missing price');
    assert(!isNaN(parseFloat(price)), `Invalid price value: "${price}"`);
    console.log(`✓ Test 2.9: Price found: "${price}" (${firstEvent.find('span[itemprop="price"]').text().trim()})`);
  } catch (e) {
    console.error('✗ Test 2.9:', e.message);
  }

  // Test 2.10: Event should have venue information
  try {
    const venueName = firstEvent.find('.b-icon-list__icon--pin .b-icon-list__item-text').text().trim();
    assert(venueName && venueName.length > 0, 'Event missing venue name');
    console.log(`✓ Test 2.10: Venue name found: "${venueName}"`);
  } catch (e) {
    console.error('✗ Test 2.10:', e.message);
  }
}

// ============================================================================
// TEST SUITE 3: Data Attributes Validation
// ============================================================================

function testDataAttributes(html) {
  console.log('\n=== Test Suite 3: Data Attributes Validation ===');

  const $ = cheerio.load(html);
  const events = $('li.b-event-teaser.js-wo-event');

  // Test 3.1: All events should have data-wo-type
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).attr('data-wo-type')) count++;
    });
    assert.strictEqual(count, 146, `Only ${count}/146 events have data-wo-type`);
    console.log('✓ Test 3.1: All 146 events have data-wo-type');
  } catch (e) {
    console.error('✗ Test 3.1:', e.message);
  }

  // Test 3.2: All events should have data-wo-venue
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).attr('data-wo-venue')) count++;
    });
    assert(count >= 140, `Only ${count}/146 events have data-wo-venue`);
    console.log(`✓ Test 3.2: ${count}/146 events have data-wo-venue`);
  } catch (e) {
    console.error('✗ Test 3.2:', e.message);
  }

  // Test 3.3: All events should have data-wo-free attribute
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).attr('data-wo-free') !== undefined) count++;
    });
    assert.strictEqual(count, 146, `Only ${count}/146 events have data-wo-free`);
    console.log('✓ Test 3.3: All 146 events have data-wo-free');
  } catch (e) {
    console.error('✗ Test 3.3:', e.message);
  }

  // Test 3.4: All events should have data-wo-audience
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).attr('data-wo-audience') !== undefined) count++;
    });
    assert.strictEqual(count, 146, `Only ${count}/146 events have data-wo-audience`);
    console.log('✓ Test 3.4: All 146 events have data-wo-audience');
  } catch (e) {
    console.error('✗ Test 3.4:', e.message);
  }

  // Test 3.5: Free status should be valid
  try {
    const freeCount = events.filter('[data-wo-free=""]').length;
    const paidCount = events.filter('[data-wo-free="false"]').length;
    const total = freeCount + paidCount;
    assert(
      total >= 140,
      `Expected ~146 valid free statuses, got ${total}`
    );
    console.log(`✓ Test 3.5: Free events: ${freeCount}, Paid events: ${paidCount}`);
  } catch (e) {
    console.error('✗ Test 3.5:', e.message);
  }
}

// ============================================================================
// TEST SUITE 4: Schema.org Structured Data
// ============================================================================

function testStructuredData(html) {
  console.log('\n=== Test Suite 4: Schema.org Structured Data ===');

  const $ = cheerio.load(html);
  const events = $('li.b-event-teaser.js-wo-event');

  // Test 4.1: Events should have itemtype=Event
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).find('article[itemtype*="Event"]').length > 0) count++;
    });
    assert(count >= 140, `Only ${count}/146 events have proper Event schema`);
    console.log(`✓ Test 4.1: ${count}/146 events have Schema.org Event markup`);
  } catch (e) {
    console.error('✗ Test 4.1:', e.message);
  }

  // Test 4.2: Events should have location schema
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).find('div[itemtype*="Place"]').length > 0) count++;
    });
    assert(count >= 140, `Only ${count}/146 events have location schema`);
    console.log(`✓ Test 4.2: ${count}/146 events have Place schema`);
  } catch (e) {
    console.error('✗ Test 4.2:', e.message);
  }

  // Test 4.3: Events should have Offer schema
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).find('[itemtype*="Offer"]').length > 0) count++;
    });
    assert(count >= 140, `Only ${count}/146 events have Offer schema`);
    console.log(`✓ Test 4.3: ${count}/146 events have Offer schema`);
  } catch (e) {
    console.error('✗ Test 4.3:', e.message);
  }

  // Test 4.4: All dates should be ISO format
  try {
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;
    let validCount = 0;
    events.each((i, el) => {
      const startDate = $(el).find('meta[itemprop="startDate"]').attr('content');
      if (startDate && dateRegex.test(startDate)) validCount++;
    });
    assert(validCount >= 140, `Only ${validCount}/146 dates are ISO format`);
    console.log(`✓ Test 4.4: ${validCount}/146 events have valid ISO dates`);
  } catch (e) {
    console.error('✗ Test 4.4:', e.message);
  }
}

// ============================================================================
// TEST SUITE 5: Analytics DataLayer
// ============================================================================

function testAnalyticsData(html) {
  console.log('\n=== Test Suite 5: Analytics DataLayer ===');

  // Test 5.1: Page should have dataLayer
  try {
    assert(html.includes('dataLayer.push'), 'Missing dataLayer.push');
    console.log('✓ Test 5.1: dataLayer.push found in HTML');
  } catch (e) {
    console.error('✗ Test 5.1:', e.message);
  }

  // Test 5.2: dataLayer should have impressions
  try {
    const match = html.match(/dataLayer\.push\(([\s\S]*?)\)/);
    assert(match, 'Could not extract dataLayer');

    const dataLayer = JSON.parse(match[1]);
    assert(dataLayer.ecommerce, 'Missing ecommerce object');
    assert(dataLayer.ecommerce.impressions, 'Missing impressions array');
    console.log('✓ Test 5.2: dataLayer has ecommerce.impressions');
  } catch (e) {
    console.error('✗ Test 5.2:', e.message);
  }

  // Test 5.3: Should have 146 impressions
  try {
    const match = html.match(/dataLayer\.push\(([\s\S]*?)\)/);
    const dataLayer = JSON.parse(match[1]);
    const impressions = dataLayer.ecommerce.impressions;

    assert.strictEqual(
      impressions.length,
      146,
      `Expected 146 impressions, got ${impressions.length}`
    );
    console.log('✓ Test 5.3: dataLayer has 146 impressions');
  } catch (e) {
    console.error('✗ Test 5.3:', e.message);
  }

  // Test 5.4: Featured vs Main list split
  try {
    const match = html.match(/dataLayer\.push\(([\s\S]*?)\)/);
    const dataLayer = JSON.parse(match[1]);
    const impressions = dataLayer.ecommerce.impressions;

    const featured = impressions.filter(e => e.list === 'whats-on - featured');
    const main = impressions.filter(e => e.list === 'whats-on - main-list');

    assert.strictEqual(featured.length, 5, 'Featured should have 5 items');
    assert.strictEqual(main.length, 141, 'Main list should have 141 items');
    console.log('✓ Test 5.4: Featured (5) + Main list (141) = 146');
  } catch (e) {
    console.error('✗ Test 5.4:', e.message);
  }
}

// ============================================================================
// TEST SUITE 6: Image Handling
// ============================================================================

function testImageHandling(html) {
  console.log('\n=== Test Suite 6: Image Handling ===');

  const $ = cheerio.load(html);
  const events = $('li.b-event-teaser.js-wo-event');
  const firstEvent = events.eq(0);

  // Test 6.1: All events should have image src
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).find('img.b-event-teaser__media-image').attr('src')) count++;
    });
    assert.strictEqual(count, 146, `Only ${count}/146 events have image src`);
    console.log('✓ Test 6.1: All 146 events have image src');
  } catch (e) {
    console.error('✗ Test 6.1:', e.message);
  }

  // Test 6.2: Images should be HTTPS
  try {
    const src = firstEvent.find('img.b-event-teaser__media-image').attr('src');
    assert(src.startsWith('https://'), `Image should be HTTPS: ${src}`);
    console.log('✓ Test 6.2: Images are HTTPS');
  } catch (e) {
    console.error('✗ Test 6.2:', e.message);
  }

  // Test 6.3: All events should have srcset
  try {
    let count = 0;
    events.each((i, el) => {
      if ($(el).find('img.b-event-teaser__media-image').attr('srcset')) count++;
    });
    assert(count >= 145, `Only ${count}/146 events have srcset`);
    console.log(`✓ Test 6.3: ${count}/146 events have responsive srcset`);
  } catch (e) {
    console.error('✗ Test 6.3:', e.message);
  }

  // Test 6.4: srcset should have multiple sizes
  try {
    const srcset = firstEvent.find('img.b-event-teaser__media-image').attr('srcset');
    const sizes = srcset.split(',').length;
    assert(sizes >= 5, `srcset should have multiple sizes, got ${sizes}`);
    console.log(`✓ Test 6.4: srcset has ${sizes} responsive sizes`);
  } catch (e) {
    console.error('✗ Test 6.4:', e.message);
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

async function runAllTests() {
  console.log('V&A What\'s On Page - Test Suite');
  console.log('='.repeat(50));

  try {
    console.log('\nFetching page...');
    const html = await loadPageForTesting();
    console.log(`Downloaded ${html.length} bytes of HTML\n`);

    testBasicStructure(html);
    testEventDataExtraction(html);
    testDataAttributes(html);
    testStructuredData(html);
    testAnalyticsData(html);
    testImageHandling(html);

    console.log('\n' + '='.repeat(50));
    console.log('Test run complete!');
  } catch (error) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  testBasicStructure,
  testEventDataExtraction,
  testDataAttributes,
  testStructuredData,
  testAnalyticsData,
  testImageHandling,
  runAllTests,
};

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}
