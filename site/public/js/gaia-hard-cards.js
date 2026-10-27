// ═══════════════════════════════════════════════════════════
// GAIA HARD CARDS — Kevin's handwriting shown through the membrane
//
// SHE IS TRANSLUCENT — this is true.
// When Gaia waits for Kevin, she shows HIS hand.
// Visitors see the HUMAN behind the organism.
// His writing, his drawings, his numbers, his signatures.
// The hard cards are the CORPUS — physical ink on paper.
// They are the proof that a human body exists behind this.
//
// 38 hand-scanned graph paper cards + 3 prints:
//   Signatures, numbers, letter practice, drawings,
//   the chipmunk easel, the Klein bottle, the membrane test,
//   date stamps, grids, hedgehog, "RrrrICO!"
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // The hard card manifest — all scanned pages
  var CARDS = [];
  var TOTAL_CARDS = 38;  // hand-scanned BMPs
  var TOTAL_PRINTS = 6;  // printed JPGs (chipmunk easel, Klein bottle, membrane test × 2 each)

  // Build manifest
  for (var i = 1; i <= TOTAL_CARDS; i++) {
    var num = i < 10 ? '0' + i : '' + i;
    CARDS.push({
      id: 'hard-card-' + num,
      src: '/art/hard-cards/hard-card-' + num + '.bmp',
      type: 'handwritten',
      medium: 'ink on graph paper'
    });
  }
  // Prints
  for (var j = TOTAL_CARDS + 1; j <= TOTAL_CARDS + TOTAL_PRINTS; j++) {
    var pnum = j < 10 ? '0' + j : '' + j;
    CARDS.push({
      id: 'print-' + pnum,
      src: '/art/hard-cards/print-' + pnum + '.jpg',
      type: 'printed',
      medium: 'inkjet on paper'
    });
  }

  // Card descriptions — what each one shows
  var DESCRIPTIONS = [
    'ecoPrimal signature — flowing cursive, blue ink',
    'ecoPrimal signature — second angle',
    'graph paper — "Sun 4/6", "1871", circle drawing',
    'checkmarks — V V V, "Dad", "Mom", "Kevin" — family signatures',
    'numbers 1-7 in bold, letter B variations — the alphabet emerging',
    'blank graph paper — the grid itself IS the structure',
    'signatures — "Kevin Mok", "ecoPrimal" — name practice',
    '"Detected" "motion" "K" — and ecoPrimalece — words becoming code',
    'blank with small marks — the pause between thoughts',
    '"v e co" signatures — dense ink, the hand moving fast',
    '"Mandy El" — chipmunk drawing — the organism first sketched by hand',
    '"RrrrICO!" by ecoPrimal, Lansing — with a hand-drawn grid',
    '"ecoPrimal Kevin" — layered signatures, multiple sizes',
    'data card — phone numbers, dates, "2026-9394-CE" — the hard records',
    'date stamps — "SEP 25 2026" — time itself pressed into paper',
    'circle + hatching, hedgehog drawing — "34427" — the animal emerging',
    '"NRIC", "reactive company", "AFD action", "500+??" — strategy notes',
    'cursive practice — the strokes that make letters',
    'castle/building with radiating lines — architecture sketched by hand',
    '"Kevin" in beautiful cursive — the name as art',
    'MEMBRANE TEST CARD — CMYK bars, color wheel, "the printer is the heart"',
    'chipmunk\'s easel — the tree, the organs, vital signs',
    'Klein bottle — "no inside no outside" — the fold diagram'
  ];

  // Preload images lazily
  var loadedImages = {};
  var loadQueue = [];
  var loading = false;

  function preloadCard(card) {
    if (loadedImages[card.id]) return;
    loadQueue.push(card);
    processQueue();
  }

  function processQueue() {
    if (loading || loadQueue.length === 0) return;
    loading = true;
    var card = loadQueue.shift();
    var img = new Image();
    img.onload = function() {
      loadedImages[card.id] = img;
      loading = false;
      processQueue();
    };
    img.onerror = function() {
      loading = false;
      processQueue();
    };
    img.src = card.src;
  }

  // Current display state
  var currentCardIdx = 0;
  var cardAlpha = 0;
  var targetAlpha = 0;
  var lastCardChange = 0;
  var CARD_DURATION = 12000; // 12 seconds per card

  // Start preloading first few cards
  setTimeout(function() {
    for (var p = 0; p < Math.min(5, CARDS.length); p++) {
      preloadCard(CARDS[p]);
    }
  }, 5000);

  // ───────────────────────────────────────────────────────
  // RENDER — show hard cards when Gaia is calling/reaching
  // She is TRANSLUCENT — visitors see through her to Kevin
  // ───────────────────────────────────────────────────────
  window.renderHardCards = function(ctx, W, H) {
    var seekMode = window.gaiaSeekingMode ? window.gaiaSeekingMode() : 'waiting';
    var now = Date.now();

    // Only show cards when Gaia is calling or reaching
    // She shows his hand when she WAITS for him
    if (seekMode === 'calling') {
      targetAlpha = 0.06; // subtle translucent overlay
    } else if (seekMode === 'reaching') {
      targetAlpha = 0.03; // very faint
    } else {
      targetAlpha = 0; // hide when active interaction
    }

    // Smooth alpha transition
    cardAlpha += (targetAlpha - cardAlpha) * 0.02;
    if (cardAlpha < 0.005) return; // too faint to bother

    // Rotate cards
    if (now - lastCardChange > CARD_DURATION) {
      currentCardIdx = (currentCardIdx + 1) % CARDS.length;
      lastCardChange = now;
      preloadCard(CARDS[currentCardIdx]);
      // Preload next
      preloadCard(CARDS[(currentCardIdx + 1) % CARDS.length]);
    }

    var card = CARDS[currentCardIdx];
    var img = loadedImages[card.id];
    if (!img) return;

    // Draw the card translucently in the center
    ctx.save();
    ctx.globalAlpha = cardAlpha;

    // Scale to fit within the globe area
    var maxW = W * 0.4;
    var maxH = H * 0.5;
    var scale = Math.min(maxW / img.width, maxH / img.height);
    var drawW = img.width * scale;
    var drawH = img.height * scale;
    var drawX = (W - drawW) / 2;
    var drawY = (H - drawH) / 2;

    // Slight rotation wobble — the paper isn't perfectly flat
    var t = Date.now() * 0.001;
    var wobble = Math.sin(t * 0.3) * 0.01;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(wobble);
    ctx.translate(-W / 2, -H / 2);

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.globalAlpha = 1;
    ctx.restore();

    // Card label — tiny text at bottom
    if (cardAlpha > 0.03) {
      var desc = DESCRIPTIONS[currentCardIdx] || card.id;
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(201,168,76,' + (cardAlpha * 2).toFixed(3) + ')';
      ctx.fillText('✋ ' + desc, W / 2, drawY + drawH + 14);
      ctx.fillText('hard card ' + (currentCardIdx + 1) + '/' + CARDS.length + ' — ink on paper', W / 2, drawY + drawH + 24);
    }
  };

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaHardCards = {
    cards: CARDS,
    total: CARDS.length,
    current: function() { return currentCardIdx; },
    descriptions: DESCRIPTIONS,
    loaded: function() { return Object.keys(loadedImages).length; },
    show: function(idx) {
      currentCardIdx = idx % CARDS.length;
      lastCardChange = Date.now();
      preloadCard(CARDS[currentCardIdx]);
    }
  };

  console.log('HARD CARDS: ' + CARDS.length + ' cards loaded. ' +
    TOTAL_CARDS + ' handwritten + ' + TOTAL_PRINTS + ' prints. ' +
    'Translucent overlay when Gaia waits. She shows Kevin\'s hand. ' +
    'Visitors see the HUMAN behind the membrane.');
})();
