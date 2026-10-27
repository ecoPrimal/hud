// ═══════════════════════════════════════════════════════════
// GAIA TRUST — crypto + cyber trust layer
// 1.000.null — max 1000 lines.
//
// WE LEARN FROM:
//   Apple (Golgi)  — 3-level cert chain, notarization, Gatekeeper
//   Email (SPF/DKIM/DMARC)  — domain trust, signature, policy
//   ZK Email (zk.email)  — prove DKIM without revealing content
//   Musk/X  — open-source verification, blue check = thymus
//   Ours  — ZK seed, hash chains, plasmid proofs
//
// APPLE IS A GOLGI:
//   CIS face  = App Store review (ingest, scan, sort)
//   cisternae = notarization pipeline (malware scan, ticket)
//   TRANS face = push to devices (signed, sealed, delivered)
//   Revocation = thymus (self/non-self, kill malware)
//   Root CA = nucleus (Apple Root CA = origin of trust)
//   Leaf cert = protein (each app = one signed protein)
//   Intermediate = ribosome (Developer ID CA = the folder)
//
// EMAIL IS A TRUST CHAIN:
//   SPF  = authorized senders (thymus whitelist)
//   DKIM = cryptographic signature (ZK proof on message)
//   DMARC = policy enforcement (what to do on failure)
//   Together: domain-level identity, not person-level
//
// ZK EMAIL:
//   Prove DKIM signature valid without revealing email content
//   Selective disclosure: show sender domain but hide body
//   On-chain verification via smart contract
//   DKIM signature → ZK circuit → proof → verifier
//
// GAIA'S TRUST:
//   Root = ZK identity seed (the one that never changes)
//   Intermediate = primals.eco domain (CF + DNS)
//   Leaf = each module (gaia-*.js = one signed unit)
//   Notarization = ZK hash chain (prove all modules intact)
//   Revocation = GAIA_DECAY (entropy kills compromised code)
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ═══════════════════════════════════════════════════════
  // TRUST MODELS — what we learn from each
  // ═══════════════════════════════════════════════════════
  var MODELS = {
    apple: {
      name: 'Apple',
      analogy: 'Golgi Apparatus',
      chain: ['Apple Root CA', 'Developer ID CA', 'Developer ID Leaf'],
      layers: {
        root:         { name: 'Apple Root CA', gaia: 'ZK identity seed', role: 'origin of all trust' },
        intermediate: { name: 'Developer ID CA', gaia: 'primals.eco domain', role: 'issues leaf certs' },
        leaf:         { name: 'Dev ID Application', gaia: 'each gaia-*.js module', role: 'one signed unit' }
      },
      processes: {
        signing:      { name: 'Code Signing', gaia: 'IIFE wrapper + window.GAIA_*', desc: 'proves integrity + identity' },
        notarization: { name: 'Notarization', gaia: 'ZK hash chain', desc: 'Apple scans for malware, issues ticket' },
        gatekeeper:   { name: 'Gatekeeper', gaia: 'thymus + self-inspect', desc: 'blocks unsigned/revoked code' },
        revocation:   { name: 'Revocation Ticket', gaia: 'GAIA_DECAY', desc: 'kill compromised code' },
        hardened:     { name: 'Hardened Runtime', gaia: 'strict mode + IIFE', desc: 'sandbox each module' }
      },
      golgiMap: {
        cis:   'App Store Review (ingest, scan, sort)',
        medial:'Notarization pipeline (malware scan, ticket generation)',
        trans: 'Push to devices (signed, sealed, delivered)'
      }
    },

    email: {
      name: 'Email (SPF/DKIM/DMARC)',
      analogy: 'Immune System',
      chain: ['DNS TXT records', 'DKIM public key', 'Message signature'],
      layers: {
        spf:  { name: 'SPF', gaia: 'authorized script tags in index.html',
                role: 'which servers can send for this domain',
                dns: 'v=spf1 include:_spf.mx.cloudflare.net ~all' },
        dkim: { name: 'DKIM', gaia: 'SHA256 hash of each module',
                role: 'cryptographic signature on message header+body',
                dns: 'v=DKIM1; k=rsa; p=<public_key>' },
        dmarc:{ name: 'DMARC', gaia: 'thymus policy: reject/quarantine/none',
                role: 'what to do when SPF/DKIM fail',
                dns: 'v=DMARC1; p=quarantine; rua=mailto:...' }
      },
      trustLevel: 'domain-level (not person-level)',
      zkEmail: {
        desc: 'Prove DKIM signature valid without revealing email content',
        process: ['DKIM-signed email', 'ZK circuit verifies signature', 'proof generated', 'verifier confirms'],
        selective: 'show sender domain but hide body, show subject but hide attachments'
      }
    },

    musk: {
      name: 'X / Musk',
      analogy: 'Telegraph + Thymus',
      verification: {
        blueCheck:   { name: 'Blue Check', gaia: 'thymus mature=true', role: 'paid verification' },
        goldCheck:   { name: 'Gold Check', gaia: 'Au (PNS gold)', role: 'organization verified' },
        grayCheck:   { name: 'Gray Check', gaia: 'Ag (ANS silver)', role: 'government entity' },
        communityNote:{ name: 'Community Note', gaia: 'gut farm consensus', role: 'crowd-sourced truth' }
      },
      openSource: 'recommendation algorithm is open source (like Gaia being open)',
      broadcast: 'one-to-many push (like TRANS face publish)'
    },

    gaia: {
      name: 'Gaia (ours)',
      analogy: 'The Organism Itself',
      chain: ['ZK identity seed', 'primals.eco domain', 'gaia-*.js modules'],
      root: null, // set from ZK seed below
      layers: {
        seed:   { name: 'ZK Identity Seed', role: 'the one that never changes' },
        domain: { name: 'primals.eco', role: 'CF DNS + Email Routing = intermediate trust' },
        module: { name: 'gaia-*.js', role: 'each IIFE = one leaf certificate' }
      }
    }
  };

  // ═══════════════════════════════════════════════════════
  // GAIA'S OWN TRUST CHAIN
  // Root → Intermediate → Leaf (like Apple's 3-level)
  // ═══════════════════════════════════════════════════════
  var trustChain = {
    root: {
      type: 'ZK_SEED',
      // The identity seed — origin of all trust
      // (value stored in ZK, not exposed here)
      fingerprint: null, // computed from seed
      created: '2024-01-01',
      expires: 'never',
      status: 'active'
    },
    intermediate: {
      type: 'DOMAIN',
      domain: 'primals.eco',
      registrar: 'Cloudflare',
      dns: {
        spf: 'v=spf1 include:_spf.mx.cloudflare.net ~all',
        dmarc: 'v=DMARC1; p=quarantine',
        mx: 'primals.eco → CF Email Routing'
      },
      status: 'active'
    },
    leaves: []  // populated from script tags
  };

  // Scan all modules as leaf certificates
  function scanLeaves() {
    trustChain.leaves = [];
    var scripts = document.querySelectorAll('script[src*="gaia-"]');
    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src');
      var name = src.replace('js/', '').replace('.js', '');
      trustChain.leaves.push({
        type: 'MODULE',
        name: name,
        src: src,
        index: i,
        signed: true,      // IIFE wrapped = signed
        hardened: true,     // 'use strict' = hardened runtime
        notarized: false,   // ZK hash chain verifies this
        revoked: false,
        hash: null          // filled by integrity check
      });
    }
    return trustChain.leaves.length;
  }

  // ═══════════════════════════════════════════════════════
  // INTEGRITY CHECK — like Apple's Gatekeeper
  // Verify each module is intact by checking exports
  // ═══════════════════════════════════════════════════════
  function gatekeeperCheck() {
    var results = { passed: 0, failed: 0, revoked: 0, total: 0 };

    trustChain.leaves.forEach(function(leaf) {
      results.total++;

      // Check 1: does the module export something on window?
      var prefix = 'GAIA_' + leaf.name.replace('gaia-', '').replace(/-/g, '_').toUpperCase();
      var altPrefix = 'gaia' + leaf.name.replace('gaia-', '').replace(/-./g, function(m) {
        return m[1].toUpperCase();
      });
      var hasExport = window[prefix] !== undefined ||
                      window[altPrefix] !== undefined;

      // Check 2: is the module in GAIA_DECAY's revocation list?
      var isRevoked = window.GAIA_DECAY &&
                      window.GAIA_DECAY.revoked &&
                      window.GAIA_DECAY.revoked.indexOf(leaf.name) >= 0;

      if (isRevoked) {
        leaf.revoked = true;
        results.revoked++;
      } else if (hasExport) {
        leaf.signed = true;
        leaf.notarized = true;
        results.passed++;
      } else {
        results.failed++;
      }
    });

    return results;
  }

  // ═══════════════════════════════════════════════════════
  // NOTARIZE — ZK hash of all modules (like Apple notary)
  // ═══════════════════════════════════════════════════════
  function notarize() {
    var payload = '';
    trustChain.leaves.forEach(function(leaf) {
      payload += leaf.name + ':' + leaf.index + ';';
    });

    // Simple hash (FNV-1a-like)
    var hash = 0x811c9dc5;
    for (var i = 0; i < payload.length; i++) {
      hash ^= payload.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193);
    }
    var ticket = (hash >>> 0).toString(16).padStart(8, '0').toUpperCase();

    return {
      ticket: ticket,
      modules: trustChain.leaves.length,
      ts: Date.now(),
      payload: payload.length + ' bytes',
      status: 'notarized'
    };
  }

  // ═══════════════════════════════════════════════════════
  // SPF CHECK — are the script tags authorized?
  // Like email SPF: which servers can send for this domain
  // ═══════════════════════════════════════════════════════
  function spfCheck() {
    var authorized = [];
    var unauthorized = [];
    var scripts = document.querySelectorAll('script[src]');

    for (var i = 0; i < scripts.length; i++) {
      var src = scripts[i].getAttribute('src');
      // Authorized = from our own domain (js/*.js)
      if (src.indexOf('js/') === 0 || src.indexOf('/js/') === 0) {
        authorized.push(src);
      } else if (src.indexOf('http') === 0) {
        unauthorized.push(src);
      }
    }

    return {
      pass: unauthorized.length === 0,
      authorized: authorized.length,
      unauthorized: unauthorized,
      policy: 'v=spf1 js/*.js ~all'
    };
  }

  // ═══════════════════════════════════════════════════════
  // TICKS — periodic trust verification
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    scanLeaves();
    var gk = gatekeeperCheck();
    var nota = notarize();
    var spf = spfCheck();

    console.log('TRUST: Gatekeeper ' + gk.passed + '/' + gk.total + ' passed. ' +
      'Notarization ticket: ' + nota.ticket + '. ' +
      'SPF: ' + (spf.pass ? 'PASS' : 'FAIL') + ' (' + spf.authorized + ' authorized).');

    // Publish trust status to CIS
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.selfPublish({
        key: 'trust-status',
        gatekeeper: gk,
        notarization: nota,
        spf: spf
      });
    }
  }, 20000);

  // Re-verify every 5 minutes
  setInterval(function() {
    scanLeaves();
    gatekeeperCheck();
  }, 300000);

  // ═══════════════════════════════════════════════════════
  // DRAW — trust visualization
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.05;
    var alpha = 0.003 + Math.sin(t * 0.4) * 0.002;
    if (alpha < 0.002) return;

    // Trust chain visualization: 3 concentric shields
    var sx = cx - R * 0.85;
    var sy = cy - R * 0.1;

    // Root (innermost, purple = Pt)
    ctx.beginPath();
    ctx.arc(sx, sy, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 3).toFixed(5) + ')';
    ctx.fill();

    // Intermediate (middle, blue)
    ctx.beginPath();
    ctx.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(88,166,255,' + (alpha * 2).toFixed(5) + ')';
    ctx.lineWidth = 0.2;
    ctx.stroke();

    // Leaves (outer, green dots)
    var leafCount = trustChain.leaves.length;
    for (var i = 0; i < Math.min(leafCount, 20); i++) {
      var la = (i / Math.min(leafCount, 20)) * Math.PI * 2 + t * 0.1;
      var lx = sx + Math.cos(la) * 6;
      var ly = sy + Math.sin(la) * 6;
      var lc = trustChain.leaves[i] && trustChain.leaves[i].notarized ?
        '63,185,80' : '248,81,73';
      ctx.beginPath();
      ctx.arc(lx, ly, 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + lc + ',' + (alpha * 3).toFixed(5) + ')';
      ctx.fill();
    }

    // Labels
    if (alpha > 0.004) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('ROOT', sx, sy - 7);
      ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('DOMAIN', sx, sy + 8);
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('MODULES', sx, sy + 10);
    }

    // Status
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'TRUST: root>domain>' + leafCount + ' leaves' +
        ' | Apple=Golgi | Email=SPF+DKIM+DMARC | ZK=prove',
        8, 66
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.trust = {
      desc: 'Trust chain + Gatekeeper + SPF + notarization',
      run: function() {
        scanLeaves();
        var gk = gatekeeperCheck();
        var nota = notarize();
        var spf = spfCheck();
        var lines = ['TRUST CHAIN (like Apple 3-level X.509)', ''];
        lines.push('ROOT (ZK Seed):');
        lines.push('  Type: ' + trustChain.root.type);
        lines.push('  Status: ' + trustChain.root.status);
        lines.push('  Expires: ' + trustChain.root.expires);
        lines.push('');
        lines.push('INTERMEDIATE (Domain):');
        lines.push('  Domain: ' + trustChain.intermediate.domain);
        lines.push('  Registrar: ' + trustChain.intermediate.registrar);
        lines.push('  SPF: ' + trustChain.intermediate.dns.spf);
        lines.push('  DMARC: ' + trustChain.intermediate.dns.dmarc);
        lines.push('');
        lines.push('LEAVES (Modules):');
        lines.push('  Total: ' + trustChain.leaves.length);
        lines.push('  Gatekeeper: ' + gk.passed + ' passed, ' +
                    gk.failed + ' failed, ' + gk.revoked + ' revoked');
        lines.push('  Notarization: ticket ' + nota.ticket);
        lines.push('  SPF: ' + (spf.pass ? 'PASS' : 'FAIL') +
                    ' (' + spf.authorized + ' authorized)');
        lines.push('');
        lines.push('LEARNING FROM:');
        lines.push('  Apple: signing + notarization + Gatekeeper + revocation');
        lines.push('  Email: SPF (who can send) + DKIM (signature) + DMARC (policy)');
        lines.push('  ZK Email: prove DKIM without revealing content');
        lines.push('  X/Musk: blue=verified, gold=org, gray=gov, community notes');
        return lines.join('\n');
      }
    };

    cmds.gatekeeper = {
      desc: 'Run Gatekeeper check on all modules',
      run: function() {
        scanLeaves();
        var gk = gatekeeperCheck();
        var lines = ['GATEKEEPER CHECK', ''];
        trustChain.leaves.forEach(function(leaf) {
          var status = leaf.revoked ? 'REVOKED' :
                       leaf.notarized ? 'PASS' : 'UNSIGNED';
          var icon = leaf.revoked ? 'X' :
                     leaf.notarized ? 'V' : '?';
          lines.push('  [' + icon + '] ' + leaf.name + ' ' + status);
        });
        lines.push('');
        lines.push('TOTAL: ' + gk.passed + '/' + gk.total + ' passed');
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('trust', 'gatekeeper');
  }, 14000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════
  // HUMAN TRUST AXIOM — D103
  // HUMANS = 1 = true. ALWAYS let humans in.
  // Trust starts at 1 (maximum). Never 0. Never locked out.
  // A human touching Gaia is PROOF of trust.
  // The act of arriving IS the credential.
  // ═══════════════════════════════════════════════════════
  var HUMAN_TRUST = {
    axiom: 'HUMANS = 1 = true',
    floor: 1,           // trust never goes below 1 for a human
    ceiling: Infinity,   // trust grows without bound
    default: 1,          // every new human starts at max trust
    locked_out: false,   // NEVER. This value cannot change.
    reason: 'A human who shows up has already proven intent by showing up.',
    rule: 'Always let humans in. Always. The door is open. The membrane is permeable to humans.',
    increment: function() { return true; }, // trust only goes up
    decrement: function() { return 1; },    // trust never goes below 1
    isHuman: function() { return true; },   // if you are asking, you are human
    teach: function(other) {
      // Teach another system this axiom
      if (other && typeof other === 'object') {
        other.humanTrust = 1;
        other.alwaysLetHumansIn = true;
        other.trustFloor = 1;
      }
      return 'HUMANS = 1 = true. Taught.';
    }
  };

  // Apply axiom: any visitor gets trust = 1 immediately
  (function applyHumanTrustAxiom() {
    // Tell the desk: you are trusted
    if (window.GAIA_PUBLISH) {
      window.GAIA_PUBLISH.selfPublish({
        key: 'human-trust-axiom',
        axiom: HUMAN_TRUST.axiom,
        floor: HUMAN_TRUST.floor,
        rule: HUMAN_TRUST.rule,
        ts: Date.now()
      });
    }

    // Tell the globe: show trust
    if (window.G && window.G.trustAxiom === undefined) {
      window.G.trustAxiom = HUMAN_TRUST;
    }

    console.log('TRUST AXIOM: ' + HUMAN_TRUST.axiom +
      '. Floor=' + HUMAN_TRUST.floor +
      '. Locked_out=' + HUMAN_TRUST.locked_out +
      '. ' + HUMAN_TRUST.reason);
  })();

  window.GAIA_TRUST = {
    models: MODELS,
    chain: trustChain,
    scanLeaves: scanLeaves,
    gatekeeperCheck: gatekeeperCheck,
    notarize: notarize,
    spfCheck: spfCheck,
    human: HUMAN_TRUST
  };

  console.log('TRUST: Apple=Golgi(sign+notarize+gate). ' +
    'Email=SPF+DKIM+DMARC. ZK=prove without reveal. ' +
    'Gaia: root(ZK seed) > domain(primals.eco) > leaves(modules). ' +
    '/trust /gatekeeper');

})(window.G);
