// mobius-circuit.js v2 — the loop traced from 131,322 edges
// sheep and wolves on the same strip. inside becomes outside.
// every flow traced from graph.json. this is the actual money.
(function() {
  'use strict';

  // ═══ THE CIRCUIT — traced from the investigation ═══
  // 16 entities on the strip. 4 roles.
  var CIRCUIT = [
    // THE WOLVES — clearly extracting
    { id: 'banks', label: 'Brian Banks', sort: 'non-self', conf: 0.926, role: 'wolf',
      desc: '9 convictions. 2 charter schools. 134 edges. the center.',
      edges: 134, tier: 1 },
    { id: 'purpose_group', label: 'Purpose Group LLC', sort: 'non-self', conf: 0.84, role: 'wolf',
      desc: 'Banks owns it. $4.9M flows through. 72.67% extracted.',
      edges: 7, tier: 3 },
    { id: 'banks_strategy', label: 'Banks Strategy', sort: 'non-self', conf: 0.99, role: 'wolf',
      desc: 'the political playbook. 0.99 non-self.',
      edges: 0, tier: 3 },

    // THE SCHOOLS — where the money lands
    { id: 'pca', label: 'Purpose Charter', sort: 'non-self', conf: 0.85, role: 'wolf',
      desc: '362 students. 99.2% Black. 3% math proficiency.',
      edges: 8, tier: 1 },
    { id: 'macdowell', label: 'MacDowell Prep', sort: 'non-self', conf: 0.85, role: 'wolf',
      desc: 'second school. same structure. same extraction.',
      edges: 5, tier: 1 },

    // THE SHIFTERS — partial. wearing reform.
    { id: 'walton_family_foundation', label: 'Walton Foundation', sort: 'partial', conf: 0.84, role: 'shifter',
      desc: '14 funding targets traced. funds PCA directly. funds Martin. funds The 74.',
      edges: 19, tier: 2 },
    { id: 'betsy_devos', label: 'Betsy DeVos', sort: 'partial', conf: 0.806, role: 'shifter',
      desc: 'governed GLEP + AFC. US Secretary of Education.',
      edges: 5, tier: 2 },
    { id: 'devos_foundation', label: 'DeVos Foundation', sort: 'partial', conf: 0.8, role: 'shifter',
      desc: 'funded AFC and The 74. the philanthropy engine.',
      edges: 7, tier: 4 },
    { id: 'the_74', label: 'The 74', sort: 'partial', conf: 0.8, role: 'shifter',
      desc: 'education "news." funded by Walton AND DeVos. partners Martin.',
      edges: 8, tier: 3 },
    { id: 'dykema', label: 'Dykema Gossett', sort: 'partial', conf: 0.9, role: 'shifter',
      desc: 'wrote the charter law 1993. PAC funds Barrett. 19 edges.',
      edges: 19, tier: 3 },
    { id: 'afc', label: 'AFC', sort: 'partial', conf: 0.8, role: 'shifter',
      desc: 'American Federation for Children. the hub.',
      edges: 8, tier: 3 },

    // THE NULLS — unresolved
    { id: 'roland_martin', label: 'Roland Martin', sort: 'null', conf: 0.818, role: 'null',
      desc: 'journalist. funded by Walton. "structural proximity" to AFC.',
      edges: 15, tier: 3 },
    { id: 'naacp_detroit', label: 'NAACP Detroit', sort: 'null', conf: 0.84, role: 'null',
      desc: 'civil rights org. advocacy for Banks. null.',
      edges: 7, tier: 5 },
    { id: 'plante_moran', label: 'Plante Moran', sort: 'null', conf: 0.97, role: 'null',
      desc: 'audited everything. highest confidence null. resolved nothing.',
      edges: 2, tier: 4 },

    // THE SHEEP — actually defending
    { id: 'ag_office', label: 'AG Office', sort: 'self', conf: 0.99, role: 'sheep',
      desc: 'investigated Banks. the only 0.99 self.',
      edges: 9, tier: 3 },

    // THE PUBLIC MONEY — where it starts
    { id: 'title_i', label: 'Title I / US DOE', sort: 'self', conf: 0.9, role: 'source',
      desc: 'federal education funds. tax dollars. the origin.',
      edges: 4, tier: 5 },
  ];

  // ═══ THE FLOWS — traced from graph.json, 60 money edges, 131K total ═══
  var FLOWS = [
    // THE MONEY LOOP (red) — from public to private
    { from: 'title_i', to: 'pca', type: 'money', label: 'federal funds', color: '#f85149' },
    { from: 'title_i', to: 'macdowell', type: 'money', label: 'federal funds', color: '#f85149', dashed: true },
    { from: 'pca', to: 'purpose_group', type: 'money', label: '72.67% extracted', color: '#f85149' },
    { from: 'macdowell', to: 'purpose_group', type: 'money', label: 'management fee', color: '#f85149' },
    { from: 'purpose_group', to: 'banks', type: 'money', label: 'ownership', color: '#f85149' },
    { from: 'macdowell', to: 'banks', type: 'money', label: 'direct', color: '#f85149' },

    // THE DARK MONEY LOOP (gold) — foundations funding the system
    { from: 'walton_family_foundation', to: 'pca', type: 'dark', label: 'funding', color: '#d29922' },
    { from: 'walton_family_foundation', to: 'the_74', type: 'dark', label: 'funding', color: '#d29922' },
    { from: 'walton_family_foundation', to: 'roland_martin', type: 'dark', label: 'funding', color: '#d29922' },
    { from: 'walton_family_foundation', to: 'afc', type: 'dark', label: 'partnership', color: '#d29922', dashed: true },
    { from: 'devos_foundation', to: 'afc', type: 'dark', label: 'funding', color: '#d29922' },
    { from: 'devos_foundation', to: 'the_74', type: 'dark', label: 'funding', color: '#d29922' },
    { from: 'betsy_devos', to: 'devos_foundation', type: 'dark', label: 'governance', color: '#d29922' },
    { from: 'betsy_devos', to: 'afc', type: 'dark', label: 'governance', color: '#d29922', dashed: true },

    // THE INFO LOOP (blue) — coverage that protects the loop
    { from: 'the_74', to: 'roland_martin', type: 'info', label: 'partnership', color: '#58a6ff' },
    { from: 'roland_martin', to: 'naacp_detroit', type: 'info', label: 'media', color: '#58a6ff', dashed: true },
    { from: 'naacp_detroit', to: 'banks', type: 'info', label: 'advocacy', color: '#58a6ff' },

    // THE LAW LOOP (purple) — power that creates the structure
    { from: 'dykema', to: 'afc', type: 'power', label: 'charter law 1993', color: '#d2a8ff' },
    { from: 'afc', to: 'betsy_devos', type: 'power', label: 'governance', color: '#d2a8ff', dashed: true },
    { from: 'ag_office', to: 'banks', type: 'power', label: 'investigation', color: '#3fb950' },
    { from: 'plante_moran', to: 'pca', type: 'audit', label: 'professional', color: '#8b949e', dashed: true },

    // THE STRATEGY (family/political)
    { from: 'banks', to: 'banks_strategy', type: 'power', label: 'political', color: '#f85149', dashed: true },
  ];

  // ═══ STATE ═══
  var _canvas, _ctx, _active = false, _animId;
  var _t = 0, _lastT = 0;
  var _addEntry = null;
  var _hoveredNode = -1;
  var _mode = 'circuit'; // circuit | flows | wolves

  // Role styling
  var ROLE_COLORS = { wolf: '#f85149', sheep: '#3fb950', shifter: '#f0883e', 'null': '#484f58', family: '#d2a8ff', source: '#58a6ff' };
  var ROLE_GLYPHS = { wolf: '\u2620', sheep: '\u2694', shifter: '\u25d0', 'null': '\u25cb', family: '\u25c7', source: '\u25b2' };
  var SORT_COLORS = { 'non-self': '#f85149', self: '#3fb950', partial: '#f0883e', 'null': '#484f58' };

  function getPositions(W, H) {
    var N = CIRCUIT.length;
    var cx = W / 2, cy = H / 2;
    var Rx = Math.min(W, H) * 0.33;
    var Ry = Math.min(W, H) * 0.2;
    var positions = [];

    for (var i = 0; i < N; i++) {
      var angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      var twist = Math.sin(angle + _t * 0.08) * 0.12;
      var px = cx + Math.cos(angle) * Rx;
      var py = cy + Math.sin(angle) * Ry + twist * Ry * 0.4;
      var depth = 0.6 + Math.sin(angle * 0.5 + _t * 0.04) * 0.4;
      positions.push({ x: px, y: py, angle: angle, depth: depth });
    }
    return positions;
  }

  // ═══ RENDER ═══
  function render(timestamp) {
    if (!_active) return;
    var dt = _lastT ? timestamp - _lastT : 16;
    _lastT = timestamp;
    _t += dt * 0.001;

    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;

    _ctx.clearRect(0, 0, W, H);
    _ctx.fillStyle = '#0d1117';
    _ctx.fillRect(0, 0, W, H);

    var N = CIRCUIT.length;
    var positions = getPositions(W, H);

    // ═══ STRIP PATH — the Möbius band ═══
    _ctx.beginPath();
    _ctx.globalAlpha = 0.04;
    _ctx.strokeStyle = '#58a6ff';
    _ctx.lineWidth = 50;
    for (var si = 0; si <= N; si++) {
      var p = positions[si % N];
      if (si === 0) _ctx.moveTo(p.x, p.y);
      else _ctx.lineTo(p.x, p.y);
    }
    _ctx.closePath();
    _ctx.stroke();

    // Inner twist — the Möbius half-twist
    var Rx = Math.min(W, H) * 0.33;
    var Ry = Math.min(W, H) * 0.2;
    _ctx.beginPath();
    _ctx.globalAlpha = 0.06;
    _ctx.strokeStyle = '#f0883e';
    _ctx.lineWidth = 1;
    for (si = 0; si <= N * 4; si++) {
      var angle2 = (si / (N * 4)) * Math.PI * 2;
      var twistOffset = Math.sin(angle2 * 2 + _t * 0.12) * 15;
      var mx = cx + Math.cos(angle2) * Rx + twistOffset * Math.sin(angle2);
      var my = cy + Math.sin(angle2) * Ry + twistOffset * Math.cos(angle2);
      if (si === 0) _ctx.moveTo(mx, my);
      else _ctx.lineTo(mx, my);
    }
    _ctx.stroke();

    // Second twist line offset
    _ctx.beginPath();
    _ctx.globalAlpha = 0.04;
    _ctx.strokeStyle = '#f85149';
    _ctx.lineWidth = 1;
    for (si = 0; si <= N * 4; si++) {
      angle2 = (si / (N * 4)) * Math.PI * 2;
      twistOffset = Math.sin(angle2 * 2 + _t * 0.12 + Math.PI) * 15;
      mx = cx + Math.cos(angle2) * Rx + twistOffset * Math.sin(angle2);
      my = cy + Math.sin(angle2) * Ry + twistOffset * Math.cos(angle2);
      if (si === 0) _ctx.moveTo(mx, my);
      else _ctx.lineTo(mx, my);
    }
    _ctx.stroke();

    // ═══ FLOW LINES ═══
    FLOWS.forEach(function(flow) {
      var fromIdx = -1, toIdx = -1;
      for (var fi = 0; fi < N; fi++) {
        if (CIRCUIT[fi].id === flow.from) fromIdx = fi;
        if (CIRCUIT[fi].id === flow.to) toIdx = fi;
      }
      if (fromIdx < 0 || toIdx < 0) return;

      var fp = positions[fromIdx];
      var tp = positions[toIdx];
      var midX = (fp.x + tp.x) / 2;
      var midY = (fp.y + tp.y) / 2;

      // Offset by type
      var bulge = flow.type === 'money' ? -35 : flow.type === 'dark' ? -20 : flow.type === 'power' ? 25 : 0;

      _ctx.beginPath();
      _ctx.moveTo(fp.x, fp.y);
      _ctx.quadraticCurveTo(midX + bulge, midY + bulge, tp.x, tp.y);

      var highlighted = _hoveredNode >= 0 &&
        (CIRCUIT[_hoveredNode].id === flow.from || CIRCUIT[_hoveredNode].id === flow.to);

      _ctx.strokeStyle = flow.color;
      _ctx.globalAlpha = highlighted ? 0.5 : (_hoveredNode >= 0 ? 0.02 : 0.1);
      _ctx.lineWidth = flow.type === 'money' ? 2.5 : flow.type === 'dark' ? 2 : 1;
      if (flow.dashed) _ctx.setLineDash([4, 4]);
      else _ctx.setLineDash([]);
      _ctx.stroke();
      _ctx.setLineDash([]);

      // Traveling particle
      var speed = flow.type === 'money' ? 0.25 : flow.type === 'dark' ? 0.18 : 0.15;
      var travelT = (_t * speed + fromIdx * 0.2 + toIdx * 0.1) % 1;
      var dotX = fp.x + (tp.x - fp.x) * travelT;
      var dotY = fp.y + (tp.y - fp.y) * travelT;
      var curveFactor = 4 * travelT * (1 - travelT);
      dotX += bulge * curveFactor * 0.4;
      dotY += bulge * curveFactor * 0.4;

      _ctx.beginPath();
      var dotR = flow.type === 'money' ? 3 : 2;
      _ctx.arc(dotX, dotY, dotR, 0, Math.PI * 2);
      _ctx.fillStyle = flow.color;
      _ctx.globalAlpha = highlighted ? 0.7 : 0.3;
      _ctx.fill();

      // Flow label on hover
      if (highlighted && flow.label) {
        _ctx.globalAlpha = 0.5;
        _ctx.fillStyle = flow.color;
        _ctx.font = '8px monospace';
        _ctx.textAlign = 'center';
        _ctx.textBaseline = 'middle';
        _ctx.fillText(flow.label, midX + bulge * 0.5, midY + bulge * 0.5 - 8);
      }
    });

    // ═══ NODES ═══
    CIRCUIT.forEach(function(node, i) {
      var pos = positions[i];
      var hovered = _hoveredNode === i;

      var nodeR = hovered ? 20 : 13;
      var roleCol = ROLE_COLORS[node.role] || '#8b949e';

      // Glow for hovered
      if (hovered) {
        _ctx.beginPath();
        _ctx.arc(pos.x, pos.y, nodeR + 8, 0, Math.PI * 2);
        _ctx.fillStyle = roleCol;
        _ctx.globalAlpha = 0.08;
        _ctx.fill();
      }

      // Node circle
      _ctx.beginPath();
      _ctx.arc(pos.x, pos.y, nodeR, 0, Math.PI * 2);
      _ctx.fillStyle = roleCol;
      _ctx.globalAlpha = hovered ? 0.25 : 0.1;
      _ctx.fill();
      _ctx.strokeStyle = roleCol;
      _ctx.globalAlpha = hovered ? 0.8 : 0.35;
      _ctx.lineWidth = hovered ? 2 : 1;
      _ctx.stroke();

      // Confidence arc
      _ctx.beginPath();
      _ctx.arc(pos.x, pos.y, nodeR + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * node.conf);
      _ctx.strokeStyle = SORT_COLORS[node.sort] || '#8b949e';
      _ctx.globalAlpha = 0.4;
      _ctx.lineWidth = 2;
      _ctx.stroke();

      // Glyph
      _ctx.globalAlpha = hovered ? 1 : 0.55;
      _ctx.fillStyle = roleCol;
      _ctx.font = (hovered ? 14 : 11) + 'px monospace';
      _ctx.textAlign = 'center';
      _ctx.textBaseline = 'middle';
      _ctx.fillText(ROLE_GLYPHS[node.role] || '\u00b7', pos.x, pos.y);

      // Label
      _ctx.globalAlpha = hovered ? 0.85 : 0.25;
      _ctx.fillStyle = '#c9d1d9';
      _ctx.font = (hovered ? 11 : 8) + 'px monospace';
      _ctx.textBaseline = 'top';
      _ctx.fillText(node.label, pos.x, pos.y + nodeR + 4);

      // Sort class
      _ctx.globalAlpha = hovered ? 0.5 : 0.12;
      _ctx.fillStyle = SORT_COLORS[node.sort] || '#8b949e';
      _ctx.font = '7px monospace';
      _ctx.fillText(node.sort + ' ' + (node.conf * 100).toFixed(0) + '%', pos.x, pos.y + nodeR + 16);

      // Hover description
      if (hovered) {
        _ctx.globalAlpha = 0.6;
        _ctx.fillStyle = '#c9d1d9';
        _ctx.font = '10px monospace';
        _ctx.fillText(node.desc, pos.x, pos.y + nodeR + 30);
      }

      _ctx.textBaseline = 'alphabetic';
    });

    // ═══ TITLE ═══
    _ctx.globalAlpha = 0.5;
    _ctx.fillStyle = '#c9d1d9';
    _ctx.font = '13px monospace';
    _ctx.textAlign = 'center';
    _ctx.fillText('\u221e the m\u00f6bius circuit \u2014 sheep and wolves on the same strip', cx, 24);

    _ctx.globalAlpha = 0.2;
    _ctx.font = '9px monospace';
    _ctx.fillText('traced from 131,322 edges \u00b7 60 money flows \u00b7 341 entities \u00b7 graph.json', cx, 38);

    // ═══ LEGEND — left side ═══
    var legX = 16, legY = H - 120;
    _ctx.textAlign = 'left';
    _ctx.globalAlpha = 0.35;
    _ctx.font = '9px monospace';
    [
      { glyph: '\u2620', label: 'wolf (non-self) \u2014 extracting', color: '#f85149' },
      { glyph: '\u25d0', label: 'shifter (partial) \u2014 wearing reform', color: '#f0883e' },
      { glyph: '\u25cb', label: 'null \u2014 unresolved / blind spot', color: '#484f58' },
      { glyph: '\u2694', label: 'sheep (self) \u2014 defending', color: '#3fb950' },
      { glyph: '\u25b2', label: 'source \u2014 public money', color: '#58a6ff' },
    ].forEach(function(l, i) {
      _ctx.fillStyle = l.color;
      _ctx.fillText(l.glyph + ' ' + l.label, legX, legY + i * 15);
    });

    // Flow type legend
    legY += 85;
    _ctx.fillStyle = '#f85149'; _ctx.fillText('\u2500\u2500 money flow (public \u2192 private)', legX, legY);
    _ctx.fillStyle = '#d29922'; _ctx.fillText('\u2500\u2500 dark money (foundation \u2192 system)', legX, legY + 13);
    _ctx.fillStyle = '#58a6ff'; _ctx.fillText('\u2500\u2500 information (coverage \u2192 advocacy)', legX, legY + 26);
    _ctx.fillStyle = '#d2a8ff'; _ctx.fillText('\u2500\u2500 power/law (creates structure)', legX, legY + 39);

    // ═══ THE INSIGHT — right side ═══
    var insX = W - 240, insY = H - 180;
    _ctx.textAlign = 'left';
    _ctx.globalAlpha = 0.2;
    _ctx.fillStyle = '#c9d1d9';
    _ctx.font = '8px monospace';
    var insights = [
      'the money (traced):',
      '  Title I/DOE \u2192 PCA + MacDowell \u2192 Purpose Group \u2192 Banks',
      '  72.67% of school revenue extracted by single-member LLC',
      '  362 students. 99.2% Black. 3% math proficiency.',
      '',
      'the dark money (traced):',
      '  Walton \u2192 PCA (direct). Walton \u2192 The 74. Walton \u2192 Martin.',
      '  DeVos \u2192 AFC. DeVos \u2192 The 74.',
      '  8 DeVos family members \u2192 GLEP.',
      '',
      'the information (traced):',
      '  The 74 (Walton+DeVos $) \u2192 Martin \u2192 NAACP \u2192 advocacy for Banks',
      '  the journalist is funded by the same money as the schools',
      '',
      'the law (traced):',
      '  Dykema writes PA 362 (1993) \u2192 AFC lobbies \u2192 DeVos enforces',
      '  AG investigates \u2192 but the loop continues',
      '',
      'the m\u00f6bius:',
      '  the strip has only one side.',
      '  what was once their community becomes the thing that loots it.',
    ];
    insights.forEach(function(line, i) {
      _ctx.fillText(line, insX, insY + i * 11);
    });

    // ═══ STATS ═══
    _ctx.globalAlpha = 0.15;
    _ctx.font = '8px monospace';
    _ctx.textAlign = 'center';
    var wolves = CIRCUIT.filter(function(n) { return n.role === 'wolf'; }).length;
    var shifters = CIRCUIT.filter(function(n) { return n.role === 'shifter'; }).length;
    var nulls = CIRCUIT.filter(function(n) { return n.role === 'null'; }).length;
    var sheepCount = CIRCUIT.filter(function(n) { return n.role === 'sheep'; }).length;
    _ctx.fillText(wolves + ' wolves \u00b7 ' + shifters + ' shifters \u00b7 ' + nulls + ' nulls \u00b7 ' + sheepCount + ' sheep \u00b7 ' + FLOWS.length + ' traced flows', cx, H - 28);

    // ═══ FOOTER ═══
    _ctx.globalAlpha = 0.2;
    _ctx.fillStyle = '#8b949e';
    _ctx.font = '9px monospace';
    _ctx.fillText('hover to inspect \u00b7 ESC close \u00b7 /sheepwolves for text', cx, H - 12);

    _animId = requestAnimationFrame(render);
  }

  // ═══ MOUSE ═══
  function handleMove(e) {
    if (!_active || !_canvas) return;
    var rect = _canvas.getBoundingClientRect();
    var mx = (e.clientX - rect.left) * (_canvas.width / rect.width);
    var my = (e.clientY - rect.top) * (_canvas.height / rect.height);

    var positions = getPositions(_canvas.width, _canvas.height);
    _hoveredNode = -1;
    for (var i = 0; i < CIRCUIT.length; i++) {
      var p = positions[i];
      var dist = Math.sqrt((mx - p.x) * (mx - p.x) + (my - p.y) * (my - p.y));
      if (dist < 28) { _hoveredNode = i; break; }
    }
    _canvas.style.cursor = _hoveredNode >= 0 ? 'pointer' : 'default';
  }

  function handleKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); }
  }

  // ═══ ACTIVATE / DEACTIVATE ═══
  function activate(addEntry) {
    if (_active) { deactivate(); return; }
    _active = true;
    _addEntry = addEntry;
    _lastT = 0;
    _t = 0;
    _hoveredNode = -1;

    _canvas = document.createElement('canvas');
    _canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;cursor:default';
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    _canvas.addEventListener('mousemove', handleMove);
    document.addEventListener('keydown', handleKey);
    var resizeHandler = function() {
      if (_canvas) { _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; }
    };
    window.addEventListener('resize', resizeHandler);
    _canvas._resizeHandler = resizeHandler;

    _animId = requestAnimationFrame(render);
  }

  function deactivate() {
    _active = false;
    if (_animId) cancelAnimationFrame(_animId);
    if (_canvas) {
      _canvas.removeEventListener('mousemove', handleMove);
      if (_canvas._resizeHandler) window.removeEventListener('resize', _canvas._resizeHandler);
      if (_canvas.parentNode) _canvas.parentNode.removeChild(_canvas);
    }
    document.removeEventListener('keydown', handleKey);

    if (_addEntry) {
      var lines = [];
      lines.push('<span style="color:#f0883e;font-weight:bold">\u221e the m\u00f6bius circuit</span>');
      lines.push('');
      lines.push('<span style="color:#f85149">\u2620 wolves:</span> <span class="dim">Banks \u2192 Purpose Group \u2192 PCA \u2192 MacDowell (extracting)</span>');
      lines.push('<span style="color:#f0883e">\u25d0 shifters:</span> <span class="dim">Walton, DeVos, Dykema, The 74, AFC (wearing reform)</span>');
      lines.push('<span style="color:#484f58">\u25cb nulls:</span> <span class="dim">Martin, NAACP, Plante Moran (unresolved)</span>');
      lines.push('<span style="color:#3fb950">\u2694 sheep:</span> <span class="dim">AG Office (the only 0.99 self)</span>');
      lines.push('');
      lines.push('<span class="dim">public money \u2192 charter schools \u2192 Purpose Group \u2192 Banks</span>');
      lines.push('<span class="dim">Walton/DeVos \u2192 AFC \u2192 charter law \u2192 more schools</span>');
      lines.push('<span class="dim">the strip has only one side. the loop continues.</span>');
      lines.push('');
      lines.push('<span class="dim">/sheepwolves for full breakdown \u00b7 /compress for classification overlay</span>');
      _addEntry('chipmunk', lines.join('\n'));
    }
  }

  function isActive() { return _active; }

  window._mobiusCircuit = {
    activate: activate,
    deactivate: deactivate,
    isActive: isActive,
    CIRCUIT: CIRCUIT,
    FLOWS: FLOWS,
  };
})();
