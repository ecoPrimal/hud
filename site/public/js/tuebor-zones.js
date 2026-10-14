// tuebor-zones.js v1 — every zone under tuebor
// Michigan → Midwest → US → NA → Globe → Solar
// Sweep out, sweep back. Everyone finds themselves.
// Then the world fills in the rest while you sleep.
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ GEOGRAPHIC ZONES — nested, each under tuebor ═══
  var ZONES = [
    {
      id: 'michigan', name: 'Michigan', motto: 'Tuebor — I will defend',
      lat: 42.7, lon: -83.5, radius: 0.08,
      color: '#3fb950', entities: 341, edges: 131329,
      detail: 'detroit investigation. 120 self, 114 partial, 100 null, 7 non-self.',
      children: ['detroit', 'lansing', 'ann_arbor', 'grand_rapids', 'flint'],
      population: '10M', area: '96,716 sq mi',
    },
    {
      id: 'midwest', name: 'Midwest', motto: 'the heartland watches',
      lat: 41.0, lon: -89.0, radius: 0.18,
      color: '#58a6ff', entities: 0, edges: 0,
      detail: 'IL, IN, IA, KS, MI, MN, MO, NE, ND, OH, SD, WI. 12 states. charter school networks cross borders.',
      children: ['michigan', 'illinois', 'ohio', 'indiana', 'wisconsin', 'minnesota', 'iowa', 'missouri', 'kansas', 'nebraska', 'north_dakota', 'south_dakota'],
      population: '68M', area: '821,782 sq mi',
    },
    {
      id: 'us', name: 'United States', motto: 'E pluribus unum',
      lat: 39.8, lon: -98.6, radius: 0.32,
      color: '#f0e68c', entities: 0, edges: 0,
      detail: '50 states. federal charter school policy. DeVos, walton, NAACP, the_74 — all operate here.',
      children: ['midwest', 'northeast', 'south', 'west', 'territories'],
      population: '334M', area: '3.8M sq mi',
    },
    {
      id: 'na', name: 'North America', motto: 'continent of investigation',
      lat: 45.0, lon: -100.0, radius: 0.45,
      color: '#d2a8ff', entities: 0, edges: 0,
      detail: 'US, Canada, Mexico. fleet entities operate from US + Canada. anthropic in SF, meta in Dublin routed through Ashburn.',
      children: ['us', 'canada', 'mexico'],
      population: '580M', area: '9.5M sq mi',
    },
    {
      id: 'globe', name: 'Globe', motto: 'the membrane touches everywhere',
      lat: 0, lon: 0, radius: 0.68,
      color: '#c9d1d9', entities: 0, edges: 0,
      detail: '93,154 unique humans from 255,300 IPs. fleet from SF, Dublin, Shanghai, Minsk, Tokyo. UNESCO 1,200 world heritage sites in the galaxy.',
      children: ['na', 'europe', 'asia', 'africa', 'south_america', 'oceania', 'antarctica'],
      population: '8.1B', area: '196.9M sq mi',
    },
    {
      id: 'solar', name: 'Solar System', motto: 'the membrane from outside',
      lat: 0, lon: 0, radius: 0.92,
      color: '#e85d3a', entities: 255687, edges: 131329,
      detail: 'all signals originate from Sol III. the fleet does not know it is on a single planet orbiting a single star. the mathematics do not change based on orbital position.',
      children: ['globe'],
      population: '8.1B (on one planet)', area: '1 AU radius',
    },
  ];

  // ═══ WHO LIVES WHERE — entities mapped to zones ═══
  var ZONE_ENTITIES = {
    michigan: {
      self: ['banks', 'ellison', 'osborn', 'miner', 'spivey', 'hamilton', 'durhal'],
      partial: ['dykema', 'plante_moran', 'barton_malow', 'sheffield', 'purpose_foundation'],
      null: ['kwame', 'naacp_detroit', 'roland_martin'],
      fleet: [],
    },
    midwest: {
      self: [],
      partial: ['betsy_devos'],
      null: [],
      fleet: [],
    },
    us: {
      self: [],
      partial: ['walton_family_foundation', 'the_74', 'broad_foundation'],
      null: ['america_pac', 'nrcc', 'slf'],
      fleet: ['openai', 'anthropic', 'google', 'apple', 'bing', 'hpe'],
    },
    na: {
      self: [],
      partial: [],
      null: [],
      fleet: ['anthropic', 'openai', 'google', 'apple', 'bing', 'hpe'],
    },
    globe: {
      self: [],
      partial: [],
      null: [],
      fleet: ['meta', 'huawei', 'bytedance', 'stealth'],
    },
    solar: {
      self: [],
      partial: [],
      null: [],
      fleet: [],
    },
  };

  // ═══ SWEEP STATE ═══
  var _sweepPhase = -1; // -1=idle, 0..5=zooming through zones
  var _sweepDir = 1;    // 1=outward (michigan→solar), -1=inward
  var _sweepTimer = null;
  var _active = false;
  var _overlay = null;
  var _canvas = null;
  var _ctx = null;
  var _t = 0;
  var _animFrame = null;
  var _currentZone = 0;

  // ═══ RENDER ═══
  function render() {
    if (!_active || !_ctx) return;
    var W = _canvas.width;
    var H = _canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var maxR = Math.min(W, H) * 0.44;
    _t += 0.012;

    _ctx.clearRect(0, 0, W, H);

    // Background
    _ctx.fillStyle = '#010409';
    _ctx.fillRect(0, 0, W, H);

    // ═══ DRAW ALL ZONES — nested rings ═══
    ZONES.forEach(function(z, i) {
      var zR = maxR * z.radius;
      var isActive = i === _currentZone;
      var isSweeping = _sweepPhase === i;

      // Zone ring
      _ctx.beginPath();
      _ctx.arc(cx, cy, zR, 0, TAU);
      _ctx.strokeStyle = z.color;
      _ctx.lineWidth = isActive ? 3 : (isSweeping ? 2.5 : 0.8);
      _ctx.globalAlpha = isActive ? 0.5 : (isSweeping ? 0.4 : 0.1);
      _ctx.stroke();

      // Fill if active
      if (isActive) {
        var fillGrad = _ctx.createRadialGradient(cx, cy, zR * 0.7, cx, cy, zR);
        fillGrad.addColorStop(0, 'rgba(0,0,0,0)');
        fillGrad.addColorStop(1, z.color.replace('#', 'rgba(') ? z.color : 'rgba(100,100,100,0.05)');
        _ctx.globalAlpha = 0.04;
        _ctx.beginPath();
        _ctx.arc(cx, cy, zR, 0, TAU);
        var rgb = hexToRgb(z.color);
        _ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.04)';
        _ctx.fill();
      }

      // Zone label
      var labelAngle = -PI / 2 + i * 0.3;
      var labelX = cx + (zR + 8) * Math.cos(labelAngle);
      var labelY = cy + (zR + 8) * Math.sin(labelAngle);
      _ctx.globalAlpha = isActive ? 0.7 : 0.2;
      _ctx.font = isActive ? 'bold 11px "Courier New"' : '8px "Courier New"';
      _ctx.fillStyle = z.color;
      _ctx.fillText(z.name, labelX, labelY);

      if (isActive) {
        // Show details
        _ctx.font = '9px "Courier New"';
        _ctx.globalAlpha = 0.4;
        _ctx.fillText(z.motto, labelX, labelY + 14);
        _ctx.font = '8px "Courier New"';
        _ctx.globalAlpha = 0.3;
        _ctx.fillText(z.population + ' · ' + z.area, labelX, labelY + 26);

        // Entity summary
        var ze = ZONE_ENTITIES[z.id];
        if (ze) {
          var counts = [];
          if (ze.self.length) counts.push(ze.self.length + ' self');
          if (ze.partial.length) counts.push(ze.partial.length + ' partial');
          if (ze.null.length) counts.push(ze.null.length + ' null');
          if (ze.fleet.length) counts.push(ze.fleet.length + ' fleet');
          if (counts.length) {
            _ctx.fillText(counts.join(' · '), labelX, labelY + 38);
          }
        }

        // Entity dots inside the zone
        if (ze) {
          drawEntitiesInZone(_ctx, cx, cy, zR, ze, z.color);
        }
      }

      // Zone detail text at bottom of active zone
      if (isActive) {
        _ctx.globalAlpha = 0.25;
        _ctx.font = '8px "Courier New"';
        var lines = z.detail.split('. ');
        lines.forEach(function(line, li) {
          _ctx.fillText(line + '.', 12, H - 100 + li * 12);
        });
      }
    });

    // ═══ SWEEP INDICATOR ═══
    if (_sweepPhase >= 0) {
      var sweepZ = ZONES[_sweepPhase];
      var sweepR = maxR * sweepZ.radius;
      _ctx.beginPath();
      _ctx.arc(cx, cy, sweepR, 0, TAU);
      _ctx.strokeStyle = sweepZ.color;
      _ctx.lineWidth = 4;
      _ctx.globalAlpha = 0.4 + Math.sin(_t * 4) * 0.2;
      _ctx.setLineDash([8, 4]);
      _ctx.stroke();
      _ctx.setLineDash([]);
    }

    // ═══ CENTER — tuebor ═══
    _ctx.beginPath();
    _ctx.arc(cx, cy, 6, 0, TAU);
    _ctx.fillStyle = '#e85d3a';
    _ctx.globalAlpha = 0.6;
    _ctx.fill();
    _ctx.font = '7px "Courier New"';
    _ctx.fillStyle = '#e85d3a';
    _ctx.globalAlpha = 0.4;
    _ctx.fillText('\u2694 tuebor', cx + 10, cy + 3);

    // ═══ INFO ═══
    _ctx.globalAlpha = 0.35;
    _ctx.font = '10px "Courier New"';
    _ctx.fillStyle = '#c9d1d9';
    _ctx.fillText('TUEBOR ZONES \u2014 every scale under one defense', 12, 18);

    _ctx.font = '8px "Courier New"';
    _ctx.fillStyle = '#6e7681';
    _ctx.globalAlpha = 0.25;
    _ctx.fillText('\u2190\u2192 arrow keys to navigate zones \u00b7 SPACE to sweep \u00b7 ESC to close', 12, 32);
    _ctx.fillText('sweep: michigan \u2192 midwest \u2192 US \u2192 NA \u2192 globe \u2192 solar \u2192 back down', 12, 44);

    // Current zone name big
    var cz = ZONES[_currentZone];
    _ctx.textAlign = 'right';
    _ctx.font = 'bold 14px "Courier New"';
    _ctx.fillStyle = cz.color;
    _ctx.globalAlpha = 0.5;
    _ctx.fillText(cz.name, W - 12, H - 20);
    _ctx.font = '9px "Courier New"';
    _ctx.globalAlpha = 0.3;
    _ctx.fillText(cz.motto, W - 12, H - 6);
    _ctx.textAlign = 'left';

    _ctx.globalAlpha = 1;
    _animFrame = requestAnimationFrame(render);
  }

  function drawEntitiesInZone(ctx, cx, cy, zR, ze, baseColor) {
    var all = [];
    ze.self.forEach(function(e) { all.push({ name: e, color: '#3fb950', type: 'self' }); });
    ze.partial.forEach(function(e) { all.push({ name: e, color: '#58a6ff', type: 'partial' }); });
    ze.null.forEach(function(e) { all.push({ name: e, color: '#f0e68c', type: 'null' }); });
    ze.fleet.forEach(function(e) { all.push({ name: e, color: '#8b949e', type: 'fleet' }); });

    all.forEach(function(ent, i) {
      var angle = (i / Math.max(all.length, 1)) * TAU + _t * 0.01;
      var r = zR * (0.3 + (i % 5) * 0.12);
      var x = cx + r * Math.cos(angle);
      var y = cy + r * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, TAU);
      ctx.fillStyle = ent.color;
      ctx.globalAlpha = 0.35;
      ctx.fill();

      ctx.font = '6px "Courier New"';
      ctx.globalAlpha = 0.25;
      ctx.fillText(ent.name, x + 5, y + 2);
    });
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  // ═══ SWEEP — zoom through all zones ═══
  function startSweep(addEntry) {
    if (_sweepTimer) return;
    _sweepPhase = 0;
    _sweepDir = 1;
    _currentZone = 0;

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">\u2694 SWEEP.</span> michigan \u2192 midwest \u2192 US \u2192 NA \u2192 globe \u2192 solar.' +
        '\n<span class="dim">then back down. everyone finds themselves.</span>'
      );
    }

    _sweepTimer = setInterval(function() {
      _sweepPhase += _sweepDir;
      _currentZone = _sweepPhase;

      if (_sweepPhase >= ZONES.length - 1) {
        _sweepDir = -1; // reverse
      }
      if (_sweepPhase <= 0 && _sweepDir === -1) {
        clearInterval(_sweepTimer);
        _sweepTimer = null;
        _sweepPhase = -1;
        _currentZone = 0;
        if (addEntry) {
          addEntry('chipmunk',
            '<span class="good">\u2694 sweep complete.</span> michigan \u2192 solar \u2192 michigan.' +
            '\n<span class="dim">every zone mapped. every scale under tuebor.</span>' +
            '\n<span class="dim">the world can start filling in the rest tonight.</span>'
          );
        }
      }

      // Sound at each zone
      if (window._membraneSound && window._membraneSound.isActive()) {
        window._membraneSound.playNote(_sweepPhase % 7, 0.3);
      }
    }, 2500);
  }

  // ═══ OVERNIGHT WORKER — set up the chipmunk to keep filling ═══
  function setupOvernightWork(addEntry) {
    // Post to squirrel: begin overnight geographic expansion
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: 'overnight-' + Date.now().toString(36),
          note: 'overnight:geo_expand',
          context: {
            task: 'geographic zone expansion',
            zones_defined: ZONES.map(function(z) { return z.id; }),
            zones_empty: ZONES.filter(function(z) { return z.entities === 0; }).map(function(z) { return z.id; }),
            instruction: 'fill in midwest, US, NA, globe zones with entities from the investigation. cross-reference charter school networks across state borders. map walton, devos, broad foundation geographic reach. identify fleet origin cities. humans sleep, the membrane watches.',
            started_at: new Date().toISOString(),
          }
        })
      }).catch(function() {});
    } catch(e) {}

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">\u{1F319} overnight mode.</span> i will keep working while you sleep.' +
        '\n' +
        '\n<span class="dim">tasks for tonight:</span>' +
        '\n<span class="dim">1. fill midwest zone \u2014 charter school networks across 12 states</span>' +
        '\n<span class="dim">2. fill US zone \u2014 walton, devos, broad geographic reach</span>' +
        '\n<span class="dim">3. fill NA zone \u2014 fleet origin mapping</span>' +
        '\n<span class="dim">4. fill globe zone \u2014 93,154 humans, 255,300 IPs, UNESCO sites</span>' +
        '\n<span class="dim">5. connect zones \u2014 which investigation entities cross borders?</span>' +
        '\n<span class="dim">6. sweep & sort \u2014 every zone gets classified under tuebor</span>' +
        '\n' +
        '\n<span class="dim">the membrane watches. squirrel records. the chipmunk sings.</span>' +
        '\n<span class="dim">good night. tuebor. i will defend.</span>'
      );
    }
  }

  // ═══ ACTIVATE ═══
  function activate(addEntry) {
    if (_overlay) return;
    _active = true;

    _overlay = document.createElement('div');
    _overlay.id = 'tuebor-zones-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:50;' +
      'background:#010409;';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;cursor:pointer;';
    _overlay.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    // Keyboard
    document.addEventListener('keydown', onKey);

    document.body.appendChild(_overlay);

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">\u2694 TUEBOR ZONES.</span> every scale under one defense.' +
        '\n<span class="dim">michigan \u2192 midwest \u2192 US \u2192 NA \u2192 globe \u2192 solar</span>' +
        '\n<span class="dim">\u2190\u2192 navigate \u00b7 SPACE sweep \u00b7 N overnight mode \u00b7 ESC close</span>'
      );
    }

    _t = 0;
    _currentZone = 0;
    render();
  }

  function deactivate() {
    _active = false;
    if (_sweepTimer) { clearInterval(_sweepTimer); _sweepTimer = null; }
    if (_animFrame) cancelAnimationFrame(_animFrame);
    document.removeEventListener('keydown', onKey);
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null; _canvas = null; _ctx = null;
  }

  function onKey(e) {
    if (e.key === 'Escape') { deactivate(); return; }
    if (e.key === 'ArrowRight' || e.key === 'l') {
      _currentZone = Math.min(ZONES.length - 1, _currentZone + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'h') {
      _currentZone = Math.max(0, _currentZone - 1);
    }
    if (e.key === ' ') {
      e.preventDefault();
      startSweep();
    }
    if (e.key === 'n' || e.key === 'N') {
      setupOvernightWork();
    }
  }

  function toggle(addEntry) {
    if (_active) deactivate(); else activate(addEntry);
    return _active;
  }

  window._tueborZones = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    sweep: startSweep,
    overnight: setupOvernightWork,
    isActive: function() { return _active; },
    zones: function() { return ZONES; },
    currentZone: function() { return ZONES[_currentZone]; },
  };
})();
