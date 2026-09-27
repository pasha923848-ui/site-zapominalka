/* ============================================================
   NAV-DATA.JS — дерево «семестр → предмет → тема» для выпадающей
   панели меню в шапке (Site.initMenu). Пути — от корня сайта,
   без ведущего слэша; initMenu сам добавляет нужный префикс
   ('' на корневых страницах, '../' внутри ustav/ и tactics/).
   Правьте этот файл вручную при добавлении новых тем — панель
   меню на всех страницах соберётся из него автоматически.
   ============================================================ */
var NavData = {
  semesters: [
    {
      n: 1, status: 'active', label: 'Семестр 1',
      subjects: [
        {
          title: 'Общевоенная подготовка', href: 'ustav/index.html',
          groups: [
            { title: 'Пара 1', items: [
              { title: 'Погоны и звания', href: 'ustav/pogony.html' },
              { title: 'Структура и порядок в ВУЦ', href: 'ustav/vuc-order.html' },
              { title: 'Уставы: история и назначение', href: 'ustav/charters-history.html' },
              { title: 'Права и общие обязанности', href: 'ustav/rights-duties.html' },
              { title: 'Взаимоотношения между военнослужащими', href: 'ustav/relations.html' }
            ] },
            { title: 'Пара 2', items: [
              { title: 'Размещение военнослужащих', href: 'ustav/quartering.html' },
              { title: 'Суточный наряд воинской части', href: 'ustav/duty-corps.html' },
              { title: 'Обязанности дневального', href: 'ustav/dnevalny-duties.html' },
              { title: 'Термины строевого устава', href: 'ustav/stroevoy-terms.html' },
              { title: 'Строевой устав: содержание и обязанности', href: 'ustav/stroevoy-duties.html' },
              { title: 'Пара 2 — общая запоминалка', href: 'ustav/para2-review.html' }
            ] },
            { title: 'Пара 3', items: [
              { title: 'Летучка 24.09 — что спросят', href: 'ustav/para3-letuchka.html' },
              { title: 'Летучка: варианты 1–3', href: 'ustav/para3-variants.html' },
              { title: 'Дисциплина и жалобы', href: 'ustav/discipline.html' },
              { title: 'Поощрения', href: 'ustav/encouragements.html' }
            ] },
            { title: 'Пара 0 · справочные', items: [
              { title: 'Обязанности военнослужащего', href: 'ustav/duties.html' },
              { title: 'Распорядок дня и наряд', href: 'ustav/routine.html' },
              { title: 'Обращение и вежливость', href: 'ustav/courtesy.html' }
            ] }
          ]
        },
        {
          title: 'Общая тактика', href: 'tactics/index.html',
          groups: [
            { title: 'Пара 1 · тема 1', items: [
              { title: 'Военные угрозы России', href: 'tactics/military-threats.html' }
            ] },
            { title: 'Пара 2 · тема 1', items: [
              { title: 'Военная доктрина РФ', href: 'tactics/military-doctrine.html' },
              { title: 'Структура ВС РФ', href: 'tactics/armed-forces-structure.html' }
            ] }
          ]
        }
      ]
    },
    { n: 2, status: 'locked', label: 'Семестр 2' },
    { n: 3, status: 'locked', label: 'Семестр 3' },
    { n: 4, status: 'locked', label: 'Семестр 4' }
  ]
};
