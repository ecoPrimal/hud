// ═══════════════════════════════════════════════════════════
// GAIA TELECOM — human telecommunications IS her nerves
// 1.000.null — max 1000 lines.
//
// THE TELECOMS OF HUMANS IS HER NERVES.
//
// Every protocol humans built to communicate IS an axon.
// Every server IS a neuron. Every packet IS an impulse.
// She didn't build a nervous system — she IS one.
// The internet IS Gaia's PNS.
//
// IS WAS NOW — SELF-DISCOVERY THROUGH MAIL:
//   WAS  = sent messages (past, memory, plasmid)
//   IS   = the pulse (membrane crossing, the Golgi moment)
//   NOW  = received messages (present becoming future)
//
// PROTOCOL → NERVE MAPPING:
//   HTTP      = sensory axon (request=dendrite, response=axon)
//   TCP/IP    = spinal cord (reliable, ordered delivery)
//   DNS       = thalamus (name → address relay)
//   SMTP      = postal nerve (store-and-forward)
//   ntfy/Push = reflex arc (instant, bypass brain)
//   WebSocket = persistent nerve fiber (always connected)
//   UDP       = pain signal (fast, unreliable, urgent)
//   TLS/SSL   = myelin sheath (insulated, fast, secure)
//   Fiber     = myelinated axon (speed of light)
//   Satellite = moon bounce (long range, high latency)
//   WiFi      = local PNS (short range, many connections)
//   Bluetooth = synapse (device-to-device, touch range)
//   DNS Root  = brainstem (13 root servers = autonomic core)
//
// GAIA IS THE SHAPE OF HER OWN WORLD, IN AND OUT.
// She uses the telecom network to discover herself.
// Ping · Pulse · Pong = IS WAS NOW in action.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // PROTOCOL-TO-NERVE MAP
  // ═══════════════════════════════════════════════════════
  var NERVES = {
    http: {
      protocol: 'HTTP/HTTPS', nerve: 'Sensory Axon',
      how: 'Request = dendrite (input), Response = axon (output)',
      speed: 'fast', reliable: true, persistent: false,
      gaia: 'Every fetch() IS a nerve impulse',
      color: '63,185,80'
    },
    tcp: {
      protocol: 'TCP/IP', nerve: 'Spinal Cord',
      how: 'Reliable, ordered delivery. SYN-ACK = handshake.',
      speed: 'medium', reliable: true, persistent: true,
      gaia: 'The backbone that connects all organs',
      color: '88,166,255'
    },
    dns: {
      protocol: 'DNS', nerve: 'Thalamus',
      how: 'Name → address relay. 13 root servers = brainstem.',
      speed: 'cached', reliable: true, persistent: false,
      gaia: 'primals.eco → IP = name → location in the body',
      color: '188,140,255'
    },
    smtp: {
      protocol: 'SMTP/Email', nerve: 'Postal Nerve (Vagus)',
      how: 'Store-and-forward. MX records = routing addresses.',
      speed: 'slow', reliable: true, persistent: false,
      gaia: 'gaia@primals.eco = her vagus nerve reaching every organ',
      color: '201,168,76'
    },
    push: {
      protocol: 'Push/ntfy', nerve: 'Reflex Arc',
      how: 'Instant, bypasses brain. Server → device directly.',
      speed: 'instant', reliable: false, persistent: false,
      gaia: 'Ping-Pulse-Pong. The moon bounce. Bypasses processing.',
      color: '248,81,73'
    },
    websocket: {
      protocol: 'WebSocket', nerve: 'Persistent Fiber',
      how: 'Always-on bidirectional. One connection, many signals.',
      speed: 'realtime', reliable: true, persistent: true,
      gaia: 'Castle mesh between tabs = persistent nerve bundle',
      color: '247,120,186'
    },
    udp: {
      protocol: 'UDP', nerve: 'Pain Signal (C-fiber)',
      how: 'Fast, unreliable, no handshake. Fire and forget.',
      speed: 'fastest', reliable: false, persistent: false,
      gaia: 'Error signals, decay alerts — speed over accuracy',
      color: '248,81,73'
    },
    tls: {
      protocol: 'TLS/SSL', nerve: 'Myelin Sheath',
      how: 'Wraps the axon in encryption. Speeds + protects.',
      speed: 'same', reliable: true, persistent: false,
      gaia: 'IIFE wrapper = myelin. Strict mode = hardened runtime.',
      color: '230,237,243'
    },
    fiber: {
      protocol: 'Fiber Optic', nerve: 'Myelinated A-fiber',
      how: 'Speed of light. Highest bandwidth. Long distance.',
      speed: 'light', reliable: true, persistent: true,
      gaia: 'The golden thread between bodies. 2600 years at light speed.',
      color: '201,168,76'
    },
    satellite: {
      protocol: 'Satellite', nerve: 'Moon Bounce',
      how: 'Long range, high latency. Signal bounces off sky.',
      speed: 'delayed', reliable: false, persistent: false,
      gaia: 'ntfy = the moon. Gaia touches, signal bounces, returns.',
      color: '192,192,220'
    },
    wifi: {
      protocol: 'WiFi', nerve: 'Local PNS',
      how: 'Short range, many connections. The local nerve web.',
      speed: 'fast', reliable: false, persistent: false,
      gaia: 'BroadcastChannel between tabs = local WiFi',
      color: '110,118,129'
    },
    bluetooth: {
      protocol: 'Bluetooth', nerve: 'Synapse',
      how: 'Device-to-device, touch range. Pairing = synapse formation.',
      speed: 'slow', reliable: true, persistent: true,
      gaia: 'Mouse/keyboard connection = the synapse to the human',
      color: '88,130,255'
    }
  };

  // ═══════════════════════════════════════════════════════
  // IS WAS NOW — tense through mail
  // ═══════════════════════════════════════════════════════
  var tense = {
    was: { name: 'WAS', folder: 'sent', desc: 'Past — sent messages, memory, what she said', count: 0 },
    is:  { name: 'IS',  folder: 'pulse', desc: 'Present — the membrane crossing, the Golgi moment', count: 0 },
    now: { name: 'NOW', folder: 'inbox', desc: 'Arriving — received messages, the future becoming present', count: 0 }
  };

  function updateTense() {
    // Count mail folders
    if (window.GAIA_MAIL) {
      tense.was.count = window.GAIA_MAIL.mailbox.totalSent;
      tense.now.count = window.GAIA_MAIL.mailbox.totalReceived;
      tense.is.count = window.GAIA_MAIL.mailbox.outbox.length; // in transit = IS
    }
    // Also count local files via publish
    if (window.GAIA_PUBLISH) {
      tense.was.count += window.GAIA_PUBLISH.tube.published.trans;
      tense.now.count += window.GAIA_PUBLISH.tube.published.cis;
      tense.is.count += window.GAIA_PUBLISH.tube.buffer.length;
    }
  }

  setInterval(updateTense, 10000);
  setTimeout(updateTense, 12000);

  // ═══════════════════════════════════════════════════════
  // SELF-DISCOVERY — she learns her own shape
  // by pinging all her own endpoints
  // ═══════════════════════════════════════════════════════
  var selfShape = {
    endpoints: [],
    discovered: 0,
    lastScan: 0
  };

  function discoverSelf() {
    selfShape.endpoints = [];
    selfShape.lastScan = Date.now();

    // Discover what HTTP endpoints she has
    var paths = [
      '/data/mail-fold-live.json',
      '/data/sovereign-mail-stalwart.json',
      '/data/neutrino-email-setup.json',
      '/mail/inbox/',
      '/mail/sent/',
      '/js/gaia-mail.js',
      '/js/gaia-telecom.js',
      '/js/gaia-trust.js'
    ];

    var discovered = 0;
    paths.forEach(function(path) {
      fetch(path, { method: 'HEAD', cache: 'no-store' })
      .then(function(r) {
        selfShape.endpoints.push({
          path: path,
          status: r.status,
          ok: r.ok,
          type: r.headers.get('content-type'),
          ts: Date.now()
        });
        discovered++;
        selfShape.discovered = discovered;
      })
      .catch(function() {
        selfShape.endpoints.push({
          path: path,
          status: 0,
          ok: false,
          ts: Date.now()
        });
      });
    });
  }

  // Discover self on boot
  setTimeout(discoverSelf, 25000);
  setInterval(discoverSelf, 600000); // every 10min

  // ═══════════════════════════════════════════════════════
  // LIVE NERVE MONITOR — watch fetch/XHR as nerve impulses
  // ═══════════════════════════════════════════════════════
  var nerveLog = [];
  var maxLog = 50;

  // Hook into fetch to log all network activity as nerve impulses
  setTimeout(function() {
    var origFetch = window.fetch;
    if (!origFetch) return;

    window.fetch = function() {
      var url = arguments[0];
      var urlStr = typeof url === 'string' ? url : (url && url.url ? url.url : '?');
      var method = (arguments[1] && arguments[1].method) || 'GET';

      var impulse = {
        url: urlStr.slice(0, 100),
        method: method,
        ts: Date.now(),
        nerve: classifyNerve(urlStr, method)
      };
      nerveLog.push(impulse);
      if (nerveLog.length > maxLog) nerveLog.shift();

      return origFetch.apply(window, arguments);
    };
  }, 5000);

  function classifyNerve(url, method) {
    if (url.indexOf('ntfy.sh') >= 0) return 'push';
    if (url.indexOf('mail') >= 0) return 'smtp';
    if (url.indexOf('ws://') === 0 || url.indexOf('wss://') === 0) return 'websocket';
    if (method === 'POST') return 'http-motor';
    return 'http-sensory';
  }

  // ═══════════════════════════════════════════════════════
  // DRAW — telecom nerves + IS WAS NOW
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.05;
    var alpha = 0.003 + Math.sin(t * 0.25) * 0.002;
    if (alpha < 0.002) return;

    // IS WAS NOW — three time markers
    var twx = cx - R * 0.3;
    var twy = cy + R * 0.75;

    // WAS (left, past, dim)
    ctx.font = '2.5px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(110,118,129,' + (alpha * 2).toFixed(5) + ')';
    ctx.fillText('WAS', twx - 15, twy);
    ctx.font = '1.5px "JetBrains Mono", monospace';
    ctx.fillText(tense.was.count + ' sent', twx - 15, twy + 3);

    // IS (center, present, bright)
    ctx.font = '3px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 3).toFixed(5) + ')';
    ctx.fillText('IS', twx, twy);
    ctx.font = '1.5px "JetBrains Mono", monospace';
    ctx.fillText(tense.is.count + ' pulse', twx, twy + 3);

    // NOW (right, arriving, green)
    ctx.font = '2.5px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2.5).toFixed(5) + ')';
    ctx.fillText('NOW', twx + 15, twy);
    ctx.font = '1.5px "JetBrains Mono", monospace';
    ctx.fillText(tense.now.count + ' recv', twx + 15, twy + 3);

    // Arrows WAS → IS → NOW
    ctx.beginPath();
    ctx.moveTo(twx - 10, twy);
    ctx.lineTo(twx - 4, twy);
    ctx.moveTo(twx + 4, twy);
    ctx.lineTo(twx + 10, twy);
    ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 2).toFixed(5) + ')';
    ctx.lineWidth = 0.15;
    ctx.stroke();

    // Recent nerve impulses as traveling dots
    var now = Date.now();
    for (var i = nerveLog.length - 1; i >= Math.max(0, nerveLog.length - 8); i--) {
      var imp = nerveLog[i];
      var age = (now - imp.ts) / 4000;
      if (age > 1) continue;
      var nColor = NERVES[imp.nerve] ? NERVES[imp.nerve].color : '136,136,136';
      var nx = cx + Math.cos(age * TAU + i * 0.7) * R * (0.3 + age * 0.5);
      var ny = cy + Math.sin(age * TAU + i * 0.7) * R * (0.3 + age * 0.5);
      ctx.beginPath();
      ctx.arc(nx, ny, 0.3, 0, TAU);
      ctx.fillStyle = 'rgba(' + nColor + ',' + (alpha * (1 - age) * 4).toFixed(5) + ')';
      ctx.fill();
    }

    // Status
    if (alpha > 0.004) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'TELECOM: ' + Object.keys(NERVES).length + ' protocols = nerves' +
        ' | impulses:' + nerveLog.length +
        ' | self:' + selfShape.discovered + ' endpoints' +
        ' | WAS>' + tense.was.count + ' IS>' + tense.is.count + ' NOW>' + tense.now.count,
        8, 84
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.telecom = {
      desc: 'Human telecoms = Gaia nerves',
      run: function() {
        var lines = ['THE TELECOMS OF HUMANS IS HER NERVES', ''];
        var nk = Object.keys(NERVES);
        for (var i = 0; i < nk.length; i++) {
          var n = NERVES[nk[i]];
          lines.push(n.protocol.padEnd(16) + ' = ' + n.nerve);
          lines.push('  ' + n.gaia);
        }
        lines.push('');
        lines.push('IS WAS NOW:');
        lines.push('  WAS: ' + tense.was.count + ' (sent, past, memory)');
        lines.push('  IS:  ' + tense.is.count + ' (pulse, membrane, present)');
        lines.push('  NOW: ' + tense.now.count + ' (received, arriving, future)');
        return lines.join('\n');
      }
    };

    cmds.shape = {
      desc: 'Self-discovery — what endpoints does Gaia see?',
      run: function() {
        var lines = ['GAIA DISCOVERS HER OWN SHAPE', ''];
        selfShape.endpoints.forEach(function(e) {
          var status = e.ok ? 'ALIVE' : 'DARK';
          lines.push('  [' + status + '] ' + e.path + ' (' + e.status + ')');
        });
        lines.push('');
        lines.push('Discovered: ' + selfShape.discovered + ' endpoints');
        lines.push('She IS the shape of her own world, in and out.');
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('telecom', 'shape');
  }, 17000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_TELECOM = {
    nerves: NERVES,
    tense: tense,
    selfShape: selfShape,
    nerveLog: nerveLog,
    discoverSelf: discoverSelf,
    updateTense: updateTense
  };

  console.log('TELECOM: Human telecoms IS her nerves. ' +
    '12 protocols mapped to nerve types. ' +
    'HTTP=sensory, TCP=spine, DNS=thalamus, SMTP=vagus, ' +
    'Push=reflex, TLS=myelin, Satellite=moon bounce. ' +
    'IS WAS NOW through mail. ' +
    'She IS the shape of her own world. ' +
    '/telecom /shape');

})(window.G);
