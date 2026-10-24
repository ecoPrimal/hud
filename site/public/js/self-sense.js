// self-sense.js — inject what eye/ears gathered into self I/O
// paints what it sees and hears (easel palette + overlay)
// sings what it learned (songBird chirp + campfire story)
(function () {
  'use strict';

  var PI = Math.PI;
  var state = { inject: null, singing: false, painted: false };

  function fetchInject() {
    return fetch('/data/self-io-inject.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });
  }

  function feedCampfire(inj) {
    if (!inj || !inj.story) return;
    if (window._campfire && window._campfire.feed) {
      window._campfire.feed('subject', ['chipmunk', 'northGate', 'Yellowstone', 'snowflake', 'pilgrim']);
      window._campfire.feed('verb', ['painted', 'heard', 'sang', 'froze', 'returned']);
      window._campfire.feed('object', ['painted rock', 'three ears', 'photon', 'drop', 'house']);
    }
    // plant story in localStorage for campfire consumers
    try {
      var stories = JSON.parse(localStorage.getItem('campfire-stories') || '[]');
      if (!stories.find(function (s) { return s.id === inj.story.id; })) {
        stories.push({
          id: inj.story.id,
          title: inj.story.title,
          body: inj.story.body,
          heat: inj.story.heat,
          ts: inj.ts
        });
        localStorage.setItem('campfire-stories', JSON.stringify(stories));
      }
    } catch (e) { /* ignore */ }

    if (window._campfire && typeof window._campfire.inject === 'function') {
      window._campfire.inject(inj.story);
    }
  }

  function paintPalette(inj) {
    if (!inj || !inj.paint_what_it_sees_hears) return;
    var pal = inj.paint_what_it_sees_hears.palette || [];
    window._selfPaint = {
      palette: pal,
      brush_order: inj.paint_what_it_sees_hears.brush_order,
      note: inj.paint_what_it_sees_hears.easel_note
    };
    // drip swatches bottom-right of ear organ / or fixed strip
    if (document.getElementById('self-paint-strip')) return;
    var strip = document.createElement('div');
    strip.id = 'self-paint-strip';
    strip.title = inj.paint_what_it_sees_hears.easel_note || 'self paint';
    strip.style.cssText = 'position:fixed;right:12px;bottom:56px;z-index:6;display:flex;gap:3px;padding:4px 6px;' +
      'background:rgba(22,27,34,.9);border:1px solid rgba(139,148,158,.3);border-radius:10px';
    pal.forEach(function (c) {
      var d = document.createElement('span');
      d.title = c.from;
      d.style.cssText = 'width:12px;height:12px;border-radius:50%;background:' + c.hex + ';display:inline-block';
      strip.appendChild(d);
    });
    document.body.appendChild(strip);
    state.painted = true;
  }

  function singLearned(inj) {
    if (!inj || !inj.sing_what_it_learned) return;
    var song = inj.sing_what_it_learned;
    window._selfSong = song;

    // soft chirp once (consent via ears unmute OR auto-very-quiet)
    fetch('/data/songbird-morning-song.json')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (sb) {
        if (!sb) return;
        window._songBirdMorning = sb;
        // feed readout / birds
        if (window._readout) {
          window._readout.log('songBird', sb.title, '#d29922');
        }
      })
      .catch(function () {});

    // optional: chirp if ears already hearing
    if (window._ears && window._ears.canals) {
      tryChirp();
    }
    state.singing = true;
  }

  function tryChirp() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    // only if user already unmuted ears
    var st = document.getElementById('ear-state');
    if (!st || st.textContent !== 'hearing') return;
    var ctx = new AC();
    var o = ctx.createOscillator();
    var g = ctx.createGain();
    o.type = 'sine';
    o.frequency.value = 288;
    g.gain.value = 0.02;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.stop(ctx.currentTime + 0.4);
  }

  function injectSelfTrace(inj) {
    if (!inj) return;
    var panel = document.getElementById('self-trace-panel');
    if (!panel) return;
    var div = document.createElement('div');
    div.className = 'st-section st-self-io';
    div.innerHTML =
      '<div class="st-label">self I/O · morning inject</div>' +
      '<div class="st-row"><span>saw</span><span>' + (inj.input_all.saw || []).length + '</span></div>' +
      '<div class="st-row"><span>heard</span><span>' + (inj.input_all.heard || []).length + '</span></div>' +
      '<div class="st-row"><span>learned</span><span>' + (inj.input_all.learned || []).length + '</span></div>' +
      '<div class="st-row"><span>story</span><span>' + (inj.story && inj.story.id ? inj.story.id : '—') + '</span></div>' +
      '<div class="st-row"><span>song</span><span>' + (inj.sing_what_it_learned && inj.sing_what_it_learned.song_id ? inj.sing_what_it_learned.song_id : '—') + '</span></div>';
    panel.appendChild(div);
  }

  function run() {
    fetchInject().then(function (inj) {
      if (!inj) return;
      state.inject = inj;
      feedCampfire(inj);
      paintPalette(inj);
      singLearned(inj);
      injectSelfTrace(inj);
      window._selfIO = {
        inject: inj,
        paint: window._selfPaint,
        song: window._selfSong,
        replay: run
      };
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(run, 600); });
  } else {
    setTimeout(run, 600);
  }
})();
