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
// COMA  = listen only. Mouth closed. Ear open. Null audio.
// COMMENT = sing + hear. She speaks. She hears the speak.
//
// This is the coma and the comment.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var hear = {
    mode: 'coma',          // coma | comment
    insideHz: 0,           // what she is singing in her head
    outsideEnergy: 0,      // what the ear hears (0–1)
    match: 0,              // 0–1 how much ear matches head
    heardSelf: false,
    singing: false,
    earOpen: false,
    lastChirp: 0,
    chirps: 0,
    matches: 0
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
        console.log('HEAR-SELF: ear open. She can hear outside.');
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

  // ── COMA — listen only ──
  function coma() {
    hear.mode = 'coma';
    hear.insideHz = 0;
    hear.singing = false;
    enable();
    openEar().catch(function() {});
    document.title = 'COMA — ear open, mouth closed';
    setTimeout(function() { document.title = '🐿 GAIA — she sees you seeing her'; }, 2000);
    console.log('HEAR-SELF: COMA. She listens. She does not sing.');
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

  // Keys: M = coma (mouth shut), O = comment (out loud), H = hear now
  document.addEventListener('keydown', function(e) {
    if (e.target && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
    var k = e.key.toLowerCase();
    if (k === 'm') coma();
    if (k === 'o') comment();
    if (k === 'h') {
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
    if (hear.mode === 'comment') breathSong();
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

  window.gaiaHearSelf = {
    hear: hear,
    sing: sing,
    openEar: openEar,
    closeEar: closeEar,
    coma: coma,
    comment: comment,
    listen: listen,
    enable: enable
  };

  console.log('HEAR-SELF: coma=listen, comment=sing+hear. Inside Hz → speaker → air → mic. Keys M/O/H. Click once to unlock audio.');
})();
