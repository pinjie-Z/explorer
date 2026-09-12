/* ============================================================
   js/pages/today.js
   ============================================================ */
window.EX = window.EX || {};
EX.pages = EX.pages || {};

EX.pages.today = function(){
  const S = EX.store.get();
  const U = EX.utils;
  const UI = EX.ui;

  const date = S.activeDay;
  const plan = EX.PLAN[date];
  const day = getDay(S, date);
  const dir = plan ? S.directions.find(d => d.id === plan.dir) : null;

  const tasksHTML = plan ? plan.tasks.map((t, i) => {
    const done = !!day.done[i];
    return `<button class="task ${done ? 'done' : ''}" data-action="toggle-task" data-date="${date}" data-idx="${i}">
      <span class="check ${done ? 'on' : ''}">✓</span>
      <div style="min-width:0;flex:1">
        <div class="task-kind">${U.pad2(i + 1)} · ${U.esc(t.k)}</div>
        <div class="task-title">${U.esc(t.t)}</div>
        <div class="task-min">${t.m} min</div>
      </div>
    </button>`;
  }).join('') : '<div class="empty">这一天没有安排任务</div>';

  const totalMin = plan ? plan.tasks.reduce((a, b) => a + b.m, 0) : 0;
  const doneCount = plan ? plan.tasks.filter((_, i) => day.done[i]).length : 0;
  const pct = plan && plan.tasks.length ? Math.round(doneCount / plan.tasks.length * 100) : 0;

  const expForDir = dir ? S.experiments.filter(x => x.dir === dir.id) : [];

  return `
  <div class="spread" style="margin-bottom:16px">
    <div>
      <div class="label">TODAY'S MISSION</div>
      <h2 style="margin:6px 0 2px;font-size:20px;font-weight:600;letter-spacing:-.025em">${U.esc(plan ? plan.theme : '自由探索日')}</h2>
      <div class="tiny dim">${U.prettyFull(date)}</div>
    </div>
    <div class="row" style="gap:8px">
      <button class="btn ghost sm" data-action="prev-day">←</button>
      <button class="btn ghost sm" data-action="jump-today">回到今天</button>
      <button class="btn ghost sm" data-action="next-day">→</button>
    </div>
  </div>

  ${plan ? `
  <div class="card" style="margin-bottom:16px">
    <div class="spread">
      <div class="row" style="gap:10px">
        <span style="width:7px;height:7px;border-radius:99px;background:${EX.dirColor(plan.dir)}"></span>
        <span class="sm" style="font-weight:500">${U.esc(plan.label)}</span>
        ${dir ? `<span class="tiny dim">· ${U.esc(dir.name)}</span>` : ''}
      </div>
      <span class="tiny mono dim">${doneCount}/${plan.tasks.length} 完成 · 共 ${totalMin} min</span>
    </div>
    <div style="margin-top:10px">${UI.meterHTML(pct, 'thin')}</div>
  </div>` : ''}

  <section class="section" style="margin-top:16px">
    <div class="section-head"><div class="section-title">Mission</div></div>
    <div class="grid" style="gap:8px">
      ${tasksHTML}
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">What did I discover today?</div>
        <div class="section-sub">如实写，这里没有别人看</div>
      </div>
    </div>
    <div class="card pad-lg">
      <div class="field">
        <label class="field-lab">今天做了什么？</label>
        <textarea class="textarea" data-field="discover" data-date="${date}" placeholder="例如：3D Gaussian Splatting 小实验">${U.esc(day.discover)}</textarea>
      </div>
      <div class="grid g2">
        <div class="field">
          <label class="field-lab">最爽的部分</label>
          <textarea class="textarea" data-field="best" data-date="${date}" placeholder="例如：终于看到自己生成的 3D 场景">${U.esc(day.best)}</textarea>
        </div>
        <div class="field">
          <label class="field-lab">最烦的部分</label>
          <textarea class="textarea" data-field="worst" data-date="${date}" placeholder="例如：环境配置 + CUDA">${U.esc(day.worst)}</textarea>
        </div>
      </div>

      <div class="field">
        <label class="field-lab">如果没人要求我，我还会继续吗？</label>
        <div class="row" style="gap:12px">
          ${UI.dotsHTML(day.keep || 0, `data-action="set-keep" data-date="${date}"`)}
          <span class="tiny dim">${keepLabel(day.keep)}</span>
        </div>
      </div>

      <div class="field">
        <label class="field-lab">结论</label>
        <input class="input" data-field="conclusion" data-date="${date}" value="${U.esc(day.conclusion)}" placeholder="例如：我可能真的喜欢 3D Vision">
      </div>

      <div class="row" style="margin-top:16px;gap:8px">
        <button class="btn primary" data-action="save-day" data-date="${date}">保存到本地</button>
        <button class="btn ghost" data-action="add-log" data-date="${date}">同时记入方向日志</button>
        <span class="tiny dim" id="saveHint"></span>
      </div>
    </div>
  </section>

  ${expForDir.length ? `
  <section class="section">
    <div class="section-head"><div class="section-title">这个方向的相关实验</div></div>
    <div class="grid g2">${expForDir.map(expCardHTML).join('')}</div>
  </section>` : ''}
  `;

  function getDay(S, date){
    if (!S.daily[date]) S.daily[date] = { done:{}, discover:'', best:'', worst:'', keep:0, conclusion:'' };
    return S.daily[date];
  }
  function keepLabel(v){
    return ['还没想','完全不想','有点犹豫','还行','想继续','非常想继续'][v] || '还没想';
  }
  function expCardHTML(x){
    const d = S.directions.find(v => v.id === x.dir);
    const statusMap = {
      done:   ['已完成', 's-done'],
      doing:  ['进行中', 's-doing'],
      planned:['计划中', '']
    };
    const st = statusMap[x.status] || statusMap.planned;
    return `<div class="exp">
      <div class="spread" style="align-items:flex-start">
        <div>
          <div class="exp-title">${U.esc(x.title)}</div>
          <div class="tiny dim" style="margin-top:3px">${d ? U.esc(d.name) : '未分类'}</div>
        </div>
        <span class="status-pill ${st[1]}">${st[0]}</span>
      </div>
      ${x.reflect ? `<div class="exp-block"><div class="bk">Reflection</div><div class="bv">${U.esc(x.reflect)}</div></div>` : ''}
    </div>`;
  }
};