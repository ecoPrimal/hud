// braid-tracker.js — self-sovereign journey recorder + membrane widget
// Include on any primals.eco site. Records to localStorage only.
// No cookies. No server calls. No identity tracking.
// The braid lives on THEIR device. They own it.
//
// Three verbs: MARK (flag a page), SHOUT (invite others), SING (leave a note)
(function(){
'use strict';

var BRAID_KEY_PREFIX = 'eco_braid_';
var MARKS_KEY = 'eco_marks';
var SIGNAL_BASE = 'https://hud.primals.eco/braid/';

var EPITOPE_MAP = {
  'anderson':'PHYSICS','localization':'PHYSICS','permeability':'PHYSICS',
  'lattice':'PHYSICS','qcd':'PHYSICS','hofstadter':'PHYSICS','quantum':'PHYSICS',
  'spectral':'PHYSICS','negentropy':'PHYSICS',
  'graph':'TOPOLOGY','topology':'TOPOLOGY','network':'TOPOLOGY','mesh':'TOPOLOGY',
  'braid':'TOPOLOGY','fractal':'TOPOLOGY',
  'philosophy':'PHILOSOPHY','omelas':'PHILOSOPHY','atlas':'PHILOSOPHY',
  'sovereignty':'PHILOSOPHY','commons':'PHILOSOPHY','bibliography':'PHILOSOPHY',
  'methodology':'METHOD','constrained':'METHOD','evolution':'METHOD',
  'guidestone':'METHOD','tufte':'METHOD','schell':'METHOD','ludo':'METHOD',
  'detroit':'INVESTIGATION','tuebor':'INVESTIGATION','public-record':'INVESTIGATION',
  'charter':'INVESTIGATION','institutional':'INVESTIGATION','gorilla':'INVESTIGATION',
  'membrane':'IMMUNE','immune':'IMMUNE','skunkbat':'IMMUNE','scatter':'IMMUNE',
  'antidote':'IMMUNE','non-newtonian':'IMMUNE',
  'science':'SCIENCE','biology':'SCIENCE','genomics':'SCIENCE','ferment':'SCIENCE',
  'signal':'SIGNAL','lossy':'SIGNAL','shannon':'SIGNAL','channel':'SIGNAL',
  'story':'SIGNAL','beacon':'SIGNAL','transit':'SIGNAL',
  'actors':'INVESTIGATION','judges':'INVESTIGATION','entities':'INVESTIGATION',
  'timeline':'INVESTIGATION','pacs':'INVESTIGATION','evidence':'INVESTIGATION',
  'investigation':'INVESTIGATION','pac':'INVESTIGATION','court':'INVESTIGATION',
  'bench':'INVESTIGATION','capture':'INVESTIGATION','corruption':'INVESTIGATION',
  'telecom':'INVESTIGATION','judicial':'INVESTIGATION','tenure':'INVESTIGATION',
  'docket':'INVESTIGATION','felony':'INVESTIGATION','conviction':'INVESTIGATION',
  'probation':'INVESTIGATION',
  'thesis':'PHILOSOPHY','hypothesis':'PHILOSOPHY','ethics':'PHILOSOPHY',
  'desk':'METHOD','play':'METHOD','study':'METHOD',
  'write':'METHOD','draw':'METHOD','create':'METHOD',
  'hud':'IMMUNE','biome':'IMMUNE','tower':'IMMUNE',
  'presence':'IMMUNE','observation':'IMMUNE','organism':'IMMUNE',
  'sporeprint':'SCIENCE','ethnography':'SCIENCE','data':'SCIENCE',
  'dashboard':'SIGNAL','billboard':'SIGNAL',
};

var EP_COLORS = {
  PHYSICS:'#58a6ff', TOPOLOGY:'#bc8cff', PHILOSOPHY:'#8b949e',
  METHOD:'#3fb950', INVESTIGATION:'#d29922', IMMUNE:'#f85149',
  SCIENCE:'#39d2c0', SIGNAL:'#79c0ff',
};

function classify(url) { return classifyText(url); }

function classifyText(text) {
  var l = text.toLowerCase(), found = {}, best = 'SIGNAL', bestN = 0;
  for (var kw in EPITOPE_MAP) {
    if (l.indexOf(kw) !== -1) found[EPITOPE_MAP[kw]] = (found[EPITOPE_MAP[kw]]||0) + 1;
  }
  for (var ep in found) { if (found[ep] > bestN) { best = ep; bestN = found[ep]; } }
  return best;
}

function classifyAllText(text) {
  var l = text.toLowerCase(), found = {};
  for (var kw in EPITOPE_MAP) {
    if (l.indexOf(kw) !== -1) found[EPITOPE_MAP[kw]] = (found[EPITOPE_MAP[kw]]||0) + 1;
  }
  return found;
}

// ═══ BRAID PERSISTENCE ═══
function findActiveBraid() {
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && key.indexOf(BRAID_KEY_PREFIX) === 0) {
        var raw = localStorage.getItem(key);
        if (raw) {
          var b = JSON.parse(raw);
          if (b && b.visits && !b.ephemeral) return { key: key, braid: b };
        }
      }
    }
  } catch(e) {}
  return null;
}

