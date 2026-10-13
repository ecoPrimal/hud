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
  };
})();
