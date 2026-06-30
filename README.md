# Aria2 下载拦截器 🚀

> 自动拦截浏览器下载，发送到 Aria2 管理，告别浏览器内置下载

[![Tampermonkey](https://img.shields.io/badge/Tampermonkey-✔-brightgreen)](https://www.tampermonkey.net/)
[![Aria2](https://img.shields.io/badge/Aria2-✔-blue)](https://github.com/aria2/aria2)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 概述

大多数浏览器下载管理器功能有限（不支持断点续传、多线程等），而 Aria2 是最强大的命令行下载工具之一。

本 Tampermonkey 脚本自动拦截网页上的文件下载链接（`.exe` `.zip` `.rar` `.iso` `.mp4` 等），将下载任务**直接发送到 Aria2 RPC**，并自动弹出 Aria2 Explorer 管理页面。

## ✨ 特性

- 🎯 **自动拦截** — 点击下载链接自动捕获，无需额外操作
- ⚡ **直连 Aria2** — 通过 JSON-RPC 将任务添加到 Aria2
- 📂 **断点续传** — Aria2 原生支持，不怕下载中断
- 🔄 **多线程加速** — Aria2 自动启用多连接下载
- 📋 **自动切换** — 添加任务后自动打开 Aria2 Explorer 查看进度（复用同一标签页）
- 🔧 **轻量无依赖** — 纯原生 JS + Tampermonkey GM_xmlhttpRequest
- 🧩 **支持编程式下载** — 某些网站 JS 触发的下载也能拦截

## 🚀 安装

### 前置条件

1. **安装 Aria2** 并启动 RPC 模式：
   ```bash
   aria2c --enable-rpc --rpc-listen-all --rpc-allow-origin-all
   ```

2. **安装 Aria2 Explorer**（浏览器扩展）或其他 Web UI：
   - [Aria2 Explorer (Chrome/Edge)](https://chrome.google.com/webstore/detail/aria2-explorer/mpkodccbngfoacfalldjimigbofkhgjn)

3. **安装 [Tampermonkey](https://www.tampermonkey.net/)** 浏览器扩展

### 安装步骤

**方法一：一键安装（推荐）**

👉 点击链接：[安装 Aria2 下载拦截器](https://github.com/Sec-Joe/aria2-downloader/raw/main/aria2-downloader.user.js)

**方法二：手动安装**

1. 打开 Tampermonkey 管理面板 →「添加新脚本」
2. 删除默认代码，粘贴 [aria2-downloader.user.js](aria2-downloader.user.js) 的完整内容
3. 保存（`Ctrl+S`）
4. 刷新网页即可生效

## 🎯 使用方法

| 操作 | 效果 |
|------|------|
| 点击文件下载链接（`.exe` `.zip` `.rar` 等） | ✅ 自动拦截 → 发送到 Aria2 → 打开 Aria2 Explorer |
| 网页 JS 触发的下载 | ✅ 同样拦截 |
| 普通链接（非下载文件） | ✅ 不影响，正常跳转 |

> 💡 **提示**：添加任务后脚本会自动打开 Aria2 Explorer 页面，用的是**固定标签页名**，不会重复打开新标签页。

## 🧠 实现原理

```
用户点击下载链接
       │
       ▼
捕获 <a> 标签 click（捕获阶段）
       │
       ├─ 匹配可下载文件扩展名？→ 是 → 阻止默认下载
       │                                      │
       │                                      ▼
       │                              发送到 Aria2 RPC
       │                                      │
       │                                      ▼
       │                              JSON-RPC: aria2.addUri
       │                                      │
       │                                      ▼
       │                              自动打开 Aria2 Explorer
       │
       └─ 不是下载文件 → 不拦截，正常跳转
```

**关键技术：**
- `addEventListener(type, handler, true)` — 捕获阶段拦截，先于网站处理
- `window.open(url, fixedName)` — 固定标签页名，浏览器自动复用
- `GM_xmlhttpRequest` — 跨域发送 JSON-RPC 到 Aria2
- 重写 `document.createElement('a').click()` — 拦截编程式下载

## ⚙️ 配置

打开脚本，修改开头的配置常量：

```javascript
const ARIA2_RPC = 'http://localhost:6800/jsonrpc';  // Aria2 RPC 地址
const ARIA2_UI  = 'http://localhost:6800/';           // Aria2 Explorer 页面
const TOKEN    = '';                                  // 如有 RPC token 请填写
const TAB_NAME = 'aria2_explorer_auto';               // 标签页名称
```

如需扩展下载文件类型，修改 `DOWNLOAD_EXTS` 正则：

```javascript
const DOWNLOAD_EXTS = /\.(exe|zip|rar|7z|iso|pdf|dmg|apk|msi|pkg|tar|gz|xz|deb|rpm|mp4|mkv|avi|mov|mp3|flac)$/i;
```

## 📋 兼容性

| 浏览器 | 支持情况 |
|--------|---------|
| Chrome | ✅ 通过 |
| Edge | ✅ 通过 |
| Firefox | ✅ 通过 |
| Safari | ✅ 通过 |

| 下载来源 | 支持情况 |
|---------|---------|
| GitHub Releases | ✅ 通过 |
| 普通下载站 | ✅ 通过 |
| 腾讯软件中心 | ⚠️ 部分站点 JS 下载逻辑特殊 |

## ⚠️ 注意事项

- 确保 Aria2 **已启动并开启 RPC** 模式，否则拦截后无法下载
- 如果浏览器拦截了 Aria2 Explorer 弹窗，请在地址栏允许弹窗
- 本脚本不会干扰非下载链接的点击行为

## 📁 文件结构

```
aria2-downloader/
├── aria2-downloader.user.js   # Tampermonkey 脚本（主文件）
├── README.md                   # 本文件
└── LICENSE                     # MIT 许可证
```

## 🤝 贡献

欢迎提交 Issue 和 PR！如果你遇到无法拦截的下载链接：

1. 按 `F12` 打开开发者工具
2. Console 检查是否有脚本输出
3. [提交 Issue](https://github.com/Sec-Joe/aria2-downloader/issues) 附上网址

## 📄 许可

[MIT License](LICENSE) © 2025 JoeSec
