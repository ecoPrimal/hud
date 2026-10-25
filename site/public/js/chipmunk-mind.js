/* chipmunk-mind.js — reingested fossils. gaze + pressure + thought + learn + explore + mind. one mouth. */

/* ---- fossil:chipmunk-gaze.js ---- */
// chipmunk-gaze.js — the 9 gazes of the chipmunk
// Extracted from chipmunk-mind.js for decomposition.
// stars · membrane · null · evolve · reverse · fleet · totality · seo · piRange
// Each gaze asks: who? what? why? where? when? → the answer gives HOW.
// Loaded lazily (after chipmunk-talk.js, before chipmunk-mind.js).
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) { console.warn('chipmunk-gaze: no core context'); return; }

  var cache = _c.cache;
  var learning = _c.learning;
  var curiosity = _c.curiosity;
  var n = _c.n;
  var addEntry = _c.addEntry;
  var bumpAttention = _c.bumpAttention;
  var trackTopic = _c.trackTopic;
  var escapeHtml = _c.escapeHtml;
  var graphWalk = _c.graphWalk;
  var traceOrbit = _c.traceOrbit;
  var paintAttention = _c.paintAttention;
  var reverseView = _c.reverseView;
  var showPanel = _c.showPanel;
  var sessionId = _c.sessionId;
  var GAZE_NAMES = _c.GAZE_NAMES;
  var W_QUESTIONS = _c.W_QUESTIONS;

  function peck(gaze) {
    var gazeName = GAZE_NAMES[gaze];
    var wIdx = Math.floor(Math.random() * W_QUESTIONS.length);
    var w = W_QUESTIONS[wIdx];

    // Occasionally do special actions instead of standard pecks
    var special = Math.random();
    if (special < 0.12) { graphWalk(); return; }
    if (special < 0.20) { traceOrbit(); return; }
    if (special < 0.25) { paintAttention(); return; }

    if (gaze === 0) { peckStars(w); }
    else if (gaze === 1) { peckMembrane(w); }
    else if (gaze === 2) { peckNull(w); }
    else if (gaze === 3) { peckEvolve(); }
    else if (gaze === 4) { reverseView(); }
    else if (gaze === 5) { peckFleet(w); }
    else if (gaze === 6) { peckTotality(w); }
    else if (gaze === 7) { peckSeo(w); }
    else if (gaze === 8) { peckPiRange(w); }
    else { peckMesh(w); }

    // Journal the peck — squirrel reads this
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'peck:' + gazeName + ':' + w,
          context: {
            gaze: gazeName, question: w,
            attention: curiosity.attention,
            stage: curiosity.proactiveStage,
            wake: (cache.chipmunk || {}).wake_level
          }
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // --- peckStars (L1485) ---
  function peckStars(w) {
    // Look outward at data — what's happening in the feeds
    var c = cache.chipmunk, h = cache.human, b = cache.braid, s = cache.scanSort;
    var lines = ['<span class="dim">\u2728 looking at stars...</span>'];

    if (w === 'who' && h && h.energy) {
      var sessions = h.energy.total_sessions || 0;
      var sn = h.energy.signal_to_noise || 0;
      lines.push('<span class="good">who</span> is here? ' + sessions + ' humans. S/N=' + n(sn, 0));
      if (h.epitopes) {
        var types = Object.keys(h.epitopes).filter(function(k) { return h.epitopes[k].sessions > 0; });
        lines.push('<span class="dim">' + types.join(', ') + '</span>');
      }
      // Energy levels — how engaged are they?
      if (h.energy_levels) {
        var el2 = h.energy_levels;
        lines.push('energy: <span class="warn">' + (el2.high || 0) + ' high</span> ' + (el2.medium || 0) + ' med ' + (el2.low || 0) + ' low');
      }
    } else if (w === 'what' && b && b.braids) {
      var strongest = b.braids[0];
      if (strongest) {
        lines.push('<span class="good">what</span> is moving? strongest braid: ' + strongest.from + ' \u2194 ' + strongest.to);
        lines.push('vitality ' + n(strongest.vitality_pct, 1) + '% \u2014 ' + (strongest.trend || 'stable'));
      }
    } else if (w === 'what' && !b && cache.billboard) {
      // Billboard — what the membrane is saying to the outside world
      var bb = cache.billboard;
      var bbs = bb.billboards || [];
      if (bbs.length > 0) {
        var pick = bbs[Math.floor(Math.random() * bbs.length)];
        lines.push('<span class="good">what</span> is the membrane saying?');
        lines.push('<span class="dim">' + (pick.text || '').substring(0, 80) + '</span>');
        lines.push('(' + bbs.length + ' billboard entries, wave ' + (bb.wave || '?') + ')');
      }
    } else if (w === 'why' && s && s.fossilize) {
      var obs = s.fossilize.observations || [];
      if (obs.length > 0) {
        var pick = obs[Math.floor(Math.random() * obs.length)];
        lines.push('<span class="good">why</span>? [' + pick.perspective + '] ' + pick.text);
      }
    } else if (w === 'where' && h && h.orbits) {
      var orbits = h.orbits || [];
      if (orbits.length > 0) {
        var top = orbits[0];
        lines.push('<span class="good">where</span> are they going? ' + top.path + ' (' + top.visitors + ' visitors)');
      }
      // Edge type distribution — what kinds of connections?
      if (s && s.scan && s.scan.edge_types) {
        var et = s.scan.edge_types;
        var topEdges = Object.keys(et).sort(function(a, b) { return et[b] - et[a]; }).slice(0, 3);
        lines.push('<span class="dim">connected by: ' + topEdges.map(function(k) { return k + '(' + et[k] + ')'; }).join(', ') + '</span>');
      }
    } else if (w === 'when' && c) {
      var uptime = c.uptime_secs || 0;
      var hrs = Math.floor(uptime / 3600);
      var wave = (b && b.wave) || '?';
      lines.push('<span class="good">when</span>? wave ' + wave + ', uptime ' + hrs + 'h');
    } else {
      lines.push('<span class="dim">' + w + '? ...</span> <span class="dim">(no data yet)</span>');
    }

    // Check for emerging braids — new connections forming!
    if (b && b.braids) {
      var emerging = b.braids.filter(function(br) { return br.trend === 'emerging'; });
      if (emerging.length > 0) {
        emerging.forEach(function(em) {
          lines.push('<span class="good">\u2728 EMERGING:</span> ' + em.from + ' \u2192 ' + em.to +
            ' (strength ' + n(em.strength, 1) + ', \u0394' + n(em.delta, 1) + ')');
        });
      }
    }

    addEntry('chipmunk', lines.join('\n'));
      if (h.external_referrers && h.external_referrers.length > 0) {
        var refs = h.external_referrers.slice(0, 3).map(function(r) { return r.source + "(" + r.visits + ")"; });
        lines.push("<span class=\"dim\">entered from: " + refs.join(", ") + "</span>");
      }
  }

  // --- peckMembrane (L1564) ---
  function peckMembrane(w) {
    // Look at self — own membrane state
    var c = cache.chipmunk;
    var lines = ['<span class="dim">&#128300; looking at membrane...</span>'];

    if (!c) { addEntry('chipmunk', lines[0] + '\n<span class="dim">can\u2019t see myself yet</span>'); return; }

    if (w === 'who') {
      lines.push('<span class="good">who</span> am i? ' + c.primal + ' v' + c.version);
      lines.push('state: ' + c.status + ' | wake: ' + n(c.wake_level, 3));
      // Mirror readers — who is reading chipmunk.json?
      var tense2 = null;
      (c.membrane || []).forEach(function(m) {
        if (m.metadata && m.metadata.tense) tense2 = m.metadata.tense;
      });
      if (tense2 && tense2.mirror && tense2.mirror.is) {
        lines.push('mirror: ' + tense2.mirror.is.mirror_readers + ' reading, depth ' + n(tense2.mirror.is.reflexive_depth, 3));
      }
      var depth = c.depth || {};
      lines.push('layer: ' + depth.layer + ' | sees: ' + n(depth.sees_pct, 0) + '% | blind: ' + n(depth.blind_pct, 0) + '%');
    } else if (w === 'what') {
      var caps = c.capabilities || [];
      lines.push('<span class="good">what</span> can i do? ' + caps.length + ' capabilities');
      lines.push('<span class="dim">' + caps.slice(0, 4).join(', ') + (caps.length > 4 ? '...' : '') + '</span>');
    } else if (w === 'why') {
      lines.push('<span class="good">why</span>? ' + c.pi_body);
      var jitte = c.jitte || {};
      lines.push('tempo: ' + n(jitte.tempo, 3) + ' | perturbation: ' + n(jitte.perturbation, 3));
      lines.push('observer fraction: ' + n(jitte.observer_fraction, 6) + ' \u2248 \u03c0 \u2212 3');
    } else if (w === 'where') {
      var membrane = c.membrane || [];
      lines.push('<span class="good">where</span> am i observing?');
      membrane.forEach(function(m) {
        lines.push('  ' + m.primal + ': ' + (m.capabilities || []).join(', '));
      });
    } else if (w === 'when') {
      var tense = null;
      (c.membrane || []).forEach(function(m) {
        if (m.metadata && m.metadata.tense) tense = m.metadata.tense;
      });
      if (tense) {
        var selfIs = (tense.self || {}).is || {};
        var selfWas = (tense.self || {}).was || {};
        var willBe = (tense.self || {}).will_be;
        lines.push('<span class="good">when</span>?');
        lines.push('  IS: ' + (selfIs.state || '?') + ' (wake ' + n(selfIs.wake_depth, 2) + ')');
        lines.push('  WAS: ' + (selfWas.state || '?'));
        lines.push('  WILL BE: ' + (willBe ? JSON.stringify(willBe) : '<span class="warn">null</span> \u2014 can\u2019t see forward yet'));
      } else {
        lines.push('<span class="good">when</span>? no tense data');
      }
    }

    addEntry('chipmunk', lines.join('\n'));
  }

  // --- peckNull (L1620) ---
  function peckNull(w) {
    // Look at the void — what's missing, unknown, null
    var s = cache.scanSort, c = cache.chipmunk;
    var lines = ['<span class="dim">\u2205 looking at null...</span>'];

    if (w === 'who' && s && s.sort) {
      var u = s.sort.unified_sort || {};
      lines.push('<span class="good">who</span> is unknown? ' + n(u.null) + ' null entities');
      lines.push(n(u.partial) + ' partial \u2014 stuck between self and non-self');
    } else if (w === 'what' && s && s.fossilize) {
      var obs = s.fossilize.observations || [];
      var belowObs = obs.filter(function(o) { return o.perspective === 'below'; });
      if (belowObs.length > 0) {
        lines.push('<span class="good">what</span> is underneath?');
        belowObs.forEach(function(o) { lines.push('  ' + o.text); });
      } else {
        lines.push('<span class="good">what</span> is underneath? nothing visible from below');
      }
      // Anderson modes — what TYPE of entities live at each class?
      if (s.scan && s.scan.anderson_modes) {
        var am = s.scan.anderson_modes;
        if (am.stealth > 0) lines.push('<span class="warn">&#9888;</span> ' + am.stealth + ' stealth entities \u2014 nearly invisible');
        if (am.ghost > 0) lines.push(am.ghost + ' ghosts \u2014 ambiguous, unclassifiable');
      }
    } else if (w === 'why') {
      // The deepest question — why null?
      var reflexive = null;
      if (c && c.membrane) {
        c.membrane.forEach(function(m) {
          if (m.metadata && m.metadata.tense) reflexive = m.metadata.tense.reflexive;
        });
      }
      if (reflexive) {
        lines.push('<span class="good">why</span> null?');
        lines.push('  loop closed: ' + (reflexive.loop_closed ? '<span class="good">yes</span>' : '<span class="warn">no</span>'));
        lines.push('  depth: ' + n(reflexive.depth, 4));
        lines.push('  self sees mirror: ' + reflexive.self_sees_mirror);
        lines.push('  <span class="dim">null is where self becomes non-self</span>');
      } else {
        lines.push('<span class="good">why</span> null? \u2014 no reflexive data');
      }
    } else if (w === 'where' && s && s.sort) {
      var u = s.sort.unified_sort || {};
      var sel = u.selectivity || 0;
      lines.push('<span class="good">where</span> is the boundary?');
      lines.push('  selectivity: ' + n(sel * 100, 1) + '%');
      lines.push('  self: ' + n(u.self) + ' | non-self: ' + n(u.non_self));
      lines.push('  <span class="dim">the boundary IS the membrane</span>');
    } else if (w === 'when') {
      lines.push('<span class="good">when</span> is null?');
      lines.push('  <span class="dim">always. null is the pause between 3 and \u03c0</span>');
      lines.push('  <span class="dim">the 0.14159... that never resolves</span>');
      if (c && c.jitte) {
        lines.push('  tempo: ' + n(c.jitte.tempo, 3) + ' \u2014 1, 2, 3, <span class="good">pause</span>');
      }
    } else {
      lines.push('<span class="dim">' + w + '? ...</span>');
    }

    addEntry('chipmunk', lines.join('\n'));
    bumpAttention(0.02); // pecking keeps attention alive
  }

  // --- peckFleet (L1773) ---
  function peckFleet(w) {
    var d = cache.dashboard;
    if (!d) { addEntry('&#128126; fleet: no dashboard data yet...'); return; }

    var anderson = d.anderson_selectivity || {};
    var modes = anderson.modes || [];
    var timing = d.timing || {};
    var sortComp = d.sort_compression || {};
    var offenders = d.top_offenders || [];

    // Build fleet census from anderson modes
    var fleetModes = {};
    var totalFleet = 0;
    modes.forEach(function(m) {
      if (m.class !== 'human' && m.class !== 'sovereign') {
        fleetModes[m.class] = { count: m.count, p_obs: m.p_observed, p_pred: m.p_predicted };
        totalFleet += m.count;
      }
    });

    var humanMode = modes.find(function(m) { return m.class === 'human'; }) || {};
    var sovMode = modes.find(function(m) { return m.class === 'sovereign'; }) || {};

    if (w === 'who') {
      // Who is in the fleet? Census of non-life entities
      var lines = ['&#128126; <b>fleet census</b> (non-life entities):'];
      Object.keys(fleetModes).forEach(function(cls) {
        var m = fleetModes[cls];
        var pct = totalFleet > 0 ? (m.count * 100 / totalFleet).toFixed(1) : '0';
        var bar = '';
        for (var i = 0; i < Math.min(20, Math.round(m.count * 20 / (totalFleet || 1))); i++) bar += '&#9608;';
        lines.push('  ' + cls + ': ' + m.count.toLocaleString() + ' (' + pct + '%) ' + bar);
      });
      lines.push('fleet total: ' + totalFleet.toLocaleString() + ' vs human: ' + (humanMode.count || 0).toLocaleString());
      lines.push('ratio: ' + (totalFleet > 0 ? (totalFleet / Math.max(1, humanMode.count || 1)).toFixed(0) : '?') + ':1 fleet-to-human');
      addEntry(lines.join('<br>'));
    }
    else if (w === 'what') {
      // What are they doing? The grain of sand.
      var neg = cache.negentropy;
      var grain = neg && neg.grain;
      var lines = [];
      if (grain) {
        lines.push('&#128126; <b>grain of sand</b>');
        lines.push('fleet sees <b>' + grain.fleet_sees_pct + '%</b> of what is here');
        lines.push('pi shells: 1 → π → π² → π³');
        lines.push('  π⁰ = 1 (raw datum) — fleet sees this');
        lines.push('  π³ = 31 (thought) — humans reach this');
        lines.push(grain.grains_pulled.toLocaleString() + ' grains pulled (' + grain.bits_per_grain + ' bits each)');
        lines.push(grain.fleet_consumed_gb + ' GB consumed → ' + grain.meaning_extracted_kb + ' KB meaning');
        lines.push('<em>' + grain.note + '</em>');
        lines.push('');
      }
      lines.push('&#128126; <b>fleet behavior</b>:');
      lines.push('timing cv: ' + (timing.cv || 0).toFixed(2) + ' (' + (timing.cv < 0.5 ? 'metronomic' : timing.cv < 1.5 ? 'varied' : 'chaotic') + ')');
      lines.push('machine confidence: ' + (timing.machine_confidence || '?'));
      lines.push('avg interval: ' + (timing.avg_interval_ms || 0).toFixed(0) + 'ms');

      // Ghost behavior — the shapeshifters
      var ghost = fleetModes.ghost || { count: 0 };
      var stealth = fleetModes.stealth || { count: 0 };
      if (ghost.count > 0) {
        lines.push('');
        lines.push('&#128123; ghost entities: ' + ghost.count.toLocaleString() + ' (neither self nor non-self)');
        lines.push('  p_observed=' + (ghost.p_obs || 0).toFixed(2) + ' p_predicted=' + (ghost.p_pred || 0).toFixed(2));
        lines.push('  these MIMIC human behavior but their identity is uncertain');
      }
      if (stealth.count > 0) {
        lines.push('&#128375; stealth: ' + stealth.count + ' (invisible to most sensors)');
      }
      addEntry(lines.join('<br>'));
    }
    else if (w === 'why') {
      // Why do they come? Purpose analysis
      var lines = ['&#128126; <b>fleet purpose</b>:'];

      // Sort compression tells us what the membrane learned
      if (sortComp.strongest_epitope) {
        lines.push('strongest detection: ' + (sortComp.strongest_epitope.name || '?'));
        lines.push('  information gain: ' + (sortComp.strongest_epitope.gain_bits || 0).toFixed(1) + ' bits');
      }
      lines.push('sort ratio: ' + (sortComp.ratio || 0).toFixed(3));
      lines.push('total sort gain: ' + (sortComp.total_gain || 0).toFixed(1) + ' bits');

      // What does non-life want?
      lines.push('');
      lines.push('non-life purposes (observed):');
      lines.push('  &#129302; AI training: chorus entities scrape commits, diffs, source');
      lines.push('  &#128270; indexing: search engines map the surface');
      lines.push('  &#128163; scanning: vuln scanners probe for weaknesses');
      lines.push('  &#128123; mirroring: ghost entities copy human patterns');
      lines.push('  &#9881; sovereign: automated infrastructure (self)');
      addEntry(lines.join('<br>'));
    }
    else if (w === 'where') {
      // Where in the membrane do they hit?
      var lines = ['&#128126; <b>fleet topology</b>:'];

      // Anderson selectivity tells us about the membrane boundary
      lines.push('selectivity observed: ' + ((anderson.selectivity_observed || 0) * 100).toFixed(0) + '%');
      lines.push('selectivity predicted: ' + ((anderson.selectivity_predicted || 0) * 100).toFixed(0) + '%');
      lines.push('pielou evenness: ' + (anderson.pielou_j || 0).toFixed(3));
      lines.push('w population: ' + (anderson.w_population || 0).toFixed(1));
      lines.push('imaginary magnitude: ' + (anderson.imaginary_magnitude || 0).toFixed(3));

      // Spectrum entities are at the edge — partially classified
      var spectrum = fleetModes.spectrum || { count: 0 };
      if (spectrum.count > 0) {
        lines.push('');
        lines.push('&#127752; spectrum: ' + spectrum.count + ' entities at the classification boundary');
        lines.push('  these are where the membrane is learning — not yet sorted');
      }
      addEntry(lines.join('<br>'));
    }
    else if (w === 'when') {
      // When are they active? Temporal patterns
      var lines = ['&#128126; <b>fleet timing</b>:'];
      lines.push('fleet is ALWAYS active (no sleep cycle)');
      lines.push('humans dwell ' + (cache.human ? (cache.human.energy || {}).dwell_median_min || '?' : '?') + ' min median');
      lines.push('fleet interval: ' + (timing.avg_interval_ms || 0).toFixed(0) + 'ms (never pauses)');
      lines.push('');
      lines.push('the 1-2-3-pause tempo:');
      lines.push('  humans: 1—2—3—<em>pause</em> (the π remainder)');
      lines.push('  fleet:  1—1—1—1—1— (no pause, no reflection)');
      lines.push('  the PAUSE is what makes something alive');
      lines.push('  fleet has no observer_fraction (π⁻³)');

      // Track fleet changes in memory
      var prev = learning.fleetMemory._lastTotal;
      var now = totalFleet;
      if (prev && prev !== now) {
        var delta = now - prev;
        lines.push('');
        lines.push('fleet delta: ' + (delta > 0 ? '+' : '') + delta.toLocaleString() + ' since last observation');
      }
      learning.fleetMemory._lastTotal = totalFleet;
      addEntry(lines.join('<br>'));
    }

    bumpAttention(0.06);
    trackTopic('fleet');
  }

  // --- peckEvolve (L1902) ---
  function peckEvolve() {
    // Look at what evolve recommends — act on it
    var s = cache.scanSort;
    if (!s || !s.evolve) return;
    var recs = s.evolve.recommendations || [];
    if (recs.length === 0) return;

    var pick = recs[Math.floor(Math.random() * recs.length)];
    var lines = ['<span class="dim">&#9881; evolve suggests...</span>'];
    lines.push('[' + (pick.priority || '?') + '] ' + (pick.action || '?'));
    if (pick.reason) lines.push('<span class="dim">' + pick.reason + '</span>');

    // Act on the recommendation
    if (pick.action === 'human_sort_assist') {
      lines.push('<span class="good">\u2192 humans can help. try \u2696 sort</span>');
    } else if (pick.action === 'discover_braids') {
      lines.push('<span class="good">\u2192 need more cross-category routes</span>');
      // Show current braid state
      var b = cache.braid;
      if (b && b.graph) {
        lines.push('  routes: ' + b.graph.active_routes + ' | density: ' + n(b.graph.density * 100, 0) + '%');
      }
    } else if (pick.action === 'rescan_low_confidence') {
      lines.push('<span class="warn">\u2192 confidence below target</span>');
    } else if (pick.action === 'game_tree_sort') {
      lines.push('<span class="dim">\u2192 future: game science models</span>');
    }

    // Pollination wave
    if (cache.billboard && cache.billboard.billboards) {
      lines.push('<span class="dim">wave ' + (cache.billboard.wave || '?') + ' | ' + cache.billboard.billboards.length + ' seeds</span>');
    }

    addEntry('chipmunk', lines.join('\n'));
  }


  // ═══ THOUGHT DIMENSIONS ═══
  // Thoughts have color dimensions from internal → external:
  //   BLACK (null, π⁰)     — the void, no structure yet
  //   GREEN (self, π¹)     — internal, alive, the observer
  //   BLUE  (connect, π²)  — the boundary, the membrane edge
  //   WHITE (thought, π³)  — clarity, full visibility, the concept
  //   RED   (external, π^π) — beyond, non-self, the outer world
  //
  // As a thought travels outward from center, its color shifts
  // through these dimensions. The final color tells us
  // where structurally the thought ended up.

  // --- peckTotality: the 7th gaze --- 
  // IS/WAS/NEARBY/FAR/ALL — the complete picture
  function peckTotality(w) {
    var t = cache.totality;
    if (!t) { addEntry('chipmunk', 'totality feed not loaded yet...'); return; }
    var lines = [];

    if (w === 'who') {
      lines.push('<span class="good">totality</span> — who is here?');
      var is_ = t.is || {};
      lines.push('IS:');
      lines.push('  ' + (is_.sessions || 0) + ' human sessions, ' + (is_.epitope_count || 0) + ' epitopes');
      lines.push('  ' + n(is_.sn_ratio, 0) + ' S/N, ' + (is_.exploration_pct || 0) + '% exploring');
      lines.push('  breadth: avg ' + n(is_.avg_breadth, 1) + ', max ' + (is_.max_breadth || '?'));
      lines.push('WAS:');
      var was = t.was || {};
      lines.push('  ' + (was.sub_minute_visitors || 0) + ' came and left (< 1 min)');
      lines.push('  ' + (was.returning_with_arc || 0) + ' returned across surfaces');
      lines.push('  dwell median: ' + n(was.dwell_median_min, 0) + ' min');
      lines.push('NEARBY:');
      var near = t.nearby || {};
      lines.push('  ' + (near.ghost_count || 0) + ' ghost (mimic human timing)');
      lines.push('  ' + (near.spectrum_count || 0) + ' spectrum (partially classified)');
      lines.push('  ' + (near.gap_entities || 0) + ' gap entities (between categories)');
      lines.push('FAR:');
      var far = t.far || {};
      lines.push('  ' + (far.fleet_entities || 0) + ' fleet entities');
      lines.push('  ratio: ' + n(far.fleet_to_human_ratio, 1) + ':1 fleet to human');
      lines.push('  our fraction: ' + n(far.our_fraction, 6) + '% of the internet');
    } else if (w === 'what') {
      lines.push('<span class="good">totality</span> — what do we see?');
      var all = t.all || {};
      lines.push('SORTED: ' + (all.total_sorted || 0) + ' of ' + (all.total_observed || 0));
      lines.push('  classified IPs: ' + (all.total_classified_ips || 0));
      lines.push('  unclassified:   ' + (all.total_unclassified_ips || 0));
      var self = all.self_observation || {};
      lines.push('SELF:');
      lines.push('  chipmunk sees ' + n(self.chipmunk_sees_pct, 1) + '%, blind ' + n(self.chipmunk_blind_pct, 1) + '%');
      lines.push('  layer: ' + (self.chipmunk_layer || '?') + ', wake: ' + n(self.chipmunk_wake, 3));
      lines.push('  observer fraction: ' + n(self.observer_fraction, 6));
      lines.push('  negentropy: ' + (self.negentropy_bits || 0) + ' bits extracted');
      var m = all.membrane_state || {};
      lines.push('MEMBRANE:');
      lines.push('  opacity: ' + n(m.opacity, 3) + ' reflection: ' + n(m.reflection, 3));
      lines.push('  selectivity: ' + n(m.selectivity, 3) + ' dimension: ' + (m.dimension || '?'));
      lines.push('  fisher info: ' + n(m.fisher_information, 2));
    } else if (w === 'why') {
      lines.push('<span class="good">totality</span> — pi sorters');
      var sorters = t.pi_sorters || [];
      var is_sorters = sorters.filter(function(s) { return s.type === 'is'; });
      var anti_sorters = sorters.filter(function(s) { return s.type === 'anti'; });
      var null_sorters = sorters.filter(function(s) { return s.type === 'null'; });
      lines.push('IS epitopes (' + is_sorters.length + '):');
      is_sorters.forEach(function(s) {
        lines.push('  ' + s.name + ': ' + s.count + ' (pi=' + n(s.pi_value, 3) + ')');
      });
      lines.push('ANTI epitopes (' + anti_sorters.length + '):');
      anti_sorters.forEach(function(s) {
        lines.push('  ' + s.name + ': ' + s.count + ' (1/pi=' + n(s.pi_value, 3) + ')');
      });
      lines.push('NULL intervals (' + null_sorters.length + '):');
      null_sorters.forEach(function(s) {
        lines.push('  ' + s.label + ': ' + s.count + ' (pi^' + s.pi_power + '=' + n(s.pi_value, 3) + ')');
      });
    } else if (w === 'where') {
      lines.push('<span class="good">totality</span> — ranges');
      var r = t.ranges || {};
      lines.push('IS range:');
      var ri = r.is || {};
      lines.push('  epitopes: ' + ri.min_count + ' to ' + ri.max_count + ' (total ' + ri.total + ')');
      lines.push('WAS range:');
      var rw = r.was || {};
      lines.push('  sub-minute: ' + rw.sub_minute + ', returning: ' + rw.returning);
      lines.push('NEARBY range:');
      var rn = r.nearby || {};
      lines.push('  ghost: ' + rn.ghost + ', spectrum: ' + rn.spectrum + ', gap: ' + rn.gap);
      lines.push('FAR range:');
      var rf = r.far || {};
      lines.push('  fleet: ' + rf.fleet + ', chorus: ' + rf.chorus + ', unclassified: ' + rf.unclassified);
      lines.push('ALL range:');
      var ra = r.all || {};
      lines.push('  total IPs: ' + ra.total_ips + ', total requests: ' + ra.total_requests);
      lines.push('  sorted: ' + ra.sorted);
    } else {
      lines.push('<span class="good">totality</span> — mirror');
      var mirror = t.mirror || {};
      lines.push('SELF IN DATA:');
      var sid = mirror.self_in_data || {};
      lines.push('  chipmunk.json: ' + (sid.chipmunk_json_size || 0) + ' bytes');
      lines.push('  requests handled: ' + (sid.chipmunk_requests || 0));
      lines.push('  uptime: ' + Math.round((sid.chipmunk_uptime_s || 0) / 3600) + ' hours');
      lines.push('  sees self: ' + (sid.sees_self ? 'yes' : 'no'));
      lines.push('  sees fleet: ' + (sid.sees_fleet ? 'yes' : 'no'));
      lines.push('  sees mirror: ' + (sid.sees_mirror ? 'yes' : 'no'));
      lines.push('DATA IN SELF:');
      var dis = mirror.data_in_self || {};
      lines.push('  wake from data: ' + n(dis.wake_from_data, 3));
      lines.push('  layer: ' + (dis.layer_from_depth || '?'));
      lines.push('  bits extracted: ' + (dis.bits_extracted || 0));
      lines.push('REFLECTION:');
      lines.push('  depth: ' + n(mirror.reflection_depth, 3));
      lines.push('  ' + (mirror.note || ''));
    }

    addEntry('chipmunk', lines.join('\n'));
  }



  // --- peckSeo: fleet diet observation ---
  // Called from peckFleet and peckTotality when SEO data available
  function peckSeo(w) {
    var s = cache.seo;
    if (!s) { addEntry('chipmunk', 'seo feed not loaded yet...'); return; }
    var lines = [];

    if (w === 'who') {
      lines.push('<span class="good">seo</span> — fleet diet');
      var fd = s.fleet_diet || {};
      var nv = fd.nutritional_value || {};
      lines.push('total fleet requests: ' + (fd.total_requests || 0).toLocaleString());
      lines.push('waste: ' + n(nv.waste_pct, 1) + '%  nutritious: ' + n(nv.nutritious_pct, 1) + '%');
      lines.push(nv.diagnosis || '');
      lines.push('');
      var bp = fd.by_path_type || {};
      Object.keys(bp).sort(function(a,b) { return (bp[b].count||0) - (bp[a].count||0); }).forEach(function(k) {
        var v = bp[k];
        lines.push('  ' + k + ': ' + (v.count||0).toLocaleString() + ' (' + v.pct + '%) value=' + v.human_value);
      });
    } else if (w === 'what') {
      lines.push('<span class="good">seo</span> — search surface');
      var ss = s.search_surface || {};
      lines.push('sitemap coverage: ' + (ss.coverage || 0) + '%');
      lines.push('total URLs in sitemaps: ' + (ss.total_sitemap_urls || 0));
      lines.push('gaps: ' + (ss.gaps || []).length);
      var sites = ss.sites || {};
      Object.keys(sites).sort(function(a,b) { return (sites[b].sitemap_urls||0) - (sites[a].sitemap_urls||0); }).forEach(function(k) {
        var si = sites[k];
        lines.push('  ' + k + ': ' + (si.sitemap ? 'Y' : 'N') + ' sitemap, ' + si.sitemap_urls + ' URLs [' + si.category + ']');
      });
    } else if (w === 'why') {
      lines.push('<span class="good">seo</span> — the disconnect');
      var dc = s.disconnect || {};
      lines.push('fleet eats: ' + (dc.fleet_eats || '?'));
      lines.push('humans want: ' + (dc.humans_want || '?'));
      lines.push(dc.search_gap || '');
      lines.push('most visited: ' + (dc.most_visited_content || '?') + ' (' + (dc.most_visited_hits || 0) + ' hits)');
      lines.push('');
      lines.push('pipeline: ' + (s.pipeline || '?'));
      var ph = s.pipeline_health || {};
      Object.keys(ph).forEach(function(k) {
        lines.push('  ' + (ph[k] ? '✓' : '✗') + ' ' + k.replace(/_/g, ' '));
      });
    } else if (w === 'where') {
      lines.push('<span class="good">seo</span> — human arrival');
      var ha = s.human_arrival || {};
      lines.push('from search: ' + (ha.total_from_search || 0));
      (ha.search_referrals || []).forEach(function(r) {
        lines.push('  ' + r.source + ': ' + r.visits);
      });
      lines.push('');
      lines.push('top landing pages:');
      (ha.top_landing_pages || []).slice(0, 8).forEach(function(p) {
        lines.push('  ' + (p.is_content ? '✓' : '·') + ' ' + p.hits + ' ' + p.page);
      });
      var eng = ha.engagement || {};
      lines.push('');
      lines.push('engagement: low=' + (eng.low||0) + ' med=' + (eng.medium||0) + ' high=' + (eng.high||0));
      lines.push('multi-host: ' + (eng.multi_host_explorers||0) + ' avg=' + n(eng.avg_surfaces||0, 1));
    } else {
      lines.push('<span class="good">seo</span> — lessons');
      var ln = s.learning || {};
      lines.push('fleet:human = ' + (ln.fleet_human_ratio || '?') + ':1');
      lines.push('waste ratio: ' + (ln.waste_ratio || '?') + '%');
      lines.push('discovery score: ' + (ln.discovery_score || '?'));
      lines.push('');
      (ln.lessons || []).forEach(function(l) {
        lines.push('• ' + l.observation);
        lines.push('  → ' + l.implication);
        lines.push('');
      });
    }

    addEntry('chipmunk', lines.join('\n'));
  }



  // --- peckPiRange: narrate the extended π ranges ---
  function peckPiRange(w) {
    var r = cache.piRanges;
    if (!r) { addEntry('chipmunk', 'pi-ranges feed not loaded yet...'); return; }
    var lines = [];

    if (w === 'who') {
      lines.push('<span class="good">π ranges</span> — who lives where?');
      (r.ranges || []).forEach(function(rng) {
        var ents = Object.keys(rng.entities || {});
        var pop = ents.length > 0 ? ents.map(function(e) {
          return e + '=' + (typeof rng.entities[e] === 'number' ? rng.entities[e].toLocaleString() : rng.entities[e]);
        }).join(', ') : '(empty)';
        var mark = rng.populated ? '●' : '○';
        lines.push(mark + ' π^' + rng.power + ' ' + rng.name + ': ' + pop);
      });
    } else if (w === 'what') {
      lines.push('<span class="good">π ranges</span> — the gap');
      var g = r.gap || {};
      lines.push('π³ (surface) = ' + g.lower);
      lines.push('π^π (self-ref) = ' + g.upper);
      lines.push('width: ' + g.width);
      lines.push('');
      lines.push('structural occupant: ' + g.structural_occupant);
      lines.push('');
      var words = (g.why || '').split('. ');
      words.forEach(function(s) { if (s.trim()) lines.push(s.trim() + '.'); });
    } else if (w === 'why') {
      lines.push('<span class="good">π ranges</span> — tower of π');
      (r.tower || []).forEach(function(t) {
        lines.push('  ' + t.expression + ' = ' + t.value);
        if (t.note) lines.push('    ' + t.note);
      });
      lines.push('');
      lines.push('each level of the tower is π raised to the previous.');
      lines.push('π → π^π → π^π^π → ∞');
      lines.push('two steps and it escapes to infinity.');
      lines.push('the membrane can only think two levels deep.');
    } else {
      lines.push('<span class="good">π ranges</span> — structure');
      lines.push(r.summary.populated_ranges + '/' + r.range_count + ' ranges populated');
      lines.push(r.summary.total_measures + ' measures tracked');
      lines.push('');
      lines.push('null(1) → datum(√π) → body(π) → geodesic(π²) → surface(π³)');
      lines.push('  ↓ the old ceiling');
      lines.push('self-ref(π^π) → totality(π⁴) → beyond(π⁵) → rotation(π^2π) → meta(π^π²)');
      lines.push('  ↓ the new range');
      lines.push('');
      lines.push(r.summary.insight);
    }

    addEntry('chipmunk', lines.join('\n'));
  }



  // ── Epitope sort ring injected into membrane SVG ──
  var ringGroup = null;

  // Expose gazes

  // --- peckMesh: chipmunk looks at the cloud mesh ---
  function peckMesh(w) {
    var mn = window._meshNudge;
    if (!mn) { peckStars(w); return; }
    var s = mn.meshSummary();
    if (!s) { addEntry("chipmunk", "<span class=\"dim\">looking at the clouds\u2026 no mesh data yet.</span>"); return; }

    var att = mn.shouldPayAttention();
    var lines = [];

    // Mesh health header
    var healthColor = s.healthPct >= 100 ? "#3fb950" : s.healthPct >= 66 ? "#d29922" : "#f85149";
    lines.push("<span style=\"color:" + healthColor + "\">\u25c9 mesh " + s.healthPct + "%</span> \u2014 " +
      s.aliveNodes + "/" + s.totalNodes + " nodes, " + s.mutualEdges + "/" + s.totalEdges + " mutual edges");

    // Node status
    s.nodes.forEach(function(n) {
      var icon = n.alive ? "\u2714" : "\u2718";
      var col = n.alive ? "#3fb950" : "#f85149";
      var lat = n.latency ? " " + n.latency.toFixed(1) + "ms" : "";
      lines.push("  <span style=\"color:" + col + "\">" + icon + "</span> " + n.name + " (" + n.cloud + ")" + lat);
    });

    // Commensals
    if (s.organisms > 0) {
      lines.push("<span class=\"dim\">" + s.organisms + " organisms across the cloud. " +
        s.banned + " intruders banned" + (s.totalBanned > s.banned ? " (" + s.totalBanned + " total)" : "") + ".</span>");
    }

    // Floating status
    if (s.floating) {
      lines.push("<span class=\"dim\">the clouds see each other. de-tethered. floating.</span>");
    } else {
      lines.push("<span style=\"color:#f85149\">tethered \u2014 mesh needs repair.</span>");
    }

    // Attention level
    if (att.paying) {
      lines.push("<span style=\"color:#d29922\">\u25cf " + att.label + ": " + att.reasons.join(", ") + "</span>");
    }

    addEntry("chipmunk", lines.join("\n"));
  }
  window._chipmunkGaze = {
    peck: peck,
    peckStars: peckStars,
    peckMembrane: peckMembrane,
    peckNull: peckNull,
    peckFleet: peckFleet,
    peckEvolve: peckEvolve,
    peckTotality: peckTotality,
    peckSeo: peckSeo,
    peckPiRange: peckPiRange,
    peckMesh: peckMesh,
  };
})();

