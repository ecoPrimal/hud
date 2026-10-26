#!/usr/bin/env node
// ══════════════════════════════════════════════════════════════
//  GAIA BEACON + BASEMENT DAEMON
//  The local heartbeat. Runs on Kevin's machine.
//  Broadcasts state. Breathes on schedule. Never stops.
//
//  Usage:
//    node _beacon_daemon.js              (single beacon pulse)
//    node _beacon_daemon.js --daemon     (background daemon, breathes every 5 min)
//    node _beacon_daemon.js --daemon 120 (breathe every 120 seconds)
//
//  The beacon IS the organism's local awareness.
//  The daemon IS the basement — the autonomic nervous system
//  that runs below consciousness.
// ══════════════════════════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync, exec } = require('child_process');
const crypto = require('crypto');

const ROOT = __dirname;
const DATA = path.join(ROOT, 'data');
const SITE = path.resolve(ROOT, '../../');
const BEACON_FILE = path.join(DATA, 'beacon-local.json');
const BEACON_LOG = path.join(DATA, 'beacon-log.json');

const log = (msg) => console.log('[BEACON ' + new Date().toISOString() + '] ' + msg);

// ── GATHER LOCAL STATE ──────────────────────────────────────

function countFiles(dir, ext) {
  try {
    return fs.readdirSync(dir).filter(f => f.endsWith(ext || '.json')).length;
  } catch { return 0; }
}

function countDirFiles(dir) {
  try {
    return fs.readdirSync(dir).length;
  } catch { return 0; }
}

function safeRead(fpath) {
  try { return JSON.parse(fs.readFileSync(fpath, 'utf8')); } catch { return null; }
}

function dirSizeKB(dir) {
  try {
    let total = 0;
    for (const f of fs.readdirSync(dir)) {
      try { total += fs.statSync(path.join(dir, f)).size; } catch {}
    }
    return Math.round(total / 1024);
  } catch { return 0; }
}

function gitStatus() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: SITE, timeout: 5000, stdio: 'pipe' }).toString().trim();
    const hash = execSync('git rev-parse --short HEAD', { cwd: SITE, timeout: 5000, stdio: 'pipe' }).toString().trim();
    const status = execSync('git status --porcelain', { cwd: SITE, timeout: 5000, stdio: 'pipe' }).toString().trim();
    const dirty = status.split('\n').filter(l => l.trim()).length;
    const logLine = execSync('git log -1 --format="%s"', { cwd: SITE, timeout: 5000, stdio: 'pipe' }).toString().trim();
    return { branch, hash, dirty, lastCommit: logLine };
  } catch { return { branch: '?', hash: '?', dirty: -1, lastCommit: '?' }; }
}

