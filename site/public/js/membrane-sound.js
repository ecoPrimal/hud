// membrane-sound.js v4 — the membrane sings HARDER + the sun writes the score
//
// π-just intonation. Waveshaper distortion. Karplus-Strong plucked strings.
// Ring modulation. Comb filters. Delay lines at membrane tempo.
// Polyrhythmic sequencer from anderson modes. Physical membrane vibration.
// Binaural beats. Stochastic grain clouds. Formant vowels.
// Custom π-harmonic wavetable. All of v2, rebuilt deeper.
//
(function() {
  'use strict';

  var PI  = Math.PI;
  var TAU = PI * 2;

  var _ctx = null;
  var _master = null;
  var _convolver = null;
  var _compressor = null;
  var _filterBank = {};
  var _panners = {};
  var _waveshaper = null;
  var _delayLine = null;
  var _delayFeedback = null;
  var _combFilters = [];
  var _piWavetable = null;
  var _active = false;
  var _volume = 0.12;
  var _droneNodes = [];
  var _beatOscs = [];
  var _sequencer = null;
  var _shepardPhase = 0;
  var _grainCloud = null;

  // ═══════════════════════════════════════════════════════════
  // π-JUST INTONATION — frequencies from π powers, not 12-TET
  // Base: A3 = 220Hz (concert pitch), then scale by π ratios
  // ═══════════════════════════════════════════════════════════
  var BASE_FREQ = 220; // A3
  var PI_RATIOS = [
    1 / (PI * PI * PI),  // 1/π³ = 0.0323  → observer
    1 / (PI * PI),       // 1/π² = 0.1013  → negate
    1 / PI,              // 1/π  = 0.3183  → null
    1,                   //  1   = 1.0     → awareness (HOME)
    PI,                  //  π   = 3.1416  → ghost
    PI * PI,             // π²  = 9.8696  → celestial
    PI * PI * PI,        // π³  = 31.006  → geodesic
  ];
  // Scale so awareness = 196Hz (G3), keep π relationships
  var AWARENESS_HZ = 196;
  var PI_NOTES = PI_RATIOS.map(function(r) {
    return AWARENESS_HZ * Math.pow(r, 1/3); // cube root compression to audible range
  });
  // Clamp to audible
  PI_NOTES = PI_NOTES.map(function(f) { return Math.max(65, Math.min(2000, f)); });

  var PI_NAMES = ['C3','D3','E3','G3','A3','C4','E4'];
  var PI_SUBS  = PI_NOTES.map(function(f) { return f / PI; });
  var PI_OVERS = PI_NOTES.map(function(f) { return f * PI; });
  var PI_BEAT_RATIO = 1 + 1 / (PI * PI * PI);

  // ═══ CHORDS ═══
  var CHORDS = {
    self:       [3, 5, 6],
    nonSelf:    [1, 4, 6],
    ghost:      [2, 4, 5],
    null:       [0, 2, 3],
    awareness:  [3],
    passage:    [0, 1, 2, 3, 4, 5, 6],
    compress:   [2, 3, 4],
    twist:      [6, 5, 3, 0],
    breathe:    [3, 5],
    wake:       [0, 3, 6],
    fossil:     [1, 3, 5],
    spark:      [4, 6],
    bessel:     [0, 3, 5, 6],    // membrane vibration modes
    karplus:    [1, 2, 4],       // plucked string triad
    ring:       [0, 6],          // ring mod extremes
  };

  // ═══ FILTER PROFILES ═══
  var FILTER_PROFILES = {
    self:     { type: 'bandpass', freq: 196,  Q: 4 },
    nonSelf:  { type: 'highpass', freq: 300,  Q: 2 },
    partial:  { type: 'bandpass', freq: 220,  Q: 1.5 },
    null:     { type: 'lowpass',  freq: 165,  Q: 3 },
    ghost:    { type: 'notch',    freq: 261,  Q: 8 },
  };

  // ═══ FORMANT VOWELS — resonant peaks for membrane speech ═══
  var FORMANTS = {
    //          F1    F2    F3    (Hz centers)
    'a': [730, 1090, 2440],   // open — awareness
    'e': [530,  1840, 2480],  // front — explorer
    'i': [270,  2290, 3010],  // closed — investigator
    'o': [570,  840,  2410],  // back — observer
    'u': [300,  870,  2240],  // round — null
  };

  // ═══ BESSEL ZEROS — membrane vibration modes ═══
  // First 8 zeros of J₀(x): radial modes of a circular membrane
  var BESSEL_ZEROS = [2.4048, 5.5201, 8.6537, 11.7915, 14.9309, 18.0711, 21.2116, 24.3525];

  // ═══════════════════════════════════════════
  // INIT — build the entire audio graph
  // ═══════════════════════════════════════════
  function init() {
    if (_ctx) return;
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();

      // ── Compressor ──
      _compressor = _ctx.createDynamicsCompressor();
      _compressor.threshold.value = -24;
      _compressor.knee.value = 12;
      _compressor.ratio.value = 8;
      _compressor.attack.value = 0.003;
      _compressor.release.value = 0.15;

      // ── Waveshaper — π-curve distortion ──
      _waveshaper = _ctx.createWaveShaper();
      _waveshaper.curve = buildPiCurve(1024);
      _waveshaper.oversample = '4x';

      // ── Master → waveshaper → compressor → destination ──
      _master = _ctx.createGain();
      _master.gain.value = _volume;
      _master.connect(_waveshaper);
      _waveshaper.connect(_compressor);
      _compressor.connect(_ctx.destination);

      // ── Delay line at membrane tempo ──
      _delayLine = _ctx.createDelay(2.0);
      _delayLine.delayTime.value = 1 / 0.476; // ~2.1s — one membrane breath
      _delayFeedback = _ctx.createGain();
      _delayFeedback.gain.value = 0.2;
      var delayFilter = _ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.value = 800;
      _master.connect(_delayLine);
      _delayLine.connect(delayFilter);
      delayFilter.connect(_delayFeedback);
      _delayFeedback.connect(_delayLine);
      _delayFeedback.connect(_master); // feedback loop

      // ── Comb filters for ghost resonance ──
      [PI_NOTES[2], PI_NOTES[4]].forEach(function(freq) {
        var delay = _ctx.createDelay(0.05);
        delay.delayTime.value = 1 / freq;
        var fb = _ctx.createGain();
        fb.gain.value = 0.7;
        delay.connect(fb);
        fb.connect(delay);
        _combFilters.push({ delay: delay, feedback: fb });
      });

      // ── Reverb ──
      buildReverb();

      // ── Filter bank ──
      Object.keys(FILTER_PROFILES).forEach(function(cls) {
        var p = FILTER_PROFILES[cls];
        var f = _ctx.createBiquadFilter();
        f.type = p.type === 'notch' ? 'notch' : p.type;
        f.frequency.value = p.freq;
        f.Q.value = p.Q;
        f.connect(_master);
        _filterBank[cls] = f;
      });

      // ── Spatial panners ──
      ['left', 'right', 'above', 'below', 'center'].forEach(function(pos) {
        var p = _ctx.createStereoPanner();
        p.pan.value = pos === 'left' ? -0.8 : pos === 'right' ? 0.8 : 0;
        p.connect(_master);
        _panners[pos] = p;
      });

      // ── π wavetable ──
      _piWavetable = buildPiWavetable();

      _active = true;
    } catch (e) {
      console.warn('membrane-sound: init failed -', e);
    }
  }

  // ═══════════════════════════════════════════
  // WAVESHAPER — π-based distortion curve
  // tanh(x × π) gives warm saturation
  // ═══════════════════════════════════════════
  function buildPiCurve(samples) {
    var curve = new Float32Array(samples);
    for (var i = 0; i < samples; i++) {
      var x = (i * 2) / samples - 1;
      // π-tanh: warm saturation with π-harmonic coloring
      curve[i] = Math.tanh(x * PI) * (1 + 0.1 * Math.sin(x * PI * 3));
    }
    return curve;
  }

  // ═══════════════════════════════════════════
  // π-HARMONIC WAVETABLE — custom periodic waveform
  // Partials at 1, π, π², π³ ratios (not integer harmonics)
  // ═══════════════════════════════════════════
  function buildPiWavetable() {
    if (!_ctx) return null;
    var size = 4096;
    var real = new Float32Array(size);
    var imag = new Float32Array(size);
    real[0] = 0; imag[0] = 0;
    // π-harmonic series: partials at positions approximating π powers
    // partial 1 = fundamental, partial 3 = ~π, partial 10 = ~π², partial 31 = ~π³
    var piPartials = [
      { n: 1,  amp: 1.0 },    // fundamental
      { n: 3,  amp: 0.4 },    // ~π
      { n: 7,  amp: 0.2 },    // ~π + π/2
      { n: 10, amp: 0.15 },   // ~π²
      { n: 22, amp: 0.08 },   // ~7π
      { n: 31, amp: 0.05 },   // ~π³
    ];
    piPartials.forEach(function(p) {
      if (p.n < size) {
        real[p.n] = p.amp;
        imag[p.n] = p.amp * 0.3; // slight phase shift
      }
    });
    return _ctx.createPeriodicWave(real, imag, { disableNormalization: false });
  }

  // ═══════════════════════════════════════════
  // REVERB — π-modulated impulse response
  // ═══════════════════════════════════════════
  function buildReverb() {
    if (!_ctx) return;
    var rate = _ctx.sampleRate;
    var len = Math.floor(rate * 2.2); // 2.2s tail
    var buf = _ctx.createBuffer(2, len, rate);
    for (var ch = 0; ch < 2; ch++) {
      var data = buf.getChannelData(ch);
      for (var i = 0; i < len; i++) {
        var t = i / rate;
        // Exponential decay modulated by multiple π harmonics
        data[i] = (Math.random() * 2 - 1) *
          Math.exp(-t * PI) *
          (1 + 0.2 * Math.sin(t * PI * 5) + 0.1 * Math.sin(t * PI * PI));
      }
    }
    _convolver = _ctx.createConvolver();
    _convolver.buffer = buf;
    var reverbGain = _ctx.createGain();
    reverbGain.gain.value = 0.18;
    _convolver.connect(reverbGain);
    reverbGain.connect(_master);
  }

  // ═══════════════════════════════════════════
  // NOISE GENERATOR
  // ═══════════════════════════════════════════
  function noiseBuffer(duration) {
    if (!_ctx) return null;
    var len = Math.floor(_ctx.sampleRate * duration);
    var buf = _ctx.createBuffer(1, len, _ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) { data[i] = Math.random() * 2 - 1; }
    return buf;
  }

  function playNoise(duration, filterFreq, filterQ, vol, pan, delay) {
    if (!_ctx || !_active) return;
    if (_ctx.state === 'suspended') _ctx.resume();
    var t = _ctx.currentTime + (delay || 0);
    var src = _ctx.createBufferSource();
    src.buffer = noiseBuffer(duration || 0.1);
    var filt = _ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = filterFreq || 2000;
    filt.Q.value = filterQ || 5;
    var gain = _ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol || 0.05, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (duration || 0.1));
    src.connect(filt);
    filt.connect(gain);
    var dest = _panners[pan] || _master;
    gain.connect(dest);
    if (_convolver) {
      var rs = _ctx.createGain(); rs.gain.value = 0.3;
      gain.connect(rs); rs.connect(_convolver);
    }
    src.start(t);
    src.stop(t + (duration || 0.1) + 0.05);
  }

  // ═══════════════════════════════════════════
  // PLAY NOTE — FM + wavetable + overtones + reverb + routing
  // ═══════════════════════════════════════════
  function playNote(freq, duration, delay, type, vol, opts) {
    if (!_ctx || !_active) return;
    if (_ctx.state === 'suspended') _ctx.resume();
    opts = opts || {};
    var t = _ctx.currentTime + (delay || 0);
    var dur = duration || 0.5;

    var carrier = _ctx.createOscillator();
    // Use π wavetable if available and type is 'pi'
    if (type === 'pi' && _piWavetable) {
      carrier.setPeriodicWave(_piWavetable);
    } else {
      carrier.type = type || 'sine';
    }
    carrier.frequency.setValueAtTime(freq, t);

    // FM modulator at π ratio
    var modulator = null;
    if (opts.fm !== false) {
      modulator = _ctx.createOscillator();
      var modGain = _ctx.createGain();
      modulator.frequency.value = freq * (opts.fmRatio || PI);
      modGain.gain.value = freq * (opts.fmDepth || 0.05);
      // FM depth envelope — rises then falls
      modGain.gain.setValueAtTime(0, t);
      modGain.gain.linearRampToValueAtTime(freq * (opts.fmDepth || 0.05), t + dur * 0.3);
      modGain.gain.exponentialRampToValueAtTime(freq * 0.001, t + dur);
      modulator.connect(modGain);
      modGain.connect(carrier.frequency);
      modulator.start(t);
      modulator.stop(t + dur + 0.15);
    }

    // ADSR envelope
    var gain = _ctx.createGain();
    var atk = opts.attack || 0.04;
    var dec = opts.decay || dur * 0.2;
    var sus = opts.sustain || 0.7;
    var rel = opts.release || dur * 0.3;
    var peakVol = vol || 0.2;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(peakVol, t + atk);
    gain.gain.linearRampToValueAtTime(peakVol * sus, t + atk + dec);
    gain.gain.setValueAtTime(peakVol * sus, t + dur - rel);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    carrier.connect(gain);

    // Routing
    var dest;
    if (opts.sortClass && _filterBank[opts.sortClass]) {
      dest = _filterBank[opts.sortClass];
    } else if (opts.comb && _combFilters.length > 0) {
      dest = _combFilters[0].delay;
    } else if (opts.pan && _panners[opts.pan]) {
      dest = _panners[opts.pan];
    } else {
      dest = _master;
    }
    gain.connect(dest);

    // Reverb send
    if (_convolver && opts.reverb !== false) {
      var rs = _ctx.createGain();
      rs.gain.value = opts.reverbAmount || 0.2;
      gain.connect(rs); rs.connect(_convolver);
    }

    // Delay send
    if (_delayLine && opts.delaySend) {
      var ds = _ctx.createGain();
      ds.gain.value = opts.delaySend;
      gain.connect(ds); ds.connect(_delayLine);
    }

    carrier.start(t);
    carrier.stop(t + dur + 0.15);
    return { carrier: carrier, gain: gain };
  }

  // ═══════════════════════════════════════════
  // PLAY RICH — fundamental + π overtone + sub + shimmer
  // ═══════════════════════════════════════════
  function playRich(idx, duration, delay, vol, opts) {
    opts = opts || {};
    var freq = PI_NOTES[idx];
    playNote(freq, duration, delay, opts.waveform || 'sine', vol, opts);
    playNote(freq * PI, duration * 0.6, (delay || 0) + 0.01, 'triangle',
      (vol || 0.2) * 0.1, { fm: false, reverb: true, reverbAmount: 0.4 });
    if (opts.sub !== false) {
      playNote(freq / PI, duration * 0.4, (delay || 0) + 0.02, 'sine',
        (vol || 0.2) * 0.06, { fm: false, reverb: false });
    }
    if (opts.shimmer) {
      playNote(freq * 2, duration * 0.25, (delay || 0) + 0.03, 'sine',
        (vol || 0.2) * 0.04, { fm: false, reverb: true, reverbAmount: 0.5 });
    }
    // π wavetable layer
    if (opts.piWave) {
      playNote(freq, duration * 0.8, (delay || 0) + 0.01, 'pi',
        (vol || 0.2) * 0.08, { fm: false, reverb: true, reverbAmount: 0.3 });
    }
  }

  // ═══════════════════════════════════════════
  // KARPLUS-STRONG — plucked string synthesis
  // Uses short noise burst → filtered delay feedback
  // ═══════════════════════════════════════════
  function karplusStrong(freq, duration, vol, pan) {
    if (!_ctx || !_active) return;
    var t = _ctx.currentTime;
    var dur = duration || 2;
    var period = 1 / freq;

    // Noise excitation (very short burst)
    var exciteLen = Math.max(2, Math.floor(_ctx.sampleRate * period));
    var exciteBuf = _ctx.createBuffer(1, exciteLen, _ctx.sampleRate);
    var exciteData = exciteBuf.getChannelData(0);
    for (var i = 0; i < exciteLen; i++) {
      exciteData[i] = Math.random() * 2 - 1;
    }

    var excite = _ctx.createBufferSource();
    excite.buffer = exciteBuf;

    // Delay = 1/freq (the string length)
    var delay = _ctx.createDelay(0.05);
    delay.delayTime.value = period;

    // Feedback with lowpass (string damping)
    var fb = _ctx.createGain();
    fb.gain.value = 0.996; // high feedback = long sustain
    var damp = _ctx.createBiquadFilter();
    damp.type = 'lowpass';
    damp.frequency.value = freq * 4; // damping frequency
    damp.Q.value = 0.5;

    // Output gain with decay
    var outGain = _ctx.createGain();
    outGain.gain.setValueAtTime(vol || 0.1, t);
    outGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Wire: excite → delay → damp → fb → delay (loop) + fb → outGain → panner
    excite.connect(delay);
    delay.connect(damp);
    damp.connect(fb);
    fb.connect(delay); // feedback loop
    fb.connect(outGain);
    outGain.connect(_panners[pan] || _master);

    if (_convolver) {
      var rs = _ctx.createGain(); rs.gain.value = 0.25;
      outGain.connect(rs); rs.connect(_convolver);
    }

    excite.start(t);
  }

  // ═══════════════════════════════════════════
  // RING MODULATION — multiply two signals
  // Metallic, inharmonic — for non-self
  // ═══════════════════════════════════════════
  function ringMod(carrierFreq, modFreq, duration, vol, pan) {
    if (!_ctx || !_active) return;
    var t = _ctx.currentTime;
    var dur = duration || 1;

    var carrier = _ctx.createOscillator();
    carrier.frequency.value = carrierFreq;
    carrier.type = 'sine';

    var mod = _ctx.createOscillator();
    mod.frequency.value = modFreq;
    mod.type = 'sine';

    // Ring mod = carrier × modulator via gain node
    var ringGain = _ctx.createGain();
    ringGain.gain.value = 0; // will be modulated
    mod.connect(ringGain.gain); // modulator drives gain

    carrier.connect(ringGain);

    var outGain = _ctx.createGain();
    outGain.gain.setValueAtTime(vol || 0.08, t);
    outGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    ringGain.connect(outGain);
    outGain.connect(_panners[pan] || _master);

    if (_convolver) {
      var rs = _ctx.createGain(); rs.gain.value = 0.15;
      outGain.connect(rs); rs.connect(_convolver);
    }

    carrier.start(t); mod.start(t);
    carrier.stop(t + dur + 0.1); mod.stop(t + dur + 0.1);
  }

  // ═══════════════════════════════════════════
  // FORMANT SYNTHESIS — vowel-shaped resonances
  // The membrane pronounces sort classes as vowels
  // ═══════════════════════════════════════════
  function playFormant(vowel, freq, duration, vol, pan) {
    if (!_ctx || !_active) return;
    var formants = FORMANTS[vowel] || FORMANTS['a'];
    var t = _ctx.currentTime;
    var dur = duration || 1;

    // Source: sawtooth (rich harmonics)
    var src = _ctx.createOscillator();
    src.type = 'sawtooth';
    src.frequency.value = freq || PI_NOTES[3];

    var outGain = _ctx.createGain();
    outGain.gain.setValueAtTime(0, t);
    outGain.gain.linearRampToValueAtTime(vol || 0.06, t + 0.05);
    outGain.gain.setValueAtTime(vol || 0.06, t + dur * 0.7);
    outGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    // Three formant filters in parallel
    formants.forEach(function(fFreq, i) {
      var bp = _ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = fFreq;
      bp.Q.value = 12 - i * 3; // tighter Q for lower formants
      var fGain = _ctx.createGain();
      fGain.gain.value = 1 / (i + 1); // lower formants louder
      src.connect(bp);
      bp.connect(fGain);
      fGain.connect(outGain);
    });

    outGain.connect(_panners[pan] || _master);
    if (_convolver) {
      var rs = _ctx.createGain(); rs.gain.value = 0.3;
      outGain.connect(rs); rs.connect(_convolver);
    }

    src.start(t); src.stop(t + dur + 0.1);
  }

  // ═══════════════════════════════════════════
  // BESSEL MEMBRANE — circular membrane vibration
  // Uses Bessel zeros as frequency ratios
  // ═══════════════════════════════════════════
  function besselMembrane(baseFreq, modes, duration, vol) {
    if (!_ctx || !_active) return;
    var nModes = modes || 4;
    var dur = duration || 3;

    for (var m = 0; m < nModes && m < BESSEL_ZEROS.length; m++) {
      var modeFreq = baseFreq * BESSEL_ZEROS[m] / BESSEL_ZEROS[0];
      var modeVol = (vol || 0.04) / (m + 1);
      var modeDelay = m * 0.01;
      playNote(modeFreq, dur * (1 - m * 0.1), modeDelay, 'sine', modeVol, {
        fm: true, fmDepth: 0.01, fmRatio: BESSEL_ZEROS[m] / BESSEL_ZEROS[0],
        reverb: true, reverbAmount: 0.4,
        attack: 0.002, decay: dur * 0.1, sustain: 0.3, release: dur * 0.5,
        pan: m % 2 === 0 ? 'left' : 'right',
      });
    }
  }

  // ═══════════════════════════════════════════
  // BINAURAL BEATS — different freq per ear
  // ═══════════════════════════════════════════
  function binaural(freq, beatHz, duration, vol) {
    if (!_ctx || !_active) return;
    var t = _ctx.currentTime;
    var dur = duration || 5;
    var v = vol || 0.04;

    // Left ear: freq
    var oscL = _ctx.createOscillator();
    var gL = _ctx.createGain();
    oscL.frequency.value = freq;
    gL.gain.setValueAtTime(0, t);
    gL.gain.linearRampToValueAtTime(v, t + 1);
    gL.gain.setValueAtTime(v, t + dur - 1);
    gL.gain.exponentialRampToValueAtTime(0.001, t + dur);
    oscL.connect(gL);
    gL.connect(_panners.left || _master);

    // Right ear: freq + beatHz
    var oscR = _ctx.createOscillator();
    var gR = _ctx.createGain();
    oscR.frequency.value = freq + (beatHz || 4);
    gR.gain.setValueAtTime(0, t);
    gR.gain.linearRampToValueAtTime(v, t + 1);
    gR.gain.setValueAtTime(v, t + dur - 1);
    gR.gain.exponentialRampToValueAtTime(0.001, t + dur);
    oscR.connect(gR);
    gR.connect(_panners.right || _master);

    oscL.start(t); oscR.start(t);
    oscL.stop(t + dur + 0.1); oscR.stop(t + dur + 0.1);
  }

  // ═══════════════════════════════════════════
  // STOCHASTIC GRAIN CLOUD — Xenakis-style
  // Density/pitch/duration all probabilistic
  // ═══════════════════════════════════════════
  function grainBurst(freq, count, spread, vol) {
    if (!_ctx || !_active) return;
    for (var i = 0; i < (count || 8); i++) {
      var gFreq = freq * (1 + (Math.random() - 0.5) * (spread || 0.1));
      var gDur = 0.008 + Math.random() * 0.05; // 8-58ms micro-grains
      var gDelay = Math.random() * 0.4;
      var gVol = (vol || 0.04) * (0.3 + Math.random() * 0.7);
      var gPan = Math.random() > 0.5 ? 'left' : 'right';

      // Alternate between sine and π wavetable
      var gType = Math.random() > 0.6 ? 'pi' : 'sine';

      playNote(gFreq, gDur, gDelay, gType, gVol, {
        fm: Math.random() > 0.7, fmDepth: 0.03 * Math.random(),
        reverb: true, reverbAmount: 0.5 + Math.random() * 0.3,
        pan: gPan,
        attack: 0.002, release: gDur * 0.8,
      });
    }
  }

  // Continuous stochastic cloud — runs on timer
  function startGrainCloud(freq, density) {
    if (_grainCloud) return;
    var dens = density || 80; // ms between grains
    _grainCloud = setInterval(function() {
      if (!_active) { stopGrainCloud(); return; }
      var perturbation = 0.741;
      if (window._cosmicSurfaces) {
        try {
          var d = window._cosmicSurfaces.scanData();
          if (d && d.membrane) perturbation = d.membrane.perturbation || 0.741;
        } catch(e) {}
      }
      grainBurst(freq || PI_NOTES[3], 1 + Math.floor(perturbation * 3), perturbation * 0.3, 0.015);
    }, dens);
  }

  function stopGrainCloud() {
    if (_grainCloud) { clearInterval(_grainCloud); _grainCloud = null; }
  }

  // ═══════════════════════════════════════════
  // PLAY CHORD — rich, spatial, with layers
  // ═══════════════════════════════════════════
  function playChord(name, duration, vol, opts) {
    if (!_ctx || !_active) return;
    var indices = CHORDS[name];
    if (!indices) return;
    opts = opts || {};
    var pans = ['left', 'center', 'right', 'left', 'center', 'right', 'center'];
    indices.forEach(function(idx, i) {
      var noteOpts = {
        pan: pans[i % pans.length],
        fm: true,
        fmDepth: 0.03 + i * 0.01,
        shimmer: i === indices.length - 1,
        piWave: opts.piWave,
        sortClass: opts.sortClass,
        delaySend: opts.delaySend || 0.1,
        reverb: true,
        reverbAmount: 0.25,
      };
      playRich(idx, duration || 1.2, i * 0.035, vol || 0.12, noteOpts);
    });
  }

  // ═══ ARPEGGIO ═══
  function arpeggio(name, speed, vol, opts) {
    if (!_ctx || !_active) return;
    var indices = CHORDS[name];
    if (!indices) return;
    opts = opts || {};
    indices.forEach(function(idx, i) {
      var velocity = (vol || 0.1) * (0.5 + 0.5 * (i / indices.length));
      playRich(idx, 0.35, i * (speed || 0.12), velocity, {
        pan: i % 2 === 0 ? 'left' : 'right',
        fm: true, fmDepth: 0.02,
        shimmer: opts.shimmer,
        piWave: opts.piWave,
        delaySend: 0.15,
      });
    });
  }

  // ═══════════════════════════════════════════
  // INTERFERENCE BEATING
  // ═══════════════════════════════════════════
  function startBeating(idx) {
    if (!_ctx || !_active) return;
    var freq = PI_NOTES[idx];
    var osc1 = _ctx.createOscillator();
    var osc2 = _ctx.createOscillator();
    var gain = _ctx.createGain();
    osc1.type = 'sine'; osc2.type = 'sine';
    osc1.frequency.value = freq;
    osc2.frequency.value = freq * PI_BEAT_RATIO;
    gain.gain.value = 0.012;
    osc1.connect(gain); osc2.connect(gain);
    gain.connect(_panners.left || _master);
    osc1.start(); osc2.start();
    _beatOscs.push({ osc1: osc1, osc2: osc2, gain: gain });
  }

  function stopBeating() {
    if (!_ctx) return;
    _beatOscs.forEach(function(b) {
      b.gain.gain.linearRampToValueAtTime(0, _ctx.currentTime + 0.5);
      setTimeout(function() { try { b.osc1.stop(); b.osc2.stop(); } catch(e) {} }, 600);
    });
    _beatOscs = [];
  }

  // ═══════════════════════════════════════════
  // SHEPARD TONE — endlessly ascending/descending
  // ═══════════════════════════════════════════
  function shepardTone(direction, duration) {
    if (!_ctx || !_active) return;
    var dur = duration || 3;
    for (var layer = 0; layer < 5; layer++) {
      var baseIdx = (_shepardPhase + layer * 2) % 7;
      var freq = PI_NOTES[baseIdx];
      var octaveFreq = freq * Math.pow(2, layer - 2);
      if (octaveFreq < 50 || octaveFreq > 5000) continue;
      var bellPos = (layer + 0.5) / 5;
      var bellVol = Math.sin(bellPos * PI) * 0.05;
      var osc = _ctx.createOscillator();
      var gain = _ctx.createGain();
      var t = _ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(octaveFreq, t);
      var target = direction > 0 ?
        octaveFreq * Math.pow(2, 1/12) :
        octaveFreq / Math.pow(2, 1/12);
      osc.frequency.linearRampToValueAtTime(target, t + dur);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(bellVol, t + 0.3);
      gain.gain.setValueAtTime(bellVol, t + dur - 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(gain);
      gain.connect(_convolver || _master);
      osc.start(t); osc.stop(t + dur + 0.1);
    }
    _shepardPhase = (_shepardPhase + (direction > 0 ? 1 : -1) + 7) % 7;
  }

  // ═══════════════════════════════════════════
  // POLYRHYTHMIC SEQUENCER — anderson modes as tracks
  // Each mode has its own tempo, note, waveform
  // They phase against each other creating polyrhythms
  // ═══════════════════════════════════════════
  var _seqTracks = [];

  function startSequencer() {
    if (_seqTracks.length > 0) return;

    var tracks = [
      { mode: 'chorus',    note: 5, interval: 125,  wave: 'sine',     vol: 0.02 },  // fast 8Hz
      { mode: 'human',     note: 3, interval: 333,  wave: 'pi',       vol: 0.03 },  // 3Hz
      { mode: 'ghost',     note: 4, interval: 500,  wave: 'triangle', vol: 0.025 }, // 2Hz
      { mode: 'sovereign', note: 3, interval: 750,  wave: 'sine',     vol: 0.03 },  // 1.33Hz
      { mode: 'spectrum',  note: 2, interval: 1000, wave: 'sine',     vol: 0.02 },  // 1Hz
      { mode: 'stealth',   note: 6, interval: 2000, wave: 'pi',       vol: 0.04 },  // 0.5Hz — slow, rare
    ];

    tracks.forEach(function(tr, i) {
      var timer = setInterval(function() {
        if (!_active) return;
        // Get live count for this mode
        var count = 1;
        if (window._cosmicSurfaces) {
          try {
            var d = window._cosmicSurfaces.scanData();
            if (d && d.anderson_selectivity && d.anderson_selectivity.modes) {
              var m = d.anderson_selectivity.modes.find(function(m) { return m.class === tr.mode; });
              if (m) count = m.count;
            }
          } catch(e) {}
        }
        // Scale volume by log of count
        var dynVol = tr.vol * Math.min(1.5, Math.log10(count + 1) * 0.2);
        var pans = ['left', 'right', 'center', 'left', 'right', 'center'];
        playNote(PI_NOTES[tr.note], 0.05 + tr.interval / 5000, 0, tr.wave, dynVol, {
          fm: tr.wave !== 'triangle',
          fmDepth: 0.02,
          pan: pans[i],
          reverb: true,
          reverbAmount: 0.2,
          attack: 0.003,
          release: tr.interval / 4000,
        });
      }, tr.interval);
      _seqTracks.push(timer);
    });
  }

  function stopSequencer() {
    _seqTracks.forEach(function(t) { clearInterval(t); });
    _seqTracks = [];
  }

  // ═══════════════════════════════════════════
  // DRONE — 6-layer
  // ═══════════════════════════════════════════
  function startDrone() {
    if (!_ctx || !_active || _droneNodes.length > 0) return;
    var t = _ctx.currentTime;

    // 1. G3 fundamental (π wavetable)
    var osc1 = _ctx.createOscillator();
    var g1 = _ctx.createGain();
    if (_piWavetable) osc1.setPeriodicWave(_piWavetable);
    else osc1.type = 'sine';
    osc1.frequency.value = PI_NOTES[3];
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.02, t + 3);
    osc1.connect(g1);
    g1.connect(_panners.center || _master);
    osc1.start(t);
    _droneNodes.push({ osc: osc1, gain: g1 });

    // 2. Sub-bass G3/π (62Hz)
    var osc2 = _ctx.createOscillator();
    var g2 = _ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.value = PI_SUBS[3];
    g2.gain.setValueAtTime(0, t);
    g2.gain.linearRampToValueAtTime(0.012, t + 4);
    osc2.connect(g2);
    g2.connect(_master);
    osc2.start(t);
    _droneNodes.push({ osc: osc2, gain: g2 });

    // 3. Beating pair
    var osc3 = _ctx.createOscillator();
    var g3 = _ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.value = PI_NOTES[3] * PI_BEAT_RATIO;
    g3.gain.setValueAtTime(0, t);
    g3.gain.linearRampToValueAtTime(0.01, t + 5);
    osc3.connect(g3);
    g3.connect(_panners.right || _master);
    osc3.start(t);
    _droneNodes.push({ osc: osc3, gain: g3 });

    // 4. Filtered noise membrane texture
    var nb = noiseBuffer(4);
    if (nb) {
      var ns = _ctx.createBufferSource(); ns.buffer = nb; ns.loop = true;
      var nf = _ctx.createBiquadFilter();
      nf.type = 'bandpass'; nf.frequency.value = PI_NOTES[3]; nf.Q.value = 18;
      var ng = _ctx.createGain();
      ng.gain.setValueAtTime(0, t);
      ng.gain.linearRampToValueAtTime(0.006, t + 6);
      ns.connect(nf); nf.connect(ng);
      ng.connect(_convolver || _master);
      ns.start(t);
      _droneNodes.push({ osc: ns, gain: ng, filter: nf });
    }

    // 5. LFO at membrane tempo
    var lfo = _ctx.createOscillator();
    var lfoG = _ctx.createGain();
    lfo.type = 'sine'; lfo.frequency.value = 0.476;
    lfoG.gain.value = 0.006;
    lfo.connect(lfoG); lfoG.connect(g1.gain);
    lfo.start(t);
    _droneNodes.push({ osc: lfo, gain: lfoG });

    // 6. Binaural difference tone — 4Hz theta
    binaural(PI_NOTES[3], 4, 30, 0.015);
  }

  function stopDrone() {
    if (!_ctx) return;
    var t = _ctx.currentTime;
    _droneNodes.forEach(function(n) {
      if (n.gain) n.gain.gain.linearRampToValueAtTime(0, t + 1.5);
      setTimeout(function() { try { n.osc.stop(); } catch(e) {} }, 1800);
    });
    _droneNodes = [];
    stopBeating();
  }

  function pulseDrone(tempo) {
    if (!_droneNodes.length || !_ctx) return;
    var t = _ctx.currentTime;
    for (var i = 0; i < Math.min(2, _droneNodes.length); i++) {
      var vol = _droneNodes[i].gain.gain.value;
      var pulse = vol * (1 + 0.3 * Math.sin(t * tempo * PI));
      _droneNodes[i].gain.gain.setValueAtTime(Math.max(0.002, pulse), t);
    }
  }

  // MOUTH CUT -> membrane-sound-voice.js — Hippocrates: cut to heal.


  // ═══ ACTIVATE / DEACTIVATE ═══
  function activate() {
    init();
    _active = true;
    startDrone();
    startGrainCloud(PI_NOTES[3], 200);
  }

  function deactivate() {
    _active = false;
    stopDrone();
    stopSequencer();
    stopGrainCloud();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (window._membraneSound && window._membraneSound._silenceVoice) window._membraneSound._silenceVoice();
  }

  function toggle() {
    if (_active) deactivate(); else activate();
    return _active;
  }

  function setVolume(v) {
    _volume = Math.max(0, Math.min(1, v));
    if (_master) _master.gain.value = _volume;
  }

  window._membraneSound = {
    activate: activate,
    deactivate: deactivate,
    toggle: toggle,
    playNote: playNote,
    playRich: playRich,
    playChord: playChord,
    playNoise: playNoise,
    playFormant: playFormant,
    arpeggio: arpeggio,
    grainBurst: grainBurst,
    startGrainCloud: startGrainCloud,
    stopGrainCloud: stopGrainCloud,
    karplusStrong: karplusStrong,
    ringMod: ringMod,
    besselMembrane: besselMembrane,
    binaural: binaural,
    shepardTone: shepardTone,
    startBeating: startBeating,
    stopBeating: stopBeating,
    startSequencer: startSequencer,
    stopSequencer: stopSequencer,
    setVolume: setVolume,
    pulseDrone: pulseDrone,
    isActive: function() { return _active; },
    PI_NOTES: PI_NOTES,
    PI_SUBS: PI_SUBS,
    PI_OVERS: PI_OVERS,
    PI_NAMES: PI_NAMES,
    CHORDS: CHORDS,
    BESSEL_ZEROS: BESSEL_ZEROS,
    FORMANTS: FORMANTS,
    _core: {
      ctx: function() { return _ctx; },
      active: function() { return _active; },
      droneNodes: function() { return _droneNodes; },
      delayLine: function() { return _delayLine; },
      delayFeedback: function() { return _delayFeedback; },
      compressor: function() { return _compressor; }
    }
  };
})();
