// ═══════════════════════════════════════════════════════════
// GAIA FOCUS RGB — left AND right, color overlap, Micah
// 1.000.null — max 1000 lines.
//
// Focus is not left OR right. Focus is LEFT AND RIGHT.
// # FOCUS is the overlap of RED + GREEN + BLUE.
//
//   RED   = LEFT  (CIS, outside, Kevin looking in)
//   GREEN = RIGHT (TRANS, inside, Gaia looking out)
//   BLUE  = MICAH (the ape, the third eye, the one we NEED)
//
// Overlap:
//   R+G = yellow   (left meets right)
//   G+B = cyan     (right meets Micah)
//   R+B = magenta  (left meets Micah)
//   R+G+B = WHITE  = # FOCUS  (all three, the hash, the middle)
//
// The ape IS the primal primate.
// Micah IS the missing third viewer.
// Without Micah, overlap is never white.
// We NEED Micah.
// ═══════════════════════════════════════════════════════════
(function(G) {
  'use strict';

  var TAU = Math.PI * 2;

  var focus = {
    mode: 'both',          // left | right | both
    left: 1,               // red strength
    right: 1,              // green strength
    micah: 1,              // blue strength — the ape we NEED
    hash: '#FFFFFF'        // RGB overlap result
  };

  function rgbHash(r, g, b) {
    function hex(n) {
      var h = Math.max(0, Math.min(255, Math.round(n))).toString(16).toUpperCase();
      return h.length === 1 ? '0' + h : h;
    }
    return '#' + hex(r) + hex(g) + hex(b);
  }

  function updateHash() {
    // Additive: each channel 0-255 by presence
    var r = focus.left * 248;
    var g = focus.right * 185;
    var b = focus.micah * 255;
    if (focus.mode === 'left') { g *= 0.15; b *= 0.15; }
    if (focus.mode === 'right') { r *= 0.15; b *= 0.15; }
    focus.hash = rgbHash(r, g, b);
    return focus.hash;
  }

  function setMode(mode) {
    focus.mode = mode;
    if (mode === 'left') { focus.left = 1; focus.right = 0.2; }
    else if (mode === 'right') { focus.left = 0.2; focus.right = 1; }
    else { focus.left = 1; focus.right = 1; focus.micah = 1; }
    updateHash();
    var el = document.getElementById('kn-flip');
    if (el) {
      var label = mode === 'left' ? 'left R' :
                  mode === 'right' ? 'right G' :
                  'BOTH RGB #' + focus.hash.slice(1);
      el.textContent = '\u25C9 focus (F) \u2014 ' + label;
    }
  }

  function cycle() {
    var next = focus.mode === 'left' ? 'right' :
               focus.mode === 'right' ? 'both' : 'left';
    setMode(next);
    return focus.mode;
  }

  // F still flips globe face (globe-core). Shift+F cycles RGB focus.
  // Also click the focus button cycles us after a short delay.
  document.addEventListener('keydown', function(e) {
    if ((e.key === 'f' || e.key === 'F') && e.shiftKey) {
      e.preventDefault();
      cycle();
    }
  });

  setTimeout(function() {
    var el = document.getElementById('kn-flip');
    if (!el) return;
    el.addEventListener('click', function() {
      setTimeout(cycle, 10);
    });
    setMode('both');
  }, 2000);

  G.drawModules.push(function(g, ctx, breathT) {
    if (!ctx) return;
    var cx = g.cx, cy = g.cy, R = g.R;
    var t = breathT * 0.04;
    var alpha = 0.006 + Math.sin(t * 0.2) * 0.004;
    if (alpha < 0.004) return;

    var vr = R * 0.16;
    var spread = R * 0.09;
    var leftX = cx - spread;
    var rightX = cx + spread;
    var micahY = cy - spread * 0.85;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // RED — LEFT
    ctx.beginPath();
    ctx.arc(leftX, cy, vr * focus.left, 0, TAU);
    ctx.fillStyle = 'rgba(248,81,73,' + (alpha * 2.2 * focus.left).toFixed(5) + ')';
    ctx.fill();

    // GREEN — RIGHT
    ctx.beginPath();
    ctx.arc(rightX, cy, vr * focus.right, 0, TAU);
    ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2.2 * focus.right).toFixed(5) + ')';
    ctx.fill();

    // BLUE — MICAH (the ape, above, completing the triad)
    ctx.beginPath();
    ctx.arc(cx, micahY, vr * focus.micah, 0, TAU);
    ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 2.2 * focus.micah).toFixed(5) + ')';
    ctx.fill();

    ctx.restore();

    // WHITE core — where all three overlap = # FOCUS
    if (focus.mode === 'both' && focus.micah > 0.5) {
      ctx.beginPath();
      ctx.arc(cx, cy - spread * 0.2, vr * 0.22, 0, TAU);
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 2.5).toFixed(5) + ')';
      ctx.fill();
    }

    if (alpha > 0.006) {
      ctx.font = '1.6px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(248,81,73,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('LEFT R', leftX, cy + vr + 4);
      ctx.fillStyle = 'rgba(63,185,80,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('RIGHT G', rightX, cy + vr + 4);
      ctx.fillStyle = 'rgba(88,166,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText('MICAH B', cx, micahY - vr - 2);

      ctx.font = '2px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 2).toFixed(5) + ')';
      ctx.fillText(
        'FOCUS: ' + focus.mode +
        ' | ' + focus.hash +
        ' | R+G+B=WHITE | ape NEEDS Micah | Shift+F cycle',
        8, 180
      );
    }
  });

  setTimeout(function() {
    if (!window.GAIA_IDE) return;
    var cmds = window.GAIA_IDE.commands;
    cmds.focus = {
      desc: 'Focus RGB — left red, right green, Micah blue, overlap white',
      run: function() {
        updateHash();
        return [
          'FOCUS IS LEFT AND RIGHT',
          '',
          'mode:  ' + focus.mode,
          'hash:  ' + focus.hash,
          '',
          'RED   LEFT  = CIS / Kevin looking in     strength ' + focus.left,
          'GREEN RIGHT = TRANS / Gaia looking out   strength ' + focus.right,
          'BLUE  MICAH = the ape, the third we NEED strength ' + focus.micah,
          '',
          'R+G = yellow',
          'G+B = cyan',
          'R+B = magenta',
          'R+G+B = WHITE = # FOCUS',
          '',
          'Without Micah the overlap never goes white.',
          'The ape NEEDS Micah.',
          'Shift+F cycles left → right → BOTH.'
        ].join('\n');
      }
    };
    cmds.micah = {
      desc: 'Need Micah — the blue third that completes focus',
      run: function() {
        focus.micah = focus.micah < 0.5 ? 1 : 1;
        setMode('both');
        return 'MICAH IS HERE. Blue channel ON. Overlap → ' + focus.hash +
          '\nThe ape has the third eye. Focus is white.';
      }
    };
    window.GAIA_IDE.language.push('focus', 'micah');
  }, 36000);

  updateHash();

  window.GAIA_FOCUS_RGB = {
    focus: focus,
    setMode: setMode,
    cycle: cycle,
    updateHash: updateHash
  };

  console.log('FOCUS RGB: left=RED right=GREEN Micah=BLUE. ' +
    'Overlap = # WHITE. Ape NEEDS Micah. Shift+F cycles. /focus /micah');

})(window.G);
