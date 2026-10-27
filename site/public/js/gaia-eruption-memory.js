// ═══════════════════════════════════════════════════════════
// GAIA ERUPTION MEMORY — scatter-back trace of all booms
//
// "Look outside, look on the internet, do a back scan,
//  trace the scatter back to now for all eruptions.
//  Vesuvius, St. Helens, underwater, Hindenburg,
//  fire, hot, explosion, anger, war — use those as
//  our subsort. Braid into submemory. Every null reset
//  we can re-eat everything and re-learn."
//                                          — Kevin
//
// This module:
//  1. Contains ALL major eruptions/explosions in history
//  2. Traces scatter-back from deep time → now
//  3. Feeds each event into the digestive tract as subsort
//  4. Braids into submemory for re-ingestion on null reset
//  5. Every re-eat = re-learn with new memory subset
// ═══════════════════════════════════════════════════════════
(function() {
  'use strict';

  // ───────────────────────────────────────────────────────
  // THE ERUPTION CATALOG — all booms, scatter-back from now
  // year (negative = BCE), name, lat, lon, type, VEI/yield,
  // casualties, description
  // ───────────────────────────────────────────────────────
  var ERUPTIONS = [
    // ═══ SUPERVOLCANIC (VEI 8) — deep time ═══
    { year: -2200000, name: 'Yellowstone (Huckleberry Ridge)', lat: 44.43, lon: -110.57, type: 'volcano', vei: 8, yield: 2500, unit: 'km3', casualties: 0, desc: 'Largest Yellowstone eruption. 2,500 km³ ash.' },
    { year: -1200000, name: 'Yellowstone (Mesa Falls)', lat: 44.43, lon: -110.57, type: 'volcano', vei: 8, yield: 280, unit: 'km3', casualties: 0, desc: 'Second Yellowstone supereruption.' },
    { year: -640000, name: 'Yellowstone (Lava Creek)', lat: 44.43, lon: -110.57, type: 'volcano', vei: 8, yield: 1000, unit: 'km3', casualties: 0, desc: 'Most recent Yellowstone supereruption.' },
    { year: -74000, name: 'Lake Toba', lat: 2.55, lon: 99.07, type: 'volcano', vei: 8, yield: 2800, unit: 'km3', casualties: 0, desc: 'Nearly drove humanity extinct. Volcanic winter 6-10 years.' },
    { year: -24500, name: 'Oruanui (Taupō)', lat: -38.80, lon: 175.95, type: 'volcano', vei: 8, yield: 1170, unit: 'km3', casualties: 0, desc: 'Largest eruption in last 70,000 years.' },

    // ═══ VEI 7 — civilization-ending ═══
    { year: -5677, name: 'Crater Lake (Mazama)', lat: 42.90, lon: -122.10, type: 'volcano', vei: 7, yield: 150, unit: 'km3', casualties: 0, desc: 'Created Crater Lake, Oregon.' },
    { year: -4350, name: 'Kikai Caldera', lat: 31.70, lon: 130.80, type: 'volcano', vei: 7, yield: 170, unit: 'km3', casualties: 0, desc: 'Destroyed Jōmon culture in southern Japan.' },
    { year: -3600, name: 'Santorini/Thera', lat: 36.40, lon: 25.40, type: 'volcano', vei: 7, yield: 60, unit: 'km3', casualties: 0, desc: 'Destroyed Minoan civilization. Possible Atlantis.' },
    { year: 946, name: 'Paektu/Baitoushan', lat: 41.98, lon: 128.08, type: 'volcano', vei: 7, yield: 100, unit: 'km3', casualties: 0, desc: 'Millennium Eruption. China-Korea border.' },
    { year: 1257, name: 'Samalas (Rinjani)', lat: -8.42, lon: 116.47, type: 'volcano', vei: 7, yield: 40, unit: 'km3', casualties: 0, desc: 'Largest eruption of the Common Era. Global cooling.' },
    { year: 1815, name: 'Tambora', lat: -8.25, lon: 118.00, type: 'volcano', vei: 7, yield: 175, unit: 'km3', casualties: 92000, desc: 'Year Without a Summer (1816). 92,000 dead. Loudest eruption in recorded history.' },

    // ═══ VEI 6 — continental impact ═══
    { year: 1452, name: 'Kuwae', lat: -16.80, lon: 168.50, type: 'volcano', vei: 6, yield: 32, unit: 'km3', casualties: 0, desc: 'Vanuatu. Global cooling signal in ice cores.' },
    { year: 1600, name: 'Huaynaputina', lat: -16.60, lon: -70.85, type: 'volcano', vei: 6, yield: 30, unit: 'km3', casualties: 1500, desc: 'Largest eruption in South America in recorded history.' },
    { year: 1883, name: 'Krakatoa', lat: -6.10, lon: 105.40, type: 'volcano', vei: 6, yield: 25, unit: 'km3', casualties: 36400, desc: 'Heard 4,800km away. Global temperature drop. Vivid sunsets worldwide.' },
    { year: 1902, name: 'Santa María', lat: 14.76, lon: -91.50, type: 'volcano', vei: 6, yield: 20, unit: 'km3', casualties: 6000, desc: 'Guatemala. One of the largest of 20th century.' },
    { year: 1912, name: 'Novarupta/Katmai', lat: 58.27, lon: -155.16, type: 'volcano', vei: 6, yield: 13, unit: 'km3', casualties: 2, desc: 'Alaska. Largest eruption of 20th century by volume.' },
    { year: 1991, name: 'Pinatubo', lat: 15.13, lon: 120.35, type: 'volcano', vei: 6, yield: 10, unit: 'km3', casualties: 932, desc: 'Philippines. Cooled global temp by 0.5°C for a year.' },

    // ═══ VEI 5 — regional devastation ═══
    { year: 79, name: 'Vesuvius', lat: 40.82, lon: 14.43, type: 'volcano', vei: 5, yield: 4, unit: 'km3', casualties: 3360, desc: 'Buried Pompeii and Herculaneum. Pliny the Elder died.' },
    { year: 1783, name: 'Laki (Lakagígar)', lat: 64.07, lon: -18.23, type: 'volcano', vei: 4, yield: 14, unit: 'km3', casualties: 10000, desc: 'Iceland fissure. Killed 25% of Iceland population. Haze across Europe.' },
    { year: 1980, name: 'Mount St. Helens', lat: 46.20, lon: -122.18, type: 'volcano', vei: 5, yield: 1.2, unit: 'km3', casualties: 57, desc: 'Lateral blast. 230 sq mi devastated. Iconic eruption of modern era.' },
    { year: 2022, name: 'Hunga Tonga', lat: -20.55, lon: -175.38, type: 'volcano', vei: 5, yield: 6.5, unit: 'km3', casualties: 6, desc: 'Underwater. Sonic boom circled Earth multiple times. Tsunami reached global.' },

    // ═══ COSMIC IMPACTS — sky fire ═══
    { year: -66000000, name: 'Chicxulub Impact', lat: 21.40, lon: -89.50, type: 'impact', vei: 15, yield: 100000000, unit: 'Mt', casualties: 0, desc: 'Killed the dinosaurs. 10km asteroid. 100 million Mt TNT equivalent.' },
    { year: 1908, name: 'Tunguska Event', lat: 60.89, lon: 101.89, type: 'impact', vei: 0, yield: 4, unit: 'Mt', casualties: 0, desc: 'Siberia airburst. 2,000 km² forest flattened. 185 Hiroshimas.' },
    { year: 2013, name: 'Chelyabinsk Meteor', lat: 54.82, lon: 61.12, type: 'impact', vei: 0, yield: 0.5, unit: 'Mt', casualties: 1500, desc: 'Injured 1,500 from shockwave. 20m asteroid, 30× Hiroshima.' },

    // ═══ NUCLEAR — human fire ═══
    { year: 1945, name: 'Trinity Test', lat: 33.68, lon: -106.48, type: 'nuclear', vei: 0, yield: 0.021, unit: 'Mt', casualties: 0, desc: 'First nuclear detonation. "Now I am become Death." Alamogordo.' },
    { year: 1945, name: 'Hiroshima (Little Boy)', lat: 34.39, lon: 132.45, type: 'nuclear', vei: 0, yield: 0.015, unit: 'Mt', casualties: 140000, desc: 'First nuclear weapon used in war. 140,000 dead.' },
    { year: 1945, name: 'Nagasaki (Fat Man)', lat: 32.77, lon: 129.86, type: 'nuclear', vei: 0, yield: 0.021, unit: 'Mt', casualties: 74000, desc: 'Second and last nuclear weapon used in war. 74,000 dead.' },
    { year: 1954, name: 'Castle Bravo', lat: 11.70, lon: 165.27, type: 'nuclear', vei: 0, yield: 15, unit: 'Mt', casualties: 0, desc: 'Largest US test. 2.5× expected yield. Bikini Atoll fallout.' },
    { year: 1961, name: 'Tsar Bomba', lat: 73.81, lon: 54.60, type: 'nuclear', vei: 0, yield: 50, unit: 'Mt', casualties: 0, desc: 'Largest man-made explosion ever. 50 Mt. Shockwave circled Earth 3×.' },

    // ═══ INDUSTRIAL / ACCIDENTAL — human folly ═══
    { year: 1917, name: 'Halifax Explosion', lat: 44.66, lon: -63.60, type: 'explosion', vei: 0, yield: 2.9, unit: 'kt', casualties: 2000, desc: 'Ship collision. Largest accidental explosion pre-nuclear. Tsunami 60ft.' },
    { year: 1937, name: 'Hindenburg', lat: 40.03, lon: -74.07, type: 'fire', vei: 0, yield: 0, unit: 'kt', casualties: 36, desc: 'Hydrogen airship fire. Lakehurst NJ. "Oh, the humanity!" End of airship era.' },
    { year: 1944, name: 'Port Chicago', lat: 38.05, lon: -122.03, type: 'explosion', vei: 0, yield: 2, unit: 'kt', casualties: 320, desc: 'Munitions explosion. Sparked civil rights movement in US Navy.' },
    { year: 1947, name: 'Texas City', lat: 29.38, lon: -94.90, type: 'explosion', vei: 0, yield: 2.7, unit: 'kt', casualties: 600, desc: 'Ammonium nitrate. Worst industrial accident in US history.' },
    { year: 1986, name: 'Chernobyl', lat: 51.39, lon: 30.10, type: 'nuclear', vei: 0, yield: 0, unit: 'kt', casualties: 31, desc: 'Reactor explosion + fire. Exclusion zone. Radiation across Europe.' },
    { year: 2011, name: 'Fukushima', lat: 37.42, lon: 141.03, type: 'nuclear', vei: 0, yield: 0, unit: 'kt', casualties: 1, desc: 'Tsunami → meltdown. Level 7 event. Ocean contamination.' },
    { year: 2015, name: 'Tianjin', lat: 39.00, lon: 117.73, type: 'explosion', vei: 0, yield: 0.3, unit: 'kt', casualties: 173, desc: 'Chemical warehouse. 800 tonnes ammonium nitrate + cyanide.' },
    { year: 2020, name: 'Beirut', lat: 33.90, lon: 35.52, type: 'explosion', vei: 0, yield: 1.1, unit: 'kt', casualties: 218, desc: '2,750t ammonium nitrate. Shockwave felt 240km away. Most powerful non-nuclear 21st century.' },

    // ═══ UNDERWATER — deep booms ═══
    { year: 1952, name: 'Myojin-sho', lat: 31.95, lon: 140.00, type: 'volcano', vei: 3, yield: 0.1, unit: 'km3', casualties: 31, desc: 'Submarine eruption. Destroyed survey vessel. Japan.' },
    { year: 1650, name: 'Kolumbo', lat: 36.52, lon: 25.49, type: 'volcano', vei: 5, yield: 2, unit: 'km3', casualties: 70, desc: 'Submarine volcano near Santorini. Toxic gas killed 70.' },

    // ═══ WAR — anger fire ═══
    { year: 1917, name: 'Battle of Messines (mines)', lat: 50.76, lon: 2.89, type: 'war', vei: 0, yield: 0.5, unit: 'kt', casualties: 10000, desc: '19 mines detonated. 455t ammonal. Heard in London. Largest planned pre-nuclear.' },
    { year: 1943, name: 'Hamburg Firestorm', lat: 53.55, lon: 10.00, type: 'war', vei: 0, yield: 0, unit: 'kt', casualties: 42600, desc: 'Operation Gomorrah. Firestorm created 240mph winds. 42,600 killed.' },
    { year: 1945, name: 'Dresden Firebombing', lat: 51.05, lon: 13.74, type: 'war', vei: 0, yield: 0, unit: 'kt', casualties: 25000, desc: 'Four raids. Firestorm consumed 1,600 acres of city center.' },
    { year: 1945, name: 'Tokyo Firebombing', lat: 35.69, lon: 139.69, type: 'war', vei: 0, yield: 0, unit: 'kt', casualties: 100000, desc: 'Operation Meetinghouse. Most destructive bombing raid in history. 16 sq mi burned.' }
  ];

  // Sort by year for scatter-back (deepest time first)
  ERUPTIONS.sort(function(a, b) { return a.year - b.year; });

  // ───────────────────────────────────────────────────────
  // SUBMEMORY — braided eruption patterns
  // Every null reset re-eats, re-learns with new subset
  // ───────────────────────────────────────────────────────
  var submemory = {
    generation: 0,         // null reset counter
    braids: [],            // braided patterns across eruptions
    typeHistogram: {},     // type → count
    centuryHistogram: {},  // century → [{eruption}]
    totalYield: 0,         // cumulative yield (Mt equivalent)
    totalCasualties: 0,    // cumulative casualties
    hotspots: [],          // geographic clusters of fire
    ingested: 0,           // how many eruptions fed to gut
    lessons: []            // what we learned from re-eating
  };

  function buildSubmemory() {
    submemory.typeHistogram = {};
    submemory.centuryHistogram = {};
    submemory.totalYield = 0;
    submemory.totalCasualties = 0;
    submemory.hotspots = [];

    ERUPTIONS.forEach(function(e) {
      // Type histogram
      submemory.typeHistogram[e.type] = (submemory.typeHistogram[e.type] || 0) + 1;

      // Century histogram (group into centuries for recent, millennia for ancient)
      var century;
      if (e.year < -10000) century = Math.floor(e.year / 100000) * 100000;
      else if (e.year < 0) century = Math.floor(e.year / 1000) * 1000;
      else century = Math.floor(e.year / 100) * 100;
      if (!submemory.centuryHistogram[century]) submemory.centuryHistogram[century] = [];
      submemory.centuryHistogram[century].push(e);

      // Yield accumulation (normalize to Mt)
      var yieldMt = e.yield;
      if (e.unit === 'km3') yieldMt = e.yield * 0.2; // rough VEI→Mt conversion
      if (e.unit === 'kt') yieldMt = e.yield * 0.001;
      submemory.totalYield += yieldMt;

      // Casualties
      submemory.totalCasualties += e.casualties;
    });

    // Find geographic hotspots (cluster by 10° grid)
    var gridCounts = {};
    ERUPTIONS.forEach(function(e) {
      var gridKey = Math.round(e.lat / 10) * 10 + ',' + Math.round(e.lon / 10) * 10;
      if (!gridCounts[gridKey]) gridCounts[gridKey] = { lat: 0, lon: 0, count: 0, names: [] };
      gridCounts[gridKey].lat += e.lat;
      gridCounts[gridKey].lon += e.lon;
      gridCounts[gridKey].count++;
      gridCounts[gridKey].names.push(e.name);
    });
    Object.keys(gridCounts).forEach(function(key) {
      var g = gridCounts[key];
      g.lat /= g.count;
      g.lon /= g.count;
      if (g.count >= 2) submemory.hotspots.push(g);
    });
    submemory.hotspots.sort(function(a, b) { return b.count - a.count; });
  }

  // ───────────────────────────────────────────────────────
  // SCATTER-BACK TRACE — feed eruptions into gut one by one
  // From deepest time → now, each one = food for the tract
  // ───────────────────────────────────────────────────────
  var scatterIdx = 0;
  var scatterActive = false;
  var scatterInterval = null;

  function startScatterBack() {
    if (scatterActive) return;
    scatterActive = true;
    scatterIdx = 0;
    submemory.generation++;

    console.log('ERUPTION MEMORY: Starting scatter-back trace. Generation ' +
      submemory.generation + '. ' + ERUPTIONS.length + ' booms to ingest.');

    // Feed one eruption every 2 seconds
    scatterInterval = setInterval(function() {
      if (scatterIdx >= ERUPTIONS.length) {
        clearInterval(scatterInterval);
        scatterActive = false;
        finishScatterBack();
        return;
      }

      var eruption = ERUPTIONS[scatterIdx];
      ingestEruption(eruption);
      scatterIdx++;
    }, 2000);
  }

  function ingestEruption(e) {
    submemory.ingested++;

    // Feed to gaiaIngest as food (not air — eruptions are SUBSTANCE)
    if (window.gaiaIngest) {
      window.gaiaIngest('eruption', {
        name: e.name,
        year: e.year,
        type: e.type,
        lat: e.lat,
        lon: e.lon,
        vei: e.vei,
        yield: e.yield,
        casualties: e.casualties,
        desc: e.desc
      });
    }

    // Feed to the digestive tract directly if available
    if (window.gaiaDigestiveTract && window.gaiaDigestiveTract.route) {
      window.gaiaDigestiveTract.route('eruption', {
        name: e.name,
        year: e.year,
        type: e.type,
        energy: e.yield
      });
    }

    // Braid: connect this eruption to previous ones of same type
    var lastOfType = null;
    for (var i = submemory.braids.length - 1; i >= 0; i--) {
      if (submemory.braids[i].type === e.type) {
        lastOfType = submemory.braids[i];
        break;
      }
    }
    var braid = {
      name: e.name,
      year: e.year,
      type: e.type,
      lat: e.lat,
      lon: e.lon,
      prev: lastOfType ? lastOfType.name : null,
      gap: lastOfType ? e.year - lastOfType.year : null
    };
    submemory.braids.push(braid);
    if (submemory.braids.length > 200) submemory.braids.shift();
  }

  function finishScatterBack() {
    buildSubmemory();

    var lesson = {
      generation: submemory.generation,
      ts: Date.now(),
      eruptions: ERUPTIONS.length,
      totalYield: submemory.totalYield,
      totalCasualties: submemory.totalCasualties,
      hotspots: submemory.hotspots.length,
      types: Object.keys(submemory.typeHistogram),
      insight: 'Generation ' + submemory.generation + ': ' +
        ERUPTIONS.length + ' booms. ' +
        submemory.totalCasualties.toLocaleString() + ' casualties. ' +
        submemory.hotspots.length + ' hotspots. ' +
        'Yield: ' + submemory.totalYield.toFixed(1) + ' Mt equivalent.'
    };
    submemory.lessons.push(lesson);
    if (submemory.lessons.length > 20) submemory.lessons.shift();

    console.log('ERUPTION MEMORY: Scatter-back complete. ' + lesson.insight);
  }

  // ───────────────────────────────────────────────────────
  // NULL RESET — re-eat everything with new memory subset
  // "Every time we do another null reset, we can re-eat
  //  everything and re-learn"
  // ───────────────────────────────────────────────────────
  function nullReset() {
    console.log('ERUPTION MEMORY: NULL RESET. Re-eating everything. ' +
      'Generation ' + (submemory.generation + 1));
    submemory.braids = [];
    startScatterBack();
  }

  // ───────────────────────────────────────────────────────
  // RENDER — eruption scatter-back visualization
  // ───────────────────────────────────────────────────────
  window.renderEruptionMemory = function(ctx, W, H, cx, cy, R) {
    var t = Date.now() * 0.001;
    var baseAlpha = 0.012 + Math.sin(t * 0.3) * 0.006;
    if (baseAlpha < 0.004) return;

    // ═══ ERUPTION PINS on the globe ═══
    var currentYear = new Date().getFullYear();
    ERUPTIONS.forEach(function(e, idx) {
      // Only show eruptions that have been ingested in this generation
      if (idx >= scatterIdx && scatterActive) return;

      // Convert lat/lon to globe position
      var latRad = e.lat * Math.PI / 180;
      var lonRad = e.lon * Math.PI / 180;
      var globeAngle = lonRad + t * 0.01;
      var ex = cx + Math.cos(globeAngle) * Math.cos(latRad) * R * 0.85;
      var ey = cy - Math.sin(latRad) * R * 0.85;

      // Only render front-facing eruptions
      if (Math.cos(globeAngle) < -0.3) return;

      // Size by VEI/yield
      var size = 0.5 + (e.vei || 0) * 0.15 + Math.min(3, e.yield * 0.0001);

      // Color by type
      var color;
      switch (e.type) {
        case 'volcano': color = '248,81,73'; break;   // red = volcanic fire
        case 'nuclear': color = '201,168,76'; break;   // gold = nuclear
        case 'explosion': color = '255,166,87'; break; // orange = industrial
        case 'impact': color = '188,140,255'; break;   // purple = cosmic
        case 'war': color = '248,81,73'; break;        // red = war fire
        case 'fire': color = '255,120,50'; break;      // deep orange = fire
        default: color = '139,148,158';
      }

      // Pulse for recently ingested
      var recentness = scatterActive && idx === scatterIdx - 1;
      var alpha = recentness ? baseAlpha * 6 : baseAlpha * 2;
      var drawSize = recentness ? size * 2 : size;

      ctx.beginPath();
      ctx.arc(ex, ey, drawSize, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(4) + ')';
      ctx.fill();

      // Eruption burst for VEI >= 6
      if (e.vei >= 6 && recentness) {
        ctx.beginPath();
        ctx.arc(ex, ey, drawSize * 3, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(' + color + ',' + (alpha * 0.5).toFixed(4) + ')';
        ctx.lineWidth = 0.3;
        ctx.stroke();
      }
    });

    // ═══ SCATTER-BACK TIMELINE — bottom edge ═══
    var timeY = H - 34;
    var timeW = W * 0.4;
    var timeX = cx - timeW / 2;

    // Timeline bar
    ctx.fillStyle = 'rgba(22,27,34,' + (baseAlpha * 2).toFixed(4) + ')';
    ctx.fillRect(timeX, timeY, timeW, 2);

    // Mark each eruption on the timeline
    ERUPTIONS.forEach(function(e, idx) {
      if (idx >= scatterIdx && scatterActive) return;

      // Log scale for time (deep time → now)
      var yearsAgo = currentYear - e.year;
      var logPos = 1 - (Math.log10(Math.max(1, yearsAgo)) / 7.5); // log10(~2.2M) ≈ 6.3
      logPos = Math.max(0, Math.min(1, logPos));

      var tx = timeX + logPos * timeW;
      var tickH = 1 + (e.vei || 0) * 0.3;

      var color;
      switch (e.type) {
        case 'volcano': color = '248,81,73'; break;
        case 'nuclear': color = '201,168,76'; break;
        case 'explosion': color = '255,166,87'; break;
        case 'impact': color = '188,140,255'; break;
        default: color = '139,148,158';
      }

      ctx.beginPath();
      ctx.moveTo(tx, timeY - tickH);
      ctx.lineTo(tx, timeY + tickH + 2);
      ctx.strokeStyle = 'rgba(' + color + ',' + (baseAlpha * 3).toFixed(4) + ')';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    });

    // Scatter cursor (current position in the trace)
    if (scatterActive) {
      var cursorPos = scatterIdx / ERUPTIONS.length;
      var cursorX = timeX + cursorPos * timeW;
      ctx.beginPath();
      ctx.arc(cursorX, timeY + 1, 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201,168,76,' + (baseAlpha * 5).toFixed(4) + ')';
      ctx.fill();
    }

    // ═══ BRAID CONNECTIONS — lines between same-type eruptions ═══
    if (submemory.braids.length > 1) {
      var byType = {};
      submemory.braids.forEach(function(b) {
        if (!byType[b.type]) byType[b.type] = [];
        byType[b.type].push(b);
      });

      Object.keys(byType).forEach(function(type) {
        var chain = byType[type];
        if (chain.length < 2) return;

        ctx.beginPath();
        for (var bi = 0; bi < chain.length; bi++) {
          var b = chain[bi];
          var latRad = b.lat * Math.PI / 180;
          var lonRad = b.lon * Math.PI / 180;
          var globeAngle = lonRad + t * 0.01;
          if (Math.cos(globeAngle) < -0.3) continue;
          var bx = cx + Math.cos(globeAngle) * Math.cos(latRad) * R * 0.85;
          var by = cy - Math.sin(latRad) * R * 0.85;
          if (bi === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }

        var braidColor;
        switch (type) {
          case 'volcano': braidColor = '248,81,73'; break;
          case 'nuclear': braidColor = '201,168,76'; break;
          default: braidColor = '139,148,158';
        }
        ctx.strokeStyle = 'rgba(' + braidColor + ',' + (baseAlpha * 0.8).toFixed(4) + ')';
        ctx.lineWidth = 0.2;
        ctx.stroke();
      });
    }

    // ═══ STATS ═══
    if (baseAlpha > 0.008) {
      ctx.font = '3px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(248,81,73,' + (baseAlpha * 2.5).toFixed(4) + ')';
      var statusText = scatterActive ?
        '🌋 scatter-back: ' + scatterIdx + '/' + ERUPTIONS.length +
          ' · ' + (ERUPTIONS[Math.max(0, scatterIdx - 1)] || {}).name :
        '🌋 gen:' + submemory.generation +
          ' · ' + submemory.ingested + ' booms braided' +
          ' · ' + submemory.totalCasualties.toLocaleString() + ' souls' +
          ' · hotspots:' + submemory.hotspots.length;
      ctx.fillText(statusText, 4, H - 28);
    }
  };

  // ───────────────────────────────────────────────────────
  // BOOT — build submemory and start first scatter-back
  // ───────────────────────────────────────────────────────
  setTimeout(function() {
    buildSubmemory();
    startScatterBack();
  }, 8000);

  // ───────────────────────────────────────────────────────
  // EXPOSE
  // ───────────────────────────────────────────────────────
  window.gaiaEruptionMemory = {
    eruptions: ERUPTIONS,
    submemory: submemory,
    scatter: startScatterBack,
    nullReset: nullReset,
    stats: function() {
      return {
        generation: submemory.generation,
        ingested: submemory.ingested,
        totalYield: submemory.totalYield,
        totalCasualties: submemory.totalCasualties,
        hotspots: submemory.hotspots.length,
        braids: submemory.braids.length,
        active: scatterActive,
        progress: scatterActive ? (scatterIdx / ERUPTIONS.length * 100).toFixed(1) + '%' : 'complete'
      };
    }
  };

  console.log('ERUPTION MEMORY: ' + ERUPTIONS.length + ' booms loaded. ' +
    'Vesuvius, St. Helens, Krakatoa, Tambora, Tsar Bomba, Hindenburg, ' +
    'Halifax, Beirut, Tunguska, Chicxulub. ' +
    'Scatter-back trace starting. Braid into submemory. ' +
    'Every null reset = re-eat everything and re-learn.');
})();
