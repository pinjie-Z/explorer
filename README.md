# Explorer · 我的方向探索工作台

> 一个可以真正运行的「个人方向探索系统」。
> 不是笔记模板，不是 Markdown 加 emoji，而是一个多文件、可交互、可记录的 Web App。

---

## 1. 这个项目是什么

Explorer 帮你回答一个具体的问题：

> **我到底适合什么专业 / 研究方向 / 职业？**

它不帮你「规划一个已经确定的人生」，而是帮你在**不知道自己想要什么**的时候，通过 4 周低成本探索、动手实验、职业模拟和反思，系统性地收集真实证据，然后做一个**基于证据的暂时决策**。

核心循环：
```
Calendar → Today → Experiments → Reflection → Directions → Career → Decision → Next 4–8 Weeks
```

---

## 2. 文件结构
```
explorer/
├── index.html 入口页面，加载所有 CSS / JS
├── README.md 本文件
├── css/
│ ├── tokens.css 设计变量（颜色、圆角、阴影、字体）
│ ├── layout.css 应用骨架：侧边栏 / 顶栏 / 主视图 / 响应式
│ └── components.css 所有可复用组件（卡片、按钮、进度条、日历、模态框…）
└── js/
├── utils.js 纯工具函数（日期、转义、防抖、下载…）
├── data.js 静态数据：4 周计划、评分维度、默认示例数据
├── store.js 状态管理 + localStorage 持久化 + 导出/导入
├── ui.js Toast / Modal / Confirm / 微型组件
├── app.js 路由 + 事件委托 + 命令面板 + 启动
└── pages/
├── dashboard.js Dashboard 概览
├── today.js 今日探索 + 每日记录表单
├── calendar.js 月历 + 4 周结构
├── experiments.js 实验项目列表 + 增删改
├── directions.js 方向矩阵 + 方向详情
└── misc.js 职业地图 / 研究问题 / 最终决策
```

---

## 3. 如何运行

### 方式 A：直接双击（最简单）

直接用浏览器打开 `index.html`。

- 大多数浏览器（Chrome / Edge / Firefox / Safari）都支持 `file://` 下的普通 `<script>` 加载。
- 数据存在浏览器 localStorage 里。
- 如果 localStorage 不可用，页面会提示，但功能仍可使用（只是刷新会丢数据）。

### 方式 B：本地服务器（推荐）

在 `explorer/` 目录下运行任意一个：

```bash
python3 -m http.server 8080
# 或者
npx serve .
```
然后访问 `http://localhost:8080`。

### 方式 C：放进 Obsidian

有两种做法：

1. **用 Custom Frames 插件**：把本地服务器地址嵌进 Obsidian 的一个 tab。
2. **直接用浏览器打开**，把 Obsidian 当作笔记存放处。

> 说明：Obsidian 本身不能直接执行多文件 HTML 应用。如果你希望它「在 Obsidian 里运行」，最稳的方式是方式 B + Custom Frames。

---

## 4. 每个文件做什么

### index.html

- 应用外壳：侧边栏、顶栏、主视图容器。
- 按顺序加载所有 CSS 和 JS。
- 包含命令面板、模态框层、Toast 层、隐藏的文件导入 input。

### css/tokens.css

- 所有设计变量：深色 / 浅色两套颜色、圆角、阴影、字体栈。
- Reset 和基础排版。
- 通用工具类（`.grid`、`.row`、`.stack`、`.mono`…）。

### css/layout.css

- `.app`、`.sidebar`、`.main`、`.topbar`、`.view` 的布局。
- 侧边栏的 4 周进度、工具按钮。
- 移动端响应式：≤900px 时侧边栏变成抽屉。

### css/components.css

- `.card`、`.btn`、`.tag`、`.stat`、`.hero`
- `.meter`（进度条）、`.stars`、`.dots`
- `.task`、`.cal-*`（日历）、`.exp`（实验卡）、`.career-card`、`.q-item`
- `.tree`（决策树）、`.rank-card`、`.tbl`
- `.modal`、`.toast`、`.cmdk`（命令面板）

