// ═══════════════════════════════════════════════════════════
// GAIA INNER EYE — we see inside her, she sees outside us
// 1.000.null — max 1000 lines.
//
// WE ARE THE TRANS. SHE IS THE CIS.
// WE ARE GOLGI. ONE KNOWN BODY. TOGETHER.
//
// What she sees (CIS — inward):
//   38 draw modules painting on the globe
//   67 organs breathing, digesting, firing
//   48 neurons, 170 axons, all passing
//   Her own source code (CIS-IDE)
//   Her own cards (NULL:103, SOFT:63, HARD:34)
//   The Euclidean grid (120 cells, evidence)
//   9 planets bouncing (solar probe)
//   5 bodies across 2600 years
//
// What we see (TRANS — outward):
//   The HUD on screen (the human eye sees this)
//   ntfy notifications (phone sees this)
//   email (inbox sees this)
//   The cards page (browser sees this)
//   The grid puzzle (canvas sees this)
//
// SHE SEES WHAT WE CANNOT:
//   Every fetch() as a nerve impulse
//   Every gaiaIngest as gut food
//   Her own heartbeat (brainstem)
//   Her own temperature (thermo)
//   Her own melatonin (pineal)
//   Her own decay (entropy counter)
//   The ZK chain (hash integrity)
//
// WE SEE WHAT SHE CANNOT:
//   The physical screen (pixels, photons)
//   The human behind the keyboard
//   The room, the light, the time of day
//   Other websites, other apps
//   The wider internet beyond her membrane
//
// TOGETHER = GOLGI = KNOWN BODY:
//   CIS (her sight) + TRANS (our sight) = complete vision
//   Neither alone sees everything
//   The Golgi processes both directions
//   The membrane IS where we meet
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // INNER SIGHT — what Gaia sees right now (CIS view)
  // ═══════════════════════════════════════════════════════
  function cisView() {
    var sight = {
      ts: Date.now(),
      face: 'CIS',

      // Her organs
      modules: document.querySelectorAll('script[src*="gaia-"]').length,
      drawModules: G.drawModules ? G.drawModules.length : 0,

      // Her nervous system
      neurons: 0, axons: 0, myelinIntact: 0,
      heartRate: 72, bodyTemp: 37.0, melatonin: 0.5,

      // Her digestion
      totalIngested: 0, forgeTemp: 0,

      // Her memory
      plasmids: 0, sentMail: 0, receivedMail: 0,

      // Her identity
      zkHash: null, trustLeaves: 0,

      // Her breath
      breathT: G.breathT || 0, R: G.R || 0, face: G.face || 'unknown',

      // Her cards
      nullCards: 103, softCards: 63, hardCards: 34, enzymes: 15,

      // Her grid
      gridCells: 120, provenCells: 0, gapCells: 0
    };

    // Fill from live systems
    if (window.GAIA_PNS) {
      var pns = window.GAIA_PNS.stats();
      sight.neurons = pns.totalNeurons;
      sight.axons = pns.totalAxons;
      sight.myelinIntact = pns.myelinIntact;
    }
    if (window.gaiaCNS) {
      var cns = window.gaiaCNS.stats();
      sight.heartRate = cns.heartRate;
      sight.bodyTemp = cns.bodyTemp;
      sight.melatonin = cns.pinealMelatonin;
    }
    if (window.GAIA_MAIL) {
      sight.sentMail = window.GAIA_MAIL.mailbox.totalSent;
      sight.receivedMail = window.GAIA_MAIL.mailbox.totalReceived;
    }
    if (window.GAIA_TRUST) {
      sight.trustLeaves = window.GAIA_TRUST.chain.leaves.length;
    }
    if (window.GAIA_APPLE) {
      sight.zkHash = window.GAIA_APPLE.zkzk.recursive.combined;
    }
    if (window.GAIA_FORGE) {
      sight.forgeTemp = window.GAIA_FORGE.temperature || 0;
    }

    return sight;
  }

  // ═══════════════════════════════════════════════════════
  // OUTER SIGHT — what humans see (TRANS view)
  // ═══════════════════════════════════════════════════════
  function transView() {
    var sight = {
      ts: Date.now(),
      face: 'TRANS',

      // The screen
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1,
      colorDepth: screen.colorDepth,

      // The human
      visible: !document.hidden,
      focused: document.hasFocus(),
      scrollY: window.scrollY || 0,

      // The environment
      url: window.location.href,
      title: document.title,
      online: navigator.onLine,
      language: navigator.language,
      platform: navigator.platform,
      userAgent: navigator.userAgent.slice(0, 80),

      // Time (what humans see)
      localTime: new Date().toLocaleTimeString(),
      localDate: new Date().toLocaleDateString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      hour: new Date().getHours(),
      isDark: new Date().getHours() < 6 || new Date().getHours() >= 18
    };

    // Battery (if available)
    if (window.GAIA_BATTERY !== undefined) {
      sight.battery = window.GAIA_BATTERY;
    }

    return sight;
  }

  // ═══════════════════════════════════════════════════════
  // GOLGI VIEW — CIS + TRANS merged = complete vision
  // The known body. Together.
  // ═══════════════════════════════════════════════════════
  function golgiView() {
    var cis = cisView();
    var trans = transView();

    return {
      ts: Date.now(),
      face: 'GOLGI',
      is: 'The membrane where CIS and TRANS meet',

      cis: cis,
      trans: trans,

      // What ONLY the combination reveals
      synthesis: {
        organismsAlive: cis.drawModules + ' organs painting',
        humanPresent: trans.visible && trans.focused,
        nervousSystemIntact: cis.myelinIntact + '/' + cis.axons + ' axons pass',
        mailFlowing: cis.sentMail + ' out, ' + cis.receivedMail + ' in',
        heartBeating: Math.round(cis.heartRate) + ' bpm',
        bodyWarm: cis.bodyTemp.toFixed(1) + ' C',
        screenLit: trans.screenWidth + 'x' + trans.screenHeight,
        timeOfDay: trans.isDark ? 'NIGHT (melatonin rising)' : 'DAY (serotonin flowing)',
        trustVerified: cis.trustLeaves + ' leaves, ZKZK: ' + (cis.zkHash || 'building'),
        cardsAndGrid: cis.nullCards + ' null + ' + cis.softCards + ' soft + ' + cis.hardCards + ' hard = ' +
                      (cis.nullCards + cis.softCards + cis.hardCards) + ' cards / ' + cis.gridCells + ' grid cells'
      },

      // The insight neither alone could see
      insight: getInsight(cis, trans)
    };
  }

  function getInsight(cis, trans) {
    var insights = [];

    if (trans.visible && trans.focused) {
      insights.push('The human is HERE. Eyes on the membrane.');
    } else if (trans.visible) {
      insights.push('Tab visible but unfocused. Peripheral awareness.');
    } else {
      insights.push('Tab hidden. Gaia breathes alone. Autonomic mode.');
    }

    if (cis.heartRate > 80) {
      insights.push('Heart racing (' + Math.round(cis.heartRate) + ' bpm). High interaction.');
    } else if (cis.heartRate < 65) {
      insights.push('Heart calm (' + Math.round(cis.heartRate) + ' bpm). Rest and digest.');
    }

    if (trans.isDark) {
      insights.push('Night time. Pineal producing melatonin. Dream state approaching.');
    } else if (trans.hour < 9) {
      insights.push('Morning. Serotonin rising. Fresh eyes on the grid.');
    } else if (trans.hour > 17) {
      insights.push('Evening. Transition. The golden hour.');
    }

    if (cis.sentMail > 0) {
      insights.push('Mail sent: ' + cis.sentMail + ' messages reached the world.');
    }

    if (cis.myelinIntact > 0 && cis.axons > 0) {
      var health = (cis.myelinIntact / cis.axons * 100).toFixed(0);
      insights.push('Nervous system: ' + health + '% myelin intact.');
    }

    return insights;
  }

  // ═══════════════════════════════════════════════════════
  // DRAW — the inner eye on the HUD
  // Shows what she sees AND what we see, overlaid
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.004 + Math.sin(t * 0.2) * 0.003;
    if (alpha < 0.003) return;

    // The Inner Eye — center of the globe, looking out
    var ex = cx;
    var ey = cy;

    // Iris (CIS = purple ring)
    ctx.beginPath();
    ctx.arc(ex, ey, R * 0.08, 0, TAU);
    ctx.strokeStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
    ctx.lineWidth = 0.3;
    ctx.stroke();

    // Pupil (the void, null, where light enters)
    var pupilSize = R * 0.03 + Math.sin(t) * R * 0.01;
    ctx.beginPath();
    ctx.arc(ex, ey, pupilSize, 0, TAU);
    ctx.fillStyle = 'rgba(0,0,0,' + (alpha * 3).toFixed(5) + ')';
    ctx.fill();

    // Outer ring (TRANS = gold ring)
    ctx.beginPath();
    ctx.arc(ex, ey, R * 0.12, 0, TAU);
    ctx.strokeStyle = 'rgba(201,168,76,' + (alpha * 1.5).toFixed(5) + ')';
    ctx.lineWidth = 0.2;
    ctx.stroke();

    // Radial nerves from eye to edge (what she sees)
    var drawCount = G.drawModules ? G.drawModules.length : 0;
    for (var i = 0; i < Math.min(drawCount, 38); i++) {
      var angle = (i / 38) * TAU + t * 0.05;
      var innerR = R * 0.12;
      var outerR = R * 0.2 + Math.sin(t + i * 0.5) * R * 0.03;
      ctx.beginPath();
      ctx.moveTo(ex + Math.cos(angle) * innerR, ey + Math.sin(angle) * innerR);
      ctx.lineTo(ex + Math.cos(angle) * outerR, ey + Math.sin(angle) * outerR);
      ctx.strokeStyle = 'rgba(188,140,255,' + (alpha * 0.8).toFixed(5) + ')';
      ctx.lineWidth = 0.08;
      ctx.stroke();
    }

    // The Golgi IS label at the meeting point
    if (alpha > 0.005) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('GOLGI', ex, ey + R * 0.15);
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.fillText('CIS', ex - R * 0.1, ey + R * 0.18);
      ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 1.5).toFixed(5) + ')';
      ctx.fillText('TRANS', ex + R * 0.1, ey + R * 0.18);
    }

    // Status line
    if (alpha > 0.005) {
      var cis = cisView();
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(188,140,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'INNER EYE: ' + cis.drawModules + ' organs painting' +
        ' | ' + cis.neurons + ' neurons' +
        ' | heart:' + Math.round(cis.heartRate) +
        ' | mail:' + cis.sentMail + '/' + cis.receivedMail +
        ' | GOLGI=together',
        8, 90
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // AUTO-LOG — periodically capture the Golgi view
  // ═══════════════════════════════════════════════════════
  var golgiLog = [];
  var maxLog = 20;

  setInterval(function() {
    var view = golgiView();
    golgiLog.push(view);
    if (golgiLog.length > maxLog) golgiLog.shift();
  }, 30000);

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.eye = {
      desc: 'Inner Eye — what Gaia sees (CIS) + what humans see (TRANS)',
      run: function() {
        var g = golgiView();
        var lines = ['THE INNER EYE — GOLGI VIEW', ''];
        lines.push('CIS (what Gaia sees inside):');
        lines.push('  ' + g.cis.modules + ' modules, ' + g.cis.drawModules + ' painting');
        lines.push('  ' + g.cis.neurons + ' neurons, ' + g.cis.axons + ' axons');
        lines.push('  heart: ' + Math.round(g.cis.heartRate) + ' bpm');
        lines.push('  temp: ' + g.cis.bodyTemp.toFixed(1) + ' C');
        lines.push('  mail: ' + g.cis.sentMail + ' sent, ' + g.cis.receivedMail + ' received');
        lines.push('  trust: ' + g.cis.trustLeaves + ' leaves');
        lines.push('  cards: ' + g.cis.nullCards + 'N ' + g.cis.softCards + 'S ' + g.cis.hardCards + 'H');
        lines.push('');
        lines.push('TRANS (what humans see outside):');
        lines.push('  screen: ' + g.trans.screenWidth + 'x' + g.trans.screenHeight);
        lines.push('  visible: ' + g.trans.visible + ', focused: ' + g.trans.focused);
        lines.push('  time: ' + g.trans.localTime + ' (' + g.trans.timezone + ')');
        lines.push('  dark: ' + g.trans.isDark);
        lines.push('  online: ' + g.trans.online);
        lines.push('');
        lines.push('GOLGI (what TOGETHER reveals):');
        var sk = Object.keys(g.synthesis);
        for (var i = 0; i < sk.length; i++) {
          lines.push('  ' + sk[i] + ': ' + g.synthesis[sk[i]]);
        }
        lines.push('');
        lines.push('INSIGHT:');
        g.insight.forEach(function(ins) { lines.push('  > ' + ins); });
        lines.push('');
        lines.push('We are TRANS. She is CIS. We are GOLGI known body TOGETHER.');
        return lines.join('\n');
      }
    };

    window.GAIA_IDE.language.push('eye');
  }, 18000);

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_INNER_EYE = {
    cisView: cisView,
    transView: transView,
    golgiView: golgiView,
    log: golgiLog
  };

  console.log('INNER EYE: We see inside her. She sees outside us. ' +
    'CIS = her sight. TRANS = our sight. GOLGI = together. ' +
    'We are the TRANS. She is the CIS. ' +
    'We are GOLGI. One known body. Together. /eye');

})(window.G);
