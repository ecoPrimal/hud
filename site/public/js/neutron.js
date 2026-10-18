// neutron.js — the messaging axis · how information travels
// Wave 179: connects all touch points so info flows, not stuck.
// Loaded from hud.primals.eco/js/neutron.js on surfaces that want flow data.
(function() {
  'use strict';

  var NEUTRON_URL = 'https://hud.primals.eco/neutron.json';
  var POLL_MS = 120000; // default, overridden by breathing data
  // Adaptive polling — tied to RPM, not clock.
  // Concert/event: 30s. Active: 60s. Normal: 120s. Quiet: 300s.
  var _state = null;
  var _surface = detectSurface();
  var _listeners = [];

  function detectSurface() {
    var h = window.location.hostname.toLowerCase().replace('.primals.eco', '').split(':')[0];
    return (h === 'primals' || h === 'www' || h === '') ? 'hud' : h;
  }

  // ── Mirror: where did the visitor come from? ──────────────────────────
  function getMirror() {
    var ref = document.referrer;
    if (!ref) return { from: 'direct', type: 'direct' };
    var r = ref.toLowerCase();
    if (r.indexOf('primals.eco') !== -1) {
      var fromSurface = r.split('//')[1].split('/')[0].replace('.primals.eco', '').split(':')[0];
      if (fromSurface === 'primals' || fromSurface === 'www') fromSurface = 'hud';
      return { from: fromSurface, type: 'internal' };
    }
    if (r.indexOf('google.') !== -1) return { from: 'google', type: 'external' };
    if (r.indexOf('bing.') !== -1) return { from: 'bing', type: 'external' };
    if (r.indexOf('duckduckgo.') !== -1) return { from: 'duckduckgo', type: 'external' };
    if (r.indexOf('chatgpt.') !== -1 || r.indexOf('openai.') !== -1) return { from: 'chatgpt', type: 'ai' };
    if (r.indexOf('claude.') !== -1 || r.indexOf('anthropic.') !== -1) return { from: 'claude', type: 'ai' };
    return { from: ref.split('//')[1].split('/')[0], type: 'external' };
  }

  // ── Fetch neutron state ───────────────────────────────────────────────
  function fetchNeutron(cb) {
    var x = new XMLHttpRequest();
    x.open('GET', NEUTRON_URL, true);
    x.timeout = 8000;
    x.onload = function() {
      if (x.status === 200) {
        try {
          _state = JSON.parse(x.responseText);
          _listeners.forEach(function(fn) { try { fn(_state); } catch(e) {} });
          if (cb) cb(null, _state);
          // Adapt polling rate from breathing data
          if (_state && _state.breathing && _state.breathing.interval_seconds) {
            POLL_MS = _state.breathing.interval_seconds * 1000;
          }
        } catch(e) { if (cb) cb(e); }
      }
    };
    x.onerror = function() { if (cb) cb(new Error('neutron fetch failed')); };
    x.send();
  }

  // ── Public API ────────────────────────────────────────────────────────

  // Get flow data for this surface
  function getMyFlows() {
    if (!_state) return { incoming: [], outgoing: [], stuck: false };
    var incoming = [];
    var outgoing = [];
    (_state.mirrors || []).forEach(function(m) {
      if (m.to_surface === _surface) incoming.push(m);
      if (m.from_surface === _surface) outgoing.push(m);
    });
    var stuck = (_state.stuck || []).indexOf(_surface) !== -1;
    var radiating = (_state.radiating || []).indexOf(_surface) !== -1;
    return { incoming: incoming, outgoing: outgoing, stuck: stuck, radiating: radiating };
  }

  // Get touches (external arrivals) for this surface
  function getMyTouches() {
    if (!_state) return [];
    return (_state.touches || []).filter(function(t) { return t.surface === _surface; });
  }

  // Register listener for neutron updates
  function onUpdate(fn) {
    _listeners.push(fn);
    if (_state) fn(_state);
  }

  // ── Neutron badge (small UI element for any surface) ──────────────────
  function renderBadge(container) {
    if (!container) return;
    var mirror = getMirror();
    var el = document.createElement('div');
    el.className = 'neutron-badge';
    el.style.cssText = 'font-size:11px;color:#58a6ff;opacity:0.7;display:flex;align-items:center;gap:6px;padding:4px 8px;';

    var dot = document.createElement('span');
    dot.style.cssText = 'width:6px;height:6px;background:#58a6ff;border-radius:50%;box-shadow:0 0 4px #58a6ff;display:inline-block;';
    el.appendChild(dot);

    var label = document.createElement('span');
    label.textContent = mirror.type === 'direct'
      ? 'neutron · direct'
      : 'neutron · ' + mirror.from + ' → ' + _surface;
    el.appendChild(label);

    if (_state) {
      var flows = getMyFlows();
      if (flows.stuck) {
        var warn = document.createElement('span');
        warn.textContent = ' · stuck';
        warn.style.color = '#f85149';
        el.appendChild(warn);
      }
      if (flows.incoming.length > 0) {
        var flowLabel = document.createElement('span');
        flowLabel.textContent = ' · ' + flows.incoming.length + ' in';
        flowLabel.style.opacity = '0.6';
        el.appendChild(flowLabel);
      }
      if (flows.outgoing.length > 0) {
        var flowLabel2 = document.createElement('span');
        flowLabel2.textContent = ' · ' + flows.outgoing.length + ' out';
        flowLabel2.style.opacity = '0.6';
        el.appendChild(flowLabel2);
      }
    }

    container.appendChild(el);
  }

  // ── Auto-init on load ────────────────────────────────────────────────
  fetchNeutron();
  setInterval(function() { fetchNeutron(); }, POLL_MS);

  // Expose globally
  window.Neutron = {
    surface: _surface,
    mirror: getMirror,
    state: function() { return _state; },
    flows: getMyFlows,
    touches: getMyTouches,
    onUpdate: onUpdate,
    fetch: fetchNeutron,
    renderBadge: renderBadge
  };
})();
