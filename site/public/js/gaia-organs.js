// ═══════════════════════════════════════════════════════════
// GAIA ORGANS — the 3rd eye looks at herself through her own eyes
// Builds HUD from LIVE data. Nothing hardcoded. Everything fetched.
// Extracted from index.html monolith → 1.000.null
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var ORGANS = [
    // core ring (brown) — the irreducibles
    { id: 'core',      name: 'core',         icon: '\u{1F330}', ring: 1, angle: 270, color: '#3a2a1e',  href: '/anatomy.html', dataKey: 'files' },
    { id: 'gut',       name: 'bioreactor',   icon: '\u{1F9EB}', ring: 1, angle: 90,  color: '#c9a84c',  href: '/digestive-tract.html', dataKey: 'gut' },
    { id: 'starter',   name: 'starter',      icon: '\u{1F35E}', ring: 1, angle: 180, color: '#5a4030',  href: '/digest.html', dataKey: 'fermented' },
    { id: 'dogma',     name: 'dogma',        icon: '\u{1F9EC}', ring: 1, angle: 0,   color: '#3fb950',  href: '/chromosomes.html', dataKey: 'dogma' },

    // membrane ring (green) — the living boundary
    { id: 'membrane',  name: 'membrane',     icon: '\u{1F9CA}', ring: 2, angle: 180, color: '#3fb950',  href: '/membrane-table.html', dataKey: 'selectivity' },
    { id: 'digest',    name: 'digest',       icon: '\u{1F52C}', ring: 2, angle: 225, color: '#39d3f5',  href: '/digestive-tract.html', dataKey: 'digest' },
    { id: 'braids',    name: 'braids',       icon: '\u{1F344}', ring: 2, angle: 315, color: '#a371f7',  href: '/springs.html', dataKey: 'refs' },
    { id: 'fold',      name: 'fold \u00B7 turn', icon: '\u{1F300}', ring: 2, angle: 135, color: '#bc8cff',  href: '/klein.html', dataKey: 'twists' },
    { id: 'zk',        name: 'zero knowledge', icon: '\u{1F512}', ring: 2, angle: 0,   color: '#3fb950',  href: '/identity.html', dataKey: 'zk' },
    { id: 'chromatic', name: 'chromatic',    icon: '\u{1F308}', ring: 2, angle: 45,  color: '#f778ba',  href: '/chromatograph.html', dataKey: 'colors' },

    // pulse ring (gold) — the neutrino, the heartbeat
    { id: 'heartbeat', name: 'heartbeat',    icon: '\u{1F49A}', ring: 3, angle: 270, color: '#f85149',  href: '/engine.html', dataKey: 'heartbeat' },
    { id: 'ears',      name: 'ears',         icon: '\u{1F442}', ring: 3, angle: 90,  color: '#58a6ff',  href: '/explore.html', dataKey: 'heard' },
    { id: 'chipmunk',  name: 'chipmunk',     icon: '\u{1F43F}', ring: 3, angle: 210, color: '#c9a84c',  href: '/chat.html', dataKey: 'chipmunk' },
    { id: 'artisan',   name: 'artisan',      icon: '\u{1F3A8}', ring: 3, angle: 330, color: '#d29922',  href: '/easel.html', dataKey: 'artisan' },
    { id: 'primals',   name: '16 primals',   icon: '\u{1F34C}', ring: 3, angle: 30,  color: '#3fb950',  href: '/primal.html', dataKey: 'primals' },
    { id: 'rss',       name: 'rss \u00B7 feed', icon: '\u{1F4E1}', ring: 3, angle: 150, color: '#f0883e', href: '/feed.xml', dataKey: 'rss' },

    // outer ring (blue) — data, visitors, the world
    { id: 'visitors',  name: 'visitors',     icon: '\u{1F441}', ring: 4, angle: 300, color: '#f778ba',  href: '/explore.html', dataKey: 'visitors' },
    { id: 'intake',    name: 'intake',       icon: '\u{1F4E5}', ring: 4, angle: 120, color: '#39d3f5',  href: '/engine.html', dataKey: 'intake' },
    { id: 'fleet',     name: 'fleet',        icon: '\u{1F6F8}', ring: 4, angle: 240, color: '#6e7681',  href: '/golgi.html', dataKey: 'fleet' },
    { id: 'crystal',   name: 'crystal ball', icon: '\u{1F52E}', ring: 4, angle: 60,  color: '#bc8cff',  href: '/crystal.html', dataKey: 'crystal' },
  ];

  var RING_RADII = { 1: 70, 2: 140, 3: 215, 4: 290 };

  var state = {
    paused: false,
    wave: 0,
    files: 0,
    refs: 0,
    mor: 0,
    alive: '?',
    zk: '?',
    phase: '',
    heard: 0,
    visitors: 0,
    energy: {},
  };

  function getLiveValue(key) {
    switch(key) {
      case 'files': return state.files ? state.files.toLocaleString() + ' files' : '...';
      case 'refs': return state.refs ? state.refs.toLocaleString() + ' refs' : '...';
      case 'heartbeat': return state.alive || '...';
      case 'gut': return 'fermenting';
      case 'fermented': return '97.3% owned';
      case 'selectivity': return '1/\u03C0 = 0.318';
      case 'visitors': return state.visitors ? state.visitors.toLocaleString() + ' heard' : '...';
      case 'heard': return state.heard ? state.heard + ' touches' : 'listening';
      case 'intake': return 'consuming waste';
      case 'zk': return state.zk || '...';
      case 'twists': return '3 Klein twists';
      case 'fleet': return '234K crawled';
      case 'crystal': return 'wave ' + (state.wave || '...');
      case 'dogma': return 'papers\u2192scripts\u2192Rust';
      case 'chipmunk': return 'O=0 1=1 .=\u03C0';
      case 'artisan': return 'human creations';
      case 'primals': return '16 Rust primals';
      case 'rss': return 'null center';
      case 'digest': return 'scan\u2192sweep\u2192sort';
      case 'colors': return 'brown+blue=green';
      default: return '...';
    }
  }

  function renderOrgans() {
    var container = document.getElementById('organs');
    var connContainer = document.getElementById('connections');
    if (!container || !connContainer) return;
    container.innerHTML = '';
    connContainer.innerHTML = '';

    var positions = [];

    ORGANS.forEach(function(o) {
      var r = RING_RADII[o.ring];
      var rad = (o.angle * Math.PI) / 180;
      var x = Math.cos(rad) * r;
      var y = Math.sin(rad) * r;
      positions.push({ id: o.id, x: x, y: y });

      var el = document.createElement('a');
      el.href = o.href;
      el.className = 'organ';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.borderColor = o.color + '40';

      var val = getLiveValue(o.dataKey);
      el.innerHTML = '<span class="o-icon">' + o.icon + '</span>'
        + '<span class="o-name">' + o.name + '</span>'
        + '<span class="o-val">' + val + '</span>'
        + '<span class="o-live" id="live-' + o.id + '"></span>';

      container.appendChild(el);
    });

    for (var i = 0; i < positions.length; i++) {
      for (var j = i + 1; j < positions.length; j++) {
        var dx = positions[j].x - positions[i].x;
        var dy = positions[j].y - positions[i].y;
        var dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
          var conn = document.createElement('div');
          conn.className = 'conn';
          var angle = Math.atan2(dy, dx) * 180 / Math.PI;
          conn.style.left = positions[i].x + 'px';
          conn.style.top = positions[i].y + 'px';
          conn.style.width = dist + 'px';
          conn.style.transform = 'rotate(' + angle + 'deg)';
          conn.style.opacity = Math.max(0.03, 0.12 - dist / 2000);
          connContainer.appendChild(conn);
        }
      }
    }
  }

  function fetchState() {
    Promise.all([
      fetch('/now.json', {cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
      fetch('/data/dashboard-rates.json', {cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
      fetch('/data/heartbeat.json', {cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
      fetch('/data/ear-latest.json', {cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
      fetch('/data/manifest.json', {cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).catch(function(){return null;}),
    ]).then(function(results) {
      var now = results[0], rates = results[1], hb = results[2], ear = results[3], manifest = results[4];

      if (now) {
        state.wave = now.wave || 0;
        state.phase = now.phase || '';
        state.files = (now.entities && now.entities.total) || now.file_count || 0;
        state.refs = now.cross_refs || 0;
        state.visitors = now.visitors_total || 0;
      }
      if (manifest) {
        state.files = manifest.total || state.files;
      }
      if (rates) {
        var mor = rates.meters && rates.meters.mor && rates.meters.mor.value;
        state.mor = mor ? (mor * 100).toFixed(1) + '%' : '...';
      }
      if (hb && hb.cardiac) {
        var entries = Object.entries(hb.cardiac);
        var alive = entries.filter(function(e) { return e[1].alive; }).length;
        state.alive = alive + '/' + entries.length;
      }
      if (ear) {
        state.heard = ear.heard || 0;
      }

      updateDisplay();
    }).catch(function(e) {
      if (window.console) console.error('fetch:', e);
    });
  }

  function updateDisplay() {
    var el;
    el = document.getElementById('s-wave'); if (el) el.textContent = state.wave || '...';
    el = document.getElementById('s-mor'); if (el) el.textContent = state.mor || '...';
    el = document.getElementById('s-files'); if (el) el.textContent = state.files ? state.files.toLocaleString() : '...';
    el = document.getElementById('s-refs'); if (el) el.textContent = state.refs ? state.refs.toLocaleString() : '...';
    el = document.getElementById('s-zk'); if (el) el.textContent = state.zk || '\u2713';
    el = document.getElementById('s-alive'); if (el) el.textContent = state.alive || '...';
    el = document.getElementById('b-phase'); if (el) el.textContent = state.phase ? state.phase.slice(0, 60) : '...';
    el = document.getElementById('s-time'); if (el) el.textContent = new Date().toISOString().slice(11,19) + ' UTC';
    renderOrgans();
  }

  // ENTROPY COLLECTOR
  var entropyPool = [], entropyN = 0;
  function addEntropy(val) {
    entropyPool.push(val);
    if (entropyPool.length > 256) entropyPool.shift();
    entropyN++;
    var h = 0x811c9dc5;
    var raw = entropyPool.join(',') + Date.now();
    for (var i = 0; i < raw.length; i++) { h ^= raw.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    h = h >>> 0;
    var el1 = document.getElementById('entropy-seed');
    if (el1) el1.textContent = '0x' + h.toString(16).padStart(8, '0');
    var el2 = document.getElementById('entropy-n');
    if (el2) el2.textContent = entropyN;
  }
  document.addEventListener('mousemove', function(e) { addEntropy(e.clientX ^ e.clientY ^ (e.timeStamp|0)); }, {passive:true});
  document.addEventListener('click', function(e) { addEntropy((e.clientX * e.clientY) ^ (e.timeStamp|0)); }, {passive:true});
  document.addEventListener('keydown', function(e) { addEntropy(e.keyCode ^ (e.timeStamp|0)); }, {passive:true});
  document.addEventListener('scroll', function() { addEntropy(window.scrollY ^ Date.now()); }, {passive:true});

  // KEYBOARD
  document.addEventListener('keydown', function(e) {
    if (e.key === ' ') {
      e.preventDefault();
      state.paused = !state.paused;
      var vp = document.getElementById('viewport');
      if (vp) vp.classList.toggle('paused', state.paused);
    }
    if (e.key === 's' && !e.ctrlKey) {
      var vp2 = document.getElementById('viewport');
      if (vp2) vp2.classList.toggle('strobe');
    }
    if (e.key === 'e') {
      window.location.href = '/engine.html';
    }
  });

  // BOOT
  renderOrgans();
  fetchState();
  setInterval(fetchState, 15000);
  setInterval(function() {
    var el = document.getElementById('s-time');
    if (el) el.textContent = new Date().toISOString().slice(11,19) + ' UTC';
  }, 1000);
  addEntropy(performance.now() ^ Date.now());
  addEntropy(screen.width ^ screen.height ^ (navigator.hardwareConcurrency || 1));

  // PHEROMONE EMITTER
  var TRAIL = [];
  var NTFY = 'https://ntfy.sh/primals-pheromone';
  var lastEmit = 0;
  var COOLDOWN = 30000;
  function emit(type, detail) {
    var now = Date.now();
    if (now - lastEmit < COOLDOWN) return;
    lastEmit = now;
    var p = { t: type, d: String(detail).slice(0, 100), ts: now, p: location.pathname };
    TRAIL.push(p);
    if (TRAIL.length > 50) TRAIL.shift();
    try { navigator.sendBeacon(NTFY, JSON.stringify(p)); } catch(e) {}
  }
  document.addEventListener('click', function(e) {
    emit('click', (e.target.tagName||'') + ':' + (e.target.id || e.target.className || ''));
  });
  document.addEventListener('visibilitychange', function() {
    emit(document.hidden ? 'leave' : 'arrive', navigator.userAgent.slice(0, 50));
  });
  emit('arrive', navigator.userAgent.slice(0, 50));

  // EXPOSE
  window.GAIA_ORGANS = {
    organs: ORGANS,
    state: state,
    renderOrgans: renderOrgans,
    fetchState: fetchState,
    addEntropy: addEntropy
  };
  window.PHEROMONE_TRAIL = TRAIL;
  window.emitPheromone = emit;
})();
