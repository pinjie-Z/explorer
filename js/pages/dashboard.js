/* ============================================================
   js/pages/dashboard.js
   ============================================================ */
window.EX = window.EX || {};
EX.pages = EX.pages || {};

EX.pages.dashboard = function(){
  const S = EX.store.get();
  const U = EX.utils;
  const UI = EX.ui;
  const today = U.isoOf(new Date());

  const elapsed = Math.max(1, U.daysBetween(S.startDate, today) + 1);
  const expN = S.experiments.length;
  const dirN = S.directions.filter(d => score(d) >= 4).length;

  const ranked = S.directions.slice().sort((a, b) => score(b) - score(a));
  const top = ranked[0];
  const topScore = score(top);
  const topPct = Math.round(topScore / 5 * 100);

  const plan = EX.PLAN[S.activeDay] || EX.PLAN['2026-09-11'];
  const todayDir = S.directions.find(d => d.id === plan.dir) || top;

  const activity = recentActivity(S);
  const expCards = S.experiments.slice(0, 2).map(expCardHTML).join('');

  return `
  <section class="hero">
    <h1>🌌Per aspera ad astra.</h1>
    <p>实验、记录、判断。</p>
  </section>

  <div class="grid g3" style="margin-top:14px">
    <div class="stat"><div class="stat-val">${elapsed}</div><div class="stat-lab">探索天数</div></div>
    <div class="stat"><div class="stat-val">${expN}</div><div class="stat-lab">实验项目</div></div>
    <div class="stat"><div class="stat-val">${dirN}</div><div class="stat-lab">候选方向</div></div>
  </div>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">Current Exploration</div>
        <div class="section-sub">当前投入最多的方向</div>
      </div>
      <span class="tag accent"><span class="tdot"></span>Exploring</span>
    </div>
    <div class="card pad-lg">
      <div class="spread" style="align-items:flex-start">
        <div class="row" style="gap:12px">
          <div class="dir-emoji">${U.esc(top.emoji || '◇')}</div>
          <div>
            <div class="dir-name">${U.esc(top.name)}</div>
            <div class="dir-tags">${U.esc(top.tags.slice(0, 3).join(' · '))}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="dir-score">${topScore.toFixed(1)}<span> / 5</span></div>
        </div>
      </div>

      <div style="margin-top:16px">
        ${UI.meterHTML(topPct, 'thick')}
        <div class="spread" style="margin-top:7px">
          <span class="tiny dim">方向置信度</span>
          <span class="tiny mono dim">${topPct}%</span>
        </div>
      </div>

      <div class="grid g2" style="margin-top:16px">
        <div class="card flat" style="background:var(--panel-2);padding:13px 14px">
          <div class="label">今天</div>
          <div class="sm" style="margin-top:4px;font-weight:500">${U.esc(plan.theme)}</div>
        </div>
        <div class="card flat" style="background:var(--panel-2);padding:13px 14px">
          <div class="label">方向</div>
          <div class="sm" style="margin-top:4px;font-weight:500">${U.esc(todayDir.name)}</div>
        </div>
      </div>

      <div class="row" style="margin-top:16px;gap:8px">
        <button class="btn primary" data-route="today">进入今日任务 →</button>
        <button class="btn ghost" data-route="direction/${top.id}">查看探索记录</button>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">Your Directions</div>
        <div class="section-sub">分数会随实验不断更新</div>
      </div>
      <button class="btn ghost sm" data-route="directions">全部 →</button>
    </div>
    <div class="card">
      ${ranked.slice(0, 5).map((d, i, arr) => {
        const sc = score(d);
        const pct = Math.round(sc / 5 * 100);
        const last = i === arr.length - 1;
        return `<div style="padding:11px 0;${last ? '' : 'border-bottom:1px solid var(--border)'}">
          <div class="spread" style="margin-bottom:7px">
            <div class="row" style="gap:8px">
              <span style="width:6px;height:6px;border-radius:99px;background:${EX.dirColor(d.id)}"></span>
              <span class="sm" style="font-weight:500">${U.esc(d.name)}</span>
            </div>
            <span class="sm mono dim">${sc.toFixed(1)} <span style="color:var(--warn)">★</span></span>
          </div>
          ${UI.meterHTML(pct, 'thin')}
        </div>`;
      }).join('')}
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">Recent Activity</div>
        <div class="section-sub">最近 8 条探索记录</div>
      </div>
    </div>
    <div class="card">
      ${activity.length ? activity.map(a => `
        <div class="act">
          <span class="act-date">${a.d === today ? 'Today' : U.prettyDate(a.d)}</span>
          <span class="act-text">${U.esc(a.t)}</span>
          <span style="margin-left:auto;width:6px;height:6px;border-radius:99px;background:${EX.dirColor(a.dir)};flex:0 0 6px"></span>
        </div>`).join('') : '<div class="empty">还没有记录，去今日探索写下第一条</div>'}
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">4 Week Journey</div>
        <div class="section-sub">Map → Build → Try → Decide</div>
      </div>
      <button class="btn ghost sm" data-route="calendar">月历 →</button>
    </div>
    <div class="card">
      <div class="tl">
        ${EX.WEEKS.map(w => {
          const done = today > w.to;
          const active = today >= w.from && today <= w.to;
          return `<div class="tl-item ${active ? 'active' : (done ? 'done' : '')}">
            <span class="tl-dot"></span>
            <div>
              <div class="tl-title">Week ${w.n} · ${U.esc(w.name)}</div>
              <div class="tl-meta">${U.prettyDate(w.from)} – ${U.prettyDate(w.to)}</div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">Experiments</div>
        <div class="section-sub">重点不是学习，是动手</div>
      </div>
      <button class="btn ghost sm" data-route="experiments">全部 →</button>
    </div>
    <div class="grid g2">
      ${expCards || '<div class="empty">还没有实验</div>'}
    </div>
  </section>
  `;

  /* ---- helpers ---- */
  function score(d){
    const vals = EX.SCORE_KEYS.map(x => d.scores[x.k] || 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  function recentActivity(S){
    const items = [];
    S.directions.forEach(d => (d.log || []).forEach(l =>
      items.push({ d: l.d, t: l.t, dir: d.id })));
    S.experiments.forEach(x => {
      if (x.date) items.push({ d: x.date, t: x.title, dir: x.dir });
    });
    items.sort((a, b) => b.d.localeCompare(a.d));
    return items.slice(0, 8);
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
          <div class="tiny dim" style="margin-top:3px">${d ? U.esc(d.name) : '未分类'}${x.date ? ' · ' + U.prettyDate(x.date) : ''}</div>
        </div>
        <span class="status-pill ${st[1]}">${st[0]}</span>
      </div>
      ${x.hyp ? `<div class="exp-block"><div class="bk">Hypothesis</div><div class="bv">${U.esc(x.hyp)}</div></div>` : ''}
      ${x.reflect ? `<div class="exp-block"><div class="bk">Reflection</div><div class="bv">${U.esc(x.reflect)}</div></div>` : ''}
    </div>`;
  }
};