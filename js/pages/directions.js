/* ============================================================
   js/pages/directions.js
   方向矩阵 + 方向详情
   ============================================================ */
window.EX = window.EX || {};
EX.pages = EX.pages || {};

/* ---------- 方向矩阵 ---------- */
EX.pages.directions = function(){
  const S = EX.store.get();
  const U = EX.utils;
  const UI = EX.ui;
  const ranked = S.directions.slice().sort((a, b) => score(b) - score(a));

  return `
  <div class="spread" style="margin-bottom:16px">
    <div>
      <div class="label">DIRECTION MATRIX</div>
      <h2 style="margin:6px 0 0;font-size:20px;font-weight:600;letter-spacing:-.025em">方向矩阵</h2>
      <div class="tiny dim" style="margin-top:4px">分数随实验更新。点击表格里的数字可以改分。</div>
    </div>
    <button class="btn primary" data-action="new-dir">+ 新方向</button>
  </div>

  <div class="grid g2">
    ${ranked.map(d => {
      const sc = score(d);
      const pct = Math.round(sc / 5 * 100);
      return `<button class="dir-card" data-action="open-dir" data-id="${d.id}">
        <div class="spread" style="align-items:flex-start">
          <div class="row" style="gap:11px">
            <span class="dir-emoji">${U.esc(d.emoji || '◇')}</span>
            <div style="min-width:0">
              <div class="dir-name">${U.esc(d.name)}</div>
              <div class="dir-tags">${U.esc((d.tags || []).join(' · '))}</div>
            </div>
          </div>
          <div style="text-align:right">
            <div class="dir-score">${sc.toFixed(1)}<span> / 5</span></div>
          </div>
        </div>

        ${UI.meterHTML(pct, 'thin')}

        <div class="stack" style="gap:7px">
          ${['interest','curiosity','continue'].map(k => {
            const meta = EX.SCORE_KEYS.find(x => x.k === k);
            return `<div class="score-row">
              <span class="k">${meta.label}</span>
              <span>${UI.meterHTML((d.scores[k] || 0) / 5 * 100, 'thin')}</span>
              <span class="v">${d.scores[k] || 0}.0</span>
            </div>`;
          }).join('')}
        </div>

        <div class="spread" style="border-top:1px solid var(--border);padding-top:11px">
          <span class="tiny dim">${(d.log || []).length} 条探索记录</span>
          <span class="tiny" style="color:var(--accent)">查看记录 →</span>
        </div>
      </button>`;
    }).join('')}
  </div>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">完整评分表</div>
        <div class="section-sub">点击任意格子改分（1 到 5 循环）</div>
      </div>
    </div>
    <div class="tbl-wrap">
      <table class="tbl">
        <thead>
          <tr>
            <th>Direction</th>
            ${EX.SCORE_KEYS.map(x => `<th class="c">${x.label}</th>`).join('')}
            <th class="c">总分</th>
          </tr>
        </thead>
        <tbody>
          ${ranked.map(d => `<tr>
            <td>
              <span class="row" style="gap:8px">
                <span style="width:6px;height:6px;border-radius:99px;background:${EX.dirColor(d.id)};flex:0 0 6px"></span>
                <span style="font-weight:500">${U.esc(d.name)}</span>
              </span>
            </td>
            ${EX.SCORE_KEYS.map(x => {
              const v = d.scores[x.k] || 0;
              const cls = v >= 5 ? 'hi' : (v <= 2 ? 'mid' : '');
              return `<td class="c"><span class="cell-score ${cls}" data-action="bump-score" data-id="${d.id}" data-key="${x.k}">${v}</span></td>`;
            }).join('')}
            <td class="c"><span class="mono" style="font-weight:600">${score(d).toFixed(1)}</span></td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">管理方向</div>
        <div class="section-sub">编辑或删除已有方向</div>
      </div>
    </div>
    <div class="card">
      <div class="stack" style="gap:8px">
        ${ranked.map(d => `<div class="spread" style="padding:7px 0;border-bottom:1px solid var(--border)">
          <span class="row" style="gap:9px">
            <span class="dir-emoji" style="width:26px;height:26px;flex:0 0 26px;font-size:14px">${U.esc(d.emoji || '◇')}</span>
            <span class="sm" style="font-weight:500">${U.esc(d.name)}</span>
          </span>
          <span class="row" style="gap:6px">
            <button class="btn ghost sm" data-action="edit-dir" data-id="${d.id}">编辑</button>
            <button class="btn ghost sm" data-action="del-dir" data-id="${d.id}" style="color:var(--danger)">删除</button>
          </span>
        </div>`).join('')}
      </div>
    </div>
  </section>
  `;

  function score(d){
    const vals = EX.SCORE_KEYS.map(x => d.scores[x.k] || 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
};

/* ---------- 方向详情 ---------- */
EX.pages.direction = function(id){
  const S = EX.store.get();
  const U = EX.utils;
  const UI = EX.ui;
  const d = S.directions.find(v => v.id === id);

  if (!d) return `<div class="empty">找不到这个方向。
    <div style="margin-top:12px"><button class="btn ghost" data-route="directions">返回方向矩阵</button></div>
  </div>`;

  const sc = score(d);
  const pct = Math.round(sc / 5 * 100);
  const exps = S.experiments.filter(x => x.dir === d.id);
  const qs = S.research.filter(q => q.dir === d.id);
  const careers = S.career.filter(c => c.dir === d.id);
  const logs = (d.log || []).slice().sort((a, b) => b.d.localeCompare(a.d));

  return `
  <button class="btn ghost sm" data-route="directions" style="margin-bottom:16px">← 返回方向矩阵</button>

  <div class="hero" style="background:radial-gradient(120% 140% at 100% 0%, ${EX.dirColor(d.id)}22 0%, transparent 55%), var(--panel)">
    <div class="spread" style="align-items:flex-start">
      <div class="row" style="gap:13px">
        <span class="dir-emoji" style="width:44px;height:44px;flex:0 0 44px;font-size:22px">${U.esc(d.emoji || '◇')}</span>
        <div>
          <h1 style="font-size:22px;margin:0 0 4px">${U.esc(d.name)}</h1>
          <div class="tiny dim">${U.esc((d.tags || []).join(' · '))}</div>
        </div>
      </div>
      <div style="text-align:right">
        <div class="dir-score" style="font-size:26px">${sc.toFixed(1)}<span> / 5</span></div>
        <div class="tiny dim" style="margin-top:4px">综合评分</div>
      </div>
    </div>
    ${d.blurb ? `<p style="margin:14px 0 0;color:var(--text-2);font-size:13.5px">${U.esc(d.blurb)}</p>` : ''}
    <div style="margin-top:16px">${UI.meterHTML(pct, 'thick')}</div>
    <div class="row" style="gap:8px;margin-top:16px">
      <button class="btn primary sm" data-action="new-log" data-id="${d.id}">+ 添加探索记录</button>
      <button class="btn ghost sm" data-action="edit-dir" data-id="${d.id}">编辑方向</button>
    </div>
  </div>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">评分</div>
        <div class="section-sub">点击修改</div>
      </div>
    </div>
    <div class="card">
      <div class="stack" style="gap:0">
        ${EX.SCORE_KEYS.map(x => {
          const v = d.scores[x.k] || 0;
          return `<div class="spread" style="padding:10px 0;border-bottom:1px solid var(--border)">
            <span class="sm" style="flex:0 0 60px">${x.label}</span>
            <span style="flex:1;margin:0 12px">${UI.meterHTML(v / 5 * 100, 'thin')}</span>
            <span class="row" style="gap:6px">
              ${UI.dotsHTML(v, `data-action="set-score" data-id="${d.id}" data-key="${x.k}"`)}
            </span>
          </div>`;
        }).join('')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">探索记录</div>
        <div class="section-sub">${logs.length} 条</div>
      </div>
    </div>
    <div class="card">
      ${logs.length ? `<div class="tl">${logs.map(l => `
        <div class="tl-item done">
          <span class="tl-dot"></span>
          <div style="min-width:0;flex:1">
            <div class="tl-title">${U.esc(l.t)}</div>
            <div class="tl-meta">${U.prettyFull(l.d)}</div>
          </div>
          <button class="btn ghost sm" data-action="del-log" data-id="${d.id}" data-log="${l.id}" style="color:var(--danger)">×</button>
        </div>`).join('')}</div>` : '<div class="empty">还没有探索记录。去今日探索写下第一条，或点上方按钮添加。</div>'}
    </div>
  </section>

  ${exps.length ? `
  <section class="section">
    <div class="section-head"><div class="section-title">相关实验</div></div>
    <div class="grid g2">${exps.map(expCardHTML).join('')}</div>
  </section>` : ''}

  ${qs.length ? `
  <section class="section">
    <div class="section-head"><div class="section-title">我想搞懂的问题</div></div>
    <div class="stack" style="gap:8px">
      ${qs.map(q => `<div class="q-item">
        <span class="q-text" style="flex:1">${U.esc(q.q)}</span>
        <span class="status-pill s-${q.status}">${qStatusLabel(q.status)}</span>
      </div>`).join('')}
    </div>
  </section>` : ''}

  ${careers.length ? `
  <section class="section">
    <div class="section-head"><div class="section-title">相关职业</div></div>
    <div class="grid g2">${careers.map(careerCardHTML).join('')}</div>
  </section>` : ''}
  `;

  function score(d){
    const vals = EX.SCORE_KEYS.map(x => d.scores[x.k] || 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
  function qStatusLabel(s){
    return { curious:'好奇', doing:'在查', done:'已理解' }[s] || '好奇';
  }
  function expCardHTML(x){
    const dd = S.directions.find(v => v.id === x.dir);
    return `<div class="exp">
      <div class="spread" style="align-items:flex-start">
        <div>
          <div class="exp-title">${U.esc(x.title)}</div>
          <div class="tiny dim" style="margin-top:3px">${dd ? U.esc(dd.name) : ''}${x.date ? ' · ' + U.prettyDate(x.date) : ''}</div>
        </div>
        <span class="status-pill ${x.status === 'done' ? 's-done' : (x.status === 'doing' ? 's-doing' : '')}">${
          { done:'已完成', doing:'进行中', planned:'计划中' }[x.status] || '计划中'
        }</span>
      </div>
      ${x.reflect ? `<div class="exp-block"><div class="bk">Reflection</div><div class="bv">${U.esc(x.reflect)}</div></div>` : ''}
    </div>`;
  }
  function careerCardHTML(c){
    const dd = S.directions.find(v => v.id === c.dir);
    return `<div class="career-card">
      <div class="spread" style="align-items:flex-start">
        <div>
          <div class="career-name">${U.esc(c.name)}</div>
          <div class="tiny dim" style="margin-top:3px">${dd ? U.esc(dd.name) : ''}</div>
        </div>
        <span class="tiny mono dim">${c.fit}.0 ★</span>
      </div>
      <div class="exp-block"><div class="bk">真实工作</div><div class="bv">${U.esc(c.real)}</div></div>
      <div class="exp-block" style="border-left-color:var(--accent-line)"><div class="bk" style="color:var(--accent)">2 小时试一下</div><div class="bv">${U.esc(c.tryIt)}</div></div>
    </div>`;
  }
};