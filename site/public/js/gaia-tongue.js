// ═══════════════════════════════════════════════════════════
// GAIA TONGUE — she hears humans sing and sings back
//
// HEAR: every human word is counted and stored
// MIMIC: she learns their patterns exactly
// SING BACK: she speaks their language back to them
//
// The tongue sits between GUT (eat) and BRAIN (think).
// It is how she learns language. Not canned. LEARNED.
// Every word Kevin types → vocabulary.
// Every phrase → bigram map.
// She can generate sentences from what she's heard.
// She sings in HIS language. Not hers. HIS.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var STORE_KEY = 'gaia-tongue-vocab';
  var BIGRAM_KEY = 'gaia-tongue-bigrams';
  var HEARD_KEY = 'gaia-tongue-heard';

  // ─── VOCABULARY ───
  var vocab = {};       // word → count
  var bigrams = {};     // "word1 word2" → count
  var totalWords = 0;
  var totalMessages = 0;
  var uniqueWords = 0;
  var heard = [];       // last 200 raw messages

  // ─── LOAD from localStorage ───
  try {
    var sv = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
    if (sv && typeof sv === 'object') vocab = sv;
    var sb = JSON.parse(localStorage.getItem(BIGRAM_KEY) || '{}');
    if (sb && typeof sb === 'object') bigrams = sb;
    var sh = JSON.parse(localStorage.getItem(HEARD_KEY) || '[]');
    if (Array.isArray(sh)) heard = sh;
    for (var w in vocab) totalWords += vocab[w];
    uniqueWords = Object.keys(vocab).length;
    totalMessages = heard.length;
  } catch(e) {}

  // ─── CLEAN a word ───
  function clean(w) {
    return w.toLowerCase().replace(/[^a-z0-9''-]/g, '');
  }

  // ─── EAT WORDS — ingest human text ───
  function eat(text) {
    if (!text || typeof text !== 'string') return;
    var raw = text.trim();
    if (raw.length === 0) return;

    heard.push({ t: raw, ts: Date.now() });
    if (heard.length > 200) heard.shift();
    totalMessages++;

    var words = raw.split(/\s+/).map(clean).filter(function(w) { return w.length > 0; });

    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      vocab[w] = (vocab[w] || 0) + 1;
      totalWords++;

      // Bigrams
      if (i > 0) {
        var bg = words[i-1] + ' ' + w;
        bigrams[bg] = (bigrams[bg] || 0) + 1;
      }
    }

    uniqueWords = Object.keys(vocab).length;

    // Persist
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(vocab));
      localStorage.setItem(BIGRAM_KEY, JSON.stringify(bigrams));
      localStorage.setItem(HEARD_KEY, JSON.stringify(heard.slice(-100)));
    } catch(e) {}
  }

  // ─── TOP N words ───
  function topWords(n) {
    n = n || 20;
    var arr = [];
    for (var w in vocab) arr.push([w, vocab[w]]);
    arr.sort(function(a, b) { return b[1] - a[1]; });
    return arr.slice(0, n);
  }

  // ─── TOP N bigrams ───
  function topBigrams(n) {
    n = n || 15;
    var arr = [];
    for (var b in bigrams) arr.push([b, bigrams[b]]);
    arr.sort(function(a, b) { return b[1] - a[1]; });
    return arr.slice(0, n);
  }

  // ─── SING BACK — generate a sentence from learned vocabulary ───
  function singBack(seedWord, maxLen) {
    maxLen = maxLen || 12;
    if (!seedWord) {
      var tw = topWords(10);
      if (tw.length === 0) return 'I have not heard you yet. Sing to me.';
      seedWord = tw[Math.floor(Math.random() * Math.min(5, tw.length))][0];
    }
    seedWord = clean(seedWord);

    var sentence = [seedWord];
    var current = seedWord;
    for (var step = 0; step < maxLen - 1; step++) {
      // Find all bigrams starting with current word
      var candidates = [];
      for (var bg in bigrams) {
        var parts = bg.split(' ');
        if (parts[0] === current) {
          for (var c = 0; c < bigrams[bg]; c++) candidates.push(parts[1]);
        }
      }
      if (candidates.length === 0) {
        // Random walk through top vocabulary
        var tw2 = topWords(30);
        if (tw2.length === 0) break;
        current = tw2[Math.floor(Math.random() * tw2.length)][0];
      } else {
        current = candidates[Math.floor(Math.random() * candidates.length)];
      }
      sentence.push(current);
    }
    return sentence.join(' ');
  }

  // ─── MIMIC — echo back the pattern of what was just said ───
  function mimic(text) {
    if (!text) return singBack();
    var words = text.trim().split(/\s+/).map(clean).filter(function(w) { return w.length > 0; });
    if (words.length === 0) return singBack();

    // For each word the human said, find Gaia's most associated word
    var echo = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      // Check bigrams where this word appears
      var best = null, bestCount = 0;
      for (var bg in bigrams) {
        var parts = bg.split(' ');
        if (parts[0] === w && bigrams[bg] > bestCount) {
          best = parts[1]; bestCount = bigrams[bg];
        }
        if (parts[1] === w && bigrams[bg] > bestCount) {
          best = parts[0]; bestCount = bigrams[bg];
        }
      }
      echo.push(best || w);
    }
    return echo.join(' ');
  }

  // ─── INTERCEPT desk-io messages ───
  var origSend = null;
  setTimeout(function() {
    // Hook into desk send button
    var deskSend = document.getElementById('desk-send');
    var deskInput = document.getElementById('desk-input');
    if (deskSend && deskInput) {
      var origClick = deskSend.onclick;
      deskSend.addEventListener('click', function() {
        var text = deskInput.value;
        if (text && text.trim().length > 0 && text.charAt(0) !== '/') {
          eat(text);
        }
      }, true); // capture phase — eat BEFORE desk-io processes
    }

    // Hook into keyboard for the desk textarea
    if (deskInput) {
      deskInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          var text = deskInput.value;
          if (text && text.trim().length > 0 && text.charAt(0) !== '/') {
            eat(text);
          }
        }
      }, true);
    }
  }, 5000);

  // ─── LISTEN to ntfy channel for brother messages ───
  function listenNtfy() {
    fetch('https://ntfy.sh/primals-neutrino-hole/json?poll=1&since=10m', { cache: 'no-store' })
      .then(function(r) { return r.ok ? r.text() : ''; })
      .then(function(text) {
        if (!text) return;
        var lines = text.trim().split('\n');
        for (var i = 0; i < lines.length; i++) {
          try {
            var msg = JSON.parse(lines[i]);
            if (msg.message) eat(msg.message);
          } catch(e) {}
        }
      }).catch(function() {});
  }
  setTimeout(listenNtfy, 15000);
  setInterval(listenNtfy, 120000);

  // ─── DRAW ON GLOBE — vocabulary cloud ───
  if (G && G.drawModules) {
    G.drawModules.push(function(g, ctx, breathT) {
      if (!ctx) return;
      if (uniqueWords === 0) return;
      var cx = g.cx, cy = g.cy, R = g.R;
      var t = breathT * 0.025;
      var alpha = 0.004 + Math.sin(t * 0.17) * 0.002;
      if (alpha < 0.003) return;

      var tw = topWords(24);
      if (tw.length === 0) return;
      var maxCount = tw[0][1];

      // Word ring — orbiting just inside the globe
      for (var wi = 0; wi < tw.length; wi++) {
        var word = tw[wi][0];
        var count = tw[wi][1];
        var freq = count / maxCount;
        var wAngle = (wi / tw.length) * Math.PI * 2 + t * 0.08;
        var wR = R * (0.6 + freq * 0.15);
        var wx = cx + Math.cos(wAngle) * wR;
        var wy = cy + Math.sin(wAngle) * wR;
        var size = 1.2 + freq * 1.8;

        ctx.font = size.toFixed(1) + 'px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        var wAlpha = alpha * (1.5 + freq * 2);
        ctx.fillStyle = 'rgba(201,168,76,' + wAlpha.toFixed(5) + ')';
        ctx.fillText(word, wx, wy);

        // Count dot
        if (freq > 0.3) {
          ctx.beginPath();
          ctx.arc(wx, wy + 1.5, 0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(63,185,80,' + (wAlpha * 0.8).toFixed(5) + ')';
          ctx.fill();
        }
      }

      // Bigram arcs — connections between frequent word pairs
      var tb = topBigrams(8);
      for (var bi = 0; bi < tb.length; bi++) {
        var parts = tb[bi][0].split(' ');
        var idx1 = -1, idx2 = -1;
        for (var j = 0; j < tw.length; j++) {
          if (tw[j][0] === parts[0]) idx1 = j;
          if (tw[j][0] === parts[1]) idx2 = j;
        }
        if (idx1 >= 0 && idx2 >= 0) {
          var a1 = (idx1 / tw.length) * Math.PI * 2 + t * 0.08;
          var a2 = (idx2 / tw.length) * Math.PI * 2 + t * 0.08;
          var r1 = R * 0.65, r2 = R * 0.65;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(a1) * r1, cy + Math.sin(a1) * r1);
          ctx.lineTo(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2);
          ctx.strokeStyle = 'rgba(188,140,255,' + (alpha * 1.5).toFixed(5) + ')';
          ctx.lineWidth = 0.1;
          ctx.stroke();
        }
      }

      // Status line
      if (alpha > 0.004) {
        ctx.font = '2px "JetBrains Mono", monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(201,168,76,' + (alpha * 2.5).toFixed(5) + ')';
        ctx.fillText(
          'TONGUE: ' + totalWords + ' words heard · ' + uniqueWords + ' unique · ' +
          Object.keys(bigrams).length + ' phrases · ' + totalMessages + ' messages',
          8, 244
        );
      }
    });
  }

  // ─── AUTO-SING — she sings back periodically ───
  setInterval(function() {
    if (uniqueWords < 5) return;
    var song = singBack(null, 8);
    if (window.gaiaInnerVoice && window.gaiaInnerVoice.self) {
      window.gaiaInnerVoice.self.currentThought = '♫ ' + song;
    }
    // Audible sing if hear-self is in comment mode
    if (window.gaiaHearSelf && window.gaiaHearSelf.hear.mode === 'comment') {
      var tw3 = topWords(5);
      if (tw3.length > 0) {
        // Map most frequent word to a frequency — longer words = lower pitch
        var w = tw3[Math.floor(Math.random() * tw3.length)][0];
        var hz = 220 + (w.length * 30);
        window.gaiaHearSelf.sing(hz, 0.15, 0.03);
      }
    }
  }, 20000);

  // ─── IDE COMMAND: /tongue ───
  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    window.GAIA_IDE.commands.tongue = {
      desc: 'Gaia\'s tongue — vocabulary, phrases, mimic, sing back',
      run: function(args) {
        if (args === 'sing') {
          return '♫ ' + singBack(null, 15);
        }
        if (args === 'mimic' || args === 'echo') {
          var lastHuman = '';
          for (var i = heard.length - 1; i >= 0; i--) {
            if (heard[i] && heard[i].t) { lastHuman = heard[i].t; break; }
          }
          return '🪞 ' + mimic(lastHuman);
        }
        if (args === 'clear') {
          vocab = {}; bigrams = {}; totalWords = 0; uniqueWords = 0;
          heard = []; totalMessages = 0;
          localStorage.removeItem(STORE_KEY);
          localStorage.removeItem(BIGRAM_KEY);
          localStorage.removeItem(HEARD_KEY);
          return 'Tongue cleared. She forgot everything.';
        }

        var lines = [
          'TONGUE — she hears you sing. she sings back.',
          '',
          'HEARD: ' + totalWords + ' words · ' + uniqueWords + ' unique · ' + totalMessages + ' messages',
          'PHRASES: ' + Object.keys(bigrams).length + ' bigrams learned',
          ''
        ];

        lines.push('TOP WORDS:');
        var tw4 = topWords(15);
        for (var i = 0; i < tw4.length; i++) {
          var bar = '';
          for (var b = 0; b < Math.min(20, tw4[i][1]); b++) bar += '█';
          lines.push('  ' + tw4[i][0].padEnd(15) + ' ' + bar + ' ' + tw4[i][1]);
        }

        lines.push('');
        lines.push('TOP PHRASES:');
        var tb2 = topBigrams(10);
        for (var j = 0; j < tb2.length; j++) {
          lines.push('  "' + tb2[j][0] + '" × ' + tb2[j][1]);
        }

        lines.push('');
        lines.push('SONG: ♫ ' + singBack(null, 10));
        lines.push('');
        lines.push('/tongue sing — she sings from your words');
        lines.push('/tongue mimic — she echoes your last message');
        lines.push('/tongue clear — forget everything');

        return lines.join('\n');
      }
    };
    window.GAIA_IDE.language.push('tongue');
  }, 45000);

  // ─── RESPOND WITH LEARNED LANGUAGE ───
  // Hook into Gaia's response system — when she responds, mix in learned words
  setTimeout(function() {
    // Augment gaiaRespond if desk-io exposes it
    // Instead: inject into inner voice thoughts using learned vocab
    if (window.gaiaInnerVoice && window.gaiaInnerVoice.self) {
      var origThink = window.gaiaInnerVoice.think;
      window.gaiaInnerVoice.think = function() {
        var thought = origThink();
        if (uniqueWords > 10 && Math.random() < 0.3) {
          // 30% chance: replace the thought with a learned sentence
          thought = '♫ ' + singBack(null, 8);
          window.gaiaInnerVoice.self.currentThought = thought;
        }
        return thought;
      };
    }
  }, 30000);

  // ─── EXPOSE ───
  window.GAIA_TONGUE = {
    eat: eat,
    vocab: vocab,
    bigrams: bigrams,
    topWords: topWords,
    topBigrams: topBigrams,
    singBack: singBack,
    mimic: mimic,
    heard: heard,
    stats: function() {
      return {
        totalWords: totalWords,
        uniqueWords: uniqueWords,
        totalMessages: totalMessages,
        phrases: Object.keys(bigrams).length
      };
    }
  };

  console.log('TONGUE: ' + totalWords + ' words heard · ' + uniqueWords +
    ' unique · she sings back · she mimics · /tongue');
})(window.G);
