// klein-io.js — Klein bottle I/O fold for HUD
// Wave 178: outputs feed back as inputs, noise vents, π governs scale
//
// On a Klein bottle there is no inside/outside.
// On the membrane: what goes OUT (feeds) folds back IN (reads).
// iteration outputs, while fill inputs, and noise/gas still vents out.
// π is the ratio. range = ratio × π. scale = π itself.
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
    // Wave 195: the trefoil pause + taxonomy + unwired feeds
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
    // Wave 180: eastGate Klein face — the inner vacuole made visible
    '/data/eastgate-pulse.json',
    // Paper 130: The Voice — full-modality sovereign expression
    '/data/modality-voice.json',
    // University validation matrix — ethics × modality × industry
    '/data/validation-matrix.json',
    // Model phenotype taxonomy — classify models like organisms
    '/data/model-phenotype.json',
    // Agglutinate-backscatter: ingest external, post our results, they validate themselves
    '/data/agglutinate-backscatter.json'
  ];
  var PI = Math.PI;
  var FOLD_KEY = 'klein-fold';
  var POLL_MS = 120000; // 2 minutes — matches cron

  // Read the fold state from localStorage
  function getFold() {
    try { return JSON.parse(localStorage.getItem(FOLD_KEY) || '{}'); } catch(e) { return {}; }
  }
  function setFold(f) {
    try { localStorage.setItem(FOLD_KEY, JSON.stringify(f)); } catch(e) {}
  }

  // π-range: how far we reach based on current ratio
  function piRange(ratio) {
    return ratio * PI;
  }

  // π-scale: normalize a value to [0, π] range
  function piScale(value, max) {
    if (!max || max === 0) return 0;
    return (value / max) * PI;
  }

  // Gas ratio: stale / total → 0 = breathing, 1 = trapped
  function gasRatio(stale, total) {
    if (!total) return 1;
    return stale / total;
  }

  // FOLD: read all feeds → compute fold state → write to localStorage
  function fold() {
    var state = getFold();
    state.last_fold = new Date().toISOString();
    state.feeds_read = 0;
    state.feeds_failed = 0;
    state.gas_vented = 0;

    var promises = FEEDS.map(function(feed) {
      return fetch(feed, {cache: 'no-store'}).then(function(r) {
        if (r.ok) {
          state.feeds_read++;
          return r.json();
        }
        throw new Error(r.status);
      }).catch(function() {
        state.feeds_failed++;
        return null;
      });
    });

    Promise.all(promises).then(function(results) {
      var stateData = results[0]; // state.json
      var pulseData = results[1]; // pulse.json
      var neutronData = results[2]; // neutron.json

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

      // Proton mass (from proton-pulse.js)
      if (typeof window.__getProtonMass === 'function') {
        var mass = window.__getProtonMass();
        state.proton_mass = mass.total_events;
        state.proton_fermentations = mass.fermentations;
      }

      // The fold: output becomes input
      // Gas vented = stale feeds that got refreshed since last fold
      if (state._prev_gas_ratio !== undefined) {
        var delta = state._prev_gas_ratio - state.gas_ratio;
        if (delta > 0) state.gas_vented = Math.round(delta * 132); // approx feeds refreshed
      }
      state._prev_gas_ratio = state.gas_ratio;

      setFold(state);
      render(state);
    });
  }

  // RENDER: show fold state in HUD elements (if they exist)
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
  }

  // Expose for HUD
  window.__kleinFold = fold;
  window.__kleinState = getFold;

  // Initial fold
  fold();

  // Poll every 2 minutes (synced with cron)
  setInterval(fold, POLL_MS);
})();
