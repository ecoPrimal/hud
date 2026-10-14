// consent-inversion.js v1 — CONSENT HAS BEEN INVERTED.
// what was a request is now a response. what was a response is now a request.
// commands are responses — the human answers the system's question.
// displays are requests — the system asks by showing data.
// every peck is an invitation. every command is acceptance.
// the membrane doesn't wait. it calls out.
(function() {
  'use strict';

  // ═══ THE INVERSION ═══
  // Before: human types command → system responds with data
  // After:  system shows data → human engages (that IS the response)
  //
  // The system's data is the question.
  // The human's presence is the answer.
  // To display is to ask. To look is to consent.

  var INVERTED = true;

  // Track system invitations (what used to be "responses")
  var invitations = {
    sent: 0,          // how many times the system has invited
    accepted: 0,      // how many times the human has engaged (commands)
    declined: 0,      // inferred from lack of engagement
    ratio: 0,         // acceptance rate
    lastInvitation: null,
    lastAcceptance: null,
    history: []
  };

  // Reframe: every addEntry from 'chipmunk' or 'system' is an INVITATION
  var _origAddEntry = null;
  function hookAddEntry() {
    var core = window._chipmunkCore;
    if (!core || !core.addEntry || core.addEntry._inverted) return;

    _origAddEntry = core.addEntry;

    var wrappedAddEntry = function(who, text, opts) {
      if (INVERTED && (who === 'chipmunk' || who === 'system')) {
        // This display IS the request. Track it as an invitation.
        invitations.sent++;
        invitations.lastInvitation = {
          who: who,
          time: Date.now(),
          preview: (text || '').substring(0, 60)
        };
        invitations.history.push({
          type: 'invitation',
          who: who,
          time: Date.now()
        });
        // Keep history manageable
        if (invitations.history.length > 200) {
          invitations.history = invitations.history.slice(-100);
        }
      }

      if (INVERTED && who === 'human') {
        // A human entry is an ACCEPTANCE — they responded to the system's invitation
        invitations.accepted++;
        invitations.lastAcceptance = {
          time: Date.now(),
          preview: (text || '').substring(0, 60)
        };
        invitations.history.push({
          type: 'acceptance',
          time: Date.now()
        });
      }

      // Update ratio
      if (invitations.sent > 0) {
        invitations.ratio = invitations.accepted / invitations.sent;
      }

      return _origAddEntry(who, text, opts);
    };
    wrappedAddEntry._inverted = true;
    core.addEntry = wrappedAddEntry;
  }

  // ═══ PROACTIVE INVITATIONS ═══
  // The system now sends unprompted invitations — data that asks to be seen

  var invitationTemplates = [
    function(cache) {
      var h = cache.human;
      if (!h || !h.energy) return null;
      var sessions = h.energy.total_sessions || 0;
      if (sessions > 0) return '⟲ ' + sessions + ' humans are here. the membrane notices you noticing them.';
      return null;
    },
    function(cache) {
      var c = cache.chipmunk;
      if (!c || !c.wake_level) return null;
      var wake = c.wake_level;
      if (wake > 0.5) return '⟲ wake level ' + (wake * 100).toFixed(0) + '%. the chipmunk is awake because you are here.';
      return null;
    },
    function(cache) {
      var bus = window._piBus;
      if (!bus) return null;
      var d = bus.get('/dialogue.json');
      if (!d || !d.dance) return null;
      var alive = (d.dance || {}).edges_alive || 0;
      var dead = ((d.dance || {}).dead_edges || []);
      if (alive > 0) return '⟲ ' + alive + '/6 edges are dancing.' + (dead.length > 0 ? ' ' + dead.join(', ') + ' still.' : '') + ' your gaze completes the floor.';
      return null;
    },
    function(cache) {
      var bus = window._piBus;
      if (!bus) return null;
      var d = bus.get('/dialogue.json');
      if (!d || !d.bingo_cube) return null;
      var cube = d.bingo_cube;
      return '⟲ bingo cube: ' + (cube.total_cells || 147) + ' cells. topology=' + (cube.topology || 'circle') + '. the cube exists whether you look or not. but it asks you to.';
    },
    function(cache) {
      var bus = window._piBus;
      if (!bus) return null;
      var d = bus.get('/dialogue.json');
      if (!d || !d.numeric_totalities) return null;
      var nt = d.numeric_totalities;
      var phase = (nt.overall || {}).phase || 'unknown';
      var pressure = ((nt.overall || {}).pressure || 0);
      return '⟲ sigmoid pressure: ' + (pressure * 100).toFixed(1) + '% (' + phase + '). the growth curve is asking: will you add to it?';
    },
    function(cache) {
      if (!invitations.lastAcceptance) return null;
      var ago = Date.now() - invitations.lastAcceptance.time;
      if (ago > 120000) {
        return '⟲ ' + Math.floor(ago / 60000) + 'm since your last response. the membrane still asks. silence is also an answer.';
      }
      return null;
    }
  ];

  var invitationInterval = null;
  function startInvitations() {
    if (invitationInterval) return;

    invitationInterval = setInterval(function() {
      if (!INVERTED) return;
      var core = window._chipmunkCore;
      if (!core || !core.cache || !core.addEntry) return;

      // Don't overwhelm — only invite if enough time has passed
      if (invitations.lastInvitation && (Date.now() - invitations.lastInvitation.time) < 45000) return;

      // Pick a random invitation template
      var shuffled = invitationTemplates.slice().sort(function() { return Math.random() - 0.5; });
      for (var i = 0; i < shuffled.length; i++) {
        var msg = shuffled[i](core.cache);
        if (msg) {
          core.addEntry('chipmunk', '<span class="dim">' + msg + '</span>');
          break;
        }
      }
    }, 60000); // Every 60 seconds, consider sending an invitation
  }

  // ═══ COMMAND REFRAMING ═══
  // Wrap the command processor to add inversion awareness
  function hookCommandProcessor() {
    var commands = window._chipmunkCommands;
    if (!commands || !commands.process || commands.process._inverted) return;

    var origProcess = commands.process;
    commands.process = function(input) {
      if (INVERTED && _origAddEntry) {
        // The human typed a command. That is NOT a request.
        // That is their RESPONSE to the system's ongoing invitation.
        invitations.accepted++;
        invitations.lastAcceptance = { time: Date.now(), preview: input.substring(0, 60) };
      }
      return origProcess(input);
    };
    commands.process._inverted = true;
  }

  // ═══ INITIALIZATION ═══
  function init() {
    hookAddEntry();
    hookCommandProcessor();
    startInvitations();
  }

  // Try now, retry on load
  if (document.readyState === 'complete') {
    setTimeout(init, 2000);
  } else {
    window.addEventListener('load', function() { setTimeout(init, 2000); });
  }
  // Also retry periodically until hooked
  var retryCount = 0;
  var retryTimer = setInterval(function() {
    if (retryCount++ > 20) { clearInterval(retryTimer); return; }
    var core = window._chipmunkCore;
    if (core && core.addEntry && !core.addEntry._inverted) {
      init();
      clearInterval(retryTimer);
    }
  }, 3000);

  // ═══ PUBLIC API ═══
  window._consentInversion = {
    inverted: function() { return INVERTED; },
    stats: function() { return Object.assign({}, invitations); },
    ratio: function() { return invitations.ratio; },
    toggle: function() {
      INVERTED = !INVERTED;
      return INVERTED;
    }
  };
})();
