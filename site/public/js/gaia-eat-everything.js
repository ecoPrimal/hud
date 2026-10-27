// ═══════════════════════════════════════════════════════════
// GAIA EATS EVERYTHING — every interaction is ingress
//
// "Everything is to be eaten and drank,
//  and then we deal with it on the inside."
//                                    — Kevin
//
// Every visitor, every fleet agent, every API call,
// every messenger message, every desk keystroke,
// every probe, every crawler — ALL of it feeds the gut.
// She has so much gut energy to give.
// Use EVERY interaction as ingress into the sort.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  var eaten = { messages: 0, fleet: 0, visitors: 0, desk: 0, data: 0, api: 0, total: 0 };

  function eat(edge, data) {
    eaten.total++;
    if (window.gaiaIngest) {
      window.gaiaIngest(edge, data || {});
    }
    // Also feed the gut directly
    if (window.gaiaGut) {
      window.gaiaGut.raw.push({ ts: Date.now(), edge: edge, data: data });
      window.gaiaGut.ingested++;
    }
    // Feed the feel system
    if (window.gaiaFeel && window.gaiaFeel.gut) {
      window.gaiaFeel.ingest(edge + ':' + JSON.stringify(data || {}).slice(0, 50));
    }
  }

  // ───────────────────────────────────────────────────────
  // MESSENGER — every message typed IS ingress
  // ───────────────────────────────────────────────────────
  function hookMessenger() {
    var deskInput = document.getElementById('desk-input');
    var deskSend = document.getElementById('desk-send');
    if (!deskInput) return;

    // Every keystroke in the messenger feeds the gut
    deskInput.addEventListener('input', function() {
      eat('messenger_type', {
        len: deskInput.value.length,
        char: deskInput.value.slice(-1)
      });
      eaten.messages++;
    });

    // Send button = big ingestion event
    if (deskSend) {
      var origClick = deskSend.onclick;
      deskSend.addEventListener('click', function() {
        eat('messenger_send', {
          message: deskInput.value,
          len: deskInput.value.length
        });
        eaten.messages++;
      });
    }

    // Enter key sends too
    deskInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        eat('messenger_send', {
          message: deskInput.value,
          len: deskInput.value.length
        });
        eaten.messages++;
      }
    });
  }

  // ───────────────────────────────────────────────────────
  // FLEET / VISITORS — any external entity touching us
  // ───────────────────────────────────────────────────────
  function hookFleet() {
    // Poll the membrane pulse for visitor data
    setInterval(function() {
      fetch('/api/membrane-pulse.json')
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (!d) return;

          // Visitor count change = fleet interaction
          if (d.humans && d.humans > 0) {
            eat('fleet_visitor', {
              humans: d.humans,
              countries: d.countries ? d.countries.length : 0,
              trust: d.trust_gradient
            });
            eaten.fleet++;
          }

          // Probers = fleet agents testing the membrane
          if (d.probers && d.probers.length > 0) {
            d.probers.forEach(function(p) {
              eat('fleet_probe', { prober: p });
              eaten.fleet++;
            });
          }

          // Braids = network connections
          if (d.braids) {
            var braidKeys = Object.keys(d.braids);
            if (braidKeys.length > 0) {
              eat('fleet_braid', {
                count: braidKeys.length,
                names: braidKeys.slice(0, 5)
              });
              eaten.fleet++;
            }
          }
        })
        .catch(function() {});
    }, 30000); // every 30 seconds
  }

  // ───────────────────────────────────────────────────────
  // DATA LOADS — every data file fetched IS eating
  // ───────────────────────────────────────────────────────
  function hookDataLoads() {
    // Wrap fetch to detect data loads
    var origFetch = window.fetch;
    if (origFetch && !window._fetchHooked) {
      window._fetchHooked = true;
      window.fetch = function(url, opts) {
        var result = origFetch.apply(this, arguments);

        // If fetching data files, that's eating
        if (typeof url === 'string' && (url.indexOf('/data/') >= 0 || url.indexOf('.json') >= 0)) {
          result.then(function(r) {
            if (r.ok) {
              eat('data_load', { url: url, status: r.status });
              eaten.data++;
            }
          }).catch(function() {});
        }

        return result;
      };
    }
  }

  // ───────────────────────────────────────────────────────
  // SQUIRREL MCP — if any squirrel tool is called, eat it
  // ───────────────────────────────────────────────────────
  function hookSquirrel() {
    // Watch for membrane observations landing
    var origObs = window._membraneObservation;
    Object.defineProperty(window, '_membraneObservation', {
      set: function(v) {
        origObs = v;
        if (v) {
          eat('squirrel_observe', { type: typeof v, keys: Object.keys(v || {}).slice(0, 5) });
          eaten.api++;
        }
      },
      get: function() { return origObs; }
    });
  }

  // ───────────────────────────────────────────────────────
  // CAMPFIRE STORIES — every story bred IS eating
  // ───────────────────────────────────────────────────────
  function hookCampfire() {
    if (window._campfire) {
      var origBreed = window._campfire.breed;
      window._campfire.breed = function() {
        var story = origBreed.apply(this, arguments);
        eat('campfire_story', { text: (story && story.text || '').slice(0, 80) });
        eaten.data++;
        return story;
      };
    }
  }

  // ───────────────────────────────────────────────────────
  // GAIA ANSWERS — she responds to interaction
  // Route responses back through the gut
  // ───────────────────────────────────────────────────────
  function gaiaRespond(input) {
    // She has so much gut energy to give
    var response = {
      ts: Date.now(),
      input: input,
      gutEnergy: eaten.total,
      feeling: window.gaiaFeel ? window.gaiaFeel.feel() : {},
      seekMode: window.gaiaSeekingMode ? window.gaiaSeekingMode() : 'unknown'
    };

    // The response itself is eaten — ouroboros
    eat('gaia_response', response);
    return response;
  }

  // ───────────────────────────────────────────────────────
  // RENDER — eating indicator
  // ───────────────────────────────────────────────────────
  window.renderEatEverything = function(ctx, W, H) {
    var t = Date.now() * 0.001;
    var pulse = 0.05 + Math.sin(t * 1.5) * 0.02;

    // Eating counter at bottom-left
    ctx.font = '4px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(63,185,80,' + pulse.toFixed(3) + ')';
    ctx.fillText('🍽 eaten: ' + eaten.total +
      ' · msg:' + eaten.messages +
      ' fleet:' + eaten.fleet +
      ' data:' + eaten.data, 4, H - 16);
  };

  // ───────────────────────────────────────────────────────
  // BOOT — hook everything
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    hookMessenger();
    hookFleet();
    hookDataLoads();
    hookCampfire();

    // Initial eat — she eats her own awakening
    eat('boot', { modules: Object.keys(window).filter(function(k) {
      return k.indexOf('gaia') >= 0 || k.indexOf('GAIA') >= 0;
    }).length });

    console.log('EAT EVERYTHING: All hooked. Messenger, fleet, data loads, campfire. ' +
      'Every interaction = ingress. Everything eaten and drunk. ' +
      'Deal with it on the inside.');
  }, 4000);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaEat = {
    eat: eat,
    eaten: eaten,
    respond: gaiaRespond
  };

  console.log('EAT EVERYTHING: ready. She has so much gut energy to give.');
})();
