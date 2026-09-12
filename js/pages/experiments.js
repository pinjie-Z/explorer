/* ============================================================
   js/pages/experiments.js
   ============================================================ */
window.EX = window.EX || {};
EX.pages = EX.pages || {};

EX.pages.experiments = function(){
  const S = EX.store.get();
  const U = EX.utils;

  const groups = { doing:[], planned:[], done:[] };
  S.experiments.forEach(x => { (groups[x.status] || groups.planned).push(x); });

  const countBy = id => S.experiments.filter(x => x.dir === id).length;

  return `
  <div class="spread" style="margin-bottom:16px">
    <div>
      <div class="label">BUILD LAB</div>
      <h2 style="margin:6px 0 0;font-size:20px;font-weight:600;letter-spacing:-.025em">实验项目</h2>
      <div class="tiny dim" style="margin-top:4px">重点不是学习某个学科，而是做一件 2 小时能做完的事</div>
    </div>
    <button class="btn primary" data-action="new-exp">+ 新建实验</button>
  </div>

  ${['doing','planned','done'].map(k => {
    if (!groups[k].length) return '';
    const names = { doing:'进行中', planned:'计划中', done:'已完成' };
    return `<section class="section">
      <div class="section-head">
        <div class="section-title">${names[k]} <span class="dim mono tiny">${groups[k].length}</span></div>
      </div>
      <div class="grid g2">${groups[k].map(expCardHTML).join('')}</div>
    </section>`;
  }).join('')}

  ${!S.experiments.length ? '<div class="empty">还没有实验。点右上角新建一个，或者从“今日探索”里记录。</div>' : ''}

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">实验分布</div>
        <div class="section-sub">哪个方向你实际动手最多</div>
      </div>
    </div>
    <div class="card">
      ${S.directions.map(d => {
        const n = countBy(d.id);
        const pct = S.experiments.length ? Math.round(n / S.experiments.length * 100) : 0;
        return `<div style="padding:9px 0">
          <div class="spread" style="margin-bottom:6px">
            <span class="sm">${U.esc(d.name)}</span>
            <span class="tiny mono dim">${n}</span>
          </div>
          ${EX.ui.meterHTML(pct, 'thin')}
        </div>`;
      }).join('')}
    </div>
  </section>
  `;

  function expCardHTML(x){
    const d = S.directions.find(v => v.id === x.dir);
    const statusMap = {
      done:   ['已完成', 's-done'],
      doing:  ['进行中', 's-doing'],
      planned:['计划中', '']
    };
    const st = statusMap[x.status] || statusMap.planned;

    const blocks = [
      x.hyp     && ['Hypothesis', x.hyp],
      x.problem && ['Problem',    x.problem],
      x.result  && ['Result',     x.result],
      x.reflect && ['Reflection', x.reflect]
    ].filter(Boolean);

    return `<div class="exp">
      <div class="spread" style="align-items:flex-start">
        <div style="min-width:0;flex:1">
          <div class="exp-title">${U.esc(x.title)}</div>
          <div class="tiny dim" style="margin-top:3px">${d ? U.esc(d.name) : '未分类'}${x.date ? ' · ' + U.prettyDate(x.date) : ''}</div>
        </div>
        <span class="status-pill ${st[1]}">${st[0]}</span>
      </div>

      ${blocks.map(b => `<div class="exp-block"><div class="bk">${b[0]}</div><div class="bv">${U.esc(b[1])}</div></div>`).join('')}

      <div class="spread" style="margin-top:auto;padding-top:11px;border-top:1px solid var(--border)">
        <span class="tiny dim">我会再做一次吗</span>
        <span class="row" style="gap:8px">
          ${EX.ui.starsHTML(x.score)}
        </span>
      </div>

      <div class="row" style="gap:6px">
        <button class="btn ghost sm" data-action="edit-exp" data-id="${x.id}">编辑</button>
        <button class="btn ghost sm" data-action="cycle-exp" data-id="${x.id}">切换状态</button>
        <button class="btn ghost sm" data-action="del-exp" data-id="${x.id}" style="color:var(--danger)">删除</button>
      </div>
    </div>`;
  }
};