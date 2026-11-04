#!/usr/bin/env node
// TRIAD DECOMPOSITION — Mark irreducibles. Decompose everything else.
//
// IRREDUCIBLE TRIAD: 3 channels that can't be broken into smaller functional units.
//   They are PRIME. The sieve passes them. They are the hard sticks.
//
// COMPOSITE: Any channel that DECOMPOSES into existing triads.
//   Like composite numbers factor into primes.
//
// TETRAD: Triad + 1 emergent. When two triads share a channel,
//   their union minus overlap = TETRAD (4 unique channels).
//   Tetrad = irreducible triad COMPOSED with another.
//
// PENTAD: 3 inputs → null → 5 outputs. The φ ratio.
//   Triad (3 inputs) through forge = Pentad (5 outputs).

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const NUTRIENTS = path.join(DATA, 'nutrients');
const log = (msg) => console.log('[TRIAD ' + new Date().toISOString() + '] ' + msg);

// Load all nutrients to build channel similarity
const nFiles = fs.readdirSync(NUTRIENTS).filter(f => f.endsWith('.json'));
const channels = {};

nFiles.forEach(f => {
  try {
    const n = JSON.parse(fs.readFileSync(path.join(NUTRIENTS, f), 'utf8'));
    const src = (n.source || n.feed_name || f).toString().slice(0, 50);
    const domains = new Set(n.unique_domains || []);
    const items = n.item_count || 0;
    const bytes = n.raw_bytes || 0;
    channels[src] = { domains, items, bytes, file: f };
  } catch(e) {}
});

const channelNames = Object.keys(channels);
log('Total channels: ' + channelNames.length);

// Jaccard distance between domain sets
function jaccard(a, b) {
  const union = new Set([...a, ...b]);
  const inter = new Set([...a].filter(x => b.has(x)));
  return union.size > 0 ? 1 - (inter.size / union.size) : 1;
}

// Load existing triads
const taxFile = path.join(DATA, 'taxonomy-gen-214.json');
const tax = JSON.parse(fs.readFileSync(taxFile, 'utf8'));
const existingTriads = (tax.organisms || []).map((o, i) => ({
  id: 'T' + (i + 1),
  members: o.triad,
  name: o.name,
  role: o.role
}));

// All channels already in a triad
const inTriad = new Set();
existingTriads.forEach(t => t.members.forEach(m => inTriad.add(m)));

// For each unassigned channel, find its nearest triad by average distance to triad members
const unassigned = channelNames.filter(c => !inTriad.has(c));
log('Unassigned channels: ' + unassigned.length);

// Compute affinity of each unassigned channel to each existing triad
const decompositions = [];
const irreducibles = [];

unassigned.forEach(ch => {
  const chDomains = channels[ch] ? channels[ch].domains : new Set();
  if (chDomains.size === 0) {
    irreducibles.push({ channel: ch, reason: 'no domain data — cannot decompose' });
    return;
  }

  let bestTriad = null;
  let bestDist = Infinity;

  existingTriads.forEach(triad => {
    // Average distance to triad members
    let totalDist = 0;
    let count = 0;
    triad.members.forEach(m => {
      if (channels[m] && channels[m].domains.size > 0) {
        totalDist += jaccard(chDomains, channels[m].domains);
        count++;
      }
    });
    const avgDist = count > 0 ? totalDist / count : 1;
    if (avgDist < bestDist) {
      bestDist = avgDist;
      bestTriad = triad;
    }
  });

  if (bestDist < 0.85) {
    decompositions.push({
      channel: ch,
      decomposesInto: bestTriad.id,
      triadName: bestTriad.name,
      distance: bestDist.toFixed(3),
      items: channels[ch] ? channels[ch].items : 0
    });
  } else {
    irreducibles.push({
      channel: ch,
      reason: 'distance ' + bestDist.toFixed(3) + ' — too far from any triad',
      items: channels[ch] ? channels[ch].items : 0
    });
  }
});

log('');
log('═══ DECOMPOSITION RESULTS ═══');
log('  Composites (decompose into triads): ' + decompositions.length);
log('  Irreducibles (can\'t decompose):     ' + irreducibles.length);
log('  Existing triad members:              ' + inTriad.size);

// Group decompositions by triad
const byTriad = {};
existingTriads.forEach(t => byTriad[t.id] = { triad: t, composites: [] });
decompositions.forEach(d => {
  if (byTriad[d.decomposesInto]) {
    byTriad[d.decomposesInto].composites.push(d);
  }
});

log('');
log('═══ TRIAD DECOMPOSITION MAP ═══');
Object.values(byTriad).forEach(({ triad, composites }) => {
  log('');
  log('  ' + triad.id + ': ' + triad.name + ' [' + triad.role.split(' — ')[0] + ']');
  log('    IRREDUCIBLE CORE: ' + triad.members.join(' + '));
  log('    COMPOSITES (' + composites.length + '):');
  composites.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  composites.slice(0, 8).forEach(c => {
    log('      [' + c.distance + '] ' + c.channel.slice(0, 45));
  });
  if (composites.length > 8) log('      ... +' + (composites.length - 8) + ' more');
});

// Build TETRADS — pairs of triads that share affinity
log('');
log('═══ TETRAD FORMATION (triad + triad → tetrad) ═══');
const tetrads = [];
for (let i = 0; i < existingTriads.length; i++) {
  for (let j = i + 1; j < existingTriads.length; j++) {
    const a = existingTriads[i];
    const b = existingTriads[j];
    // Shared composites = channels that decompose into BOTH triads
    const aComps = new Set((byTriad[a.id].composites || []).map(c => c.channel));
    const bComps = new Set((byTriad[b.id].composites || []).map(c => c.channel));
    const shared = [...aComps].filter(c => bComps.has(c));

    // Union of unique members
    const union = new Set([...a.members, ...b.members]);

    if (union.size === 4 || union.size === 5) {
      // Natural tetrad or pentad!
      tetrads.push({
        from: [a.id, b.id],
        names: [a.name, b.name],
        union: [...union],
        size: union.size,
        type: union.size === 4 ? 'TETRAD' : 'PENTAD',
        shared_composites: shared.length
      });
    }
  }
}

