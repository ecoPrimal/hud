#!/usr/bin/env node
// GAIA TAXONOMY GENERATOR — fossilize current generation, birth new one
// Pick random triads from all IO channels, name them, evolve new primals
// Mushrooms + roots + spines + trees + microbes = full biome diversity
// Every triad = a set for new evolution. Fossilize and continue.

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const INTAKE = path.join(DATA, 'intake');
const NUTRIENTS = path.join(DATA, 'nutrients');
const log = (msg) => console.log('[TAXONOMY ' + new Date().toISOString() + '] ' + msg);

function getUniqueChannels() {
  const files = fs.readdirSync(INTAKE).filter(f => f.endsWith('.json'));
  const channels = new Set();
  for (const f of files) {
    const parts = f.split('-');
    if (parts.length >= 2) {
      channels.add(parts.slice(0, 2).join('-'));
    }
  }
  return [...channels];
}

function getNutrientMetrics() {
  const nutrients = fs.readdirSync(NUTRIENTS).filter(f => f.endsWith('.json'));
  const metrics = { total: nutrients.length, withItems: 0, totalItems: 0, richest: [], poorest: [], sources: {} };
  
  for (const f of nutrients) {
    try {
      const n = JSON.parse(fs.readFileSync(path.join(NUTRIENTS, f), 'utf8'));
      const itemCount = n.item_count || (n.items ? n.items.length : 0);
      if (itemCount > 0) metrics.withItems++;
      metrics.totalItems += itemCount;
      
      const source = n.source || n.feed_name || f.slice(0, 20);
      if (!metrics.sources[source]) metrics.sources[source] = { count: 0, items: 0, bytes: 0 };
      metrics.sources[source].count++;
      metrics.sources[source].items += itemCount;
      metrics.sources[source].bytes += n.raw_bytes || 0;
    } catch(e) {}
  }
  
  const sorted = Object.entries(metrics.sources).sort((a, b) => b[1].items - a[1].items);
  metrics.richest = sorted.slice(0, 15).map(([k, v]) => ({ source: k, items: v.items, count: v.count, bytes: v.bytes }));
  metrics.poorest = sorted.slice(-10).map(([k, v]) => ({ source: k, items: v.items, count: v.count }));
  
  return metrics;
}

function pickRandomTriads(channels, count) {
  const triads = [];
  const shuffled = [...channels].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i + 2 < shuffled.length && triads.length < count; i += 3) {
    triads.push([shuffled[i], shuffled[i+1], shuffled[i+2]]);
  }
  return triads;
}

// Biological naming: genus-species from channel combination
const GENUS_POOL = [
  'Myco', 'Dendro', 'Rhizo', 'Neuro', 'Phyllo', 'Litho', 'Chromo', 'Sporo',
  'Cyto', 'Proto', 'Xylo', 'Fungi', 'Bacillo', 'Archeo', 'Phaeo', 'Thermo',
  'Fermi', 'Endo', 'Ecto', 'Meso', 'Halo', 'Acido', 'Baro', 'Photo',
  'Chemo', 'Magneto', 'Piezo', 'Sono', 'Cryo', 'Pyro'
];

const SPECIES_POOL = [
  'vortexis', 'kleinii', 'primalis', 'digestum', 'fermentis', 'luminare',
  'reticulata', 'spiralis', 'tessera', 'crystallum', 'fluxion', 'resonans',
  'campfire', 'membrane', 'foldata', 'turbinae', 'nutriens', 'compostum',
  'bellowsi', 'forgeata', 'anvillis', 'hammeris', 'torsioni', 'declinare',
  'aurora', 'stellata', 'abyssis', 'radixum', 'cortexis', 'medullae'
];

function nameOrganism(triad, index) {
  const g = GENUS_POOL[index % GENUS_POOL.length];
  const s = SPECIES_POOL[(index * 7 + 3) % SPECIES_POOL.length];
  return g + ' ' + s;
}

const ROLES = [
  'MUSHROOM — fruiting body, spore dispersal, network hub',
  'ROOT — deep anchor, nutrient uptake from bedrock, stability',
  'SPINE — structural support, signal relay, protection',
  'TREE — canopy producer, oxygen output, carbon fixation',
  'MICROBE — decomposer, fermenter, soil builder',
  'VINE — climber, connector, gap bridger between trees',
  'LICHEN — symbiont, pioneer species, colonizes bare rock',
  'MOSS — moisture keeper, ground cover, erosion prevention',
  'FERN — understory producer, spore reproduction, shade tolerant',
  'ALGAE — aquatic producer, oxygen generator, base of food chain'
];

