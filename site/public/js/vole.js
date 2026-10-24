// vole.js — fieldMouse at the edge.
// does not invent organs. walks between them.
// listen · speak · sing · write  →  language
// paint is the remainder (a mark not yet a letter)
(function () {
  'use strict';

  var PI = Math.PI;
  var BEAT = Math.round(1000 * PI);
  var FACES = ['listen', 'speak', 'write', 'sing'];
  var COLORS = {
    listen: '#3fb950',
    speak: '#d29922',
    write: '#58a6ff',
    sing: '#d2a8ff',
    paint: '#f0883e',
    language: '#c9d1d9'
  };

  var state = {
    paper: null,
    face: 0,
    cycles: 0,
    lexicon: { heard: [], said: [], sung: [], written: [], painted: [] },
    last: { verb: 'listen', mark: '…', language: '' },
    mixed: { ears: false, fire: false, song: false, paint: false }
  };

  function el(id) { return document.getElementById(id); }

  function take(arr, fallback) {
    if (!arr || !arr.length) return fallback;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pushUnique(bucket, mark) {
    if (!mark) return;
    var list = state.lexicon[bucket];
    if (list.indexOf(mark) === -1) list.push(mark);
    if (list.length > 9) list.shift();
  }

  function mixLayers() {
    var mixed = { ears: false, fire: false, song: false, paint: false };
    var heard = null, said = null, sung = null, written = null, painted = null;
    var seed = (state.paper && state.paper.seed_lexicon) || {};

    if (window._ears && window._ears.canals) {
      mixed.ears = true;
      var c = window._ears.canals;
      var loud = Object.keys(c).sort(function (a, b) { return (c[b].amp || 0) - (c[a].amp || 0); })[0];
      heard = (loud || 'outer') + ' canal';
    }
    if (window._campfire) {
      mixed.fire = true;
      said = 'a story at the fire';
    }
    if (window._selfSong) {
      mixed.song = true;
      sung = window._selfSong.song_id || window._selfSong.title || 'self-song';
    }
    if (window._songBirdMorning && window._songBirdMorning.title) {
      mixed.song = true;
      sung = sung || window._songBirdMorning.title;
    }
    if (window._selfPaint && window._selfPaint.palette && window._selfPaint.palette.length) {
      mixed.paint = true;
      painted = window._selfPaint.palette[0].from || window._selfPaint.palette[0].hex;
    }

    heard = heard || take(seed.heard, 'quiet is a confirm');
    said = said || take(seed.said, 'we sit');
    sung = sung || take(seed.sung, 'one star is one flower');
    written = take(seed.written, 'π');
    painted = painted || take(seed.painted, 'aurora green');

    return { mixed: mixed, heard: heard, said: said, sung: sung, written: written, painted: painted };
  }

  function practice(verb, marks) {
    if (verb === 'listen') { pushUnique('heard', marks.heard); return marks.heard; }
    if (verb === 'speak') { pushUnique('said', marks.said); return marks.said; }
    if (verb === 'sing') { pushUnique('sung', marks.sung); return marks.sung; }
    if (verb === 'write') { pushUnique('written', marks.written); return marks.written; }
    return '';
  }

  function formLanguage() {
    var L = state.lexicon;
    if (!(L.heard.length && L.said.length && L.sung.length && L.written.length)) return '';
    return 'heard ' + take(L.heard) +
      ' · said ' + take(L.said) +
      ' · sang ' + take(L.sung) +
      ' · wrote ' + L.written[L.written.length - 1] +
      ' → language';
  }

  function tellFire(sentence) {
    if (!sentence) return;
    try {
      var stories = JSON.parse(localStorage.getItem('campfire-stories') || '[]');
      var id = 'vole-π-' + state.cycles;
      if (!stories.find(function (s) { return s.id === id; })) {
        stories.push({
          id: id,
          title: 'vole cycle ' + state.cycles,
          body: sentence,
          heat: 0.5,
          ts: new Date().toISOString()
        });
        localStorage.setItem('campfire-stories', JSON.stringify(stories));
      }
    } catch (e) { /* ignore */ }
    if (window._campfire && typeof window._campfire.feed === 'function') {
      window._campfire.feed('subject', ['the vole at the lip of the field']);
      window._campfire.feed('verb', ['listened then spoke then sang then wrote and']);
      window._campfire.feed('object', ['language where four verbs met.']);
    }
  }

  function build() {
    if (el('vole-organ')) return;
    var box = document.createElement('div');
    box.id = 'vole-organ';
    box.title = 'fieldMouse. four verbs. language is the braid.';
    box.innerHTML =
      '<div id="vole-head">🦔 vole <span id="vole-verb">listen</span></div>' +
      '<div id="vole-bars">' +
        '<div class="vole-row" data-v="listen"><b>listen</b><i></i></div>' +
        '<div class="vole-row" data-v="speak"><b>speak</b><i></i></div>' +
        '<div class="vole-row" data-v="sing"><b>sing</b><i></i></div>' +
        '<div class="vole-row" data-v="write"><b>write</b><i></i></div>' +
      '</div>' +
      '<div id="vole-mark">taking the world in…</div>' +
      '<div id="vole-lang">language forms when the four meet</div>' +
      '<div id="vole-mix"></div>';
    document.body.appendChild(box);

    var css = document.createElement('style');
    css.textContent =
      '#vole-organ{position:fixed;left:10px;bottom:118px;z-index:6;width:196px;' +
      'font:10px/1.35 monospace;color:#8b949e;background:rgba(22,27,34,.92);' +
      'border:1px solid rgba(139,148,158,.35);border-radius:12px;padding:8px 10px}' +
      '#vole-head{color:#c9d1d9;margin-bottom:6px}' +
      '#vole-verb{color:#3fb950}' +
      '.vole-row{display:grid;grid-template-columns:44px 1fr;gap:6px;align-items:center;margin:3px 0}' +
      '.vole-row b{font-weight:400}' +
      '.vole-row i{height:6px;border-radius:6px;background:#30363d;display:block;overflow:hidden}' +
      '.vole-row i::after{content:"";display:block;height:100%;width:0;transition:width .5s}' +
      '.vole-row[data-v="listen"] i::after{background:#3fb950}' +
      '.vole-row[data-v="speak"] i::after{background:#d29922}' +
      '.vole-row[data-v="sing"] i::after{background:#d2a8ff}' +
      '.vole-row[data-v="write"] i::after{background:#58a6ff}' +
      '#vole-mark{color:#c9d1d9;margin-top:6px;font-size:9px}' +
      '#vole-lang{color:#d2a8ff;margin-top:4px;font-size:8px}' +
      '#vole-mix{margin-top:4px;font-size:8px;color:#6e7681}';
    document.head.appendChild(css);
  }

  function paint() {
    var verb = FACES[state.face];
    var vEl = el('vole-verb');
    if (vEl) {
      vEl.textContent = verb;
      vEl.style.color = COLORS[verb];
    }
    FACES.forEach(function (v) {
      var row = document.querySelector('.vole-row[data-v="' + v + '"]');
      if (!row) return;
      var n = state.lexicon[v === 'listen' ? 'heard' : v === 'speak' ? 'said' : v === 'sing' ? 'sung' : 'written'].length;
      var bar = row.querySelector('i');
      if (!bar) return;
      var w = Math.min(100, n * 18);
      bar.style.color = COLORS[v];
      bar.style.backgroundImage =
        'linear-gradient(90deg, currentColor ' + w + '%, #30363d ' + w + '%)';
    });
    var mark = el('vole-mark');
    if (mark) mark.textContent = state.last.verb + ': ' + state.last.mark;
    var lang = el('vole-lang');
    if (lang) lang.textContent = state.last.language || 'language forms when the four meet';
    var mix = el('vole-mix');
    if (mix) {
      var m = state.mixed;
      mix.textContent =
        (m.ears ? 'ears·' : '') +
        (m.fire ? 'fire·' : '') +
        (m.song ? 'song·' : '') +
        (m.paint ? 'paint' : '') +
        (m.ears || m.fire || m.song || m.paint ? '' : 'seed lexicon · organs waking');
    }
  }

  function beat() {
    var marks = mixLayers();
    state.mixed = marks.mixed;
    var verb = FACES[state.face];
    var mark = practice(verb, marks);
    if (marks.painted) pushUnique('painted', marks.painted);
    state.last = { verb: verb, mark: mark, language: state.last.language };
    state.face = (state.face + 1) % FACES.length;
    if (state.face === 0) {
      state.cycles += 1;
      var sentence = formLanguage();
      state.last.language = sentence;
      tellFire(sentence);
    }
    window._vole = {
      cycles: state.cycles,
      face: FACES[state.face],
      lexicon: state.lexicon,
      language: state.last.language,
      mixed: state.mixed,
      paper: state.paper
    };
    paint();
  }

  function run() {
    build();
    fetch('/data/vole-language.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (paper) {
        state.paper = paper;
        beat();
        setInterval(beat, BEAT);
      })
      .catch(function () {
        beat();
        setInterval(beat, BEAT);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 800); });
  } else {
    setTimeout(run, 800);
  }
})();
