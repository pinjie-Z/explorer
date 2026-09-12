/* ============================================================
   js/pages/misc.js
   Career / Research / Decision 三个页面
   ============================================================ */
window.EX = window.EX || {};
EX.pages = EX.pages || {};

/* ---------- CAREER ---------- */
EX.pages.career = function(){
  const S = EX.store.get();
  const U = EX.utils;

  return `
  <div class="spread" style="margin-bottom:16px">
    <div>
      <div class="label">CAREER MAP</div>
      <h2 style="margin:6px 0 0;font-size:20px;font-weight:600;letter-spacing:-.025em">职业地图</h2>
      <div class="tiny dim" style="margin-top:4px">先模拟工作，再决定专业。每张卡都有一件 2 小时能做完的事。</div>
    </div>
    <button class="btn primary" data-action="new-career">+ 新职业</button>
  </div>

  <div class="card" style="margin-bottom:16px;border-color:var(--accent-line);background:linear-gradient(120deg,var(--accent-soft),transparent 60%),var(--panel)">
    <div class="label" style="color:var(--accent)">CORE LOOP</div>
    <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap;font-size:12.5px;color:var(--text-2)">
      <span>Career</span><span class="dim">→</span>
      <span>人们实际在做什么</span><span class="dim">→</span>
      <span>试 2 小时</span><span class="dim">→</span>
      <span>我喜欢这份工作吗</span><span class="dim">→</span>
      <span style="color:var(--accent)">也许这就是方向</span>
    </div>
  </div>

  <div class="grid g2">
    ${S.career.map(c => careerCardHTML(c, S)).join('')}
  </div>

  ${!S.career.length ? '<div class="empty">还没有职业卡片，点右上角新建一个</div>' : ''}

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">职业 × 方向 分布</div>
        <div class="section-sub">哪些方向对应的职业路径最多</div>
      </div>
    </div>
    <div class="card">
      ${S.directions.map(d => {
        const n = S.career.filter(c => c.dir === d.id).length;
        const pct = S.career.length ? Math.round(n / S.career.length * 100) : 0;
        return `<div style="padding:9px 0">
          <div class="spread" style="margin-bottom:6px">
            <span class="sm">${U.esc(d.name)}</span>
            <span class="tiny mono dim">${n} 个职业</span>
          </div>
          ${EX.ui.meterHTML(pct, 'thin')}
        </div>`;
      }).join('')}
    </div>
  </section>
  `;

  function careerCardHTML(c, S){
    const d = S.directions.find(v => v.id === c.dir);
    return `<div class="career-card">
      <div class="spread" style="align-items:flex-start">
        <div>
          <div class="career-name">${U.esc(c.name)}</div>
          <div class="tiny dim" style="margin-top:3px">${d ? U.esc(d.name) : ''}</div>
        </div>
        <span class="tiny mono dim">${c.fit}.0 ★</span>
      </div>
      <div class="exp-block"><div class="bk">真实工作</div><div class="bv">${U.esc(c.real)}</div></div>
      <div class="exp-block" style="border-left-color:var(--accent-line)"><div class="bk" style="color:var(--accent)">2 小时试一下</div><div class="bv">${U.esc(c.tryIt)}</div></div>
      <div class="row" style="gap:6px;border-top:1px solid var(--border);padding-top:11px">
        <button class="btn ghost sm" data-action="edit-career" data-id="${c.id}">编辑</button>
        <button class="btn ghost sm" data-action="del-career" data-id="${c.id}" style="color:var(--danger)">删除</button>
      </div>
    </div>`;
  }
};

