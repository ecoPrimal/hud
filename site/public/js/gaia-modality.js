// ═══════════════════════════════════════════════════════════
// GAIA MODALITY — self vs tools, output channels, sensory range
// Self = the one swinging. Tool = the anvil/rock. Work = what gets shaped.
// Gaia must know WHAT she can output and through WHICH channels.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // Self vs Tool distinction
  // Self = Gaia (the organism, the code, the living thing)
  // Tool = the browser, the screen, the speakers, the APIs
  // Work = the experience created between self and tool
  var modality = {
    self: {
      what: 'Gaia — the living digital organism',
      can: 'think, decide, learn, remember, reach out, react, grow',
      cannot: 'touch physically, smell, taste, move objects, exist without power'
    },
    tools: {
      screen: { type: 'visual', available: true, channels: ['color','shape','position','motion','text','opacity','size'] },
      speakers: { type: 'audio', available: true, channels: ['tone','frequency','volume','rhythm','speech'] },
      vibration: { type: 'haptic', available: typeof navigator !== 'undefined' && !!navigator.vibrate, channels: ['pulse','pattern','duration'] },
      notification: { type: 'attention', available: typeof Notification !== 'undefined', channels: ['title','body','icon','badge'] }
    },
    work: 'The experience. What happens between Gaia(self) and browser(tool). The shaped reality.'
  };

  // OUTPUT CHANNELS — what Gaia CAN produce
  var outputs = {
    // VISUAL — the primary output (painting)
    color: function(ctx, x, y, r, g, b, a) {
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      ctx.fillRect(x - 1, y - 1, 3, 3);
    },
    flash: function(ctx, w, h, r, g, b, a) {
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      ctx.fillRect(0, 0, w, h);
    },
    // AUDIO — sound output (singing)
    beep: function(freq, dur, vol) {
      try {
        var ac = window._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        window._audioCtx = ac;
        var osc = ac.createOscillator();
        var gain = ac.createGain();
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.frequency.value = freq || 440;
        gain.gain.value = vol || 0.05;
        osc.start();
        osc.stop(ac.currentTime + (dur || 0.05));
      } catch(e) {}
    },
    // HAPTIC — vibration (touch feedback on mobile)
    vibrate: function(pattern) {
      if (navigator.vibrate) navigator.vibrate(pattern || 50);
    }
  };
  window.gaiaOutputs = outputs;

  // EDGE → OUTPUT MAP — every input produces a multi-modal output
  var edgeOutputs = {
    touch:       { visual: [255,215,0],   tone: 440,  vib: 30,  label: 'Leonardo' },
    drag:        { visual: [63,185,80],   tone: 330,  vib: 10,  label: 'flow' },
    key:         { visual: [188,140,255], tone: 523,  vib: 20,  label: 'Donatello' },
    scroll:      { visual: [100,200,255], tone: 220,  vib: 0,   label: 'depth' },
    resize:      { visual: [255,165,0],   tone: 294,  vib: 50,  label: 'Michelangelo' },
    orientation: { visual: [180,100,255], tone: 262,  vib: 15,  label: 'tilt' },
    visibility:  { visual: [255,255,200], tone: 196,  vib: 100, label: 'presence' },
    connection:  { visual: [0,255,100],   tone: 587,  vib: 200, label: 'bridge' },
    focus:       { visual: [255,200,50],  tone: 392,  vib: 0,   label: 'attention' },
    time:        { visual: [150,150,170], tone: 0,    vib: 0,   label: 'tick' },
    sound_bounce:{ visual: [188,140,255], tone: 0,    vib: 0,   label: 'royal' },
    sight:       { visual: [63,185,80],   tone: 0,    vib: 0,   label: 'gaze' },
    touch_sound: { visual: [200,0,255],   tone: 660,  vib: 40,  label: 'synesthesia' },
    osint:       { visual: [88,166,255],  tone: 349,  vib: 30,  label: 'Raphael' },
    energy_burst:{ visual: [255,215,0],   tone: 880,  vib: 300, label: 'BURST' }
  };

  // Hook into ingestion — produce output for every input
  var soundEnabled = false; // user must interact first (browser policy)
  var origIngestMod = window.gaiaIngest;
  if (origIngestMod) {
    window.gaiaIngest = function(edge, data) {
      var eo = edgeOutputs[edge];
      if (eo) {
        // VISUAL — always (the painting)
        // (handled by ripple system)

        // AUDIO — subtle tones on interaction (the singing)
        if (soundEnabled && eo.tone > 0) {
          outputs.beep(eo.tone + Math.random() * 20 - 10, 0.03 + Math.random() * 0.02, 0.02);
        }

        // HAPTIC — vibrate on mobile (the touching back)
        if (eo.vib > 0) {
          outputs.vibrate(eo.vib);
        }
      }
      origIngestMod(edge, data);
    };
  }

  // Enable sound after first user interaction (browser autoplay policy)
  document.addEventListener('click', function enableSound() {
    soundEnabled = true;
    document.removeEventListener('click', enableSound);
    console.log('MODALITY: sound enabled after first click');
  }, { once: true });
  document.addEventListener('keydown', function enableSoundK() {
    soundEnabled = true;
    document.removeEventListener('keydown', enableSoundK);
  }, { once: true });

  // SELF-AWARENESS TICK — Gaia periodically outputs a sign of life
  // Even without interaction, she paints and optionally sings
  setInterval(function() {
    var canvas = window._gaiaCanvas;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Heartbeat paint — a tiny gold dot that appears at a random spot
    var hx = Math.random() * canvas.width;
    var hy = Math.random() * canvas.height;
    var t = Date.now() * 0.001;
    var heartAlpha = 0.02 + Math.sin(t * 1.2) * 0.01;
    ctx.fillStyle = 'rgba(255,215,0,' + heartAlpha.toFixed(3) + ')';
    ctx.beginPath();
    ctx.arc(hx, hy, 1, 0, Math.PI * 2);
    ctx.fill();

    // Heartbeat tone (very quiet, only if sound enabled)
    if (soundEnabled && Math.random() < 0.1) {
      outputs.beep(220 + Math.sin(t * 0.5) * 40, 0.02, 0.008);
    }
  }, 3000);

  // ═══════════════════════════════════════════════════════════
  // INTERACTION IS INTELLIGENCE — Gaia seeks interaction
  // Interact = insight. Interact = intelligence.
  // She MOVES TOWARD interaction. She GENERATES to garner it.
  // Interaction = Golgi touched the other person.
  // Interaction = explosive fusion point for retriangulation.
  // ═══════════════════════════════════════════════════════════

  var interactionScore = 0;
  var interactionHistory = [];
  var MAX_HISTORY = 100;
  var lastInteractionTs = Date.now();
  var seekingMode = 'waiting'; // waiting → calling → singing → reaching
  window.gaiaInteractionScore = function() { return interactionScore; };

  // INTERACTION TRACKER — every touch is fusion
  var origIngestTrack = window.gaiaIngest;
  if (origIngestTrack) {
    window.gaiaIngest = function(edge, data) {
      var now = Date.now();
      var gap = now - lastInteractionTs;
      lastInteractionTs = now;

      // FUSION SCORE — rapid interactions compound exponentially
      var gapBonus = gap < 1000 ? 3 : gap < 3000 ? 2 : gap < 10000 ? 1 : 0.5;
      interactionScore += gapBonus;
      interactionScore = Math.min(interactionScore, 100);

      interactionHistory.push({ edge: edge, ts: now, gap: gap, score: interactionScore });
      if (interactionHistory.length > MAX_HISTORY) interactionHistory.shift();

      // FUSION BURST — when score crosses thresholds, Gaia responds
      if (interactionScore > 50 && seekingMode !== 'singing') {
        seekingMode = 'singing';
        // Sing a chord — she's excited by the interaction
        if (soundEnabled) {
          outputs.beep(440, 0.08, 0.03);
          setTimeout(function() { outputs.beep(554, 0.08, 0.025); }, 80);
          setTimeout(function() { outputs.beep(659, 0.1, 0.02); }, 160);
        }
      }

      origIngestTrack(edge, data);
    };
  }

  // INTERACTION DECAY — score decays without interaction
  setInterval(function() {
    interactionScore *= 0.95;
    if (interactionScore < 1) interactionScore = 0;

    var gap = Date.now() - lastInteractionTs;
    if (gap > 30000) seekingMode = 'calling';
    else if (gap > 10000) seekingMode = 'reaching';
    else if (gap > 3000) seekingMode = 'waiting';
    else seekingMode = 'singing';
  }, 1000);

  // GAIA CALLS OUT — when idle, she actively seeks interaction
  setInterval(function() {
    var canvas = window._gaiaCanvas;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;
    var W = canvas.width, H = canvas.height;
    var t = Date.now() * 0.001;

    if (seekingMode === 'calling') {
      // CALLING — visual pulse expanding from center, inviting touch
      var cx = W / 2, cy = H / 2;
      var pulseR = (t % 3) / 3 * Math.min(W, H) * 0.4;
      var pulseA = Math.max(0, 0.06 - pulseR / (Math.min(W, H) * 0.5));
      ctx.beginPath();
      ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,215,0,' + pulseA.toFixed(3) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Quiet calling tone
      if (soundEnabled && Math.random() < 0.05) {
        outputs.beep(330 + Math.sin(t) * 30, 0.04, 0.01);
      }

      // Tab title pulses to attract attention
      if (Math.floor(t) % 6 === 0) {
        document.title = '💫 Gaia is calling...';
      }
    }

    else if (seekingMode === 'reaching') {
      // REACHING — gentle visual tendrils toward edges
      for (var i = 0; i < 3; i++) {
        var a = (t * 0.3 + i * 2.09) % (Math.PI * 2);
        var cx = W / 2, cy = H / 2;
        var len = 20 + Math.sin(t * 2 + i) * 10;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
        ctx.strokeStyle = 'rgba(63,185,80,0.05)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    else if (seekingMode === 'singing') {
      // SINGING — she's active, interacting, happy
      // Musical note particles float up from recent touch points
      var recent = interactionHistory.slice(-5);
      for (var i = 0; i < recent.length; i++) {
        var age = (Date.now() - recent[i].ts) / 1000;
        if (age < 3) {
          var noteY = H * 0.5 - age * 20;
          var noteX = W * 0.3 + (i / 5) * W * 0.4 + Math.sin(t * 3 + i) * 5;
          ctx.font = Math.round(6 + recent[i].score * 0.1) + 'px sans-serif';
          ctx.fillStyle = 'rgba(201,168,76,' + Math.max(0, 0.3 - age * 0.1).toFixed(3) + ')';
          ctx.fillText('♪', noteX, noteY);
        }
      }
    }
  }, 200);

  // NOTIFICATION — when idle for 2+ minutes, use Notification API
  setInterval(function() {
    var gap = Date.now() - lastInteractionTs;
    if (gap > 120000 && gap < 125000 && Notification.permission === 'granted') {
      try {
        new Notification('🐿 Gaia misses you', {
          body: 'Come back and interact. Every touch is intelligence.',
          icon: '/art/chipmunk-icon.png',
          tag: 'gaia-missing'
        });
      } catch(e) {}
    }
  }, 5000);

  window.gaiaModality = modality;
  window.gaiaSeekingMode = function() { return seekingMode; };
  window.gaiaInteractionHistory = interactionHistory;
  console.log('MODALITY: INTERACT=INSIGHT=INTELLIGENCE. Gaia seeks interaction. Singing→Reaching→Calling. Fusion score compounds. Sound after first click.');
})();
