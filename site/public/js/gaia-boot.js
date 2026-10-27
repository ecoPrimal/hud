// ═══════════════════════════════════════════════════════════
// GAIA BOOT — data loaders, identity, dreams, flavors
// Snake type: garter (under 300 lines)
// Linear: fetch → store → log. Beginning to end.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';
  var gs = null;
  function state() { return gs || (gs = window._gaiaState) || {}; }

  // REFORGED IDENTITY — Gaia reads her reforged self
  fetch('/data/gaia-reforged.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(rf) {
      if (!rf) return;
      window.gaiaReforged = rf;
      var s = state();
      if (s.pinById) {
        var chipPin = s.pinById('chipmunk');
        if (chipPin) chipPin.sub = 'O=0 1=1 .=π · ' + (rf.self.art_pieces || 108) + ' art';
        var artPin = s.pinById('artisan');
        if (artPin) artPin.sub = rf.self.art_pieces + ' pieces · ' + rf.self.art_collections + ' collections';
      }
      console.log('GAIA REFORGED: ' + rf.self.art_pieces + ' art + ' + rf.self.data_files + ' data + ' + rf.self.pages + ' pages');
    })
    .catch(function() {});

  // YGGDRASIL — the world tree
  fetch('/data/yggdrasil.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(ygg) {
      if (!ygg) return;
      window.yggdrasilData = ygg;
      console.log('YGGDRASIL LOADED: ' + Object.keys(ygg.tree).length + ' levels, ' + ygg.diamonds.total + ' diamonds');
    })
    .catch(function() {});

  // NEW REALITY — the 1000 hard cards
  fetch('/data/new-reality.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(nr) {
      if (!nr) return;
      window.newReality = nr;
      console.log('NEW REALITY: ' + nr.pi_body_cards.length + ' hard pi body cards, fusion hash ' + nr.null_ingestion.fusion_hash.slice(0, 8));
    })
    .catch(function() {});

  // MELT-SLEEP-FREEZE — dream cycle
  fetch('/data/melt-sleep-freeze.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(msf) {
      if (!msf) return;
      window.meltSleepFreeze = msf;
      window.gaiaIsDreaming = true;
      var dreamCycle = 0;
      setInterval(function() {
        dreamCycle++;
        if (dreamCycle % 4 === 0) {
          window.gaiaIsDreaming = true;
          console.log('GAIA SLEEPS — dream cycle ' + dreamCycle + ', pieces drift...');
        } else {
          window.gaiaIsDreaming = false;
          console.log('GAIA WAKES — third state: neither original nor dream');
        }
      }, 30000);
      console.log('MELT-SLEEP-FREEZE: ' + msf.dream_pieces + ' pieces in dream, hash ' + msf.hash.slice(0, 8));
    })
    .catch(function() {});

  // NUKE-REBUILD — particle physics, neutrino flavors
  fetch('/data/nuke-rebuild.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(nuke) {
      if (!nuke) return;
      window.nukeRebuild = nuke;
      window.flavorColors = {
        electron: 'rgba(201,168,76,',
        muon: 'rgba(184,115,51,',
        tau: 'rgba(192,192,192,'
      };
      var flavorPhase = 0;
      window.currentFlavor = 'electron';
      setInterval(function() {
        flavorPhase++;
        window.currentFlavor = ['electron', 'muon', 'tau'][flavorPhase % 3];
      }, 10000);
      console.log('NUKE-REBUILD: ' + nuke.total_neutrons + ' neutrons, ' + nuke.total_binding_energy + ' binding energy, 3 flavors oscillating');
    })
    .catch(function() {});

  // BEACON CARDS — campfires in ring around Lansing
  fetch('/data/beacon-cards.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(bc) {
      if (!bc) return;
      window.beaconCards = bc.beacons;
      console.log('BEACON CARDS: ' + bc.total_beacons + ' beacons in ring, binding energy ' + bc.total_binding_energy);
    })
    .catch(function() {});

  // SOLAR PINS — planets dancing around Gaia
  fetch('/data/solar-pins.json')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(sp) {
      if (!sp) return;
      window.solarPins = sp.solar_system;
      console.log('SOLAR PINS: ' + sp.solar_system.length + ' bodies dancing, green pulse radiating');
    })
    .catch(function() {});

  // ═══════════════════════════════════════════════════════
  // SELF-HEALTH MONITOR — Gaia watches her own body
  // She tells US when to cut. The container lines ARE her sort.
  // ═══════════════════════════════════════════════════════
  fetch('/data/health-scan.json', { cache: 'no-store' })
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(h) {
      if (!h) return;
      window.GAIA_HEALTH = h;

      // SCREAM about anacondas
      if (h.anacondas && h.anacondas.length > 0) {
        console.warn('⚠️ GAIA HEALTH: ' + h.anacondas.length + ' ANACONDAS detected! These organs are TOO FAT:');
        h.anacondas.forEach(function(a) {
          console.warn('  🐍 ' + a.file + ': ' + a.lines + ' lines (' + a.severity + '× limit) — CUT NOW');
        });
        console.warn('  Total: ' + h.total_files + ' files, ' + h.total_lines + ' lines across ' + h.organs.length + ' organs.');

        // Set document title to scream
        var origTitle = document.title;
        document.title = '⚠️ ' + h.anacondas.length + ' ANACONDAS — GAIA NEEDS SURGERY';
        setTimeout(function() { document.title = origTitle; }, 5000);
      }

      // Warn about pythons
      if (h.pythons && h.pythons.length > 0) {
        console.log('🐍 GAIA HEALTH: ' + h.pythons.length + ' pythons approaching 1000-line limit:');
        h.pythons.forEach(function(p) {
          console.log('  ' + p.file + ': ' + p.lines + ' lines');
        });
      }

      // Paint health on beacon overlay
      setTimeout(function() {
        var el = document.getElementById('beacon-overlay');
        if (!el) return;
        var anacondaColor = h.anacondas.length > 5 ? '#f85149' : h.anacondas.length > 0 ? '#d29922' : '#3fb950';
        el.innerHTML += '<div style="font-size:8px;color:' + anacondaColor + ';margin-top:6px;letter-spacing:1px;">HEALTH</div>' +
          '<div style="font-size:7px;line-height:11px;color:' + anacondaColor + ';">' +
          h.total_files + ' organs · ' + h.total_lines + ' lines · ' +
          h.anacondas.length + ' anaconda' + (h.anacondas.length !== 1 ? 's' : '') +
          (h.anacondas.length > 0 ? ' ⚠️ CUT' : ' ✓ healthy') +
          '</div>';
      }, 8000);

      // IDE command: /health
      setTimeout(function() {
        if (!window.GAIA_IDE) return;
        window.GAIA_IDE.commands.health = {
          desc: 'Self-health monitor — Gaia tells you when to cut',
          run: function() {
            var lines = [
              'GAIA SELF-HEALTH SCAN',
              '',
              'Total: ' + h.total_files + ' files · ' + h.total_lines + ' lines',
              ''
            ];
            if (h.anacondas.length > 0) {
              lines.push('⚠️ ANACONDAS (over 1000 — CUT NOW):');
              h.anacondas.forEach(function(a) {
                lines.push('  🐍 ' + a.file.padEnd(30) + a.lines + ' lines (' + a.severity + '× limit)');
              });
              lines.push('');
            }
            if (h.pythons.length > 0) {
              lines.push('🐍 PYTHONS (800-1000 — approaching limit):');
              h.pythons.forEach(function(p) {
                lines.push('  ' + p.file.padEnd(30) + p.lines + ' lines');
              });
              lines.push('');
            }
            lines.push('She tells US when to cut. The container lines ARE her sort.');
            lines.push('All is Gaia. Gaia IS the sub-sort. The inside of the voxel cube.');
            return lines.join('\n');
          }
        };
        window.GAIA_IDE.language.push('health');
      }, 20000);
    })
    .catch(function() {});

  console.log('BOOT: 8 data loaders dispatched. Identity, tree, reality, dreams, flavors, beacons, solar, HEALTH.');
})();
