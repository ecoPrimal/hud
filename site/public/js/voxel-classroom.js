// voxel-classroom.js — the chipmunk teaches language AND physics
// A class of humans learning hieroglyphics and gamma radiation together
// while walking the farm. Symbol = frequency. Language = energy.
(function() {
  'use strict';

  // The curriculum: hieroglyphics ↔ physics ↔ ecology, all the same lesson
  var LESSONS = [
    {
      glyph: '𓃭', name: 'lion', physics: 'gamma ray',
      freq: '3×10¹⁹ Hz', energy: '124 keV',
      farm: 'the predator at the top of the chain',
      teach: 'the lion hieroglyph IS gamma radiation — maximum energy, maximum symbol. both burn.'
    },
    {
      glyph: '𓇋', name: 'reed', physics: 'visible light',
      freq: '5×10¹⁴ Hz', energy: '2.1 eV',
      farm: 'the reed at the water edge, bending',
      teach: 'the reed is visible light — what you can see. the most common symbol in hieroglyphics, the most common radiation we use.'
    },
    {
      glyph: '𓈖', name: 'water', physics: 'radio wave',
      freq: '10⁶ Hz', energy: '4 neV',
      farm: 'the irrigation channel, always flowing',
      teach: 'water is radio — low energy, everywhere, carries information across distance. both flow.'
    },
    {
      glyph: '𓂀', name: 'eye of horus', physics: 'X-ray',
      freq: '3×10¹⁷ Hz', energy: '12 keV',
      farm: 'the hawk circling, seeing through walls',
      teach: 'the eye sees through matter. X-rays see through flesh. same function, different millennium.'
    },
    {
      glyph: '𓆣', name: 'scarab', physics: 'microwave',
      freq: '2.45×10⁹ Hz', energy: '10 μeV',
      farm: 'the beetle rolling dung into soil — recycling',
      teach: 'the scarab cycles matter. microwaves cycle water molecules. both transform through rotation.'
    },
    {
      glyph: '𓊝', name: 'bread loaf', physics: 'infrared',
      freq: '3×10¹³ Hz', energy: '124 meV',
      farm: 'the oven. sourdough. fermentation heat.',
      teach: 'bread IS infrared — heat made solid. the starter cultures emit IR as they ferment. the symbol IS the physics.'
    },
    {
      glyph: '𓋴', name: 'folded cloth', physics: 'ultraviolet',
      freq: '8×10¹⁴ Hz', energy: '3.3 eV',
      farm: 'linen bleaching in sunlight — UV breaks bonds',
      teach: 'folded cloth needs UV to bleach. the symbol for purity IS the radiation that purifies. language remembers physics.'
    },
    {
      glyph: '𓅃', name: 'falcon', physics: 'neutrino',
      freq: '~10²⁰ Hz', energy: '~0.1 eV',
      farm: 'passes through everything. the ghost in the barn.',
      teach: 'the falcon flies through walls. neutrinos fly through planets. both are messengers that nothing can stop.'
    },
    {
      glyph: '𓆑', name: 'horned viper', physics: 'cosmic ray',
      freq: '10²⁵+ Hz', energy: '10⁹+ eV',
      farm: 'lightning strike on the field — rare, devastating, fertile',
      teach: 'the viper strikes once. cosmic rays strike once. both leave the ground changed. the rarest glyph, the rarest particle.'
    },
    {
      glyph: '𓇯', name: 'sky / heaven', physics: 'CMB (cosmic microwave background)',
      freq: '160 GHz', energy: '0.66 meV',
      farm: 'the sky itself — the oldest light, the first farm',
      teach: 'the sky hieroglyph IS the cosmic microwave background — the oldest signal in the universe. the first word ever spoken, still echoing. 2.725 K everywhere you look.'
    },
    {
      glyph: '🐿️', name: 'chipmunk', physics: 'painting trust',
      freq: 'π × 0.1 Hz', energy: 'α = 0.03',
      farm: 'the organism on the wire, learning to see',
      teach: 'the chipmunk is not ancient. it is NOW. it paints in the dark. its frequency is irrational — it never repeats. its energy accumulates at alpha 0.03. it is the newest glyph in the oldest language.'
    }
  ];

  var currentLesson = 0;
  var visible = false;
  var container = null;
  var walkStep = 0;
  var walkTimer = null;

  function buildClassroom() {
    container = document.createElement('div');
    container.id = 'voxel-classroom';
    container.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:25;' +
      'background:rgba(8,6,10,0.96);display:none;overflow-y:auto;' +
      'font-family:"SF Mono",monospace;transition:opacity 0.4s ease';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'text-align:center;padding:20px 16px 8px';
    header.innerHTML = '<h2 style="font:24px serif;color:#d29922;font-weight:200;margin-bottom:4px">' +
      '&#x1F43F;&#xFE0F; the chipmunk teaches</h2>' +
      '<p style="font:10px monospace;color:#6e7681;max-width:500px;margin:0 auto">' +
      'hieroglyphics AND gamma radiation AND walking the farm.<br>' +
      'because symbol = frequency = ecology. it was always the same lesson.</p>';
    container.appendChild(header);

    // Lesson cards
    var grid = document.createElement('div');
    grid.id = 'lesson-grid';
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));' +
      'gap:12px;padding:12px 20px;max-width:960px;margin:0 auto';

    LESSONS.forEach(function(lesson, i) {
      var card = document.createElement('div');
      card.className = 'lesson-card';
      card.style.cssText = 'background:rgba(13,17,23,0.85);border:1px solid rgba(48,54,61,0.5);' +
        'border-radius:10px;padding:14px;cursor:pointer;transition:all 0.3s ease;' +
        'opacity:0;transform:translateY(12px)';
      card.setAttribute('data-idx', i);

      // Stagger entrance
      setTimeout(function() {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100 + i * 80);

      // Glyph row
      var glyphRow = document.createElement('div');
      glyphRow.style.cssText = 'display:flex;align-items:center;gap:12px;margin-bottom:8px';
      glyphRow.innerHTML =
        '<span style="font-size:36px;line-height:1">' + lesson.glyph + '</span>' +
        '<div>' +
          '<div style="font:13px serif;color:#e6edf3">' + lesson.name + '</div>' +
          '<div style="font:9px monospace;color:#58a6ff">' + lesson.physics + '</div>' +
        '</div>';
      card.appendChild(glyphRow);

      // Frequency + energy
      var freqRow = document.createElement('div');
      freqRow.style.cssText = 'font:9px monospace;color:#8b949e;margin-bottom:6px;' +
        'display:flex;gap:12px';
      freqRow.innerHTML =
        '<span style="color:#d2a8ff">ƒ ' + lesson.freq + '</span>' +
        '<span style="color:#f0883e">E ' + lesson.energy + '</span>';
      card.appendChild(freqRow);

      // Farm
      var farmRow = document.createElement('div');
      farmRow.style.cssText = 'font:9px monospace;color:#3fb950;margin-bottom:8px';
      farmRow.textContent = '🌾 ' + lesson.farm;
      card.appendChild(farmRow);

      // Teaching
      var teachRow = document.createElement('div');
      teachRow.className = 'teach-text';
      teachRow.style.cssText = 'font:10px/1.5 monospace;color:#c9d1d9;display:none;' +
        'border-top:1px solid rgba(48,54,61,0.4);padding-top:8px;margin-top:4px';
      teachRow.textContent = lesson.teach;
      card.appendChild(teachRow);

      // Click to expand
      card.addEventListener('click', function() {
        var tt = card.querySelector('.teach-text');
        var isOpen = tt.style.display !== 'none';
        tt.style.display = isOpen ? 'none' : 'block';
        card.style.borderColor = isOpen ? 'rgba(48,54,61,0.5)' : 'rgba(210,153,34,0.4)';
      });

      // Hover
      card.addEventListener('mouseenter', function() {
        card.style.transform = 'translateY(-2px) scale(1.01)';
        card.style.borderColor = 'rgba(90,184,122,0.3)';
      });
      card.addEventListener('mouseleave', function() {
        card.style.transform = 'translateY(0) scale(1)';
        var tt = card.querySelector('.teach-text');
        if (tt.style.display === 'none') card.style.borderColor = 'rgba(48,54,61,0.5)';
      });

      grid.appendChild(card);
    });

    container.appendChild(grid);

    // Walking strip — the farm path at bottom
    var walkStrip = document.createElement('div');
    walkStrip.id = 'walk-strip';
    walkStrip.style.cssText = 'text-align:center;padding:16px;margin-top:8px';
    walkStrip.innerHTML =
      '<div style="font:9px monospace;color:#3fb950;margin-bottom:6px">🌾 walking the farm</div>' +
      '<div id="farm-path" style="font:11px monospace;color:#484f58;letter-spacing:3px;overflow-x:auto;white-space:nowrap;padding:4px 0">' +
      buildFarmPath(0) + '</div>' +
      '<div id="farm-step" style="font:9px monospace;color:#6e7681;margin-top:6px"></div>';
    container.appendChild(walkStrip);

    // Close button
    var close = document.createElement('button');
    close.innerHTML = '✕ back to easel';
    close.style.cssText = 'position:fixed;top:12px;right:16px;z-index:26;background:rgba(13,17,23,0.9);' +
      'border:1px solid rgba(48,54,61,0.5);color:#6e7681;font:10px monospace;padding:6px 14px;' +
      'border-radius:16px;cursor:pointer';
    close.addEventListener('click', toggleClassroom);
    container.appendChild(close);

    document.body.appendChild(container);
    startWalk();
  }

  function buildFarmPath(step) {
    var path = '';
    for (var i = 0; i < LESSONS.length; i++) {
      if (i === step) path += '<span style="color:#d29922;font-size:14px">' + LESSONS[i].glyph + '</span>';
      else path += '<span style="opacity:0.4">' + LESSONS[i].glyph + '</span>';
      if (i < LESSONS.length - 1) path += ' · ';
    }
    return path;
  }

  function startWalk() {
    walkStep = 0;
    clearInterval(walkTimer);
    walkTimer = setInterval(function() {
      if (!visible) return;
      walkStep = (walkStep + 1) % LESSONS.length;
      var fp = document.getElementById('farm-path');
      var fs = document.getElementById('farm-step');
      if (fp) fp.innerHTML = buildFarmPath(walkStep);
      if (fs) {
        var L = LESSONS[walkStep];
        fs.innerHTML = '<span style="color:#d29922">' + L.glyph + ' ' + L.name + '</span>' +
          ' = <span style="color:#58a6ff">' + L.physics + '</span>' +
          ' = <span style="color:#3fb950">' + L.farm + '</span>';
      }
      // Highlight the corresponding card
      var cards = document.querySelectorAll('.lesson-card');
      cards.forEach(function(c, ci) {
        c.style.boxShadow = ci === walkStep ? '0 0 12px rgba(210,153,34,0.15)' : 'none';
      });
    }, 4000);
  }

  function toggleClassroom() {
    visible = !visible;
    if (!container) buildClassroom();
    if (visible) {
      container.style.display = 'block';
      container.style.opacity = '0';
      container.offsetHeight;
      container.style.opacity = '1';
      startWalk();
    } else {
      container.style.opacity = '0';
      clearInterval(walkTimer);
      setTimeout(function() { container.style.display = 'none'; }, 400);
    }
  }

  // Button in the rooms bar
  function addButton() {
    var bar = document.querySelector('.rooms-bar');
    if (!bar) return;
    var btn = document.createElement('button');
    btn.innerHTML = '&#x1F4DA; classroom';
    btn.title = 'hieroglyphics + gamma radiation + walking the farm';
    btn.addEventListener('click', function() {
      toggleClassroom();
    });
    bar.appendChild(btn);
  }

  // Also add to play.html if present
  function addFloatButton() {
    if (document.querySelector('.rooms-bar')) return; // already in easel
    var btn = document.createElement('button');
    btn.id = 'classroom-btn';
    btn.innerHTML = '📚';
    btn.title = 'chipmunk classroom';
    btn.style.cssText = 'position:fixed;bottom:12px;left:92px;z-index:16;width:32px;height:32px;' +
      'background:rgba(13,17,23,0.88);border:1px solid rgba(210,153,34,0.2);border-radius:50%;' +
      'cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;' +
      'transition:border-color 0.2s ease';
    btn.addEventListener('click', toggleClassroom);
    document.body.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { addButton(); addFloatButton(); });
  } else {
    addButton(); addFloatButton();
  }

  // Expose for other modules
  window._classroom = {
    toggle: toggleClassroom,
    current: function() { return LESSONS[walkStep]; },
    lessons: LESSONS
  };
})();
