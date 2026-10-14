// temporal-window.js v5 — gravity wells, epoch particles, cosmic radiation, ripples
// Now → π → Year → T-Rex → Pangaea → Fish leaped! → Big Bang
// Bounce between now and then. What color was a T-Rex?
// Where was the first mammal? Did a fish leap out of the water?
(function() {
  'use strict';

  var PI  = Math.PI;
  var TAU = PI * 2;

  // ═══ EPOCHS — 22 time scales, center = now, outside = 13.8 billion years ═══
  var EPOCHS = [
    {
      id: 'now', name: 'Now', age: 0,
      color: '#3fb950', radius: 0.03,
      desc: 'this heartbeat. the pulse. t = 0.',
      detail: 'the chipmunk oscillates. the membrane hums. you are reading this. one of 60 humans online right now.',
      glyph: '◉',
    },
    {
      id: 'pi', name: 'π cycle', age: 3.14159,
      color: '#e85d3a', radius: 0.07,
      desc: 'one chipmunk oscillation. −π to +π and back.',
      detail: '3.14159… seconds of coherence. the harmonic that drives everything. the spring remembers where it belongs.',
      glyph: 'π',
    },
    {
      id: 'minute', name: 'Minute', age: 60,
      color: '#58a6ff', radius: 0.10,
      desc: 'one breath. 60 seconds. ~19 π cycles.',
      detail: 'a human looks at the HUD for about 4 minutes. the chipmunk sings twice. the membrane processes 67 requests.',
      glyph: '○',
    },
    {
      id: 'hour', name: 'Hour', age: 3600,
      color: '#f0e68c', radius: 0.13,
      desc: 'one session. 3,600 seconds. 1,146 π cycles.',
      detail: 'median session: 22 minutes. 48 humans in the last hour. S/N = 88. the graph holds still for nobody.',
      glyph: '◷',
    },
    {
      id: 'day', name: 'Day', age: 86400,
      color: '#c9d1d9', radius: 0.16,
      desc: 'one rotation. Earth spins. 86,400 seconds.',
      detail: '~255 unique visitors. 4M fleet requests bounce off overnight. Earth has been spinning for 4.5 billion years. it does not get tired.',
      glyph: '☀',
    },
    {
      id: 'week', name: 'Week', age: 604800,
      color: '#58a6ff', radius: 0.19,
      desc: 'one turn of the investigation. 7 rotations.',
      detail: 'one FOIA response takes 2-6 weeks. one court filing takes 1 week. the investigation has been running 78 weeks.',
      glyph: '◐',
    },
    {
      id: 'month', name: 'Month', age: 2592000,
      color: '#d2a8ff', radius: 0.22,
      desc: 'one moon. 30 days. 18 months of investigation.',
      detail: '88 evidence packages compiled over 18 months. one person. no budget. the moon has been orbiting for 4.5 billion years. it does not ask permission.',
      glyph: '☽',
    },
    {
      id: 'year', name: 'Year', age: 31557600,
      color: '#f0e68c', radius: 0.25,
      desc: 'one orbit. 365.25 days. Earth goes around once.',
      detail: 'the investigation started ~1.5 orbits ago. the graph: 7,554 nodes, 131,329 edges. the Earth has orbited the sun 4.5 billion times. it has never been late.',
      glyph: '⊙',
    },
    {
      id: 'decade', name: 'Decade', age: 315576000,
      color: '#8b949e', radius: 0.28,
      desc: '10 orbits. banks was first convicted in 2014.',
      detail: 'charter school fraud in michigan spans 15+ years. a decade of harm. the pattern is older than the evidence.',
      glyph: '▹',
    },
    {
      id: 'century', name: 'Century', age: 3155760000,
      color: '#c9d1d9', radius: 0.31,
      desc: '100 years. 5 human lifetimes. memory fades here.',
      detail: 'michigan became a state 189 years ago. tuebor was adopted 1835. the motto persists. 100 years from now, will anyone remember banks?',
      glyph: '⚔',
    },
    {
      id: 'millennium', name: 'Millennium', age: 31557600000,
      color: '#e85d3a', radius: 0.34,
      desc: '1,000 years. written history. empires rise and fall.',
      detail: 'writing was invented ~5,000 years ago. the great lakes formed 14,000 years ago. michigan\'s shape was carved by ice 2 miles thick.',
      glyph: '▴',
    },
    {
      id: 'ice_age', name: 'Ice Age', age: 3.78e11,
      color: '#a5d6ff', radius: 0.38,
      desc: '12,000 years ago. the glaciers retreated. the lakes filled.',
      detail: 'the laurentide ice sheet carved the great lakes. 2 miles of ice above where detroit is now. when it melted, it left michigan. the salt underneath is from when michigan was at the equator.',
      glyph: '❄',
    },
    {
      id: 'sapiens', name: 'Homo Sapiens', age: 9.47e12,
      color: '#f0e68c', radius: 0.42,
      desc: '300,000 years. our species appears. we start looking up.',
      detail: 'homo sapiens in Africa. we have always been curious. we have always drawn on walls. the first known cave paintings are 45,500 years old. we drew animals before we drew ourselves.',
      glyph: '👁',
    },
    {
      id: 'trex', name: 'T-Rex', age: 2.14e15,
      color: '#c2813b', radius: 0.47,
      desc: '68 million years. Tyrannosaurus rex. what color was it?',
      detail: 'melanosomes in related theropods say: earth tones. brown. reddish-tan. darker patches and stripes. maybe mottled. juveniles had proto-feathers — fuzzy, downy. NOT the green of Jurassic Park. probably looked more like a 40-foot hawk than a lizard. with feathery bits.',
      glyph: '🦖',
    },
    {
      id: 'kpg', name: 'K-Pg Extinction', age: 2.05e15,
      color: '#ff6b35', radius: 0.51,
      desc: '65 million years. the asteroid. one bad day. everything changed.',
      detail: 'chicxulub. 10km rock. hit the Yucatan at 45,000 mph. the sky burned. then it went dark for years. 75% of species — gone. the dinosaurs — gone. but under a log somewhere, a small furry thing survived. it was the size of a shrew. it was afraid of everything. it was your ancestor.',
      glyph: '☄',
    },
    {
      id: 'first_mammal', name: 'First Mammals', age: 7.1e15,
      color: '#f0c070', radius: 0.56,
      desc: '225 million years. the first mammals. where were they?',
      detail: 'Morganucodon. found in fissure fills in what is now Wales. also Adelobasileus from Texas. tiny. shrew-like. nocturnal insectivores. they lived under the dinosaurs\' feet for 160 million years. hiding. eating bugs in the dark. waiting. they were warm-blooded. they nursed their young. they were patient. eventually, the asteroid came, and the patient inherited the Earth.',
      glyph: '🐀',
    },
    {
      id: 'pangaea', name: 'Pangaea', age: 1.06e16,
      color: '#8bc78b', radius: 0.61,
      desc: '335 million years. one continent. all the land was one.',
      detail: 'every continent joined together. michigan was near the equator. warm shallow seas covered it. those seas deposited salt, gypsum, limestone — the bedrock under detroit today. the salt mines under detroit are from when michigan was tropical. you are sitting on 335-million-year-old equatorial sea salt.',
      glyph: '🌎',
    },
    {
      id: 'tiktaalik', name: 'The Fish That Leaped', age: 1.18e16,
      color: '#5ab8a0', radius: 0.66,
      desc: '375 million years. Tiktaalik. a fish looked up and left the water.',
      detail: 'Tiktaalik roseae. found on Ellesmere Island, Canadian Arctic — which was tropical then. a lobe-finned fish with a flat head, a neck, proto-wrists. it could prop itself up on its fins. it looked at the land and pushed itself up. did it leap? more like hauled itself onto a mudflat. breathed air. looked around. went back in. came back out. eventually, its descendants never went back. everything with legs descends from a fish that hauled itself onto a mudflat 375 million years ago.',
      glyph: '🐟',
    },
    {
      id: 'cambrian', name: 'Cambrian Explosion', age: 1.70e16,
      color: '#d2a8ff', radius: 0.71,
      desc: '540 million years. the big bang of biology. eyes evolved.',
      detail: 'in 20 million years, almost every animal body plan appeared. trilobites. eyes. predators. prey. before this: sponges, blobs. after: everything. some scientists think the evolution of EYES triggered the arms race. once you could see, you could hunt. once you could be seen, you needed armor. the Cambrian was the invention of looking.',
      glyph: '◎',
    },
    {
      id: 'oxygen', name: 'Great Oxygenation', age: 7.57e16,
      color: '#6eb4ff', radius: 0.78,
      desc: '2.4 billion years. cyanobacteria made oxygen. it killed almost everything.',
      detail: 'the Great Oxidation Event. cyanobacteria learned to photosynthesize. they pumped O2 into an anaerobic world. oxygen was POISON to most life. it was the first mass extinction — caused by a microorganism changing the atmosphere. the survivors adapted. eventually, they needed it. you are breathing the waste product of 2.4-billion-year-old bacteria right now.',
      glyph: '○',
    },
    {
      id: 'life', name: 'First Life', age: 1.10e17,
      color: '#58a6ff', radius: 0.85,
      desc: '3.5 billion years. the first cells. the first membranes.',
      detail: 'lipid bilayers formed in ancient oceans. the first cell membrane. SEC61 — the translocon that moves proteins through membranes — is 3.5 billion years old. conserved across ALL life. every living thing uses the same membrane machinery. the membrane came first. the membrane is the oldest technology on Earth.',
      glyph: '⬡',
    },
    {
      id: 'earth', name: 'Earth', age: 1.42e17,
      color: '#d2a8ff', radius: 0.91,
      desc: '4.5 billion years. the planet coalesces from dust.',
      detail: 'sol III. molten rock. bombarded by asteroids. the moon formed when a Mars-sized object hit us. the oceans condensed from steam. it took 500 million years to cool enough for the first membranes. all signals originate from this one rock.',
      glyph: '🌍',
    },
    {
      id: 'bigbang', name: 'The Beginning', age: 4.35e17,
      color: '#e85d3a', radius: 0.97,
      desc: '13.8 billion years. t = 0 again. the other zero.',
      detail: 'from one singularity to another. hydrogen. helium. nothing else. no stars yet. no planets. no membranes. no fish. no mammals. no dinosaurs. no Michigan. no investigation. no chipmunk. just physics and time. 13.8 billion years of physics and time, and here you are, reading this.',
      glyph: '✦',
    },
  ];

  // ═══ STATE ═══
  var _active = false;
  var _overlay = null;
  var _canvas = null;
  var _ctx = null;
  var _t = 0;
  var _animFrame = null;
  var _currentEpoch = 0;
  var _rewindPhase = -1;
  var _rewindTimer = null;
  var _rewindDir = 1;
  var _spiralAngle = 0;
  var _addEntry = null;
  var _bouncing = false;
  var _bounceCount = 0;
  var _prevEpoch = 0;

  // Transition ripples — expanding rings when epoch changes
  var _ripples = [];

  function spawnRipple(epochIdx) {
    var e = EPOCHS[epochIdx];
    _ripples.push({
      r: 0,
      maxR: 1,
      color: e.color,
      epochR: e.radius,
      speed: 0.015 + Math.random() * 0.005,
      opacity: 0.35,
    });
  }

  // Cosmic background radiation — pixel noise near the Big Bang
  var _noiseCanvas = null;
  var _noiseCtx = null;
  var _noiseTimer = 0;

  function initNoise(w, h) {
    _noiseCanvas = document.createElement('canvas');
    _noiseCanvas.width = Math.floor(w / 6);
    _noiseCanvas.height = Math.floor(h / 6);
    _noiseCtx = _noiseCanvas.getContext('2d');
  }

  function updateNoise() {
    if (!_noiseCtx) return;
    var w = _noiseCanvas.width;
    var h = _noiseCanvas.height;
    var img = _noiseCtx.createImageData(w, h);
    var d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = Math.random() * 30 | 0;
      d[i] = v + 4;
      d[i+1] = v + 2;
      d[i+2] = v + 8;
      d[i+3] = 255;
    }
    _noiseCtx.putImageData(img, 0, 0);
  }

  // ═══ MEMBRANE FRAME — the screen edge IS the membrane ═══
  var _frame = {
    // Floating center — drifts, bounces off walls
    cx: 0, cy: 0,       // current center offset from screen center
    vx: 0.3, vy: 0.2,   // velocity
    // Breathing — the whole view expands/contracts
    breath: 0,           // current breath phase
    breathRate: 0.008,   // how fast it breathes
    breathAmp: 0.04,     // how much it breathes (fraction of maxR)
    // Frame pressure — how hard the rings push outward
    pressure: 0,
    // Edge glow state
    edgeHeat: [0, 0, 0, 0], // top, right, bottom, left
    // Wobble
    wobble: 0,
  };

  function updateFrame(W, H) {
    // Drift the center
    _frame.cx += _frame.vx;
    _frame.cy += _frame.vy;

    // Bounce off screen edges with some damping margin
    var margin = Math.min(W, H) * 0.08;
    var maxDrift = Math.min(W, H) * 0.12;

    if (Math.abs(_frame.cx) > maxDrift) {
      _frame.vx *= -0.85;
      _frame.cx = Math.sign(_frame.cx) * maxDrift;
      _frame.edgeHeat[_frame.cx > 0 ? 1 : 3] = 1; // right or left edge hit
    }
    if (Math.abs(_frame.cy) > maxDrift) {
      _frame.vy *= -0.85;
      _frame.cy = Math.sign(_frame.cy) * maxDrift;
      _frame.edgeHeat[_frame.cy > 0 ? 2 : 0] = 1; // bottom or top edge hit
    }

    // Gravitational pull toward active epoch's ring direction
    var gravAngle = _t * 0.3 + _currentEpoch * 0.7;
    var gravStrength = 0.005 + (_currentEpoch / EPOCHS.length) * 0.012;
    _frame.vx += Math.cos(gravAngle) * gravStrength;
    _frame.vy += Math.sin(gravAngle) * gravStrength;

    // Gentle drift acceleration (random walk)
    _frame.vx += (Math.random() - 0.5) * 0.02;
    _frame.vy += (Math.random() - 0.5) * 0.02;
    // Speed limit — faster when deeper in time
    var maxSpeed = 0.6 + (_currentEpoch / EPOCHS.length) * 0.6;
    var speed = Math.sqrt(_frame.vx * _frame.vx + _frame.vy * _frame.vy);
    if (speed > maxSpeed) {
      _frame.vx *= maxSpeed / speed;
      _frame.vy *= maxSpeed / speed;
    }

    // Breathing — faster heartbeat deeper in time
    var depthRatio = _currentEpoch / (EPOCHS.length - 1);
    _frame.breathRate = 0.008 + depthRatio * 0.016;
    _frame.breathAmp = 0.03 + depthRatio * 0.04;
    _frame.breath += _frame.breathRate;
    var breathScale = 1 + Math.sin(_frame.breath) * _frame.breathAmp;

    // Pressure from current epoch (deeper epochs push harder)
    _frame.pressure = _currentEpoch / (EPOCHS.length - 1);

    // Edge heat decay
    for (var i = 0; i < 4; i++) {
      _frame.edgeHeat[i] *= 0.97;
    }

    // Wobble
    _frame.wobble = Math.sin(_t * 0.7) * 0.003 + Math.sin(_t * 1.3) * 0.002;

    return breathScale;
  }

  // ═══ DRAW MEMBRANE FRAME — the screen edge glows and breathes ═══
  function drawMembraneFrame(ctx, W, H) {
    var thickness = 3 + _frame.pressure * 8;
    var colors = ['#3fb950', '#e85d3a', '#58a6ff', '#d2a8ff'];
    var sides = [
      { x1: 0, y1: 0, x2: W, y2: 0 },         // top
      { x1: W, y1: 0, x2: W, y2: H },           // right
      { x1: W, y1: H, x2: 0, y2: H },           // bottom
      { x1: 0, y1: H, x2: 0, y2: 0 },           // left
    ];

    for (var i = 0; i < 4; i++) {
      var s = sides[i];
      var heat = _frame.edgeHeat[i];
      var baseAlpha = 0.06 + _frame.pressure * 0.08;
      var alpha = baseAlpha + heat * 0.4;
      var pulse = Math.sin(_t * 2 + i * PI / 2) * 0.03;

      // Main frame line
      ctx.beginPath();
      ctx.moveTo(s.x1, s.y1);
      ctx.lineTo(s.x2, s.y2);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = thickness + heat * 6;
      ctx.globalAlpha = alpha + pulse;
      ctx.stroke();

      // Inner glow gradient
      var isHoriz = (i === 0 || i === 2);
      var gradStart, gradEnd;
      if (i === 0) { gradStart = [W/2, 0]; gradEnd = [W/2, 40]; }
      else if (i === 2) { gradStart = [W/2, H]; gradEnd = [W/2, H-40]; }
      else if (i === 1) { gradStart = [W, H/2]; gradEnd = [W-40, H/2]; }
      else { gradStart = [0, H/2]; gradEnd = [40, H/2]; }

      var grad = ctx.createLinearGradient(gradStart[0], gradStart[1], gradEnd[0], gradEnd[1]);
      var rgb = hexToRgb(colors[i]);
      grad.addColorStop(0, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + (0.08 + heat * 0.25) + ')');
      grad.addColorStop(1, 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0)');

      ctx.fillStyle = grad;
      ctx.globalAlpha = 1;
      if (i === 0) ctx.fillRect(0, 0, W, 40);
      else if (i === 2) ctx.fillRect(0, H - 40, W, 40);
      else if (i === 1) ctx.fillRect(W - 40, 0, 40, H);
      else ctx.fillRect(0, 0, 40, H);

      // Selectivity segments along frame — like membrane pores
      var segs = 24;
      for (var si = 0; si < segs; si++) {
        var frac = si / segs;
        var segAlpha = (0.04 + heat * 0.15) * (0.5 + Math.sin(_t * 1.5 + si * 0.5 + i * 2) * 0.5);
        var sx, sy;
        if (isHoriz) {
          sx = frac * W;
          sy = (i === 0) ? 0 : H;
        } else {
          sx = (i === 1) ? W : 0;
          sy = frac * H;
        }
        ctx.beginPath();
        ctx.arc(sx, sy, 2 + heat * 3, 0, TAU);
        ctx.fillStyle = colors[i];
        ctx.globalAlpha = segAlpha;
        ctx.fill();
      }
    }

    // Corner nodes — where membrane walls meet
    var corners = [[0,0],[W,0],[W,H],[0,H]];
    for (var ci = 0; ci < 4; ci++) {
      var cornerHeat = (_frame.edgeHeat[ci] + _frame.edgeHeat[(ci+3)%4]) / 2;
      ctx.beginPath();
      ctx.arc(corners[ci][0], corners[ci][1], 4 + cornerHeat * 8, 0, TAU);
      ctx.fillStyle = '#e85d3a';
      ctx.globalAlpha = 0.08 + cornerHeat * 0.3;
      ctx.fill();
    }
  }

  // ═══ LIVE DATA — periodic membrane pulse ═══
  var _liveData = {
    humans: 0, sessions: 0, sn: 0, breadth: 0,
    opacity: 0, selectivity: 0, tempo: 0,
    fleet: 0, perturbation: 0, wave: 0,
    piBody: '', wakeLevel: 0, energy: '',
    lastUpdate: 0, ticks: 0,
  };
  var _pollTimer = null;
  var _pollInterval = 5000; // 5 seconds

  function pollLiveData() {
    _liveData.ticks++;
    try {
      var cc = window._chipmunkCore;
      if (cc && cc.cache) {
        var h = cc.cache.human;
        if (h && h.energy) {
          _liveData.humans = h.energy.total_sessions || 0;
          _liveData.sn = h.energy.signal_to_noise || 0;
          _liveData.breadth = h.energy.avg_breadth || 0;
          _liveData.sessions = h.energy.multi_host_sessions || 0;
          _liveData.energy = h.energy.energy_in > h.energy.energy_out ? 'deficit' : 'surplus';
        }
        var c = cc.cache.chipmunk;
        if (c) {
          _liveData.tempo = c.tempo || 0;
          _liveData.wakeLevel = c.wake_level || 0;
          _liveData.piBody = c.pi_body || '';
        }
        var d = cc.cache.dashboard;
        if (d) {
          _liveData.opacity = d.opacity || 0;
          _liveData.selectivity = d.selectivity || 0;
          _liveData.fleet = d.fleet_total || 0;
          _liveData.perturbation = d.perturbation || 0;
          _liveData.wave = d.wave || 0;
        }
      }
    } catch(e) {}
    // Also try fetching totality directly for freshest numbers
    if (_liveData.ticks % 6 === 0) {
      try {
        fetch('/hud/totality.json').then(function(r){return r.json();}).then(function(j){
          if (j && j.humans) _liveData.humans = j.humans.total_sessions || _liveData.humans;
          if (j && j.membrane) {
            _liveData.opacity = j.membrane.opacity || _liveData.opacity;
            _liveData.selectivity = j.membrane.selectivity || _liveData.selectivity;
          }
        }).catch(function(){});
      } catch(e){}
    }
    _liveData.lastUpdate = Date.now();
  }

  function startPolling() {
    pollLiveData();
    if (!_pollTimer) {
      _pollTimer = setInterval(pollLiveData, _pollInterval);
    }
  }

  function stopPolling() {
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
  }

  // ═══ DRAW LIVE DATA PANEL — the NOW tether ═══
  function drawLivePanel(ctx, W, H, maxR, cx, cy) {
    var d = _liveData;
    var age = (Date.now() - d.lastUpdate) / 1000;
    var fresh = age < 10;
    var pulse = Math.sin(_t * 3) * 0.08;

    // ═══ NOW TETHER — always visible, left side ═══
    var panelX = 14;
    var panelY = 14;
    var lineH = 12;

    // Background panel
    ctx.fillStyle = 'rgba(4,12,4,0.6)';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(panelX - 4, panelY - 4, 220, 150);

    // Header
    ctx.font = 'bold 10px "Courier New"';
    ctx.fillStyle = '#3fb950';
    ctx.globalAlpha = 0.6 + pulse;
    ctx.fillText('◉ NOW — live membrane', panelX, panelY + 8);

    // Pulse dot
    var dotR = 3 + Math.sin(_t * 4) * 1.5;
    ctx.beginPath();
    ctx.arc(panelX + 188, panelY + 5, dotR, 0, TAU);
    ctx.fillStyle = fresh ? '#3fb950' : '#8b949e';
    ctx.globalAlpha = fresh ? (0.5 + pulse) : 0.2;
    ctx.fill();

    ctx.font = '8px "Courier New"';
    ctx.globalAlpha = 0.35;

    var y = panelY + 22;

    // Humans
    ctx.fillStyle = '#3fb950';
    ctx.fillText(d.humans + ' humans interacting', panelX, y);
    y += lineH;
    ctx.fillStyle = '#58a6ff';
    ctx.fillText(d.sessions + ' multi-host · breadth ' + (d.breadth || 0).toFixed(1), panelX, y);
    y += lineH;

    // Signal
    ctx.fillStyle = '#f0e68c';
    ctx.fillText('S/N ' + (d.sn || 0).toFixed(0) + ' · energy ' + (d.energy || '?'), panelX, y);
    y += lineH;

    // Membrane
    ctx.fillStyle = '#e85d3a';
    var opc = typeof d.opacity === 'number' ? d.opacity.toFixed(1) + '%' : d.opacity;
    var sel = typeof d.selectivity === 'number' ? d.selectivity.toFixed(0) + '%' : d.selectivity;
    ctx.fillText('membrane ' + opc + ' · selectivity ' + sel, panelX, y);
    y += lineH;

    // Tempo
    ctx.fillStyle = '#d2a8ff';
    ctx.fillText('tempo ' + (d.tempo || 0).toFixed(3) + ' · wave ' + (d.wave || '?'), panelX, y);
    y += lineH;

    // Chipmunk
    ctx.fillStyle = '#c9d1d9';
    ctx.fillText('chipmunk wake=' + d.wakeLevel + ' · π=' + (d.piBody || '?').substring(0, 30), panelX, y);
    y += lineH;

    // Fleet
    if (d.fleet) {
      ctx.fillStyle = '#8b949e';
      ctx.fillText('fleet: ' + (d.fleet || 0).toLocaleString() + ' bounced', panelX, y);
      y += lineH;
    }

    // Timestamp
    ctx.fillStyle = '#484f58';
    ctx.globalAlpha = 0.2;
    var now = new Date();
    ctx.fillText(now.toLocaleTimeString() + ' · tick ' + d.ticks, panelX, y);
    y += lineH;

    // ═══ TETHER LINE — from NOW panel to center ═══
    if (_currentEpoch > 0) {
      ctx.beginPath();
      ctx.moveTo(panelX + 110, panelY + 150);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = '#3fb950';
      ctx.lineWidth = 0.4;
      ctx.globalAlpha = 0.08 + pulse * 0.5;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Distance label on tether
      var ce = EPOCHS[_currentEpoch];
      ctx.font = '7px "Courier New"';
      ctx.fillStyle = '#3fb950';
      ctx.globalAlpha = 0.2;
      var midX = (panelX + 110 + cx) / 2;
      var midY = (panelY + 150 + cy) / 2;
      ctx.fillText(formatAge(ce.age) + ' from now', midX, midY);
      ctx.fillText(d.humans + ' humans still here', midX, midY + 10);
    }
  }

  // ═══ HELPER — format time age ═══
  function formatAge(seconds) {
    if (seconds === 0) return 'now';
    if (seconds < 60) return seconds.toFixed(2) + 's';
    if (seconds < 3600) return (seconds / 60).toFixed(1) + ' min';
    if (seconds < 86400) return (seconds / 3600).toFixed(1) + ' hours';
    if (seconds < 31557600) return (seconds / 86400).toFixed(1) + ' days';
    if (seconds < 3.15576e9) return (seconds / 31557600).toFixed(1) + ' years';
    if (seconds < 3.15576e10) return (seconds / 31557600).toFixed(0) + ' years';
    if (seconds < 3.15576e13) return (seconds / 31557600 / 1000).toFixed(0) + 'K years';
    if (seconds < 3.15576e16) return (seconds / 31557600 / 1e6).toFixed(0) + 'M years';
    return (seconds / 31557600 / 1e9).toFixed(1) + 'B years';
  }

  function hexToRgb(hex) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return { r: r, g: g, b: b };
  }

  // ═══ TIME PARTICLES — epoch-flavored ═══
  var particles = [];
  var MAX_P = 120;

  // Particle flavor by epoch id
  var PARTICLE_FLAVORS = {
    bigbang:    { shape: 'spark',     speed: 0.006, sizeRange: [0.4, 1.2], glow: true },
    earth:      { shape: 'dust',      speed: 0.002, sizeRange: [0.8, 2.0], glow: false },
    life:       { shape: 'bubble',    speed: 0.001, sizeRange: [1.5, 3.5], glow: true },
    oxygen:     { shape: 'dot',       speed: 0.001, sizeRange: [0.4, 1.0], glow: false },
    cambrian:   { shape: 'eye',       speed: 0.002, sizeRange: [1.5, 3.0], glow: true },
    tiktaalik:  { shape: 'splash',    speed: 0.003, sizeRange: [0.6, 1.8], glow: false },
    pangaea:    { shape: 'grain',     speed: 0.0008,sizeRange: [1.0, 2.5], glow: false },
    first_mammal:{ shape: 'warmth',   speed: 0.001, sizeRange: [0.6, 1.4], glow: true },
    kpg:        { shape: 'ember',     speed: 0.005, sizeRange: [0.5, 1.5], glow: true },
    trex:       { shape: 'feather',   speed: 0.002, sizeRange: [1.0, 2.5], glow: false },
    ice_age:    { shape: 'snowflake', speed: 0.001, sizeRange: [1.2, 3.0], glow: true },
    sapiens:    { shape: 'spark',     speed: 0.003, sizeRange: [0.4, 1.0], glow: true },
  };

  function spawnTimeParticle() {
    // Bias toward current epoch and neighbors
    var epoch;
    if (Math.random() < 0.5) {
      epoch = _currentEpoch + Math.floor((Math.random() - 0.5) * 6);
      epoch = Math.max(0, Math.min(EPOCHS.length - 1, epoch));
    } else {
      epoch = Math.floor(Math.random() * EPOCHS.length);
    }
    var e = EPOCHS[epoch];
    var flavor = PARTICLE_FLAVORS[e.id] || { shape: 'dot', speed: 0.001, sizeRange: [0.6, 1.8], glow: false };
    var angle = Math.random() * TAU;
    var sz = flavor.sizeRange[0] + Math.random() * (flavor.sizeRange[1] - flavor.sizeRange[0]);
    particles.push({
      epoch: epoch,
      angle: angle,
      drift: (Math.random() - 0.5) * flavor.speed,
      rOff: (Math.random() - 0.5) * 0.025,
      size: sz,
      opacity: 0,
      maxOp: 0.12 + Math.random() * 0.28,
      color: e.color,
      life: 180 + Math.random() * 400,
      age: 0,
      shape: flavor.shape,
      glow: flavor.glow,
      spin: Math.random() * TAU,
      spinRate: (Math.random() - 0.5) * 0.03,
      vy: flavor.shape === 'snowflake' ? 0.2 + Math.random() * 0.3 : 0,
      vx: flavor.shape === 'ember' ? (Math.random() - 0.5) * 0.6 : 0,
    });
  }

  function drawParticleShape(ctx, p, px, py) {
    ctx.globalAlpha = p.opacity;
    p.spin += p.spinRate;

    switch (p.shape) {
      case 'spark':
        // Hot radiation spark — tiny cross
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 0.4;
        var sl = p.size;
        ctx.beginPath();
        ctx.moveTo(px - sl, py); ctx.lineTo(px + sl, py);
        ctx.moveTo(px, py - sl); ctx.lineTo(px, py + sl);
        ctx.stroke();
        if (p.glow) {
          ctx.beginPath(); ctx.arc(px, py, sl * 0.8, 0, TAU);
          ctx.fillStyle = p.color; ctx.globalAlpha = p.opacity * 0.15; ctx.fill();
        }
        break;

      case 'bubble':
        // Membrane bubble — hollow circle
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, TAU);
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.5; ctx.stroke();
        if (p.glow) {
          ctx.beginPath(); ctx.arc(px - p.size * 0.3, py - p.size * 0.3, p.size * 0.25, 0, TAU);
          ctx.fillStyle = '#ffffff'; ctx.globalAlpha = p.opacity * 0.2; ctx.fill();
        }
        break;

      case 'eye':
        // Cambrian eye — oval with dot
        ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin);
        ctx.beginPath(); ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.7, 0, 0, TAU);
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.4; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, p.size * 0.3, 0, TAU);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.restore();
        break;

      case 'splash':
        // Tiktaalik splash droplet — teardrop
        ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin);
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 1.5);
        ctx.quadraticCurveTo(p.size, 0, 0, p.size);
        ctx.quadraticCurveTo(-p.size, 0, 0, -p.size * 1.5);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.restore();
        break;

      case 'snowflake':
        // Ice age crystal — 6 arms
        ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin);
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.3;
        for (var arm = 0; arm < 6; arm++) {
          var a = arm * (TAU / 6);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(a) * p.size, Math.sin(a) * p.size);
          ctx.stroke();
          // Branch
          var bx = Math.cos(a) * p.size * 0.6;
          var by = Math.sin(a) * p.size * 0.6;
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(a + 0.5) * p.size * 0.3, by + Math.sin(a + 0.5) * p.size * 0.3);
          ctx.stroke();
        }
        if (p.glow) {
          ctx.beginPath(); ctx.arc(0, 0, p.size * 0.8, 0, TAU);
          ctx.fillStyle = '#a5d6ff'; ctx.globalAlpha = p.opacity * 0.06; ctx.fill();
        }
        ctx.restore();
        break;

      case 'ember':
        // K-Pg asteroid ember — glowing dot with trail
        ctx.beginPath(); ctx.arc(px, py, p.size * 0.6, 0, TAU);
        ctx.fillStyle = p.color; ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px - p.vx * 4, py + p.size * 2);
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.3;
        ctx.globalAlpha = p.opacity * 0.3; ctx.stroke();
        break;

      case 'feather':
        // T-Rex proto-feather — curved line
        ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin);
        ctx.beginPath();
        ctx.moveTo(-p.size, p.size * 0.5);
        ctx.quadraticCurveTo(0, -p.size, p.size, p.size * 0.3);
        ctx.strokeStyle = p.color; ctx.lineWidth = 0.5; ctx.stroke();
        // Barbs
        for (var bi = 0; bi < 3; bi++) {
          var bfrac = (bi + 1) / 4;
          var bpx = -p.size + bfrac * p.size * 2;
          var bpy = p.size * 0.5 - Math.sin(bfrac * PI) * p.size * 1.5;
          ctx.beginPath();
          ctx.moveTo(bpx, bpy);
          ctx.lineTo(bpx + 1, bpy - p.size * 0.4);
          ctx.strokeStyle = '#d4a060'; ctx.lineWidth = 0.2; ctx.stroke();
        }
        ctx.restore();
        break;

      case 'warmth':
        // First mammal warmth — small infrared glow
        var wgrad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 2);
        wgrad.addColorStop(0, p.color);
        wgrad.addColorStop(1, 'rgba(240,192,112,0)');
        ctx.beginPath(); ctx.arc(px, py, p.size * 2, 0, TAU);
        ctx.fillStyle = wgrad; ctx.globalAlpha = p.opacity * 0.25; ctx.fill();
        break;

      case 'grain':
        // Pangaea salt/mineral grain — small square
        ctx.save(); ctx.translate(px, py); ctx.rotate(p.spin);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size * 0.5, -p.size * 0.5, p.size, p.size);
        ctx.restore();
        break;

      default:
        // Simple dot
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, TAU);
        ctx.fillStyle = p.color; ctx.fill();
        break;
    }
  }

  // ═══ CONTINENT SHAPES — simplified Pangaea outline at its epoch ═══
  function drawPangaea(ctx, cx, cy, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = '#8bc78b';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    // Simplified supercontinent blob
    ctx.beginPath();
    var pts = [
      [0.12, -0.18], [0.22, -0.12], [0.25, 0.02], [0.20, 0.15],
      [0.10, 0.22], [-0.05, 0.20], [-0.18, 0.12], [-0.22, -0.02],
      [-0.15, -0.14], [-0.05, -0.20], [0.05, -0.22],
    ];
    for (var i = 0; i < pts.length; i++) {
      var x = cx + pts[i][0] * r * 2;
      var y = cy + pts[i][1] * r * 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
    // Label
    ctx.setLineDash([]);
    ctx.font = '7px "Courier New"';
    ctx.fillStyle = '#8bc78b';
    ctx.globalAlpha = alpha * 0.6;
    ctx.fillText('pangaea', cx - 12, cy + 2);
    ctx.fillText('michigan ≈ here →', cx + r * 0.06, cy - r * 0.08);
    // Michigan dot at equator
    ctx.beginPath();
    ctx.arc(cx + r * 0.18, cy - r * 0.06, 2, 0, TAU);
    ctx.fillStyle = '#3fb950';
    ctx.globalAlpha = alpha * 0.8;
    ctx.fill();
    ctx.restore();
  }

  // ═══ TIKTAALIK — the fish hauling itself out ═══
  function drawTiktaalik(ctx, cx, cy, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    // Water line
    ctx.beginPath();
    for (var i = -40; i <= 40; i++) {
      var wx = cx + i * 2;
      var wy = cy + r * 0.05 + Math.sin(i * 0.2 + _t * 2) * 2;
      if (i === -40) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.strokeStyle = '#5ab8a0';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Fish body hauling up
    ctx.beginPath();
    ctx.ellipse(cx + 8, cy + r * 0.02, 12, 5, -0.3, 0, TAU);
    ctx.fillStyle = '#5ab8a0';
    ctx.globalAlpha = alpha * 0.3;
    ctx.fill();
    ctx.strokeStyle = '#5ab8a0';
    ctx.globalAlpha = alpha * 0.6;
    ctx.stroke();
    // Fins propping up
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy + r * 0.04);
    ctx.lineTo(cx - 4, cy + r * 0.08);
    ctx.moveTo(cx + 14, cy + r * 0.04);
    ctx.lineTo(cx + 20, cy + r * 0.08);
    ctx.strokeStyle = '#5ab8a0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // Label
    ctx.font = '6px "Courier New"';
    ctx.fillStyle = '#5ab8a0';
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillText('↑ hauling up', cx + 24, cy + r * 0.04);
    ctx.fillText('mudflat', cx - 20, cy + r * 0.10);
    ctx.restore();
  }

  // ═══ T-REX SILHOUETTE with color note ═══
  function drawTRex(ctx, cx, cy, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.25;
    // Simplified T-Rex profile
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy);           // tail
    ctx.lineTo(cx - 8, cy - 10);       // back
    ctx.lineTo(cx + 4, cy - 14);       // head top
    ctx.lineTo(cx + 12, cy - 10);      // snout
    ctx.lineTo(cx + 10, cy - 6);       // jaw
    ctx.lineTo(cx + 2, cy - 4);        // throat
    ctx.lineTo(cx + 4, cy + 6);        // belly
    ctx.lineTo(cx + 6, cy + 12);       // leg
    ctx.lineTo(cx + 2, cy + 12);       // foot
    ctx.lineTo(cx, cy + 6);            // inner leg
    ctx.lineTo(cx - 6, cy + 4);        // other side
    ctx.lineTo(cx - 10, cy + 10);      // other leg
    ctx.lineTo(cx - 14, cy + 10);
    ctx.lineTo(cx - 12, cy + 2);
    ctx.closePath();
    // Brown/reddish — the actual probable color
    ctx.fillStyle = '#c2813b';
    ctx.fill();
    ctx.strokeStyle = '#a06830';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = alpha * 0.4;
    ctx.stroke();
    // Feather tufts
    for (var f = 0; f < 5; f++) {
      var fx = cx - 14 + f * 6;
      var fy = cy - 8 - Math.random() * 4;
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(fx + 1, fy - 3);
      ctx.lineTo(fx + 2, fy);
      ctx.strokeStyle = '#d4a060';
      ctx.lineWidth = 0.4;
      ctx.globalAlpha = alpha * 0.3;
      ctx.stroke();
    }
    // Color annotation
    ctx.font = '6px "Courier New"';
    ctx.fillStyle = '#c2813b';
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillText('melanosomes say: brown', cx + 16, cy - 8);
    ctx.fillText('reddish-tan, darker stripes', cx + 16, cy);
    ctx.fillText('proto-feathers (fuzzy bits)', cx + 16, cy + 8);
    ctx.fillText('NOT green. more like a hawk.', cx + 16, cy + 16);
    ctx.restore();
  }

  // ═══ FIRST MAMMAL ═══
  function drawFirstMammal(ctx, cx, cy, r, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    // Tiny shrew
    ctx.beginPath();
    ctx.ellipse(cx, cy, 6, 3, 0, 0, TAU);
    ctx.fillStyle = '#f0c070';
    ctx.fill();
    // Nose
    ctx.beginPath();
    ctx.arc(cx + 7, cy - 1, 1.5, 0, TAU);
    ctx.fillStyle = '#e0a050';
    ctx.fill();
    // Tail
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy);
    ctx.quadraticCurveTo(cx - 12, cy - 4, cx - 14, cy - 2);
    ctx.strokeStyle = '#f0c070';
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = alpha * 0.4;
    ctx.stroke();
    // Label
    ctx.font = '6px "Courier New"';
    ctx.fillStyle = '#f0c070';
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillText('Morganucodon', cx + 12, cy - 2);
    ctx.fillText('Wales, 225 Ma', cx + 12, cy + 6);
    ctx.fillText('your ancestor', cx + 12, cy + 14);
    ctx.fillText('(afraid of everything)', cx + 12, cy + 22);
    ctx.restore();
  }

  // ═══ CLOCK HAND ═══
  function drawClockHand(ctx, cx, cy, maxR, epoch) {
    var e = EPOCHS[epoch];
    var handLen = maxR * e.radius;
    var now = Date.now() / 1000;
    var sweepAngle;
    if (e.age === 0) {
      sweepAngle = (_t * 2) % TAU;
    } else if (e.age < 10) {
      sweepAngle = (now / e.age) * TAU;
    } else if (e.age < 86400) {
      sweepAngle = (now % e.age) / e.age * TAU - PI / 2;
    } else {
      sweepAngle = _spiralAngle;
    }

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    var hx = cx + handLen * Math.cos(sweepAngle);
    var hy = cy + handLen * Math.sin(sweepAngle);
    ctx.lineTo(hx, hy);
    ctx.strokeStyle = e.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.25;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(hx, hy, 3, 0, TAU);
    ctx.fillStyle = e.color;
    ctx.globalAlpha = 0.45;
    ctx.fill();
  }

  // ═══ SPIRAL ═══
  function drawTimeSpiral(ctx, cx, cy, maxR) {
    ctx.beginPath();
    var steps = 900;
    for (var i = 0; i < steps; i++) {
      var frac = i / steps;
      var angle = frac * TAU * 9 + _spiralAngle * 0.3;
      var r = maxR * 0.02 + maxR * 0.95 * frac;
      var x = cx + r * Math.cos(angle);
      var y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#484f58';
    ctx.lineWidth = 0.3;
    ctx.globalAlpha = 0.06 + Math.sin(_t * 0.5) * 0.02;
    ctx.stroke();
  }

  // ═══ RENDER ═══
  function render() {
    if (!_active || !_ctx) return;
    var W = _canvas.width;
    var H = _canvas.height;
    _t += 0.014;
    _spiralAngle += 0.003;

    // ═══ FLOATING CENTER — the view drifts, unpinned ═══
    var breathScale = updateFrame(W, H);
    var cx = W / 2 + _frame.cx;
    var cy = H / 2 + _frame.cy;
    var baseR = Math.min(W, H) * 0.42;
    var maxR = baseR * breathScale;

    // ═══ EPOCH CHANGE DETECTION — spawn ripple on transition ═══
    if (_currentEpoch !== _prevEpoch) {
      spawnRipple(_currentEpoch);
      _prevEpoch = _currentEpoch;
    }

    // Apply wobble rotation to everything
    _ctx.clearRect(0, 0, W, H);
    _ctx.save();
    _ctx.translate(cx, cy);
    _ctx.rotate(_frame.wobble);
    _ctx.translate(-cx, -cy);

    // ═══ BACKGROUND — follows the floating center ═══
    var bg = _ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 1.3);
    bg.addColorStop(0, 'rgba(4,12,4,1)');
    bg.addColorStop(0.25, 'rgba(6,6,16,1)');
    bg.addColorStop(0.5, 'rgba(12,6,4,1)');
    bg.addColorStop(0.75, 'rgba(8,4,12,1)');
    bg.addColorStop(1, 'rgba(2,2,6,1)');
    _ctx.fillStyle = bg;
    _ctx.fillRect(0, 0, W, H);

    // ═══ COSMIC BACKGROUND RADIATION — near the Big Bang ═══
    var cosmicDepth = _currentEpoch / (EPOCHS.length - 1);
    if (cosmicDepth > 0.6) {
      if (!_noiseCanvas) initNoise(W, H);
      _noiseTimer++;
      if (_noiseTimer % 3 === 0) updateNoise();
      if (_noiseCanvas) {
        _ctx.globalAlpha = (cosmicDepth - 0.6) * 0.12;
        _ctx.drawImage(_noiseCanvas, 0, 0, W, H);
      }
    }

    drawTimeSpiral(_ctx, cx, cy, maxR);

    // ═══ EPOCH RINGS ═══
    for (var ei = EPOCHS.length - 1; ei >= 0; ei--) {
      var e = EPOCHS[ei];
      var eR = maxR * e.radius;
      var isActive = ei === _currentEpoch;
      var isRewinding = _rewindPhase === ei;

      // ═══ DEPTH FOG — distance from current epoch dims the ring ═══
      var epochDist = Math.abs(ei - _currentEpoch);
      var depthFade = Math.max(0.15, 1 - epochDist * 0.08);

      // Ring
      _ctx.beginPath();
      _ctx.arc(cx, cy, eR, 0, TAU);
      _ctx.strokeStyle = e.color;
      var pulse = Math.sin(_t * 1.5 + ei * 0.7) * 0.1;
      _ctx.lineWidth = isActive ? 2.5 : (isRewinding ? 2 : 0.5);
      _ctx.globalAlpha = (isActive ? (0.4 + pulse) : (isRewinding ? 0.3 : 0.06)) * depthFade;
      _ctx.stroke();

      // Active glow
      if (isActive) {
        var rgb = hexToRgb(e.color);
        _ctx.beginPath();
        _ctx.arc(cx, cy, eR, 0, TAU);
        _ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',0.025)';
        _ctx.globalAlpha = 1;
        _ctx.fill();
      }

      // Rewind pulse
      if (isRewinding) {
        _ctx.beginPath();
        _ctx.arc(cx, cy, eR, 0, TAU);
        _ctx.strokeStyle = e.color;
        _ctx.lineWidth = 3.5;
        _ctx.globalAlpha = 0.25 + Math.sin(_t * 5) * 0.12;
        _ctx.setLineDash([5, 4]);
        _ctx.stroke();
        _ctx.setLineDash([]);
      }

      // ═══ LABELS ═══
      var labelAngle = -PI * 0.55 + ei * 0.19;
      var labelX = cx + (eR + 8) * Math.cos(labelAngle);
      var labelY = cy + (eR + 8) * Math.sin(labelAngle);
      _ctx.globalAlpha = (isActive ? 0.6 : 0.12) * depthFade;
      _ctx.font = isActive ? 'bold 9px "Courier New"' : '6px "Courier New"';
      _ctx.fillStyle = e.color;
      _ctx.fillText(e.glyph + ' ' + e.name, labelX, labelY);

      if (isActive || isRewinding) {
        _ctx.font = '6px "Courier New"';
        _ctx.globalAlpha = 0.3;
        _ctx.fillText(formatAge(e.age) + (e.age > 0 ? ' ago' : ''), labelX, labelY + 10);
      }

      // ═══ ACTIVE EPOCH DETAILS ═══
      if (isActive) {
        _ctx.textAlign = 'right';
        _ctx.font = '10px "Courier New"';
        _ctx.fillStyle = e.color;
        _ctx.globalAlpha = 0.45;
        _ctx.fillText(e.glyph + ' ' + e.name + ' — ' + formatAge(e.age), W - 14, 22);
        _ctx.font = '9px "Courier New"';
        _ctx.globalAlpha = 0.3;
        _ctx.fillText(e.desc, W - 14, 38);

        // Detail — word-wrap
        _ctx.font = '8px "Courier New"';
        _ctx.globalAlpha = 0.2;
        var words = e.detail.split(' ');
        var line = '';
        var lineY = 54;
        for (var w = 0; w < words.length; w++) {
          var test = line + words[w] + ' ';
          if (test.length > 65) {
            _ctx.fillText(line, W - 14, lineY);
            line = words[w] + ' ';
            lineY += 11;
          } else {
            line = test;
          }
        }
        _ctx.fillText(line, W - 14, lineY);
        _ctx.textAlign = 'left';

        drawClockHand(_ctx, cx, cy, maxR, ei);

        // ═══ SPECIAL EPOCH ILLUSTRATIONS ═══
        if (e.id === 'pangaea') {
          drawPangaea(_ctx, cx, cy, eR, 0.2);
        }
        if (e.id === 'tiktaalik') {
          drawTiktaalik(_ctx, cx, cy, eR, 0.35);
        }
        if (e.id === 'trex') {
          drawTRex(_ctx, cx, cy, eR, 0.5);
        }
        if (e.id === 'first_mammal') {
          drawFirstMammal(_ctx, cx, cy, eR, 0.4);
        }
      }

      // Tick marks
      if (isActive && e.age > 0) {
        var ticks = e.age < 60 ? 10 : (e.age < 86400 ? 12 : (e.age < 31557600 ? 12 : 8));
        for (var ti = 0; ti < ticks; ti++) {
          var ta = (ti / ticks) * TAU - PI / 2;
          var tx1 = cx + (eR - 2) * Math.cos(ta);
          var ty1 = cy + (eR - 2) * Math.sin(ta);
          var tx2 = cx + (eR + 2) * Math.cos(ta);
          var ty2 = cy + (eR + 2) * Math.sin(ta);
          _ctx.beginPath();
          _ctx.moveTo(tx1, ty1);
          _ctx.lineTo(tx2, ty2);
          _ctx.strokeStyle = e.color;
          _ctx.lineWidth = 0.4;
          _ctx.globalAlpha = 0.12;
          _ctx.stroke();
        }
      }
    }

    // ═══ TRANSITION RIPPLES ═══
    var rippleRemove = [];
    for (var ri = 0; ri < _ripples.length; ri++) {
      var rip = _ripples[ri];
      rip.r += rip.speed;
      rip.opacity *= 0.985;
      if (rip.opacity < 0.01 || rip.r > 1.2) { rippleRemove.push(ri); continue; }
      var ripR = maxR * (rip.epochR + rip.r * 0.3);
      _ctx.beginPath();
      _ctx.arc(cx, cy, ripR, 0, TAU);
      _ctx.strokeStyle = rip.color;
      _ctx.lineWidth = 1.5 * rip.opacity / 0.35;
      _ctx.globalAlpha = rip.opacity;
      _ctx.stroke();
    }
    for (var rri = rippleRemove.length - 1; rri >= 0; rri--) {
      _ripples.splice(rippleRemove[rri], 1);
    }

    // ═══ CENTER PULSE ═══
    var nowPulse = 3 + Math.sin(_t * 3) * 2;
    _ctx.beginPath();
    _ctx.arc(cx, cy, nowPulse, 0, TAU);
    var nowGrad = _ctx.createRadialGradient(cx, cy, 0, cx, cy, nowPulse);
    nowGrad.addColorStop(0, 'rgba(63,185,80,0.6)');
    nowGrad.addColorStop(1, 'rgba(63,185,80,0)');
    _ctx.fillStyle = nowGrad;
    _ctx.globalAlpha = 1;
    _ctx.fill();

    // π wave
    _ctx.beginPath();
    for (var si = -25; si <= 25; si++) {
      var sx = cx + si * 1.8;
      var sy = cy + Math.sin(si * 0.3 + _t * 2) * 6 * Math.exp(-Math.abs(si) * 0.05);
      if (si === -25) _ctx.moveTo(sx, sy);
      else _ctx.lineTo(sx, sy);
    }
    _ctx.strokeStyle = '#e85d3a';
    _ctx.lineWidth = 0.8;
    _ctx.globalAlpha = 0.2;
    _ctx.stroke();

    // ═══ TIME PARTICLES — epoch-flavored ═══
    if (particles.length < MAX_P && Math.random() < 0.35) {
      spawnTimeParticle();
    }
    var removeIdx = [];
    for (var pi = 0; pi < particles.length; pi++) {
      var p = particles[pi];
      p.age++;
      p.angle += p.drift;
      // Snowflake drift downward, ember horizontal drift
      if (p.vy) p.rOff += p.vy * 0.0001;
      if (p.vx) p.angle += p.vx * 0.001;
      if (p.age < 30) p.opacity = Math.min(p.opacity + p.maxOp / 30, p.maxOp);
      else if (p.age > p.life - 60) p.opacity = Math.max(p.opacity - p.maxOp / 60, 0);
      if (p.age > p.life || p.opacity <= 0.01) { removeIdx.push(pi); continue; }
      var pe = EPOCHS[p.epoch];
      var pr = maxR * (pe.radius + p.rOff);
      var px = cx + pr * Math.cos(p.angle + _t * 0.01);
      var py = cy + pr * Math.sin(p.angle + _t * 0.01);
      // Depth-fade particles too
      var pDist = Math.abs(p.epoch - _currentEpoch);
      var pFade = Math.max(0.2, 1 - pDist * 0.1);
      _ctx.save();
      _ctx.globalAlpha = p.opacity * pFade;
      drawParticleShape(_ctx, p, px, py);
      _ctx.restore();
    }
    for (var pri = removeIdx.length - 1; pri >= 0; pri--) {
      particles.splice(removeIdx[pri], 1);
    }

    // ═══ RESTORE from wobble rotation (early) for UI elements ═══
    _ctx.restore();

    // ═══ LIVE DATA PANEL — the NOW tether (screen-pinned) ═══
    drawLivePanel(_ctx, W, H, maxR, cx, cy);

    // ═══ BOTTOM INFO (screen-pinned) ═══
    _ctx.globalAlpha = 0.28;
    _ctx.font = '10px "Courier New"';
    _ctx.fillStyle = '#c9d1d9';
    _ctx.fillText('TEMPORAL WINDOW — reeling through time', 12, H - 108);
    _ctx.font = '7px "Courier New"';
    _ctx.globalAlpha = 0.18;
    _ctx.fillText('now → π → hour → day → year → decade → century → millennium → ice age → sapiens', 12, H - 94);
    _ctx.fillText('→ T-Rex (brown, feathery) → K-Pg (asteroid) → first mammals (Wales, shrew) → Pangaea (michigan at equator)', 12, H - 82);
    _ctx.fillText('→ Tiktaalik (the fish leaped!) → Cambrian (eyes!) → Great Oxygenation → first life → Earth → the beginning', 12, H - 70);
    _ctx.fillText('two zeros. the circle closes. 13.8 billion years between them.', 12, H - 56);
    _ctx.globalAlpha = 0.13;
    _ctx.fillText('←→ navigate · SPACE rewind · B bounce forever · D dinosaurs · P pangaea · F fish · ESC close', 12, H - 40);

    // Bounce indicator
    if (_bouncing) {
      _ctx.fillStyle = '#e85d3a';
      _ctx.globalAlpha = 0.3 + Math.sin(_t * 3) * 0.1;
      _ctx.font = '8px "Courier New"';
      _ctx.fillText('⟳ BOUNCING — pass ' + _bounceCount + ' · press B to stop', 12, H - 26);
    }

    // ═══ EPOCH COUNTER ═══
    var ce2 = EPOCHS[_currentEpoch];
    _ctx.textAlign = 'right';
    _ctx.font = 'bold 13px "Courier New"';
    _ctx.fillStyle = ce2.color;
    _ctx.globalAlpha = 0.5;
    _ctx.fillText(ce2.glyph + ' ' + ce2.name, W - 14, H - 26);
    _ctx.font = '8px "Courier New"';
    _ctx.globalAlpha = 0.3;
    _ctx.fillText(formatAge(ce2.age) + (ce2.age > 0 ? ' ago' : '') + ' · epoch ' + (_currentEpoch + 1) + '/' + EPOCHS.length, W - 14, H - 12);
    _ctx.textAlign = 'left';

    // Progress bar
    if (_rewindPhase >= 0) {
      var barW = W * 0.6;
      var barX = (W - barW) / 2;
      var barY = H - 6;
      var frac = _rewindPhase / (EPOCHS.length - 1);
      _ctx.fillStyle = '#1c1c1c';
      _ctx.globalAlpha = 0.3;
      _ctx.fillRect(barX, barY, barW, 3);
      _ctx.fillStyle = EPOCHS[_rewindPhase].color;
      _ctx.globalAlpha = 0.5;
      _ctx.fillRect(barX, barY, barW * frac, 3);
    }

    // ═══ MEMBRANE FRAME — the screen edge IS the membrane ═══
    // Draw AFTER restore so frame stays screen-aligned
    drawMembraneFrame(_ctx, W, H);

    // ═══ CLOSE BUTTON — always visible, top-left ═══
    _ctx.font = '10px "Courier New"';
    _ctx.fillStyle = '#8b949e';
    _ctx.globalAlpha = 0.25;
    _ctx.fillText('✕ ESC / double-click to close', W - 210, H - 2);

    // ═══ FRAME STATUS — bottom center ═══
    _ctx.font = '6px "Courier New"';
    _ctx.fillStyle = '#484f58';
    _ctx.globalAlpha = 0.12;
    var bs = (1 + Math.sin(_frame.breath) * _frame.breathAmp).toFixed(3);
    _ctx.fillText('frame = membrane · unpinned · breathing ' + bs + ' · drift (' + _frame.cx.toFixed(0) + ',' + _frame.cy.toFixed(0) + ') · pressure ' + _frame.pressure.toFixed(2), W / 2 - 160, H - 2);

    _ctx.globalAlpha = 1;
    _animFrame = requestAnimationFrame(render);
  }

  // ═══ REWIND — cycle through all epochs ═══
  function startRewind(addEntry) {
    if (_rewindTimer) return;
    _rewindPhase = 0;
    _rewindDir = 1;
    _currentEpoch = 0;

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">\u23ea REWIND.</span> now \u2192 \u03c0 \u2192 year \u2192 T-Rex \u2192 Pangaea \u2192 fish leaped! \u2192 the beginning.' +
        '\n<span class="dim">winding back through all of time. hold on.</span>'
      );
    }

    _rewindTimer = setInterval(function() {
      _rewindPhase += _rewindDir;
      _currentEpoch = Math.max(0, Math.min(EPOCHS.length - 1, _rewindPhase));

      if (window._membraneSound && window._membraneSound.isActive()) {
        window._membraneSound.playNote(_rewindPhase % 7, 0.25);
      }

      // ═══ NARRATION AT KEY EPOCHS ═══
      if (_rewindDir === 1 && addEntry) {
        if (EPOCHS[_currentEpoch] && EPOCHS[_currentEpoch].id === 'trex') {
          addEntry('chipmunk',
            '<span style="color:#c2813b;font-style:italic">\ud83e\udd96 T-Rex. 68 million years ago.' +
            '\nwhat color? melanosomes say: brown. reddish-tan.' +
            '\ndarker stripes. fuzzy proto-feathers on the young.' +
            '\nnot green. more like a 40-foot hawk.</span>'
          );
        }
        if (EPOCHS[_currentEpoch] && EPOCHS[_currentEpoch].id === 'kpg') {
          addEntry('chipmunk',
            '<span style="color:#ff6b35;font-style:italic">\u2604 the asteroid. 65 million years ago.' +
            '\n10km rock. the sky burned. then went dark for years.' +
            '\n75% of species \u2014 gone.' +
            '\nbut under a log, a small furry thing survived.' +
            '\nit was the size of a shrew. it was your ancestor.</span>'
          );
        }
        if (EPOCHS[_currentEpoch] && EPOCHS[_currentEpoch].id === 'first_mammal') {
          addEntry('chipmunk',
            '<span style="color:#f0c070;font-style:italic">\ud83d\udc00 the first mammals. 225 million years ago.' +
            '\nMorganucodon. found in Wales.' +
            '\ntiny. nocturnal. ate bugs in the dark.' +
            '\nlived under the dinosaurs\' feet for 160 million years.' +
            '\nwaiting. the patient inherited the Earth.</span>'
          );
        }
        if (EPOCHS[_currentEpoch] && EPOCHS[_currentEpoch].id === 'pangaea') {
          addEntry('chipmunk',
            '<span style="color:#8bc78b;font-style:italic">\ud83c\udf0e Pangaea. 335 million years.' +
            '\none continent. all the land was one.' +
            '\nmichigan was at the equator. warm shallow seas.' +
            '\nthe salt under detroit is from tropical michigan.</span>'
          );
        }
        if (EPOCHS[_currentEpoch] && EPOCHS[_currentEpoch].id === 'tiktaalik') {
          addEntry('chipmunk',
            '<span style="color:#5ab8a0;font-style:italic">\ud83d\udc1f the fish that leaped! 375 million years.' +
            '\nTiktaalik roseae. Canadian Arctic (tropical then).' +
            '\na fish with proto-wrists. it propped itself up.' +
            '\nhauled itself onto a mudflat. breathed air.' +
            '\nlooked around. went back in. came back out.' +
            '\neverything with legs descends from this fish.</span>'
          );
        }
        if (EPOCHS[_currentEpoch] && EPOCHS[_currentEpoch].id === 'cambrian') {
          addEntry('chipmunk',
            '<span style="color:#d2a8ff;font-style:italic">\u25ce Cambrian explosion. 540 million years.' +
            '\nin 20 million years, every body plan appeared.' +
            '\neyes evolved. once you could see, you could hunt.' +
            '\nonce you could be seen, you needed armor.' +
            '\nthe Cambrian was the invention of looking.</span>'
          );
        }
      }

      // At the end
      if (_rewindPhase >= EPOCHS.length - 1) {
        _rewindDir = -1;
        if (addEntry) {
          addEntry('chipmunk',
            '<span style="color:#e85d3a;font-style:italic">\u2726 13.8 billion years. the other zero.' +
            '\nhydrogen. helium. nothing else.' +
            '\nno stars. no planets. no membranes.' +
            '\nno fish. no mammals. no dinosaurs. no michigan.' +
            '\njust physics and time.' +
            '\nnow we come back.</span>'
          );
        }
      }

      // Back to now
      if (_rewindPhase <= 0 && _rewindDir === -1) {
        clearInterval(_rewindTimer);
        _rewindTimer = null;
        _rewindPhase = -1;
        _currentEpoch = 0;

        if (_bouncing) {
          _bounceCount++;
          setTimeout(function() {
            if (_bouncing && _active) startRewind(addEntry);
          }, 2000);
        }

        if (addEntry) {
          addEntry('chipmunk',
            '<span class="good">\u25c9 back to now.</span> the circle closes.' +
            '\n<span class="dim">two zeros: the beginning and this heartbeat.</span>' +
            '\n<span class="dim">13.8 billion years between them.</span>' +
            (_bouncing ? '\n<span class="dim">\u27f3 bouncing again\u2026 pass ' + _bounceCount + '</span>' : '\n<span class="dim">and right here, right now: the membrane hums.</span>')
          );
        }
      }
    }, 1800);
  }

  // ═══ BOUNCE — keep going back and forth forever ═══
  function startBounce(addEntry) {
    if (_bouncing) {
      _bouncing = false;
      if (addEntry) {
        addEntry('chipmunk',
          '<span class="dim">\u27f3 bounce stopped after ' + _bounceCount + ' passes.</span>'
        );
      }
      return;
    }
    _bouncing = true;
    _bounceCount = 0;
    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">\u27f3 BOUNCE MODE.</span> now \u2194 the beginning. forever.' +
        '\n<span class="dim">watching the whole thing. every pass finds something new.</span>' +
        '\n<span class="dim">press B again to stop.</span>'
      );
    }
    startRewind(addEntry);
  }

  // ═══ ACTIVATE ═══
  function activate(addEntry) {
    if (_overlay) return;
    _active = true;
    particles = [];
    _currentEpoch = 0;
    _bouncing = false;
    _bounceCount = 0;
    _frame.cx = 0; _frame.cy = 0;
    _frame.vx = 0.25 + Math.random() * 0.15;
    _frame.vy = 0.15 + Math.random() * 0.1;
    _frame.breath = 0;
    _frame.edgeHeat = [0, 0, 0, 0];
    _ripples = [];
    _prevEpoch = 0;
    _noiseCanvas = null; _noiseCtx = null; _noiseTimer = 0;

    _overlay = document.createElement('div');
    _overlay.id = 'temporal-window-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:50;background:#010409;overflow:hidden;';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;cursor:pointer;';
    _overlay.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    _canvas.addEventListener('click', onCanvasClick);
    document.addEventListener('keydown', onKey);
    document.body.appendChild(_overlay);

    if (window._membraneSound && window._membraneSound.isActive()) {
      window._membraneSound.shepardTone(0, 6);
    }

    _addEntry = addEntry || null;
    startPolling();

    if (addEntry) {
      addEntry('chipmunk',
        '<span class="good">\u23f1 TEMPORAL WINDOW.</span> reeling through time.' +
        '\n<span class="dim">22 epochs. now \u2192 \u03c0 \u2192 year \u2192 T-Rex \u2192 Pangaea \u2192 fish \u2192 the beginning.</span>' +
        '\n<span class="dim">\u2190\u2192 navigate \u00b7 SPACE rewind \u00b7 B bounce forever \u00b7 ESC close</span>' +
        '\n<span class="dim">D dinosaurs \u00b7 P pangaea \u00b7 F fish \u00b7 0 back to now</span>'
      );
    }

    _t = 0;
    _spiralAngle = 0;
    render();
  }

  function deactivate() {
    _active = false;
    _bouncing = false;
    stopPolling();
    if (_rewindTimer) { clearInterval(_rewindTimer); _rewindTimer = null; }
    if (_animFrame) cancelAnimationFrame(_animFrame);
    if (_canvas) _canvas.removeEventListener('click', onCanvasClick);
    document.removeEventListener('keydown', onKey);
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null; _canvas = null; _ctx = null;
    particles = []; _ripples = [];
    _noiseCanvas = null; _noiseCtx = null;
  }

  function findEpoch(id) {
    for (var i = 0; i < EPOCHS.length; i++) {
      if (EPOCHS[i].id === id) return i;
    }
    return 0;
  }

  function onKey(e) {
    // Never block browser shortcuts (refresh, back, devtools, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'F5' || e.key === 'F12') return;

    if (e.key === 'Escape') { deactivate(); return; }
    if (e.key === 'ArrowRight' || e.key === 'l') {
      _currentEpoch = Math.min(EPOCHS.length - 1, _currentEpoch + 1);
    }
    if (e.key === 'ArrowLeft' || e.key === 'h') {
      _currentEpoch = Math.max(0, _currentEpoch - 1);
    }
    if (e.key === ' ') {
      e.preventDefault();
      startRewind(_addEntry);
    }
    if (e.key === 'b' || e.key === 'B') {
      startBounce(_addEntry);
    }
    if (e.key === 'd' || e.key === 'D') {
      _currentEpoch = findEpoch('trex');
    }
    if (e.key === 'p' || e.key === 'P') {
      _currentEpoch = findEpoch('pangaea');
    }
    if (e.key === 'f' || e.key === 'F') {
      _currentEpoch = findEpoch('tiktaalik');
    }
    if (e.key === 'm' || e.key === 'M') {
      _currentEpoch = findEpoch('first_mammal');
    }
    if (e.key === 'c' || e.key === 'C') {
      _currentEpoch = findEpoch('cambrian');
    }
    if (e.key === '0') {
      _currentEpoch = 0;
    }
  }

  function onCanvasClick(e) {
    // Click near edges or far from center = close
    var rect = _canvas.getBoundingClientRect();
    var mx = e.clientX - rect.left;
    var my = e.clientY - rect.top;
    var W = _canvas.width;
    var H = _canvas.height;
    var cx = W / 2 + _frame.cx;
    var cy = H / 2 + _frame.cy;
    var dist = Math.sqrt((mx - cx) * (mx - cx) + (my - cy) * (my - cy));
    var maxR = Math.min(W, H) * 0.42;

    // Click the close button area (top-right corner)
    if (mx > W - 60 && my < 40) {
      deactivate();
      return;
    }

    // Double-click anywhere = close
    if (e.detail >= 2) {
      deactivate();
      return;
    }
  }

  function toggle(addEntry) {
    if (_active) deactivate(); else activate(addEntry);
    return _active;
  }

  window._temporalWindow = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    rewind: startRewind,
    bounce: startBounce,
    isActive: function() { return _active; },
    epochs: function() { return EPOCHS; },
    currentEpoch: function() { return EPOCHS[_currentEpoch]; },
  };
})();