function saveBraid(key, braid) {
  try { localStorage.setItem(key, JSON.stringify(braid)); } catch(e) {}
}

function recordVisit() {
  var found = findActiveBraid();
  if (!found) return;
  var braid = found.braid;
  var url = location.href, title = document.title, ep = classify(url);
  if (braid.visits.length > 0 && braid.visits[braid.visits.length - 1].url === url) return;
  braid.visits.push({ url: url, title: title, time: new Date().toISOString(), epitope: ep });
  saveBraid(found.key, braid);
}

// ═══ MARKS ═══
function getMarks() {
  try { return JSON.parse(localStorage.getItem(MARKS_KEY) || '{}'); } catch(e) { return {}; }
}
function isMarked(url) { return !!getMarks()[url]; }
function toggleMark(url) {
  var marks = getMarks();
  if (marks[url]) { delete marks[url]; }
  else { marks[url] = { time: new Date().toISOString(), epitope: classify(url), title: document.title }; }
  try { localStorage.setItem(MARKS_KEY, JSON.stringify(marks)); } catch(e) {}
  return !!marks[url];
}

// ═══ SING ═══
function getSong(url) {
  var found = findActiveBraid();
  if (!found) return '';
  var braid = found.braid;
  if (!braid.songs) return '';
  var s = braid.songs[url];
  return !s ? '' : typeof s === 'string' ? s : s.text || '';
}

function saveSong(url, text) {
  var found = findActiveBraid();
  if (!found) return;
  var braid = found.braid;
  if (!braid.songs) braid.songs = {};
  if (text.trim()) {
    braid.songs[url] = { text: text.trim(), epitope: classifyText(text + ' ' + url), time: new Date().toISOString() };
  } else { delete braid.songs[url]; }
  saveBraid(found.key, braid);
}

// ═══ SHOUT ═══
function makeShout() {
  var ep = classify(location.href);
  return SIGNAL_BASE + '?signal=' + encodeURIComponent(location.href) +
    '&ep=' + ep + '&t=' + encodeURIComponent(document.title.slice(0, 80));
}

// ═══ MEMBRANE WIDGET ═══
function widgetCSS() {
  var w = '#eco-membrane-widget';
  return [
    w + ' { position:fixed; bottom:0; left:0; right:0; z-index:99999;',
    '  display:flex; align-items:center; justify-content:center; gap:0;',
    '  background:rgba(13,17,23,0.92); backdrop-filter:blur(8px);',
    '  border-top:1px solid rgba(48,54,61,0.6);',
    '  padding:6px 12px; font-family:"Iosevka","Fira Code",monospace; font-size:12px;',
    '  color:#8b949e; transition:transform 0.3s; }',
    w + '.collapsed { transform:translateY(calc(100% - 3px)); }',
    w + ' .ep-dot { width:8px; height:8px; border-radius:50%; margin-right:8px; flex-shrink:0; }',
    w + ' button { background:none; border:1px solid rgba(48,54,61,0.8); color:#c9d1d9;',
    '  font-family:inherit; font-size:11px; padding:4px 10px; border-radius:3px;',
    '  cursor:pointer; margin:0 3px; transition:all 0.15s; position:relative; }',
    w + ' button:hover { border-color:#58a6ff; color:#58a6ff; }',
    w + ' button:hover::after { content:attr(title); position:absolute; bottom:calc(100% + 6px);',
    '  left:50%; transform:translateX(-50%); background:#161b22;',
    '  border:1px solid #30363d; color:#c9d1d9; padding:4px 8px;',
    '  border-radius:4px; font-size:10px; white-space:nowrap; z-index:100000; pointer-events:none; }',
    w + ' button.active { background:#58a6ff22; border-color:#58a6ff; color:#58a6ff; }',
    w + ' button.marked { background:#d2992222; border-color:#d29922; color:#d29922; }',
    w + ' .widget-toggle { position:absolute; top:-20px; right:12px; background:rgba(13,17,23,0.92);',
    '  border:1px solid rgba(48,54,61,0.6); border-bottom:none; border-radius:4px 4px 0 0;',
    '  color:#8b949e; font-size:10px; padding:2px 8px; cursor:pointer; }',
    w + ' .sing-area { position:absolute; bottom:100%; left:50%; transform:translateX(-50%);',
    '  width:min(500px, 90vw); background:rgba(13,17,23,0.95); border:1px solid #30363d;',
    '  border-radius:6px; padding:12px; margin-bottom:4px; display:none; }',
    w + ' .sing-area.open { display:block; }',
    w + ' .sing-area textarea { width:100%; min-height:60px; background:#0d1117; border:1px solid #30363d;',
    '  color:#c9d1d9; font-family:inherit; font-size:12px; border-radius:4px; padding:8px; resize:vertical; }',
    w + ' .sing-area textarea:focus { border-color:#58a6ff; outline:none; }',
    w + ' .sing-area .sing-footer { display:flex; justify-content:space-between; align-items:center;',
    '  margin-top:8px; font-size:11px; color:#8b949e; }',
    w + ' .shout-toast { position:absolute; bottom:100%; right:12px; background:#3fb950;',
    '  color:#fff; padding:6px 12px; border-radius:4px; font-size:11px;',
    '  margin-bottom:4px; opacity:0; transition:opacity 0.3s; pointer-events:none; }',
    w + ' .shout-toast.show { opacity:1; }',
    w + ' .braid-link { color:#58a6ff; text-decoration:none; margin-left:8px; }',
    w + ' .braid-link:hover { text-decoration:underline; }',
    '@media(max-width:600px) {',
    '  ' + w + ' { font-size:11px; padding:4px 8px; }',
    '  ' + w + ' button { font-size:10px; padding:3px 7px; }',
    '}',
  ].join('\n');
}

