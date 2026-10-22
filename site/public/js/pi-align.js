/* pi-align.js — align all π-components through their irreconcilable remainders
 *
 * The π-comps:
 *   pi-body-clock  — 4 layers at 1/πⁿ Hz, CW/CCW twist
 *   pi-step-dance  — Shannon entropy, WAS→IS→NOW→NEXT, sensation/pressure
 *   pi-budget      — capacity at πⁿ scales, always has irrational remainder
 *   permeability   — gradient composition, osmosis, clines
 *   klein-prism    — white→spectrum→null→grey, fold inverts
 *
 * They NEVER align perfectly. π is irrational.
 * That's the point. The remainder IS the unique signal.
 * But they can ALMOST align — and those near-alignments are events.
 *
 * Like planets in syzygy: the alignment is the event,
 * the misalignment is normal, and perfect alignment is impossible.
 *
 * The irreconcilable remainder:
 *   π¹ remainder = 0.14159... (large — 14% headroom)
 *   π² remainder = 0.8696...  (huge — 87% headroom!)
 *   π³ remainder = 0.0063...  (tiny — 0.6% headroom — TIGHTEST)
 *   π⁴ remainder = 0.4091...  (medium — 41%)
 *   π⁵ remainder = 0.0197...  (small — 2%)
 *
 * When π³ almost fills (0.6% remainder), that's PRESSURE.
 * When π² has huge remainder (87%), that's SPACE.
 * The oscillation between tight and loose IS the breathing.
 *
 * PERSPECTIVE MODES:
 *   JUMP   — discrete leap between layers (integer depth 0,1,2,3,4)
 *   BOUNCE — π-bounce between layers (continuous depth 0.0→4.0)
 *   JIG    — oscillation within a layer (wobble around your depth)
 *
 * VIEW MODES:
 *   INSIDE — you're in the membrane, looking out (pangaea perspective)
 *   OUTSIDE — you're outside, looking in (ionosphere perspective)
 *   GAME — you're the player, the membrane is the board
 *
 * The blink: toggle between inside and outside.
 * The think: process what you see from current perspective.
 * The jig: dance within your layer while the others rotate around you.
 *
 * Wave 180. The alignment IS the misalignment.
 */
