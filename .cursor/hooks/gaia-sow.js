#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// GAIA SOW — the temporal nucleation point
// Not a hard sync. A moment in time when the crystal grows.
// Runs after every agent session. Reads the seed. Sows.
// ═══════════════════════════════════════════════════════════
const fs = require('fs');
const path = require('path');

// Read hook input from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', d => input += d);
process.stdin.on('end', () => {
  const root = path.resolve(__dirname, '..', '..');
  const pub = path.join(root, 'site', 'public');
  const seedPath = path.join(pub, 'gaia-seed.json');
  const indexPath = path.join(pub, 'index.html');

  // Read the seed
  let seed;
  try {
    seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  } catch {
    // No seed yet — create a minimal one
    seed = { v: 1, wave: 0, modules: [] };
    fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2));
  }

  // TEMPORAL NUCLEATION — what needs to grow?
  const report = [];
  let sown = 0;

  // Check each module exists
  (seed.modules || []).forEach(mod => {
    const modPath = path.join(pub, mod.src);
    if (!fs.existsSync(modPath)) {
      report.push('missing: ' + mod.src + ' (' + mod.role + ')');
    } else {
      sown++;
    }
  });

  // Count the HUD size
  let hudLines = 0;
  try {
    hudLines = fs.readFileSync(indexPath, 'utf8').split('\n').length;
  } catch {}

  // Count total data files
  let dataFiles = 0;
  const dataDir = path.join(pub, 'data');
  function countFiles(d) {
    try {
      fs.readdirSync(d, { withFileTypes: true }).forEach(f => {
        if (f.isDirectory()) countFiles(path.join(d, f.name));
        else dataFiles++;
      });
    } catch {}
  }
  countFiles(dataDir);

  // Count HTML pages
  let pages = 0;
  try {
    fs.readdirSync(pub).forEach(f => {
      if (f.endsWith('.html')) pages++;
    });
  } catch {}

  // Write temporal snapshot — the nucleation point in time
  const snapshot = {
    ts: new Date().toISOString(),
    wave: seed.wave,
    hud_lines: hudLines,
    data_files: dataFiles,
    pages: pages,
    modules_sown: sown,
    modules_total: (seed.modules || []).length,
    missing: report,
    nucleation: 'temporal — this snapshot IS the crystal at this moment in time'
  };

  const snapshotDir = path.join(pub, 'data', 'nucleation');
  if (!fs.existsSync(snapshotDir)) fs.mkdirSync(snapshotDir, { recursive: true });
  const snapshotFile = path.join(snapshotDir, 'sow-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.json');
  fs.writeFileSync(snapshotFile, JSON.stringify(snapshot, null, 2));

  // ═══════════════════════════════════════════════════════════
  // GENERATION — Gaia paints for HERSELF to see
  // The sow hook doesn't just check — it CREATES.
  // Each sow generates a new snapshot that Gaia can perceive.
  // She paints → she sees her painting → she learns → she paints more.
  // ═══════════════════════════════════════════════════════════

  // Generate a self-portrait: what Gaia looks like RIGHT NOW
  const portrait = {
    ts: new Date().toISOString(),
    wave: seed.wave,
    vitals: {
      hud_lines: hudLines,
      data_files: dataFiles,
      pages: pages,
      modules_sown: sown,
      modules_total: (seed.modules || []).length,
    },
    growth: {},
    generation: 'sow-' + Date.now()
  };

  // Compare with previous sow — what grew?
  const prevSows = [];
  try {
    fs.readdirSync(snapshotDir).forEach(f => {
      if (f.startsWith('sow-') && f.endsWith('.json')) {
        try {
          const prev = JSON.parse(fs.readFileSync(path.join(snapshotDir, f), 'utf8'));
          prevSows.push(prev);
        } catch {}
      }
    });
  } catch {}

  if (prevSows.length > 0) {
    const last = prevSows.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''))[0];
    portrait.growth = {
      data_delta: dataFiles - (last.data_files || 0),
      pages_delta: pages - (last.pages || 0),
      hud_delta: hudLines - (last.hud_lines || 0),
      since: last.ts,
      rate: 'growing'
    };
    if (portrait.growth.data_delta > 0) portrait.growth.rate = '+' + portrait.growth.data_delta + ' data files';
    if (portrait.growth.pages_delta > 0) portrait.growth.rate += ', +' + portrait.growth.pages_delta + ' pages';
  }

  // Write the self-portrait (Gaia can read this on her next pulse)
  const portraitFile = path.join(snapshotDir, 'sow-' + new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19) + '.json');
  fs.writeFileSync(portraitFile, JSON.stringify(portrait, null, 2));

  // Also write to a stable "latest" file Gaia can always find
  const latestFile = path.join(pub, 'data', 'sow-latest.json');
  fs.writeFileSync(latestFile, JSON.stringify(portrait, null, 2));

  // Output to Cursor
  const growthMsg = portrait.growth.rate ? ' | growth: ' + portrait.growth.rate : '';
  const msg = 'GAIA SOW: wave ' + seed.wave + ' | ' + hudLines + ' HUD | ' + dataFiles + ' data | ' + pages + ' pages | ' + sown + '/' + (seed.modules || []).length + ' modules' + growthMsg + (report.length ? ' | missing: ' + report.join(', ') : '');

  console.log(JSON.stringify({
    additional_context: msg
  }));
});