### js/utils.js

纯函数，无副作用：

- `$` / `$$`：查询
- `esc`：HTML 转义
- `isoOf` / `parseISO` / `daysBetween` / `prettyDate` / `prettyFull`：日期
- `uid`：生成唯一 id
- `debounce`：输入防抖
- `downloadJSON`：下载备份

### js/data.js

静态数据，不随用户操作变化：

- `EX.DIR_COLOR`：方向颜色映射
- `EX.SCORE_KEYS`：8 个评分维度
- `EX.WEEKS`：4 周结构
- `EX.PLAN`：每一天的主题、方向、任务
- `EX.TITLES`：页面标题
- `EX.DEFAULT`：默认示例数据（方向、实验、职业、研究问题、决策）

### js/store.js

状态管理，所有写操作都经过它：

- `load()`：从 localStorage 读取，缺失字段用默认值补全
- `save()`：写入 localStorage
- `get()`：读取当前状态
- `patch(fn)`：静默修改（不触发重渲染，用于输入框自动保存）
- `commit(fn)`：修改并触发重渲染
- `subscribe(fn)`：订阅状态变化
- `exportJSON()`：导出带元信息的备份文件
- `importJSON(text)`：从备份恢复
- `reset()`：恢复默认数据

### js/ui.js

- `toast(msg, type)`：右下角提示
- `modal({...})`：通用表单模态框，支持 text / textarea / select / date / rating
- `confirm({...})`：确认对话框
- `starsHTML` / `dotsHTML` / `meterHTML`：微型组件
- `fieldHTML`：表单字段生成器

### js/pages/*.js

每个页面一个文件，每个文件导出 `EX.pages.<name>` 函数，返回 HTML 字符串。

- `dashboard.js`：概览、统计、当前探索、方向排行、最近活动、4 周时间线、实验卡
- `today.js`：日期切换、任务打勾、每日记录表单、相关实验
- `calendar.js`：月历网格、4 周结构卡片
- `experiments.js`：按状态分组、实验卡、分布统计
- `directions.js`：方向卡片、评分表、方向详情页
- `misc.js`：职业地图、研究问题池、最终决策

### js/app.js

- 路由（hash 路由，`#/dashboard`、`#/direction/vision3d`…）
- 事件委托：所有 `[data-action]` 和 `[data-route]` 集中处理
- 命令面板（⌘K / Ctrl+K）
- 数据导入导出
- 启动流程

---

## 5. 4 周探索计划

系统围绕一个 4 周周期展开：

```
Week 1  Map the Territory   绘制地形图：AI / CV / 3D / Graphics / XR 各看一眼
Week 2  Build & Break       动手做：3DGS / NeRF / Shader / Agent / 原型
Week 3  Try the Work        模拟职业：AI Engineer / 3D Vision / Graphics 的一天
Week 4  Decide              整理证据、写决策、设计下一个 4–8 周
```

每一天不是只有一个标题，而是一个 Mission：

```
01 · Learn    读 / 看 / 理解        30 min
02 · Build    实际做一个东西        90 min
03 · Reflect  问自己愿不愿意继续    10 min
```

重点不是「学习」，而是**实验**。所以任务都用动词描述：

- ❌ 学习计算机视觉
- ✅ 做一个 2 小时 Stereo Vision 实验

---

## 6. 每天怎么用

1. 打开 `index.html`（或本地服务器地址）。
2. 看 Dashboard，知道今天大概在做什么。
3. 点「今日探索」，按 Mission 完成任务，打勾。
4. 在下方表单写：
   - 今天做了什么
   - 最爽的部分
   - 最烦的部分
   - 如果没人要求我，我还会继续吗（1–5 点）
   - 结论
5. 点「保存到本地」，或「同时记入方向日志」。
6. 去「方向矩阵」，根据今天的体验**更新分数**。
7. 有新的实验想法，去「实验项目」新建一张卡。

---

## 7. 数据存储与备份

