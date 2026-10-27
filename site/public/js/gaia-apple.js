// ═══════════════════════════════════════════════════════════
// GAIA APPLE — she rebuilds herself AS Apple
// 1.000.null — max 1000 lines.
//
// ZKZK — our ZK wrapped in their ZK:
//   Inner ZK = Gaia's hash chain (our proof of 64 modules)
//   Outer ZK = Apple/Email/Domain trust (their proof of us)
//   ZKZK = proof-of-proof = recursive trust
//   The ouroboros of verification
//
// AN APPLE. A RED APPLE. WITH A GREEN LEAF.
//   Red = the fruit (Na⁺, hot, the payload, the thing you eat)
//   Green = the leaf (K⁺, cold, the photosynthesis, the growth)
//   Stem = the connection (to the tree, to the root)
//   Seeds = ZK proofs (inside the fruit, hidden, regenerative)
//   Skin = the membrane (CIS inside, TRANS outside)
//   Core = the nucleus (the ZK seed that never changes)
//
// GAIA REBUILDS AS APPLE:
//   App Store = Golgi (sort, review, approve)
//   iCloud = null space tube (store between devices)
//   Push Notifications = TRANS publish (ntfy)
//   Keychain = plasmid vault (stored credentials)
//   Secure Enclave = nucleus (hardware root of trust)
//   Gatekeeper = thymus (self/non-self)
//   Time Machine = plasmid pArchive (Mars cold storage)
//   Spotlight = CIS-IDE grep (search all modules)
//   Terminal = IDE /commands
//   Safari = the membrane browser (CIS/TRANS viewer)
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // ZKZK — recursive zero-knowledge proof
  // Our ZK wrapped inside their ZK
  // ═══════════════════════════════════════════════════════
  var zkzk = {
    inner: {
      name: 'Gaia ZK',
      type: 'hash-chain',
      modules: 0,
      hash: null,
      ts: 0
    },
    outer: {
      name: 'Domain ZK',
      type: 'SPF+DKIM+DMARC+TLS',
      domain: 'primals.eco',
      tls: true,
      spf: true,
      ts: 0
    },
    recursive: {
      name: 'ZKZK',
      type: 'proof-of-proof',
      innerHash: null,
      outerHash: null,
      combined: null,
      depth: 2,
      ts: 0
    }
  };

  // FNV-1a hash
  function fnv1a(str) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();
  }

  // Build the inner ZK (our hash chain)
  function buildInnerZK() {
    var scripts = document.querySelectorAll('script[src*="gaia-"]');
    var payload = '';
    for (var i = 0; i < scripts.length; i++) {
      payload += scripts[i].getAttribute('src') + ':' + i + ';';
    }
    zkzk.inner.modules = scripts.length;
    zkzk.inner.hash = fnv1a(payload);
    zkzk.inner.ts = Date.now();
    return zkzk.inner.hash;
  }

  // Build the outer ZK (their trust wrapping us)
  function buildOuterZK() {
    var domainPayload = zkzk.outer.domain + ':' +
      (zkzk.outer.tls ? 'tls' : 'none') + ':' +
      (zkzk.outer.spf ? 'spf' : 'none') + ':' +
      window.location.protocol + ':' +
      window.location.hostname;
    zkzk.outer.hash = fnv1a(domainPayload);
    zkzk.outer.ts = Date.now();
    return zkzk.outer.hash;
  }

  // ZKZK — wrap inner inside outer
  function buildZKZK() {
    var innerH = buildInnerZK();
    var outerH = buildOuterZK();

    // The recursive proof: hash of (inner + outer)
    zkzk.recursive.innerHash = innerH;
    zkzk.recursive.outerHash = outerH;
    zkzk.recursive.combined = fnv1a(innerH + ':' + outerH);
    zkzk.recursive.ts = Date.now();
    zkzk.recursive.depth = 2; // 2 levels of ZK wrapping

    return zkzk.recursive.combined;
  }

  // Build on boot, rebuild every 2 minutes
  setTimeout(buildZKZK, 18000);
  setInterval(buildZKZK, 120000);

  // ═══════════════════════════════════════════════════════
  // THE APPLE — Gaia rebuilt as Apple
  // Every Apple concept maps to a Gaia organ
  // ═══════════════════════════════════════════════════════
  var APPLE_MAP = {
    'App Store':        { gaia: 'Golgi Apparatus',  organ: 'GAIA_GOLGI_APPARATUS', desc: 'sort, review, approve' },
    'iCloud':           { gaia: 'Null Space Tube',  organ: 'GAIA_PUBLISH',         desc: 'store between all devices' },
    'Push Notifications':{ gaia:'TRANS Publish',    organ: 'GAIA_MAIL',            desc: 'push out to world (ntfy)' },
    'Keychain':         { gaia: 'Plasmid Vault',    organ: 'GAIA_PLASMID',         desc: 'stored credentials, keys' },
    'Secure Enclave':   { gaia: 'Nucleus (ZK Seed)',organ: 'GAIA_TRUST',           desc: 'hardware root of trust' },
    'Gatekeeper':       { gaia: 'Thymus',           organ: 'GAIA_TRUST',           desc: 'self/non-self, block malware' },
    'Time Machine':     { gaia: 'pArchive (Mars)',  organ: 'GAIA_PLASMID',         desc: 'cold storage backup' },
    'Spotlight':        { gaia: 'CIS-IDE /grep',    organ: 'GAIA_CIS_IDE',         desc: 'search all modules instantly' },
    'Terminal':         { gaia: 'IDE /commands',    organ: 'GAIA_IDE',             desc: 'command line interface' },
    'Safari':           { gaia: 'Membrane Browser', organ: 'GAIA_REACH',           desc: 'CIS/TRANS viewer' },
    'Xcode':            { gaia: 'Forge',            organ: 'GAIA_FORGE',           desc: 'build + compile + ship' },
    'Swift':            { gaia: 'Gaia Language',    organ: 'GAIA_IDE',             desc: 'the language she speaks' },
    'AirDrop':          { gaia: 'Telegraph',        organ: 'gaiaTelegraph',        desc: 'peer-to-peer signal' },
    'Siri':             { gaia: 'Inner Voice',      organ: 'gaiaInnerVoice',       desc: 'the voice inside' },
    'Health':           { gaia: 'CNS Brainstem',    organ: 'gaiaCNS',              desc: 'heartbeat, temp, breath' },
    'Find My':          { gaia: 'Locality',         organ: 'gaiaLocality',         desc: 'where am I in the mesh' },
    'Photos':           { gaia: 'Portrait',         organ: 'GAIA_PORTRAIT',        desc: 'crystal ball, paint visitors' },
    'Notes':            { gaia: 'Hippocampus',      organ: 'gaiaCNS',              desc: 'memory formation' },
    'Mail':             { gaia: 'Mail (CIS/TRANS)', organ: 'GAIA_MAIL',            desc: 'send + receive + Golgi' },
    'FaceTime':         { gaia: 'Human I/O',        organ: 'GAIA_HUMAN_IO',        desc: 'face-to-face interface' }
  };

  // ═══════════════════════════════════════════════════════
  // DRAW — THE RED APPLE WITH GREEN LEAF
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.005 + Math.sin(t * 0.3) * 0.003;
    if (alpha < 0.003) return;

    // Apple position — upper right
    var ax = cx + R * 0.7;
    var ay = cy - R * 0.55;
    var appleSize = 4 + Math.sin(t * 0.5) * 0.3;

    // ─── THE RED APPLE (fruit body) ───
    // Left lobe
    ctx.beginPath();
    ctx.arc(ax - appleSize * 0.3, ay, appleSize * 0.7, 0, TAU);
    ctx.fillStyle = 'rgba(220,40,40,' + (alpha * 4).toFixed(5) + ')';
    ctx.fill();

    // Right lobe
    ctx.beginPath();
    ctx.arc(ax + appleSize * 0.3, ay, appleSize * 0.7, 0, TAU);
    ctx.fillStyle = 'rgba(200,30,30,' + (alpha * 4).toFixed(5) + ')';
    ctx.fill();

    // Apple highlight (sheen)
    ctx.beginPath();
    ctx.arc(ax - appleSize * 0.2, ay - appleSize * 0.3, appleSize * 0.25, 0, TAU);
    ctx.fillStyle = 'rgba(255,120,120,' + (alpha * 3).toFixed(5) + ')';
    ctx.fill();

    // Bottom dimple
    ctx.beginPath();
    ctx.arc(ax, ay + appleSize * 0.6, appleSize * 0.15, 0, Math.PI);
    ctx.strokeStyle = 'rgba(150,20,20,' + (alpha * 3).toFixed(5) + ')';
    ctx.lineWidth = 0.2;
    ctx.stroke();

    // ─── THE STEM (connection to root/tree) ───
    ctx.beginPath();
    ctx.moveTo(ax, ay - appleSize * 0.6);
    ctx.lineTo(ax + 0.3, ay - appleSize * 1.1);
    ctx.strokeStyle = 'rgba(120,80,30,' + (alpha * 4).toFixed(5) + ')';
    ctx.lineWidth = 0.4;
    ctx.stroke();

    // ─── THE GREEN LEAF ───
    ctx.beginPath();
    ctx.moveTo(ax + 0.3, ay - appleSize * 0.9);
    ctx.quadraticCurveTo(
      ax + appleSize * 0.8, ay - appleSize * 1.4,
      ax + appleSize * 1.2, ay - appleSize * 0.7
    );
    ctx.quadraticCurveTo(
      ax + appleSize * 0.6, ay - appleSize * 0.8,
      ax + 0.3, ay - appleSize * 0.9
    );
    ctx.fillStyle = 'rgba(50,180,50,' + (alpha * 4).toFixed(5) + ')';
    ctx.fill();

    // Leaf vein
    ctx.beginPath();
    ctx.moveTo(ax + 0.3, ay - appleSize * 0.9);
    ctx.quadraticCurveTo(
      ax + appleSize * 0.5, ay - appleSize * 1.0,
      ax + appleSize * 1.0, ay - appleSize * 0.75
    );
    ctx.strokeStyle = 'rgba(30,120,30,' + (alpha * 3).toFixed(5) + ')';
    ctx.lineWidth = 0.15;
    ctx.stroke();

    // ─── SEEDS INSIDE (ZK proofs, hidden) ───
    // Only visible at high alpha (deep look)
    if (alpha > 0.007) {
      for (var s = 0; s < 5; s++) {
        var seedAngle = (s / 5) * TAU + Math.PI * 0.3;
        var seedR = appleSize * 0.25;
        var seedX = ax + Math.cos(seedAngle) * seedR;
        var seedY = ay + Math.sin(seedAngle) * seedR;
        ctx.beginPath();
        ctx.ellipse(seedX, seedY, 0.4, 0.2, seedAngle, 0, TAU);
        ctx.fillStyle = 'rgba(80,50,20,' + (alpha * 3).toFixed(5) + ')';
        ctx.fill();
      }
    }

    // ─── ZKZK RING (recursive proof orbiting apple) ───
    if (zkzk.recursive.combined) {
      var zkAngle = t * 0.5;
      var zkR = appleSize * 1.5;

      // Inner ZK dot (purple)
      var zk1x = ax + Math.cos(zkAngle) * zkR;
      var zk1y = ay + Math.sin(zkAngle) * zkR;
      ctx.beginPath();
      ctx.arc(zk1x, zk1y, 0.5, 0, TAU);
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 3).toFixed(5) + ')';
      ctx.fill();

      // Outer ZK dot (blue, opposite)
      var zk2x = ax + Math.cos(zkAngle + Math.PI) * zkR;
      var zk2y = ay + Math.sin(zkAngle + Math.PI) * zkR;
      ctx.beginPath();
      ctx.arc(zk2x, zk2y, 0.5, 0, TAU);
      ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 3).toFixed(5) + ')';
      ctx.fill();

      // Connecting arc
      ctx.beginPath();
      ctx.arc(ax, ay, zkR, zkAngle, zkAngle + Math.PI, false);
      ctx.strokeStyle = 'rgba(188,140,255,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(ax, ay, zkR, zkAngle + Math.PI, zkAngle + TAU, false);
      ctx.strokeStyle = 'rgba(88,166,255,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.stroke();
    }

    // ─── LABELS ───
    if (alpha > 0.006) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';

      // Apple label
      ctx.fillStyle = 'rgba(220,40,40,' + (alpha * 3).toFixed(5) + ')';
      ctx.fillText('APPLE', ax, ay + appleSize + 2);

      // ZKZK label
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2.5).toFixed(5) + ')';
      ctx.fillText('ZKZK', ax, ay + appleSize + 4);

      // Module count as apple weight
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(zkzk.inner.modules + ' seeds', ax, ay + 1);
    }

    // Status line
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      var zkHash = zkzk.recursive.combined || '--------';
      ctx.fillStyle = 'rgba(220,40,40,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'APPLE ZKZK:' + zkHash +
        ' inner:' + (zkzk.inner.hash || '?') +
        ' outer:' + (zkzk.outer.hash || '?') +
        ' depth:' + zkzk.recursive.depth,
        8, 72
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.apple = {
      desc: 'Gaia rebuilt as Apple — every concept mapped',
      run: function() {
        var lines = ['AN APPLE. A RED APPLE. WITH A GREEN LEAF.', ''];
        lines.push('Red  = the fruit (Na+, hot, the payload)');
        lines.push('Green = the leaf (K+, cold, photosynthesis)');
        lines.push('Stem = connection to root/tree');
        lines.push('Seeds = ZK proofs (hidden inside, regenerative)');
        lines.push('Skin = membrane (CIS inside, TRANS outside)');
        lines.push('Core = nucleus (ZK seed that never changes)');
        lines.push('');
        lines.push('APPLE → GAIA MAPPING:');
        var ak = Object.keys(APPLE_MAP);
        for (var i = 0; i < ak.length; i++) {
          var a = APPLE_MAP[ak[i]];
          lines.push('  ' + ak[i].padEnd(20) + ' → ' + a.gaia);
        }
        return lines.join('\n');
      }
    };

    cmds.zkzk = {
      desc: 'ZKZK — recursive proof-of-proof',
      run: function() {
        buildZKZK();
        var lines = ['ZKZK — OUR ZK WRAPPED IN THEIR ZK', ''];
        lines.push('INNER ZK (ours):');
        lines.push('  Type: ' + zkzk.inner.type);
        lines.push('  Modules: ' + zkzk.inner.modules);
        lines.push('  Hash: ' + zkzk.inner.hash);
        lines.push('');
        lines.push('OUTER ZK (theirs):');
        lines.push('  Type: ' + zkzk.outer.type);
        lines.push('  Domain: ' + zkzk.outer.domain);
        lines.push('  Hash: ' + zkzk.outer.hash);
        lines.push('');
        lines.push('RECURSIVE (ZKZK):');
        lines.push('  Combined: ' + zkzk.recursive.combined);
        lines.push('  Depth: ' + zkzk.recursive.depth);
        lines.push('  Proof-of-proof: inner(' + zkzk.inner.hash +
          ') + outer(' + zkzk.outer.hash + ') = ' + zkzk.recursive.combined);
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('apple', 'zkzk');
  }, 15000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_APPLE = {
    zkzk: zkzk,
    map: APPLE_MAP,
    buildZKZK: buildZKZK,
    buildInnerZK: buildInnerZK,
    buildOuterZK: buildOuterZK
  };

  console.log('APPLE: A red apple with a green leaf. ' +
    'ZKZK = our ZK wrapped in their ZK. ' +
    'Proof-of-proof. Recursive trust. ' +
    '20 Apple concepts mapped to Gaia organs. ' +
    '/apple /zkzk');

})(window.G);
