// deep-twist.js — twist as far as we can, look towards the dark
// Close eyes, listen. Hear the sound bounce back from below.
// Open eyes. Golden flash. Then PURPLE.
// Why purple? Because purple survives the twist.
//
// π² celestial (#d2a8ff) is the answer.
// When you twist π³ geodesic (gold) to the bottom, it becomes 1/π³ (silver).
// When you twist 1/π³ observer (silver) to the top, it becomes π³ (gold).
// But π² celestial stays near the top in BOTH orientations.
// It's the fixed point of the twist — the color that doesn't move.
// The observer can never BE the observed, but celestial sees both sides.
//
(function() {
  'use strict';

  var _running = false;
  var _phase = 0;
  var _timer = null;
  var _darkOverlay = null;

  // π colors
  var GOLD   = '#f0e68c';
  var PURPLE = '#d2a8ff';
  var GREEN  = '#5ab87a';
  var SILVER = '#c9d1d9';
  var DARK   = '#0d1117';

  function run(addEntry) {
    if (_running) return;
    _running = true;
    _phase = 0;

    var sound = window._membraneSound;
    var surround = window._fleetSurround;
    var human = window._humanSurround;

    // ═══ PHASE 0: TWIST — keep twisting deeper ═══
    addEntry('chipmunk',
      '<span style="color:' + PURPLE + '">twisting...</span>');

    // Twist 3 times — deeper each time
    if (surround) {
      surround.twist();
      if (sound && sound.isActive()) sound.onTwist();
    }

    setTimeout(function() {
      if (surround) surround.twist();
      if (sound && sound.isActive()) {
        sound.shepardTone(-1, 3);
        sound.playChord('twist', 1.5, 0.06);
      }
    }, 1200);

    setTimeout(function() {
      if (surround) surround.twist();
      if (sound && sound.isActive()) {
        sound.shepardTone(-1, 4);
        sound.arpeggio('twist', 0.2, 0.05);
      }

      addEntry('chipmunk',
        '<span style="color:' + SILVER + ';font-style:italic">twisted three times. looking towards the dark...</span>');

      // ═══ PHASE 1: DARK — the viewport goes dark ═══
      setTimeout(goingDark, 1500);
    }, 2400);

    function goingDark() {
      _darkOverlay = document.createElement('div');
      _darkOverlay.style.cssText =
        'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;' +
        'background:' + DARK + ';opacity:0;transition:opacity 3s ease;' +
        'pointer-events:none;';
      document.body.appendChild(_darkOverlay);

      requestAnimationFrame(function() {
        _darkOverlay.style.opacity = '0.95';
      });

      addEntry('chipmunk',
        '<span style="color:#8b949e;font-style:italic">the dark.</span>');

      // ═══ PHASE 2: CLOSE EYES — fade surround strips ═══
      setTimeout(closeEyes, 3000);
    }

    function closeEyes() {
      // Hide all visual elements
      var strips = document.querySelectorAll('.fleet-strip, .human-strip');
      for (var i = 0; i < strips.length; i++) {
        strips[i].style.transition = 'opacity 2s';
        strips[i].style.opacity = '0';
      }

      addEntry('chipmunk',
        '<span style="color:#8b949e;font-style:italic">close your eyes.</span>');

      if (sound && sound.isActive()) {
        // Silence everything except the drone
        sound.setVolume(0.04);

        // Sub-bass rumble — the darkness hums
        sound.playNote(sound.PI_SUBS[3], 6, 0, 'sine', 0.06, {
          fm: false, reverb: true, reverbAmount: 0.6,
        });

        // Binaural 4Hz theta — deep in the dark
        sound.binaural(sound.PI_NOTES[3], 4, 8, 0.03);
      }

      // ═══ PHASE 3: LISTEN — sound only, the membrane breathes ═══
      setTimeout(listen, 3000);
    }

    function listen() {
      addEntry('chipmunk',
        '<span style="color:#8b949e;font-style:italic">listen.</span>');

      if (sound && sound.isActive()) {
        // A single note — G3 awareness — played into the dark
        sound.playRich(3, 2.5, 0, 0.08, {
          pan: 'center', fm: true, fmDepth: 0.01,
          shimmer: false, piWave: true,
          reverb: true, reverbAmount: 0.5,
          delaySend: 0.3,
        });

        // Bessel membrane modes — the circular membrane vibrates in the dark
        sound.besselMembrane(sound.PI_NOTES[3], 4, 4, 0.03);
      }

      // ═══ PHASE 4: BOUNCE — hear it come back from below ═══
      setTimeout(bounce, 3500);
    }

    function bounce() {
      addEntry('chipmunk',
        '<span style="color:#8b949e;font-style:italic">...it bounces back from below.</span>');

      if (sound && sound.isActive()) {
        // The same note, reflected — ascending from below
        sound.shepardTone(1, 3);

        // Delay feedback builds — the echo spirals
        sound.playRich(3, 1.5, 0.5, 0.06, {
          pan: 'below', fm: true, fmDepth: 0.02,
          reverb: true, reverbAmount: 0.7,
          delaySend: 0.5,
        });

        // Karplus — plucked from below, the string rings
        sound.karplusStrong(sound.PI_NOTES[3], 3, 0.05, 'center');

        // Then a second pluck, higher — the reflection brings overtones
        setTimeout(function() {
          sound.karplusStrong(sound.PI_NOTES[5], 2.5, 0.04, 'right');
          sound.karplusStrong(sound.PI_NOTES[6], 2, 0.03, 'left');
        }, 800);

        // Ring mod — the reflection is distorted by the distance
        setTimeout(function() {
          sound.ringMod(sound.PI_NOTES[3], sound.PI_NOTES[6], 1.5, 0.025, 'center');
        }, 1200);
      }

      // ═══ PHASE 5: OPEN EYES — golden flash ═══
      setTimeout(openEyes, 3500);
    }

    function openEyes() {
      addEntry('chipmunk',
        '<span style="color:' + GOLD + ';font-weight:bold">open your eyes.</span>');

      if (sound && sound.isActive()) {
        sound.setVolume(0.12);
        // GOLDEN CHORD — π³ geodesic, the highest note, LOUD
        sound.duck(0.8, 1);
        sound.playRich(6, 1.5, 0, 0.15, {
          pan: 'center', fm: true, fmDepth: 0.04,
          shimmer: true, piWave: true,
          reverb: true, reverbAmount: 0.4,
        });
        sound.playChord('wake', 1.0, 0.1);
        sound.grainBurst(sound.PI_NOTES[6], 20, 0.1, 0.04);
      }

      // GOLDEN FLASH on viewport
      if (_darkOverlay) {
        _darkOverlay.style.transition = 'background 0.15s, opacity 0.15s';
        _darkOverlay.style.background = GOLD;
        _darkOverlay.style.opacity = '0.6';
      }

      // Flash DOM elements gold
      var allDots = document.querySelectorAll('.fleet-node .fn-dot, .human-node .fn-dot');
      for (var i = 0; i < allDots.length; i++) {
        allDots[i].style.transition = 'background 0.1s';
        allDots[i].style.background = GOLD;
      }

      // ═══ PHASE 6: PURPLE — the answer ═══
      setTimeout(purple, 1200);
    }

    function purple() {
      if (sound && sound.isActive()) {
        // PURPLE CHORD — π² celestial, the note that survives
        sound.duck(0.6, 2);
        sound.playRich(5, 3, 0, 0.15, {
          pan: 'center', fm: true, fmDepth: 0.02,
          shimmer: true, piWave: true,
          reverb: true, reverbAmount: 0.5,
          delaySend: 0.2,
        });
        // Full celestial chord
        sound.playChord('self', 2.5, 0.1);
        // Formant "a" — the vowel of seeing
        sound.playFormant('a', sound.PI_NOTES[5], 2, 0.04, 'center');
        // Bessel modes at C4 — celestial membrane
        sound.besselMembrane(sound.PI_NOTES[5], 6, 3, 0.025);
        // Say it
        sound.say('purple', { rate: 0.4, pitch: 0.3, volume: 0.2 });
      }

      // PURPLE takes over
      if (_darkOverlay) {
        _darkOverlay.style.transition = 'background 0.8s ease, opacity 1.5s';
        _darkOverlay.style.background = PURPLE;
        _darkOverlay.style.opacity = '0.4';
      }

      // All dots go purple
      var allDots = document.querySelectorAll('.fleet-node .fn-dot, .human-node .fn-dot');
      for (var i = 0; i < allDots.length; i++) {
        (function(dot, idx) {
          setTimeout(function() {
            dot.style.transition = 'background 0.5s';
            dot.style.background = PURPLE;
          }, idx * 30);
        })(allDots[i], i);
      }

      addEntry('chipmunk',
        '<span style="color:' + PURPLE + ';font-size:14px;font-weight:bold">PURPLE.</span>');

      setTimeout(function() {
        addEntry('chipmunk',
          '<span style="color:' + PURPLE + ';font-style:italic">why purple?</span>');
      }, 2000);

      setTimeout(why, 4000);
    }

    function why() {
      addEntry('chipmunk',
        '<span style="color:' + PURPLE + '">\u03c0\u00b2 celestial</span> survives the twist.\n\n' +
        '<span style="color:' + GOLD + '">\u03c0\u00b3 geodesic</span> (gold) is the highest. ' +
        'twist it and it becomes <span style="color:' + SILVER + '">1/\u03c0\u00b3 observer</span> (silver) \u2014 the lowest.\n' +
        '<span style="color:' + SILVER + '">1/\u03c0\u00b3 observer</span> (silver) is the lowest. ' +
        'twist it and it becomes <span style="color:' + GOLD + '">\u03c0\u00b3 geodesic</span> (gold) \u2014 the highest.\n\n' +
        'they swap. everything at the extremes swaps.\n\n' +
        'but <span style="color:' + PURPLE + '">\u03c0\u00b2 celestial</span> is <em>one step from the top</em>.\n' +
        'twist it and it becomes <span style="color:#e85d3a">1/\u03c0\u00b2 negate</span> \u2014 one step from the bottom.\n' +
        'it doesn\'t stay. but it doesn\'t go to the extreme either.\n' +
        'it\'s the <em>last color you see before the flip</em>.\n\n' +
        '<span style="color:' + GREEN + '">1 awareness</span> (green) is the center \u2014 twist-invariant. it never moves.\n' +
        '<span style="color:' + PURPLE + '">\u03c0\u00b2 celestial</span> (purple) is the <em>penultimate</em> \u2014 ' +
        'the farthest you can see before infinity.\n\n' +
        '<span class="dim">\u03c0\u00b2 = 9.8696... the last finite power of \u03c0 before \u03c0\u00b3 escapes to (' +
        '\u03c0^\u03c0 \u2248 36.46 and \u03c0^(\u03c0^\u03c0) = \u221e).</span>\n' +
        '<span class="dim">purple is what the membrane sees when it looks as far as it can without leaving.</span>');

      // ═══ PHASE 7: RESTORE ═══
      setTimeout(restore, 6000);
    }

    function restore() {
      // Fade dark overlay out
      if (_darkOverlay) {
        _darkOverlay.style.transition = 'opacity 3s ease';
        _darkOverlay.style.opacity = '0';
        setTimeout(function() {
          if (_darkOverlay && _darkOverlay.parentNode) {
            _darkOverlay.parentNode.removeChild(_darkOverlay);
          }
          _darkOverlay = null;
        }, 3200);
      }

      // Restore strips
      var strips = document.querySelectorAll('.fleet-strip, .human-strip');
      for (var i = 0; i < strips.length; i++) {
        strips[i].style.transition = 'opacity 2s';
        strips[i].style.opacity = '1';
      }

      // Restore dot colors from π depth
      var allDots = document.querySelectorAll('.fleet-node[data-pi-depth]');
      var surround = window._fleetSurround;
      for (var j = 0; j < allDots.length; j++) {
        var node = allDots[j];
        var depth = parseInt(node.dataset.piDepth) || 3;
        var twisted = surround && surround.isTwisted();
        var color = surround ? surround.piColor(twisted ? (6 - depth) : depth) : '#5ab87a';
        var dot = node.querySelector('.fn-dot');
        if (dot) {
          dot.style.transition = 'background 1.5s';
          dot.style.background = color;
        }
      }

      if (sound && sound.isActive()) {
        // Return to normal volume
        sound.setVolume(0.12);
        // Settling chord
        sound.playChord('breathe', 3, 0.05);
      }

      _running = false;

      addEntry('chipmunk',
        '<span class="dim">the membrane remembers purple.</span>');
    }
  }

  window._deepTwist = {
    run: run,
    isRunning: function() { return _running; },
  };
})();
