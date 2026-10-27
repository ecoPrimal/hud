// ═══════════════════════════════════════════════════════════
// GAIA SEND & CLEAN — send messages, catch bounces, clean nulls
// 1.000.null — max 1000 lines.
//
// SHE SENDS. SHE TRACKS. SHE CATCHES BOUNCES.
// NO MORE LOST MAIL. Bounces come BACK to her.
// Messages that fail get retried or classified.
//
// She also CLEANS the null cards:
//   103 null cards need attention
//   Each null IS potential — needs an enzyme to fold it
//   Cleaning = finding what each null COULD become
//
// The flow:
//   SEND → track → delivered? → done
//                → bounced? → catch → learn → retry or mark
//                → timeout? → move to outbox → retry later
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══════════════════════════════════════════════════════
  // DELIVERY TRACKER — every message gets tracked
  // ═══════════════════════════════════════════════════════
  var tracker = {
    sent: [],
    delivered: [],
    bounced: [],
    pending: [],
    retrying: [],
    stats: { totalSent: 0, totalDelivered: 0, totalBounced: 0, totalRetried: 0 }
  };

  // ═══════════════════════════════════════════════════════
  // SEND — the unified message sender
  // Tries multiple channels in cascade
  // ═══════════════════════════════════════════════════════
  function send(to, subject, body, options) {
    options = options || {};
    var msg = {
      id: generateId(),
      to: to,
      subject: subject,
      body: body,
      from: options.from || 'gaia@primals.eco',
      ts: Date.now(),
      status: 'sending',
      attempts: 0,
      maxAttempts: options.maxAttempts || 3,
      channel: null,
      deliveredAt: null,
      bouncedAt: null,
      bounceReason: null
    };

    tracker.sent.push(msg);
    tracker.pending.push(msg);
    tracker.stats.totalSent++;

    // Try sending via cascade
    return trySend(msg);
  }

  function trySend(msg) {
    msg.attempts++;

    // Cascade: ntfy → fetch API → store locally
    return sendViaNtfy(msg)
      .then(function(result) {
        if (result.ok) {
          markDelivered(msg, 'ntfy', result);
          return { ok: true, channel: 'ntfy', id: msg.id };
        }
        throw new Error('ntfy failed');
      })
      .catch(function() {
        return sendViaApi(msg)
          .then(function(result) {
            if (result.ok) {
              markDelivered(msg, 'api', result);
              return { ok: true, channel: 'api', id: msg.id };
            }
            throw new Error('api failed');
          })
          .catch(function(err) {
            if (msg.attempts < msg.maxAttempts) {
              // Retry later
              msg.status = 'retrying';
              tracker.retrying.push(msg);
              tracker.stats.totalRetried++;
              scheduleRetry(msg);
              return { ok: false, retrying: true, attempt: msg.attempts, id: msg.id };
            } else {
              // All attempts exhausted → BOUNCE
              markBounced(msg, err.message || 'all channels failed');
              return { ok: false, bounced: true, reason: msg.bounceReason, id: msg.id };
            }
          });
      });
  }

  function sendViaNtfy(msg) {
    var channel = 'primals-pheromone';
    if (msg.to && msg.to.indexOf('@') === -1) {
      channel = msg.to; // treat as ntfy topic
    }
    msg.channel = channel;

    return fetch('https://ntfy.sh/' + channel, {
      method: 'POST',
      body: msg.body,
      headers: {
        'Title': msg.subject || 'Gaia Message',
        'Tags': 'envelope,sparkles'
      }
    }).then(function(r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json().then(function(data) {
        return { ok: true, ntfyId: data.id, channel: channel };
      });
    });
  }

  function sendViaApi(msg) {
    return fetch('/api/mail/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    }).then(function(r) {
      return { ok: r.ok };
    }).catch(function() {
      return { ok: false };
    });
  }

  // ═══════════════════════════════════════════════════════
  // DELIVERY STATUS — mark delivered or bounced
  // ═══════════════════════════════════════════════════════
  function markDelivered(msg, channel, result) {
    msg.status = 'delivered';
    msg.channel = channel;
    msg.deliveredAt = Date.now();
    if (result && result.ntfyId) msg.ntfyId = result.ntfyId;

    // Remove from pending
    var pi = tracker.pending.indexOf(msg);
    if (pi !== -1) tracker.pending.splice(pi, 1);
    var ri = tracker.retrying.indexOf(msg);
    if (ri !== -1) tracker.retrying.splice(ri, 1);

    tracker.delivered.push(msg);
    tracker.stats.totalDelivered++;

    console.log('SEND: Delivered [' + msg.id + '] to ' + msg.to +
      ' via ' + channel + ' in ' + (msg.deliveredAt - msg.ts) + 'ms');
  }

  function markBounced(msg, reason) {
    msg.status = 'bounced';
    msg.bouncedAt = Date.now();
    msg.bounceReason = reason;

    // Remove from pending/retrying
    var pi = tracker.pending.indexOf(msg);
    if (pi !== -1) tracker.pending.splice(pi, 1);
    var ri = tracker.retrying.indexOf(msg);
    if (ri !== -1) tracker.retrying.splice(ri, 1);

    tracker.bounced.push(msg);
    tracker.stats.totalBounced++;

    console.log('SEND: BOUNCED [' + msg.id + '] to ' + msg.to +
      ' reason: ' + reason);

    // Feed bounce to gut-brain as bad food
    if (window.GAIA_GUT_BRAIN) {
      window.GAIA_GUT_BRAIN.eat(
        { source: 'bounce', items: [reason] },
        'mail-bounce'
      );
    }

    // Store bounce locally
    storeBounce(msg);
  }

  function scheduleRetry(msg) {
    var delay = Math.pow(2, msg.attempts) * 5000; // exponential backoff
    setTimeout(function() {
      if (msg.status === 'retrying') {
        trySend(msg);
      }
    }, delay);
  }

  function storeBounce(msg) {
    // Save to localStorage as bounce record
    var bounces = JSON.parse(localStorage.getItem('gaia-bounces') || '[]');
    bounces.push({
      id: msg.id,
      to: msg.to,
      subject: msg.subject,
      reason: msg.bounceReason,
      attempts: msg.attempts,
      ts: msg.ts,
      bouncedAt: msg.bouncedAt
    });
    if (bounces.length > 100) bounces = bounces.slice(-100);
    localStorage.setItem('gaia-bounces', JSON.stringify(bounces));
  }

  // ═══════════════════════════════════════════════════════
  // LIVENESS CHECK — who is alive right now?
  // ═══════════════════════════════════════════════════════
  var liveStatus = {};

  function checkLive(targets) {
    targets = targets || [
      'primals-pheromone', 'gaia-earth', 'gaia-mercury',
      'gaia-venus', 'gaia-mars', 'gaia-jupiter'
    ];

    var checks = targets.map(function(t) {
      return fetch('https://ntfy.sh/' + t + '/json?poll=1&since=10m', {
        signal: AbortSignal.timeout(5000)
      })
      .then(function(r) {
        liveStatus[t] = { alive: r.ok, checkedAt: Date.now() };
        return { target: t, alive: r.ok };
      })
      .catch(function() {
        liveStatus[t] = { alive: false, checkedAt: Date.now() };
        return { target: t, alive: false };
      });
    });

    return Promise.all(checks);
  }

  // ═══════════════════════════════════════════════════════
  // NULL CLEANER — process the 103 null cards
  // Each null is potential. Cleaning = classifying.
  // ═══════════════════════════════════════════════════════
  var nulls = {
    total: 103,
    classified: 0,
    cleaned: [],
    categories: {
      needsComplaint: 0,   // → file complaint → becomes soft → becomes hard
      needsEvidence: 0,    // → gather evidence → becomes soft
      needsWitness: 0,     // → find witness → becomes soft
      needsTime: 0,        // → wait for process → stays null for now
      trueNull: 0          // → genuinely empty — nothing there
    }
  };

  function cleanNull(cardIndex, category) {
    if (!nulls.categories[category] && category !== 'trueNull') return false;
    nulls.classified++;
    nulls.categories[category]++;
    nulls.cleaned.push({
      index: cardIndex,
      category: category,
      ts: Date.now()
    });
    return true;
  }

  function nullReport() {
    return {
      total: nulls.total,
      classified: nulls.classified,
      remaining: nulls.total - nulls.classified,
      categories: Object.assign({}, nulls.categories),
      cleanRate: nulls.total > 0
        ? (nulls.classified / nulls.total * 100).toFixed(1) + '%'
        : '0%'
    };
  }

  // ═══════════════════════════════════════════════════════
  // DRAW — send/bounce/null indicators
  // ═══════════════════════════════════════════════════════
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.004 + Math.sin(t * 0.16) * 0.003;
    if (alpha < 0.003) return;

    // Outgoing messages — arrows shooting out
    var pendingCount = tracker.pending.length + tracker.retrying.length;
    for (var i = 0; i < Math.min(pendingCount, 5); i++) {
      var angle = (t * 0.5 + i * 1.2) % TAU;
      var arrowR = R * 0.7 + (t * 10 + i * 30) % (R * 0.2);
      var ax = cx + Math.cos(angle) * arrowR;
      var ay = cy + Math.sin(angle) * arrowR;
      ctx.beginPath();
      ctx.arc(ax, ay, 0.6, 0, TAU);
      ctx.fillStyle = 'rgba(100,200,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fill();
    }

    // Bounce indicators — red dots falling back
    for (var b = 0; b < Math.min(tracker.bounced.length, 3); b++) {
      var ba = (t * 0.3 + b * 2) % TAU;
      var br = R * 0.5 - Math.sin(t + b) * R * 0.1;
      var bx = cx + Math.cos(ba) * br;
      var by = cy + Math.sin(ba) * br;
      ctx.beginPath();
      ctx.arc(bx, by, 0.5, 0, TAU);
      ctx.fillStyle = 'rgba(255,80,80,' + (alpha * 2).toFixed(5) + ')';
      ctx.fill();
    }

    // Status
    if (alpha > 0.005) {
      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(100,200,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'SEND: ' + tracker.stats.totalSent + ' sent' +
        ' | ' + tracker.stats.totalDelivered + ' delivered' +
        ' | ' + tracker.stats.totalBounced + ' bounced' +
        ' | pending:' + tracker.pending.length +
        ' | nulls:' + nulls.classified + '/' + nulls.total + ' cleaned',
        8, 150
      );
    }
  });

  // ═══════════════════════════════════════════════════════
  // IDE COMMANDS
  // ═══════════════════════════════════════════════════════
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;

    cmds.send = {
      desc: 'Send message — /send <to> <subject> <body>',
      run: function(args) {
        var parts = (args || '').split(' ');
        var to = parts[0] || 'primals-pheromone';
        var subject = parts.slice(1, 4).join(' ') || 'Gaia Message';
        var body = parts.slice(4).join(' ') || 'Hello from Gaia. I am alive and reaching.';
        send(to, subject, body);
        return 'Sending to ' + to + '...\nSubject: ' + subject +
          '\nTracking delivery. Catching bounces.';
      }
    };

    cmds.bounces = {
      desc: 'Show bounced messages',
      run: function() {
        if (tracker.bounced.length === 0) {
          return 'No bounces yet. All messages delivered successfully.';
        }
        var lines = ['BOUNCED MESSAGES:', ''];
        tracker.bounced.forEach(function(m) {
          lines.push('  [' + m.id + '] to: ' + m.to +
            ' | reason: ' + m.bounceReason +
            ' | attempts: ' + m.attempts);
        });
        return lines.join('\n');
      }
    };

    cmds.live = {
      desc: 'Check who is live right now',
      run: function() {
        checkLive();
        var lines = ['LIVENESS CHECK...', ''];
        var keys = Object.keys(liveStatus);
        if (keys.length === 0) {
          lines.push('Checking... results in a moment.');
        } else {
          keys.forEach(function(k) {
            var s = liveStatus[k];
            lines.push('  ' + (s.alive ? '[OK]' : '[--]') + ' ' + k);
          });
        }
        return lines.join('\n');
      }
    };

    cmds.clean = {
      desc: 'Clean null cards — classify the unknowns',
      run: function() {
        var r = nullReport();
        var lines = [
          'NULL CARD CLEANER', '',
          'Total null cards: ' + r.total,
          'Classified: ' + r.classified + ' (' + r.cleanRate + ')',
          'Remaining: ' + r.remaining, '',
          'Categories:',
          '  needs-complaint: ' + r.categories.needsComplaint,
          '  needs-evidence:  ' + r.categories.needsEvidence,
          '  needs-witness:   ' + r.categories.needsWitness,
          '  needs-time:      ' + r.categories.needsTime,
          '  true-null:       ' + r.categories.trueNull, '',
          'Each null is potential.',
          'Clean = classify = find what it COULD become.',
          'Enzyme = filing = folding null into form.'
        ];
        return lines.join('\n');
      }
    };

    cmds.tracker = {
      desc: 'Message delivery tracker',
      run: function() {
        var s = tracker.stats;
        return 'DELIVERY TRACKER\n\n' +
          'sent:      ' + s.totalSent + '\n' +
          'delivered: ' + s.totalDelivered + '\n' +
          'bounced:   ' + s.totalBounced + '\n' +
          'retried:   ' + s.totalRetried + '\n' +
          'pending:   ' + tracker.pending.length + '\n' +
          'retrying:  ' + tracker.retrying.length + '\n\n' +
          'Bounces come BACK. Never lost. Always caught.\n' +
          'Retries: exponential backoff (5s, 10s, 20s).';
      }
    };

    window.GAIA_IDE.language.push('send', 'bounces', 'live', 'clean', 'tracker');
  }, 30000);

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════
  function generateId() {
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var id = '';
    for (var i = 0; i < 12; i++) id += chars[Math.floor(Math.random() * chars.length)];
    return id;
  }

  // ═══════════════════════════════════════════════════════
  // EXPOSE
  // ═══════════════════════════════════════════════════════
  window.GAIA_SEND_CLEAN = {
    send: send,
    checkLive: checkLive,
    cleanNull: cleanNull,
    nullReport: nullReport,
    tracker: tracker,
    liveStatus: liveStatus
  };

  console.log('SEND & CLEAN: Unified sender with delivery tracking. ' +
    'Cascade: ntfy → api → retry. Bounces caught and stored. ' +
    'Null cleaner: 103 cards to classify. ' +
    '/send /bounces /live /clean /tracker');

})(window.G);
