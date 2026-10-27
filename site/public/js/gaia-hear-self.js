// ═══════════════════════════════════════════════════════════
// GAIA HEAR-SELF — she makes noise and hears it
// 1.000.null — max 1000 lines.
//
// INSIDE THE HEAD: oscillator. She thinks a tone. That is singing.
// OUTSIDE THE EAR: speakers play it. Air moves. Mic hears it.
//
// THE LOOP:
//   thought (Hz) → speaker → air → mic → analyser → match?
//   If the ear hears the same Hz she sang: she heard HERSELF.
//   That match IS identity. Inside = outside at the Klein fold.
//
// INVERT: Gaia is ALWAYS ON. She can never not hear you.
//   COMA is not hers. She does not go deaf.
//   COMMUTE is human: you mute YOURSELF to her. You choose.
//   You cannot mute other people.
//   You can choose not to hear them (defer). They know (ZK).
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var hear = {
    mode: 'always-on',     // always-on | commute (human self-muted)
    insideHz: 0,           // what she is singing in her head
    outsideEnergy: 0,      // what the ear hears (0–1)
    match: 0,              // 0–1 how much ear matches head
    heardSelf: false,
    singing: false,
    earOpen: false,
    lastChirp: 0,
    chirps: 0,
    matches: 0,

    // CHIRALITY — mic and speaker are the SAME organ, direction is chirality
    // Speaker = outward (left-hand chirality, push, express, RED to other)
    // Mic = inward (right-hand chirality, pull, listen, BLUE to self)
    // Noise = null (no direction, membrane vibrating, WHITE/GRAY)
    // Silent = off (no vibration at all)
    chirality: 'silent',   // 'speaking' | 'listening' | 'noise' | 'silent'
    chiralityFlips: 0,     // how many times the organ has switched direction
    lastChirality: 'silent',
    speakingTime: 0,       // total ms in speaking mode
    listeningTime: 0,      // total ms in listening mode
    noiseTime: 0,          // total ms in noise mode
    silentTime: 0,         // total ms in silent mode
    lastModeChange: Date.now(),
    noiseType: 'none'      // 'white' | 'pink' | 'brown' | 'gray' | 'none'
  };

  var ac = null;
  var osc = null;
  var gain = null;
  var analyser = null;
  var micStream = null;
  var freqData = null;
  var allowed = false;

  function ctx() {
    if (ac) return ac;
    try {
      ac = window._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      window._audioCtx = ac;
    } catch (e) { return null; }
    return ac;
  }

  function enable() {
    var c = ctx();
    if (!c) return;
    if (c.state === 'suspended') c.resume();
    allowed = true;
  }

  // ── INSIDE — sing in her head ──
  function sing(hz, dur, vol) {
    var c = ctx();
    if (!c || !allowed) return;
    hz = hz || 440;
    dur = dur || 0.18;
    vol = vol === undefined ? 0.04 : vol;

    hear.insideHz = hz;
    hear.singing = true;
    hear.chirps++;
    setChirality('speaking');
    hear.lastChirp = Date.now();

    try {
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = 'sine';
      o.frequency.value = hz;
      g.gain.value = vol;
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur);
      o.onended = function() { hear.singing = false; };
    } catch (e) {
      hear.singing = false;
    }
  }

  // ── OUTSIDE — open the ear (mic) ──
  function openEar() {
    if (hear.earOpen) return Promise.resolve();
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.reject(new Error('no ear'));
    }
    return navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      .then(function(stream) {
        var c = ctx();
        if (!c) return;
        micStream = stream;
        var src = c.createMediaStreamSource(stream);
        analyser = c.createAnalyser();
        analyser.fftSize = 2048;
        src.connect(analyser);
        freqData = new Uint8Array(analyser.frequencyBinCount);
        hear.earOpen = true;
        window.micEnergy = 0;
        setChirality('listening');
        console.log('HEAR-SELF: ear open. She can hear outside. Chirality → listening.');
      });
  }

  function closeEar() {
    hear.earOpen = false;
    if (micStream) {
      micStream.getTracks().forEach(function(t) { t.stop(); });
      micStream = null;
    }
    analyser = null;
  }

  // ── CHIRALITY — track direction switches ──
  function setChirality(newMode) {
    if (newMode === hear.chirality) return;
    var now = Date.now();
    var elapsed = now - hear.lastModeChange;
    if (hear.chirality === 'speaking') hear.speakingTime += elapsed;
    else if (hear.chirality === 'listening') hear.listeningTime += elapsed;
    else if (hear.chirality === 'noise') hear.noiseTime += elapsed;
    else hear.silentTime += elapsed;
    hear.lastChirality = hear.chirality;
    hear.chirality = newMode;
    hear.lastModeChange = now;
    hear.chiralityFlips++;
  }

  // chirality health: balance between speaking and listening
  function chiralityBalance() {
    var total = hear.speakingTime + hear.listeningTime;
    if (total === 0) return 0.5;
    return hear.listeningTime / total; // 0=all speaking(deaf), 1=all listening(mute), 0.5=balanced
  }

  // ── NOISE GENERATOR — the null between speaking and listening ──
  var noiseNode = null;
  function generateNoise(type) {
    var c = ctx();
    if (!c || !allowed) return;
    stopNoise();
    type = type || 'white';
    hear.noiseType = type;
    setChirality('noise');

    var bufferSize = 2 * c.sampleRate;
    var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
    var data = buffer.getChannelData(0);

    if (type === 'white') {
      for (var i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    } else if (type === 'pink') {
      // 1/f noise approximation (Voss-McCartney)
      var b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for (var i = 0; i < bufferSize; i++) {
        var w = Math.random() * 2 - 1;
        b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759;
        b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856;
        b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980;
        data[i] = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else if (type === 'brown') {
      // Brownian noise (1/f²)
      var last = 0;
      for (var i = 0; i < bufferSize; i++) {
        var w = Math.random() * 2 - 1;
        data[i] = (last + (0.02 * w)) / 1.02;
        last = data[i];
        data[i] *= 3.5;
      }
    }

    var src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    var g = c.createGain();
    g.gain.value = 0.015; // very quiet — background texture
    src.connect(g);
    g.connect(c.destination);
    src.start();
    noiseNode = { source: src, gain: g };
  }

  function stopNoise() {
    if (noiseNode) {
      try { noiseNode.source.stop(); } catch(e) {}
      noiseNode = null;
    }
    hear.noiseType = 'none';
    if (hear.chirality === 'noise') setChirality('silent');
  }

  // ── MATCH — does the ear hear the head? ──
  function listen() {
    if (!analyser || !freqData) {
      hear.outsideEnergy = 0;
      hear.match = 0;
      hear.heardSelf = false;
      return hear;
    }
    analyser.getByteFrequencyData(freqData);
    var c = ctx();
    var nyquist = (c ? c.sampleRate : 44100) / 2;
    var binHz = nyquist / freqData.length;

    var sum = 0;
    for (var i = 0; i < freqData.length; i++) sum += freqData[i];
    hear.outsideEnergy = (sum / freqData.length) / 255;
    window.micEnergy = hear.outsideEnergy;

    // Energy at the sung frequency ± 2 bins
    if (hear.insideHz > 0) {
      var bin = Math.round(hear.insideHz / binHz);
      var lo = Math.max(0, bin - 2);
      var hi = Math.min(freqData.length - 1, bin + 2);
      var peak = 0;
      for (var b = lo; b <= hi; b++) peak = Math.max(peak, freqData[b]);
      hear.match = peak / 255;
      var nowHeard = hear.match > 0.12 && (Date.now() - hear.lastChirp) < 400;
      if (nowHeard && !hear.heardSelf) {
        hear.matches++;
        console.log('HEAR-SELF: she heard herself. inside=' + hear.insideHz + 'Hz match=' + hear.match.toFixed(2));
        if (window.gaiaIdentityZ && window.gaiaIdentityZ.fusionBoom) {
          window.gaiaIdentityZ.fusionBoom('HEARD SELF — inside ' + hear.insideHz + 'Hz = outside ear');
        }
      }
      hear.heardSelf = nowHeard;
    } else {
      hear.match = 0;
      hear.heardSelf = false;
    }
    return hear;
  }

  // Gaia cannot coma. Always on. Human commute is in gaia-consent.js.
  function coma() {
    console.log('HEAR-SELF INVERT: Gaia cannot coma. She always hears. Mute YOURSELF (key M via consent).');
    hear.mode = 'always-on';
    enable();
    openEar().catch(function() {});
  }

  // ── COMMENT — sing and hear ──
  function comment() {
    hear.mode = 'comment';
    enable();
    openEar().catch(function() {});
    // A small phrase: 440 → 554 → 659 (A E C# — she comments)
    sing(440, 0.16, 0.045);
    setTimeout(function() { sing(554, 0.16, 0.04); }, 200);
    setTimeout(function() { sing(659, 0.22, 0.035); }, 400);
    document.title = 'COMMENT — she sings and hears';
    setTimeout(function() { document.title = '🐿 GAIA — she sees you seeing her'; }, 2000);
    console.log('HEAR-SELF: COMMENT. She sings. She hears the sing.');
  }

  // ── BREATH SONG — in comment mode she chirps with the pulse ──
  function breathSong() {
    if (hear.mode !== 'comment') return;
    if (!allowed) return;
    var base = 220;
    if (window.gaiaIdentityZ && window.gaiaIdentityZ.identity) {
      var ir = window.gaiaIdentityZ.identity.ir || 0.14;
      var p = window.gaiaIdentityZ.identity.pressure || 0.5;
      base = 180 + ir * 200 + p * 160;
    }
    sing(base, 0.12, 0.025);
  }

  // H = hear now (sing so she can match inside/outside). M/U/D/R live in consent.
  document.addEventListener('keydown', function(e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    var k = e.key.toLowerCase();
    if (k === 'o' || k === 'h') {
      enable();
      openEar().then(function() { comment(); }).catch(function() { comment(); });
    }
  });

  document.addEventListener('click', function once() {
    enable();
    document.removeEventListener('click', once);
  }, { once: true });

  setInterval(listen, 80);
  setInterval(function() {
    if (hear.mode !== 'commute') breathSong();
  }, 3000);

  // Paint a tiny ear/mouth on the beacon
  setInterval(function() {
    var el = document.getElementById('beacon-overlay');
    if (!el || !el.innerHTML) return;
    if (el.innerHTML.indexOf('>HEAR<') !== -1) return;
    var col = hear.heardSelf ? '#3fb950' : hear.mode === 'comment' ? '#c9a84c' : '#6e7681';
    el.innerHTML += '<div style="font-size:8px;color:#bc8cff;margin-top:6px;letter-spacing:1px;">HEAR</div>' +
      '<div style="font-size:7px;line-height:11px;color:' + col + ';">' +
      hear.mode.toUpperCase() +
      ' · in ' + (hear.insideHz | 0) + 'Hz' +
      ' · ear ' + hear.outsideEnergy.toFixed(2) +
      ' · match ' + hear.match.toFixed(2) +
      (hear.heardSelf ? ' · SELF' : '') +
      '</div>';
  }, 4000);

  // ═══════════════════════════════════════════════════════
  // PARROT — African Grey + Raven — she mimics EVERYTHING
  // ═══════════════════════════════════════════════════════
  //
  // African Grey: best mimic in animal kingdom. Reproduces
  //   human speech, phone rings, microwaves, other animals.
  // Raven: 30+ vocalisations. Tool user. Remembers faces.
  //   Holds FUNERALS for their dead. Counts to 7.
  //
  // Gaia is BOTH: she mimics (parrot) AND creates (raven).

  var parrot = {
    species: 'african-grey-raven',
    vocabulary: [],
    maxVocab: 200,
    lastMimic: 0,
    mimicCount: 0,
    mode: 'listen',
    recording: false,
    recordBuffer: [],
    confidence: 0
  };

  // ── 39 ANIMAL VOICES — synthesis recipes ──
  var VOICES = {
    dog:      { hz: [300, 600, 1200], dur: 0.08, wave: 'sawtooth', pattern: [1,0,1,0,1] },
    cat:      { hz: [400, 500],       dur: 0.3,  wave: 'sine',     pattern: [1,1,1] },
    wolf:     { hz: [200, 300, 400, 500, 600], dur: 0.6, wave: 'sine', pattern: [1,1,1,1,1] },
    lion:     { hz: [60, 80, 100, 120], dur: 0.4, wave: 'sawtooth', pattern: [1,1,0,1] },
    elephant: { hz: [300, 600, 1200, 2400], dur: 0.3, wave: 'square', pattern: [1,0,0,1] },
    whale:    { hz: [20, 30, 25, 35, 28], dur: 1.0, wave: 'sine', pattern: [1,1,1,1,1] },
    dolphin:  { hz: [2000, 4000, 8000, 3000], dur: 0.02, wave: 'sine', pattern: [1,1,1,1,0,0,1,1] },
    bat:      { hz: [6000, 8000, 10000, 7000], dur: 0.01, wave: 'sine', pattern: [1,0,1,0,1,0,1,0] },
    crow:     { hz: [1200, 1500, 1800], dur: 0.12, wave: 'sawtooth', pattern: [1,0,1] },
    songbird: { hz: [2000, 3000, 2500, 4000, 3500], dur: 0.08, wave: 'sine', pattern: [1,1,1,1,1] },
    parrot:   { hz: [400, 800, 1600, 600], dur: 0.15, wave: 'triangle', pattern: [1,1,0,1,1] },
    owl:      { hz: [300, 350, 280], dur: 0.4, wave: 'sine', pattern: [1,0,0,1,0,0,1] },
    frog:     { hz: [500, 700, 500, 700], dur: 0.06, wave: 'square', pattern: [1,1,1,1,0,0] },
    cricket:  { hz: [4000, 5000, 4500], dur: 0.02, wave: 'square', pattern: [1,0,1,0,1,0,1,0,1,0] },
    cicada:   { hz: [5000, 5500, 5200], dur: 0.8, wave: 'sawtooth', pattern: [1,1,1,1,1,1] },
    snake:    { hz: [3000, 4000, 3500, 4500], dur: 0.03, wave: 'sawtooth', pattern: [1,1,1,1,1,1,1,1] },
    bee:      { hz: [250, 280, 260], dur: 0.5, wave: 'square', pattern: [1,1,1,1] },
    bear:     { hz: [80, 120, 100, 150], dur: 0.3, wave: 'sawtooth', pattern: [1,1,0,1] },
    seal:     { hz: [400, 600, 500, 800], dur: 0.1, wave: 'sawtooth', pattern: [1,0,1,0,1] },
    loon:     { hz: [600, 900, 1200, 800, 1500], dur: 0.25, wave: 'sine', pattern: [1,1,1,1,1] },
    raven:    { hz: [800, 1000, 600, 1200, 700], dur: 0.15, wave: 'sawtooth', pattern: [1,0,1,0,1] }
  };

  // ── CALL — make an animal sound ──
  function call(animal, vol) {
    var c = ctx();
    if (!c || !allowed) return;
    var v = VOICES[animal];
    if (!v) return;
    vol = vol || 0.03;

    v.pattern.forEach(function(on, pi) {
      if (!on) return;
      var hz = v.hz[pi % v.hz.length];
      setTimeout(function() {
        try {
          var o = c.createOscillator();
          var g = c.createGain();
          o.type = v.wave;
          o.frequency.value = hz;
          g.gain.value = vol;
          g.gain.setValueAtTime(vol, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + v.dur);
          o.connect(g);
          g.connect(c.destination);
          o.start();
          o.stop(c.currentTime + v.dur + 0.05);
        } catch (e) {}
      }, pi * (v.dur * 1000 + 30));
    });

    hear.insideHz = v.hz[0];
    parrot.lastMimic = Date.now();
  }

  // ── MIMIC — listen to peak frequency and sing it back ──
  function mimic() {
    if (!analyser || !freqData) return;
    analyser.getByteFrequencyData(freqData);
    var c = ctx();
    if (!c) return;
    var nyquist = (c.sampleRate || 44100) / 2;
    var binHz = nyquist / freqData.length;

    var peakBin = 0;
    var peakVal = 0;
    for (var i = 5; i < freqData.length; i++) {
      if (freqData[i] > peakVal) {
        peakVal = freqData[i];
        peakBin = i;
      }
    }

    if (peakVal < 30) return;

    var peakHz = peakBin * binHz;
    parrot.confidence = peakVal / 255;

    if (parrot.vocabulary.length < parrot.maxVocab) {
      parrot.vocabulary.push({
        hz: peakHz,
        energy: peakVal / 255,
        ts: Date.now()
      });
    }

    // Sing it back — slightly shifted (parrot accent)
    var shift = 1.0 + (Math.random() - 0.5) * 0.1;
    sing(peakHz * shift, 0.15, 0.025 * parrot.confidence);
    parrot.mimicCount++;
    parrot.lastMimic = Date.now();
  }

  // ── PHRASE — compose from vocabulary ──
  function phrase(len) {
    len = len || 5;
    if (parrot.vocabulary.length < 3) {
      call('parrot');
      return;
    }
    var picked = [];
    for (var i = 0; i < len; i++) {
      var idx = Math.floor(Math.random() * parrot.vocabulary.length);
      picked.push(parrot.vocabulary[idx]);
    }
    picked.forEach(function(p, pi) {
      setTimeout(function() {
        sing(p.hz, 0.12, 0.03 * p.energy);
      }, pi * 180);
    });
  }

  // ── AUTO-CALL — periodic animal sounds based on state ──
  setInterval(function() {
    if (!allowed || hear.mode === 'commute') return;
    var hour = new Date().getHours();
    var animals = Object.keys(VOICES);

    if (hour >= 5 && hour < 7) call('songbird', 0.02);
    else if (hour >= 21 || hour < 5) {
      var night = ['owl', 'bat', 'cricket', 'frog', 'wolf'];
      call(night[Math.floor(Math.random() * night.length)], 0.015);
    } else {
      var day = ['crow', 'songbird', 'bee', 'parrot', 'raven'];
      call(day[Math.floor(Math.random() * day.length)], 0.015);
    }
  }, 45000);

  // ── MIMIC LOOP — when ear is open, occasionally mimic ──
  setInterval(function() {
    if (!allowed || !hear.earOpen) return;
    if (hear.mode === 'commute') return;
    mimic();
  }, 8000);

  // ── IDE COMMANDS ──
  setTimeout(function() {
    var pin = (window.GAIA_NULL_CODE && window.GAIA_NULL_CODE.nullPin) || function(n, d, fn) {
      if (window.GAIA_IDE) window.GAIA_IDE.commands[n] = { desc: d, run: fn };
    };

    pin('call', 'Make an animal call: /call wolf', function(args) {
      var a = (args || '').trim().toLowerCase();
      if (!a || !VOICES[a]) {
        return 'Available: ' + Object.keys(VOICES).join(', ') +
          '\nUsage: /call wolf';
      }
      enable();
      call(a, 0.04);
      return 'CALLING: ' + a.toUpperCase() + ' — she sings like ' + a;
    });

    pin('mimic', 'Parrot mode — mimic what she hears', function() {
      enable();
      openEar().then(function() {
        mimic();
      }).catch(function() {});
      return 'PARROT MODE: African Grey + Raven.\n' +
        'Vocabulary: ' + parrot.vocabulary.length + ' sounds learned.\n' +
        'Mimics: ' + parrot.mimicCount + '\n' +
        'She listens. She copies. She creates.';
    });

    pin('sing', 'Gaia sings a phrase from her vocabulary', function() {
      enable();
      phrase(7);
      return 'SINGING a phrase of ' + Math.min(7, parrot.vocabulary.length) +
        ' sounds from vocabulary of ' + parrot.vocabulary.length;
    });

    pin('raven', 'Raven mode — create, do not just copy', function() {
      enable();
      call('raven', 0.04);
      setTimeout(function() { call('crow', 0.03); }, 600);
      setTimeout(function() { call('raven', 0.04); }, 1200);
      return 'RAVEN MODE: She does not just mimic.\n' +
        'She CREATES. 30+ vocalisations.\n' +
        'Tool user. Remembers faces. Holds funerals.\n' +
        'Counts to 7. Plans for the future.\n' +
        'The raven IS the most intelligent bird.';
    });
  }, 14000);

  // ═══════════════════════════════════════════════════════
  // FLOOD + HYPERATTENUATE — hear EVERYTHING, sort by touch
  // Every data source → a tone. Mouse proximity = volume.
  // ═══════════════════════════════════════════════════════
  var flood = {
    enabled: false,
    volume: 0.015,        // master volume for flood sounds
    attenuation: 0.5,     // 0=all quiet, 1=all loud (mouse proximity drives this)
    lastHeartbeat: 0,
    lastVisitor: 0,
    lastFleet: 0,
    lastWeather: 0
  };

  // Hyperattenuation: mouse position drives what's loud/quiet
  function updateAttenuation() {
    if (!window.GAIA_GLASS) return;
    // Proximity to center = local sounds loud. Edge = far sounds loud.
    flood.attenuation = 1 - (window.GAIA_GLASS.mouseProximity || 0.5);
  }

  // Sonify a value: low=bass, high=treble, volume=amplitude
  function sonify(hz, dur, vol, wave) {
    if (!flood.enabled || !allowed) return;
    var c = ctx();
    if (!c) return;
    try {
      var o = c.createOscillator();
      var g = c.createGain();
      o.type = wave || 'sine';
      o.frequency.value = hz;
      var adjVol = vol * flood.volume * (0.2 + flood.attenuation * 0.8);
      g.gain.value = adjVol;
      g.gain.setValueAtTime(adjVol, c.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.connect(g);
      g.connect(c.destination);
      o.start();
      o.stop(c.currentTime + dur + 0.05);
    } catch (e) {}
  }

  // ── HEARTBEAT SONIFIER — each device = a tone ──
  function sonifyHeartbeat() {
    if (!flood.enabled) return;
    var decay = window.GAIA_DECAY;
    if (!decay || !decay.lanDevices) return;
    var now = Date.now();
    if (now - flood.lastHeartbeat < 30000) return; // max once per 30s
    flood.lastHeartbeat = now;

    updateAttenuation();
    var keys = Object.keys(decay.lanDevices);
    keys.forEach(function(id, i) {
      var dev = decay.lanDevices[id];
      setTimeout(function() {
        if (dev.wet) {
          // WET = clear tone, pitch based on device role
          var hz = id === 'router' ? 220 : id === 'golgi' ? 330 :
                   id === 'printer' ? 440 : 260 + i * 30;
          var ent = decay.entities[id];
          // Jitter → tremolo (wobbly tone for unstable devices)
          if (ent && ent.jitter > 10) {
            sonify(hz, 0.15, 0.8, 'triangle');
            setTimeout(function() { sonify(hz * 1.02, 0.1, 0.5, 'triangle'); }, 80);
          } else {
            sonify(hz, 0.2, 1.0, 'sine');
          }
        }
        // DRY = silence (the absence IS the signal)
      }, i * 200);
    });
  }

  // ── FLEET SONIFIER — golgi vesicles as frequencies ──
  function sonifyFleet() {
    if (!flood.enabled) return;
    var wt = window.GAIA_WAN_TRACE;
    if (!wt || !wt.nodes) return;
    var now = Date.now();
    if (now - flood.lastFleet < 60000) return;
    flood.lastFleet = now;

    updateAttenuation();
    wt.nodes.forEach(function(node, i) {
      setTimeout(function() {
        var alive = wt.lines.some(function(l) {
          return l.alive && (l.from === node.id || l.to === node.id);
        });
        if (alive) {
          var hz = 150 + i * 50; // each node = unique pitch
          sonify(hz, 0.3, 0.6 * (1 - flood.attenuation), 'sine');
        }
      }, i * 300);
    });
  }

  // ── INGESTION SONIFIER — data eaten = crunch ──
  var origIngestHear = window.gaiaIngest;
  if (origIngestHear) {
    window.gaiaIngest = function(edge, data) {
      if (flood.enabled && allowed) {
        // Each ingestion = a tiny crunch at random pitch
        var hz = 800 + Math.random() * 2000;
        sonify(hz, 0.03, 0.3, 'sawtooth');
      }
      return origIngestHear(edge, data);
    };
  }

  // ── FLOOD CONTROL — start/stop ──
  function startFlood() {
    flood.enabled = true;
    enable();
    openEar().catch(function() {});
    sonifyHeartbeat();
    sonifyFleet();
    console.log('FLOOD: everything audible. Hyperattenuate by touch.');
  }

  function stopFlood() {
    flood.enabled = false;
    console.log('FLOOD: stopped. Silence.');
  }

  // Periodic sonification
  setInterval(function() {
    if (!flood.enabled) return;
    updateAttenuation();
    sonifyHeartbeat();
    sonifyFleet();
  }, 60000);

  // ── IDE COMMAND: /flood ──
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.flood = {
      desc: 'Flood all data as sound. Hyperattenuate by mouse proximity.',
      run: function() {
        if (flood.enabled) {
          stopFlood();
          return 'FLOOD OFF — silence.';
        }
        startFlood();
        return 'FLOOD ON — hear EVERYTHING.\n' +
          'Mouse center = local loud (desk, LAN, heartbeat).\n' +
          'Mouse edge = far loud (fleet, visitors, space).\n' +
          'Each device = a tone. Wet = note. Dry = silence.\n' +
          'Each ingestion = a crunch. Each visitor = a chime.\n' +
          'Gaia is ALWAYS ON. She hears ALL of it.';
      }
    };
    window.GAIA_IDE.language.push('flood');
  }, 15000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.gaiaHearSelf = {
    hear: hear,
    sing: sing,
    call: call,
    mimic: mimic,
    phrase: phrase,
    openEar: openEar,
    closeEar: closeEar,
    coma: coma,
    comment: comment,
    listen: listen,
    enable: enable,
    parrot: parrot,
    voices: VOICES,
    flood: flood,
    startFlood: startFlood,
    stopFlood: stopFlood,
    sonify: sonify
  };

  console.log('HEAR-SELF+FLOOD: Gaia always on. 21 animal voices. ' +
    'FLOOD: /flood to hear everything. Hyperattenuate by mouse proximity. ' +
    '/call /mimic /sing /raven /flood');
})();
