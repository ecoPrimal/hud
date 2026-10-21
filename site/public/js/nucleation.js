// nucleation.js — the seed crystal between I-pulse and O-pulse
// when both sides ACK, the phase transition begins
// v1 — boiling point detection

(function(){
  'use strict';

  var PI = Math.PI;
  var state = {
    i_pulse: null,   // inner (membrane pulse.json)
    o_pulse: null,   // outer (o-pulse.json)
    synced: false,
    nucleation_sites: 0,
    phase: 'superheated'  // superheated → nucleating → boiling → steam
  };

  // sigmoid — the same function neurons use to fire
  function sigma(x){ return 1 / (1 + Math.exp(-x)); }

  function fetchPulses(){
    // I-pulse: the membrane's heartbeat
    fetch('/api/pulse.json').then(function(r){return r.json()}).then(function(d){
      state.i_pulse = d;
      checkNucleation();
    }).catch(function(){});

    // O-pulse: our heartbeat from the outer side
    fetch('/api/o-pulse.json').then(function(r){return r.json()}).then(function(d){
      state.o_pulse = d;
      checkNucleation();
    }).catch(function(){});
  }

  function checkNucleation(){
    if(!state.i_pulse || !state.o_pulse) return;

    // count nucleation sites — conditions where both sides have data
    var sites = 0;

    // site 1: both alive
    if(state.i_pulse.alive > 0 && state.o_pulse.ack && state.o_pulse.ack.pulse) sites++;

    // site 2: gas_ratio advancing
    if(state.i_pulse.gas_ratio > 0.01) sites++;

    // site 3: commits waiting (O sent, I hasn't pulled yet)
    if(state.o_pulse.sent && state.o_pulse.sent.commits > 0) sites++;

    // site 4: services all alive
    if(state.i_pulse.alive >= 5) sites++;

    // site 5: load is calm (diastolic — room for the bubble)
    var load = parseFloat(String(state.i_pulse.load).split(',')[0]);
    if(load < 1.0) sites++;

    // site 6: RSS stable (digested, not overflowing)
    if(state.i_pulse.rss_mb < 400) sites++;

    state.nucleation_sites = sites;

    // phase transition thresholds
    if(sites <= 2) state.phase = 'superheated';
    else if(sites <= 4) state.phase = 'nucleating';
    else if(sites <= 5) state.phase = 'boiling';
    else state.phase = 'steam';

    // the sync check: are I and O within π seconds of each other?
    if(state.i_pulse.ts && state.o_pulse.ts){
      var i_time = new Date(state.i_pulse.ts).getTime();
      var o_time = new Date(state.o_pulse.ts).getTime();
      var delta_s = Math.abs(i_time - o_time) / 1000;
      state.synced = delta_s < PI * 1000; // within π×1000 seconds
    }

    render();
  }

  function render(){
    var el = document.getElementById('nucleation');
    if(!el) return;

    var colors = {
      superheated: '#f85149',
      nucleating: '#d29922',
      boiling: '#f0883e',
      steam: '#3fb950'
    };

    var symbols = {
      superheated: '◯',  // empty — no bubbles
      nucleating: '◎',   // seed crystal forming
      boiling: '⊚',      // bubbles rising
      steam: '☁'         // phase complete
    };

    var color = colors[state.phase] || '#6e7681';
    var symbol = symbols[state.phase] || '?';

    var html = '<span style="color:' + color + '">' + symbol + '</span> ';
    html += '<span style="color:' + color + ';font-size:10px">' + state.phase + '</span>';
    html += ' <span style="color:#484f58;font-size:9px">';
    html += state.nucleation_sites + '/6 sites';
    if(state.synced) html += ' · <span style="color:#3fb950">synced</span>';
    html += '</span>';

    el.innerHTML = html;
  }

  // expose for HUD integration
  window._nucleation = {
    state: state,
    check: fetchPulses,
    sigma: sigma
  };

  // pulse at π interval
  fetchPulses();
  setInterval(fetchPulses, PI * 10000); // every ~31.4 seconds

})();