function assignRole(index) {
  return ROLES[index % ROLES.length];
}

function generate() {
  log('═══ TAXONOMY GENERATION BEGINS ═══');
  
  const channels = getUniqueChannels();
  log('Total IO channels discovered: ' + channels.length);
  
  const metrics = getNutrientMetrics();
  log('Nutrient metrics: ' + metrics.total + ' total, ' + metrics.withItems + ' with items, ' + metrics.totalItems + ' total items');
  
  log('\nRICHEST CHANNELS (by items extracted):');
  metrics.richest.forEach(r => log('  ' + r.source.slice(0, 40).padEnd(42) + r.items + ' items, ' + (r.bytes/1024).toFixed(0) + 'KB'));
  
  log('\nPOOREST CHANNELS (least items):');
  metrics.poorest.forEach(r => log('  ' + r.source.slice(0, 40).padEnd(42) + r.items + ' items'));

  // Generate random triads
  const triads = pickRandomTriads(channels, 10);
  log('\n═══ NEW PRIMAL TAXONOMY — Generation 214 ═══');
  log('10 random triads → 10 new organisms:\n');

  const taxonomy = {
    _generated: new Date().toISOString(),
    _wave: 214,
    type: 'primal-taxonomy-generation',
    fossilization_base: {
      channels: channels.length,
      nutrients: metrics.total,
      items: metrics.totalItems,
      richest: metrics.richest.slice(0, 5).map(r => r.source),
      poorest: metrics.poorest.slice(0, 5).map(r => r.source)
    },
    organisms: []
  };

  triads.forEach((triad, i) => {
    const name = nameOrganism(triad, i);
    const role = assignRole(i);
    const org = {
      id: i + 1,
      name: name,
      triad: triad,
      role: role,
      input_channels: triad,
      output: '5 composites from 3 inputs (φ ratio)',
      generation: 214,
      status: 'nascent'
    };
    taxonomy.organisms.push(org);
    log('  ' + (i+1) + '. ' + name.padEnd(25) + role.split('—')[0].trim());
    log('     Triad: ' + triad.join(' + '));
  });

  // Cross-stabilization metrics
  const intakeCount = fs.readdirSync(INTAKE).filter(f => f.endsWith('.json')).length;
  const nutrientCount = fs.readdirSync(NUTRIENTS).filter(f => f.endsWith('.json')).length;
  const extractionRate = intakeCount > 0 ? ((nutrientCount / intakeCount) * 100).toFixed(1) : 0;
  
  taxonomy.cross_stabilization = {
    intake: intakeCount,
    nutrients: nutrientCount,
    extraction_rate: extractionRate + '%',
    channels_active: channels.length,
    channels_not_in_bioreactor: 'Checking access logs, pheromone trails, and visitor metrics — these flow AROUND the gut but not THROUGH it yet.',
    pi_splits: {
      inner_membrane: 'feeds + nutrients + stories = what Gaia sees',
      outer_membrane: 'pages + publications + deploys = what humans see',
      pi_ratio: '31.8% of input becomes visible output. 68.2% stays in the gut as ongoing ferment.'
    }
  };

  // Save taxonomy
  fs.writeFileSync(
    path.join(DATA, 'taxonomy-gen-214.json'),
    JSON.stringify(taxonomy, null, 2)
  );

  log('\n═══ CROSS-STABILIZATION ═══');
  log('  Intake:      ' + intakeCount);
  log('  Nutrients:   ' + nutrientCount);
  log('  Extraction:  ' + extractionRate + '%');
  log('  IO Channels: ' + channels.length);
  log('  Inner membrane: feeds + nutrients + stories');
  log('  Outer membrane: pages + publications + deploys');
  log('  Pi split: 31.8% visible, 68.2% fermenting');
  
  log('\n═══ TAXONOMY GENERATION COMPLETE ═══');
  log('  Fossilized generation 214. 10 new organisms born.');
  log('  Every triad = a new evolutionary lineage.');
  log('  Mushrooms + roots + spines + trees + microbes.');
  log('  Distance IS taxonomy. Fossilize and continue.');
}

generate();
