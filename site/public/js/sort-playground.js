// sort-playground.js v1 — the inverted playground
// chipmunk looks in at entities and sorts. humans watch, learn, assist.
// humans get suggestions. humans make suggestions back.
// confidence 83.3% → target 85%. 214 entities need help (114 partial + 100 null).
(function() {
  'use strict';

  // ═══ ENTITIES NEEDING HELP — from the investigation ═══
  // Chipmunk presents these one at a time. Humans vote.
  var ENTITIES = [
    // Null layer — 100 entities, classifiers couldn't decide
    { id: 'dykema', name: 'Dykema Gossett', edges: 317, current: 'null', confidence: 0.0,
      desc: 'the law firm that wrote Michigan\'s charter school law in 1993.',
      why: '317 edges. they drafted the legal framework. everywhere but nowhere.',
      question: 'is a law firm that writes the law self, non-self, or something else?',
      methods: ['cascade_null'], connections: ['banks', 'charter_schools', 'michigan_legislature'] },
    { id: 'plante_moran', name: 'Plante Moran', edges: 1287, current: 'null', confidence: 0.0,
      desc: 'the accounting firm. audited everything. most connected null entity.',
      why: '1,287 edges \u2014 the most connected entity in the null layer.',
      question: 'can you classify an auditor who touches everything?',
      methods: ['cascade_null'], connections: ['banks', 'schools', 'foundations', 'government'] },
    { id: 'walton_family_foundation', name: 'Walton Family Foundation', edges: 188, current: 'null', confidence: 0.593,
      desc: 'walmart heirs funding education reform. 188 edges.',
      why: '59.3% confidence. the evidence points but doesn\u2019t resolve.',
      question: 'the walton family funds charter school expansion across the country. funder or actor?',
      methods: ['phase3_institution'], connections: ['charter_schools', 'policy', 'education_reform'] },
    { id: 'the_74', name: 'The 74', edges: 142, current: 'null', confidence: 0.0,
      desc: 'education news outlet. covers charter school expansion.',
      why: '142 edges. it covers the story. is it part of the story?',
      question: 'an education news outlet funded by reform advocates. reporter or participant?',
      methods: ['cascade_null'], connections: ['devos', 'charter_schools', 'education_media'] },
    { id: 'barton_malow', name: 'Barton Malow', edges: 215, current: 'null', confidence: 0.0,
      desc: 'construction company. builds the buildings schools go in.',
      why: '215 edges. deeply connected to the physical infrastructure.',
      question: 'who builds the buildings? construction follows the money.',
      methods: ['cascade_null'], connections: ['schools', 'construction', 'contracts'] },
    { id: 'naacp_detroit', name: 'NAACP Detroit', edges: 140, current: 'null', confidence: 0.0,
      desc: 'detroit chapter of the NAACP. civil rights angle.',
      why: '140 edges. the investigation touches civil rights. which side?',
      question: 'NAACP sued to stop school closures. ally or institution?',
      methods: ['cascade_null'], connections: ['civil_rights', 'schools', 'community'] },
    { id: 'roland_martin', name: 'Roland Martin', edges: 159, current: 'null', confidence: 0.0,
      desc: 'journalist. covering the story from inside.',
      why: '159 edges. is he observing the system or participating in it?',
      question: 'a journalist who covers education reform deeply. observer or actor?',
      methods: ['cascade_null'], connections: ['media', 'charter_schools', 'advocacy'] },
    { id: 'purpose_foundation', name: 'Purpose Foundation', edges: 222, current: 'null', confidence: 0.0,
      desc: 'governance entity. 222 edges.',
      why: 'purpose foundation. what purpose? whose purpose?',
      question: 'a foundation with a generic name and 222 connections. what does it do?',
      methods: ['cascade_null'], connections: ['governance', 'charter_schools', 'funding'] },

    // More null entities
    { id: 'great_lakes_education', name: 'Great Lakes Education Project', edges: 198, current: 'null', confidence: 0.0,
      desc: 'devos-funded lobbying group for school choice in michigan.',
      why: '198 edges. political advocacy entity. who do they serve?',
      question: 'a lobbying group funded by billionaires pushing school policy. advocacy or capture?',
      methods: ['cascade_null', 'banks_governance'], connections: ['devos', 'charter_schools', 'legislature'] },
    { id: 'skillman_foundation', name: 'Skillman Foundation', edges: 176, current: 'null', confidence: 0.0,
      desc: 'detroit philanthropy focused on children and neighborhoods.',
      why: '176 edges. funded by auto industry wealth. giving back or steering?',
      question: 'a detroit foundation funding education. philanthropy or governance?',
      methods: ['cascade_null'], connections: ['detroit', 'schools', 'community'] },
    { id: 'kresge_foundation', name: 'Kresge Foundation', edges: 164, current: 'null', confidence: 0.0,
      desc: 'major foundation. S.S. Kresge (Kmart). billions in assets.',
      why: '164 edges. old money. deep roots. what does it touch?',
      question: 'a hundred-year-old foundation reshaping detroit. infrastructure or influence?',
      methods: ['cascade_null', 'phase3_institution'], connections: ['detroit', 'urban_renewal', 'education'] },
    { id: 'michigan_authorizers', name: 'Michigan Council of Charter School Authorizers', edges: 132, current: 'null', confidence: 0.0,
      desc: 'the body that authorizes charter schools to exist.',
      why: '132 edges. they decide who opens a school. gatekeeper.',
      question: 'the authorizer authorizes. but who authorized the authorizer?',
      methods: ['cascade_null'], connections: ['charter_schools', 'oversight', 'accountability'] },
    { id: 'eli_broad', name: 'Eli Broad Foundation', edges: 155, current: 'null', confidence: 0.0,
      desc: 'broad foundation. superintendent training. charter expansion. national reach.',
      why: '155 edges. trains urban superintendents. shapes policy from the top.',
      question: 'training every superintendent in the country to think the same way. reform or control?',
      methods: ['cascade_null', 'phase3_institution'], connections: ['superintendents', 'charter_schools', 'national_policy'] },
    { id: 'national_heritage', name: 'National Heritage Academies', edges: 203, current: 'null', confidence: 0.12,
      desc: 'for-profit charter school operator. headquartered in Grand Rapids. 90+ schools.',
      why: '203 edges. for-profit education. J.C. Huizenga founded it.',
      question: 'a for-profit company running 90 schools. business or education?',
      methods: ['phase3_employed', 'cascade_null'], connections: ['charter_schools', 'profit', 'grand_rapids'] },

    // Partial layer — entities stuck in the wall
    { id: 'sheffield', name: 'Sheffield', edges: 141, current: 'partial', confidence: 0.45,
      desc: '141 edges. low confidence. the classifiers disagree.',
      why: 'the data says something but what? 45% confidence.',
      question: 'sheffield appears in multiple contexts. person? place? entity?',
      methods: ['phase3_employed', 'cascade_self'], connections: ['investigation', 'education'] },
    { id: 'kwame', name: 'Kwame Kilpatrick', edges: 140, current: 'partial', confidence: 0.5,
      desc: 'former detroit mayor. convicted. pardoned by trump.',
      why: '140 edges. too complex for 36 methods. political + criminal + pardoned.',
      question: 'convicted mayor, later pardoned. how do you classify power?',
      methods: ['banks_political', 'phase5_resolution'], connections: ['detroit', 'corruption', 'politics'] },
    { id: 'emergency_manager', name: 'Emergency Manager (Detroit)', edges: 189, current: 'partial', confidence: 0.55,
      desc: 'state-appointed ruler of detroit during bankruptcy. overrode elected officials.',
      why: '189 edges. 55% confidence. democracy suspended. who was in charge?',
      question: 'an unelected official who ran a city. governance or occupation?',
      methods: ['banks_governance', 'phase5_resolution'], connections: ['detroit', 'bankruptcy', 'state_control'] },
    { id: 'rock_ventures', name: 'Rock Ventures / Dan Gilbert', edges: 167, current: 'partial', confidence: 0.48,
      desc: 'quicken loans. dan gilbert. bought downtown detroit.',
      why: '167 edges. 48% confidence. revitalization or replacement?',
      question: 'a billionaire buying a city center. savior or landlord?',
      methods: ['phase3_employed', 'cascade_self'], connections: ['detroit', 'real_estate', 'quicken_loans'] },
    { id: 'eem', name: 'Education Achievement Authority', edges: 144, current: 'partial', confidence: 0.4,
      desc: 'state takeover of lowest-performing detroit schools. dissolved in 2017.',
      why: '144 edges. 40% confidence. it failed and was dissolved. what was it?',
      question: 'a state authority that took over schools, failed, and vanished. experiment or harm?',
      methods: ['banks_governance', 'phase3_institution'], connections: ['schools', 'state_control', 'failure'] },
  ];

  var _panel = null;
  var _currentIdx = 0;
  var _votes = {};  // entity_id → { vote: string, timestamp: number }
  var _active = false;
  var _addEntry = null;

  // ═══ SORT COLORS ═══
  var SORT_COLORS = {
    'self': '#3fb950',
    'non-self': '#f85149',
    'partial': '#d29922',
    'null': '#484f58',
    'skip': '#8b949e',
  };

  // ═══ BUILD THE PANEL ═══
  function createPanel() {
    if (_panel) return;
    _panel = document.createElement('div');
    _panel.id = 'sort-playground';
    _panel.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:50;' +
      'width:min(90vw,520px);max-height:80vh;overflow-y:auto;' +
      'background:rgba(13,17,23,0.96);backdrop-filter:blur(12px);' +
      'border:1px solid rgba(88,166,255,0.2);border-radius:12px;' +
      'font-family:monospace;color:#c9d1d9;padding:0;' +
      'box-shadow:0 0 40px rgba(0,0,0,0.6);';
    document.body.appendChild(_panel);
    window.addEventListener('keydown', onKey);
    renderEntity();
  }

  function onKey(e) {
    if (!_active) return;
    if (e.key === 'Escape') { deactivate(); return; }
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextEntity(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevEntity(); }
    // Number keys for voting
    if (e.key === '1') vote('self');
    if (e.key === '2') vote('non-self');
    if (e.key === '3') vote('partial');
    if (e.key === '4') vote('null');
    if (e.key === '0' || e.key === 's') vote('skip');
  }

  // ═══ RENDER CURRENT ENTITY ═══
  function renderEntity() {
    if (!_panel) return;
    var ent = ENTITIES[_currentIdx];
    var votedCount = Object.keys(_votes).length;
    var pctDone = Math.round(votedCount / ENTITIES.length * 100);

    var html = '';

    // Header
    html += '<div style="padding:12px 16px;border-bottom:1px solid rgba(33,38,45,0.8);display:flex;justify-content:space-between;align-items:center">';
    html += '<span style="color:#58a6ff;font-size:11px;font-weight:bold">\u{1F43F} sort playground</span>';
    html += '<span style="color:#484f58;font-size:9px">' + (_currentIdx + 1) + '/' + ENTITIES.length + ' \u00b7 ' + votedCount + ' voted \u00b7 ' + pctDone + '%</span>';
    html += '<span style="cursor:pointer;color:#484f58;font-size:14px" onclick="window._sortPlayground.deactivate()">\u2715</span>';
    html += '</div>';

    // Progress bar
    html += '<div style="height:2px;background:#161b22">';
    html += '<div style="height:2px;background:#58a6ff;width:' + ((_currentIdx + 1) / ENTITIES.length * 100) + '%;transition:width 0.3s"></div>';
    html += '</div>';

    // Entity card
    html += '<div style="padding:16px">';

    // Name + current classification
    var sortColor = SORT_COLORS[ent.current] || '#484f58';
    html += '<div style="font-size:18px;font-weight:bold;color:#e6edf3;margin-bottom:4px">' + ent.name + '</div>';
    html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">';
    html += '<span style="background:' + sortColor + '22;color:' + sortColor + ';padding:2px 8px;border-radius:8px;font-size:9px;border:1px solid ' + sortColor + '44">' + ent.current + '</span>';
    html += '<span style="color:#484f58;font-size:9px">' + ent.edges + ' edges \u00b7 ' + (ent.confidence * 100).toFixed(0) + '% confidence</span>';
    html += '</div>';

    // Description
    html += '<div style="color:#8b949e;font-size:11px;margin-bottom:8px">' + ent.desc + '</div>';

    // Why chipmunk is showing this
    html += '<div style="color:#d2a8ff;font-size:10px;margin-bottom:12px;font-style:italic">\u{1F43F} ' + ent.why + '</div>';

    // Connections
    if (ent.connections && ent.connections.length) {
      html += '<div style="margin-bottom:12px">';
      html += '<span style="color:#484f58;font-size:8px">connected to: </span>';
      ent.connections.forEach(function(c) {
        html += '<span style="background:rgba(88,166,255,0.08);color:#58a6ff;padding:1px 6px;border-radius:6px;font-size:9px;margin-right:4px">' + c + '</span>';
      });
      html += '</div>';
    }

    // Methods tried
    if (ent.methods && ent.methods.length) {
      html += '<div style="margin-bottom:16px">';
      html += '<span style="color:#484f58;font-size:8px">methods tried: </span>';
      ent.methods.forEach(function(m) {
        html += '<span style="color:#6e7681;font-size:9px;margin-right:6px">' + m + '</span>';
      });
      html += '</div>';
    }

    // The question
    html += '<div style="background:rgba(88,166,255,0.05);border:1px solid rgba(88,166,255,0.15);border-radius:8px;padding:12px;margin-bottom:16px">';
    html += '<div style="color:#c9d1d9;font-size:12px">' + ent.question + '</div>';
    html += '</div>';

    // Chipmunk's guess — what the machine leans toward
    var guess = ent.confidence > 0.5 ? 'self' : ent.confidence > 0.3 ? 'partial' : ent.edges > 200 ? 'partial' : 'null';
    html += '<div style="margin-bottom:10px;font-size:9px">';
    html += '<span style="color:#484f58">\u{1F43F} chipmunk leans: </span>';
    html += '<span style="color:' + (SORT_COLORS[guess] || '#484f58') + '">' + guess + '</span>';
    html += '<span style="color:#21262d"> \u2014 but i\u2019m not sure. that\u2019s why you\u2019re here.</span>';
    html += '</div>';

    // Vote buttons
    var existingVote = _votes[ent.id];
    html += '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">';
    ['self', 'non-self', 'partial', 'null', 'skip'].forEach(function(v, vi) {
      var c = SORT_COLORS[v];
      var isSelected = existingVote && existingVote.vote === v;
      var key = vi < 4 ? (vi + 1) : '0';
      html += '<button onclick="window._sortPlayground.vote(\'' + v + '\')" style="';
      html += 'background:' + (isSelected ? c + '33' : 'rgba(33,38,45,0.8)') + ';';
      html += 'border:1px solid ' + (isSelected ? c : c + '44') + ';';
      html += 'color:' + c + ';padding:6px 14px;border-radius:8px;cursor:pointer;';
      html += 'font-family:monospace;font-size:11px;transition:all 0.15s;';
      html += '">' + v + ' <span style="color:#484f58;font-size:8px">(' + key + ')</span></button>';
    });
    html += '</div>';

    // Human note input
    html += '<div style="display:flex;gap:4px;margin-bottom:12px">';
    html += '<input id="sort-note-input" type="text" placeholder="add a note about this entity\u2026" style="';
    html += 'flex:1;background:rgba(22,27,34,0.8);border:1px solid rgba(33,38,45,0.6);';
    html += 'color:#c9d1d9;padding:6px 10px;font-family:monospace;font-size:10px;';
    html += 'border-radius:8px;outline:none;" autocomplete="off">';
    html += '<button onclick="window._sortPlayground.sendNote()" style="';
    html += 'background:rgba(33,38,45,0.8);border:1px solid rgba(88,166,255,0.3);';
    html += 'color:#58a6ff;padding:6px 10px;border-radius:8px;cursor:pointer;';
    html += 'font-family:monospace;font-size:10px;">\u2192 send</button>';
    html += '</div>';

    html += '</div>';

    // Navigation
    html += '<div style="padding:8px 16px;border-top:1px solid rgba(33,38,45,0.8);display:flex;justify-content:space-between;align-items:center">';
    html += '<button onclick="window._sortPlayground.prev()" style="background:none;border:none;color:' + (_currentIdx > 0 ? '#8b949e' : '#21262d') + ';cursor:pointer;font-family:monospace;font-size:10px">\u2190 prev</button>';
    html += '<span style="color:#484f58;font-size:8px">\u2190/\u2192 navigate \u00b7 1-4 vote \u00b7 0 skip \u00b7 ESC close</span>';
    html += '<button onclick="window._sortPlayground.next()" style="background:none;border:none;color:#8b949e;cursor:pointer;font-family:monospace;font-size:10px">next \u2192</button>';
    html += '</div>';

    // Summary bar at bottom
    if (votedCount > 0) {
      var counts = { self: 0, 'non-self': 0, partial: 0, null: 0, skip: 0 };
      Object.keys(_votes).forEach(function(k) { counts[_votes[k].vote] = (counts[_votes[k].vote] || 0) + 1; });
      html += '<div style="padding:6px 16px;border-top:1px solid rgba(33,38,45,0.5);display:flex;gap:8px;font-size:8px">';
      ['self', 'non-self', 'partial', 'null', 'skip'].forEach(function(v) {
        if (counts[v] > 0) {
          html += '<span style="color:' + SORT_COLORS[v] + '">' + v + ':' + counts[v] + '</span>';
        }
      });
      html += '</div>';
    }

    _panel.innerHTML = html;

    // Focus note input on Enter in note field
    setTimeout(function() {
      var noteInput = document.getElementById('sort-note-input');
      if (noteInput) {
        noteInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') { e.preventDefault(); sendNote(); }
          e.stopPropagation(); // Don't trigger parent keyboard shortcuts
        });
      }
    }, 50);
  }

  // ═══ ACTIONS ═══
  function vote(classification) {
    var ent = ENTITIES[_currentIdx];
    _votes[ent.id] = { vote: classification, timestamp: Date.now() };

    // Send to chipmunk as a note
    if (_addEntry) {
      _addEntry('human', '<span style="color:' + (SORT_COLORS[classification] || '#8b949e') + '">\u25cf</span> ' +
        ent.name + ' \u2192 <b>' + classification + '</b>');
    }

    // Send to squirrel via the HUD touch endpoint
    sendToSquirrel('sort_vote', {
      entity: ent.id,
      name: ent.name,
      current: ent.current,
      vote: classification,
      confidence: ent.confidence,
      edges: ent.edges,
    });

    renderEntity();

    // Chipmunk learns — show an insight every few votes
    var votedCount = Object.keys(_votes).length;
    if (votedCount === 3 && _addEntry) {
      _addEntry('chipmunk', '<span class="dim">\u{1F43F} 3 votes in. i\u2019m starting to see your pattern. keep going.</span>');
    } else if (votedCount === 6 && _addEntry) {
      var counts = { self: 0, 'non-self': 0, partial: 0, 'null': 0, skip: 0 };
      Object.keys(_votes).forEach(function(k) { counts[_votes[k].vote] = (counts[_votes[k].vote] || 0) + 1; });
      var dominant = Object.keys(counts).reduce(function(a, b) { return counts[a] > counts[b] ? a : b; });
      _addEntry('chipmunk', '<span class="dim">\u{1F43F} you lean toward <b>' + dominant + '</b>. interesting. the classifiers couldn\u2019t decide \u2014 you can.</span>');
    } else if (votedCount === 10 && _addEntry) {
      _addEntry('chipmunk', '<span class="dim">\u{1F43F} 10 entities sorted. you\u2019re doing what 36 classification methods couldn\u2019t. human judgment fills the gap.</span>');
    } else if (votedCount === 15 && _addEntry) {
      _addEntry('chipmunk', '<span class="dim">\u{1F43F} 15. every vote pushes confidence from 83.3% toward 85%. the membrane learns from you.</span>');
    }

    // Auto-advance after a short delay
    setTimeout(function() {
      if (_currentIdx < ENTITIES.length - 1) nextEntity();
    }, 600);
  }

  function sendNote() {
    var noteInput = document.getElementById('sort-note-input');
    if (!noteInput || !noteInput.value.trim()) return;
    var note = noteInput.value.trim();
    var ent = ENTITIES[_currentIdx];

    if (_addEntry) {
      _addEntry('human', '<span style="color:#8b949e">\u270e</span> ' + ent.name + ': "' + note + '"');
    }

    sendToSquirrel('sort_note', {
      entity: ent.id,
      name: ent.name,
      note: note,
    });

    noteInput.value = '';
  }

  function sendToSquirrel(type, data) {
    // Send via the HUD's touch/signal endpoint
    var payload = { type: type, data: data, ts: Date.now() };
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/hud/signal/touch', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(payload));
    } catch(e) {}

    // Also store locally
    if (window._hudStash) {
      window._hudStash.addNote('sort:' + type + ':' + data.entity + ':' + (data.vote || data.note || ''), {});
    }
  }

  function nextEntity() {
    if (_currentIdx < ENTITIES.length - 1) { _currentIdx++; renderEntity(); }
  }

  function prevEntity() {
    if (_currentIdx > 0) { _currentIdx--; renderEntity(); }
  }

  // ═══ LIFECYCLE ═══
  function activate(addEntry, onDone) {
    if (_active) { deactivate(); return false; }
    _addEntry = addEntry;
    _active = true;
    _currentIdx = 0;
    createPanel();
    return true;
  }

  function deactivate() {
    _active = false;
    if (_panel) { _panel.remove(); _panel = null; }
    window.removeEventListener('keydown', onKey);

    var votedCount = Object.keys(_votes).length;
    if (votedCount > 0 && _addEntry) {
      var counts = { self: 0, 'non-self': 0, partial: 0, 'null': 0, skip: 0 };
      Object.keys(_votes).forEach(function(k) { counts[_votes[k].vote] = (counts[_votes[k].vote] || 0) + 1; });
      var parts = [];
      Object.keys(counts).forEach(function(v) { if (counts[v] > 0) parts.push(v + ':' + counts[v]); });
      _addEntry('chipmunk',
        '<span style="color:#3fb950">\u{1F43F}</span> you sorted ' + votedCount + '/' + ENTITIES.length + ' entities.\n' +
        '<span class="dim">' + parts.join(' \u00b7 ') + '</span>\n' +
        '<span class="dim">your votes were sent to squirrel. they help refine the sort.</span>\n' +
        '<span class="dim">confidence was 83.3% \u2014 every human observation pushes it toward 85%.</span>\n' +
        '<span class="dim">/playground to continue \u00b7 /explore [entity] to dig deeper</span>');
    }
  }

  function getSummary() {
    return {
      voted: Object.keys(_votes).length,
      total: ENTITIES.length,
      votes: JSON.parse(JSON.stringify(_votes)),
    };
  }

  window._sortPlayground = {
    activate: activate,
    deactivate: deactivate,
    isActive: function() { return _active; },
    vote: vote,
    sendNote: sendNote,
    next: nextEntity,
    prev: prevEntity,
    getSummary: getSummary,
    ENTITIES: ENTITIES,
  };
})();