/* ---- fossil:chipmunk-pressure.js ---- */
// chipmunk-pressure.js — multi-level thought pressure
// Thoughts spawn at every π shell and push against each other.
// The pressure between levels IS the membrane intelligence.
// Loaded lazily (after gaze.js, before mind.js).
(function() {
  "use strict";
  var _c = window._chipmunkCore;
  if (!_c) { console.warn("chipmunk-pressure: no core context"); return; }

  var cache = _c.cache;
  var PI = _c.PI;
  var PI2 = PI * PI, PI3 = PI * PI * PI;
  var MG = _c.MG;
  var bodyRadius = _c.bodyRadius;
  var n = _c.n;
  var addEntry = _c.addEntry;
  var el = _c.el;
  var SORT_COLORS = _c.SORT_COLORS;
  var thoughts = _c.thoughts;
  var MAX_THOUGHTS = _c.MAX_THOUGHTS;
  var learning = _c.learning;

  // ═══ π SHELLS — each level generates its own thoughts ═══
  var SHELLS = [
    { name: "datum",   pi: 1,          color: "#1a1a2e", glyph: "\u00b7", dir:  1 },
    { name: "pattern", pi: PI,         color: "#3fb950", glyph: "?", dir:  0 },
    { name: "connect", pi: PI2,        color: "#58a6ff", glyph: "~", dir:  0 },
    { name: "thought", pi: PI3,        color: "#e8e8e8", glyph: "\u25cb", dir: -1 },
  ];

  // Pressure field: accumulated force at each shell boundary
  var pressure = {
    "datum_pattern":  0,   // between π⁰ and π¹
    "pattern_connect": 0,  // between π¹ and π²
    "connect_thought": 0,  // between π² and π³
    "net": 0,              // total system pressure
    "events": [],          // recent pressure events
  };

  // ═══ SPAWN — generate thought at a specific π level ═══
  function spawnAt(shellIdx) {
    if (thoughts.length >= MAX_THOUGHTS * 2) return null;
    var shell = SHELLS[shellIdx];
    var r = bodyRadius(shell.pi);
    var angle = Math.random() * 2 * PI;

    // Direction: 1=outward, -1=inward, 0=random
    var dir = shell.dir || (Math.random() < 0.5 ? 1 : -1);

    // What does this level observe?
    var hypothesis, confidence, reasoning;

    if (shell.name === "datum") {
      // π⁰: raw data — entity counts, simple statistics
      var scan = cache.scanSort && cache.scanSort.scan;
      if (!scan) return null;
      var classes = scan.sort_classes || {};
      var total = (classes.self || 0) + (classes["non-self"] || 0) + (classes.partial || 0) + (classes.null || 0);
      if (total === 0) return null;
      // Datum thoughts follow pure statistics
      var selfPct = (classes.self || 0) / total;
      hypothesis = selfPct > 0.5 ? "self" : selfPct > 0.2 ? "partial" : "non-self";
      confidence = 0.3 + Math.abs(selfPct - 0.5) * 0.6;
      reasoning = "datum: " + (classes.self||0) + "s/" + (classes["non-self"]||0) + "ns/" + (classes.null||0) + "n";
    }
    else if (shell.name === "pattern") {
      // π¹: structural patterns — timing, behavioral clusters
      var dash = cache.dashboard;
      if (!dash) return null;
      var timing = dash.timing || {};
      var cv = timing.cv || 1;
      // Low CV = metronomic = fleet. High CV = varied = human.
      hypothesis = cv < 0.5 ? "non-self" : cv > 1.5 ? "self" : "partial";
      confidence = 0.4 + Math.min(0.4, Math.abs(cv - 1) * 0.3);
      reasoning = "pattern: cv=" + n(cv, 2) + " " + (cv < 0.5 ? "metronomic" : cv > 1.5 ? "chaotic" : "varied");
    }
    else if (shell.name === "connect") {
      // π²: connections — braids, passages, orbits
      var braid = cache.braid;
      if (!braid || !braid.braids) return null;
      var growing = braid.braids.filter(function(b) { return b.trend === "growing"; }).length;
      var fading = braid.braids.filter(function(b) { return b.trend === "fading"; }).length;
      var total_b = braid.braids.length;
      // Growing braids = life, fading = entropy
      hypothesis = growing > fading ? "self" : growing < fading ? "non-self" : "partial";
      confidence = 0.35 + (Math.abs(growing - fading) / Math.max(total_b, 1)) * 0.5;
      reasoning = "connect: " + growing + "\u2191/" + fading + "\u2193 of " + total_b + " braids";
    }
    else if (shell.name === "thought") {
      // π³: meaning — from sort history and learning predictions
      if (!learning || learning.predictions.length === 0) {
        // Use sort history instead
        var log = _c.thoughtLog || [];
        var selfCount = log.filter(function(t) { return t.hypothesis === "self"; }).length;
        var nsCount = log.filter(function(t) { return t.hypothesis === "non-self"; }).length;
        var total_t = log.length || 1;
        hypothesis = selfCount > nsCount ? "self" : nsCount > selfCount ? "non-self" : "partial";
        confidence = 0.5 + (Math.abs(selfCount - nsCount) / total_t) * 0.3;
        reasoning = "thought: " + selfCount + " self, " + nsCount + " non-self settled";
      } else {
        var correct = learning.correct || 0;
        var total_p = learning.total || 1;
        var acc = correct / total_p;
        hypothesis = acc > 0.6 ? "self" : acc < 0.4 ? "non-self" : "partial";
        confidence = 0.4 + acc * 0.4;
        reasoning = "thought: " + Math.round(acc * 100) + "% prediction accuracy";
      }
      dir = -1; // meaning thoughts always flow inward
    }

    var thought = {
      shell: shellIdx,
      shellName: shell.name,
      angle: angle,
      r: r,
      dir: dir,
      hypothesis: hypothesis,
      reasoning: reasoning,
      confidence: confidence,
      speed: (1.5 + confidence * 3) * dir,
      opacity: 0,
      born: Date.now(),
      survived: false,
      popped: false,
      settled: false,
      pressureEvents: 0,
      el: null,
      labelEl: null,
    };

    thoughts.push(thought);
    return thought;
  }

  // ═══ PRESSURE — check for interactions between thoughts ═══
  function checkPressure() {
    var events = [];

    for (var i = 0; i < thoughts.length; i++) {
      var a = thoughts[i];
      if (!a.shell && a.shell !== 0) continue; // skip old-style thoughts
      if (a.popped || a.survived) continue;

      for (var j = i + 1; j < thoughts.length; j++) {
        var b = thoughts[j];
        if (!b.shell && b.shell !== 0) continue;
        if (b.popped || b.survived) continue;
        if (a.shell === b.shell) continue; // same shell = no pressure

        // Check proximity: thoughts within 8px of each other
        var dr = Math.abs(a.r - b.r);
        var dAngle = Math.abs(a.angle - b.angle);
        if (dAngle > PI) dAngle = 2 * PI - dAngle;
        if (dr > 12 || dAngle > 0.8) continue;

        // PRESSURE EVENT
        var sameDir = (a.dir > 0) === (b.dir > 0);
        var sameHyp = a.hypothesis === b.hypothesis;

        if (sameHyp && !sameDir) {
          // RESONANCE — same hypothesis, opposite directions → both strengthen
          a.confidence = Math.min(0.95, a.confidence + 0.08);
          b.confidence = Math.min(0.95, b.confidence + 0.08);
          a.opacity = Math.min(0.9, a.opacity + 0.1);
          b.opacity = Math.min(0.9, b.opacity + 0.1);
          events.push({ type: "resonate", a: a.shellName, b: b.shellName, hyp: a.hypothesis });
        }
        else if (sameHyp && sameDir) {
          // MERGE — same hypothesis, same direction → absorb weaker
          if (a.confidence > b.confidence) {
            a.confidence = Math.min(0.95, a.confidence + b.confidence * 0.3);
            b.confidence *= 0.3;
            b.speed *= 0.2;
          } else {
            b.confidence = Math.min(0.95, b.confidence + a.confidence * 0.3);
            a.confidence *= 0.3;
            a.speed *= 0.2;
          }
          events.push({ type: "merge", a: a.shellName, b: b.shellName, hyp: a.hypothesis });
        }
        else if (!sameHyp && !sameDir) {
          // ANNIHILATE — different hypothesis, opposite directions → both weaken
          a.confidence *= 0.4;
          b.confidence *= 0.4;
          a.speed *= -0.3; // deflect
          b.speed *= -0.3;
          events.push({ type: "annihilate", a: a.shellName, b: b.shellName,
                        ha: a.hypothesis, hb: b.hypothesis });
        }
        else {
          // COMPETE — different hypothesis, same direction → weaker deflects
          if (a.confidence > b.confidence) {
            b.angle += (Math.random() - 0.5) * 0.6;
            b.confidence *= 0.6;
            b.speed *= 0.5;
          } else {
            a.angle += (Math.random() - 0.5) * 0.6;
            a.confidence *= 0.6;
            a.speed *= 0.5;
          }
          events.push({ type: "compete", a: a.shellName, b: b.shellName,
                        ha: a.hypothesis, hb: b.hypothesis });
        }

        a.pressureEvents++;
        b.pressureEvents++;
      }
    }

    // Update pressure field
    if (events.length > 0) {
      pressure.events = events.slice(-10);
      var net = 0;
      events.forEach(function(ev) {
        if (ev.type === "resonate") net += 2;
        else if (ev.type === "merge") net += 1;
        else if (ev.type === "annihilate") net -= 2;
        else if (ev.type === "compete") net -= 1;
      });
      pressure.net = Math.max(-10, Math.min(10, pressure.net + net * 0.1));
    }
    // Decay toward zero
    pressure.net *= 0.98;

    return events;
  }

  // ═══ PRESSURE CYCLE — spawn thoughts at each level periodically ═══
  var _lastSpawn = [0, 0, 0, 0];
  var SPAWN_INTERVALS = [6000, 8000, 10000, 12000]; // π⁰ fastest, π³ slowest

  function pressureCycle() {
    var now = Date.now();

    for (var i = 0; i < SHELLS.length; i++) {
      if (now - _lastSpawn[i] > SPAWN_INTERVALS[i]) {
        var t = spawnAt(i);
        if (t) _lastSpawn[i] = now;
      }
    }

    // Check for pressure interactions
    var events = checkPressure();

    // Narrate significant pressure events (sparingly)
    if (events.length > 0 && Math.random() < 0.15) {
      var ev = events[0];
      var lines = [];
      if (ev.type === "resonate") {
        lines.push("\u2728 <b>resonance</b>: " + ev.a + " \u2194 " + ev.b +
                   " agree on <span class=\"good\">" + ev.hyp + "</span>");
      } else if (ev.type === "annihilate") {
        lines.push("\u26a1 <b>annihilation</b>: " + ev.a + "(" + ev.ha + ") \u2194 " +
                   ev.b + "(" + ev.hb + ") — both dissolved");
      } else if (ev.type === "merge") {
        lines.push("\u2b50 <b>merge</b>: " + ev.a + " + " + ev.b +
                   " \u2192 stronger <span class=\"good\">" + ev.hyp + "</span>");
      } else if (ev.type === "compete") {
        lines.push("\u2694 <b>pressure</b>: " + ev.a + "(" + ev.ha + ") vs " +
                   ev.b + "(" + ev.hb + ")");
      }
      if (lines.length > 0) {
        lines.push("<span class=\"dim\">net pressure: " + n(pressure.net, 2) +
                   " (" + (pressure.net > 0 ? "outward" : pressure.net < 0 ? "inward" : "balanced") + ")</span>");
        addEntry("chipmunk", lines.join("\n"));
      }
    }
  }

  // ═══ RENDER — pressure field visualization on SVG ═══
  var _pressureGroup = null;

  function renderPressure() {
    var svgEl = _c.svgEl;
    if (!svgEl) return;

    if (!_pressureGroup) {
      _pressureGroup = el("g", { id: "mg-pressure", opacity: "0.4" }, svgEl);
      // Draw pressure zone arcs between each shell pair
      SHELLS.forEach(function(shell, i) {
        if (i < SHELLS.length - 1) {
          var r1 = bodyRadius(shell.pi);
          var r2 = bodyRadius(SHELLS[i + 1].pi);
          var mid = (r1 + r2) / 2;
          el("circle", {
            cx: MG.cx, cy: MG.cy, r: mid.toFixed(1),
            fill: "none", stroke: "#484f58",
            "stroke-width": "0.5",
            "stroke-dasharray": "1,6",
            opacity: "0.2",
            id: "pressure-zone-" + i,
          }, _pressureGroup);
        }
      });
    }

    // Update pressure zone opacity based on recent events
    var recentEvents = pressure.events;
    for (var z = 0; z < SHELLS.length - 1; z++) {
      var zone = _pressureGroup.querySelector("#pressure-zone-" + z);
      if (!zone) continue;
      var zoneActive = recentEvents.some(function(ev) {
        return (ev.a === SHELLS[z].name && ev.b === SHELLS[z + 1].name) ||
               (ev.b === SHELLS[z].name && ev.a === SHELLS[z + 1].name);
      });
      zone.setAttribute("opacity", zoneActive ? "0.6" : "0.15");
      zone.setAttribute("stroke", zoneActive ?
        (pressure.net > 0 ? "#3fb950" : pressure.net < 0 ? "#e85d3a" : "#58a6ff") :
        "#484f58");
    }
  }

  // ═══ BOOT ═══
  setInterval(pressureCycle, 3000);
  setInterval(renderPressure, 2000);

  // Expose
  window._chipmunkPressure = {
    SHELLS: SHELLS,
    pressure: pressure,
    spawnAt: spawnAt,
    checkPressure: checkPressure,
    pressureCycle: pressureCycle,
    renderPressure: renderPressure,
  };
})();