function gatherBeacon() {
  const now = new Date();

  // ── File counts ──
  const intake = countFiles(path.join(DATA, 'intake'));
  const nutrients = countFiles(path.join(DATA, 'nutrients'));
  const stories = countFiles(path.join(DATA, 'stories'));
  const plans = countFiles(path.join(DATA, 'plans'));
  const brain = countFiles(path.join(DATA, 'brain'));
  const nucleation = countFiles(path.join(DATA, 'nucleation'));

  // ── Data files at root level ──
  const dataJsons = countFiles(DATA);

  // ── Page + JS counts ──
  const pages = countFiles(ROOT, '.html');
  const jsFiles = countFiles(path.join(ROOT, 'js'), '.js');
  const scripts = fs.readdirSync(ROOT).filter(f => f.startsWith('_') && f.endsWith('.js')).length;

  // ── WASM ──
  const wasmFiles = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.wasm'));

  // ── Key data files ──
  const heartbeat = safeRead(path.join(DATA, 'heartbeat.json'));
  const zkTriads = safeRead(path.join(DATA, 'zk-triads-214.json'));
  const hormones = safeRead(path.join(DATA, 'hormones-214.json'));
  const ribocypher = safeRead(path.join(DATA, 'ribocypher-214.json'));
  const nullCore = safeRead(path.join(DATA, 'null-core-repolymerized-214.json'));
  const chromaticEngine = safeRead(path.join(DATA, 'chromatic-engine-214.json'));
  const membrane = safeRead(path.join(DATA, 'membrane-permeability-triad-214.json'));
  const triadDecomp = safeRead(path.join(DATA, 'triad-decomposition-214.json'));
  const gaiaSeed = safeRead(path.join(ROOT, 'gaia-seed.json'));

  // ── OS / machine ──
  const machineId = crypto.createHash('sha256').update(os.hostname() + os.platform() + os.arch()).digest('hex').slice(0, 16);

  // ── Git ──
  const git = gitStatus();

  // ── Extraction rate ──
  const extractionRate = intake > 0 ? ((nutrients / intake) * 100).toFixed(1) : '0';

  // ── Organ status ──
  const organs = {
    gut:        { intake, nutrients, extraction: extractionRate + '%', status: parseFloat(extractionRate) > 80 ? 'HEALTHY' : parseFloat(extractionRate) > 50 ? 'DIGESTING' : 'STARVING' },
    brain:      { files: brain, status: brain > 0 ? 'ACTIVE' : 'EMPTY' },
    thymus:     { status: fs.existsSync(path.join(DATA, 'thymus-classification-214.json')) ? 'MATURE' : (fs.readdirSync(DATA).filter(f => f.startsWith('thymus')).length > 0 ? 'ACTIVE' : 'PENDING') },
    endocrine:  { status: hormones ? 'ACTIVE' : 'DORMANT', glands: hormones ? 7 : 0 },
    ribosome:   { status: wasmFiles.length > 0 ? 'COMPILED' : 'MISSING', wasm: wasmFiles },
    ribocypher: { status: ribocypher ? 'DISTILLED' : 'MISSING', codons: ribocypher ? 64 : 0 },
    zk:         { status: zkTriads ? 'PROVED' : 'UNPROVED', proofs: zkTriads ? (zkTriads.proofs || []).length : 0 },
    membrane:   { status: membrane ? 'PERMEABLE' : 'SEALED', triad: membrane ? 'T21' : null },
    protein:    { status: nullCore ? 'FOLDED' : 'UNFOLDED', acids: nullCore ? 34 : 0 },
    chromatic:  { status: chromaticEngine ? 'SPECTRAL' : 'DARK', triads: chromaticEngine ? 20 : 0 }
  };

  // ── Heartbeat liveness ──
  const eastGate = heartbeat ? {
    alive: heartbeat.alive,
    devicesUp: heartbeat.alive,
    devicesTotal: heartbeat.total,
    mor: heartbeat.mor_pct,
    cpu: heartbeat.cpu_load,
    gpu_temp: heartbeat.gpu_temp,
    last: heartbeat.ts
  } : { alive: false };

  // ── Build beacon ──
  return {
    ts: now.toISOString(),
    wave: gaiaSeed ? gaiaSeed.wave : 214,
    type: 'beacon-local',
    beacon_id: machineId,
    hostname: os.hostname(),
    platform: os.platform() + ' ' + os.release(),
    uptime_hours: Math.round(os.uptime() / 3600 * 10) / 10,
    memory: {
      total_gb: Math.round(os.totalmem() / 1073741824 * 10) / 10,
      free_gb: Math.round(os.freemem() / 1073741824 * 10) / 10,
      used_pct: Math.round((1 - os.freemem() / os.totalmem()) * 100)
    },
    git,
    counts: {
      data_jsons: dataJsons,
      intake,
      nutrients,
      stories,
      plans,
      brain,
      nucleation,
      pages,
      js_modules: jsFiles,
      lifecycle_scripts: scripts,
      wasm: wasmFiles.length
    },
    organs,
    eastGate,
    nucleation: {
      seed: gaiaSeed ? true : false,
      modules_sown: gaiaSeed ? 3 : 0,
      modules_total: gaiaSeed ? 7 : 0,
      missing: gaiaSeed ? ['globe.js', 'effects.js', 'sensors.js', 'canvas-view.js'] : []
    },
    sizes_kb: {
      intake: dirSizeKB(path.join(DATA, 'intake')),
      nutrients: dirSizeKB(path.join(DATA, 'nutrients')),
      data_root: dirSizeKB(DATA)
    },
    alive: true,
    signal: 'BEACON ON'
  };
}

