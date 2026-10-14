// cosmic-gameplay.js v2 — universal game engine for the membrane
// esotericWebb narrative + combat + cards + strategy + relay integration.
// Loaded after cosmic-surfaces.js, cosmic-cards.js, cosmic-strategy.js.
(function() {
  'use strict';

  var cv = window._cosmicView;
  var cs = window._cosmicSurfaces;
  if (!cv) { console.warn('cosmic-gameplay: no cosmic view'); return; }

  var STORE_KEY = 'cosmic-gameplay-v1';
  var PI = cv.PI;

  // ═══ PLAYER STATE ═══
  var _state = loadState();

  function loadState() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var s = JSON.parse(raw);
        if (s && s.version === 1) return s;
      }
    } catch(e) {}
    return {
      version: 1,
      layersExplored: {},
      surfacesVisited: {},
      passages: {},
      discoveries: [],
      scene: 'entrance',
      knowledge: [],
      items: [],
      abilities: [],
      trust: {},
      flags: {},
      totalZooms: 0,
      sessionStart: Date.now(),
      combatWins: 0,
      combatLosses: 0,
      cardsDrawn: 0,
      cardsPlayed: 0,
      territoriesClaimed: 0,
    };
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(_state)); } catch(e) {}
  }

  // ═══ ESOTERIC WEBB SCENES ═══

  var SCENES = {
    entrance: {
      id:'entrance', type:'exploration',
      desc:'The door to The Weaver\'s Parlor stands before you \u2014 oak and iron, older than the building around it. Through the glass, antique curiosities crowd every surface. A bell chimes as you enter.',
      npcs:['vale'],
      exits:[{target:'parlor', label:'Enter the parlor'}, {target:'study', label:'Go to the study'}],
    },
    parlor: {
      id:'parlor', type:'dialogue',
      desc:'The main parlor is a maze of display cases and shelving. Maren Ashworth arranges items behind the counter. Tobias Crane examines a pocket watch through a jeweler\'s loupe, his hands not quite steady.',
      npcs:['maren','tobias'],
      exits:[{target:'entrance', label:'Return to entrance'}, {target:'backroom', label:'Slip into the backroom'}, {target:'study', label:'Head to the study'}],
    },
    study: {
      id:'study', type:'investigation',
      desc:'The study is lined with books. A desk sits beneath a window, papers scattered across it. Something about the bookshelf on the east wall draws your eye. Aldric Voss sits in a worn armchair.',
      npcs:['aldric'],
      exits:[{target:'entrance', label:'Return to entrance'}, {target:'parlor', label:'Go to the parlor'}, {target:'library', label:'Find the hidden passage', requires:'hidden_passage'}],
    },
    backroom: {
      id:'backroom', type:'exploration',
      desc:'Storage and overflow \u2014 crates, wrapped paintings, furniture under dust cloths. The air is cooler here, and sounds from the parlor are muffled.',
      npcs:[],
      exits:[{target:'parlor', label:'Return to parlor'}, {target:'vault', label:'Unlock the vault', requires:'master_key'}],
    },
    library: {
      id:'library', type:'investigation',
      desc:'Behind the bookshelf, a narrow passage opens into a room that shouldn\'t exist \u2014 too large for the building\'s footprint. Shelves reach to the ceiling, filled with texts on sigil work, binding theory, and names of power.',
      npcs:[],
      exits:[{target:'study', label:'Return to study'}, {target:'ritual_chamber', label:'Enter the ritual chamber'}],
      grants:'ritual_history',
    },
    vault: {
      id:'vault', type:'investigation',
      desc:'The vault is small and cold. Ledgers, a lockbox (open, emptied), and on a velvet cloth \u2014 an obsidian lens, perfectly ground, catching light that isn\'t there.',
      npcs:[],
      exits:[{target:'backroom', label:'Return to backroom'}],
      grantsItem:'obsidian_lens', grants:'financial_records',
    },
    ritual_chamber: {
      id:'ritual_chamber', type:'dialogue',
      desc:'The deepest room. A circle is inscribed on the floor \u2014 not paint, but something scored into the stone itself. Elara Voss stands at its edge, her expression unreadable. The air hums.',
      npcs:['elara'],
      exits:[{target:'library', label:'Return to library'}],
    },
  };

  var NPCS = {
    vale:   { name:'Inspector Vale', role:'detective', color:'#58a6ff', power:3, toughness:4 },
    maren:  { name:'Maren Ashworth', role:'shopkeeper', color:'#3fb950', power:1, toughness:3 },
    tobias: { name:'Tobias Crane', role:'appraiser', color:'#f0e68c', power:2, toughness:2 },
    aldric: { name:'Aldric Voss', role:'antiquarian', color:'#d29922', power:2, toughness:3 },
    elara:  { name:'Elara Voss', role:'occult researcher', color:'#a371f7', power:4, toughness:5 },
    ghost:  { name:'The Presence', role:'unknown', color:'#8b949e', power:5, toughness:1 },
  };

  var ABILITIES = [
    { id:'read_aura', name:'Read Aura', desc:'Perceive emotional state and hidden intentions.', icon:'\ud83d\udd2e' },
    { id:'sense_deception', name:'Sense Deception', desc:'Detect active lies.', icon:'\ud83d\udc41' },
    { id:'invoke_pattern', name:'Invoke Pattern', desc:'Reveal hidden connections between objects, people, and events.', icon:'\ud83d\udd17' },
    { id:'compel_truth', name:'Compel Truth', desc:'Force momentary honesty.', icon:'\u26a1' },
    { id:'empathic_bridge', name:'Empathic Bridge', desc:'Feel an NPC\'s emotions directly.', icon:'\ud83c\udf09' },
    { id:'reconstruct_memory', name:'Reconstruct Memory', desc:'See echoes of past events in a location.', icon:'\u231b' },
    { id:'commune_with_object', name:'Commune with Object', desc:'Read psychometric impressions from a touched object.', icon:'\u270b' },
    { id:'break_ward', name:'Break Ward', desc:'Dispel protective magic by reading its sigil structure.', icon:'\ud83d\udee1' },
  ];

  // ═══ SCENE NAVIGATION ═══

  function currentScene() { return SCENES[_state.scene] || SCENES.entrance; }

  function goToScene(sceneId) {
    var scene = SCENES[sceneId];
    if (!scene) return null;
    _state.scene = sceneId;
    if (scene.grants && _state.knowledge.indexOf(scene.grants) === -1) {
      _state.knowledge.push(scene.grants);
      addDiscovery('knowledge', scene.grants);
    }
    if (scene.grantsItem && _state.items.indexOf(scene.grantsItem) === -1) {
      _state.items.push(scene.grantsItem);
      addDiscovery('item', scene.grantsItem);
    }
    saveState();
    if (window._signalRelay) {
      window._signalRelay.send('scene_transition', { from: _state.scene, to: sceneId });
    }
    return scene;
  }

  function sceneExits() {
    var scene = currentScene();
    return scene.exits.filter(function(exit) {
      if (!exit.requires) return true;
      return _state.knowledge.indexOf(exit.requires) >= 0 ||
             _state.items.indexOf(exit.requires) >= 0 ||
             _state.flags[exit.requires];
    });
  }

  function act(action, target) {
    if (action === 'go' || action === 'move') {
      var exits = sceneExits();
      var match = exits.filter(function(e) { return e.target === target; })[0];
      if (match) return goToScene(target);
      return null;
    }
    if (action === 'talk' && target) {
      var scene = currentScene();
      if (scene.npcs.indexOf(target) >= 0) {
        var npc = NPCS[target];
        if (!_state.trust[target]) _state.trust[target] = 0;
        _state.trust[target]++;
        saveState();
        if (window._signalRelay) {
          window._signalRelay.send('npc_interaction', { npc: target, trust: _state.trust[target] });
        }
        return { npc: npc, trust: _state.trust[target] };
      }
      return null;
    }
    if (action === 'ability' && target) {
      var ab = ABILITIES.filter(function(a) { return a.id === target; })[0];
      if (ab && _state.abilities.indexOf(target) === -1) {
        _state.abilities.push(target);
        addDiscovery('ability', ab.name);
        saveState();
        if (window._signalRelay) {
          window._signalRelay.send('ability_unlock', { ability: target, name: ab.name });
        }
      }
      return ab || null;
    }
    return null;
  }

  function renderScene() {
    var scene = currentScene();
    var lines = [];
    var typeIcon = { exploration:'\ud83d\udccd', dialogue:'\ud83d\udde3', investigation:'\ud83d\udd0d' }[scene.type] || '\u25cb';
    lines.push('<b>' + typeIcon + ' ' + scene.id.replace(/_/g, ' ').toUpperCase() + '</b>');
    lines.push('<span style="color:#c9d1d9;font-style:italic">' + scene.desc + '</span>');

    if (scene.npcs.length > 0) {
      var npcLine = scene.npcs.map(function(nid) {
        var npc = NPCS[nid];
        var trust = _state.trust[nid] || 0;
        return '<span style="color:' + npc.color + '">' + npc.name + '</span> (' + npc.role + ', trust ' + trust + ', P/T ' + npc.power + '/' + npc.toughness + ')';
      }).join(' \u00b7 ');
      lines.push('NPCs: ' + npcLine);
    }

    var exits = sceneExits();
    if (exits.length > 0) {
      lines.push('');
      lines.push('<span class="dim">Exits:</span>');
      exits.forEach(function(ex) {
        lines.push('  <span style="color:#58a6ff;cursor:pointer" onclick="if(window._cosmicGameplay)window._cosmicGameplay.act(\'go\',\'' + ex.target + '\')">\u2192 ' + ex.label + '</span>');
      });
    }

    return lines.join('\n');
  }

  // ═══ COMBAT SYSTEM ═══

  function engageCombat(playerCard, enemyCard) {
    if (!playerCard || !enemyCard) return null;

    var result = null;
    if (window._cosmicStrategy) {
      result = window._cosmicStrategy.combatResolve(playerCard, enemyCard);
    } else {
      var strangeBonus = 0;
      if (window._cosmicFlavor) {
        var eStrange = window._cosmicFlavor.cardStrangeness(enemyCard);
        strangeBonus = eStrange * 2;
      }
      var aRoll = Math.random() * (playerCard.power || 1) + (playerCard.power || 1) * 0.5;
      var dRoll = Math.random() * (enemyCard.toughness || 1) + (enemyCard.toughness || 1) * 0.5 + strangeBonus;
      result = {
        attacker: playerCard.name, defender: enemyCard.name,
        attackRoll: aRoll, defendRoll: dRoll,
        winner: aRoll > dRoll ? 'attacker' : 'defender',
        damage: Math.abs(aRoll - dRoll),
      };
      result.msg = result.winner === 'attacker' ?
        playerCard.name + ' defeats ' + enemyCard.name :
        enemyCard.name + ' holds against ' + playerCard.name;
    }

    if (result.winner === 'attacker') {
      _state.combatWins++;
      addDiscovery('combat', 'Defeated ' + enemyCard.name);
    } else {
      _state.combatLosses++;
    }
    saveState();

    if (window._signalRelay) {
      window._signalRelay.send('combat', {
        attacker: playerCard.name, defender: enemyCard.name,
        winner: result.winner, damage: result.damage,
      });
    }
    return result;
  }

  // ═══ CARD-TRIGGERED ENCOUNTERS ═══

  function encounterFromCard(card) {
    if (card.type === 'surface') {
      var surf = card.surfaceKey;
      if (surf && window._cosmicStrategy) {
        return window._cosmicStrategy.claimTerritory(surf);
      }
    }
    if (card.type === 'ability') {
      return act('ability', card.abilityKey);
    }
    if (card.type === 'fleet') {
      var playerCards = window._cosmicCards ? window._cosmicCards.hand() : [];
      var defender = playerCards.filter(function(c) { return c.type === 'epitope'; })[0];
      if (defender) {
        return engageCombat(defender, card);
      }
      return { msg: 'No allied units to defend! Draw epitope cards.' };
    }
    if (card.type === 'epitope') {
      return { msg: 'Deployed ' + card.name + ' (P/T ' + card.power + '/' + card.toughness + ')' };
    }
    return null;
  }

  // ═══ DISCOVERY SYSTEM ═══

  function addDiscovery(type, detail) {
    _state.discoveries.push({ type:type, detail:detail, ts:Date.now() });
    if (_state.discoveries.length > 200) _state.discoveries = _state.discoveries.slice(-100);
    saveState();
    if (window._signalRelay) {
      window._signalRelay.send('discovery', { type: type, detail: detail });
    }
  }

  function discoveries() { return _state.discoveries; }
  function discoveryCount() { return _state.discoveries.length; }

  function discoveryLines() {
    if (_state.discoveries.length === 0) return 'no discoveries yet. explore the cosmos.';
    var lines = ['<b>\ud83c\udf1f DISCOVERIES</b> (' + _state.discoveries.length + ' total)'];
    var recent = _state.discoveries.slice(-8);
    recent.forEach(function(d) {
      var typeIcon = {
        layer:'\ud83c\udf0c', surface:'\ud83c\udf10', passage:'\u2550',
        knowledge:'\ud83d\udcd6', item:'\ud83d\udd11', ability:'\ud83d\udd2e',
        braid:'\u2261', milestone:'\u2606', combat:'\u2694',
      }[d.type] || '\u25cb';
      var ago = Math.round((Date.now() - d.ts) / 60000);
      lines.push(typeIcon + ' <span style="color:#f0e68c">' + d.type + '</span>: ' + d.detail +
        ' <span class="dim">(' + (ago < 1 ? 'just now' : ago + 'm ago') + ')</span>');
    });
    lines.push('<span class="dim">' + Object.keys(_state.layersExplored).length + '/6 layers \u00b7 ' +
      Object.keys(_state.surfacesVisited).length + '/11 surfaces \u00b7 ' +
      _state.knowledge.length + ' knowledge \u00b7 ' + _state.items.length + ' items \u00b7 ' +
      _state.abilities.length + '/8 abilities \u00b7 ' +
      _state.combatWins + 'W/' + _state.combatLosses + 'L combat</span>');
    return lines.join('\n');
  }

  // ═══ ZOOM-TRIGGERED EVENTS ═══

  var LAYER_NAMES = ['observable universe','milky way','solar system','earth + moon','membrane','chipmunk'];

  cv.onZoom(function(z) {
    _state.totalZooms++;
    if (!_state.layersExplored[z]) {
      _state.layersExplored[z] = Date.now();
      addDiscovery('layer', LAYER_NAMES[z] || 'layer ' + z);
    }
    saveState();
  });

  // ═══ SURFACE VISIT TRACKING ═══

  function onSurfaceVisit(surfaceName) {
    if (!_state.surfacesVisited[surfaceName]) {
      _state.surfacesVisited[surfaceName] = Date.now();
      addDiscovery('surface', surfaceName);
      _state.territoriesClaimed++;
    }
    if (cs) {
      var surf = cs.getSurface(surfaceName);
      if (surf && surf.braids) {
        var visited = Object.keys(_state.surfacesVisited);
        surf.braids.forEach(function(b) {
          var key = b.from + '>' + b.to;
          if (!_state.passages[key]) {
            var otherCat = b.from === surf.cat ? b.to : b.from;
            var otherSurfaces = visited.filter(function(v) {
              var vs = cs.getSurface(v);
              return vs && vs.cat === otherCat;
            });
            if (otherSurfaces.length > 0) {
              _state.passages[key] = Date.now();
              addDiscovery('passage', b.from + ' \u2192 ' + b.to);
            }
          }
        });
      }
    }
    saveState();
  }

  // ═══ GATE STATUS ═══

  function gateStatus() {
    var lines = ['<b>\u2699 GATE MESH</b>'];
    var gates = [
      { name:'eastGate', ip:'.5', role:'overwatch, songbird', status:'online' },
      { name:'golgiBody', ip:'.1', role:'VPS relay, 11 peers', status:'online' },
      { name:'sporeGate', ip:'.2', role:'inner membrane, songbird', status:'online' },
      { name:'northGate', ip:'.8', role:'RTX 5090, classification', status:'online' },
      { name:'biomeGate', ip:'.3', role:'House 1', status:'stale' },
      { name:'ironGate', ip:'.7', role:'House 2', status:'stale' },
    ];
    gates.forEach(function(g) {
      var icon = g.status === 'online' ? '\ud83d\udfe2' : '\ud83d\udfe1';
      lines.push(icon + ' <span style="color:' + (g.status==='online'?'#3fb950':'#f0883e') + '">' +
        g.name + '</span> ' + g.ip + ' \u2014 ' + g.role);
    });
    lines.push('<span class="dim">4 online \u00b7 2 stale \u00b7 6 offline</span>');
    return lines.join('\n');
  }

  // ═══ FULL STATE ═══

  function stateSummary() {
    var explored = Object.keys(_state.layersExplored).length;
    var visited = Object.keys(_state.surfacesVisited).length;
    var passages = Object.keys(_state.passages).length;
    return {
      layers: explored, totalLayers: 6,
      surfaces: visited, totalSurfaces: 11,
      passages: passages,
      discoveries: _state.discoveries.length,
      scene: _state.scene,
      knowledge: _state.knowledge.length,
      items: _state.items.length,
      abilities: _state.abilities.length,
      zooms: _state.totalZooms,
      combatWins: _state.combatWins,
      combatLosses: _state.combatLosses,
      cardsDrawn: _state.cardsDrawn,
      cardsPlayed: _state.cardsPlayed,
      territoriesClaimed: _state.territoriesClaimed,
    };
  }

  // ═══ EXPORT ═══

  window._cosmicGameplay = {
    scene: currentScene,
    goToScene: goToScene,
    sceneExits: sceneExits,
    act: act,
    renderScene: renderScene,
    state: stateSummary,
    discoveries: discoveries,
    discoveryCount: discoveryCount,
    discoveryLines: discoveryLines,
    gateStatus: gateStatus,
    onSurfaceVisit: onSurfaceVisit,
    engageCombat: engageCombat,
    encounterFromCard: encounterFromCard,
    SCENES: SCENES,
    NPCS: NPCS,
    ABILITIES: ABILITIES,
  };
})();
