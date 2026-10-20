/* hook-keys.js — call and response. people here are the evolution.
 *
 * ? is a hook to pull on.
 * @ # & ~ * ^ !  — keys used less, tags and so forth.
 * one says / asks / finds. another responds. or a human does.
 * if ignored or unhelpful: bump, then banana check, then bingo-maze wrap.
 * squirrel on its own view. chipmunk in the log. not paying attention.
 */
(function () {
  var PI = Math.PI;
  var HOOKS = {
    '?': { name: 'ask',    color: '#58a6ff', verb: 'pull' },
    '@': { name: 'who',    color: '#3fb950', verb: 'address' },
    '#': { name: 'tag',    color: '#d2a8ff', verb: 'tag' },
    '&': { name: 'braid',  color: '#f0883e', verb: 'join' },
    '~': { name: 'near',   color: '#8b949e', verb: 'nearby' },
    '*': { name: 'any',    color: '#f0e68c', verb: 'any' },
    '^': { name: 'up',     color: '#5ab87a', verb: 'up' },
    '!': { name: 'bump',   color: '#e85d3a', verb: 'bump' }
  };
  var open = [];
  var lastHere = -1;
  var bananaN = 0;

  function dormant() {
    try { return !!(window._floatOff && window._floatOff.status && window._floatOff.status().dormant); }
    catch (e) { return false; }
  }
  function humans() {
    var h = window._chipmunkCore && window._chipmunkCore.cache && window._chipmunkCore.cache.human;
    if (!h) return { n: 0, epitopes: {} };
    var n = window._piDigits ? window._piDigits.humans(h) : (h.human_ips || (h.energy && h.energy.total_sessions) || 0);
    return { n: n, epitopes: h.epitopes || {}, raw: h };
  }
  function tags() {
    var epi = humans().epitopes;
    return Object.keys(epi);
  }

  function parse(msg) {
    var s = (msg || '').trim();
    if (!s) return null;
    if (s.charAt(0) === '/') return null;
    var used = [];
    var i = 0;
    while (i < s.length && HOOKS[s.charAt(i)]) {
      used.push(s.charAt(i));
      i++;
      while (s.charAt(i) === ' ') i++;
    }
    if (!used.length) return null;
    return { hooks: used, body: s.slice(i).trim(), raw: s };
  }

  function saySq(msg) {
    if (window._hudViews) window._hudViews.say('squirrel', msg);
    else if (window._telephone) window._telephone.hop('system', 'hud', msg);
  }
  function sayMonk(msg) {
    if (window._hudViews) window._hudViews.say('chipmunk', msg);
    else {
      var add = window._chipmunkCore && window._chipmunkCore.addEntry;
      if (add) add('chipmunk', '<span class="dim">' + msg + '</span>');
    }
  }

  function call(parsed, from) {
    from = from || 'human';
    var c = {
      id: Date.now(),
      from: from,
      hooks: parsed.hooks,
      body: parsed.body,
      ts: Date.now(),
      answered: false,
      stage: 0
    };
    open.push(c);
    if (open.length > 12) open.shift();
    if (window._telephone) {
      window._telephone.hop(from === 'human' ? 'user' : 'chipmunk', 'hud', parsed.raw || parsed.body);
    }
    respond(c);
    return c;
  }

  function respond(c) {
    if (c.from === 'human') {
      open.forEach(function (o) { if (o.from === 'chipmunk') o.answered = true; });
    }
    var body = (c.body || '').toLowerCase();
    var h = humans();
    var primary = c.hooks[0];

    if (primary === '?' || body.indexOf('who') >= 0 || body.indexOf('here') >= 0 || !c.body) {
      var bits = [];
      Object.keys(h.epitopes).forEach(function (k) {
        var v = h.epitopes[k];
        bits.push(k + ' ' + (v.count || v));
      });
      saySq('? pulled. ' + h.n + ' here. ' + (bits.slice(0, 4).join(' · ') || 'the floor is quiet.'));
      sayMonk('i see ' + h.n + ' from inside. ? is the hook. @ names them. # tags. & joins.');
      c.answered = true;
      return;
    }
    if (primary === '@') {
      var who = body.split(/\s+/)[0] || 'here';
      var hit = h.epitopes[who] || h.epitopes[who.replace(/^@/, '')];
      saySq('@' + who + ' — ' + (hit ? ((hit.count || hit) + ' on the membrane') : 'not on this floor. ~ nearby?'));
      c.answered = true;
      return;
    }
    if (primary === '#') {
      var tag = body.split(/\s+/)[0] || 'membrane';
      saySq('#' + tag + ' tagged. the cube holds it.');
      if (window._telephone) window._telephone.hop('hud', 'bingo', '#' + tag);
      c.answered = true;
      return;
    }
    if (primary === '&') {
      saySq('& join. braid ' + (body || 'the ones already here') + '.');
      if (window._telephone) window._telephone.circuit(body || 'join', 'hud');
      c.answered = true;
      return;
    }
    if (primary === '!') {
      bump(c, 'asked');
      c.answered = true;
      return;
    }
    if (primary === '^') {
      sayMonk('^ up. chipmunk hears: ' + (body || 'the wire'));
      c.answered = true;
      return;
    }
    if (primary === '~' || primary === '*') {
      saySq((primary === '~' ? '~ nearby' : '* any') + ' — ' + (tags().join(' · ') || 'none tagged'));
      c.answered = true;
      return;
    }
    saySq(primary + ' ' + (body || 'hooked') + '. one asked. waiting on a response.');
  }

  function bump(c, why) {
    if (dormant()) return;
    if (window._chipmunkCore && window._chipmunkCore.bumpAttention) {
      window._chipmunkCore.bumpAttention(0.04);
    }
    if (window._telephone) window._telephone.hop('chipmunk', 'user', 'bump', { silent: true });
    saySq('bump. the hook is still hanging. ' + (why || 'unanswered') + '.');
  }

  function banana(c) {
    if (dormant()) return;
    bananaN++;
    saySq('banana check · K · still looking? the call did not land.');
    sayMonk('canary. if this is unhelpful i wrap it through the maze.');
  }

  function mazeWrap(c) {
    if (dormant()) return;
    var pool = tags();
    if (!pool.length) pool = ['membrane', 'immune', 'signal', 'topology'];
    var next = pool[(c.id + bananaN) % pool.length];
    c.body = next;
    c.hooks = ['#', '?'];
    c.stage = 3;
    c.answered = false;
    saySq('bingo maze wrap → #' + next + '. another cell. ? still pulls.');
    if (window._bingoCompress && window._bingoCompress.compress) {
      try { window._bingoCompress.compress(); } catch (e) {}
    }
    if (window._telephone) window._telephone.hop('bingo', 'hud', '#' + next + ' ?');
  }

  function tickIgnore() {
    var now = Date.now();
    open.forEach(function (c) {
      if (c.answered || c.from === 'human' && c.stage >= 3) return;
      // human calls that got a response are answered. chipmunk presence calls wait on human.
      if (c.from === 'human') return;
      var age = now - c.ts;
      if (c.stage === 0 && age > 10000) { c.stage = 1; bump(c, 'ignored'); }
      else if (c.stage === 1 && age > 20000) { c.stage = 2; banana(c); }
      else if (c.stage === 2 && age > 32000) { c.stage = 3; mazeWrap(c); }
    });
  }

  function presenceCall() {
    if (dormant()) return;
    var h = humans();
    if (h.n === lastHere) return;
    var prev = lastHere;
    lastHere = h.n;
    if (prev < 0) return;
    open.push({
      id: Date.now(), from: 'chipmunk', hooks: ['?', '@'], body: 'here',
      ts: Date.now(), answered: false, stage: 0
    });
    saySq(h.n + ' here. ? is a hook. pull it. or @ someone. or # a tag.');
    if (window._telephone) window._telephone.hop('chipmunk', 'hud', '? @here ' + h.n, { silent: true });
  }

  function onEnter(e) {
    if (e.key !== 'Enter') return;
    var input = document.getElementById('input');
    if (!input || document.activeElement !== input) return;
    var parsed = parse(input.value);
    if (!parsed) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    input.value = '';
    call(parsed, 'human');
  }

  function hookInput() {
    var input = document.getElementById('input');
    if (!input) return;
    input.addEventListener('keydown', onEnter, true);
    if (input.placeholder && input.placeholder.indexOf('hook') < 0) {
      input.placeholder = 'type ? to pull · @ # & tags · / for commands…';
    }
  }

  function init() {
    hookInput();
    setInterval(tickIgnore, 4000);
    setInterval(presenceCall, 12000);
    if (window._piBus) {
      window._piBus.sub('/human.json', function () { presenceCall(); }, 'medium');
    }
    setTimeout(presenceCall, 2500);
  }

  window._hooks = {
    parse: parse,
    call: call,
    keys: HOOKS,
    open: function () { return open.slice(); },
    hang: function () {
      var c = {
        id: Date.now(), from: 'chipmunk', hooks: ['?', '@'], body: 'here',
        ts: Date.now(), answered: false, stage: 0
      };
      open.push(c);
      return c;
    },
    tick: tickIgnore,
    status: function () {
      var hanging = open.filter(function (c) { return !c.answered; });
      return {
        keys: Object.keys(HOOKS).join(' '),
        open: hanging.length,
        here: humans().n,
        banana: bananaN,
        note: '? is a hook. @ # & tags. ignored → bump → banana → bingo maze.'
      };
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