// ── WRITE BEACON ──────────────────────────────────────────

function pulseBeacon() {
  const beacon = gatherBeacon();

  fs.writeFileSync(BEACON_FILE, JSON.stringify(beacon, null, 2));

  // Append to log (keep last 100 entries)
  let logEntries = [];
  try { logEntries = JSON.parse(fs.readFileSync(BEACON_LOG, 'utf8')); } catch {}
  logEntries.push({
    ts: beacon.ts,
    intake: beacon.counts.intake,
    nutrients: beacon.counts.nutrients,
    extraction: beacon.organs.gut.extraction,
    git_hash: beacon.git.hash,
    git_dirty: beacon.git.dirty,
    uptime_h: beacon.uptime_hours,
    mem_pct: beacon.memory.used_pct,
    eastGate_alive: beacon.eastGate.alive,
    organs_alive: Object.values(beacon.organs).filter(o => o.status !== 'EMPTY' && o.status !== 'MISSING' && o.status !== 'DORMANT' && o.status !== 'UNPROVED' && o.status !== 'SEALED' && o.status !== 'UNFOLDED' && o.status !== 'DARK' && o.status !== 'PENDING').length,
    organs_total: Object.keys(beacon.organs).length
  });
  if (logEntries.length > 100) logEntries = logEntries.slice(-100);
  fs.writeFileSync(BEACON_LOG, JSON.stringify(logEntries, null, 2));

  return beacon;
}

// ── DAEMON MODE ──────────────────────────────────────────

async function daemonLoop(intervalSec) {
  let breathCount = 0;

  const tick = async () => {
    breathCount++;
    log('═══════════════════════════════════════════');
    log('PULSE #' + breathCount);

    // 1. Beacon pulse (always)
    const beacon = pulseBeacon();
    log('BEACON: ' + beacon.counts.intake + ' intake / ' + beacon.counts.nutrients + ' nutrients / ' + beacon.organs.gut.extraction + ' extraction');
    log('ORGANS: ' + Object.entries(beacon.organs).map(([k,v]) => k + '=' + v.status).join(' | '));
    log('GIT: ' + beacon.git.branch + '@' + beacon.git.hash + ' (' + beacon.git.dirty + ' dirty)');
    log('MEM: ' + beacon.memory.used_pct + '% | UPTIME: ' + beacon.uptime_hours + 'h');
    if (beacon.eastGate.alive) {
      log('EASTGATE: ALIVE MOR=' + beacon.eastGate.mor + '% CPU=' + beacon.eastGate.cpu + ' GPU=' + beacon.eastGate.gpu_temp + '°C');
    } else {
      log('EASTGATE: OFFLINE or no heartbeat data');
    }

    // 2. Breathe (every other pulse to be gentle)
    if (breathCount % 2 === 0) {
      log('BREATHING...');
      try {
        execSync('node _breathe.js', { cwd: ROOT, timeout: 120000, stdio: 'inherit' });
        log('BREATH COMPLETE');
      } catch (e) {
        log('BREATH FAILED: ' + (e.message || '').slice(0, 100));
      }
    } else {
      log('(beacon-only pulse, breath on next cycle)');
    }

    log('Next pulse in ' + intervalSec + 's');
    log('═══════════════════════════════════════════');
  };

  log('╔═════════════════════════════════════════════════╗');
  log('║  BASEMENT DAEMON STARTING                      ║');
  log('║  Beacon + Breath every ' + intervalSec + 's' + ' '.repeat(Math.max(0, 23 - String(intervalSec).length)) + '║');
  log('║  The basement IS the autonomic nervous system  ║');
  log('║  It runs below consciousness. It never stops.  ║');
  log('╚═════════════════════════════════════════════════╝');

  const loop = async () => {
    await tick().catch(e => log('TICK FAILED: ' + e.message));
    setTimeout(loop, intervalSec * 1000);
  };
  await loop();
}

