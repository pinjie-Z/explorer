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
    const isToday = dateStr === today;
    const isActive = dateStr === S.activeDay;
    const cls = ['cal-cell', plan ? 'has-plan' : '', isToday ? 'today' : '', isActive ? 'active' : ''].filter(Boolean).join(' ');
    cells.push(`<div class="${cls}" ${plan ? `data-action="open-day" data-date="${dateStr}"` : ''} ${plan ? 'role="button" tabindex="0"' : ''}>
      ${isToday ? '<span class="cal-today-flag">TODAY</span>' : ''}
      <span class="cal-date">${d}</span>
      ${plan ? `<span class="cal-pill"><span class="pd" style="background:${EX.dirColor(plan.dir)}"></span>${U.esc(plan.label)}</span>
      <span class="cal-theme">${U.esc(plan.theme)}</span>` : ''}
    </div>`);
  }

  const monthName = first.toLocaleDateString('zh-CN', { year:'numeric', month:'long' });

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
  `;
};