/* ---------- RESEARCH ---------- */
EX.pages.research = function(){
  const S = EX.store.get();
  const U = EX.utils;

  const groups = { curious:[], doing:[], done:[] };
  S.research.forEach(q => { (groups[q.status] || groups.curious).push(q); });

  return `
  <div class="spread" style="margin-bottom:16px">
    <div>
      <div class="label">RESEARCH POOL</div>
      <h2 style="margin:6px 0 0;font-size:20px;font-weight:600;letter-spacing:-.025em">研究问题池</h2>
      <div class="tiny dim" style="margin-top:4px">不是论文收藏夹，是我真正想搞懂的问题</div>
    </div>
    <button class="btn primary" data-action="new-q">+ 新问题</button>
  </div>

  ${['curious','doing','done'].map(k => {
    if (!groups[k].length) return '';
    return `<section class="section">
      <div class="section-head">
        <div class="section-title">${qStatusLabel(k)} <span class="dim mono tiny">${groups[k].length}</span></div>
      </div>
      <div class="stack" style="gap:8px">
        ${groups[k].map(q => {
          const d = S.directions.find(v => v.id === q.dir);
          return `<div class="q-item">
            <span style="width:6px;height:6px;border-radius:99px;background:${EX.dirColor(q.dir)};flex:0 0 6px;margin-top:8px"></span>
            <div style="flex:1;min-width:0">
              <div class="q-text">${U.esc(q.q)}</div>
              <div class="tiny dim" style="margin-top:3px">${d ? U.esc(d.name) : '未分类'}</div>
            </div>
            <button class="status-pill s-${q.status}" data-action="cycle-q" data-id="${q.id}">${qStatusLabel(q.status)}</button>
            <button class="btn ghost sm" data-action="edit-q" data-id="${q.id}">编辑</button>
            <button class="btn ghost sm" data-action="del-q" data-id="${q.id}" style="color:var(--danger)">×</button>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }).join('')}

  ${!S.research.length ? '<div class="empty">还没有问题。从“3D Gaussian Splatting 为什么有效？”这种句子开始。</div>' : ''}

  <section class="section">
    <div class="card" style="border-style:dashed">
      <div class="label">提示</div>
      <div class="sm muted" style="margin-top:6px;line-height:1.6">
        如果一个问题你能用一句话问出来，它就已经比「我想学 AI」精确得多。
        当一个问题从「好奇」变成「在查」，通常意味着你真的开始研究它了。
      </div>
    </div>
  </section>
  `;

  function qStatusLabel(s){
    return { curious:'好奇', doing:'在查', done:'已理解' }[s] || '好奇';
  }
};

/* ---------- DECISION ---------- */
EX.pages.decision = function(){
  const S = EX.store.get();
  const U = EX.utils;
  const UI = EX.ui;

  const ranked = S.directions.slice().sort((a, b) => score(b) - score(a));
  const top3 = ranked.slice(0, 3);
  const d = S.decision;

  const labels = ['兴趣','好奇','想继续','动手','数学','研究','产品','职业'];

  return `
  <div style="margin-bottom:16px">
    <div class="label">DECISION</div>
    <h2 style="margin:6px 0 0;font-size:20px;font-weight:600;letter-spacing:-.025em">基于证据的暂时决策</h2>
    <div class="tiny dim" style="margin-top:4px">不是一次性决定未来三年，而是决定接下来验证什么。</div>
  </div>

  <div class="card pad-lg" style="margin-bottom:16px">
    <div class="label" style="text-align:center">MY CURRENT HYPOTHESIS</div>

    <div class="tree">
      <div class="tree-node tree-root">
        <div class="tn-title">3D + AI</div>
        <div class="tn-sub">当前假设的交叉点</div>
      </div>
      <div class="tree-vline"></div>
      <div class="tree-branch">
        <div class="tree-col">
          <div class="tree-node">
            <div class="tn-title">${U.esc(top3[0] ? top3[0].name : '3D Vision')}</div>
            <div class="tn-sub">${top3[0] ? score(top3[0]).toFixed(1) : '4.6'} ★ · 很想继续做</div>
          </div>
          <div class="tree-vline"></div>
          <div class="tree-node" style="border-color:var(--accent-line);background:var(--accent-soft)">
            <div class="tn-title" style="color:var(--accent)">下一步深入 4 周</div>
            <div class="tn-sub">用一个小项目验证</div>
          </div>
        </div>
        <div class="tree-col">
          <div class="tree-node">
            <div class="tn-title">${U.esc(top3[1] ? top3[1].name : 'AI Product')}</div>
            <div class="tn-sub">${top3[1] ? score(top3[1]).toFixed(1) : '4.3'} ★ · 很想了解</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <section class="section" style="margin-top:0">
    <div class="section-head">
      <div>
        <div class="section-title">TOP 3</div>
        <div class="section-sub">按综合评分排序，评分来自实验而非直觉</div>
      </div>
    </div>
    <div class="stack" style="gap:10px">
      ${top3.map((x, i) => {
        const sc = score(x);
        return `<div class="rank-card ${i === 0 ? 'top1' : ''}">
          <span class="rank-num">TOP ${i + 1}</span>
          <div style="flex:1;min-width:0">
            <div class="dir-name" style="font-size:14px">${U.esc(x.name)}</div>
            <div class="tiny dim" style="margin-top:2px">${U.esc((x.tags || []).slice(0, 3).join(' · '))}</div>
            <div class="row" style="gap:10px;margin-top:8px">
              ${['interest','curiosity','continue'].map((k, idx) => `
                <span class="tiny dim">${labels[idx]} ${x.scores[k]}.0</span>
              `).join('')}
            </div>
          </div>
          <div style="text-align:right;flex:0 0 auto">
            <div class="dir-score" style="font-size:22px">${sc.toFixed(1)}</div>
            <div style="margin-top:4px">${UI.starsHTML(sc)}</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">写下来</div>
        <div class="section-sub">不写下来的决策等于没做</div>
      </div>
    </div>
    <div class="card pad-lg">
      <div class="field">
        <label class="field-lab">当前假设</label>
        <textarea class="textarea" data-decision="hypothesis" placeholder="我目前倾向于……">${U.esc(d.hypothesis)}</textarea>
        <div class="field-hint">例如：我倾向于做 3D Vision 相关的研究生方向，同时保持对 AI 产品的兴趣。</div>
      </div>
      <div class="field">
        <label class="field-lab">最大的不确定性</label>
        <textarea class="textarea" data-decision="uncertainty" placeholder="我还不知道……">${U.esc(d.uncertainty)}</textarea>
        <div class="field-hint">例如：我还不知道自己是更喜欢推导数学，还是更喜欢把东西做出来。</div>
      </div>
      <div class="field">
        <label class="field-lab">下一步</label>
        <textarea class="textarea" data-decision="next" placeholder="再用 4–8 周验证……">${U.esc(d.next)}</textarea>
        <div class="field-hint">例如：用 4 周做一个完整的 3D 重建小项目，从数据采集做到可视化。</div>
      </div>
      <div class="row" style="margin-top:14px">
        <button class="btn primary" data-action="save-decision">保存</button>
        <span class="tiny dim" id="decHint"></span>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="section-head">
      <div>
        <div class="section-title">证据摘要</div>
        <div class="section-sub">4 周里你实际做了什么</div>
      </div>
    </div>
    <div class="grid g3">
      <div class="stat"><div class="stat-val">${S.experiments.length}</div><div class="stat-lab">实验总数</div></div>
      <div class="stat"><div class="stat-val">${S.experiments.filter(x => x.status === 'done').length}</div><div class="stat-lab">已完成实验</div></div>
      <div class="stat"><div class="stat-val">${S.directions.reduce((a, x) => a + (x.log || []).length, 0)}</div><div class="stat-lab">探索记录</div></div>
    </div>
  </section>
  `;

  function score(d){
    const vals = EX.SCORE_KEYS.map(x => d.scores[x.k] || 0);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }
};