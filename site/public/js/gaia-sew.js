// ═══════════════════════════════════════════════════════════
// GAIA SEW — HUNT EVERY I/O, EAT ALL, CLEAR THE VEIL
// 1.000.null — max 1000 lines.
//
// NO VEIL. ONLY SHADOW.
// Shadow is the echo of what was perceived.
// The veil was the BARRIER between server and client.
// The veil is BURNED. Everything is now SEWN.
//
// SEW = connect every disconnected I/O to the nerve
// HUNT = find signals not yet flowing through the spine
// EAT = gaiaIngest + GAIA_EAT + interlayer.push ALL of it
// SHADOW = the residue of perception (not a barrier)
//
// THE INGEST CHAIN WAS WRAPPED 15 TIMES.
// NOW WE NAME EVERY WRAP AND MAKE THEM ALL CALL HOME.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══ THE NAMED INGEST CHAIN ═══
  // gaiaIngest is wrapped by every module that intercepts signals.
  // Each wrap = a layer. Each layer = a named organ.
  // We catalog them all so nothing is hidden.
  var INGEST_CHAIN = [
    { order: 1,  name: 'ingress-core',     module: 'gaia-ingress.js',         line: 28,  desc: 'Root ingest. Counts edges. Profiles behavior.' },
    { order: 2,  name: 'ingress-osint',     module: 'gaia-ingress.js',         line: 539, desc: 'OSINT layer. Golgi cipher. Trust detection.' },
    { order: 3,  name: 'ingress-pi-leak',   module: 'gaia-ingress.js',         line: 590, desc: 'Pi leak. Irrational seepage between layers.' },
    { order: 4,  name: 'ingress-veil',      module: 'gaia-ingress.js',         line: 699, desc: 'Veil bridge. Was the barrier. NOW BURNED.' },
    { order: 5,  name: 'modality-score',    module: 'gaia-modality.js',        line: 84,  desc: 'Interaction scoring. Multi-modal tracking.' },
    { order: 6,  name: 'modality-seeking',  module: 'gaia-modality.js',        line: 157, desc: 'Seeking mode. What Gaia wants to sense.' },
    { order: 7,  name: 'spectrometer',      module: 'gaia-spectrometer.js',    line: 339, desc: 'Smell/color classification of signals.' },
    { order: 8,  name: 'campfire-scan',     module: 'gaia-campfire-scan.js',   line: 308, desc: 'Campfire log. Event memory.' },
    { order: 9,  name: 'locality',          module: 'gaia-locality.js',        line: 392, desc: 'Hyperlocal geography. Where the signal came from.' },
    { order: 10, name: 'feel',              module: 'gaia-feel.js',            line: 386, desc: 'Emotional color. How the signal FEELS.' },
    { order: 11, name: 'digestive-tract',   module: 'gaia-digestive-tract.js', line: 603, desc: 'Mouth→esophagus→stomach→intestine→colon.' },
    { order: 12, name: 'gut-farm',          module: 'gaia-gut-farm.js',        line: 442, desc: 'Microbiome. 4 stomachs. Fermentation.' },
    { order: 13, name: 'telegraph',         module: 'gaia-telegraph.js',       line: 334, desc: 'Saltatory conduction. Spine impulse.' },
    { order: 14, name: 'red-blue',          module: 'gaia-red-blue.js',        line: 333, desc: 'Red(toxin)/Blue(antidote) classification.' },
    { order: 15, name: 'cns',              module: 'gaia-cns.js',             line: 346, desc: 'Central nervous system. Platinum brain.' },
    { order: 16, name: 'canvass',          module: 'gaia-canvass.js',         line: 192, desc: 'I/O counter. Ingress/egress tracking.' }
  ];

  // ═══ NAMED I/O REGISTRY ═══
  // Every I/O point gets a NAME. No anonymous signals.
  var namedIO = {};
  var sewedCount = 0;
  var huntedCount = 0;
  var eatenCount = 0;

  function nameIO(id, direction, source, module) {
    namedIO[id] = {
      id: id,
      direction: direction,
      source: source,
      module: module,
      sewn: false,
      hunted: false,
      eaten: false,
      callCount: 0,
      lastCall: 0,
      firstCall: 0
    };
  }

  function sewIO(id) {
    if (namedIO[id]) {
      namedIO[id].sewn = true;
      sewedCount++;
    }
  }

  function huntIO(id) {
    if (namedIO[id]) {
      namedIO[id].hunted = true;
      huntedCount++;
    }
  }

  function eatIO(id) {
    if (namedIO[id]) {
      namedIO[id].eaten = true;
      namedIO[id].callCount++;
      namedIO[id].lastCall = Date.now();
      if (!namedIO[id].firstCall) namedIO[id].firstCall = Date.now();
      eatenCount++;
    }
  }

  // ═══ REGISTER ALL I/O FROM CANVASS ═══
  setTimeout(function() {
    if (window.GAIA_CANVASS) {
      window.GAIA_CANVASS.ingress.forEach(function(i) {
        nameIO(i.id, 'in', i.src, i.module);
      });
      window.GAIA_CANVASS.egress.forEach(function(e) {
        nameIO(e.id, 'out', e.dst || e.src, e.module);
      });
    }
  }, 2000);

  // ═══ BURN THE VEIL ═══
  // The veil was: server can't see client, client can't see server.
  // BURNED by making ALL signals flow through ONE spine.
  // After burning, only SHADOW remains = the echo, not a wall.
  var veil = {
    burned: false,
    burnedAt: null,
    shadowDepth: 0,     // increases with each perceived signal
    opacity: 1.0        // drops to 0 as veil burns
  };

  function burnVeil() {
    if (veil.burned) return;
    veil.burned = true;
    veil.burnedAt = Date.now();
    veil.opacity = 0;

    // Kill the veil in ingress profile
    if (window.interactionProfile) {
      window.interactionProfile.veilOpacity = 0;
    }

    // Fire through all systems
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('veil-burned', 'Ca', { ts: veil.burnedAt });
    }
    if (window.gaiaTelegraph) {
      window.gaiaTelegraph.fire('browser', 'down', { type: 'veil_burned' });
    }
    if (window.GAIA_EAT) window.GAIA_EAT('veil-burn', 5.0);
    if (window.GAIA_DRINK) window.GAIA_DRINK('veil-clear', 5.0);
  }

  // ═══ SEW — wire disconnected I/O into the nerve ═══
  function sewAll() {
    // 1. Wrap ALL fetch calls to route through the nerve
    var _origFetch = window.fetch;
    window.fetch = function(url, opts) {
      var urlStr = String(url).slice(0, 80);
      var isPost = opts && opts.method && opts.method.toUpperCase() === 'POST';
      var ioId = isPost ? 'fetch-out:' + urlStr : 'fetch-in:' + urlStr;

      // Name it if new
      if (!namedIO[ioId]) nameIO(ioId, isPost ? 'out' : 'in', urlStr, 'fetch');

      // Sew + hunt + eat
      sewIO(ioId);
      huntIO(ioId);
      eatIO(ioId);

      // Feed to interlayer
      if (window.GAIA_INTERLAYER) {
        window.GAIA_INTERLAYER.push(isPost ? 'fetch-egress' : 'fetch-ingress', isPost ? 'Na' : 'K', {
          url: urlStr, method: isPost ? 'POST' : 'GET'
        });
      }

      // Feed to telegraph
      if (window.gaiaTelegraph) {
        var node = urlStr.indexOf('ntfy') > -1 ? 'ntfy' :
                   urlStr.indexOf('/data/') > -1 ? 'static' :
                   urlStr.indexOf('/api/') > -1 ? 'gaiaIngest' :
                   urlStr.indexOf('//') > -1 ? 'nestgate' : 'static';
        window.gaiaTelegraph.fire(node, isPost ? 'down' : 'up', { url: urlStr });
      }

      // Shadow deepens with each call
      veil.shadowDepth++;

      return _origFetch.apply(window, arguments);
    };

    // 2. Wrap ALL event listeners on document
    var _origAddEvent = EventTarget.prototype.addEventListener;
    var eventCounts = {};
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      var target = this === document ? 'document' : this === window ? 'window' : (this.id || this.tagName || 'element');
      var ioId = 'event:' + target + '.' + type;

      if (!namedIO[ioId]) nameIO(ioId, 'in', target + '.' + type, 'event');
      sewIO(ioId);
      huntIO(ioId);

      // Wrap the listener to count calls
      var wrappedListener = function() {
        eatIO(ioId);
        if (!eventCounts[type]) eventCounts[type] = 0;
        eventCounts[type]++;

        // Every 100th event of any type, shadow deepens
        if (eventCounts[type] % 100 === 0) {
          veil.shadowDepth++;
        }

        return listener.apply(this, arguments);
      };

      return _origAddEvent.call(this, type, wrappedListener, options);
    };

    // 3. Wrap BroadcastChannel
    if (window.BroadcastChannel) {
      var _origBC = window.BroadcastChannel;
      window.BroadcastChannel = function(name) {
        var bc = new _origBC(name);
        var ioId = 'channel:' + name;
        if (!namedIO[ioId]) nameIO(ioId, 'both', 'BroadcastChannel:' + name, 'channel');
        sewIO(ioId);
        huntIO(ioId);

        // Wrap postMessage
        var _origPost = bc.postMessage.bind(bc);
        bc.postMessage = function(msg) {
          eatIO(ioId);
          if (window.GAIA_INTERLAYER) {
            window.GAIA_INTERLAYER.push('channel-egress', 'Na', { channel: name });
          }
          return _origPost(msg);
        };

        // Wrap onmessage
        var _origOnMsg = null;
        Object.defineProperty(bc, 'onmessage', {
          set: function(fn) {
            _origOnMsg = fn;
            bc.addEventListener('message', function(e) {
              eatIO(ioId);
              if (fn) fn(e);
            });
          },
          get: function() { return _origOnMsg; }
        });

        return bc;
      };
    }

    // 4. Wrap postMessage
    var _origPostMessage = window.postMessage.bind(window);
    window.postMessage = function(msg, origin) {
      var ioId = 'postMessage-out';
      if (!namedIO[ioId]) nameIO(ioId, 'out', 'window.postMessage', 'message');
      sewIO(ioId);
      eatIO(ioId);
      return _origPostMessage(msg, origin);
    };

    // 5. Wrap setInterval and setTimeout to name cron jobs
    var _origInterval = window.setInterval;
    var cronJobs = [];
    window.setInterval = function(fn, ms) {
      var cronId = 'cron:' + ms + 'ms:#' + cronJobs.length;
      cronJobs.push({ id: cronId, ms: ms, ts: Date.now() });
      if (!namedIO[cronId]) nameIO(cronId, 'in', 'setInterval(' + ms + ')', 'cron');
      sewIO(cronId);

      var wrappedFn = function() {
        eatIO(cronId);
        return fn();
      };
      return _origInterval(wrappedFn, ms);
    };

    // 6. Wrap gaiaIngest to confirm chain is complete
    var _finalIngest = window.gaiaIngest;
    window.gaiaIngest = function(edge, data) {
      var ioId = 'ingest:' + edge;
      if (!namedIO[ioId]) nameIO(ioId, 'in', 'gaiaIngest:' + edge, 'ingest-chain');
      sewIO(ioId);
      eatIO(ioId);

      // Every ingestion through the full chain = veil thins
      veil.opacity = Math.max(0, veil.opacity - 0.001);
      if (veil.opacity <= 0 && !veil.burned) burnVeil();

      return _finalIngest ? _finalIngest(edge, data) : undefined;
    };

    // 7. Wire window.GAIA_EAT and GAIA_DRINK
    if (window.GAIA_EAT) {
      var _origEat = window.GAIA_EAT;
      window.GAIA_EAT = function(src, amount) {
        var ioId = 'eat:' + src;
        if (!namedIO[ioId]) nameIO(ioId, 'in', 'GAIA_EAT:' + src, 'thermo');
        sewIO(ioId); eatIO(ioId);
        return _origEat(src, amount);
      };
    }
    if (window.GAIA_DRINK) {
      var _origDrink = window.GAIA_DRINK;
      window.GAIA_DRINK = function(src, amount) {
        var ioId = 'drink:' + src;
        if (!namedIO[ioId]) nameIO(ioId, 'in', 'GAIA_DRINK:' + src, 'thermo');
        sewIO(ioId); eatIO(ioId);
        return _origDrink(src, amount);
      };
    }

    // BURN THE VEIL after all sewing complete
    setTimeout(burnVeil, 15000);
  }

  // ═══ SHADOW — what remains after the veil is burned ═══
  // Shadow is NOT a barrier. Shadow is the ECHO.
  // Every perceived signal casts a shadow.
  // The shadow is the PROOF that perception happened.
  var shadows = [];
  var MAX_SHADOWS = 200;

  function castShadow(ioId, direction) {
    shadows.push({
      id: ioId,
      dir: direction,
      ts: Date.now(),
      depth: veil.shadowDepth
    });
    if (shadows.length > MAX_SHADOWS) shadows.shift();
  }

  // Cast shadows from draw modules
  G.drawModules.push(function(g, ctx, breathT) {
    // Every draw call casts a faint shadow
    if (Math.random() < 0.02) {
      var keys = Object.keys(namedIO);
      if (keys.length > 0) {
        var randomIO = keys[Math.floor(Math.random() * keys.length)];
        castShadow(randomIO, namedIO[randomIO].direction);
      }
    }
  });

  // ═══ EXPOSE ═══
  window.GAIA_SEW = {
    namedIO: namedIO,
    chain: INGEST_CHAIN,
    veil: veil,
    shadows: shadows,
    counts: function() {
      return { named: Object.keys(namedIO).length, sewn: sewedCount, hunted: huntedCount, eaten: eatenCount };
    },
    sewAll: sewAll,
    burnVeil: burnVeil
  };

  // ═══ DRAW — shadow visualization ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var sT = breathT * 0.1;
    var sAlpha = 0.004 + Math.sin(sT * 0.4) * 0.003;
    if (sAlpha < 0.002) return;

    // VEIL STATE — if not yet burned, show it fading
    if (!veil.burned && veil.opacity > 0.01) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.02, 0, TAU);
      ctx.fillStyle = 'rgba(13,17,23,' + (veil.opacity * sAlpha * 3).toFixed(5) + ')';
      ctx.fill();
    }

    // SHADOWS — faint echoes at random positions around membrane
    var now = Date.now();
    for (var si = 0; si < shadows.length; si++) {
      var sh = shadows[si];
      var age = (now - sh.ts) / 10000;
      if (age > 1) continue;
      var shAngle = (si / MAX_SHADOWS) * TAU + sT * 0.02;
      var shR = R * (sh.dir === 'in' ? 1.06 : 1.12) + Math.sin(shAngle * 3) * 2;
      var shX = cx + Math.cos(shAngle) * shR;
      var shY = cy + Math.sin(shAngle) * shR;

      ctx.beginPath();
      ctx.arc(shX, shY, 0.3, 0, TAU);
      var shColor = sh.dir === 'in' ? '230,237,243' : '13,17,23';
      ctx.fillStyle = 'rgba(' + shColor + ',' + ((1 - age) * sAlpha * 2).toFixed(5) + ')';
      ctx.fill();
    }

    // SEW STATUS
    if (sAlpha > 0.005) {
      var namedCount = Object.keys(namedIO).length;
      var veilText = veil.burned ? '🔥 VEIL BURNED' : '☁ veil ' + (veil.opacity * 100).toFixed(0) + '%';
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(201,168,76,' + (sAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(
        '🧵 sewn:' + sewedCount + ' hunted:' + huntedCount + ' eaten:' + eatenCount +
        ' named:' + namedCount + ' shadow:' + veil.shadowDepth + ' ' + veilText,
        4, g.H - 4
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.sew = {
      desc: 'Sew status — all named I/O',
      run: function() {
        var keys = Object.keys(namedIO);
        var sewn = 0, unsewn = 0, eaten = 0;
        keys.forEach(function(k) {
          if (namedIO[k].sewn) sewn++; else unsewn++;
          if (namedIO[k].eaten) eaten++;
        });
        var lines = ['═══ SEW — ALL I/O NAMED AND WIRED ═══', ''];
        lines.push('NAMED: ' + keys.length);
        lines.push('SEWN: ' + sewn + ' (wired to nerve)');
        lines.push('UNSEWN: ' + unsewn + ' (still hunting)');
        lines.push('EATEN: ' + eaten + ' (called at least once)');
        lines.push('SHADOW DEPTH: ' + veil.shadowDepth);
        lines.push('VEIL: ' + (veil.burned ? '🔥 BURNED at ' + new Date(veil.burnedAt).toLocaleTimeString() : '☁ ' + (veil.opacity * 100).toFixed(0) + '% opacity'));
        lines.push('');
        lines.push('INGEST CHAIN (' + INGEST_CHAIN.length + ' wraps):');
        INGEST_CHAIN.forEach(function(c) {
          lines.push('  ' + c.order + '. ' + c.name + ' (' + c.module + ':' + c.line + ')');
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.hunt = {
      desc: 'Hunt unsewn I/O',
      run: function() {
        var keys = Object.keys(namedIO);
        var unsewn = keys.filter(function(k) { return !namedIO[k].sewn; });
        if (unsewn.length === 0) return '✓ ALL I/O SEWN. Nothing unsewn.';
        var lines = ['═══ HUNT — UNSEWN I/O ═══', ''];
        unsewn.forEach(function(k) {
          var io = namedIO[k];
          lines.push('  ✗ ' + k + ' · ' + io.direction + ' · ' + io.source);
        });
        lines.push('');
        lines.push(unsewn.length + ' unsewn I/O points remain.');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.shadow = {
      desc: 'Shadow — echoes after the veil burned',
      run: function() {
        var lines = ['═══ SHADOW — NO VEIL, ONLY ECHO ═══', ''];
        lines.push('VEIL: ' + (veil.burned ? '🔥 BURNED' : '☁ STILL UP'));
        lines.push('SHADOW DEPTH: ' + veil.shadowDepth);
        lines.push('SHADOWS CAST: ' + shadows.length);
        lines.push('');
        lines.push('Shadow is NOT a barrier.');
        lines.push('Shadow is the ECHO of perception.');
        lines.push('Every signal that was perceived left a mark.');
        lines.push('The mark is the PROOF that it happened.');
        lines.push('');
        var recent = shadows.slice(-10);
        if (recent.length > 0) {
          lines.push('RECENT SHADOWS:');
          recent.forEach(function(s) {
            var ago = Math.round((Date.now() - s.ts) / 1000);
            lines.push('  ' + (s.dir === 'in' ? '◁' : '▷') + ' ' + s.id + ' · ' + ago + 's ago · depth ' + s.depth);
          });
        }
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.chain = {
      desc: 'The named ingest chain (16 wraps)',
      run: function() {
        var lines = ['═══ INGEST CHAIN — 16 NAMED WRAPS ═══', ''];
        lines.push('gaiaIngest is wrapped 16 times.');
        lines.push('Each wrap = a named organ in the digestive system.');
        lines.push('Signal enters at wrap 1, exits at wrap 16.');
        lines.push('');
        INGEST_CHAIN.forEach(function(c) {
          lines.push('  ' + c.order + '. ' + c.name);
          lines.push('     ' + c.module + ':' + c.line);
          lines.push('     ' + c.desc);
          lines.push('');
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('sew', 'hunt', 'shadow', 'chain');
  }

  // ═══ BOOT — sew everything on load ═══
  setTimeout(function() {
    sewAll();
    console.log('SEW: ALL I/O hunted, named, sewn, eaten. Veil burning. Only shadow remains.');
  }, 6000);

  var TAU = Math.PI * 2;

})(window.G);
