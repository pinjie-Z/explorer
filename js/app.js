/* ============================================================
   js/app.js
   路由 / 事件委托 / 命令面板 / 启动
   ============================================================ */
window.EX = window.EX || {};

(function(){
  const U = EX.utils;
  const UI = EX.ui;
  const S = EX.store;

  const $ = U.$;
  const $$ = U.$$;

  /* ---------- ROUTER ---------- */
  function parseHash(){
    const h = location.hash.replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    return { name: parts[0] || 'dashboard', param: parts.slice(1).join('/') };
  }
  function go(hash){ location.hash = hash; }

  /* ---------- RENDER ---------- */
  function render(){
    const state = S.get();
    const { name, param } = parseHash();
    const view = $('#view');
    if (!view) return;

    let html = '';
    const pages = EX.pages || {};
    switch(name){
      case 'today':       html = pages.today ? pages.today() : ''; break;
      case 'calendar':    html = pages.calendar ? pages.calendar() : ''; break;
      case 'experiments': html = pages.experiments ? pages.experiments() : ''; break;
      case 'directions':  html = pages.directions ? pages.directions() : ''; break;
      case 'direction':   html = pages.direction ? pages.direction(param) : ''; break;
      case 'career':      html = pages.career ? pages.career() : ''; break;
      case 'research':    html = pages.research ? pages.research() : ''; break;
      case 'decision':    html = pages.decision ? pages.decision() : ''; break;
      default:            html = pages.dashboard ? pages.dashboard() : '';
    }
    view.innerHTML = html;

    /* 面包屑 */
    const t = EX.TITLES[name] || EX.TITLES.dashboard;
    let title = t[0], sub = t[1];
    if (name === 'direction'){
      const d = state.directions.find(v => v.id === param);
      title = d ? d.name : '方向详情';
      sub = d ? (d.tags || []).join(' · ') : '';
    }
    $('#crumbTitle').textContent = title;
    $('#crumbSub').textContent = sub;

    /* 导航高亮 */
    $$('#nav .nav-item').forEach(b => {
      const r = b.dataset.route;
      const on = (r === name) || (name === 'direction' && r === 'directions');
      if (on) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    /* 计数 */
    $('#navExpCount').textContent = state.experiments.length;
    $('#navDirCount').textContent = state.directions.length;
    $('#navQCount').textContent = state.research.length;

    /* 移动端关闭侧边栏 */
    $('#app').classList.remove('nav-open');

    /* 顶部滚动 */
    window.scrollTo({ top: 0, behavior: 'auto' });

    /* 更新 4 周进度 */
    renderJourney(state);
  }

  /* ---------- JOURNEY ---------- */
  function renderJourney(state){
    const today = U.isoOf(new Date());
    const elapsed = U.daysBetween(state.startDate, today);
    const pct = Math.round(U.clamp(elapsed / 28, 0, 1) * 100);
    const pctEl = $('#journeyPct');
    if (pctEl) pctEl.textContent = pct + '%';

    const list = $('#journeyList');
    if (!list) return;
    list.innerHTML = EX.WEEKS.map(w => {
      const done = today > w.to;
      const active = today >= w.from && today <= w.to;
      const cls = done ? 'is-done' : (active ? 'is-active' : '');
      return `<div class="week-row ${cls}">
        <span class="week-dot"></span>
        <span class="week-name">WEEK ${w.n}</span>
        <span style="margin-left:auto;font-size:11px;opacity:.8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${U.esc(w.name)}</span>
      </div>`;
    }).join('');
  }

  /* ---------- THEME ---------- */
  function applyTheme(){
    const t = S.get().theme || 'dark';
    document.documentElement.dataset.theme = t;
  }

  /* ============================================================
     ACTIONS
     ============================================================ */
  const actions = {

    /* --- 导航 --- */
    'toggle-nav': () => $('#app').classList.toggle('nav-open'),
    'close-nav': () => $('#app').classList.remove('nav-open'),

    /* --- 主题 --- */
    'toggle-theme': () => {
      S.commit(s => { s.theme = s.theme === 'dark' ? 'light' : 'dark'; });
      applyTheme();
      render();
    },

    /* --- 命令面板 --- */
    'palette': openPalette,
    'palette-close': closePalette,

    /* --- 页面跳转 --- */
    'open-dir': el => go('#/direction/' + el.dataset.id),
    'open-day': el => {
      S.commit(s => { s.activeDay = el.dataset.date; });
      go('#/today');
    },
    'jump-today': () => {
      const today = U.isoOf(new Date());
      const target = EX.PLAN[today] ? today : '2026-09-11';
      S.commit(s => { s.activeDay = target; });
      render();
    },
    'prev-day': () => shiftDay(-1),
    'next-day': () => shiftDay(1),

    /* --- 日历 --- */
    'cal-prev': () => {
      S.commit(s => {
        let { y, m } = s.calView;
        m--; if (m < 0){ m = 11; y--; }
        s.calView = { y, m };
      });
      render();
    },
    'cal-next': () => {
      S.commit(s => {
        let { y, m } = s.calView;
        m++; if (m > 11){ m = 0; y++; }
        s.calView = { y, m };
      });
      render();
    },
    'cal-now': () => {
      S.commit(s => { s.calView = { y: 2026, m: 8 }; });
      render();
    },

    /* --- 今日任务 --- */
    'toggle-task': el => {
      const date = el.dataset.date;
      const idx = el.dataset.idx;
      S.commit(s => {
        if (!s.daily[date]) s.daily[date] = { done:{}, discover:'', best:'', worst:'', keep:0, conclusion:'' };
        s.daily[date].done[idx] = !s.daily[date].done[idx];
      });
      render();
    },
    'set-keep': el => {
      const date = el.dataset.date;
      const v = Number(el.dataset.value);
      S.commit(s => {
        if (!s.daily[date]) s.daily[date] = { done:{}, discover:'', best:'', worst:'', keep:0, conclusion:'' };
        s.daily[date].keep = v;
      });
      render();
    },
    'save-day': () => {
      S.save();
      UI.toast('已保存到本地', 'ok');
    },
    'add-log': el => {
      const date = el.dataset.date;
      const state = S.get();
      const plan = EX.PLAN[date];
      const day = state.daily[date] || {};
      const dir = plan ? state.directions.find(d => d.id === plan.dir) : state.directions[0];
      if (!dir){ UI.toast('没有可记录的方向', 'warn'); return; }
      const text = day.discover || (plan ? plan.theme : '一次探索');
      S.commit(s => {
        const target = s.directions.find(d => d.id === dir.id);
        target.log = target.log || [];
        target.log.unshift({ id: U.uid('l'), d: date, t: text });
      });
      UI.toast('已记入「' + dir.name + '」', 'ok');
      render();
    },

    /* --- 方向 --- */
    'bump-score': el => {
      const id = el.dataset.id, key = el.dataset.key;
      S.commit(s => {
        const d = s.directions.find(v => v.id === id);
        if (!d) return;
        const cur = d.scores[key] || 0;
        d.scores[key] = cur >= 5 ? 1 : cur + 1;
      });
      render();
    },
    'set-score': el => {
      const id = el.dataset.id, key = el.dataset.key;
      const v = Number(el.dataset.value);
      if (!v) return;
      S.commit(s => {
        const d = s.directions.find(v2 => v2.id === id);
        if (d) d.scores[key] = v;
      });
      render();
    },
    'new-dir': () => {
      UI.modal({
        title: '新建方向',
        submitText: '创建',
        fields: [
          { key:'name', label:'名称', type:'text', required:true, placeholder:'例如：Computational Display' },
          { key:'emoji', label:'图标', type:'text', placeholder:'一个 emoji', default:'◇' },
          { key:'tags', label:'标签', type:'text', placeholder:'用逗号分隔', hint:'例如：Light Field, Holographic' },
          { key:'blurb', label:'一句话描述', type:'textarea', placeholder:'这个方向在解决什么问题？' }
        ],
        onSubmit: data => {
          S.commit(s => {
            s.directions.push({
              id: U.uid('d'),
              name: data.name.trim(),
              emoji: data.emoji || '◇',
              tags: data.tags.split(',').map(x => x.trim()).filter(Boolean),
              blurb: data.blurb || '',
              scores: { interest:3, curiosity:3, continue:3, build:3, math:3, research:3, product:3, career:3 },
              log: []
            });
          });
          UI.toast('已创建方向', 'ok');
          render();
        }
      });
    },
    'edit-dir': el => {
      const id = el.dataset.id;
      const d = S.get().directions.find(v => v.id === id);
      if (!d) return;
      UI.modal({
        title: '编辑方向',
        values: {
          name: d.name, emoji: d.emoji || '◇',
          tags: (d.tags || []).join(', '), blurb: d.blurb || ''
        },
        fields: [
          { key:'name', label:'名称', type:'text', required:true },
          { key:'emoji', label:'图标', type:'text' },
          { key:'tags', label:'标签', type:'text', hint:'用逗号分隔' },
          { key:'blurb', label:'一句话描述', type:'textarea' }
        ],
        onSubmit: data => {
          S.commit(s => {
            const t = s.directions.find(v => v.id === id);
            if (!t) return;
            t.name = data.name.trim();
            t.emoji = data.emoji || '◇';
            t.tags = data.tags.split(',').map(x => x.trim()).filter(Boolean);
            t.blurb = data.blurb || '';
          });
          UI.toast('已更新', 'ok');
          render();
        }
      });
    },
    'del-dir': el => {
      const id = el.dataset.id;
      const d = S.get().directions.find(v => v.id === id);
      if (!d) return;
      UI.confirm({
        title: '删除方向',
        message: `确定要删除「${d.name}」吗？它的探索记录也会一起删除，但相关实验会保留。`,
        submitText: '删除',
        onConfirm: () => {
          S.commit(s => { s.directions = s.directions.filter(v => v.id !== id); });
          UI.toast('已删除', 'ok');
          render();
        }
      });
    },
    'new-log': el => {
      const id = el.dataset.id;
      UI.modal({
        title: '添加探索记录',
        submitText: '添加',
        fields: [
          { key:'date', label:'日期', type:'date', default: U.isoOf(new Date()) },
          { key:'text', label:'发生了什么', type:'textarea', required:true, placeholder:'例如：第一次成功跑通 3DGS' }
        ],
        onSubmit: data => {
          S.commit(s => {
            const d = s.directions.find(v => v.id === id);
            if (!d) return;
            d.log = d.log || [];
            d.log.unshift({ id: U.uid('l'), d: data.date, t: data.text.trim() });
          });
          UI.toast('已添加', 'ok');
          render();
        }
      });
    },
    'del-log': el => {
      const id = el.dataset.id, logId = el.dataset.log;
      S.commit(s => {
        const d = s.directions.find(v => v.id === id);
        if (!d) return;
        d.log = (d.log || []).filter(l => l.id !== logId);
      });
      render();
    },

    /* --- 实验 --- */
    'new-exp': () => openExpModal(null),
    'edit-exp': el => openExpModal(el.dataset.id),
    'cycle-exp': el => {
      const id = el.dataset.id;
      S.commit(s => {
        const x = s.experiments.find(v => v.id === id);
        if (!x) return;
        const order = ['planned', 'doing', 'done'];
        x.status = order[(order.indexOf(x.status) + 1) % 3];
      });
      render();
    },
    'del-exp': el => {
      const id = el.dataset.id;
      const x = S.get().experiments.find(v => v.id === id);
      if (!x) return;
      UI.confirm({
        title: '删除实验',
        message: `确定要删除「${x.title}」吗？`,
        submitText: '删除',
        onConfirm: () => {
          S.commit(s => { s.experiments = s.experiments.filter(v => v.id !== id); });
          UI.toast('已删除', 'ok');
          render();
        }
      });
    },

    /* --- 职业 --- */
    'new-career': () => openCareerModal(null),
    'edit-career': el => openCareerModal(el.dataset.id),
    'del-career': el => {
      const id = el.dataset.id;
      UI.confirm({
        title: '删除职业',
        message: '确定要删除这张职业卡片吗？',
        submitText: '删除',
        onConfirm: () => {
          S.commit(s => { s.career = s.career.filter(v => v.id !== id); });
          UI.toast('已删除', 'ok');
          render();
        }
      });
    },

    /* --- 研究问题 --- */
    'new-q': () => openQModal(null),
    'edit-q': el => openQModal(el.dataset.id),
    'cycle-q': el => {
      const id = el.dataset.id;
      S.commit(s => {
        const q = s.research.find(v => v.id === id);
        if (!q) return;
        const order = ['curious', 'doing', 'done'];
        q.status = order[(order.indexOf(q.status) + 1) % 3];
      });
      render();
    },
    'del-q': el => {
      const id = el.dataset.id;
      UI.confirm({
        title: '删除问题',
        message: '确定要删除这个问题吗？',
        submitText: '删除',
        onConfirm: () => {
          S.commit(s => { s.research = s.research.filter(v => v.id !== id); });
          UI.toast('已删除', 'ok');
          render();
        }
      });
    },

    /* --- 决策 --- */
    'save-decision': () => {
      S.save();
      const h = $('#decHint');
      if (h){ h.textContent = '已保存 ✓'; setTimeout(() => { h.textContent = ''; }, 1800); }
      UI.toast('决策已保存', 'ok');
    },

    /* --- 数据管理 --- */
    'export-data': () => {
      S.exportJSON();
      UI.toast('已导出备份', 'ok');
    },
    'import-data': () => {
      $('#importFile').click();
    },
    'reset-data': () => {
      UI.confirm({
        title: '重置所有数据',
        message: '这会清空你所有的实验、方向、记录，恢复到初始示例数据。此操作不可撤销。',
        submitText: '确认重置',
        onConfirm: () => {
          S.reset();
          applyTheme();
          render();
          UI.toast('已重置', 'warn');
        }
      });
    },

    /* --- 模态框 --- */
    'modal-close': () => UI.closeModal(),
    'modal-submit': () => {} // 由 ui.modal 内部接管
  };

  /* ---------- 日期前后切换 ---------- */
  function shiftDay(delta){
    const dates = Object.keys(EX.PLAN).sort();
    const cur = S.get().activeDay;
    const i = dates.indexOf(cur);
    const next = dates[U.clamp(i + delta, 0, dates.length - 1)];
    if (!next) return;
    S.commit(s => { s.activeDay = next; });
    render();
  }

  /* ---------- 实验模态框 ---------- */
  function openExpModal(id){
    const state = S.get();
    const existing = id ? state.experiments.find(x => x.id === id) : null;
    const dirOptions = state.directions.map(d => ({ value: d.id, label: d.name }));

    UI.modal({
      title: existing ? '编辑实验' : '新建实验',
      submitText: existing ? '保存' : '创建',
      values: existing ? {
        title: existing.title, dir: existing.dir, status: existing.status,
        date: existing.date, hyp: existing.hyp, problem: existing.problem,
        result: existing.result, reflect: existing.reflect, score: existing.score || 3
      } : {
        status: 'planned',
        date: U.isoOf(new Date()),
        dir: state.directions[0] ? state.directions[0].id : '',
        score: 3
      },
      fields: [
        { key:'title', label:'标题', type:'text', required:true, placeholder:'例如：用手机照片做一次 3D 重建' },
        { key:'dir', label:'方向', type:'select', options: dirOptions },
        { key:'status', label:'状态', type:'select', options: [
          { value:'planned', label:'计划中' },
          { value:'doing',   label:'进行中' },
          { value:'done',    label:'已完成' }
        ] },
        { key:'date', label:'日期', type:'date' },
        { key:'hyp', label:'假设 Hypothesis', type:'textarea', placeholder:'我想验证什么？', hint:'一句话说清楚，别写成一篇文章。' },
        { key:'problem', label:'问题 Problem', type:'textarea', placeholder:'卡在哪里了？' },
        { key:'result', label:'结果 Result', type:'textarea', placeholder:'实际发生了什么？' },
        { key:'reflect', label:'反思 Reflection', type:'textarea', placeholder:'我到底喜不喜欢这件事？' },
        { key:'score', label:'我会再做一次吗', type:'rating', hint:'1 到 5' }
      ],
      onSubmit: data => {
        S.commit(s => {
          if (existing){
            const x = s.experiments.find(v => v.id === id);
            Object.assign(x, {
              title: data.title.trim(), dir: data.dir, status: data.status,
              date: data.date, hyp: data.hyp, problem: data.problem,
              result: data.result, reflect: data.reflect, score: data.score
            });
          } else {
            s.experiments.unshift({
              id: U.uid('x'),
              title: data.title.trim(), dir: data.dir, status: data.status,
              date: data.date, hyp: data.hyp, problem: data.problem,
              result: data.result, reflect: data.reflect, score: data.score
            });
          }
        });
        UI.toast(existing ? '已保存' : '已创建实验', 'ok');
        render();
      }
    });
  }

  /* ---------- 职业模态框 ---------- */
  function openCareerModal(id){
    const state = S.get();
    const existing = id ? state.career.find(c => c.id === id) : null;
    const dirOptions = state.directions.map(d => ({ value: d.id, label: d.name }));

    UI.modal({
      title: existing ? '编辑职业' : '新建职业',
      submitText: existing ? '保存' : '创建',
      values: existing ? {
        name: existing.name, dir: existing.dir, fit: existing.fit || 3,
        real: existing.real, tryIt: existing.tryIt
      } : { fit: 3, dir: state.directions[0] ? state.directions[0].id : '' },
      fields: [
        { key:'name', label:'职业名称', type:'text', required:true, placeholder:'例如：3D Vision Engineer' },
        { key:'dir', label:'相关方向', type:'select', options: dirOptions },
        { key:'real', label:'真实工作', type:'textarea', placeholder:'这个职业的人每天实际在做什么？' },
        { key:'tryIt', label:'2 小时试一下', type:'textarea', placeholder:'用 2 小时能模拟的任务' },
        { key:'fit', label:'匹配度', type:'rating' }
      ],
      onSubmit: data => {
        S.commit(s => {
          if (existing){
            const c = s.career.find(v => v.id === id);
            Object.assign(c, {
              name: data.name.trim(), dir: data.dir, fit: data.fit,
              real: data.real, tryIt: data.tryIt
            });
          } else {
            s.career.unshift({
              id: U.uid('c'),
              name: data.name.trim(), dir: data.dir, fit: data.fit,
              real: data.real, tryIt: data.tryIt
            });
          }
        });
        UI.toast(existing ? '已保存' : '已创建职业', 'ok');
        render();
      }
    });
  }

  /* ---------- 问题模态框 ---------- */
  function openQModal(id){
    const state = S.get();
    const existing = id ? state.research.find(q => q.id === id) : null;
    const dirOptions = state.directions.map(d => ({ value: d.id, label: d.name }));

    UI.modal({
      title: existing ? '编辑问题' : '新建问题',
      submitText: existing ? '保存' : '添加',
      values: existing ? { q: existing.q, dir: existing.dir, status: existing.status }
        : { status:'curious', dir: state.directions[0] ? state.directions[0].id : '' },
      fields: [
        { key:'q', label:'问题', type:'textarea', required:true, placeholder:'例如：3D Gaussian Splatting 为什么有效？', hint:'用一句话问出来，就已经比「我想学 AI」精确得多。' },
        { key:'dir', label:'方向', type:'select', options: dirOptions },
        { key:'status', label:'状态', type:'select', options: [
          { value:'curious', label:'好奇' },
          { value:'doing',   label:'在查' },
          { value:'done',    label:'已理解' }
        ] }
      ],
      onSubmit: data => {
        S.commit(s => {
          if (existing){
            const q = s.research.find(v => v.id === id);
            Object.assign(q, { q: data.q.trim(), dir: data.dir, status: data.status });
          } else {
            s.research.unshift({
              id: U.uid('q'),
              q: data.q.trim(), dir: data.dir, status: data.status
            });
          }
        });
        UI.toast(existing ? '已保存' : '已添加', 'ok');
        render();
      }
    });
  }

  /* ============================================================
     命令面板
     ============================================================ */
  let paletteItems = [];
  let paletteSel = 0;

  function openPalette(){
    const state = S.get();
    const items = [];
    Object.keys(EX.TITLES).filter(k => k !== 'direction').forEach(k => {
      items.push({ label: EX.TITLES[k][0], hint: '页面', ico: '▸', route: k });
    });
    state.directions.forEach(d => {
      items.push({ label: d.name, hint: '方向', ico: d.emoji || '◇', route: 'direction/' + d.id });
    });
    items.push({
      label: state.theme === 'dark' ? '切换到浅色模式' : '切换到深色模式',
      hint: '外观', ico: '◐', action: 'theme'
    });
    items.push({ label: '导出数据备份', hint: '数据', ico: '↓', action: 'export' });
    items.push({ label: '导入数据', hint: '数据', ico: '↑', action: 'import' });

    paletteItems = items;
    paletteSel = 0;
    $('#cmdk').classList.add('open');
    $('#cmdkInput').value = '';
    renderPaletteList('');
    setTimeout(() => $('#cmdkInput').focus(), 20);
  }
  function closePalette(){
    $('#cmdk').classList.remove('open');
  }
  function renderPaletteList(q){
    const filtered = paletteItems.filter(i =>
      i.label.toLowerCase().includes(q.toLowerCase()));
    const html = filtered.length
      ? filtered.map(i => {
          const idx = paletteItems.indexOf(i);
          return `<button class="cmdk-item ${idx === paletteSel ? 'sel' : ''}" data-pi="${idx}">
            <span class="ci-ico">${i.ico}</span>
            <span>${U.esc(i.label)}</span>
            <span class="ci-hint">${i.hint}</span>
          </button>`;
        }).join('')
      : '<div class="empty" style="margin:8px">没有匹配项</div>';
    $('#cmdkList').innerHTML = html;
  }
  function runPalette(idx){
    const item = paletteItems[idx];
    if (!item) return;
    closePalette();
    if (item.action === 'theme'){
      actions['toggle-theme']();
      return;
    }
    if (item.action === 'export'){
      actions['export-data']();
      return;
    }
    if (item.action === 'import'){
      actions['import-data']();
      return;
    }
    go('#/' + item.route);
  }

  /* ============================================================
     全局事件
     ============================================================ */
  document.addEventListener('click', e => {
    /* 阻止在 data-stop 内部的动作冒泡 */
    if (e.target.closest('[data-stop]') && !e.target.closest('[data-action]')){
      return;
    }

    /* 路由 */
    const routeEl = e.target.closest('[data-route]');
    if (routeEl){
      e.preventDefault();
      go('#/' + routeEl.dataset.route);
      return;
    }

    /* 动作 */
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const a = el.dataset.action;
    const fn = actions[a];
    if (fn){
      e.preventDefault();
      fn(el, e);
    }
  });

  /* 键盘 */
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' '){
      const t = e.target.closest('[data-action="toggle-task"]');
      if (t){ e.preventDefault(); t.click(); }
      const c = e.target.closest('.cal-cell.has-plan');
      if (c){ e.preventDefault(); c.click(); }
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'){
      e.preventDefault();
      const box = $('#cmdk');
      if (box.classList.contains('open')) closePalette(); else openPalette();
    }
    if (e.key === 'Escape'){
      closePalette();
      UI.closeModal();
    }
  });

  /* 输入（自动保存） */
  document.addEventListener('input', U.debounce(e => {
    /* 今日表单 */
    const f = e.target.closest('[data-field]');
    if (f){
      const date = f.dataset.date;
      const key = f.dataset.field;
      S.patch(s => {
        if (!s.daily[date]) s.daily[date] = { done:{}, discover:'', best:'', worst:'', keep:0, conclusion:'' };
        s.daily[date][key] = f.value;
      });
      return;
    }
    /* 决策表单 */
    const dd = e.target.closest('[data-decision]');
    if (dd){
      S.patch(s => { s.decision[dd.dataset.decision] = dd.value; });
    }
  }, 250));

  /* 命令面板输入 */
  document.addEventListener('input', e => {
    if (e.target.id === 'cmdkInput'){
      paletteSel = 0;
      renderPaletteList(e.target.value);
    }
  });

  /* 命令面板点击 */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pi]');
    if (b){
      e.stopPropagation();
      runPalette(Number(b.dataset.pi));
    }
  });

  /* 命令面板键盘 */
  document.addEventListener('keydown', e => {
    if (!$('#cmdk').classList.contains('open')) return;
    const q = $('#cmdkInput').value;
    const filtered = paletteItems.filter(i =>
      i.label.toLowerCase().includes(q.toLowerCase()));
    if (e.key === 'ArrowDown'){
      e.preventDefault();
      paletteSel = Math.min(filtered.length - 1, paletteSel + 1);
      renderPaletteList(q);
    }
    if (e.key === 'ArrowUp'){
      e.preventDefault();
      paletteSel = Math.max(0, paletteSel - 1);
      renderPaletteList(q);
    }
    if (e.key === 'Enter' && filtered[paletteSel]){
      e.preventDefault();
      runPalette(paletteItems.indexOf(filtered[paletteSel]));
    }
  });

  /* 导入文件 */
  document.addEventListener('change', e => {
    if (e.target.id !== 'importFile') return;
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        S.importJSON(String(reader.result));
        applyTheme();
        render();
        UI.toast('数据已导入', 'ok');
      } catch(err){
        console.error(err);
        UI.toast('导入失败：' + err.message, 'err');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  });

  /* 窗口尺寸 */
  window.addEventListener('resize', () => {
    const btn = $('#menuBtn');
    if (!btn) return;
    btn.style.display = window.innerWidth <= 900 ? 'grid' : 'none';
  });

  /* ============================================================
     启动
     ============================================================ */
  function boot(){
    S.load();
    applyTheme();

    /* 订阅：数据变化时重渲染（由 commit 触发） */
    S.subscribe(() => { render(); });

    window.addEventListener('hashchange', render);
    renderJourney(S.get());
    render();

    if (!S.isAvailable()){
      setTimeout(() => {
        UI.toast('localStorage 不可用，数据不会持久化', 'warn');
      }, 800);
    }
  }

  /* 暴露给页面按钮使用 */
  EX.actions = actions;
  EX.go = go;
  EX.render = render;

  boot();
})();