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
