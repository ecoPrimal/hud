// hud-widget.js — self-contained embeddable HUD bar for any primals.eco site
// Include via: <script src="https://hud.primals.eco/js/hud-widget.js" defer></script>
// No dependencies, no cookies, no tracking. All styles inline.
(function(){
  'use strict';
  var HUD='https://hud.primals.eco';
  var isHud=window.location.hostname==='hud.primals.eco';
  var base=isHud?'':HUD;

  // Don't double-mount if hud-core.js already loaded on the standalone page
  if(document.getElementById('hud-widget-bar'))return;
  // Don't mount on the HUD standalone page itself
  var host=window.location.hostname;
  if(host==='hud.primals.eco'||host==='biomeos.primals.eco'||host==='os.primals.eco')return;

  // ── Inject styles ──
  var style=document.createElement('style');
  style.textContent=
    '#hud-widget-bar{position:fixed;bottom:0;left:0;right:0;z-index:9999;'+
    'background:#010409;border-top:1px solid #21262d;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;'+
    'font-size:13px;color:#c9d1d9;transition:transform 0.3s ease;}'+
    '#hud-widget-bar.hud-collapsed{transform:translateY(calc(100% - 32px));}'+
    '#hud-widget-strip{display:flex;align-items:center;gap:10px;padding:4px 12px;cursor:pointer;flex-wrap:wrap;}'+
    '#hud-widget-strip .hw-pulse{width:6px;height:6px;background:#3fb950;border-radius:50%;animation:hwpulse 2s infinite;flex-shrink:0;}'+
    '@keyframes hwpulse{0%,100%{opacity:1}50%{opacity:0.4}}'+
    '#hud-widget-strip .hw-label{font-family:"Courier New",monospace;font-size:11px;color:#58a6ff;letter-spacing:0.05em;}'+
    '#hud-widget-strip .hw-stat{font-family:"Courier New",monospace;font-size:12px;}'+
    '#hud-widget-strip .hw-sep{color:#30363d;}'+
    '#hud-widget-strip .hw-billboard{font-family:Georgia,serif;font-size:12px;color:#8b949e;max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'+
    '#hud-widget-strip .hw-toggle{margin-left:auto;color:#6e7681;font-size:10px;cursor:pointer;padding:2px 6px;}'+
    '#hud-widget-expand{display:none;padding:8px 12px;border-top:1px solid #21262d;max-height:50vh;overflow-y:auto;}'+
    '#hud-widget-expand.hw-open{display:block;}'+
    '#hud-widget-expand .hw-section{margin-bottom:10px;}'+
    '#hud-widget-expand .hw-section-title{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#6e7681;margin-bottom:4px;}'+
    '#hud-widget-expand .hw-org-grid{display:flex;gap:6px;flex-wrap:wrap;}'+
    '#hud-widget-expand .hw-org{background:#161b22;border:1px solid #21262d;border-radius:4px;padding:4px 8px;font-size:11px;}'+
    '#hud-widget-expand .hw-geo-row{display:flex;align-items:center;gap:6px;font-size:11px;margin:2px 0;}'+
    '#hud-widget-expand .hw-geo-bar{background:#30363d;height:8px;flex:1;border-radius:2px;overflow:hidden;}'+
    '#hud-widget-expand .hw-geo-fill{height:100%;border-radius:2px;transition:width 0.5s;}'+
    '#hud-widget-expand .hw-link{display:inline-block;color:#58a6ff;text-decoration:none;font-size:11px;padding:2px 8px;border:1px solid #21262d;border-radius:3px;margin:2px;}'+
    '#hud-widget-expand .hw-link:hover{background:rgba(88,166,255,0.08);}';
  document.head.appendChild(style);

  // ── Build DOM ──
  var bar=document.createElement('div');
  bar.id='hud-widget-bar';
  bar.className='hud-collapsed';

  var strip=document.createElement('div');
  strip.id='hud-widget-strip';
  strip.innerHTML=
    '<span class="hw-pulse"></span>'+
    '<span class="hw-label">biomeOS</span>'+
    '<span class="hw-sep">|</span>'+
    '<span class="hw-stat" id="hw-rps" style="color:#58a6ff">—</span><span style="font-size:10px;color:#6e7681">/s</span>'+
    '<span class="hw-sep">|</span>'+
    '<span class="hw-stat" id="hw-fleet" style="color:#e74c3c">—</span><span style="font-size:10px;color:#6e7681">fleet</span>'+
    '<span class="hw-sep">|</span>'+
    '<span class="hw-stat" id="hw-pct">—</span><span style="font-size:10px;color:#6e7681">%</span>'+
    '<span class="hw-sep">|</span>'+
    '<span id="hw-machine" class="hw-stat">—</span>'+
    '<span class="hw-sep">|</span>'+
    '<span class="hw-billboard" id="hw-billboard"></span>'+
    '<span class="hw-toggle" id="hw-toggle">▲ expand</span>';

  var expand=document.createElement('div');
  expand.id='hud-widget-expand';

  expand.innerHTML=
    '<div class="hw-section"><div class="hw-section-title">Epitope Organisms</div><div id="hw-organisms" class="hw-org-grid"></div></div>'+
    '<div class="hw-section"><div class="hw-section-title">Geography</div><div id="hw-geo"></div></div>'+
    '<div class="hw-section"><div class="hw-section-title">Ecosystem</div><div id="hw-eco">'+
      '<a class="hw-link" href="https://hud.primals.eco">HUD</a>'+
      '<a class="hw-link" href="https://signal.primals.eco">signal</a>'+
      '<a class="hw-link" href="https://detroit.primals.eco">detroit</a>'+
      '<a class="hw-link" href="https://hypothesis.primals.eco">hypothesis</a>'+
      '<a class="hw-link" href="https://thesis.primals.eco">thesis</a>'+
      '<a class="hw-link" href="https://tuebor.primals.eco">tuebor</a>'+
      '<a class="hw-link" href="https://lansing.primals.eco">lansing</a>'+
      '<a class="hw-link" href="https://clutch.primals.eco">clutch</a>'+
      '<a class="hw-link" href="https://sporeprint.primals.eco">sporePrint</a>'+
      '<a class="hw-link" href="https://git.primals.eco">git</a>'+
    '</div></div>';

  bar.appendChild(strip);
  bar.appendChild(expand);
  document.body.appendChild(bar);

  // ── Toggle expand/collapse ──
  var toggleBtn=document.getElementById('hw-toggle');
  strip.addEventListener('click',function(){
    var collapsed=bar.classList.contains('hud-collapsed');
    if(collapsed){
      bar.classList.remove('hud-collapsed');
      expand.classList.add('hw-open');
      toggleBtn.textContent='▼ collapse';
    } else {
      bar.classList.add('hud-collapsed');
      expand.classList.remove('hw-open');
      toggleBtn.textContent='▲ expand';
    }
  });

  // ── Billboard fetch ──
  function loadBillboard(){
    var src=isHud?'/billboard':HUD+'/billboard';
    fetch(src,{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){
      t=t.trim();
      var el=document.getElementById('hw-billboard');
      if(el) el.textContent=t||'';
    }).catch(function(){});
  }

  // ── Dashboard fetch ──
  function loadDash(){
    fetch(base+'/dashboard.json',{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){
      setText('hw-rps',d.rps);
      setText('hw-fleet',d.fleet_ips);
      var pctEl=document.getElementById('hw-pct');
      if(pctEl){pctEl.textContent=d.fleet_pct;pctEl.style.color=d.fleet_pct>50?'#e74c3c':d.fleet_pct>20?'#f1c40f':'#2ecc71';}
      var mcEl=document.getElementById('hw-machine');
      if(mcEl){
        var mc=(d.timing&&d.timing.machine_confidence)||'—';
        mcEl.textContent=mc;
        mcEl.style.color=mc==='HIGH'?'#e74c3c':mc==='MEDIUM'?'#f1c40f':'#2ecc71';
      }

      // Organisms (compact)
      var orgEl=document.getElementById('hw-organisms');
      if(orgEl&&d.epitope_clusters){
        orgEl.innerHTML='';
        d.epitope_clusters.forEach(function(c){
          var isMeta=(c.sample_ae||'').indexOf('gzip, deflate, zstd')===0&&!c.has_lang&&c.ua_pool_size>=4;
          var isAnth=c.ips===1&&(c.sample_ae||'').indexOf('gzip, br, zstd')===0;
          var isSelf=c.has_lang&&c.ips===1;
          var bc=isMeta?'#e74c3c':isAnth?'#ff6b35':isSelf?'#2ecc71':'#f1c40f';
          var label=isMeta?'Meta':isAnth?'Anthropic':isSelf?'Self':'Unknown';
          var pill=document.createElement('span');
          pill.className='hw-org';
          pill.style.borderLeft='3px solid '+bc;
          pill.innerHTML='<span style="color:'+bc+';font-weight:600">'+label+'</span> · '+c.ips+' IP'+(c.ips>1?'s':'')+' · <code style="font-size:10px;color:#6e7681">'+c.hash+'</code>';
          orgEl.appendChild(pill);
        });
      }

      // Geo (compact)
      var geoEl=document.getElementById('hw-geo');
      if(geoEl&&d.geography){
        geoEl.innerHTML='';
        var total=d.total_requests||1;
        d.geography.forEach(function(g){
          var pct=Math.round(g.requests/total*100);
          var cc=g.country==='US'?'#ff6b35':g.country==='IE'||g.country==='IE/US'?'#e74c3c':g.country==='CN'?'#f1c40f':'#58a6ff';
          var r=document.createElement('div');
          r.className='hw-geo-row';
          r.innerHTML='<span style="min-width:35px;font-weight:600;color:#c9d1d9">'+g.country+'</span>'
            +'<div class="hw-geo-bar"><div class="hw-geo-fill" style="background:'+cc+';width:'+pct+'%"></div></div>'
            +'<span style="color:#6e7681;min-width:60px;text-align:right">'+g.requests.toLocaleString()+' ('+pct+'%)</span>';
          geoEl.appendChild(r);
        });
      }
    }).catch(function(){});
  }

  function setText(id,val){var e=document.getElementById(id);if(e)e.textContent=val!=null?val:'—';}

  loadBillboard(); setInterval(loadBillboard,15000);
  loadDash(); setInterval(loadDash,10000);
})();
