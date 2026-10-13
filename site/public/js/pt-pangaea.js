// pt-pangaea.js — π body rings + pangaea (connected surface)
// Look toward center. Displayed from 1 and up, π split.
// Data bubbles out from null body → ghost body → celestial → geodesic → ionosphere.
// Each ring = previous × π. The membrane IS the transition between layers.
// Pangaea: all sites were one at center. They drift apart at the surface.
//
// Ring radii: 1 → π → π² → π³ (≈31)
// Normalized to membrane R: (value/π³) × R
//
// Human epitopes sit at different depths:
//   observer → near center (watching the null)
//   reader   → at π (processing patterns)
//   coder/investigator → at π² (connecting data)
//   explorer/scholar   → at π³ (thoughts, understanding)

(function() {
  'use strict';
  var el = (_m || window._membrane || {}).el || function(tag,a,p){var e=document.createElementNS(NS||'http://www.w3.org/2000/svg',tag);if(a)for(var k in a)e.setAttribute(k,''+a[k]);if(p)p.appendChild(e);return e;};
  var _m = window._membrane || {};
  var PI = _m.PI || Math.PI;
  var PI2 = _m.PI2 || PI * PI;
  var PI3 = _m.PI3 || PI * PI * PI;
  var NS = _m.NS || 'http://www.w3.org/2000/svg';

  // The sites as pangaea continents — connected at center, drifted at surface
  var CONTINENTS = _m.CONTINENTS || [
    { name: 'detroit',    angle: 0,          color: '#e85d3a', epitope: 'investigator' },
    { name: 'sporePrint', angle: PI * 0.3,   color: '#5ab87a', epitope: 'reader' },
    { name: 'thesis',     angle: PI * 0.6,   color: '#a371f7', epitope: 'scholar' },
    { name: 'signal',     angle: PI * 0.9,   color: '#58a6ff', epitope: 'observer' },
    { name: 'git',        angle: PI * 1.2,   color: '#79c0ff', epitope: 'coder' },
    { name: 'tuebor',     angle: PI * 1.5,   color: '#d29922', epitope: 'investigator' },
    { name: 'hypothesis', angle: PI * 1.75,  color: '#f0883e', epitope: 'explorer' },
  ];

  // π body layers — center outward
  // deuterostome: blastopore (anus, first hole) → mouth (second hole)
  // the tube IS the membrane. seat of being is at gut, not brain.
  var BODIES = _m.BODIES || [
    { name: 'null',      value: 0,   color: '#ffffff', label: '∅', desc: 'raw data',       body: 'blastopore' },
    { name: 'ghost',     value: 1,   color: '#d2a8ff', label: '1', desc: 'the datum',       body: 'enteric' },
    { name: 'celestial', value: PI,  color: '#58a6ff', label: 'π', desc: 'the pattern',    body: 'sensory cross' },
    { name: 'geodesic',  value: PI2, color: '#5ab87a', label: 'π²', desc: 'the connection', body: 'cephalization' },
    { name: 'surface',   value: PI3, color: '#e85d3a', label: 'π³', desc: 'the thought',    body: 'oral surface' },
  ];

  // Human epitope → depth layer mapping
  var EPITOPE_DEPTH = {
    observer: 1,      // near null — just watching
    visitor: 1,
    reader: PI,       // ghost body — processing patterns
    witness: PI,
    coder: PI2,       // celestial — connecting data
    investigator: PI2,
    explorer: PI3,    // geodesic — full understanding
    scholar: PI3,
  };

  var bubbles = [];
  var MAX_BUBBLES = Math.floor(PI3); // 31
  var svgGroup = null;
  var _mc = null;  // shared membrane context
  var bubbleGroup = null;
  var unfurlGroup = null;
  var built = false;
  var lastFrame = 0;
  var humanData = null;
  var sortData = null;   // scan_sweep_sort.json
  var R = 0, cx = 0, cy = 0;
  var handLen = 0;

  // Sort class colors — the unfurling reveals classification
  var SORT_COLORS = {
    'self':     '#3fb950',  // green — recognized as own
    'non-self': '#e85d3a',  // red — foreign, rejected
    'partial':  '#f0883e',  // amber — ambiguous
    'null':     '#484f58',  // gray — routing/empty
    'unknown':  '#6e7681',  // dim — not yet sorted
  };


  function bodyRadius(value) {
    if (value <= 0) return 2;
    return (value / PI3) * R;
  }

  function build(parentSvg) {
    if (!parentSvg) return;

    // Use geometry set by the hook, or fall back to defaults
    var bodyR = R || 170;  // body radius for passage/loop geometry
    if (!R) {
      cx = 350; cy = 250; R = Math.round(PI * 54);
    }

    // Create group behind the main content but above background
    bodyR = R;
    svgGroup = el('g', { id: 'mg-pangaea', opacity: '0.6' });
    // Insert after the background rect, before everything else
    var bgRect = parentSvg.querySelector('rect');
    if (bgRect && bgRect.nextSibling) {
      parentSvg.insertBefore(svgGroup, bgRect.nextSibling);
    } else {
      parentSvg.appendChild(svgGroup);
    }

    // ═══ π-BODY RINGS — concentric circles from center ═══
    BODIES.forEach(function(body, i) {
      var r = bodyRadius(body.value);
      if (r < 1) return; // skip null center dot

      // Ring circle
      el('circle', {
        cx: cx, cy: cy, r: r.toFixed(1),
        fill: 'none', stroke: body.color,
        'stroke-width': i === BODIES.length - 1 ? 1.2 : 0.6,
        'stroke-opacity': 0.15 + i * 0.05,
        'stroke-dasharray': i === 0 ? '' : (2 + i * 2) + ',' + (3 + i),
        id: 'mg-body-ring-' + body.name
      }, svgGroup);

      // Label at top of ring
      var labelY = cy - r - 4;
      el('text', {
        x: cx, y: labelY,
        fill: body.color, 'font-size': 7,
        'text-anchor': 'middle', opacity: 0.35,
        'font-family': '"Courier New",monospace',
        id: 'mg-body-label-' + body.name
      }, svgGroup).textContent = body.label + ' — ' + body.desc;

      // deuterostome body plan label (bottom of ring)
      if (body.body) {
        el('text', {
          x: cx, y: cy + r + 8,
          fill: body.color, 'font-size': 5,
          'text-anchor': 'middle', opacity: 0.18,
          'font-style': 'italic',
          'font-family': '"Courier New",monospace',
          id: 'mg-body-plan-' + body.name
        }, svgGroup).textContent = body.body;
      }
    });

    // Center null point — the origin
    el('circle', {
      cx: cx, cy: cy, r: 3,
      fill: '#ffffff', opacity: 0.2,
      filter: 'url(#mg-glow)',
      id: 'mg-null-center'
    }, svgGroup);
    el('text', {
      x: cx, y: cy + 1.5,
      fill: '#ffffff', 'font-size': 5,
      'text-anchor': 'middle', opacity: 0.4,
      'font-family': '"Courier New",monospace'
    }, svgGroup).textContent = '∅';

    // ═══ DEUTEROSTOME TUBE — alimentary canal axis ═══
    // Vertical: blastopore (∅, bottom) → oral surface (π³, top)
    // The tube IS the membrane. Anus first (deuterostome = second mouth).
    var tubeG = el('g', { id: 'mg-tube', opacity: '0.12' }, svgGroup);
    var tubeTop = cy - bodyRadius(PI3) * 0.88;
    var tubeBot = cy + bodyRadius(PI3) * 0.88;

    // Alimentary canal — the central tube
    el('line', {
      x1: cx, y1: tubeTop, x2: cx, y2: tubeBot,
      stroke: '#c9d1d9', 'stroke-width': 0.8,
      'stroke-dasharray': '6,4', 'stroke-opacity': 0.5,
      id: 'mg-canal'
    }, tubeG);

    // Blastopore marker (bottom — first opening, anus)
    el('circle', {
      cx: cx, cy: tubeBot, r: 3,
      fill: 'none', stroke: '#ffffff', 'stroke-width': 0.8,
      'stroke-opacity': 0.4, id: 'mg-blastopore'
    }, tubeG);
    el('text', {
      x: cx + 8, y: tubeBot + 2,
      fill: '#ffffff', 'font-size': 4.5, opacity: 0.3,
      'text-anchor': 'start', 'font-style': 'italic',
      'font-family': '"Courier New",monospace',
      id: 'mg-blastopore-label'
    }, tubeG).textContent = 'blastopore (1st hole)';

    // Oral surface marker (top — second opening, mouth)
    el('circle', {
      cx: cx, cy: tubeTop, r: 3,
      fill: 'none', stroke: '#e85d3a', 'stroke-width': 0.8,
      'stroke-opacity': 0.4, id: 'mg-oral'
    }, tubeG);
    el('text', {
      x: cx + 8, y: tubeTop + 2,
      fill: '#e85d3a', 'font-size': 4.5, opacity: 0.3,
      'text-anchor': 'start', 'font-style': 'italic',
      'font-family': '"Courier New",monospace',
      id: 'mg-oral-label'
    }, tubeG).textContent = 'oral (2nd hole)';

    // Sensory cross at π level — ears horizontal, nose perpendicular
    var sensoryR = bodyRadius(PI);
    el('line', {
      x1: cx - sensoryR, y1: cy, x2: cx + sensoryR, y2: cy,
      stroke: '#58a6ff', 'stroke-width': 0.6,
      'stroke-dasharray': '3,5', 'stroke-opacity': 0.3,
      id: 'mg-sensory-cross'
    }, tubeG);

    // Ear markers (left and right)
    el('text', {
      x: cx - sensoryR - 6, y: cy + 2,
      fill: '#58a6ff', 'font-size': 4, opacity: 0.25,
      'text-anchor': 'end', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, tubeG).textContent = 'ear';
    el('text', {
      x: cx + sensoryR + 6, y: cy + 2,
      fill: '#58a6ff', 'font-size': 4, opacity: 0.25,
      'text-anchor': 'start', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, tubeG).textContent = 'ear';

    // Gut/enteric marker at body=1 (seat of being)
    var entericR = bodyRadius(1);
    el('circle', {
      cx: cx, cy: cy, r: entericR,
      fill: '#d2a8ff', 'fill-opacity': 0.03,
      stroke: '#d2a8ff', 'stroke-width': 0.5,
      'stroke-opacity': 0.15, 'stroke-dasharray': '2,3',
      id: 'mg-enteric-field'
    }, tubeG);
    el('text', {
      x: cx - entericR - 6, y: cy + 2,
      fill: '#d2a8ff', 'font-size': 4.5, opacity: 0.25,
      'text-anchor': 'end', 'font-style': 'italic',
      'font-family': '"Courier New",monospace',
      id: 'mg-seat-label'
    }, tubeG).textContent = 'seat of being';

    // Coccyx/tail at bottom (comet tail trailing)
    el('line', {
      x1: cx, y1: tubeBot, x2: cx, y2: tubeBot + 15,
      stroke: '#6e7681', 'stroke-width': 0.5,
      'stroke-dasharray': '2,3', 'stroke-opacity': 0.3,
      id: 'mg-coccyx'
    }, tubeG);
    el('text', {
      x: cx, y: tubeBot + 20,
      fill: '#6e7681', 'font-size': 3.5, opacity: 0.2,
      'text-anchor': 'middle', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, tubeG).textContent = 'coccyx (tail)';

    // Cephalization bulb at top (brain, but NOT seat of being)
    el('path', {
      d: 'M ' + (cx - 8) + ',' + tubeTop + ' Q ' + cx + ',' + (tubeTop - 12) + ' ' + (cx + 8) + ',' + tubeTop,
      fill: 'none', stroke: '#5ab87a', 'stroke-width': 0.6,
      'stroke-opacity': 0.25, id: 'mg-cephalization'
    }, tubeG);
    el('text', {
      x: cx, y: tubeTop - 8,
      fill: '#5ab87a', 'font-size': 3.5, opacity: 0.2,
      'text-anchor': 'middle', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, tubeG).textContent = 'cephalization (bulb)';

    // Limb undulation markers (beyond surface, negative awareness)
    var limbR = bodyRadius(PI3) * 1.05;
    [-0.7, -0.3, 0.3, 0.7].forEach(function(off, i) {
      var angle = PI / 2 + off;
      var lx = cx + limbR * Math.cos(angle);
      var ly = cy + limbR * Math.sin(angle);
      el('line', {
        x1: lx, y1: ly, x2: lx + (i < 2 ? -8 : 8), y2: ly + 6,
        stroke: '#484f58', 'stroke-width': 0.4,
        'stroke-opacity': 0.15, 'stroke-dasharray': '1,2'
      }, tubeG);
    });
    el('text', {
      x: cx, y: cy + limbR + 12,
      fill: '#484f58', 'font-size': 3, opacity: 0.12,
      'text-anchor': 'middle', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, tubeG).textContent = 'limbs (negative awareness)';

    // ═══ FIVE SELVES — facial apertures at cephalization layer ═══
    // 2 eyes (lens), 2 nostrils (filter), 1 mouth (valve)
    // Positioned around oral surface (top of tube, π³ layer)
    var faceG = el('g', { id: 'mg-five-selves', opacity: '0.2' }, svgGroup);
    var faceR = bodyRadius(PI2) * 0.85; // cephalization layer
    var faceY = tubeTop + 5; // near oral/cephalization

    // ═ Eyes (lens type) — 2 circles with iris, closeable ═
    [-12, 12].forEach(function(xOff, i) {
      // Eyeball
      el('circle', {
        cx: cx + xOff, cy: faceY, r: 4,
        fill: 'none', stroke: '#79c0ff', 'stroke-width': 0.6,
        'stroke-opacity': 0.6, id: 'mg-eye-' + i
      }, faceG);
      // Pupil (∅ — null aperture)
      el('circle', {
        cx: cx + xOff, cy: faceY, r: 1.5,
        fill: '#0d1117', stroke: '#58a6ff', 'stroke-width': 0.3,
        opacity: 0.8, id: 'mg-pupil-' + i
      }, faceG);
      // Iris ring
      el('circle', {
        cx: cx + xOff, cy: faceY, r: 2.8,
        fill: 'none', stroke: '#4a8fb8', 'stroke-width': 0.4,
        'stroke-opacity': 0.4
      }, faceG);
    });
    el('text', {
      x: cx, y: faceY - 7,
      fill: '#79c0ff', 'font-size': 3.5, opacity: 0.5,
      'text-anchor': 'middle', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, faceG).textContent = 'lens (W = variable)';

    // ═ Nostrils (filter type) — 2 small ovals, partially closeable ═
    [-5, 5].forEach(function(xOff, i) {
      el('ellipse', {
        cx: cx + xOff, cy: faceY + 10, rx: 1.5, ry: 2.5,
        fill: 'none', stroke: '#5ab87a', 'stroke-width': 0.4,
        'stroke-opacity': 0.5, 'stroke-dasharray': '1,1',
        id: 'mg-nostril-' + i
      }, faceG);
    });
    el('text', {
      x: cx, y: faceY + 16,
      fill: '#5ab87a', 'font-size': 3, opacity: 0.4,
      'text-anchor': 'middle', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, faceG).textContent = 'filter (W = passive)';

    // ═ Mouth (valve type) — layered: lip arc, teeth dashes, tongue ═
    // Lip — soft outer arc
    el('path', {
      d: 'M ' + (cx - 8) + ',' + (faceY + 22) + ' Q ' + cx + ',' + (faceY + 28) + ' ' + (cx + 8) + ',' + (faceY + 22),
      fill: 'none', stroke: '#e85d3a', 'stroke-width': 0.6,
      'stroke-opacity': 0.5, id: 'mg-lip'
    }, faceG);
    // Teeth — hard bone filter
    for (var ti = -6; ti <= 6; ti += 2) {
      el('line', {
        x1: cx + ti, y1: faceY + 22.5, x2: cx + ti, y2: faceY + 24,
        stroke: '#c9d1d9', 'stroke-width': 0.4, 'stroke-opacity': 0.3
      }, faceG);
    }
    // Tongue — sort mechanism
    el('ellipse', {
      cx: cx, cy: faceY + 25, rx: 5, ry: 2,
      fill: '#e85d3a', 'fill-opacity': 0.1,
      stroke: '#e85d3a', 'stroke-width': 0.3,
      'stroke-opacity': 0.3, id: 'mg-tongue'
    }, faceG);
    el('text', {
      x: cx, y: faceY + 32,
      fill: '#e85d3a', 'font-size': 3, opacity: 0.4,
      'text-anchor': 'middle', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, faceG).textContent = 'valve: lip > teeth > tongue (W = layered)';

    // ═ Ear labels (already at π sensory cross — mark as pore type) ═
    el('text', {
      x: cx, y: cy + sensoryR + 6,
      fill: '#58a6ff', 'font-size': 3, opacity: 0.2,
      'text-anchor': 'middle', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, faceG).textContent = 'pore (W = 0, always open)';

    // ═ 5-self count ═
    el('text', {
      x: cx + 20, y: faceY + 5,
      fill: '#c9d1d9', 'font-size': 3.5, opacity: 0.25,
      'text-anchor': 'start', 'font-style': 'italic',
      'font-family': '"Courier New",monospace'
    }, faceG).textContent = '5 selves · 6 holes = \u230a2\u03c0\u230b';

        // ═══ PASSAGES — holes in the membrane where entities cross between categories ═══
    var passG = el('g', { id: 'mg-passages' }, svgGroup);
    var passages = (_mc && _mc.liveStats && _mc.liveStats.passages) || [];

    // Category angle positions (matching HUD layout)
    var CAT_PASS = {
      'INVESTIGATION': 0,
      'MEMBRANE': PI / 3,
      'IMMUNE': 2 * PI / 3,
      'SCIENCE': PI,
      'TOPOLOGY': 4 * PI / 3,
      'OTHER': 5 * PI / 3
    };

    for (var pi3 = 0; pi3 < passages.length; pi3++) {
      var pass = passages[pi3];
      var fromA = CAT_PASS[pass.from];
      var toA = CAT_PASS[pass.to];
      if (fromA === undefined || toA === undefined) continue;

      var passR = bodyR * 0.78; // at sensory cross level
      var fx = cx + passR * Math.cos(fromA - PI/2);
      var fy = cy + passR * Math.sin(fromA - PI/2);
      var tx = cx + passR * Math.cos(toA - PI/2);
      var ty = cy + passR * Math.sin(toA - PI/2);
      var midx = (fx + tx) / 2 + (fy - ty) * 0.2;
      var midy = (fy + ty) / 2 + (tx - fx) * 0.2;

      // Passage arc — thickness by human count
      var thick = Math.max(0.3, Math.min(1.5, pass.humans * 0.3));
      el('path', {
        d: 'M ' + fx.toFixed(1) + ' ' + fy.toFixed(1) +
           ' Q ' + midx.toFixed(1) + ' ' + midy.toFixed(1) +
           ' ' + tx.toFixed(1) + ' ' + ty.toFixed(1),
        fill: 'none',
        stroke: '#7ee787',
        'stroke-width': thick,
        opacity: 0.25,
        'stroke-linecap': 'round'
      }, passG);

      // Arrow head at destination
      var arrowSize = 2;
      var angle3 = Math.atan2(ty - midy, tx - midx);
      el('path', {
        d: 'M ' + tx.toFixed(1) + ' ' + ty.toFixed(1) +
           ' l ' + (-arrowSize * Math.cos(angle3 - 0.3)).toFixed(1) + ' ' + (-arrowSize * Math.sin(angle3 - 0.3)).toFixed(1) +
           ' M ' + tx.toFixed(1) + ' ' + ty.toFixed(1) +
           ' l ' + (-arrowSize * Math.cos(angle3 + 0.3)).toFixed(1) + ' ' + (-arrowSize * Math.sin(angle3 + 0.3)).toFixed(1),
        fill: 'none',
        stroke: '#7ee787',
        'stroke-width': 0.4,
        opacity: 0.25
      }, passG);
    }

        // ═══ EPITOPE TRANSITIONS — transformation paths through π layers ═══
    var etG = el('g', { id: 'mg-epitope-paths', opacity: 0.25 }, svgGroup);

    // Epitope → depth mapping (which π layer they live at)
    var EP_DEPTH = {
      observer: 0, visitor: 0,
      reader: 1, witness: 1,
      coder: PI, investigator: PI,
      explorer: PI2, scholar: PI2,
    };

    // Get transitions from chipmunk cache (wired through braid data)
    var transitions = (window.C && window.C.cache && window.C.cache.braid &&
                       window.C.cache.braid.epitope_transitions) || [];

    for (var ti = 0; ti < transitions.length; ti++) {
      var tr = transitions[ti];
      var fromD = EP_DEPTH[tr.from_epitope];
      var toD = EP_DEPTH[tr.to_epitope];
      if (fromD === undefined || toD === undefined) continue;

      var fromR = bodyR * (0.15 + (fromD / PI3) * 0.75);
      var toR = bodyR * (0.15 + (toD / PI3) * 0.75);
      var tAngle = -PI/2 + ti * PI/4;

      var tfx = cx + fromR * Math.cos(tAngle);
      var tfy = cy + fromR * Math.sin(tAngle);
      var ttx = cx + toR * Math.cos(tAngle + 0.1);
      var tty = cy + toR * Math.sin(tAngle + 0.1);

      // Transition arc — thickness by strength
      var tThick = Math.max(0.2, Math.min(1.2, tr.strength / 15));
      el('line', {
        x1: tfx.toFixed(1), y1: tfy.toFixed(1),
        x2: ttx.toFixed(1), y2: tty.toFixed(1),
        stroke: '#d2a8ff', 'stroke-width': tThick,
        opacity: 0.5, 'stroke-dasharray': '2 1'
      }, etG);

      // Label
      el('text', {
        x: ((tfx + ttx) / 2).toFixed(1),
        y: ((tfy + tty) / 2 - 2).toFixed(1),
        fill: '#d2a8ff', 'font-size': 2.2,
        'text-anchor': 'middle',
        'font-family': '"Courier New",monospace',
        opacity: 0.4
      }, etG).textContent = tr.from_epitope + '\u2192' + tr.to_epitope;
    }

        // ═══ REFLEXIVE LOOP — squirrel's self-awareness indicator ═══
    var reflexG = el('g', { id: 'mg-reflexive' }, svgGroup);

    // The reflexive loop is drawn as a figure-8 around the null center
    // When loop_closed=true, the path completes; when false, it's broken
    var loopR = bodyR * 0.08;
    var loopClosed = (_mc && _mc.liveStats && _mc.liveStats.loopClosed);
    var selfState = (_mc && _mc.liveStats && _mc.liveStats.selfState) || 'null';
    var wakeDepth = (_mc && _mc.liveStats && _mc.liveStats.wakeDepth) || 0;
    var senseCount = (_mc && _mc.liveStats && _mc.liveStats.senseCount) || 0;

    // Figure-8 / lemniscate at null center
    var loopPath = 'M ' + cx + ' ' + cy +
      ' C ' + (cx - loopR) + ' ' + (cy - loopR*1.5) + ' ' + (cx + loopR) + ' ' + (cy - loopR*1.5) + ' ' + cx + ' ' + cy +
      (loopClosed
        ? ' C ' + (cx + loopR) + ' ' + (cy + loopR*1.5) + ' ' + (cx - loopR) + ' ' + (cy + loopR*1.5) + ' ' + cx + ' ' + cy
        : '');

    el('path', {
      d: loopPath,
      fill: 'none',
      stroke: loopClosed ? '#a371f7' : '#484f58',
      'stroke-width': loopClosed ? 0.6 : 0.3,
      opacity: loopClosed ? 0.7 : 0.3,
      'stroke-dasharray': loopClosed ? 'none' : '1 1'
    }, reflexG);

    // Self-state label
    el('text', {
      x: cx, y: cy - bodyR * 0.14,
      fill: loopClosed ? '#a371f7' : '#484f58',
      'font-size': 3,
      'text-anchor': 'middle',
      'font-family': '"Courier New",monospace',
      opacity: 0.6
    }, reflexG).textContent = selfState + (loopClosed ? ' ∞' : '');

    // Wake depth as a thin arc inside null ring
    if (wakeDepth > 0) {
      var wakeAngle = wakeDepth * PI * 2;
      var wr = bodyR * 0.05;
      var wx1 = cx + wr * Math.cos(-PI/2);
      var wy1 = cy + wr * Math.sin(-PI/2);
      var wx2 = cx + wr * Math.cos(-PI/2 + wakeAngle);
      var wy2 = cy + wr * Math.sin(-PI/2 + wakeAngle);
      var wLarge = wakeAngle > PI ? 1 : 0;
      el('path', {
        d: 'M ' + wx1.toFixed(1) + ' ' + wy1.toFixed(1) + ' A ' + wr.toFixed(1) + ' ' + wr.toFixed(1) + ' 0 ' + wLarge + ' 1 ' + wx2.toFixed(1) + ' ' + wy2.toFixed(1),
        fill: 'none', stroke: '#58a6ff', 'stroke-width': 0.5, opacity: 0.5
      }, reflexG);
    }

    // Sense count dots around null center
    for (var si = 0; si < senseCount; si++) {
      var sAngle = -PI/2 + si * (PI*2 / Math.max(senseCount, 1));
      var sr = bodyR * 0.06;
      el('circle', {
        cx: (cx + sr * Math.cos(sAngle)).toFixed(1),
        cy: (cy + sr * Math.sin(sAngle)).toFixed(1),
        r: 0.8, fill: '#58a6ff', opacity: 0.4
      }, reflexG);
    }

    // ═══ TRUST CROSS — the orthogonal structure ═══
    // Reality at 90°: Trust(N) ↔ Verify(S), But-hold(E) ↔ But-wind(W)
    // Observer at 45°: sees both axes, moves on diagonal
    // Front-to-front: push apart (create space)
    // Back-to-back: hold together (create boundary)
    var crossG = el('g', { id: 'mg-trust-cross' }, svgGroup);
    var crossR = bodyRadius(1) * 0.9; // within the ghost body

    // The 4 cardinal arms (90°)
    var CROSS_ARMS = [
      { name: 'trust',      angle: -PI/2, color: '#ffffff', label: '↑ trust' },
      { name: 'verify',     angle:  PI/2, color: '#ffffff', label: '↓ verify' },
      { name: 'but-hold',   angle: 0,     color: '#6e7681', label: '→ but' },
      { name: 'but-wind',   angle: PI,    color: '#6e7681', label: '← but' },
    ];

    CROSS_ARMS.forEach(function(arm) {
      var ax = cx + crossR * Math.cos(arm.angle);
      var ay = cy + crossR * Math.sin(arm.angle);
      // Arm line
      el('line', {
        x1: cx, y1: cy, x2: ax.toFixed(1), y2: ay.toFixed(1),
        stroke: arm.color, 'stroke-width': 0.6,
        'stroke-opacity': 0.15, 'stroke-linecap': 'round',
        id: 'mg-cross-' + arm.name
      }, crossG);
      // Arm label
      el('text', {
        x: (cx + ax) / 2, y: (cy + ay) / 2 - 3,
        fill: arm.color, 'font-size': 3.5,
        'text-anchor': 'middle', opacity: 0.12,
        'font-family': '"Courier New",monospace'
      }, crossG).textContent = arm.label;
    });

    // The 4 diagonal observers (45°)
    var diagR = crossR * 0.7;
    var DIAGS = [
      { angle: -PI/4,       symbol: '◈' },  // NE
      { angle:  PI/4,       symbol: '◈' },  // SE
      { angle:  3*PI/4,     symbol: '◈' },  // SW
      { angle: -3*PI/4,     symbol: '◈' },  // NW
    ];
    DIAGS.forEach(function(d, di) {
      var dx = cx + diagR * Math.cos(d.angle);
      var dy = cy + diagR * Math.sin(d.angle);
      el('circle', {
        cx: dx.toFixed(1), cy: dy.toFixed(1), r: 1.5,
        fill: '#c9d1d9', opacity: 0.1,
        id: 'mg-observer-' + di
      }, crossG);
    });

    // Push/hold arrows — front-to-front and back-to-back
    // Trust-Verify pair: face each other (front-to-front, push apart)
    var pushR = crossR * 0.45;
    el('text', {
      x: cx, y: cy - pushR - 2,
      fill: '#ffffff', 'font-size': 3, 'text-anchor': 'middle', opacity: 0.08,
      'font-family': '"Courier New",monospace'
    }, crossG).textContent = '↓↑'; // face each other arrows
    el('text', {
      x: cx, y: cy + pushR + 5,
      fill: '#ffffff', 'font-size': 3, 'text-anchor': 'middle', opacity: 0.08,
      'font-family': '"Courier New",monospace'
    }, crossG).textContent = '↑↓'; // face each other arrows

    // But pair: back-to-back (hold space)
    el('text', {
      x: cx - pushR - 4, y: cy + 1,
      fill: '#6e7681', 'font-size': 3, 'text-anchor': 'middle', opacity: 0.08,
      'font-family': '"Courier New",monospace'
    }, crossG).textContent = '←→'; // back-to-back
    el('text', {
      x: cx + pushR + 4, y: cy + 1,
      fill: '#6e7681', 'font-size': 3, 'text-anchor': 'middle', opacity: 0.08,
      'font-family': '"Courier New",monospace'
    }, crossG).textContent = '→←'; // back-to-back

    // ═══ PANGAEA — sites as continents ═══
    // At center: all sites converge (the primordial landmass)
    // At surface: they've drifted apart to their own positions
    var pangaeaG = el('g', { id: 'mg-pangaea-continents' }, svgGroup);

    CONTINENTS.forEach(function(cont) {
      var surfaceR = bodyRadius(PI3) * 0.85;
      var sx = cx + surfaceR * Math.cos(cont.angle);
      var sy = cy + surfaceR * Math.sin(cont.angle);

      // Drift line: center → surface position (the continental drift)
      el('line', {
        x1: cx, y1: cy, x2: sx.toFixed(1), y2: sy.toFixed(1),
        stroke: cont.color, 'stroke-width': 0.4,
        'stroke-opacity': 0.08, 'stroke-dasharray': '2,6',
        id: 'mg-drift-' + cont.name
      }, pangaeaG);

      // Continent dot at surface
      el('circle', {
        cx: sx.toFixed(1), cy: sy.toFixed(1), r: 3,
        fill: cont.color, opacity: 0.25,
        id: 'mg-cont-' + cont.name
      }, pangaeaG);

      // Continent label
      var labelR = surfaceR + 10;
      var lx = cx + labelR * Math.cos(cont.angle);
      var ly = cy + labelR * Math.sin(cont.angle);
      el('text', {
        x: lx.toFixed(1), y: ly.toFixed(1),
        fill: cont.color, 'font-size': 6,
        'text-anchor': 'middle', opacity: 0.3,
        'font-family': '"Courier New",monospace',
        id: 'mg-cont-label-' + cont.name
      }, pangaeaG).textContent = cont.name;
    });

    // ═══ UNFURL — real data flowing through π layers ═══
    // Entities enter at null, classify through each body, emerge sorted.
    // The scan-sweep-sort pipeline IS the unfurling.
    unfurlGroup = el('g', { id: 'mg-unfurl' }, svgGroup);

    // Process verb labels along the radii
    var STAGES = [
      { name: 'scan',      r: 0.15, color: '#ffffff' },
      { name: 'sweep',     r: 0.35, color: '#58a6ff' },
      { name: 'sort',      r: 0.55, color: '#5ab87a' },
      { name: 'fossilize', r: 0.75, color: '#f0e68c' },
      { name: 'evolve',    r: 0.95, color: '#d2a8ff' },
    ];
    STAGES.forEach(function(st, i) {
      var stAngle = -PI / 2 + i * 0.25;
      var stR = bodyRadius(PI3) * st.r;
      var sx = cx + stR * Math.cos(stAngle);
      var sy = cy + stR * Math.sin(stAngle);
      el('text', {
        x: sx.toFixed(1), y: sy.toFixed(1),
        fill: st.color, 'font-size': 4.5,
        'text-anchor': 'middle', opacity: 0.12,
        'font-style': 'italic',
        'font-family': '"Courier New",monospace',
        id: 'mg-stage-' + st.name
      }, unfurlGroup).textContent = st.name;
    });

    // ═══ CELESTIAL — what humans see when they look up ═══
    // Above π³ (the surface where humans stand):
    //   system  (rFrac 1.32) — the solar system, the orbits
    //   Oort    (rFrac 1.55) — the edge, the boundary with interstellar
    // The complexity spine already has these tiers. We add the bodies.
    var celestialG = el('g', { id: 'mg-celestial' }, svgGroup);

    var systemR = R * 1.32;
    var oortR = R * 1.55;

    // Solar orbit ring
    el('circle', {
      cx: cx, cy: cy, r: systemR.toFixed(1),
      fill: 'none', stroke: '#f0e68c',
      'stroke-width': 0.5, 'stroke-opacity': 0.08,
      'stroke-dasharray': '4,8',
      id: 'mg-system-orbit'
    }, celestialG);

    // Oort cloud boundary
    el('circle', {
      cx: cx, cy: cy, r: oortR.toFixed(1),
      fill: 'none', stroke: '#484f58',
      'stroke-width': 0.4, 'stroke-opacity': 0.06,
      'stroke-dasharray': '1,6',
      id: 'mg-oort-boundary'
    }, celestialG);

    // Celestial bodies — planets orbiting between surface and Oort
    var PLANETS = [
      { name: '☿', r: 1.05, size: 1.5, color: '#8b949e', speed: 4.15 },
      { name: '♀', r: 1.10, size: 2.0, color: '#f0e68c', speed: 1.62 },
      { name: '♂', r: 1.18, size: 1.8, color: '#e85d3a', speed: 0.53 },
      { name: '♃', r: 1.28, size: 3.5, color: '#f0883e', speed: 0.084 },
      { name: '♄', r: 1.38, size: 3.0, color: '#d29922', speed: 0.034 },
      { name: '⛢', r: 1.45, size: 2.2, color: '#58a6ff', speed: 0.012 },
      { name: '♆', r: 1.52, size: 2.0, color: '#4a8fb8', speed: 0.006 },
    ];

    PLANETS.forEach(function(p, i) {
      // Orbit path
      var orbitR = R * p.r;
      el('circle', {
        cx: cx, cy: cy, r: orbitR.toFixed(1),
        fill: 'none', stroke: p.color,
        'stroke-width': 0.2, 'stroke-opacity': 0.04,
        id: 'mg-orbit-' + i
      }, celestialG);

      // Planet dot (will be animated)
      el('circle', {
        cx: (cx + orbitR).toFixed(1), cy: cy,
        r: p.size.toFixed(1),
        fill: p.color, opacity: 0.25,
        id: 'mg-planet-' + i
      }, celestialG);
    });

    // Store for animation
    svgGroup._planets = PLANETS;

    // Sun label at center (looking up, the sun is behind you)
    el('text', {
      x: cx, y: cy - R * 1.05 - 8,
      fill: '#f0e68c', 'font-size': 6,
      'text-anchor': 'middle', opacity: 0.2,
      'font-family': '"Courier New",monospace'
    }, celestialG).textContent = '↑ system · what humans see looking up';

    el('text', {
      x: cx, y: cy + oortR + 12,
      fill: '#484f58', 'font-size': 5,
      'text-anchor': 'middle', opacity: 0.15,
      'font-family': '"Courier New",monospace'
    }, celestialG).textContent = 'oort boundary';

    // ═══ ZOOM OUT — beyond Oort toward Milky Way ═══
    var zoomStep = R * 0.15;
    var DEEP_TIERS = [
      { name: 'interstellar', r: oortR + zoomStep,     color: '#4a8fb8', label: 'interstellar medium' },
      { name: 'local-bubble', r: oortR + zoomStep * 2, color: '#2d4a6e', label: 'Local Bubble \u00b7 1000 ly' },
      { name: 'orion-arm',    r: oortR + zoomStep * 3, color: '#1a3050', label: 'Orion Arm \u00b7 3500 ly' },
      { name: 'milky-way',    r: oortR + zoomStep * 4, color: '#0f1d2d', label: 'Milky Way \u00b7 100000 ly' },
    ];

    DEEP_TIERS.forEach(function(tier, ti) {
      el('circle', {
        cx: cx, cy: cy, r: tier.r.toFixed(1),
        fill: 'none', stroke: tier.color,
        'stroke-width': 0.3, 'stroke-opacity': 0.04,
        'stroke-dasharray': (ti + 1) + ',' + (8 + ti * 2),
        id: 'mg-tier-' + tier.name
      }, celestialG);
      el('text', {
        x: cx, y: cy + tier.r + 8,
        fill: tier.color, 'font-size': 4,
        'text-anchor': 'middle', opacity: 0.08,
        'font-family': '"Courier New",monospace'
      }, celestialG).textContent = tier.label;
    });

    // ═══ SUN + LIGHT — illumination zones ═══
    // Sun at top between system and Oort
    // Red (IS/warm) right, Green (WILLBE/growing) left, Blue (WAS/sterile) below
    var sunR2 = systemR + (oortR - systemR) * 0.3;
    var sunAngle2 = -PI / 2;
    var sunX2 = cx + sunR2 * Math.cos(sunAngle2);
    var sunY2 = cy + sunR2 * Math.sin(sunAngle2);

    el('circle', {
      cx: sunX2, cy: sunY2, r: 8,
      fill: '#f0e68c', opacity: 0.08, filter: 'url(#mg-glow)',
      id: 'mg-sun-glow'
    }, celestialG);
    el('circle', {
      cx: sunX2, cy: sunY2, r: 3,
      fill: '#f0e68c', opacity: 0.35, id: 'mg-sun'
    }, celestialG);
    el('text', {
      x: sunX2, y: sunY2 - 12,
      fill: '#f0e68c', 'font-size': 5,
      'text-anchor': 'middle', opacity: 0.25,
      'font-family': '"Courier New",monospace'
    }, celestialG).textContent = '\u2609 sol';

    // Light wedges: IS(warm/red) right, WILLBE(grow/green) left, WAS(sterile/blue) opposite
    var lightR2 = oortR + zoomStep * 2;
    [
      { a: sunAngle2 - 0.8, color: '#e85d3a' },
      { a: sunAngle2 + 0.8, color: '#5ab87a' },
      { a: sunAngle2 + PI,  color: '#4a8fb8' },
    ].forEach(function(w) {
      var sp = 0.3;
      var x1 = cx + lightR2 * Math.cos(w.a - sp);
      var y1 = cy + lightR2 * Math.sin(w.a - sp);
      var x2 = cx + lightR2 * Math.cos(w.a + sp);
      var y2 = cy + lightR2 * Math.sin(w.a + sp);
      el('path', {
        d: 'M ' + sunX2 + ',' + sunY2 +
           ' L ' + x1.toFixed(1) + ',' + y1.toFixed(1) +
           ' A ' + lightR2.toFixed(1) + ',' + lightR2.toFixed(1) + ' 0 0 1 ' +
           x2.toFixed(1) + ',' + y2.toFixed(1) + ' Z',
        fill: w.color, opacity: 0.015
      }, celestialG);
    });

    // Milky Way label — tilted at the edge
    var mwR2 = oortR + zoomStep * 4;
    el('text', {
      x: cx + mwR2 * 0.7, y: cy - mwR2 * 0.7,
      fill: '#484f58', 'font-size': 6,
      'text-anchor': 'middle', opacity: 0.06,
      'font-family': '"Courier New",monospace',
      transform: 'rotate(-45 ' + Math.round(cx + mwR2*0.7) + ' ' + Math.round(cy - mwR2*0.7) + ')'
    }, celestialG).textContent = '\u2736 milky way';


    // ═══ CLOCK HANDS — 3 working, 1 at rest ═══
    // A clock face: 4 quadrants (12,3,6,9 o'clock)
    // 3 hands sweep doing work (scan, sort, connect)
    // The 4th quadrant rests — receives new data
    // Trust: bright near hand, dims with distance, collapses on sweep
    var clockG = el('g', { id: 'mg-clock-hands' }, svgGroup);
    handLen = bodyRadius(PI3) * 0.95;

    // The 3 hands: scan (white), sort (green), connect (blue)
    var HANDS = [
      { name: 'scan',    color: '#ffffff', width: 1.0, speed: 1.0,  offset: 0 },
      { name: 'sort',    color: '#3fb950', width: 0.8, speed: 0.618, offset: 2*PI/3 },
      { name: 'connect', color: '#58a6ff', width: 0.6, speed: 0.382, offset: 4*PI/3 },
    ];

    HANDS.forEach(function(h, i) {
      // Hand line
      el('line', {
        x1: cx, y1: cy,
        x2: cx, y2: cy - handLen,
        stroke: h.color, 'stroke-width': h.width,
        'stroke-opacity': 0.12, 'stroke-linecap': 'round',
        id: 'mg-hand-' + h.name
      }, clockG);

      // Trust cone: a triangle showing awareness spread from the hand
      el('path', {
        d: 'M ' + cx + ',' + cy + ' L ' + cx + ',' + cy,
        fill: h.color, opacity: 0.02,
        id: 'mg-trust-' + h.name
      }, clockG);
    });

    // Rest indicator (the 4th quadrant — where the gap is)
    el('text', {
      x: cx, y: cy,
      fill: '#484f58', 'font-size': 5,
      'text-anchor': 'middle', opacity: 0,
      'font-family': '"Courier New",monospace',
      id: 'mg-rest-label'
    }, clockG).textContent = '◌ rest';

    svgGroup._hands = HANDS;
    svgGroup._clockG = clockG;

    // ═══ BUBBLE GROUP — data bubbling outward ═══
    bubbleGroup = el('g', { id: 'mg-bubbles' }, svgGroup);

    built = true;
  }

  // Shared context for pt-pangaea-live.js
  var _ctx = {
    el: el, PI: PI, PI2: PI2, PI3: PI3, NS: NS,
    BODIES: BODIES, CONTINENTS: CONTINENTS, EPITOPE_DEPTH: EPITOPE_DEPTH,
    SORT_COLORS: SORT_COLORS, MAX_BUBBLES: MAX_BUBBLES,
    bodyRadius: bodyRadius,
    bubbles: bubbles,
    get svgGroup() { return svgGroup; }, set svgGroup(v) { svgGroup = v; },
    get bubbleGroup() { return bubbleGroup; }, set bubbleGroup(v) { bubbleGroup = v; },
    get unfurlGroup() { return unfurlGroup; }, set unfurlGroup(v) { unfurlGroup = v; },
    get built() { return built; }, set built(v) { built = v; },
    get lastFrame() { return lastFrame; }, set lastFrame(v) { lastFrame = v; },
    get humanData() { return humanData; }, set humanData(v) { humanData = v; },
    get sortData() { return sortData; }, set sortData(v) { sortData = v; },
    get R() { return R; }, set R(v) { R = v; },
    get cx() { return cx; }, set cx(v) { cx = v; },
    get cy() { return cy; }, set cy(v) { cy = v; },
    get handLen() { return handLen; }, set handLen(v) { handLen = v; },
    get _mc() { return _mc; }, set _mc(v) { _mc = v; },
  };
  window._ptPangaeaCtx = _ctx;


  // Expose for external use — live functions added by pt-pangaea-live.js
  window.PtPangaea = {
    build: build,
    BODIES: BODIES,
    CONTINENTS: CONTINENTS,
    EPITOPE_DEPTH: EPITOPE_DEPTH,
    SORT_COLORS: SORT_COLORS,
  };
})();