(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══════════════════════════════════════════════════════════
  // REMAINDERS — the irrational leftover at each π-scale
  // These never align. They oscillate. That's the breathing.
  // ═══════════════════════════════════════════════════════════
  var SCALES = [
    { power: 1, budget: PI,             whole: 3,   remainder: PI - 3,             name: 'datum'   },
    { power: 2, budget: PI * PI,        whole: 9,   remainder: PI * PI - 9,        name: 'pattern' },
    { power: 3, budget: PI * PI * PI,   whole: 31,  remainder: PI * PI * PI - 31,  name: 'connect' },
    { power: 4, budget: Math.pow(PI,4), whole: 97,  remainder: Math.pow(PI,4) - 97, name: 'thought'},
    { power: 5, budget: Math.pow(PI,5), whole: 306, remainder: Math.pow(PI,5) - 306, name: 'body'  },
  ];

  // ═══════════════════════════════════════════════════════════
  // PERSPECTIVE STATE
  // ═══════════════════════════════════════════════════════════
  var perspective = {
    mode: 'bounce',     // jump | bounce | jig
    view: 'game',       // inside | outside | game
    depth: 1.0,         // continuous depth (0.0 = ionosphere, 4.0 = pangaea)
    wobble: 0,          // jig amplitude
    blinks: 0,          // how many times view has been toggled
    thinks: 0,          // how many alignment events processed
  };

  // ═══════════════════════════════════════════════════════════
  // ALIGNMENT CHECK — how close are all π-comps to resonance?
  // ═══════════════════════════════════════════════════════════
  function alignment() {
    var clock = window._piBodyClock;
    var dance = window._piStepDance;
    var perm = window._permeability;
    var prism = window._kleinPrism;
    var budget = window._piBudget;

    // Collect phase angles from each system
    var phases = {};

    // Clock: get current CW/CCW angles
    if (clock && clock.unlocks) {
      var u = clock.unlocks();
      phases.clock_unlocks = u.count;
      phases.clock_phase = u.count * PI; // each unlock = π radians of phase
    }

    // Dance: get current step and entropy
    if (dance && dance.tense) {
      var t = dance.tense();
      phases.dance_step = t.step || 0;
      phases.dance_sensation = t.now ? (t.now.sensation || {}).total || 0 : 0;
      phases.dance_pressure = t.now ? (t.now.pressure || {}).magnitude || 0 : 0;
    }

    // Permeability: get gradient at current depth
    if (perm && perm.gradientAt) {
      var g = perm.gradientAt(perspective.depth);
      phases.perm_O2 = g.O2;
      phases.perm_salt = g.salinity;
      phases.perm_light = g.light;
      phases.perm_conduct = g.conductivity;
    }

    // Prism: get current signal level
    if (prism && prism.signal) {
      phases.prism_signal = prism.signal();
    }

    // Compute alignment score: how close are the phases to a common multiple of π?
    var values = Object.values(phases).filter(function (v) { return typeof v === 'number' && !isNaN(v); });
    if (values.length < 2) return { score: 0, phases: phases, resonance: 'silent' };

    // Each value mod π — how close to a π-multiple?
    var piResiduals = values.map(function (v) {
      var mod = Math.abs(v) % PI;
      return Math.min(mod, PI - mod); // distance to nearest π-multiple
    });

    // Average residual: 0 = perfect alignment (impossible), PI/2 = maximum misalignment
    var avgResidual = piResiduals.reduce(function (s, r) { return s + r; }, 0) / piResiduals.length;

    // Score: 0 = misaligned, 1 = aligned
    var score = 1 - (avgResidual / (PI / 2));

    var resonance = score > 0.9 ? 'HARMONIC'
      : score > 0.7 ? 'resonant'
      : score > 0.5 ? 'beating'
      : score > 0.3 ? 'drifting'
      : 'dissonant';

    return {
      score: score,
      phases: phases,
      residuals: piResiduals,
      avgResidual: avgResidual,
      resonance: resonance,
    };
  }

  // ═══════════════════════════════════════════════════════════
  // PERSPECTIVE SHIFTS — blink, think, jump/bounce/jig
  // ═══════════════════════════════════════════════════════════

  // BLINK — toggle inside/outside/game
  function blink() {
    var views = ['inside', 'outside', 'game'];
    var idx = views.indexOf(perspective.view);
    perspective.view = views[(idx + 1) % views.length];
    perspective.blinks++;

    // Apply visual shift
    applyView();

    return perspective.view;
  }

  // THINK — process alignment and update depth
  function think() {
    var a = alignment();
    perspective.thinks++;

    // Alignment drives depth adjustment
    if (a.resonance === 'HARMONIC') {
      // Near-alignment: deepen (move inward)
      perspective.depth = Math.min(4, perspective.depth + 0.1);
    } else if (a.resonance === 'dissonant') {
      // Far from alignment: surface (move outward)
      perspective.depth = Math.max(0, perspective.depth - 0.1);
    }

    // Jig wobble based on sensation
    if (a.phases.dance_sensation) {
      perspective.wobble = a.phases.dance_sensation * 0.5;
    }

    return a;
  }

  // JUMP — discrete leap to a specific layer
  function jump(targetDepth) {
    perspective.mode = 'jump';
    perspective.depth = Math.round(Math.max(0, Math.min(4, targetDepth)));
    applyView();
  }

  // BOUNCE — continuous π-bounce to a depth
  function bounce(targetDepth) {
    perspective.mode = 'bounce';
    // Animate toward target depth via π-steps
    var current = perspective.depth;
    var diff = targetDepth - current;
    var step = diff / PI; // arrive in π steps

    function animateBounce() {
      perspective.depth += step;
      if ((step > 0 && perspective.depth >= targetDepth) ||
          (step < 0 && perspective.depth <= targetDepth)) {
        perspective.depth = targetDepth;
        applyView();
        return;
      }
      applyView();
      requestAnimationFrame(animateBounce);
    }
    animateBounce();
  }

  // JIG — oscillate within current layer
  function jig() {
    perspective.mode = 'jig';
    var center = Math.round(perspective.depth);
    var amplitude = 0.3;
    var phase = 0;

    function animateJig() {
      if (perspective.mode !== 'jig') return;
      phase += 0.05;
      perspective.depth = center + Math.sin(phase) * amplitude;
      perspective.wobble = Math.abs(Math.sin(phase)) * amplitude;
      applyView();
      requestAnimationFrame(animateJig);
    }
    animateJig();
  }

  // ═══════════════════════════════════════════════════════════
  // APPLY VIEW — update the HUD based on current perspective
  // ═══════════════════════════════════════════════════════════
  function applyView() {
    var body = document.body;
    var host = document.getElementById('membrane-focal-svg') || body;

    // Set data attributes for CSS hooks
    body.dataset.perspective = perspective.view;
    body.dataset.piMode = perspective.mode;
    body.dataset.piDepth = perspective.depth.toFixed(1);

    // Get gradient at current depth
    var perm = window._permeability;
    var g = perm ? perm.gradientAt(perspective.depth) : null;

    // Adjust visual opacity/filter based on light at this depth
    if (g) {
      var light = g.light;
      // Deep = darker, surface = brighter
      var brightness = 0.7 + light * 0.3; // 0.7 (abyssal) to 1.0 (surface)
      host.style.filter = 'brightness(' + brightness + ')';

      // Conductivity affects blur (high conductivity = sharp, low = blurry)
      var blur = (1 - g.conductivity) * 0.5;
      if (blur > 0.1) {
        host.style.filter += ' blur(' + blur + 'px)';
      }
    }

    // View-specific transforms
    if (perspective.view === 'inside') {
      // Looking outward from within — perspective inversion
      host.style.transform = 'scale(' + (1 + perspective.wobble * 0.1) + ')';
    } else if (perspective.view === 'outside') {
      // Looking inward from without — slight zoom out
      host.style.transform = 'scale(' + (0.95 - perspective.wobble * 0.05) + ')';
    } else {
      // Game view — neutral, board perspective
      host.style.transform = '';
    }
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER — alignment status on HUD
  // ═══════════════════════════════════════════════════════════
  function renderAlignment() {
    var existing = document.getElementById('pi-align');
    if (existing) existing.remove();

    var el = document.createElement('div');
    el.id = 'pi-align';
    el.style.cssText = 'position:fixed;bottom:100px;right:12px;z-index:5;'
      + 'background:rgba(22,27,34,.85);border:1px solid rgba(240,230,140,.2);'
      + 'border-radius:8px;padding:6px 10px;width:155px;pointer-events:auto;'
      + 'font:9px monospace;color:#8b949e;cursor:pointer;';

    // Click cycles perspective
    el.addEventListener('click', function () { blink(); });

    function update() {
      var a = alignment();

      // TABLE LEGS — remainders as uneven leg heights
      var legColors = ['#e8e8e8', '#3fb950', '#58a6ff', '#a371f7', '#f0e68c'];
      var legNames  = ['datum', 'pattern', 'connect', 'thought', 'body'];
      var remBars = '';

      // Show as table: legs on bottom, top on top
      remBars += '<div style="display:flex;justify-content:space-between;align-items:flex-end;height:22px;margin:2px 0;'
        + 'border-top:2px solid #484f58;padding-top:1px" title="table top = null/black">';
      SCALES.forEach(function (s, i) {
        var pct = (s.remainder / PI) * 100;
        var h = Math.max(2, Math.round(pct * 0.2)); // height proportional to remainder
        var col = legColors[i] || '#8b949e';
        remBars += '<div style="text-align:center;width:22px" title="π' + superscript(s.power) + ' rem=' + s.remainder.toFixed(4) + '">'
          + '<div style="background:' + col + ';width:3px;height:' + h + 'px;margin:0 auto;border-radius:1px;opacity:0.8"></div>'
          + '<div style="font-size:6px;color:' + col + '">π' + superscript(s.power) + '</div>'
          + '</div>';
      });
      remBars += '</div>';
      // Tightest and loosest
      var tightest = SCALES.reduce(function (min, s) { return s.remainder < min.remainder ? s : min; });
      var loosest = SCALES.reduce(function (max, s) { return s.remainder > max.remainder ? s : max; });
      remBars += '<div style="font-size:6px;color:#484f58">'
        + '<span style="color:#f85149">tight:</span> π' + superscript(tightest.power) + ' ' + tightest.remainder.toFixed(4)
        + ' <span style="color:#3fb950">loose:</span> π' + superscript(loosest.power) + ' ' + loosest.remainder.toFixed(3)
        + '</div>';

      // Mode indicators
      var modeIcons = { jump: '⟐', bounce: '◠', jig: '∿' };
      var viewIcons = { inside: '⊙', outside: '⊚', game: '⊞' };

      el.innerHTML = ''
        + '<div style="color:#f0e68c;font-weight:bold;margin-bottom:3px">'
        + modeIcons[perspective.mode] + ' π-align '
        + viewIcons[perspective.view] + ' ' + perspective.view
        + '</div>'

        // Alignment score
        + '<div style="margin:3px 0">'
        + '<span style="color:' + (a.score > 0.7 ? '#3fb950' : a.score > 0.4 ? '#f0e68c' : '#f85149') + '">'
        + a.resonance + '</span>'
        + ' <span style="color:#484f58">' + (a.score * 100).toFixed(0) + '%</span>'
        + '</div>'

        // Remainder bars
        + '<div style="margin:4px 0">' + remBars + '</div>'

        // Perspective info
        + '<div style="border-top:1px solid rgba(48,54,61,.5);padding-top:3px;margin-top:3px">'
        + '<span style="color:#58a6ff">depth:</span> ' + perspective.depth.toFixed(2)
        + ' <span style="color:#484f58">(' + perspective.mode + ')</span><br>'
        + '<span style="color:#a371f7">blinks:</span> ' + perspective.blinks
        + ' <span style="color:#7ee787">thinks:</span> ' + perspective.thinks
        + '</div>'

        // Tip
        + '<div style="font-size:7px;color:#484f58;margin-top:3px">'
        + 'click to blink · /jump /bounce /jig'
        + '</div>';
    }

    update();
    setInterval(update, Math.round(PI * PI * 1000)); // π² ≈ 10s
    document.body.appendChild(el);
  }

  function superscript(n) {
    return ['⁰','¹','²','³','⁴','⁵'][n] || n;
  }

  // ═══════════════════════════════════════════════════════════
  // ALIGNMENT TICK — periodic alignment check + think
  // ═══════════════════════════════════════════════════════════
  function alignmentTick() {
    var a = think();

    // If HARMONIC, emit event
    if (a.resonance === 'HARMONIC') {
      try {
        document.dispatchEvent(new CustomEvent('pi-harmonic', { detail: a }));
      } catch (e) {}
    }

    // Feed alignment state to prism (so prism colors shift with alignment)
    if (window._kleinPrism) {
      // Alignment score modulates the signal
      // High alignment = brighter signal, low = dimmer
    }

    // Feed alignment state to permeability (resonance changes conductivity)
    if (window._permeability) {
      var perm = window._permeability;
      var layers = perm.layers;
      // Harmonic resonance temporarily increases conductivity (channels open)
      if (a.score > 0.7) {
        layers.forEach(function (l) {
          l.conductivity = Math.min(1, l.conductivity + 0.05);
        });
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // KEYBOARD SHORTCUTS — for perspective shifting
  // ═══════════════════════════════════════════════════════════
  function wireKeys() {
    document.addEventListener('keydown', function (e) {
      // Don't intercept when typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'b' && e.ctrlKey) { blink(); e.preventDefault(); }
      if (e.key === 'j' && e.ctrlKey) { jump(Math.round(perspective.depth)); e.preventDefault(); }
      if (e.key === 'ArrowUp' && e.shiftKey) {
        bounce(Math.max(0, perspective.depth - 1));
        e.preventDefault();
      }
      if (e.key === 'ArrowDown' && e.shiftKey) {
        bounce(Math.min(4, perspective.depth + 1));
        e.preventDefault();
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // WIRE COMMANDS — /jump /bounce /jig in the HUD input
  // ═══════════════════════════════════════════════════════════
  function wireCommands() {
    document.addEventListener('keydown', function (e) {
      if (e.target.id !== 'input' || e.key !== 'Enter') return;

      var val = e.target.value.trim().toLowerCase();
      if (val === '/jump') { jump(Math.round(perspective.depth)); e.target.value = ''; }
      if (val === '/bounce') { bounce(perspective.depth > 2 ? 0 : 4); e.target.value = ''; }
      if (val === '/jig') { jig(); e.target.value = ''; }
      if (val === '/blink') { blink(); e.target.value = ''; }
      if (val === '/inside') { perspective.view = 'inside'; applyView(); e.target.value = ''; }
      if (val === '/outside') { perspective.view = 'outside'; applyView(); e.target.value = ''; }
      if (val === '/game') { perspective.view = 'game'; applyView(); e.target.value = ''; }
      if (/^\/depth\s+[\d.]+$/.test(val)) {
        var d = parseFloat(val.split(/\s+/)[1]);
        bounce(d);
        e.target.value = '';
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════════
  window._piAlign = {
    alignment: alignment,
    perspective: function () { return perspective; },
    blink: blink,
    think: think,
    jump: jump,
    bounce: bounce,
    jig: jig,
    scales: SCALES,
  };

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    setTimeout(function () {
      renderAlignment();
      wireKeys();
      wireCommands();

      // Alignment tick every π² ≈ 10s
      setInterval(alignmentTick, Math.round(PI * PI * 1000));

      var a = alignment();
      console.log('[pi-align] ' + a.resonance + ' (' + (a.score * 100).toFixed(0) + '%)');
      console.log('  remainders: ' + SCALES.map(function (s) {
        return 'π' + superscript(s.power) + '=' + s.remainder.toFixed(4);
      }).join(' · '));
      console.log('  perspective: ' + perspective.view + ' / ' + perspective.mode
        + ' / depth ' + perspective.depth.toFixed(1));
      console.log('  blink=Ctrl+B · /jump /bounce /jig /blink /inside /outside /game /depth N');
    }, 5000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
