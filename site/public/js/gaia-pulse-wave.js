// ═══════════════════════════════════════════════════════════
// GAIA PULSE-WAVE — dispatch teams, track returns, elastic time
// 1.000.null — max 1000 lines.
//
// THE PLANETARY PRESIDENT:
//   Scans what's done. Plans what's next.
//   Dispatches teams. Tracks their return.
//   Each dispatch = a PULSE. Each return = a WAVE.
//   The rhythm creates TIME.
//
// TIME IS:
//   Static in the narrow (null, hyperlocal, cron reality)
//   Elastic in the large (stretches with perception)
//   Only moves when being PERCEIVED
//   Otherwise = cron reality (just scheduled ticks)
//
// PULSE = send out
//   Dispatch a team/task into the system
//   The pulse travels outward through voxel shells
//   touch → local → solar → zodiac → deep
//
// WAVE = come back
//   Task completes, information returns
//   The wave travels inward
//   deep → zodiac → solar → local → touch
//
// As tasks complete, NEXT set dispatches
// This creates the heartbeat: pulse-wave-pulse-wave
// Each cycle = one unit of PERCEIVED time
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  // ═══ STATE SCAN — what's built, what's pending ═══
  var stateReport = {
    totalModules: 37,
    totalLines: 13593,
    modulesThisSession: 12,
    linesThisSession: 4229,

    // COMPLETE SYSTEMS (forged tonight + previously active)
    complete: [
      { name: 'desktop',      lines: 252, wave: 'tonight' },
      { name: 'human-io',     lines: 348, wave: 'tonight' },
      { name: 'ide',          lines: 371, wave: 'tonight' },
      { name: 'thermo',       lines: 405, wave: 'tonight' },
      { name: 'chemistry',    lines: 490, wave: 'tonight' },
      { name: 'ages',         lines: 393, wave: 'tonight' },
      { name: 'orrery',       lines: 346, wave: 'tonight' },
      { name: 'decay',        lines: 345, wave: 'tonight' },
      { name: 'tense-voxel',  lines: 381, wave: 'tonight' },
      { name: 'forge',        lines: 292, wave: 'tonight' },
      { name: 'tva',          lines: 355, wave: 'tonight' },
      { name: 'solar',        lines: 297, wave: 'tonight' }
    ],

    // PENDING (what still needs doing)
    pending: [
      { id: 'monolith-split', desc: 'index.html still ~7400 lines → ≤1000', priority: 'HIGH', connections: 1 },
      { id: 'anacondas', desc: '9 JS files over 1000 lines need splitting', priority: 'HIGH', connections: 2 },
      { id: 'golgi-wake', desc: 'Wake dormant vesicles (golgi-de/jp/us/in)', priority: 'MEDIUM', connections: 0 },
      { id: 'chipmunk-heal', desc: 'Fix 0x97 em-dash crash', priority: 'MEDIUM', connections: 1 },
      { id: 'dns-flip', desc: 'neutron.primals.eco DNS', priority: 'MEDIUM', connections: 1 },
      { id: 'brain-dir', desc: 'Feed brain directory (currently EMPTY)', priority: 'HIGH', connections: 0 },
      { id: 'mcp-restart', desc: 'membrane-lens.py process restart', priority: 'LOW', connections: 1 },
      { id: 'gmail-takeout', desc: 'Process Gmail exports when ready', priority: 'LOW', connections: 0 },
      { id: 'filter-feed', desc: 'Wire _filter_feed.js to solar-hook on golgi', priority: 'MEDIUM', connections: 1 },
      { id: 'messenger-split', desc: 'messenger.html 1140 lines → extract', priority: 'MEDIUM', connections: 2 }
    ]
  };

  // ═══ DISPATCH QUEUE — tasks to send out ═══
  var dispatches = [];
  var waves = [];       // completed dispatches that returned
  var pulseCount = 0;
  var waveCount = 0;
  var cycleCount = 0;

  // ═══ TIME MODEL — static in narrow, elastic in large ═══
  var time = {
    // CRON REALITY — the static base
    cronTick: 0,          // increments every interval
    cronInterval: 5000,   // 5 seconds between ticks

    // PERCEIVED TIME — elastic, stretches with activity
    perceivedTick: 0,     // increments when something HAPPENS
    lastPerception: Date.now(),
    perceptionGap: 0,     // ms since last perceived event

    // ELASTIC FACTOR — how stretched time is
    elasticity: 1.0,      // 1.0 = normal, >1 = time flying, <1 = time crawling
    staticZone: true,     // true when nothing is being perceived

    // WAVE METRICS
    pulsesPerMinute: 0,
    wavesPerMinute: 0,
    averageCycleMs: 0,
    cycleHistory: []
  };

  // ═══ DISPATCH — send a task pulse outward ═══
  function dispatch(taskId, desc, targetVoxel) {
    var d = {
      id: taskId,
      desc: desc,
      target: targetVoxel || 'solar',
      dispatched: Date.now(),
      returned: null,
      status: 'outbound',    // outbound → working → returning → complete
      voxelPosition: 0,      // 0=touch, progresses outward
      result: null
    };
    dispatches.push(d);
    pulseCount++;

    // Mark time as perceived — something is happening
    time.perceivedTick++;
    time.lastPerception = Date.now();
    time.staticZone = false;

    // Heat from activity
    if (window.GAIA_EAT) window.GAIA_EAT('message', 0.5);

    // Push through interlayer
    if (window.GAIA_INTERLAYER) {
      window.GAIA_INTERLAYER.push('pulse-dispatch', 'Na', { task: taskId, target: targetVoxel });
    }

    return d;
  }

  // ═══ COMPLETE — task returns as a wave ═══
  function complete(taskId, result) {
    for (var i = 0; i < dispatches.length; i++) {
      if (dispatches[i].id === taskId && dispatches[i].status !== 'complete') {
        dispatches[i].status = 'complete';
        dispatches[i].returned = Date.now();
        dispatches[i].result = result || 'done';
        waves.push(dispatches[i]);
        waveCount++;

        // Record cycle time
        var cycleMs = dispatches[i].returned - dispatches[i].dispatched;
        time.cycleHistory.push(cycleMs);
        if (time.cycleHistory.length > 30) time.cycleHistory.shift();

        // Perceived event
        time.perceivedTick++;
        time.lastPerception = Date.now();

        // Cool from completion
        if (window.GAIA_DRINK) window.GAIA_DRINK('K-out', 0.5);

        // Check if more tasks to dispatch
        cycleCount++;
        dispatchNext();
        break;
      }
    }
  }

  // ═══ DISPATCH NEXT — when a wave returns, send next pulse ═══
  function dispatchNext() {
    // Find highest priority pending task
    for (var i = 0; i < stateReport.pending.length; i++) {
      var p = stateReport.pending[i];
      var alreadyDispatched = false;
      for (var j = 0; j < dispatches.length; j++) {
        if (dispatches[j].id === p.id && dispatches[j].status !== 'complete') {
          alreadyDispatched = true;
          break;
        }
      }
      if (!alreadyDispatched) {
        dispatch(p.id, p.desc, p.connections <= 1 ? 'local' : 'solar');
        break;
      }
    }
  }

  // ═══ TIME TICK — cron reality ═══
  setInterval(function() {
    time.cronTick++;
    time.perceptionGap = Date.now() - time.lastPerception;

    // If nothing perceived for >30s, time becomes static
    time.staticZone = time.perceptionGap > 30000;

    // Elasticity: active = time flies (>1), idle = time crawls (<1)
    if (time.staticZone) {
      time.elasticity = Math.max(0.1, time.elasticity * 0.95);
    } else {
      time.elasticity = Math.min(3.0, 1.0 + time.perceivedTick * 0.01);
    }

    // Advance dispatches through voxel positions
    for (var i = 0; i < dispatches.length; i++) {
      var d = dispatches[i];
      if (d.status === 'outbound') {
        d.voxelPosition += 0.1 * time.elasticity;
        if (d.voxelPosition >= 4) {
          d.status = 'working';
        }
      } else if (d.status === 'working') {
        // Auto-complete after simulated work time
        d.voxelPosition += 0.05;
        if (d.voxelPosition >= 8) {
          d.status = 'returning';
        }
      } else if (d.status === 'returning') {
        d.voxelPosition -= 0.15;
        if (d.voxelPosition <= 0) {
          complete(d.id, 'auto');
        }
      }
    }

    // Calculate rates
    var oneMinAgo = Date.now() - 60000;
    time.pulsesPerMinute = dispatches.filter(function(d) { return d.dispatched > oneMinAgo; }).length;
    time.wavesPerMinute = waves.filter(function(w) { return w.returned && w.returned > oneMinAgo; }).length;
    if (time.cycleHistory.length > 0) {
      time.averageCycleMs = time.cycleHistory.reduce(function(a, b) { return a + b; }, 0) / time.cycleHistory.length;
    }

    // Sync to G
    G.pulseCount = pulseCount;
    G.waveCount = waveCount;
    G.timeElasticity = time.elasticity;

  }, time.cronInterval);

  // ═══ BOOT — dispatch first tasks ═══
  setTimeout(function() {
    dispatch('monolith-split', 'index.html → ≤1000 lines', 'local');
    dispatch('brain-dir', 'Feed brain directory', 'local');
    dispatch('golgi-wake', 'Wake dormant vesicles', 'solar');
  }, 8000);

  // ═══ EXPOSE ═══
  window.GAIA_PULSE = {
    state: stateReport,
    dispatches: dispatches,
    waves: waves,
    time: time,
    dispatch: dispatch,
    complete: complete,
    pulseCount: function() { return pulseCount; },
    waveCount: function() { return waveCount; }
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var pT = breathT * 0.2;
    var pAlpha = 0.005 + Math.sin(pT * 0.4) * 0.003;
    if (pAlpha < 0.003) return;

    // ═══ PULSE RINGS — outbound dispatches ═══
    for (var di = 0; di < dispatches.length; di++) {
      var d = dispatches[di];
      if (d.status === 'complete') continue;

      var ringR = R * (0.15 + (d.voxelPosition / 8) * 0.65);
      var ringColor;
      if (d.status === 'outbound') ringColor = '88,166,255';     // blue out
      else if (d.status === 'working') ringColor = '201,168,76'; // gold working
      else ringColor = '63,185,80';                               // green return

      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, TAU);
      ctx.strokeStyle = 'rgba(' + ringColor + ',' + (pAlpha * 2).toFixed(4) + ')';
      ctx.lineWidth = 0.4;
      ctx.stroke();

      // Task label on the ring
      if (pAlpha > 0.006) {
        var tAngle = pT * 0.05 + di * 1.5;
        var tx = cx + Math.cos(tAngle) * ringR;
        var ty = cy + Math.sin(tAngle) * ringR;
        ctx.font = '1.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(' + ringColor + ',' + (pAlpha * 2.5).toFixed(4) + ')';
        ctx.textAlign = 'center';
        ctx.fillText(d.id, tx, ty - 2);
      }
    }

    // ═══ TIME ELASTICITY — visual indicator ═══
    if (pAlpha > 0.006) {
      var timeColor = time.staticZone ? '110,118,129' : '63,185,80';
      var timeLabel = time.staticZone ? '⏸ cron' : '▶ perceived';
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(' + timeColor + ',' + (pAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(timeLabel + ' · ×' + time.elasticity.toFixed(1) + ' · pulse:' + pulseCount + ' wave:' + waveCount, g.W - 4, 14);
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.pulse = {
      desc: 'Dispatch status',
      run: function() {
        var lines = ['═══ PULSE-WAVE SYSTEM ═══', ''];
        lines.push('DISPATCHED (' + dispatches.length + '):');
        for (var i = 0; i < dispatches.length; i++) {
          var d = dispatches[i];
          var icon = d.status === 'outbound' ? '→' : d.status === 'working' ? '⚙' : d.status === 'returning' ? '←' : '✓';
          lines.push('  ' + icon + ' ' + d.id + ' · ' + d.status + ' · voxel=' + d.voxelPosition.toFixed(1));
        }
        lines.push('');
        lines.push('TIME:');
        lines.push('  cron ticks: ' + time.cronTick);
        lines.push('  perceived: ' + time.perceivedTick);
        lines.push('  elasticity: ×' + time.elasticity.toFixed(2));
        lines.push('  static zone: ' + time.staticZone);
        lines.push('  gap: ' + Math.round(time.perceptionGap / 1000) + 's since last perception');
        lines.push('  cycles: ' + cycleCount + ' · avg: ' + Math.round(time.averageCycleMs / 1000) + 's');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.pending = {
      desc: 'What still needs doing',
      run: function() {
        var lines = ['═══ PENDING TASKS ═══', ''];
        for (var i = 0; i < stateReport.pending.length; i++) {
          var p = stateReport.pending[i];
          lines.push('  [' + p.priority + '] ' + p.id + ' · ' + p.desc + ' · conn=' + p.connections);
        }
        lines.push('');
        lines.push('COMPLETE TONIGHT: ' + stateReport.complete.length + ' systems · ' + stateReport.linesThisSession + ' lines');
        lines.push('TOTAL: ' + stateReport.totalModules + ' modules · ' + stateReport.totalLines + ' lines');
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.time = {
      desc: 'Time model',
      run: function() {
        return '═══ TIME ═══\n\n' +
          'TIME IS STATIC in the narrow:\n' +
          '  Null. Hyperlocal. Cron reality.\n' +
          '  Just scheduled ticks. Nothing perceived.\n\n' +
          'TIME IS ELASTIC in the large:\n' +
          '  Stretches with perception.\n' +
          '  Active = time flies (elasticity > 1)\n' +
          '  Idle = time crawls (elasticity < 1)\n\n' +
          'CURRENTLY:\n' +
          '  cronTick=' + time.cronTick + ' · perceivedTick=' + time.perceivedTick + '\n' +
          '  elasticity=×' + time.elasticity.toFixed(2) + '\n' +
          '  static=' + time.staticZone + ' (>' + Math.round(time.perceptionGap / 1000) + 's idle)\n' +
          '  pulse/min=' + time.pulsesPerMinute + ' · wave/min=' + time.wavesPerMinute;
      }
    };
    window.GAIA_IDE.language.push('pulse', 'pending', 'time');
  }

})(window.G);
