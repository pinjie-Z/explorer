/* ============================================================
   js/data.js
   静态计划数据 + 常量
   ============================================================ */
window.EX = window.EX || {};

/* ---------- 颜色映射 ---------- */
EX.DIR_COLOR = {
  ai:       '#6f7bf7',
  product:  '#e879a8',
  cv:       '#4ea8de',
  vision3d: '#5b9df5',
  graphics: '#b17ee8',
  xr:       '#3fc7bd',
  robotics: '#e8a34e',
  display:  '#5fbf7a',
  review:   '#8a8f98',
  build:    '#6f7bf7',
  career:   '#e879a8',
  decide:   '#6f7bf7',
  next:     '#8a8f98'
};
EX.dirColor = id => EX.DIR_COLOR[id] || 'var(--text-3)';

/* ---------- 评分维度 ---------- */
EX.SCORE_KEYS = [
  { k:'interest',  label:'兴趣' },
  { k:'curiosity', label:'好奇' },
  { k:'continue',  label:'想继续' },
  { k:'build',     label:'动手' },
  { k:'math',      label:'数学' },
  { k:'research',  label:'研究' },
  { k:'product',   label:'产品' },
  { k:'career',    label:'职业' }
];

/* ---------- 4 周结构 ---------- */
EX.WEEKS = [
  { n:1, name:'Map the Territory', from:'2026-09-15', to:'2026-09-21' },
  { n:2, name:'Build & Break',      from:'2026-09-22', to:'2026-09-28' },
  { n:3, name:'Try the Work',       from:'2026-09-29', to:'2026-10-05' },
  { n:4, name:'Decide',             from:'2026-10-06', to:'2026-10-12' }
];

/* ---------- 页面标题 ---------- */
EX.TITLES = {
  dashboard:  ['Dashboard', '找到一个值得投入 3 年的方向'],
  today:      ['今日探索', '今天干什么'],
  calendar:   ['月历', '4 周探索计划'],
  experiments:['实验项目', '用真实动手验证兴趣'],
  directions: ['方向矩阵', '用证据打分，不靠感觉'],
  direction:  ['方向详情', ''],
  career:     ['职业地图', '先模拟工作，再决定专业'],
  research:   ['研究问题池', '从学科名称进入具体问题'],
  decision:   ['最终决策', '基于证据的暂时决策']
};

