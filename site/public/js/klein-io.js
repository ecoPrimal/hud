// klein-io.js — Klein bottle I/O fold for HUD
// Wave 182: the handshake — look in, peek back, shake what's stuck
//
// On a Klein bottle there is no inside/outside.
// On the membrane: what goes OUT (feeds) folds back IN (reads).
// NEW: the HUD now REPORTS what it sees back to the neutrino.
// That's the handshake. Chipmunk peeks back through the same gate.
// Systems that are pinned get flagged. Evolution is the observation.
(function(){
  var FEEDS = [
    '/state.json',
    '/pulse.json',
    '/neutron.json',
    '/topology.json',
    '/membrane.json',
    '/data/ouroboros-metabolism.json',
    '/data/tree-topology.json',
    '/data/ribocipher.json',
    '/data/water-slide.json',
    '/data/awareness-equation.json',
    '/data/peripheral-nervous-system.json',
    '/data/csf-arena.json',
    '/data/arena-taxonomy.json',
    '/data/strand-braid.json',
    '/data/klein-body.json',
    '/data/klein-resort.json',
    '/data/galactic-bounce.json',
    '/data/agglutinate-fold.json',
    '/data/scan-sweep-sort.json',
    '/data/brazil-nut-secant.json',
    '/data/mesh-enmesh.json',
    '/data/classic-games-open.json',
    '/data/trefoil-pause.json',
    '/data/primal-taxonomy.json',
    '/data/knn-trefoil.json',
    '/data/klein-cards.json',
    '/data/klein-leak-eons.json',
    '/data/yggdrasil-cascade.json',
    '/data/central-dogma.json',
    '/data/ribosome-translation.json',
    '/data/phenotype-sort.json',
    '/data/quorum-sense.json',
    '/data/thymus-gate.json',
    '/data/bingo-voxel.json',
    '/data/metabolize.json',
    '/data/decay-detector.json',
    '/data/reverse-sense.json',
    '/data/self-chew.json',
    '/data/radiate-attribution.json',
    '/data/eon-shape.json',
    '/data/poor-tope.json',
    '/data/tailbone-inventory.json',
    '/data/atomic-tensor.json',
    '/data/persona-tensor.json',
    '/data/info-mass.json',
    '/data/output-fleet.json',
    '/data/dough.json',
    '/data/community.json',
    '/data/snot-glob-manifest.json',
    '/data/chipmunk-journey.json',
    '/data/berry-campfire.json',
    '/data/family-sort-stars.json',
    '/data/amicus-contra.json',
    '/data/graphenegate.json',
    '/data/pollination-manifest.json',
    '/data/primal-classification.json',
    '/data/immiscible-grease.json',
    '/data/raytrace-lan.json',
    '/data/arena-benchmark.json',
    '/data/eastgate-pulse.json',
    '/data/modality-voice.json',
    '/data/validation-matrix.json',
    '/data/model-phenotype.json',
    '/data/agglutinate-backscatter.json',
    // Wave 181: Negative QS → MoR → Ghost Taxonomy → Art Loop
    '/data/negative-qs-discovery.json',
    '/data/immune-triad.json',
    '/data/mesh-pi-pulse.json',
    '/data/lan-tree-learning.json',
    '/data/measure-of-reality.json',
    '/data/inner-pns-cns.json',
    '/data/vitruvian-homunculus.json',
    '/data/ghost-taxonomy.json',
    '/data/heartbeat.json',
    '/data/sonar-unknowns.json',
    '/data/nd-projections.json',
    '/data/feed-taxonomy.json',
    '/data/sourdough-digest.json',
    '/data/fermentation-product.json',
    '/data/jellyfish-oscillation.json',
    '/data/flatworm-health.json',
    '/data/prion-identity.json',
    '/data/roundworm-pipeline.json',
    '/data/zero-trace.json',
    '/data/tope-balance.json',
    '/data/io-imprint.json',
    '/data/multicultural-imprint.json',
    '/data/golgi-raytrace.json',
    '/data/northgate-handoff.json',
    // Wave 182: the handshake + Klein face
    '/data/klein-handshake.json',
    '/data/klein-face-io.json',
    '/data/heartbeat-history.json'
  ];

  var PI = Math.PI;
  var FOLD_KEY = 'klein-fold';
  var HASH_KEY = 'klein-hashes';
  var STUCK_KEY = 'klein-stuck';
  var POLL_MS = 120000; // 2 minutes

  function getFold() {
    try { return JSON.parse(localStorage.getItem(FOLD_KEY) || '{}'); } catch(e) { return {}; }
  }
  function setFold(f) {
    try { localStorage.setItem(FOLD_KEY, JSON.stringify(f)); } catch(e) {}
  }
  function getHashes() {
    try { return JSON.parse(localStorage.getItem(HASH_KEY) || '{}'); } catch(e) { return {}; }
  }
  function setHashes(h) {
    try { localStorage.setItem(HASH_KEY, JSON.stringify(h)); } catch(e) {}
  }
  function getStuck() {
    try { return JSON.parse(localStorage.getItem(STUCK_KEY) || '{}'); } catch(e) { return {}; }
  }
  function setStuck(s) {
    try { localStorage.setItem(STUCK_KEY, JSON.stringify(s)); } catch(e) {}
  }

  // simple string hash for change detection
  function quickHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    }
    return h.toString(36);
  }

  function piRange(ratio) { return ratio * PI; }
  function piScale(value, max) { return (!max || max === 0) ? 0 : (value / max) * PI; }
  function gasRatio(stale, total) { return total ? stale / total : 1; }

  // === THE HANDSHAKE: fold reads all feeds, detects stuck, reports back ===
  function fold() {
    var state = getFold();
    var prevHashes = getHashes();
    var stuckCounts = getStuck();
    var newHashes = {};

    state.last_fold = new Date().toISOString();
    state.fold_count = (state.fold_count || 0) + 1;
    state.feeds_read = 0;
    state.feeds_failed = 0;
    state.feeds_changed = 0;
    state.feeds_stuck = 0;
    state.gas_vented = 0;

    var stuckList = [];
    var changedList = [];
    var failedList = [];

    var promises = FEEDS.map(function(feed) {
      return fetch(feed, {cache: 'no-store'}).then(function(r) {
        if (r.ok) {
          state.feeds_read++;
          return r.text().then(function(txt) {
            var h = quickHash(txt);
            newHashes[feed] = h;

            if (prevHashes[feed] && prevHashes[feed] === h) {
              // same content as last fold — stuck counter increments
              stuckCounts[feed] = (stuckCounts[feed] || 0) + 1;
              if (stuckCounts[feed] >= 3) {
                state.feeds_stuck++;
                stuckList.push(feed.split('/').pop());
              }
            } else {
              // content changed — reset stuck counter
              stuckCounts[feed] = 0;
              state.feeds_changed++;
              changedList.push(feed.split('/').pop());
            }

            try { return JSON.parse(txt); } catch(e) { return null; }
          });
        }
        throw new Error(r.status);
      }).catch(function() {
        state.feeds_failed++;
        failedList.push(feed.split('/').pop());
        return null;
      });
    });

    Promise.all(promises).then(function(results) {
      setHashes(newHashes);
      setStuck(stuckCounts);

      var total = FEEDS.length;
      var read = state.feeds_read;
      var failed = state.feeds_failed;
      var changed = state.feeds_changed;
      var stuck = state.feeds_stuck;

      // mixing ratio: how much is evolving vs pinned
      state.mixing_ratio = read > 0 ? +(changed / read).toFixed(4) : 0;
      state.stuck_ratio = read > 0 ? +(stuck / read).toFixed(4) : 0;

      // evolution classification
      if (state.mixing_ratio > 0.3) state.evolution = 'MIXING';
      else if (state.mixing_ratio > 0.1) state.evolution = 'WARMING';
      else if (state.mixing_ratio > 0) state.evolution = 'COOLING';
      else state.evolution = 'PINNED';

      // stuck list for diagnostic
      state.stuck_feeds = stuckList.slice(0, 20);
      state.changed_feeds = changedList.slice(0, 20);
      state.failed_feeds = failedList.slice(0, 20);

      // extract core state
      var stateData = results[0];
      var pulseData = results[1];
      var neutronData = results[2];

      if (stateData) {
        state.pi_ratio = stateData.pi ? stateData.pi.ratio : 0;
        state.pi_range = piRange(state.pi_ratio);
        state.gas_ratio = stateData.gas ? stateData.gas.gas_ratio : 1;
        state.services_alive = stateData.membrane ? stateData.membrane.services_alive : 0;
        state.rss_mb = stateData.membrane ? stateData.membrane.rss_mb : 0;
      }

      if (neutronData && neutronData.breathing) {
        state.neutron_rpm = neutronData.breathing.rpm;
        state.neutron_remainder = neutronData.breathing.remainder;
      }

      if (typeof window.__getProtonMass === 'function') {
        var mass = window.__getProtonMass();
        state.proton_mass = mass.total_events;
        state.proton_fermentations = mass.fermentations;
      }

      // gas venting: track improvement between folds
      if (state._prev_gas_ratio !== undefined) {
        var delta = state._prev_gas_ratio - (state.gas_ratio || 1);
        if (delta > 0) state.gas_vented = Math.round(delta * FEEDS.length);
      }
      state._prev_gas_ratio = state.gas_ratio || 1;

      setFold(state);
      render(state);

      // === PEEK BACK: report to neutrino every 10 folds ===
      if (state.fold_count % 10 === 0) {
        peekBack(state);
      }
    });
  }

  // === PEEK BACK: chipmunk looks through the Klein gate ===
  // Reports the HUD's view to neutrino so the system knows what's stuck
  function peekBack(state) {
    var msg = '🔄 KLEIN HANDSHAKE fold #' + state.fold_count +
      '\nread: ' + state.feeds_read + '/' + FEEDS.length +
      '\nfailed: ' + state.feeds_failed +
      '\nchanged: ' + state.feeds_changed +
      '\nstuck: ' + state.feeds_stuck +
      '\nmixing: ' + state.mixing_ratio +
      '\nevolution: ' + state.evolution +
      (state.stuck_feeds.length > 0 ? '\npinned: ' + state.stuck_feeds.slice(0,8).join(', ') : '') +
      (state.changed_feeds.length > 0 ? '\nmoving: ' + state.changed_feeds.slice(0,8).join(', ') : '') +
      '\nt: ' + new Date().toISOString();

    try {
      fetch('https://ntfy.sh/primals-membrane-scan', {
        method: 'POST',
        headers: {
          'Title': '🔄 klein-handshake: ' + state.evolution + ' | mixing=' + state.mixing_ratio,
          'Tags': 'handshake,klein,' + state.evolution.toLowerCase(),
          'Priority': state.evolution === 'PINNED' ? '4' : '2'
        },
        body: msg
      }).catch(function(){});
    } catch(e) {}
  }

  // === RENDER: show fold + handshake state in HUD ===
  function render(state) {
    var el;

    el = document.getElementById('klein-pi-ratio');
    if (el) el.textContent = (state.pi_ratio || 0).toFixed(3);

    el = document.getElementById('klein-pi-range');
    if (el) el.textContent = (state.pi_range || 0).toFixed(4);

    el = document.getElementById('klein-gas-ratio');
    if (el) {
      var g = state.gas_ratio || 1;
      el.textContent = g.toFixed(3);
      el.style.color = g > 0.5 ? '#f85149' : g > 0.1 ? '#d29922' : '#3fb950';
    }

    el = document.getElementById('klein-services');
    if (el) el.textContent = (state.services_alive || 0) + '/10';

    el = document.getElementById('klein-rss');
    if (el) el.textContent = (state.rss_mb || 0) + ' MB';

    el = document.getElementById('klein-fold-ts');
    if (el) el.textContent = state.last_fold || '—';

    el = document.getElementById('neutron-rhythm');
    if (el && state.neutron_remainder) {
      el.textContent = 'neutron: remainder=' + state.neutron_remainder.toFixed(6);
    }

    // === HANDSHAKE DIAGNOSTICS ===
    el = document.getElementById('klein-evolution');
    if (el) {
      el.textContent = state.evolution || 'UNKNOWN';
      var colors = { MIXING: '#3fb950', WARMING: '#d29922', COOLING: '#f0883e', PINNED: '#f85149' };
      el.style.color = colors[state.evolution] || '#6e7681';
    }

    el = document.getElementById('klein-mixing');
    if (el) {
      var m = state.mixing_ratio || 0;
      el.textContent = (m * 100).toFixed(1) + '%';
      el.style.color = m > 0.3 ? '#3fb950' : m > 0.1 ? '#d29922' : '#f85149';
    }

    el = document.getElementById('klein-stuck-count');
    if (el) el.textContent = (state.feeds_stuck || 0) + ' pinned';

    el = document.getElementById('klein-changed-count');
    if (el) el.textContent = (state.feeds_changed || 0) + ' moving';

    el = document.getElementById('klein-failed-count');
    if (el) {
      el.textContent = (state.feeds_failed || 0) + ' failed';
      el.style.color = state.feeds_failed > 5 ? '#f85149' : '#6e7681';
    }

    el = document.getElementById('klein-fold-count');
    if (el) el.textContent = '#' + (state.fold_count || 0);

    el = document.getElementById('klein-stuck-list');
    if (el && state.stuck_feeds && state.stuck_feeds.length > 0) {
      el.textContent = state.stuck_feeds.slice(0, 10).join(', ');
    }

    el = document.getElementById('klein-changed-list');
    if (el && state.changed_feeds && state.changed_feeds.length > 0) {
      el.textContent = state.changed_feeds.slice(0, 10).join(', ');
    }

    // heartbeat bar — visual mixing pulse
    el = document.getElementById('klein-heartbeat-bar');
    if (el) {
      var pct = Math.round((state.mixing_ratio || 0) * 100);
      el.style.width = pct + '%';
      el.style.background = pct > 30 ? '#3fb950' : pct > 10 ? '#d29922' : '#f85149';
    }
  }

  // Expose for HUD + nest.html
  window.__kleinFold = fold;
  window.__kleinState = getFold;
  window.__kleinStuck = function() {
    var s = getStuck();
    var result = [];
    for (var feed in s) {
      if (s[feed] >= 3) result.push({ feed: feed, stuck_folds: s[feed] });
    }
    result.sort(function(a, b) { return b.stuck_folds - a.stuck_folds; });
    return result;
  };
  window.__kleinHandshake = function() {
    var state = getFold();
    return {
      fold_count: state.fold_count || 0,
      evolution: state.evolution || 'UNKNOWN',
      mixing_ratio: state.mixing_ratio || 0,
      stuck_ratio: state.stuck_ratio || 0,
      feeds_read: state.feeds_read || 0,
      feeds_failed: state.feeds_failed || 0,
      feeds_changed: state.feeds_changed || 0,
      feeds_stuck: state.feeds_stuck || 0,
      stuck_feeds: state.stuck_feeds || [],
      changed_feeds: state.changed_feeds || [],
      failed_feeds: state.failed_feeds || [],
      last_fold: state.last_fold || null
    };
  };

  // Initial fold
  fold();

  // Poll every 2 minutes
  setInterval(fold, POLL_MS);
})();
