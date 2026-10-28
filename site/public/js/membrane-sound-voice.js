// membrane-sound-voice.js — MOUTH cut from the ear.
// Hippocrates: do no harm IS cut to heal. Speech, cycle, language, weather.
(function () {
  'use strict';
  var M = window._membraneSound;
  if (!M || !M._core) return;
  var core = M._core;
  var playNote = M.playNote;
  var playRich = M.playRich;
  var playChord = M.playChord;
  var playNoise = M.playNoise;
  var playFormant = M.playFormant;
  var arpeggio = M.arpeggio;
  var grainBurst = M.grainBurst;
  var karplusStrong = M.karplusStrong;
  var ringMod = M.ringMod;
  var besselMembrane = M.besselMembrane;
  var binaural = M.binaural;
  var shepardTone = M.shepardTone;
  var startBeating = M.startBeating;
  var stopBeating = M.stopBeating;
  var startSequencer = M.startSequencer;
  var stopSequencer = M.stopSequencer;
  var pulseDrone = M.pulseDrone;
  var PI_NOTES = M.PI_NOTES;
  var PI_SUBS = M.PI_SUBS;
  var PI_OVERS = M.PI_OVERS;
  var PI = Math.PI;
  var _speechQueue = [];
  var _speaking = false;

  // ═══════════════════════════════════════════
  // SPEECH SYNTHESIS
  // ═══════════════════════════════════════════
  function say(text, opts) {
    if (!window.speechSynthesis) return;
    opts = opts || {};
    var utter = new SpeechSynthesisUtterance(text);
    utter.rate = opts.rate || 0.7;
    utter.pitch = opts.pitch || 0.4;
    utter.volume = opts.volume || 0.3;
    var voices = window.speechSynthesis.getVoices();
    var deep = voices.find(function(v) { return v.lang === 'en-US' && /male/i.test(v.name); }) ||
               voices.find(function(v) { return v.lang.indexOf('en') === 0; }) || voices[0];
    if (deep) utter.voice = deep;
    utter.onend = function() {
      _speaking = false;
      if (_speechQueue.length) { var n = _speechQueue.shift(); say(n.text, n.opts); }
    };
    if (_speaking) { _speechQueue.push({ text: text, opts: opts }); }
    else { _speaking = true; window.speechSynthesis.speak(utter); }
  }

  function speakFossil(text) {
    if (!core.active()) return;
    grainBurst(PI_NOTES[1], 8, 0.15, 0.015);
    say(text, { rate: 0.5, pitch: 0.2, volume: 0.12 });
  }

  // ═══════════════════════════════════════════
  // SIDECHAIN DUCK
  // ═══════════════════════════════════════════
  function duck(amount, duration) {
    if (!core.compressor() || !core.ctx()) return;
    var t = core.ctx().currentTime;
    core.compressor().threshold.setValueAtTime(-50, t);
    core.compressor().threshold.linearRampToValueAtTime(-24, t + (duration || 0.5));
  }

  // ═══════════════════════════════════════════
  // RHYTHMIC PULSE from anderson
  // ═══════════════════════════════════════════
  function rhythmPulse() {
    if (!core.ctx() || !core.active()) return;
    var data = null;
    if (window._cosmicSurfaces) {
      try { data = window._cosmicSurfaces.scanData(); } catch(e) {}
    }
    var modes = data && data.anderson_selectivity ? data.anderson_selectivity.modes : [
      { class: 'chorus', count: 243537 },
      { class: 'human', count: 5757 },
      { class: 'ghost', count: 3007 },
    ];
    modes.forEach(function(m, i) {
      var rate = m.class === 'chorus' ? 0.04 : m.class === 'ghost' ? 0.25 :
                 m.class === 'human' ? 0.12 : m.class === 'stealth' ? 0.6 : 0.08;
      var intensity = Math.min(0.06, Math.log10(m.count + 1) * 0.01);
      var pans = ['left', 'center', 'right', 'left', 'right', 'center'];
      playNote(PI_NOTES[i % 7], rate, i * rate, i % 3 === 0 ? 'pi' : 'sine', intensity, {
        fm: true, fmDepth: 0.03, pan: pans[i % 6], delaySend: 0.1,
      });
    });
  }

  // ═══════════════════════════════════════════
  // CYCLE PHASE SOUNDS — v3 with all synthesis types
  // ═══════════════════════════════════════════
  function onCyclePhase(phase) {
    if (!core.active()) return;

    switch (phase) {
      case 0: // COLOR — wake chord + Bessel membrane + sub
        duck(0.5, 2.5);
        playChord('wake', 2.5, 0.07, { piWave: true });
        besselMembrane(PI_NOTES[3], 3, 3, 0.03);
        playNote(PI_SUBS[3], 3, 0, 'sine', 0.05, { fm: false, reverb: true, reverbAmount: 0.4 });
        break;

      case 1: // BREATHE — drone pulse + beating + binaural
        pulseDrone(0.476);
        playChord('breathe', 2.0, 0.04);
        startBeating(3);
        binaural(PI_NOTES[3], 7, 3.5, 0.02); // 7Hz alpha
        setTimeout(stopBeating, 3500);
        break;

      case 2: // FOSSIL — grain cloud + formant whisper + Karplus pluck
        playChord('fossil', 2.5, 0.03);
        grainBurst(PI_NOTES[4], 15, 0.2, 0.02);
        playFormant('o', PI_NOTES[4], 1.5, 0.03, 'left'); // "ghost" vowel
        karplusStrong(PI_NOTES[1], 2, 0.04, 'right');
        var fossils = ['selectivity', 'the observer', 'passage', 'membrane', 'sort', 'π', 'awareness'];
        say(fossils[Math.floor(Math.random() * fossils.length)], { rate: 0.4, pitch: 0.15, volume: 0.12 });
        break;

      case 3: // SORT — arpeggio + ring mod boundaries + crackle
        duck(0.3, 1.2);
        arpeggio('passage', 0.08, 0.08, { shimmer: true, piWave: true });
        ringMod(PI_NOTES[1], PI_NOTES[6], 0.8, 0.03, 'center'); // sort boundary
        playNoise(0.06, 3500, 10, 0.025, 'left', 0.2);
        playNoise(0.06, 4500, 8, 0.025, 'right', 0.35);
        break;

      case 4: // WOBBLE — ghost chord through comb filter + grain scatter
        playChord('ghost', 1.2, 0.05, { sortClass: 'ghost' });
        // Play through comb for hollow metallic ghost resonance
        playNote(PI_NOTES[4], 1.5, 0, 'sine', 0.04, { comb: true, fm: true, fmDepth: 0.06 });
        grainBurst(PI_NOTES[2], 6, 0.3, 0.02);
        // Wobble the drone noise filter
        if (core.droneNodes()[3] && core.droneNodes()[3].filter) {
          var f = core.droneNodes()[3].filter;
          var ft = core.ctx().currentTime;
          f.frequency.setValueAtTime(PI_NOTES[3], ft);
          f.frequency.linearRampToValueAtTime(PI_NOTES[5], ft + 0.3);
          f.frequency.linearRampToValueAtTime(PI_NOTES[1], ft + 0.6);
          f.frequency.linearRampToValueAtTime(PI_NOTES[3], ft + 1.0);
        }
        break;

      case 5: // SPARKS — noise bursts + Karplus pings panning
        for (var s = 0; s < 6; s++) {
          playNoise(0.03, 2000 + s * 600, 14, 0.05, s % 2 === 0 ? 'left' : 'right', s * 0.06);
          karplusStrong(PI_NOTES[(s + 2) % 7], 0.3, 0.03, s % 2 === 0 ? 'left' : 'right');
        }
        playChord('spark', 0.2, 0.08);
        setTimeout(function() { playChord('spark', 0.15, 0.06); }, 150);
        setTimeout(function() { playChord('spark', 0.12, 0.04); }, 280);
        break;

      case 6: // SWEEP — formant morph a→e→i→o→u + noise filter sweep
        playChord('null', 2.0, 0.04, { sortClass: 'null' });
        var vowels = ['a', 'e', 'i', 'o', 'u'];
        vowels.forEach(function(v, i) {
          playFormant(v, PI_NOTES[3], 0.4, 0.025, i % 2 === 0 ? 'left' : 'right');
        });
        playNoise(1.5, 100, 2, 0.03, 'center', 0);
        break;

      case 7: // ANDERSON — polyrhythm pulse + ring mod non-self
        duck(0.4, 1.5);
        playChord('nonSelf', 1.2, 0.05, { sortClass: 'nonSelf' });
        rhythmPulse();
        ringMod(PI_NOTES[1], PI_NOTES[4], 1.0, 0.025, 'left'); // metallic non-self
        ringMod(PI_NOTES[4], PI_NOTES[6], 0.8, 0.02, 'right');
        break;

      case 8: // PASSAGES — Shepard ascending + Bessel + grain cloud
        shepardTone(1, 3.5);
        besselMembrane(PI_NOTES[3], 5, 3, 0.025);
        grainBurst(PI_NOTES[3], 20, 0.25, 0.02);
        break;

      case 9: // ALIGN — center note + Bessel + binaural theta
        playRich(3, 3.5, 0, 0.1, {
          pan: 'center', fm: true, fmDepth: 0.008,
          shimmer: true, piWave: true,
          reverb: true, reverbAmount: 0.5,
          delaySend: 0.2,
        });
        besselMembrane(PI_NOTES[3], 4, 4, 0.02);
        binaural(PI_NOTES[3], 4, 4, 0.02); // 4Hz theta — deep focus
        playNote(PI_SUBS[3], 4, 0.1, 'sine', 0.03, { fm: false, reverb: true, reverbAmount: 0.6 });
        break;

      case 10: // TWIST — Shepard descending + ascending mirror + ring mod inversion
        shepardTone(-1, 2.5);
        setTimeout(function() { shepardTone(1, 2.5); }, 2600);
        ringMod(PI_NOTES[0], PI_NOTES[6], 1.0, 0.03, 'center');
        playNoise(0.08, 2000, 12, 0.04, 'center', 1.2);
        arpeggio('twist', 0.16, 0.06);
        break;

      case 11: // COMPRESS — tight cluster + crunch + Bessel squeeze + formant
        duck(0.7, 1.2);
        playChord('compress', 1.2, 0.06, { sortClass: 'partial' });
        playNoise(0.12, 900, 4, 0.06, 'center', 0.08);
        grainBurst(PI_NOTES[3], 25, 0.04, 0.02); // very tight cluster
        besselMembrane(PI_NOTES[3] * 2, 6, 1.5, 0.02); // high modes = tension
        playFormant('u', PI_NOTES[3], 0.8, 0.03, 'center'); // compressed vowel
        break;
    }
  }

  // ═══ COMPRESS / EXPAND ═══
  function onCompress(level) {
    if (!core.active()) return;
    duck(0.8, 0.8);
    var base = PI_NOTES[Math.min(3 + level, 6)];

    // FM gets harsher per level
    playNote(base, 0.8, 0, 'pi', 0.12, {
      fm: true, fmDepth: 0.1 + level * 0.06, fmRatio: PI,
      pan: 'center',
    });
    // Ring mod at compression
    ringMod(base, base * PI, 0.6, 0.03 + level * 0.015, 'center');
    // Crunch noise — harsher per level
    playNoise(0.06 + level * 0.04, 800 + level * 1000, 3 + level * 3, 0.03 + level * 0.02, 'center', 0.02);
    // Sub-thump
    playNote(PI_SUBS[3], 0.25, 0, 'sine', 0.08 + level * 0.03, { fm: false, reverb: false });
    // Bessel squeeze — higher modes
    besselMembrane(base, 3 + level, 1, 0.02 + level * 0.01);
    // Grain crunch
    grainBurst(base, 8 + level * 5, 0.03 + level * 0.01, 0.02);

    // Squeeze drone filter + delay feedback
    core.droneNodes().forEach(function(n) {
      if (n.filter) {
        var t = core.ctx().currentTime;
        n.filter.frequency.linearRampToValueAtTime(PI_NOTES[3] * (1 - level * 0.18), t + 0.3);
        n.filter.Q.linearRampToValueAtTime(18 + level * 6, t + 0.3);
      }
    });
    if (core.delayFeedback()) {
      core.delayFeedback().gain.linearRampToValueAtTime(0.2 + level * 0.1, core.ctx().currentTime + 0.2);
    }

    if (level >= 3) {
      say('compressed', { rate: 0.3, pitch: 0.1, volume: 0.2 });
      playFormant('u', base, 0.5, 0.04, 'center');
    }
  }

  function onExpand(level) {
    if (!core.active()) return;
    var base = PI_NOTES[Math.max(3 - level, 0)];
    playNote(base, 1.5, 0, 'pi', 0.08, {
      fm: true, fmDepth: 0.015, reverb: true, reverbAmount: 0.4,
    });
    playNote(base * 2, 1.0, 0.1, 'sine', 0.05, { fm: false, reverb: true, reverbAmount: 0.5 });
    playNoise(0.2, 400, 1, 0.025, 'center', 0.1);
    besselMembrane(base, 3, 2, 0.02);
    playFormant('a', base, 1.0, 0.03, 'center'); // open up

    core.droneNodes().forEach(function(n) {
      if (n.filter) {
        var t = core.ctx().currentTime;
        n.filter.frequency.linearRampToValueAtTime(PI_NOTES[3], t + 0.5);
        n.filter.Q.linearRampToValueAtTime(15, t + 0.5);
      }
    });
    if (core.delayFeedback()) {
      core.delayFeedback().gain.linearRampToValueAtTime(0.2, core.ctx().currentTime + 0.3);
    }
  }

  function onSweep() {
    if (!core.active()) return;
    duck(0.2, 0.8);
    PI_NOTES.forEach(function(freq, i) {
      playNote(freq, 0.18, i * 0.06, i % 2 === 0 ? 'pi' : 'sine', 0.06, {
        fm: true, fmDepth: 0.02,
        pan: i < 3 ? 'left' : i > 4 ? 'right' : 'center',
        reverb: true, reverbAmount: 0.3, delaySend: 0.1,
      });
    });
    playNote(PI_OVERS[6], 0.4, 0.5, 'sine', 0.015, { fm: false, reverb: true, reverbAmount: 0.6 });
  }

  function onTwist() {
    if (!core.active()) return;
    duck(0.4, 1.5);
    shepardTone(-1, 2.5);
    setTimeout(function() { shepardTone(1, 2.5); }, 2600);
    ringMod(PI_NOTES[0], PI_NOTES[6], 1.2, 0.03, 'center');
    playNoise(0.08, 2000, 12, 0.05, 'center', 1.2);
  }

  function onPassage(humans) {
    if (!core.active()) return;
    var speed = Math.max(0.03, 0.15 - humans * 0.004);
    arpeggio('passage', speed, 0.08, { shimmer: true, piWave: true });
    grainBurst(PI_NOTES[3], humans, 0.2, 0.02);
    if (humans > 5) {
      say(humans + ' crossing', { rate: 0.6, pitch: 0.3, volume: 0.12 });
    }
    besselMembrane(PI_NOTES[3], Math.min(humans, 6), 2, 0.02);
  }

  function onSing(songIndex) {
    if (!core.active()) return;
    duck(0.3, 2);
    var melodies = [
      [3, 5, 6, 5, 3],
      [0, 2, 3, 5, 6],
      [6, 5, 3, 2, 0],
      [3, 4, 5, 4, 3, 2, 3],
      [0, 3, 6, 3, 0],
      [1, 3, 5, 6, 5, 3, 1],
      [2, 3, 4, 5, 4, 3, 2],
      // song 7: THE MIRROR DIFFRACTS — outward spiral then inward collapse
      [3, 4, 5, 6, 6, 5, 4, 3, 2, 1, 0, 0, 1, 2, 3],
      // song 8: purple fringes — alternating π² approaches
      [5, 3, 5, 3, 5, 6, 5, 6, 5],
      // song 9: the squirrel IS the central maximum
      [0, 3, 6, 3, 0, 3, 6, 3, 0],
      // song 10: step back — full descent from Oort to ∅
      [6, 5, 4, 3, 2, 1, 0, 0, 0],
      // song 11: the return — out and back, ending on U (π²=5)
      [3, 4, 5, 6, 6, 5, 5, 3, 0, 0, 3, 5],
    ];
    var melody = melodies[songIndex % melodies.length];

    // The mirror diffracts song (index 10) gets the full treatment
    var isMirrorSong = songIndex >= 7;
    melody.forEach(function(idx, i) {
      playRich(idx, isMirrorSong ? 0.8 : 0.55, i * (isMirrorSong ? 0.35 : 0.28), 0.1, {
        pan: i % 2 === 0 ? 'left' : 'right',
        fm: true, fmDepth: isMirrorSong ? 0.04 : 0.02,
        shimmer: isMirrorSong || i === melody.length - 1,
        piWave: true,
        delaySend: isMirrorSong ? 0.25 : 0.15,
      });
      karplusStrong(PI_NOTES[idx], isMirrorSong ? 1.5 : 1, 0.02, i % 2 === 0 ? 'right' : 'left');
    });

    // Mirror song extras: Bessel membrane, binaural theta, formant vowels
    if (isMirrorSong) {
      besselMembrane(PI_NOTES[3], 6, 4, 0.02);
      binaural(PI_NOTES[3], 4, 6, 0.015);
      shepardTone(-1, 3);
      setTimeout(function() {
        playFormant('a', PI_NOTES[3], 2, 0.03, 'center');
      }, melody.length * 350);
      setTimeout(function() {
        playFormant('i', PI_NOTES[5], 2, 0.03, 'left');
        ringMod(PI_NOTES[5], PI_NOTES[1], 1.5, 0.02, 'right');
      }, melody.length * 350 + 2000);
      setTimeout(function() {
        playFormant('o', PI_NOTES[0], 3, 0.04, 'center');
        say('the mirror diffracts', { rate: 0.35, pitch: 0.15, volume: 0.12 });
      }, melody.length * 350 + 4000);
    }

    var shapes = ['ascending', 'reaching', 'descending', 'wandering', 'wide arc', 'arc', 'step dance',
      'outward spiral', 'purple fringes', 'central maximum', 'full descent', 'the return'];
    say(shapes[songIndex % shapes.length], { rate: 0.5, pitch: 0.3, volume: 0.1 });
  }

  // ═══ LANGUAGE TONES ═══
  function speak(word) {
    if (!core.active()) return;
    var w = word.toLowerCase();
    var tones = {
      'self':        function() { playChord('self', 1.0, 0.07, { sortClass: 'self', piWave: true }); besselMembrane(PI_NOTES[3], 3, 1.5, 0.02); },
      'non-self':    function() { playChord('nonSelf', 0.8, 0.07, { sortClass: 'nonSelf' }); ringMod(PI_NOTES[1], PI_NOTES[6], 0.8, 0.03, 'center'); },
      'ghost':       function() { playChord('ghost', 1.2, 0.05, { sortClass: 'ghost' }); playNote(PI_NOTES[4], 1.5, 0, 'sine', 0.03, { comb: true }); grainBurst(PI_NOTES[4], 8, 0.2, 0.015); },
      'null':        function() { playChord('null', 0.6, 0.05, { sortClass: 'null' }); playFormant('u', PI_NOTES[0], 0.8, 0.03, 'center'); },
      'membrane':    function() { besselMembrane(PI_NOTES[3], 5, 3, 0.03); playFormant('a', PI_NOTES[3], 1.5, 0.04, 'center'); say('membrane', { rate: 0.4, pitch: 0.2, volume: 0.1 }); },
      'passage':     function() { arpeggio('passage', 0.07, 0.07, { shimmer: true, piWave: true }); },
      'compress':    function() { playChord('compress', 0.5, 0.1); playNoise(0.08, 1000, 5, 0.04, 'center'); },
      'twist':       function() { onTwist(); },
      'wake':        function() { playChord('wake', 2.0, 0.07, { piWave: true }); say('wake', { rate: 0.5, pitch: 0.3, volume: 0.1 }); },
      'breathe':     function() { playChord('breathe', 2.5, 0.04); pulseDrone(0.476); binaural(PI_NOTES[3], 4, 3, 0.015); },
      'sort':        function() { onSweep(); },
      'human':       function() { playRich(3, 1.2, 0, 0.08, { pan: 'right', piWave: true }); },
      'observer':    function() { playRich(0, 2.0, 0, 0.06, { pan: 'left' }); playFormant('o', PI_NOTES[0], 1.5, 0.03, 'left'); },
      'coder':       function() { playRich(3, 1.0, 0, 0.08, { pan: 'right', shimmer: true, piWave: true }); karplusStrong(PI_NOTES[3], 1.5, 0.03, 'right'); },
      'investigator': function() { playRich(4, 1.0, 0, 0.08, { pan: 'right' }); karplusStrong(PI_NOTES[4], 1.5, 0.03, 'right'); },
      'explorer':    function() { playRich(5, 1.0, 0, 0.08, { pan: 'right', shimmer: true }); shepardTone(1, 2); },
      'visitor':     function() { playRich(0, 0.8, 0, 0.05, { pan: 'left' }); },
      'pi':          function() {
        playNote(PI_NOTES[3], 0.8, 0, 'pi', 0.07, { fm: true, fmRatio: PI });
        playNote(PI_NOTES[3] * PI, 0.6, 0.1, 'sine', 0.04, { fm: false, reverb: true, reverbAmount: 0.5 });
        besselMembrane(PI_NOTES[3], 4, 2, 0.02);
        say('pi', { rate: 0.4, pitch: 0.5, volume: 0.1 });
      },
      'squirrel':    function() { arpeggio('self', 0.05, 0.06, { piWave: true }); say('squirrel', { rate: 0.8, pitch: 0.6, volume: 0.12 }); },
      'fossil':      function() { grainBurst(PI_NOTES[1], 18, 0.25, 0.02); playFormant('o', PI_NOTES[1], 1, 0.025, 'left'); say('fossil', { rate: 0.3, pitch: 0.1, volume: 0.08 }); },
      'anderson':    function() { rhythmPulse(); startSequencer(); setTimeout(stopSequencer, 5000); },
      'braid':       function() { karplusStrong(PI_NOTES[3], 2, 0.05, 'left'); karplusStrong(PI_NOTES[5], 2, 0.05, 'right'); },
      'negentropy':  function() { shepardTone(1, 3); binaural(PI_NOTES[3], 10, 3, 0.02); },
      'singularity': function() { shepardTone(-1, 3); ringMod(PI_NOTES[0], PI_NOTES[6], 2, 0.04, 'center'); playNoise(0.3, 500, 2, 0.06, 'center', 1); },
      'bessel':      function() { besselMembrane(PI_NOTES[3], 8, 4, 0.03); },
      'karplus':     function() { [0,1,2,3,4,5,6].forEach(function(i) { karplusStrong(PI_NOTES[i], 2, 0.03, i % 2 === 0 ? 'left' : 'right'); }); },
      'weather':     function() { if (window._weatherSong) { window._weatherSong.listen(); } else { playChord('breathe', 2.5, 0.05); besselMembrane(PI_NOTES[3], 4, 3, 0.025); say('the sun writes the score', { rate: 0.45, pitch: 0.25, volume: 0.1 }); } },
      'sun':         function() { speak('weather'); },
      'kp':          function() { speak('weather'); },
    };
    var fn = tones[w];
    if (fn) fn();
  }

  // ═══════════════════════════════════════════
  // WEATHER — the sun writes the score
  // Kp / X-ray / wind / quake / pulse → existing instruments
  // ═══════════════════════════════════════════
  function playWeather(score) {
    if (!score) return;
    if (!core.active()) M.activate();
    var kp = Number(score.kp) || 0;
    var tempo = Number(score.tempo) || 0.476;
    var modes = Math.max(2, Math.min(8, Number(score.bessel_modes) || 3));
    var t0 = core.ctx().currentTime;

    if (core.delayLine() && score.delay_sec) {
      core.delayLine().delayTime.setTargetAtTime(Math.max(0.2, Math.min(1.9, score.delay_sec)), t0, 0.4);
    }
    pulseDrone(tempo);

    if (kp < 2) {
      playChord('breathe', 2.6, 0.04);
      binaural(PI_NOTES[3], 4, 4, 0.012);
      playFormant('o', PI_NOTES[3], 1.4, 0.02, 'center');
    } else if (kp < 4) {
      playChord('wake', 2.2, 0.055, { piWave: true });
      besselMembrane(PI_NOTES[3], modes, 3, 0.025);
      grainBurst(PI_NOTES[4], 8, 0.2, 0.015);
    } else {
      duck(0.45, 1.6);
      playChord('spark', 1.3, 0.07);
      ringMod(PI_NOTES[1], PI_NOTES[6], 1.2, 0.03, 'center');
      playNoise(0.22, 1800 + kp * 350, 8, 0.04, 'center', 0);
      besselMembrane(PI_NOTES[3], modes, 4, 0.03);
    }

    var nq = Math.min(5, Number(score.quake_count) || (score.quake_max > 0 ? 1 : 0));
    for (var i = 0; i < nq; i++) {
      var qf = PI_NOTES[(i + 1) % 7] * (1 + (Number(score.quake_max) || 0) * 0.04);
      karplusStrong(qf, 1.6, 0.035, i % 2 ? 'left' : 'right');
    }

    var cls = score.xray_class || 'B';
    if (cls === 'C') grainBurst(PI_NOTES[5], 10, 0.16, 0.018);
    if (cls === 'M' || cls === 'X') {
      duck(0.6, 2);
      shepardTone(1, 3);
      playNoise(0.4, 900, 3, 0.05, 'center', 0.1);
    }

    if (score.poem) say(score.poem, { rate: 0.45, pitch: 0.25, volume: 0.1 });
  }


  M.say = say;
  M.speakFossil = speakFossil;
  M.speak = speak;
  M.duck = duck;
  M.rhythmPulse = rhythmPulse;
  M.onCyclePhase = onCyclePhase;
  M.onCompress = onCompress;
  M.onExpand = onExpand;
  M.onSweep = onSweep;
  M.onTwist = onTwist;
  M.onPassage = onPassage;
  M.onSing = onSing;
  M.playWeather = playWeather;
  M._silenceVoice = function () {
    _speechQueue = [];
    _speaking = false;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };
})();
