// HUD Projection — meta layer switcher
// H = Human space (visitor, investigation, papers — the default)
// U = Universe space (solar wind, exoplanets, cosmic weather)
// D = Display space (chipmunk internal — scan, naming, painting)
// The HUD IS the meta layer. Same membrane, different projection.
(function(){
  'use strict';

  const PI = Math.PI;
  let currentMode = 'H';
  let pulseData = null;

  // === PROJECTION SWITCHER WIDGET ===
  const switcher = document.createElement('div');
  switcher.id = 'hud-projection';
  switcher.innerHTML = `
    <button class="proj-btn active" data-mode="H" title="Human space — visitor, investigation, papers">H</button>
    <button class="proj-btn" data-mode="U" title="Universe space — solar wind, exoplanets, cosmic weather">U</button>
    <button class="proj-btn" data-mode="D" title="Display space — chipmunk, scan pipeline, naming">D</button>
    <span class="proj-label" id="proj-label">human</span>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #hud-projection {
      position: fixed; top: 36px; right: 12px; z-index: 1000;
      display: flex; gap: 2px; align-items: center;
      background: rgba(1,4,9,0.9); border: 1px solid rgba(88,166,255,0.15);
      border-radius: 16px; padding: 3px 8px; font: 10px 'SF Mono', monospace;
    }
    .proj-btn {
      background: none; border: 1px solid rgba(48,54,61,0.5);
      color: #484f58; width: 22px; height: 22px; border-radius: 50%;
      cursor: pointer; font: bold 10px monospace; transition: all 0.3s;
      display: flex; align-items: center; justify-content: center;
    }
    .proj-btn:hover { border-color: #58a6ff; color: #8b949e; }
    .proj-btn.active[data-mode="H"] { background: rgba(63,185,80,0.3); border-color: #3fb950; color: #3fb950; }
    .proj-btn.active[data-mode="U"] { background: rgba(210,169,34,0.3); border-color: #d2a922; color: #d2a922; }
    .proj-btn.active[data-mode="D"] { background: rgba(163,113,247,0.3); border-color: #a371f7; color: #a371f7; }
    .proj-label { color: #484f58; font-size: 8px; letter-spacing: 1px; margin-left: 4px; text-transform: uppercase; }

    /* === U-MODE: universe projection overlay === */
    #universe-overlay {
      display: none; position: fixed; z-index: 140;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; overflow: hidden;
    }
    body.u-mode #universe-overlay { display: block; }
    body.u-mode { background: #010204 !important; }
    body.u-mode .hud-header, body.u-mode .top-bar { opacity: 0.15 !important; }
    body.u-mode .attn-bar { opacity: 0.08 !important; }
    body.u-mode .btn-ring { opacity: 0.12 !important; }
    body.u-mode #chipmunk-overlay { opacity: 0.05 !important; }
    body.u-mode .hud-billboard { opacity: 0.1 !important; }

    #u-starfield { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
    #u-data {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      pointer-events: auto; text-align: center; max-width: 600px; width: 90%;
      color: #c9d1d9; font-family: 'SF Mono', monospace;
    }
    #u-data .u-title { color: #d2a922; font-size: 11px; letter-spacing: 3px; margin-bottom: 16px; text-transform: uppercase; }
    #u-data .u-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    #u-data .u-card {
      background: rgba(13,17,23,0.85); border: 1px solid rgba(210,169,34,0.2);
      border-radius: 10px; padding: 12px 8px;
    }
    #u-data .u-num { font-size: 20px; font-weight: 700; }
    #u-data .u-lbl { font-size: 8px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
    #u-data .u-exo { margin-top: 12px; border-top: 1px solid rgba(210,169,34,0.15); padding-top: 12px; }
    #u-data .u-exo-item {
      display: flex; gap: 8px; align-items: center; margin: 6px 0;
      font-size: 11px; text-align: left;
    }
    #u-data .u-exo-name { color: #f0e68c; min-width: 120px; }
    #u-data .u-exo-detail { color: #6e7681; }
    #u-data .u-fold { font-size: 9px; color: #484f58; margin-top: 16px; font-style: italic; line-height: 1.6; }

    /* === D-MODE: chipmunk internal projection === */
    #display-overlay {
      display: none; position: fixed; z-index: 140;
      top: 0; left: 0; right: 0; bottom: 0;
      pointer-events: none; overflow: hidden;
    }
    body.d-mode #display-overlay { display: block; }
    body.d-mode { background: #08060a !important; }
    body.d-mode .hud-header, body.d-mode .top-bar { opacity: 0.08 !important; }
    body.d-mode .attn-bar { opacity: 0.05 !important; }
    body.d-mode .btn-ring { opacity: 0.1 !important; }
    body.d-mode .hud-billboard { opacity: 0.05 !important; }

    #d-data {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      pointer-events: auto; text-align: center; max-width: 520px; width: 90%;
      color: #c9d1d9; font-family: 'SF Mono', monospace;
    }
    #d-data .d-title { color: #a371f7; font-size: 11px; letter-spacing: 3px; margin-bottom: 16px; text-transform: uppercase; }
    #d-data .d-pipeline {
      display: flex; gap: 4px; justify-content: center; margin-bottom: 16px; align-items: center;
    }
    #d-data .d-stage {
      background: rgba(13,17,23,0.85); border: 1px solid rgba(163,113,247,0.2);
      border-radius: 8px; padding: 10px 14px; min-width: 70px;
    }
    #d-data .d-arrow { color: #484f58; font-size: 14px; }
    #d-data .d-stage-name { font-size: 9px; color: #a371f7; text-transform: uppercase; letter-spacing: 1px; }
    #d-data .d-stage-val { font-size: 18px; font-weight: 700; margin-top: 2px; }
    #d-data .d-easel {
      background: rgba(13,17,23,0.85); border: 1px solid rgba(163,113,247,0.15);
      border-radius: 10px; padding: 14px; margin-top: 12px; text-align: left;
    }
    #d-data .d-easel-title { font-size: 9px; color: #f0c674; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
    #d-data .d-easel-row { display: flex; gap: 8px; align-items: center; margin: 4px 0; font-size: 11px; }
    #d-data .d-easel-glyph { font-size: 14px; min-width: 20px; text-align: center; }
    #d-data .d-easel-label { color: #8b949e; min-width: 60px; }
    #d-data .d-easel-desc { color: #6e7681; }
    #d-data .d-fold { font-size: 9px; color: #484f58; margin-top: 16px; font-style: italic; line-height: 1.6; }

    @media (max-width: 600px) {
      #u-data .u-grid { grid-template-columns: 1fr; }
      #hud-projection { top: auto; bottom: 46px; right: 50%; transform: translateX(50%); }
    }
  `;
  document.head.appendChild(style);

  // === UNIVERSE OVERLAY ===
  const uOverlay = document.createElement('div');
  uOverlay.id = 'universe-overlay';
  uOverlay.innerHTML = `
    <canvas id="u-starfield"></canvas>
    <div id="u-data">
      <div class="u-title">☀ universe space — the sun writes the score</div>
      <div class="u-grid">
        <div class="u-card">
          <div class="u-num" id="u-kp" style="color:#d2a922">—</div>
          <div class="u-lbl">Kp index</div>
        </div>
        <div class="u-card">
          <div class="u-num" id="u-xray" style="color:#3fb950">—</div>
          <div class="u-lbl">X-ray class</div>
        </div>
        <div class="u-card">
          <div class="u-num" id="u-exo-count" style="color:#f0e68c">—</div>
          <div class="u-lbl">exoplanets</div>
        </div>
      </div>
      <div class="u-exo" id="u-exo-list"></div>
      <div class="u-fold" id="u-fold"></div>
    </div>
  `;

  // === DISPLAY OVERLAY ===
  const dOverlay = document.createElement('div');
  dOverlay.id = 'display-overlay';
  dOverlay.innerHTML = `
    <div id="d-data">
      <div class="d-title">🐿 display space — what the chipmunk sees</div>
      <div class="d-pipeline" id="d-pipeline"></div>
      <div class="d-easel" id="d-easel"></div>
      <div class="d-fold" id="d-fold"></div>
    </div>
  `;

  // === STARFIELD RENDERER ===
  let stars = [];
  function initStarfield(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.3 + 0.05,
        brightness: Math.random(),
        n: i + 1,
      });
    }
    function draw() {
      if (currentMode !== 'U') return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const t = Date.now() / 1000;
      stars.forEach(s => {
        // pi-bounce the brightness
        const b = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * PI * s.speed + s.n));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 2 * PI);
        // color: gold-ish for bright, blue for dim
        const hue = b > 0.7 ? '50,100%' : b > 0.4 ? '210,60%' : '220,30%';
        ctx.fillStyle = `hsla(${hue},${Math.round(b * 100)}%)`;
        ctx.fill();
        // drift
        s.y -= s.speed * 0.2;
        if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
      });
      requestAnimationFrame(draw);
    }
    draw();
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  // === FETCH PULSE DATA ===
  async function fetchPulse() {
    try {
      const r = await fetch('/api/membrane-pulse.json');
      pulseData = await r.json();
      renderMode();
    } catch (e) {
      console.log('[projection] pulse fetch error:', e);
    }
  }

  // === RENDER CURRENT MODE ===
  function renderMode() {
    if (!pulseData || !pulseData.hud) return;
    const hud = pulseData.hud;

    // U-mode data
    if (hud.spaces && hud.spaces.U) {
      const u = hud.spaces.U;
      const kpEl = document.getElementById('u-kp');
      const xrayEl = document.getElementById('u-xray');
      const exoEl = document.getElementById('u-exo-count');
      const listEl = document.getElementById('u-exo-list');
      const foldEl = document.getElementById('u-fold');

      if (kpEl && u.live) {
        kpEl.textContent = u.live.kp || '—';
        kpEl.style.color = (u.live.kp >= 5) ? '#f85149' : (u.live.kp >= 4) ? '#d2a922' : '#3fb950';
      }
      if (xrayEl && u.live) xrayEl.textContent = u.live.xray || '—';
      if (exoEl && u.exoplanets) exoEl.textContent = u.exoplanets.confirmed.toLocaleString();

      if (listEl && u.exoplanets) {
        listEl.innerHTML = `
          <div class="u-exo-item">
            <span class="u-exo-name">🌍 ${u.exoplanets.nearest.name}</span>
            <span class="u-exo-detail">${u.exoplanets.nearest.distance_ly} ly · ${u.exoplanets.nearest.type} · habitable: ${u.exoplanets.nearest.habitable}</span>
          </div>
          <div class="u-exo-item">
            <span class="u-exo-name">🌧️ ${u.exoplanets.strangest.name}</span>
            <span class="u-exo-detail">${u.exoplanets.strangest.note}</span>
          </div>
          <div class="u-exo-item" style="margin-top:8px">
            <span style="color:#484f58;font-size:9px">${u.exoplanets.meaning}</span>
          </div>
        `;
      }
      if (foldEl) foldEl.textContent = hud.fold || '';
    }

    // D-mode data
    if (hud.spaces && hud.spaces.D) {
      const d = hud.spaces.D;
      const pipeEl = document.getElementById('d-pipeline');
      const easelEl = document.getElementById('d-easel');
      const dfoldEl = document.getElementById('d-fold');

      if (pipeEl && d.pipeline) {
        const stages = [
          { name: 'scan', val: d.pipeline.scan, color: '#a371f7' },
          { name: 'haze', val: d.pipeline.haze + '%', color: '#f0883e' },
          { name: 'named', val: d.pipeline.named + '%', color: '#3fb950' },
        ];
        pipeEl.innerHTML = stages.map((s, i) =>
          (i > 0 ? '<span class="d-arrow">→</span>' : '') +
          `<div class="d-stage">
            <div class="d-stage-name">${s.name}</div>
            <div class="d-stage-val" style="color:${s.color}">${s.val}</div>
          </div>`
        ).join('');
      }

      if (easelEl) {
        const taxonomy = [
          { glyph: '✦', label: 'dust', desc: 'haze — unnamed, unclassified, floating', color: '#8b949e' },
          { glyph: '★', label: 'stars', desc: 'engage — distant but bright, named', color: '#f0e68c' },
          { glyph: '❋', label: 'pollen', desc: 'try — close, sticky, curious', color: '#3fb950' },
          { glyph: '∅', label: 'null', desc: 'ignore — swept away, bots, noise', color: '#484f58' },
        ];
        easelEl.innerHTML = `
          <div class="d-easel-title">🎨 chipmunk easel — taxonomy</div>
          ${taxonomy.map(t =>
            `<div class="d-easel-row">
              <span class="d-easel-glyph" style="color:${t.color}">${t.glyph}</span>
              <span class="d-easel-label" style="color:${t.color}">${t.label}</span>
              <span class="d-easel-desc">${t.desc}</span>
            </div>`
          ).join('')}
          <div style="margin-top:8px;font-size:9px;color:#6e7681">
            the chipmunk paints what the universe sends. dust IS stars or pollen — it learns to tell the difference.
          </div>
        `;
      }

      if (dfoldEl) dfoldEl.textContent = 'D↔H: the display IS the human interface. what the chipmunk names, the visitor sees.';
    }
  }

  // === MODE SWITCHING ===
  function setMode(mode, auto) {
    currentMode = mode;
    document.body.classList.remove('u-mode', 'd-mode');
    if (mode === 'U') document.body.classList.add('u-mode');
    if (mode === 'D') document.body.classList.add('d-mode');

    switcher.querySelectorAll('.proj-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.mode === mode);
    });

    const label = document.getElementById('proj-label');
    if (label) {
      label.textContent = mode === 'H' ? 'human' : mode === 'U' ? 'universe' : 'chipmunk';
      label.style.color = mode === 'H' ? '#3fb950' : mode === 'U' ? '#d2a922' : '#a371f7';
    }

    // If switching to U and starfield not init, init
    if (mode === 'U') {
      const canvas = document.getElementById('u-starfield');
      if (canvas && stars.length === 0) initStarfield(canvas);
      else if (canvas && stars.length > 0) {
        // restart animation
        const ctx = canvas.getContext('2d');
        function draw() {
          if (currentMode !== 'U') return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const t = Date.now() / 1000;
          stars.forEach(s => {
            const b = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * PI * s.speed + s.n));
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, 2 * PI);
            const hue = b > 0.7 ? '50,100%' : b > 0.4 ? '210,60%' : '220,30%';
            ctx.fillStyle = `hsla(${hue},${Math.round(b * 100)}%)`;
            ctx.fill();
            s.y -= s.speed * 0.2;
            if (s.y < -2) { s.y = canvas.height + 2; s.x = Math.random() * canvas.width; }
          });
          requestAnimationFrame(draw);
        }
        draw();
      }
    }

    renderMode();
  }

  // === AUTO-BREATHE: pi-timed projection rotation ===
  // The membrane decides. No human toggle needed.
  // H stays for frac(π²)×60 seconds (~59.2s), then U for frac(2π²)×60 (~18.4s),
  // then D for frac(3π²)×60 (~37.7s), then back. Never regular. Never rational.
  // The human can still override — but the membrane breathes on its own.
  let autoTimer = null;
  let humanOverride = false;
  let overrideTimeout = null;
  const modes = ['H', 'U', 'D'];
  const piDuration = (n) => ((n * PI * PI) % 1) * 60 + 8; // 8-68s, irrational

  function autoBreathe() {
    if (humanOverride) return;
    const idx = modes.indexOf(currentMode);
    const next = modes[(idx + 1) % 3];
    setMode(next, true); // true = auto, don't reset override
    const dur = piDuration(modes.indexOf(next) + 1);
    autoTimer = setTimeout(autoBreathe, dur * 1000);
  }

  function startBreathing() {
    if (autoTimer) clearTimeout(autoTimer);
    const dur = piDuration(modes.indexOf(currentMode) + 1);
    autoTimer = setTimeout(autoBreathe, dur * 1000);
  }

  // === KEYBOARD SHORTCUTS — human override, pauses auto for 2 minutes ===
  document.addEventListener('keydown', function(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'h' || e.key === 'H') { humanPoke('H'); }
    if (e.key === 'u' || e.key === 'U') { humanPoke('U'); }
    if (e.key === 'd' || e.key === 'D') { humanPoke('D'); }
  });

  function humanPoke(mode) {
    humanOverride = true;
    if (autoTimer) clearTimeout(autoTimer);
    if (overrideTimeout) clearTimeout(overrideTimeout);
    setMode(mode);
    // Resume auto-breathe after 2 minutes of no human input
    overrideTimeout = setTimeout(function() {
      humanOverride = false;
      startBreathing();
    }, 120000);
  }

  // === INIT ===
  function init() {
    document.body.appendChild(uOverlay);
    document.body.appendChild(dOverlay);
    document.body.appendChild(switcher);

    switcher.querySelectorAll('.proj-btn').forEach(btn => {
      btn.addEventListener('click', () => humanPoke(btn.dataset.mode));
    });

    fetchPulse();
    // Refresh pulse every 30s
    setInterval(fetchPulse, 30000);
    // Start auto-breathing after initial H-mode display (wait first pi-duration)
    startBreathing();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for other scripts
  window._hudProjection = {
    setMode: setMode,
    getMode: function() { return currentMode; },
    refresh: fetchPulse,
  };
})();