function widgetHTML(epColor, ep, marked, hasBraid) {
  return '<div class="widget-toggle" id="eco-toggle">membrane</div>' +
    '<div class="sing-area" id="eco-sing-area">' +
      '<textarea id="eco-sing-text" placeholder="sing — leave a note on this page (stored in your braid, never sent)"></textarea>' +
      '<div class="sing-footer"><span>your note · your braid · your device</span>' +
        '<button id="eco-sing-save" style="background:#3fb950;color:#fff;border-color:#3fb950">save</button></div>' +
    '</div>' +
    '<div class="shout-toast" id="eco-shout-toast">signal copied — share it</div>' +
    '<span class="ep-dot" style="background:' + epColor + '" title="' + ep + '"></span>' +
    '<span style="margin-right:12px;color:' + epColor + '">' + ep + '</span>' +
    '<button id="eco-mark" class="' + (marked ? 'marked' : '') + '" title="mark this page">' +
      (marked ? '★ marked' : '☆ mark') + '</button>' +
    '<button id="eco-shout" title="shout — share a signal link">📢 shout</button>' +
    '<button id="eco-sing" title="sing — leave a note">♪ sing</button>' +
    '<a class="braid-link" href="https://hud.primals.eco/desk/" title="your desk — study, write, draw, play, create">⊞ desk</a>' +
    (hasBraid ?
      '<a class="braid-link" href="' + SIGNAL_BASE + '" title="your braid">⟠ braid</a>' :
      '<a class="braid-link" href="' + SIGNAL_BASE + '" title="start a braid">⟠ weave</a>');
}

function widgetBind(bar) {
  var existing = getSong(location.href);
  if (existing) document.getElementById('eco-sing-text').value = existing;

  var hudBar = document.getElementById('hud-widget-bar');
  if (hudBar) hudBar.style.bottom = '36px';

  document.getElementById('eco-toggle').addEventListener('click', function() {
    bar.classList.toggle('collapsed');
  });

  document.getElementById('eco-mark').addEventListener('click', function() {
    var nowMarked = toggleMark(location.href);
    this.className = nowMarked ? 'marked' : '';
    this.textContent = nowMarked ? '★ marked' : '☆ mark';
    var found = findActiveBraid();
    if (found && nowMarked) {
      var braid = found.braid;
      if (!braid.marks) braid.marks = [];
      braid.marks.push({ url: location.href, title: document.title,
        time: new Date().toISOString(), epitope: classify(location.href) });
      saveBraid(found.key, braid);
    }
  });

  document.getElementById('eco-shout').addEventListener('click', function() {
    copyToClipboard(makeShout());
    var toast = document.getElementById('eco-shout-toast');
    toast.classList.add('show');
    setTimeout(function() { toast.classList.remove('show'); }, 2000);
  });

  document.getElementById('eco-sing').addEventListener('click', function() {
    var area = document.getElementById('eco-sing-area');
    area.classList.toggle('open');
    if (area.classList.contains('open')) document.getElementById('eco-sing-text').focus();
  });

  document.getElementById('eco-sing-save').addEventListener('click', function() {
    saveSong(location.href, document.getElementById('eco-sing-text').value);
    document.getElementById('eco-sing-area').classList.remove('open');
  });
}

function buildWidget() {
  if (location.pathname.indexOf('/braid') === 0) return;
  if (location.pathname.indexOf('/desk') === 0) return;

  var ep = classify(location.href);
  var epColor = EP_COLORS[ep] || '#8b949e';

  var css = document.createElement('style');
  css.textContent = widgetCSS();
  document.head.appendChild(css);

  var bar = document.createElement('div');
  bar.id = 'eco-membrane-widget';
  bar.innerHTML = widgetHTML(epColor, ep, isMarked(location.href), !!findActiveBraid());
  document.body.appendChild(bar);

  widgetBind(bar);
}

function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text);
  } else {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
  }
}

// ═══ BOOT ═══
function boot() {
  recordVisit();
  buildWidget();
}

if (document.readyState === 'complete') { setTimeout(boot, 100); }
else { window.addEventListener('load', function() { setTimeout(boot, 200); }); }

})();
