/* ============================================================
   js/utils.js
   纯工具函数
   ============================================================ */
window.EX = window.EX || {};

EX.utils = (function(){
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));

  function pad2(n){ return String(n).padStart(2, '0'); }

  function isoOf(d){
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function parseISO(s){
    const [y, m, d] = String(s).split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  function daysBetween(a, b){
    return Math.round((parseISO(b) - parseISO(a)) / 86400000);
  }
  function prettyDate(s){
    const d = parseISO(s);
    return d.toLocaleDateString('zh-CN', { month:'short', day:'numeric' });
  }
  function prettyFull(s){
    const d = parseISO(s);
    const wd = ['周日','周一','周二','周三','周四','周五','周六'][d.getDay()];
    return `${d.getFullYear()} 年 ${d.getMonth()+1} 月 ${d.getDate()} 日 · ${wd}`;
  }

  let _uid = 0;
  function uid(prefix){
    _uid += 1;
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + _uid.toString(36);
  }

  function debounce(fn, ms){
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  }

  function deepClone(o){
    try { return JSON.parse(JSON.stringify(o)); }
    catch(e){ return o; }
  }

  function downloadJSON(filename, data){
    const blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return {
    $, $$, esc, clamp, pad2, isoOf, parseISO, daysBetween,
    prettyDate, prettyFull, uid, debounce, deepClone, downloadJSON
  };
})();