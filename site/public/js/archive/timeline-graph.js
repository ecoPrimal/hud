// Interactive timeline + network graph overlay for detroit.primals.eco
// Sweep: 273→compressed, renderTimeline(179) → el() + 3 builders.
(function() {
  'use strict';

  var COLORS = { actor:'#c0392b', judge:'#8e44ad', political:'#2980b9', bmf:'#e74c3c', school:'#27ae60', entity:'#f39c12' };
  var ERA_COLORS = {
    'Pre-2017: Criminal History':'#c0392b', '2014–2016: Political Career':'#2980b9',
    '2017: The Pivot':'#e67e22', '2022–2023: Credentialing':'#8e44ad',
    '2024: Entity Expansion':'#f39c12', '2025: Charter Authorization':'#27ae60',
    '2026: Exposure':'#e74c3c', 'Upcoming':'#95a5a6',
  };

  var STATIC_EVENTS = [
    { date:'Nov 1998', event:'Banks convicted — NSF Check, Lincoln Park', era:'Pre-2017: Criminal History', actors:['banks'], source:'ICHAT' },
    { date:'Apr 1999', event:'Banks convicted — 3 felonies (U&P + 2×FTD), Oakland', era:'Pre-2017: Criminal History', actors:['banks'], source:'ICHAT' },
    { date:'Aug 1999', event:'Banks convicted — NSF felony, Oakland', era:'Pre-2017: Criminal History', actors:['banks'], source:'ICHAT' },
    { date:'Sep 2003', event:'Banks convicted — NSF $500+ felony, Wayne 3rd Circuit', era:'Pre-2017: Criminal History', actors:['banks'], source:'ICHAT' },
    { date:'Sep 2004', event:'Banks arrested — Forgery + U&P, Eaton County', era:'Pre-2017: Criminal History', actors:['banks'], source:'ICHAT' },
    { date:'2005', event:'BMF federal indictment — OD Banks is Defendant #22', era:'Pre-2017: Criminal History', actors:['od_banks','banks'], source:'PACER' },
    { date:'2007', event:'Banks pleads guilty — Eaton County forgery', era:'Pre-2017: Criminal History', actors:['banks'], source:'ICHAT' },
    { date:'2014', event:'Banks runs for MI Senate; "Bank on Banks" PAC; Holland as Treasurer', era:'2014–2016: Political Career', actors:['banks','holland','pacs'], source:'MI Campaign Finance' },
    { date:'2015', event:'Banks serves in MI House HD-1', era:'2014–2016: Political Career', actors:['banks'], source:'MI SOS' },
    { date:'Jun 2016', event:'Banks arrested by MI Attorney General — 3 felonies', era:'2014–2016: Political Career', actors:['banks'], source:'ICHAT' },
    { date:'2017', event:'AG case: 3 felonies → 1 misdemeanor, 1 day', era:'2017: The Pivot', actors:['banks'], source:'ICHAT' },
    { date:'Feb 2017', event:'Banks Strategy & Consultants, LLC filed', era:'2017: The Pivot', actors:['banks','banks_strategy'], source:'LARA' },
    { date:'2017', event:'Banks begins charter school career at MacDowell', era:'2017: The Pivot', actors:['banks','macdowell'], source:'Public records' },
    { date:'2022', event:'Banks receives Ph.D. — dissertation lists fake "J.D., MSU Law, 2010"', era:'2022–2023: Credentialing', actors:['banks'], source:'Walden #12627' },
    { date:'Sep 2022', event:'MI DOE issues School Admin Certificate — 3 days after school year', era:'2022–2023: Credentialing', actors:['banks'], source:'MI DOE' },
    { date:'2023', event:'Judge Miller — recorded confrontation with court security', era:'2022–2023: Credentialing', actors:['miller'], source:'News media' },
    { date:'Apr 2024', event:'Banks Strategy LLC restored — 3 overdue annual reports', era:'2024: Entity Expansion', actors:['banks','banks_strategy'], source:'LARA' },
    { date:'Nov 2024', event:'The Purpose Group, LLC filed', era:'2024: Entity Expansion', actors:['banks','purpose_group'], source:'LARA' },
    { date:'Dec 2024', event:'Purpose Foundation filed — Banks + Holland hold all positions', era:'2024: Entity Expansion', actors:['banks','holland','purpose_foundation'], source:'LARA' },
    { date:'2024', event:'Judge Yancey campaign pays $383.82 to Banks Strategy (sole expenditure)', era:'2024: Entity Expansion', actors:['yancey','banks_strategy'], source:'CFRS' },
    { date:'Jul 2025', event:'PCA authorized by DPSCD Board', era:'2025: Charter Authorization', actors:['pca','gay_dagnogo'], source:'DPSCD' },
    { date:'May 2026', event:'Holland discharged from MDOC — "WITHOUT IMPROVEMENT"', era:'2026: Exposure', actors:['holland'], source:'MDOC OTIS' },
    { date:'Aug 2026', event:'Complainant attends PCA — Banks denies access', era:'2026: Exposure', actors:['banks','pca'], source:'Police report' },
    { date:'Sep 2026', event:'ICHAT pulled — 9 convictions confirmed', era:'2026: Exposure', actors:['banks'], source:'MI ICHAT' },
    { date:'Sep 22, 2026', event:'Federal Master Packet — scheduled delivery to 8 agencies', era:'Upcoming', actors:['banks','holland','miller','yancey'], upcoming:true, source:'Prepared' },
    { date:'Nov 3, 2026', event:'Judge Cylenthia Miller — election day', era:'Upcoming', actors:['miller'], upcoming:true, source:'' },
  ];

  var NODES = {
    banks:{ label:'Banks', color:COLORS.actor, url:'/network/actors/brian-banks/' },
    holland:{ label:'Holland', color:COLORS.actor, url:'/network/actors/joseph-holland/' },
    miller:{ label:'Miller', color:COLORS.judge, url:'/network/judges/cylenthia-miller/' },
    yancey:{ label:'Yancey', color:COLORS.judge, url:'/network/judges/tenisha-yancey/' },
    sabree:{ label:'Sabree', color:COLORS.judge, url:'/network/judges/aliyah-sabree/' },
    perkins_d:{ label:'Perkins', color:COLORS.judge, url:'/network/judges/david-perkins/' },
    gay_dagnogo:{ label:'Gay-Dagnogo', color:COLORS.political, url:'/network/political/sherry-gay-dagnogo/' },
    od_banks:{ label:'OD Banks', color:COLORS.bmf, url:null },
    welch:{ label:'Welch', color:COLORS.bmf, url:null },
    pca:{ label:'PCA', color:COLORS.school, url:'/network/entities/purpose-charter-academy/' },
    macdowell:{ label:'MacDowell', color:COLORS.school, url:'/network/entities/macdowell-prep/' },
    purpose_group:{ label:'Purpose Group', color:COLORS.entity, url:'/network/entities/purpose-group-llc/' },
    purpose_foundation:{ label:'Foundation', color:COLORS.entity, url:'/network/entities/purpose-foundation/' },
    banks_strategy:{ label:'Banks Strategy', color:COLORS.entity, url:'/network/entities/banks-strategy-llc/' },
    pacs:{ label:'PACs', color:COLORS.entity, url:'/network/entities/political-action-committees/' },
  };

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function renderTimeline(container, events) {
    container.innerHTML = '';

    // Group by era
    var eras = [], cur = null;
    events.forEach(function(ev) {
      if (ev.era !== cur) { cur = ev.era; eras.push({ name: ev.era, events: [] }); }
      eras[eras.length - 1].events.push(ev);
    });

    // Era filter bar
    var filterBar = el('div', 'tl-filter-bar', container);
    var allBtn = el('button', 'tl-filter-btn active', filterBar);
    allBtn.textContent = 'All'; allBtn.dataset.era = 'all';
    eras.forEach(function(era) {
      var btn = el('button', 'tl-filter-btn', filterBar);
      btn.textContent = era.name.replace(/:.*/,'').trim();
      btn.dataset.era = era.name;
      btn.style.borderColor = ERA_COLORS[era.name] || '#95a5a6';
    });

    // Actor chip bar
    var chipBar = el('div', 'tl-chip-bar', container);
    chipBar.innerHTML = '<span class="tl-chip-label">Filter by actor:</span>';
    var seen = {};
    events.forEach(function(ev) { (ev.actors || []).forEach(function(a) { seen[a] = true; }); });
    Object.keys(seen).sort().forEach(function(id) {
      var n = NODES[id]; if (!n) return;
      var chip = el('button', 'tl-actor-chip', chipBar);
      chip.textContent = n.label; chip.dataset.actor = id;
      chip.style.borderColor = n.color; chip.style.color = n.color;
    });

    // Timeline track
    var track = el('div', 'tl-track', container);
    eras.forEach(function(era) {
      var eraDiv = el('div', 'tl-era', track);
      eraDiv.dataset.era = era.name;
      var header = el('div', 'tl-era-header', eraDiv);
      header.style.borderLeftColor = ERA_COLORS[era.name] || '#95a5a6';
      header.textContent = era.name;

      era.events.forEach(function(ev) {
        var item = el('div', 'tl-event' + (ev.upcoming ? ' tl-upcoming' : ''), eraDiv);
        item.dataset.actors = (ev.actors || []).join(',');

        var dot = el('span', 'tl-dot', item);
        dot.style.background = ERA_COLORS[era.name] || '#95a5a6';
        el('span', 'tl-date', item).textContent = ev.date;
        el('span', 'tl-text', item).textContent = ev.event;
        el('span', 'tl-source', item).textContent = ev.source || '';

        var actors = el('span', 'tl-event-actors', item);
        (ev.actors || []).forEach(function(id) {
          var n = NODES[id]; if (!n) return;
          var badge = document.createElement('a');
          badge.className = 'tl-actor-badge';
          badge.style.background = n.color;
          badge.textContent = n.label;
          if (n.url) badge.href = n.url;
          actors.appendChild(badge);
        });
      });
    });

    // Interactivity
    var activeEra = 'all', activeActor = null;
    function filter() {
      track.querySelectorAll('.tl-era').forEach(function(e) { e.style.display = (activeEra === 'all' || e.dataset.era === activeEra) ? '' : 'none'; });
      track.querySelectorAll('.tl-event').forEach(function(item) {
        var eraOk = activeEra === 'all' || item.closest('.tl-era').dataset.era === activeEra;
        var actorOk = !activeActor || (item.dataset.actors || '').split(',').indexOf(activeActor) >= 0;
        item.style.display = eraOk ? '' : 'none';
        item.classList.toggle('tl-dimmed', eraOk && !actorOk);
      });
    }

    filterBar.addEventListener('click', function(e) {
      var btn = e.target.closest('.tl-filter-btn'); if (!btn) return;
      filterBar.querySelectorAll('.tl-filter-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeEra = btn.dataset.era;
      filter();
    });

    chipBar.addEventListener('click', function(e) {
      var chip = e.target.closest('.tl-actor-chip'); if (!chip) return;
      if (activeActor === chip.dataset.actor) { activeActor = null; chip.classList.remove('active'); }
      else { chipBar.querySelectorAll('.tl-actor-chip').forEach(function(c) { c.classList.remove('active'); }); chip.classList.add('active'); activeActor = chip.dataset.actor; }
      filter();
    });
  }

  function init() {
    var c = document.getElementById('interactive-timeline'); if (!c) return;
    fetch('/api/public-record/timeline')
      .then(function(r) { return r.ok ? r.json() : Promise.reject('no API'); })
      .then(function(d) { renderTimeline(c, d.events || []); })
      .catch(function() { renderTimeline(c, STATIC_EVENTS); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
