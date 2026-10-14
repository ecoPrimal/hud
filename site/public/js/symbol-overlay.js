// symbol-overlay.js — overlay classification lenses, compress, see what emerges
// 5 lenses × 256K entities → interference patterns
// Agreement compresses. Disagreement reveals the nulls.
(function() {
  'use strict';

  // ═══ THE SYMBOL TABLE ═══
  // Every glyph in the system, where it comes from, what it means
  var SYMBOLS = {
    // Sort classes
    self:       { glyph: '●', color: '#3fb950', lens: 'sort', count: 120 },
    partial:    { glyph: '◐', color: '#f0883e', lens: 'sort', count: 114 },
    null_class: { glyph: '○', color: '#484f58', lens: 'sort', count: 100 },
    nonself:    { glyph: '✕', color: '#f85149', lens: 'sort', count: 7 },

    // Anderson modes
    chorus:     { glyph: '≋', color: '#21262d', lens: 'anderson', count: 243132 },
    human:      { glyph: '◇', color: '#3fb950', lens: 'anderson', count: 6717 },
    ghost:      { glyph: '◌', color: '#8b949e', lens: 'anderson', count: 3209 },
    sovereign:  { glyph: '⚔', color: '#58a6ff', lens: 'anderson', count: 2632 },
    spectrum:   { glyph: '∿', color: '#d2a8ff', lens: 'anderson', count: 741 },
    stealth:    { glyph: '⊘', color: '#f85149', lens: 'anderson', count: 6 },

    // Epitope types
    coder:       { glyph: '{', color: '#58a6ff', lens: 'epitope', count: 23 },
    visitor:     { glyph: '·', color: '#8b949e', lens: 'epitope', count: 31 },
    investigator:{ glyph: '?', color: '#f0883e', lens: 'epitope', count: 11 },
    observer:    { glyph: '○', color: '#d2a8ff', lens: 'epitope', count: 9 },
    explorer:    { glyph: '→', color: '#3fb950', lens: 'epitope', count: 1 },
    reader:      { glyph: '≡', color: '#d29922', lens: 'epitope', count: 2 },

    // Edge types (top 5)
    cross_ref:   { glyph: '⊕', color: '#58a6ff', lens: 'edge', count: 26873 },
    proximity:   { glyph: '∥', color: '#8b949e', lens: 'edge', count: 15529 },
    halo:        { glyph: '◎', color: '#d2a8ff', lens: 'edge', count: 10976 },
    triadic:     { glyph: '△', color: '#3fb950', lens: 'edge', count: 7590 },
    parallel:    { glyph: '‖', color: '#f0883e', lens: 'edge', count: 4430 },

    // Methods (top 5)
    cascade_self:  { glyph: '⬇', color: '#3fb950', lens: 'method', count: 53 },
    phase5:        { glyph: '⑤', color: '#58a6ff', lens: 'method', count: 34 },
    phase3_emp:    { glyph: '③', color: '#d29922', lens: 'method', count: 26 },
    cascade_null:  { glyph: '⬇', color: '#484f58', lens: 'method', count: 21 },
    cascade_non:   { glyph: '⬇', color: '#f85149', lens: 'method', count: 20 },

    // Meta symbols
    membrane:  { glyph: '⊙', color: '#58a6ff', lens: 'meta', count: 1 },
    chipmunk:  { glyph: '🐿', color: '#3fb950', lens: 'meta', count: 1 },
    pi:        { glyph: 'π', color: '#d2a8ff', lens: 'meta', count: 1 },
    compress:  { glyph: '⊞', color: '#f0883e', lens: 'meta', count: 1 },
  };

  // ═══ THE LENSES ═══
  var LENSES = [
    { id: 'sort',     name: 'sort class',    color: '#3fb950', symbols: ['self','partial','null_class','nonself'] },
    { id: 'anderson', name: 'anderson mode', color: '#58a6ff', symbols: ['chorus','human','ghost','sovereign','spectrum','stealth'] },
    { id: 'epitope',  name: 'epitope type',  color: '#d2a8ff', symbols: ['coder','visitor','investigator','observer','explorer','reader'] },
    { id: 'edge',     name: 'edge type',     color: '#f0883e', symbols: ['cross_ref','proximity','halo','triadic','parallel'] },
    { id: 'method',   name: 'method',        color: '#d29922', symbols: ['cascade_self','phase5','phase3_emp','cascade_null','cascade_non'] },
  ];

  // ═══ OVERLAY COMPRESSION ═══
  // When lenses agree → compress. When they disagree → expand.
  var OVERLAYS = [
    // What happens when sort × anderson overlap?
    { a: 'self',    b: 'human',     result: 'converge', note: 'human visitors classified as self → full agreement', glyph: '●◇', compressed: '◈', color: '#3fb950' },
    { a: 'self',    b: 'sovereign', result: 'converge', note: 'sovereign bots classified as self → known agents', glyph: '●⚔', compressed: '⬢', color: '#58a6ff' },
    { a: 'nonself', b: 'chorus',    result: 'converge', note: 'chorus classified as non-self → obvious fleet', glyph: '✕≋', compressed: '▬', color: '#f85149' },
    { a: 'null_class', b: 'ghost',  result: 'diverge',  note: 'ghost at null → neither lens resolves. the blind spot.', glyph: '○◌', compressed: '○◌', color: '#484f58' },
    { a: 'partial', b: 'spectrum',  result: 'tension',  note: 'spectrum at partial → the boundary cases. half-sorted.', glyph: '◐∿', compressed: '◑', color: '#d2a8ff' },
    { a: 'partial', b: 'ghost',     result: 'diverge',  note: 'ghost at partial → these shift between categories', glyph: '◐◌', compressed: '◐◌', color: '#8b949e' },

    // Sort × epitope
    { a: 'self',    b: 'coder',        result: 'converge', note: 'coder + self → builder. creates what it sees.', glyph: '●{', compressed: '⟨●⟩', color: '#58a6ff' },
    { a: 'self',    b: 'investigator', result: 'converge', note: 'investigator + self → the one who looks.', glyph: '●?', compressed: '⟨?⟩', color: '#f0883e' },
    { a: 'null_class', b: 'visitor',   result: 'diverge',  note: 'visitor + null → passed through without resolving', glyph: '○·', compressed: '○·', color: '#8b949e' },

    // Anderson × epitope
    { a: 'human',     b: 'explorer', result: 'converge', note: 'human explorer → the one who crosses all boundaries', glyph: '◇→', compressed: '⟹', color: '#3fb950' },
    { a: 'ghost',     b: 'observer', result: 'tension',  note: 'ghost observer → watching from the ambiguous zone', glyph: '◌○', compressed: '◉', color: '#d2a8ff' },
    { a: 'sovereign', b: 'coder',    result: 'converge', note: 'sovereign coder → the machine that builds', glyph: '⚔{', compressed: '⟨⚔⟩', color: '#58a6ff' },

    // Edge × method
    { a: 'cross_ref',  b: 'cascade_self', result: 'converge', note: 'cross-referenced into self → strongest signal', glyph: '⊕⬇', compressed: '⊛', color: '#3fb950' },
    { a: 'halo',       b: 'cascade_null', result: 'diverge',  note: 'halo ring + null cascade → orbiting but unresolved', glyph: '◎⬇', compressed: '◎?', color: '#484f58' },
    { a: 'triadic',    b: 'phase5',       result: 'converge', note: 'triadic closure confirmed by phase 5 → structural proof', glyph: '△⑤', compressed: '⬡', color: '#58a6ff' },
  ];

  // ═══ STATE ═══
  var _canvas, _ctx, _active = false, _animId;
  var _t = 0, _dt = 0, _lastT = 0;
  var _mode = 'spread'; // 'spread' | 'overlay' | 'compress'
  var _transition = 0; // 0 = spread, 1 = fully compressed
  var _targetTransition = 0;
  var _selectedLens = -1; // which lens is highlighted (-1 = all)
  var _particles = [];
  var _addEntry = null;

  // Build particles from symbols
  function initParticles() {
    _particles = [];
    var allSymKeys = Object.keys(SYMBOLS);
    var lensGroups = {};

    allSymKeys.forEach(function(k) {
      var sym = SYMBOLS[k];
      if (!lensGroups[sym.lens]) lensGroups[sym.lens] = [];
      lensGroups[sym.lens].push(k);
    });

    var lensNames = Object.keys(lensGroups);
    lensNames.forEach(function(lensName, li) {
      var keys = lensGroups[lensName];
      keys.forEach(function(k, ki) {
        var sym = SYMBOLS[k];
        var total = 0;
        allSymKeys.forEach(function(sk) { total += SYMBOLS[sk].count; });
        var sizeScale = Math.log10(sym.count + 1) / Math.log10(total + 1);

        // Spread position — fanned out by lens
        var spreadAngle = (li / lensNames.length) * Math.PI * 2 + (ki / keys.length) * (Math.PI * 2 / lensNames.length) * 0.8;
        var spreadR = 0.3 + sizeScale * 0.15;

        // Overlay position — stacked in center, grouped by "meaning"
        var overlayAngle = (ki / keys.length) * Math.PI * 2;
        var overlayR = 0.08 + li * 0.04;

        // Compressed position — collapsed to single glyph per convergence group
        var compressAngle = spreadAngle * 0.3;
        var compressR = 0.05 + sizeScale * 0.08;

        _particles.push({
          key: k,
          sym: sym,
          glyph: sym.glyph,
          color: sym.color,
          count: sym.count,
          lens: sym.lens,
          lensIdx: li,
          // Positions in each mode
          sx: 0.5 + Math.cos(spreadAngle) * spreadR,
          sy: 0.5 + Math.sin(spreadAngle) * spreadR,
          ox: 0.5 + Math.cos(overlayAngle) * overlayR,
          oy: 0.5 + Math.sin(overlayAngle) * overlayR,
          cx: 0.5 + Math.cos(compressAngle) * compressR,
          cy: 0.5 + Math.sin(compressAngle) * compressR,
          // Current render position
          x: 0, y: 0,
          size: 8 + sizeScale * 20,
          alpha: 1,
          wobble: Math.random() * Math.PI * 2,
        });
      });
    });
  }

  // ═══ RENDER ═══
  function render(timestamp) {
    if (!_active) return;
    _dt = _lastT ? timestamp - _lastT : 16;
    _lastT = timestamp;
    _t += _dt * 0.001;

    var W = _canvas.width, H = _canvas.height;
    var cx = W / 2, cy = H / 2;
    var R = Math.min(W, H) * 0.45;

    _ctx.clearRect(0, 0, W, H);
    _ctx.fillStyle = '#0d1117';
    _ctx.fillRect(0, 0, W, H);

    // Ease transition
    _transition += (_targetTransition - _transition) * 0.03;

    // ═══ TITLE ═══
    _ctx.globalAlpha = 0.6;
    _ctx.fillStyle = '#c9d1d9';
    _ctx.font = '11px monospace';
    _ctx.textAlign = 'center';
    var modeLabel = _transition < 0.33 ? 'spread — all symbols visible' :
                    _transition < 0.66 ? 'overlay — lenses stacking' :
                    'compress — agreement emerges';
    _ctx.fillText('⊞ symbol overlay · ' + modeLabel, cx, 20);

    // ═══ LENS LABELS ═══
    LENSES.forEach(function(lens, li) {
      var angle = (li / LENSES.length) * Math.PI * 2 - Math.PI / 2;
      var lr = R * (1 - _transition * 0.5) + 30;
      var lx = cx + Math.cos(angle) * lr;
      var ly = cy + Math.sin(angle) * lr;

      _ctx.globalAlpha = _selectedLens === -1 || _selectedLens === li ? 0.5 : 0.1;
      _ctx.fillStyle = lens.color;
      _ctx.font = '10px monospace';
      _ctx.textAlign = 'center';
      _ctx.fillText(lens.name, lx, ly);

      // Count
      var totalCount = 0;
      lens.symbols.forEach(function(sk) { totalCount += (SYMBOLS[sk] || {}).count || 0; });
      _ctx.globalAlpha *= 0.5;
      _ctx.font = '8px monospace';
      _ctx.fillText(totalCount.toLocaleString(), lx, ly + 12);
    });

    // ═══ OVERLAY CONNECTIONS — interference lines ═══
    if (_transition > 0.2) {
      var lineAlpha = Math.min(0.15, (_transition - 0.2) * 0.3);
      OVERLAYS.forEach(function(ov) {
        var pa = _particles.find(function(p) { return p.key === ov.a; });
        var pb = _particles.find(function(p) { return p.key === ov.b; });
        if (!pa || !pb) return;

        _ctx.beginPath();
        _ctx.moveTo(pa.x * W, pa.y * H);
        _ctx.lineTo(pb.x * W, pb.y * H);
        _ctx.strokeStyle = ov.color;
        _ctx.globalAlpha = lineAlpha * (ov.result === 'converge' ? 1.5 : ov.result === 'diverge' ? 0.5 : 0.8);
        _ctx.lineWidth = ov.result === 'converge' ? 1.5 : 0.5;
        _ctx.setLineDash(ov.result === 'diverge' ? [3, 3] : []);
        _ctx.stroke();
        _ctx.setLineDash([]);

        // Show compressed glyph at midpoint when compressing
        if (_transition > 0.6 && ov.result === 'converge') {
          var mx = (pa.x + pb.x) / 2 * W;
          var my = (pa.y + pb.y) / 2 * H;
          _ctx.globalAlpha = (_transition - 0.6) * 2;
          _ctx.fillStyle = ov.color;
          _ctx.font = '14px monospace';
          _ctx.textAlign = 'center';
          _ctx.fillText(ov.compressed, mx, my);
        }
      });
    }

    // ═══ PARTICLES — the symbols ═══
    _particles.forEach(function(p) {
      // Interpolate position based on transition
      var t = _transition;
      if (t < 0.5) {
        var t2 = t * 2;
        p.x = p.sx + (p.ox - p.sx) * t2;
        p.y = p.sy + (p.oy - p.sy) * t2;
      } else {
        var t2 = (t - 0.5) * 2;
        p.x = p.ox + (p.cx - p.ox) * t2;
        p.y = p.oy + (p.cy - p.oy) * t2;
      }

      // Wobble
      p.x += Math.sin(_t * 0.5 + p.wobble) * 0.003;
      p.y += Math.cos(_t * 0.7 + p.wobble) * 0.003;

      var px = p.x * W;
      var py = p.y * H;
      var pSize = p.size * (1 - _transition * 0.3);

      // Dim if not selected lens
      var dimmed = _selectedLens >= 0 && p.lensIdx !== _selectedLens;

      // Background circle
      _ctx.beginPath();
      _ctx.arc(px, py, pSize * 0.6, 0, Math.PI * 2);
      _ctx.fillStyle = p.color;
      _ctx.globalAlpha = dimmed ? 0.03 : 0.08;
      _ctx.fill();

      // Glyph
      _ctx.globalAlpha = dimmed ? 0.1 : 0.7;
      _ctx.fillStyle = p.color;
      _ctx.font = Math.round(pSize * 0.8) + 'px monospace';
      _ctx.textAlign = 'center';
      _ctx.textBaseline = 'middle';
      _ctx.fillText(p.glyph, px, py);

      // Label below
      _ctx.globalAlpha = dimmed ? 0.05 : 0.25;
      _ctx.font = '7px monospace';
      _ctx.textBaseline = 'top';
      _ctx.fillText(p.key.replace('_', ' '), px, py + pSize * 0.5 + 2);
      if (!dimmed && _transition < 0.5) {
        _ctx.fillText(p.count.toLocaleString(), px, py + pSize * 0.5 + 11);
      }
      _ctx.textBaseline = 'alphabetic';
    });

    // ═══ CENTER — compression ratio ═══
    if (_transition > 0.5) {
      var compressAlpha = (_transition - 0.5) * 2;
      _ctx.globalAlpha = compressAlpha * 0.6;
      _ctx.fillStyle = '#c9d1d9';
      _ctx.font = '24px monospace';
      _ctx.textAlign = 'center';
      _ctx.fillText('⊞', cx, cy - 15);

      _ctx.font = '10px monospace';
      _ctx.globalAlpha = compressAlpha * 0.4;

      // Count convergences and divergences
      var converge = OVERLAYS.filter(function(o) { return o.result === 'converge'; }).length;
      var diverge = OVERLAYS.filter(function(o) { return o.result === 'diverge'; }).length;
      var tension = OVERLAYS.filter(function(o) { return o.result === 'tension'; }).length;
      _ctx.fillText(converge + ' converge · ' + tension + ' tension · ' + diverge + ' diverge', cx, cy + 10);
      _ctx.fillText('compression: ' + Object.keys(SYMBOLS).length + ' symbols → ' + converge + ' compressed glyphs', cx, cy + 24);

      // The key insight
      _ctx.globalAlpha = compressAlpha * 0.3;
      _ctx.font = '9px monospace';
      _ctx.fillStyle = '#484f58';
      _ctx.fillText('where lenses agree, one glyph suffices', cx, cy + 42);
      _ctx.fillText('where they disagree, the null zone persists', cx, cy + 54);
    }

    // ═══ ENTROPY BARS — show information content of each lens ═══
    var barW = 100, barH = 4, barX = 12, barY = 40;
    var ENTROPY = [
      { lens: 'sort',     bits: 1.88, max: 2.0,  label: 'sort class' },
      { lens: 'anderson', bits: 0.37, max: 2.58, label: 'anderson' },
      { lens: 'epitope',  bits: 2.02, max: 2.58, label: 'epitope' },
      { lens: 'edge',     bits: 2.91, max: 3.32, label: 'edge type' },
      { lens: 'method',   bits: 4.58, max: 5.17, label: 'method' },
    ];
    _ctx.globalAlpha = 0.3;
    _ctx.font = '8px monospace';
    _ctx.textAlign = 'left';
    _ctx.fillStyle = '#484f58';
    _ctx.fillText('entropy (bits)', barX, barY - 4);

    ENTROPY.forEach(function(e, i) {
      var y = barY + i * 14;
      var fill = e.bits / e.max;
      // Track
      _ctx.globalAlpha = 0.08;
      _ctx.fillStyle = '#8b949e';
      _ctx.fillRect(barX + 55, y, barW, barH);
      // Fill
      var lensObj = LENSES.find(function(l) { return l.id === e.lens; });
      _ctx.globalAlpha = _selectedLens === -1 || _selectedLens === i ? 0.4 : 0.08;
      _ctx.fillStyle = lensObj ? lensObj.color : '#8b949e';
      _ctx.fillRect(barX + 55, y, barW * fill, barH);
      // Label
      _ctx.globalAlpha = _selectedLens === -1 || _selectedLens === i ? 0.3 : 0.08;
      _ctx.fillStyle = '#8b949e';
      _ctx.font = '7px monospace';
      _ctx.fillText(e.label, barX, y + 4);
      _ctx.fillText(e.bits.toFixed(1) + '/' + e.max.toFixed(1), barX + 55 + barW + 4, y + 4);
    });

    // ═══ COMPRESSION RATIO — bottom left ═══
    _ctx.globalAlpha = 0.25;
    _ctx.font = '8px monospace';
    _ctx.fillStyle = '#8b949e';
    _ctx.textAlign = 'left';
    var compY = H - 80;
    _ctx.fillText('compression ratios', 12, compY);
    var RATIOS = [
      { label: 'anderson',  ratio: '42,795:1', from: '256K', to: '6' },
      { label: 'edge type', ratio: '13,133:1', from: '131K', to: '10' },
      { label: 'sort',      ratio: '85:1',     from: '341',  to: '4' },
      { label: 'epitope',   ratio: '12.8:1',   from: '77',   to: '6' },
      { label: 'method',    ratio: '9.5:1',    from: '341',  to: '36' },
    ];
    RATIOS.forEach(function(r, i) {
      _ctx.fillText(r.label + ': ' + r.ratio, 12, compY + 12 + i * 10);
    });

    // Total
    _ctx.globalAlpha = 0.15;
    _ctx.fillText('total: 1,283,860 classifications → 62 symbols = 20,707:1', 12, compY + 12 + RATIOS.length * 10 + 4);

    // ═══ FOOTER — controls ═══
    _ctx.globalAlpha = 0.3;
    _ctx.fillStyle = '#8b949e';
    _ctx.font = '9px monospace';
    _ctx.textAlign = 'center';
    _ctx.fillText('\u2190 spread · click to cycle · \u2192 compress · 1-5 select lens · ESC close', cx, H - 12);

    _animId = requestAnimationFrame(render);
  }

  // ═══ CONTROLS ═══
  function handleKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); return; }
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      _targetTransition = Math.min(1, _targetTransition + 0.5);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      _targetTransition = Math.max(0, _targetTransition - 0.5);
    }
    // 1-5 to select lens, 0 for all
    var num = parseInt(e.key);
    if (num >= 1 && num <= 5) { _selectedLens = num - 1; }
    if (num === 0) { _selectedLens = -1; }
  }

  function handleClick(e) {
    if (!_active) return;
    _targetTransition = _targetTransition < 0.33 ? 0.5 : _targetTransition < 0.66 ? 1.0 : 0.0;
  }

  // ═══ ACTIVATE / DEACTIVATE ═══
  function activate(addEntry, onComplete) {
    if (_active) { deactivate(); return; }
    _active = true;
    _addEntry = addEntry;
    _transition = 0;
    _targetTransition = 0;
    _selectedLens = -1;
    _lastT = 0;
    _t = 0;

    initParticles();

    _canvas = document.createElement('canvas');
    _canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;cursor:pointer';
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    document.body.appendChild(_canvas);
    _ctx = _canvas.getContext('2d');

    _canvas.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('resize', function() {
      if (_canvas) { _canvas.width = window.innerWidth; _canvas.height = window.innerHeight; }
    });

    _animId = requestAnimationFrame(render);
  }

  function deactivate() {
    _active = false;
    if (_animId) cancelAnimationFrame(_animId);
    if (_canvas && _canvas.parentNode) _canvas.parentNode.removeChild(_canvas);
    document.removeEventListener('keydown', handleKey);

    if (_addEntry) {
      var converge = OVERLAYS.filter(function(o) { return o.result === 'converge'; }).length;
      var diverge = OVERLAYS.filter(function(o) { return o.result === 'diverge'; }).length;
      // Report findings
      var lines = [];
      lines.push('<span style="color:#f0883e">⊞ overlay compression complete</span>');
      lines.push('');
      lines.push('<span style="color:#3fb950">' + converge + ' convergences</span> <span class="dim">— lenses agree, one symbol suffices:</span>');
      OVERLAYS.forEach(function(ov) {
        if (ov.result === 'converge') {
          lines.push('  <span style="color:' + ov.color + '">' + ov.glyph + ' → ' + ov.compressed + '</span> <span class="dim">' + ov.note + '</span>');
        }
      });
      lines.push('');
      lines.push('<span style="color:#f85149">' + diverge + ' divergences</span> <span class="dim">— lenses disagree, symbols cannot compress:</span>');
      OVERLAYS.forEach(function(ov) {
        if (ov.result === 'diverge') {
          lines.push('  <span style="color:' + ov.color + '">' + ov.glyph + '</span> <span class="dim">' + ov.note + '</span>');
        }
      });
      lines.push('');
      lines.push('<span class="dim">' + Object.keys(SYMBOLS).length + ' symbols across 5 lenses. the nulls are where every lens goes dark.</span>');
      lines.push('<span class="dim">the 100 null entities exist where no classification converges.</span>');
      lines.push('<span class="dim">that\u2019s not a bug. that\u2019s the edge of what machines can see.</span>');
      _addEntry('chipmunk', lines.join('\n'));
    }
  }

  function isActive() { return _active; }

  // ═══ PUBLIC API ═══
  window._symbolOverlay = {
    activate: activate,
    deactivate: deactivate,
    isActive: isActive,
    SYMBOLS: SYMBOLS,
    LENSES: LENSES,
    OVERLAYS: OVERLAYS,
  };
})();
