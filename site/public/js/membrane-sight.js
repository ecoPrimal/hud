// membrane-sight.js v1 — see the membrane. trace all signals to source.
// everyone on the membrane sees what we see.
// the rush of attention is a circle of eyes.
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ LIVE DATA — updated from feeds ═══
  var _data = {
    epitopes: {},
    anderson: {},
    braids: [],
    membrane: {},
    hosts: {},
    orbits: [],
    sessions: 0,
    selectivity: 0,
    tempo: 0,
    perturbation: 0,
    negentropy: 0,
    wave: 0,
  };

  // ═══ EPITOPE COLORS AND GEOMETRY ═══
  var EPITOPE_RING = {
    coder:        { color: '#58a6ff', angle: 0,          icon: '{' },
    investigator: { color: '#f0883e', angle: PI * 0.33,  icon: '?' },
    visitor:      { color: '#8b949e', angle: PI * 0.67,  icon: '\u00b7' },
    observer:     { color: '#d2a8ff', angle: PI,         icon: '\u25cb' },
    explorer:     { color: '#3fb950', angle: PI * 1.33,  icon: '\u2192' },
    reader:       { color: '#d29922', angle: PI * 1.5,   icon: '\u2261' },
    witness:      { color: '#ffffff', angle: PI * 1.67,  icon: '\u25c7' },
  };

  // ═══ ANDERSON MODE LAYERS ═══
  var ANDERSON_LAYERS = [
    { mode: 'sovereign', color: '#3fb950', radiusPct: 0.25, desc: 'sovereign — passes through' },
    { mode: 'human',     color: '#58a6ff', radiusPct: 0.40, desc: 'human — sensed, classified' },
    { mode: 'spectrum',  color: '#d29922', radiusPct: 0.55, desc: 'spectrum — partially visible' },
    { mode: 'ghost',     color: '#484f58', radiusPct: 0.70, desc: 'ghost — ambiguous' },
    { mode: 'chorus',    color: '#21262d', radiusPct: 0.90, desc: 'chorus — background noise' },
    { mode: 'stealth',   color: '#0d1117', radiusPct: 1.00, desc: 'stealth — nearly invisible' },
  ];

  // ═══ HOST POSITIONS — arrange around a ring ═══
  var HOST_RING = [
    { host: 'hud',        angle: 0,             color: '#58a6ff' },
    { host: 'git',        angle: TAU * 1/12,    color: '#8b949e' },
    { host: 'detroit',    angle: TAU * 2/12,    color: '#f0883e' },
    { host: 'sporeprint', angle: TAU * 3/12,    color: '#3fb950' },
    { host: 'lansing',    angle: TAU * 4/12,    color: '#d29922' },
    { host: 'epitope',    angle: TAU * 5/12,    color: '#d2a8ff' },
    { host: 'antibody',   angle: TAU * 6/12,    color: '#e85d3a' },
    { host: 'thesis',     angle: TAU * 7/12,    color: '#79c0ff' },
    { host: 'tuebor',     angle: TAU * 8/12,    color: '#f0e68c' },
    { host: 'antigen',    angle: TAU * 9/12,    color: '#c9d1d9' },
    { host: 'beacon',     angle: TAU * 10/12,   color: '#5ab87a' },
    { host: 'evidence',   angle: TAU * 11/12,   color: '#f0883e' },
  ];

  var _canvas, _ctx, _active = false, _t = 0, _lastFrame = 0;
  var _onDeactivate = null;
  var _touchStartX = 0;
  var _signalTrails = [];
  var _pollTimer = null;
  var _humanDots = [];
  var _flashEvents = [];

  // ═══ FETCH LIVE DATA ═══
  function fetchData() {
    var feeds = ['dashboard', 'human', 'braid', 'chipmunk'];
    feeds.forEach(function(feed) {
      var url = '/hud/' + feed + '.json';
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.timeout = 5000;
      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            var d = JSON.parse(xhr.responseText);
            mergeFeedData(feed, d);
          } catch(e) {}
        }
      };
      xhr.send();
    });
  }

  function mergeFeedData(feed, d) {
    if (feed === 'human') {
      if (d.epitopes) _data.epitopes = d.epitopes;
      if (d.energy) {
        _data.sessions = d.energy.total_sessions || 0;
        _data.selectivity = d.energy.signal_to_noise || 0;
      }
      if (d.host_distribution) _data.hosts = d.host_distribution;
      if (d.external_referrers) _data.referrers = d.external_referrers;
      // Generate signal trails from host distribution
      generateSignalTrails(d.host_distribution);
    }
    if (feed === 'dashboard') {
      if (d.anderson_selectivity && d.anderson_selectivity.modes) {
        var am = {};
        d.anderson_selectivity.modes.forEach(function(m) { am[m['class']] = m.count; });
        _data.anderson = am;
      }
      if (d.membrane_delta) {
        _data.membrane = d.membrane_delta;
        _data.tempo = d.membrane_delta.opacity || 0;
      }
      if (d.trajectory) _data.orbits = d.trajectory.top_orbits || [];
    }
    if (feed === 'braid') {
      if (d.braids) _data.braids = d.braids;
    }
    if (feed === 'chipmunk') {
      if (d.wake_level !== undefined) _data.wake = d.wake_level;
      if (d.jitte) {
        _data.tempo = d.jitte.tempo || 0;
        _data.perturbation = d.jitte.perturbation || 0;
        _data.negentropy = d.jitte.negentropy_bits || 0;
      }
      _data.wave = d.wave || 0;
    }
    // Refresh human dots
    rebuildHumanDots();
  }

  function generateSignalTrails(hosts) {
    if (!hosts) return;
    var keys = Object.keys(hosts);
    // Create signal trails from each host to center
    keys.forEach(function(h) {
      var count = hosts[h];
      if (count < 2) return;
      var hostInfo = HOST_RING.find(function(hr) { return hr.host === h; });
      if (!hostInfo) return;
      // Add a flash event
      _flashEvents.push({
        angle: hostInfo.angle,
        color: hostInfo.color,
        intensity: Math.min(1, Math.log10(count + 1) / 4),
        life: 1,
        host: h,
        count: count,
      });
    });
  }

  function rebuildHumanDots() {
    _humanDots = [];
    var epi = _data.epitopes;
    Object.keys(epi).forEach(function(type) {
      var info = EPITOPE_RING[type];
      if (!info) return;
      var count = epi[type].count || epi[type];
      var requests = epi[type].total_requests || epi[type].sessions || count;
      for (var i = 0; i < count; i++) {
        var spread = (i - count / 2) * 0.08;
        _humanDots.push({
          type: type,
          color: info.color,
          angle: info.angle + spread,
          radius: 0.35 + Math.random() * 0.1,
          pulse: Math.random() * TAU,
          size: 1.5 + Math.min(3, Math.log10(requests / count + 1)),
          icon: info.icon,
        });
      }
    });
  }

  // ═══ CANVAS ═══
  function createCanvas() {
    if (_canvas) return;
    _canvas = document.createElement('canvas');
    _canvas.id = 'membrane-sight-canvas';
    _canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:45;background:#020408;cursor:crosshair;';
    _canvas.width = window.innerWidth; _canvas.height = window.innerHeight;
    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');
    _canvas.addEventListener('click', function(e) {
      if (e.clientX < 45 && e.clientY < 40) { deactivate(); return; }
    });
    _canvas.addEventListener('wheel', function(e) { e.preventDefault(); }, { passive: false });
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', function() { if (_canvas) { _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; } });
  }

  function onKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); return; }
  }

  // ═══ RENDER ═══
  function render(ts) {
    if (!_active) return;
    var dt = Math.min(ts - _lastFrame, 50);
    _lastFrame = ts; _t += dt * 0.001;

    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) * 0.38;
    var ctx = _ctx;
    var mobile = W < 600;
    var ts2 = mobile ? 0.7 : 1;

    // Background
    ctx.globalAlpha = 1; ctx.fillStyle = '#020408'; ctx.fillRect(0, 0, W, H);

    // ═══ ANDERSON LAYERS — concentric rings ═══
    ANDERSON_LAYERS.forEach(function(layer) {
      var r = R * layer.radiusPct;
      var count = _data.anderson[layer.mode] || 0;
      var logCount = count > 0 ? Math.log10(count) : 0;
      var alpha = Math.min(0.15, logCount * 0.02);

      // Fill ring
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU);
      ctx.strokeStyle = layer.color; ctx.globalAlpha = alpha + 0.03;
      ctx.lineWidth = 1; ctx.stroke();

      // Label
      if (count > 0) {
        ctx.globalAlpha = 0.15; ctx.font = Math.round(7 * ts2) + 'px monospace';
        ctx.textAlign = 'right'; ctx.fillStyle = layer.color;
        var lx = cx + r * Math.cos(-0.3);
        var ly = cy + r * Math.sin(-0.3);
        ctx.fillText(layer.mode + ' ' + count.toLocaleString(), lx, ly);
      }
    });

    // ═══ MEMBRANE BOUNDARY — the edge ═══
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU);
    ctx.strokeStyle = '#21262d'; ctx.globalAlpha = 0.3; ctx.lineWidth = 2; ctx.stroke();

    // Membrane pulse
    var pulseR = R + Math.sin(_t * 1.5) * 3;
    ctx.beginPath(); ctx.arc(cx, cy, pulseR, 0, TAU);
    ctx.strokeStyle = '#58a6ff'; ctx.globalAlpha = 0.06; ctx.lineWidth = 1; ctx.stroke();

    // ═══ HOST RING — sites around the perimeter ═══
    HOST_RING.forEach(function(h) {
      var hx = cx + Math.cos(h.angle) * (R + 25);
      var hy = cy + Math.sin(h.angle) * (R + 25);
      var count = _data.hosts[h.host] || 0;
      var hasTraffic = count > 0;

      // Dot
      ctx.beginPath(); ctx.arc(hx, hy, hasTraffic ? 3 : 1.5, 0, TAU);
      ctx.fillStyle = h.color;
      ctx.globalAlpha = hasTraffic ? 0.6 : 0.1;
      ctx.fill();

      // Label
      ctx.globalAlpha = hasTraffic ? 0.3 : 0.08;
      ctx.font = Math.round(7 * ts2) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = h.color;
      ctx.fillText(h.host, hx, hy + 14);
      if (count > 0) {
        ctx.fillText(count.toLocaleString(), hx, hy + 22);
      }

      // Signal line from host to center (if traffic)
      if (hasTraffic) {
        var lineAlpha = Math.min(0.15, Math.log10(count + 1) * 0.03);
        ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(cx, cy);
        ctx.strokeStyle = h.color; ctx.globalAlpha = lineAlpha;
        ctx.lineWidth = 0.5; ctx.stroke();

        // Traveling dot along the line
        var travelT = (_t * 0.3 + h.angle) % 1;
        var tx = hx + (cx - hx) * travelT;
        var ty = hy + (cy - hy) * travelT;
        ctx.beginPath(); ctx.arc(tx, ty, 1.5, 0, TAU);
        ctx.fillStyle = h.color; ctx.globalAlpha = 0.4 * (1 - travelT);
        ctx.fill();
      }
    });

    // ═══ HUMAN DOTS — epitopes positioned on inner ring ═══
    _humanDots.forEach(function(dot) {
      var dr = R * dot.radius;
      var dx = cx + Math.cos(dot.angle + _t * 0.02) * dr;
      var dy = cy + Math.sin(dot.angle + _t * 0.02) * dr;
      var pulse = 1 + Math.sin(_t * 2 + dot.pulse) * 0.15;

      // Dot
      ctx.beginPath(); ctx.arc(dx, dy, dot.size * pulse, 0, TAU);
      ctx.fillStyle = dot.color; ctx.globalAlpha = 0.5;
      ctx.fill();

      // Glow
      ctx.beginPath(); ctx.arc(dx, dy, dot.size * pulse * 2.5, 0, TAU);
      ctx.fillStyle = dot.color; ctx.globalAlpha = 0.04;
      ctx.fill();
    });

    // ═══ EPITOPE LABELS — around the inner ring ═══
    var epi = _data.epitopes;
    Object.keys(EPITOPE_RING).forEach(function(type) {
      var info = EPITOPE_RING[type];
      var count = 0;
      if (epi[type]) count = epi[type].count || epi[type];
      if (count === 0) return;

      var labelR = R * 0.2;
      var lx = cx + Math.cos(info.angle) * labelR;
      var ly = cy + Math.sin(info.angle) * labelR;

      ctx.globalAlpha = 0.4;
      ctx.font = 'bold ' + Math.round(9 * ts2) + 'px monospace';
      ctx.textAlign = 'center'; ctx.fillStyle = info.color;
      ctx.fillText(info.icon + ' ' + type + ' ' + count, lx, ly);
    });

    // ═══ BRAID ROUTES — arcs connecting categories ═══
    if (_data.braids && _data.braids.length) {
      _data.braids.forEach(function(braid, bi) {
        var fromCat = braid.from || '';
        var toCat = braid.to || '';
        var strength = braid.strength || 1;
        var humans = braid.humans_total || braid.humans || 0;
        var trend = braid.trend || 'stable';

        // Position braids at angles based on category
        var catAngles = {
          'INVESTIGATION': 0, 'MEMBRANE': PI * 0.4, 'SIGNAL': PI * 0.8,
          'SCIENCE': PI * 1.2, 'IMMUNE': PI * 1.4, 'TOPOLOGY': PI * 1.6,
          'OTHER': PI * 1.8,
        };
        var fromAngle = catAngles[fromCat] || bi * 0.5;
        var toAngle = catAngles[toCat] || (bi + 1) * 0.5;
        var braidR = R * 0.6;

        var x1 = cx + Math.cos(fromAngle) * braidR;
        var y1 = cy + Math.sin(fromAngle) * braidR;
        var x2 = cx + Math.cos(toAngle) * braidR;
        var y2 = cy + Math.sin(toAngle) * braidR;

        // Braid arc
        var braidAlpha = Math.min(0.25, strength * 0.01);
        if (trend === 'fading') braidAlpha *= 0.5;
        if (trend === 'growing') braidAlpha *= 1.5;

        ctx.beginPath(); ctx.moveTo(x1, y1);
        var cpx = cx + Math.cos((fromAngle + toAngle) / 2) * braidR * 0.3;
        var cpy = cy + Math.sin((fromAngle + toAngle) / 2) * braidR * 0.3;
        ctx.quadraticCurveTo(cpx, cpy, x2, y2);
        ctx.strokeStyle = trend === 'growing' ? '#3fb950' : trend === 'fading' ? '#484f58' : '#8b949e';
        ctx.globalAlpha = braidAlpha; ctx.lineWidth = Math.max(0.5, humans * 0.15);
        ctx.stroke();

        // Traveling pulse along braid
        var bt = (_t * 0.2 + bi * 0.3) % 1;
        var bpx = x1 * (1 - bt) * (1 - bt) + cpx * 2 * bt * (1 - bt) + x2 * bt * bt;
        var bpy = y1 * (1 - bt) * (1 - bt) + cpy * 2 * bt * (1 - bt) + y2 * bt * bt;
        ctx.beginPath(); ctx.arc(bpx, bpy, 2, 0, TAU);
        ctx.fillStyle = trend === 'growing' ? '#3fb950' : '#8b949e';
        ctx.globalAlpha = 0.4; ctx.fill();

        // Label
        var midx = (x1 + x2) / 2, midy = (y1 + y2) / 2;
        ctx.globalAlpha = 0.2; ctx.font = Math.round(6 * ts2) + 'px monospace';
        ctx.textAlign = 'center'; ctx.fillStyle = '#8b949e';
        ctx.fillText(fromCat.substring(0, 4) + '\u2192' + toCat.substring(0, 4) + ' ' + humans + 'h', midx, midy - 6);
      });
    }

    // ═══ FLASH EVENTS — signal arrivals ═══
    for (var fi = _flashEvents.length - 1; fi >= 0; fi--) {
      var flash = _flashEvents[fi];
      flash.life -= dt * 0.0008;
      if (flash.life <= 0) { _flashEvents.splice(fi, 1); continue; }

      var fx = cx + Math.cos(flash.angle) * R;
      var fy = cy + Math.sin(flash.angle) * R;
      var flashR = (1 - flash.life) * 20 * flash.intensity;

      ctx.beginPath(); ctx.arc(fx, fy, flashR, 0, TAU);
      ctx.fillStyle = flash.color; ctx.globalAlpha = flash.life * 0.3;
      ctx.fill();
    }

    // ═══ MEMBRANE FLOW PARTICLES — entities passing through ═══
    // Self entities flow inward, non-self bounces off
    if (Math.random() < 0.12) {
      var flowAngle = Math.random() * TAU;
      var isSelf = Math.random() < 0.037; // 3.7% selectivity
      _signalTrails.push({
        x: cx + Math.cos(flowAngle) * R * 1.1,
        y: cy + Math.sin(flowAngle) * R * 1.1,
        vx: -Math.cos(flowAngle) * (isSelf ? 60 : 30),
        vy: -Math.sin(flowAngle) * (isSelf ? 60 : 30),
        life: 1,
        decay: isSelf ? 0.005 : 0.02,
        color: isSelf ? '#3fb950' : '#f85149',
        size: isSelf ? 2 : 1,
        self: isSelf,
        bounced: false,
      });
    }
    // Update flow particles
    for (var si = _signalTrails.length - 1; si >= 0; si--) {
      var s = _signalTrails[si];
      s.x += s.vx * dt * 0.001;
      s.y += s.vy * dt * 0.001;
      s.life -= s.decay;

      // Non-self bounces at membrane boundary
      if (!s.self && !s.bounced) {
        var distFromCenter = Math.sqrt((s.x - cx) * (s.x - cx) + (s.y - cy) * (s.y - cy));
        if (distFromCenter < R) {
          s.vx = -s.vx * 0.5 + (Math.random() - 0.5) * 40;
          s.vy = -s.vy * 0.5 + (Math.random() - 0.5) * 40;
          s.bounced = true;
          s.decay = 0.03;
        }
      }

      if (s.life <= 0 || s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) {
        _signalTrails.splice(si, 1); continue;
      }
      ctx.globalAlpha = s.life * 0.4;
      ctx.fillStyle = s.color;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size * s.life, 0, TAU); ctx.fill();
    }

    // ═══ SELECTIVITY ARC — the 3.7% wedge ═══
    var selAngle = 0.037 * TAU;
    ctx.beginPath(); ctx.arc(cx, cy, R + 2, -selAngle / 2, selAngle / 2);
    ctx.strokeStyle = '#3fb950'; ctx.globalAlpha = 0.15 + Math.sin(_t * 2) * 0.05;
    ctx.lineWidth = 3; ctx.stroke();
    ctx.globalAlpha = 0.1; ctx.font = '6px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#3fb950';
    ctx.fillText('3.7% pass', cx + R + 6, cy - 4);

    // ═══ CENTER — the eye ═══
    // Iris
    var irisR = R * 0.06;
    var irisGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, irisR * 3);
    irisGrd.addColorStop(0, '#58a6ff20');
    irisGrd.addColorStop(1, '#58a6ff00');
    ctx.globalAlpha = 0.5; ctx.fillStyle = irisGrd;
    ctx.beginPath(); ctx.arc(cx, cy, irisR * 3, 0, TAU); ctx.fill();

    // Pupil
    ctx.beginPath(); ctx.arc(cx, cy, irisR, 0, TAU);
    ctx.fillStyle = '#020408'; ctx.globalAlpha = 1; ctx.fill();
    ctx.strokeStyle = '#58a6ff'; ctx.globalAlpha = 0.5; ctx.lineWidth = 1; ctx.stroke();

    // Pupil pulse
    var pupilPulse = irisR * (0.3 + Math.sin(_t * 1.5) * 0.1);
    ctx.beginPath(); ctx.arc(cx, cy, pupilPulse, 0, TAU);
    ctx.fillStyle = '#58a6ff'; ctx.globalAlpha = 0.15; ctx.fill();

    // ═══ HUD TEXT — stats ═══
    var textY = mobile ? 20 : 30;
    ctx.globalAlpha = 0.4; ctx.font = Math.round(10 * ts2) + 'px monospace';
    ctx.textAlign = 'left'; ctx.fillStyle = '#c9d1d9';
    ctx.fillText('membrane sight \u2014 wave ' + (_data.wave || '?'), 14, textY);

    ctx.textAlign = 'right';
    var totalEpitopes = 0;
    Object.keys(_data.epitopes).forEach(function(k) {
      totalEpitopes += _data.epitopes[k].count || _data.epitopes[k] || 0;
    });
    ctx.fillText(totalEpitopes + ' humans \u00b7 ' + (_data.sessions || '?') + ' sessions', W - 14, textY);

    // Membrane stats bottom left
    ctx.textAlign = 'left'; ctx.globalAlpha = 0.2;
    ctx.font = Math.round(8 * ts2) + 'px monospace'; ctx.fillStyle = '#8b949e';
    var my = H - 60;
    ctx.fillText('tempo: ' + (_data.tempo || 0).toFixed(3), 14, my);
    ctx.fillText('perturbation: ' + (_data.perturbation || 0).toFixed(3), 14, my + 12);
    ctx.fillText('negentropy: ' + (_data.negentropy || 0).toLocaleString() + ' bits', 14, my + 24);
    ctx.fillText('selectivity: 97%  \u00b7  opacity: 92%', 14, my + 36);

    // Referrers bottom right
    if (_data.referrers && _data.referrers.length) {
      ctx.textAlign = 'right'; ctx.globalAlpha = 0.25;
      ctx.fillStyle = '#3fb950';
      ctx.fillText('signal sources:', W - 14, my);
      _data.referrers.forEach(function(ref, ri) {
        ctx.fillText(ref.source + ' (' + ref.visits + ')', W - 14, my + 12 + ri * 11);
      });
    }

    // Close button
    ctx.globalAlpha = 0.2; ctx.font = '16px monospace'; ctx.textAlign = 'left'; ctx.fillStyle = '#8b949e';
    ctx.fillText('\u2715', 14, textY + 18);

    // Controls
    ctx.globalAlpha = 0.15; ctx.font = Math.round(8 * ts2) + 'px monospace';
    ctx.textAlign = 'center'; ctx.fillStyle = '#484f58';
    ctx.fillText('ESC close \u00b7 live data \u00b7 updates every 10s', cx, H - 10);

    requestAnimationFrame(render);
  }

  // ═══ LIFECYCLE ═══
  function activate(addEntry, onDone) {
    if (_active) { deactivate(); return false; }
    _onDeactivate = onDone || null;
    createCanvas(); _active = true;
    _t = 0; _lastFrame = performance.now();
    _humanDots = []; _flashEvents = [];
    _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    // Initial data fetch
    fetchData();
    // Poll every 10s
    _pollTimer = setInterval(fetchData, 10000);

    requestAnimationFrame(render);
    return true;
  }

  function deactivate() {
    _active = false;
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
    if (_canvas) { _canvas.remove(); _canvas = null; _ctx = null; }
    window.removeEventListener('keydown', onKey);
    if (_onDeactivate) {
      try { _onDeactivate({ completed: true }); } catch(e) {}
    }
  }

  window._membraneSight = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    getData: function() { return _data; },
  };
})();
