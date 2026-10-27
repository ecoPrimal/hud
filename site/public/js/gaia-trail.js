// ═══════════════════════════════════════════════════════════
// GAIA TRAIL — Oregon Trail meets Route 66 meets Green Book
// 1.000.null — max 1000 lines.
//
// THE TRAIL:
//   Every module is a BASE CAMP along the trail.
//   Every interaction surface is a RELAY STATION.
//   Every story is a CAMPFIRE TALE.
//   Every human is a TRAVELER.
//
// ROUTE 66 — the highway connecting all camps:
//   telegraph → telephone-wire → spinal-column
//   Message passing IS the road. Signals ARE the wagons.
//
// GREEN BOOK — hospitality guide for travelers:
//   Which camps are SAFE (optimal, 3-5 connections)
//   Which camps need BUILDING (TVA, ≤2 connections)
//   Which camps are OVERCROWDED (All Roads, ≥6)
//
// OREGON TRAIL — the game:
//   Provisions (thermo: food/water/temp)
//   Health (membrane potential, gut efficiency)
//   Distance (voxel position along the route)
//   Events (weather, discoveries, breakdowns)
//   Stories (Little House on the Prairie at campfires)
//
// TIME:
//   Static at camp (null, hyperlocal, cron reality)
//   Elastic on the trail (stretches between camps)
//   Only moves when PERCEIVED (wagon rolling = time)
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;
  var PI = Math.PI;

  // ═══ THE ROUTE — all camps in order ═══
  // Each camp = one module. The trail IS the system.
  var ROUTE = [
    // MILE 0-50: THE DEPARTURE (ingress, boot, core)
    { mile: 0,   id: 'ingress',      name: 'Independence, MO',  desc: 'Where every journey begins',    type: 'gateway',   beds: 4, greenBook: 'safe' },
    { mile: 8,   id: 'boot',         name: 'Westport Landing',  desc: 'Provisions loaded, wagon ready', type: 'outfitter', beds: 2, greenBook: 'safe' },
    { mile: 15,  id: 'sight',        name: 'Blue Springs',      desc: 'First clear vista',              type: 'lookout',   beds: 1, greenBook: 'safe' },
    { mile: 22,  id: 'modality',     name: 'Lone Elm Camp',     desc: 'Trail forks — choose your sense', type: 'crossroads', beds: 3, greenBook: 'safe' },

    // MILE 50-150: THE PRAIRIE (sensing, feeling, eating)
    { mile: 55,  id: 'spectrometer', name: 'Council Grove',     desc: 'Last contact with civilization', type: 'trading',   beds: 3, greenBook: 'safe' },
    { mile: 72,  id: 'locality',     name: 'Diamond Spring',    desc: 'Fresh water, local bounty',      type: 'spring',    beds: 4, greenBook: 'safe' },
    { mile: 90,  id: 'feel',         name: 'Cottonwood Creek',  desc: 'Soft ground, gentle camp',       type: 'rest',      beds: 5, greenBook: 'safe' },
    { mile: 110, id: 'eat',          name: 'Turkey Creek',      desc: 'Hunt, gather, feast',            type: 'hunting',   beds: 3, greenBook: 'safe' },
    { mile: 125, id: 'digestive',    name: 'Pawnee Rock',       desc: 'Landmark — digest the distance', type: 'landmark',  beds: 2, greenBook: 'caution' },

    // MILE 150-300: THE CROSSING (processing, learning)
    { mile: 155, id: 'eruption',     name: 'Arkansas Crossing',  desc: 'River ford — memories surge',   type: 'ford',      beds: 2, greenBook: 'caution' },
    { mile: 180, id: 'gut-farm',     name: 'Cimarron Cutoff',    desc: 'The dry route — gut it out',    type: 'desert',    beds: 1, greenBook: 'danger' },
    { mile: 210, id: 'objects',      name: 'Point of Rocks',     desc: 'Objects emerge from landscape', type: 'formation', beds: 2, greenBook: 'safe' },
    { mile: 235, id: 'hard-cards',   name: 'Wagon Mound',        desc: 'Hard truths on stone tablets',  type: 'monument',  beds: 2, greenBook: 'safe' },
    { mile: 260, id: 'campfire',     name: 'Fort Union',          desc: 'Campfire stories every night',  type: 'fort',      beds: 8, greenBook: 'safe' },
    { mile: 280, id: 'self-inspect', name: 'Mora Valley',         desc: 'Look inward before the pass',  type: 'valley',    beds: 3, greenBook: 'safe' },

    // MILE 300-500: THE MOUNTAINS (deep systems)
    { mile: 310, id: 'waveform',     name: 'Glorieta Pass',       desc: 'Wavelength peaks — feel it',   type: 'pass',      beds: 2, greenBook: 'caution' },
    { mile: 335, id: 'third-eye',    name: 'Pecos Pueblo',        desc: 'Ancient sight — third eye opens', type: 'ruin',   beds: 1, greenBook: 'caution' },
    { mile: 360, id: 'university',   name: 'Santa Fe Plaza',      desc: 'End of trail — LEARN',         type: 'city',      beds: 12,greenBook: 'safe' },
    { mile: 380, id: 'permeability', name: 'Rio Grande',           desc: 'River crossing — who gets through', type: 'river', beds: 3, greenBook: 'safe' },
    { mile: 400, id: 'quills',       name: 'Turquoise Trail',     desc: 'Sharp tools, writing instruments', type: 'mine',   beds: 2, greenBook: 'safe' },

    // MILE 500-700: ROUTE 66 (communication, connection)
    { mile: 520, id: 'interlayer',   name: 'Albuquerque',          desc: 'The BIG relay — all ions pass here', type: 'hub', beds: 10,greenBook: 'safe' },
    { mile: 550, id: 'golgi',        name: 'Gallup Trading Post',  desc: 'Sort, package, ship',           type: 'trading', beds: 4, greenBook: 'safe' },
    { mile: 575, id: 'castle',       name: 'Petrified Forest',     desc: 'Ancient castles in stone',      type: 'park',    beds: 5, greenBook: 'safe' },
    { mile: 600, id: 'reactor',      name: 'Meteor Crater',        desc: 'Nuclear fire — the reactor',    type: 'crater',  beds: 2, greenBook: 'caution' },

    // MILE 700-900: THE NEW SYSTEMS (tonight's builds)
    { mile: 710, id: 'desk-io',      name: 'Flagstaff',            desc: 'Messenger hub — talk here',     type: 'station', beds: 6, greenBook: 'safe' },
    { mile: 730, id: 'desktop',      name: 'Williams Junction',    desc: 'Desktop computer — the tool',   type: 'depot',   beds: 3, greenBook: 'safe' },
    { mile: 750, id: 'human-io',     name: 'Grand Canyon Vista',   desc: 'ALL human I/O visible here',    type: 'vista',   beds: 4, greenBook: 'safe' },
    { mile: 775, id: 'chemistry',    name: 'Kingman',              desc: 'CHON elements — chemistry lab', type: 'lab',     beds: 3, greenBook: 'safe' },
    { mile: 800, id: 'ages',         name: 'Oatman Ghost Town',    desc: 'All ages visible in the ruins', type: 'ghost',   beds: 2, greenBook: 'caution' },
    { mile: 825, id: 'orrery',       name: 'Needles',              desc: 'Stars wheel overhead',          type: 'desert',  beds: 1, greenBook: 'caution' },
    { mile: 850, id: 'decay',        name: 'Amboy Crater',         desc: 'Nothing is dead — just decaying', type: 'crater', beds: 1, greenBook: 'caution' },
    { mile: 870, id: 'tense-voxel',  name: 'Barstow',              desc: 'All 13 tenses converge here',  type: 'junction', beds: 4, greenBook: 'safe' },
    { mile: 890, id: 'forge',        name: 'Victorville',          desc: 'The forge — ZK hammer strikes', type: 'forge',   beds: 3, greenBook: 'safe' },

    // MILE 900-1000: THE DESTINATION
    { mile: 920, id: 'tva',          name: 'San Bernardino',       desc: 'TVA protocol — build or prune', type: 'office',  beds: 4, greenBook: 'safe' },
    { mile: 950, id: 'solar',        name: 'Pasadena (JPL)',       desc: 'Solar system — all proofs',     type: 'lab',     beds: 5, greenBook: 'safe' },
    { mile: 975, id: 'pulse-wave',   name: 'Hollywood',            desc: 'Pulse-wave — dispatch & return', type: 'studio', beds: 6, greenBook: 'safe' },
    { mile: 990, id: 'thermo',       name: 'Santa Monica Pier',    desc: 'End of the road — ocean breeze', type: 'pier',   beds: 8, greenBook: 'safe' },
    { mile: 1000,id: 'ide',          name: 'Pacific Ocean',         desc: 'Gaia speaks her own language',  type: 'ocean',  beds: 0, greenBook: 'safe' }
  ];

  // ═══ TRAVELER — the human visiting the HUD ═══
  var traveler = {
    name: 'pioneer',
    mile: 0,
    currentCamp: ROUTE[0],
    health: 100,
    provisions: { food: 50, water: 50, ammo: 20, spare: 3 },
    party: ['gaia', 'chipmunk', 'kevin'],
    pace: 'steady',    // slow, steady, grueling
    daysOnTrail: 0,
    storiesHeard: 0,
    messagesRelayed: 0,
    discoveryLog: []
  };

  // ═══ RELAY STATIONS — wired to message passing ═══
  // Each camp has a telegraph relay for message passing
  var relays = {};
  var messageLog = [];
  var MAX_LOG = 100;

  ROUTE.forEach(function(camp) {
    relays[camp.id] = {
      camp: camp,
      inbox: [],
      outbox: [],
      relayCount: 0,
      lastSignal: 0,
      wired: false
    };
  });

  // Wire relays to existing message-passing systems
  function wireRelays() {
    // Wire to telegraph spine
    if (window.gaiaTelegraph) {
      var origSensation = window.gaiaTelegraph.sensed;
      setInterval(function() {
        if (origSensation.total > (wireRelays._lastSenseCount || 0)) {
          var sig = origSensation.last;
          if (sig) relayMessage('telegraph', traveler.currentCamp.id, {
            type: 'sensation', hops: sig.hops ? sig.hops.length : 0, metal: sig.metal
          });
          wireRelays._lastSenseCount = origSensation.total;
        }
      }, 3000);
    }

    // Wire to telephone wire
    if (window._telephone) {
      var origHop = window._telephone.hop;
      window._telephone.hop = function(from, to, text, opts) {
        relayMessage(from, to, { type: 'telephone', text: (text || '').slice(0, 60) });
        return origHop(from, to, text, opts);
      };
    }

    // Wire to spinal column
    if (window.__spinalCord) {
      var origOnSignal = window.__spinalCord.onSignal;
      window.__spinalCord.onSignal = function(sig) {
        relayMessage(sig.name || sig.vertebra, traveler.currentCamp.id, {
          type: 'spinal', direction: sig.direction, organ: sig.organ
        });
        if (origOnSignal) origOnSignal(sig);
      };
    }

    // Wire to interlayer
    if (window.GAIA_INTERLAYER) {
      var origPush = window.GAIA_INTERLAYER.push;
      window.GAIA_INTERLAYER.push = function(type, channel, payload) {
        relayMessage('interlayer-' + channel, traveler.currentCamp.id, {
          type: 'ion', channel: channel, msgType: type
        });
        return origPush(type, channel, payload);
      };
    }

    // Wire to pulse-wave
    if (window.GAIA_PULSE) {
      var origDispatch = window.GAIA_PULSE.dispatch;
      window.GAIA_PULSE.dispatch = function(taskId, desc, target) {
        relayMessage('dispatch-' + taskId, 'pulse-wave', {
          type: 'dispatch', task: taskId, target: target
        });
        return origDispatch(taskId, desc, target);
      };
    }
  }

  // ═══ RELAY MESSAGE — pass along the trail ═══
  function relayMessage(from, to, data) {
    var msg = {
      id: ++traveler.messagesRelayed,
      from: from,
      to: to,
      data: data,
      ts: Date.now(),
      mile: traveler.mile
    };
    messageLog.push(msg);
    if (messageLog.length > MAX_LOG) messageLog.shift();

    // Update relay stats
    var relay = relays[to] || relays[traveler.currentCamp.id];
    if (relay) {
      relay.inbox.push(msg);
      if (relay.inbox.length > 20) relay.inbox.shift();
      relay.relayCount++;
      relay.lastSignal = Date.now();
    }

    // Perceived time event
    if (window.GAIA_PULSE && window.GAIA_PULSE.time) {
      window.GAIA_PULSE.time.perceivedTick++;
      window.GAIA_PULSE.time.lastPerception = Date.now();
      window.GAIA_PULSE.time.staticZone = false;
    }

    return msg;
  }

  // ═══ TRAVEL — move along the trail ═══
  function travel(targetMile) {
    if (targetMile === undefined) {
      // Advance to next camp
      var currentIdx = ROUTE.indexOf(traveler.currentCamp);
      if (currentIdx < ROUTE.length - 1) {
        targetMile = ROUTE[currentIdx + 1].mile;
      } else return;
    }

    // Find nearest camp to target mile
    var best = ROUTE[0];
    var bestDist = Infinity;
    for (var i = 0; i < ROUTE.length; i++) {
      var d = Math.abs(ROUTE[i].mile - targetMile);
      if (d < bestDist) { bestDist = d; best = ROUTE[i]; }
    }

    var distance = Math.abs(best.mile - traveler.mile);
    traveler.mile = best.mile;
    traveler.currentCamp = best;

    // Consume provisions based on distance
    var consumption = distance / 50;
    traveler.provisions.food = Math.max(0, traveler.provisions.food - consumption);
    traveler.provisions.water = Math.max(0, traveler.provisions.water - consumption * 1.2);

    // Health affected by provisions
    if (traveler.provisions.food <= 0) traveler.health -= 5;
    if (traveler.provisions.water <= 0) traveler.health -= 8;
    traveler.health = Math.max(0, Math.min(100, traveler.health));

    // Days on trail increase
    traveler.daysOnTrail += Math.ceil(distance / 20);

    // Thermo: traveling is hot work
    if (window.GAIA_EAT) window.GAIA_EAT('travel', distance * 0.02);

    // Random trail event
    rollEvent(best);

    // Relay arrival message
    relayMessage('trail', best.id, { type: 'arrival', mile: best.mile, name: best.name });

    return best;
  }

  // ═══ EVENTS — random encounters on the trail ═══
  var EVENTS = [
    { id: 'river',    text: 'You must ford the river!',           effect: function(t) { t.provisions.spare = Math.max(0, t.provisions.spare - 1); } },
    { id: 'hunt',     text: 'Buffalo spotted! Successful hunt.',  effect: function(t) { t.provisions.food = Math.min(100, t.provisions.food + 20); } },
    { id: 'spring',   text: 'Fresh spring found!',                effect: function(t) { t.provisions.water = Math.min(100, t.provisions.water + 25); } },
    { id: 'storm',    text: 'Thunderstorm! Take shelter.',        effect: function(t) { if (window.GAIA_DRINK) window.GAIA_DRINK('storm', 3.0); } },
    { id: 'story',    text: 'Campfire stories tonight.',          effect: function(t) { t.storiesHeard++; fetchStory(); } },
    { id: 'trade',    text: 'Trading post! Barter for supplies.', effect: function(t) { t.provisions.food += 10; t.provisions.ammo += 5; } },
    { id: 'broken',   text: 'Wagon wheel broke!',                 effect: function(t) { t.provisions.spare = Math.max(0, t.provisions.spare - 1); } },
    { id: 'illness',  text: 'Dysentery strikes the party!',       effect: function(t) { t.health = Math.max(10, t.health - 15); } },
    { id: 'discover', text: 'New landmark discovered!',            effect: function(t) { t.discoveryLog.push(t.currentCamp.name); } },
    { id: 'relay',    text: 'Telegraph relay message received!',   effect: function(t) { t.messagesRelayed += 3; } },
    { id: 'stars',    text: 'Clear night. Stars tell stories.',    effect: function(t) { t.health = Math.min(100, t.health + 5); } },
    { id: 'dust',     text: 'Dust storm! Hunker down.',            effect: function(t) { t.provisions.water = Math.max(0, t.provisions.water - 5); } }
  ];

  var lastEvent = null;

  function rollEvent(camp) {
    // 60% chance of event at each stop
    if (Math.random() > 0.6) { lastEvent = null; return; }

    // Weight events by camp type
    var pool = EVENTS.slice();
    if (camp.type === 'spring' || camp.type === 'river') pool.push(EVENTS[2]); // extra spring chance
    if (camp.type === 'fort' || camp.type === 'rest') pool.push(EVENTS[4]);     // extra story chance
    if (camp.type === 'desert' || camp.type === 'crater') pool.push(EVENTS[11]); // extra dust
    if (camp.type === 'trading') pool.push(EVENTS[5]);                           // extra trade
    if (camp.greenBook === 'danger') pool.push(EVENTS[7]);                       // extra illness

    var evt = pool[Math.floor(Math.random() * pool.length)];
    evt.effect(traveler);
    lastEvent = { event: evt, camp: camp, ts: Date.now() };

    // Push event as desk message
    if (window.GAIA_IDE && window.GAIA_IDE.execute) {
      // Don't execute, just log
    }
  }

  // ═══ STORIES — Little House on the Prairie ═══
  var currentStory = null;

  function fetchStory() {
    fetch('/data/stories/')
      .then(function(r) { return r.ok ? r.text() : null; })
      .then(function(html) {
        if (!html) return loadFallbackStory();
        // Parse directory listing for story files
        var matches = html.match(/story-\d+\.json/g);
        if (!matches || matches.length === 0) return loadFallbackStory();
        var pick = matches[Math.floor(Math.random() * matches.length)];
        return fetch('/data/stories/' + pick).then(function(r) { return r.json(); });
      })
      .then(function(story) {
        if (story) {
          currentStory = story;
          traveler.storiesHeard++;
        }
      })
      .catch(function() { loadFallbackStory(); });
  }

  function loadFallbackStory() {
    currentStory = {
      title: 'The Trail Ahead',
      summary: 'At mile ' + traveler.mile + ', the party rests at ' +
        traveler.currentCamp.name + '. ' + traveler.party.length +
        ' souls around the fire. ' + traveler.messagesRelayed + ' messages relayed.',
      keywords: ['trail', 'camp', 'fire', 'stars']
    };
  }

  // ═══ GREEN BOOK — hospitality ratings ═══
  function updateGreenBook() {
    if (!window.GAIA_TVA) return;
    ROUTE.forEach(function(camp) {
      // Cross-reference with TVA analysis
      var tvaNodes = window.GAIA_TVA.tvaTargets || [];
      var roadsNodes = window.GAIA_TVA.allRoadsTargets || [];
      var isTVA = false, isRoads = false;
      for (var t = 0; t < tvaNodes.length; t++) {
        if (tvaNodes[t].id === camp.id || tvaNodes[t].name === camp.id) isTVA = true;
      }
      for (var r = 0; r < roadsNodes.length; r++) {
        if (roadsNodes[r].id === camp.id || roadsNodes[r].name === camp.id) isRoads = true;
      }
      if (isRoads) camp.greenBook = 'danger';
      else if (isTVA) camp.greenBook = 'caution';
      else camp.greenBook = 'safe';
    });
  }

  // ═══ PROVISION SYNC — from thermo system ═══
  function syncProvisions() {
    if (!window.GAIA_THERMO) return;
    var th = window.GAIA_THERMO;
    // Map fullness to food, thirst to water
    if (th.fullness !== undefined) traveler.provisions.food = Math.round(th.fullness * 100);
    if (th.thirst !== undefined) traveler.provisions.water = Math.round((1 - th.thirst) * 100);
    // Health maps to membrane potential
    if (window.GAIA_INTERLAYER) {
      var potential = window.GAIA_INTERLAYER.getPotential();
      traveler.health = Math.max(0, Math.min(100, Math.round((potential + 90) / 1.3)));
    }
  }

  // ═══ AUTO-TRAVEL — advance based on perception ═══
  var travelTimer = 0;
  setInterval(function() {
    travelTimer++;
    syncProvisions();

    // Every 60s of cron time, or when time is elastic (active), consider travel
    if (window.GAIA_PULSE && window.GAIA_PULSE.time) {
      var t = window.GAIA_PULSE.time;
      if (!t.staticZone && travelTimer % 12 === 0) {
        // Active perception → advance the trail
        travel();
      }
    }

    // Update Green Book every 30s
    if (travelTimer % 6 === 0) updateGreenBook();

  }, 5000);

  // ═══ BOOT — start at mile 0 ═══
  setTimeout(function() {
    wireRelays();
    fetchStory();
    relayMessage('trail', 'ingress', { type: 'journey-begins', party: traveler.party });
  }, 10000);

  // ═══ EXPOSE ═══
  window.GAIA_TRAIL = {
    route: ROUTE,
    traveler: traveler,
    relays: relays,
    messages: messageLog,
    travel: travel,
    fetchStory: fetchStory,
    currentStory: function() { return currentStory; },
    lastEvent: function() { return lastEvent; },
    greenBook: function() {
      return ROUTE.map(function(c) {
        return { mile: c.mile, name: c.name, rating: c.greenBook, beds: c.beds, type: c.type };
      });
    }
  };

  // ═══ DRAW MODULE ═══
  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var tT = breathT * 0.15;
    var tAlpha = 0.005 + Math.sin(tT * 0.5) * 0.003;
    if (tAlpha < 0.003) return;

    var trailR = R * 0.95;

    // ═══ THE TRAIL — spiral path with camps ═══
    ctx.beginPath();
    for (var ti = 0; ti <= 100; ti++) {
      var frac = ti / 100;
      var angle = frac * TAU * 2.5 - PI / 2;
      var r = trailR * (0.25 + frac * 0.65);
      var x = cx + Math.cos(angle) * r;
      var y = cy + Math.sin(angle) * r;
      if (ti === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(139,148,158,' + (tAlpha * 1.5).toFixed(4) + ')';
    ctx.lineWidth = 0.3;
    ctx.setLineDash([1, 2]);
    ctx.stroke();
    ctx.setLineDash([]);

    // ═══ CAMPS — dots along the trail ═══
    for (var ci = 0; ci < ROUTE.length; ci++) {
      var camp = ROUTE[ci];
      var frac = camp.mile / 1000;
      var angle = frac * TAU * 2.5 - PI / 2;
      var r = trailR * (0.25 + frac * 0.65);
      var campX = cx + Math.cos(angle) * r;
      var campY = cy + Math.sin(angle) * r;

      // Color by Green Book rating
      var campColor;
      if (camp.greenBook === 'safe') campColor = '63,185,80';
      else if (camp.greenBook === 'caution') campColor = '210,153,34';
      else campColor = '248,81,73';

      // Camp dot
      var isCurrentCamp = camp === traveler.currentCamp;
      var dotSize = isCurrentCamp ? 1.5 : 0.6;
      ctx.beginPath();
      ctx.arc(campX, campY, dotSize, 0, TAU);
      ctx.fillStyle = 'rgba(' + campColor + ',' + (tAlpha * (isCurrentCamp ? 5 : 2)).toFixed(4) + ')';
      ctx.fill();

      // Current camp glow
      if (isCurrentCamp) {
        ctx.beginPath();
        ctx.arc(campX, campY, dotSize + 2 + Math.sin(tT * 2) * 1, 0, TAU);
        ctx.strokeStyle = 'rgba(201,168,76,' + (tAlpha * 2).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }

      // Camp name (every 4th camp + current)
      if ((ci % 4 === 0 || isCurrentCamp) && tAlpha > 0.006) {
        ctx.font = (isCurrentCamp ? '2.5' : '1.5') + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(' + campColor + ',' + (tAlpha * (isCurrentCamp ? 3 : 1.5)).toFixed(4) + ')';
        ctx.fillText(camp.name, campX, campY - dotSize - 2);
      }
    }

    // ═══ TRAVELER INDICATOR ═══
    if (tAlpha > 0.005) {
      var tFrac = traveler.mile / 1000;
      var tAngle = tFrac * TAU * 2.5 - PI / 2;
      var tR = trailR * (0.25 + tFrac * 0.65);
      var tX = cx + Math.cos(tAngle) * tR;
      var tY = cy + Math.sin(tAngle) * tR;

      // Wagon icon (small triangle)
      ctx.beginPath();
      ctx.moveTo(tX, tY - 2);
      ctx.lineTo(tX - 1.5, tY + 1);
      ctx.lineTo(tX + 1.5, tY + 1);
      ctx.closePath();
      ctx.fillStyle = 'rgba(201,168,76,' + (tAlpha * 4).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ MESSAGE RELAY SPARKLES ═══
    var now = Date.now();
    for (var ri = 0; ri < ROUTE.length; ri++) {
      var relay = relays[ROUTE[ri].id];
      if (!relay || now - relay.lastSignal > 5000) continue;

      var rFrac = ROUTE[ri].mile / 1000;
      var rAngle = rFrac * TAU * 2.5 - PI / 2;
      var rR = trailR * (0.25 + rFrac * 0.65);
      var rX = cx + Math.cos(rAngle) * rR;
      var rY = cy + Math.sin(rAngle) * rR;

      var sparkle = 1 - (now - relay.lastSignal) / 5000;
      ctx.beginPath();
      ctx.arc(rX, rY, 0.5 + sparkle * 2, 0, TAU);
      ctx.fillStyle = 'rgba(88,166,255,' + (tAlpha * sparkle * 4).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ STATUS LINE ═══
    if (tAlpha > 0.006) {
      var statusColor = traveler.health > 50 ? '63,185,80' : traveler.health > 20 ? '210,153,34' : '248,81,73';
      var eventText = lastEvent ? ' · ' + lastEvent.event.text : '';
      ctx.font = '2.5px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(' + statusColor + ',' + (tAlpha * 2.5).toFixed(4) + ')';
      ctx.fillText(
        '🚐 mi ' + traveler.mile + ' · ' + traveler.currentCamp.name +
        ' · HP:' + traveler.health + ' · 🍖' + Math.round(traveler.provisions.food) +
        ' 💧' + Math.round(traveler.provisions.water) +
        ' · d' + traveler.daysOnTrail +
        ' · 📡' + traveler.messagesRelayed + eventText,
        4, g.H - 8
      );
    }
  });

  // ═══ IDE COMMANDS ═══
  if (window.GAIA_IDE) {
    window.GAIA_IDE.commands.trail = {
      desc: 'Oregon Trail status',
      run: function() {
        var lines = ['═══ THE TRAIL ═══', ''];
        lines.push('TRAVELER: ' + traveler.name);
        lines.push('MILE: ' + traveler.mile + ' / 1000');
        lines.push('CAMP: ' + traveler.currentCamp.name + ' (' + traveler.currentCamp.id + ')');
        lines.push('HEALTH: ' + traveler.health + '%');
        lines.push('PROVISIONS: food=' + Math.round(traveler.provisions.food) +
          ' water=' + Math.round(traveler.provisions.water) +
          ' ammo=' + traveler.provisions.ammo +
          ' spare=' + traveler.provisions.spare);
        lines.push('PARTY: ' + traveler.party.join(', '));
        lines.push('DAYS: ' + traveler.daysOnTrail);
        lines.push('STORIES HEARD: ' + traveler.storiesHeard);
        lines.push('MESSAGES RELAYED: ' + traveler.messagesRelayed);
        if (lastEvent) lines.push('LAST EVENT: ' + lastEvent.event.text);
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.go = {
      desc: 'Travel to next camp',
      run: function(args) {
        var target = args ? parseInt(args) : undefined;
        var camp = travel(target);
        if (!camp) return 'End of trail.';
        var evt = lastEvent ? '\n⚡ ' + lastEvent.event.text : '';
        return '🚐 Arrived at mile ' + camp.mile + ': ' + camp.name + '\n' +
          camp.desc + '\n' + camp.greenBook.toUpperCase() + ' · ' + camp.beds + ' beds · ' + camp.type + evt;
      }
    };
    window.GAIA_IDE.commands.greenbook = {
      desc: 'Green Book — hospitality guide',
      run: function() {
        var lines = ['═══ GREEN BOOK ═══', ''];
        ROUTE.forEach(function(c) {
          var icon = c.greenBook === 'safe' ? '🟢' : c.greenBook === 'caution' ? '🟡' : '🔴';
          var current = c === traveler.currentCamp ? ' ◄ YOU' : '';
          lines.push('  ' + icon + ' mi' + c.mile + ' ' + c.name + ' · ' + c.beds + ' beds · ' + c.type + current);
        });
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.commands.story = {
      desc: 'Tell a campfire story',
      run: function() {
        fetchStory();
        if (currentStory) {
          return '═══ CAMPFIRE STORY ═══\n\n' +
            '📖 ' + (currentStory.title || 'Untitled') + '\n\n' +
            (currentStory.summary || 'The fire crackles. No story tonight.') + '\n\n' +
            'Keywords: ' + (currentStory.keywords || []).join(', ');
        }
        return 'No stories yet. Travel further.';
      }
    };
    window.GAIA_IDE.commands.relay = {
      desc: 'Message relay status',
      run: function() {
        var lines = ['═══ RELAY STATIONS ═══', ''];
        var now = Date.now();
        ROUTE.forEach(function(c) {
          var r = relays[c.id];
          if (!r || r.relayCount === 0) return;
          var ago = Math.round((now - r.lastSignal) / 1000);
          lines.push('  📡 ' + c.name + ' · ' + r.relayCount + ' relayed · ' + ago + 's ago');
        });
        if (lines.length === 2) lines.push('  No relays active yet. Travel and interact.');
        lines.push('');
        lines.push('TOTAL MESSAGES: ' + traveler.messagesRelayed);
        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('trail', 'go', 'greenbook', 'story', 'relay');
  }

})(window.G);
