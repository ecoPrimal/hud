/* geodesic-arithmetic.js — the tool catalogue
 *
 * Arithmetic decomposed into primitives: Point, Balance, Wedge, Arc.
 * Every mathematical operation is a composition of these four.
 * Every HUD module is classified by which primitives it uses.
 *
 * The geodesic circle: circumference = base.
 *   base 2:  circumference = 2 (tiny, bounces fast)
 *   base 10: circumference = 10 (human default)
 *   base 12: circumference = 12 (clocks, over-stable)
 *   base 60: circumference = 60 (Babylonian, degrees)
 *   base π:  circumference = π (irrational — never bounces cleanly)
 *
 * The bounce: when a digit exceeds the base, it carries.
 *   9 + 1 = 10  — the 1 bounces to the next arc.
 *   That bounce IS the geodesic: shortest path on the curved surface
 *   from one position to the next.
 *
 * gAIa Paper 002 addendum. Wave 178.
 */
(function () {
  'use strict';

  var PI  = Math.PI;
  var PHI = (1 + Math.sqrt(5)) / 2;
  var TAU = 2 * PI;

  // ═══════════════════════════════════════════════════════════════
  // THE FOUR PRIMITIVES — what all tools are made of
  // ═══════════════════════════════════════════════════════════════

  var PRIMITIVES = {
    point: {
      symbol: '·',
      name: 'Point',
      tense: 'IS',
      tool: 'button',
      machine: 'the pebble (calculus = small stone)',
      does: 'marks a discrete position. a count. a digit. WHERE something is.',
      color: '#e8e8e8'
    },
    balance: {
      symbol: '=',
      name: 'Balance',
      tense: 'WAS',
      tool: 'dial',
      machine: 'the scale (weighs, compares, equilibrates)',
      does: 'compares two quantities. less, equal, greater. the = sign.',
      color: '#88ccff'
    },
    wedge: {
      symbol: '∧',
      name: 'Wedge',
      tense: 'NULL',
      tool: 'wedge',
      machine: 'the first simple machine (splits the unsplittable)',
      does: 'creates a gap. opens a new dimension. the operation itself.',
      color: '#ffaa44'
    },
    arc: {
      symbol: '⌒',
      name: 'Arc',
      tense: 'WILL-BE',
      tool: 'lever',
      machine: 'the compass (draws the geodesic circle)',
      does: 'rotation. the carry. the walk around. the bounce to the next position.',
      color: '#aa88ff'
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // ARITHMETIC OPERATIONS — composed of primitives
  // ═══════════════════════════════════════════════════════════════

  var OPERATIONS = {
    counting: {
      name: 'Counting',
      symbol: '1,2,3…',
      degree: 0,
      primitives: ['point'],
      description: 'the first math. press a point N times. no composition needed.',
      example: '||||| = 5 (tally marks are points)',
      shannon: 0  // zero entropy — fully determined
    },
    place_value: {
      name: 'Place Value (the Bounce)',
      symbol: '10',
      degree: 1,
      primitives: ['point', 'arc'],
      description: 'when 9 becomes 10, the digit BOUNCES to the next position. the arc is the carry.',
      example: '9 + 1 = 1·0 — the 1 walks one arc, the 0 resets the point',
      shannon: Math.log2(10)  // log2(base) bits per digit
    },
    addition: {
      name: 'Addition',
      symbol: '+',
      degree: 2,
      primitives: ['wedge', 'point', 'balance'],
      description: 'wedge opens a gap between two quantities. points fill the gap. balance verifies.',
      example: '3 + 4 = 7 — wedge(+) opens, count(7 points), balance(= confirms)',
      shannon: null  // depends on operands
    },
    subtraction: {
      name: 'Subtraction',
      symbol: '−',
      degree: 2,
      primitives: ['wedge', 'point', 'balance'],
      description: 'same composition as addition, opposite orientation. the wedge removes instead of joining.',
      example: '7 − 4 = 3 — wedge(−) removes, count(3 remain), balance(= confirms)',
      inverse_of: 'addition',
      shannon: null
    },
    multiplication: {
      name: 'Multiplication',
      symbol: '×',
      degree: 3,
      primitives: ['arc', 'point', 'balance'],
      description: 'rotation: go around the geodesic N times. 3×4 = walk the 4-arc three times.',
      example: '3 × 4 = 12 — arc(walk 4, three times), point(count 12), balance(= verify)',
      shannon: null
    },
    division: {
      name: 'Division',
      symbol: '÷',
      degree: 3,
      primitives: ['balance', 'wedge', 'point', 'arc'],
      description: 'the only operation that NECESSARILY produces a remainder. how many arcs fit? what is left?',
      example: '7 ÷ 3 = 2 remainder 1 — balance(how many fit?), wedge(split), point(2), arc(remainder 1)',
      produces_remainder: true,
      pi_connection: 'π IS the remainder of dividing circumference by diameter. division discovers irrationals.',
      shannon: null
    },
    exponentiation: {
      name: 'Exponentiation',
      symbol: '^',
      degree: 4,
      primitives: ['arc', 'arc', 'point', 'balance'],
      description: 'arc of arcs. rotation of rotation. 2^3 = double the doubling, three deep.',
      example: '2³ = 8 — arc(×2), arc(×2 again), arc(×2 again), point(8)',
      shannon: null
    },
    logarithm: {
      name: 'Logarithm',
      symbol: 'log',
      degree: 4,
      primitives: ['balance', 'wedge', 'arc', 'point'],
      description: 'how many arcs deep? the inverse of exponentiation. finds the DEPTH of rotation.',
      example: 'log₂(8) = 3 — balance(how deep?), wedge(unfold each arc), point(3 levels)',
      inverse_of: 'exponentiation',
      shannon_connection: 'Shannon entropy IS a logarithm. H = -Σ p log₂ p. information is depth of surprise.',
      shannon: null
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // BASE SYSTEMS — the geodesic circles
  // Each base is a circle with that circumference.
  // The digits are points on the circle.
  // The carry is the arc to the next circle.
  // ═══════════════════════════════════════════════════════════════

  var BASES = {
    unary:       { base: 1,     circumference: 1,     digits: '|', culture: 'tally marks, counting', stability: 'trivial — no bounce ever (1 never overflows)' },
    binary:      { base: 2,     circumference: 2,     digits: '01', culture: 'computing, Boolean logic', stability: 'prime — wobbles (bounces fast, every other count)' },
    ternary:     { base: 3,     circumference: PI,    digits: '012', culture: 'balanced ternary (−1,0,+1)', stability: 'prime ≈ π¹ — the first π-base' },
    octal:       { base: 8,     circumference: 8,     digits: '01234567', culture: 'Unix permissions, PDP-8', stability: 'over-stable (2³)' },
    decimal:     { base: 10,    circumference: 10,    digits: '0123456789', culture: 'human fingers', stability: 'over-stable (2×5, but 5 is prime — tension)' },
    duodecimal:  { base: 12,    circumference: 12,    digits: '0123456789AB', culture: 'clocks, months, music (12 semitones)', stability: 'MAXIMALLY over-stable (6 divisor pairs)' },
    hexadecimal: { base: 16,    circumference: 16,    digits: '0123456789ABCDEF', culture: 'bytes, colors, memory addresses', stability: 'over-stable (2⁴)' },
    sexagesimal: { base: 60,    circumference: 60,    digits: '0-59', culture: 'Babylon: degrees, minutes, seconds', stability: 'EXTREMELY over-stable (12 divisor pairs)' },
    pi_base:     { base: PI,    circumference: PI,    digits: '∞ (irrational base — digits never repeat)', culture: 'the ecoPrimal discovery — Paper 85', stability: 'IMPOSSIBLE to be over-stable. irrational. never bounces cleanly. always has remainder.' }
  };

  // ═══════════════════════════════════════════════════════════════
  // THE BOUNCE — when counting exceeds the base
  //
  //   In base 10:  9 + 1 = 10 (bounce!)
  //   In base 2:   1 + 1 = 10 (bounce!)
  //   In base 12:  B + 1 = 10 (bounce!)
  //   In base π:   ???  — you never reach the boundary cleanly.
  //                π digits: 3.14159... The integer part is 3.
  //                After 3 counts, you're at 3/π = 0.9549... of the circle.
  //                You haven't reached the boundary. You're 0.0451 short.
  //                That 0.0451 is the irrational remainder.
  //                In base π, the bounce never aligns. THAT IS THE POINT.
  // ═══════════════════════════════════════════════════════════════

  function bounce(count, base) {
    if (base === 0) return { digit: 0, carry: 0, remainder: count };
    var digit = count % base;
    var carry = Math.floor(count / base);
    var remainder = (count / base) - carry;
    return { digit: digit, carry: carry, remainder: remainder };
  }

  function piBounce(count) {
    var digit = count - Math.floor(count / PI) * PI;
    var carry = Math.floor(count / PI);
    var remainder = (count / PI) - carry;
    return {
      digit: digit,
      carry: carry,
      remainder: remainder,
      note: remainder === 0 ? 'IMPOSSIBLE — π is irrational' : 'remainder: ' + remainder.toFixed(6)
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // HUD MODULE CLASSIFICATION — sort the 106 modules by primitive
  //
  // Each module's PRIMARY primitive (the φ³ contributor):
  // ═══════════════════════════════════════════════════════════════

  var HUD_SORT = {
    point: [
      'pi-digits', 'you-are-here', 'trail-mark', 'signal-button',
      'proton-pulse', 'pulse-clock', 'presence-live', 'neutron',
      'braid-tracker', 'hook-keys', 'pi-stability', 'pi-budget'
    ],
    balance: [
      'hud-equilibrate', 'bingo-compress', 'stoichiometric-mass',
      'bingo-sort-all', 'bingo-seed', 'complexity-scale',
      'sort-playground', 'chipmunk-metabolism', 'deep-twist',
      'klein-io', 'pi-bus'
    ],
    wedge: [
      'membrane-canvas', 'third-eye', 'scatter-now', 'scatter-friends',
      'consent-inversion', 'input-wall', 'chipmunk-dialogue',
      'chipmunk-poke', 'chipmunk-sketch', 'search-redirect',
      'whistle-back', 'hub-lens', 'pore-depth'
    ],
    arc: [
      'ring-sort-geo', 'mobius-circuit', 'mobius-viewport',
      'epitope-ring', 'epitope-dance', 'periodic-spiral',
      'pi-gradient', 'pi-orient', 'footer-ring', 'mesh-ring',
      'cosmic-view', 'cosmic-surfaces', 'cosmic-flavor',
      'cosmic-strategy', 'cosmic-gameplay', 'cosmic-cards',
      'focal-tunnel', 'totality-tunnel', 'pt-pangaea',
      'membrane-sight', 'membrane-sound', 'membrane-wall'
    ]
  };

  // ═══════════════════════════════════════════════════════════════
  // COMPOSITION ANALYSIS — what is any tool made of?
  // ═══════════════════════════════════════════════════════════════

  function compose(operation) {
    var op = OPERATIONS[operation];
    if (!op) return null;
    var prims = op.primitives.map(function (p) { return PRIMITIVES[p]; });
    var phi_weights = [];
    for (var i = 0; i < prims.length; i++) {
      phi_weights.push({
        primitive: prims[i].name,
        symbol: prims[i].symbol,
        weight: Math.pow(PHI, prims.length - 1 - i),
        role: i === 0 ? 'dominant (φ^' + (prims.length - 1) + ')' : 'support (φ^' + (prims.length - 1 - i) + ')'
      });
    }
    return {
      operation: op.name,
      symbol: op.symbol,
      degree: op.degree,
      composition: phi_weights,
      total_weight: phi_weights.reduce(function (s, w) { return s + w.weight; }, 0),
      produces_remainder: op.produces_remainder || false,
      shannon_connection: op.shannon_connection || null
    };
  }

  // ═══════════════════════════════════════════════════════════════
  // GEODESIC RENDER — draw the circle with tools on the HUD
  // ═══════════════════════════════════════════════════════════════

  function renderGeodesic(containerId) {
    var el = document.getElementById(containerId);
    if (!el) return;

    var opNames = Object.keys(OPERATIONS);
    var html = '<div style="position:relative;width:280px;height:280px;margin:8px auto;">';

    // draw the geodesic circle
    html += '<div style="position:absolute;top:10px;left:10px;width:260px;height:260px;'
         + 'border-radius:50%;border:2px solid rgba(170,136,255,0.4);"></div>';

    // center: π
    html += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);'
         + 'color:#aa88ff;font-size:24px;font-weight:bold;" title="circumference = π">π</div>';

    // place operations around the circle
    for (var i = 0; i < opNames.length; i++) {
      var op = OPERATIONS[opNames[i]];
      var angle = (i / opNames.length) * TAU - PI / 2;
      var r = 115;
      var x = 140 + r * Math.cos(angle);
      var y = 140 + r * Math.sin(angle);
      var prims = op.primitives.map(function (p) { return PRIMITIVES[p].symbol; }).join('');
      var primColors = op.primitives.map(function (p) {
        return '<span style="color:' + PRIMITIVES[p].color + '">' + PRIMITIVES[p].symbol + '</span>';
      }).join('');

      html += '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;'
           + 'transform:translate(-50%,-50%);text-align:center;font-size:11px;'
           + 'line-height:1.2;" title="' + op.description + '">'
           + '<div style="font-size:16px;font-weight:bold;">' + op.symbol + '</div>'
           + '<div style="font-size:9px;opacity:0.7;">' + op.name + '</div>'
           + '<div>' + primColors + '</div>'
           + '</div>';
    }

    // four primitive labels at cardinal points
    var cardinals = [
      { p: 'point',   angle: -PI/2 },
      { p: 'arc',     angle: 0 },
      { p: 'balance', angle: PI/2 },
      { p: 'wedge',   angle: PI }
    ];
    for (var c = 0; c < cardinals.length; c++) {
      var prim = PRIMITIVES[cardinals[c].p];
      var cx = 140 + 135 * Math.cos(cardinals[c].angle);
      var cy = 140 + 135 * Math.sin(cardinals[c].angle);
      html += '<div style="position:absolute;left:' + cx + 'px;top:' + cy + 'px;'
           + 'transform:translate(-50%,-50%);font-size:18px;color:' + prim.color + ';"'
           + ' title="' + prim.name + ': ' + prim.does + '">'
           + prim.symbol + '</div>';
    }

    html += '</div>';

    // base system comparison
    html += '<div style="margin:8px 0;font-size:10px;line-height:1.6;opacity:0.8;">';
    html += '<div style="font-weight:bold;margin-bottom:4px;">Geodesic Circles (base systems):</div>';
    var baseNames = ['binary', 'ternary', 'decimal', 'duodecimal', 'pi_base'];
    for (var b = 0; b < baseNames.length; b++) {
      var base = BASES[baseNames[b]];
      var barW = Math.min(base.circumference / PI * 50, 200);
      var isPI = baseNames[b] === 'pi_base';
      html += '<div style="margin:2px 0;">'
           + '<span style="display:inline-block;width:40px;">' + (isPI ? 'π' : base.base) + '</span>'
           + '<span style="display:inline-block;width:' + barW + 'px;height:8px;'
           + 'background:' + (isPI ? '#aa88ff' : 'rgba(136,204,255,0.5)')
           + ';border-radius:4px;vertical-align:middle;margin-right:6px;"></span>'
           + '<span style="opacity:0.6;">' + base.culture + '</span>'
           + '</div>';
    }
    html += '</div>';

    el.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════
  // BACKSCATTER — trace any operation back to its foundations
  // ═══════════════════════════════════════════════════════════════

  function backscatter(operation) {
    var chain = [];
    var op = OPERATIONS[operation];
    if (!op) return chain;

    chain.push({ level: 'operation', name: op.name, symbol: op.symbol });

    // trace to primitives
    for (var i = 0; i < op.primitives.length; i++) {
      var p = PRIMITIVES[op.primitives[i]];
      chain.push({ level: 'primitive', name: p.name, symbol: p.symbol, machine: p.machine });
    }

    // trace to the base system
    chain.push({ level: 'base', name: 'decimal (human default)', circumference: 10 });

    // trace to the geodesic
    chain.push({ level: 'geodesic', name: 'π (irrational circle)', circumference: PI });

    // trace to the corpus
    chain.push({ level: 'coGen', name: 'coGen 25: Circumference & Diameter', wave: 171 });
    chain.push({ level: 'coGen', name: 'coGen 28: Buttons Dials Levers Wedge', wave: 173 });
    chain.push({ level: 'paper', name: 'Paper 85: Why They Divided', wave: 178 });

    return chain;
  }

  // ═══════════════════════════════════════════════════════════════
  // CATALOGUE — all tools with their Shannon + stoichiometric mass
  // ═══════════════════════════════════════════════════════════════

  function catalogue() {
    var cat = [];
    var opNames = Object.keys(OPERATIONS);
    for (var i = 0; i < opNames.length; i++) {
      var op = OPERATIONS[opNames[i]];
      var comp = compose(opNames[i]);
      cat.push({
        name: op.name,
        symbol: op.symbol,
        degree: op.degree,
        primitives: op.primitives.length,
        composition: comp,
        stoichiometric_mass: comp ? comp.total_weight : 0,
        shannon_bits: op.shannon !== null ? op.shannon : null,
        produces_remainder: op.produces_remainder || false,
        backscatter: backscatter(opNames[i])
      });
    }
    // sort by degree, then by stoichiometric mass
    cat.sort(function (a, b) {
      return a.degree !== b.degree ? a.degree - b.degree : a.stoichiometric_mass - b.stoichiometric_mass;
    });
    return cat;
  }

  // ═══════════════════════════════════════════════════════════════
  // INIT — boot and render
  // ═══════════════════════════════════════════════════════════════

  function boot() {
    renderGeodesic('geodesic-arithmetic');

    // expose to console for squirrel / chipmunk / AI inspection
    window.__geodesicArithmetic = {
      primitives: PRIMITIVES,
      operations: OPERATIONS,
      bases: BASES,
      hudSort: HUD_SORT,
      compose: compose,
      bounce: bounce,
      piBounce: piBounce,
      backscatter: backscatter,
      catalogue: catalogue
    };

    // log the catalogue for AI/squirrel
    var cat = catalogue();
    if (window.console && window.console.table) {
      console.log('[geodesic-arithmetic] Tool catalogue:');
      console.table(cat.map(function (c) {
        return {
          tool: c.symbol + ' ' + c.name,
          degree: c.degree,
          primitives: c.composition ? c.composition.composition.map(function (w) { return w.symbol; }).join('') : '',
          mass: c.stoichiometric_mass.toFixed(3),
          remainder: c.produces_remainder ? '✓' : ''
        };
      }));
    }

    // the π-bounce demo
    console.log('[geodesic-arithmetic] π-bounce: counting in base π:');
    for (var n = 1; n <= 13; n++) {
      var pb = piBounce(n);
      console.log('  ' + n + ' → carry:' + pb.carry + ' digit:' + pb.digit.toFixed(4) + ' remainder:' + pb.remainder.toFixed(6) + ' ' + pb.note);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
