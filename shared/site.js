/* ============================================================
   SITE.JS — общие утилиты для всех страниц, кроме /ustav/pogony.html
   (тот файл самодостаточен). Подключается после theme.css,
   до deck-engine.js / homework.js / кода конкретной страницы.
   ============================================================ */
var Site = (function(){
  "use strict";

  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function shuffle(a){ var i,j,t; for(i=a.length-1;i>0;i--){ j=Math.floor(Math.random()*(i+1)); t=a[i];a[i]=a[j];a[j]=t; } return a; }
  function pickOne(a){ return a[Math.floor(Math.random()*a.length)]; }
  function plural(n, one, few, many){
    var m10=n%10, m100=n%100;
    if(m10===1 && m100!==11) return one;
    if(m10>=2 && m10<=4 && (m100<10||m100>=20)) return few;
    return many;
  }
  function fmtTime(ms){
    var s=Math.round(ms/1000), m=Math.floor(s/60);
    return m + ':' + ('0'+(s%60)).slice(-2);
  }
  function fmtDate(d){
    if(!d) return '';
    try{
      var dt = (d instanceof Date) ? d : new Date(d);
      if(isNaN(dt.getTime())) return '';
      var months = ['янв','фев','мар','апр','мая','июн','июл','авг','сен','окт','ноя','дек'];
      return dt.getDate() + ' ' + months[dt.getMonth()];
    }catch(e){ return ''; }
  }

  /* ---------- навигация: подсветка активного пункта в шапке и в нижней панели ---------- */
  function initNav(activeKey){
    var list = document.querySelectorAll('[data-nav]');
    for(var i=0;i<list.length;i++){
      var on = list[i].getAttribute('data-nav') === activeKey;
      list[i].classList.toggle('is-on', on);
      if(list[i].tagName === 'A') list[i].setAttribute('aria-current', on ? 'page' : 'false');
    }
  }

  /* ---------- звук ---------- */
  var SOUND_KEY = 'site-sound-v1';
  var actx = null;
  function soundOn(){
    try{ var v = localStorage.getItem(SOUND_KEY); return v === null ? true : v === '1'; }catch(e){ return true; }
  }
  function setSound(on){
    try{ localStorage.setItem(SOUND_KEY, on ? '1' : '0'); }catch(e){}
  }
  function beep(kind){
    if(!soundOn()) return;
    try{
      var AC = window.AudioContext || window.webkitAudioContext;
      if(!AC) return;
      actx = actx || new AC();
      var seq = kind === 'ok' ? [[620,0,.08],[930,.07,.12]]
              : kind === 'bad' ? [[180,0,.18]]
              : [[520,0,.06],[700,.06,.08],[1040,.12,.16]];
      for(var i=0;i<seq.length;i++){
        (function(f,at,dur){
          var o=actx.createOscillator(), g=actx.createGain();
          o.type = kind==='bad' ? 'sawtooth' : 'triangle';
          o.frequency.value=f;
          g.gain.value=.0001;
          o.connect(g); g.connect(actx.destination);
          var t=actx.currentTime+at;
          g.gain.exponentialRampToValueAtTime(kind==='bad'?.07:.12, t+.012);
          g.gain.exponentialRampToValueAtTime(.0001, t+dur);
          o.start(t); o.stop(t+dur+.02);
        })(seq[i][0],seq[i][1],seq[i][2]);
      }
    }catch(e){}
  }
  function wireSoundToggle(btn){
    if(!btn) return;
    function paint(){
      btn.classList.toggle('is-off', !soundOn());
      btn.setAttribute('aria-pressed', soundOn() ? 'true' : 'false');
    }
    paint();
    btn.addEventListener('click', function(){
      setSound(!soundOn());
      paint();
      if(soundOn()) beep('ok');
    });
  }

  /* ---------- раскрывающееся меню «семестр → предмет → тема» ---------- */
  function initMenu(prefix){
    var btn = document.getElementById('btnMenu');
    var panel = document.getElementById('siteMenu');
    if(!btn || !panel || typeof NavData === 'undefined') return;
    prefix = prefix || '';

    var h = '';
    NavData.semesters.forEach(function(sem){
      if(sem.status === 'locked'){
        h += '<div class="navmenu__sem navmenu__sem--locked">' +
          '<div class="navmenu__semhead"><b>'+esc(sem.label)+'</b>' +
          '<span class="navmenu__badge navmenu__badge--lock">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>' +
          'заблокирован</span></div></div>';
        return;
      }
      h += '<div class="navmenu__sem">';
      h += '<div class="navmenu__semhead"><b>'+esc(sem.label)+'</b><span class="navmenu__badge navmenu__badge--active">идёт сейчас</span></div>';
      sem.subjects.forEach(function(subj){
        h += '<div class="navmenu__subj">';
        h += '<a class="navmenu__subjlink" href="'+prefix+subj.href+'">'+esc(subj.title)+'</a>';
        subj.groups.forEach(function(g){
          h += '<div class="navmenu__grp"><div class="navmenu__grplabel">'+esc(g.title)+'</div><div class="navmenu__items">';
          g.items.forEach(function(it){
            h += '<a class="navmenu__item" href="'+prefix+it.href+'">'+esc(it.title)+'</a>';
          });
          h += '</div></div>';
        });
        h += '</div>';
      });
      h += '</div>';
    });
    h += '<div class="navmenu__upd"><button type="button" class="navmenu__updbtn" id="btnUpdate">Обновить сайт</button><span class="navmenu__updv" id="updVer"></span></div>';
    panel.innerHTML = h;
    initUpdate(prefix);

    function isOpen(){ return !panel.hidden; }
    function open(){ panel.hidden = false; btn.classList.add('is-on'); btn.setAttribute('aria-expanded','true'); }
    function close(){ panel.hidden = true; btn.classList.remove('is-on'); btn.setAttribute('aria-expanded','false'); }
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      isOpen() ? close() : open();
    });
    document.addEventListener('click', function(e){
      if(isOpen() && !panel.contains(e.target) && e.target !== btn) close();
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && isOpen()) close();
    });
  }

  /* ---------- обновление: сброс кэша браузера/веб-приложения ---------- */
  var VER_KEY = 'site-ver-v1';
  function initUpdate(prefix){
    var btn = document.getElementById('btnUpdate');
    var lab = document.getElementById('updVer');
    var seen = null;
    try{ seen = localStorage.getItem(VER_KEY); }catch(e){}
    if(lab) lab.textContent = seen ? 'версия ' + seen : '';
    function fetchInfo(){
      return fetch(prefix + 'version.json?t=' + Date.now(), {cache:'no-store'}).then(function(r){ return r.json(); });
    }
    function banner(){
      if(document.getElementById('updBanner')) return;
      var b = document.createElement('div');
      b.id = 'updBanner'; b.className = 'updbanner';
      b.innerHTML = '<span>Вышла новая версия сайта</span><button type="button">Обновить</button>';
      b.querySelector('button').addEventListener('click', doUpdate);
      document.body.appendChild(b);
    }
    var busy = false;
    function doUpdate(){
      if(busy) return; busy = true;
      if(btn){ btn.disabled = true; btn.textContent = 'Обновляю…'; }
      fetchInfo().then(function(info){
        return Promise.all(info.files.map(function(f){
          return fetch(prefix + f, {cache:'reload'}).catch(function(){});
        })).then(function(){
          try{ localStorage.setItem(VER_KEY, info.v); }catch(e){}
        });
      }).catch(function(){}).then(function(){
        location.reload();
      });
    }
    if(btn) btn.addEventListener('click', doUpdate);
    fetchInfo().then(function(info){
      if(seen === null){ try{ localStorage.setItem(VER_KEY, info.v); }catch(e){} if(lab) lab.textContent = 'версия ' + info.v; }
      else if(seen !== info.v) banner();
    }).catch(function(){});
  }

  /* ---------- аккордеон конспекта на статичных страницах (без DeckEngine) ---------- */
  function wireConspectToggle(root){
    root = root || document;
    root.querySelectorAll('[data-term-toggle]').forEach(function(btn){
      btn.addEventListener('click', function(){
        var item = btn.closest('.conspect-prose__i');
        if(item) item.classList.toggle('is-open');
      });
    });
  }

  /* ---------- всплывающие очки ---------- */
  function floater(txt, el){
    if(!el || !el.getBoundingClientRect) return;
    var box=document.createElement('div');
    box.className='floater';
    box.textContent=txt;
    var r=el.getBoundingClientRect();
    box.style.left=(r.left+r.width/2-16)+'px';
    box.style.top=(r.top-4)+'px';
    document.body.appendChild(box);
    setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); }, 950);
  }

  /* ---------- плитка темы (.mode) ---------- */
  function modeTile(it){
    var ico = '<span class="mode__ico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+(it.icon||'')+'</svg></span>';
    var body = '<span><span class="mode__t">'+it.title+'</span><span class="mode__d">'+(it.desc||'')+'</span></span>' +
      '<span class="mode__meta">'+(it.meta||'')+'</span>';
    if(it.soon || !it.href) return '<div class="mode" aria-disabled="true">'+ico+body+'</div>';
    return '<a class="mode" href="'+it.href+'">'+ico+body+'</a>';
  }

  /* ---------- «кубики-пары»: выбор пары → показываются только её темы ---------- */
  function pairTabs(mount, groups, opts){
    if(!mount || !groups || !groups.length) return;
    opts = opts || {};
    var subj = opts.subject || 'subj';
    var LS = 'pair-last-' + subj + '-v1';
    function attempted(g){
      for(var i=0;i<g.items.length;i++){
        var k = g.items[i].deckKey;
        if(!k) continue;
        try{ if(localStorage.getItem('deck-'+subj+'-'+k+'-v1')) return true; }catch(e){}
      }
      return false;
    }
    var h = '<div class="pairs" data-pairs>';
    h += '<div class="pairs__hint">Выберите пару</div>';
    h += '<div class="pairs__grid" role="tablist" aria-label="Пары">';
    groups.forEach(function(g){
      var n = g.items.length;
      var cap = g.caption || (n + ' ' + plural(n,'тема','темы','тем'));
      h += '<button type="button" class="pairs__tab'+(g.soon?' is-soon':'')+'" role="tab" id="pt-'+g.id+'" data-id="'+g.id+'" aria-controls="pp-'+g.id+'" aria-selected="false" tabindex="-1">' +
        (attempted(g) ? '<i class="pairs__dot" title="Уже решали"></i>' : '') +
        '<b class="pairs__n">'+g.label+'</b><span class="pairs__c">'+cap+'</span></button>';
    });
    h += '</div>';
    groups.forEach(function(g){
      h += '<div class="pairs__panel" role="tabpanel" id="pp-'+g.id+'" aria-labelledby="pt-'+g.id+'" hidden>';
      if(g.title) h += '<div class="pairs__title"><h2>'+g.title+'</h2>'+(g.note?'<small>'+g.note+'</small>':'')+'</div>';
      h += '<div class="modes">' + g.items.map(modeTile).join('') + '</div></div>';
    });
    h += '</div>';
    mount.innerHTML = h;

    var tabs = [].slice.call(mount.querySelectorAll('.pairs__tab'));
    var panels = [].slice.call(mount.querySelectorAll('.pairs__panel'));
    function ids(){ return groups.map(function(g){ return g.id; }); }
    function show(id, focus){
      if(ids().indexOf(id) < 0) return;
      tabs.forEach(function(t){
        var on = t.getAttribute('data-id') === id;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if(on && focus) t.focus();
      });
      panels.forEach(function(p){
        var on = p.id === 'pp-'+id;
        p.hidden = !on;
        p.classList.remove('is-in');
        if(on){ void p.offsetWidth; p.classList.add('is-in'); }
      });
      try{ localStorage.setItem(LS, id); }catch(e){}
      try{ history.replaceState(null, '', '#'+id); }catch(e){}
    }
    tabs.forEach(function(t, i){
      t.addEventListener('click', function(){ show(t.getAttribute('data-id')); });
      t.addEventListener('keydown', function(e){
        var d = e.key==='ArrowRight' ? 1 : e.key==='ArrowLeft' ? -1 : 0;
        if(!d) return;
        e.preventDefault();
        show(tabs[(i+d+tabs.length)%tabs.length].getAttribute('data-id'), true);
      });
    });
    var start = (location.hash||'').replace('#','');
    if(ids().indexOf(start) < 0){ try{ start = localStorage.getItem(LS); }catch(e){ start = null; } }
    if(ids().indexOf(start) < 0) start = opts.defaultId || groups[0].id;
    show(start);
  }

  return {
    modeTile:modeTile, pairTabs:pairTabs,
    esc:esc, shuffle:shuffle, pickOne:pickOne, plural:plural, fmtTime:fmtTime, fmtDate:fmtDate,
    initNav:initNav, initMenu:initMenu, beep:beep, soundOn:soundOn, setSound:setSound, wireSoundToggle:wireSoundToggle,
    floater:floater, wireConspectToggle:wireConspectToggle
  };
})();