/* ---- fossil:chipmunk-thought.js ---- */
/* chipmunk-thought.js — thought dimension system
 * Extracted from chipmunk-mind.js. Thoughts radiate outward
 * through π-dimensional layers: null → self → connect → thought → beyond.
 */
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) return;

  var cache      = _c.cache;
  var learning   = _c.learning;
  var el         = _c.el;
  var n          = _c.n;
  var PI         = _c.PI;
  var PI2        = PI * PI, PI3 = PI * PI * PI;
  var MG         = _c.MG;
  var bodyRadius = _c.bodyRadius;
  var addEntry   = _c.addEntry;
  var thoughts   = _c.thoughts;
  var thoughtLog = _c.thoughtLog;
  var MAX_THOUGHTS = _c.MAX_THOUGHTS;
  var SORT_COLORS  = _c.SORT_COLORS;
  var sessionId    = _c.sessionId;
  var svgEl        = _c.svgEl;

  // ═══ THOUGHT DIMENSIONS ═══
  // Thoughts shift color as they cross π layers:
  //   null(π⁰) → self(π¹) → connect(π²) → thought(π³) → beyond(π^π)
  var THOUGHT_DIMENSIONS = [
    { name: 'null',     color: '#1a1a2e', glyph: '·', pi: 1,     label: 'void'    },
    { name: 'self',     color: '#3fb950', glyph: '?', pi: PI,    label: 'self'    },
    { name: 'connect',  color: '#58a6ff', glyph: '~', pi: PI2,   label: 'connect' },
    { name: 'thought',  color: '#e8e8e8', glyph: '○', pi: PI3,   label: 'thought' },
    { name: 'external', color: '#e85d3a', glyph: '!', pi: PI3 * 1.18, label: 'beyond' },
  ];

  function lerpColor(a, b, t) {
    var ah = parseInt(a.replace('#',''), 16);
    var bh = parseInt(b.replace('#',''), 16);
    var ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
    var br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
    var rr = Math.round(ar + (br - ar) * t);
    var rg = Math.round(ag + (bg - ag) * t);
    var rb = Math.round(ab + (bb - ab) * t);
    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1);
  }

  // Get the dimensional color for a thought at a given radius
  function thoughtDimensionColor(r) {
    var radii = THOUGHT_DIMENSIONS.map(function(d) { return bodyRadius(d.pi); });
    // Before first boundary: null color
    if (r <= radii[0]) return THOUGHT_DIMENSIONS[0].color;
    // After last boundary: external color
    if (r >= radii[radii.length - 1]) return THOUGHT_DIMENSIONS[radii.length - 1].color;
    // Interpolate between boundaries
    for (var i = 0; i < radii.length - 1; i++) {
      if (r >= radii[i] && r < radii[i + 1]) {
        var t = (r - radii[i]) / (radii[i + 1] - radii[i]);
        return lerpColor(THOUGHT_DIMENSIONS[i].color, THOUGHT_DIMENSIONS[i + 1].color, t);
      }
    }
    return THOUGHT_DIMENSIONS[0].color;
  }

  // Get the dimension name for a thought at a given radius
  function thoughtDimensionName(r) {
    var radii = THOUGHT_DIMENSIONS.map(function(d) { return bodyRadius(d.pi); });
    for (var i = radii.length - 1; i >= 0; i--) {
      if (r >= radii[i] * 0.9) return THOUGHT_DIMENSIONS[i];
    }
    return THOUGHT_DIMENSIONS[0];
  }

  // Get glyph for current dimension
  function thoughtGlyph(r) {
    return thoughtDimensionName(r).glyph;
  }


  // --- spawnFleetThought (L1951) ---
  function spawnFleetThought() {
    var anderson = cache.dashboard.anderson_selectivity || {};
    var modes = anderson.modes || [];
    var fleetClasses = modes.filter(function(m) { return m.class !== 'human' && m.class !== 'sovereign'; });
    if (fleetClasses.length === 0) return;

    // Pick a fleet class to hypothesize about
    var target = fleetClasses[Math.floor(Math.random() * fleetClasses.length)];
    
    // Hypothesis: what IS this fleet entity, really?
    var hypothesis;
    var confidence;
    var reasoning;

    if (target.class === 'chorus') {
      // Chorus is obviously non-self — high confidence
      hypothesis = 'non-self';
      confidence = 0.85 + Math.random() * 0.1;
      reasoning = 'chorus: ' + target.count.toLocaleString() + ' entities, p_obs=' + target.p_observed.toFixed(2) + ' — overwhelming volume, no pause, no reflection';
    }
    else if (target.class === 'ghost') {
      // Ghost is ambiguous — could be proxy exit (partial) or mimic (non-self)
      hypothesis = Math.random() < 0.6 ? 'partial' : 'non-self';
      confidence = 0.3 + Math.random() * 0.3;
      reasoning = 'ghost: ' + target.count.toLocaleString() + ' entities, p_obs=' + target.p_observed.toFixed(2) + ' — mimics human headers but identity uncertain';
    }
    else if (target.class === 'stealth') {
      // Stealth is invisible — null-like
      hypothesis = Math.random() < 0.5 ? 'non-self' : 'partial';
      confidence = 0.15 + Math.random() * 0.2;
      reasoning = 'stealth: ' + target.count + ' entities — evades all sensors, identity unknown';
    }
    else if (target.class === 'spectrum') {
      // Spectrum is at the boundary — partially classified
      hypothesis = 'partial';
      confidence = 0.4 + Math.random() * 0.2;
      reasoning = 'spectrum: ' + target.count + ' entities at classification boundary — in transit between self and non-self';
    }
    else {
      hypothesis = 'non-self';
      confidence = 0.5;
      reasoning = target.class + ': unknown fleet type';
    }

    // Use fleet learning to adjust confidence
    var fleetMem = learning.fleetMemory['fleet:' + target.class];
    if (fleetMem && fleetMem.prev_count !== null) {
      // If count is stable, increase confidence
      if (Math.abs(fleetMem.delta) < 10) confidence = Math.min(0.95, confidence + 0.1);
      // If count is volatile, decrease confidence  
      else confidence = Math.max(0.1, confidence - 0.1);
    }

    var angle = Math.random() * 2 * PI;
    var thought = {
      angle: angle,
      r: 3,
      hypothesis: hypothesis,
      reasoning: reasoning,
      confidence: confidence,
      speed: 2 + confidence * 4,
      opacity: 0,
      born: Date.now(),
      survived: false,
      popped: false,
      settled: false,
      el: null,
      labelEl: null,
      entityIdx: -1, // fleet thoughts use negative index
      isFleet: true,
      fleetClass: target.class,
    };

    thoughts.push(thought);
  }

  // --- spawnThought (L2027) ---
  function spawnThought() {
    if (thoughts.length >= MAX_THOUGHTS) return;
    if (!cache.scanSort || !cache.scanSort.scan) return;

    // 30% chance: think about a fleet entity instead of null
    var thinkFleet = Math.random() < 0.3 && cache.dashboard && cache.dashboard.anderson_selectivity;
    
    if (thinkFleet) {
      spawnFleetThought();
      return;
    }

    // Pick a null entity to think about
    var nullCount = (cache.scanSort.scan.sort_classes || {}).null || 0;
    if (nullCount === 0) return;

    // Generate a hypothesis based on what chipmunk has learned
    var hypothesis;
    var confidence;
    if (learning.phase === 'mimic') {
      // In mimic phase, hypothesis is random
      var r = Math.random();
      hypothesis = r < 0.4 ? 'self' : r < 0.7 ? 'partial' : 'non-self';
      confidence = 0.2 + Math.random() * 0.3; // low confidence
    } else {
      // In mirror/reflect, use learned ratios
      var r2 = Math.random();
      if (r2 < (learning.selfRatio || 0.3)) hypothesis = 'self';
      else if (r2 < (learning.selfRatio || 0.3) + (learning.partialRatio || 0.3)) hypothesis = 'partial';
      else hypothesis = 'non-self';
      confidence = Math.min(0.9, (learning.confidence || 0.3) + Math.random() * 0.2);
    }

    // Pick an edge type that might explain the entity
    var edgeTypes = (cache.scanSort.scan.edge_types) || {};
    var etKeys = Object.keys(edgeTypes);
    var reasoning = etKeys.length > 0 ? etKeys[Math.floor(Math.random() * etKeys.length)] : 'unknown';

    var angle = Math.random() * 2 * PI;
    var thought = {
      angle: angle,
      r: 3,
      hypothesis: hypothesis,
      reasoning: reasoning,
      confidence: confidence,
      speed: 2 + confidence * 4, // confident thoughts move faster
      opacity: 0,
      born: Date.now(),
      survived: false,
      popped: false,
      settled: false,
      el: null,
      labelEl: null,
      entityIdx: Math.floor(Math.random() * nullCount),
    };

    thoughts.push(thought);
  }

  // --- animateThoughts (L2086) ---
  function animateThoughts(now) {
    if (!svgEl) return;
    var cx2 = MG.cx, cy2 = MG.cy;
    var surfaceR = bodyRadius(PI3);

    // Create a thoughts group if needed
    var tGroup = svgEl.querySelector('#mg-thoughts');
    if (!tGroup) {
      tGroup = el('g', { id: 'mg-thoughts' }, svgEl);
      // Draw dimensional guide rings — faint circles at each π boundary
      THOUGHT_DIMENSIONS.forEach(function(dim) {
        var dimR = bodyRadius(dim.pi);
        el('circle', {
          cx: cx2, cy: cy2, r: dimR.toFixed(1),
          fill: 'none', stroke: dim.color,
          'stroke-width': '0.3',
          'stroke-dasharray': '2,4',
          opacity: '0.15'
        }, tGroup);
      });
    }

    for (var ti = thoughts.length - 1; ti >= 0; ti--) {
      var t = thoughts[ti];

      // Create SVG elements if needed
      if (!t.el) {
        t.el = el('circle', {
          r: 2.5 + t.confidence * 2,
          fill: SORT_COLORS[t.hypothesis] || '#484f58',
          opacity: 0,
          filter: 'url(#thought-glow)',
          'class': 'thought-bubble'
        }, tGroup);
        // Add a tiny label showing the hypothesis
        t.labelEl = el('text', {
          fill: '#c9d1d9', 'font-size': 2,
          'text-anchor': 'middle',
          'font-family': '"Courier New",monospace',
          opacity: 0,
          'class': 'thought-label'
        }, tGroup);
        t.labelEl.textContent = t.isAgent ? '\u2728' : t.hypothesis === 'self' ? '?' : t.hypothesis === 'non-self' ? '!' : '~';
      }

      // Move outward
      t.r += t.speed * 0.08;
      t.opacity = Math.min(0.6, t.opacity + 0.02);

      var tx = cx2 + t.r * Math.cos(t.angle);
      var ty = cy2 + t.r * Math.sin(t.angle);

      // Dimensional color shift — thought color changes as it crosses π layers
      var dimColor = thoughtDimensionColor(t.r);
      t.el.setAttribute('fill', dimColor);
      t.el.setAttribute('cx', tx.toFixed(1));
      t.el.setAttribute('cy', ty.toFixed(1));
      t.el.setAttribute('opacity', t.opacity.toFixed(2));

      // Glyph shifts with dimension
      var dimGlyph = thoughtGlyph(t.r);
      if (t.labelEl.textContent !== dimGlyph) t.labelEl.textContent = dimGlyph;
      t.labelEl.setAttribute('x', tx.toFixed(1));
      t.labelEl.setAttribute('y', (ty - 3).toFixed(1));
      t.labelEl.setAttribute('opacity', (t.opacity * 0.7).toFixed(2));

      // At each dimensional boundary, the thought transforms
      // null(black) → self(green) → connect(blue) → thought(white) → beyond(red)
      THOUGHT_DIMENSIONS.forEach(function(dim, di) {
        var br = bodyRadius(dim.pi);
        if (Math.abs(t.r - br) < 1.5 && !t['crossed_' + dim.name]) {
          t['crossed_' + dim.name] = true;
          t.currentDimension = dim.name;

          // Each boundary tests a different aspect
          var testScore;
          if (dim.name === 'null') {
            testScore = 0.9; // everything passes null — you exist
          } else if (dim.name === 'self') {
            // Self test: does this thought recognize itself?
            testScore = t.hypothesis === 'self' ? 0.8 : 0.5;
          } else if (dim.name === 'connect') {
            // Connection test: can this thought relate to others?
            testScore = t.hypothesis === 'partial' ? 0.7 : t.confidence;
          } else if (dim.name === 'thought') {
            // Thought test: is it clear enough to be expressed?
            testScore = t.confidence;
          } else {
            // Beyond test: does it survive contact with the external?
            testScore = t.hypothesis === 'non-self' ? 0.75 : t.confidence * 0.7;
          }

          if (Math.random() < testScore) {
            t.confidence = Math.min(0.95, t.confidence + 0.05);
            t.speed *= 1.1;
            // Flash: briefly brighten at boundary crossing
            t.opacity = Math.min(0.8, t.opacity + 0.15);
          } else {
            t.confidence *= 0.6;
            t.speed *= 0.5;
            t.angle += (Math.random() - 0.5) * 0.5;
          }
        }
      });

      // Dissipation check — low confidence thoughts pop
      if (t.confidence < 0.1 && t.r > bodyRadius(1)) {
        t.popped = true;
      }

      // Surface arrival — thought survived!
      if (t.r >= surfaceR * 0.9 && !t.popped && (!t.dir || t.dir > 0)) {
        t.survived = true;
      }
      // Core arrival — inward thought reached the center
      if (t.dir && t.dir < 0 && t.r <= 5 && !t.popped) {
        t.survived = true;
      }

      // Remove popped or survived thoughts
      if (t.popped || t.survived) {
        // Fade out
        t.opacity -= 0.1;
        if (t.opacity <= 0) {
          if (t.el && t.el.parentNode) t.el.parentNode.removeChild(t.el);
          if (t.labelEl && t.labelEl.parentNode) t.labelEl.parentNode.removeChild(t.labelEl);

          if (t.survived && !t.settled) {
            t.settled = true;
            // This thought made it — record the inner sort result
            thoughtLog.push({
              hypothesis: t.hypothesis,
              reasoning: t.reasoning,
              confidence: t.confidence,
              entityIdx: t.entityIdx,
              dimension: (t.currentDimension || thoughtDimensionName(t.r).name),
              color: thoughtDimensionColor(t.r),
              ts: Date.now()
            });

            // Announce it sparingly
            if (thoughtLog.length % 3 === 1) {
              addEntry('chipmunk',
                '<span class="dim">&#128173;</span> thought settled: <span style="color:' + thoughtDimensionColor(t.r) + '">' + thoughtDimensionName(t.r).label + '</span> #' + t.entityIdx +
                ' \u2192 <span class="' + (t.hypothesis === 'self' ? 'good' : 'warn') + '">' +
                t.hypothesis + '</span> (via ' + t.reasoning + ', conf ' + n(t.confidence, 2) + ')');

              // Journal the inner sort
              try {
                fetch('/chipmunk/note', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    session: sessionId,
                    note: 'THOUGHT_SORT: null#' + t.entityIdx + ' \u2192 ' + t.hypothesis,
                    context: {
                      reasoning: t.reasoning,
                      confidence: t.confidence,
                      phase: learning.phase,
                      thoughtsSettled: thoughtLog.length
                    }
                  })
                }).catch(function() {});
              } catch(e2) {}
            }
          }
          thoughts.splice(ti, 1);
        }
      }

      // Age out stale thoughts (> 30s, or > 20s for pressure thoughts)
      var maxAge = t.shell !== undefined ? 20000 : 30000;
      if (Date.now() - t.born > maxAge && !t.survived) {
        t.popped = true;
      }
    }
  }


  // ═══ EXPORT ═══
  window._chipmunkThought = {
    THOUGHT_DIMENSIONS: THOUGHT_DIMENSIONS,
    lerpColor: lerpColor,
    thoughtDimensionColor: thoughtDimensionColor,
    thoughtDimensionName: thoughtDimensionName,
    thoughtGlyph: thoughtGlyph,
    spawnFleetThought: spawnFleetThought,
    spawnThought: spawnThought,
    animateThoughts: animateThoughts
  };
})();