/* ---------- 每日计划 ---------- */
EX.PLAN = {
  /* Week 1 · Map the Territory */
  '2026-09-15': { dir:'ai', label:'AI', theme:'AI 全景地图', tasks:[
    { k:'Learn',   t:'读一篇 AI 工程综述，列出 10 个子领域', m:30 },
    { k:'Build',   t:'跑通一个 LLM API demo，改 3 个参数', m:90 },
    { k:'Reflect', t:'我对「模型」还是「产品」更兴奋？', m:10 } ] },
  '2026-09-16': { dir:'ai', label:'AI', theme:'AI Product', tasks:[
    { k:'Learn',   t:'拆解 3 个 AI 产品的真实交互', m:30 },
    { k:'Build',   t:'做一个最小 AI 工作流原型', m:90 },
    { k:'Reflect', t:'这个方向我愿意做 3 年吗？', m:10 } ] },
  '2026-09-17': { dir:'cv', label:'CV', theme:'Computer Vision', tasks:[
    { k:'Learn',   t:'卷积 / 特征 / 检测的基本脉络', m:30 },
    { k:'Build',   t:'跑一个预训练检测模型，换自己的图', m:90 },
    { k:'Reflect', t:'视觉任务的哪一部分最吸引我？', m:10 } ] },
  '2026-09-18': { dir:'vision3d', label:'3D', theme:'3D Vision 入门', tasks:[
    { k:'Learn',   t:'相机模型、内外参、极线几何', m:40 },
    { k:'Build',   t:'用 OpenCV 做一次双目深度估计', m:80 },
    { k:'Reflect', t:'数学让我兴奋还是痛苦？', m:10 } ] },
  '2026-09-19': { dir:'graphics', label:'Graphics', theme:'Graphics 一瞥', tasks:[
    { k:'Learn',   t:'光栅化管线：顶点 → 片元 → 像素', m:30 },
    { k:'Build',   t:'写第一个能动的 shader', m:90 },
    { k:'Reflect', t:'渲染的哪一步让我想继续？', m:10 } ] },
  '2026-09-20': { dir:'xr', label:'XR', theme:'XR / Spatial', tasks:[
    { k:'Learn',   t:'AR / VR / MR 的技术边界', m:30 },
    { k:'Build',   t:'做一个 WebXR 最小场景', m:80 },
    { k:'Reflect', t:'XR 是真需求还是概念？', m:10 } ] },
  '2026-09-21': { dir:'review', label:'Review', theme:'Week 1 复盘', tasks:[
    { k:'Reflect', t:'写出本周最兴奋的 3 个瞬间', m:20 },
    { k:'Reflect', t:'更新方向矩阵的分数', m:20 } ] },

  /* Week 2 · Build & Break */
  '2026-09-22': { dir:'build', label:'Build', theme:'Gaussian Splatting', tasks:[
    { k:'Learn',   t:'3DGS 为什么比 NeRF 快', m:30 },
    { k:'Build',   t:'用手机照片训练一个 3DGS 场景', m:120 },
    { k:'Reflect', t:'环境配置的痛苦 vs 看到结果的爽', m:10 } ] },
  '2026-09-23': { dir:'build', label:'Build', theme:'NeRF 复现', tasks:[
    { k:'Learn',   t:'体渲染与位置编码', m:30 },
    { k:'Build',   t:'复现一个最小 NeRF', m:120 },
    { k:'Reflect', t:'我是在享受过程还是只想看到结果？', m:10 } ] },
  '2026-09-24': { dir:'build', label:'Build', theme:'Shader 入门', tasks:[
    { k:'Learn',   t:'GLSL 基础语法与坐标空间', m:30 },
    { k:'Build',   t:'写一个实时光照材质', m:100 },
    { k:'Reflect', t:'图形学的手感如何？', m:10 } ] },
  '2026-09-25': { dir:'product', label:'Agent', theme:'Agent 实验', tasks:[
    { k:'Learn',   t:'Tool use / Planning / Memory 三件事', m:30 },
    { k:'Build',   t:'做一个能查资料并写报告的 Agent', m:110 },
    { k:'Reflect', t:'我更想做模型还是做调度？', m:10 } ] },
  '2026-09-26': { dir:'product', label:'Product', theme:'AI 产品原型', tasks:[
    { k:'Learn',   t:'一个 AI 产品的 5 个关键决策', m:20 },
    { k:'Build',   t:'给自己的痛点做一个小工具', m:110 },
    { k:'Reflect', t:'用户反馈会让我兴奋吗？', m:10 } ] },
  '2026-09-27': { dir:'graphics', label:'Graphics', theme:'渲染管线', tasks:[
    { k:'Learn',   t:'延迟渲染 / 前向渲染的区别', m:30 },
    { k:'Build',   t:'实现一个多光源场景', m:100 },
    { k:'Reflect', t:'工程复杂度是否劝退我？', m:10 } ] },
  '2026-09-28': { dir:'review', label:'Review', theme:'Week 2 复盘', tasks:[
    { k:'Reflect', t:'哪个实验让我忘记看时间？', m:20 },
    { k:'Reflect', t:'更新方向矩阵', m:20 } ] },

  /* Week 3 · Try the Work */
  '2026-09-29': { dir:'career', label:'Career', theme:'AI Engineer 的一天', tasks:[
    { k:'Learn',   t:'读 3 份 AI Engineer JD，圈出重复要求', m:30 },
    { k:'Build',   t:'模拟：给一个模型加 eval 与监控', m:90 },
    { k:'Reflect', t:'这份工作的日常我受得了吗？', m:15 } ] },
  '2026-09-30': { dir:'career', label:'Career', theme:'3D Vision Engineer 的一天', tasks:[
    { k:'Learn',   t:'看一个 3D 重建项目的工作流', m:30 },
    { k:'Build',   t:'模拟：把重建结果接进一个可视化工具', m:90 },
    { k:'Reflect', t:'我更喜欢算法还是管线？', m:15 } ] },
  '2026-10-01': { dir:'career', label:'Career', theme:'Graphics Engineer 的一天', tasks:[
    { k:'Learn',   t:'引擎里图形工程师的真实任务', m:30 },
    { k:'Build',   t:'模拟：优化一个渲染 pass 的性能', m:90 },
    { k:'Reflect', t:'性能优化的爽感 vs 枯燥感', m:15 } ] },
  '2026-10-02': { dir:'vision3d', label:'Vision', theme:'Stereo 深入', tasks:[
    { k:'Learn',   t:'代价体 / 视差 / 亚像素', m:40 },
    { k:'Build',   t:'自己实现一个块匹配深度图', m:90 },
    { k:'Reflect', t:'推导和调参哪个更让我投入？', m:10 } ] },
  '2026-10-03': { dir:'graphics', label:'Graphics', theme:'实时光照', tasks:[
    { k:'Learn',   t:'PBR 的核心直觉', m:30 },
    { k:'Build',   t:'实现一个 PBR 材质球', m:100 },
    { k:'Reflect', t:'视觉反馈对我有多重要？', m:10 } ] },
  '2026-10-04': { dir:'xr', label:'XR', theme:'WebXR Demo', tasks:[
    { k:'Learn',   t:'空间交互的设计约束', m:30 },
    { k:'Build',   t:'做一个可抓取的 WebXR 物体', m:100 },
    { k:'Reflect', t:'XR 离「有用」还有多远？', m:10 } ] },
  '2026-10-05': { dir:'review', label:'Review', theme:'Week 3 复盘', tasks:[
    { k:'Reflect', t:'模拟职业里哪个最像「我」？', m:20 },
    { k:'Reflect', t:'更新方向矩阵', m:20 } ] },

  /* Week 4 · Decide */
  '2026-10-06': { dir:'decide', label:'Decide', theme:'整理证据', tasks:[
    { k:'Reflect', t:'把 4 周的实验结论汇总成一张表', m:40 } ] },
  '2026-10-07': { dir:'decide', label:'Decide', theme:'方向矩阵终评', tasks:[
    { k:'Reflect', t:'给每个方向重新打分并写理由', m:40 } ] },
  '2026-10-08': { dir:'decide', label:'Decide', theme:'写决策文档', tasks:[
    { k:'Reflect', t:'当前假设 / 最大不确定性 / 下一步', m:50 } ] },
  '2026-10-09': { dir:'next', label:'Next', theme:'设计下一个实验', tasks:[
    { k:'Reflect', t:'下一个 4–8 周验证什么？', m:40 } ] },
  '2026-10-10': { dir:'next', label:'Next', theme:'资源与路径', tasks:[
    { k:'Learn',   t:'列出需要的课程 / 项目 / 人脉', m:40 } ] },
  '2026-10-11': { dir:'next', label:'Next', theme:'缓冲', tasks:[
    { k:'Reflect', t:'补上前面欠下的实验', m:60 } ] },
  '2026-10-12': { dir:'review', label:'Review', theme:'总复盘', tasks:[
    { k:'Reflect', t:'4 周前后，我变了什么？', m:40 } ] }
};

