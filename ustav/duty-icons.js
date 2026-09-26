/* ============================================================
   DUTY-ICONS.JS — значки для должностей суточного наряда полка.
   ============================================================ */
var DutyIcons = (function(){
  "use strict";
  var GOLD = '#c9a552', GOLD_HI = '#e8cf82', STROKE = '#7d5f16', INK = '#151917';
  function svg(inner){ return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>'; }
  function g(inner){ return '<g fill="'+GOLD+'" stroke="'+STROKE+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">'+inner+'</g>'; }

  var ICO = {};
  /* дежурный по полку / помощник — звезда-бейдж */
  ICO.badge = svg(g('<circle cx="32" cy="27" r="15"/><path d="M32 17l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="'+GOLD_HI+'" stroke="none"/><path d="M24 40l-6 14 14-6 14 6-6-14"/>'));
  /* дежурное подразделение — щит с молнией готовности */
  ICO.ready = svg(g('<path d="M32 8l20 8v14c0 14-9 24-20 26-11-2-20-12-20-26V16z"/><path d="M34 20l-10 14h8l-4 12 14-16h-8z" fill="'+GOLD_HI+'" stroke="none"/>'));
  /* караул — простой щит */
  ICO.guard = svg(g('<path d="M32 8l18 7v13c0 13-8 22-18 24-10-2-18-11-18-24V15z"/>'));
  /* парк техники — грузовик/тягач */
  ICO.park = svg(g('<rect x="8" y="26" width="30" height="14" rx="2"/><path d="M38 30h10l6 8v2H38z"/><circle cx="18" cy="42" r="4" fill="'+INK+'"/><circle cx="46" cy="42" r="4" fill="'+INK+'"/>'));
  /* медицинский пункт — крест */
  ICO.medic = svg(g('<rect x="10" y="10" width="44" height="44" rx="6"/><path d="M28 18h8v10h10v8H36v10h-8V36H18v-8h10z" fill="'+INK+'" stroke="none"/>'));
  /* КПП — шлагбаум */
  ICO.gate = svg(g('<rect x="8" y="44" width="10" height="8"/><rect x="10" y="16" width="6" height="30"/><rect x="13" y="14" width="36" height="6" transform="rotate(20 13 14)"/><circle cx="13" cy="14" r="3" fill="'+GOLD_HI+'"/>'));
  /* столовая — тарелка с приборами */
  ICO.canteen = svg(g('<circle cx="32" cy="32" r="18"/><circle cx="32" cy="32" r="9" fill="'+INK+'" stroke="none"/><line x1="12" y1="14" x2="12" y2="26"/><line x1="8" y1="14" x2="8" y2="22"/><line x1="16" y1="14" x2="16" y2="22"/><path d="M52 14v14M48 14c0 4 0 6 4 8v22"/>'));
  /* штаб полка — документ со звездой */
  ICO.staff = svg(g('<rect x="14" y="8" width="36" height="48" rx="2"/><line x1="22" y1="20" x2="42" y2="20"/><line x1="22" y1="28" x2="42" y2="28"/><path d="M32 34l2.5 5 5.5.6-4 4 1 5.4-5-2.8-5 2.8 1-5.4-4-4 5.5-.6z" fill="'+GOLD_HI+'" stroke="none"/>'));
  /* сигналист-барабанщик — барабан */
  ICO.drum = svg(g('<rect x="14" y="24" width="36" height="22" rx="3"/><ellipse cx="32" cy="24" rx="18" ry="6"/><line x1="20" y1="14" x2="26" y2="24" stroke-width="2.4"/><line x1="40" y1="12" x2="36" y2="24" stroke-width="2.4"/>'));
  /* посыльные — конверт в движении */
  ICO.runner = svg(g('<rect x="10" y="18" width="36" height="26" rx="2"/><path d="M10 18l18 14 18-14" fill="none"/><path d="M46 46l10 4-4-10z" fill="'+GOLD_HI+'" stroke="none"/>'));
  /* пожарный наряд — пламя */
  ICO.fire = svg(g('<path d="M32 8c6 10-4 12-2 20 6-2 6-8 6-8 6 6 4 16-4 22-10-4-14-14-8-24 2 4 2 6 2 6 2-6-2-10 6-16z" fill="'+GOLD_HI+'"/>'));

  return { ICO:ICO };
})();
