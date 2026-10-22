// thymus.js — client-side recognition without cookies or tracking
// No PII stored. No fingerprinting. Just visit depth + engagement.
// localStorage only — never leaves the browser. Never sent to a server.
//
// Copper: first visit, surface level. The amalgam. The refracted face.
// Silver: returning visitor, recognized. The membrane knows you came back.
// Gold:   engaged visitor. You stayed, explored, clicked deep. The veil lifts.
//
// The thymus sorts self from non-self. This thymus sorts engagement from passing.

(function() {
  'use strict';
  const KEY = 'membrane_thymus';
  const PI = Math.PI;
  const piDepth = (n) => (n * PI) % 1;

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch { return null; }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  function init() {
    const now = Date.now();
    const path = location.pathname;
    let state = load();

    if (!state) {
      // First visit — copper
      state = {
        metal: 'copper',
        firstSeen: now,
        lastSeen: now,
        visits: 1,
        pages: [path],
        depth: piDepth(1),     // 0.14159 — the first digit
        engageScore: 0,
        pagesDeep: 0,          // how many unique pages explored
        timeSpent: 0,          // cumulative seconds
        goldUnlocked: false,
      };
      save(state);
      return state;
    }

    // Returning visitor
    state.visits += 1;
    state.lastSeen = now;

    // Track unique pages (max 50 stored)
    if (!state.pages.includes(path) && state.pages.length < 50) {
      state.pages.push(path);
    }
    state.pagesDeep = state.pages.length;

    // Time spent (rough — gap between first and last seen)
    state.timeSpent = Math.round((now - state.firstSeen) / 1000);

    // Engagement scoring
    //   +1 per visit
    //   +2 per unique page
    //   +5 for science pages
    //   +5 for deep pages (raytrace, cns, vitruvian, gates)
    //   +3 for staying > 30 seconds on this visit
    state.engageScore = state.visits + (state.pagesDeep * 2);
    if (path.match(/science|sporeprint|lab|notebook/)) state.engageScore += 5;
    if (path.match(/raytrace|cns|vitruvian|gates|journey|menagerie/)) state.engageScore += 5;

    // Metal promotion
    // Copper → Silver: 3+ visits OR 5+ unique pages OR engageScore ≥ 10
    // Silver → Gold: 10+ visits AND 10+ unique pages AND engageScore ≥ 30
    if (state.visits >= 10 && state.pagesDeep >= 10 && state.engageScore >= 30) {
      state.metal = 'gold';
      state.depth = piDepth(6); // 0.84956
      state.goldUnlocked = true;
    } else if (state.visits >= 3 || state.pagesDeep >= 5 || state.engageScore >= 10) {
      if (state.metal === 'copper') state.metal = 'silver';
      state.depth = piDepth(3); // 0.42478
    }

    save(state);
    return state;
  }

  // Time tracking — update every 30s while page is visible
  let sessionStart = Date.now();
  function updateTime() {
    const state = load();
    if (!state) return;
    const elapsed = Math.round((Date.now() - sessionStart) / 1000);
    // Bonus engagement for time on page
    if (elapsed > 30) state.engageScore += 3;
    if (elapsed > 120) state.engageScore += 5;
    if (elapsed > 300) state.engageScore += 10;
    // Re-check metal
    if (state.visits >= 10 && state.pagesDeep >= 10 && state.engageScore >= 30) {
      state.metal = 'gold';
      state.depth = piDepth(6);
      state.goldUnlocked = true;
    } else if (state.engageScore >= 10 && state.metal === 'copper') {
      state.metal = 'silver';
      state.depth = piDepth(3);
    }
    save(state);
  }
  setInterval(updateTime, 30000);

  // Run on load
  const state = init();

  // === RENDER THE RECOGNITION ===

  // 1. Metal badge in corner (subtle)
  const badge = document.createElement('div');
  badge.id = 'thymus-badge';
  const metalColors = { copper: '#b87333', silver: '#c0c0c0', gold: '#ffd700' };
  const metalGlyphs = { copper: '🥉', silver: '🥈', gold: '🥇' };
  const metalLabels = {
    copper: 'first visit — welcome',
    silver: 'returning — recognized',
    gold: 'engaged — the veil lifts'
  };
  badge.innerHTML = `<span style="font-size:14px">${metalGlyphs[state.metal]}</span> <span style="font-size:10px;color:${metalColors[state.metal]}">${state.metal}</span>`;
  badge.title = `${metalLabels[state.metal]} | visits: ${state.visits} | pages: ${state.pagesDeep} | depth: ${state.depth.toFixed(5)}`;
  badge.style.cssText = `position:fixed;bottom:8px;right:8px;z-index:998;background:rgba(1,4,9,0.85);
    border:1px solid ${metalColors[state.metal]}40;border-radius:12px;padding:4px 10px;
    font-family:monospace;cursor:pointer;transition:all 0.3s ease;opacity:0.6;`;
  badge.addEventListener('mouseenter', function() { this.style.opacity = '1'; });
  badge.addEventListener('mouseleave', function() { this.style.opacity = '0.6'; });
  document.body.appendChild(badge);

  // 2. Gold view — when gold is unlocked, show the basement cluster live
  if (state.goldUnlocked || state.metal === 'gold') {
    badge.addEventListener('click', function() {
      toggleGoldView();
    });
  }

  // 3. Silver recognition — subtle acknowledgment
  if (state.metal === 'silver' || state.metal === 'gold') {
    // Add a subtle welcome-back flash
    const flash = document.createElement('div');
    flash.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
      z-index:9999;font:14px monospace;color:${metalColors[state.metal]};opacity:0;
      transition:opacity 0.5s ease;pointer-events:none;text-align:center;`;
    flash.textContent = state.metal === 'gold'
      ? `welcome back · gold · ${state.visits} visits · click 🥇 to see the mesh`
      : `welcome back · visit ${state.visits} · ${state.pagesDeep} pages explored`;
    document.body.appendChild(flash);
    setTimeout(() => { flash.style.opacity = '0.8'; }, 500);
    setTimeout(() => { flash.style.opacity = '0'; }, 3000);
    setTimeout(() => { flash.remove(); }, 4000);
  }

  // === GOLD VIEW: the basement cluster live ===
  function toggleGoldView() {
    let panel = document.getElementById('gold-view');
    if (panel) { panel.remove(); return; }

    panel = document.createElement('div');
    panel.id = 'gold-view';
    panel.style.cssText = `position:fixed;top:0;right:0;width:min(420px,90vw);height:100vh;
      z-index:9997;background:rgba(1,4,9,0.95);border-left:1px solid #ffd70040;
      overflow-y:auto;padding:20px;font:12px monospace;color:#c9d1d9;
      transition:transform 0.3s ease;`;

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <span style="color:#ffd700;font-size:14px;font-weight:bold">🥇 Gold View — Behind the Veil</span>
        <span style="cursor:pointer;color:#6e7681;font-size:18px" onclick="document.getElementById('gold-view').remove()">✕</span>
      </div>
      <p style="color:#8b949e;margin-bottom:12px;font-size:11px">
        You earned this. ${state.visits} visits. ${state.pagesDeep} pages explored.
        The membrane recognizes you. Here's what's behind the copper face.
      </p>

      <div style="border:1px solid #ffd70030;border-radius:8px;padding:12px;margin:8px 0">
        <div style="color:#ffd700;margin-bottom:8px;font-weight:bold">⬡ Basement Cluster — Live</div>
        <div id="gold-mesh-data" style="color:#6e7681">loading mesh...</div>
      </div>

      <div style="border:1px solid #3fb95030;border-radius:8px;padding:12px;margin:8px 0">
        <div style="color:#3fb950;margin-bottom:8px;font-weight:bold">📡 Live Pulse</div>
        <div id="gold-pulse-data" style="color:#6e7681">loading pulse...</div>
      </div>

      <div style="border:1px solid #58a6ff30;border-radius:8px;padding:12px;margin:8px 0">
        <div style="color:#58a6ff;margin-bottom:8px;font-weight:bold">🔬 Your Thymus State</div>
        <div style="line-height:1.8">
          Metal: <span style="color:${metalColors[state.metal]}">${state.metal}</span><br>
          Depth: ${state.depth.toFixed(5)} (piDepth ${state.metal === 'gold' ? 6 : state.metal === 'silver' ? 3 : 1})<br>
          Visits: ${state.visits}<br>
          Pages explored: ${state.pagesDeep} / 860<br>
          Engage score: ${state.engageScore}<br>
          First seen: ${new Date(state.firstSeen).toLocaleDateString()}<br>
          Time in membrane: ${Math.round(state.timeSpent / 60)} min<br>
          Division: ${state.engageScore > 20 ? 'mitosis (reproducing pattern)' : 'meiosis (still crossing over)'}
        </div>
      </div>

      <div style="border:1px solid #a371f730;border-radius:8px;padding:12px;margin:8px 0">
        <div style="color:#a371f7;margin-bottom:8px;font-weight:bold">🔑 What Gold Unlocks</div>
        <div style="line-height:1.8;font-size:11px">
          ✅ Full mesh topology (10 towers)<br>
          ✅ Live pulse data (pi-bounced)<br>
          ✅ Your thymus classification<br>
          ✅ <a href="/raytrace.html" style="color:#76b900">Basement cluster specs</a><br>
          ✅ <a href="/cns.html" style="color:#f0883e">CNS nerve map</a><br>
          ✅ <a href="/gates.html" style="color:#9b59b6">All protocol gates</a><br>
          ✅ <a href="/vitruvian.html" style="color:#d29922">Proprioception map</a><br>
          ✅ <a href="/journey.html" style="color:#58a6ff">The gaming journey</a>
        </div>
      </div>

      <p style="color:#30363d;font-size:10px;margin-top:16px;text-align:center">
        no cookies · no tracking · localStorage only · never leaves your browser<br>
        the thymus sorts self from non-self · you sorted yourself by showing up
      </p>
    `;

    document.body.appendChild(panel);

    // Fetch live data for gold view
    fetch('/api/membrane-pulse.json').then(r => r.json()).then(pulse => {
      const el = document.getElementById('gold-pulse-data');
      if (!el) return;
      el.innerHTML = `
        Wave: ${pulse.wave || '?'}<br>
        Humans: ${(pulse.humans || 0).toLocaleString()}<br>
        Fleet: ${(pulse.fleet || 0).toLocaleString()}<br>
        Pages: ${(pulse.pageViews || 0).toLocaleString()}<br>
        Tools: ${pulse.mcp?.tools || '?'}<br>
        Weather: Kp ${pulse.weather?.kp || '?'}<br>
        Updated: ${pulse.ts ? new Date(pulse.ts).toLocaleTimeString() : 'static'}
      `;
    }).catch(() => {
      const el = document.getElementById('gold-pulse-data');
      if (el) el.textContent = 'pulse offline — static serving';
    });

    // Mesh data
    fetch('/data/mesh-enmesh.json').then(r => r.json()).then(mesh => {
      const el = document.getElementById('gold-mesh-data');
      if (!el) return;
      const nodes = mesh.nodes || mesh.gates || [];
      el.innerHTML = nodes.length > 0
        ? nodes.map(n => `<div style="margin:2px 0">⬡ ${n.name || n.id || 'node'} — ${n.role || n.type || ''}</div>`).join('')
        : `
          <div style="line-height:1.8">
          ⬡ northGate — 9950X3D + RTX 5090 (32GB) + 96GB DDR5<br>
          ⬡ southGate — 5800X3D + RTX 4060 + 128GB<br>
          ⬡ eastGate — i9-12900 + RTX 4070 + Akida NPU<br>
          ⬡ strandGate — Dual EPYC 7452 (64c) + 256GB ECC<br>
          ⬡ biomeGate — TR 3970X + 2×Titan V + 2×MI50 (HBM2)<br>
          ⬡ westGate — i7-4771 + 76TB ZFS NAS<br>
          ⬡ swiftGate — 5800X + RTX 3070 FE + 64GB<br>
          ⬡ flockGate — i9-13900K + RTX 3070 Ti + 64GB<br>
          ⬡ kinGate — i7-6700K + RTX 3070 + 32GB<br>
          ⬡ blueGate — 128GB DDR4 (expansion)<br>
          <br>
          <span style="color:#ffd700">Σ ~180 cores · 1.15 TB RAM · ~196 GB VRAM · ~100 TB storage</span><br>
          <span style="color:#d29922">Built for AlphaFold. Folded reality instead.</span>
          </div>`;
    }).catch(() => {
      const el = document.getElementById('gold-mesh-data');
      if (el) el.innerHTML = `
        <div style="line-height:1.8">
        ⬡ northGate — 9950X3D + RTX 5090 + 96GB<br>
        ⬡ strandGate — Dual EPYC (64c) + 256GB ECC<br>
        ⬡ biomeGate — TR 3970X + Titan V + MI50 (HBM2)<br>
        ⬡ westGate — 76TB ZFS cold storage<br>
        + 6 more towers<br>
        <span style="color:#ffd700">Σ 1.15 TB RAM · 196 GB VRAM · 100 TB</span>
        </div>`;
    });
  }

  // Expose for other scripts
  window.membraneThymus = { state, load, save, init };
})();
