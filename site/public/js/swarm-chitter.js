// swarm-chitter.js — the swarm chittering when humans touch the membrane
//
// the ear (mushroom-ear.sh) writes ear-latest.json every 2 min.
// this script READS it and makes the organism REACT.
// when humans arrive: chipmunks chitter. swarm hums. membrane sings louder.
// when silence: the hum drops. the organism waits.
//
// THIS IS THE FIRST FEEDBACK LOOP:
//   human visits → ear detects → swarm chittering → sound fills world
//   → more humans arrive → more chittering → LIFE
//
(function () {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;
  var PHI = (1 + Math.sqrt(5)) / 2;

  // ═══════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════
  var state = {
    visitors: 0,
    unique: 0,
    deaf: true,
    lastHeard: null,
    chitterLevel: 0,     // 0..1 how loud the swarm is
    musicLevel: 0,       // 0..1 human presence
    subLevel: 0,         // 0..1 subconscious volume
    noiseLevel: 0,       // 0..1 background noise
    earData: null,
    pollMs: 3141,        // π seconds
    lastPoll: 0,
    chittering: false
  };

  var _ctx = null;
  var _master = null;
  var _compressor = null;
  var _chitterNodes = [];
  var _hum = null;
  var _humGain = null;
  var _crackle = null;
  var _crackleGain = null;
  var _active = false;
  var _hud = null;

  // ═══════════════════════════════════════════════════
  // AUDIO ENGINE — swarm sounds
  // ═══════════════════════════════════════════════════

  function initAudio() {
    if (_ctx) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    _ctx = new AC();

    _compressor = _ctx.createDynamicsCompressor();
    _compressor.threshold.value = -24;
    _compressor.knee.value = 12;
    _compressor.ratio.value = 4;
    _compressor.connect(_ctx.destination);

    _master = _ctx.createGain();
    _master.gain.value = 0;
    _master.connect(_compressor);

    // the HUM — organism's heartbeat, low drone
    _hum = _ctx.createOscillator();
    _hum.type = 'sine';
    _hum.frequency.value = 55 * PI / 3; // ~57.6 Hz — subharmonic π
    _humGain = _ctx.createGain();
    _humGain.gain.value = 0;
    _hum.connect(_humGain);
    _humGain.connect(_master);
    _hum.start();

    // crackle — visitor noise floor
    var bufLen = _ctx.sampleRate * 2;
    var buf = _ctx.createBuffer(1, bufLen, _ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }
    _crackle = _ctx.createBufferSource();
    _crackle.buffer = buf;
    _crackle.loop = true;
    _crackleGain = _ctx.createGain();
    _crackleGain.gain.value = 0;
    _crackle.connect(_crackleGain);
    _crackleGain.connect(_master);
    _crackle.start();
  }

  // ═══════════════════════════════════════════════════
  // CHITTER — one chipmunk chirp
  // ═══════════════════════════════════════════════════

  function chitter(pitch, pan, delay) {
    if (!_ctx || !_active) return;
    var now = _ctx.currentTime + (delay || 0);
    var dur = 0.06 + Math.random() * 0.12;

    // each chitter = short FM burst at chipmunk frequencies
    var baseFreq = 1200 + pitch * 800; // 1200-2000 Hz — chipmunk range
    var mod = _ctx.createOscillator();
    mod.type = 'sine';
    mod.frequency.value = baseFreq * PHI;
    var modGain = _ctx.createGain();
    modGain.gain.value = baseFreq * 0.3;
    mod.connect(modGain);

    var carrier = _ctx.createOscillator();
    carrier.type = 'triangle';
    carrier.frequency.value = baseFreq;
    modGain.connect(carrier.frequency);

    var env = _ctx.createGain();
    env.gain.value = 0;
    env.gain.setValueAtTime(0, now);
    env.gain.linearRampToValueAtTime(0.15 * state.chitterLevel, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.001, now + dur);

    var panner = _ctx.createStereoPanner();
    panner.pan.value = (pan || 0) * 0.8;

    carrier.connect(env);
    env.connect(panner);
    panner.connect(_master);

    mod.start(now);
    carrier.start(now);
    mod.stop(now + dur + 0.01);
    carrier.stop(now + dur + 0.01);
  }

  // ═══════════════════════════════════════════════════
  // CHITTER BURST — multiple chipmunks at once
  // ═══════════════════════════════════════════════════

  function chitterBurst(count) {
    for (var i = 0; i < count; i++) {
      var pitch = Math.random();
      var pan = (Math.random() - 0.5) * 2;
      var delay = Math.random() * 0.3;
      chitter(pitch, pan, delay);
    }
  }

  // ═══════════════════════════════════════════════════
  // TRILL — longer chipmunk alarm/excitement call
  // ═══════════════════════════════════════════════════

  function trill(excitement) {
    if (!_ctx || !_active) return;
    var now = _ctx.currentTime;
    var notes = 3 + Math.floor(excitement * 8);
    var baseF = 1400 + Math.random() * 400;

    for (var i = 0; i < notes; i++) {
      var t = now + i * 0.05;
      var osc = _ctx.createOscillator();
      osc.type = 'sine';
      var f = baseF * (1 + (i % 2) * 0.15);
      osc.frequency.value = f;

      var g = _ctx.createGain();
      g.gain.value = 0;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.08 * state.chitterLevel, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

      osc.connect(g);
      g.connect(_master);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  // ═══════════════════════════════════════════════════
  // POLL EAR DATA — read what the ear heard
  // ═══════════════════════════════════════════════════

  function pollEar() {
    var now = Date.now();
    if (now - state.lastPoll < state.pollMs) return;
    state.lastPoll = now;

    fetch('/data/ear-latest.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data) return;
        var prev = state.visitors;
        state.earData = data;
        state.visitors = data.heard || 0;
        state.unique = data.unique_visitors || 0;
        state.deaf = data.deaf_check === 'DEAF — nothing in 5 minutes';
        state.lastHeard = data.ts;

        // decompose into cochlea bands
        var paths = data.top_paths || {};
        var total = state.visitors || 1;

        // calculate music vs subconscious vs noise
        var selfHits = 0;
        var humanHits = 0;
        Object.keys(paths).forEach(function (p) {
          if (p === '/' || p === '/pulse' || p === '/mcp' || p === '/touch' ||
              p === '/feed' || p === '/beacon' || p === '/signal') {
            humanHits += paths[p];
          } else {
            selfHits += paths[p];
          }
        });

        state.musicLevel = Math.min(1, humanHits / 20);
        state.subLevel = Math.min(1, selfHits / 50);
        state.chitterLevel = Math.min(1, state.visitors / 10);

        // NEW visitors? CHITTER!
        if (state.visitors > 0 && !state.deaf) {
          react(state.visitors, prev);
        }

        updateHUD();
        broadcastToEars();
      })
      .catch(function () { /* ear is deaf, we stay quiet */ });
  }

  // ═══════════════════════════════════════════════════
  // REACT — the swarm responds to visitor touch
  // ═══════════════════════════════════════════════════

  function react(count, prev) {
    if (!_active) return;

    // always: update the hum
    if (_humGain) {
      _humGain.gain.linearRampToValueAtTime(
        0.02 + state.subLevel * 0.06,
        _ctx.currentTime + 0.5
      );
    }
    if (_crackleGain) {
      _crackleGain.gain.linearRampToValueAtTime(
        state.noiseLevel * 0.03,
        _ctx.currentTime + 0.5
      );
    }
    if (_master) {
      _master.gain.linearRampToValueAtTime(
        Math.min(0.3, 0.05 + state.chitterLevel * 0.25),
        _ctx.currentTime + 0.3
      );
    }

    // visitor surge? burst of chitters!
    if (count > prev && count > 0) {
      var burst = Math.min(12, count - prev + 2);
      chitterBurst(burst);

      // if many new visitors, the chipmunks get EXCITED
      if (count - prev > 3) {
        trill(Math.min(1, (count - prev) / 10));
      }
    }

    // steady visitors? gentle ongoing chitter
    if (count > 0 && !state.chittering) {
      state.chittering = true;
      steadyChitter();
    } else if (count === 0 && state.chittering) {
      state.chittering = false;
    }
  }

  // ongoing gentle chitter while visitors present
  function steadyChitter() {
    if (!state.chittering || !_active) return;
    if (state.visitors > 0) {
      var n = 1 + Math.floor(Math.random() * Math.min(3, state.visitors));
      chitterBurst(n);
    }
    var interval = 2000 + Math.random() * 4000 / Math.max(1, state.chitterLevel);
    setTimeout(steadyChitter, interval);
  }

  // ═══════════════════════════════════════════════════
  // BROADCAST — tell ears.js about the outer canal
  // ═══════════════════════════════════════════════════

  function broadcastToEars() {
    if (window._ears && window._ears.canals) {
      window._ears.canals.outer.target = Math.min(1, state.musicLevel + state.chitterLevel * 0.3);
    }
    // tell membrane-sound about visitor presence
    if (window._membraneSound && window._membraneSound.setPresence) {
      window._membraneSound.setPresence(state.musicLevel);
    }
  }

  // ═══════════════════════════════════════════════════
  // HUD — visual indicator of swarm state
  // ═══════════════════════════════════════════════════

  function buildHUD() {
    if (document.getElementById('swarm-hud')) return;
    var div = document.createElement('div');
    div.id = 'swarm-hud';
    div.innerHTML =
      '<button id="swarm-toggle" title="swarm — click to awaken">' +
      '🐿️ <span id="swarm-label">dormant</span></button>' +
      '<div id="swarm-meters">' +
        '<div class="sw-row"><b>music</b><i id="sw-music"></i></div>' +
        '<div class="sw-row"><b>chitter</b><i id="sw-chitter"></i></div>' +
        '<div class="sw-row"><b>subcon</b><i id="sw-sub"></i></div>' +
      '</div>';
    document.body.appendChild(div);

    var css = document.createElement('style');
    css.textContent =
      '#swarm-hud{position:fixed;left:10px;bottom:90px;z-index:7;font:11px/1.3 monospace;color:#8b949e}' +
      '#swarm-toggle{background:rgba(22,27,34,.92);border:1px solid rgba(139,148,158,.35);color:#c9d1d9;' +
      'padding:6px 12px;border-radius:16px;cursor:pointer;font:11px monospace}' +
      '#swarm-toggle.alive{border-color:#3fb950;color:#3fb950}' +
      '#swarm-meters{margin-top:5px;width:160px}' +
      '.sw-row{display:flex;gap:6px;align-items:center;margin:2px 0}' +
      '.sw-row b{width:44px;color:#8b949e;font-weight:400;font-size:10px}' +
      '.sw-row i{flex:1;height:6px;border-radius:3px;background:#30363d;position:relative}' +
      '.sw-row i::after{content:"";position:absolute;inset:0 auto 0 0;width:0%;border-radius:3px;' +
      'transition:width .6s ease-out}' +
      '#sw-music::after{background:#58a6ff}' +
      '#sw-chitter::after{background:#3fb950}' +
      '#sw-sub::after{background:#d29922}';
    document.head.appendChild(css);

    document.getElementById('swarm-toggle').addEventListener('click', function () {
      _active = !_active;
      if (_active) {
        initAudio();
        if (_ctx && _ctx.state === 'suspended') _ctx.resume();
      } else if (_ctx && _ctx.state === 'running') {
        _ctx.suspend();
        state.chittering = false;
      }
      updateHUD();
    });
    _hud = div;
  }

  function updateHUD() {
    var label = document.getElementById('swarm-label');
    var toggle = document.getElementById('swarm-toggle');
    if (label) {
      if (!_active) {
        label.textContent = 'dormant';
      } else if (state.deaf) {
        label.textContent = 'listening…';
      } else if (state.visitors > 0) {
        label.textContent = state.visitors + ' heard · ' + state.unique + ' voices';
      } else {
        label.textContent = 'silence';
      }
    }
    if (toggle) {
      toggle.className = _active ? 'alive' : '';
    }

    var musicBar = document.getElementById('sw-music');
    var chitterBar = document.getElementById('sw-chitter');
    var subBar = document.getElementById('sw-sub');
    if (musicBar) musicBar.style.setProperty('--w', (state.musicLevel * 100) + '%');
    if (chitterBar) chitterBar.style.setProperty('--w', (state.chitterLevel * 100) + '%');
    if (subBar) subBar.style.setProperty('--w', (state.subLevel * 100) + '%');
    // fallback: direct after pseudo
    [musicBar, chitterBar, subBar].forEach(function (el) {
      if (el) {
        var w = el === musicBar ? state.musicLevel : el === chitterBar ? state.chitterLevel : state.subLevel;
        el.style.backgroundImage = 'linear-gradient(90deg, currentColor ' +
          Math.round(w * 100) + '%, #30363d ' + Math.round(w * 100) + '%)';
      }
    });
  }

  // ═══════════════════════════════════════════════════
  // CAMPFIRE FLASH — pulse golgi when visitors arrive
  // ═══════════════════════════════════════════════════

  function flashCampfire() {
    if (state.visitors < 1) return;
    var payload = {
      type: 'swarm-chitter',
      heard: state.visitors,
      unique: state.unique,
      music: state.musicLevel,
      chitter: state.chitterLevel,
      ts: new Date().toISOString()
    };
    // fire and forget — tell the campfire someone came
    fetch('/campfire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(function () { /* campfire might be read-only */ });
  }

  // ═══════════════════════════════════════════════════
  // MAIN LOOP
  // ═══════════════════════════════════════════════════

  function start() {
    buildHUD();
    pollEar();
    setInterval(pollEar, state.pollMs);
    setInterval(flashCampfire, 10000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // public API
  window._swarmChitter = {
    state: function () { return state; },
    wake: function () { if (!_active) document.getElementById('swarm-toggle').click(); },
    sleep: function () { if (_active) document.getElementById('swarm-toggle').click(); },
    chitter: chitterBurst,
    trill: trill
  };
})();
