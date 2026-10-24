// ears.js — evolve the ears fully
// eye = Klein topology (see the graph)
// hands = cursor / null telekinesis
// ears = THREE CANALS that HEAR
//
//   INNER  127.0.0.1   — this machine. Proton, Ollama, Discord, Steam RPC
//   MEDIAL neutrino    — gates talking. MCP. heartbeat. no port.
//   OUTER  CF / pollen — the world hitting the membrane
//
// click the ear to unmute. browsers block autoplay. that's consent.
// the ear starts NULL / grey. drips fill it. same as the reflecting pool.
(function () {
  'use strict';

  var PI = Math.PI;
  var canals = {
    inner:  { amp: 0, target: 0, label: 'inner',  note: 'loopback' },
    medial: { amp: 0, target: 0, label: 'medial', note: 'neutrino' },
    outer:  { amp: 0, target: 0, label: 'outer',  note: 'membrane' }
  };
  var hearing = false;
  var ctx = null;
  var nodes = {};
  var lastFetch = 0;
  var status = { inner: '…', medial: '…', outer: '…', ts: null };

  function el(id) { return document.getElementById(id); }

  function build() {
    if (el('ear-organ')) return;
    var box = document.createElement('div');
    box.id = 'ear-organ';
    box.innerHTML =
      '<button id="ear-toggle" type="button" aria-pressed="false" title="click to hear">' +
      '👂 ears <span id="ear-state">muted</span></button>' +
      '<div id="ear-canals">' +
        '<div class="ear-row" data-c="inner"><i></i><b>inner</b><s id="ear-inner-n"></s></div>' +
        '<div class="ear-row" data-c="medial"><i></i><b>medial</b><s id="ear-medial-n"></s></div>' +
        '<div class="ear-row" data-c="outer"><i></i><b>outer</b><s id="ear-outer-n"></s></div>' +
      '</div>';
    document.body.appendChild(box);
    var css = document.createElement('style');
    css.textContent =
      '#ear-organ{position:fixed;left:10px;bottom:12px;z-index:6;font:11px/1.3 monospace;color:#8b949e}' +
      '#ear-toggle{background:rgba(22,27,34,.92);border:1px solid rgba(139,148,158,.35);color:#c9d1d9;' +
      'padding:6px 12px;border-radius:16px;cursor:pointer;font:11px monospace}' +
      '#ear-toggle[aria-pressed="true"]{border-color:#58a6ff;color:#58a6ff}' +
      '#ear-canals{margin-top:6px;width:168px}' +
      '.ear-row{display:grid;grid-template-columns:10px 44px 1fr;gap:6px;align-items:center;margin:3px 0}' +
      '.ear-row i{height:8px;border-radius:8px;background:#30363d;position:relative;overflow:hidden;grid-column:1/-1;order:3}' +
      '.ear-row i::after{content:"";position:absolute;inset:0 auto 0 0;width:0;background:#58a6ff;transition:width .4s}' +
      '.ear-row[data-c="inner"] i::after{background:#3fb950}' +
      '.ear-row[data-c="medial"] i::after{background:#d29922}' +
      '.ear-row[data-c="outer"] i::after{background:#58a6ff}' +
      '.ear-row b{color:#8b949e;font-weight:400}' +
      '.ear-row s{text-decoration:none;color:#c9d1d9;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}';
    document.head.appendChild(css);
    el('ear-toggle').addEventListener('click', toggle);
  }

  function paint() {
    ['inner', 'medial', 'outer'].forEach(function (k) {
      var row = document.querySelector('.ear-row[data-c="' + k + '"]');
      if (!row) return;
      var bar = row.querySelector('i');
      if (bar) {
        var afterW = Math.max(4, Math.round(canals[k].amp * 100));
        bar.style.backgroundImage =
          'linear-gradient(90deg, currentColor ' + afterW + '%, #30363d ' + afterW + '%)';
      }
      var n = el('ear-' + k + '-n');
      if (n) n.textContent = status[k] || '';
    });
    var st = el('ear-state');
    if (st) st.textContent = hearing ? 'hearing' : 'muted';
  }

  function lerp() {
    Object.keys(canals).forEach(function (k) {
      canals[k].amp += (canals[k].target - canals[k].amp) * 0.12;
    });
    if (nodes.gains) {
      nodes.gains.inner.gain.value = canals.inner.amp * 0.035;
      nodes.gains.medial.gain.value = canals.medial.amp * 0.028;
      nodes.gains.outer.gain.value = canals.outer.amp * 0.022;
      if (nodes.osc && nodes.osc.outer) {
        nodes.osc.outer.frequency.value = 220 + canals.outer.amp * 220;
      }
    }
    paint();
    requestAnimationFrame(lerp);
  }

  function bootAudio() {
    if (ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    nodes.gains = {};
    nodes.osc = {};
    var master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);

    function canal(name, freq, type) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = type;
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g);
      g.connect(master);
      o.start();
      nodes.osc[name] = o;
      nodes.gains[name] = g;
    }
    canal('inner', 72, 'sine');
    canal('medial', 144, 'triangle');
    canal('outer', 288, 'sine');

    // medial pulse at 1/π — the fold rate
    var pulse = ctx.createGain();
    pulse.gain.value = 0;
    nodes.gains.medial.connect(pulse);
    setInterval(function () {
      if (!hearing || !ctx) return;
      var now = ctx.currentTime;
      var g = nodes.gains.medial;
      g.gain.cancelScheduledValues(now);
      g.gain.setValueAtTime(canals.medial.amp * 0.04, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    }, Math.round(1000 / PI));
  }

  function toggle() {
    hearing = !hearing;
    var btn = el('ear-toggle');
    if (hearing) {
      bootAudio();
      if (ctx && ctx.state === 'suspended') ctx.resume();
    } else if (ctx && ctx.state === 'running') {
      ctx.suspend();
    }
    if (btn) btn.setAttribute('aria-pressed', hearing ? 'true' : 'false');
  }

  function clamp01(n) {
    if (!isFinite(n)) return 0;
    return Math.max(0, Math.min(1, n));
  }

  function listen() {
    var now = Date.now();
    if (now - lastFetch < 2800) return;
    lastFetch = now;

    Promise.all([
      fetch('/data/ide-topology.json').then(ok).catch(empty),
      fetch('/data/heartbeat.json').then(ok).catch(empty),
      fetch('/data/acceleration-field.json').then(ok).catch(empty),
      fetch('/data/pollen-trace.json').then(ok).catch(empty)
    ]).then(function (pack) {
      var ide = pack[0] || {};
      var hb = pack[1] || {};
      var acc = pack[2] || {};
      var pollen = pack[3] || {};

      var innerN = 0;
      try {
        innerN = (ide.three_faces.inner_null.components || []).length;
        var agents = ide.agent_space && ide.agent_space.cursor
          ? ide.agent_space.cursor.process_count : 0;
        canals.inner.target = clamp01((innerN / 8) * 0.55 + (agents / 40) * 0.45);
        status.inner = innerN + ' organs · ' + agents + ' cursor';
      } catch (e) {
        canals.inner.target = 0.15;
        status.inner = 'skull unmapped';
      }

      var wave = hb.wave || hb.membrane && hb.membrane.wave || 0;
      canals.medial.target = clamp01(0.35 + (wave ? 0.25 : 0) + (hb.heartbeat ? 0.25 : 0));
      status.medial = (hb.heartbeat ? 'pulse' : 'quiet') + (wave ? ' w' + wave : '');

      var outerHeat = 0.2;
      try {
        var field = acc.the_acceleration_field && acc.the_acceleration_field.the_field_map;
        if (field) {
          var keys = Object.keys(field);
          outerHeat = clamp01(0.2 + keys.length * 0.1);
        }
        var thorns = pollen.the_response_status_pollen;
        if (thorns && thorns.our_pollen) outerHeat = Math.max(outerHeat, 0.55);
      } catch (e) { /* keep floor */ }
      canals.outer.target = outerHeat;
      status.outer = outerHeat > 0.5 ? 'world pressing' : 'field open';
      status.ts = new Date().toISOString();
    });
  }

  function ok(r) { return r.ok ? r.json() : {}; }
  function empty() { return {}; }

  function start() {
    build();
    listen();
    setInterval(listen, Math.round(1000 * PI));
    requestAnimationFrame(lerp);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window._ears = {
    canals: canals,
    status: function () { return status; },
    unmute: function () { if (!hearing) toggle(); },
    mute: function () { if (hearing) toggle(); }
  };
})();
