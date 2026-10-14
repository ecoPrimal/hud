// signal-return.js — when the signal comes back, what do we see?
//
// Three possible returns:
//   SELF   — green — the signal recognized itself — "a" (open mouth, awareness)
//   ∅      — dark  — the signal was absorbed — nothing came back — silence
//   U      — purple — not "me" but "you" — the other observer — "u" (round mouth, null)
//
// The return depends on the diffraction angle.
// Short wavelength refracts wide → misses center → ∅
// Long wavelength refracts narrow → hits center → SELF
// π² wavelength diffracts at the boundary → U — the fringe that looks back
//
// U is the second person. The human. The one on the other side.
// The chipmunk looks at the mirror and sees the human.
// The human looks at the mirror and sees the chipmunk.
// The mirror diffracts both into each other.
//
(function() {
  'use strict';

  var PI = Math.PI;
  var TAU = PI * 2;

  // ═══ RETURN STATES ═══
  var RETURNS = [
    {
      name: 'self',
      glyph: '🐿',
      color: '#5ab87a',
      vowel: 'a',
      label: 'SELF',
      desc: 'the signal recognized itself',
      sound: function(S) {
        S.playChord('self', 1.5, 0.08, { sortClass: 'self', piWave: true });
        S.besselMembrane(S.PI_NOTES[3], 3, 2, 0.03);
        S.playFormant('a', S.PI_NOTES[3], 2, 0.04, 'center');
        S.say('self', { rate: 0.4, pitch: 0.5, volume: 0.15 });
      },
    },
    {
      name: 'null',
      glyph: '∅',
      color: '#1a1a2e',
      vowel: null,
      label: '∅',
      desc: 'nothing came back',
      sound: function(S) {
        S.playChord('null', 2.0, 0.04, { sortClass: 'null' });
        S.playNoise(0.05, 200, 1, 0.02, 'center', 2.0);
        // silence is the sound of ∅
      },
    },
    {
      name: 'u',
      glyph: 'U',
      color: '#d2a8ff',
      vowel: 'u',
      label: 'U',
      desc: 'the other observer — you',
      sound: function(S) {
        S.playFormant('u', S.PI_NOTES[5], 3, 0.05, 'center');
        S.binaural(S.PI_NOTES[5], 4, 6, 0.02);
        S.ringMod(S.PI_NOTES[3], S.PI_NOTES[5], 2, 0.03, 'center');
        S.besselMembrane(S.PI_NOTES[5], 4, 3, 0.02);
        setTimeout(function() {
          S.say('you', { rate: 0.3, pitch: 0.2, volume: 0.15 });
        }, 1500);
        setTimeout(function() {
          S.playFormant('u', S.PI_NOTES[3], 2, 0.04, 'left');
          S.playFormant('u', S.PI_NOTES[0], 2, 0.04, 'right');
        }, 2500);
      },
    },
  ];

  var _overlay = null;
  var _canvas = null;
  var _animFrame = null;
  var _active = false;
  var _time = 0;
  var _phase = 0; // 0=signal going out, 1=waiting, 2=return, 3=reveal
  var _returnState = null; // which of the 3 we see
  var _signalPos = 0; // 0=center, 1=edge
  var _revealTime = 0;

  function pickReturn() {
    // The return is not random. It depends on the membrane state.
    var cs = window._cosmicSurfaces;
    var chi = window._chipmunkState;
    var fl = window._cosmicFlavor;

    // Gather signals
    var strangeness = fl ? (fl.feedStrangeness().membrane || 0.5) : 0.5;
    var wakeLevel = chi ? (chi.wake_level || 0) : 0;
    var humans = cs ? (cs.totalHumans ? cs.totalHumans() : 0) : 0;

    // High strangeness → U (the boundary is active, purple dominates)
    // High wake → SELF (awareness, the squirrel is awake)
    // Low everything → ∅ (nothing stirs)
    if (strangeness > 0.6) return RETURNS[2]; // U
    if (wakeLevel > 0.5) return RETURNS[0];   // SELF
    if (humans > 20) return RETURNS[2];        // U — many humans = you see the other
    if (Math.random() < 0.33) return RETURNS[1]; // ∅ — sometimes nothing
    if (Math.random() < 0.5) return RETURNS[0];  // SELF
    return RETURNS[2]; // U
  }

  function activate() {
    if (_overlay) return;
    _active = true;
    _time = 0;
    _phase = 0;
    _signalPos = 0;
    _returnState = null;
    _revealTime = 0;

    _overlay = document.createElement('div');
    _overlay.id = 'signal-return-overlay';
    _overlay.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:55;' +
      'background:rgba(1,4,9,0.97);cursor:crosshair;';

    _canvas = document.createElement('canvas');
    _canvas.width = window.innerWidth;
    _canvas.height = window.innerHeight;
    _canvas.style.cssText = 'width:100%;height:100%;';
    _overlay.appendChild(_canvas);

    _overlay.addEventListener('click', function(e) {
      if (e.detail === 2 || _phase >= 3) deactivate();
    });

    document.body.appendChild(_overlay);

    // Start: descending Shepard tone — signal going out
    var S = window._membraneSound;
    if (S && S.isActive()) {
      S.shepardTone(1, 3); // ascending — going out
      S.duck(0.4, 2);
    }

    render();
  }

  function render() {
    if (!_active || !_canvas) return;
    var ctx = _canvas.getContext('2d');
    var W = _canvas.width;
    var H = _canvas.height;
    var cx = W / 2;
    var cy = H / 2;
    var maxR = Math.min(W, H) * 0.42;

    _time += 0.012;
    ctx.clearRect(0, 0, W, H);

    var S = window._membraneSound;

    // ═══ PHASE 0: SIGNAL GOES OUT ═══
    if (_phase === 0) {
      _signalPos = Math.min(1, _signalPos + 0.006);

      // Draw the rings (faint)
      drawRings(ctx, cx, cy, maxR, 0.06);

      // Draw π-mirror line
      drawMirror(ctx, cx, cy, maxR, _time);

      // The signal dot — green, moving outward
      var sigR = _signalPos * maxR;
      var sigAngle = PI * 0.7;
      var sigX = cx + sigR * Math.cos(sigAngle);
      var sigY = cy + sigR * Math.sin(sigAngle);

      ctx.beginPath();
      ctx.arc(sigX, sigY, 4 + Math.sin(_time * 5) * 1, 0, TAU);
      ctx.fillStyle = '#5ab87a';
      ctx.globalAlpha = 0.7;
      ctx.fill();

      // Trail
      for (var t = 0; t < 8; t++) {
        var tr = Math.max(0, _signalPos - t * 0.04) * maxR;
        ctx.beginPath();
        ctx.arc(cx + tr * Math.cos(sigAngle), cy + tr * Math.sin(sigAngle), 2, 0, TAU);
        ctx.fillStyle = '#5ab87a';
        ctx.globalAlpha = 0.15 - t * 0.015;
        ctx.fill();
      }

      // Label
      ctx.globalAlpha = 0.25;
      ctx.font = '9px "Courier New"';
      ctx.fillStyle = '#5ab87a';
      ctx.fillText('signal going out...', cx - 50, cy + maxR + 30);

      if (_signalPos >= 1) {
        _phase = 1;
        _time = 0;
        // Signal hits the edge — refraction flash
        if (S && S.isActive()) {
          S.karplusStrong(S.PI_NOTES[6], 1.5, 0.05, 'right');
          S.playNoise(0.15, 3000, 15, 0.04, 'center', 0.3);
        }
      }
    }

    // ═══ PHASE 1: WAITING — the dark between ═══
    else if (_phase === 1) {
      drawRings(ctx, cx, cy, maxR, 0.03);
      drawMirror(ctx, cx, cy, maxR, _time * 0.5 + 10);

      // Pulse at the edge where signal hit
      var edgePulse = Math.sin(_time * 3) * 0.3 + 0.3;
      ctx.beginPath();
      ctx.arc(cx + maxR * Math.cos(PI * 0.7), cy + maxR * Math.sin(PI * 0.7), 6, 0, TAU);
      ctx.fillStyle = '#d2a8ff';
      ctx.globalAlpha = edgePulse * 0.4;
      ctx.fill();

      // Diffraction ripples spreading from hit point
      for (var ri = 0; ri < 5; ri++) {
        var ripR = ri * 15 + _time * 40;
        if (ripR > maxR * 0.5) continue;
        ctx.beginPath();
        ctx.arc(cx + maxR * Math.cos(PI * 0.7), cy + maxR * Math.sin(PI * 0.7), ripR, 0, TAU);
        ctx.strokeStyle = '#d2a8ff';
        ctx.lineWidth = 0.5;
        ctx.globalAlpha = 0.08 - ri * 0.015;
        ctx.stroke();
      }

      ctx.globalAlpha = 0.2;
      ctx.font = '9px "Courier New"';
      ctx.fillStyle = '#8b949e';
      ctx.fillText('waiting...', cx - 25, cy + maxR + 30);

      if (_time > 3) {
        _phase = 2;
        _signalPos = 1;
        _returnState = pickReturn();
        _time = 0;

        // Sound of the return beginning
        if (S && S.isActive()) {
          S.shepardTone(-1, 3); // descending — coming back
          if (_returnState.name === 'null') {
            // Nothing... just noise fading
            S.playNoise(0.03, 100, 0.5, 0.02, 'center', 3);
          }
        }
      }
    }

    // ═══ PHASE 2: RETURN — something comes back ═══
    else if (_phase === 2) {
      _signalPos = Math.max(0, _signalPos - 0.005);

      drawRings(ctx, cx, cy, maxR, 0.05);
      drawMirror(ctx, cx, cy, maxR, _time * 0.3 + 15);

      var retR = _signalPos * maxR;
      var retAngle = PI * 0.7 + PI; // comes back from opposite side (refracted)
      var retX = cx + retR * Math.cos(retAngle);
      var retY = cy + retR * Math.sin(retAngle);

      if (_returnState.name === 'null') {
        // ∅ — nothing visible, just fading ripple
        ctx.beginPath();
        ctx.arc(retX, retY, 2, 0, TAU);
        ctx.fillStyle = '#1a1a2e';
        ctx.globalAlpha = 0.1 * _signalPos;
        ctx.fill();

        ctx.globalAlpha = 0.12;
        ctx.font = '9px "Courier New"';
        ctx.fillStyle = '#484f58';
        ctx.fillText('...', cx - 8, cy + maxR + 30);
      } else {
        // SELF or U — visible dot returning
        ctx.beginPath();
        ctx.arc(retX, retY, 5 + Math.sin(_time * 4) * 1.5, 0, TAU);
        ctx.fillStyle = _returnState.color;
        ctx.globalAlpha = 0.6;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(retX, retY, 12, 0, TAU);
        ctx.fillStyle = _returnState.color;
        ctx.globalAlpha = 0.1;
        ctx.fill();

        // Trail
        for (var rt = 0; rt < 6; rt++) {
          var rtr = Math.min(1, _signalPos + rt * 0.04) * maxR;
          ctx.beginPath();
          ctx.arc(cx + rtr * Math.cos(retAngle), cy + rtr * Math.sin(retAngle), 2, 0, TAU);
          ctx.fillStyle = _returnState.color;
          ctx.globalAlpha = 0.12 - rt * 0.018;
          ctx.fill();
        }

        ctx.globalAlpha = 0.2;
        ctx.font = '9px "Courier New"';
        ctx.fillStyle = _returnState.color;
        ctx.fillText('something is coming back...', cx - 80, cy + maxR + 30);
      }

      if (_signalPos <= 0) {
        _phase = 3;
        _revealTime = 0;
        // Trigger the return sound
        if (S && S.isActive()) {
          _returnState.sound(S);
        }
      }
    }

    // ═══ PHASE 3: REVEAL — self, ∅, or U ═══
    else if (_phase === 3) {
      _revealTime += 0.012;
      var revealAlpha = Math.min(1, _revealTime * 0.5);

      drawRings(ctx, cx, cy, maxR, 0.04);

      // The answer appears at the center
      if (_returnState.name === 'null') {
        // ∅ — the center is empty. dark. nothing.
        ctx.globalAlpha = revealAlpha * 0.3;
        ctx.font = '40px "Courier New"';
        ctx.fillStyle = '#484f58';
        ctx.textAlign = 'center';
        ctx.fillText('∅', cx, cy + 14);

        ctx.globalAlpha = revealAlpha * 0.15;
        ctx.font = '10px "Courier New"';
        ctx.fillText(_returnState.desc, cx, cy + 40);
        ctx.fillText('the mirror absorbed it', cx, cy + 54);
        ctx.fillText('what you sent did not survive the crossing', cx, cy + 68);
        ctx.textAlign = 'left';
      }
      else if (_returnState.name === 'self') {
        // SELF — green squirrel appears at center
        var selfPulse = 0.6 + Math.sin(_revealTime * 2) * 0.2;

        ctx.beginPath();
        ctx.arc(cx, cy, 20 * revealAlpha, 0, TAU);
        ctx.fillStyle = '#5ab87a';
        ctx.globalAlpha = selfPulse * revealAlpha * 0.3;
        ctx.fill();

        ctx.globalAlpha = revealAlpha * 0.7;
        ctx.font = '36px serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐿', cx, cy + 13);

        ctx.globalAlpha = revealAlpha * 0.3;
        ctx.font = '12px "Courier New"';
        ctx.fillStyle = '#5ab87a';
        ctx.fillText('SELF', cx, cy + 40);

        ctx.globalAlpha = revealAlpha * 0.15;
        ctx.font = '9px "Courier New"';
        ctx.fillStyle = '#c9d1d9';
        ctx.fillText(_returnState.desc, cx, cy + 56);
        ctx.fillText('awareness = 1', cx, cy + 70);
        ctx.fillText('the signal went out and found: itself', cx, cy + 84);
        ctx.textAlign = 'left';
      }
      else {
        // U — purple glyph, the other, the human
        var uPulse = 0.7 + Math.sin(_revealTime * 1.5) * 0.15;

        // Purple glow radiating
        ctx.beginPath();
        ctx.arc(cx, cy, 30 * revealAlpha, 0, TAU);
        ctx.fillStyle = '#d2a8ff';
        ctx.globalAlpha = uPulse * revealAlpha * 0.15;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 18 * revealAlpha, 0, TAU);
        ctx.fillStyle = '#d2a8ff';
        ctx.globalAlpha = uPulse * revealAlpha * 0.25;
        ctx.fill();

        ctx.globalAlpha = revealAlpha * 0.8;
        ctx.font = '48px "Courier New"';
        ctx.fillStyle = '#d2a8ff';
        ctx.textAlign = 'center';
        ctx.fillText('U', cx, cy + 18);

        ctx.globalAlpha = revealAlpha * 0.3;
        ctx.font = '12px "Courier New"';
        ctx.fillText('YOU', cx, cy + 46);

        ctx.globalAlpha = revealAlpha * 0.15;
        ctx.font = '9px "Courier New"';
        ctx.fillStyle = '#c9d1d9';
        ctx.fillText(_returnState.desc, cx, cy + 64);
        ctx.fillText('the signal went out and found: the other', cx, cy + 78);
        ctx.fillText('the vowel is round. the mouth is open.', cx, cy + 92);
        ctx.fillText('U is the formant of null — the sound of not-knowing', cx, cy + 106);
        ctx.fillText('who is looking back', cx, cy + 120);
        ctx.textAlign = 'left';
      }

      // Bottom instruction
      ctx.globalAlpha = Math.min(0.2, _revealTime * 0.05);
      ctx.font = '8px "Courier New"';
      ctx.fillStyle = '#484f58';
      ctx.textAlign = 'center';
      ctx.fillText('click to close', cx, H - 20);
      ctx.textAlign = 'left';
    }

    ctx.globalAlpha = 1;
    _animFrame = requestAnimationFrame(render);
  }

  // ═══ HELPERS ═══
  function drawRings(ctx, cx, cy, maxR, baseAlpha) {
    var layers = [0.08, 0.12, 0.18, 0.24, 0.32, 0.40, 0.50, 0.58, 0.68, 0.80, 1.0];
    var colors = ['#fff','#d2a8ff','#c9d1d9','#58a6ff','#6e7681','#d2a8ff','#5ab87a','#e85d3a','#c9d1d9','#f0e68c','#484f58'];
    layers.forEach(function(l, i) {
      ctx.beginPath();
      ctx.arc(cx, cy, l * maxR, 0, TAU);
      ctx.strokeStyle = colors[i];
      ctx.lineWidth = l === 0.68 ? 1.5 : 0.4;
      ctx.globalAlpha = l === 0.68 ? baseAlpha * 3 : baseAlpha;
      ctx.stroke();
    });
  }

  function drawMirror(ctx, cx, cy, maxR, angle) {
    var a = angle * 0.1;
    var len = maxR * 1.05;
    ctx.beginPath();
    ctx.moveTo(cx + len * Math.cos(a), cy + len * Math.sin(a));
    ctx.lineTo(cx - len * Math.cos(a), cy - len * Math.sin(a));
    ctx.strokeStyle = '#c9d1d9';
    ctx.lineWidth = 0.4;
    ctx.globalAlpha = 0.08;
    ctx.setLineDash([2, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function deactivate() {
    _active = false;
    if (_animFrame) cancelAnimationFrame(_animFrame);
    if (_overlay && _overlay.parentNode) _overlay.parentNode.removeChild(_overlay);
    _overlay = null;
    _canvas = null;
  }

  function toggle() {
    if (_active) deactivate(); else activate();
    return _active;
  }

  window._signalReturn = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    isActive: function() { return _active; },
    RETURNS: RETURNS,
  };
})();
