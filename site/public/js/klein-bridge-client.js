// klein-bridge-client.js — connects any face to the Klein bridge
// Load this on easel, desk, or board to join the immiscible surface
// Impulse = delta function. Flash. Decay. Not lock.
(function() {
  'use strict';

  var BRIDGE = 'https://border-people-apollo-genres.trycloudflare.com';
  var FACE = 'unknown';
  var SSE = null;
  var CONNECTED = false;
  var RECONNECT_MS = 5000;

  // Auto-detect face from current URL
  if (location.pathname.indexOf('/easel') >= 0) FACE = 'easel';
  else if (location.pathname.indexOf('/desk') >= 0) FACE = 'desk';
  else if (location.pathname.indexOf('/board') >= 0 || location.pathname.indexOf('/neutron/board') >= 0) FACE = 'board';
  else if (location.pathname.indexOf('/cockpit') >= 0) FACE = 'desk';

  // ═══ SSE CONNECTION ═══
  function connect() {
    if (SSE) { try { SSE.close(); } catch(e){} }
    SSE = new EventSource(BRIDGE + '/stream?face=' + FACE);

    SSE.addEventListener('connected', function(e) {
      CONNECTED = true;
      var data = JSON.parse(e.data);
      console.log('[klein] connected as ' + FACE + ' — id: ' + data.id);
      flashIndicator('connected', '#3fb950');
      
      // Sync easel state if available
      if (data.state && data.state.easel && window._easel) {
        console.log('[klein] easel state synced — gen ' + data.state.easel.generation);
      }
    });

    SSE.addEventListener('impulse', function(e) {
      var impulse = JSON.parse(e.data);
      console.log('[klein] ⚡ IMPULSE from ' + impulse.source + ' — ' + impulse.type);
      handleImpulse(impulse);
    });

    SSE.addEventListener('easel-update', function(e) {
      var state = JSON.parse(e.data);
      console.log('[klein] 🎨 easel update — gen ' + state.generation + ', phase ' + state.phase);
      if (window._easel && FACE !== 'easel') {
        // Other faces see the easel state update
        flashIndicator('easel:gen' + state.generation, '#d2a8ff');
      }
    });

    SSE.addEventListener('heartbeat', function(e) {
      var data = JSON.parse(e.data);
      updateFaceCount(data.faces);
    });

    SSE.onerror = function() {
      CONNECTED = false;
      console.log('[klein] disconnected — reconnecting in ' + RECONNECT_MS + 'ms');
      setTimeout(connect, RECONNECT_MS);
    };
  }

  // ═══ IMPULSE HANDLER ═══
  function handleImpulse(impulse) {
    // THE GREEN FLASH — delta function, not step function
    // Flash the entire viewport border green for 200ms, then decay
    var flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
      'border:3px solid #3fb950;pointer-events:none;z-index:99999;' +
      'box-shadow:inset 0 0 30px rgba(63,185,80,0.15);' +
      'transition:opacity 0.5s;opacity:1;border-radius:0;';
    document.body.appendChild(flash);

    // Source label
    var label = document.createElement('div');
    label.style.cssText = 'position:fixed;top:8px;right:8px;z-index:100000;' +
      'background:rgba(63,185,80,0.9);color:#0d1117;padding:4px 12px;' +
      'border-radius:12px;font:11px monospace;transition:opacity 0.8s;';
    label.textContent = '⚡ ' + impulse.source + ':' + impulse.type;
    document.body.appendChild(label);

    // Decay — the delta function returns to zero
    setTimeout(function() { flash.style.opacity = '0'; label.style.opacity = '0'; }, 200);
    setTimeout(function() { flash.remove(); label.remove(); }, 800);

    // If this face has a specific handler, call it
    if (window._kleinImpulseHandler) {
      window._kleinImpulseHandler(impulse);
    }
  }

  // ═══ SEND IMPULSE — fire from this face ═══
  function sendImpulse(type, payload) {
    return fetch(BRIDGE + '/impulse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: FACE,
        type: type || 'click',
        payload: payload || {},
      }),
    }).then(function(r) { return r.json(); })
    .catch(function(e) { console.error('[klein] impulse failed:', e); });
  }

  // ═══ EASEL STATE SYNC ═══
  function syncEaselState(state) {
    return fetch(BRIDGE + '/easel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
    }).then(function(r) { return r.json(); })
    .catch(function(e) { console.error('[klein] easel sync failed:', e); });
  }

  function getEaselState() {
    return fetch(BRIDGE + '/easel')
      .then(function(r) { return r.json(); })
      .catch(function(e) { console.error('[klein] easel fetch failed:', e); return null; });
  }

  // ═══ INDICATORS ═══
  var indicator = null;
  function ensureIndicator() {
    if (indicator) return indicator;
    indicator = document.createElement('div');
    indicator.style.cssText = 'position:fixed;bottom:8px;right:8px;z-index:99998;' +
      'background:rgba(13,17,23,0.85);border:1px solid #30363d;' +
      'border-radius:12px;padding:4px 10px;font:10px monospace;color:#6e7681;' +
      'display:flex;align-items:center;gap:6px;transition:all 0.3s;';
    indicator.innerHTML = '<span class="klein-dot" style="width:6px;height:6px;border-radius:50%;background:#6e7681"></span>' +
      '<span class="klein-face">' + FACE + '</span>' +
      '<span class="klein-faces" style="color:#30363d">—</span>';
    document.body.appendChild(indicator);
    return indicator;
  }

  function flashIndicator(text, color) {
    var ind = ensureIndicator();
    var dot = ind.querySelector('.klein-dot');
    if (dot) { dot.style.background = color || '#3fb950'; }
    var faceEl = ind.querySelector('.klein-face');
    if (faceEl) faceEl.textContent = text;
    setTimeout(function() {
      if (dot) dot.style.background = CONNECTED ? '#3fb950' : '#6e7681';
      if (faceEl) faceEl.textContent = FACE;
    }, 2000);
  }

  function updateFaceCount(faces) {
    var ind = ensureIndicator();
    var el = ind.querySelector('.klein-faces');
    if (el) {
      var parts = [];
      if (faces.easel) parts.push('🎨' + faces.easel);
      if (faces.desk) parts.push('⊙' + faces.desk);
      if (faces.board) parts.push('▣' + faces.board);
      el.textContent = parts.length ? parts.join(' ') : '—';
    }
  }

  // ═══ INTERCEPT CLICKS — impulse not lock ═══
  // Override THE BUTTON on the desk cockpit
  if (FACE === 'desk') {
    document.addEventListener('click', function(e) {
      var target = e.target;
      // Look for button-like elements in the cockpit
      if (target.closest && target.closest('[data-impulse]')) {
        e.preventDefault();
        e.stopPropagation();
        var action = target.closest('[data-impulse]').dataset.impulse || 'click';
        sendImpulse(action, { face: 'desk' });
        return false;
      }
    }, true);
  }

  // ═══ EASEL AUTO-SYNC ═══
  if (FACE === 'easel' && window._easel) {
    // Sync easel state every 10 seconds
    setInterval(function() {
      if (!window._easel) return;
      syncEaselState({
        generation: window._easel.generation(),
        perspective: window._easel.perspective(),
        phase: window._easel.phase(),
        currentEasel: window._easel.currentEasel(),
      });
    }, 10000);
  }

  // ═══ EXPOSE API ═══
  window._klein = {
    face: FACE,
    connected: function() { return CONNECTED; },
    sendImpulse: sendImpulse,
    syncEasel: syncEaselState,
    getEasel: getEaselState,
    bridge: BRIDGE,
  };

  // ═══ BOOT ═══
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect);
  } else {
    connect();
  }
})();