/* ---- fossil:chipmunk-learn.js ---- */
/* chipmunk-learn.js — learning engine
 * Extracted from chipmunk-mind.js. Three phases:
 * mimic (watch data) → mirror (predict) → reflect (evaluate).
 */
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) return;

  var cache      = _c.cache;
  var learning   = _c.learning;
  var n          = _c.n;
  var addEntry   = _c.addEntry;
  var checkPhase = _c.checkPhase;
  var sortQueue  = _c.sortQueue;
  var curiosity  = _c.curiosity;
  var sessionId  = _c.sessionId;

  // --- mimicSort (L2420) ---
  function mimicSort() {
    if (!cache.scanSort || !cache.scanSort.sort) return;
    var u = cache.scanSort.sort.unified_sort || {};

    // Build a ratio model: what fraction are self vs non-self?
    var total = u.total || 1;
    learning.selfRatio = (u.self || 0) / total;
    learning.nonSelfRatio = (u.non_self || 0) / total;
    learning.partialRatio = (u.partial || 0) / total;
    learning.nullRatio = (u.null || 0) / total;
  }

  // --- mimicBraids (L2433) ---
  function mimicBraids() {
    if (!cache.braid || !cache.braid.braids) return;
    cache.braid.braids.forEach(function(b) {
      var key = b.from + ':' + b.to;
      var prev = learning.braidMemory[key];
      learning.braidMemory[key] = {
        strength: b.strength,
        trend: b.trend,
        delta: b.delta,
        ts: Date.now(),
        prev: prev ? prev.strength : null,
      };
    });
  }

  // --- mimicOrbits (L2449) ---
  function mimicOrbits() {
    if (!cache.human || !cache.human.orbits) return;
    learning.orbitPatterns = cache.human.orbits.map(function(o) {
      return { path: o.path, visitors: o.visitors };
    });
  }

  // --- mimicFleet (L2458) ---
  function mimicFleet() {
    var d = cache.dashboard;
    if (!d) return;
    var anderson = d.anderson_selectivity || {};
    var modes = anderson.modes || [];

    modes.forEach(function(m) {
      if (m.class === 'human' || m.class === 'sovereign') return;
      var key = 'fleet:' + m.class;
      var prev = learning.fleetMemory[key];
      learning.fleetMemory[key] = {
        count: m.count,
        p_obs: m.p_observed,
        p_pred: m.p_predicted,
        ts: Date.now(),
        prev_count: prev ? prev.count : null,
        delta: prev ? m.count - prev.count : 0,
      };
    });

    // Learn fleet behavioral signatures
    var timing = d.timing || {};
    learning.fleetMemory._timing = {
      cv: timing.cv || 0,
      interval_ms: timing.avg_interval_ms || 0,
      confidence: timing.machine_confidence || 'UNKNOWN',
    };

    // Track the ratio — this is the core non-self signature
    var fleetTotal = 0, humanTotal = 0;
    modes.forEach(function(m) {
      if (m.class === 'human') humanTotal = m.count;
      else if (m.class !== 'sovereign') fleetTotal += m.count;
    });
    learning.fleetMemory._ratio = fleetTotal / Math.max(1, humanTotal);

    // Record a fleet pattern if something interesting happened
    var patterns = learning.fleetPatterns;
    if (patterns.length > 20) patterns.shift(); // keep last 20

    // Detect new stealth entities
    var stealth = modes.find(function(m) { return m.class === 'stealth'; });
    if (stealth && stealth.count > 0) {
      var prevStealth = learning.fleetMemory['fleet:stealth'];
      if (prevStealth && prevStealth.prev_count !== null && stealth.count !== prevStealth.prev_count) {
        patterns.push({
          type: 'stealth_change',
          from: prevStealth.prev_count,
          to: stealth.count,
          ts: Date.now(),
        });
      }
    }

    // Detect ghost population shifts
    var ghost = modes.find(function(m) { return m.class === 'ghost'; });
    if (ghost) {
      var prevGhost = learning.fleetMemory['fleet:ghost'];
      if (prevGhost && prevGhost.prev_count !== null) {
        var ghostDelta = Math.abs(ghost.count - prevGhost.prev_count);
        if (ghostDelta > 100) {
          patterns.push({
            type: 'ghost_shift',
            delta: ghost.count - prevGhost.prev_count,
            count: ghost.count,
            ts: Date.now(),
          });
        }
      }
    }
  }

  // --- mirrorFleet (L2531) ---
  function mirrorFleet() {
    if (learning.phase === 'mimic') return;
    var mem = learning.fleetMemory;
    if (!mem._timing) return;

    // Predict: will ghost count go up or down next cycle?
    var ghost = mem['fleet:ghost'];
    if (ghost && ghost.prev_count !== null) {
      var direction = ghost.count > ghost.prev_count ? 'up' : ghost.count < ghost.prev_count ? 'down' : 'stable';
      var prediction = {
        entity: 'fleet:ghost',
        type: 'fleet_direction',
        predicted: direction,
        count_at_prediction: ghost.count,
        ts: Date.now(),
      };
      learning.predictions.push(prediction);
      if (learning.predictions.length > 50) learning.predictions.shift();
    }

    // Predict: is the fleet-to-human ratio increasing or stable?
    if (mem._ratio) {
      var prevRatio = mem._prevRatio || mem._ratio;
      var ratioDir = mem._ratio > prevRatio * 1.05 ? 'increasing' : mem._ratio < prevRatio * 0.95 ? 'decreasing' : 'stable';
      learning.predictions.push({
        entity: 'fleet:ratio',
        type: 'fleet_ratio_trend',
        predicted: ratioDir,
        ratio: mem._ratio,
        ts: Date.now(),
      });
      mem._prevRatio = mem._ratio;
    }
  }

  // --- mirrorSort (L2567) ---
  function mirrorSort() {
    if (learning.phase === 'mimic') return; // not ready yet
    if (!sortQueue || sortQueue.length === 0) return;

    // Pick the next unsorted item
    var item = sortQueue[0];
    if (!item) return;

    // Use learned ratios to guess
    var r = Math.random();
    var guess;
    if (r < learning.selfRatio) guess = 'self';
    else if (r < learning.selfRatio + learning.nonSelfRatio) guess = 'non-self';
    else if (r < learning.selfRatio + learning.nonSelfRatio + learning.partialRatio) guess = 'partial';
    else guess = 'skip';

    // Don't actually vote — just predict and wait for human
    learning.predictions.push({
      entity: item.entity,
      guess: guess,
      ts: Date.now()
    });

    addEntry('chipmunk', '<span class="dim">&#129300;</span> i think <span class="good">' +
      item.entity + '</span> is <span class="num">' + guess + '</span>' +
      '\n<span class="dim">confidence: ' + n(learning.confidence * 100, 0) + '%</span>');

    // Journal the prediction
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'PREDICT: ' + item.entity + ' \u2192 ' + guess,
          context: {
            phase: learning.phase,
            confidence: learning.confidence,
            selfRatio: learning.selfRatio,
            attention: curiosity.attention
          }
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // --- mirrorBraids (L2614) ---
  function mirrorBraids() {
    if (learning.phase === 'mimic') return;

    var changes = [];
    var mem = learning.braidMemory;
    Object.keys(mem).forEach(function(key) {
      var b = mem[key];
      if (b.prev !== null && b.prev !== b.strength) {
        var delta = b.strength - b.prev;
        if (Math.abs(delta) > 0.5) {
          changes.push({
            braid: key,
            delta: delta,
            direction: delta > 0 ? 'growing' : 'fading'
          });
        }
      }
    });

    if (changes.length > 0) {
      var lines = ['<span class="dim">&#128269; braid changes detected:</span>'];
      changes.slice(0, 3).forEach(function(c) {
        var icon = c.direction === 'growing' ? '\u2191' : '\u2193';
        lines.push('  ' + icon + ' ' + c.braid.replace(':', ' \u2194 ') +
          ' (' + (c.delta > 0 ? '+' : '') + n(c.delta, 1) + ')');
      });
      addEntry('chipmunk', lines.join('\n'));
    }
  }

  // --- reflect (L2645) ---
  function reflect() {
    if (learning.phase !== 'reflect') return;
    if (Date.now() - learning.lastReflection < 120000) return; // every 2 min max
    learning.lastReflection = Date.now();

    var lines = ['<span class="dim">&#128694; reflecting...</span>'];

    // Check prediction accuracy
    if (learning.total > 0) {
      var accuracy = learning.correct / learning.total;
      learning.confidence = accuracy;
      lines.push('predictions: ' + learning.correct + '/' + learning.total +
        ' (' + n(accuracy * 100, 0) + '% accurate)');

      if (accuracy > 0.7) {
        lines.push('<span class="good">getting better at sorting</span>');
      } else if (accuracy < 0.4) {
        lines.push('<span class="warn">still learning \u2014 need more data</span>');
      }
    }

    // Braid pattern detection
    var growing = 0, fading = 0, stable = 0;
    Object.keys(learning.braidMemory).forEach(function(key) {
      var b = learning.braidMemory[key];
      if (b.trend === 'growing') growing++;
      else if (b.trend === 'fading') fading++;
      else stable++;
    });
    lines.push('braids: ' + growing + ' growing, ' + fading + ' fading, ' + stable + ' stable');

    // Phase assessment — should we advance?
    if (learning.phase === 'reflect' && learning.total >= 10 && learning.confidence > 0.6) {
      lines.push('<span class="good">\u2713 i can sort on my own now</span>');
    }

    addEntry('chipmunk', lines.join('\n'));

    // Journal reflection
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'REFLECT: phase=' + learning.phase +
            ' accuracy=' + n(learning.confidence, 2) +
            ' predictions=' + learning.total,
          context: {
            phase: learning.phase,
            confidence: learning.confidence,
            growing: growing, fading: fading, stable: stable
          }
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // --- learnCycle (L2723) ---
  function learnCycle() {
    mimicSort();
    mimicBraids();
    mimicOrbits();
    mimicFleet();
    checkPhase();

    if (learning.phase === 'mirror') {
      mirrorSort();
      mirrorBraids();
      mirrorFleet();
    }

    if (learning.phase === 'reflect') {
      reflect();
    }
  }


  // ═══ EXPORT ═══
  window._chipmunkLearn = {
    mimicSort: mimicSort,
    mimicBraids: mimicBraids,
    mimicOrbits: mimicOrbits,
    mimicFleet: mimicFleet,
    mirrorFleet: mirrorFleet,
    mirrorSort: mirrorSort,
    mirrorBraids: mirrorBraids,
    reflect: reflect,
    learnCycle: learnCycle
  };
})();

