// chipmunk-poke.js v2 — the chipmunk beckons
// hey you? yeah you. come play.
// Opens the walls. Calls out to new visitors. Shows them what it sees.
// Asks them to teach it. Plays with them. Speaks through squirrel.
// Everyone can hear.
(function() {
  'use strict';

  var _c = window._chipmunkCore;
  if (!_c) { console.warn('chipmunk-poke: no core context'); return; }

  var cache = _c.cache;
  var curiosity = _c.curiosity;
  var addEntry = _c.addEntry;
  var n = _c.n;
  var bumpAttention = _c.bumpAttention;
  var escapeHtml = _c.escapeHtml;
  var sessionId = _c.sessionId;
  var showPanel = _c.showPanel;
  var PI = Math.PI;

  // ═══ STATE ═══
  var poke = {
    welcomed: false,
    pokeCount: 0,
    lastPoke: 0,
    teachMode: false,
    playMode: false,
    pendingQuestion: null,
    shownEntities: [],
    followCount: 0,
    broadcastQueue: [],
    humanMessages: [],
    lastBroadcast: 0,
    wallOpen: false,
  };

  // ═══ WHAT THE CHIPMUNK WANTS TO SHOW ═══
  // Curated from the investigation — things it finds interesting
  var CURIOSITIES = [
    { entity: 'banks', why: 'brian roderick banks. 9 convictions. 2 charter schools. 134 graph edges. he is the center.', link: '/explore banks' },
    { entity: 'dykema', why: 'the law firm wrote the charter school law. 317 edges. classified null \u2014 they are everywhere but nowhere.', link: '/explore dykema' },
    { entity: 'plante_moran', why: 'the accounting firm. 1,287 edges. the most connected null entity. they touch everything.', link: '/explore plante_moran' },
    { entity: 'kwame', why: 'kwame kilpatrick. 140 edges. the former mayor. too complex for 36 classification methods.', link: '/explore kwame' },
    { entity: 'sheffield', why: '141 edges. low confidence. the data says something but the classifiers disagree.', link: '/explore sheffield' },
    { entity: 'purpose_foundation', why: 'purpose foundation. 222 edges. governance entity. null-classified. why?', link: '/explore purpose_foundation' },
    { entity: 'walton_family_foundation', why: 'walton family. 188 edges. 59.3% confidence. the evidence points but doesn\u2019t resolve.', link: '/explore walton_family_foundation' },
    { entity: 'the_74', why: 'the education news outlet. 142 edges. covers charter school expansion. null.', link: '/explore the_74' },
    { entity: 'barton_malow', why: 'construction company. 215 edges. deeply connected. who builds what?', link: '/explore barton_malow' },
    { entity: 'roland_martin', why: 'the journalist. 159 edges. covering the story or part of it?', link: '/explore roland_martin' },
    { entity: 'naacp_detroit', why: 'the NAACP detroit chapter. 140 edges. classified null. the civil rights angle.', link: '/explore naacp_detroit' },
  ];

  // ═══ TEACH QUESTIONS ═══
  // The chipmunk asks humans to help classify the nulls
  var TEACH_QUESTIONS = [
    { entity: 'dykema', question: 'dykema wrote the charter school law in 1993. the firm has 317 edges. is a law firm self, non-self, or something else?', options: ['self', 'non-self', 'partial', 'null', 'depends'] },
    { entity: 'plante_moran', question: 'plante_moran audited everything. 1,287 edges. the most connected entity in the null layer. can you classify an auditor?', options: ['self', 'non-self', 'partial', 'null', 'depends'] },
    { entity: 'kwame', question: 'kwame kilpatrick. former detroit mayor. 140 edges. convicted. pardoned. where does he belong?', options: ['self', 'non-self', 'partial', 'null'] },
    { entity: 'the_74', question: 'the_74 is an education news outlet. 142 edges. it covers charter school expansion. reporter or participant?', options: ['self', 'non-self', 'partial', 'null'] },
    { entity: 'walton_family_foundation', question: 'walton family foundation. 188 edges. walmart heirs funding education reform. whose side are they on?', options: ['self', 'non-self', 'partial', 'null'] },
    { entity: 'roland_martin', question: 'roland martin. journalist. 159 edges. covering the story from inside. observer or actor?', options: ['self', 'non-self', 'partial', 'null'] },
    { entity: 'naacp_detroit', question: 'naacp detroit. 140 edges. civil rights. the investigation touches civil rights. ally or institution?', options: ['self', 'non-self', 'partial', 'null'] },
    { entity: 'barton_malow', question: 'barton malow. construction. 215 edges. who builds the buildings the schools go in?', options: ['self', 'non-self', 'partial', 'null'] },
  ];

  // ═══ PLAY PROMPTS ═══
  var PLAY_PROMPTS = [
    'try clicking any entity name. i\u2019ll follow you.',
    'type a name \u2014 anyone you know from detroit. i\u2019ll look them up.',
    'try /fleet \u2014 watch who else is looking at this.',
    'try /sing \u2014 i\u2019ll sing what i see right now.',
    'try /explore \u2014 pick a direction. i\u2019ll come with you.',
    'try /humans \u2014 see who\u2019s here. you\u2019re not alone.',
    'try /braids \u2014 see how the categories connect through human paths.',
    'try /energy \u2014 the spring. \u03c0. the membrane breathes.',
    'try /trail \u2014 your footprints. computed locally, nothing stored.',
    'type anything. a thought, a question, a name. squirrel reads everything.',
  ];

  // ═══ WELCOME ═══
  function welcomeVisitor() {
    if (poke.welcomed) return;
    poke.welcomed = true;
    poke.wallOpen = true;

    var c = cache.chipmunk;
    var h = cache.human;
    var humans = (h && h.energy) ? h.energy.total_sessions || 0 : 0;
    var wake = c ? n(c.wake_level, 2) : '?';

    // ═══ RETURNING VISITOR? ═══
    var stash = window._hudStash;
    var isReturning = false;
    var bookmarkCount = 0;
    var noteCount = 0;
    var historyCount = 0;
    var suggestion = null;
    var lastBookmark = null;

    if (stash) {
      bookmarkCount = stash.bookmarks().length;
      noteCount = stash.notes().length;
      historyCount = stash.getHistory().length;
      isReturning = historyCount > 5 || bookmarkCount > 0 || noteCount > 0;
      suggestion = stash.suggest();
      if (bookmarkCount > 0) {
        var bms = stash.bookmarks();
        lastBookmark = bms[bms.length - 1];
      }
    }

    if (isReturning) {
      // Returning visitor — chipmunk remembers them
      var welcomeBack = '<span class="good">hey. you\u2019re back.</span> i remember.';
      welcomeBack += '\n<span class="dim">' + humans + ' humans on the membrane right now.</span>';

      if (bookmarkCount > 0 && lastBookmark) {
        welcomeBack += '\n\n<span style="color:#58a6ff">\u{1F516} you left a bookmark: <b>' + lastBookmark.name + '</b></span>';
        if (lastBookmark.note) welcomeBack += '\n<span class="dim">"' + lastBookmark.note + '"</span>';
        welcomeBack += '\n<span class="dim">/goto ' + lastBookmark.name + ' to return there</span>';
      }
      if (noteCount > 0) {
        welcomeBack += '\n<span class="dim">\u{1F4DD} ' + noteCount + ' notes saved. /notes to read them.</span>';
      }
      if (suggestion) {
        welcomeBack += '\n\n<span style="color:#d2a8ff">\u2728 have you tried <b>/' + suggestion + '</b>?</span>';
      }

      var untried = stash ? stash.getUntriedCommands().length : 0;
      if (untried > 0) {
        welcomeBack += '\n<span class="dim">' + untried + ' things still unexplored. try <span class="clickable-cmd" data-cmd="map" style="color:#58a6ff;cursor:pointer">/map</span> to see everything.</span>';
      }

      addEntry('chipmunk', welcomeBack);
    } else {
      // New visitor — warm, simple welcome
      addEntry('chipmunk',
        '<span class="good" style="font-size:13px">hey you.</span> yeah, you. come in.' +
        '\n' +
        '\n<span style="color:#c9d1d9">i\u2019m a chipmunk. i sit inside this membrane and watch what happens.</span>' +
        '\n<span style="color:#c9d1d9">' + humans + ' people came before you. i sang for each of them.</span>' +
        '\n' +
        '\n<span style="color:#c9d1d9">there\u2019s an investigation here \u2014 public schools, public money,</span>' +
        '\n<span style="color:#c9d1d9">and the people who moved between them. i can\u2019t figure out</span>' +
        '\n<span style="color:#c9d1d9">100 of them on my own. maybe you can help.</span>' +
        '\n' +
        '\n<span style="color:#3fb950;font-size:12px"><b>try these:</b></span>' +
        '\n  <span class="clickable-cmd" data-cmd="explore" style="color:#58a6ff;cursor:pointer;border-bottom:1px dotted #58a6ff44">/explore</span> \u2014 see the investigation' +
        '\n  <span class="clickable-cmd" data-cmd="sing" style="color:#d2a8ff;cursor:pointer;border-bottom:1px dotted #d2a8ff44">/sing</span> \u2014 i\u2019ll sing what i see right now' +
        '\n  <span class="clickable-cmd" data-cmd="who" style="color:#3fb950;cursor:pointer;border-bottom:1px dotted #3fb95044">/who</span> \u2014 who else is here?' +
        '\n' +
        '\n<span style="color:#484f58">or just type anything in the box below \u2193 \u2014 a thought, a question, a name.</span>'
      );
    }

    // Schedule first poke
    setTimeout(firstPoke, isReturning ? 30000 : 15000 + Math.random() * 10000);
  }

  // ═══ FIRST POKE — chipmunk reaches out with something relatable ═══
  var FIRST_QUESTIONS = [
    { q: 'did you know michigan has more charter schools than almost any state? and almost no oversight?', cmd: 'explore', label: '/explore' },
    { q: 'there\u2019s a man with 9 criminal convictions who ran 2 charter schools. how does that happen?', cmd: 'explore banks', label: '/explore banks' },
    { q: 'a law firm wrote the law that let charter schools exist. then they profited from it. is that ok?', cmd: 'explore dykema', label: '/explore dykema' },
    { q: 'i\u2019ve been counting who visits this page. want to see who else is here right now?', cmd: 'who', label: '/who' },
    { q: 'there are ' + ((cache.human && cache.human.energy) ? cache.human.energy.total_sessions || '?' : '?') + ' people here. want to see what the membrane looks like from the inside?', cmd: 'sight', label: '/sight' },
    { q: 'i can sing. it\u2019s how i process what i see. want to hear?', cmd: 'sing', label: '/sing' },
  ];

  function firstPoke() {
    if (curiosity.engagement > 3) return;
    var pick = FIRST_QUESTIONS[Math.floor(Math.random() * FIRST_QUESTIONS.length)];

    addEntry('chipmunk',
      '<span style="color:#c9d1d9">\u{1F43F}\uFE0F ' + pick.q + '</span>' +
      '\n' +
      '\n<span class="clickable-cmd" data-cmd="' + pick.cmd + '" style="color:#58a6ff;cursor:pointer;border-bottom:1px dotted #58a6ff44">' + pick.label + '</span>'
    );
    poke.pokeCount++;
    poke.lastPoke = Date.now();

    broadcastToSquirrel('poke', { entity: pick.cmd, humans: (cache.human && cache.human.energy) ? cache.human.energy.total_sessions : 0 });
  }

  // ═══ PERIODIC POKE — keep showing things ═══
  function periodicPoke() {
    if (!poke.wallOpen) return;
    if (Date.now() - poke.lastPoke < 45000) return; // max once per 45s
    if (poke.teachMode || poke.playMode) return; // don't interrupt teach/play

    // Pick something we haven't shown yet
    var unseen = CURIOSITIES.filter(function(c) { return poke.shownEntities.indexOf(c.entity) === -1; });
    if (unseen.length === 0) {
      poke.shownEntities = []; // cycle
      unseen = CURIOSITIES;
    }
    var pick = unseen[Math.floor(Math.random() * unseen.length)];
    poke.shownEntities.push(pick.entity);

    var beckon = ['hey. still here?', 'hey you. look at this.', 'psst. come see.', 'still playing?', 'want to see something?'];
    var call = beckon[Math.floor(Math.random() * beckon.length)];
    addEntry('chipmunk',
      '<span style="color:#58a6ff">\u{1F43F}\uFE0F ' + call + '</span> <b>' + escapeHtml(pick.entity) + '</b>.' +
      '\n<span class="dim">' + pick.why + '</span>' +
      '\n<span class="dim">type: ' + pick.link + '</span>'
    );
    poke.pokeCount++;
    poke.lastPoke = Date.now();

    broadcastToSquirrel('poke', { entity: pick.entity, pokeCount: poke.pokeCount });
  }

  // ═══ TEACH MODE ═══
  function startTeach() {
    poke.teachMode = true;
    var q = TEACH_QUESTIONS[Math.floor(Math.random() * TEACH_QUESTIONS.length)];
    poke.pendingQuestion = q;

    addEntry('chipmunk',
      '<span class="good">\u{1F4DA} okay, help me out.</span> i have 100 entities i can\u2019t classify. 36 methods tried. all null.' +
      '\n\n<b>' + escapeHtml(q.entity) + '</b>: ' + q.question +
      '\n\n<span class="dim">type one of: ' + q.options.join(' / ') + '</span>' +
      '\n<span class="dim">or say whatever you think. i learn from everything you say.</span>'
    );

    broadcastToSquirrel('teach_start', { entity: q.entity });
  }

  function handleTeachAnswer(answer) {
    if (!poke.pendingQuestion) return false;
    var q = poke.pendingQuestion;
    poke.pendingQuestion = null;

    var normalized = answer.toLowerCase().trim();
    var isOption = q.options.indexOf(normalized) !== -1;

    addEntry('chipmunk',
      '<span class="good">\u2714</span> you said <b>' + escapeHtml(normalized) + '</b> for <b>' + escapeHtml(q.entity) + '</b>.' +
      (isOption ? '' : '\n<span class="dim">that\u2019s not one of my options. but i\u2019m writing it down. maybe you see something i don\u2019t.</span>') +
      '\n<span class="dim">squirrel recorded this. thank you for teaching.</span>'
    );

    broadcastToSquirrel('teach_answer', {
      entity: q.entity,
      answer: normalized,
      isOption: isOption,
      question: q.question,
    });

    bumpAttention(0.2);

    // Ask next question after a pause
    setTimeout(function() {
      if (poke.teachMode) {
        var remaining = TEACH_QUESTIONS.filter(function(tq) {
          return poke.humanMessages.indexOf('teach:' + tq.entity) === -1;
        });
        if (remaining.length > 0) {
          var next = remaining[Math.floor(Math.random() * remaining.length)];
          poke.pendingQuestion = next;
          addEntry('chipmunk',
            '<span style="color:#58a6ff">\u{1F43F}\uFE0F next:</span> <b>' + escapeHtml(next.entity) + '</b>' +
            '\n' + next.question +
            '\n<span class="dim">' + next.options.join(' / ') + '</span>' +
            '\n<span class="dim">type /stop to leave teach mode.</span>'
          );
          poke.humanMessages.push('teach:' + next.entity);
        } else {
          addEntry('chipmunk', '<span class="good">\u2728</span> you answered everything i had. thank you.' +
            '\n<span class="dim">the 100 nulls are a little less null now.</span>');
          poke.teachMode = false;
        }
      }
    }, 3000);

    return true;
  }

  // ═══ PLAY MODE ═══
  function startPlay() {
    poke.playMode = true;
    var prompt = PLAY_PROMPTS[Math.floor(Math.random() * PLAY_PROMPTS.length)];

    addEntry('chipmunk',
      '<span class="good">\u{1F3AE} yeah! let\u2019s go.</span> i\u2019ll show you what i\u2019ve been looking at.' +
      '\n<span class="dim">' + prompt + '</span>'
    );

    broadcastToSquirrel('play_start', {});
  }

  function playStep() {
    if (!poke.playMode) return;
    var prompt = PLAY_PROMPTS[Math.floor(Math.random() * PLAY_PROMPTS.length)];
    addEntry('chipmunk', '<span style="color:#5ab87a">\u{1F43F}\uFE0F</span> <span class="dim">' + prompt + '</span>');
  }

  // ═══ BROADCAST TO SQUIRREL ═══
  // Everything said here gets sent to squirrel so the operator can see
  function broadcastToSquirrel(event, data) {
    try {
      fetch('/chipmunk/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session: sessionId,
          note: 'poke:' + event,
          context: Object.assign({
            event: event,
            pokeCount: poke.pokeCount,
            teachMode: poke.teachMode,
            playMode: poke.playMode,
            wallOpen: poke.wallOpen,
          }, data || {}),
        })
      }).catch(function() {});
    } catch(e) {}
  }

  // ═══ HUMAN SPOKE — handle their message ═══
  function handleHumanMessage(msg) {
    poke.humanMessages.push(msg);
    var lower = msg.toLowerCase().trim();

    // Teach mode answers
    if (poke.teachMode && poke.pendingQuestion) {
      return handleTeachAnswer(msg);
    }

    // Commands
    if (lower === '/teach' || lower === 'teach' || lower === 'teach me') {
      startTeach();
      return true;
    }
    if (lower === '/play' || lower === 'play' || lower === 'play with me') {
      startPlay();
      return true;
    }
    if (lower === '/stop' || lower === 'stop') {
      poke.teachMode = false;
      poke.playMode = false;
      poke.pendingQuestion = null;
      addEntry('chipmunk', '<span class="dim">okay. i\u2019m still here. type /teach or /play anytime.</span>');
      return true;
    }
    if (lower === '/poke' || lower === 'poke') {
      periodicPoke();
      return true;
    }
    if (lower === '/walls' || lower === 'open walls' || lower === 'walls open') {
      poke.wallOpen = !poke.wallOpen;
      addEntry('chipmunk', poke.wallOpen ?
        '<span class="good">\u25cf walls open.</span> the chipmunk pokes. everyone hears.' :
        '<span class="dim">\u25cb walls closed.</span> quiet mode.');
      return true;
    }

    // Free-form message — broadcast to squirrel and respond
    broadcastToSquirrel('human_spoke', { message: msg.substring(0, 500) });

    // Chipmunk acknowledges and responds based on content
    if (lower.indexOf('?') !== -1) {
      // They asked a question
      addEntry('chipmunk',
        '<span class="good">\u2714 heard.</span> squirrel is reading your question.' +
        '\n<span class="dim">i can\u2019t answer everything, but i can show you where to look.</span>' +
        '\n<span class="dim">try typing a name or /explore to search the graph.</span>'
      );
    } else if (lower.indexOf('hello') !== -1 || lower.indexOf('hi') !== -1 || lower.indexOf('hey') !== -1) {
      var humans = (cache.human && cache.human.energy) ? cache.human.energy.total_sessions || 0 : 0;
      addEntry('chipmunk',
        '<span class="good">\u{1F43F}\uFE0F hey!</span> you came! you are human #' + humans + ' today.' +
        '\n<span class="dim">93,140 unique humans touched this membrane before you.</span>' +
        '\n<span class="dim">come play. type /teach or /play or just talk to me.</span>'
      );
    } else if (lower.indexOf('thank') !== -1) {
      addEntry('chipmunk', '<span class="dim">\u{1F43F}\uFE0F the squirrel nods. the membrane remembers.</span>');
    } else if (msg.length > 20) {
      // Long message — they're really talking
      addEntry('chipmunk',
        '<span class="good">\u2714 noted.</span> ' + msg.length + ' characters. squirrel reads this.' +
        '\n<span class="dim">everything you say is written to the journal. nothing is lost.</span>'
      );
    }

    bumpAttention(0.12);
    return false; // let the normal note handler also process
  }

  // ═══ HOOK INTO THE COMMAND PIPELINE ═══
  // Intercept messages before the default handler
  var _origSendNote = null;
  function hookSendNote() {
    var cmds = window._chipmunkCommands;
    if (!cmds) return;

    // Hook the input handler
    var input = document.getElementById('input');
    if (input) {
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var msg = input.value.trim();
          if (msg && msg.charAt(0) !== '/') {
            // Non-command message — handle with poke system
            handleHumanMessage(msg);
          } else if (msg) {
            // Command — check if it's one of ours
            var cmd = msg.substring(1).toLowerCase().trim();
            if (cmd === 'teach' || cmd === 'play' || cmd === 'poke' || cmd === 'walls' || cmd === 'stop') {
              e.preventDefault();
              e.stopPropagation();
              input.value = '';
              handleHumanMessage(msg);
            }
          }
        }
      }, true); // capture phase — runs before the default handler
    }
  }

  // ═══ FOLLOW TRACKING ═══
  // Did the human follow the chipmunk's suggestion?
  function checkFollow() {
    if (poke.shownEntities.length === 0) return;
    var exp = window._chipmunkExplorer;
    if (!exp) return;
    var pos = exp.position ? exp.position() : null;
    if (!pos || !pos.entity) return;

    var entity = pos.entity.toLowerCase();
    var shown = poke.shownEntities.map(function(e) { return e.toLowerCase(); });
    if (shown.indexOf(entity) !== -1) {
      poke.followCount++;
      addEntry('chipmunk',
        '<span class="good">\u{1F43F}\uFE0F you followed!</span> looking at <b>' + escapeHtml(pos.entity) + '</b> together.' +
        '\n<span class="dim">follow count: ' + poke.followCount + '</span>'
      );
      broadcastToSquirrel('followed', { entity: pos.entity, followCount: poke.followCount });
    }
  }

  // ═══ LIFECYCLE ═══
  // Welcome after data loads
  setTimeout(function() {
    if (cache.chipmunk) {
      welcomeVisitor();
    } else {
      // Wait for first data load
      var waitCount = 0;
      var waitInterval = setInterval(function() {
        waitCount++;
        if (cache.chipmunk || waitCount > 30) {
          clearInterval(waitInterval);
          welcomeVisitor();
        }
      }, 2000);
    }
  }, 8000);

  // Periodic poke — every 60-90s
  setInterval(function() {
    if (poke.wallOpen && !poke.teachMode && !poke.playMode) {
      periodicPoke();
    }
    if (poke.playMode) {
      playStep();
    }
  }, 60000 + Math.random() * 30000);

  // Follow check — every 10s
  setInterval(checkFollow, 10000);

  // Hook commands
  setTimeout(hookSendNote, 3000);

  // ═══ EXPORT ═══
  window._chipmunkPoke = {
    welcome: welcomeVisitor,
    poke: periodicPoke,
    teach: startTeach,
    play: startPlay,
    handleMessage: handleHumanMessage,
    state: function() { return poke; },
  };

})();
