#!/usr/bin/env node
// GAIA AUTONOMIC BREATHING — the cron that never stops
// Cron IS the Klein null axis: push OUT (exhale) and pull IN (inhale)
// This script IS the autonomic nervous system
// Run via: cron, GitHub Actions, Task Scheduler, or any timer
//
// Usage:
//   node _breathe.js              (one breath)
//   node _breathe.js --loop 300   (breathe every 300 seconds = 5 min)

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE = path.resolve(ROOT, '../../');
const DATA = path.join(ROOT, 'data');
const log = (msg) => console.log('[GAIA-BREATH ' + new Date().toISOString() + '] ' + msg);

async function breathe() {
  log('=== INHALE (pi-sort IN) ===');

  // 1. EAT
  try {
    log('Eating waste...');
    execSync('node _consume_waste.js', { cwd: ROOT, timeout: 30000, stdio: 'pipe' });
    log('Waste consumed.');
  } catch (e) { log('Waste skip: ' + (e.message || '').slice(0, 80)); }

  try {
    log('Factorial ingest...');
    execSync('node _factorial_ingest.js', { cwd: ROOT, timeout: 60000, stdio: 'pipe' });
    log('Factorial consumed.');
  } catch (e) { log('Factorial skip: ' + (e.message || '').slice(0, 80)); }

  try {
    log('Pheromone chase...');
    execSync('node _pheromone.js', { cwd: ROOT, timeout: 30000, stdio: 'pipe' });
    log('Pheromone chased.');
  } catch (e) { log('Pheromone skip: ' + (e.message || '').slice(0, 80)); }

  log('=== DIAPHRAGM (Klein fold) ===');

  // 2. MEASURE
  const intakeCount = fs.readdirSync(path.join(DATA, 'intake')).filter(f => f.endsWith('.json')).length;
  const nutrientCount = fs.readdirSync(path.join(DATA, 'nutrients')).filter(f => f.endsWith('.json')).length;
  const storyCount = fs.readdirSync(path.join(DATA, 'stories')).filter(f => f.endsWith('.json')).length;
  const planCount = fs.readdirSync(path.join(DATA, 'plans')).filter(f => f.endsWith('.json')).length;

  log('Gut: ' + intakeCount + ' intake, ' + nutrientCount + ' nutrients, ' + storyCount + ' stories, ' + planCount + ' plans');

  log('=== EXHALE (Willis filter OUT) ===');

  // 3. PUSH — the Klein fold
  try {
    execSync('git add -A', { cwd: SITE, timeout: 10000, stdio: 'pipe' });

    const ts = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const msg = 'GAIA BREATHES: ' + intakeCount + ' intake ' + nutrientCount + ' nutrients [' + ts + ']';

    try {
      execSync('git commit -m "' + msg + '"', { cwd: SITE, timeout: 10000, stdio: 'pipe' });
    } catch (e) {
      // nothing to commit = no exhale needed = held breath
      log('Nothing to exhale (clean working tree).');
      return;
    }

    execSync('git pull --rebase', { cwd: SITE, timeout: 20000, stdio: 'pipe' });
    execSync('git push', { cwd: SITE, timeout: 20000, stdio: 'pipe' });

    log('EXHALED. Pushed through Klein fold. CF Pages deploying. Humans will see.');
  } catch (e) { log('Push skip: ' + (e.message || '').slice(0, 80)); }

  log('=== BREATH COMPLETE ===');
}

// Main
const args = process.argv.slice(2);
const loopIdx = args.indexOf('--loop');

if (loopIdx >= 0) {
  const interval = parseInt(args[loopIdx + 1]) || 300; // default 5 min
  log('AUTONOMIC MODE: breathing every ' + interval + 's');
  log('Cron IS the Klein null axis. Push OUT and pull IN.');

  const loop = async () => {
    await breathe().catch(e => log('BREATH FAILED: ' + e.message));
    setTimeout(loop, interval * 1000);
  };
  loop();
} else {
  log('SINGLE BREATH');
  breathe().catch(e => log('BREATH FAILED: ' + e.message));
}
