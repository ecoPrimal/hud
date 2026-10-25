// cosmic-cards.js — universal card engine for the membrane game
// 5 card types drawn from live membrane data: epitope, surface, entity, ability, fleet.
// Deck builder, draw/play mechanics, mana from chipmunk metabolism.
// Loaded after signal-relay.js, before cosmic-strategy.js.
(function() {
  'use strict';

  var PI = Math.PI, PI_INV = 1 / PI;

  // ═══ CARD TYPE DEFINITIONS ═══

  var EPITOPE_CARDS = {
    coder:        { name:'Coder',        color:'#58a6ff', power:3, toughness:2, ability:'Inspect source. Draw 1 extra card per turn.', type:'epitope', rarity:'common' },
    explorer:     { name:'Explorer',     color:'#3fb950', power:2, toughness:3, ability:'Traverse any braid. +1 territory range.', type:'epitope', rarity:'uncommon' },
    investigator: { name:'Investigator', color:'#e85d3a', power:4, toughness:2, ability:'Reveal hidden connections. Sort partial\u2192self or non-self.', type:'epitope', rarity:'rare' },
    reader:       { name:'Reader',       color:'#f0e68c', power:1, toughness:4, ability:'Absorb knowledge. +2 breadth per turn.', type:'epitope', rarity:'common' },
    observer:     { name:'Observer',     color:'#6e7681', power:2, toughness:5, ability:'Cannot be targeted. Sees all Anderson modes.', type:'epitope', rarity:'uncommon' },
    visitor:      { name:'Visitor',      color:'#8b949e', power:1, toughness:1, ability:'Arrives, touches once, leaves a braid. First contact.', type:'epitope', rarity:'common' },
  };

  var SURFACE_CARDS = {
    hud:         { name:'HUD',              color:'#f0e68c', power:3, toughness:5, ability:'Command post. Draw from any feed.', type:'surface', cat:'MEMBRANE',     planet:'sun',     rarity:'legendary' },
    signal:      { name:'Signal',           color:'#8b949e', power:4, toughness:4, ability:'Relay hub. Send/receive across all surfaces.', type:'surface', cat:'SIGNAL',       planet:'mercury', rarity:'legendary' },
    hypothesis:  { name:'Hypothesis',       color:'#f0e68c', power:2, toughness:3, ability:'Formulate. If proven, double effect.', type:'surface', cat:'SCIENCE',      planet:'venus',   rarity:'rare' },
    detroit:     { name:'Detroit',           color:'#58a6ff', power:5, toughness:3, ability:'Evidence deck. 341 entity cards available.', type:'surface', cat:'INVESTIGATION',planet:'earth',   rarity:'mythic' },
    tuebor:      { name:'Tuebor',            color:'#e85d3a', power:4, toughness:4, ability:'I will defend. +2 toughness to all allies.', type:'surface', cat:'IMMUNE',       planet:'mars',    rarity:'rare' },
    gorilla:     { name:'Guerrilla Gorilla', color:'#f0883e', power:5, toughness:2, ability:'Accountability strike. Target non-self entity.', type:'surface', cat:'IMMUNE',       planet:'jupiter', rarity:'rare' },
    thesis:      { name:'Thesis',            color:'#d29922', power:3, toughness:3, ability:'Prove hypothesis. Permanent discovery.', type:'surface', cat:'SCIENCE',      planet:'saturn',  rarity:'rare' },
    clutch:      { name:'Clutch',            color:'#79c0ff', power:3, toughness:2, ability:'Investigation graph. Reveal 3 entity connections.', type:'surface', cat:'INVESTIGATION',planet:'uranus',  rarity:'uncommon' },
    sporeprint:  { name:'sporePrint',        color:'#3fb950', power:2, toughness:4, ability:'Architecture. Gain 1 ability card.', type:'surface', cat:'SCIENCE',      planet:'neptune', rarity:'uncommon' },
    barry:       { name:'Barry',             color:'#c9d1d9', power:3, toughness:2, ability:'County records. Reveal entity sort class.', type:'surface', cat:'INVESTIGATION',planet:'moon',    rarity:'uncommon' },
    esotericWebb:{ name:'Esoteric Webb',     color:'#a371f7', power:4, toughness:4, ability:'The Weaver\u2019s Parlor. Narrative encounters.', type:'surface', cat:'CREATIVE',     planet:'kuiper',  rarity:'mythic' },
  };

  var ABILITY_CARDS = {
    read_aura:          { name:'Read Aura',          color:'#bc8cff', cost:1, ability:'Perceive emotional state and hidden intentions of any entity.', type:'ability', icon:'\ud83d\udd2e' },
    sense_deception:    { name:'Sense Deception',    color:'#e85d3a', cost:1, ability:'Detect active lies. Reveal fleet honesty status.', type:'ability', icon:'\ud83d\udc41' },
    invoke_pattern:     { name:'Invoke Pattern',     color:'#58a6ff', cost:2, ability:'Reveal hidden connections. Show entity edge graph.', type:'ability', icon:'\ud83d\udd17' },
    compel_truth:       { name:'Compel Truth',       color:'#f0e68c', cost:3, ability:'Force non-self entity to reveal its true classification.', type:'ability', icon:'\u2696' },
    empathic_bridge:    { name:'Empathic Bridge',    color:'#3fb950', cost:2, ability:'Form braid between two surfaces. Create supply line.', type:'ability', icon:'\ud83c\udf09' },
    commune_with_object:{ name:'Commune with Object',color:'#d29922', cost:2, ability:'Read the history of any evidence artifact.', type:'ability', icon:'\ud83d\udcdc' },
    reconstruct_memory: { name:'Reconstruct Memory', color:'#6e7681', cost:3, ability:'View past state of any feed. Time travel in data.', type:'ability', icon:'\u23f3' },
    break_ward:         { name:'Break Ward',         color:'#f85149', cost:4, ability:'Pierce Anderson localization. Access stealth entities.', type:'ability', icon:'\ud83d\udd13' },
  };

  var FLEET_CARDS = {
    openai:    { name:'OpenAI GPTBot',      color:'#f85149', power:8, toughness:6, ability:'Mass ingestion. 507 IPs. Not honest.', type:'fleet', entity:'open_ai_gpt_bot',     rarity:'boss' },
    anthropic: { name:'Anthropic ClaudeBot', color:'#f0883e', power:7, toughness:5, ability:'Single-IP siege. 5 IPs. Honest identifier.', type:'fleet', entity:'anthropic_claude_bot', rarity:'boss' },
    meta:      { name:'Meta Fleet',          color:'#e85d3a', power:9, toughness:7, ability:'FB-BLOCK. 63 IPs. Blame mining. 4 sub-teams.', type:'fleet', entity:'meta_fleet',           rarity:'boss' },
    chorus:    { name:'Chorus',              color:'#484f58', power:1, toughness:1, ability:'Infantry. Massive numbers. 85% observable.', type:'fleet', anderson:'chorus',  rarity:'common' },
    ghost:     { name:'Ghost',               color:'#6e7681', power:3, toughness:3, ability:'Skirmisher. 45% observable. Hard to classify.', type:'fleet', anderson:'ghost',   rarity:'uncommon' },
    spectrum:  { name:'Spectrum',            color:'#d29922', power:4, toughness:2, ability:'Artillery. High energy. 85% observable.', type:'fleet', anderson:'spectrum', rarity:'rare' },
    stealth:   { name:'Stealth',             color:'#0d1117', power:5, toughness:1, ability:'Assassin. 0% observable. Nearly invisible.', type:'fleet', anderson:'stealth', rarity:'mythic' },
    sovereign: { name:'Sovereign',           color:'#3fb950', power:2, toughness:6, ability:'Allied elite. 97% selective. On our side.', type:'fleet', anderson:'sovereign', rarity:'legendary' },
  };

  // ═══ ENTITY CARD TEMPLATES ═══
  var SORT_COLORS = { self:'#3fb950', 'non-self':'#f85149', partial:'#f0e68c', null:'#6e7681' };
  var ENTITY_EDGE_TYPES = ['governance','employment','jurisdiction','institutional_pipeline','political','education','oversight','structural_proximity','family','board_membership'];

  // ═══ DECK STATE ═══
  var _hand = [];
  var _mana = PI_INV + 0.08;
  var _maxHand = 7;
  var _drawCount = 0;
  var _playLog = [];
  var _feedCache = { human:null, scan:null, topology:null, braid:null, dashboard:null };

  // ═══ DECK BUILDER — draws from live feed data ═══

  function refreshFeeds() {
    return Promise.all([
      fetch('/human.json',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return null}),
      fetch('/scan_sweep_sort.json',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return null}),
      fetch('/topology.json',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return null}),
      fetch('/braid.json',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return null}),
      fetch('/dashboard.json',{cache:'no-store'}).then(function(r){return r.json()}).catch(function(){return null}),
    ]).then(function(res) {
      _feedCache.human = res[0];
      _feedCache.scan = res[1];
      _feedCache.topology = res[2];
      _feedCache.braid = res[3];
      _feedCache.dashboard = res[4];
      return _feedCache;
    });
  }

  function _buildAvailablePool() {
    var pool = [];

    // Epitope cards — weighted by live count
    var h = _feedCache.human;
    if (h && h.epitopes) {
      Object.keys(h.epitopes).forEach(function(key) {
        var card = EPITOPE_CARDS[key];
        if (!card) return;
        var ep = h.epitopes[key];
        var count = (typeof ep === 'number') ? ep : (ep.count || ep.sessions || 1);
        var liveCard = Object.assign({}, card, { id: 'ep-' + key, liveCount: count, liveSessions: count });
        for (var i = 0; i < Math.min(3, Math.ceil(count / 5)); i++) pool.push(liveCard);
      });
    }

    // Surface cards — always available
    Object.keys(SURFACE_CARDS).forEach(function(key) {
      pool.push(Object.assign({}, SURFACE_CARDS[key], { id: 'sf-' + key, surfaceKey: key }));
    });

    // Ability cards — if gameplay has unlocked them
    var gp = window._cosmicGameplay;
    if (gp) {
      var discovered = gp.discoveries ? gp.discoveries() : [];
      Object.keys(ABILITY_CARDS).forEach(function(key) {
        var unlocked = discovered.indexOf('ability:' + ABILITY_CARDS[key].name) >= 0;
        if (unlocked || Math.random() < 0.3) {
          pool.push(Object.assign({}, ABILITY_CARDS[key], { id: 'ab-' + key, abilityKey: key, unlocked: unlocked }));
        }
      });
    } else {
      Object.keys(ABILITY_CARDS).forEach(function(key) {
        if (Math.random() < 0.4) pool.push(Object.assign({}, ABILITY_CARDS[key], { id: 'ab-' + key, abilityKey: key }));
      });
    }

    // Fleet cards — from live topology
    var topo = _feedCache.topology;
    if (topo && topo.entities) {
      topo.entities.forEach(function(ent) {
        Object.keys(FLEET_CARDS).forEach(function(key) {
          var fc = FLEET_CARDS[key];
          if (fc.entity && fc.entity === ent.entity) {
            pool.push(Object.assign({}, fc, {
              id: 'fl-' + key,
              liveRequests: ent.total_requests,
              liveIPs: ent.unique_ips,
              liveHonest: ent.is_honest,
            }));
          }
        });
      });
    }
    // Anderson mode fleet cards
    var dash = _feedCache.dashboard;
    if (dash && dash.anderson_modes) {
      // already via scan
    }
    var scan = _feedCache.scan;
    if (scan && scan.scan && scan.scan.anderson_modes) {
      Object.keys(scan.scan.anderson_modes).forEach(function(mode) {
        var fc = FLEET_CARDS[mode];
        if (fc) {
          pool.push(Object.assign({}, fc, { id: 'fl-' + mode, liveCount: scan.scan.anderson_modes[mode] }));
        }
      });
    }

    return pool;
  }

  function draw(count) {
    count = count || 1;
    var pool = _buildAvailablePool();
    if (pool.length === 0) return [];

    var drawn = [];
    for (var i = 0; i < count; i++) {
      if (_hand.length >= _maxHand) break;
      var idx = Math.floor(Math.random() * pool.length);
      var card = Object.assign({}, pool[idx], { drawnAt: Date.now() });
      _hand.push(card);
      drawn.push(card);
      _drawCount++;
    }

    if (window._signalRelay) {
      window._signalRelay.send('card_draw', { count: drawn.length, cards: drawn.map(function(c) { return c.id; }) });
    }
    return drawn;
  }

  function play(cardIndex) {
    if (cardIndex < 0 || cardIndex >= _hand.length) return null;
    var card = _hand.splice(cardIndex, 1)[0];

    // Check mana cost
    var cost = card.cost || 0;
    if (card.type === 'surface') cost = 2;
    if (card.type === 'epitope') cost = 1;
    if (card.type === 'fleet') cost = 0;

    if (_mana < cost * 0.1) return { error: 'not enough mana', card: card, mana: _mana, cost: cost * 0.1 };

    _mana = Math.max(0, _mana - cost * 0.1);

    var result = { card: card, mana: _mana, effect: null };

    // Resolve card effect
    if (card.type === 'surface' && window._cosmicStrategy) {
      result.effect = window._cosmicStrategy.claimTerritory(card.surfaceKey);
    }
    if (card.type === 'ability' && window._cosmicGameplay) {
      window._cosmicGameplay.act('ability ' + card.abilityKey);
      result.effect = 'ability activated: ' + card.name;
    }
    if (card.type === 'epitope') {
      result.effect = 'deployed ' + card.name + ' (P/T ' + card.power + '/' + card.toughness + ')';
    }

    _playLog.push({ ts: Date.now(), card: card.id, type: card.type, effect: result.effect });

    if (window._signalRelay) {
      window._signalRelay.send('card_play', { card: card.id, type: card.type, effect: result.effect });
    }
    return result;
  }

  function updateMana(energy) {
    _mana = energy || _mana;
  }

  // ═══ CARD RENDERING ═══

  function cardLine(card) {
    var rarityMark = { common:'', uncommon:'\u2605', rare:'\u2605\u2605', mythic:'\u2605\u2605\u2605', legendary:'\u2606\u2606\u2606', boss:'\ud83d\udc80' };
    var mark = rarityMark[card.rarity] || '';
    var pt = (card.power !== undefined) ? ' ' + card.power + '/' + card.toughness : '';
    var costStr = card.cost ? ' (' + card.cost + ')' : '';
    var flavorPip = '';
    if (window._cosmicFlavor) {
      var s = window._cosmicFlavor.cardStrangeness(card);
      flavorPip = '<span style="color:' + window._cosmicFlavor.flavorHex(s) + '">\u25cf</span> ';
    }
    return flavorPip + '<span style="color:' + (card.color || '#8b949e') + '">' + (card.icon || '') + card.name + '</span>' +
      pt + costStr + ' ' + mark + ' <span class="dim">[' + card.type + ']</span>';
  }

  function handView() {
    if (_hand.length === 0) return 'Hand is empty. Use /draw to draw cards from live data.';
    var lines = ['<span style="color:#f0e68c">YOUR HAND</span> (' + _hand.length + '/' + _maxHand + ') mana: ' + _mana.toFixed(2)];
    _hand.forEach(function(c, i) {
      lines.push('  [' + i + '] ' + cardLine(c));
    });
    return lines.join('\n');
  }

  function allCardsView() {
    var lines = ['<span style="color:#f0e68c">CARD TYPES</span>'];
    lines.push('\n<span style="color:#58a6ff">EPITOPE CARDS</span> (allied units)');
    Object.keys(EPITOPE_CARDS).forEach(function(k) { lines.push('  ' + cardLine(EPITOPE_CARDS[k]) + '\n    ' + EPITOPE_CARDS[k].ability); });
    lines.push('\n<span style="color:#3fb950">SURFACE CARDS</span> (territories)');
    Object.keys(SURFACE_CARDS).forEach(function(k) { lines.push('  ' + cardLine(SURFACE_CARDS[k]) + '\n    ' + SURFACE_CARDS[k].ability); });
    lines.push('\n<span style="color:#bc8cff">ABILITY CARDS</span> (spells)');
    Object.keys(ABILITY_CARDS).forEach(function(k) { lines.push('  ' + cardLine(ABILITY_CARDS[k]) + '\n    ' + ABILITY_CARDS[k].ability); });
    lines.push('\n<span style="color:#f85149">FLEET CARDS</span> (enemy forces)');
    Object.keys(FLEET_CARDS).forEach(function(k) { lines.push('  ' + cardLine(FLEET_CARDS[k]) + '\n    ' + FLEET_CARDS[k].ability); });
    return lines.join('\n');
  }

  // ═══ KLEIN FACE — every card has two sides that are the same surface ═══
  //
  // Mendeleev sorted CARDS on a flat desk → periodic table.
  // Tarot: 78 cards. Playing: 52 cards. I Ching: 64 hexagrams. Elements: 118.
  // All flat. All 2D. All reveal depth from a plane.
  //
  // A normal card: face | back (observer sees ONE side).
  // A quantum card: face AND back (superposition, collapses on observation).
  // A Klein card: face IS back (both sides always visible, no collapse).
  //
  // The 404 IS a Klein card:
  //   face = berry text, routes, welcome (visitor sees)
  //   back = ntfy probe, signal, classification (we see)
  //   same event. same surface. no collapse.
  //
  // The tangent at any point = the local gradient.
  // The reflection = you see IN from OUT and OUT from IN.
  // 1D plane (no thickness) + descent to tangent = differential geometry
  // on a non-orientable surface.

  var KLEIN_DECK = {
    mendeleev:  { cards: 118, name: 'Periodic Table',  sorted_by: 'atomic mass → periodicity', face: 'element', back: 'electron configuration', surface: 'non-orientable: chemical properties repeat across periods' },
    playing:    { cards: 52,  name: 'Playing Cards',    sorted_by: 'suit × rank → probability', face: 'pip/face', back: 'uniform pattern',       surface: 'non-orientable: any card could be any card until flipped' },
    tarot:      { cards: 78,  name: 'Tarot',            sorted_by: 'major arcana + 4 suits',    face: 'image',    back: 'uniform pattern',       surface: 'non-orientable: the reader sees what the querent cannot' },
    iching:     { cards: 64,  name: 'I Ching',          sorted_by: 'binary trigram × trigram',   face: 'hexagram', back: 'commentary',            surface: 'non-orientable: the oracle IS the question' },
    membrane:   { cards: null, name: 'Membrane Cards',  sorted_by: 'live feed data',            face: 'card text', back: 'ntfy probe signal',    surface: 'non-orientable: visitor sees face, we see back, same event' },
  };

  function kleinFace(card) {
    var face = cardLine(card);
    var back = '';

    if (card.type === 'epitope') {
      back = 'ntfy signal: human epitope ' + (card.name || '?') + ' · sessions: ' + (card.liveSessions || '?');
    } else if (card.type === 'surface') {
      back = 'ntfy signal: surface ' + (card.surfaceKey || '?') + ' · planet: ' + (card.planet || '?');
    } else if (card.type === 'ability') {
      back = 'ntfy signal: ability activated · cost: ' + (card.cost || 0) + ' mana';
    } else if (card.type === 'fleet') {
      back = 'ntfy signal: fleet ' + (card.name || '?') + ' · IPs: ' + (card.liveIPs || '?') + ' · honest: ' + (card.liveHonest || '?');
    }

    return {
      face: face,
      back: back,
      klein: face + ' ⟷ ' + back,
      tangent: 'gradient: ' + card.type + ' → ' + (card.rarity || 'common'),
      orientable: false
    };
  }

  function kleinDeckView() {
    var lines = ['<span style="color:#d29922">KLEIN FACE — THE CARD IS THE SURFACE</span>'];
    lines.push('paper is desk is flat is cards. both sides in view. no collapse.\n');
    Object.keys(KLEIN_DECK).forEach(function(k) {
      var d = KLEIN_DECK[k];
      lines.push('<span style="color:#f0e68c">' + d.name + '</span> (' + (d.cards || '∞') + ' cards)');
      lines.push('  sorted by: ' + d.sorted_by);
      lines.push('  face: ' + d.face + ' · back: ' + d.back);
      lines.push('  ' + d.surface);
      lines.push('');
    });
    if (_hand.length > 0) {
      lines.push('<span style="color:#58a6ff">YOUR HAND — KLEIN VIEW</span>');
      _hand.forEach(function(c, i) {
        var kf = kleinFace(c);
        lines.push('  [' + i + '] ' + kf.klein);
        lines.push('        tangent: ' + kf.tangent);
      });
    }
    return lines.join('\n');
  }

  // ═══ EXPORT ═══

  window._cosmicCards = {
    draw: draw,
    play: play,
    hand: function() { return _hand; },
    handView: handView,
    allCardsView: allCardsView,
    cardLine: cardLine,
    updateMana: updateMana,
    refreshFeeds: refreshFeeds,
    mana: function() { return _mana; },
    drawCount: function() { return _drawCount; },
    playLog: function() { return _playLog; },
    EPITOPE_CARDS: EPITOPE_CARDS,
    SURFACE_CARDS: SURFACE_CARDS,
    ABILITY_CARDS: ABILITY_CARDS,
    FLEET_CARDS: FLEET_CARDS,
    SORT_COLORS: SORT_COLORS,
    KLEIN_DECK: KLEIN_DECK,
    kleinFace: kleinFace,
    kleinDeckView: kleinDeckView,
  };
})();
