要用“方式 B + Custom Frames”把 Explorer 嵌进 Obsidian，核心是两步：**先让 Explorer 跑在本地服务器上，再用 Custom Frames 插件把它嵌进 Obsidian 的面板里**。

### 🖥️ 第一步：启动本地服务器

Explorer 是一个多文件 Web App，直接双击 `index.html` 可能会因为浏览器的安全策略（CORS）导致部分功能异常。所以我们需要一个本地服务器来托管它。

**操作很简单，只需一行命令：**

1.  **打开终端**（Windows 用 CMD 或 PowerShell，Mac/Linux 用 Terminal）。
2.  **导航到 Explorer 项目文件夹**。例如，如果你的文件夹在桌面，命令是：
    ```bash
    cd Desktop/explorer
    ```
3.  **启动 Python 自带的 HTTP 服务器**：
    ```bash
    python3 -m http.server 8080
    ```
    *   如果你的电脑是 Windows 且只安装了 Python 2，可以把 `python3` 换成 `python`。
    *   端口号 `8080` 可以换成其他数字（如 `8000`），只要不被占用即可。
4.  **验证**：打开浏览器，访问 `http://localhost:8080`，如果能看到 Explorer 的界面，说明服务器启动成功。
5.  **保持终端窗口开启**。这个窗口就是你的服务器，关掉它网页就无法访问了。

### 🔌 第二步：安装并配置 Custom Frames

Custom Frames 是一个 Obsidian 插件，它能通过 iframe 把任意网页变成 Obsidian 的一个面板。

1.  **安装插件**：在 Obsidian 中，进入 **设置 → 社区插件 → 浏览**，搜索 **Custom Frames**（作者是 Ellpeck），点击 **安装** 并 **启用**。
2.  **添加新框架**：进入 Custom Frames 的插件设置页，点击 **Add new frame**，然后选择 **Custom**（自定义）。
3.  **填写配置**：
    *   **Display Name**：给这个面板起个名字，比如 `Explorer`。
    *   **URL**：这是最关键的一步，填写你的本地服务器地址：`http://localhost:8080`。
    *   **Ribbon icon**：建议开启，这样 Obsidian 左侧边栏会出现一个图标，点击就能快速打开 Explorer。
    *   **Disable on Mobile**：建议开启，因为 Obsidian 移动端对 iframe 的支持有限，开启后可以避免在手机上显示空白或卡顿。
4.  点击 **Save** 保存。

### ✅ 第三步：在 Obsidian 中使用

保存后，你可以通过以下几种方式打开 Explorer 面板：

*   **侧边栏图标**：如果你开启了 Ribbon icon，直接点击 Obsidian 左侧的图标即可。
*   **命令面板**：按 `Ctrl/Cmd + P`，输入 `Custom Frames: Open`，然后选择你刚创建的 `Explorer`。
*   **笔记内嵌入**：你甚至可以在笔记里嵌入它。在笔记中添加一个代码块：
    ````markdown
    ```custom-frames
    frame: Explorer
    ```
    ````
    这样 Explorer 就会作为一个可交互的模块直接显示在你的笔记中。

### ⚠️ 常见问题

*   **面板一片空白？** 首先，请确认你的终端窗口（服务器）还在运行。如果关掉了，需要重新执行 `python3 -m http.server 8080` 命令。
*   **数据会丢失吗？** 不会。Explorer 的数据默认保存在浏览器（这里是 Obsidian 内置的 Electron 浏览器）的 `localStorage` 里。**但为了保险，建议定期使用 Explorer 侧边栏底部的“导出”功能，把数据备份成 JSON 文件**。
*   **能在手机上用吗？** 体验可能不佳。因为 Obsidian 移动端对 iframe 的限制较多，很多网页应用无法正常显示或登录。所以建议在配置时勾选 `Disable on Mobile`，避免在手机上看到空白面板。