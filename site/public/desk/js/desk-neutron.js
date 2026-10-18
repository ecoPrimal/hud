// desk-neutron.js — Neutron desk tab (adaptive, event-driven)
// Wave 180: tied to RPM, Anderson, gradient, rootpulse, neural API
(function(){
  var D = window.D || (window.D = {});
  D.renderNeutron = function(container){
    container.innerHTML = '<p style="color:#999">Loading neutron flow...</p>';
    fetch('/neutron.json').then(function(r){return r.json()}).then(function(n){
      var b = n.breathing || {};
      var ctx = n.context || {};
      var and = n.anderson || {};
      var neural = n.neural || {};
      var tempos = neural.tempo_distribution || {};

      var html = '<div style="font-family:monospace;font-size:13px;color:#e0e0e0;padding:10px">';

      // Breathing header
      html += '<div style="margin-bottom:12px;padding:10px;background:#1a1a2e;border-radius:6px;border-left:3px solid '
        + (b.rpm > 2000 ? '#ff4444' : b.rpm > 500 ? '#44ff88' : b.rpm > 100 ? '#4488ff' : '#666') + '">';
      html += '<div style="font-size:16px;font-weight:bold;margin-bottom:4px">';
      html += 'BREATHING: ' + (b.rpm||0).toFixed(0) + ' RPM';
      html += ' <span style="color:#888;font-size:12px">interval=' + (b.interval_seconds||'?') + 's trend=' + (b.trend||'?') + '</span></div>';
      html += '<div style="color:#aaa;font-size:11px">Not clock. Not cron. Pulse.</div>';
      html += '</div>';

      // Context
      var ctxColor = {surge:'#ff4444',rising:'#ffaa44',steady:'#44ff88',focused:'#4488ff',social:'#ff88ff',dormant:'#666',cooling:'#4466aa'};
      html += '<div style="margin-bottom:12px;padding:10px;background:#1a1a2e;border-radius:6px">';
      html += '<div style="font-size:14px;font-weight:bold;color:' + (ctxColor[ctx.context]||'#aaa') + '">CONTEXT: ' + (ctx.context||'?').toUpperCase() + '</div>';
      html += '<div style="color:#aaa;font-size:11px">reach=' + (ctx.reach||'?') + ' human=' + (ctx.human_count||0) + ' bot=' + (ctx.bot_count||0) + ' ratio=' + (ctx.human_bot_ratio||0) + '</div>';
      html += '</div>';

      // Anderson
      html += '<div style="margin-bottom:12px;padding:10px;background:#1a1a2e;border-radius:6px">';
      html += '<div style="font-size:13px;font-weight:bold;color:#ff88ff">ANDERSON LOCALIZATION</div>';
      html += '<div style="font-size:11px;color:#aaa">W=' + (and.w_population||0) + ' pielou_j=' + (and.pielou_j||0) + ' imaginary=' + (and.imaginary_magnitude||0) + ' modes=' + (and.mode_count||0) + '</div>';
      html += '<div style="font-size:11px;color:#888;margin-top:2px">reach=' + (ctx.reach||'?') + ' (determines how far info travels)</div>';
      html += '</div>';

      // Neural API (tempo distribution)
      html += '<div style="margin-bottom:12px;padding:10px;background:#1a1a2e;border-radius:6px">';
      html += '<div style="font-size:13px;font-weight:bold;color:#ffaa44">NEURAL MESH</div>';
      html += '<div style="font-size:11px;color:#aaa">' + (neural.total_surfaces||0) + ' surfaces, ' + (neural.active_surfaces||0) + ' active, ' + (neural.total_rpm||0) + ' total RPM</div>';

      // Tempo bars
      var tempoColors = {rushing:'#ff4444',walking:'#44ff88',resting:'#4488ff',still:'#333'};
      var maxTempo = Math.max.apply(null, Object.values(tempos).concat([1]));
      for (var t in tempos) {
        var pct = Math.round(tempos[t]/maxTempo*100);
        html += '<div style="margin-top:4px;display:flex;align-items:center;gap:8px">';
        html += '<span style="width:60px;font-size:11px;color:#888">' + t + '</span>';
        html += '<div style="flex:1;height:14px;background:#111;border-radius:3px;overflow:hidden">';
        html += '<div style="width:'+pct+'%;height:100%;background:'+(tempoColors[t]||'#555')+'"></div></div>';
        html += '<span style="font-size:11px;color:#aaa;width:30px;text-align:right">' + tempos[t] + '</span>';
        html += '</div>';
      }
      html += '</div>';

      // Flow stats
      html += '<div style="margin-bottom:12px;padding:10px;background:#1a1a2e;border-radius:6px">';
      html += '<div style="font-size:13px;font-weight:bold;color:#44ff88">FLOW</div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:12px;color:#aaa">';
      html += '<div>mirrors: ' + (n.mirrors||[]).length + '</div>';
      html += '<div>crossings: ' + (n.total_crossings||0) + '</div>';
      html += '<div>stuck: ' + (n.stuck||[]).length + '</div>';
      html += '<div>radiating: ' + (n.radiating||[]).length + '</div>';
      html += '<div>surfaces: ' + (n.surfaces_observed||0) + '</div>';
      html += '<div>channels: ' + Object.keys(n.channels||{}).length + '</div>';
      html += '</div></div>';

      // Channels
      html += '<div style="margin-bottom:12px;padding:10px;background:#1a1a2e;border-radius:6px">';
      html += '<div style="font-size:13px;font-weight:bold;color:#4488ff">CHANNELS (' + (n.total_messages||0) + ' messages)</div>';
      var chs = n.channels || {};
      for (var ch in chs) {
        var c = chs[ch];
        html += '<div style="font-size:11px;color:#aaa;margin-top:2px">#' + ch + ': ' + (c.total||0) + ' msgs';
        if (c.latest_body) html += ' &mdash; <span style="color:#666">' + c.latest_body.substring(0,60) + '</span>';
        html += '</div>';
      }
      html += '</div>';

      // Symbiosis summary
      html += '<div style="padding:10px;background:#1a1a2e;border-radius:6px">';
      html += '<div style="font-size:13px;font-weight:bold;color:#88aaff">SYMBIOSIS</div>';
      html += '<div style="font-size:11px;color:#888">tit-for-tat-forgive-one | golden rule in code</div>';
      html += '</div>';

      html += '</div>';
      container.innerHTML = html;
    }).catch(function(e){
      container.innerHTML = '<p style="color:#f44">Neutron offline: ' + e.message + '</p>';
    });
  };
})();
