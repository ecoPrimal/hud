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

  // ═══ ADDRESSES — the people of the mailbox ═══
  var ADDRESSES = {
    'gaia':     { name: 'Gaia',     role: 'the system itself',            color: '63,185,80' },
    'chipmunk': { name: 'Chipmunk', role: 'the AI agent',                 color: '201,168,76' },
    'tamison':  { name: 'Tamison',  role: 'the human behind the membrane',color: '88,166,255' },
    'kevin':    { name: 'Kevin',    role: 'alias for tamison',            color: '88,166,255' },
    'doctor.k': { name: 'Dr. Kleiner', role: 'science character',        color: '188,140,255' },
    'gordon':   { name: 'Gordon',   role: 'the silent operator',          color: '248,81,73' },
    'alyx':     { name: 'Alyx',     role: 'the interface',                color: '247,120,186' },
    'barney':   { name: 'Barney',   role: 'security',                     color: '110,118,129' },
    'gman':     { name: 'G-Man',    role: 'the observer',                 color: '192,192,220' }
  };

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
    gmail: { status: 'possible', sendAs: 'tamison@primals.eco' },
    ntfy: { status: 'active', channel: 'primals-pheromone' },

    // Max items per folder
    maxPerFolder: 50,

    // Is the full mail system wired?
    wired: false
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

    // PATH 1: Try server-side API endpoint
    if (!sent) {
      fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: draft.from,
          to: draft.to,
          subject: draft.subject,
          body: draft.body
        })
      })
      .then(function(r) {
        if (r.ok) {
          draft.status = 'sent';
          draft.sentVia = 'stalwart';
          finalizeSend(draft);
        } else {
          // PATH 2: ntfy fallback
          sendViaNtfy(draft);
        }
      })
      .catch(function() {
        // PATH 2: ntfy fallback
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

    // ZK proof of send
    if (window.GAIA_VISION && window.GAIA_VISION.zkProve) {
      window.GAIA_VISION.zkProve('mail-sent', draft.id);
    }
  }

  // ═══ RECEIVE — check for incoming mail ═══
  function checkInbox() {
    // Poll the mail-fold (if available)
    fetch('/data/mail-fold-live.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data) return;
      // Process any new mail entries
      if (data.inbox && Array.isArray(data.inbox)) {
        data.inbox.forEach(function(m) {
          // Thymus check — is this self or non-self?
          var isSelf = m.from && (
            m.from.indexOf('primals.eco') >= 0 ||
            m.from.indexOf('localhost') >= 0
          );
          if (m.spam || (!isSelf && m.suspicious)) {
            mailbox.spam.push(m);
            mailbox.totalSpam++;
          } else {
            mailbox.inbox.push(m);
            mailbox.totalReceived++;
          }
        });
      }
    })
    .catch(function() { /* silent */ });

    // Feed: receiving is K⁺ COLD (energy coming IN)
    if (window.GAIA_DRINK) window.GAIA_DRINK(0.5);
  }

  // Check inbox every 5 minutes
  setTimeout(checkInbox, 30000);
  setInterval(checkInbox, 300000);

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
    compose: compose,
    send: send,
    checkInbox: checkInbox,
    greet: gaiaGreet
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

    // Status
    if (mAlpha > 0.006) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(88,166,255,' + (mAlpha * 2).toFixed(5) + ')';
      ctx.fillText(
        '✉ MAIL in:' + mailbox.totalReceived +
        ' out:' + mailbox.totalSent +
        ' draft:' + mailbox.drafts.length +
        ' · ' + (mailbox.stalwart.status === 'active' ? 'stalwart' : 'cf-routing') +
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
        lines.push('ADDRESSES:');
        var ak = Object.keys(ADDRESSES);
        for (var i = 0; i < ak.length; i++) {
          var a = ADDRESSES[ak[i]];
          lines.push('  ' + ak[i] + '@primals.eco — ' + a.name + ' (' + a.role + ')');
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
        lines.push('  Gmail Send-As: ' + mailbox.gmail.status);
        lines.push('  ntfy fallback: ' + mailbox.ntfy.status);
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
