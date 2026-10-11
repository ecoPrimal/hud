// hud-core.js — biomeOS observation surface (minimal)
// Renders: billboard + geographic drill-down
// All other panels rendered by nanowire via hud-pt.js
(function(){
  'use strict';
  var base='';

  // ── Billboard ──
  (function(){
    var el=document.getElementById('hud-billboard');
    var msg=document.getElementById('hud-billboard-msg');
    if(!el||!msg)return;
    var src='/billboard';
    function load(){
      fetch(src,{cache:'no-store'}).then(function(r){return r.text()}).then(function(t){
        t=t.trim();
        if(t&&t.length>0){el.style.display='';msg.textContent=t;}
        else{el.style.display='none';}
      }).catch(function(){el.style.display='none';});
    }
    load(); setInterval(load,15000);
  })();

  // ── Dashboard (geo only) ──
  function loadDash(){
    fetch(base+'/dashboard.json',{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){
      var dash=document.getElementById('hud-dash');
      if(dash) dash.style.display='';
      renderGeo(d.geography||[], d.total_requests||0, d.subnets||[], d.asn_types||{});
    }).catch(function(){});
  }

  // ── Geographic Subdivision ──
  function renderGeo(geo, total, subnets, asnTypes){
    var gel=document.getElementById('d-geo');
    if(!gel)return;
    gel.innerHTML='';
    if(!geo.length){gel.innerHTML='<span class="text-muted">Collecting geographic data...</span>';return;}

    // ASN type bar
    if(asnTypes&&Object.keys(asnTypes).length){
      var asnBar=document.createElement('div');
      asnBar.style.cssText='display:flex;gap:6px;margin-bottom:1em;flex-wrap:wrap;';
      var asnTotal=Object.values(asnTypes).reduce(function(a,b){return a+b},0);
      Object.keys(asnTypes).sort(function(a,b){return asnTypes[b]-asnTypes[a]}).forEach(function(t){
        var pct=asnTotal>0?Math.round(asnTypes[t]/asnTotal*100):0;
        var tc=t==='datacenter'?'#e74c3c':t==='cloud'?'#f1c40f':t==='residential'?'#2ecc71':t==='self'?'#58a6ff':'#8b949e';
        asnBar.innerHTML+='<span style="font-size:0.72em;background:'+tc+'18;color:'+tc+';padding:2px 8px;border-radius:4px;border:1px solid '+tc+'33">'+t+': '+pct+'%</span>';
      });
      gel.appendChild(asnBar);
    }

    // Subnet lookup
    var subByCountry={};
    (subnets||[]).forEach(function(s){
      var c=s.country||'??';
      if(!subByCountry[c]) subByCountry[c]=[];
      subByCountry[c].push(s);
    });

    geo.forEach(function(g){
      var country=g.country;
      var reqs=g.requests;
      var pct=total>0?Math.round(reqs/total*100):0;
      var regions=g.regions||[];

      var row=document.createElement('div');
      row.style.cssText='margin-bottom:0.7em;';

      var header=document.createElement('div');
      header.style.cssText='display:flex;align-items:center;gap:8px;cursor:pointer;';
      header.innerHTML='<span style="font-size:0.85em;font-weight:600;color:#c9d1d9;min-width:50px">'+country+'</span>'
        +'<div style="background:#30363d;height:14px;flex:1;border-radius:3px;overflow:hidden;position:relative">'
        +'<div style="background:'+countryColor(country)+';height:100%;width:'+pct+'%;min-width:2px;transition:width 0.5s"></div>'
        +'<span style="position:absolute;right:5px;top:0;font-size:0.65em;color:#8b949e;line-height:14px">'+reqs.toLocaleString()+' · '+pct+'%</span>'
        +'</div>'
        +'<span style="font-size:0.65em;color:#6e7681;cursor:pointer" class="geo-toggle">▶</span>';

      var detail=document.createElement('div');
      detail.style.cssText='display:none;margin-left:58px;margin-top:3px;';

      if(regions.length){
        regions.forEach(function(r){
          var rpct=reqs>0?Math.round(r.requests/reqs*100):0;
          var rrow=document.createElement('div');
          rrow.style.cssText='margin-bottom:5px;';
          var rhead=document.createElement('div');
          rhead.style.cssText='display:flex;align-items:center;gap:5px;cursor:pointer;';
          rhead.innerHTML='<span style="font-size:0.78em;color:#c9d1d9;min-width:90px">'+r.region+'</span>'
            +'<div style="background:#21262d;height:8px;flex:1;border-radius:2px;overflow:hidden">'
            +'<div style="background:'+countryColor(country)+'99;height:100%;width:'+rpct+'%"></div></div>'
            +'<span style="font-size:0.62em;color:#6e7681;min-width:55px;text-align:right">'+r.requests.toLocaleString()+'</span>'
            +'<span style="font-size:0.6em;color:#484f58;cursor:pointer" class="reg-toggle">▶</span>';

          var cityDet=document.createElement('div');
          cityDet.style.cssText='display:none;margin-left:95px;margin-top:2px;';
          (r.cities||[]).forEach(function(c){
            var crow=document.createElement('div');
            crow.style.cssText='display:flex;align-items:center;gap:5px;margin:1px 0;font-size:0.72em;';
            crow.innerHTML='<span style="color:#58a6ff;min-width:85px">'+c.city+'</span><span style="color:#8b949e">'+c.requests.toLocaleString()+'</span>';
            cityDet.appendChild(crow);
          });
          rhead.onclick=function(e){
            e.stopPropagation();
            var open=cityDet.style.display!=='none';
            cityDet.style.display=open?'none':'block';
            rhead.querySelector('.reg-toggle').textContent=open?'▶':'▼';
          };
          rrow.appendChild(rhead);
          rrow.appendChild(cityDet);
          detail.appendChild(rrow);
        });
      }

      // Subnets for this country
      var cs=subByCountry[country]||[];
      if(cs.length){
        var subH=document.createElement('div');
        subH.style.cssText='font-size:0.68em;color:#6e7681;margin-top:6px;margin-bottom:2px;text-transform:uppercase;letter-spacing:0.05em;border-top:1px solid #21262d;padding-top:5px;';
        subH.textContent='Network blocks ('+cs.length+')';
        detail.appendChild(subH);
        cs.sort(function(a,b){return b.requests-a.requests}).slice(0,10).forEach(function(s){
          var sr=document.createElement('div');
          sr.style.cssText='display:flex;align-items:center;gap:5px;margin:1px 0;font-size:0.72em;';
          var cityL=s.city?(' · '+s.city):'';
          var asnL=s.asn_type?(' · <span style="color:#484f58">'+s.asn_type+'</span>'):'';
          sr.innerHTML='<code style="color:#58a6ff;min-width:95px">'+s.subnet+'</code>'
            +'<span style="color:#8b949e;flex:1">'+s.org+cityL+asnL+'</span>'
            +'<span style="color:#6e7681;min-width:55px;text-align:right">'+s.requests.toLocaleString()+'</span>';
          detail.appendChild(sr);
        });
      }

      var note=document.createElement('div');
      note.style.cssText='font-size:0.58em;color:#484f58;margin-top:6px;font-style:italic;';
      note.textContent='country → region → city → ASN → fiber';
      detail.appendChild(note);

      header.onclick=function(){
        var open=detail.style.display!=='none';
        detail.style.display=open?'none':'block';
        header.querySelector('.geo-toggle').textContent=open?'▶':'▼';
      };
      row.appendChild(header);
      row.appendChild(detail);
      gel.appendChild(row);
    });
  }

  // ── Helpers ──
  function countryColor(c){
    if(c==='US')return '#ff6b35';
    if(c==='IE/US'||c==='IE')return '#e74c3c';
    if(c==='CN')return '#f1c40f';
    return '#58a6ff';
  }

  // ── Poll ──
  loadDash(); setInterval(loadDash,8000);
})();
