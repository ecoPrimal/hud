/* mesh-nudge.js — chipmunk mesh awareness + attention nudge system
 *
 * Subscribes to mesh-ring.json and commensals.json via piBus.
 * Detects attention-worthy events and nudges the chipmunk to speak.
 * The chipmunk SHOULD be paying attention when:
 *   - A cloud node goes down or comes back
 *   - An edge is lost or gained
 *   - Mesh health drops below 1.0
 *   - Brute force spike (banned count jumps)
 *   - A new commensal appears or disappears
 *   - Humans change behavior (big shift in epitopes)
 *
 * Nudge types: ALERT (immediate), NOTICE (next proactive cycle), NOTE (quiet)
 */
(function () {
  'use strict';

  var state = {
    meshPrev: null,
    meshCurr: null,
    comPrev: null,
    comCurr: null,
    nudges: [],
    lastNudgeTime: 0,
    nudgeCooldownMs: 45000,
    initialized: false,
    meshAlive: false
  };

  var NUDGE_ICONS = {
    ALERT: '⚠',
    NOTICE: '◉',
    NOTE: '·'
  };

  function nudge(type, msg, detail) {
    var n = {
      type: type,
      msg: msg,
      detail: detail || '',
      ts: Date.now()
    };
    state.nudges.push(n);
    if (state.nudges.length > 50) state.nudges.shift();
    return n;
  }

  function diffMesh(prev, curr) {
    if (!prev || !curr) return;
    var nudges = [];

    // Health change
    if (prev.mesh_health !== curr.mesh_health) {
      if (curr.mesh_health < prev.mesh_health) {
        nudges.push(nudge('ALERT',
          'mesh health dropped: ' + Math.round(prev.mesh_health * 100) + '% → ' + Math.round(curr.mesh_health * 100) + '%',
          'a cloud node may be down'));
      } else if (curr.mesh_health > prev.mesh_health) {
        nudges.push(nudge('NOTICE',
          'mesh health recovered: ' + Math.round(curr.mesh_health * 100) + '%',
          'node came back'));
      }
    }

    // Node alive/dead transitions
    var prevNodes = {};
    (prev.nodes || []).forEach(function (n) { prevNodes[n.name] = n.alive; });
    (curr.nodes || []).forEach(function (n) {
      var wasAlive = prevNodes[n.name];
      if (wasAlive === true && !n.alive) {
        nudges.push(nudge('ALERT',
          n.name + ' went DOWN (' + n.cloud + ')',
          n.role + ' lost — mesh degraded'));
      } else if (wasAlive === false && n.alive) {
        nudges.push(nudge('NOTICE',
          n.name + ' came BACK (' + n.cloud + ')',
          n.role + ' restored'));
      }
    });

    // Edge transitions
    var prevEdges = {};
    (prev.edges || []).forEach(function (e) { prevEdges[e.from + '→' + e.to] = e; });
    (curr.edges || []).forEach(function (e) {
      var key = e.from + '→' + e.to;
      var pe = prevEdges[key];
      if (pe) {
        if (pe.alive && !e.alive) {
          nudges.push(nudge('ALERT',
            'edge lost: ' + e.from + ' → ' + e.to,
            'nerve fiber severed'));
        } else if (!pe.alive && e.alive) {
          nudges.push(nudge('NOTICE',
            'edge restored: ' + e.from + ' → ' + e.to,
            'nerve fiber reconnected'));
        }
        if (!pe.mutual && e.mutual) {
          nudges.push(nudge('NOTE',
            'edge ' + e.from + ' ↔ ' + e.to + ' is now mutual',
            'both sides see each other'));
        }
      }
    });

    // Banned IP spike
    var prevBanned = (prev.commensals || {}).currently_banned || 0;
    var currBanned = (curr.commensals || {}).currently_banned || 0;
    if (currBanned > prevBanned + 5) {
      nudges.push(nudge('NOTICE',
        'brute force spike: ' + prevBanned + ' → ' + currBanned + ' IPs banned',
        'immune system responding'));
    }

    return nudges;
  }

  function onMeshData(d) {
    state.meshPrev = state.meshCurr;
    state.meshCurr = d;
    state.meshAlive = true;

    if (!state.initialized) {
      state.initialized = true;
      return;
    }

    var newNudges = diffMesh(state.meshPrev, state.meshCurr);
    if (newNudges && newNudges.length > 0) {
      deliverNudges(newNudges);
    }
  }

  function onCommensalData(d) {
    state.comPrev = state.comCurr;
    state.comCurr = d;
  }

  function deliverNudges(nudges) {
    var now = Date.now();
    if (now - state.lastNudgeTime < state.nudgeCooldownMs) return;

    // Find the highest priority nudge
    var alerts = nudges.filter(function (n) { return n.type === 'ALERT'; });
    var notices = nudges.filter(function (n) { return n.type === 'NOTICE'; });

    var best = alerts[0] || notices[0] || nudges[0];
    if (!best) return;

    state.lastNudgeTime = now;

    // Speak through chipmunk if addEntry is available
    if (window.C && window.C.addEntry) {
      var icon = NUDGE_ICONS[best.type] || '·';
      var color = best.type === 'ALERT' ? '#ff4444' : best.type === 'NOTICE' ? '#ffaa00' : '#667';
      window.C.addEntry('chipmunk',
        '<span style="color:' + color + '">' + icon + ' ' + best.msg + '</span>' +
        (best.detail ? '\n<span class="dim">' + best.detail + '</span>' : ''));
    }
  }

  // Provide mesh summary for chipmunk to reference
  function meshSummary() {
    var d = state.meshCurr;
    if (!d) return null;

    var mutual = 0; var alive = 0;
    (d.edges || []).forEach(function (e) {
      if (e.alive) alive++;
      if (e.mutual) mutual++;
    });

    var comm = d.commensals || {};
    return {
      health: d.mesh_health,
      healthPct: Math.round((d.mesh_health || 0) * 100),
      aliveNodes: d.alive_cloud_nodes,
      totalNodes: d.total_cloud_nodes,
      aliveEdges: alive,
      mutualEdges: mutual,
      totalEdges: (d.edges || []).length,
      organisms: comm.total_organisms || 0,
      banned: comm.currently_banned || 0,
      totalBanned: comm.total_banned || 0,
      floating: (d.mesh_health || 0) >= 0.66,
      timestamp: d.timestamp,
      nodes: (d.nodes || []).map(function (n) {
        return { name: n.name, role: n.role, alive: n.alive, cloud: n.cloud, latency: n.latency_ms };
      })
    };
  }

  // Attention key: should the chipmunk be paying attention right now?
  function shouldPayAttention() {
    var d = state.meshCurr;
    if (!d) return { level: 0, reason: 'no mesh data' };

    var reasons = [];
    var level = 0;

    // Mesh degraded
    if (d.mesh_health < 1.0) {
      level = Math.max(level, 3);
      reasons.push('mesh health ' + Math.round(d.mesh_health * 100) + '%');
    }

    // Any node down
    (d.nodes || []).forEach(function (n) {
      if (!n.alive) {
        level = Math.max(level, 3);
        reasons.push(n.name + ' is down');
      }
    });

    // Brute force activity
    var banned = (d.commensals || {}).currently_banned || 0;
    if (banned > 20) {
      level = Math.max(level, 2);
      reasons.push(banned + ' IPs banned');
    } else if (banned > 5) {
      level = Math.max(level, 1);
      reasons.push(banned + ' IPs banned');
    }

    // Human activity spikes (check from human cache)
    var hud = window._piBus ? window._piBus.get('/human.json') : null;
    if (hud) {
      var sessions = (hud.energy || {}).total_sessions || 0;
      if (sessions > 80) {
        level = Math.max(level, 2);
        reasons.push(sessions + ' humans here');
      } else if (sessions > 40) {
        level = Math.max(level, 1);
        reasons.push(sessions + ' humans present');
      }
    }

    // Recent nudges
    var recentNudges = state.nudges.filter(function (n) {
      return Date.now() - n.ts < 120000;
    });
    if (recentNudges.length > 0) {
      level = Math.max(level, 1);
      reasons.push(recentNudges.length + ' recent event' + (recentNudges.length > 1 ? 's' : ''));
    }

    return {
      level: level,
      paying: level > 0,
      reasons: reasons,
      label: level >= 3 ? 'ALERT' : level >= 2 ? 'WATCHING' : level >= 1 ? 'AWARE' : 'RESTING'
    };
  }

  // Wire into piBus when ready
  function init() {
    if (window._piBus) {
      window._piBus.sub('/mesh-ring.json', onMeshData, 'medium');
      window._piBus.sub('/commensals.json', onCommensalData, 'slow');
    } else {
      setTimeout(init, 1000);
    }
  }

  init();

  window._meshNudge = {
    state: state,
    meshSummary: meshSummary,
    shouldPayAttention: shouldPayAttention,
    nudge: nudge,
    nudges: function () { return state.nudges; }
  };
})();
