/* ============================================================
   js/pages/calendar.js
   ============================================================ */
window.EX = window.EX || {};
EX.pages = EX.pages || {};

EX.pages.calendar = function(){
  const S = EX.store.get();
  const U = EX.utils;
  const today = U.isoOf(new Date());

  const { y, m } = S.calView;
  const first = new Date(y, m, 1);
  const startDow = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push('<div class="cal-cell empty"></div>');
  for (let d = 1; d <= daysInMonth; d++){
    const dateStr = `${y}-${U.pad2(m + 1)}-${U.pad2(d)}`;
    const plan = EX.PLAN[dateStr];
    const cp = S.customPlan[dateStr];
    const hasAnything = !!(plan || cp);
    const isToday = dateStr === today;
    const isActive = dateStr === S.activeDay;
    const cls = ['cal-cell', hasAnything ? 'has-plan' : '', isToday ? 'today' : '', isActive ? 'active' : ''].filter(Boolean).join(' ');
    /* 主题优先显示 plan 的；只有 custom 时显示 cp.theme */
    const themeText = (plan && plan.theme) || (cp && cp.theme) || '';
    cells.push(`<div class="${cls}" ${hasAnything ? `data-action="open-day" data-date="${dateStr}"` : ''} ${hasAnything ? 'role="button" tabindex="0"' : ''}>
      ${isToday ? '<span class="cal-today-flag">TODAY</span>' : ''}
      <span class="cal-date">${d}</span>
      ${plan ? `<button class="cal-pill" data-action="open-day-plan" data-date="${dateStr}" title="${U.esc(plan.theme || '')} · 默认计划"><span class="pd" style="background:${EX.dirColor(plan.dir)}"></span>${U.esc(plan.label)}</button>` : ''}
      ${cp ? `<button class="cal-pill is-custom" data-action="open-day-custom" data-date="${dateStr}" title="${U.esc(cp.theme || '')} · 自定义日程"><span class="pd" style="background:${cp.dir ? EX.dirColor(cp.dir) : '#3fc7bd'}"></span>${U.esc(cp.label || '自定义')}</button>` : ''}
      ${themeText ? `<span class="cal-theme">${U.esc(themeText)}</span>` : ''}
    </div>`);
  }

  const monthName = first.toLocaleDateString('zh-CN', { year:'numeric', month:'long' });

  /* 自定义日程按日期排序 */
  const customPlans = Object.entries(S.customPlan || {})
    .map(([d, p]) => ({ date: d, ...p }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return `
  <div class="spread" style="margin-bottom:16px">
    <div>
      <div class="label">MONTHLY CALENDAR</div>
      <h2 style="margin:6px 0 0;font-size:20px;font-weight:600;letter-spacing:-.025em">${monthName}</h2>
    </div>
    <div class="row" style="gap:6px">
      <button class="btn ghost sm" data-action="cal-prev">←</button>
      <button class="btn ghost sm" data-action="cal-now">本月</button>
      <button class="btn ghost sm" data-action="cal-next">→</button>
    </div>
  </div>

  <div class="card" style="padding:14px">
    <div class="cal-head">
      ${['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d => `<div class="cal-dow">${d}</div>`).join('')}
    </div>
    <div class="cal-grid">${cells.join('')}</div>
  </div>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">4 周结构</div>
        <div class="section-sub">每周有一个明确的目的，不是一个待办清单</div>
      </div>
    </div>
    <div class="grid g2">
      ${EX.WEEKS.map(w => {
        const days = Object.keys(EX.PLAN).filter(d => d >= w.from && d <= w.to).sort();
        return `<div class="card">
          <div class="row" style="gap:9px;margin-bottom:9px">
            <span class="tag accent">WEEK ${w.n}</span>
            <span class="sm" style="font-weight:500">${U.esc(w.name)}</span>
          </div>
          <div class="stack" style="gap:5px">
            ${days.map(d => {
              const p = EX.PLAN[d];
              return `<button class="row" style="gap:8px;width:100%;text-align:left;padding:3px 0" data-action="open-day" data-date="${d}">
                <span class="tiny mono dim" style="flex:0 0 44px">${d.slice(5)}</span>
                <span style="width:5px;height:5px;border-radius:99px;background:${EX.dirColor(p.dir)};flex:0 0 5px"></span>
                <span class="tiny muted" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${U.esc(p.theme)}</span>
              </button>`;
            }).join('')}
          </div>
        </div>`;
      }).join('')}
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">自定义日程</div>
        <div class="section-sub">在 4 周计划之外自己加的，可任意日期</div>
      </div>
      <button class="btn primary sm" data-action="new-plan">+ 添加日程</button>
    </div>
    ${customPlans.length ? `
    <div class="card">
      ${customPlans.map(p => {
        const dirName = p.dir ? (S.directions.find(d => d.id === p.dir) || {}).name : '';
        const taskCount = (p.tasks || []).length;
        return `<div class="row" style="gap:10px;padding:11px 0;border-bottom:1px solid var(--border);align-items:flex-start">
          <span class="tiny mono dim" style="flex:0 0 56px;margin-top:2px">${p.date.slice(5)}</span>
          <span style="width:6px;height:6px;border-radius:99px;background:${p.dir ? EX.dirColor(p.dir) : 'var(--text-3)'};flex:0 0 6px;margin-top:7px"></span>
          <div style="flex:1;min-width:0">
            <div class="row" style="gap:8px">
              <span class="sm" style="font-weight:500">${U.esc(p.theme || '（无主题）')}</span>
              <span class="tiny dim">${U.esc(p.label || '自定义')}</span>
            </div>
            <div class="tiny dim" style="margin-top:3px">
              ${dirName ? '方向：' + U.esc(dirName) + ' · ' : ''}任务 ${taskCount}
            </div>
          </div>
          <span class="row" style="gap:6px;flex:0 0 auto">
            <button class="btn ghost sm" data-action="open-day" data-date="${p.date}">查看</button>
            <button class="btn ghost sm" data-action="edit-plan" data-date="${p.date}">编辑</button>
            <button class="btn ghost sm" data-action="del-plan" data-date="${p.date}" style="color:var(--danger)">删除</button>
          </span>
        </div>`;
      }).join('')}
    </div>` : '<div class="empty">还没有自定义日程。点右上角添加一个，或在「今日探索」里直接添加今日任务。</div>'}
  </section>
  `;
};