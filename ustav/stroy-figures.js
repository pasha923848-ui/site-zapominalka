/* ============================================================
   STROY-FIGURES.JS — схемы к терминам строевого устава: фигуры
   военнослужащих анфас (как на схемах в методичках), а не точки.
   Общий файл для stroevoy-terms.html и para2-review.html — одна
   и та же геометрия и один и тот же текст определений в обоих
   местах, чтобы не разъехались при правках.
   ============================================================ */
var StroyFigures = (function(){
  "use strict";
  /* Схемы без цвета — один нейтральный тон (светлый силуэт на
     тёмном фоне), как в методичках. «Неактивная» фигура (в
     сравнениях) — тот же силуэт, просто приглушённый. Единственный
     цветной элемент — стрелки/скобки-обозначения (латунь), чтобы
     они не терялись на фоне серых фигур. */
  var FIG_FILL = '#dcdad2', FIG_STROKE = '#8e968b';
  var FIG_FILL_DIM = '#4c4f49', FIG_STROKE_DIM = '#3a3c37';
  var GOLD = '#c9a552', LINE = '#8e968b';

  function txt(x, y, s, anchor, size){
    return '<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||'middle')+'" font-family="PT Mono, Consolas, monospace" font-size="'+(size||11)+'" fill="'+LINE+'" letter-spacing=".01em">'+s+'</text>';
  }
  /* военнослужащий анфас, простой силуэт: cx — центр по горизонтали, baseY — линия земли (стопы) */
  function soldier(cx, baseY, scale, dim){
    scale = scale || 1;
    var fill = dim ? FIG_FILL_DIM : FIG_FILL, stroke = dim ? FIG_STROKE_DIM : FIG_STROKE;
    var legw = 6*scale, legGap = 3*scale, legh = 19*scale, bodyw = 19*scale, bodyh = 25*scale, headR = 8.5*scale, neck = 2*scale;
    var y1 = baseY - legh, yTop = y1 - bodyh, headCy = yTop - neck - headR;
    var sw = (1.3*scale).toFixed(2);
    var s = '';
    /* ноги */
    s += '<rect x="'+(cx-legGap/2-legw).toFixed(1)+'" y="'+y1.toFixed(1)+'" width="'+legw.toFixed(1)+'" height="'+legh.toFixed(1)+'" rx="'+(2*scale).toFixed(1)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
    s += '<rect x="'+(cx+legGap/2).toFixed(1)+'" y="'+y1.toFixed(1)+'" width="'+legw.toFixed(1)+'" height="'+legh.toFixed(1)+'" rx="'+(2*scale).toFixed(1)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
    /* туловище — простая трапеция (плечи шире) */
    s += '<path d="M'+(cx-bodyw/2).toFixed(1)+' '+yTop.toFixed(1)+' L'+(cx+bodyw/2).toFixed(1)+' '+yTop.toFixed(1)+' L'+(cx+bodyw*0.36).toFixed(1)+' '+y1.toFixed(1)+' L'+(cx-bodyw*0.36).toFixed(1)+' '+y1.toFixed(1)+' Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" stroke-linejoin="round"/>';
    /* голова */
    s += '<circle cx="'+cx.toFixed(1)+'" cy="'+headCy.toFixed(1)+'" r="'+headR.toFixed(1)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
    return s;
  }
  function row(n, x0, gap, baseY, dimIdx){
    dimIdx = dimIdx || [];
    var s = '';
    for(var i=0;i<n;i++) s += soldier(x0+i*gap, baseY, 1, dimIdx.indexOf(i) !== -1);
    return s;
  }
  function car(x, y, scale){
    scale = scale || 1;
    var w = 30*scale, h = 19*scale, r = 3*scale;
    return '<rect x="'+(x-w/2).toFixed(1)+'" y="'+(y-h/2).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" rx="'+r.toFixed(1)+'" fill="'+FIG_FILL+'" stroke="'+FIG_STROKE+'" stroke-width="1.3"/>' +
           '<circle cx="'+(x-w*0.28).toFixed(1)+'" cy="'+(y+h/2).toFixed(1)+'" r="'+(3*scale).toFixed(1)+'" fill="'+FIG_STROKE+'"/>' +
           '<circle cx="'+(x+w*0.28).toFixed(1)+'" cy="'+(y+h/2).toFixed(1)+'" r="'+(3*scale).toFixed(1)+'" fill="'+FIG_STROKE+'"/>';
  }
  function arrowH(x1, x2, y){
    return '<line x1="'+x1+'" y1="'+y+'" x2="'+x2+'" y2="'+y+'" stroke="'+GOLD+'" stroke-width="1.4"/>' +
           '<path d="M'+x1+' '+y+' l7 -4 v8 z" fill="'+GOLD+'"/><path d="M'+x2+' '+y+' l-7 -4 v8 z" fill="'+GOLD+'"/>';
  }
  function arrowV(y1, y2, x){
    return '<line x1="'+x+'" y1="'+y1+'" x2="'+x+'" y2="'+y2+'" stroke="'+GOLD+'" stroke-width="1.4"/>' +
           '<path d="M'+x+' '+y1+' l-4 7 h8 z" fill="'+GOLD+'"/><path d="M'+x+' '+y2+' l-4 -7 h8 z" fill="'+GOLD+'"/>';
  }
  function svg(inner, vb){ return '<svg viewBox="'+(vb||'0 0 190 125')+'" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>'; }

  var FIG = {};
  /* --- строй, общий вид --- */
  FIG.stroy = svg(row(6, 22, 26, 100));
  /* --- шеренга: одна линия, интервал подписан --- */
  FIG.sherenga = svg(row(5, 26, 32, 96) + arrowH(26, 58, 110) + txt(42, 121, 'интервал'));
  /* --- линия машин --- */
  FIG.liniaMashin = svg(car(35,55)+car(80,55)+car(125,55), '0 0 190 90');
  /* --- фланг: подсвечены крайние, подписаны по конвенции (лицом к зрителю) --- */
  FIG.flang = svg(row(6, 22, 26, 100, [1,2,3,4]) + txt(22, 12, 'прав. фланг') + txt(152, 12, 'лев. фланг'));
  /* --- фронт: куда обращены лицом — вниз, к зрителю --- */
  FIG.front = svg(row(6, 22, 26, 100) + arrowV(108, 120, 97) + txt(97, 12, 'тыльная сторона'));
  /* --- тыльная сторона: то же, стрелка вверх --- */
  FIG.tyl = svg(row(6, 22, 26, 100) + arrowV(46, 32, 97) + txt(97, 121, 'фронт строя'));
  /* --- интервал: по фронту, между соседями --- */
  FIG.interval = svg(row(3, 32, 55, 96) + arrowH(32, 87, 110) + txt(59, 121, 'интервал'));
  /* --- дистанция: вглубь, три фигуры «на удалении» --- */
  FIG.distancia = svg(soldier(60,112,1,false) + soldier(60,74,0.72,false) + soldier(60,46,0.5,false) + arrowV(46,74,118) + txt(150,63,'дистанция'), '0 0 190 125');
  /* --- ширина строя: между флангами --- */
  FIG.shirina = svg(row(6, 22, 26, 100) + arrowH(22, 152, 112) + txt(87, 122, 'ширина строя'));
  /* --- глубина строя: от первой шеренги до последней --- */
  FIG.glubina = svg(soldier(60,112,1,false) + soldier(60,74,0.72,false) + soldier(60,46,0.5,false) + arrowV(46,112,150) + txt(163,80,'глубина'), '0 0 190 125');
  /* --- двухшереножный строй: две линии, задняя выше и мельче --- */
  FIG.dvuhsherenga = svg(row(5, 26, 32, 108) + (function(){ var s=''; for(var i=0;i<5;i++) s+=soldier(26+i*32, 72, 0.72, false); return s; })());
  /* --- ряд: одна пара, передний+задний, подсвечена --- */
  FIG.ryad = svg(
    row(5, 26, 32, 108, [0,1,3,4]) +
    (function(){ var s=''; for(var i=0;i<5;i++) s+=soldier(26+i*32, 72, 0.72, i!==2); return s; })() +
    '<line x1="90" y1="66" x2="90" y2="94" stroke="'+GOLD+'" stroke-width="1.3" stroke-dasharray="2.5 3"/>'
  );
  /* --- колонна: друг за другом, в глубину --- */
  FIG.kolonna = svg(
    soldier(60,116,1,false) + soldier(60,88,0.82,false) + soldier(60,64,0.66,false) + soldier(60,44,0.52,false) + soldier(60,28,0.4,false),
    '0 0 120 125'
  );

  var CARDS = [
    { id:'s1', section:'Строй и его элементы', term:'Строй', fig:FIG.stroy,
      def:'Установленное Уставом размещение военнослужащих, подразделений и воинских частей для их совместных действий в пешем порядке и на машинах.',
      tip:'Статья 1, пункт 1. Самое общее понятие — все остальные термины этого раздела частные случаи строя.' },
    { id:'s2', section:'Строй и его элементы', term:'Шеренга', fig:FIG.sherenga,
      def:'Строй, в котором военнослужащие размещены один возле другого на одной линии на установленных интервалах.',
      tip:'Пункт 2. Не забывайте концовку «на установленных интервалах» — без неё определение неполное.' },
    { id:'s3', section:'Строй и его элементы', term:'Линия машин', fig:FIG.liniaMashin,
      def:'Отдельного определения в статье 1 нет — термин встречается внутри определения развёрнутого строя как аналог шеренги для машин: подразделения строятся «в одношереножном или двухшереножном строю (в линию машин)».',
      tip:'Единственный термин в этом разделе, для которого нет отдельного пронумерованного пункта — честно говорим об этом, а не выдумываем цитату.' },
    { id:'s4', section:'Строй и его элементы', term:'Фланг', fig:FIG.flang,
      def:'Правая (левая) оконечность строя. При поворотах строя названия флангов не изменяются.',
      tip:'Пункт 3. «Не изменяются» — а не «не меняются»: устав использует именно это слово.' },
    { id:'s5', section:'Строй и его элементы', term:'Фронт', fig:FIG.front,
      def:'Сторона строя, в которую военнослужащие обращены лицом (машины — лобовой частью).',
      tip:'Пункт 4. Уточнение про машины — «лобовой частью» — часто выпадает из памяти, а спросить могут именно его.' },
    { id:'s6', section:'Строй и его элементы', term:'Тыльная сторона строя', fig:FIG.tyl,
      def:'Сторона, противоположная фронту.',
      tip:'Пункт 5. Самое короткое определение раздела.' },
    { id:'s7', section:'Строй и его элементы', term:'Интервал', fig:FIG.interval,
      def:'Расстояние по фронту между военнослужащими (машинами), подразделениями и воинскими частями.',
      tip:'Пункт 6. «По фронту» — то есть вбок, не путать с дистанцией.' },
    { id:'s8', section:'Строй и его элементы', term:'Дистанция', fig:FIG.distancia,
      def:'Расстояние в глубину между военнослужащими (машинами), подразделениями и воинскими частями.',
      tip:'Пункт 7. «В глубину» — вперёд-назад, зеркально интервалу.' },
    { id:'s9', section:'Строй и его элементы', term:'Ширина строя', fig:FIG.shirina,
      def:'Расстояние между флангами.',
      tip:'Пункт 8. Коротко: от правого фланга до левого.' },
    { id:'s10', section:'Строй и его элементы', term:'Глубина строя', fig:FIG.glubina,
      def:'Расстояние от первой шеренги (впереди стоящего военнослужащего) до последней шеренги (позади стоящего военнослужащего), а при действиях на машинах — расстояние от первой линии машин (впереди стоящей машины) до последней линии машин (позади стоящей машины).',
      tip:'Пункт 9. Самое длинное определение раздела — два варианта: для пешего строя и для машин.' },
    { id:'s11', section:'Виды строя', term:'Двухшереножный строй', fig:FIG.dvuhsherenga,
      def:'Строй, в котором военнослужащие одной шеренги расположены в затылок военнослужащим другой шеренги на дистанции одного шага (вытянутой руки, наложенной ладонью на плечо впереди стоящего военнослужащего).',
      tip:'Пункт 10. Расстояние определено предметно: вытянутая рука, ладонь на плече впереди стоящего.' },
    { id:'s12', section:'Виды строя', term:'Ряд', fig:FIG.ryad,
      def:'Два военнослужащих, стоящих в двухшереножном строю в затылок один другому.',
      tip:'Пункт 11. Именно ДВА военнослужащих — не больше.' },
    { id:'s13', section:'Виды строя', term:'Колонна', fig:FIG.kolonna,
      def:'Строй, в котором военнослужащие расположены в затылок друг другу, а подразделения (машины) — одно за другим на дистанциях, установленных Уставом или командиром.',
      tip:'Пункт 12. Про машины — не «в затылок», а «одно за другим».' }
  ];

  return { buildTermCards: function(){ return CARDS; }, FIG:FIG, svg:svg, row:row, soldier:soldier, arrowH:arrowH, arrowV:arrowV, car:car, txt:txt };
})();
