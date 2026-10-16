// human-epitope.js — human behavioral epitope tracker
// Computes human epitope classification from dashboard trajectory data.
// Humans are entities too. They carry energy in (attention) and out (knowledge).
// If they do work on this side, the output on their side has to happen.
(function(){
  'use strict';

  var HUD = 'https://hud.primals.eco';
  var isHud = window.location.hostname === 'hud.primals.eco';
  var base = isHud ? '' : HUD;

  // Human epitope classification from orbital patterns
  function classifyOrbits(orbits) {
    if (!orbits || !orbits.length) return [];

    return orbits.map(function(orb) {
      var hosts = (orb.hosts || []).map(function(h) {
        return h.replace('.primals.eco', '');
      });
      var breadth = orb.breadth || hosts.length;
      var visitors = orb.ips || 0;

      // Classify the orbit into an epitope type
      var epitope = 'visitor';
      var energy = 'low';

      // Honeycomb crawl (13+ hosts, all immune names) = bot, not human
      var immuneNames = ['antibody','antigen','bloom','complement','cytokine',
        'epitope','interferon','lysozyme','macrophage','opsonize','receptor','thymus'];
      var immuneCount = hosts.filter(function(h) {
        return immuneNames.indexOf(h) >= 0;
      }).length;
      if (immuneCount >= 6) {
        epitope = 'crawler';
        energy = 'waste';
      }
      // Explorer: 3+ real surfaces
      else if (breadth >= 3 && immuneCount < 3) {
        epitope = 'explorer';
        energy = 'high';
      }
      // Scholar: sporeprint + thesis or science paths
      else if (hosts.indexOf('sporeprint') >= 0 && hosts.indexOf('thesis') >= 0) {
        epitope = 'scholar';
        energy = 'high';
      }
      // Investigator: detroit or evidence
      else if (hosts.indexOf('detroit') >= 0 || hosts.indexOf('evidence') >= 0) {
        epitope = 'investigator';
        energy = 'medium';
      }
      // Reader: sporeprint (reading science)
      else if (hosts.indexOf('sporeprint') >= 0) {
        epitope = 'reader';
        energy = 'medium';
      }
      // Coder: git primary
      else if (hosts.indexOf('git') >= 0) {
        epitope = 'coder';
        energy = 'medium';
      }
      // Witness: lansing story
      else if (hosts.indexOf('lansing') >= 0) {
        epitope = 'witness';
        energy = 'medium';
      }
      // Observer: signal/hud
      else if (hosts.indexOf('signal') >= 0 || hosts.indexOf('hud') >= 0) {
        epitope = 'observer';
        energy = 'low';
      }

      return {
        path: hosts.join(' → '),
        visitors: visitors,
        breadth: breadth,
        epitope: epitope,
        energy: energy,
      };
    });
  }

  // Compute energy flow from dashboard data
  function computeEnergyFlow(dashboard) {
    var traj = dashboard.trajectory || {};
    var dwell = (dashboard.membrane_delta || {}).dwell || {};
    var humanIps = dashboard.human_ips || 0;
    var genuine = (dashboard.collision_level2 || {}).genuine || 0;
    var fleetReqs = dashboard.fleet_requests || dashboard.total_requests || 1;

    // Energy IN: attention the membrane receives from humans
    var multiHost = traj.multi_host_ips || 0;
    var avgBreadth = traj.avg_breadth || 1;
    var dwellMedian = dwell.median_min || 0;
    var multiSingle = dwell.multi_single_ratio || 1;

    // Energy IN score (0-1): normalized composite of human engagement
    var attentionIn = Math.min(1, humanIps / 5000);
    var depthIn = Math.min(1, dwellMedian / 60);
    var breadthIn = Math.min(1, (avgBreadth - 1) / 4);
    var energyIn = (attentionIn * 0.3 + depthIn * 0.4 + breadthIn * 0.3);

    // Energy OUT: what humans carry away (knowledge, understanding)
    // We can measure: multi/single ratio (returners), cross-surface visitors
    // If they visit multiple surfaces, they're building a model — that's output
    var explorationRate = multiHost / Math.max(humanIps, 1);
    var returnRate = multiSingle / 3; // normalized: 2.5 is typical
    var energyOut = Math.min(1, explorationRate * 0.5 + returnRate * 0.5);

    // Work: if humans do work (read, navigate, dwell), output must happen
    // Work = energyIn × time spent = attention × depth
    var work = energyIn * depthIn;

    // Signal-to-noise: human energy vs fleet energy
    var humanEnergy = humanIps * avgBreadth * (dwellMedian / 60);
    var fleetNoise = fleetReqs / 1000;
    var signalToNoise = humanEnergy / Math.max(fleetNoise, 1);

    return {
      energyIn: Math.round(energyIn * 100),
      energyOut: Math.round(energyOut * 100),
      work: Math.round(work * 100),
      signalToNoise: Math.round(signalToNoise * 100) / 100,
      humanAttention: humanIps,
      humanDepth: Math.round(dwellMedian),
      humanBreadth: Math.round(avgBreadth * 10) / 10,
      explorationRate: Math.round(explorationRate * 100),
    };
  }

  // Epitope colors
  var EPITOPE_COLORS = {
    explorer: '#3fb950',   // green — goes everywhere
    scholar: '#a371f7',    // purple — deep reading
    investigator: '#f0883e', // orange — focused on evidence
    reader: '#58a6ff',     // blue — consuming science
    coder: '#79c0ff',      // light blue — looking at code
    witness: '#d29922',    // gold — came for the story
    observer: '#8b949e',   // gray — watching
    visitor: '#6e7681',    // dim — passing through
    crawler: '#484f58',    // dark — bot noise
  };

  // Render human epitope panel into the HUD expanded section
  function renderHumanEpitopes(dashboard) {
    var orbitsEl = document.getElementById('hw-orbits');
    var detailEl = document.getElementById('hw-human-detail');
    if (!orbitsEl || !detailEl) return;

    var traj = dashboard.trajectory || {};
    var orbits = classifyOrbits(traj.top_orbits || []);
    var flow = computeEnergyFlow(dashboard);

    // Update detail panel with energy flow
    detailEl.innerHTML =
      '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center">' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#3fb950;font-weight:700">' + flow.humanAttention.toLocaleString() + '</div>' +
          '<div style="font-size:9px;color:#6e7681">VISITORS</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#58a6ff;font-weight:700">' + flow.energyIn + '%</div>' +
          '<div style="font-size:9px;color:#6e7681">ENERGY IN</div>' +
        '</div>' +
        '<div style="text-align:center;font-size:16px;color:#6e7681">⇄</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#a371f7;font-weight:700">' + flow.energyOut + '%</div>' +
          '<div style="font-size:9px;color:#6e7681">ENERGY OUT</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#d29922;font-weight:700">' + flow.work + '%</div>' +
          '<div style="font-size:9px;color:#6e7681">WORK</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:14px;color:#8b949e">' + flow.signalToNoise + '</div>' +
          '<div style="font-size:9px;color:#6e7681">S/N</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:14px;color:#8b949e">' + flow.humanBreadth + '</div>' +
          '<div style="font-size:9px;color:#6e7681">AVG SURFACES</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:14px;color:#8b949e">' + flow.explorationRate + '%</div>' +
          '<div style="font-size:9px;color:#6e7681">EXPLORE</div>' +
        '</div>' +
      '</div>';

    // Render orbit pills with epitope colors
    orbitsEl.innerHTML = '';
    var epitopeCounts = {};

    orbits.forEach(function(orb) {
      if (orb.epitope === 'crawler') return; // skip honeycomb bots

      var color = EPITOPE_COLORS[orb.epitope] || '#6e7681';
      epitopeCounts[orb.epitope] = (epitopeCounts[orb.epitope] || 0) + orb.visitors;

      var pill = document.createElement('span');
      pill.className = 'hw-org';
      pill.style.borderLeft = '3px solid ' + color;
      pill.innerHTML =
        '<span style="color:' + color + ';font-weight:600">' + orb.epitope + '</span>' +
        ' · <span style="color:#c9d1d9">' + orb.path + '</span>' +
        ' · <span style="color:#8b949e">' + orb.visitors + '</span>';
      orbitsEl.appendChild(pill);
    });

    // Summary pill: epitope distribution
    var summary = document.createElement('div');
    summary.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;';
    Object.keys(epitopeCounts).sort(function(a, b) {
      return epitopeCounts[b] - epitopeCounts[a];
    }).forEach(function(ep) {
      var color = EPITOPE_COLORS[ep] || '#6e7681';
      var tag = document.createElement('span');
      tag.style.cssText = 'font-size:10px;padding:2px 6px;border-radius:3px;background:' +
        color + '22;color:' + color + ';border:1px solid ' + color + '44;';
      tag.textContent = ep + ': ' + epitopeCounts[ep].toLocaleString();
      summary.appendChild(tag);
    });
    orbitsEl.appendChild(summary);
  }

  // Render from the live human.json feed (server-side epitope computation)
  function renderFromFeed(humanData) {
    var detailEl = document.getElementById('hw-human-detail');
    var orbitsEl = document.getElementById('hw-orbits');
    if (!detailEl || !orbitsEl) return;

    var e = humanData.energy || {};
    var ep = humanData.epitopes || {};
    var out = humanData.output_signals || {};

    // Energy flow display
    detailEl.innerHTML =
      '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center">' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#3fb950;font-weight:700">' + (e.total_sessions || 0) + '</div>' +
          '<div style="font-size:9px;color:#6e7681">SESSIONS</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#58a6ff;font-weight:700">' + (e.energy_in || 0) + '%</div>' +
          '<div style="font-size:9px;color:#6e7681">ENERGY IN</div>' +
        '</div>' +
        '<div style="text-align:center;font-size:16px;color:#6e7681">⇄</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#a371f7;font-weight:700">' + (e.energy_out || 0) + '%</div>' +
          '<div style="font-size:9px;color:#6e7681">ENERGY OUT</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:20px;color:#d29922;font-weight:700">' + (e.work || 0) + '%</div>' +
          '<div style="font-size:9px;color:#6e7681">WORK</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:14px;color:#8b949e">' + (e.signal_to_noise || 0) + '</div>' +
          '<div style="font-size:9px;color:#6e7681">S/N</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:14px;color:#8b949e">' + (e.avg_breadth || 0) + '</div>' +
          '<div style="font-size:9px;color:#6e7681">AVG SURFACES</div>' +
        '</div>' +
        '<div style="text-align:center">' +
          '<div style="font-size:14px;color:' + (out.energy_balance === 'surplus' ? '#3fb950' : '#e74c3c') + '">' +
            (out.energy_balance || '?') + '</div>' +
          '<div style="font-size:9px;color:#6e7681">BALANCE</div>' +
        '</div>' +
      '</div>';

    // Epitope classification pills
    orbitsEl.innerHTML = '';
    var epEntries = Object.entries(ep).sort(function(a, b) {
      return (b[1].total_requests || 0) - (a[1].total_requests || 0);
    });

    epEntries.forEach(function(entry) {
      var name = entry[0];
      var data = entry[1];
      var color = EPITOPE_COLORS[name] || '#6e7681';
      var pill = document.createElement('span');
      pill.className = 'hw-org';
      pill.style.borderLeft = '3px solid ' + color;
      pill.innerHTML =
        '<span style="color:' + color + ';font-weight:600">' + name + '</span>' +
        ' · <span style="color:#c9d1d9">' + data.count + '</span> sessions' +
        ' · <span style="color:#8b949e">' + (data.total_requests || 0).toLocaleString() + ' reqs</span>' +
        ' · breadth <span style="color:#8b949e">' + (data.avg_breadth || 0) + '</span>';
      orbitsEl.appendChild(pill);
    });

    // External referrers (where humans come FROM — output from the other side)
    var refs = humanData.external_referrers || [];
    if (refs.length > 0) {
      var refDiv = document.createElement('div');
      refDiv.style.cssText = 'margin-top:6px;font-size:10px;color:#6e7681;';
      refDiv.innerHTML = '<span style="text-transform:uppercase;letter-spacing:0.08em">inbound from:</span> ' +
        refs.map(function(r) {
          return '<span style="color:#58a6ff">' + r.source + '</span> (' + r.visits + ')';
        }).join(' · ');
      orbitsEl.appendChild(refDiv);
    }
  }

  // Fetch human.json feed and also dashboard for fallback
  function loadHumanData() {
    var base2 = isHud ? '' : HUD;

    fetch(base2 + '/human.json', {cache: 'no-store'})
      .then(function(r) { return r.json(); })
      .then(function(d) { renderFromFeed(d); })
      .catch(function() {
        // Fallback: compute from dashboard.json
        fetch(base2 + '/dashboard.json', {cache: 'no-store'})
          .then(function(r) { return r.json(); })
          .then(function(d) { renderHumanEpitopes(d); })
          .catch(function() {});
      });
  }

  // Run on load and every 30s (human data updates less frequently)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(loadHumanData, 800);
    });
  } else {
    setTimeout(loadHumanData, 800);
  }
  setInterval(loadHumanData, 30000);
})();
