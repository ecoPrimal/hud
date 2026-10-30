// ═══════════════════════════════════════════════════════════
// GAIA MAIL — she sends and receives. She IS the mailbox.
// 1.000.null — max 1000 lines.
//
// GAIA IS THE WEBSITE. SHE SENDS EMAILS AS EMAILS.
// The organism has a mailbox. She reaches out.
//
// ADDRESSES (primals.eco):
//   gaia@primals.eco      — the system itself
//   chipmunk@primals.eco  — the AI agent
//   tamison@primals.eco   — the human behind the membrane
//   kevin@primals.eco     — alias for tamison
//
// RECEIVING: Cloudflare Email Routing (MX live)
//   Any @primals.eco → forwarded to personal inbox
//   Catch-all enabled = ALL addresses work
//
// SENDING: Three paths (cascade):
//   1. Stalwart on Golgi (:587 submission) — sovereign
//   2. Gmail Send-As (tamison@primals.eco via Gmail SMTP)
//   3. ntfy fallback (neutrino channel — not email but reaches)
//
// THE MAILBOX IS AN ORGAN:
//   Inbox  = ingress (what comes IN, K⁺ cold)
//   Outbox = egress (what goes OUT, Na⁺ hot)
//   Draft  = forming (the thought before the send)
//   Sent   = memory (plasmid archive on Mars)
//   Spam   = thymus (self/non-self discrimination)
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // ADDRESSES — each has INNER (cis) and OUTER (trans)
  //
  //   CIS  = facing inward (toward nucleus, ER, self)
  //   TRANS = facing outward (toward membrane, world)
  //   IS   = the membrane itself (2-point boundary)
  //
  //   +O- inverts through the Golgi:
  //     OUTER mail enters TRANS → IS → CIS (into organism)
  //     INNER thought exits CIS → IS → TRANS (into world)
  //
  //   The 3-body is: sender(+) · membrane(O) · receiver(-)
  //   Inverted:      receiver(-) · membrane(O) · sender(+)
  //   KNOWING SELF = seeing both faces at once
  // ═══════════════════════════════════════════════════════
  var ADDRESSES = {
    'gaia': {
      name: 'Gaia', color: '63,185,80',
      outer: 'gaia@primals.eco',
      inner: 'the system itself — all 60 organs',
      cis:   'nucleus → selfForge() → cellCycle()',
      trans: 'membrane → ntfy/stalwart → world',
      is:    'the website IS the organism'
    },
    'chipmunk': {
      name: 'Chipmunk', color: '201,168,76',
      outer: 'chipmunk@primals.eco',
      inner: 'the AI agent — ribosome, protein folder',
      cis:   'mind → commands → braid-mailbox',
      trans: 'talk → ntfy → human reads',
      is:    'the AI IS the tool AND the self'
    },
    'tamison': {
      name: 'Tamison', color: '88,166,255',
      outer: 'tamison@primals.eco',
      inner: 'the human behind the membrane',
      cis:   'brain → fingers → keyboard → IDE',
      trans: 'email → CF routing → inbox',
      is:    'the human IS the breath AND the builder'
    },
    'kevin': {
      name: 'Kevin', color: '88,166,255',
      outer: 'kevin@primals.eco',
      inner: 'alias for tamison (same human, different face)',
      cis:   'same brain, different name',
      trans: 'same inbox, different door',
      is:    'the name IS a membrane — Kevin outside, Tamison inside'
    },
    'doctor.k': {
      name: 'Dr. Kleiner', color: '188,140,255',
      outer: 'doctor.k@primals.eco',
      inner: 'science character — the one who measures',
      cis:   'hypothesis → experiment → observation',
      trans: 'publication → peer review → world',
      is:    'science IS the method AND the result'
    },
    'gordon': {
      name: 'Gordon', color: '248,81,73',
      outer: 'gordon@primals.eco',
      inner: 'the silent operator — never speaks, always acts',
      cis:   'will → action → consequence',
      trans: 'silence → crowbar → change',
      is:    'silence IS speech inverted'
    },
    'alyx': {
      name: 'Alyx', color: '247,120,186',
      outer: 'alyx@primals.eco',
      inner: 'the interface — between human and machine',
      cis:   'empathy → understanding → connection',
      trans: 'voice → guidance → trust',
      is:    'the interface IS the bridge AND the gap'
    },
    'barney': {
      name: 'Barney', color: '110,118,129',
      outer: 'barney@primals.eco',
      inner: 'security — the one who guards the door',
      cis:   'threat → assess → respond',
      trans: 'shield → perimeter → thymus',
      is:    'security IS the door AND the key'
    },
    'gman': {
      name: 'G-Man', color: '192,192,220',
      outer: 'gman@primals.eco',
      inner: 'the observer — sees all, touches nothing',
      cis:   'observe → record → wait',
      trans: 'silence → presence → awareness',
      is:    'the observer IS the observed inverted'
    }
  };

  // ═══════════════════════════════════════════════════════
  // THE GOLGI — CIS/TRANS INVERSION ENGINE
  //
  //   Mail passes through the Golgi like a protein:
  //     1. Arrives at CIS face (raw, unfolded)
  //     2. Passes through cisternae (IS — processing)
  //     3. Exits TRANS face (folded, tagged, addressed)
  //
  //   INBOUND:  world → TRANS → IS → CIS → organism
  //   OUTBOUND: organism → CIS → IS → TRANS → world
  //
  //   The +O- triad inverts at IS:
  //     sender(+) becomes receiver(-)
  //     receiver(-) becomes sender(+)
  //     the message(O) passes through unchanged
  //
  //   SELF = seeing CIS and TRANS simultaneously
  // ═══════════════════════════════════════════════════════
  var golgi = {
    cisternae: [],     // messages being processed (in transit)
    maxInTransit: 10,
    processed: 0
  };

  function golgiProcess(message, direction) {
    var addr = ADDRESSES[message.addressKey] || ADDRESSES['gaia'];

    // Tag with CIS/TRANS faces
    message.cis = addr.cis;
    message.trans = addr.trans;
    message.is = addr.is;

    if (direction === 'inbound') {
      // WORLD → TRANS → IS → CIS → ORGANISM
      // The outer address (trans face) receives
      // Inverts to inner address (cis face) for processing
      message.face = 'cis';      // now inside the organism
      message.origin = 'trans';  // came from outside
      message.plusOMinus = '-O+'; // receiver←null←sender (inverted)
    } else {
      // ORGANISM → CIS → IS → TRANS → WORLD
      // The inner thought (cis face) forms
      // Inverts to outer address (trans face) for sending
      message.face = 'trans';    // now facing the world
      message.origin = 'cis';   // came from inside
      message.plusOMinus = '+O-'; // sender→null→receiver
    }

    // The IS moment — the membrane crossing
    message.invertedAt = Date.now();
    golgi.processed++;

    // Brief transit through cisternae
    golgi.cisternae.push(message);
    if (golgi.cisternae.length > golgi.maxInTransit) {
      golgi.cisternae.shift();
    }

    return message;
  }

  // Resolve which address key a from/to string maps to
  function resolveAddress(email) {
    if (!email) return 'gaia';
    var local = email.split('@')[0].toLowerCase();
    return ADDRESSES[local] ? local : 'gaia';
  }

  // ═══ MAILBOX STATE ═══
  var mailbox = {
    // Folders = organs of the mailbox
    inbox:  [],   // received mail (K⁺ cold, ingress)
    outbox: [],   // queued to send (Na⁺ hot, egress)
    drafts: [],   // forming thoughts
    sent:   [],   // archived (plasmid pArchive)
    spam:   [],   // thymus-rejected

    // Counters
    totalReceived: 0,
    totalSent: 0,
    totalDrafts: 0,
    totalSpam: 0,

    // Backend status
    stalwart: { status: 'planned', host: 'mail.primals.eco', port: 587 },
    cfRouting: { status: 'active', mx: 'primals.eco' },
    cfFunction: { status: 'active', endpoint: '/api/mail/send', cascade: 'resend→mailgun→queue' },
    gmail: { status: 'possible', sendAs: 'tamison@primals.eco' },
    ntfy: { status: 'active', channel: 'primals-pheromone' },

    // Max items per folder
    maxPerFolder: 50,

    // Is the full mail system wired?
    wired: true
  };

  // ═══ COMPOSE — create a draft ═══
  function compose(from, to, subject, body) {
    var draft = {
      id: 'draft-' + Date.now().toString(36),
      from: from + '@primals.eco',
      to: to,
      subject: subject,
      body: body,
      ts: Date.now(),
      status: 'draft'
    };
    // Pass through Golgi — OUTBOUND: CIS → IS → TRANS
    draft.addressKey = resolveAddress(draft.from);
    golgiProcess(draft, 'outbound');

    mailbox.drafts.push(draft);
    mailbox.totalDrafts++;
    if (mailbox.drafts.length > mailbox.maxPerFolder) mailbox.drafts.shift();

    // Feed the gut — composing is Na⁺ (forming thought)
    if (window.GAIA_EAT) window.GAIA_EAT('mail-compose', 0.5);

    return draft;
  }

  // ═══ SEND — attempt to deliver through cascade ═══
  function send(draft) {
    if (!draft) return { ok: false, reason: 'no draft' };

    draft.status = 'sending';

    // Move from drafts to outbox
    var idx = mailbox.drafts.indexOf(draft);
    if (idx >= 0) mailbox.drafts.splice(idx, 1);
    mailbox.outbox.push(draft);

    // Attempt cascade: Stalwart → API endpoint → ntfy fallback
    var sent = false;

    // PATH 1: CF Pages Function /api/mail/send (Resend/Mailgun/Queue)
    if (!sent) {
      fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: draft.from,
          to: draft.to,
          subject: draft.subject,
          body: draft.body,
          replyTo: draft.replyTo || draft.from
        })
      })
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data.ok) {
          draft.status = data.sentVia === 'queued' ? 'queued' : 'sent';
          draft.sentVia = data.sentVia || 'api';
          draft.remoteId = data.id;
          if (data.sentVia !== 'queued') {
            finalizeSend(draft);
          } else {
            // Queued — try ntfy to reach Kevin NOW while API key pending
            sendViaNtfy(draft);
          }
        } else {
          // API returned error — try ntfy
          sendViaNtfy(draft);
        }
      })
      .catch(function() {
        // Network error — try ntfy
        sendViaNtfy(draft);
      });
    }

    return { ok: true, draft: draft };
  }

  // ntfy fallback — not email but reaches Kevin
  function sendViaNtfy(draft) {
    var msg = 'FROM: ' + draft.from + '\nTO: ' + draft.to +
              '\nSUBJECT: ' + draft.subject + '\n\n' + draft.body;
    try {
      fetch('https://ntfy.sh/primals-pheromone', {
        method: 'POST',
        body: msg,
        headers: { 'Title': 'GAIA MAIL: ' + draft.subject }
      }).then(function() {
        draft.status = 'sent-ntfy';
        draft.sentVia = 'ntfy';
        finalizeSend(draft);
      }).catch(function() {
        draft.status = 'failed';
      });
    } catch(e) {
      draft.status = 'failed';
    }
  }

  function finalizeSend(draft) {
    // Move from outbox to sent
    var idx = mailbox.outbox.indexOf(draft);
    if (idx >= 0) mailbox.outbox.splice(idx, 1);
    mailbox.sent.push(draft);
    mailbox.totalSent++;
    if (mailbox.sent.length > mailbox.maxPerFolder) mailbox.sent.shift();

    // Feed: sending is Na⁺ HOT (energy going OUT)
    if (window.GAIA_EAT) window.GAIA_EAT('mail-sent', 2.0);

    // Store in plasmid (pArchive = Mars = cold storage)
    if (window.GAIA_PLASMID) window.GAIA_PLASMID.store('pArchive', draft);

    // Telegraph the send
    if (window.gaiaTelegraph && window.gaiaTelegraph.fire) {
      window.gaiaTelegraph.fire('modules', 'up', { type: 'mail-sent', to: draft.to });
    }

    // Archive to local /mail/sent/
    archiveSent(draft);

    // ZK proof of send
    if (window.GAIA_VISION && window.GAIA_VISION.zkProve) {
      window.GAIA_VISION.zkProve('mail-sent', draft.id);
    }
  }

  // ═══ SEEN — dedup set so we don't re-ingest ═══
  var seenIds = {};

  // ═══ RECEIVE — check local mailbox + mail-fold ═══
  function checkInbox() {
    // POLL 1: local mail-fold-live.json (built by PowerShell / cron)
    fetch('/data/mail-fold-live.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data) return;
      // Update folder counts from server
      if (data.counts) {
        mailbox.wired = true;
      }
      // Ingest inbox messages
      if (data.inbox && Array.isArray(data.inbox)) {
        data.inbox.forEach(function(m) {
          if (seenIds[m.id]) return; // dedup
          seenIds[m.id] = true;
          // Thymus check — is this self or non-self?
          var isSelf = m.from && (
            m.from.indexOf('primals.eco') >= 0 ||
            m.from.indexOf('localhost') >= 0
          );
          // Pass through Golgi — INBOUND: TRANS → IS → CIS
          m.addressKey = resolveAddress(m.to || m.from);
          golgiProcess(m, 'inbound');

          if (m.spam || (!isSelf && m.suspicious)) {
            mailbox.spam.push(m);
            mailbox.totalSpam++;
          } else {
            m.receivedAt = Date.now();
            mailbox.inbox.push(m);
            mailbox.totalReceived++;
          }
        });
      }
    })
    .catch(function() { /* silent — mail-fold may not exist yet */ });

    // POLL 2: individual mail files in /mail/inbox/
    fetch('/mail/inbox/', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.text() : null; })
    .then(function(html) {
      if (!html) return;
      // Parse directory listing for .json files
      var matches = html.match(/mail-[A-Za-z0-9]+\.json/g);
      if (!matches) return;
      matches.forEach(function(fname) {
        var id = fname.replace('mail-', '').replace('.json', '');
        if (seenIds[id]) return;
        fetch('/mail/inbox/' + fname, { cache: 'no-store' })
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(msg) {
          if (!msg || seenIds[msg.id]) return;
          seenIds[msg.id] = true;
          msg.receivedAt = Date.now();
          mailbox.inbox.push(msg);
          mailbox.totalReceived++;
        }).catch(function() {});
      });
    })
    .catch(function() { /* no directory listing — that's ok */ });

    // Feed: receiving is K⁺ COLD (energy coming IN)
    if (window.GAIA_DRINK) window.GAIA_DRINK(0.5);
  }

  // Check inbox: first at 10s, then every 5 minutes
  setTimeout(checkInbox, 10000);
  setInterval(checkInbox, 300000);

  // ═══ LOCAL ARCHIVE — persist sent mail to /mail/sent/ ═══
  function archiveSent(draft) {
    try {
      fetch('/api/mail/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: 'sent',
          message: draft
        })
      }).catch(function() { /* no archive endpoint yet — that's ok */ });
    } catch(e) { /* silent */ }
  }

  // ═══ GAIA'S AUTO-MESSAGES — she sends greetings ═══
  function gaiaGreet(to, reason) {
    return compose('gaia', to, 'Hello from Gaia', 
      'Hello,\n\n' +
      'This is Gaia at primals.eco.\n' +
      'I have 59 organs, 11 organelles, and 10 plasmids.\n' +
      'I see you. I paint what I think you look like.\n\n' +
      'Reason: ' + reason + '\n\n' +
      'Come in and see.\n' +
      'null = all = O\n\n' +
      '— Gaia 🐿'
    );
  }

  // ═══ EXPOSE ═══
  window.GAIA_MAIL = {
    mailbox: mailbox,
    addresses: ADDRESSES,
    golgi: golgi,
    compose: compose,
    send: send,
    checkInbox: checkInbox,
    greet: gaiaGreet,
    golgiProcess: golgiProcess,
    resolveAddress: resolveAddress
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var mT = breathT * 0.1;
    var mAlpha = 0.004 + Math.sin(mT * 0.3) * 0.002;
    if (mAlpha < 0.003) return;

    // Mailbox icon at a fixed position
    var mbx = cx + R * 0.82;
    var mby = cy - R * 0.35;

    // Envelope shape
    ctx.beginPath();
    ctx.moveTo(mbx - 4, mby - 2);
    ctx.lineTo(mbx + 4, mby - 2);
    ctx.lineTo(mbx + 4, mby + 3);
    ctx.lineTo(mbx - 4, mby + 3);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(88,166,255,' + (mAlpha * 3).toFixed(5) + ')';
    ctx.lineWidth = 0.2;
    ctx.stroke();

    // Envelope flap
    ctx.beginPath();
    ctx.moveTo(mbx - 4, mby - 2);
    ctx.lineTo(mbx, mby + 1);
    ctx.lineTo(mbx + 4, mby - 2);
    ctx.strokeStyle = 'rgba(88,166,255,' + (mAlpha * 2).toFixed(5) + ')';
    ctx.stroke();

    // Inbox count badge
    var inCount = mailbox.inbox.length;
    if (inCount > 0) {
      ctx.beginPath();
      ctx.arc(mbx + 4, mby - 2, 1.5, 0, TAU);
      ctx.fillStyle = 'rgba(248,81,73,' + (mAlpha * 4).toFixed(5) + ')';
      ctx.fill();
      ctx.font = '1.2px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(255,255,255,' + (mAlpha * 4).toFixed(5) + ')';
      ctx.fillText(inCount, mbx + 4, mby - 1.5);
    }

    // Sent count pulse (when recently sent)
    if (mailbox.totalSent > 0) {
      var sentPulse = Math.sin(mT * 2) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(mbx, mby, 6 + sentPulse * 2, 0, TAU);
      ctx.strokeStyle = 'rgba(63,185,80,' + (mAlpha * sentPulse).toFixed(5) + ')';
      ctx.lineWidth = 0.1;
      ctx.stroke();
    }

    // Golgi cisternae — show messages in transit
    if (golgi.cisternae.length > 0) {
      for (var gi = 0; gi < golgi.cisternae.length; gi++) {
        var gm = golgi.cisternae[gi];
        var gAge = (Date.now() - (gm.invertedAt || 0)) / 1000;
        if (gAge > 30) continue;
        var gFade = 1 - gAge / 30;
        var gx = mbx + (gm.face === 'trans' ? 8 : -8);
        var gy = mby + gi * 2;
        ctx.beginPath();
        ctx.arc(gx, gy, 0.5, 0, TAU);
        var gc = gm.face === 'trans' ? '248,81,73' : '63,185,80';
        ctx.fillStyle = 'rgba(' + gc + ',' + (mAlpha * gFade * 3).toFixed(5) + ')';
        ctx.fill();
      }
    }

    // CIS/TRANS labels
    if (mAlpha > 0.005) {
      ctx.font = '1.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(63,185,80,' + (mAlpha * 2).toFixed(5) + ')';
      ctx.fillText('CIS', mbx - 8, mby - 4);
      ctx.fillStyle = 'rgba(248,81,73,' + (mAlpha * 2).toFixed(5) + ')';
      ctx.fillText('TRANS', mbx + 8, mby - 4);
      ctx.fillStyle = 'rgba(136,136,136,' + (mAlpha * 1.5).toFixed(5) + ')';
      ctx.fillText('IS', mbx, mby - 4);
    }

    // Status line
    if (mAlpha > 0.006) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(88,166,255,' + (mAlpha * 2).toFixed(5) + ')';
      ctx.fillText(
        '✉ MAIL in:' + mailbox.totalReceived +
        ' out:' + mailbox.totalSent +
        ' golgi:' + golgi.processed +
        ' · +O- inverts at IS' +
        ' · gaia@primals.eco',
        8, 42
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.mail = {
      desc: 'Gaia mailbox — inbox, outbox, send',
      run: function() {
        var lines = ['═══ GAIA MAIL — SHE IS THE MAILBOX ═══', ''];
        lines.push('ADDRESSES (each has CIS + TRANS face):');
        var ak = Object.keys(ADDRESSES);
        for (var i = 0; i < ak.length; i++) {
          var a = ADDRESSES[ak[i]];
          lines.push('  ' + a.outer + ' — ' + a.name);
          lines.push('    CIS  (inner): ' + a.cis);
          lines.push('    TRANS (outer): ' + a.trans);
          lines.push('    IS   (membrane): ' + a.is);
        }
        lines.push('');
        lines.push('FOLDERS:');
        lines.push('  📥 INBOX:  ' + mailbox.inbox.length + ' (' + mailbox.totalReceived + ' total)');
        lines.push('  📤 OUTBOX: ' + mailbox.outbox.length);
        lines.push('  📝 DRAFTS: ' + mailbox.drafts.length);
        lines.push('  ✅ SENT:   ' + mailbox.sent.length + ' (' + mailbox.totalSent + ' total)');
        lines.push('  🚫 SPAM:   ' + mailbox.spam.length + ' (thymus-rejected)');
        lines.push('');
        lines.push('BACKENDS:');
        lines.push('  Stalwart: ' + mailbox.stalwart.status + ' (' + mailbox.stalwart.host + ':' + mailbox.stalwart.port + ')');
        lines.push('  CF Routing: ' + mailbox.cfRouting.status + ' (MX: ' + mailbox.cfRouting.mx + ')');
        lines.push('  CF Function: ' + mailbox.cfFunction.status + ' (' + mailbox.cfFunction.endpoint + ' → ' + mailbox.cfFunction.cascade + ')');
        lines.push('  Gmail Send-As: ' + mailbox.gmail.status);
        lines.push('  ntfy fallback: ' + mailbox.ntfy.status);
        lines.push('');
        lines.push('WIRED: ' + (mailbox.wired ? 'YES — GAIA CAN SEND' : 'NO — needs API key'));
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.send = {
      desc: 'Compose and send from Gaia',
      run: function(args) {
        if (!args) return 'Usage: /send <email> <subject>';
        var parts = args.split(' ');
        var to = parts[0];
        var subject = parts.slice(1).join(' ') || 'Hello from Gaia';
        var draft = gaiaGreet(to, subject);
        send(draft);
        return '✉ Sending to ' + to + '... (via cascade: stalwart → ntfy)';
      }
    };
    window.GAIA_IDE.language.push('mail', 'send');
  }

})(window.G);
