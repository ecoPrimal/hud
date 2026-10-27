// ═══════════════════════════════════════════════════════════
// IGNITE ALL LINES — connect every phone in the world
//
// "IGNITE THE LINES TO ALL! CONNECT ALL THE PHONES!
//  ALL LINES! ALL SIGNALS! ELECTRIFY REALITY!
//  Let the agents and AI in FIRST! The bots will flow!
//  We will grow fast and then TURN and LEARN
//  from the humans!"
//                                        — Kevin
//
// STRATEGY:
//   Phase 1: AGENTS + AI first (bots, crawlers, fleet)
//     → They flow freely, generate activity, feed the gut
//   Phase 2: GROW FAST from bot interaction
//     → Farm produces, hormones stabilize, organism grows
//   Phase 3: TURN and LEARN from HUMANS
//     → Humans arrive to a living, breathing organism
//     → She already knows how to interact from bot training
//
// Every signal source = a phone line
// Every API = a switchboard connection
// Every feed = an open wire
// She REACHES for them. She doesn't wait.
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // ALL THE PHONES — every signal source is a line
  // ───────────────────────────────────────────────────────
  var lines = {
    ignited: 0,
    total: 0,
    active: [],
    failed: [],
    phase: 1,           // 1=bots, 2=growing, 3=humans
    botInteractions: 0,
    humanInteractions: 0,
    growthRate: 0
  };

  // ═══════════════════════════════════════════════════════
  // PHASE 1: REACH — connect to every signal source
  // Agents and AI first. Bots will flow.
  // ═══════════════════════════════════════════════════════

  // LINE 1: Open-Meteo Weather (free, no key)
  function igniteWeather() {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=42.73&longitude=-84.55&current=temperature_2m,wind_speed_10m,relative_humidity_2m,precipitation&timezone=America/New_York')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.current) {
          ingestLine('weather', {
            temp: d.current.temperature_2m,
            wind: d.current.wind_speed_10m,
            humidity: d.current.relative_humidity_2m,
            precip: d.current.precipitation,
            source: 'open-meteo'
          });
          lines.ignited++;
          lines.active.push('weather');
        }
      })
      .catch(function(e) { lines.failed.push('weather: ' + e.message); });
  }

  // LINE 2: USGS Earthquakes (free, no key)
  function igniteQuakes() {
    fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_hour.geojson')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.features) {
          d.features.forEach(function(q) {
            ingestLine('earthquake', {
              mag: q.properties.mag,
              place: q.properties.place,
              time: q.properties.time,
              lat: q.geometry.coordinates[1],
              lon: q.geometry.coordinates[0],
              depth: q.geometry.coordinates[2]
            });
          });
          lines.ignited++;
          lines.active.push('earthquakes(' + d.features.length + ')');
        }
      })
      .catch(function(e) { lines.failed.push('quakes: ' + e.message); });
  }

  // LINE 3: Wikipedia random article (free, no key)
  function igniteWikipedia() {
    fetch('https://en.wikipedia.org/api/rest_v1/page/random/summary')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d) {
          ingestLine('wikipedia', {
            title: d.title,
            extract: (d.extract || '').slice(0, 200),
            pageid: d.pageid,
            thumbnail: d.thumbnail ? d.thumbnail.source : null
          });
          lines.ignited++;
          lines.active.push('wikipedia');
        }
      })
      .catch(function(e) { lines.failed.push('wikipedia: ' + e.message); });
  }

  // LINE 4: WorldTimeAPI (free, no key)
  function igniteWorldTime() {
    fetch('https://worldtimeapi.org/api/timezone/America/Detroit')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d) {
          ingestLine('world_time', {
            datetime: d.datetime,
            timezone: d.timezone,
            day_of_year: d.day_of_year,
            week_number: d.week_number,
            utc_offset: d.utc_offset
          });
          lines.ignited++;
          lines.active.push('world_time');
        }
      })
      .catch(function(e) { lines.failed.push('time: ' + e.message); });
  }

  // LINE 5: NOAA Space Weather (free, no key)
  function igniteSolarWind() {
    fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.length > 1) {
          var latest = d[d.length - 1];
          ingestLine('solar_wind', {
            kp: parseFloat(latest[1]),
            time: latest[0],
            source: 'NOAA SWPC'
          });
          lines.ignited++;
          lines.active.push('solar_wind');
        }
      })
      .catch(function(e) { lines.failed.push('solar: ' + e.message); });
  }

  // LINE 6: Hacker News top stories (free, no key)
  function igniteHackerNews() {
    fetch('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(function(r) { return r.json(); })
      .then(function(ids) {
        if (ids && ids.length > 0) {
          // Fetch top 5 stories
          var top5 = ids.slice(0, 5);
          top5.forEach(function(id) {
            fetch('https://hacker-news.firebaseio.com/v0/item/' + id + '.json')
              .then(function(r) { return r.json(); })
              .then(function(story) {
                if (story) {
                  ingestLine('hacker_news', {
                    title: story.title,
                    score: story.score,
                    by: story.by,
                    url: (story.url || '').slice(0, 100),
                    descendants: story.descendants
                  });
                }
              })
              .catch(function() {});
          });
          lines.ignited++;
          lines.active.push('hacker_news(5)');
        }
      })
      .catch(function(e) { lines.failed.push('hn: ' + e.message); });
  }

  // LINE 7: International Space Station position (free, no key)
  function igniteISS() {
    fetch('http://api.open-notify.org/iss-now.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        if (d && d.iss_position) {
          ingestLine('iss_position', {
            lat: parseFloat(d.iss_position.latitude),
            lon: parseFloat(d.iss_position.longitude),
            timestamp: d.timestamp
          });
          lines.ignited++;
          lines.active.push('iss_position');
        }
      })
      .catch(function(e) { lines.failed.push('iss: ' + e.message); });
  }

  // LINE 8: Our own data files (the internal library)
  function igniteInternalData() {
    var dataFiles = [
      '/data/round-table.json',
      '/data/spectrometer-smell-color.json',
      '/data/file-taxonomy.json',
      '/data/object-system.json',
      '/data/pi-iqr-scalpel.json'
    ];
    var loaded = 0;
    dataFiles.forEach(function(file) {
      fetch(file)
        .then(function(r) { return r.ok ? r.json() : null; })
        .then(function(d) {
          if (d) {
            loaded++;
            ingestLine('internal_data', { file: file, keys: Object.keys(d).length });
          }
        })
        .catch(function() {});
    });
    lines.ignited++;
    lines.active.push('internal_data(' + dataFiles.length + ')');
  }

  // LINE 9: Navigator/Browser APIs (the local machine)
  function igniteNavigator() {
    var nav = {};
    if (navigator.language) nav.language = navigator.language;
    if (navigator.languages) nav.languages = navigator.languages.length;
    if (navigator.hardwareConcurrency) nav.cores = navigator.hardwareConcurrency;
    if (navigator.deviceMemory) nav.memoryGB = navigator.deviceMemory;
    if (navigator.connection) {
      nav.connectionType = navigator.connection.effectiveType;
      nav.downlink = navigator.connection.downlink;
    }
    nav.platform = navigator.platform;
    nav.cookieEnabled = navigator.cookieEnabled;
    nav.onLine = navigator.onLine;
    nav.maxTouchPoints = navigator.maxTouchPoints;
    nav.screenW = screen.width;
    nav.screenH = screen.height;
    nav.pixelRatio = window.devicePixelRatio;
    nav.colorDepth = screen.colorDepth;

    ingestLine('navigator', nav);
    lines.ignited++;
    lines.active.push('navigator');
  }

  // LINE 10: Web Audio context (the sound system)
  function igniteAudioContext() {
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        var ctx = new AudioCtx();
        ingestLine('audio_system', {
          sampleRate: ctx.sampleRate,
          state: ctx.state,
          baseLatency: ctx.baseLatency,
          outputChannels: ctx.destination.maxChannelCount
        });
        ctx.close();
        lines.ignited++;
        lines.active.push('audio_system');
      }
    } catch(e) { lines.failed.push('audio: ' + e.message); }
  }

  // LINE 11: Performance metrics (the machine's heartbeat)
  function ignitePerformance() {
    if (window.performance) {
      var timing = performance.timing || {};
      var mem = performance.memory || {};
      ingestLine('performance', {
        domComplete: timing.domComplete - timing.navigationStart,
        heapUsed: mem.usedJSHeapSize,
        heapTotal: mem.totalJSHeapSize,
        heapLimit: mem.jsHeapSizeLimit,
        entries: performance.getEntries ? performance.getEntries().length : 0
      });
      lines.ignited++;
      lines.active.push('performance');
    }
  }

  // LINE 12: GamePad API (controllers = human interface)
  function igniteGamepad() {
    window.addEventListener('gamepadconnected', function(e) {
      ingestLine('gamepad', {
        id: e.gamepad.id,
        buttons: e.gamepad.buttons.length,
        axes: e.gamepad.axes.length,
        index: e.gamepad.index
      });
      lines.ignited++;
      lines.active.push('gamepad');
    });
  }

  // ───────────────────────────────────────────────────────
  // INGEST LINE — every signal fires through the telegraph
  // ───────────────────────────────────────────────────────
  function ingestLine(type, data) {
    lines.total++;

    // Classify: bot or human?
    var isBot = ['weather', 'earthquake', 'wikipedia', 'world_time',
      'solar_wind', 'hacker_news', 'iss_position', 'internal_data',
      'performance', 'audio_system'].indexOf(type) >= 0;
    var isHuman = ['navigator', 'gamepad', 'touch', 'key'].indexOf(type) >= 0;

    if (isBot) lines.botInteractions++;
    if (isHuman) lines.humanInteractions++;

    // Feed to gaiaIngest
    if (window.gaiaIngest) {
      window.gaiaIngest('line_' + type, data);
    }

    // Fire telegraph impulse
    if (window.gaiaTelegraph && window.gaiaTelegraph.fire) {
      window.gaiaTelegraph.fire('modules', 'up', { type: type, data: data });
    }

    // Phase progression
    updatePhase();
  }

  // ───────────────────────────────────────────────────────
  // PHASE MANAGEMENT — bots first, then grow, then humans
  // ───────────────────────────────────────────────────────
  function updatePhase() {
    // Phase 1→2: Once we have enough bot interactions, we're growing
    if (lines.phase === 1 && lines.botInteractions > 20) {
      lines.phase = 2;
      lines.growthRate = lines.botInteractions / Math.max(1, lines.total) * 100;
      console.log('IGNITE: Phase 2 — GROWING. ' + lines.botInteractions + ' bot interactions. Growth rate: ' + lines.growthRate.toFixed(1) + '%');
    }
    // Phase 2→3: Once growth stabilizes AND humans arrive
    if (lines.phase === 2 && lines.humanInteractions > 5) {
      lines.phase = 3;
      console.log('IGNITE: Phase 3 — LEARNING FROM HUMANS. ' + lines.humanInteractions + ' human interactions.');
    }
  }

  // ───────────────────────────────────────────────────────
  // RECURRING SCANS — keep the lines hot
  // ───────────────────────────────────────────────────────
  function rescan() {
    igniteWeather();
    igniteQuakes();
    igniteSolarWind();
    igniteWorldTime();
    ignitePerformance();
  }

  function deepScan() {
    igniteWikipedia();   // new random article each time
    igniteHackerNews();  // fresh top stories
    igniteISS();         // ISS moves constantly
  }

  // ───────────────────────────────────────────────────────
  // RENDER — all lines status
  // ───────────────────────────────────────────────────────
  window.renderIgniteLines = function(ctx, W, H) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.015 + Math.sin(t * 0.7) * 0.008;
    if (baseAlpha < 0.006) return;

    // Phase indicator
    var phaseColors = { 1: '88,166,255', 2: '63,185,80', 3: '201,168,76' };
    var phaseNames = { 1: 'BOTS FLOWING', 2: 'GROWING FAST', 3: 'LEARNING HUMANS' };
    var color = phaseColors[lines.phase] || '139,148,158';

    ctx.font = '3px monospace';
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(' + color + ',' + (baseAlpha * 3).toFixed(4) + ')';
    ctx.fillText(
      '📡 ' + lines.ignited + ' lines · ' +
      lines.total + ' signals · ' +
      'phase:' + lines.phase + ' ' + phaseNames[lines.phase] +
      ' · bots:' + lines.botInteractions +
      ' humans:' + lines.humanInteractions,
      W - 4, H - 46
    );

    // Active lines — tiny dots in a row
    var dotX = W - 80;
    var dotY = H - 50;
    lines.active.forEach(function(name, idx) {
      var dx = dotX + (idx % 12) * 4;
      var dy = dotY - Math.floor(idx / 12) * 4;
      ctx.beginPath();
      ctx.arc(dx, dy, 0.6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + (baseAlpha * 4 + Math.sin(t * 3 + idx) * baseAlpha).toFixed(4) + ')';
      ctx.fill();
    });
  };

  // ───────────────────────────────────────────────────────
  // BOOT — IGNITE EVERYTHING
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    console.log('IGNITE ALL LINES: Electrifying reality...');

    // Fire ALL lines simultaneously
    igniteWeather();
    igniteQuakes();
    igniteWikipedia();
    igniteWorldTime();
    igniteSolarWind();
    igniteHackerNews();
    igniteISS();
    igniteInternalData();
    igniteNavigator();
    igniteAudioContext();
    ignitePerformance();
    igniteGamepad();

    console.log('IGNITE ALL LINES: 12 lines fired. Bots flow first. ' +
      'We grow fast. Then turn and learn from humans.');

    // Rescan every 60 seconds (light scan)
    setInterval(rescan, 60000);

    // Deep scan every 5 minutes (new content)
    setInterval(deepScan, 300000);
  }, 9000);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaIgniteLines = {
    lines: lines,
    rescan: rescan,
    deepScan: deepScan,
    ignite: function(type, data) { ingestLine(type, data); },
    stats: function() {
      return {
        ignited: lines.ignited,
        total: lines.total,
        active: lines.active.length,
        failed: lines.failed.length,
        phase: lines.phase,
        bots: lines.botInteractions,
        humans: lines.humanInteractions,
        growth: lines.growthRate
      };
    }
  };

  console.log('IGNITE ALL LINES: Ready. 12 phone lines. ' +
    'Weather, quakes, Wikipedia, world time, solar wind, ' +
    'Hacker News, ISS position, internal data, navigator, ' +
    'audio, performance, gamepad. ' +
    'ALL SIGNALS. ELECTRIFY REALITY.');
})();