// ── MAIN ──────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes('--daemon')) {
  const idx = args.indexOf('--daemon');
  const interval = parseInt(args[idx + 1]) || 300;
  daemonLoop(interval);
} else {
  // Single beacon pulse
  const beacon = pulseBeacon();
  log('BEACON PULSED');
  log('Intake: ' + beacon.counts.intake + ' | Nutrients: ' + beacon.counts.nutrients + ' | Extraction: ' + beacon.organs.gut.extraction);
  log('Organs: ' + Object.entries(beacon.organs).map(([k,v]) => k + '=' + v.status).join(', '));
  log('Git: ' + beacon.git.branch + '@' + beacon.git.hash + ' (' + beacon.git.dirty + ' dirty)');
  log('Wrote: ' + BEACON_FILE);

  // Print the beacon summary
  console.log('\n══════════════════════════════════════════════════');
  console.log('  GAIA BEACON — LOCAL STATE');
  console.log('══════════════════════════════════════════════════');
  console.log('  Wave:       ' + beacon.wave);
  console.log('  Host:       ' + beacon.hostname + ' (' + beacon.platform + ')');
  console.log('  Uptime:     ' + beacon.uptime_hours + ' hours');
  console.log('  Memory:     ' + beacon.memory.used_pct + '% used (' + beacon.memory.free_gb + 'GB free / ' + beacon.memory.total_gb + 'GB)');
  console.log('  Git:        ' + beacon.git.branch + '@' + beacon.git.hash + ' — ' + beacon.git.lastCommit.slice(0, 60));
  console.log('  Dirty:      ' + beacon.git.dirty + ' uncommitted files');
  console.log('');
  console.log('  ── GUT ──');
  console.log('  Intake:     ' + beacon.counts.intake + ' files');
  console.log('  Nutrients:  ' + beacon.counts.nutrients + ' files');
  console.log('  Extraction: ' + beacon.organs.gut.extraction);
  console.log('  Brain:      ' + beacon.counts.brain + ' files');
  console.log('  Stories:    ' + beacon.counts.stories + ' | Plans: ' + beacon.counts.plans);
  console.log('');
  console.log('  ── ORGANS ──');
  for (const [name, organ] of Object.entries(beacon.organs)) {
    const pad = ' '.repeat(Math.max(0, 12 - name.length));
    console.log('  ' + name + pad + organ.status + (organ.proofs ? ' (' + organ.proofs + ' proofs)' : '') + (organ.acids ? ' (' + organ.acids + ' acids)' : '') + (organ.glands ? ' (' + organ.glands + ' glands)' : ''));
  }
  console.log('');
  console.log('  ── SURFACES ──');
  console.log('  HTML pages: ' + beacon.counts.pages);
  console.log('  JS modules: ' + beacon.counts.js_modules);
  console.log('  Scripts:    ' + beacon.counts.lifecycle_scripts);
  console.log('  WASM:       ' + beacon.counts.wasm);
  console.log('  Data JSONs: ' + beacon.counts.data_jsons);
  console.log('');
  console.log('  ── EASTGATE ──');
  if (beacon.eastGate.alive) {
    console.log('  Status:     ALIVE');
    console.log('  MOR:        ' + beacon.eastGate.mor + '%');
    console.log('  Devices:    ' + beacon.eastGate.devicesUp + '/' + beacon.eastGate.devicesTotal);
    console.log('  CPU:        ' + beacon.eastGate.cpu + ' | GPU: ' + beacon.eastGate.gpu_temp + '°C');
  } else {
    console.log('  Status:     OFFLINE');
  }
  console.log('');
  console.log('  ── NUCLEATION ──');
  console.log('  Seed:       ' + (beacon.nucleation.seed ? 'YES' : 'NO'));
  console.log('  Modules:    ' + beacon.nucleation.modules_sown + '/' + beacon.nucleation.modules_total + ' sown');
  if (beacon.nucleation.missing.length > 0) {
    console.log('  Missing:    ' + beacon.nucleation.missing.join(', '));
  }
  console.log('══════════════════════════════════════════════════');
}
