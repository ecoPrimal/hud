// cosmic-strategy.js — grand strategy layer for the membrane game
// Territory map linking surfaces to cosmic view layers, force disposition,
// supply lines from braids, combat resolution from Anderson modes.
// Loaded after cosmic-cards.js.
(function() {
  'use strict';

  var STORE_KEY = 'cosmic-strategy-v1';

  // ═══ TERRITORY MAP ═══
  var TERRITORIES = {
    sun:     { surface:'hud',         layer:2, name:'Sol Command',        held:false, contested:false, defense:1.0 },
    mercury: { surface:'signal',      layer:2, name:'Mercury Relay',      held:false, contested:false, defense:1.0 },
    venus:   { surface:'hypothesis',  layer:2, name:'Venus Laboratory',   held:false, contested:false, defense:1.0 },
    earth:   { surface:'detroit',     layer:2, name:'Earth Primary',      held:false, contested:false, defense:1.0 },
    moon:    { surface:'barry',       layer:3, name:'Lunar Archive',      held:false, contested:false, defense:1.0 },
    mars:    { surface:'tuebor',      layer:2, name:'Mars Bastion',       held:false, contested:false, defense:1.0 },
    jupiter: { surface:'gorilla',     layer:2, name:'Jupiter Citadel',    held:false, contested:false, defense:1.0 },
    saturn:  { surface:'thesis',      layer:2, name:'Saturn Academy',     held:false, contested:false, defense:1.0 },
    uranus:  { surface:'clutch',      layer:2, name:'Uranus Intel',       held:false, contested:false, defense:1.0 },
    neptune: { surface:'sporeprint',  layer:2, name:'Neptune Archive',    held:false, contested:false, defense:1.0 },
    kuiper:  { surface:'esotericWebb',layer:2, name:'Kuiper Nexus',       held:false, contested:false, defense:1.0 },
  };

  // ═══ GATES — strategic chokepoints ═══
  var GATES = {
    eastGate:  { name:'eastGate',  alive:true, controlledBy:'self' },
    golgiBody: { name:'golgiBody', alive:true, controlledBy:'self' },
    sporeGate: { name:'sporeGate', alive:true, controlledBy:'self' },
    northGate: { name:'northGate', alive:true, controlledBy:'self' },
  };

  // ═══ FORCE DISPOSITION ═══
  var _forces = {
    self: { units:0, power:0, toughness:0, selectivity:0.97 },
    fleet: { units:0, power:0, requests:0, ips:0 },
    human: { sessions:0, sn:0, breadth:0 },
  };

  var _supplyLines = [];
  var _commandPoints = 0.318;
  var _morale = 0;
  var _initiative = 1.0;
  var _combatLog = [];

  // ═══ PERSISTENCE ═══

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved.territories) {
          Object.keys(saved.territories).forEach(function(k) {
            if (TERRITORIES[k]) {
              TERRITORIES[k].held = saved.territories[k].held;
              TERRITORIES[k].contested = saved.territories[k].contested;
            }
          });
        }
      }
    } catch(e) {}
  }

  function saveState() {
    try {
      var t = {};
      Object.keys(TERRITORIES).forEach(function(k) {
        t[k] = { held: TERRITORIES[k].held, contested: TERRITORIES[k].contested };
      });
      localStorage.setItem(STORE_KEY, JSON.stringify({ territories: t, ts: Date.now() }));
    } catch(e) {}
  }

  // ═══ TERRITORY OPERATIONS ═══

  function claimTerritory(surfaceKey) {
    var planet = null;
    Object.keys(TERRITORIES).forEach(function(k) {
      if (TERRITORIES[k].surface === surfaceKey) planet = k;
    });
    if (!planet) return 'Unknown surface: ' + surfaceKey;

    var terr = TERRITORIES[planet];
    if (terr.held) return terr.name + ' already held.';

    terr.held = true;
    terr.contested = false;
    terr.defense = Math.min(1.0, _forces.self.selectivity);
    saveState();

    if (window._signalRelay) {
      window._signalRelay.send('territory_claim', { planet: planet, surface: surfaceKey, name: terr.name });
    }

    return 'CLAIMED: ' + terr.name + ' (defense ' + (terr.defense * 100).toFixed(0) + '%)';
  }

  function contestTerritory(planet, fleetPower) {
    var terr = TERRITORIES[planet];
    if (!terr || !terr.held) return null;

    terr.contested = true;
    var defenseRoll = Math.random() * terr.defense;
    var attackRoll = Math.random() * (fleetPower / 10);

    var result = { planet: planet, name: terr.name, defense: defenseRoll, attack: attackRoll };
    if (defenseRoll >= attackRoll) {
      result.outcome = 'held';
      result.msg = terr.name + ' held! Defense ' + defenseRoll.toFixed(2) + ' vs attack ' + attackRoll.toFixed(2);
    } else {
      terr.held = false;
      terr.contested = false;
      result.outcome = 'lost';
      result.msg = terr.name + ' LOST. Attack ' + attackRoll.toFixed(2) + ' overcame defense ' + defenseRoll.toFixed(2);
    }
    _combatLog.push(result);
    saveState();
    return result;
  }

  // ═══ COMBAT RESOLUTION ═══

  function combatResolve(attacker, defender) {
    var aPower = attacker.power || 1;
    var dTough = defender.toughness || 1;
    var aRoll = Math.random() * aPower + aPower * 0.5;
    var dRoll = Math.random() * dTough + dTough * 0.5;

    var result = {
      attacker: attacker.name,
      defender: defender.name,
      attackRoll: aRoll,
      defendRoll: dRoll,
    };

    if (aRoll > dRoll) {
      result.winner = 'attacker';
      result.damage = Math.round((aRoll - dRoll) * 10) / 10;
      result.msg = attacker.name + ' defeats ' + defender.name + ' (dmg ' + result.damage + ')';
    } else {
      result.winner = 'defender';
      result.damage = Math.round((dRoll - aRoll) * 10) / 10;
      result.msg = defender.name + ' holds against ' + attacker.name + ' (dmg ' + result.damage + ')';
    }

    _combatLog.push(result);
    return result;
  }

  // ═══ UPDATE FROM LIVE DATA ═══

  function updateFromFeeds(human, scan, topology, braid, dashboard) {
    // Human forces
    if (human && human.energy) {
      _forces.human.sessions = human.energy.total_sessions || 0;
      _forces.human.sn = human.energy.signal_to_noise || 0;
      _forces.human.breadth = human.energy.avg_breadth || 0;
    }
    if (human && human.epitopes) {
      var total = 0;
      Object.keys(human.epitopes).forEach(function(k) {
        var ep = human.epitopes[k];
        total += (typeof ep === 'number') ? ep : (ep.count || 0);
      });
      _forces.self.units = total;
    }

    // Fleet forces
    if (topology && topology.entities) {
      var fleetPower = 0, fleetIPs = 0, fleetReqs = 0, fleetUnits = 0;
      topology.entities.forEach(function(e) {
        if (e.is_fleet) {
          fleetUnits++;
          fleetPower += (e.unique_ips || 0);
          fleetIPs += (e.unique_ips || 0);
          fleetReqs += (e.total_requests || 0);
        }
      });
      _forces.fleet = { units: fleetUnits, power: fleetPower, ips: fleetIPs, requests: fleetReqs };
    }

    // Anderson defense
    if (scan && scan.scan && scan.scan.anderson_modes) {
      var modes = scan.scan.anderson_modes;
      var humanMode = modes.human || 0;
      var sovereignMode = modes.sovereign || 0;
      var total = 0;
      Object.values(modes).forEach(function(v) { total += v; });
      if (total > 0) {
        _forces.self.selectivity = (humanMode + sovereignMode) / total;
      }
    }

    // Supply lines from braids
    _supplyLines = [];
    if (braid && braid.braids) {
      braid.braids.forEach(function(b) {
        _supplyLines.push({
          from: b.from, to: b.to,
          strength: b.strength || 1,
          trend: b.trend || 'stable',
          humans: b.humans_total || 0,
        });
      });
    }

    // Gate status from dashboard
    if (dashboard && dashboard.tower && dashboard.tower.sites) {
      dashboard.tower.sites.forEach(function(site) {
        if (site.gate && GATES[site.gate]) {
          GATES[site.gate].alive = site.alive;
        }
      });
    }

    // Contest held territories based on fleet activity
    if (_forces.fleet.requests > 100000) {
      Object.keys(TERRITORIES).forEach(function(k) {
        var terr = TERRITORIES[k];
        if (terr.held && Math.random() < 0.15) {
          terr.contested = true;
        }
      });
    }
  }

  // ═══ COMMAND POINTS (from metabolism) ═══

  function updateCommandPoints(energy, piWake, wakeLevel) {
    _commandPoints = energy || _commandPoints;
    _morale = piWake || _morale;
    _initiative = wakeLevel || _initiative;
  }

  function spendCommandPoints(cost) {
    if (_commandPoints < cost) return false;
    _commandPoints -= cost;
    return true;
  }

  // ═══ VIEWS ═══

  function strategicView() {
    var lines = ['<span style="color:#f0e68c">GRAND STRATEGY</span>'];
    lines.push('Command Points: ' + _commandPoints.toFixed(2) + '  Morale: ' + (_morale / Math.PI).toFixed(2) + '\u03c0  Initiative: ' + _initiative.toFixed(2));
    lines.push('');

    var held = 0, contested = 0, total = Object.keys(TERRITORIES).length;
    lines.push('<span style="color:#58a6ff">TERRITORIES</span>');
    Object.keys(TERRITORIES).forEach(function(k) {
      var t = TERRITORIES[k];
      var status = t.held ? (t.contested ? '<span style="color:#f0883e">\u2694 CONTESTED</span>' : '<span style="color:#3fb950">\u2713 HELD</span>') : '<span style="color:#6e7681">\u25cb unclaimed</span>';
      var flavorPip = '';
      if (window._cosmicFlavor) {
        var st = window._cosmicFlavor.surfaceStrangeness(k);
        flavorPip = '<span style="color:' + window._cosmicFlavor.flavorHex(st) + '">\u25cf</span> ';
      }
      lines.push('  ' + flavorPip + t.name + ' \u2014 ' + status + '  defense ' + (t.defense * 100).toFixed(0) + '%');
      if (t.held) held++;
      if (t.contested) contested++;
    });
    lines.push('Controlled: ' + held + '/' + total + (contested > 0 ? '  (' + contested + ' contested)' : ''));

    lines.push('\n<span style="color:#f0883e">GATES</span>');
    Object.keys(GATES).forEach(function(k) {
      var g = GATES[k];
      var dot = g.alive ? '<span style="color:#3fb950">\u25cf</span>' : '<span style="color:#f85149">\u25cf</span>';
      lines.push('  ' + dot + ' ' + g.name + ' \u2014 ' + g.controlledBy);
    });

    lines.push('\n<span style="color:#e85d3a">FORCES</span>');
    lines.push('  Self: ' + _forces.self.units + ' units, selectivity ' + (_forces.self.selectivity * 100).toFixed(0) + '%');
    lines.push('  Fleet: ' + _forces.fleet.units + ' entities, ' + _forces.fleet.ips + ' IPs, ' + _forces.fleet.requests.toLocaleString() + ' requests');
    lines.push('  Humans: ' + _forces.human.sessions + ' sessions, S/N=' + _forces.human.sn.toFixed(0) + ', breadth ' + _forces.human.breadth.toFixed(1));

    if (_supplyLines.length > 0) {
      lines.push('\n<span style="color:#bc8cff">SUPPLY LINES</span> (braids)');
      _supplyLines.forEach(function(s) {
        var trendIcon = s.trend === 'growing' ? '\u2191' : s.trend === 'fading' ? '\u2193' : '\u2192';
        lines.push('  ' + s.from + ' ' + trendIcon + ' ' + s.to + '  strength=' + s.strength.toFixed(1) + '  humans=' + s.humans);
      });
    }

    return lines.join('\n');
  }

  function battleView() {
    var lines = ['<span style="color:#e85d3a">TACTICAL SITUATION</span>'];

    lines.push('\n<span style="color:#58a6ff">ANDERSON TERRAIN</span>');
    lines.push('  chorus (open ground): massive numbers, 85% observable');
    lines.push('  ghost (fog): hard to classify, 45% observable');
    lines.push('  spectrum (high ground): high energy, 85% observable');
    lines.push('  stealth (concealment): nearly invisible, 0% observable');
    lines.push('  sovereign (allied position): 97% selective, friendly');

    lines.push('\n<span style="color:#3fb950">DEFENSE STATUS</span>');
    lines.push('  Membrane opacity: ' + (_forces.self.selectivity * 100).toFixed(0) + '%');
    lines.push('  Selectivity: ' + (_forces.self.selectivity * 100).toFixed(0) + '%');

    var contested = [];
    Object.keys(TERRITORIES).forEach(function(k) {
      if (TERRITORIES[k].contested) contested.push(TERRITORIES[k]);
    });
    if (contested.length > 0) {
      lines.push('\n<span style="color:#f0883e">ACTIVE ENGAGEMENTS</span>');
      contested.forEach(function(t) {
        lines.push('  \u2694 ' + t.name + ' under attack! Defense ' + (t.defense * 100).toFixed(0) + '%');
      });
    } else {
      lines.push('\n<span style="color:#3fb950">No active engagements.</span> The membrane holds.');
    }

    if (_combatLog.length > 0) {
      lines.push('\n<span style="color:#6e7681">COMBAT LOG</span> (last 5)');
      _combatLog.slice(-5).forEach(function(c) {
        lines.push('  ' + (c.msg || c.outcome || '?'));
      });
    }

    return lines.join('\n');
  }

  // ═══ LIFECYCLE ═══

  loadState();

  // ═══ EXPORT ═══

  window._cosmicStrategy = {
    claimTerritory: claimTerritory,
    contestTerritory: contestTerritory,
    combatResolve: combatResolve,
    updateFromFeeds: updateFromFeeds,
    updateCommandPoints: updateCommandPoints,
    spendCommandPoints: spendCommandPoints,
    strategicView: strategicView,
    battleView: battleView,
    territories: function() { return TERRITORIES; },
    gates: function() { return GATES; },
    forces: function() { return _forces; },
    supplyLines: function() { return _supplyLines; },
    commandPoints: function() { return _commandPoints; },
    combatLog: function() { return _combatLog; },
  };
})();
