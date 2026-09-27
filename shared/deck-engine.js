/* ============================================================
   DECK-ENGINE.JS — универсальный тренажёр «термин ↔ определение»
   для текстовых тем (обязанности, распорядок дня, тактика...).
   Использует Site.* из site.js. Один DECK — одна страница.

   Формат колоды:
   var DECK = {
     subject: 'ustav',            // ключ предмета — для общего счёта и localStorage
     key: 'duties',                // ключ темы внутри предмета, уникален на сайте
     title: 'Обязанности военнослужащего',
     eyebrow: 'Устав внутренней службы · статья 13',
     intro: 'Пояснение под заголовком...',
     cards: [
       { id:'oath', term:'Верность присяге', def:'Полный текст определения...', tip:'Подсказка для запоминания' },
       ...
     ]
   };
   DeckEngine.init(DECK);   // сам находит #screen, шапку и нижнюю панель на странице
   ============================================================ */
var DeckEngine = (function(){
  "use strict";
  var esc = Site.esc, shuffle = Site.shuffle, pickOne = Site.pickOne, plural = Site.plural, fmtTime = Site.fmtTime;

  var ICONS = {
    conspect:'<path d="M6 3h9l5 5v13H6z"/><path d="M15 3v5h5"/><path d="M9 12h6M9 15.5h6M9 8.5h3"/>',
    trainer:'<circle cx="12" cy="12" r="9"/><path d="M9 9.5l3-2 3 2v5l-3 2-3-2z"/>',
    order:'<circle cx="6" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><path d="M11 6h9M11 12h9M11 18h9"/>',
    recite:'<path d="M4 5h7a3 3 0 013 3v12a2 2 0 00-2-2H4z"/><path d="M20 5h-3a3 3 0 00-3 3"/><path d="M17 11h3M17 15h3"/>',
    exam:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 13l2.2 2.2L16 11"/>'
  };
  var MODE_DEFS = [
    { id:'conspect', t:'Конспект', d:'Все термины темы одним читаемым списком — как выучить, а не только проверить', ico:'conspect' },
    { id:'trainer',  t:'Тренажёр',  d:'Вопросы вперемешку без ограничения по времени — можно ошибаться', ico:'trainer' },
    { id:'recite',   t:'Наизусть', d:'Дословное заучивание целых статей: слова постепенно прячутся, договариваете сами', ico:'recite', reciteOnly:true },
    { id:'order',    t:'Порядок',   d:'Что идёт следующим, а что — перед этим: проверка правильной последовательности', ico:'order', orderable:true },
    { id:'exam',     t:'Проверка знаний', d:'Те же вопросы, но на время и с итоговой оценкой', ico:'exam' }
  ];

  function icon(name){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + '</svg>'; }

  function init(deck, opts){
    opts = opts || {};
    var screenEl = opts.root || document.getElementById('screen');
    /* card.parts: конспект показывает статью целиком, а тренажёр и проверка — по одному пункту */
    var articles = deck.cards;
    deck.cards = [];
    articles.forEach(function(c){
      if(!c.parts || !c.parts.length){ deck.cards.push(c); return; }
      c.parts.forEach(function(p, k){
        deck.cards.push({ id:c.id+'p'+(k+1), section:c.section, term:p.term, def:p.def, gist:p.gist||c.gist, tip:p.tip, fig:p.fig });
      });
    });
    var reciteList = deck.recite ? articles.filter(function(c){ return c.key; }) : [];
    if(deck.recite && !reciteList.length) reciteList = articles.slice();
    var rec = { i:0, level:0, shown:{} };
    var storeKey = 'deck-' + deck.subject + '-' + deck.key + '-v1';
    var state = { stats:{}, best:{} };
    var current = 'home';
    var ses = null;
    var examTimerId = null;
    var STAGE_KEY = 'deck-stage-open-v1';
    var stageOpen = true;
    try{ if(localStorage.getItem(STAGE_KEY) === '0') stageOpen = false; }catch(e){}

    (function load(){
      try{
        var raw = localStorage.getItem(storeKey);
        if(raw){ var o = JSON.parse(raw); state.stats = o.stats || {}; state.best = o.best || {}; }
      }catch(e){}
    })();
    function save(){ try{ localStorage.setItem(storeKey, JSON.stringify(state)); }catch(e){} }
    function statOf(id){ if(!state.stats[id]) state.stats[id] = {ok:0,no:0}; return state.stats[id]; }
    function cardById(id){ for(var i=0;i<deck.cards.length;i++) if(deck.cards[i].id===id) return deck.cards[i]; return null; }

    function go(name){
      if(name!=='quiz' && examTimerId){ clearInterval(examTimerId); examTimerId=null; }
      current = name;
      if(name==='home') renderHome();
      else if(name==='quiz') renderQuiz();
      else if(name==='result') renderResult();
      else if(name==='conspect') renderConspect();
      else if(name==='recite') renderReciteList();
      else if(name==='reciteCard') renderReciteCard();
      window.scrollTo(0,0);
    }

    /* ---------------- подбор вопросов ---------------- */
    function drawCards(n){
      var pool = deck.cards.slice(), bag=[], i,j,st,w;
      for(i=0;i<pool.length;i++){
        st = state.stats[pool[i].id] || {ok:0,no:0};
        w = 1 + Math.min(3, st.no) + (st.ok===0 ? 1 : 0);
        for(j=0;j<w;j++) bag.push(pool[i]);
      }
      shuffle(bag);
      var out=[], used={};
      for(i=0;i<bag.length && out.length<n;i++){
        if(used[bag[i].id]) continue;
        used[bag[i].id]=1;
        out.push(bag[i]);
      }
      while(out.length<n && pool.length) out.push(pickOne(pool));
      return shuffle(out);
    }
    /* Неверные варианты подбираются в первую очередь из той же секции
       (та же статья/тема), что и правильный — иначе в больших сводных
       колодах (общая запоминалка по паре, летучка по вариантам) неверный
       вариант из другой темы угадывается по смыслу, а не по знанию, и
       тест перестаёт что-то проверять. Не хватает похожих — добираем
       из остальной колоды. */
    function distractors(card, count){
      var rest = deck.cards.filter(function(c){ return c.id!==card.id; });
      var same = rest.filter(function(c){ return c.section && c.section===card.section; });
      var other = rest.filter(function(c){ return !(c.section && c.section===card.section); });
      shuffle(same); shuffle(other);
      return same.concat(other).slice(0, Math.min(count, rest.length));
    }
    function buildQuestion(kind, card){
      var q = { kind:kind, card:card, opts:[], correct:0 };
      if(kind==='term2def' || kind==='def2term'){
        var wrong = distractors(card, 3);
        var opts = shuffle([card].concat(wrong));
        q.opts = opts;
        for(var i=0;i<opts.length;i++) if(opts[i].id===card.id) q.correct=i;
        return q;
      }
      if(kind==='tf'){
        var isTrue = Math.random() < 0.5;
        var shown = card;
        if(!isTrue){
          var others = distractors(card, 1);
          if(others.length) shown = { id:card.id, term:card.term, def:others[0].def, tip:card.tip };
          else isTrue = true;
        }
        q.shown = shown;
        q.isTrue = isTrue;
        q.opts = [{label:'Верно'},{label:'Неверно'}];
        q.correct = isTrue ? 0 : 1;
        return q;
      }
      return q;
    }
    function buildOrderQuestion(i){
      var a = deck.cards[i], b = deck.cards[i+1];
      var askNext = Math.random() < 0.5;
      var from = askNext ? a : b;
      var to = askNext ? b : a;
      var grp = function(id){ return String(id).replace(/\d+$/,''); };
      var sameGroup = deck.cards.filter(function(c){ return c.id!==from.id && c.id!==to.id && grp(c.id)===grp(to.id); });
      var rest = deck.cards.filter(function(c){ return c.id!==from.id && c.id!==to.id && grp(c.id)!==grp(to.id); });
      shuffle(sameGroup); shuffle(rest);
      var pool = sameGroup.concat(rest);
      var wrong = pool.slice(0, Math.min(3, pool.length));
      var opts = shuffle([to].concat(wrong));
      var q = { kind:'order', card:to, from:from, dir:askNext?'next':'prev', opts:opts, correct:0 };
      for(var k=0;k<opts.length;k++) if(opts[k].id===to.id) q.correct=k;
      return q;
    }
    function startSession(mode){
      if(mode==='order'){
        var grp = function(id){ return String(id).replace(/\d+$/,''); };
        var idxs = [];
        for(var p=0;p<deck.cards.length-1;p++){
          if(grp(deck.cards[p].id)===grp(deck.cards[p+1].id)) idxs.push(p);
        }
        shuffle(idxs);
        var qs2 = idxs.map(buildOrderQuestion);
        shuffle(qs2);
        ses = { mode:mode, qs:qs2, i:0, score:0, streak:0, maxStreak:0, right:0, wrong:[], t0:Date.now(), answered:false };
        go('quiz');
        return;
      }
      var n = mode==='exam' ? Math.min(20, deck.cards.length*2) : Math.min(12, Math.max(6, deck.cards.length));
      var kinds = ['term2def','def2term','tf'];
      var picks = [];
      for(var i=0;i<n;i++) picks.push(drawCards(1)[0]);
      var qs = picks.map(function(c){ return buildQuestion(pickOne(kinds), c); });
      shuffle(qs);
      ses = { mode:mode, qs:qs, i:0, score:0, streak:0, maxStreak:0, right:0, wrong:[], t0:Date.now(), answered:false };
      go('quiz');
    }
    function answerQ(idx, el){
      if(!ses || ses.answered) return;
      var q = ses.qs[ses.i];
      ses.answered = true;
      var ok = idx===q.correct;
      var st = statOf(q.card.id);
      if(ok){
        st.ok++; ses.right++; ses.streak++;
        if(ses.streak>ses.maxStreak) ses.maxStreak=ses.streak;
        var pts = 10 + Math.min(10,(ses.streak-1)*2);
        ses.score += pts;
        Site.beep('ok');
        Site.floater('+'+pts, el);
      } else {
        st.no++; ses.streak=0;
        ses.wrong.push({q:q, chosen:idx});
        Site.beep('bad');
      }
      save();
      paintAnswer(idx, q, ok);
    }
    function nextQ(){
      if(!ses) return;
      ses.i++; ses.answered=false;
      if(ses.i>=ses.qs.length){ go('result'); return; }
      go('quiz');
    }

    /* ---------------- вёрстка ---------------- */
    function pagehead(o){
      var h = '<div class="pagehead">';
      if(o.back) h += '<a class="pagehead__back" href="'+esc(o.back)+'">← '+esc(o.backLabel||'Назад')+'</a>';
      if(o.eyebrow) h += '<div class="pagehead__eyebrow">'+esc(o.eyebrow)+'</div>';
      h += '<h1>'+esc(o.title)+'</h1>';
      if(o.lead) h += '<p class="pagehead__lead">'+o.lead+'</p>';
      h += '</div>';
      return h;
    }

    function renderHome(){
      var known=0, ok=0, no=0, id;
      for(id in state.stats){
        if(!state.stats.hasOwnProperty(id)) continue;
        ok += state.stats[id].ok; no += state.stats[id].no;
        if(state.stats[id].ok>=2 && state.stats[id].ok>state.stats[id].no) known++;
      }
      var acc = (ok+no) ? Math.round(ok*100/(ok+no)) : 0;

      var h = pagehead({ back:opts.backHref, backLabel:opts.backLabel, eyebrow:deck.eyebrow, title:deck.title, lead:deck.intro });
      h += '<div class="modes">';
      for(var i=0;i<MODE_DEFS.length;i++){
        var m = MODE_DEFS[i];
        if(m.orderable && !deck.orderable) continue;
        if(m.reciteOnly && !reciteList.length) continue;
        var best = state.best[m.id];
        var attrs = (m.id==='conspect'||m.id==='recite') ? 'data-go="'+m.id+'"' : 'data-start="'+m.id+'"';
        h += '<button class="mode" '+attrs+' type="button">';
        h += '<span class="mode__ico">'+icon(m.ico)+'</span>';
        h += '<span><span class="mode__t">'+m.t+'</span><span class="mode__d">'+m.d+'</span></span>';
        h += '<span class="mode__meta">'+(best ? '<b>'+best.pct+'%</b>лучший' : (m.id==='conspect' ? articles.length+' '+plural(articles.length,'термин','термина','терминов') : (m.id==='recite' ? reciteList.length+' '+plural(reciteList.length,'статья','статьи','статей') : ''))) + '</span>';
        h += '</button>';
      }
      h += '</div>';
      h += '<div class="strip">';
      h += '<div class="strip__i"><div class="strip__k">Усвоено</div><div class="strip__v">'+known+'<small> / '+deck.cards.length+'</small></div></div>';
      h += '<div class="strip__i"><div class="strip__k">Точность</div><div class="strip__v">'+acc+'<small>%</small></div></div>';
      h += '<div class="strip__i"><div class="strip__k">Ответов</div><div class="strip__v">'+(ok+no)+'</div></div>';
      h += '<div class="strip__i"><div class="strip__k">Экзамен</div><div class="strip__v">'+(state.best.exam ? state.best.exam.pct+'<small>%</small>' : '—')+'</div></div>';
      h += '</div>';
      screenEl.innerHTML = h;
    }

    function renderQuiz(){
      var q = ses.qs[ses.i];
      var pct = Math.round(ses.i*100/ses.qs.length);
      var hasFig = !!q.card.fig;
      var h = '<div class="quiz">';
      h += '<div class="bar">';
      h += '<button class="chip" data-go="home" type="button">← Выйти</button>';
      h += '<span class="bar__n"><b>'+(ses.i+1)+'</b> / '+ses.qs.length+'</span>';
      h += '<span class="bar__track"><span class="bar__fill" style="width:'+pct+'%"></span></span>';
      if(ses.streak>1) h += '<span class="bar__streak">серия '+ses.streak+'</span>';
      if(ses.mode==='exam') h += '<span class="bar__timer" id="examTimer">'+fmtTime(Date.now()-ses.t0)+'</span>';
      h += '<span class="bar__score">'+ses.score+' очк.</span>';
      h += '</div>';

      h += '<div class="play'+(hasFig?'':' play--wide')+'">';
      if(hasFig){
        h += '<div class="stage'+(stageOpen?'':' is-collapsed')+'">' +
          '<button class="stage__toggle" type="button" data-stage-toggle="1">'+(stageOpen?'Свернуть':'Показать')+'</button>' +
          q.card.fig +
          '<div class="stage__hint">'+(stageOpen?'схема':'схема скрыта')+'</div></div>';
      }
      h += '<div>';
      if(q.kind==='term2def'){
        h += '<h2 class="qtext">'+esc(q.card.term)+'</h2>';
        h += '<p class="qsub">Какое определение верное?</p>';
        h += '<div class="answers" id="answers">';
        for(var i=0;i<q.opts.length;i++) h += ansBtn(i, q.opts[i].def);
        h += '</div>';
      } else if(q.kind==='def2term'){
        h += '<h2 class="qtext" style="font-size:clamp(17px,2.4vw,21px);text-transform:none;letter-spacing:0">'+esc(q.card.def)+'</h2>';
        h += '<p class="qsub">Как называется этот термин?</p>';
        h += '<div class="answers" id="answers">';
        for(var j=0;j<q.opts.length;j++) h += ansBtn(j, q.opts[j].term);
        h += '</div>';
      } else if(q.kind==='order'){
        h += '<p class="qsub" style="margin-top:0">'+(q.dir==='next' ? 'Что идёт СЛЕДУЮЩИМ после пункта:' : 'Что идёт ПЕРЕД пунктом:')+'</p>';
        h += '<h2 class="qtext">'+esc(q.from.term)+'</h2>';
        h += '<div class="answers" id="answers">';
        for(var oi=0;oi<q.opts.length;oi++) h += ansBtn(oi, q.opts[oi].term);
        h += '</div>';
      } else if(q.kind==='tf'){
        h += '<p class="qsub" style="margin-top:0">Термин и определение — соответствуют друг другу?</p>';
        h += '<h2 class="qtext">'+esc(q.shown.term)+'</h2>';
        h += '<p class="qdef">'+esc(q.shown.def)+'</p>';
        h += '<div class="answers answers--duo" id="answers">';
        for(var k=0;k<q.opts.length;k++) h += ansBtn(k, q.opts[k].label);
        h += '</div>';
      }
      h += '<div id="fb"></div>';
      h += '</div></div></div>';
      screenEl.innerHTML = h;
      if(examTimerId){ clearInterval(examTimerId); examTimerId=null; }
      if(ses.mode==='exam'){
        examTimerId = setInterval(function(){
          var t = document.getElementById('examTimer');
          if(!t || current!=='quiz'){ clearInterval(examTimerId); examTimerId=null; return; }
          t.textContent = fmtTime(Date.now()-ses.t0);
        }, 1000);
      }
    }
    function ansBtn(i, text){
      return '<button class="ans" data-a="'+i+'" type="button"><span class="ans__k">'+(i+1)+'</span><span>'+esc(text)+'</span></button>';
    }
    function paintAnswer(idx, q, ok){
      var btns = screenEl.querySelectorAll('.ans');
      for(var i=0;i<btns.length;i++){
        btns[i].disabled = true;
        if(i===q.correct) btns[i].classList.add('is-ok');
        else if(i===idx) btns[i].classList.add('is-bad');
        else btns[i].classList.add('is-dim');
      }
      var c = q.card;
      var h = '<div class="fb '+(ok?'is-ok':'is-bad')+'">';
      h += '<div class="fb__h">'+(ok?'Верно':'Ошибка')+'</div>';
      h += '<div class="fb__body">';
      if(c.fig) h += '<div class="fb__fig'+(c.figWide?' fb__fig--wide':'')+'">'+c.fig+'</div>';
      h += '<div class="fb__txt"><b>'+esc(c.term)+'</b><br>'+esc(c.def);
      if(c.gist) h += '<div class="fb__tip"><b>Главное:</b> '+esc(c.gist)+'</div>';
      if(c.tip) h += '<div class="fb__tip">'+esc(c.tip)+'</div>';
      h += '</div></div>';
      h += '<div class="fb__row"><button class="btn" data-next="1" type="button">'+(ses.i+1>=ses.qs.length?'Итоги':'Далее')+' →</button></div>';
      h += '</div>';
      var box = document.getElementById('fb');
      box.innerHTML = h;
      var nb = box.querySelector('[data-next]');
      if(nb){ try{ nb.focus({preventScroll:true}); }catch(e){ nb.focus(); } }
    }

    function renderResult(){
      var total = ses.qs.length;
      var pct = Math.round(ses.right*100/total);
      var mark = pct>=90?5:pct>=75?4:pct>=60?3:2;
      var time = fmtTime(Date.now()-ses.t0);
      var prev = state.best[ses.mode];
      if(!prev || pct>prev.pct){ state.best[ses.mode] = {pct:pct,date:Date.now()}; save(); }
      Site.beep(pct>=60?'win':'bad');

      var h = '<div class="res">';
      h += '<div class="res__mark pop">'+mark+'<small>ОЦЕНКА</small></div>';
      h += '<h2>'+(pct===100?'Без единой ошибки':pct>=90?'Отличный результат':pct>=75?'Хорошо, но есть пробелы':pct>=60?'Удовлетворительно':'Нужно повторить тему')+'</h2>';
      h += '<p class="res__sub">'+ses.right+' из '+total+' · '+pct+'% · '+ses.score+' очков · '+time+' · серия '+ses.maxStreak+'</p>';

      if(ses.wrong.length){
        h += '<div class="sect-h" style="width:100%;max-width:620px;margin-top:14px"><h2>Разбор ошибок</h2><small>'+ses.wrong.length+' '+plural(ses.wrong.length,'ошибка','ошибки','ошибок')+'</small></div>';
        h += '<div class="errlist">';
        for(var i=0;i<ses.wrong.length;i++){
          var w = ses.wrong[i], c = w.q.card;
          h += '<div class="errlist__i"><span class="errlist__t"><b>'+esc(c.term)+'</b><span>'+esc(c.def)+'</span></span></div>';
        }
        h += '</div>';
      }
      h += '<div class="fb__row" style="justify-content:center;margin-top:6px">';
      h += '<button class="btn" data-start="'+ses.mode+'" type="button">Ещё раз</button>';
      if(ses.wrong.length) h += '<button class="btn btn--ghost" data-retry="1" type="button">Работа над ошибками</button>';
      h += '<button class="btn btn--ghost" data-go="home" type="button">К режимам</button>';
      h += '</div></div>';
      screenEl.innerHTML = h;
    }

    /* ---------------- конспект: тема целиком, сплошным текстом ---------------- */
    function renderConspect(){
      var h = pagehead({ back:null, eyebrow:deck.eyebrow, title:'Конспект: '+deck.title, lead:'Все термины темы подряд — читайте перед тем, как тренироваться.' });
      h += '<div class="fb__row" style="margin-bottom:18px"><button class="chip" data-go="home" type="button">← К режимам</button></div>';
      h += '<div class="notebook"><div class="conspect-prose">';
      var lastSection = null, secIndex = 0;
      for(var i=0;i<articles.length;i++){
        var c = articles[i];
        if(c.section){
          if(c.section !== lastSection){
            h += '<div class="conspect-prose__section">'+esc(c.section)+'</div>';
            if(c.sectionNote) h += '<p class="conspect-prose__sectionnote">'+esc(c.sectionNote)+'</p>';
            lastSection = c.section;
            secIndex = 0;
          }
          secIndex++;
        } else {
          lastSection = null; secIndex = 0;
        }
        h += '<div class="conspect-prose__i">';
        h += '<button class="conspect-prose__head" type="button" data-term-toggle="1">';
        if(c.section) h += '<span class="conspect-prose__num">'+secIndex+'.</span> ';
        h += '<span class="conspect-prose__term">'+esc(c.term)+'</span>';
        h += '<svg class="conspect-prose__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';
        h += '</button>';
        h += '<div class="conspect-prose__panel">';
        /* figWide — таблицы/схемы, которые не влезают в узкую плашку-иконку
           132px (та плавает слева от текста); полноширинный блок сверху,
           без обтекания. Обычные маленькие SVG-значки — как раньше. */
        if(c.fig) h += '<div class="'+(c.figWide?'conspect-prose__figwide':'conspect-prose__fig')+'">'+c.fig+'</div>';
        if(c.gist) h += '<div class="conspect-prose__gist"><b>Главное</b>'+esc(c.gist)+'</div>';
        h += '<p class="conspect-prose__p">'+esc(c.def);
        if(c.tip) h += ' <span class="conspect-prose__tip">— '+esc(c.tip)+'</span>';
        h += '</p></div></div>';
      }
      h += '</div></div>';
      screenEl.innerHTML = h;
    }

    /* ---------------- наизусть: статья целиком, слова постепенно прячутся ---------------- */
    var REC_LEVELS = [
      { n:0, t:'Читаю', d:'весь текст виден' },
      { n:1, t:'Уровень 1', d:'спрятана четверть слов', p:25, min:4 },
      { n:2, t:'Уровень 2', d:'спрятана половина слов', p:50, min:4 },
      { n:3, t:'Уровень 3', d:'спрятано почти всё', p:82, min:3 },
      { n:4, t:'Уровень 4', d:'только первые буквы', p:101, min:1 }
    ];
    function recRank(idx, len){ return (idx*73 + len*31 + (idx%7)*17) % 100; }
    function reciteDone(id){ return (state.recite && state.recite[id]) || 0; }

    function renderReciteList(){
      var h = pagehead({ back:null, eyebrow:deck.eyebrow, title:'Наизусть: '+deck.title, lead:'Это то, что точно спросят. Открываете статью, читаете, потом поднимаете уровень: слова прячутся, вы договариваете вслух и сверяетесь — нажатием на скрытое слово.' });
      h += '<div class="fb__row" style="margin-bottom:18px"><button class="chip" data-go="home" type="button">← К режимам</button></div>';
      h += '<div class="modes">';
      for(var i=0;i<reciteList.length;i++){
        var c = reciteList[i], lv = reciteDone(c.id);
        h += '<button class="mode" type="button" data-rec-open="'+i+'">';
        h += '<span class="mode__ico"><b class="rec__n">'+(i+1)+'</b></span>';
        h += '<span><span class="mode__t">'+esc(c.term)+'</span>'+(c.gist?'<span class="mode__d">'+esc(c.gist)+'</span>':'')+'</span>';
        h += '<span class="mode__meta">'+(lv>=4 ? '<b>4/4</b>наизусть' : (lv ? '<b>'+lv+'/4</b>уровень' : 'новое'))+'</span>';
        h += '</button>';
      }
      h += '</div>';
      screenEl.innerHTML = h;
    }

    function reciteHtml(c, level){
      var L = REC_LEVELS[level];
      var lines = String(c.def).split('\n'), idx = 0, out = '';
      for(var li=0; li<lines.length; li++){
        var toks = lines[li].split(/\s+/).filter(Boolean);
        for(var t=0; t<toks.length; t++, idx++){
          var tok = toks[t];
          var m = tok.match(/^([^A-Za-zА-Яа-яЁё0-9]*)([A-Za-zА-Яа-яЁё0-9\-]*)([\s\S]*)$/);
          var pre = m[1], core = m[2], post = m[3];
          var hide = level>0 && core.length>=L.min && recRank(idx, core.length) < L.p;
          if(!hide){ out += esc(tok)+' '; continue; }
          var revealed = rec.shown[idx];
          var mask = level===4 ? core.charAt(0)+new Array(core.length).join('·') : new Array(core.length+1).join('_');
          out += esc(pre)+'<span class="rec__w'+(revealed?' is-shown':'')+'" data-rec-w="'+idx+'">'+esc(revealed?core:mask)+'</span>'+esc(post)+' ';
        }
        out += '\n';
      }
      return out;
    }

    function renderReciteCard(){
      var c = reciteList[rec.i], L = REC_LEVELS[rec.level];
      var h = '<div class="fb__row" style="margin:6px 0 14px"><button class="chip" data-go="recite" type="button">← К списку</button><span class="rec__count">'+(rec.i+1)+' / '+reciteList.length+'</span></div>';
      h += '<div class="rec__term">'+esc(c.term)+'</div>';
      if(c.gist) h += '<div class="conspect-prose__gist"><b>Главное</b>'+esc(c.gist)+'</div>';
      h += '<div class="rec__lv">';
      for(var k=0;k<REC_LEVELS.length;k++) h += '<button type="button" class="rec__lvb'+(k===rec.level?' is-on':'')+'" data-rec-level="'+k+'">'+(k===0?'Чтение':k)+'</button>';
      h += '</div><div class="rec__lvd">'+L.t+' · '+L.d+(rec.level ? ' · нажмите на скрытое слово, чтобы проверить себя' : '')+'</div>';
      h += '<div class="notebook"><div class="rec__text">'+reciteHtml(c, rec.level)+'</div></div>';
      h += '<div class="rec__act">';
      if(rec.level>0) h += '<button class="btn btn--ghost" type="button" data-rec-reveal="1">Показать всё</button>';
      if(rec.level>0 && rec.level<4) h += '<button class="btn" type="button" data-rec-ok="1">Помню — сложнее</button>';
      if(rec.level===0) h += '<button class="btn" type="button" data-rec-level="1">Прочитал — прячу слова</button>';
      if(rec.level===4) h += '<button class="btn" type="button" data-rec-ok="1">Помню наизусть</button>';
      h += '</div>';
      h += '<div class="rec__nav">';
      h += '<button class="chip" type="button" data-rec-step="-1"'+(rec.i===0?' disabled':'')+'>← Предыдущая</button>';
      h += '<button class="chip" type="button" data-rec-step="1"'+(rec.i===reciteList.length-1?' disabled':'')+'>Следующая →</button>';
      h += '</div>';
      screenEl.innerHTML = h;
    }

    function recSave(){ try{ localStorage.setItem(storeKey, JSON.stringify(state)); }catch(e){} }

    /* ---------------- события ---------------- */
    screenEl.addEventListener('click', function(e){
      if(!e.target || !e.target.closest) return;
      var t = e.target.closest('[data-rec-open],[data-rec-level],[data-rec-w],[data-rec-reveal],[data-rec-ok],[data-rec-step],[data-a],[data-go],[data-start],[data-next],[data-retry],[data-stage-toggle],[data-term-toggle]');
      if(!t) return;
      if(t.hasAttribute('data-term-toggle')){
        var itemEl = t.closest('.conspect-prose__i');
        if(itemEl) itemEl.classList.toggle('is-open');
        return;
      }
      if(t.hasAttribute('data-stage-toggle')){
        stageOpen = !stageOpen;
        try{ localStorage.setItem(STAGE_KEY, stageOpen ? '1' : '0'); }catch(e2){}
        var stageEl = screenEl.querySelector('.stage');
        if(stageEl){
          stageEl.classList.toggle('is-collapsed', !stageOpen);
          t.textContent = stageOpen ? 'Свернуть' : 'Показать';
          var hint = stageEl.querySelector('.stage__hint');
          if(hint) hint.textContent = stageOpen ? 'схема' : 'схема скрыта';
        }
        return;
      }
      if(t.hasAttribute('data-rec-open')){ rec = { i:parseInt(t.getAttribute('data-rec-open'),10), level:0, shown:{} }; go('reciteCard'); return; }
      if(t.hasAttribute('data-rec-level')){ rec.level = parseInt(t.getAttribute('data-rec-level'),10); rec.shown = {}; var y0=window.scrollY; renderReciteCard(); window.scrollTo(0,y0); return; }
      if(t.hasAttribute('data-rec-w')){ var wi = t.getAttribute('data-rec-w'); rec.shown[wi] = !rec.shown[wi]; var y1=window.scrollY; renderReciteCard(); window.scrollTo(0,y1); return; }
      if(t.hasAttribute('data-rec-reveal')){
        var txt = String(reciteList[rec.i].def).split(/\s+/).length; for(var q=0;q<txt;q++) rec.shown[q]=true;
        var y2=window.scrollY; renderReciteCard(); window.scrollTo(0,y2); return;
      }
      if(t.hasAttribute('data-rec-ok')){
        state.recite = state.recite || {};
        var cid = reciteList[rec.i].id;
        state.recite[cid] = Math.max(state.recite[cid]||0, rec.level); recSave();
        if(rec.level<4){ rec.level++; rec.shown = {}; renderReciteCard(); window.scrollTo(0,0); }
        else if(rec.i<reciteList.length-1){ rec = { i:rec.i+1, level:0, shown:{} }; renderReciteCard(); window.scrollTo(0,0); }
        else go('recite');
        return;
      }
      if(t.hasAttribute('data-rec-step')){ rec = { i:rec.i+parseInt(t.getAttribute('data-rec-step'),10), level:0, shown:{} }; go('reciteCard'); return; }
      if(t.hasAttribute('data-a')){ answerQ(parseInt(t.getAttribute('data-a'),10), t); return; }
      if(t.hasAttribute('data-next')){ nextQ(); return; }
      if(t.hasAttribute('data-start')){ startSession(t.getAttribute('data-start')); return; }
      if(t.hasAttribute('data-go')){ go(t.getAttribute('data-go')); return; }
      if(t.hasAttribute('data-retry')){
        var picks = ses.wrong.map(function(w){ return w.q.card; });
        var kinds = ['term2def','def2term','tf'];
        var qs = picks.map(function(c){ return buildQuestion(pickOne(kinds), c); });
        shuffle(qs);
        ses = { mode:ses.mode, qs:qs, i:0, score:0, streak:0, maxStreak:0, right:0, wrong:[], t0:Date.now(), answered:false };
        go('quiz');
        return;
      }
    });
    document.addEventListener('keydown', function(e){
      if(current!=='quiz' || !ses) return;
      if(!ses.answered && e.key>='1' && e.key<='9'){
        var n=parseInt(e.key,10)-1;
        var b=screenEl.querySelectorAll('.ans');
        if(b[n]) answerQ(n, b[n]);
      } else if(ses.answered && (e.key==='Enter'||e.key===' ')){
        e.preventDefault(); nextQ();
      }
    });

    go('home');
    return { go:go, startSession:startSession };
  }

  return { init:init };
})();
