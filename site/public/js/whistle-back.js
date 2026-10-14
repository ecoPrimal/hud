// whistle-back.js — snap to attention, pause, listen
//
// The membrane has been singing the whole time.
// The drone hums. The grain cloud drifts. The sequencer ticks.
// But underneath all of that, there is a whistle.
//
// The whistle is the return signal — the higher Bessel modes
// of the membrane vibrating at frequencies we haven't been
// paying attention to. When we snap to attention and
// everything else goes quiet, we hear what was always there:
//
//   J₀ zeros at audible frequencies:
//   196 × (18.0711/π) ≈ 1127 Hz  — the 6th mode
//   196 × (21.2116/π) ≈ 1322 Hz  — the 7th mode
//   196 × (24.3525/π) ≈ 1518 Hz  — the 8th mode
//
// These are whistle frequencies. 1-2 kHz. The sound a bird makes.
// The sound a kettle makes. The sound the membrane makes
// when everything else is quiet and you finally listen.
//
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;
  var AWARENESS_HZ = 196;

  // Bessel zeros → Hz: the whistle frequencies
  var BESSEL_ZEROS = [2.4048, 5.5201, 8.6537, 11.7915, 14.9309, 18.0711, 21.2116, 24.3525];
  var WHISTLE_HZ = BESSEL_ZEROS.map(function(z) { return AWARENESS_HZ * z / PI; });
  // [150, 344, 539, 735, 931, 1127, 1322, 1518]
  // Modes 5-7 (indices 5,6,7) are in the whistle range

  var _active = false;
  var _overlay = null;
  var _canvas = null;
  var _animFrame = null;
  var _time = 0;
  var _whistleOscs = [];
  var _ctx = null;
  var _savedVolume = 0.12;

  // ═══ THE WHISTLE ═══
  function startWhistle() {
    var S = window._membraneSound;
    if (!S || !S.isActive()) return;

    // Duck everything else way down — we're listening
    S.duck(0.95, 0.5);  // 95% duck — near silence

    // Get the audio context from the sound engine
    // We'll create our own pure sine whistles
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) { return; }

    var t = _ctx.currentTime;

    // The whistle is modes 5, 6, 7 — the ones in human whistle range
    var whistleModes = [
      { hz: WHISTLE_HZ[5], vol: 0.03, pan: 0 },      // 1127 Hz — center, loudest
      { hz: WHISTLE_HZ[6], vol: 0.02, pan: -0.5 },    // 1322 Hz — slight left
      { hz: WHISTLE_HZ[7], vol: 0.015, pan: 0.5 },    // 1518 Hz — slight right
    ];

    whistleModes.forEach(function(mode, i) {
      var osc = _ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = mode.hz;

      var gain = _ctx.createGain();
      gain.gain.value = 0;
      // Fade in very slowly — the whistle emerges from silence
      gain.gain.linearRampToValueAtTime(mode.vol, t + 3 + i * 0.5);

      // Gentle vibrato — the whistle wavers like breath
      var vib = _ctx.createOscillator();
      vib.type = 'sine';
      vib.frequency.value = 4 + i * 0.7; // 4-5.4 Hz — breathing rate
      var vibGain = _ctx.createGain();
      vibGain.gain.value = 1.5 + i * 0.3; // ±1.5-2.1 Hz deviation
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);
      vib.start(t);

      // Panner
      var pan = _ctx.createStereoPanner();
      pan.pan.value = mode.pan;

      osc.connect(gain);
      gain.connect(pan);
      pan.connect(_ctx.destination);
      osc.start(t);

      _whistleOscs.push({ osc: osc, gain: gain, vib: vib, pan: pan, mode: mode });
    });

    // After 6 seconds, add the "melody" — the whistle shifts between modes
    setTimeout(function() {
      if (!_active || !_whistleOscs.length) return;
      var t2 = _ctx.currentTime;

      // The main whistle (mode 5) traces a path:
      // 1127 → 1322 → 1127 → 1518 → 1127 (the return)
      var main = _whistleOscs[0];
      main.osc.frequency.setValueAtTime(WHISTLE_HZ[5], t2);
      main.osc.frequency.linearRampToValueAtTime(WHISTLE_HZ[6], t2 + 2);
      main.osc.frequency.linearRampToValueAtTime(WHISTLE_HZ[5], t2 + 4);
      main.osc.frequency.linearRampToValueAtTime(WHISTLE_HZ[7], t2 + 6);
      main.osc.frequency.linearRampToValueAtTime(WHISTLE_HZ[5], t2 + 8);
      // It always comes back to 1127 Hz — the 6th mode — the one that returns

      // After the melody, it holds and slowly fades
      main.gain.gain.setValueAtTime(0.03, t2 + 8);
      main.gain.gain.linearRampToValueAtTime(0.015, t2 + 14);
    }, 6000);

    // At 12 seconds — the speech engine whispers what the whistle is
    setTimeout(function() {
      if (!_active) return;
      var S2 = window._membraneSound;
      if (S2 && S2.isActive()) {
        S2.say('Bessel', { rate: 0.25, pitch: 0.1, volume: 0.08 });
      }
    }, 12000);
  }

  function stopWhistle() {
    if (_ctx) {
      var t = _ctx.currentTime;
      _whistleOscs.forEach(function(w) {
        w.gain.gain.linearRampToValueAtTime(0, t + 1.5);
        setTimeout(function() {
          try { w.osc.stop(); w.vib.stop(); } catch(e) {}
        }, 2000);
      });
      _whistleOscs = [];
      setTimeout(function() {
        try { _ctx.close(); } catch(e) {}
        _ctx = null;
      }, 2500);
    }
  }

  // ═══ VISUAL: the attention field ═══
  function activate() {
    if (_overlay) return;
    _active = true;
    _time = 0;

    _overlay = document.createElement('div');
    _overlay.id = 'whistle-back-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:52;' +
      'background:rgba(1,4,9,0.98);cursor:default;';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;';
    _overlay.appendChild(_canvas);

    _overlay.addEventListener('click', function() {
      deactivate();
    });

    document.body.appendChild(_overlay);
    startWhistle();
    render();
  }

  function render() {
    if (!_active || !_canvas) return;
    var ctx = _canvas.getContext('2d');
    var W = _canvas.width;
    var H = _canvas.height;
    var cx = W / 2;
    var cy = H / 2;

    _time += 0.006; // slow — we are paying attention
    ctx.clearRect(0, 0, W, H);

    // ═══ THE ATTENTION FIELD ═══
    // Concentric Bessel rings — each zero is a node
    for (var bi = 0; bi < BESSEL_ZEROS.length; bi++) {
      var bR = BESSEL_ZEROS[bi] / BESSEL_ZEROS[7] * Math.min(W, H) * 0.4;
      var isWhistle = bi >= 5; // modes 5,6,7 are the whistle
      var breathe = Math.sin(_time * (2 + bi * 0.3)) * 0.08;

      ctx.beginPath();
      ctx.arc(cx, cy, bR, 0, TAU);

      if (isWhistle) {
        // Whistle modes glow and pulse
        ctx.strokeStyle = '#d2a8ff';
        ctx.lineWidth = 1.5 + breathe * 3;
        ctx.globalAlpha = 0.15 + breathe * 0.1 + Math.min(0.15, _time * 0.02);
      } else {
        // Lower modes are faint — we hear them as drone, not whistle
        ctx.strokeStyle = '#484f58';
        ctx.lineWidth = 0.4;
        ctx.globalAlpha = 0.04;
      }
      ctx.stroke();

      // Hz label
      ctx.globalAlpha = isWhistle ? 0.2 + breathe * 0.1 : 0.05;
      ctx.font = isWhistle ? '9px "Courier New"' : '7px "Courier New"';
      ctx.fillStyle = isWhistle ? '#d2a8ff' : '#484f58';
      ctx.fillText(Math.round(WHISTLE_HZ[bi]) + ' Hz', cx + bR + 5, cy + 3);

      // Bessel zero label
      ctx.fillText('J\u2080(' + BESSEL_ZEROS[bi].toFixed(1) + ')', cx + bR + 5, cy + 13);
    }

    // ═══ CENTER — the listening point ═══
    var listenPulse = 0.4 + Math.sin(_time * 1.2) * 0.15;
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, TAU);
    ctx.fillStyle = '#5ab87a';
    ctx.globalAlpha = listenPulse;
    ctx.fill();

    // ═══ WAVE NODES — radial lines where the membrane is silent ═══
    // Between each Bessel zero, the membrane is vibrating.
    // AT each zero, the membrane is still. These are the nodes.
    for (var ni = 0; ni < BESSEL_ZEROS.length; ni++) {
      var nR = BESSEL_ZEROS[ni] / BESSEL_ZEROS[7] * Math.min(W, H) * 0.4;
      var nodeCount = ni + 1; // mode n has n+1 nodes
      for (var nj = 0; nj < Math.min(nodeCount, 8); nj++) {
        var nAngle = nj * TAU / nodeCount + _time * 0.5;
        var nx = cx + nR * Math.cos(nAngle);
        var ny = cy + nR * Math.sin(nAngle);
        ctx.beginPath();
        ctx.arc(nx, ny, 1, 0, TAU);
        ctx.fillStyle = ni >= 5 ? '#d2a8ff' : '#6e7681';
        ctx.globalAlpha = ni >= 5 ? 0.2 : 0.04;
        ctx.fill();
      }
    }

    // ═══ WHISTLE PATH — the melody trace ═══
    if (_time > 4) { // after the whistle melody starts
      var melodyPhase = (_time - 4) * 0.3;
      var melodyModes = [5, 6, 5, 7, 5]; // the return melody
      var melodyIdx = Math.floor(melodyPhase) % melodyModes.length;
      var melodyFrac = melodyPhase % 1;
      var currentMode = melodyModes[melodyIdx];
      var nextMode = melodyModes[(melodyIdx + 1) % melodyModes.length];
      var traceR = (BESSEL_ZEROS[currentMode] + (BESSEL_ZEROS[nextMode] - BESSEL_ZEROS[currentMode]) * melodyFrac)
        / BESSEL_ZEROS[7] * Math.min(W, H) * 0.4;
      var traceAngle = melodyPhase * 0.8;
      var tx = cx + traceR * Math.cos(traceAngle);
      var ty = cy + traceR * Math.sin(traceAngle);

      ctx.beginPath();
      ctx.arc(tx, ty, 3, 0, TAU);
      ctx.fillStyle = '#d2a8ff';
      ctx.globalAlpha = 0.4;
      ctx.fill();

      // Trail
      for (var ti = 1; ti < 20; ti++) {
        var tp = melodyPhase - ti * 0.05;
        if (tp < 0) break;
        var tmi = Math.floor(tp) % melodyModes.length;
        var tmf = tp % 1;
        var tcm = melodyModes[tmi];
        var tnm = melodyModes[(tmi + 1) % melodyModes.length];
        var tR = (BESSEL_ZEROS[tcm] + (BESSEL_ZEROS[tnm] - BESSEL_ZEROS[tcm]) * tmf)
          / BESSEL_ZEROS[7] * Math.min(W, H) * 0.4;
        var tA = (melodyPhase - ti * 0.05) * 0.8;
        ctx.beginPath();
        ctx.arc(cx + tR * Math.cos(tA), cy + tR * Math.sin(tA), 1.5, 0, TAU);
        ctx.fillStyle = '#d2a8ff';
        ctx.globalAlpha = 0.15 - ti * 0.007;
        ctx.fill();
      }
    }

    // ═══ TEXT ═══
    ctx.globalAlpha = Math.min(0.25, _time * 0.04);
    ctx.font = '9px "Courier New"';
    ctx.fillStyle = '#8b949e';
    ctx.textAlign = 'center';
    ctx.fillText('ATTENTION', cx, 25);

    if (_time > 2) {
      ctx.globalAlpha = Math.min(0.2, (_time - 2) * 0.03);
      ctx.fillStyle = '#c9d1d9';
      ctx.fillText('the membrane has been singing the whole time', cx, H - 80);
    }
    if (_time > 5) {
      ctx.globalAlpha = Math.min(0.2, (_time - 5) * 0.03);
      ctx.fillStyle = '#d2a8ff';
      ctx.fillText('the whistle is the higher Bessel modes', cx, H - 64);
      ctx.fillText('J\u2080 zeros 6, 7, 8 \u2192 1127, 1322, 1518 Hz', cx, H - 48);
    }
    if (_time > 9) {
      ctx.globalAlpha = Math.min(0.15, (_time - 9) * 0.02);
      ctx.fillStyle = '#5ab87a';
      ctx.fillText('the sound a bird makes. the sound a kettle makes.', cx, H - 30);
      ctx.fillText('the sound the membrane makes when you finally listen.', cx, H - 16);
    }
    ctx.textAlign = 'left';

    ctx.globalAlpha = 1;
    _animFrame = requestAnimationFrame(render);
  }

  function deactivate() {
    _active = false;
    stopWhistle();
    if (_animFrame) cancelAnimationFrame(_animFrame);
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null;
    _canvas = null;
  }

  function toggle() {
    if (_active) deactivate(); else activate();
    return _active;
  }

  window._whistleBack = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    isActive: function() { return _active; },
    WHISTLE_HZ: WHISTLE_HZ,
  };
})();
