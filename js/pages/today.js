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
  const cp = S.customPlan[date];
  const day = getDay(S, date);

  /* 主方向：优先默认 plan，其次自定义 cp */
  const dirId = (plan && plan.dir) || (cp && cp.dir) || '';
  const dir = dirId ? S.directions.find(d => d.id === dirId) : null;

  /* 主题：默认 plan 优先，没有则用自定义 cp */
  const theme = (plan && plan.theme) || (cp && cp.theme) || '自由探索日';

  /* 默认任务列表 */
  const planTasksHTML = plan ? plan.tasks.map((t, i) => {
    const done = !!day.done[i];
    return `<button class="task ${done ? 'done' : ''}" data-action="toggle-task" data-date="${date}" data-idx="${i}">
      <span class="check ${done ? 'on' : ''}">✓</span>
      <div style="min-width:0;flex:1">
        <div class="task-kind">${U.pad2(i + 1)} · ${U.esc(t.k)}</div>
        <div class="task-title">${U.esc(t.t)}</div>
        <div class="task-min">${t.m} min</div>
      </div>
    </button>`;
  }).join('') : '';

  /* 自定义任务列表（idx 用 cN 前缀避免与默认任务索引冲突） */
  const customTasks = (cp && cp.tasks) ? cp.tasks : [];
  const customTasksHTML = customTasks.map((t, i) => {
    const idx = 'c' + i;
    const done = !!day.done[idx];
    return `<div class="task ${done ? 'done' : ''}" style="cursor:pointer;display:flex;align-items:center;gap:10px" data-action="toggle-task" data-date="${date}" data-idx="${idx}">
      <span class="check ${done ? 'on' : ''}">✓</span>
      <div style="min-width:0;flex:1">
        <div class="task-kind">${U.esc(t.k)} · 自定义</div>
        <div class="task-title">${U.esc(t.t)}</div>
        <div class="task-min">${t.m} min</div>
      </div>
      <button class="btn ghost sm" data-action="edit-task" data-date="${date}" data-task-id="${t.id}" style="flex:0 0 auto">编辑</button>
      <button class="btn ghost sm" data-action="del-task" data-date="${date}" data-task-id="${t.id}" style="flex:0 0 auto;color:var(--danger)">×</button>
    </div>`;
  }).join('');

  const emptyHTML = '';

  /* 统计：合并任务总数与完成数 */
  const planCount = plan ? plan.tasks.length : 0;
  const totalCount = planCount + customTasks.length;
  const doneCount = (plan ? plan.tasks.filter((_, i) => day.done[i]).length : 0)
    + customTasks.filter((_, i) => day.done['c' + i]).length;
  const totalMin = (plan ? plan.tasks.reduce((a, b) => a + b.m, 0) : 0)
    + customTasks.reduce((a, b) => a + b.m, 0);
  const pct = totalCount ? Math.round(doneCount / totalCount * 100) : 0;

  const expForDir = dir ? S.experiments.filter(x => x.dir === dir.id) : [];

  /* 头部卡片用 label/dir，分别展示默认与自定义 */
  const headPlan = plan
    ? `<div class="row" style="gap:10px">
        <span style="width:7px;height:7px;border-radius:99px;background:${EX.dirColor(plan.dir)}"></span>
        <span class="sm" style="font-weight:500">${U.esc(plan.label)}</span>
        ${S.directions.find(d => d.id === plan.dir) ? `<span class="tiny dim">· ${U.esc(S.directions.find(d => d.id === plan.dir).name)}</span>` : ''}
      </div>`
    : '<span class="tiny dim">默认计划无</span>';
  const headCp = cp
    ? `<div class="row" style="gap:10px;margin-top:${plan ? '6px' : '0'}">
        <span style="width:7px;height:7px;border-radius:99px;background:${cp.dir ? EX.dirColor(cp.dir) : 'var(--text-3)'}"></span>
        <span class="sm" style="font-weight:500">${U.esc(cp.label || '自定义')}</span>
        ${cp.dir ? (S.directions.find(d => d.id === cp.dir) ? `<span class="tiny dim">· ${U.esc(S.directions.find(d => d.id === cp.dir).name)}</span>` : '') : ''}
      </div>`
    : '';

  /* 当日自定义日程详情（与月历页面共享同一份 S.customPlan） */
  const cpDirName = cp && cp.dir ? ((S.directions.find(d => d.id === cp.dir) || {}).name || '') : '';
  const cpTaskCount = cp ? (cp.tasks || []).length : 0;
  const cpTaskMin = cp ? (cp.tasks || []).reduce((a, b) => a + b.m, 0) : 0;

  return `
  <div class="spread" style="margin-bottom:16px">
    <div>
      <div class="label">TODAY'S MISSION</div>
      <h2 style="margin:6px 0 2px;font-size:20px;font-weight:600;letter-spacing:-.025em">${U.esc(theme)}</h2>
      <div class="tiny dim">${U.prettyFull(date)}</div>
    </div>
    <div class="row" style="gap:8px">
      <button class="btn ghost sm" data-action="prev-day">←</button>
      <button class="btn ghost sm" data-action="jump-today">回到今天</button>
      <button class="btn ghost sm" data-action="next-day">→</button>
    </div>
  </div>

  ${(plan || cp) ? `
  <div class="card" style="margin-bottom:16px">
    <div class="spread" style="align-items:flex-start">
      <div style="min-width:0;flex:1">
        ${headPlan}
        ${headCp}
      </div>
      <span class="tiny mono dim">${doneCount}/${totalCount} 完成 · 共 ${totalMin} min</span>
    </div>
    <div style="margin-top:10px">${UI.meterHTML(pct, 'thin')}</div>
  </div>` : ''}

  <section class="section" style="margin-top:16px">
    <div class="section-head">
      <div class="section-title">Mission</div>
      <button class="btn ghost sm" data-action="new-task" data-date="${date}">+ 添加今日任务</button>
    </div>
    ${plan ? `<div class="mission-group ${S.highlightSource === 'plan' ? 'section-highlight' : ''}" data-group="plan" style="margin-bottom:${cp ? '14px' : '0'}">
      <div class="row" style="gap:8px;margin-bottom:8px;align-items:center">
        <span style="width:6px;height:6px;border-radius:99px;background:${EX.dirColor(plan.dir)}"></span>
        <span class="tiny" style="font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-2)">${U.esc(plan.label)} · 默认计划</span>
        <span class="tiny dim">${plan.tasks.length} 项 · ${plan.tasks.reduce((a,b)=>a+b.m,0)} min</span>
      </div>
      <div class="grid" style="gap:8px">${planTasksHTML}</div>
    </div>` : ''}
    ${cp ? `<div class="mission-group" data-group="custom">
      <div class="row" style="gap:8px;margin-bottom:8px;align-items:center">
        <span style="width:6px;height:6px;border-radius:99px;background:${cp.dir ? EX.dirColor(cp.dir) : '#3fc7bd'}"></span>
        <span class="tiny" style="font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:var(--text-2)">${U.esc(cp.label || '自定义')} · 自定义日程</span>
        <span class="tiny dim">${customTasks.length} 项 · ${customTasks.reduce((a,b)=>a+b.m,0)} min</span>
      </div>
      <div class="grid" style="gap:8px">${customTasksHTML}</div>
    </div>
    <div class="custom-plan-card ${S.highlightSource === 'custom' ? 'section-highlight' : ''}" data-group="custom-detail" style="margin-top:14px;border:1px solid var(--border);border-radius:var(--r-md);padding:12px 14px;background:var(--panel)">
      <div class="row" style="gap:10px;align-items:flex-start">
        <span class="check ${day.cpDone ? 'on' : ''}" data-action="toggle-plan-done" data-date="${date}" role="button" tabindex="0" style="margin-top:3px;cursor:pointer">✓</span>
        <div style="flex:1;min-width:0">
          <div class="row" style="gap:8px;align-items:center">
            <span class="sm" style="font-weight:600${day.cpDone ? ';text-decoration:line-through;opacity:.6' : ''}">${U.esc(cp.theme || '（无主题）')}</span>
            <span class="tiny dim">${U.esc(cp.label || '自定义')}</span>
          </div>
          <div class="tiny dim" style="margin-top:4px">
            ${cpDirName ? '方向：' + U.esc(cpDirName) + ' · ' : ''}${cpTaskCount} 项任务 · ${cpTaskMin} min · ${U.prettyFull(date)}
          </div>
        </div>
        <span class="row" style="gap:6px;flex:0 0 auto">
          <button class="btn ghost sm" data-action="new-task" data-date="${date}">+ 任务</button>
          <button class="btn ghost sm" data-action="edit-plan" data-date="${date}">编辑</button>
          <button class="btn ghost sm" data-action="del-plan" data-date="${date}" style="color:var(--danger)">删除</button>
        </span>
      </div>
    </div>` : ''}
    ${emptyHTML}
    ${(!plan && !cp) ? `<div class="empty">这一天没有安排任务，可以上方添加自定义任务</div>` : ''}
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
    if (!S.daily[date]) S.daily[date] = { done:{}, cpDone:false, discover:'', best:'', worst:'', keep:0, conclusion:'' };
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
