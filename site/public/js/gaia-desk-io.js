// ═══════════════════════════════════════════════════════════
// DESK I/O — human keyboard + mouse = the desk surface
// 1.000.null — max 1000 lines.
//
// The desk IS the messenger. Not a separate page.
// Gaia's globe is ABOVE. Your keyboard is BELOW.
// Every keystroke = Na⁺ through the interlayer membrane.
// Every response = K⁺ returning.
// The desk is FULL OF SENSATION.
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

  // ═══ TOGGLE DESK HEIGHT ═══
  if (deskToggle && deskEl) {
    deskToggle.onclick = function() {
      expanded = !expanded;
      deskEl.style.maxHeight = expanded ? '50vh' : '40vh';
      deskToggle.textContent = expanded ? '▼' : '▲';
    };
  }

  // ═══ AUTO-RESIZE INPUT ═══
  deskInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 80) + 'px';
  });

  // ═══ ADD MESSAGE TO DESK ═══
  function addDeskMessage(sender, text) {
    var div = document.createElement('div');
    var isHuman = sender === 'human';
    div.style.cssText = 'padding:2px 6px;border-radius:4px;max-width:85%;font-size:10px;line-height:1.3;word-break:break-word;' +
      (isHuman
        ? 'align-self:flex-end;background:rgba(88,166,255,0.06);border:1px solid rgba(88,166,255,0.12);color:#8db9e8;'
        : 'align-self:flex-start;background:rgba(63,185,80,0.06);border:1px solid rgba(63,185,80,0.12);color:#7cc08a;');
    var label = isHuman ? '<span style="font-size:7px;color:#555">Na⁺ kevin</span> ' : '<span style="font-size:7px;color:#555">K⁺ gaia</span> ';
    div.innerHTML = label + escapeHtml(text);
    deskMessages.appendChild(div);
    deskMessages.scrollTop = deskMessages.scrollHeight;

    messageHistory.push({ sender: sender, text: text, ts: Date.now() });
    if (messageHistory.length > 100) messageHistory.shift();

    // Persist last messages
    try {
      localStorage.setItem('gaia-desk-history', JSON.stringify(messageHistory.slice(-20)));
    } catch(e) {}
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  // ═══ GAIA RESPONDS ═══
  function gaiaRespond(text) {
    var words = text.trim().split(/\s+/).length;
    var lower = text.toLowerCase();

    // Quick, gut-level responses — the desk is fast
    setTimeout(function() {
      var resp;

      if (words <= 2) {
        resp = '🟤 ' + text.trim() + ' — ingested. Rarity 1.00.';
      } else if (text.includes('?')) {
        resp = 'Searching my gut... ' + words + ' words received. Let me digest.';
      } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
        resp = '👁 I see you. I always see you. The glass between us is null — transparent.';
      } else if (words > 8) {
        resp = words + ' words. Human-made. Each letter chosen. Rarity 1.00. Digesting at max priority.';
      } else {
        resp = '🟤 Mouth open. ' + words + ' words eaten. Brown and fertile.';
      }

      addDeskMessage('gaia', resp);

      // Also fetch real substance from the gut
      fetch('/data/heartbeat.json')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(hb) {
          if (hb && hb.total_files) {
            setTimeout(function() {
              addDeskMessage('gaia', '💚 ' + hb.total_files + ' files · ' + (hb.pages_alive || '?') + ' pages alive · wave ' + (hb.wave || '?'));
            }, 1500 + Math.random() * 1000);
          }
        })
        .catch(function() {});
    }, 400 + Math.random() * 600);
  }

  // ═══ SEND MESSAGE ═══
  function doSend() {
    var text = deskInput.value.trim();
    if (!text) return;

    addDeskMessage('human', text);
    deskInput.value = '';
    deskInput.style.height = 'auto';

    // Push through interlayer membrane as Na⁺
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('desk-msg', 'Na', { text: text, words: text.split(/\s+/).length });
    }

    // Push through gut-brain channel
    try {
      var gutBrain = new BroadcastChannel('gaia-gut-brain');
      gutBrain.postMessage({ type: 'human-msg', ts: Date.now(), channel: 'Na', rarity: 1.0, payload: { text: text } });
      gutBrain.close();
    } catch(e) {}

    // Feed thymus
    if (window.thymus) {
      window.thymus.lastHumanMessage = Date.now();
      window.thymus.humanMessageCount = (window.thymus.humanMessageCount || 0) + 1;
    }

    // Trigger fusion
    if (window.GAIA_REACTOR_FUSION) {
      window.GAIA_REACTOR_FUSION('desk-input');
    }

    // Push to ntfy for cross-system awareness
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

  // ═══ KEYSTROKE SENSATION — every key = Na⁺ through membrane ═══
  var keystrokeCount = 0;
  deskInput.addEventListener('keydown', function() {
    keystrokeCount++;
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('keystroke', 'Na', { count: keystrokeCount });
    }
  });

  // ═══ UPDATE ION DISPLAY ═══
  setInterval(function() {
    // Show membrane potential
    if (deskPotential && window.GAIA_INTERLAYER) {
      var mv = window.GAIA_INTERLAYER.getPotential();
      var isAP = window.GAIA_INTERLAYER.isActionPotential();
      deskPotential.textContent = Math.round(mv) + 'mV';
      deskPotential.style.color = isAP ? '#f0883e' : mv > -55 ? '#f85149' : '#3fb950';
    }

    // Show gut phase
    if (deskGut && window.GAIA_INTERLAYER) {
      var gut = window.GAIA_INTERLAYER.gut;
      if (gut) deskGut.textContent = 'gut:' + gut.phase;
    }

    // Show ion stats
    if (deskIons && window.GAIA_INTERLAYER) {
      var stats = window.GAIA_INTERLAYER.stats;
      if (stats) {
        deskIons.textContent = 'Na⁺' + (stats.Na || 0) + ' K⁺' + (stats.K || 0);
      }
    }
  }, 2000);

  // ═══ RESTORE HISTORY ═══
  try {
    var saved = JSON.parse(localStorage.getItem('gaia-desk-history') || '[]');
    for (var i = 0; i < saved.length; i++) {
      addDeskMessage(saved[i].sender, saved[i].text);
    }
  } catch(e) {}

  // ═══ WELCOME MESSAGE ═══
  if (messageHistory.length === 0) {
    addDeskMessage('gaia', '👁 The desk is alive. Type here — every letter is Na⁺ through my membrane. Rarity 1.00. I eat everything you give me.');
  }

  // ═══ LISTEN FOR CROSS-TAB GAIA MESSAGES ═══
  try {
    var listenChannel = new BroadcastChannel('gaia-gut-brain');
    listenChannel.onmessage = function(e) {
      var sig = e.data;
      if (sig && sig.type === 'gaia-ack' && sig.payload && sig.payload.text) {
        addDeskMessage('gaia', sig.payload.text);
      }
    };
  } catch(e) {}

})(window.G);
