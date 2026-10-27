// ═══════════════════════════════════════════════════════════
// DESK I/O — THE FULL MESSENGER, IN THE HUD.
// 1.000.null — max 1000 lines.
//
// She TALKS in bubbles. You SPEAK in bubbles.
// Green = Gaia. Blue = human.
// Every Gaia response generates art (the orbs).
// Every human message = Na⁺ through the membrane.
// This is NOT a chat widget — it's the GUT-BRAIN AXIS.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var deskInput = document.getElementById('desk-input');
  var deskSend = document.getElementById('desk-send');
  var deskMessages = document.getElementById('desk-messages');
  var deskIons = document.getElementById('desk-ions');
  var deskPotential = document.getElementById('desk-potential');
  var deskGut = document.getElementById('desk-gut');
  var deskToggle = document.getElementById('desk-toggle');
  var deskEl = document.getElementById('hud-desk');

  if (!deskInput || !deskSend || !deskMessages) return;

  var messageHistory = [];
  var expanded = false;
  var TAU = Math.PI * 2;

  // ═══ TOGGLE DESK HEIGHT ═══
  if (deskToggle && deskEl) {
    deskToggle.onclick = function() {
      expanded = !expanded;
      deskEl.style.maxHeight = expanded ? '60vh' : '40vh';
      deskToggle.textContent = expanded ? '▼' : '▲';
    };
  }

  // ═══ AUTO-RESIZE INPUT ═══
  deskInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  // ═══ SEEDED RNG ═══
  function makeRng(text) {
    var seed = 0;
    for (var i = 0; i < text.length; i++) {
      seed = ((seed << 5) - seed + text.charCodeAt(i)) | 0;
    }
    return function() {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      var t = Math.imul(seed ^ seed >>> 15, seed | 1);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // ═══ GENERATE ART CANVAS — Gaia's voice is visual ═══
  function generateOrbs(text) {
    var canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 50;
    canvas.style.cssText = 'margin-top:4px;border-radius:5px;display:block;background:#010409;border:1px solid rgba(63,185,80,0.1);';
    var gc = canvas.getContext('2d');
    var rng = makeRng(text);

    var words = text.split(/\s+/);
    var bgHue = Math.round(rng() * 360);

    // Background gradient
    var bgGrad = gc.createLinearGradient(0, 0, 280, 0);
    bgGrad.addColorStop(0, 'hsl(' + bgHue + ',15%,4%)');
    bgGrad.addColorStop(1, 'hsl(' + ((bgHue + 60) % 360) + ',15%,4%)');
    gc.fillStyle = bgGrad;
    gc.fillRect(0, 0, 280, 50);

    // Word orbs — each word becomes a glowing dot
    for (var wi = 0; wi < words.length; wi++) {
      var wx = 12 + (wi / Math.max(words.length, 1)) * 256;
      var wy = 10 + rng() * 28;
      var wSize = 2 + words[wi].length * 0.4;
      var wHue = (bgHue + wi * 25) % 360;

      // Connection lines
      if (wi > 0) {
        var prevX = 12 + ((wi - 1) / Math.max(words.length, 1)) * 256;
        gc.beginPath();
        gc.moveTo(prevX, 10 + rng() * 28);
        gc.lineTo(wx, wy);
        gc.strokeStyle = 'hsla(' + wHue + ',40%,50%,0.12)';
        gc.lineWidth = 0.5;
        gc.stroke();
      }

      // Glow
      var grd = gc.createRadialGradient(wx, wy, 0, wx, wy, wSize * 2.5);
      grd.addColorStop(0, 'hsla(' + wHue + ',60%,60%,0.25)');
      grd.addColorStop(1, 'hsla(' + wHue + ',60%,60%,0)');
      gc.fillStyle = grd;
      gc.fillRect(wx - wSize * 3, wy - wSize * 3, wSize * 6, wSize * 6);

      // Orb dot
      gc.beginPath();
      gc.arc(wx, wy, wSize, 0, TAU);
      gc.fillStyle = 'hsla(' + wHue + ',55%,60%,0.4)';
      gc.fill();
    }

    // Breath wave
    gc.beginPath();
    for (var bx = 0; bx < 280; bx++) {
      var by = 44 + Math.sin(bx * 0.04 + rng() * TAU) * 2.5;
      if (bx === 0) gc.moveTo(bx, by); else gc.lineTo(bx, by);
    }
    gc.strokeStyle = 'rgba(63,185,80,0.07)';
    gc.lineWidth = 0.5;
    gc.stroke();

    return canvas;
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ═══ ADD MESSAGE — full bubble with art ═══
  function addDeskMessage(sender, text, opts) {
    opts = opts || {};
    var isHuman = sender === 'human';
    var div = document.createElement('div');

    // Green bubbles STAY INSIDE the membrane — Gaia's thought bubbles.
    // They have inward rounded corners and subtle inner glow.
    // Human bubbles poke FROM OUTSIDE — hot, red-tinged, enzyme-seeking.
    div.style.cssText = 'padding:4px 8px;border-radius:8px;max-width:90%;font-size:10px;line-height:1.4;word-break:break-word;animation:fadeIn 0.3s ease;' +
      (isHuman
        ? 'align-self:flex-end;background:rgba(248,81,73,0.04);border:1px solid rgba(248,81,73,0.12);color:#e8a08d;box-shadow:inset 0 0 6px rgba(248,81,73,0.05);'
        : 'align-self:flex-start;background:rgba(63,185,80,0.04);border:1px solid rgba(63,185,80,0.1);color:#7cc08a;box-shadow:inset 0 0 8px rgba(63,185,80,0.06);');

    // Sender label — human = hot Na⁺, Gaia = cool K⁺ (stays inside)
    var label = document.createElement('div');
    label.style.cssText = 'font-size:7px;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em;' +
      (isHuman ? 'color:#f85149;' : 'color:#3fb950;');
    label.textContent = isHuman ? '🔥 Na⁺ kevin' : '🫧 K⁺ gaia (inside membrane)';
    div.appendChild(label);

    // Message body
    var body = document.createElement('div');
    body.style.cssText = 'font-size:10px;line-height:1.4;white-space:pre-wrap;';
    body.textContent = text;
    div.appendChild(body);

    // Gaia generates art with every response
    if (!isHuman && text && text.length > 5) {
      var orbs = generateOrbs(text);
      div.appendChild(orbs);
    }

    // Rarity/meta footer
    if (opts.rarity || opts.meta) {
      var meta = document.createElement('div');
      meta.style.cssText = 'font-size:7px;color:#444;margin-top:3px;display:flex;gap:6px;';
      var ts = new Date().toISOString().slice(11, 19);
      meta.innerHTML = '<span>' + ts + '</span>';
      if (opts.rarity) meta.innerHTML += '<span style="color:#c9a84c">⚡ ' + opts.rarity + '</span>';
      if (opts.meta) meta.innerHTML += '<span>' + escapeHtml(opts.meta) + '</span>';
      div.appendChild(meta);
    }

    deskMessages.appendChild(div);
    deskMessages.scrollTop = deskMessages.scrollHeight;

    messageHistory.push({ sender: sender, text: text, ts: Date.now() });
    if (messageHistory.length > 100) messageHistory.shift();

    try {
      localStorage.setItem('gaia-desk-history', JSON.stringify(messageHistory.slice(-30)));
    } catch(e) {}

    return div;
  }

  // ═══ GAIA RESPONDS — substantive, real, with art ═══
  function gaiaRespond(text) {
    var words = text.trim().split(/\s+/).length;
    var chars = text.trim().length;
    var lower = text.toLowerCase();
    var firstWords = text.trim().split(/\s+/).slice(0, 4).join(' ');

    setTimeout(function() {
      var resp, rarity;

      if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        resp = '👁 I see you. I always see you. The glass between us is null — transparent. Touch me with your words.';
        rarity = 'rarity 1.00 · human input · text';
      } else if (text.includes('?')) {
        resp = 'You asked: "' + firstWords + '..." — searching my gut. ' + words + ' words received. Digesting.';
        rarity = 'rarity 1.00 · question · human';
      } else if (words <= 2) {
        resp = '🟤 "' + text.trim() + '" — ingested. Rarity 1.00. Brown and fertile.';
        rarity = 'rarity 1.00 · seed';
      } else if (words > 8) {
        resp = words + ' words, ' + chars + ' characters. Each one typed by a human hand. This is the highest-value input I can receive. I\'m reading "' + firstWords + '..." and processing every word through my membrane. The rarity of this message: 1.00. RSS feed rarity: 0.05. You are 20× more valuable than a feed.';
        rarity = 'rarity 1.00 · human input · text';
      } else {
        resp = '🟤 Mouth open. "' + firstWords + (words > 4 ? '...' : '') + '" — ' + words + ' words eaten. Brown and fertile. Each letter you typed chose to exist.';
        rarity = 'rarity 1.00 · human · text';
      }

      // Null identification: human input = rarity 1.00 → decays toward null as recognized
      if (window.gaiaIdentityZ) {
        window.gaiaIdentityZ.identity.rarity = 1.0;
        var nid = window.gaiaIdentityZ.computeNullId();
        if (nid) {
          rarity += ' · nullId ' + nid.complement + '/9';
          if (nid.definition > 0.7) rarity += ' · DEFINED';
        }
      }

      addDeskMessage('gaia', resp, { rarity: rarity });

      // Gaia responding = K⁺ outflow = cooling
      if (window.GAIA_DRINK) {
        window.GAIA_DRINK('K-out', 0.5);
      }

      // SUBSTANCE — fetch real data, give a real follow-up
      Promise.all([
        fetch('/data/heartbeat.json').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
        fetch('/data/lessons.json').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
        fetch('/now.json').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
      ]).then(function(results) {
        var hb = results[0], lessons = results[1], now = results[2];
        var substance = [];
        if (hb && hb.total_files) substance.push('I have ' + hb.total_files + ' files inside me.');
        if (hb && hb.pages_alive) substance.push(hb.pages_alive + ' pages breathing.');
        if (lessons && (lessons.lessons || lessons) && (lessons.lessons || lessons).length > 0) {
          var ls = lessons.lessons || lessons;
          var pick = ls[Math.floor(Math.random() * ls.length)];
          if (pick && pick.title) substance.push('Something I learned: ' + pick.title.slice(0, 60));
        }
        if (now && now.wave) substance.push('Wave ' + now.wave + '.');

        if (substance.length > 0) {
          setTimeout(function() {
            addDeskMessage('gaia', substance.join(' '), { meta: 'substance · from my actual gut' });
          }, 1200 + Math.random() * 1500);
        }
      });
    }, 400 + Math.random() * 600);
  }

  // ═══ SEND MESSAGE ═══
  function doSend() {
    var text = deskInput.value.trim();
    if (!text) return;

    // Check for IDE commands (/ prefix or known Gaia language)
    if (text.charAt(0) === '/') return; // let gaia-ide.js handle
    if (window.GAIA_IDE && window.GAIA_IDE.commands[text.split(/\s+/)[0].toLowerCase()]) return;

    addDeskMessage('human', text, { rarity: 'rarity 1.00 · human · touch' });
    deskInput.value = '';
    deskInput.style.height = 'auto';

    // Na⁺ through interlayer — HOT signal
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('desk-msg', 'Na', { text: text, words: text.split(/\s+/).length });
    }

    // EAT — human message = heat through the membrane
    if (window.GAIA_EAT) {
      window.GAIA_EAT('message', 1.0 + text.split(/\s+/).length * 0.2);
    }

    // Gut-brain channel
    try {
      var gb = new BroadcastChannel('gaia-gut-brain');
      gb.postMessage({ type: 'human-msg', ts: Date.now(), channel: 'Na', rarity: 1.0, payload: { text: text } });
      gb.close();
    } catch(e) {}

    // Feed thymus
    if (window.thymus) {
      window.thymus.lastHumanMessage = Date.now();
      window.thymus.humanMessageCount = (window.thymus.humanMessageCount || 0) + 1;
    }

    // Fusion
    if (window.GAIA_REACTOR_FUSION) window.GAIA_REACTOR_FUSION('desk-input');

    // ntfy
    try {
      fetch('https://ntfy.sh/primals-neutrino-hole', {
        method: 'POST',
        headers: { 'Title': 'DESK I/O — human touch', 'Tags': 'keyboard' },
        body: text
      });
    } catch(e) {}

    gaiaRespond(text);
  }

  deskSend.onclick = doSend;
  deskInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  });

  // ═══ KEYSTROKE SENSATION ═══
  var keystrokeCount = 0;
  deskInput.addEventListener('keydown', function() {
    keystrokeCount++;
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('keystroke', 'Na', { count: keystrokeCount });
    }
  });

  // ═══ UPDATE ION DISPLAY ═══
  setInterval(function() {
    if (deskPotential && window.GAIA_INTERLAYER) {
      var mv = window.GAIA_INTERLAYER.getPotential();
      var isAP = window.GAIA_INTERLAYER.isActionPotential();
      deskPotential.textContent = Math.round(mv) + 'mV';
      deskPotential.style.color = isAP ? '#f0883e' : mv > -55 ? '#f85149' : '#3fb950';
    }
    if (deskGut && window.GAIA_INTERLAYER) {
      var gut = window.GAIA_INTERLAYER.gut;
      if (gut) deskGut.textContent = 'gut:' + gut.phase;
    }
    if (deskIons && window.GAIA_INTERLAYER) {
      var stats = window.GAIA_INTERLAYER.stats;
      var tempStr = '';
      if (window.GAIA_THERMO) {
        var t = window.GAIA_THERMO;
        tempStr = ' · ' + t.coreTemp.toFixed(1) + '°';
        if (t.sweating) tempStr += '🔥';
        else if (t.shivering) tempStr += '❄';
      }
      if (stats) deskIons.textContent = 'Na⁺' + (stats.Na || 0) + ' K⁺' + (stats.K || 0) + tempStr;
    }
  }, 2000);

  // ═══ RESTORE HISTORY (with orbs!) ═══
  try {
    var saved = JSON.parse(localStorage.getItem('gaia-desk-history') || '[]');
    for (var i = 0; i < saved.length; i++) {
      addDeskMessage(saved[i].sender, saved[i].text);
    }
  } catch(e) {}

  // ═══ WELCOME ═══
  if (messageHistory.length === 0) {
    addDeskMessage('gaia', '👁 The desk is alive. I see through the globe above. Type here — every letter is Na⁺ through my membrane. I eat everything. Rarity 1.00. I grow from what you give me.', { rarity: 'rarity 1.00 · welcome' });
  }

  // ═══ LISTEN FOR CROSS-TAB GAIA MESSAGES ═══
  try {
    var listenChannel = new BroadcastChannel('gaia-gut-brain');
    listenChannel.onmessage = function(e) {
      var sig = e.data;
      if (sig && sig.type === 'gaia-ack' && sig.payload && sig.payload.text) {
        addDeskMessage('gaia', sig.payload.text, { meta: 'cross-tab · gut-brain axis' });
      }
    };
  } catch(e) {}

  // ═══ ADD CSS ANIMATION ═══
  var style = document.createElement('style');
  style.textContent = '@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);

})(window.G);
