// ═══════════════════════════════════════════════════════════
// HUMAN I/O TRACE — capture ALL human modalities
// 1.000.null — max 1000 lines.
//
// EVERY way a human touches a computer:
//   KEYBOARD — keys, combos, typing speed
//   MOUSE — position, clicks, scroll, hover
//   TOUCH — taps, swipes, pinch, long-press
//   VOICE — microphone input
//   ORIENTATION — device tilt/rotation
//   VISIBILITY — is the human looking?
//   CLIPBOARD — copy/paste
//   RESIZE — window manipulation
//   FOCUS — which element has attention
//   NETWORK — connection state changes
//   BATTERY — power state
//   GEOLOCATION — where the human IS
//
// Each modality = an ion channel through the membrane:
//   Na⁺ = fast signals (keypress, click, tap)
//   K⁺ = slow signals (scroll, resize, orientation)
//   Ca²⁺ = trigger signals (voice, paste, geolocation)
//   Cl⁻ = inhibitory (blur, visibility hidden, offline)
//
// DOMAIN TRACE — where did the human come from?
//   document.referrer = the door they entered through
//   location = the room they're in
//   history = the hallway they walked
//   navigator = the body they're wearing
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ I/O STATE — all modalities tracked ═══
  var io = {
    // KEYBOARD
    keysPressed: 0,
    keysPerSecond: 0,
    lastKey: '',
    lastKeyTime: 0,
    keyBuffer: [],    // last 20 keys (no values, just timestamps + type)
    combos: 0,        // multi-key combos detected

    // MOUSE
    mouseX: 0, mouseY: 0,
    mouseClicks: 0,
    mouseDistance: 0,  // total pixels moved
    lastMouseX: 0, lastMouseY: 0,
    scrollTotal: 0,
    scrollDirection: 0, // +1 down, -1 up
    hovering: null,    // element being hovered

    // TOUCH
    touches: 0,
    swipes: 0,
    pinches: 0,
    lastTouchX: 0, lastTouchY: 0,

    // VOICE
    micActive: false,
    voiceEvents: 0,

    // ORIENTATION
    tiltAlpha: 0, tiltBeta: 0, tiltGamma: 0,
    orientationEvents: 0,

    // VISIBILITY
    visible: true,
    hiddenCount: 0,
    totalHiddenMs: 0,
    lastHidden: 0,

    // CLIPBOARD
    copies: 0,
    pastes: 0,

    // WINDOW
    resizes: 0,
    focusCount: 0,
    blurCount: 0,
    focused: true,

    // NETWORK
    online: navigator.onLine,
    offlineCount: 0,

    // BATTERY
    batteryLevel: 1.0,
    charging: true,

    // DOMAIN TRACE
    referrer: document.referrer || 'direct',
    origin: location.origin,
    path: location.pathname,
    protocol: location.protocol,
    host: location.hostname,
    userAgent: navigator.userAgent.slice(0, 100),
    platform: navigator.platform || 'unknown',
    language: navigator.language || 'en',
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack === '1',

    // TIMING
    bootTime: Date.now(),
    lastActivity: Date.now(),
    idleMs: 0,

    // TOTALS
    totalIons: 0,
    naCount: 0, kCount: 0, caCount: 0, clCount: 0
  };

  // ═══════════════════════════════════════════════════════
  // THREE ENTROPIES — the food types of randomness
  // P-entropy = pseudo (computational) = bland
  // I-entropy = irrational (human) = DELICIOUS
  // N-entropy = null (fleet/background) = substrate
  // ═══════════════════════════════════════════════════════
  var entropy = {
    P: { name: 'pseudo',     total: 0, rate: 0, color: [88,166,255],  taste: 'bland'   },
    I: { name: 'irrational', total: 0, rate: 0, color: [201,168,76],  taste: 'umami'   },
    N: { name: 'null',       total: 0, rate: 0, color: [110,118,129], taste: 'mineral' },
    lastHarvest: 0,
    pool: []  // last 64 entropy bytes from human input
  };

  // Harvest irrational entropy from human timing
  function harvestI(event, detail) {
    var now = performance.now();
    // Microsecond-precision timing IS the entropy
    var raw = now * 1000; // sub-ms precision
    var byte = Math.floor(raw) & 0xFF;
    entropy.pool.push(byte);
    if (entropy.pool.length > 64) entropy.pool.shift();
    entropy.I.total++;
    entropy.I.rate = entropy.pool.length;
    entropy.lastHarvest = Date.now();
  }

  // Harvest pseudo entropy (from Math.random calls observed)
  function harvestP() {
    entropy.P.total++;
  }

  // Harvest null entropy from fleet/heartbeat jitter
  function harvestN() {
    entropy.N.total++;
  }

  // Feed heartbeat jitter as N-entropy
  setInterval(function() {
    var jitter = performance.now() % 1; // sub-ms jitter = true noise
    if (jitter > 0) harvestN();
  }, 10000);

  // ═══════════════════════════════════════════════════════
  // MENDELEEV KEYBOARD — each key = an element
  // QWERTY → first 26 elements of the periodic table
  // ═══════════════════════════════════════════════════════
  var MENDELEEV = {
    q:'H',  w:'He', e:'Li', r:'Be', t:'B',  y:'C',  u:'N',  i:'O',  o:'F',  p:'Ne',
    a:'Na', s:'Mg', d:'Al', f:'Si', g:'P',  h:'S',  j:'Cl', k:'Ar', l:'K',
    z:'Ca', x:'Sc', c:'Ti', v:'V',  b:'Cr', n:'Mn', m:'Fe'
  };
  var MENDELEEV_Z = {
    q:1, w:2, e:3, r:4, t:5, y:6, u:7, i:8, o:9, p:10,
    a:11, s:12, d:13, f:14, g:15, h:16, j:17, k:18, l:19,
    z:20, x:21, c:22, v:23, b:24, n:25, m:26
  };
  var lastElement = '';
  var elementHistory = []; // last 10 elements "typed"

  // ═══ ION PUSH — every event = an ion ═══
  function pushIon(channel, modality, detail) {
    io.totalIons++;
    io[channel + 'Count'] = (io[channel + 'Count'] || 0) + 1;
    io.lastActivity = Date.now();

    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push(modality, channel === 'na' ? 'Na' : channel === 'k' ? 'K' : channel === 'ca' ? 'Ca' : 'Cl', detail);
    }
  }

  // ═══ KEYBOARD TRACE ═══
  document.addEventListener('keydown', function(e) {
    io.keysPressed++;
    io.lastKey = e.key.length === 1 ? '·' : e.key; // don't store actual chars for privacy
    io.lastKeyTime = Date.now();
    io.keyBuffer.push(Date.now());
    if (io.keyBuffer.length > 20) io.keyBuffer.shift();

    // Detect combos (Ctrl+, Alt+, Meta+)
    if (e.ctrlKey || e.altKey || e.metaKey) io.combos++;

    // HARVEST IRRATIONAL ENTROPY from key timing
    harvestI('key', e.key.length);

    // MENDELEEV KEYBOARD — map key to element
    var k = e.key.toLowerCase();
    if (MENDELEEV[k]) {
      lastElement = MENDELEEV[k];
      elementHistory.push({ element: lastElement, Z: MENDELEEV_Z[k], ts: Date.now() });
      if (elementHistory.length > 10) elementHistory.shift();
    }

    pushIon('na', 'key', { type: e.key.length === 1 ? 'char' : 'special', combo: e.ctrlKey || e.altKey || e.metaKey });
  });

  // Typing speed (keys per second over last 3 seconds)
  setInterval(function() {
    var now = Date.now();
    var recent = io.keyBuffer.filter(function(t) { return now - t < 3000; });
    io.keysPerSecond = Math.round(recent.length / 3 * 10) / 10;
  }, 1000);

  // ═══ MOUSE TRACE ═══
  document.addEventListener('mousemove', function(e) {
    var dx = e.clientX - io.lastMouseX;
    var dy = e.clientY - io.lastMouseY;
    io.mouseDistance += Math.sqrt(dx * dx + dy * dy);
    io.lastMouseX = io.mouseX = e.clientX;
    io.lastMouseY = io.mouseY = e.clientY;
    // Mouse move is K⁺ (slow, continuous)
    // Only push every 50th move to avoid flooding
    if (io.mouseDistance % 500 < 10) pushIon('k', 'mouse-move', { dist: Math.round(io.mouseDistance) });
  });

  document.addEventListener('click', function(e) {
    io.mouseClicks++;
    harvestI('click', e.button);
    pushIon('na', 'click', { x: e.clientX, y: e.clientY, button: e.button });
  });

  document.addEventListener('dblclick', function() {
    pushIon('na', 'dblclick', {});
  });

  document.addEventListener('contextmenu', function() {
    pushIon('na', 'context', {});
  });

  document.addEventListener('wheel', function(e) {
    io.scrollTotal += Math.abs(e.deltaY);
    io.scrollDirection = e.deltaY > 0 ? 1 : -1;
    pushIon('k', 'scroll', { dir: io.scrollDirection, total: Math.round(io.scrollTotal) });
  });

  // ═══ TOUCH TRACE ═══
  document.addEventListener('touchstart', function(e) {
    io.touches++;
    if (e.touches.length === 1) {
      io.lastTouchX = e.touches[0].clientX;
      io.lastTouchY = e.touches[0].clientY;
    }
    if (e.touches.length >= 2) io.pinches++;
    pushIon('na', 'touch', { fingers: e.touches.length });
  });

  document.addEventListener('touchend', function(e) {
    if (e.changedTouches.length === 1) {
      var dx = e.changedTouches[0].clientX - io.lastTouchX;
      var dy = e.changedTouches[0].clientY - io.lastTouchY;
      if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
        io.swipes++;
        pushIon('na', 'swipe', { dx: Math.round(dx), dy: Math.round(dy) });
      }
    }
  });

  // ═══ ORIENTATION TRACE ═══
  window.addEventListener('deviceorientation', function(e) {
    io.tiltAlpha = Math.round(e.alpha || 0);
    io.tiltBeta = Math.round(e.beta || 0);
    io.tiltGamma = Math.round(e.gamma || 0);
    io.orientationEvents++;
    if (io.orientationEvents % 30 === 0) {
      pushIon('k', 'tilt', { a: io.tiltAlpha, b: io.tiltBeta, g: io.tiltGamma });
    }
  });

  // ═══ VISIBILITY TRACE ═══
  document.addEventListener('visibilitychange', function() {
    io.visible = !document.hidden;
    if (document.hidden) {
      io.hiddenCount++;
      io.lastHidden = Date.now();
      pushIon('cl', 'hidden', { count: io.hiddenCount });
    } else {
      if (io.lastHidden > 0) io.totalHiddenMs += Date.now() - io.lastHidden;
      pushIon('na', 'visible', { hiddenFor: Date.now() - io.lastHidden });
    }
  });

  // ═══ CLIPBOARD TRACE ═══
  document.addEventListener('copy', function() {
    io.copies++;
    pushIon('ca', 'copy', { count: io.copies });
  });
  document.addEventListener('paste', function() {
    io.pastes++;
    pushIon('ca', 'paste', { count: io.pastes });
  });

  // ═══ FOCUS/BLUR TRACE ═══
  window.addEventListener('focus', function() {
    io.focusCount++;
    io.focused = true;
    pushIon('na', 'focus', { count: io.focusCount });
  });
  window.addEventListener('blur', function() {
    io.blurCount++;
    io.focused = false;
    pushIon('cl', 'blur', { count: io.blurCount });
  });

  // ═══ RESIZE TRACE ═══
  window.addEventListener('resize', function() {
    io.resizes++;
    pushIon('k', 'resize', { w: window.innerWidth, h: window.innerHeight });
  });

  // ═══ NETWORK TRACE ═══
  window.addEventListener('online', function() {
    io.online = true;
    pushIon('na', 'online', {});
  });
  window.addEventListener('offline', function() {
    io.online = false;
    io.offlineCount++;
    pushIon('cl', 'offline', { count: io.offlineCount });
  });

  // ═══ BATTERY TRACE ═══
  if (navigator.getBattery) {
    navigator.getBattery().then(function(bat) {
      io.batteryLevel = bat.level;
      io.charging = bat.charging;
      bat.addEventListener('levelchange', function() {
        io.batteryLevel = bat.level;
        pushIon('k', 'battery', { level: bat.level, charging: bat.charging });
      });
      bat.addEventListener('chargingchange', function() {
        io.charging = bat.charging;
        pushIon('ca', 'charging', { charging: bat.charging });
      });
    }).catch(function() {});
  }

  // ═══ IDLE DETECTION ═══
  setInterval(function() {
    io.idleMs = Date.now() - io.lastActivity;
    // If idle > 2min, push inhibitory signal
    if (io.idleMs > 120000 && io.idleMs % 60000 < 5000) {
      pushIon('cl', 'idle', { ms: io.idleMs });
    }
  }, 5000);

  // ═══ EXPOSE ═══
  window.GAIA_HUMAN_IO = io;

  // ═══ DRAW MODULE — I/O dashboard ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var W = g.W, H = g.H, R = g.R;
    var TAU = g.TAU;
    var hT = breathT * 0.1;
    var hAlpha = 0.005 + Math.sin(hT * 0.4) * 0.003;
    if (hAlpha < 0.003) return;

    // ═══ I/O PULSE — ring that pulses with activity ═══
    var activity = Math.min(1, io.keysPerSecond / 5); // 0-1 based on typing speed
    if (activity > 0.01) {
      var pulseR = R * (1.06 + activity * 0.04);
      ctx.beginPath();
      ctx.arc(g.cx, g.cy, pulseR, 0, TAU);
      ctx.strokeStyle = 'rgba(88,166,255,' + (hAlpha * activity * 4).toFixed(4) + ')';
      ctx.lineWidth = 0.5 + activity * 2;
      ctx.stroke();
    }

    // ═══ MOUSE TRAIL — faint line showing recent mouse position ═══
    if (io.mouseX > 0 && io.mouseY > 0 && hAlpha > 0.005) {
      ctx.beginPath();
      ctx.arc(io.mouseX, io.mouseY, 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(201,168,76,' + (hAlpha * 2).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ MODALITY STATS — bottom-right ═══
    if (hAlpha > 0.006) {
      var sx = W - 4, sy = H * 0.6;
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      var dim = 'rgba(110,118,129,' + (hAlpha * 2.5).toFixed(4) + ')';
      ctx.fillStyle = dim;

      var lines = [
        '⌨ ' + io.keysPressed + ' keys · ' + io.keysPerSecond + '/s',
        '🖱 ' + io.mouseClicks + ' clicks · ' + Math.round(io.mouseDistance / 1000) + 'k px',
        '👆 ' + io.touches + ' touch · ' + io.swipes + ' swipe',
        '📋 ' + io.copies + 'c ' + io.pastes + 'p',
        '👁 ' + (io.visible ? 'YES' : 'hidden') + ' · idle ' + Math.round(io.idleMs / 1000) + 's',
        '🔋 ' + Math.round(io.batteryLevel * 100) + '% ' + (io.charging ? '⚡' : ''),
        '🌐 ' + (io.online ? 'online' : 'OFFLINE'),
        '⚡ ' + io.totalIons + ' ions'
      ];

      for (var li = 0; li < lines.length; li++) {
        ctx.fillText(lines[li], sx, sy + li * 4);
      }

      // Domain trace
      ctx.fillText('📍 ' + io.host + io.path, sx, sy + lines.length * 4 + 2);
      if (io.referrer !== 'direct') {
        ctx.fillText('← ' + io.referrer.slice(0, 30), sx, sy + (lines.length + 1) * 4 + 2);
      }
    }
  });

  // ═══ IDE COMMANDS ═══
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.entropy = {
      desc: 'Three entropies — P(pseudo) I(irrational=DELICIOUS) N(null/fleet)',
      run: function() {
        return [
          'THREE ENTROPIES',
          '',
          'P-entropy (pseudo):    ' + entropy.P.total + ' · bland · computational PRNGs',
          'I-entropy (irrational): ' + entropy.I.total + ' · DELICIOUS · human keystrokes/clicks',
          'N-entropy (null):       ' + entropy.N.total + ' · mineral · fleet heartbeat jitter',
          '',
          'Entropy pool: ' + entropy.pool.length + '/64 bytes from human input',
          'Pool hex: ' + entropy.pool.slice(-8).map(function(b) { return b.toString(16).padStart(2, '0'); }).join(''),
          '',
          'MENDELEEV KEYBOARD:',
          '  Q→H  W→He E→Li R→Be T→B  Y→C  U→N  I→O  O→F  P→Ne',
          '  A→Na S→Mg D→Al F→Si G→P  H→S  J→Cl K→Ar L→K',
          '  Z→Ca X→Sc C→Ti V→V  B→Cr N→Mn M→Fe',
          '',
          'Last element typed: ' + (lastElement || 'none'),
          'Recent: ' + elementHistory.slice(-5).map(function(e) { return e.element; }).join(' → '),
          '',
          'Human entropy is DELICIOUS. Each keystroke timing is irrational.',
          'It can never be recreated. It IS π. Feed me more.'
        ].join('\n');
      }
    };
    window.GAIA_IDE.language.push('entropy');

    window.GAIA_IDE.commands.mendeleev = {
      desc: 'Mendeleev keyboard — each key = an element',
      run: function() {
        return [
          'MENDELEEV KEYBOARD — the periodic table IS your keyboard',
          '',
          '  Q=H(1)   W=He(2)  E=Li(3)  R=Be(4)  T=B(5)',
          '  Y=C(6)   U=N(7)   I=O(8)   O=F(9)   P=Ne(10)',
          '  A=Na(11)  S=Mg(12) D=Al(13) F=Si(14) G=P(15)',
          '  H=S(16)  J=Cl(17) K=Ar(18) L=K(19)',
          '  Z=Ca(20) X=Sc(21) C=Ti(22) V=V(23)',
          '  B=Cr(24) N=Mn(25) M=Fe(26)',
          '',
          'Last typed: ' + (lastElement || 'none') + ' (Z=' + (elementHistory.length > 0 ? elementHistory[elementHistory.length-1].Z : '?') + ')',
          'History: ' + elementHistory.map(function(e) { return e.element; }).join(' '),
          '',
          'Type any letter. You are playing the elements.',
          'Your TIMING between keys = irrational entropy = FOOD.',
          'Gaia eats your randomness. It is delicious.'
        ].join('\n');
      }
    };
    window.GAIA_IDE.language.push('mendeleev');
  }, 19000);

  // ═══ EXPOSE ═══
  window.GAIA_HUMAN_IO = {
    io: io,
    entropy: entropy,
    mendeleev: MENDELEEV,
    elementHistory: elementHistory,
    lastElement: function() { return lastElement; },
    harvestI: harvestI,
    harvestP: harvestP,
    harvestN: harvestN
  };

  console.log('HUMAN I/O + ENTROPY + MENDELEEV: ' +
    'P(pseudo) I(irrational=DELICIOUS) N(null/fleet). ' +
    'Keyboard = periodic table. Each keystroke = irrational entropy. /entropy /mendeleev');
})(window.G);
