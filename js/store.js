/* ============================================================
   js/store.js
   状态管理 + localStorage 持久化 + 导出/导入
   ============================================================ */
window.EX = window.EX || {};

EX.store = (function(){
  const KEY = 'obsidian-explorer-v2';
  const U = EX.utils;

  let state = null;
  let available = true;
  const listeners = [];

  /* ---- 持久化可用性 ---- */
  function testStorage(){
    try {
      localStorage.setItem('__ex_test__', '1');
      localStorage.removeItem('__ex_test__');
      return true;
    } catch(e){ return false; }
  }

  /* ---- 加载 ---- */
  function load(){
    available = testStorage();
    if (!available){
      state = U.deepClone(EX.DEFAULT);
      return state;
    }
    let raw = null;
    try { raw = localStorage.getItem(KEY); } catch(e){ raw = null; }
    if (!raw){
      state = U.deepClone(EX.DEFAULT);
      save();
      return state;
    }
    try {
      const parsed = JSON.parse(raw);
      state = mergeWithDefaults(parsed);
    } catch(e){
      console.warn('[Explorer] 数据损坏，已重置', e);
      state = U.deepClone(EX.DEFAULT);
      save();
    }
    return state;
  }

  function mergeWithDefaults(parsed){
    const base = U.deepClone(EX.DEFAULT);
    const out = Object.assign(base, parsed);
    out.meta = Object.assign(base.meta, parsed.meta || {});
    out.calView = Object.assign(base.calView, parsed.calView || {});
    out.decision = Object.assign(base.decision, parsed.decision || {});
    out.daily = parsed.daily || {};
    out.directions = (parsed.directions || base.directions).map(d => ({
      id: d.id || U.uid('d'),
      name: d.name || '未命名方向',
      emoji: d.emoji || '◇',
      tags: Array.isArray(d.tags) ? d.tags : [],
      blurb: d.blurb || '',
      scores: Object.assign(
        { interest:3, curiosity:3, continue:3, build:3, math:3, research:3, product:3, career:3 },
        d.scores || {}
      ),
      log: Array.isArray(d.log) ? d.log.map(l => ({
        id: l.id || U.uid('l'),
        d: l.d || U.isoOf(new Date()),
        t: l.t || ''
      })) : []
    }));
    out.experiments = (parsed.experiments || base.experiments).map(x => ({
      id: x.id || U.uid('x'),
      title: x.title || '未命名实验',
      dir: x.dir || (out.directions[0] && out.directions[0].id) || '',
      status: ['planned','doing','done'].includes(x.status) ? x.status : 'planned',
      date: x.date || '',
      hyp: x.hyp || '',
      problem: x.problem || '',
      result: x.result || '',
      reflect: x.reflect || '',
      score: Number(x.score) || 0
    }));
    out.career = (parsed.career || base.career).map(c => ({
      id: c.id || U.uid('c'),
      name: c.name || '未命名职业',
      dir: c.dir || '',
      fit: Number(c.fit) || 3,
      real: c.real || '',
      tryIt: c.tryIt || ''
    }));
    out.research = (parsed.research || base.research).map(q => ({
      id: q.id || U.uid('q'),
      q: q.q || q.text || '',
      dir: q.dir || '',
      status: ['curious','doing','done'].includes(q.status) ? q.status : 'curious'
    })).filter(q => q.q);
    return out;
  }

  /* ---- 保存 ---- */
  function save(){
    if (!available) return false;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch(e){
      console.warn('[Explorer] 保存失败', e);
      return false;
    }
  }

  /* ---- 读取 ---- */
  function get(){ return state; }

  /* ---- 静默修改（不触发重渲染，用于输入框自动保存）---- */
  function patch(fn){
    fn(state);
    save();
  }

  /* ---- 提交修改（触发重渲染）---- */
  function commit(fn){
    fn(state);
    save();
    notify();
  }

  /* ---- 订阅 ---- */
  function subscribe(fn){ listeners.push(fn); }
  function notify(){ listeners.forEach(fn => { try { fn(state); } catch(e){ console.error(e); } }); }

  /* ---- 导出 / 导入 / 重置 ---- */
  function exportJSON(){
    const payload = {
      app: 'obsidian-explorer',
      version: 2,
      exportedAt: new Date().toISOString(),
      data: state
    };
    U.downloadJSON('explorer-backup-' + U.isoOf(new Date()) + '.json', payload);
  }

  function importJSON(text){
    const parsed = JSON.parse(text);
    const data = parsed && parsed.data ? parsed.data : parsed;
    if (!data || typeof data !== 'object') throw new Error('文件格式不正确');
    state = mergeWithDefaults(data);
    save();
    notify();
  }

  function reset(){
    state = U.deepClone(EX.DEFAULT);
    save();
    notify();
  }

  function isAvailable(){ return available; }
  function storageKey(){ return KEY; }

  return {
    load, save, get, patch, commit, subscribe,
    exportJSON, importJSON, reset, isAvailable, storageKey
  };
})();