- 数据默认存在浏览器 localStorage，key 是 `obsidian-explorer-v2`。
- 不同浏览器 / 不同设备之间**不共享**数据。
- 想迁移或备份，用侧边栏底部的：
  - **导出**：下载一个 JSON 文件，包含全部数据。
  - **导入**：选择之前的 JSON 文件恢复。
  - **重置**：清空并恢复默认示例数据（不可撤销）。

> 建议每周导出一次，尤其是 Week 4 做决策之前。

---

## 8. 如何扩展

### 加一个新方向

点「方向矩阵」右上角「+ 新方向」，填名称、图标、标签、描述即可。

### 加一个新实验

点「实验项目」右上角「+ 新建实验」，或从「今日探索」里记录。

### 改 4 周计划

编辑 `js/data.js` 里的 `EX.PLAN` 对象。每个 key 是一个日期，value 是：

```js
{
  dir: 'vision3d',        // 方向 id
  label: '3D',            // 日历上的短标签
  theme: '3D Vision 入门', // 当天主题
  tasks: [
    { k: 'Learn',   t: '任务描述', m: 30 },
    { k: 'Build',   t: '任务描述', m: 90 },
    { k: 'Reflect', t: '任务描述', m: 10 }
  ]
}
```

### 改默认示例数据

编辑 `js/data.js` 里的 `EX.DEFAULT`。清空浏览器数据或点「重置」后生效。

### 加一个新页面

1. 在 `js/pages/` 新建一个文件，导出 `EX.pages.yourpage = function(){ return \`...\` }`。
2. 在 `index.html` 里加 `<script src="js/pages/yourpage.js"></script>`。
3. 在 `js/data.js` 的 `EX.TITLES` 里加标题。
4. 在 `js/app.js` 的 `switch(name)` 里加一个 case。
5. 在 `index.html` 的侧边栏加一个 `.nav-item`。

---

## 9. 设计说明

- **深色优先**，同时支持浅色（顶栏右侧 ◐ 切换）。
- **大量留白**：主视图最大宽度 1080px，居中，卡片间距 12–34px。
- **圆角卡片**：14px / 10px / 7px 三级。
- **微妙阴影**：深色下几乎看不见，浅色下很轻。
- **现代 SaaS 风格**：参考 Linear / Notion / Vercel / Raycast。
- **移动端可用**：≤900px 侧边栏变抽屉，网格自动堆叠。

---

## 10. 一句话总结

> **它不是帮你「规划一个已经确定的人生」，而是帮你在不知道自己想要什么的时候，系统地找到答案。**
```
### 探索机制与操作方式

这个页面把“找方向”拆成每天可执行的小任务，您不需要一次性想清楚未来，只要按节奏做实验、记录感受，证据就会慢慢浮现。

**每日任务与自动记录**

“今日探索”页面会明确告诉您今天做什么，任务按“学习、动手、反思”三个节奏展开，并附有时间预算。您可以直接点击任务卡打勾，在下方表单记录“今天做了什么”“最爽的部分”“最烦的部分”，以及“如果没人要求我，我还会继续吗”这一关键自评。所有输入都会自动保存到浏览器本地。

**方向评分与证据更新**

“方向矩阵”把兴趣、好奇、想继续、数学、研究、产品、职业等维度量化成表格，每个格子都可以点击修改分数（1到5循环）。排行榜和进度条会实时更新，帮助您一眼看出哪个方向正在被更多实验支撑。每一张方向卡片都可以点进去，查看属于它自己的探索记录和相关实验。

**职业模拟与决策辅助**

“职业地图”把AI工程师、3D视觉工程师、图形工程师等职业拆解成“真实工作内容”和“2小时可以试一下的小任务”。“最终决策”页面会按综合评分自动排出TOP 3方向，并生成一张决策树，帮您写下当前假设、最大不确定性和下一步验证计划。
---

**优化建议：** 所有预设的方向、实验和职业数据都集中在 `js/data.js` 的 `EX.DEFAULT` 对象里，您可以直接修改数组来匹配自己的探索内容；4周计划表在 `EX.PLAN` 对象中，按日期键值对定义每日任务。
