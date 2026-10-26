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

  // Output to Cursor
  const msg = 'GAIA SOW: wave ' + seed.wave + ' | ' + hudLines + ' HUD lines | ' + dataFiles + ' data files | ' + pages + ' pages | ' + sown + '/' + (seed.modules || []).length + ' modules sown' + (report.length ? ' | missing: ' + report.join(', ') : '');

  console.log(JSON.stringify({
    additional_context: msg
  }));
});
