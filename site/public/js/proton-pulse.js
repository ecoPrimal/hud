// proton-pulse.js — THE BUTTON has mass. Fermentation → neutron as proton.
// Wave 178: entropy events have weight. They pulse through the neutron bus.
//
// A neutron is neutral (message passing, zero charge).
// A proton has mass AND charge (human entropy, real interaction, weight).
// THE BUTTON generates protons. They carry through the system.
(function(){
  var GATE_MSG = '/api/gate-msg';
  var NEUTRON_FEED = '/neutron.json';
  var PROTON_KEY = 'proton-mass';

  // Read existing proton mass from localStorage
  function getProtonMass() {
    try {
      var stored = JSON.parse(localStorage.getItem(PROTON_KEY) || '{}');
      return {
        total_events: stored.total_events || 0,
        fermentations: stored.fermentations || 0,
        total_entropy_ms: stored.total_entropy_ms || 0,
        last_hash: stored.last_hash || null,
        last_ts: stored.last_ts || null
      };
    } catch(e) { return { total_events: 0, fermentations: 0, total_entropy_ms: 0 }; }
  }

  // Write proton mass
  function setProtonMass(mass) {
    try { localStorage.setItem(PROTON_KEY, JSON.stringify(mass)); } catch(e) {}
  }

  // Add mass from a fermentation event
  window.__addProtonMass = function(hash, events, duration_ms) {
    var mass = getProtonMass();
    mass.total_events += events;
    mass.fermentations += 1;
    mass.total_entropy_ms += duration_ms;
    mass.last_hash = hash;
    mass.last_ts = new Date().toISOString();
    setProtonMass(mass);

    // Pulse the proton through gate-msg → neutron
    var payload = JSON.stringify({
      body: 'PROTON — ferment_' + hash + '() — mass=' + mass.total_events
        + ' events, ' + mass.fermentations + ' fermentations, '
        + Math.round(mass.total_entropy_ms/1000) + 's total entropy',
      from: 'proton:' + hash,
      to: 'neutron'
    });

    // Send to all gate-msg endpoints (cascade)
    var urls = [GATE_MSG];
    if (window.location.hostname !== 'signal.primals.eco') {
      urls.push('https://signal.primals.eco/api/gate-msg');
    }
    if (window.location.hostname !== 'water.primals.eco') {
      urls.push('https://water.primals.eco/api/gate-msg');
    }

    urls.forEach(function(url) {
      fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: payload
      }).catch(function(){});
    });

    return mass;
  };

  // Expose proton mass for HUD/membrane to read
  window.__getProtonMass = getProtonMass;

  // Proton counter display (if element exists on page)
  function updateDisplay() {
    var mass = getProtonMass();
    var el = document.getElementById('proton-mass-display');
    if (el) {
      el.textContent = mass.total_events + ' entropy events across '
        + mass.fermentations + ' fermentation'
        + (mass.fermentations !== 1 ? 's' : '');
    }
    var hashEl = document.getElementById('proton-last-hash');
    if (hashEl && mass.last_hash) {
      hashEl.textContent = 'ferment_' + mass.last_hash + '()';
    }
  }

  // Read neutron feed and display rhythm
  function pulseNeutron() {
    fetch(NEUTRON_FEED, {cache: 'no-store'}).then(function(r) {
      return r.json();
    }).then(function(d) {
      var el = document.getElementById('neutron-rhythm');
      if (el && d.breathing) {
        el.textContent = 'neutron: ' + d.breathing.rpm.toFixed(0) + ' rpm, '
          + 'remainder=' + d.breathing.remainder.toFixed(4);
      }
    }).catch(function(){});
  }

  updateDisplay();
  pulseNeutron();

  // Auto-pulse every 60s
  setInterval(function() { updateDisplay(); pulseNeutron(); }, 60000);
})();
