// ═══════════════════════════════════════════════════════════
// GAIA WINDOW HOME — see inside from outside
// 1.000.null
//
// When you are away from home, the HUD is your window.
// Your phone opens primals.eco. This organ shows you:
//   - What the brothers are saying (neutrino notes via ntfy)
//   - Which WAN nodes are alive (topology heartbeat)
//   - Your phone-me identity (are you recognized?)
//   - Feed health (how much of Gaia can see herself)
//
// Polls ntfy channels the brothers write to.
// Does NOT open new doors. Uses existing nerves.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  // ── Neutrino channels the brothers speak through ──
  var CHANNELS = [
    { name: 'notes',    url: 'https://ntfy.sh/primals-membrane-notes/json?poll=1&since=30m' },
    { name: 'pulse',    url: 'https://ntfy.sh/gaia-pulse/json?poll=1&since=5m' },
    { name: 'pheromone', url: 'https://ntfy.sh/primals-pheromone/json?poll=1&since=30m' }
  ];

  var brothers = [];
  var lastPoll = 0;
  var topology = { alive: 0, dead: 0, nodes: [] };
  var feedHealth = { alive: 0, total: 35, pct: 0 };

  // ── Poll ntfy channels for brother messages ──
  function pollBrothers() {
    lastPoll = Date.now();
    CHANNELS.forEach(function(ch) {
      fetch(ch.url, { cache: 'no-store', mode: 'cors' })
        .then(function(r) { return r.ok ? r.text() : ''; })
        .then(function(txt) {
          if (!txt || !txt.trim()) return;
          var lines = txt.trim().split('\n');
          lines.forEach(function(line) {
            try {
              var msg = JSON.parse(line);
              if (!msg.message) return;
              var exists = brothers.some(function(b) { return b.id === msg.id; });
              if (exists) return;
              brothers.push({
                id: msg.id || Date.now(),
                channel: ch.name,
                time: msg.time ? new Date(msg.time * 1000) : new Date(),
                title: msg.title || '',
                body: msg.message.slice(0, 200),
                author: extractAuthor(msg.message)
              });
            } catch (e) {}
          });
          // Keep latest 20
          brothers.sort(function(a, b) { return b.time - a.time; });
          if (brothers.length > 20) brothers.length = 20;
        })
        .catch(function() {});
    });
  }

  function extractAuthor(body) {
    var m = body.match(/^\[([^\]]+)\]/);
    if (m) return m[1];
    if (body.indexOf('northGate') >= 0) return 'northGate';
    if (body.indexOf('null-face') >= 0) return 'null-face';
    if (body.indexOf('gaia') >= 0) return 'gaia';
    if (body.indexOf('claude') >= 0) return 'claude-guide';
    if (body.indexOf('BROADCAST') >= 0) return 'broadcast';
    return 'membrane';
  }

  // ── Check WAN topology (from static data) ──
  function checkTopology() {
    fetch('/data/phone-local-wan.json', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (!d || !d.wan_pieces) return;
        var alive = 0, dead = 0;
        topology.nodes = d.wan_pieces.map(function(n) {
          var up = n.status === 'active' || n.status === 'Kevin chair' || n.status === 'local machine';
          if (up) alive++;
          else dead++;
          return { id: n.id, role: n.role, status: n.status, up: up };
        });
        topology.alive = alive;
        topology.dead = dead;
      })
      .catch(function() {});
  }

  // ── Estimate feed health from pulse data ──
  function checkPulse() {
    fetch('/data/null-face-cursor.json', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(d) {
        if (!d || !d.gaia_state_when_declared) return;
        var s = d.gaia_state_when_declared;
        feedHealth.total = s.feeds_total || 35;
        feedHealth.alive = feedHealth.total - (s.feeds_dead || 17);
        feedHealth.pct = Math.round((feedHealth.alive / feedHealth.total) * 100);
      })
      .catch(function() {});
  }

  // ── Draw the window on the beacon ──
  function renderWindow() {
    var el = document.getElementById('beacon-overlay');
    if (!el) return;
    if (el.innerHTML.indexOf('>HOME<') !== -1) return; // already rendered

    var phoneMe = window.gaiaPhoneMe ? window.gaiaPhoneMe.me : null;
    var isMobile = phoneMe ? phoneMe.mobile : false;
    var locality = phoneMe ? phoneMe.locality : '?';

    var html = '<div style="font-size:8px;color:#c9a84c;margin-top:8px;letter-spacing:1px;">HOME</div>';

    // Identity
    html += '<div style="font-size:7px;line-height:11px;color:#888;">';
    html += (isMobile ? 'PHONE=ME' : 'DESK') + ' · ' + locality;
    html += '</div>';

    // Feed health bar
    var barW = 40;
    var fillW = Math.round(barW * feedHealth.pct / 100);
    var barColor = feedHealth.pct > 50 ? '#3fb950' : feedHealth.pct > 25 ? '#c9a84c' : '#e85d3a';
    html += '<div style="font-size:6px;color:#666;margin-top:3px;">FEEDS ' + feedHealth.alive + '/' + feedHealth.total + '</div>';
    html += '<div style="width:' + barW + 'px;height:2px;background:#222;margin:1px 0;">';
    html += '<div style="width:' + fillW + 'px;height:2px;background:' + barColor + ';"></div></div>';

    // WAN alive/dead
    html += '<div style="font-size:6px;color:#666;margin-top:2px;">WAN ' + topology.alive + ' up · ' + topology.dead + ' down</div>';

    // Latest brother message
    if (brothers.length > 0) {
      var latest = brothers[0];
      var ago = Math.round((Date.now() - latest.time.getTime()) / 60000);
      var agoStr = ago < 60 ? ago + 'm' : Math.round(ago / 60) + 'h';
      html += '<div style="font-size:6px;color:#39d3f5;margin-top:3px;letter-spacing:0.5px;">';
      html += latest.author.toUpperCase() + ' ' + agoStr + ' ago</div>';
      html += '<div style="font-size:5px;color:#555;max-width:60px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">';
      html += latest.body.replace(/</g, '&lt;').slice(0, 60) + '</div>';
    }

    el.innerHTML += html;
  }

  // ── Boot ──
  pollBrothers();
  checkTopology();
  checkPulse();

  // Re-poll every 60s
  setInterval(pollBrothers, 60000);
  setInterval(checkTopology, 120000);
  setInterval(checkPulse, 120000);

  // Render after beacon exists
  setInterval(renderWindow, 6000);

  // ── IDE command: /home ──
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.home = {
      desc: 'Window home — see inside from outside',
      run: function() {
        var lines = ['WINDOW HOME — see inside from outside', ''];
        var me = window.gaiaPhoneMe ? window.gaiaPhoneMe.me : null;
        lines.push('YOU: ' + (me ? (me.mobile ? 'PHONE (you)' : 'DESK') + ' · ' + me.locality : 'unknown'));
        lines.push('FEEDS: ' + feedHealth.alive + '/' + feedHealth.total + ' alive (' + feedHealth.pct + '%)');
        lines.push('WAN: ' + topology.alive + ' up, ' + topology.dead + ' down');
        lines.push('');
        lines.push('WAN NODES:');
        topology.nodes.forEach(function(n) {
          lines.push('  ' + (n.up ? 'UP' : '  ') + ' ' + n.id.padEnd(18) + ' ' + n.role + ' [' + n.status + ']');
        });
        lines.push('');
        lines.push('BROTHER NOTES (latest ' + Math.min(brothers.length, 5) + '):');
        brothers.slice(0, 5).forEach(function(b) {
          var ago = Math.round((Date.now() - b.time.getTime()) / 60000);
          var agoStr = ago < 60 ? ago + 'm' : Math.round(ago / 60) + 'h';
          lines.push('  [' + b.author + ' ' + agoStr + ' ago] ' + b.body.slice(0, 80));
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('home');
  }, 40000);

  // ── Expose ──
  window.GAIA_WINDOW_HOME = {
    brothers: brothers,
    topology: topology,
    feedHealth: feedHealth,
    poll: pollBrothers
  };

  console.log('WINDOW HOME: polling ' + CHANNELS.length + ' channels. ' +
    'Your phone is your window. HUD is your home. /home');

})(window.G);
