/* ============================================================
   ROOM-ICONS.JS — схематичные значки для помещений расположения
   роты. Не фотографии (авторские права на случайные снимки из
   интернета — тёмная зона, плюс разнобой ракурсов), а простые
   узнаваемые пиктограммы в общей цветовой системе сайта.
   ============================================================ */
var RoomIcons = (function(){
  "use strict";
  var GOLD = '#c9a552', GOLD_HI = '#e8cf82', STROKE = '#7d5f16', INK = '#151917';
  function svg(inner){ return '<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">'+inner+'</svg>'; }
  function g(inner){ return '<g fill="'+GOLD+'" stroke="'+STROKE+'" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">'+inner+'</g>'; }

  var ICO = {};
  /* 1. спальное помещение — кровать */
  ICO.bed = svg(g('<rect x="10" y="30" width="44" height="16" rx="2"/><rect x="10" y="24" width="12" height="10" rx="2" fill="'+GOLD_HI+'"/><line x1="10" y1="46" x2="10" y2="53"/><line x1="54" y1="46" x2="54" y2="53"/>'));
  /* 2. комната информирования и досуга — экран */
  ICO.tv = svg(g('<rect x="10" y="16" width="44" height="28" rx="2"/><rect x="16" y="22" width="32" height="16" fill="'+INK+'" stroke="none"/><line x1="32" y1="44" x2="32" y2="50"/><line x1="22" y1="50" x2="42" y2="50"/>'));
  /* 3. канцелярия роты — папка с документами */
  ICO.folder = svg(g('<path d="M8 20h16l4 5h28v28H8z"/><line x1="16" y1="34" x2="48" y2="34"/><line x1="16" y1="40" x2="40" y2="40"/>'));
  /* 4. комната хранения оружия — стойка с оружием под замком */
  ICO.rack = svg(g('<rect x="9" y="12" width="46" height="42" rx="2" fill="none"/>'+
    '<line x1="20" y1="18" x2="20" y2="48"/><path d="M20 18l4 -5"/>'+
    '<line x1="32" y1="18" x2="32" y2="48"/><path d="M32 18l4 -5"/>'+
    '<line x1="44" y1="18" x2="44" y2="48"/><path d="M44 18l4 -5"/>'+
    '<circle cx="32" cy="48" r="4" fill="'+GOLD_HI+'"/>'));
  /* 5. место для чистки оружия — оружие и ветошь */
  ICO.clean = svg(g('<line x1="10" y1="40" x2="46" y2="16"/><path d="M40 16l6 0 0 6"/>'+
    '<path d="M14 44c6 4 14 4 20 0c-4 6 -14 8 -20 0z" fill="'+GOLD_HI+'"/>'));
  /* 6. место для спортивных занятий — гантель */
  ICO.dumbbell = svg(g('<rect x="8" y="27" width="8" height="10" rx="2"/><rect x="48" y="27" width="8" height="10" rx="2"/><line x1="16" y1="32" x2="48" y2="32" stroke-width="4"/>'));
  /* 7. комната бытового обслуживания — утюг */
  ICO.iron = svg(g('<path d="M12 44h28l10-10c2-6-2-12-10-12H24c-7 0-12 5-12 10z"/><rect x="24" y="18" width="10" height="4" fill="'+GOLD_HI+'"/>'));
  /* 8. кладовая — ящик */
  ICO.crate = svg(g('<rect x="10" y="24" width="44" height="26"/><line x1="10" y1="24" x2="32" y2="10"/><line x1="54" y1="24" x2="32" y2="10"/><line x1="10" y1="24" x2="54" y2="24"/><line x1="32" y1="24" x2="32" y2="50"/>'));
  /* 9. чистка обуви — ботинок и щётка */
  ICO.shoe = svg(g('<path d="M10 44c0-8 4-14 10-16l6-4 14 2v14c4 0 8 2 8 4z"/><line x1="42" y1="24" x2="52" y2="18" stroke-width="3"/>'));
  /* 10. сушилка — вешалка с волнами тепла */
  ICO.dryer = svg(g('<path d="M32 14v6"/><path d="M18 24l14-4 14 4"/><path d="M14 30h36l-4 18H18z"/>')+
    '<path d="M22 12c2 3 -2 3 0 6M32 10c2 3 -2 3 0 6M42 12c2 3 -2 3 0 6" fill="none" stroke="'+GOLD+'" stroke-width="1.6" stroke-linecap="round"/>');
  /* 11. умывальник — кран и капля */
  ICO.sink = svg(g('<rect x="10" y="34" width="44" height="8" rx="3"/><path d="M40 34v-10a4 4 0 018 0v6" fill="none"/>'+
    '<path d="M32 46c0 3-2 5-4 5s-4-2-4-5c0-3 4-8 4-8s4 5 4 8z" fill="'+GOLD_HI+'"/>'));
  /* 12. душевая — лейка с каплями */
  ICO.shower = svg(g('<path d="M16 22a16 16 0 0132 0z"/><line x1="16" y1="22" x2="48" y2="22" stroke-width="3"/>')+
    '<line x1="22" y1="30" x2="20" y2="38" stroke="'+GOLD+'" stroke-width="2" stroke-linecap="round"/>'+
    '<line x1="32" y1="30" x2="30" y2="40" stroke="'+GOLD+'" stroke-width="2" stroke-linecap="round"/>'+
    '<line x1="42" y1="30" x2="40" y2="38" stroke="'+GOLD+'" stroke-width="2" stroke-linecap="round"/>');
  /* 13. туалет — унитаз */
  ICO.wc = svg(g('<rect x="18" y="14" width="28" height="10" rx="2"/><path d="M20 24c-4 0-6 3-6 8c0 10 8 18 18 18s18-8 18-18c0-5-2-8-6-8z"/>'));

  return { ICO:ICO };
})();
