// desk-convergence.js — THE COCKPIT: everything converges here
// THE BUTTON + tolerance + investigation + mesh + rhythm + teorah
// Wave 188: all surfaces pulled to the desk — the convergence point
(function(){
'use strict';
var D = window.Desk;

function R(label, val, cls) {
  return '<div class="conv-row"><span>' + label + '</span><span class="' + (cls||'cv') + '">' + val + '</span></div>';
}
function N(n) { return n == null ? '—' : typeof n === 'number' ? n.toLocaleString() : String(n); }
function P(n) { return n == null ? '—' : (n * 100).toFixed(1) + '%'; }

D.renderConvergence = function(container) {
  var h = '<div class="cg">';
  h += '<div class="cp cp-btn"><h3>⊙ THE BUTTON</h3><div id="c-btn">loading...</div></div>';
  h += '<div class="cp cp-tol"><h3 style="color:#3fb950">tolerance</h3><div id="c-tol">loading...</div></div>';
  h += '<div class="cp cp-inv"><h3 style="color:#f1c40f">investigation</h3><div id="c-inv">loading...</div></div>';
  h += '<div class="cp cp-msh"><h3 style="color:#58a6ff">mesh</h3><div id="c-msh">loading...</div></div>';
  h += '<div class="cp cp-rhy"><h3 style="color:#f0883e">rhythm</h3><div id="c-rhy">loading...</div></div>';
  h += '<div class="cp cp-teo"><h3 style="color:#a371f7">teorah</h3><div id="c-teo">loading...</div></div>';
  h += '</div>';

  h += '<style>';
  h += '.cg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;height:calc(100vh - 100px);grid-template-rows:1fr 1fr}';
  h += '.cp{background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:10px;overflow-y:auto;transition:border-color 0.3s}';
  h += '.cp:hover{border-color:var(--border-active)}';
  h += '.cp h3{font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;color:#f85149}';
  h += '.conv-row{display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(48,54,61,0.3);font-size:11px;line-height:1.7}';
  h += '.cv{color:var(--fg)}.ch{color:#d29922}.ca{color:#3fb950}.cw{color:#f85149}.cl{color:#58a6ff;text-decoration:none;font-size:10px}';
  h += '.cl:hover{text-decoration:underline}';
  h += '.cb{width:44px;height:44px;border-radius:50%;border:2px solid #f85149;margin:8px auto;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s}';
  h += '.cb:hover{background:rgba(248,81,73,0.15);box-shadow:0 0 12px rgba(248,81,73,0.3)}';
  h += '@media(max-width:900px){.cg{grid-template-columns:1fr 1fr}}';
  h += '@media(max-width:600px){.cg{grid-template-columns:1fr;grid-template-rows:auto}}';
  h += '</style>';

  container.innerHTML = h;

  var t = '?t=' + Date.now();
  Promise.all([
    fetch('/dashboard.json'+t).then(function(r){return r.json()}).catch(function(){return {}}),
    fetch('/proton-pulse.json'+t).then(function(r){return r.json()}).catch(function(){return {}}),
    fetch('/mesh-ring.json'+t).then(function(r){return r.json()}).catch(function(){return {}}),
    fetch('/human-expects.json'+t).then(function(r){return r.json()}).catch(function(){return {}}),
    fetch('/chipmunk.json'+t).then(function(r){return r.json()}).catch(function(){return {}}),
    fetch('/braid.json'+t).then(function(r){return r.json()}).catch(function(){return {}}),
    fetch('/temperature.json'+t).then(function(r){return r.json()}).catch(function(){return {}})
  ]).then(function(feeds) {
    var dash=feeds[0], proton=feeds[1], mesh=feeds[2], expects=feeds[3], chip=feeds[4], braid=feeds[5], temp=feeds[6]||{};

    // Anderson data
    var as = dash.anderson_selectivity || {};
    var modes = as.modes || [];
    var sel = as.selectivity_observed || 0.97;
    var pielou = as.pielou_j || 0;

    // Sort compression
    var sc = dash.sort_compression || {};

    // Three-body pi
    var pi = dash.threebody_pi || {};

    // Rhythm from chipmunk
    var rhythm = chip.rhythm || {};

    // ═══ THE BUTTON ═══
    var el = document.getElementById('c-btn');
    if (el) el.innerHTML =
      R('ZK pair', 'SoloKey + digital') +
      R('selectivity', P(sel), sel>0.95?'ca':'ch') +
      R('humans', N(dash.human_ips), 'ca') +
      R('fleet', N(dash.fleet_ips)) +
      R('total requests', N(dash.total_requests)) +
      R('rps', (dash.rps||0).toFixed(1)) +
      R('state', 'armed', 'ca') +
      '<div class="cb" onclick="if(window._membraneSound&&window._membraneSound.isActive()){window._membraneSound.speak(\'singularity\')}" title="the signal IS the proof"><span style="color:#f85149;font-size:18px">⊙</span></div>' +
      '<div style="text-align:center;font-size:9px;color:var(--fg-muted)">the signal IS the proof</div>';

    // ═══ TOLERANCE ═══
    el = document.getElementById('c-tol');
    if (el) {
      var modeRows = modes.map(function(m) {
        return R(m["class"] + ' (p=' + (m.p_observed||0).toFixed(2) + ')', N(m.count), m.p_observed>0.8?'ca':m.p_observed>0.3?'ch':'cw');
      }).join('');
      el.innerHTML =
        R('anderson selectivity', P(sel), sel>0.95?'ca':'ch') +
        R('pielou evenness', pielou.toFixed(3)) +
        R('w population', (as.w_population||0).toFixed(1)) +
        R('d mesh', as.d_mesh||'—') +
        modeRows +
        R('shifters', N(dash.trajectory ? dash.trajectory.multi_host_ips : '—'));
    }

    // ═══ INVESTIGATION ═══
    el = document.getElementById('c-inv');
    if (el) {
      var partials = (expects.investigation||{}).partials_needing_human||[];
      var graphs = braid.graph || {};
      el.innerHTML =
        R('entities', N(dash.entity_count||0)) +
        R('epitopes', N(dash.epitope_summary ? dash.epitope_summary.active : '—')) +
        R('sort gain', (sc.total_gain||0).toFixed(1) + ' bits') +
        R('strongest', (sc.strongest_epitope||{}).name||'—') +
        R('needs human', N(partials.length), partials.length>0?'ch':'ca') +
        R('graph nodes', N(graphs.nodes||0)) +
        R('graph edges', N(graphs.edges||0)) +
        R('braids', N((braid.braids||[]).length) + ' routes') +
        '<div style="margin-top:6px">' +
        '<a href="https://clutch.primals.eco" target="_blank" class="cl">◈ clutch</a> · ' +
        '<a href="https://detroit.primals.eco" target="_blank" class="cl">◈ detroit</a> · ' +
        '<a href="/playground" class="cl">△ sort</a></div>';
    }

    // ═══ MESH ═══
    el = document.getElementById('c-msh');
    if (el) {
      var nodes = mesh.nodes || [];
      var aliveCount = nodes.filter(function(n){return n.alive!==false}).length;
      el.innerHTML = nodes.map(function(n) {
        var a = n.alive !== false;
        return R(n.name||'?', (a?'●':'○') + ' ' + (n.rtt_ms?n.rtt_ms+'ms':n.role||''), a?'ca':'cw');
      }).join('') +
      R('WG mesh', aliveCount + '/' + nodes.length, aliveCount===nodes.length?'ca':'ch') +
      R('unique IPs', N(dash.unique_ips)) +
      R('subnets', N(dash.subnets ? dash.subnets.length : '—')) +
      '<div style="margin-top:6px">' +
      '<a href="/water" class="cl">⊙ water</a> · ' +
      '<a href="/neutron/core.html" class="cl">◉ core</a> · ' +
      '<a href="/neutron/globe.html" class="cl">🌐 globe</a></div>';
    }

    // ═══ RHYTHM ═══
    el = document.getElementById('c-rhy');
    if (el) {
      var pert = proton.perturbation || 0;
      el.innerHTML =
        R('pulse', 'every 2 min', 'ca') +
        R('perturbation', pert.toFixed(4), pert>0.01?'ch':'ca') +
        R('proton events', N((proton.events||[]).length)) +
        R('organisms', N(rhythm.organisms_total||0)) +
        R('sockets', 'e:' + (rhythm.sockets?rhythm.sockets.eastgate:'?') + ' g:' + (rhythm.sockets?rhythm.sockets.golgi:'?') + ' s:' + (rhythm.sockets?rhythm.sockets.sporeGate:'?')) +
        R('beat', rhythm.beat_pattern || '—') +
        R('compression', rhythm.compression_overall || '—') +
        R('🌡 K (neutron)', temp.kelvin ? temp.kelvin.label + ' [' + temp.kelvin.diagnosis + ']' : '—', temp.kelvin&&temp.kelvin.diagnosis==='hot'?'cw':'ca') +
        R('🌡 °C (proton)', temp.celsius ? temp.celsius.label + ' [' + temp.celsius.diagnosis + ']' : '—', temp.celsius&&temp.celsius.diagnosis==='optimal'?'ca':'ch') +
        R('🌡 °F (electron)', temp.fahrenheit ? temp.fahrenheit.label + ' [' + temp.fahrenheit.diagnosis + ']' : '—', temp.fahrenheit&&temp.fahrenheit.diagnosis==='healthy'?'ca':'ch') +
        '<div style="margin-top:6px;cursor:pointer" onclick="if(window._membraneSound){window._membraneSound.activate();window._membraneSound.speak(\'membrane\')}">' +
        '<span class="cl">♪ activate sound</span></div>';
    }

    // ═══ TEORAH ═══
    el = document.getElementById('c-teo');
    if (el) {
      var ep = dash.epitope_summary || {};
      var tb = pi.theory || {};
      el.innerHTML =
        R('π body', '1 × π × π × π') +
        R('E = mc² / 4π', (tb.energy_4pi||0).toFixed(4)) +
        R('c² = 3π', (tb.c2_3pi||0).toFixed(4)) +
        R('m = 4/3', (tb.mass_4_3||0).toFixed(6)) +
        R('archimedes gap', (pi.archimedes_gap||0).toFixed(6)) +
        R('z arg/π', (pi.z_arg_over_pi||0).toFixed(6)) +
        R('sort ratio', (sc.ratio||0).toFixed(3) + ' → 1/π', 'ch') +
        R('compression', (sc.alpha||0).toFixed(1) + '/' + (sc.epitope||0).toFixed(1) + '/' + (sc.tense||0).toFixed(1) + ' bits') +
        R('total cost', '$0.30', 'ca');
      // Fetch layers and append
      fetch('/system-layers.json?t='+Date.now()).then(function(r){return r.json()}).then(function(sl){
        var t = document.getElementById('c-teo');
        if (t) t.innerHTML +=
          R('layers', (sl.layers||[]).length + ' composed') +
          R('silicon', (sl.layers&&sl.layers[0]?sl.layers[0].total_cores:'?') + ' cores · ' + (sl.layers&&sl.layers[0]?sl.layers[0].total_ram_gb:'?') + 'GB') +
          R('feeds', (sl.layers&&sl.layers[3]?sl.layers[3].total:'?') + ' (' + (sl.layers&&sl.layers[3]?sl.layers[3].active:'?') + ' active)') +
          R('surfaces', (sl.layers&&sl.layers[4]?sl.layers[4].total:'?') + ' pages') +
          R('fossils', (sl.layers&&sl.layers[7]?sl.layers[7].fossils:'?')) +
          '<div style="margin-top:6px">' +
          '<a href="/braid/" class="cl">⟠ braid</a> · ' +
          '<a href="/neutron/helix.html" class="cl">🧬 helix</a></div>';
      }).catch(function(){});
    }
  }).catch(function(e) { console.warn('[cockpit] fetch error:', e); });
};
})();
