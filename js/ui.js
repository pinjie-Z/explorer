/* ============================================================
   js/ui.js
   可复用 UI：Toast / Modal / Confirm / 微型组件
   ============================================================ */
window.EX = window.EX || {};

EX.ui = (function(){
  const U = EX.utils;
  const $ = U.$;

  /* ---------- TOAST ---------- */
  function toast(msg, type){
    const layer = $('#toastLayer');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    layer.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 300);
    }, 2400);
  }

  /* ---------- FIELD ---------- */
  function fieldHTML(f, val){
    const v = val !== undefined && val !== null ? val : (f.default !== undefined ? f.default : '');
    const req = f.required ? ' <span style="color:var(--danger)">*</span>' : '';
    const hint = f.hint ? `<div class="field-hint">${U.esc(f.hint)}</div>` : '';

    if (f.type === 'textarea'){
      return `<div class="field">
        <label class="field-lab">${U.esc(f.label)}${req}</label>
        <textarea class="textarea" name="${U.esc(f.key)}" placeholder="${U.esc(f.placeholder || '')}" rows="${f.rows || 3}">${U.esc(v)}</textarea>
        ${hint}
      </div>`;
    }
    if (f.type === 'select'){
      const opts = (f.options || []).map(o =>
        `<option value="${U.esc(o.value)}"${String(o.value) === String(v) ? ' selected' : ''}>${U.esc(o.label)}</option>`
      ).join('');
      return `<div class="field">
        <label class="field-lab">${U.esc(f.label)}${req}</label>
        <select class="input" name="${U.esc(f.key)}">${opts}</select>
        ${hint}
      </div>`;
    }
    if (f.type === 'rating'){
      const num = Number(v) || 3;
      return `<div class="field">
        <label class="field-lab">${U.esc(f.label)}${req}</label>
        <div class="range-row">
          <input type="range" class="range" name="${U.esc(f.key)}" min="1" max="5" step="1" value="${num}"
            oninput="this.closest('.range-row').querySelector('.range-val').textContent=this.value">
          <span class="range-val">${num}</span>
        </div>
        ${hint}
      </div>`;
    }
    if (f.type === 'date'){
      return `<div class="field">
        <label class="field-lab">${U.esc(f.label)}${req}</label>
        <input type="date" class="input" name="${U.esc(f.key)}" value="${U.esc(v)}">
        ${hint}
      </div>`;
    }
    return `<div class="field">
      <label class="field-lab">${U.esc(f.label)}${req}</label>
      <input type="${f.type || 'text'}" class="input" name="${U.esc(f.key)}"
        value="${U.esc(v)}" placeholder="${U.esc(f.placeholder || '')}">
      ${hint}
    </div>`;
  }

  /* ---------- MODAL ---------- */
  let modalResolver = null;

  function modal(opts){
    const layer = $('#modalLayer');
    if (!layer) return;

    const fields = opts.fields || [];
    const values = opts.values || {};
    const submitText = opts.submitText || '保存';
    const cancelText = opts.cancelText || '取消';
    const danger = !!opts.danger;
    const bodyHTML = opts.message
      ? `<p class="modal-message">${U.esc(opts.message)}</p>`
      : fields.map(f => fieldHTML(f, values[f.key])).join('');

    layer.innerHTML = `
      <div class="modal-backdrop" data-action="modal-close">
        <div class="modal" data-stop>
          <div class="modal-head">
            <div class="modal-title">${U.esc(opts.title || '')}</div>
            <button class="icon-btn" data-action="modal-close" aria-label="关闭">✕</button>
          </div>
          <div class="modal-body">${bodyHTML}</div>
          <div class="modal-foot">
            <button class="btn ghost" data-action="modal-close">${U.esc(cancelText)}</button>
            <button class="btn ${danger ? 'danger' : 'primary'}" data-action="modal-submit">${U.esc(submitText)}</button>
          </div>
        </div>
      </div>`;

    layer.classList.add('open');

    /* 提交逻辑 */
    const submitBtn = layer.querySelector('[data-action="modal-submit"]');
    submitBtn.onclick = () => {
      if (opts.message){
        closeModal();
        if (opts.onSubmit) opts.onSubmit({});
        return;
      }
      const data = {};
      let valid = true;

      fields.forEach(f => {
        const el = layer.querySelector(`[name="${cssEscape(f.key)}"]`);
        if (!el) return;
        let v;
        if (f.type === 'rating') v = Number(el.value);
        else v = el.value;
        if (f.required && (v === '' || v === null || v === undefined)){
          valid = false;
          el.classList.add('invalid');
        } else {
          el.classList.remove('invalid');
        }
        data[f.key] = v;
      });

      if (!valid){
        toast('请填写必填项', 'warn');
        return;
      }
      closeModal();
      if (opts.onSubmit) opts.onSubmit(data);
    };

    /* 自动聚焦第一个输入 */
    setTimeout(() => {
      const first = layer.querySelector('input:not([type="range"]),textarea,select');
      if (first) first.focus();
    }, 40);

    return new Promise(resolve => { modalResolver = resolve; });
  }

  function closeModal(){
    const layer = $('#modalLayer');
    if (!layer) return;
    layer.classList.remove('open');
    layer.innerHTML = '';
    if (modalResolver){ modalResolver(null); modalResolver = null; }
  }

  function confirm(opts){
    return modal({
      title: opts.title || '确认',
      message: opts.message || '确定要执行这个操作吗？',
      submitText: opts.submitText || '确认',
      danger: opts.danger !== false,
      onSubmit: () => { if (opts.onConfirm) opts.onConfirm(); }
    });
  }

  /* ---------- 微型组件 ---------- */
  function starsHTML(v){
    let h = '<span class="stars">';
    for (let i = 1; i <= 5; i++){
      h += `<span class="${i <= Math.round(v) ? 'on' : 'off'}">★</span>`;
    }
    return h + '</span>';
  }

  function dotsHTML(v, attrs){
    let h = `<span class="dots interactive" ${attrs || ''}>`;
    for (let i = 1; i <= 5; i++){
      h += `<i class="${i <= v ? 'on' : ''}" data-value="${i}"></i>`;
    }
    return h + '</span>';
  }

  function meterHTML(pct, cls){
    return `<div class="meter ${cls || ''}"><i style="width:${U.clamp(pct, 0, 100)}%"></i></div>`;
  }

  function cssEscape(s){
    if (window.CSS && CSS.escape) return CSS.escape(s);
    return String(s).replace(/["\\]/g, '\\$&');
  }

  return {
    toast, modal, closeModal, confirm,
    starsHTML, dotsHTML, meterHTML,
    fieldHTML, cssEscape
  };
})();