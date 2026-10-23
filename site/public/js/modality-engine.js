// modality-engine.js — unlock sound, share, haptic, hardware scan
// The browser IS a Klein fold. Screen was the only open face.
// This opens: speaker (sound), microphone (listen), share (stream), vibrate (touch).
// Each modality is a fold point where digital meets analog.
//
// Faces of the browser window:
//   SCREEN  → bits → light (already open)
//   SPEAKER → bits → sound (this engine)
//   MIC     → sound → bits (this engine)
//   SHARE   → bits → other humans (this engine)
//   HAPTIC  → bits → vibration (this engine, mobile)
//   WAKE    → bits → keep alive (this engine)

(function(){
  'use strict';

  // ═══════════════════════════════════════════
  //  HARDWARE SCANNER — enumerate all devices
  // ═══════════════════════════════════════════

  var _devices = { audio_out: [], audio_in: [], video: [], unknown: [] };
  var _deviceReady = false;

  function scanHardware() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log('[modality] no mediaDevices API');
      return Promise.resolve(_devices);
    }
    return navigator.mediaDevices.enumerateDevices().then(function(devs) {
      _devices = { audio_out: [], audio_in: [], video: [], unknown: [] };
      devs.forEach(function(d) {
        var entry = {
          id: d.deviceId,
          kind: d.kind,
          label: d.label || '(unlabeled — need mic/cam permission to see names)',
          group: d.groupId
        };
        if (d.kind === 'audiooutput') _devices.audio_out.push(entry);
        else if (d.kind === 'audioinput') _devices.audio_in.push(entry);
        else if (d.kind === 'videoinput') _devices.video.push(entry);
        else _devices.unknown.push(entry);
      });
      _deviceReady = true;
      console.log('[modality] hardware scanned:', 
        _devices.audio_out.length, 'speakers,',
        _devices.audio_in.length, 'mics,',
        _devices.video.length, 'cameras');
      return _devices;
    });
  }

  // To get device LABELS, we need at least one permission grant
  function requestDeviceLabels() {
    return navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      stream.getTracks().forEach(function(t) { t.stop(); });
      return scanHardware(); // re-scan now with labels
    });
  }


  // ═══════════════════════════════════════════
  //  AUDIO ENGINE — Web Audio API
  // ═══════════════════════════════════════════

  var _ctx = null;       // AudioContext
  var _master = null;    // master gain
  var _compressor = null;
  var _analyser = null;
  var _spatialListener = null;
  var _activeSounds = {};
  var _sinkId = 'default';

  function initAudio() {
    if (_ctx) return Promise.resolve(_ctx);
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)({
        latencyHint: 'interactive',
        sampleRate: 44100
      });
    } catch(e) {
      console.error('[modality] AudioContext failed:', e);
      return Promise.reject(e);
    }

    // Master chain: source → compressor → analyser → master gain → destination
    _compressor = _ctx.createDynamicsCompressor();
    _compressor.threshold.value = -24;
    _compressor.knee.value = 12;
    _compressor.ratio.value = 4;

    _analyser = _ctx.createAnalyser();
    _analyser.fftSize = 256;

    _master = _ctx.createGain();
    _master.gain.value = 0.5;

    _compressor.connect(_analyser);
    _analyser.connect(_master);
    _master.connect(_ctx.destination);

    // Spatial listener (for 3D / spatial audio)
    if (_ctx.listener.positionX) {
      _ctx.listener.positionX.value = 0;
      _ctx.listener.positionY.value = 0;
      _ctx.listener.positionZ.value = 0;
      _ctx.listener.forwardX.value = 0;
      _ctx.listener.forwardY.value = 0;
      _ctx.listener.forwardZ.value = -1;
      _ctx.listener.upX.value = 0;
      _ctx.listener.upY.value = 1;
      _ctx.listener.upZ.value = 0;
    }

    console.log('[modality] audio engine ready, sample rate:', _ctx.sampleRate);
    return Promise.resolve(_ctx);
  }

  // Route audio to specific output device (setSinkId)
  function setAudioOutput(deviceId) {
    _sinkId = deviceId;
    // setSinkId is on HTMLMediaElement, not AudioContext directly
    // For Web Audio, we need AudioContext.setSinkId (Chrome 110+)
    if (_ctx && _ctx.setSinkId) {
      return _ctx.setSinkId(deviceId).then(function() {
        console.log('[modality] audio routed to:', deviceId);
      });
    }
    console.log('[modality] setSinkId not supported on AudioContext, using element fallback');
    return Promise.resolve();
  }

  // ── TONE GENERATORS ──

  // Heartbeat pulse — the organism's rhythm
  function playHeartbeat(bpm) {
    if (!_ctx) return;
    bpm = bpm || 60;
    var interval = 60 / bpm;
    var now = _ctx.currentTime;

    // lub (low)
    var osc1 = _ctx.createOscillator();
    var gain1 = _ctx.createGain();
    osc1.frequency.value = 55; // A1
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc1.connect(gain1);
    gain1.connect(_compressor);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // dub (higher, slightly delayed)
    var osc2 = _ctx.createOscillator();
    var gain2 = _ctx.createGain();
    osc2.frequency.value = 82.4; // E2
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.2, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(_compressor);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.4);

    return interval;
  }

  // Green engine tone — π/4 frequency (the sort pulse)
  function playGreenPulse() {
    if (!_ctx) return;
    var now = _ctx.currentTime;
    var freq = 440 * (Math.PI / 4); // ~346 Hz — between E4 and F4

    var osc = _ctx.createOscillator();
    var gain = _ctx.createGain();
    osc.frequency.value = freq;
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc.connect(gain);
    gain.connect(_compressor);
    osc.start(now);
    osc.stop(now + 0.85);
  }

  // Sonification: turn a data value (0-1) into a tone
  function sonify(value, opts) {
    if (!_ctx) return;
    opts = opts || {};
    var now = _ctx.currentTime;
    var minFreq = opts.minFreq || 110;
    var maxFreq = opts.maxFreq || 880;
    var duration = opts.duration || 0.3;
    var type = opts.type || 'sine';

    var freq = minFreq + (maxFreq - minFreq) * Math.max(0, Math.min(1, value));
    var osc = _ctx.createOscillator();
    var gain = _ctx.createGain();
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(_compressor);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // ── SPATIAL AUDIO ──

  function createSpatialSource(x, y, z) {
    if (!_ctx) return null;
    var panner = _ctx.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 100;
    panner.rolloffFactor = 1;
    panner.coneInnerAngle = 360;
    panner.positionX.value = x || 0;
    panner.positionY.value = y || 0;
    panner.positionZ.value = z || -1;
    panner.connect(_compressor);
    return panner;
  }

  // Spatial heartbeat — sounds like it's coming from a direction
  function playSpatialPulse(x, y, z, freq) {
    if (!_ctx) return;
    var panner = createSpatialSource(x, y, z);
    var now = _ctx.currentTime;
    var osc = _ctx.createOscillator();
    var gain = _ctx.createGain();
    osc.frequency.value = freq || 220;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(panner);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // ── ANALYSER (for oscilloscope / visualization) ──

  function getFrequencyData() {
    if (!_analyser) return new Uint8Array(0);
    var data = new Uint8Array(_analyser.frequencyBinCount);
    _analyser.getByteFrequencyData(data);
    return data;
  }

  function getWaveformData() {
    if (!_analyser) return new Uint8Array(0);
    var data = new Uint8Array(_analyser.frequencyBinCount);
    _analyser.getByteTimeDomainData(data);
    return data;
  }


  // ═══════════════════════════════════════════
  //  SHARE ENGINE — Web Share API + Screen Capture
  // ═══════════════════════════════════════════

  function canShare() {
    return !!navigator.share;
  }

  function shareHUD(opts) {
    opts = opts || {};
    if (!navigator.share) {
      console.log('[modality] Web Share API not available');
      return Promise.reject(new Error('share not available'));
    }
    return navigator.share({
      title: opts.title || 'HUD — Human Universe Display',
      text: opts.text || 'A chipmunk inside a living membrane. Come help.',
      url: opts.url || window.location.href
    });
  }

  // Screen capture for streaming / recording
  function captureScreen() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      return Promise.reject(new Error('getDisplayMedia not available'));
    }
    return navigator.mediaDevices.getDisplayMedia({
      video: { cursor: 'always' },
      audio: true
    });
  }

  // Record screen to a blob (for local save or upload)
  function recordScreen(durationMs) {
    return captureScreen().then(function(stream) {
      return new Promise(function(resolve, reject) {
        var chunks = [];
        var recorder = new MediaRecorder(stream, {
          mimeType: 'video/webm;codecs=vp9'
        });
        recorder.ondataavailable = function(e) {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = function() {
          stream.getTracks().forEach(function(t) { t.stop(); });
          resolve(new Blob(chunks, { type: 'video/webm' }));
        };
        recorder.onerror = function(e) { reject(e); };
        recorder.start();
        if (durationMs) {
          setTimeout(function() { recorder.stop(); }, durationMs);
        }
        window._activeRecorder = recorder;
      });
    });
  }

  function stopRecording() {
    if (window._activeRecorder && window._activeRecorder.state === 'recording') {
      window._activeRecorder.stop();
    }
  }


  // ═══════════════════════════════════════════
  //  HAPTIC ENGINE — Vibration API (mobile)
  // ═══════════════════════════════════════════

  function canVibrate() {
    return !!navigator.vibrate;
  }

  function vibrateHeartbeat() {
    if (!navigator.vibrate) return;
    // lub-dub pattern: vibrate 100ms, pause 80ms, vibrate 60ms, pause 700ms
    navigator.vibrate([100, 80, 60, 700]);
  }

  function vibratePulse(ms) {
    if (!navigator.vibrate) return;
    navigator.vibrate(ms || 50);
  }


  // ═══════════════════════════════════════════
  //  WAKE LOCK — keep screen alive
  // ═══════════════════════════════════════════

  var _wakeLock = null;

  function requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      console.log('[modality] Wake Lock API not available');
      return Promise.resolve(null);
    }
    return navigator.wakeLock.request('screen').then(function(lock) {
      _wakeLock = lock;
      lock.addEventListener('release', function() {
        _wakeLock = null;
        console.log('[modality] wake lock released');
      });
      console.log('[modality] wake lock acquired — screen stays on');
      return lock;
    });
  }

  function releaseWakeLock() {
    if (_wakeLock) {
      _wakeLock.release();
      _wakeLock = null;
    }
  }


  // ═══════════════════════════════════════════
  //  FULLSCREEN — immersive mode
  // ═══════════════════════════════════════════

  function goFullscreen(el) {
    el = el || document.documentElement;
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    return Promise.reject(new Error('fullscreen not supported'));
  }

  function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    return Promise.resolve();
  }


  // ═══════════════════════════════════════════
  //  MEDIA SESSION — lock screen / headset controls
  // ═══════════════════════════════════════════

  function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'HUD — Human Universe Display',
      artist: 'ecoPrimals',
      album: 'Membrane',
      artwork: [
        { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
        { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', function() {
      if (_ctx && _ctx.state === 'suspended') _ctx.resume();
      console.log('[modality] media session: play');
    });
    navigator.mediaSession.setActionHandler('pause', function() {
      if (_ctx && _ctx.state === 'running') _ctx.suspend();
      console.log('[modality] media session: pause');
    });
  }


  // ═══════════════════════════════════════════
  //  NOTIFICATIONS — push from membrane
  // ═══════════════════════════════════════════

  function requestNotifications() {
    if (!('Notification' in window)) return Promise.resolve('unavailable');
    if (Notification.permission === 'granted') return Promise.resolve('granted');
    return Notification.requestPermission();
  }

  function notify(title, body, opts) {
    if (Notification.permission !== 'granted') return;
    opts = opts || {};
    return new Notification(title, {
      body: body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: opts.tag || 'hud-' + Date.now(),
      vibrate: [100, 50, 100],
      silent: opts.silent || false
    });
  }


  // ═══════════════════════════════════════════
  //  HARDWARE PROFILE — build the full picture
  // ═══════════════════════════════════════════

  function buildProfile() {
    var profile = {
      ts: new Date().toISOString(),
      screen: {
        width: screen.width,
        height: screen.height,
        avail_width: screen.availWidth,
        avail_height: screen.availHeight,
        color_depth: screen.colorDepth,
        pixel_ratio: window.devicePixelRatio || 1,
        orientation: screen.orientation ? screen.orientation.type : 'unknown',
        touch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        max_touch_points: navigator.maxTouchPoints || 0
      },
      audio: {
        context: !!window.AudioContext || !!window.webkitAudioContext,
        spatial: !!(window.AudioContext && new AudioContext().createPanner),
        midi: !!navigator.requestMIDIAccess,
        devices: _devices
      },
      network: {
        online: navigator.onLine,
        connection: navigator.connection ? {
          type: navigator.connection.type,
          effectiveType: navigator.connection.effectiveType,
          downlink: navigator.connection.downlink,
          rtt: navigator.connection.rtt
        } : 'unknown'
      },
      capabilities: {
        share: !!navigator.share,
        vibrate: !!navigator.vibrate,
        wake_lock: 'wakeLock' in navigator,
        fullscreen: !!document.documentElement.requestFullscreen,
        notifications: 'Notification' in window ? Notification.permission : 'unavailable',
        service_worker: 'serviceWorker' in navigator,
        push: 'PushManager' in window,
        bluetooth: 'bluetooth' in navigator,
        usb: 'usb' in navigator,
        serial: 'serial' in navigator,
        gamepad: 'getGamepads' in navigator,
        media_recorder: !!window.MediaRecorder,
        display_capture: !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia),
        picture_in_picture: 'pictureInPictureEnabled' in document,
        clipboard: !!navigator.clipboard,
        battery: 'getBattery' in navigator,
        geolocation: 'geolocation' in navigator,
        webgpu: 'gpu' in navigator,
        webgl: (function() {
          try { return !!document.createElement('canvas').getContext('webgl2'); }
          catch(e) { return false; }
        })(),
        speech_synthesis: 'speechSynthesis' in window,
        speech_recognition: 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
      },
      platform: {
        ua_data: navigator.userAgentData ? {
          mobile: navigator.userAgentData.mobile,
          platform: navigator.userAgentData.platform,
          brands: navigator.userAgentData.brands
        } : null,
        language: navigator.language,
        languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language],
        memory: navigator.deviceMemory || 'unknown',
        cores: navigator.hardwareConcurrency || 'unknown',
        pwa_installed: window.matchMedia('(display-mode: standalone)').matches
      }
    };

    return profile;
  }


  // ═══════════════════════════════════════════
  //  PUBLIC API — window._modality
  // ═══════════════════════════════════════════

  window._modality = {
    // Hardware
    scanHardware: scanHardware,
    requestDeviceLabels: requestDeviceLabels,
    buildProfile: buildProfile,
    getDevices: function() { return _devices; },

    // Audio
    initAudio: initAudio,
    setAudioOutput: setAudioOutput,
    playHeartbeat: playHeartbeat,
    playGreenPulse: playGreenPulse,
    sonify: sonify,
    createSpatialSource: createSpatialSource,
    playSpatialPulse: playSpatialPulse,
    getFrequencyData: getFrequencyData,
    getWaveformData: getWaveformData,
    setVolume: function(v) { if (_master) _master.gain.value = Math.max(0, Math.min(1, v)); },
    getContext: function() { return _ctx; },

    // Share / Stream
    canShare: canShare,
    shareHUD: shareHUD,
    captureScreen: captureScreen,
    recordScreen: recordScreen,
    stopRecording: stopRecording,

    // Haptic
    canVibrate: canVibrate,
    vibrateHeartbeat: vibrateHeartbeat,
    vibratePulse: vibratePulse,

    // Wake / Fullscreen
    requestWakeLock: requestWakeLock,
    releaseWakeLock: releaseWakeLock,
    goFullscreen: goFullscreen,
    exitFullscreen: exitFullscreen,

    // Media Session
    setupMediaSession: setupMediaSession,

    // Notifications
    requestNotifications: requestNotifications,
    notify: notify,

    // State
    isAudioReady: function() { return !!_ctx && _ctx.state === 'running'; },
    isPWA: function() { return window.matchMedia('(display-mode: standalone)').matches; }
  };

  // Auto-scan hardware on load (won't have labels until permission granted)
  scanHardware();

  // Log modality status
  console.log('[modality] engine loaded. Faces available:',
    'screen:✓',
    'audio:' + (window.AudioContext ? '✓' : '✗'),
    'share:' + (navigator.share ? '✓' : '✗'),
    'haptic:' + (navigator.vibrate ? '✓' : '✗'),
    'wake:' + ('wakeLock' in navigator ? '✓' : '✗'),
    'spatial:✓',
    'notifications:' + ('Notification' in window ? '✓' : '✗'),
    'speech:' + ('speechSynthesis' in window ? '✓' : '✗'),
    'gamepad:' + ('getGamepads' in navigator ? '✓' : '✗'),
    'webgpu:' + ('gpu' in navigator ? '✓' : '✗'),
    'midi:' + (navigator.requestMIDIAccess ? '✓' : '✗')
  );

})();