// Also form tetrads by adding closest irreducible to a triad
const irredTetrads = [];
irreducibles.filter(ir => ir.items > 0).sort((a, b) => (b.items || 0) - (a.items || 0)).slice(0, 20).forEach(ir => {
  const chDomains = channels[ir.channel] ? channels[ir.channel].domains : new Set();
  let bestTriad = null, bestDist = Infinity;
  existingTriads.forEach(triad => {
    let d = 0, c = 0;
    triad.members.forEach(m => {
      if (channels[m] && channels[m].domains.size > 0) {
        d += jaccard(chDomains, channels[m].domains); c++;
      }
    });
    const avg = c > 0 ? d / c : 1;
    if (avg < bestDist) { bestDist = avg; bestTriad = triad; }
  });
  if (bestTriad) {
    irredTetrads.push({
      triad: bestTriad.id,
      triadName: bestTriad.name,
      plus: ir.channel,
      distance: bestDist.toFixed(3),
      type: 'TETRAD (triad + irreducible)'
    });
  }
});

log('  Natural tetrads/pentads from triad pairs: ' + tetrads.length);
tetrads.slice(0, 10).forEach(t => {
  log('    ' + t.type + ': ' + t.from.join('+') + ' = ' + t.names.join(' × '));
  log('      Members: ' + t.union.join(', '));
});

log('');
log('  Tetrads from triad + irreducible: ' + irredTetrads.length);
irredTetrads.slice(0, 10).forEach(t => {
  log('    ' + t.triad + '(' + t.triadName.slice(0, 15) + ') + ' + t.plus.slice(0, 30) + ' [' + t.distance + ']');
});

// Build NEW irreducible triads from unassigned channels
log('');
log('═══ NEW IRREDUCIBLE TRIADS (from orphan channels) ═══');
const richIrred = irreducibles.filter(ir => ir.items > 5).sort((a, b) => (b.items || 0) - (a.items || 0));
const newTriads = [];
for (let i = 0; i + 2 < richIrred.length && newTriads.length < 10; i += 3) {
  const members = [richIrred[i].channel, richIrred[i + 1].channel, richIrred[i + 2].channel];
  const GENUS = ['Ferro','Silico','Carbo','Nitro','Oxy','Hydro','Sulfo','Phospho','Calci','Bora'];
  const SPECIES = ['primordia','nucleata','fissilis','vortexii','crystallum','igneum','glacialis','magnetica','radiata','spiralis'];
  const ROLES = ['BEDROCK','MAGMA','CRYSTAL','MINERAL','GAS','PLASMA','DUST','ICE','SLAG','ORE'];
  const name = GENUS[newTriads.length] + ' ' + SPECIES[newTriads.length];
  const role = ROLES[newTriads.length];
  newTriads.push({ members, name, role, items: members.reduce((s, m) => s + (channels[m] ? channels[m].items : 0), 0) });
  log('  T' + (existingTriads.length + newTriads.length) + ': ' + name + ' [' + role + ']');
  log('    ' + members.join(' + '));
}

// Save everything
const result = {
  _generated: new Date().toISOString(),
  _wave: 214,
  type: 'triad-decomposition-irreducibles-tetrads',
  title: 'TRIAD SETS marked IRREDUCIBLE. Everything else DECOMPOSES. Tetrads from triad pairs.',

  stats: {
    total_channels: channelNames.length,
    in_existing_triads: inTriad.size,
    composites: decompositions.length,
    irreducibles: irreducibles.length,
    natural_tetrads: tetrads.length,
    irred_tetrads: irredTetrads.length,
    new_triads: newTriads.length
  },

  existing_triads: existingTriads.map(t => ({
    id: t.id, name: t.name, role: t.role, members: t.members,
    composite_count: (byTriad[t.id].composites || []).length,
    top_composites: (byTriad[t.id].composites || []).slice(0, 5).map(c => c.channel)
  })),

  decomposition_map: Object.fromEntries(
    Object.entries(byTriad).map(([id, { triad, composites }]) => [
      id, { name: triad.name, members: triad.members,
            composites: composites.map(c => ({ channel: c.channel, distance: c.distance })) }
    ])
  ),

  tetrads: tetrads.slice(0, 15),
  irred_tetrads: irredTetrads.slice(0, 15),

  new_irreducible_triads: newTriads,

  irreducible_list: irreducibles.slice(0, 40).map(ir => ({ channel: ir.channel, reason: ir.reason })),

  theory: {
    triad: 'IRREDUCIBLE: 3 channels that cannot be decomposed further. Like primes.',
    tetrad: 'COMPOSITE: triad + 1 emergent. Like 4 = 2+2. Decomposable into triads.',
    pentad: '3 inputs → null → 5 outputs. The φ ratio. The forge output.',
    sieve: 'The irreducible sieve line: π sorts triads (prime) from composites.',
    hierarchy: 'TRIAD (irreducible, 3) → TETRAD (composed, 4) → PENTAD (forged, 5). 3→4→5 = evolution.'
  }
};

fs.writeFileSync(path.join(DATA, 'triad-decomposition-214.json'), JSON.stringify(result, null, 2));
log('');
log('═══ SAVED: data/triad-decomposition-214.json ═══');
log('Triads = primes. Tetrads = composites. Pentads = products.');
log('Everything decomposes into irreducible triads.');
