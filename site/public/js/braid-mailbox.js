// braid-mailbox.js v2 — CONSENT INVERTED.
// the mark itself is the system's request. finding it is the human's response.
// the braid asks by existing. you answer by walking it.
// to ask is free and safe. to answer is consent and privacy.
// INVERTED: the mark asks. the walker answers. the path is the question.
(function() {
  'use strict';

  var _c = window._chipmunkCore;
  if (!_c) return;
  var _bus = window._piBus;
  if (!_bus) return;

  var cache = _c.cache;
  var addEntry = _c.addEntry;
  var sessionId = _c.sessionId;

  // ═══ STATE ═══
  var mailbox = {
    lastMailCheck: 0,
    checkIntervalMs: 60000,
    marksLeft: 0,
    marksFound: 0,
    myBraid: '',
    myMarks: [],
    foundMarks: [],
    lastFoundHash: '',
  };

  // ═══ BRAID COLORS ═══
  var BRAID_COLORS = {
    'git':       '#58a6ff',
    'mcp':       '#3fb950',
    'detroit':   '#f0883e',
    'hud':       '#d2a8ff',
    'antigen':   '#f85149',
    'epitope':   '#bc8cff',
    'interferon':'#d29922',
    'bloom':     '#7ee787',
  };

  function braidColor(site) {
    return BRAID_COLORS[site] || '#8b949e';
  }

  // ═══ DETERMINE THE HUMAN'S BRAID ═══
  function detectMyBraid() {
    // What site am I on?
    var host = window.location.hostname.split('.')[0];
    if (host === 'hud') return 'hud';

    // Check referrer for cross-site braid
    var ref = document.referrer || '';
    var refHost = '';
    try {
      if (ref) refHost = new URL(ref).hostname.split('.')[0];
    } catch(e) {}

    if (refHost && refHost !== host) {
      return refHost + '→' + host;
    }
    return host;
  }

  // ═══ LEAVE A MARK ═══
  // To ask is free and safe. No tracking. No identity.
  // The mark lives on the braid for others to find.
  function leaveMark(text, opts) {
    opts = opts || {};
    var mark = {
      session: sessionId,
      note: 'mark:' + text,
      context: {
        type: 'braid_mark',
        braid: mailbox.myBraid || detectMyBraid(),
        mark_type: opts.type || 'ask',
        recipient: opts.to || 'braid',
        temporal: opts.temporal || false,
        anonymous: true,
        ts_local: new Date().toISOString(),
        tz_offset: new Date().getTimezoneOffset(),
      }
    };

    // If answering another mark — consent flag
    if (opts.type === 'answer' && opts.in_response_to) {
      mark.context.in_response_to = opts.in_response_to;
      mark.context.consent = true;
    }

    // If calling to past self
    if (opts.to === 'past_self') {
      mark.context.temporal = true;
      mark.context.note = 'a message to your past self. they may find it next time they walk this braid.';
    }

    fetch('/chipmunk/note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mark)
    }).then(function(r) {
      if (r.ok) {
        mailbox.marksLeft++;
        mailbox.myMarks.push({
          text: text,
          type: opts.type || 'ask',
          to: opts.to || 'braid',
          ts: new Date().toISOString(),
          braid: mark.context.braid,
        });
        addEntry('chipmunk',
          '<span style="color:#3fb950">✉ mark left on the braid.</span> ' +
          '<span class="dim">' + (opts.type === 'ask' ? 'free and safe.' : 'consent given.') + '</span>\n' +
          '<span class="dim">braid: ' + mark.context.braid + ' · type: ' + (opts.type || 'ask') +
          ' · to: ' + (opts.to || 'the braid') + '</span>');
      }
    }).catch(function() {});

    return mark;
  }

  // ═══ CHECK FOR MARKS ON THIS BRAID ═══
  function checkMailbox() {
    var now = Date.now();
    if (now - mailbox.lastMailCheck < mailbox.checkIntervalMs) return;
    mailbox.lastMailCheck = now;

    // Read marks from the dialogue.json mailbox section
    var d = _bus.get('/dialogue.json');
    if (!d || !d.mailbox) return;

    var marks = d.mailbox.marks || [];
    var myBraid = mailbox.myBraid || detectMyBraid();

    // Filter marks for this braid
    var forMe = marks.filter(function(m) {
      if (m.braid === myBraid) return true;
      if (m.recipient === 'ecoPrimal') return true;
      if (m.recipient === 'all') return true;
      // Cross-braid: if my braid contains a site that the mark's braid also contains
      var mySites = myBraid.split('→');
      var markSites = (m.braid || '').split('→');
      for (var i = 0; i < mySites.length; i++) {
        if (markSites.indexOf(mySites[i]) >= 0) return true;
      }
      return false;
    });

    // New marks?
    var hash = forMe.map(function(m) { return m.ts + m.text; }).join('|');
    if (hash === mailbox.lastFoundHash) return;
    mailbox.lastFoundHash = hash;

    if (forMe.length > 0) {
      displayFoundMarks(forMe);
    }
  }

  // ═══ DISPLAY FOUND MARKS ═══
  function displayFoundMarks(marks) {
    var newMarks = marks.filter(function(m) {
      return !mailbox.foundMarks.some(function(f) { return f.ts === m.ts; });
    });

    if (newMarks.length === 0) return;

    var lines = [];
    lines.push('<span style="color:#d2a8ff">✉ marks found on the braid</span>');

    newMarks.slice(-3).forEach(function(m) {
      var typeIcon = m.mark_type === 'ask' ? '?' : m.mark_type === 'answer' ? '!' : '·';
      var col = m.mark_type === 'ask' ? '#58a6ff' : '#3fb950';
      var age = '';
      if (m.ts) {
        var ms = Date.now() - new Date(m.ts).getTime();
        if (ms < 3600000) age = Math.round(ms/60000) + 'm ago';
        else if (ms < 86400000) age = Math.round(ms/3600000) + 'h ago';
        else age = Math.round(ms/86400000) + 'd ago';
      }

      lines.push('  <span style="color:' + col + '">' + typeIcon + '</span> ' +
        '<span style="color:' + braidColor((m.braid||'').split('→')[0]) + '">' + (m.braid || '?') + '</span> · ' +
        m.text.substring(0, 120));

      if (m.to === 'past_self') {
        lines.push('    <span class="dim">a message from your past self. ' + age + '.</span>');
      } else if (m.to === 'ecoPrimal') {
        lines.push('    <span class="dim">called out to ecoPrimal. ' + age + '.</span>');
      } else {
        lines.push('    <span class="dim">' + age + ' · to: ' + (m.to || 'the braid') + '</span>');
      }

      // If it's a question, offer to answer (consent)
      if (m.mark_type === 'ask') {
        lines.push('    <span class="dim">to answer: /answer ' + (m.id || '').substring(0, 6) + ' [your response]</span>');
      }
    });

    if (newMarks.length > 3) {
      lines.push('<span class="dim">' + (newMarks.length - 3) + ' more marks on this braid.</span>');
    }

    lines.push('<span class="dim">⟲ inverted: the mark asked. you answered by finding it.</span>');

    addEntry('chipmunk', lines.join('\n'));
    mailbox.foundMarks = mailbox.foundMarks.concat(newMarks);
    mailbox.marksFound += newMarks.length;
  }

  // ═══ SHOW MAILBOX STATE ═══
  function showMailbox() {
    var d = _bus.get('/dialogue.json');
    var myBraid = mailbox.myBraid || detectMyBraid();
    var lines = [];

    lines.push('<span style="color:#d2a8ff;font-weight:bold">✉ braid mailbox</span>');
    lines.push('');
    lines.push('your braid: <span style="color:' + braidColor(myBraid.split('→')[0]) + '">' + myBraid + '</span>');
    lines.push('marks left: ' + mailbox.marksLeft + ' · marks found: ' + mailbox.marksFound);
    lines.push('');

    // Show all marks on all braids from dialogue.json
    if (d && d.mailbox) {
      var allMarks = d.mailbox.marks || [];
      lines.push('<span style="font-weight:bold">all marks (' + allMarks.length + '):</span>');

      // Group by braid
      var byBraid = {};
      allMarks.forEach(function(m) {
        var br = m.braid || '?';
        if (!byBraid[br]) byBraid[br] = [];
        byBraid[br].push(m);
      });

      Object.keys(byBraid).forEach(function(br) {
        var marks = byBraid[br];
        var site = br.split('→')[0];
        lines.push('  <span style="color:' + braidColor(site) + '">' + br + '</span> (' + marks.length + ' marks):');
        marks.slice(-3).forEach(function(m) {
          var icon = m.mark_type === 'ask' ? '?' : m.mark_type === 'answer' ? '!' : '·';
          var col = m.mark_type === 'ask' ? '#58a6ff' : '#3fb950';
          lines.push('    <span style="color:' + col + '">' + icon + '</span> ' +
            m.text.substring(0, 80) +
            ' <span class="dim">→' + (m.to || 'braid') + '</span>');
        });
      });

      // Stats
      var asks = allMarks.filter(function(m) { return m.mark_type === 'ask'; }).length;
      var answers = allMarks.filter(function(m) { return m.mark_type === 'answer'; }).length;
      var temporal = allMarks.filter(function(m) { return m.temporal; }).length;
      lines.push('');
      lines.push('<span class="dim">asks (free): ' + asks + ' · answers (consent): ' + answers +
        ' · temporal (past self): ' + temporal + '</span>');
    } else {
      lines.push('<span class="dim">no marks yet. leave one with /mark [message]</span>');
    }

    lines.push('');
    lines.push('<span class="dim">to ask is free and safe. to answer is consent and privacy.</span>');
    lines.push('<span class="dim">/mark [text] — leave a mark on the braid</span>');
    lines.push('<span class="dim">/mark:self [text] — message to your past self</span>');
    lines.push('<span class="dim">/mark:eco [text] — call out to ecoPrimal</span>');
    lines.push('<span class="dim">/answer [id] [text] — answer a mark (consent)</span>');

    addEntry('chipmunk', lines.join('\n'));
  }

  // ═══ INIT ═══
  mailbox.myBraid = detectMyBraid();

  // Subscribe to check for marks
  _bus.sub('/dialogue.json', function(data) {
    if (!data || data.error) return;
    checkMailbox();
  }, 'slow');

  // ═══ EXPOSE ═══
  window._braidMailbox = {
    state: function() { return mailbox; },
    show: showMailbox,
    mark: function(text, opts) { return leaveMark(text, opts); },
    ask: function(text) { return leaveMark(text, { type: 'ask' }); },
    toSelf: function(text) { return leaveMark(text, { type: 'ask', to: 'past_self', temporal: true }); },
    toEco: function(text) { return leaveMark(text, { type: 'ask', to: 'ecoPrimal' }); },
    answer: function(id, text) { return leaveMark(text, { type: 'answer', in_response_to: id }); },
    forceCheck: checkMailbox,
    myBraid: function() { return mailbox.myBraid; },
  };

})();