/* ---------- 默认种子数据 ---------- */
EX.DEFAULT = {
  meta: { version: 2 },
  theme: 'dark',
  startDate: '2026-09-15',
  activeDay: '2026-09-15',
  calView: { y: 2026, m: 8 },
  customPlan: {},
  highlightSource: null,
  directions: [
    { id:'vision3d', name:'3D Vision', emoji:'🧠',
      tags:['Computer Vision','Reconstruction','NeRF','Gaussian Splatting'],
      blurb:'如何从 2D 图像真正理解 3D 世界。',
      scores:{ interest:5, curiosity:5, continue:5, build:5, math:4, research:5, product:3, career:5 },
      log:[
        { id:'l1', d:'2026-09-19', t:'3D Gaussian Splatting 小实验：第一次看到自己生成的场景' },
        { id:'l2', d:'2026-09-17', t:'Stereo Vision 深度图，调参调到怀疑人生但很有感觉' }
      ] },
    { id:'ai', name:'AI Engineering', emoji:'⚡',
      tags:['LLM','Agent','RAG','Multimodal'],
      blurb:'把模型变成能用的东西，而不是只跑 benchmark。',
      scores:{ interest:5, curiosity:4, continue:4, build:5, math:3, research:4, product:4, career:5 },
      log:[ { id:'l3', d:'2026-09-15', t:'跑通 LLM API，理解 temperature 的真实影响' } ] },
    { id:'product', name:'AI Product', emoji:'🎯',
      tags:['AI Application','Agent','UX'],
      blurb:'AI 能力与真实用户痛点之间的那层翻译。',
      scores:{ interest:5, curiosity:4, continue:4, build:5, math:2, research:3, product:5, career:5 },
      log:[ { id:'l4', d:'2026-09-16', t:'拆解 3 个 AI 产品的交互，发现很多只是套壳' } ] },
    { id:'xr', name:'XR / Spatial', emoji:'🥽',
      tags:['AR','VR','Spatial Computing'],
      blurb:'把计算放进真实空间里，交互问题比渲染问题更难。',
      scores:{ interest:4, curiosity:5, continue:4, build:4, math:3, research:4, product:4, career:4 },
      log:[] },
    { id:'graphics', name:'Graphics', emoji:'🎨',
      tags:['Rendering','Shader','Geometry','Simulation'],
      blurb:'在有限算力里造出可信的视觉世界。',
      scores:{ interest:4, curiosity:4, continue:4, build:5, math:5, research:4, product:2, career:4 },
      log:[] },
    { id:'display', name:'Computational Display', emoji:'🔬',
      tags:['三维显示','Light Field','Holographic'],
      blurb:'光学、感知与计算的交叉地带。',
      scores:{ interest:4, curiosity:4, continue:3, build:3, math:4, research:4, product:2, career:3 },
      log:[] },
    { id:'robotics', name:'Robotics', emoji:'🤖',
      tags:['Perception','Embodied AI'],
      blurb:'让智能体在物理世界里做事。',
      scores:{ interest:3, curiosity:4, continue:3, build:3, math:4, research:4, product:2, career:3 },
      log:[] }
  ],
  experiments: [
    { id:'x1', title:'Gaussian Splatting 小实验', dir:'vision3d', status:'done', date:'2026-09-19',
      hyp:'能不能用手机拍的几十张照片重建出一个可以自由旋转的场景？',
      problem:'CUDA 与 PyTorch 版本冲突，环境配了 3 小时。',
      result:'终于跑通，第一次看到自己生成的 3D 场景。',
      reflect:'配置环境极其痛苦，但看到结果的一瞬间全值了。我可能真的喜欢 3D Vision。',
      score:5 },
    { id:'x2', title:'AI Product 原型', dir:'product', status:'done', date:'2026-09-16',
      hyp:'给自己做一个真正会用的小工具，能坚持用超过 3 天吗？',
      problem:'功能想太多，第一版做了两天没做完。',
      result:'砍到只剩一个功能后，确实每天都用。',
      reflect:'我享受「有人真的在用」的感觉，超过享受模型本身。',
      score:4 },
    { id:'x3', title:'Stereo Vision 深度图', dir:'vision3d', status:'done', date:'2026-09-17',
      hyp:'自己实现块匹配，能不能得到可用的深度图？',
      problem:'纹理稀疏区域全是空洞，参数怎么调都不对。',
      result:'调了 40 分钟参数后勉强可用。',
      reflect:'调参让我烦躁，但推导几何关系让我很投入。',
      score:4 },
    { id:'x4', title:'Shader 第一课', dir:'graphics', status:'planned', date:'',
      hyp:'写一个能动的东西，会不会比调模型更有成就感？',
      problem:'', result:'', reflect:'', score:0 }
  ],
  career: [
    { id:'c1', name:'AI Engineer', dir:'ai', fit:4,
      real:'把模型接进产品：调 prompt、做 eval、搭检索管线、盯延迟和成本。',
      tryIt:'用 2 小时给一个开源模型接上你自己的数据，并写 5 条测试用例。' },
    { id:'c2', name:'3D Vision Engineer', dir:'vision3d', fit:5,
      real:'做重建、标定、深度估计，把算法跑在真实设备和真实数据上。',
      tryIt:'用手机拍一组照片，完整跑一次重建并导出可交互模型。' },
    { id:'c3', name:'Graphics Engineer', dir:'graphics', fit:4,
      real:'写渲染管线、优化性能、实现光照与材质，为画面效果负责。',
      tryIt:'实现一个 PBR 材质球，并用性能分析工具找出瓶颈。' },
    { id:'c4', name:'Applied Scientist', dir:'vision3d', fit:4,
      real:'一半读论文一半写代码，把新方法落到真实问题上。',
      tryIt:'复现一篇近半年的论文，记录卡住的每一步。' },
    { id:'c5', name:'XR Engineer', dir:'xr', fit:3,
      real:'做空间交互、追踪与渲染，处理真实世界的各种不完美。',
      tryIt:'做一个能抓取物体的 WebXR 场景，测试 30 分钟。' },
    { id:'c6', name:'AI Product Manager', dir:'product', fit:4,
      real:'定义问题、判断优先级、在能力边界内做取舍。',
      tryIt:'给你熟悉的 3 个 AI 产品各写一份改进提案。' },
    { id:'c7', name:'Researcher / PhD', dir:'vision3d', fit:3,
      real:'长期面对不确定问题，大量阅读、推导与失败实验。',
      tryIt:'花 4 小时只读论文不写代码，看自己是否坐得住。' },
    { id:'c8', name:'Display / Optics Engineer', dir:'display', fit:3,
      real:'光学设计、显示系统、计算成像，软硬件结合。',
      tryIt:'读一篇计算显示综述，画出它的核心光学链路。' }
  ],
  research: [
    { id:'q1', q:'如何从 2D 图像真正理解 3D 世界？', dir:'vision3d', status:'curious' },
    { id:'q2', q:'3D Gaussian Splatting 为什么有效，它的边界在哪？', dir:'vision3d', status:'doing' },
    { id:'q3', q:'AI 和 3D Vision 结合的下一个突破点是什么？', dir:'vision3d', status:'curious' },
    { id:'q4', q:'AR 中最困难的问题到底是显示、追踪还是交互？', dir:'xr', status:'curious' },
    { id:'q5', q:'三维显示的未来方向是光场还是全息？', dir:'display', status:'curious' },
    { id:'q6', q:'AI 能不能和计算显示结合，做出真正的裸眼 3D？', dir:'display', status:'curious' },
    { id:'q7', q:'Agent 的可靠性瓶颈是模型能力还是系统设计？', dir:'product', status:'curious' }
  ],
  daily: {},
  decision: { hypothesis:'', uncertainty:'', next:'' }
};