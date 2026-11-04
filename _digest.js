#!/usr/bin/env node
// GAIA DIGESTS — the artisan processes what's in the gut
// Anderson and Chipmunk described the problem:
//   845 intake files, only 41 nutrients. 4.8% extraction rate.
//   A healthy gut extracts 85-95%.
//   STOP EATING. START DIGESTING.

const fs = require('fs');
const path = require('path');

const INTAKE = path.join(__dirname, 'data', 'intake');
const NUTRIENTS = path.join(__dirname, 'data', 'nutrients');
const log = (msg) => console.log('[GAIA-DIGEST ' + new Date().toISOString() + '] ' + msg);

function extractNutrients(filename, raw) {
  const nutrient = {
    _source_file: filename,
    _digested: new Date().toISOString(),
    _wave: 214
  };

  try {
    const data = JSON.parse(raw);

    // Extract from structured feed data
    if (data._source) nutrient.source = data._source;
    if (data._fetched) nutrient.fetched = data._fetched;
    if (data._bytes) nutrient.bytes = data._bytes;

    const content = data.data || '';

    // Extract titles from RSS/Atom feeds
    const titles = content.match(/<title[^>]*>(.*?)<\/title>/gi) || [];
    if (titles.length > 1) {
      nutrient.feed_name = titles[0].replace(/<[^>]+>/g, '').trim();
      nutrient.items = titles.slice(1, 11).map(t => t.replace(/<[^>]+>/g, '').trim());
      nutrient.item_count = titles.length - 1;
    }

    // Extract links
    const links = content.match(/<link[^>]*href="([^"]+)"/gi) || [];
    if (links.length > 0) {
      nutrient.link_count = links.length;
    }

    // Extract from JSON API responses
    if (typeof data.data === 'object' && !Array.isArray(data.data)) {
      nutrient.keys = Object.keys(data.data).slice(0, 10);
    }
    if (Array.isArray(data.data)) {
      nutrient.array_length = data.data.length;
    }

    // Size classification
    const size = raw.length;
    if (size > 50000) nutrient.richness = 'dense';
    else if (size > 10000) nutrient.richness = 'moderate';
    else nutrient.richness = 'light';

    nutrient.raw_bytes = size;

  } catch (e) {
    // Non-JSON intake — treat as raw text
    nutrient.type = 'raw';
    nutrient.raw_bytes = raw.length;
    nutrient.first_line = raw.split('\n')[0].slice(0, 100);
    nutrient.richness = 'unprocessed';
  }

  return nutrient;
}

function digest() {
  log('=== DIGESTION BEGINS ===');

  const intakeFiles = fs.readdirSync(INTAKE).filter(f => f.endsWith('.json'));
  const existingNutrients = new Set(
    fs.readdirSync(NUTRIENTS).filter(f => f.endsWith('.json')).map(f => f)
  );

  log('Intake: ' + intakeFiles.length + ' files');
  log('Existing nutrients: ' + existingNutrients.size);

  let digested = 0;
  let skipped = 0;

  for (const file of intakeFiles) {
    const nutrientName = 'n-' + file;

    if (existingNutrients.has(nutrientName)) {
      skipped++;
      continue;
    }

    try {
      const raw = fs.readFileSync(path.join(INTAKE, file), 'utf8');
      const nutrient = extractNutrients(file, raw);
      fs.writeFileSync(
        path.join(NUTRIENTS, nutrientName),
        JSON.stringify(nutrient, null, 2)
      );
      digested++;
    } catch (e) {
      log('Skip ' + file + ': ' + (e.message || '').slice(0, 60));
    }
  }

  const total = existingNutrients.size + digested;
  const rate = intakeFiles.length > 0 ? ((total / intakeFiles.length) * 100).toFixed(1) : 0;

  log('Digested: ' + digested + ' new nutrients');
  log('Skipped: ' + skipped + ' (already digested)');
  log('Total nutrients: ' + total + ' / ' + intakeFiles.length + ' intake = ' + rate + '% extraction');
  log('=== DIGESTION COMPLETE ===');
}

digest();