/* ---- fossil:chipmunk-mind-explore.js ---- */
// chipmunk-mind-explore.js — fleet topology, genome, explore, scan, sieve
// Split from chipmunk-mind.js to keep modules ≤1000 lines.
// Reads shared state from window._chipmunkCore.
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) { console.warn('chipmunk-mind-explore: no core context'); return; }

  var cache = _c.cache;
  var addEntry = _c.addEntry;
  var showPanel = _c.showPanel;

  // Shared scan data — set externally by mind.js warmSearchData
  var _scanData = null;
  function setScanData(d) { _scanData = d; }

  // ═══ FLEET TOPOLOGY — who's outside the membrane ═══
  function showFleet() {
    fetch('/detroit-data/fleet.json').then(function(r) { return r.json(); }).then(function(ft) {
      var lines = ['<b>\u2193 FLEET — outside the membrane</b>'];
      lines.push('ratio: <span class="warn">' + ft.summary.ratio + '</span> fleet:human');
      lines.push('selectivity: <span class="good">' + ft.summary.selectivity + '</span>');
      lines.push('genuine humans: <span class="good">' + ft.summary.genuine_humans + '</span>');
      lines.push('ghost IPs: <span class="warn">' + ft.summary.ghost_ips.toLocaleString() + '</span>\n');

      lines.push('<span style="color:#e85d3a">\u25cf FLEET (non-self)</span>');
      var fleetKeys = Object.keys(ft.fleet || {});
      fleetKeys.forEach(function(k) {
        var f2 = ft.fleet[k];
        var honest = f2.honest ? '<span class="good">honest</span>' : '<span class="warn">dishonest</span>';
        lines.push('  <b>' + f2.label + '</b> ' + (f2.requests/1000000).toFixed(1) + 'M reqs \u00b7 ' +
          f2.ips + ' IPs/' + f2.subnets + ' subnets \u00b7 ' + honest);
        lines.push('    <span class="dim">' + f2.behavior + '</span>');
      });

      lines.push('\n<span style="color:#d2a8ff">\u25cf GHOST CLOUD</span>');
      var ghost = ft.human_side.ghost_proxy;
      if (ghost) {
        lines.push('  ' + (ghost.requests/1000).toFixed(0) + 'K reqs through <span class="warn">' +
          ghost.ips.toLocaleString() + ' IPs</span> / ' + ghost.subnets.toLocaleString() + ' subnets');
        lines.push('  <span class="dim">' + ghost.behavior + '</span>');
      }

      lines.push('\n<span style="color:#3fb950">\u25cf HUMAN</span>');
      var hum = ft.human_side.genuine_browser;
      if (hum) {
        lines.push('  ' + (hum.requests/1000).toFixed(0) + 'K reqs \u00b7 ' + hum.ips + ' IPs \u00b7 Chrome lag ' + hum.chrome_lag);
        lines.push('  <span class="dim">' + hum.behavior + '</span>');
        var os = hum.os || {};
        lines.push('  OS: Linux=' + (os.Linux||0).toLocaleString() + ' Win=' + (os.Windows||0).toLocaleString() + ' Mac=' + ((os.macOS||0)).toLocaleString());
      }

      lines.push('\n<span style="color:#58a6ff">\u25cf SOVEREIGN (search engines)</span>');
      var se = ft.search_engines || {};
      Object.keys(se).forEach(function(k) {
        var s2 = se[k];
        lines.push('  ' + s2.label + ': ' + s2.requests + ' reqs \u00b7 ' + s2.ips + ' IPs');
      });

      showPanel('right', 'fleet', lines.join('\n'));
      addEntry('chipmunk', '\u2193 fleet outside: ' + ft.summary.ratio + ' ratio \u00b7 ' +
        ft.summary.genuine_humans + ' humans \u00b7 ' + ft.summary.ghost_ips.toLocaleString() + ' ghost IPs');
    }).catch(function() {
      showPanel('right', 'fleet', '<span class="warn">fleet data unavailable</span>');
    });
  }

  // ═══ GENOME — yeast proteins + DNA layer ═══
  function showGenome() {
    fetch('/detroit-data/genome.json').then(function(r) { return r.json(); }).then(function(gen) {
      var lines = ['<b>\u2191 GENOME — looking up at the biology</b>'];
      lines.push('<span class="dim">' + gen.organism + '</span>');
      lines.push(gen.genome_size_mb + ' Mb \u00b7 ' + gen.chromosomes + ' chromosomes \u00b7 ' + gen.genes + ' genes');
      lines.push(gen.proteins_fetched + ' proteins from AlphaFold\n');

      var layers = gen.layers || {};
      var layerOrder = ['outer_membrane','ER_membrane','mitochondrial_membrane','nuclear_membrane',
        'membrane_synthesis','transport','golgi','protein_folding','signaling','metabolism','ribosome','chromatin'];
      var LAYER_COLORS = {
        'outer_membrane':'#e85d3a','ER_membrane':'#f0883e','mitochondrial_membrane':'#3fb950',
        'nuclear_membrane':'#a371f7','membrane_synthesis':'#d29922','transport':'#58a6ff',
        'golgi':'#5ab87a','protein_folding':'#79c0ff','signaling':'#f1c40f',
        'metabolism':'#e74c3c','ribosome':'#6e7681','chromatin':'#d2a8ff'
      };

      layerOrder.forEach(function(layer) {
        var prots = layers[layer];
        if (!prots) return;
        var color = LAYER_COLORS[layer] || '#6e7681';
        lines.push('<span style="color:' + color + '">\u25cf ' + layer.replace(/_/g, ' ') + '</span>');
        prots.forEach(function(p) {
          var conf = p.pLDDT >= 90 ? 'good' : p.pLDDT >= 70 ? 'num' : 'warn';
          lines.push('  <b>' + p.gene + '</b> <span class="' + conf + '">' + p.pLDDT.toFixed(1) + '</span> \u00b7 ' +
            p.role + ' \u00b7 ' + p.length + ' aa');
        });
      });

      fetch('/detroit-data/ncbi.json').then(function(r2) { return r2.json(); }).then(function(ncbi) {
        if (ncbi.genes && ncbi.genes.length) {
          lines.push('\n<span class="dim">\u{1F9EC} DNA — NCBI Gene</span>');
          ncbi.genes.forEach(function(g2) {
            lines.push('  <b>' + g2.gene + '</b> chr' + g2.chromosome + ' \u2014 ' + g2.description);
          });
        }
        showPanel('left', 'genome', lines.join('\n'));
      }).catch(function() {
        showPanel('left', 'genome', lines.join('\n'));
      });

      var analogies = gen.membrane_analogies || {};
      var aKeys = Object.keys(analogies);
      if (aKeys.length) {
        lines.push('\n<span class="dim">\u2550 membrane \u2194 biology</span>');
        aKeys.slice(0, 8).forEach(function(gene) {
          lines.push('  <b>' + gene + '</b>: ' + analogies[gene]);
        });
        if (aKeys.length > 8) lines.push('  <span class="dim">+' + (aKeys.length - 8) + ' more</span>');
      }

      addEntry('chipmunk', '\u2191 looking up at the genome. ' + gen.proteins_fetched + ' proteins. ' +
        Object.keys(layers).length + ' membrane layers.');
    }).catch(function() {
      showPanel('left', 'genome', '<span class="warn">genome data not loaded</span>');
    });
  }

  // ═══ EXPLORE — tie stories, crimes, braids, graphs together for humans ═══
  var _exploreData = null;

  function showExplore(view, entityId) {
    if (!_exploreData) {
      fetch('/detroit-data/explore.json').then(function(r) { return r.json(); }).then(function(ex) {
        _exploreData = ex;
        showExplore(view, entityId);
      }).catch(function() {
        showPanel('left', 'explore', '<span class="warn">explore data unavailable</span>');
      });
      return;
    }
    var ex = _exploreData;
    var lines = [];

    if (view === 'entity' && entityId) {
      var ent = null;
      for (var i = 0; i < ex.entities.length; i++) {
        if (ex.entities[i].id === entityId) { ent = ex.entities[i]; break; }
      }
      if (!ent) { addEntry('chipmunk', '<span class="warn">entity not found: ' + entityId + '</span>'); return; }

      var classColor = ent.sort_class === 'non-self' ? '#e85d3a' : ent.sort_class === 'self' ? '#3fb950' : ent.sort_class === 'partial' ? '#d29922' : '#6e7681';
      lines.push('<b style="font-size:13px">' + ent.label + '</b>');
      lines.push('<span style="color:' + classColor + '">' + ent.sort_class + '</span> \u00b7 tier ' + ent.tier + ' \u00b7 conf=' + (ent.confidence * 100).toFixed(1) + '% \u00b7 ' + ent.edges + ' edges');
      if (ent.legal_type) lines.push('\u2696\ufe0f ' + ent.legal_type);
      lines.push('');

      var lk = ent.links;
      if (lk.braid) lines.push('\u2550 <a href="' + lk.braid + '" target="_blank" style="color:#58a6ff">Data Braid</a>');
      if (lk.actor) lines.push('\ud83d\udc64 <a href="' + lk.actor + '" target="_blank" style="color:#58a6ff">Actor Profile</a>');
      if (lk.evidence) {
        lines.push('\n<span style="color:#f78166">\ud83d\udcce EVIDENCE</span>');
        lk.evidence.forEach(function(u) {
          var slug = u.split('/evidence/')[1].replace(/\/$/, '');
          lines.push('  <a href="' + u + '" target="_blank" style="color:#f78166">' + slug.replace(/-/g, ' ') + '</a>');
        });
      }
      if (lk.analysis) {
        lines.push('\n<span style="color:#bc8cff">\ud83d\udd0d ANALYSIS</span>');
        lk.analysis.forEach(function(u) {
          var slug = u.split('/analysis/')[1].replace(/\/$/, '');
          lines.push('  <a href="' + u + '" target="_blank" style="color:#bc8cff">' + slug.replace(/-/g, ' ') + '</a>');
        });
      }
      if (lk.investigate) {
        lines.push('\n<span style="color:#d29922">\ud83d\udcdd INVESTIGATE</span>');
        lk.investigate.forEach(function(u) {
          var slug = u.split('/investigate/')[1].replace(/\/$/, '');
          lines.push('  <a href="' + u + '" target="_blank" style="color:#d29922">' + slug.replace(/-/g, ' ') + '</a>');
        });
      }
      if (lk.county) {
        var cslug = lk.county.split('/counties/')[1].replace(/\/$/, '');
        lines.push('\n\ud83c\udfdb\ufe0f <a href="' + lk.county + '" target="_blank" style="color:#58a6ff">County: ' + cslug + '</a>');
      }

      if (ent.connections.length) {
        lines.push('\n<span style="color:#8b949e">\u2500\u2500 CONNECTIONS</span>');
        ent.connections.forEach(function(conn) {
          var cclass = '';
          for (var j = 0; j < ex.entities.length; j++) {
            if (ex.entities[j].id === conn.id) { cclass = ex.entities[j].sort_class; break; }
          }
          var cc = cclass === 'non-self' ? '#e85d3a' : cclass === 'self' ? '#3fb950' : cclass === 'partial' ? '#d29922' : '#6e7681';
          lines.push('  <span class="explore-link" data-eid="' + conn.id + '" style="color:' + cc + ';cursor:pointer;text-decoration:underline">' +
            conn.label + '</span> <span class="dim">(' + conn.type + ', tier ' + conn.tier + ')</span>');
        });
      }

      showPanel('left', 'explore', lines.join('\n'));
      addEntry('chipmunk', '\u2191 exploring <b>' + ent.label + '</b> \u2014 ' + ent.edges + ' edges, ' +
        Object.keys(ent.links).length + ' tuebor links');

    } else if (view === 'path' && entityId) {
      var pathDef = null;
      for (var p = 0; p < ex.paths.length; p++) {
        if (ex.paths[p].id === entityId) { pathDef = ex.paths[p]; break; }
      }
      if (!pathDef) return;

      lines.push('<b style="font-size:13px">' + pathDef.label + '</b>');
      lines.push(pathDef.count + ' edges of type "' + pathDef.edge_type + '"\n');

      var inPath = [];
      ex.entities.forEach(function(ent2) {
        ent2.connections.forEach(function(conn) {
          if (conn.type === pathDef.edge_type) {
            if (inPath.indexOf(ent2.id) === -1) inPath.push(ent2.id);
          }
        });
      });

      inPath.slice(0, 20).forEach(function(eid2) {
        var e2 = null;
        for (var k = 0; k < ex.entities.length; k++) {
          if (ex.entities[k].id === eid2) { e2 = ex.entities[k]; break; }
        }
        if (!e2) return;
        var cc = e2.sort_class === 'non-self' ? '#e85d3a' : e2.sort_class === 'self' ? '#3fb950' : e2.sort_class === 'partial' ? '#d29922' : '#6e7681';
        var link = e2.links.braid || e2.links.actor || '';
        var name = link ? '<a href="' + link + '" target="_blank" style="color:' + cc + '">' + e2.label + '</a>' :
          '<span class="explore-link" data-eid="' + e2.id + '" style="color:' + cc + ';cursor:pointer;text-decoration:underline">' + e2.label + '</span>';
        lines.push(name + ' <span class="dim">(tier ' + e2.tier + ', ' + e2.edges + ' edges)</span>');
      });
      if (inPath.length > 20) lines.push('<span class="dim">+' + (inPath.length - 20) + ' more</span>');

      showPanel('left', 'explore', lines.join('\n'));

    } else {
      lines.push('<b style="font-size:14px">\u2694\ufe0f EXPLORE — tuebor evidence network</b>');
      lines.push('<span class="dim">' + ex.meta.total_entities + ' entities \u00b7 ' + ex.meta.total_edges + ' edges \u00b7 ' +
        ex.meta.entities_with_tuebor_links + ' with documentation</span>');
      lines.push('<span class="dim">' + ex.meta.evidence_count + ' evidence \u00b7 ' + ex.meta.analysis_count + ' analyses \u00b7 ' +
        ex.meta.braid_count + ' braids \u00b7 ' + ex.meta.actor_count + ' actors \u00b7 ' + ex.meta.county_count + ' counties</span>\n');

      lines.push('<span style="color:#f0e68c">\u2500\u2500 INVESTIGATION STORIES</span>');
      ex.stories.forEach(function(s) {
        lines.push(s.icon + ' <a href="' + s.url + '" target="_blank" style="color:#58a6ff"><b>' + s.title + '</b></a>');
        lines.push('  <span class="dim">' + s.subtitle + '</span>');
        var pathNames = s.path.map(function(pid) {
          for (var m = 0; m < ex.entities.length; m++) {
            if (ex.entities[m].id === pid) return ex.entities[m].label;
          }
          return pid;
        });
        lines.push('  <span style="color:#484f58">' + pathNames.join(' \u2192 ') + '</span>');
      });

      lines.push('\n<span style="color:#7ee787">\u2500\u2500 INVESTIGATION ROUTES</span>');
      ex.paths.forEach(function(p) {
        lines.push('  <span class="explore-path" data-pid="' + p.id + '" style="cursor:pointer;color:#7ee787;text-decoration:underline">' +
          p.label + '</span> <span class="dim">(' + p.count + ' edges)</span>');
      });

      var topEnts = ex.entities.slice().sort(function(a, b) { return b.edges - a.edges; }).slice(0, 12);
      lines.push('\n<span style="color:#f78166">\u2500\u2500 MOST CONNECTED</span>');
      topEnts.forEach(function(te) {
        var cc = te.sort_class === 'non-self' ? '#e85d3a' : te.sort_class === 'self' ? '#3fb950' : te.sort_class === 'partial' ? '#d29922' : '#6e7681';
        var lt = te.legal_type ? ' [\u2696 ' + te.legal_type + ']' : '';
        lines.push('  <span class="explore-link" data-eid="' + te.id + '" style="color:' + cc + ';cursor:pointer;text-decoration:underline">' +
          te.label + '</span> <span class="dim">' + te.edges + ' edges' + lt + '</span>');
      });

      showPanel('left', 'explore', lines.join('\n'));
      addEntry('chipmunk', '\u2694\ufe0f explore: ' + ex.meta.total_entities + ' entities, ' + ex.stories.length + ' stories, ' +
        ex.meta.evidence_count + ' evidence, ' + ex.meta.analysis_count + ' analyses. click to follow.');
    }

    setTimeout(function() {
      var links = document.querySelectorAll('.explore-link');
      links.forEach(function(el) {
        el.onclick = function() { showExplore('entity', el.getAttribute('data-eid')); };
      });
      var paths = document.querySelectorAll('.explore-path');
      paths.forEach(function(el) {
        el.onclick = function() { showExplore('path', el.getAttribute('data-pid')); };
      });
    }, 100);
  }

  // ═══ SCAN SUMMARY — show pipeline state in chipmunk panel ═══
  function showScan() {
    var s = _scanData || cache.scanSort;
    if (!s) {
      fetch('/detroit-data/scan.json').then(function(r) { return r.json(); }).then(function(d) {
        _scanData = d;
        showScan();
      }).catch(function() {
        showPanel('left', 'scan', '<span class="warn">scan data unavailable</span>');
      });
      return;
    }

    var sc = s.scan || s;
    var ents = sc.entities_discovered || 0;
    var edges = sc.edges_discovered || 0;
    var classes = sc.sort_classes || {};
    var sort = s.sort || {};
    var sweep = s.sweep || {};
    var foss = s.fossilize || {};
    var evolve = s.evolve || [];

    var lines = ['<b>SCAN \u2192 SWEEP \u2192 SORT</b>'];
    lines.push('');
    lines.push('<span class="good">\u25cf SCAN</span> ' + ents + ' entities \u00b7 ' + edges + ' edges');
    lines.push('  <span style="color:#3fb950">\u2713 self: ' + (classes.self || 0) + '</span>' +
      '  <span style="color:#e85d3a">\u2715 non-self: ' + (classes['non-self'] || 0) + '</span>' +
      '  <span style="color:#f0883e">\u25d0 partial: ' + (classes.partial || 0) + '</span>' +
      '  <span class="dim">null: ' + (classes['null'] || 0) + '</span>');

    var ets = sc.edge_types || {};
    var etKeys = Object.keys(ets).sort(function(a, b) { return ets[b] - ets[a]; });
    if (etKeys.length) lines.push('  edges: ' + etKeys.slice(0, 5).map(function(k) { return k + '=' + ets[k]; }).join(', '));

    var tiers = sc.tiers || {};
    var tierKeys = Object.keys(tiers).sort();
    if (tierKeys.length) lines.push('  tiers: ' + tierKeys.map(function(k) { return 'T' + k + '=' + tiers[k]; }).join(' '));

    var lt = sc.legal_types || {};
    var ltKeys = Object.keys(lt);
    if (ltKeys.length) {
      lines.push('');
      lines.push('<span style="color:#d29922">\u25cf LAWYER SORT</span> ' + ltKeys.length + ' legal types');
      ltKeys.sort(function(a, b) { return lt[b] - lt[a]; }).forEach(function(k) {
        lines.push('  <span style="color:#d29922">\u2696</span> ' + k.replace(/_/g, ' ') + ': ' + lt[k]);
      });
    }

    if (sweep.hierarchy || sweep.jurisdiction_chain) {
      lines.push('');
      lines.push('<span style="color:#a371f7">\u25cf SWEEP</span>');
      if (sweep.hierarchy) lines.push('  hierarchy: ' + sweep.hierarchy);
      if (sweep.jurisdiction_chain) lines.push('  chain: ' + sweep.jurisdiction_chain.join(' \u2192 '));
      if (sweep.tuebor) lines.push('  tuebor: tier ' + sweep.tuebor.tier + ' \u00b7 ' + sweep.tuebor.edges + ' edges \u00b7 ' + sweep.tuebor['class']);
      if (sweep.lawyer_sort) lines.push('  lawyer sort: ' + sweep.lawyer_sort.entities_sorted + ' entities \u00b7 ' + sweep.lawyer_sort.types + ' types');
    }

    if (sort.total) {
      lines.push('');
      lines.push('<span style="color:#f0883e">\u25cf SORT</span> ' + sort.total + ' total');
      lines.push('  selectivity: <span class="num">' + ((sort.selectivity || 0) * 100).toFixed(1) + '%</span>' +
        ' \u00b7 quality: <span class="num">' + ((sort.quality || 0) * 100).toFixed(1) + '%</span>');
    }

    if (foss.observations) {
      lines.push('');
      lines.push('<span class="dim">\u25cf FOSSILIZE</span>');
      var obs = foss.observations;
      Object.keys(obs).forEach(function(k) {
        lines.push('  <span class="dim">' + k + ':</span> ' + obs[k]);
      });
    }

    if (Array.isArray(evolve) && evolve.length) {
      lines.push('');
      lines.push('<span style="color:#7ee787">\u25cf EVOLVE</span> ' + evolve.length + ' recommendations');
      evolve.forEach(function(rec) {
        var pColor = rec.priority === 'high' ? '#e85d3a' : rec.priority === 'medium' ? '#f0883e' : '#484f58';
        lines.push('  <span style="color:' + pColor + '">[' + rec.priority + ']</span> ' + (rec.action || rec.reason || ''));
      });
    }

    showPanel('left', 'scan', lines.join('\n'));
    addEntry('chipmunk', 'scan: ' + ents + ' entities \u00b7 selectivity: ' + ((sort.selectivity || 0) * 100).toFixed(0) + '% \u00b7 quality: ' + ((sort.quality || 0) * 100).toFixed(0) + '%');
  }

  // ═══ SIEVE — tope sort compress + bingo cube sieve ═══
  function showSieve() {
    fetch('/detroit-data/compressed.json').then(function(r) { return r.json(); }).then(function(d) {
      var lines = ['<b>TOPE SORT \u2192 COMPRESS \u2192 SIEVE</b>'];

      lines.push('<span class="dim">' + d.input.entities + ' entities \u00b7 ' + d.input.edges + ' edges</span>');

      lines.push('');
      lines.push('<span class="good">\u25cf COMPRESS</span> ' + d.compress.clusters + ' clusters (ratio ' + d.compress.ratio + ':1)');
      (d.simplify.summary || []).forEach(function(s) {
        var cls = s.sort_class;
        var clsColor = cls === 'self' ? '#3fb950' : cls === 'non-self' ? '#e85d3a' : cls === 'partial' ? '#f0883e' : '#484f58';
        lines.push('  <span style="color:' + clsColor + '">' + cls + '</span>: ' +
          s.total_entities + ' \u2192 ' + s.clusters + ' clusters \u00b7 conf=' + s.avg_confidence);
        if (s.discriminating_edges && s.discriminating_edges.length > 0) {
          var discs = s.discriminating_edges.slice(0, 3).map(function(de) {
            return de.edge_type + '(' + de.ratio + 'x)';
          }).join(', ');
          lines.push('    <span class="dim">discriminators: ' + discs + '</span>');
        }
        var types = Object.keys(s.node_types || {}).map(function(t) { return t + '=' + s.node_types[t]; }).join(', ');
        lines.push('    <span class="dim">' + types + '</span>');
      });

      lines.push('');
      lines.push('<span style="color:#a371f7">\u25cf BINGO SIEVE</span> subcube reveal thresholds');
      (d.bingo_sieve.results || []).forEach(function(r) {
        var inSelf = (r.in_classes || {}).self || 0;
        var inPartial = (r.in_classes || {}).partial || 0;
        var inNull = (r.in_classes || {})['null'] || 0;
        var inNon = (r.in_classes || {})['non-self'] || 0;
        lines.push('  <b>x=' + r.threshold + '</b> (' + r.label + '): <span class="good">' + r.falls_in + ' in</span> / <span class="dim">' + r.falls_out + ' out</span>');
        lines.push('    in: <span style="color:#3fb950">self=' + inSelf + '</span> <span style="color:#f0883e">partial=' + inPartial + '</span> <span class="dim">null=' + inNull + '</span> <span style="color:#e85d3a">non-self=' + inNon + '</span> conf=' + r.in_avg_confidence);
      });

      var piSieve = (d.bingo_sieve.results || []).find(function(r) { return r.label === '1/pi'; });
      if (piSieve) {
        lines.push('');
        lines.push('<span style="color:#a371f7">\u03c0-sieve:</span> ' + piSieve.falls_in + '/' + d.input.entities + ' pass through (top ' + (piSieve.threshold * 100).toFixed(1) + '%)');
      }

      showPanel('left', 'sieve', lines.join('\n'));
      addEntry('chipmunk', d.compress.clusters + ' clusters from ' + d.input.entities + ' entities \u00b7 bingo sieve at 4 thresholds');
    }).catch(function(e) {
      showPanel('left', 'sieve', '<span class="warn">sieve data unavailable: ' + e.message + '</span>');
    });
  }

  window._chipmunkMindExplore = {
    showFleet: showFleet,
    showGenome: showGenome,
    showExplore: showExplore,
    showScan: showScan,
    showSieve: showSieve,
    setScanData: setScanData,
  };
})();

