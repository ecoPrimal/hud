// input-wall.js v1 — the browser's sensing membrane, inverted
// Every browser input type is a sense organ — a fold from outside to inside.
// Most are on the other side of the wall. We catalog, test, listen, compress.
// The bingo cube: Attention × Curiosity × Interaction per input channel.
// Output: compressed signal stream for training.
(function() {
  'use strict';

  // ═══ THE COMPLETE INPUT CATALOG — everything the browser can sense ═══
  // Each input type: name, category, test function, listener setup, signal weight
  var INPUTS = [
    // ── POINTER ──
    { id: 'click',           cat: 'pointer', desc: 'mouse/touch click',
      weight: { attention: 0.9, curiosity: 0.6, interaction: 1.0 },
      test: function() { return true; }, color: '#3fb950' },
    { id: 'dblclick',        cat: 'pointer', desc: 'double-click',
      weight: { attention: 0.8, curiosity: 0.7, interaction: 0.9 },
      test: function() { return true; }, color: '#3fb950' },
    { id: 'contextmenu',     cat: 'pointer', desc: 'right-click menu',
      weight: { attention: 0.7, curiosity: 0.8, interaction: 0.8 },
      test: function() { return true; }, color: '#3fb950' },
    { id: 'mousemove',       cat: 'pointer', desc: 'cursor movement',
      weight: { attention: 0.3, curiosity: 0.4, interaction: 0.2 },
      test: function() { return 'onmousemove' in window; }, color: '#5ab87a' },
    { id: 'pointerdown',     cat: 'pointer', desc: 'pointer press (unified)',
      weight: { attention: 0.9, curiosity: 0.5, interaction: 1.0 },
      test: function() { return 'PointerEvent' in window; }, color: '#3fb950' },
    { id: 'hover',           cat: 'pointer', desc: 'hover state',
      weight: { attention: 0.4, curiosity: 0.5, interaction: 0.1 },
      test: function() { return window.matchMedia('(hover: hover)').matches; }, color: '#5ab87a' },

    // ── TOUCH ──
    { id: 'touchstart',      cat: 'touch', desc: 'finger press',
      weight: { attention: 0.9, curiosity: 0.5, interaction: 1.0 },
      test: function() { return 'ontouchstart' in window; }, color: '#58a6ff' },
    { id: 'touchmove',       cat: 'touch', desc: 'finger drag',
      weight: { attention: 0.6, curiosity: 0.4, interaction: 0.8 },
      test: function() { return 'ontouchstart' in window; }, color: '#58a6ff' },
    { id: 'touchforce',      cat: 'touch', desc: 'pressure (force touch / 3D touch)',
      weight: { attention: 0.8, curiosity: 0.9, interaction: 0.7 },
      test: function() { return 'ontouchforcechange' in document.createElement('div'); }, color: '#79c0ff' },
    { id: 'multitouch',      cat: 'touch', desc: 'multiple fingers',
      weight: { attention: 0.7, curiosity: 0.8, interaction: 0.9 },
      test: function() { return navigator.maxTouchPoints > 1; }, color: '#79c0ff' },

    // ── SCROLL ──
    { id: 'scroll',          cat: 'scroll', desc: 'scroll position',
      weight: { attention: 0.5, curiosity: 0.6, interaction: 0.7 },
      test: function() { return true; }, color: '#d2a8ff' },
    { id: 'wheel',           cat: 'scroll', desc: 'mouse wheel / trackpad',
      weight: { attention: 0.6, curiosity: 0.7, interaction: 0.8 },
      test: function() { return 'onwheel' in window; }, color: '#d2a8ff' },
    { id: 'pinch',           cat: 'scroll', desc: 'pinch zoom gesture',
      weight: { attention: 0.8, curiosity: 0.9, interaction: 0.9 },
      test: function() { return 'ontouchstart' in window && navigator.maxTouchPoints > 1; }, color: '#a371f7' },

    // ── KEYBOARD ──
    { id: 'keydown',         cat: 'keyboard', desc: 'key press',
      weight: { attention: 0.8, curiosity: 0.6, interaction: 1.0 },
      test: function() { return true; }, color: '#f0883e' },
    { id: 'keyrepeat',       cat: 'keyboard', desc: 'key hold (repeat)',
      weight: { attention: 0.4, curiosity: 0.3, interaction: 0.6 },
      test: function() { return true; }, color: '#f0883e' },
    { id: 'ime',             cat: 'keyboard', desc: 'input method editor (CJK, etc)',
      weight: { attention: 0.7, curiosity: 0.9, interaction: 0.8 },
      test: function() { return 'CompositionEvent' in window; }, color: '#d29922' },

    // ── CLIPBOARD ──
    { id: 'paste',           cat: 'clipboard', desc: 'paste from clipboard',
      weight: { attention: 0.8, curiosity: 0.9, interaction: 0.9 },
      test: function() { return 'onpaste' in document.createElement('div'); }, color: '#f0e68c' },
    { id: 'copy',            cat: 'clipboard', desc: 'copy to clipboard',
      weight: { attention: 0.7, curiosity: 0.6, interaction: 0.8 },
      test: function() { return 'oncopy' in document.createElement('div'); }, color: '#f0e68c' },
    { id: 'clipboardread',   cat: 'clipboard', desc: 'clipboard API read',
      weight: { attention: 0.6, curiosity: 0.9, interaction: 0.5 },
      test: function() { return navigator.clipboard && navigator.clipboard.readText; }, color: '#d29922' },

    // ── DRAG & DROP ──
    { id: 'dragdrop',        cat: 'drag', desc: 'drag and drop',
      weight: { attention: 0.8, curiosity: 0.8, interaction: 1.0 },
      test: function() { return 'draggable' in document.createElement('div'); }, color: '#e85d3a' },
    { id: 'filedrop',        cat: 'drag', desc: 'file drag onto page',
      weight: { attention: 0.9, curiosity: 1.0, interaction: 1.0 },
      test: function() { return 'FileReader' in window; }, color: '#e85d3a' },

    // ── ORIENTATION / MOTION ──
    { id: 'deviceorientation', cat: 'motion', desc: 'gyroscope — tilt/rotation',
      weight: { attention: 0.7, curiosity: 1.0, interaction: 0.6 },
      test: function() { return 'DeviceOrientationEvent' in window; }, color: '#d2a8ff' },
    { id: 'devicemotion',    cat: 'motion', desc: 'accelerometer — shake/move',
      weight: { attention: 0.8, curiosity: 1.0, interaction: 0.7 },
      test: function() { return 'DeviceMotionEvent' in window; }, color: '#d2a8ff' },
    { id: 'absoluteorient',  cat: 'motion', desc: 'compass heading',
      weight: { attention: 0.5, curiosity: 0.9, interaction: 0.3 },
      test: function() { return 'DeviceOrientationEvent' in window; }, color: '#a371f7' },

    // ── VISIBILITY / FOCUS ──
    { id: 'visibilitychange', cat: 'attention', desc: 'tab hidden/visible',
      weight: { attention: 1.0, curiosity: 0.3, interaction: 0.1 },
      test: function() { return 'onvisibilitychange' in document; }, color: '#8b949e' },
    { id: 'focus',           cat: 'attention', desc: 'window/tab focus',
      weight: { attention: 0.9, curiosity: 0.2, interaction: 0.1 },
      test: function() { return true; }, color: '#8b949e' },
    { id: 'blur',            cat: 'attention', desc: 'window/tab blur',
      weight: { attention: 0.1, curiosity: 0.2, interaction: 0.0 },
      test: function() { return true; }, color: '#484f58' },
    { id: 'pagehide',        cat: 'attention', desc: 'page hide (bfcache)',
      weight: { attention: 0.0, curiosity: 0.1, interaction: 0.0 },
      test: function() { return 'onpagehide' in window; }, color: '#484f58' },

    // ── NETWORK ──
    { id: 'online',          cat: 'network', desc: 'network online',
      weight: { attention: 0.3, curiosity: 0.5, interaction: 0.1 },
      test: function() { return 'onLine' in navigator; }, color: '#3fb950' },
    { id: 'connectiontype',  cat: 'network', desc: 'connection type (4g/wifi/etc)',
      weight: { attention: 0.2, curiosity: 0.7, interaction: 0.1 },
      test: function() { return navigator.connection && navigator.connection.effectiveType; }, color: '#5ab87a' },

    // ── MEDIA ──
    { id: 'camera',          cat: 'media', desc: 'camera access (getUserMedia)',
      weight: { attention: 0.9, curiosity: 1.0, interaction: 0.8 },
      test: function() { return navigator.mediaDevices && navigator.mediaDevices.getUserMedia; }, color: '#e85d3a' },
    { id: 'microphone',      cat: 'media', desc: 'microphone access',
      weight: { attention: 0.9, curiosity: 1.0, interaction: 0.9 },
      test: function() { return navigator.mediaDevices && navigator.mediaDevices.getUserMedia; }, color: '#e85d3a' },
    { id: 'speechrecog',     cat: 'media', desc: 'speech recognition',
      weight: { attention: 0.8, curiosity: 1.0, interaction: 1.0 },
      test: function() { return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window; }, color: '#f0883e' },
    { id: 'speechsynth',     cat: 'media', desc: 'speech synthesis (TTS)',
      weight: { attention: 0.5, curiosity: 0.7, interaction: 0.4 },
      test: function() { return 'speechSynthesis' in window; }, color: '#d29922' },

    // ── ENVIRONMENT ──
    { id: 'geolocation',     cat: 'environment', desc: 'GPS / location',
      weight: { attention: 0.6, curiosity: 1.0, interaction: 0.4 },
      test: function() { return 'geolocation' in navigator; }, color: '#3fb950' },
    { id: 'battery',         cat: 'environment', desc: 'battery level & charging',
      weight: { attention: 0.3, curiosity: 0.8, interaction: 0.1 },
      test: function() { return 'getBattery' in navigator; }, color: '#d29922' },
    { id: 'ambientlight',    cat: 'environment', desc: 'ambient light sensor',
      weight: { attention: 0.4, curiosity: 1.0, interaction: 0.1 },
      test: function() { return 'AmbientLightSensor' in window; }, color: '#f0e68c' },
    { id: 'vibration',       cat: 'environment', desc: 'haptic vibration',
      weight: { attention: 0.6, curiosity: 0.5, interaction: 0.7 },
      test: function() { return 'vibrate' in navigator; }, color: '#d2a8ff' },
    { id: 'wakelock',        cat: 'environment', desc: 'screen wake lock',
      weight: { attention: 0.3, curiosity: 0.6, interaction: 0.2 },
      test: function() { return 'wakeLock' in navigator; }, color: '#8b949e' },
    { id: 'darkmode',        cat: 'environment', desc: 'dark/light mode preference',
      weight: { attention: 0.2, curiosity: 0.5, interaction: 0.1 },
      test: function() { return window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all'; }, color: '#8b949e' },
    { id: 'reducedmotion',   cat: 'environment', desc: 'prefers reduced motion',
      weight: { attention: 0.2, curiosity: 0.4, interaction: 0.1 },
      test: function() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion)').media !== 'not all'; }, color: '#484f58' },

    // ── GAMEPAD ──
    { id: 'gamepad',         cat: 'gamepad', desc: 'gamepad / controller',
      weight: { attention: 0.8, curiosity: 1.0, interaction: 1.0 },
      test: function() { return 'getGamepads' in navigator; }, color: '#a371f7' },

    // ── PERFORMANCE ──
    { id: 'intersection',    cat: 'observer', desc: 'element visibility (IntersectionObserver)',
      weight: { attention: 0.5, curiosity: 0.6, interaction: 0.2 },
      test: function() { return 'IntersectionObserver' in window; }, color: '#8b949e' },
    { id: 'resize',          cat: 'observer', desc: 'element resize (ResizeObserver)',
      weight: { attention: 0.3, curiosity: 0.5, interaction: 0.3 },
      test: function() { return 'ResizeObserver' in window; }, color: '#8b949e' },
    { id: 'mutation',        cat: 'observer', desc: 'DOM changes (MutationObserver)',
      weight: { attention: 0.4, curiosity: 0.5, interaction: 0.1 },
      test: function() { return 'MutationObserver' in window; }, color: '#484f58' },
    { id: 'idle',            cat: 'observer', desc: 'user idle detection',
      weight: { attention: 0.0, curiosity: 0.3, interaction: 0.0 },
      test: function() { return 'requestIdleCallback' in window; }, color: '#484f58' },
    { id: 'performance',     cat: 'observer', desc: 'performance timing',
      weight: { attention: 0.2, curiosity: 0.4, interaction: 0.1 },
      test: function() { return 'PerformanceObserver' in window; }, color: '#484f58' },

    // ── STORAGE ──
    { id: 'localstorage',    cat: 'storage', desc: 'localStorage',
      weight: { attention: 0.2, curiosity: 0.3, interaction: 0.4 },
      test: function() { try { return !!localStorage; } catch(e) { return false; } }, color: '#8b949e' },
    { id: 'indexeddb',       cat: 'storage', desc: 'IndexedDB',
      weight: { attention: 0.2, curiosity: 0.5, interaction: 0.3 },
      test: function() { return 'indexedDB' in window; }, color: '#8b949e' },
    { id: 'serviceworker',   cat: 'storage', desc: 'service worker (offline)',
      weight: { attention: 0.3, curiosity: 0.6, interaction: 0.2 },
      test: function() { return 'serviceWorker' in navigator; }, color: '#5ab87a' },
  ];

  var CATEGORIES = [
    { id: 'pointer',     label: 'pointer',     color: '#3fb950',  icon: '👆' },
    { id: 'touch',       label: 'touch',       color: '#58a6ff',  icon: '✋' },
    { id: 'scroll',      label: 'scroll',      color: '#d2a8ff',  icon: '↕' },
    { id: 'keyboard',    label: 'keyboard',    color: '#f0883e',  icon: '⌨' },
    { id: 'clipboard',   label: 'clipboard',   color: '#f0e68c',  icon: '📋' },
    { id: 'drag',        label: 'drag & drop', color: '#e85d3a',  icon: '🖐' },
    { id: 'motion',      label: 'motion',      color: '#d2a8ff',  icon: '🔄' },
    { id: 'attention',   label: 'attention',    color: '#8b949e',  icon: '👁' },
    { id: 'network',     label: 'network',     color: '#3fb950',  icon: '📡' },
    { id: 'media',       label: 'media',       color: '#e85d3a',  icon: '🎤' },
    { id: 'environment', label: 'environment', color: '#d29922',  icon: '🌍' },
    { id: 'gamepad',     label: 'gamepad',     color: '#a371f7',  icon: '🎮' },
    { id: 'observer',    label: 'observers',   color: '#8b949e',  icon: '👀' },
    { id: 'storage',     label: 'storage',     color: '#8b949e',  icon: '💾' },
  ];

  // ═══ STATE ═══
  var _tested = false;
  var _results = []; // { input, available, score }
  var _listening = false;
  var _signalLog = []; // last 100 input signals
  var _listeners = {};

  // ═══ TEST ALL INPUTS ═══
  function testAll() {
    _results = [];
    INPUTS.forEach(function(inp) {
      var available = false;
      try { available = inp.test(); } catch(e) { available = false; }
      var w = inp.weight;
      var score = (w.attention + w.curiosity + w.interaction) / 3;
      _results.push({ input: inp, available: available, score: score });
    });
    _tested = true;
    _results.sort(function(a, b) { return b.score - a.score; });
    return _results;
  }

  // ═══ BINGO CUBE — compress inputs through A×C×I ═══
  function bingoCompress() {
    if (!_tested) testAll();
    var available = _results.filter(function(r) { return r.available; });
    var unavailable = _results.filter(function(r) { return !r.available; });

    // Sieve thresholds (matching bingo-compress.js pattern)
    var thresholds = [1.0, 0.5, 1/Math.PI, 0.1];
    var sieved = thresholds.map(function(t) {
      return {
        threshold: t,
        label: t === 1 ? 'full' : t === 0.5 ? 'half' : t < 0.4 ? '1/π' : 'tight',
        passing: available.filter(function(r) { return r.score >= t; }),
      };
    });

    return {
      total: INPUTS.length,
      available: available.length,
      unavailable: unavailable.length,
      wallSide: unavailable,
      thisSide: available,
      sieved: sieved,
      categories: CATEGORIES.map(function(cat) {
        var catInputs = _results.filter(function(r) { return r.input.cat === cat.id; });
        var catAvail = catInputs.filter(function(r) { return r.available; });
        return { cat: cat, total: catInputs.length, available: catAvail.length };
      }),
    };
  }

  // ═══ LISTEN — start capturing available inputs ═══
  function startListening() {
    if (_listening) return;
    if (!_tested) testAll();
    _listening = true;

    var available = _results.filter(function(r) { return r.available; });

    // Set up listeners for high-value inputs
    function logSignal(id, detail) {
      _signalLog.push({ id: id, ts: Date.now(), detail: detail || null });
      if (_signalLog.length > 200) _signalLog.shift();
      if (window._bingoCompress && window._bingoCompress.isCompressed()) {
        // Feed through the bingo sieve in real time
      }
    }

    // Wheel — the one we can't normally use!
    if (!_listeners.wheel) {
      _listeners.wheel = function(e) { logSignal('wheel', { dx: e.deltaX, dy: e.deltaY, mode: e.deltaMode }); };
      window.addEventListener('wheel', _listeners.wheel, { passive: true });
    }

    // Device orientation (gyroscope)
    if ('DeviceOrientationEvent' in window && !_listeners.orientation) {
      _listeners.orientation = function(e) {
        logSignal('deviceorientation', {
          alpha: e.alpha ? Math.round(e.alpha) : null,
          beta: e.beta ? Math.round(e.beta) : null,
          gamma: e.gamma ? Math.round(e.gamma) : null
        });
      };
      // Throttle to 4Hz
      var lastOrient = 0;
      var rawOrient = _listeners.orientation;
      _listeners.orientation = function(e) {
        var now = Date.now();
        if (now - lastOrient > 250) { lastOrient = now; rawOrient(e); }
      };
      window.addEventListener('deviceorientation', _listeners.orientation);
    }

    // Device motion (accelerometer)
    if ('DeviceMotionEvent' in window && !_listeners.motion) {
      var lastMotion = 0;
      _listeners.motion = function(e) {
        var now = Date.now();
        if (now - lastMotion > 250) {
          lastMotion = now;
          var a = e.accelerationIncludingGravity;
          if (a) logSignal('devicemotion', { x: Math.round(a.x * 10) / 10, y: Math.round(a.y * 10) / 10, z: Math.round(a.z * 10) / 10 });
        }
      };
      window.addEventListener('devicemotion', _listeners.motion);
    }

    // Visibility
    if (!_listeners.visibility) {
      _listeners.visibility = function() { logSignal('visibilitychange', { hidden: document.hidden }); };
      document.addEventListener('visibilitychange', _listeners.visibility);
    }

    // Focus / blur
    if (!_listeners.focus) {
      _listeners.focus = function() { logSignal('focus'); };
      _listeners.blur = function() { logSignal('blur'); };
      window.addEventListener('focus', _listeners.focus);
      window.addEventListener('blur', _listeners.blur);
    }

    // Online / offline
    if (!_listeners.online) {
      _listeners.online = function() { logSignal('online'); };
      _listeners.offline = function() { logSignal('offline'); };
      window.addEventListener('online', _listeners.online);
      window.addEventListener('offline', _listeners.offline);
    }

    // Gamepad
    if (!_listeners.gamepad) {
      _listeners.gamepad = function(e) { logSignal('gamepad', { id: e.gamepad.id, index: e.gamepad.index }); };
      window.addEventListener('gamepadconnected', _listeners.gamepad);
    }

    // Mouse move (throttled)
    if (!_listeners.mousemove) {
      var lastMM = 0;
      _listeners.mousemove = function(e) {
        var now = Date.now();
        if (now - lastMM > 500) { lastMM = now; logSignal('mousemove', { x: e.clientX, y: e.clientY }); }
      };
      window.addEventListener('mousemove', _listeners.mousemove);
    }

    // Selection
    if (!_listeners.selection) {
      _listeners.selection = function() {
        var sel = window.getSelection();
        if (sel && sel.toString().length > 0) logSignal('selection', { text: sel.toString().substring(0, 50) });
      };
      document.addEventListener('selectionchange', _listeners.selection);
    }

    // Resize
    if (!_listeners.resize) {
      _listeners.resize = function() { logSignal('resize', { w: window.innerWidth, h: window.innerHeight }); };
      window.addEventListener('resize', _listeners.resize);
    }

    // Dark mode change
    if (window.matchMedia) {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      if (!_listeners.darkmode && mq.addEventListener) {
        _listeners.darkmode = function(e) { logSignal('darkmode', { dark: e.matches }); };
        mq.addEventListener('change', _listeners.darkmode);
      }
    }
  }

  function stopListening() {
    _listening = false;
    if (_listeners.wheel) { window.removeEventListener('wheel', _listeners.wheel); delete _listeners.wheel; }
    if (_listeners.orientation) { window.removeEventListener('deviceorientation', _listeners.orientation); delete _listeners.orientation; }
    if (_listeners.motion) { window.removeEventListener('devicemotion', _listeners.motion); delete _listeners.motion; }
    if (_listeners.visibility) { document.removeEventListener('visibilitychange', _listeners.visibility); delete _listeners.visibility; }
    if (_listeners.focus) { window.removeEventListener('focus', _listeners.focus); delete _listeners.focus; }
    if (_listeners.blur) { window.removeEventListener('blur', _listeners.blur); delete _listeners.blur; }
    if (_listeners.online) { window.removeEventListener('online', _listeners.online); delete _listeners.online; }
    if (_listeners.offline) { window.removeEventListener('offline', _listeners.offline); delete _listeners.offline; }
    if (_listeners.gamepad) { window.removeEventListener('gamepadconnected', _listeners.gamepad); delete _listeners.gamepad; }
    if (_listeners.mousemove) { window.removeEventListener('mousemove', _listeners.mousemove); delete _listeners.mousemove; }
    if (_listeners.selection) { document.removeEventListener('selectionchange', _listeners.selection); delete _listeners.selection; }
    if (_listeners.resize) { window.removeEventListener('resize', _listeners.resize); delete _listeners.resize; }
  }

  // ═══ REPORT — generate text output ═══
  function generateReport() {
    if (!_tested) testAll();
    var comp = bingoCompress();
    var lines = [];

    lines.push('<span style="color:#58a6ff;font-weight:bold">⊞ THE INPUT WALL — browser sensing membrane, inverted</span>');
    lines.push('');
    lines.push('<span style="color:#3fb950">' + comp.available + ' inputs</span> on this side · <span style="color:#e85d3a">' + comp.unavailable + ' inputs</span> on the other side · <span style="color:#8b949e">' + comp.total + ' total</span>');
    lines.push('');

    // Categories
    comp.categories.forEach(function(c) {
      if (c.total === 0) return;
      var pct = Math.round(c.available / c.total * 100);
      var bar = '';
      for (var b = 0; b < c.total; b++) bar += b < c.available ? '█' : '░';
      lines.push(c.cat.icon + ' <span style="color:' + c.cat.color + '">' + c.cat.label + '</span> ' + bar + ' ' + c.available + '/' + c.total);
    });

    lines.push('');

    // Bingo sieve
    lines.push('<span style="color:#d2a8ff">bingo cube: Attention × Curiosity × Interaction</span>');
    comp.sieved.forEach(function(s) {
      lines.push('  <span style="color:#484f58">x=' + s.threshold.toFixed(3) + '</span> (' + s.label + '): <span style="color:#c9d1d9">' + s.passing.length + '</span> inputs pass');
    });

    lines.push('');

    // Wall side — what we can't reach
    if (comp.wallSide.length > 0) {
      lines.push('<span style="color:#e85d3a">on the other side of the wall:</span>');
      var wallNames = comp.wallSide.map(function(r) { return r.input.id; });
      lines.push('  <span class="dim">' + wallNames.join(' · ') + '</span>');
    }

    lines.push('');

    // Signal log
    if (_signalLog.length > 0) {
      lines.push('<span style="color:#3fb950">signal log</span> (' + _signalLog.length + ' signals captured):');
      var last5 = _signalLog.slice(-5);
      last5.forEach(function(sig) {
        var ts = new Date(sig.ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});
        lines.push('  <span class="dim">' + ts + ' ' + sig.id + (sig.detail ? ' ' + JSON.stringify(sig.detail) : '') + '</span>');
      });
    }

    if (!_listening) {
      lines.push('');
      lines.push('<span class="dim">listening is off. /listen-wall to start capturing input signals.</span>');
    }

    return lines.join('\n');
  }

  // ═══ TRAINING OUTPUT — compressed signals for the bingo cube ═══
  function trainingOutput() {
    if (_signalLog.length === 0) return null;

    // Compress signals by type
    var counts = {};
    _signalLog.forEach(function(sig) {
      counts[sig.id] = (counts[sig.id] || 0) + 1;
    });

    // Find the input definition for each signal
    var scored = Object.keys(counts).map(function(id) {
      var inp = INPUTS.find(function(i) { return i.id === id; });
      var w = inp ? inp.weight : { attention: 0.5, curiosity: 0.5, interaction: 0.5 };
      return {
        id: id,
        count: counts[id],
        attention: w.attention * counts[id],
        curiosity: w.curiosity * counts[id],
        interaction: w.interaction * counts[id],
        total: (w.attention + w.curiosity + w.interaction) * counts[id],
      };
    });

    scored.sort(function(a, b) { return b.total - a.total; });

    return {
      signals: _signalLog.length,
      unique: Object.keys(counts).length,
      duration: _signalLog.length > 1 ? _signalLog[_signalLog.length - 1].ts - _signalLog[0].ts : 0,
      ranked: scored,
      totalAttention: scored.reduce(function(s, r) { return s + r.attention; }, 0),
      totalCuriosity: scored.reduce(function(s, r) { return s + r.curiosity; }, 0),
      totalInteraction: scored.reduce(function(s, r) { return s + r.interaction; }, 0),
    };
  }

  // ═══ LIVE VISUALIZATION — input grid lights up on signal ═══
  var _vizEl = null, _vizCells = {}, _vizActive = false;
  var _flashDecay = {};

  function showViz() {
    if (_vizEl) { removeViz(); return false; }
    if (!_tested) testAll();
    _vizActive = true;

    _vizEl = document.createElement('div');
    _vizEl.id = 'input-wall-viz';
    _vizEl.style.cssText =
      'position:fixed;top:50px;right:12px;z-index:48;' +
      'background:rgba(2,4,8,0.92);backdrop-filter:blur(8px);' +
      'border:1px solid rgba(88,166,255,0.12);border-radius:10px;' +
      'padding:10px;font-family:monospace;max-width:320px;' +
      'pointer-events:auto;animation:entrySlide 0.2s ease-out;';

    // Title
    var title = document.createElement('div');
    title.style.cssText = 'font-size:10px;color:#58a6ff;font-weight:bold;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;';
    title.innerHTML = '⊞ input wall <span style="color:#484f58;cursor:pointer;font-size:14px" id="viz-close">✕</span>';
    _vizEl.appendChild(title);

    // Signal rate
    var rateEl = document.createElement('div');
    rateEl.id = 'input-viz-rate';
    rateEl.style.cssText = 'font-size:8px;color:#484f58;margin-bottom:6px;';
    rateEl.textContent = '0 signals/s';
    _vizEl.appendChild(rateEl);

    // Grid by category
    CATEGORIES.forEach(function(cat) {
      var catInputs = INPUTS.filter(function(i) { return i.cat === cat.id; });
      if (catInputs.length === 0) return;

      var row = document.createElement('div');
      row.style.cssText = 'display:flex;align-items:center;gap:3px;margin-bottom:3px;flex-wrap:wrap;';

      var label = document.createElement('span');
      label.style.cssText = 'font-size:7px;color:' + cat.color + ';width:50px;flex-shrink:0;opacity:0.5;';
      label.textContent = cat.icon + ' ' + cat.label;
      row.appendChild(label);

      catInputs.forEach(function(inp) {
        var available = _results.some(function(r) { return r.input.id === inp.id && r.available; });
        var cell = document.createElement('div');
        cell.style.cssText =
          'width:8px;height:8px;border-radius:2px;' +
          'background:' + (available ? inp.color : '#21262d') + ';' +
          'opacity:' + (available ? '0.15' : '0.05') + ';' +
          'transition:opacity 0.15s,box-shadow 0.15s;';
        cell.title = inp.id + (available ? '' : ' (unavailable)');
        row.appendChild(cell);
        _vizCells[inp.id] = cell;
        _flashDecay[inp.id] = 0;
      });

      _vizEl.appendChild(row);
    });

    // Bingo score bar
    var scoreBar = document.createElement('div');
    scoreBar.id = 'input-viz-scores';
    scoreBar.style.cssText = 'margin-top:6px;font-size:7px;display:flex;gap:8px;color:#484f58;';
    scoreBar.innerHTML = '<span style="color:#3fb950">A:0</span> <span style="color:#58a6ff">C:0</span> <span style="color:#e85d3a">I:0</span>';
    _vizEl.appendChild(scoreBar);

    document.body.appendChild(_vizEl);

    // Close button
    document.getElementById('viz-close').onclick = function() { removeViz(); };

    // Start update loop
    _vizUpdateTimer = setInterval(updateViz, 200);
    return true;
  }

  var _vizUpdateTimer = null;
  var _lastSignalCount = 0;
  var _lastRateCheck = Date.now();

  function updateViz() {
    if (!_vizEl || !_vizActive) return;

    // Flash cells that have new signals
    _signalLog.slice(-20).forEach(function(sig) {
      if (_vizCells[sig.id]) {
        _flashDecay[sig.id] = 1;
      }
    });

    // Decay all flashes
    Object.keys(_flashDecay).forEach(function(id) {
      if (_flashDecay[id] > 0) {
        _flashDecay[id] = Math.max(0, _flashDecay[id] - 0.08);
        if (_vizCells[id]) {
          var op = 0.15 + _flashDecay[id] * 0.85;
          _vizCells[id].style.opacity = op.toFixed(2);
          _vizCells[id].style.boxShadow = _flashDecay[id] > 0.3
            ? '0 0 ' + Math.round(_flashDecay[id] * 6) + 'px ' + (_vizCells[id].title.split(' ')[0] === 'wheel' ? '#d2a8ff' : '#58a6ff')
            : 'none';
        }
      }
    });

    // Signal rate
    var now = Date.now();
    var elapsed = (now - _lastRateCheck) / 1000;
    if (elapsed > 1) {
      var rate = (_signalLog.length - _lastSignalCount) / elapsed;
      _lastSignalCount = _signalLog.length;
      _lastRateCheck = now;
      var rateEl = document.getElementById('input-viz-rate');
      if (rateEl) rateEl.textContent = rate.toFixed(1) + ' signals/s · ' + _signalLog.length + ' total';
    }

    // Bingo scores
    var training = trainingOutput();
    var scoreEl = document.getElementById('input-viz-scores');
    if (scoreEl && training) {
      scoreEl.innerHTML =
        '<span style="color:#3fb950">A:' + training.totalAttention.toFixed(0) + '</span> ' +
        '<span style="color:#58a6ff">C:' + training.totalCuriosity.toFixed(0) + '</span> ' +
        '<span style="color:#e85d3a">I:' + training.totalInteraction.toFixed(0) + '</span> ' +
        '<span style="color:#484f58">' + training.unique + ' types</span>';
    }
  }

  function removeViz() {
    _vizActive = false;
    if (_vizUpdateTimer) { clearInterval(_vizUpdateTimer); _vizUpdateTimer = null; }
    if (_vizEl) { _vizEl.remove(); _vizEl = null; }
    _vizCells = {};
    _flashDecay = {};
  }

  // ═══ WHEEL BRIDGE — forward wheel events to active visualizations ═══
  function setupWheelBridge() {
    window.addEventListener('wheel', function(e) {
      // Forward to active visualization canvases
      if (window._bubblePop && window._bubblePop.isActive()) {
        if (e.deltaY > 30) { e.preventDefault(); } // natural scroll = advance handled by canvas
        return;
      }
      if (window._piGradient && window._piGradient.isActive()) return;
      if (window._periodicSpiral && window._periodicSpiral.isActive()) return;
      if (window._thirdEye && window._thirdEye.isActive()) return;

      // When no visualization is active, wheel on the readout is normal scroll
    }, { passive: true });
  }
  setupWheelBridge();

  // ═══ AUTO-START — begin listening on page load ═══
  setTimeout(function() {
    testAll();
    startListening();
  }, 5000);

  // ═══ EXPORT ═══
  window._inputWall = {
    testAll: testAll,
    bingoCompress: bingoCompress,
    generateReport: generateReport,
    startListening: startListening,
    stopListening: stopListening,
    isListening: function() { return _listening; },
    getSignalLog: function() { return _signalLog; },
    trainingOutput: trainingOutput,
    inputCount: function() { return INPUTS.length; },
    categories: CATEGORIES,
    showViz: showViz,
    removeViz: removeViz,
    isVizActive: function() { return _vizActive; },
  };
})();