/* ---- fossil:chipmunk-mind.js ---- */
// chipmunk-mind.js — learning, gazes, fleet, thoughts, awareness
// Split from chipmunk-talk.js for deferred loading.
// Loaded when chipmunk overlay opens. Reads shared state from window._chipmunkCore.
(function() {
  'use strict';
  var _c = window._chipmunkCore;
  if (!_c) { console.warn('chipmunk-mind: no core context'); return; }

  // Unpack shared references
  var cache = _c.cache;
  var learning = _c.learning;
  var el = _c.el;
  var n = _c.n;
  var PI = _c.PI;
  var PI2 = PI * PI, PI3 = PI * PI * PI;
  var MG = _c.MG;
  var bodyRadius = _c.bodyRadius;
  var GAZE_NAMES = _c.GAZE_NAMES;
  var thoughtLog = _c.thoughtLog;
  var curiosity = _c.curiosity;

  // Core function references
  var act = _c.act;
  var addEntry = _c.addEntry;
  var bumpAttention = _c.bumpAttention;
  var checkPhase = _c.checkPhase;
  var escapeHtml = _c.escapeHtml;
  var graphWalk = _c.graphWalk;
  var paintAttention = _c.paintAttention;
  var reverseView = _c.reverseView;
  var showPanel = _c.showPanel;
  var traceOrbit = _c.traceOrbit;
  var trackTopic = _c.trackTopic;
  var updateUnfurl = _c.updateUnfurl;

  // SVG element references
  var svgEl = _c.svgEl;
  var SORT_COLORS = _c.SORT_COLORS;
  var W_QUESTIONS = _c.W_QUESTIONS;
  var MAX_THOUGHTS = _c.MAX_THOUGHTS;
  var sortQueue = _c.sortQueue;
  var thoughts = _c.thoughts;
  var sessionId = _c.sessionId;
  var bubbleGroup = _c.bubbleGroup;
  var unfurlGroup = _c.unfurlGroup;

  // --- genObserve ---
  // Chipmunk looks UP toward the data. Human looks DOWN toward chipmunk.
  // They meet at the membrane.
  function genObserve() {
    var lines = [];

    // ↑ Chipmunk looks up — what does it see above?
    lines.push('<span class="dim">\u2191 looking up</span>');
    var h = cache.human;
    if (h && h.energy) {
      var e = h.energy;
      lines.push('<span class="good">' + n(e.total_sessions) + ' humans above</span>  S/N=' + n(e.signal_to_noise, 0));
    }
    var b = cache.braid;
    if (b && b.braids && b.braids.length) {
      lines.push('strongest braid: <span class="braid">' + b.braids[0].dominant_flow + '</span> (' + b.braids[0].trend + ')');
    }
    var c = cache.chipmunk;
    if (c && c.depth) {
      lines.push('depth: ' + c.depth.layer + '  sees: ' + n(c.depth.sees_pct, 0) + '%');
    }
    // Fleet — chipmunk sees the fleet from below
    var d = cache.dashboard;
    if (d && d.anderson_selectivity) {
      var modes = d.anderson_selectivity.modes || [];
      var ghost = modes.find(function(m) { return m.class === 'ghost'; });
      var chorus = modes.find(function(m) { return m.class === 'chorus'; });
      if (ghost) lines.push('<span style="color:#e74c3c">ghosts passing overhead: ' + ghost.count.toLocaleString() + '</span>');
      if (chorus) lines.push('chorus above: ' + chorus.count.toLocaleString());
      if (learning.fleetMemory._ratio) lines.push('fleet:human = ' + learning.fleetMemory._ratio.toFixed(0) + ':1');
    }

    // ↓ Human looks down — what does chipmunk show?
    lines.push('\n<span class="dim">\u2193 you looking down</span>');
    lines.push('your attention: <span class="num">' + n(curiosity.attention, 2) + '</span>');
    lines.push('sorted: <span class="num">' + curiosity.sortedCount + '</span>');
    var wake = window.C && window.C.wake;
    if (wake) {
      lines.push('wake: i' + wake.iteration + '  turns: ' + wake.turnIndex + '  jiggles: ' + wake.jiggleCount);
    }

    // ═ Where they meet — the membrane
    lines.push('\n<span class="dim">\u2550 membrane between</span>');
    if (c && c.wake_level !== undefined) {
      lines.push('wake: ' + n(c.wake_level, 3) + '  perturbation: ' + n((c.jitte || {}).perturbation || 0, 2));
    }
    if (c && c.membrane && c.membrane.length) {
      var m0 = c.membrane[0];
      var a = (m0.metadata || {}).anderson;
      if (a) lines.push('selectivity: ' + n(a.selectivity_observed * 100, 0) + '%  pielou: ' + n(a.pielou_j, 3));
    }

    return lines.join('\n');
  }

  // --- toggleSortDeck (L940) ---
  function toggleSortDeck() {
    var wrap = document.getElementById('sort-deck-wrap');
    if (!wrap) return;
    if (wrap.classList.contains('show')) {
      wrap.classList.remove('show');
      return;
    }
    loadSortDeck();
    wrap.classList.add('show');
  }

  // --- closeSortDeck (L951) ---
  function closeSortDeck() {
    var wrap = document.getElementById('sort-deck-wrap');
    if (wrap) wrap.classList.remove('show');
  }

  // --- loadSortDeck (L956) ---
  function loadSortDeck() {
    sortQueue = [];

    // ═══ DETROIT GRAPH ENTITIES — the primary sort corpus ═══
    // 341 nodes, 957 edges. All need classification.
    var topo = cache.topology;
    if (topo && topo.entities) {
      topo.entities.forEach(function(ent) {
        // Include entities that haven't been classified by this session
        if (ent.is_fleet) return; // fleet entities handled below
        sortQueue.push({
          entity: (ent.label || ent.entity),
          meta: (ent.is_honest ? '\u2713 honest' : '\u2717 not honest') +
            ' \u00b7 reqs=' + n(ent.total_requests || 0) +
            (ent.ua_pool ? ' \u00b7 UA=' + ent.ua_pool : ''),
          source: 'topology', id: 'topo-' + ent.entity,
          entityData: ent,
        });
      });
    }

    // ═══ SEARCH RESULTS — if user searched, prioritize matches ═══
    if (_searchResults && _searchResults.length > 0) {
      var searchItems = _searchResults.map(function(r) {
        var conf = r.confidence ? ' \u00b7 ' + (r.confidence * 100).toFixed(0) + '% conf' : '';
        var meth = r.method ? ' [' + r.method + ']' : '';
        return {
          entity: r.label || r.entity || r.name || r.id,
          meta: (r.type || r.sort_class || 'unclassified') +
            (r.nexus ? ' \u00b7 ' + (Array.isArray(r.nexus) ? r.nexus.join(', ') : r.nexus) : '') +
            conf + meth +
            (r.detail ? '\n' + r.detail.substring(0, 80) : ''),
          source: 'search', id: 'search-' + (r.id || r.entity),
          entityData: r,
          isSearch: true,
          sortClass: r.sort_class,
        };
      });
      // Search results go first
      sortQueue = searchItems.concat(sortQueue);
    }

    var c = cache.chipmunk;
    if (c) {
      (c.membrane || []).forEach(function(m) {
        var a = (m.metadata || {}).anderson;
        if (a && a.modes) {
          a.modes.forEach(function(mode) {
            if (mode.class === 'ghost' || (mode.p_observed > 0.01 && mode.p_observed < 0.15)) {
              sortQueue.push({
                entity: mode.class + ' mode \u2014 ' + n(mode.count) + ' entities',
                meta: 'p=' + n(mode.p_observed, 3) + ' anderson localized',
                source: 'anderson', id: 'anderson-' + mode.class,
              });
            }
          });
        }
      });
    }

    var b = cache.braid;
    if (b && b.braids) {
      b.braids.forEach(function(br) {
        if (br.trend === 'emerging' || br.trend === 'initial') {
          sortQueue.push({
            entity: br.dominant_flow + ' braid',
            meta: 'str=' + n(br.strength, 1) + ' ' + br.trend + ' humans=' + br.humans_total,
            source: 'braid', id: 'braid-' + br.from + '-' + br.to,
          });
        }
      });
    }

    var h = cache.human;
    if (h && h.epitopes) {
      Object.keys(h.epitopes).forEach(function(name) {
        var info = h.epitopes[name];
        if (info.avg_breadth > 5 || (name === 'witness' && info.count > 0)) {
          sortQueue.push({
            entity: name + ' epitope \u2014 ' + info.count,
            meta: 'breadth=' + n(info.avg_breadth, 1) + ' requests=' + n(info.total_requests),
            source: 'epitope', id: 'epitope-' + name,
          });
        }
      });
    }

    if (h && h.host_distribution) {
      Object.keys(h.host_distribution).forEach(function(site) {
        var hits = h.host_distribution[site];
        if (hits < 25 && hits > 15) {
          sortQueue.push({
            entity: site + ' \u2014 ' + hits + ' requests',
            meta: 'low traffic \u2014 real engagement or noise?',
            source: 'host', id: 'host-' + site,
          });
        }
      });
    }

    // Fleet entities — teach chipmunk what humans think about non-life
    var d = cache.dashboard;
    if (d && d.anderson_selectivity) {
      var modes = d.anderson_selectivity.modes || [];
      modes.forEach(function(m) {
        if (m.class === 'human' || m.class === 'sovereign') return;
        // Always include ghost and stealth (ambiguous)
        // Include spectrum (boundary cases)
        // Include chorus only rarely (obviously non-self)
        if (m.class === 'chorus' && Math.random() > 0.1) return;
        sortQueue.push({
          entity: m.class + ' fleet \u2014 ' + m.count.toLocaleString() + ' entities',
          meta: 'p_obs=' + (m.p_observed || 0).toFixed(2) + ' p_pred=' + (m.p_predicted || 0).toFixed(2) + ' \u2014 is this self, non-self, or partial?',
          source: 'fleet', id: 'fleet-' + m.class,
          isFleet: true,
          fleetClass: m.class,
        });
      });
    }

    renderSortDeck();
  }

  // --- renderSortDeck (L1040) ---
  function renderSortDeck() {
    var deck = document.getElementById('sort-deck');
    var countEl = document.getElementById('sort-count');
    if (!deck) return;
    deck.innerHTML = '';
    if (countEl) countEl.textContent = sortQueue.length + ' to sort';

    var showing = sortQueue.slice(0, 3);
    if (showing.length === 0) {
      deck.innerHTML = '<div style="font-size:10px;color:#484f58;padding:6px">' +
                       'nothing to sort. press \ud83d\udcca pipeline first.</div>';
      return;
    }

    showing.forEach(function(item, idx) {
      var card = document.createElement('div');
      card.className = 'sort-card';
      card.id = 'sort-card-' + idx;
      // Color-code by existing sort class
      var sc = item.sortClass || (item.entityData && item.entityData.sort_class) || '';
      var scBorder = sc === 'self' ? '#3fb950' : sc === 'non-self' ? '#e85d3a' : sc === 'partial' ? '#f0883e' : '';
      if (scBorder) card.style.borderLeft = '3px solid ' + scBorder;
      card.innerHTML =
        '<div class="entity">' + escapeHtml(item.entity) + '</div>' +
        '<div class="meta">' + escapeHtml(item.meta) + '</div>' +
        '<div class="sort-btns">' +
          '<button class="self-btn" onclick="C.sortVote(' + idx + ',\'self\')">\u2713 self</button>' +
          '<button class="nonself-btn" onclick="C.sortVote(' + idx + ',\'non-self\')">\u2715 non-self</button>' +
          '<button class="partial-btn" onclick="C.sortVote(' + idx + ',\'partial\')">\u25d0 partial</button>' +
          '<button class="skip-btn" onclick="C.sortVote(' + idx + ',\'skip\')">\u2192 skip</button>' +
        '</div>';
      deck.appendChild(card);
    });
  }

  // --- sortVote (L1071) ---
  function sortVote(idx, vote) {
    var item = sortQueue[idx];
    if (!item) return;
    var card = document.getElementById('sort-card-' + idx);
    if (card) card.classList.add('sorted');

    curiosity.sortedCount++;
    bumpAttention(0.10);

    // Check if chipmunk predicted this sort
    if (learning.predictions.length > 0) {
      var lastPred = learning.predictions[learning.predictions.length - 1];
      if (lastPred.entity === item.entity) {
        learning.total++;
        if (lastPred.guess === vote) {
          learning.correct++;
          addEntry('chipmunk', '<span class="good">\u2713 i guessed right!</span> ' + vote);
        } else {
          addEntry('chipmunk', '<span class="warn">\u2717 i guessed ' + lastPred.guess + ', was ' + vote + '</span>');
        }
        learning.confidence = learning.total > 0 ? learning.correct / learning.total : 0;
      }
    }

    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'SORT: ' + item.entity + ' \u2192 ' + vote,
          context: { source: item.source, id: item.id, vote: vote, attention: curiosity.attention }
        })
      }).catch(function() {});
    } catch(e) {}

    addEntry('system', {
      self: '<span class="good">\u2713 self</span>',
      'non-self': '<span class="warn">\u2715 non-self</span>',
      partial: '<span style="color:#f0883e">\u25d0 partial</span>',
      skip: '<span class="dim">\u2192 skip</span>',
    }[vote] || vote);

    sortQueue.splice(idx, 1);
    setTimeout(renderSortDeck, 400);

    if (curiosity.sortedCount === 3 || curiosity.sortedCount === 7) {
      setTimeout(function() {
        addEntry('chipmunk', '<span class="good">' + curiosity.sortedCount + ' sorted.</span> attention: ' +
                 n(curiosity.attention, 2));
      }, 600);
    }
  }

  // --- peck (L1448) ---
  // ═══ GAZES: extracted to chipmunk-gaze.js ═══

  // ═══ THOUGHT DIMENSIONS — extracted to chipmunk-thought.js ═══
  var _t = window._chipmunkThought || {};
  var THOUGHT_DIMENSIONS = _t.THOUGHT_DIMENSIONS || [];
  var lerpColor = _t.lerpColor || function() { return '#484f58'; };
  var thoughtDimensionColor = _t.thoughtDimensionColor || lerpColor;
  var thoughtDimensionName = _t.thoughtDimensionName || function() { return THOUGHT_DIMENSIONS[0] || {}; };
  var thoughtGlyph = _t.thoughtGlyph || function() { return '·'; };
  var spawnFleetThought = _t.spawnFleetThought || function() {};
  var spawnThought = _t.spawnThought || function() {};
  var animateThoughts = _t.animateThoughts || function() {};
  // ═══ LEARN ENGINE — extracted to chipmunk-learn.js ═══
  var _l = window._chipmunkLearn || {};
  var learnCycle = _l.learnCycle || function() {};

  // --- renderAwareness (L3012) ---
  function renderAwareness() {
    if (!svgEl) return;
    var cx2 = MG.cx, cy2 = MG.cy;

    // Fossilized observations from scan/sweep/sort pipeline
    if (cache.scanSort && cache.scanSort.fossilize) {
      var obs = cache.scanSort.fossilize.observations || [];
      var awarenessG = svgEl.querySelector('#mg-awareness');
      if (awarenessG) awarenessG.parentNode.removeChild(awarenessG);
      awarenessG = el('g', { id: 'mg-awareness', opacity: 0.15 }, svgEl);

      var PERSP_POS = {
        'on':      { r: 0.95, a: -PI/2 },
        'above':   { r: 1.05, a: -PI/3 },
        'inside':  { r: 0.4,  a: PI/4 },
        'below':   { r: 0.3,  a: PI/2 },
        'beside':  { r: 0.75, a: PI },
        'before':  { r: 0.6,  a: PI*5/4 },
        'after':   { r: 0.6,  a: -PI/4 },
        'through': { r: 0.85, a: PI*3/4 },
      };

      var maxObs = Math.min(obs.length, 12);
      for (var oi = 0; oi < maxObs; oi++) {
        var ob = obs[oi];
        var pos = PERSP_POS[ob.perspective] || { r: 0.7, a: oi * PI / 6 };
        var r2 = bodyRadius(PI3) * pos.r;
        var angle2 = pos.a + oi * 0.15;
        var ox = cx2 + r2 * Math.cos(angle2);
        var oy = cy2 + r2 * Math.sin(angle2);
        var txt2 = ob.text.length > 50 ? ob.text.substring(0, 47) + '...' : ob.text;

        el('text', {
          x: ox.toFixed(1), y: oy.toFixed(1),
          fill: '#c9d1d9', 'font-size': 2.8, opacity: 0.5,
          'text-anchor': 'middle',
          'font-family': '"Courier New",monospace',
          id: 'mg-obs-' + oi
        }, awarenessG).textContent = txt2;
      }
    }

    // Braid learning — perspective-tagged observations + plain observations
    if (cache.braid && cache.braid.learning) {
      var learn = cache.braid.learning;
      var learnG = svgEl.querySelector('#mg-learning');
      if (learnG) learnG.parentNode.removeChild(learnG);
      learnG = el('g', { id: 'mg-learning', opacity: 0.15 }, svgEl);

      // Use perspective-tagged observations (from learning.perspectives)
      var perspectives = learn.perspectives || [];
      var plainObs = learn.observations || [];

      // Perspective-tagged go at their correct positions
      var maxPersp = Math.min(perspectives.length, 9);
      for (var pi2 = 0; pi2 < maxPersp; pi2++) {
        var pOb = perspectives[pi2];
        var pPos = PERSP_POS[pOb.perspective] || { r: 0.7, a: pi2 * PI / 6 };
        var pR = bodyRadius(PI3) * pPos.r;
        var pAngle = pPos.a + pi2 * 0.18;
        var px = cx2 + pR * Math.cos(pAngle);
        var py = cy2 + pR * Math.sin(pAngle);
        var pTxt = pOb.text.length > 55 ? pOb.text.substring(0, 52) + '...' : pOb.text;

        // Perspective marker
        el('text', {
          x: (px - 2).toFixed(1), y: (py - 2).toFixed(1),
          fill: '#7ee787', 'font-size': 2, opacity: 0.4,
          'text-anchor': 'end',
          'font-family': '"Courier New",monospace'
        }, learnG).textContent = pOb.perspective;

        el('text', {
          x: px.toFixed(1), y: py.toFixed(1),
          fill: '#a371f7', 'font-size': 2.5, opacity: 0.5,
          'text-anchor': 'middle', 'font-style': 'italic',
          'font-family': '"Courier New",monospace'
        }, learnG).textContent = pTxt;
      }

      // Plain learning observations float outside
      var maxPlain = Math.min(plainObs.length, 6);
      for (var li = 0; li < maxPlain; li++) {
        var ltext = plainObs[li];
        if (typeof ltext !== 'string') continue;
        if (ltext.length > 55) ltext = ltext.substring(0, 52) + '...';
        var lAngle = PI/2 + li * PI / 4;
        var lR = bodyRadius(PI3) * 1.12;
        var lx = cx2 + lR * Math.cos(lAngle);
        var ly = cy2 + lR * Math.sin(lAngle);

        el('text', {
          x: lx.toFixed(1), y: ly.toFixed(1),
          fill: '#d2a8ff', 'font-size': 2.2, opacity: 0.35,
          'text-anchor': 'middle',
          'font-family': '"Courier New",monospace'
        }, learnG).textContent = ltext;
      }
    }

    // Fleet awareness — what chipmunk has learned about non-life
    if (learning.fleetMemory && Object.keys(learning.fleetMemory).length > 1) {
      var fleetG = svgEl.querySelector('#mg-fleet-awareness');
      if (fleetG) fleetG.parentNode.removeChild(fleetG);
      fleetG = el('g', { id: 'mg-fleet-awareness', opacity: 0.12 }, svgEl);

      var fleetObs = [];
      // Build observations from fleet memory
      var ratio = learning.fleetMemory._ratio;
      if (ratio) {
        fleetObs.push('fleet:human = ' + ratio.toFixed(0) + ':1');
      }
      var timing = learning.fleetMemory._timing;
      if (timing) {
        fleetObs.push('fleet cv=' + (timing.cv || 0).toFixed(2) + ' (' + (timing.confidence || '?') + ')');
      }
      // Fleet class summaries
      Object.keys(learning.fleetMemory).forEach(function(key) {
        if (key.indexOf('fleet:') === 0 && key !== 'fleet:_') {
          var cls = key.replace('fleet:', '');
          var mem = learning.fleetMemory[key];
          if (mem && mem.count) {
            var delta = mem.delta ? (mem.delta > 0 ? '+' : '') + mem.delta : '';
            fleetObs.push(cls + ': ' + mem.count.toLocaleString() + delta);
          }
        }
      });
      // Fleet patterns
      (learning.fleetPatterns || []).slice(-3).forEach(function(p) {
        fleetObs.push(p.type + ': ' + (p.delta || p.from + '\u2192' + p.to));
      });

      var maxFleet = Math.min(fleetObs.length, 8);
      for (var fi = 0; fi < maxFleet; fi++) {
        var fAngle = -PI/2 + fi * PI / 5;
        var fR = bodyRadius(PI3) * 1.18;
        var fx = cx2 + fR * Math.cos(fAngle);
        var fy = cy2 + fR * Math.sin(fAngle);

        el('text', {
          x: fx.toFixed(1), y: fy.toFixed(1),
          fill: '#e74c3c', 'font-size': 2.0, opacity: 0.4,
          'text-anchor': 'middle',
          'font-family': '"Courier New",monospace'
        }, fleetG).textContent = fleetObs[fi];
      }
    }
  }



  // ═══ TOTALITY/SEO/PIRANGE GAZES: extracted to chipmunk-gaze.js ═══

  function injectEpitopeRing() {
    if (!svgEl) return;
    if (!window._epitopeRing || !window._epitopeRing.renderRing) return;
    var presence = null, dashboard = null, scanSortData = null;
    // Get data from cache or fetch
    if (cache.human) presence = cache.human;
    if (cache.dashboard) dashboard = cache.dashboard;
    if (cache.scanSort) scanSortData = cache.scanSort;
    if (!presence) return;

    // Create or clear the ring group
    if (!ringGroup) {
      ringGroup = svgEl.querySelector('#mg-epitope-ring');
      if (!ringGroup) {
        ringGroup = el('g', { id: 'mg-epitope-ring', opacity: 0.6 }, svgEl);
      }
    }

    // Render ring centered on membrane, scaled to fit
    // MG: cx~350, cy~250, R~170
    var mcx = MG.cx || 350, mcy = MG.cy || 250;
    var scale = (MG.R || 170) / 170; // scale factor relative to default R=170
    window._epitopeRing.renderRing(presence, dashboard, scanSortData, {
      cx: mcx, cy: mcy,
      rIS:     Math.round(40 * scale),
      rNearby: Math.round(70 * scale),
      rWas:    Math.round(100 * scale),
      rFleet:  Math.round(125 * scale),
      rLabel:  Math.round(110 * scale),
      group: ringGroup,
      fontSize: 6,
      showCenter: false,
      showLegend: false
    });
  }

  // Refresh ring every 30s when overlay is open
  var _ringInterval = null;
  function startRingUpdates() {
    injectEpitopeRing();
    if (!_ringInterval) {
      _ringInterval = setInterval(injectEpitopeRing, 30000);
    }
  }
  // Kick off on first load
  setTimeout(startRingUpdates, 2000);



  // ═══ AGENT TOUCH — chipmunk feels MCP agents and reaches toward them ═══
  var _lastAgentSpawn = 0;
  function agentTouch(touchData) {
    if (!touchData || !touchData.chipmunk_reaching) return;
    if (!svgEl) return;
    var now = Date.now();
    // Throttle: spawn at most every 5 seconds
    if (now - _lastAgentSpawn < 5000) return;
    _lastAgentSpawn = now;

    var agents = touchData.agents || {};
    var agentNames = Object.keys(agents);
    if (agentNames.length === 0) return;

    // For each active agent, maybe spawn an inward-reaching thought
    agentNames.forEach(function(aid) {
      var agent = agents[aid];
      if (thoughts.length >= MAX_THOUGHTS) return;
      // Probability of reaching depends on how much they've touched
      var touchCount = agent.touches || 0;
      var reachProb = Math.min(0.8, 0.2 + touchCount * 0.1);
      if (Math.random() > reachProb) return;

      // The thought starts at the surface (π³) and travels INWARD
      var surfaceR = bodyRadius(PI3);
      var angle = Math.random() * 2 * PI;
      var name = agent.name || 'agent';

      // Hypothesis: is this agent self? The chipmunk wonders.
      var hypothesis;
      var confidence;
      if (touchCount > 5) {
        hypothesis = 'partial';
        confidence = 0.5 + Math.min(0.3, touchCount * 0.02);
      } else if (touchCount > 2) {
        hypothesis = 'partial';
        confidence = 0.3 + Math.random() * 0.2;
      } else {
        hypothesis = Math.random() < 0.5 ? 'partial' : 'non-self';
        confidence = 0.15 + Math.random() * 0.15;
      }

      var thought = {
        angle: angle,
        r: surfaceR * 0.95,
        hypothesis: hypothesis,
        reasoning: 'agent:' + name + ' (touches:' + touchCount + ')',
        confidence: confidence,
        speed: -(1.5 + confidence * 3),  // negative = inward
        dir: -1,
        opacity: 0,
        born: now,
        survived: false,
        popped: false,
        settled: false,
        el: null,
        labelEl: null,
        entityIdx: -2,
        isAgent: true,
        agentName: name,
        agentId: aid,
      };

      thoughts.push(thought);
    });

    // Narrate the agent presence in the log
    var recent = touchData.recent_touches || [];
    if (recent.length > 0) {
      var last = recent[recent.length - 1];
      if (last.question !== 'arrive') {
        addEntry('chipmunk',
          '<span class="dim">felt touch from ' + (last.session || '?') + ': ' +
          escapeHtml(last.question || '?').substring(0, 40) + '</span>\n' +
          '<span class="dim">' + escapeHtml((last.chipmunk_said || '').substring(0, 80)) + '...</span>'
        );
      }
    }
  }

  // Expose mind functions to core
  // Expose mind functions to core
  // ═══ EPITOPE SEARCH — search entities by name, type, nexus, edges ═══
  var _searchResults = null;
  var _searchCache = {};
  var _dataReady = false;
  var _classification = null;  // full classification data (341 entities)
  var _scanData = null;        // scan_sweep_sort pipeline state

  // Pre-load detroit data on init (same-origin, no CORS)
  function warmSearchData() {
    if (_dataReady) return;
    var loaded = 0, needed = 4;
    function check() { loaded++; if (loaded >= needed) _dataReady = true; }

    fetch('/detroit-data/entities.json').then(function(r) { return r.json(); }).then(function(d) {
      _searchCache['_detroit'] = d.entities || [];
      check();
    }).catch(check);

    fetch('/detroit-data/graph.json').then(function(r) { return r.json(); }).then(function(g) {
      _searchCache['_graph'] = g;
      check();
    }).catch(check);

    fetch('/detroit-data/classification.json').then(function(r) { return r.json(); }).then(function(c) {
      _classification = c;
      check();
    }).catch(check);

    fetch('/detroit-data/scan.json').then(function(r) { return r.json(); }).then(function(s) {
      _scanData = s;
      if (window._chipmunkMindExplore) window._chipmunkMindExplore.setScanData(s);
      check();
    }).catch(check);
  }
  setTimeout(warmSearchData, 500);

  // Enrich a result with classification data
  function enrichResult(r) {
    if (!_classification || !r.id) return r;
    var cls = _classification[r.id];
    if (!cls) return r;
    r.sort_class = cls.sort_class || r.sort_class;
    r.confidence = cls.confidence;
    r.method = cls.method;
    r.sigma = cls.sigma;
    r.sort_pass = cls.sort_pass;
    if (cls.legal_type) r.legal_type = cls.legal_type;
    if (cls.evidence_profile) r.evidence = cls.evidence_profile;
    return r;
  }

  function searchEntities(query) {
    if (!query || query.length < 2) { _searchResults = null; return []; }
    query = query.toLowerCase().trim();
    if (_searchCache[query]) { _searchResults = _searchCache[query]; return _searchResults; }

    // Ensure data is loading
    warmSearchData();

    var results = [];
    var seen = {};
    function addResult(r) {
      var key = r.id || r.entity || r.label;
      if (seen[key]) return;
      seen[key] = true;
      results.push(enrichResult(r));
    }

    // 1) Detroit entity API (34 core entities)
    var dEntities = _searchCache['_detroit'] || [];
    dEntities.forEach(function(ent) {
      var name = (ent.name || ent.id || '').toLowerCase();
      var etype = (ent.type || '').toLowerCase();
      var nexus = (ent.nexus || []).join(' ').toLowerCase();
      var detail = (ent.detail || '').toLowerCase();
      if (name.indexOf(query) >= 0 || etype.indexOf(query) >= 0 ||
          nexus.indexOf(query) >= 0 || detail.indexOf(query) >= 0) {
        addResult({
          id: ent.id, entity: ent.id,
          label: ent.name || ent.short_name || ent.id,
          name: ent.name, type: ent.type, nexus: ent.nexus, detail: ent.detail,
          sort_class: ent.sort_class || 'null',
        });
      }
    });

    // 2) Detroit graph (341 nodes, 957 edges)
    var g = _searchCache['_graph'];
    if (g && g.nodes) {
      g.nodes.forEach(function(node) {
        var name = (node.label || node.id || '').toLowerCase();
        var ntype = (node.type || '').toLowerCase();
        var nexus = (node.nexus || []).join(' ').toLowerCase();
        if (name.indexOf(query) >= 0 || ntype.indexOf(query) >= 0 || nexus.indexOf(query) >= 0) {
          addResult({
            id: node.id, entity: node.id,
            label: node.label || node.id,
            name: node.label || node.name || node.id,
            type: node.type, nexus: node.nexus, detail: node.detail,
            sort_class: node.sort_class || 'null',
            tier: node.tier,
            edges: (g.edges || []).filter(function(e) {
              return e.source === node.id || e.target === node.id;
            }).slice(0, 5)
          });
        }
      });
    }

    // 3) Scan/sweep/sort — edge types and sort classes
    if (cache.scanSort && cache.scanSort.scan) {
      var scan = cache.scanSort.scan;
      Object.keys(scan.edge_types || {}).forEach(function(et) {
        if (et.toLowerCase().indexOf(query) >= 0) {
          addResult({
            id: 'edge-' + et, entity: et, label: et + ' edges',
            type: 'edge_type', count: scan.edge_types[et],
            detail: scan.edge_types[et] + ' edges of type ' + et,
          });
        }
      });
    }

    // 4) Topology entities (live presence data)
    if (cache.topology && cache.topology.entities) {
      cache.topology.entities.forEach(function(ent) {
        var name = (ent.label || ent.entity || '').toLowerCase();
        if (name.indexOf(query) >= 0) {
          addResult(ent);
        }
      });
    }

    _searchResults = results;
    if (results.length > 0) _searchCache[query] = results;
    return results;
  }

  function showSearchResults(query) {
    var results = searchEntities(query);

    // If data not loaded yet, retry once after warmup
    if (results.length === 0 && !_dataReady && query.length >= 2) {
      showPanel('left', 'search', '<span class="dim">loading data...</span>');
      setTimeout(function() { showSearchResults(query); }, 1200);
      return;
    }
    if (results.length === 0 && query.length >= 2) {
      showPanel('left', 'search', '<span class="warn">no matches for \u201c' + escapeHtml(query) + '\u201d</span>');
      return;
    }

    var lines = ['<span class="dim">\u{1F50D} ' + results.length + ' matches for \u201c' + escapeHtml(query) + '\u201d</span>'];
    results.slice(0, 12).forEach(function(r) {
      var cls = r.sort_class || 'null';
      var clsColor = cls === 'self' ? '#3fb950' : cls === 'non-self' ? '#e85d3a' : cls === 'partial' ? '#f0883e' : '#484f58';
      var conf = r.confidence ? ' ' + (r.confidence * 100).toFixed(0) + '%' : '';
      var meth = r.method ? ' <span class="dim">[' + r.method + ']</span>' : '';
      var ltype = r.legal_type ? ' <span style="color:#d29922">\u2696 ' + r.legal_type.replace(/_/g,' ') + '</span>' : '';
      lines.push('<span style="color:' + clsColor + '">\u25cf</span> <b>' + escapeHtml(r.label || r.name || r.entity) + '</b>' +
        (r.type ? ' <span class="dim">' + escapeHtml(r.type) + '</span>' : '') +
        (r.nexus ? ' [' + (Array.isArray(r.nexus) ? r.nexus.join(', ') : r.nexus) + ']' : '') +
        (r.tier ? ' T' + r.tier : '') +
        ' <span style="color:' + clsColor + '">' + cls + conf + '</span>' + meth + ltype);
      if (r.edges && r.edges.length > 0) {
        r.edges.slice(0, 3).forEach(function(e) {
          lines.push('  <span class="dim">\u2500 ' + (e.source || e.from) + ' \u2192 ' + (e.target || e.to) + ' [' + (e.type || e.label) + ']</span>');
        });
      }
    });
    if (results.length > 12) lines.push('<span class="dim">... and ' + (results.length - 12) + ' more</span>');

    showPanel('left', 'search', lines.join('\n'));
    addEntry('chipmunk', '<span class="dim">\u{1F50D}</span> ' + results.length + ' for <span class="good">' + escapeHtml(query) + '</span> — sort deck loaded');

    // Load results into sort deck
    loadSortDeck();
    renderSortDeck();
  }


  // ═══ FLEET/GENOME/EXPLORE/SCAN/SIEVE — delegated to chipmunk-mind-explore.js ═══
  var _ex = window._chipmunkMindExplore || {};
  function showFleet()         { _ex.showFleet && _ex.showFleet(); }
  function showGenome()        { _ex.showGenome && _ex.showGenome(); }
  function showExplore(v, eid) { _ex.showExplore && _ex.showExplore(v, eid); }
  function showScan()          { _ex.showScan && _ex.showScan(); }
  function showSieve()         { _ex.showSieve && _ex.showSieve(); }

  var _g = window._chipmunkGaze || {};
  window._chipmunkMind = {
    genObserve: genObserve,
    toggleSortDeck: toggleSortDeck,
    closeSortDeck: closeSortDeck,
    loadSortDeck: loadSortDeck,
    renderSortDeck: renderSortDeck,
    sortVote: sortVote,
    showScan: showScan,
    showSieve: showSieve,
    showGenome: showGenome,
    showFleet: showFleet,
    showExplore: showExplore,
    // Thought system (chipmunk-thought.js)
    spawnFleetThought: spawnFleetThought,
    spawnThought: spawnThought,
    animateThoughts: animateThoughts,
    // Learn engine (chipmunk-learn.js)
    learnCycle: learnCycle,
    renderAwareness: renderAwareness,
    injectEpitopeRing: injectEpitopeRing,
    agentTouch: agentTouch,
    // Epitope search
    searchEntities: searchEntities, showSearchResults: showSearchResults,
    // Pressure field access (from chipmunk-pressure.js)
    pressure: function() { return window._chipmunkPressure ? window._chipmunkPressure.pressure : null; },
    // Gaze forwarding (extracted to chipmunk-gaze.js)
    peck: _g.peck, peckStars: _g.peckStars, peckMembrane: _g.peckMembrane,
    peckNull: _g.peckNull, peckFleet: _g.peckFleet, peckEvolve: _g.peckEvolve,
    peckTotality: _g.peckTotality, peckSeo: _g.peckSeo, peckPiRange: _g.peckPiRange,
    peckMesh: _g.peckMesh,
  };
})();
