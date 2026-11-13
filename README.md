# Orbit · GitHub 导航站

[![GitHub stars](https://img.shields.io/github/stars/DaiYiqq/orbit-github-nav?style=flat&logo=github&label=stars)](https://github.com/DaiYiqq/orbit-github-nav/stargazers) [![License: GPL v3](https://img.shields.io/github/license/DaiYiqq/orbit-github-nav?style=flat&label=license)](LICENSE)

[English](README.en.md) · [简体中文](README.md)

> **一句话定位**：Orbit 是面向新手与开发者的中文 GitHub 导航站——把 GitHub 上值得用的开源项目自动收录、分类、按星标分层整理好，让你不用登录、不用会写代码，打开网页就能找到、看懂并直达合适的项目。
>
> GitHub 上有几亿个项目，好用的不少，但大多数人不知道该从哪儿找起。Orbit 把它们**自动收录、分好类、按星标整理好**，再把 AI 工具、社区、博客和论文放到同一个地方。**不用登录，不用会写代码，打开就能用。**
>
> **维护方式**：本项目由**社区共同维护**，采用 [GPL-3.0](LICENSE) 开源许可证。任何人都可以通过 Issue / PR 参与，协作约定见 [CONTRIBUTING.md](CONTRIBUTING.md)。

| 项目 | 内容 |
| --- | --- |
| 项目名 | Orbit · GitHub 导航站 |
| 仓库 | https://github.com/DaiYiqq/orbit-github-nav |
| 维护方式 | 社区共同维护（[CONTRIBUTING.md](CONTRIBUTING.md)） |
| 许可证 | [GPL-3.0](LICENSE) |
| 技术栈 | 原生 HTML / CSS / JavaScript（无构建、无框架依赖）· GitHub Search API · PWA + Service Worker · Tauri 2 · GitHub Pages / Actions |

## 在线 Demo

| 地址 | 说明 |
| --- | --- |
| https://DaiYiqq.github.io/orbit-github-nav/ | GitHub Pages 正式站点，免登录即可使用全部浏览功能 |
| https://orbit-github-nav.app.workbuddy.host/ | 已发布的应用镜像，邮箱 / 手机验证码登录在此域名可用 |

> 两个地址的功能边界见[能力边界（说清楚）](#能力边界说清楚)与[云服务与域名边界](#云服务与域名边界重要)。

## 截图

![桌面版预览](preview/desktop.png)

<details>
<summary>看手机端长什么样</summary>
<img src="preview/mobile.png" width="320" alt="手机端预览">
</details>

<details>
<summary>更多页面：项目详情 / 下载安装 / 动效</summary>
<img src="preview/detail.png" width="420" alt="项目详情页预览">
<img src="preview/install.png" width="420" alt="下载安装中心预览">
<img src="preview/motion.png" width="420" alt="交互动效预览">
</details>

## 核心功能

| 能力 | 说明 |
| --- | --- |
| 自动收录与分类 | 收录 **3265 个真实仓库**，按 16 个主题组织，可按分类、语言、星标区间、最近更新、许可证筛选与 6 种排序 |
| 星标分层与趋势 | 10 万 / 5 万 / 1 万 / 5 千 / 1 千星分层，近 7 / 30 / 90 天仍活跃的项目 |
| 项目整页详情 | README 渲染、Star / Fork / Issue 数据、许可证、下载 ZIP、复制 clone 命令、8 个 GitHub 深链、贡献步骤与同类项目 |
| 站内源码浏览 | 分支切换、文件树、代码高亮与行号、单文件复制 / 下载、提交 / Issues / Releases |
| AI 与生态导航 | 对话助手、编程工具、图像视频音频、开源模型与平台、AI 社区、MCP / Skills / Agent / 开源精选 |
| 博客与论文 | 18 个技术博客、20 篇经典论文（附 arXiv 原文） |
| 搜索 | ⌘K 命令面板（跨仓库 / 分类 / 工具 / 论文）+ GitHub 全站实时搜索补齐长尾仓库 |
| 收藏与跨端 | 心形收藏、一键分享、导入导出 JSON；可选邮箱 / 手机验证码登录后云同步 |
| 多端与外观 | 网页 / PWA / Tauri 2 桌面端 / 手机共用同一份 `site/` 代码；Apple 风格浅色 / 深色 / 跟随系统 |
| 免登录 | 搜索、筛选、收藏、分享、源码浏览全部不需要账号；游客数据只存在本机浏览器 |

## 适合谁

- **刚接触 GitHub 的新手**：分不清 Star / Fork / Issue / License 也没关系，站内有人话术语小抄、新手 5 分钟上手、与 GitHub 官网的功能对照表和常见问题。
- **要选型的开发者**：按语言、星标、活跃度、许可证筛掉不合适的备选，进详情页读 README、看有没有人维护、能不能商用。
- **在找 AI 工具的人**：对话助手、编程工具、开源模型、AI 社区、MCP / Skills / Agent 与经典论文集中在一个页面里。
- **想离线或装成 App 用的人**：PWA 装到手机 / 电脑，或构建 Tauri 2 原生安装包，离线也能打开。
- **不想注册、不想被追踪的人**：核心功能全部免登录，游客的收藏与设置只保存在自己的浏览器里。
- **想自己部署一份的人**：仓库自带一键启动脚本、GitHub Pages 部署说明与可改的 `site/config.js`。

## 与同类导航站的区别

以下只陈述本仓库实际实现的能力，不与其他项目做性能或数据对比：

| 常见做法 | Orbit 的做法 | 对应章节 |
| --- | --- | --- |
| 一张链接清单，点开就跳走 | 主内容区里的**整页详情**：README、统计、话题、许可证、8 个 GitHub 深链、贡献步骤、同类项目 | [四个整页入口](#四个整页入口) |
| 想看代码必须离开站点 | 站内**源码浏览**：分支切换、文件树、语法高亮、单文件复制 / 下载，提交 / Issues / Releases 按需加载 | [源代码浏览](#源代码浏览readme-与全部源码) |
| 只给链接，不解释怎么用 | 站内**文档中心 11 章 + 6 个内置脚本**、术语小抄、新手 5 分钟上手、常见问题、能力边界 | [目录](#目录)、[看不懂的词？术语小抄](#看不懂的词术语小抄) |
| 收录靠人工维护 | `scripts/fetch-repos.mjs` 用 GitHub Search API 跑 49 组查询自动收录，**每周自动更新**；索引外长尾仓库用 GitHub 全站实时搜索补齐 | [数据是怎么自动更新的](#数据是怎么自动更新的) |
| 只有网页 | 同一份 `site/` 代码同时跑在网页、PWA、Tauri 2 桌面端与手机浏览器 | [一键安装到设备](#一键安装到设备) |
| 强制登录才给用 | 搜索 / 筛选 / 收藏 / 分享 / 源码浏览**全部免登录**，云同步与 GitHub 连接都是可选 | [网站登录](#网站登录邮箱--手机验证码) |
| 代用户操作 GitHub 账号 | 只提供直达 GitHub 官网的入口，Star / Fork / Issue / PR 一律由本人在官网完成；源码浏览全程只读 | [能力边界（说清楚）](#能力边界说清楚) |
| 把「收录全部仓库」当卖点 | 明确说明全量收录做不到，采用「每周高价值收录 + 全站实时搜索」的组合，并写清其他做不到的事 | [能力边界（说清楚）](#能力边界说清楚) |

---

## 目录

- [在线 Demo](#在线-demo)
- [截图](#截图)
- [核心功能](#核心功能)
- [适合谁](#适合谁)
- [与同类导航站的区别](#与同类导航站的区别)
- [30 秒开始用](#30-秒开始用)
- [一键安装到设备](#一键安装到设备)
- [这个站能做什么](#这个站能做什么)
- [四个整页入口](#四个整页入口)
- [交互动效](#交互动效)
- [深度优化：性能与可访问性](#深度优化性能与可访问性)
- [网站登录：邮箱 / 手机验证码](#网站登录邮箱--手机验证码)
- [连接自己的 GitHub 账号](#连接自己的-github-账号)
- [源代码浏览：README 与全部源码](#源代码浏览readme-与全部源码)
- [新手 5 分钟上手](#新手-5-分钟上手)
- [看不懂的词？术语小抄](#看不懂的词术语小抄)
- [部署到 GitHub Pages（免费上线）](#部署到-github-pages免费上线)
- [云服务与域名边界（重要）](#云服务与域名边界重要)
- [数据是怎么自动更新的](#数据是怎么自动更新的)
- [项目里都有什么文件](#项目里都有什么文件)
- [常见问题](#常见问题)
- [能力边界（说清楚）](#能力边界说清楚)
- [命令速查](#命令速查)
- [维护者与开发者联系信息](#维护者与开发者联系信息)
- [贡献指南（社区共同维护）](#贡献指南社区共同维护)
- [License](#license)
- [商业许可（可选）](#商业许可可选)
- [商业许可协议全文](COMMERCIAL-LICENSE.md)

---

## 30 秒开始用

**你只需要装一个 Node.js**（18 或更新版本，[nodejs.org](https://nodejs.org) 下载一路下一步即可）。
除此之外不需要数据库、不需要后端、不需要 GitHub 账号。

| 你的系统 | 怎么做 | 会发生什么 |
| --- | --- | --- |
| Windows | **双击根目录的 `install.bat`** | 自动检查环境 → 启动本地站点 → 打开浏览器 |
| macOS / Linux | 终端里运行 `./install.sh` | 同上 |
| 只想手动试一下 | 双击 `site/index.html` | 直接用浏览器打开，也能看（部分在线功能受限） |
| 不想自动开浏览器 | `node scripts/install.mjs --no-open` | 启动服务，自己复制地址访问 |

启动后浏览器会打开 `http://127.0.0.1:4173/`。按 `Ctrl + C` 停止。

> 💡 想直接看在线版？把项目推到 GitHub 并开启 Pages 即可，见下面的[部署章节](#部署到-github-pages免费上线)。

---

## 一键安装到设备

网页、手机 App、电脑软件用的是**同一份代码、同一个界面**。三种装法任选：

**① 装成 App（最快，推荐）**

- 点网站右上角蓝色的 **「一键安装」** 会打开完整的「下载安装」页面：自动识别设备，并按 Windows / macOS / Linux / Android / iOS / 网页版六个分区列出全部安装方式、步骤与命令。
- Windows / macOS：Chrome 或 Edge 地址栏右侧的「安装」图标。
- Android：Chrome 菜单 → 「安装应用 / 添加到主屏幕」。
- iPhone / iPad：Safari 分享按钮 → 「添加到主屏幕」。
- 装完有独立图标和窗口，支持离线打开，收藏依然在本机。

**② 原生安装包（进阶）**

```bash
# 在 install.bat / install.sh 后面加 --build
install.bat --build        # Windows
./install.sh --build       # macOS / Linux
```

或手动：

```bash
cd desktop
npm install
npm run tauri build
```

产物在 `desktop/src-tauri/target/release/bundle/`：
Windows `.msi` / `.exe`、macOS `.dmg` / `.app`、Linux `.AppImage` / `.deb`。
也可以直接在 GitHub Actions 里运行 **「构建全平台安装包」** 工作流，自动出 Windows / macOS / Linux / Android 四个包。
iOS 需要 Mac + Xcode + 苹果签名，请在本地执行 `npm run ios:build`。

**③ 不安装**：直接访问网址就行，所有功能都不强制登录。

---

## 这个站能做什么

| 板块 | 内容 | 需要登录吗 |
| --- | --- | --- |
| 发现 / 全部仓库 | 自动收录的 **3265 个真实仓库**，可搜索、可按 16 个主题浏览 | 不需要 |
| 星标榜单 / 趋势榜 | 10 万 / 5 万 / 1 万 / 5 千 / 1 千星分层；近 7 / 30 / 90 天仍活跃的项目 | 不需要 |
| 筛选与排序 | 分类、语言、星标区间、最近更新、许可证、6 种排序、网格 / 列表切换 | 不需要 |
| 项目详情 | README 预览、Star/Fork/Issue 数据、许可证、下载 ZIP、复制 clone 命令、Issues / PR / 提交记录直达 | 不需要 |
| AI 导航 | 对话助手、编程工具、图像视频音频、开源模型与平台、效率工具 | 不需要 |
| AI 社区 | Hugging Face、Reddit、中文社区、学术会议与论文站点 | 不需要 |
| 博客 & 论文 | 18 个技术博客、20 篇经典论文（附 arXiv 原文） | 不需要 |
| MCP / Skills / Agent / 开源精选 | 官方规范、目录站、相关开源仓库 | 不需要 |
| 收藏 / 分享 / 最近浏览 | 心形收藏、一键分享、导入导出 JSON | 不需要 |
| 项目完整详情页 | 点卡片进入整页：项目简介、README、统计、话题、许可证、8 个 GitHub 深链、贡献步骤、同类项目 | 不需要 |
| 源代码浏览 | 分支切换、文件树、代码高亮与行号、单文件复制/下载、README、提交 / Issues / Releases | 不需要 |
| 下载安装中心 | Windows / macOS / Linux / Android / iOS / 网页版六个分区，共 15 种安装方式 | 不需要 |
| 站内文档中心 | 11 章完整说明 + 6 个内置脚本可展开查看与复制 | 不需要 |
| 账号中心整页 | 登录、云同步状态、GitHub 连接管理都在一个页面 | 不需要 |
| 新手指南 | 四步上手、术语小抄、与 GitHub 官网的功能对照、常见问题 | 不需要 |
| 搜索 | ⌘K 命令面板（跨仓库 / 分类 / 工具 / 论文）+ GitHub 全站实时搜索 | 不需要 |
| 网站登录 | 邮箱验证码 / 手机短信验证码，真实云服务会话 | 可选 |
| 连接 GitHub 账号 | OAuth 授权（自带 Worker 代理模板）或个人访问令牌 | 可选 |
| 收藏云同步 | 登录后自动写入用户隔离的云端数据表 | 可选 |
| Gist 同步（另一条通道） | 可选连接 GitHub，写入**你自己的私有 Gist** | 可选 |
| 外观 | Apple 风格浅色 / 深色 / 跟随系统 | 不需要 |

---

## 四个整页入口

以前点开功能只弹一个小框，现在全部改成主内容区里的完整页面：

| 整页 | 入口 | 里面有什么 |
| --- | --- | --- |
| **项目详情** | 点任意项目卡片 | 项目简介（不依赖网络）、README 渲染、四项统计、话题与许可证、8 个 GitHub 深链、参与贡献步骤、同类项目、收藏 / 分享 / 源码 / ZIP |
| **下载安装** | 顶栏「一键安装」或侧栏「下载安装」 | 按 Windows / macOS / Linux / Android / iOS / 网页版分区，每区列出系统要求、可用方式、逐步操作、命令、产物；顶部还有平台速查表 |
| **使用文档** | 侧栏「使用文档」 | 把 README 的全部内容做成 11 章站内文档，外加 6 个内置脚本（install.bat、install.sh、cloud-config、OAuth Worker、Pages 工作流、数据库表）可展开查看与复制 |
| **账号中心** | 点右上角头像 | 登录表单（邮箱 / 手机 / GitHub 三页签）、会话与云同步状态、GitHub 连接管理、退出登录、安全说明 |

卡片不再弹右侧小抽屉，安装不再弹小窗，首次访问也改成首页一条内联欢迎条（点开进入完整的新手指南页）。

## 交互动效

动画集中在 `site/assets/js/motion.js` + `site/assets/css/motion.css`，全部用事件委托，不侵入业务代码：

| 动效 | 怎么触发 |
| --- | --- |
| 星形粒子迸发 | 点任意项目的收藏（心形）按钮，从按钮位置迸出彩色星星；取消收藏是冷色 |
| 卡片 3D 微倾 + 鼠标高光 | 鼠标在项目 / 分类 / 工具 / 方法卡片上移动，卡片轻微倾斜并有一圈跟随的高光 |
| 主题切换光波 | 点顶栏月亮按钮，新主题的光从按钮位置扩散开来，图标同时旋转 |
| 统计数字滚动 | 首页四个统计数字进入视口时从 0 滚到目标值，结束时恢复原文本 |
| 搜索提示轮播 | 首页搜索框未聚焦时，placeholder 每隔 3.8 秒淡入淡出换一个示例词 |
| 提示词交错入场 | 首页热门搜索词依次弹起；切换页面时整个内容区淡入上移 |
| 滚动进度条 + 回到顶部 | 顶栏一条渐变进度线；滚过 520px 出现圆形「↑」按钮，点击平滑回顶 |
| 隐藏彩蛋 | 连续点左上角 Logo 5 次，下一场星星雨 ✨ |

**无障碍与性能**：`prefers-reduced-motion: reduce` 下全部关闭；触屏设备不做 3D 倾斜；`pointermove` 用 `requestAnimationFrame` 节流，粒子与彩蛋元素用完即销毁，不常驻 DOM。

## 深度优化：性能与可访问性

这一轮不是调样式，而是改加载链路与底层结构：

| 优化 | 做法 | 实测 |
| --- | --- | --- |
| 仓库索引瘦身 | 3265 个仓库由对象数组改为**列式数组**，`n` / `o` 由 `f` 推导，`core.js` 启动时还原成对象数组（业务代码零改动） | `repos.js` 1444 KB → **1135 KB（-21.4%）** |
| 云服务 SDK 异步 | CDN 脚本从同步 `<script>` 改为动态注入，加载完派发 `orbit:sdk-ready` 通知 `cloud.js` 初始化 | 首屏不再被 71 KB 外部脚本阻塞；SDK 未就绪时登录等待，游客功能照常 |
| 离线缓存分级 | 代码 network-first，`data/` 走 **stale-while-revalidate**；预缓存清单补齐 docs / pages / motion / a11y / robots / sitemap | 重复访问**真实网络传输 0 KB**，`load` 约 490 ms → **84 ms** |
| 可访问性 | 跳转链接、弹层焦点陷阱与焦点恢复、动态图片 `alt` 兜底、`aria-live`、`:focus-visible` 描边 | 审计：图片缺 alt **0/15**、按钮缺名称 **0/39** |
| SEO / 分享 | 每个路由动态写 `description` / OG / canonical；补 JSON-LD、robots.txt、sitemap.xml | 分享卡片显示当前页面而不是首页 |
| 健壮性 | 全局 `error` / `unhandledrejection` 边界，记录最近 30 条并限频提示 | 单个异常不白屏、不刷屏 |

新增 `scripts/perf-audit.mjs`：用无头浏览器分别测「禁用缓存冷启动」与「SW 就绪后重复访问」，输出 FCP / DCL / load、真实传输体积、资源体积排行与可访问性快照，报告写到 `preview/audit.json`。

```bash
node scripts/perf-audit.mjs      # 性能与可访问性审计
node scripts/smoke-test.mjs      # 全量功能自检
```

站内「使用文档」也新增了对应章节，不用翻外部文件。注意：`sitemap.xml` 里的域名是示例，部署到自己的域名后请替换。

## 网站登录：邮箱 / 手机验证码

点**右上角圆形头像**会打开完整的「账号与登录」页面（不是弹窗），页面里有三个页签：

| 页签 | 怎么用 | 说明 |
| --- | --- | --- |
| 邮箱验证码 | 填邮箱 → 获取验证码 → 填入收到的码 → 登录 / 注册 | 新用户验证通过即自动注册，**不需要密码** |
| 手机验证码 | 填 11 位手机号 → 获取短信 → 填码 → 登录 / 注册 | 前端先校验 `1` 开头的 11 位大陆号码，格式不对不发请求 |
| GitHub 账号 | 连接自己的 GitHub，见下一节 | 与网站登录身份相互独立 |

- 验证码由云端发送。发码与校验是两个独立动作：**输错码可以直接重试，不会重复发短信**；60 秒后可重发。
- 登录状态会自动保持，刷新页面不掉；点头像可看账号中心、立即同步、退出登录。
- 登录后，收藏与设置写入云端 `orbit_profiles` 表，由行级安全策略（RLS）按用户隔离，别人读不到你的数据。
- **不登录也能完整使用本站**；游客数据只存在本机。
- ⚠️ 验证码登录必须在该应用的发布域名上使用，本地 `127.0.0.1` 会被来源校验拒绝，详见[云服务与域名边界](#云服务与域名边界重要)。

## 连接自己的 GitHub 账号

「连接 GitHub」用于把你的 GitHub 身份与数据接到本站：显示头像与用户名、把源码接口额度从每小时 60 次提升到 5000 次、读取你有权限的仓库。它**不是**网站账号登录（网站账号用上面的邮箱 / 手机验证码）。

**方式一 · GitHub 授权（OAuth，推荐）**

浏览器不能安全保存 OAuth App 的 `client_secret`，所以项目自带一个免费的 Cloudflare Worker 代理，只负责「授权码换 token」，不存储任何数据。

1. 把 `proxy/github-oauth-worker.js` 部署到 Cloudflare Workers，在环境变量里设置：
   `GITHUB_CLIENT_ID`、`GITHUB_CLIENT_SECRET`（Secret 类型）、`ALLOWED_ORIGIN`、`ALLOWED_REDIRECT_PREFIX`。
2. 在 GitHub → Settings → Developer settings → OAuth Apps 新建应用：
   Homepage URL 填站点根地址，Authorization callback URL 填 `站点根地址 + "?github_oauth=1"`。
3. 把 Worker 地址与 Client ID 填入 `site/cloud-config.js`：
   ```js
   githubOAuth: { clientId: 'Iv1.xxxxxxxx', proxyUrl: 'https://xxx.workers.dev' }
   ```
4. 在登录弹窗「GitHub 账号」页签点「使用 GitHub 账号连接」，跳转授权后自动回到本站。

**方式二 · 个人访问令牌（无需后端，开箱可用）**

GitHub → Settings → Developer settings → Personal access tokens → 创建 fine-grained token，授予**只读**的 Gists 与公开仓库权限，把令牌填进登录弹窗的「访问令牌」输入框即可。令牌只保存在本机浏览器，不会上传到本站服务器。

> Star、Fork、提 Issue、提 PR 等写入操作仍在 GitHub 官网完成，本站不代你操作账号。

## 源代码浏览：README 与全部源码

在任意项目卡片 → 详情抽屉 → **「浏览源代码」**，会打开一个 GitHub 风格的代码页：

- **分支切换**：列出仓库分支，切换后重新读取文件树。
- **文件树 / 路径面包屑 / 按文件名搜索**：点文件夹进入，点文件查看内容。
- **代码查看**：行号、轻量语法高亮（JS/TS/Python/Rust/Go/Java/Shell/JSON 等）、一键复制、下载单文件、在 GitHub 打开原文。
- **README**：进入仓库时自动打开根目录 README，Markdown 直接渲染。
- **提交 / Issues / Releases**：页面底部点「加载最近动态」后才请求，显示最近 8 条提交、开放中的 Issue 与最新 Release，点击直达 GitHub。
- **额度与降级**：打开仓库默认只请求 3 个接口（仓库信息、分支、文件树），动态信息按需加载，尽量省下匿名额度；连接 GitHub 账号后额度从每小时 60 次提升到 5000 次。遇到额度不足或 404 会给出明确提示和「去 GitHub 查看」入口，不会静默失败。

## 新手 5 分钟上手

1. **搜你「想做的事」，不是搜项目名。**
   顶部搜索框输入「本地大模型」「图表」「MCP」「翻译」，或按 `⌘K` / `Ctrl+K` 打开全局搜索。
2. **用筛选缩小范围。**
   左边选分类，再挑语言、星标区间、最近更新时间。
   ⚠️ 星标高只代表人气，不代表一定好用——**配合「最近有提交」一起看更准**。
3. **点开卡片看详情。**
   里面能读 README、看许可证、判断有没有人维护，还有「下载 ZIP」和直达 Issues / PR 的入口。
4. **收下它。**
   点卡片右上角的心形收藏，不用登录。想分享就点「分享」。
   换设备前可在「我的收藏」导出 JSON，或在「设置」里可选连接 GitHub 自动同步。

> 左侧「新手指南」里还有一份**人话术语小抄**，以及「哪些功能本站能做、哪些要去 GitHub 官网做」的对照表。

---

## 看不懂的词？术语小抄

| 词 | 人话解释 |
| --- | --- |
| Star ★ | 给项目点个赞，粗略代表人气 |
| Fork | 把项目复制一份到自己账号下改 |
| Issue | 问题 / 建议记录，看回复快不快能判断有没有人维护 |
| Pull Request (PR) | 你改了代码，请作者合并回去 |
| README | 项目说明书，用之前先读它 |
| License | 许可证，决定能不能商用 |
| Clone | 把代码下载到自己电脑 |
| Topic | 项目贴的标签，本站靠它自动分类 |
| Archived | 已归档 = 作者基本不管了，慎用 |
| MCP | 让 AI 统一连接外部工具 / 数据的开放协议 |
| Skills | 写给 AI Agent 的能力包，一份 `SKILL.md` 就是一个技能 |
| Agent | 会自己规划、调用工具、把事情做完的 AI 程序 |
| PWA | 网页也能装成 App，有独立图标、可离线 |

---

## 部署到 GitHub Pages（免费上线）

**准备好**：一个 GitHub 账号（免费即可）。整个过程不需要买服务器、不需要域名。

### 第 1 步：配置（已完成）

`site/config.js` 已指向真实仓库：

```js
githubUser: 'DaiYiqq',
githubRepo: 'orbit-github-nav',
```

换账号或仓库时改这两行即可；`siteUrl` 留空会自动按当前域名推断。

### 第 2 步：仓库（已创建并推送）

项目已推送到 https://github.com/DaiYiqq/orbit-github-nav 的 `main` 分支。想在别处复刻：

```bash
git clone https://github.com/DaiYiqq/orbit-github-nav.git
cd orbit-github-nav
```

从零重来则是 `git init` → `git add .` → `git commit` → `git branch -M main` → `git remote add origin …` → `git push -u origin main`。

### 第 3 步：Pages（已启用）

仓库已通过 API 启用 **GitHub Pages 传统分支发布**：Source 为 `main` 分支的根目录。仓库根的 `index.html` 会跳到 `./site/`，`.nojekyll` 让 GitHub 跳过 Jekyll 直接托管静态文件，所以**不依赖 Actions 工作流**也能上线；推送 `main` 后稍等片刻即更新。

### 第 4 步：访问

```
https://DaiYiqq.github.io/orbit-github-nav/
```

这就是 GitHub 给你的**二级域名**，永久免费、自带 HTTPS。此外还有一份已发布的同源镜像 `https://orbit-github-nav.app.workbuddy.host/`。

> **关于 GitHub Actions**：本次推送使用的令牌没有 `workflow` scope，因此 `.github/workflows/` 下的 3 个工作流文件没有随仓库提交；完整内容保存在 `docs/github-actions/*.yml.txt`（站内文档中心也能查看）。需要自动更新索引、构建安装包或改用 Actions 部署时，二选一：
> 1. `gh auth refresh -h github.com -s workflow`，然后 `node scripts/push-via-api.mjs --with-workflows` 一键补齐；
> 2. 在 GitHub 网页把备份文件复制回 `.github/workflows/` 并去掉 `.txt` 后缀。
网站、手机 PWA、电脑客户端共用同一份 `site/` 代码，界面一模一样。

> 用了自定义域名？把 `site/config.js` 里的 `siteUrl` 填上即可。

---

## 云服务与域名边界（重要）

本项目已开通 **WorkBuddy 云服务**（应用：Orbit导航站），公开配置写在 `site/cloud-config.js`，只包含允许公开的 `endpoint` / `oauthRelayBaseUrl` / `publishableKey`；服务端密钥不会出现在前端代码里。云数据库中已建好用户隔离表 `orbit_profiles`（收藏、设置、GitHub 连接信息），并启用 RLS 的四条策略：只能读、写、改、删自己的那一行。

**验证码登录绑定应用的发布域名**：服务端会做严格的 Origin 匹配。

| 访问地址 | 游客功能 | 源码浏览 / GitHub 连接 | 邮箱 / 手机验证码登录 |
| --- | --- | --- | --- |
| `http://127.0.0.1:4173`（本地预览） | ✅ | ✅（PAT 方式、公开 API） | ❌ 来源不在允许列表 |
| `https://<用户名>.github.io/<仓库>/`（GitHub Pages） | ✅ | ✅ | ❌ 除非把该域名加入允许列表 |
| 应用保留域名 `https://orbit-github-nav.app.workbuddy.host`（**已发布**） | ✅ | ✅ | ✅ |

本站已用同一个 `applicationId` 发布到应用保留域名，域名与云服务 Origin 完全一致，**邮箱 / 手机验证码登录现在可以真实使用**。首次打开请用发布时生成的分享链接（形如 `https://orbit-github-nav.app.workbuddy.host/?sharecode=xxx`），浏览器会记住访问凭证；最新链接可在应用面板复制。

发布后可用下面这条命令做一次真实浏览器验收（页面渲染、SDK 初始化、云服务来源校验、登录入口）：

```bash
node scripts/check-live.mjs "https://<域名>/?sharecode=xxx"
```

**本地预览可以完整验证界面与交互流程，但真实发短信 / 发邮件、建立会话必须在发布域名上用真实邮箱或手机号完成**——本站不会伪造任何登录态。GitHub Pages 镜像与本地版本依然是功能完整的导航站：搜索、筛选、收藏、源码浏览、PWA 安装、PAT 连接 GitHub 都不受影响。

## 数据是怎么自动更新的

`scripts/fetch-repos.mjs` 会调用 **GitHub 公开 Search API**，按「星标分层 + 语言 + 主题」执行 49 组查询，
去重、精简字段、按规则归类，生成：

- `site/data/repos.js` —— 浏览器直接加载的离线索引
- `site/data/repos.json` —— 给其他工具用
- `site/data/meta.json` —— 更新时间、分类数、语言分布

`.github/workflows/update-data.yml` **每周一自动跑一次**并提交新索引，Pages 会随之更新。
本地想手动刷新：

```bash
node scripts/fetch-repos.mjs
# 有 GitHub token 时额度更高：GITHUB_TOKEN=xxx node scripts/fetch-repos.mjs
```

人工精选的 AI 工具、社区、博客、论文放在 `site/data/catalog.js`，可直接编辑。

---

## 项目里都有什么文件

```
Github导航站/
├── install.bat / install.sh     ← 一键启动（新手先点这个）
├── README.md                   ← 你正在看的这份说明
├── README.en.md                ← 英文精简版
├── CONTRIBUTING.md             ← 社区共同维护：协作约定 / Issue / PR 流程
├── LICENSE                     ← GPL-3.0 许可证全文
├── COMMERCIAL-LICENSE.md       ← 可选商业许可协议（双许可 / 申请流程 / 签署栏）
├── index.html / .nojekyll       ← GitHub Pages 根跳转与静态托管标记
├── docs/
│   ├── GROWTH_PLAYBOOK.md      ← 增长执行手册
│   └── github-actions/         ← 3 个工作流文件的 .txt 备份
├── assets/                     ← social-preview.svg（源文件）/ .png（上传用）
├── preview/                    ← 桌面 / 手机预览图
├── proxy/
│   └── github-oauth-worker.js  ← GitHub OAuth 交换代理（Cloudflare Worker 模板）
├── site/                       ← 网站本体（GitHub Pages 就部署这个目录）
│   ├── index.html              ← 页面骨架
│   ├── config.js               ← 部署配置（用户名、仓库名）
│   ├── cloud-config.js         ← 云服务公开配置 + GitHub OAuth 开关
│   ├── manifest.webmanifest    ← PWA 安装清单
│   ├── sw.js                   ← 离线缓存
│   ├── assets/js/
│   │   ├── cloud.js            ← 云服务：邮箱/手机验证码、会话、云数据库
│   │   ├── auth-ui.js          ← 登录表单（挂在账号整页里）
│   │   ├── source.js           ← GitHub 源码 API 与语法高亮
│   │   ├── pages.js            ← 四个整页：项目详情 / 下载安装 / 文档 / 账号
│   │   ├── motion.js           ← 交互动画（事件委托，不侵入业务）
│   │   ├── a11y.js             ← 焦点陷阱 / 错误边界 / 无障碍兜底
│   │   └── core/store/views/app.js
│   ├── assets/css/
│   │   ├── app.css             ← Apple 风格样式
│   │   └── motion.css          ← 动画关键帧与降级规则
│   ├── robots.txt / sitemap.xml ← SEO（部署后替换域名）
│   └── data/
│       ├── repos.js             ← 列式仓库索引（启动时还原）
│       ├── catalog.js           ← 人工精选内容
│       └── docs.js              ← 站内文档与内置脚本原文
├── scripts/
│   ├── install.mjs             ← 一键启动脚本
│   ├── fetch-repos.mjs         ← 自动收录 GitHub 仓库
│   ├── gen-icons.py            ← 生成全套图标（纯 Python 标准库）
│   ├── smoke-test.mjs          ← 一键自检（渲染 + 交互 + 截图）
│   ├── check-live.mjs          ← 线上站点真实浏览器验收
│   ├── perf-audit.mjs          ← 性能 / 可访问性审计（preview/audit.json）
│   └── push-via-api.mjs        ← 网络受限时通过 GitHub API 推送的备用通道
├── desktop/                    ← Tauri 2 桌面 / 移动端原生工程
│   ├── dev-server.mjs          ← 零依赖本地静态服务
│   └── src-tauri/              ← Rust 配置、图标、窗口权限
└── .github/workflows/
    ├── update-data.yml         ← 每周自动更新仓库索引
    ├── deploy-pages.yml        ← 自动部署 GitHub Pages
    └── build-desktop.yml       ← 构建全平台安装包
```

改代码后想确认没改坏：

```bash
node scripts/smoke-test.mjs
```

它会自动检查 15 个页面渲染、11 个子页面、搜索 / 筛选 / 收藏 / 主题 / 抽屉 / 命令面板 / 响应式，并生成 `preview/` 下的截图。

---

## 常见问题

**Q：需要登录吗？**
A：完全不用。搜索、筛选、收藏、分享、源码浏览都能直接用。只有「收藏跨设备云同步」需要可选的邮箱 / 手机验证码登录；「连接 GitHub 账号」也是可选的，用于提升 API 额度与识别身份。

**Q：本地预览点「获取验证码」为什么报错？**
A：云服务会校验请求的来源域名，本地 `127.0.0.1` 和 GitHub Pages 都不在允许列表里。界面与交互可以正常验证，真实发码要在应用发布域名上进行，详见[云服务与域名边界](#云服务与域名边界重要)。

**Q：收不到验证码 / 提示额度不足？**
A：先确认邮箱或手机号填写正确、60 秒冷却结束后再重发；若提示发送失败，检查云服务管理面板里邮箱 / 短信登录开关是否已开启。本站不会伪造发送成功。

**Q：连接 GitHub 后能直接 Star / 提 PR 吗？**
A：不能，也不应该由第三方站点代你做账号写操作。本站提供一键直达 GitHub 官方页面的入口，请在官网完成。连接 GitHub 带来的是更高读取额度、身份显示与更完整的源码浏览。

**Q：Star 数准吗？**
A：是抓取那一刻的快照，会随时间变化，以 GitHub 页面为准。索引每 7 天自动更新。

**Q：为什么有的项目搜不到？**
A：离线索引收录的是各分类的高价值项目。打开筛选栏的「GitHub 全站」开关，可实时搜索索引之外的长尾仓库（匿名调用每分钟约 10 次）。

**Q：收藏会丢吗？**
A：存在当前浏览器里，不清理浏览器数据就不会丢。换设备前可在「我的收藏」导出 JSON，或开启云同步。

**Q：登录信息怎么同步？**
A：游客数据在本机。可选在「设置 → 账号与同步」里连接 GitHub，收藏与偏好会写入**你自己的私有 Gist**，网站 / 手机 / 桌面端自动同步。令牌只保存在本机，可随时退出清除。

**Q：手机能用吗？**
A：能。同一网址打开会自动变成底部导航，浏览器菜单里「添加到主屏幕」即可当 App 用。

**Q：会读取我的私有仓库吗？**
A：不会。只使用 GitHub 公开 API 的仓库信息（名称、描述、星标、话题等），不碰任何私有内容。

---

## 能力边界（说清楚）

- **「收录 GitHub 上所有仓库」做不到**：GitHub 有数亿仓库，加上 API 限流，任何客户端都无法全量下载。
  Orbit 的做法是「**每周自动收录各分类的高价值项目 + GitHub 全站实时搜索**」，长尾项目照样能搜到。
- **GitHub 账号侧的功能不在本站内完成**：Star、Fork、提 Issue、提 PR、通知、CI 等都需要账号与服务端。
  本站不代你操作账号，而是提供一键直达 GitHub 官方页面的入口——也更安全。源码浏览、README、文件树、提交 / Issues / Releases 全部是**只读**。
- **验证码登录依赖云服务与发布域名**：这是真实会话，不是本地模拟。本地预览和 GitHub Pages 域名会被 Origin 校验拒绝；发布到应用保留域名后才可用，详见[云服务与域名边界](#云服务与域名边界重要)。
- **GitHub OAuth 需要你自己的免费 Worker 与 OAuth App**：因为浏览器不能保存 `client_secret`。模板与步骤已写好，不配置时仍可用访问令牌方式或完全不连接。
- **桌面端安装包没有预编译进仓库**：配置与 Actions 打包流水线已就绪，需要 Rust 工具链本地构建或跑工作流生成；iOS 还需 Apple 签名。

---

## 命令速查

| 想做什么 | 命令 |
| --- | --- |
| 一键启动站点 | `install.bat` / `./install.sh` |
| 启动但不弹浏览器 | `node scripts/install.mjs --no-open` |
| 换端口启动 | `node scripts/install.mjs --port 8080` |
| 额外构建桌面安装包 | `install.bat --build` / `./install.sh --build` |
| 手动更新仓库索引 | `node scripts/fetch-repos.mjs` |
| 重新生成图标 | `python scripts/gen-icons.py` |
| 跑一遍自检 | `node scripts/smoke-test.mjs` |
| 验收线上站点 | `node scripts/check-live.mjs "<分享链接>"` |
| 性能与可访问性审计 | `node scripts/perf-audit.mjs` |

---

**技术栈**：原生 HTML / CSS / JavaScript（无构建、无框架依赖）· GitHub Search API · Web App Manifest + Service Worker · Tauri 2 · GitHub Actions / Pages。
**设计**：Apple 风格（毛玻璃、大留白、柔和圆角、深浅色双主题），桌面侧栏 + 移动底部标签栏。
**数据**：全部来自 GitHub 公开信息；人工精选链接均指向各产品官方站点。

---

## 维护者与开发者联系信息

本项目由**社区共同维护**：讨论、决策与合并都在 [Issues](https://github.com/DaiYiqq/orbit-github-nav/issues) / PR 里公开进行，便于留痕、对所有人可见。下表是项目发起人与公开的补充联系渠道，**日常协作请优先走 Issues / PR**。

| 项目 | 内容 |
| --- | --- |
| 项目发起人 / 维护者 | **戴亿**（GitHub `@DaiYiqq`） |
| 维护方式 | 社区共同维护 · 协作约定见 [CONTRIBUTING.md](CONTRIBUTING.md) |
| GitHub 主页 | https://github.com/DaiYiqq |
| 项目仓库 | https://github.com/DaiYiqq/orbit-github-nav |
| GitHub Pages | https://DaiYiqq.github.io/orbit-github-nav/ |
| Issues（推荐） | https://github.com/DaiYiqq/orbit-github-nav/issues |
| Telegram（个人号） | [@daiyi520](https://t.me/daiyi520) |
| Telegram（频道） | https://t.me/rootlover52 |
| QQ | 1703205607 |

站内还有完整的「维护与联系」整页（侧栏「我的」→「维护与联系」，或直接访问 `#/contact`）：维护方式与许可证、维护者卡片、多种联系渠道、三类填好模板的 Issue 入口（报告问题 / 功能建议 / 申请收录）、项目信息与隐私说明；「使用文档」里也有对应章节。

反馈问题时请附上系统、浏览器、访问地址与复现步骤。本站不收集访客资料，游客的收藏与设置只保存在本机浏览器里。

> 联系方式中 GitHub 主页、项目仓库、Pages、Issues 来自公开资料；Telegram 与 QQ 为开发者主动公开的渠道；未公开的邮箱与个人网站会明确标注，不会编造。

---

## 贡献指南（社区共同维护）

Orbit **由社区共同维护**，不设单一维护者门槛：讨论、决策与合并都在公开的 [Issues](https://github.com/DaiYiqq/orbit-github-nav/issues) / PR 里进行，便于留痕、对所有人都可见。完整的协作约定、Issue 模板用法与 PR 流程见 **[CONTRIBUTING.md](CONTRIBUTING.md)**。

欢迎任何形式的参与，不必先会写代码：

| 想做的事 | 怎么做 |
| --- | --- |
| 报告问题 | 用 [Issues](https://github.com/DaiYiqq/orbit-github-nav/issues/new/choose) 里的「报告问题」模板，附系统、浏览器、访问地址与复现步骤 |
| 提功能建议 | 用「功能建议」模板，说清想解决什么问题、期望的效果 |
| 申请收录项目 | 用「申请收录」模板，贴仓库地址与推荐理由；站内 `#/contact` 也有填好模板的直达入口 |
| 补充人工精选内容 | 编辑 `site/data/catalog.js`（AI 工具、社区、博客、论文），提交 PR |
| 更新仓库索引 | `node scripts/fetch-repos.mjs`；配置 `GITHUB_TOKEN` 可提高额度 |
| 改代码 / 改样式 | Fork 后提交 PR，提交前跑 `node scripts/smoke-test.mjs` 全量自检，改动页面时再跑 `node scripts/perf-audit.mjs` |

几点约定：

- **不要提交任何密钥**：`site/cloud-config.js` 只放允许公开的 `endpoint` / `publishableKey`；OAuth `client_secret`、云服务私钥、个人访问令牌一律不进仓库。
- 源码浏览与 GitHub 连接是**只读**设计，请勿让本站代替用户执行 Star / Fork / Issue / PR 等写操作。
- 保持「免登录可用全部浏览功能」这条底线，不要给搜索、筛选、收藏、源码浏览加登录门槛。
- 新增内容请基于真实存在的仓库、链接与数据，不要编造。

---

## License

本项目采用 **[GNU General Public License v3.0（GPL-3.0）](LICENSE)**，由社区共同维护。

- 你可以自由地运行、学习、修改、复制与再发布本项目（含商业用途），但**衍生作品在分发时也必须采用 GPL-3.0 并提供源代码**，且需保留版权与许可证声明、说明改动。详见 [LICENSE](LICENSE) 全文。
- 提交 Issue / PR 即表示你同意自己的贡献按 GPL-3.0 授权给本项目与所有后续使用者。
- **第三方内容不受本许可证影响**：本站收录的开源项目、博客、论文与外链，其版权与许可证归各自作者所有，本站只做导航与索引，不改变它们的授权条款。使用某个被收录项目前，请查看它自己的许可证。
- 仓库索引数据来自 GitHub 公开 API；人工精选链接指向各产品官方站点。

| 项目 | 内容 |
| --- | --- |
| 许可证 | [GPL-3.0](LICENSE)（SPDX: `GPL-3.0-only`） |
| 版权 | Orbit contributors（社区共同维护，见 [CONTRIBUTING.md](CONTRIBUTING.md)） |
| 商用 | 允许，须遵守 GPL-3.0 的开源与同许可证要求 |
| 闭源商用 | 需要豁免 copyleft 时，可申请[商业许可](COMMERCIAL-LICENSE.md) |

**需要闭源集成 / OEM / 客户交付？** 本项目提供可选的 **[商业许可协议](COMMERCIAL-LICENSE.md)** 作为 GPL-3.0 的替代授权。注意：**GPL-3.0 本身就允许商业使用和收费**，只有当你不希望公开衍生作品源码时才需要申请商业许可，普通使用、自用、按 GPL 开源分发都无需申请、无需付费。详见[商业许可协议](COMMERCIAL-LICENSE.md)第 0 节的场景对照表。

---

## 商业许可（可选）

| 你的场景 | 用哪个授权 |
| --- | --- |
| 自用、内部使用、学习、按 GPL-3.0 开源分发、按 GPL 收费提供服务 | [GPL-3.0](LICENSE)，无需申请 |
| 把 Orbit 集成进闭源产品、交付客户、OEM、不公开衍生作品源码 | [商业许可](COMMERCIAL-LICENSE.md) |

[COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md) 是完整协议文本，包含：授权范围与 copyleft 义务豁免、限制与禁止事项、费用与申请流程、期限与终止、保证免责与责任限制、保密、适用法律与争议解决、签署栏模板，以及社区贡献与第三方内容的权利边界。申请渠道与模板在协议第 12 节。

> 本站收录的第三方项目、博客与论文各自遵循其原许可证，商业许可不覆盖它们；使用前请查看该项目自己的许可证。

---

把「从哪儿找起」变成「按主题、语言、星标和活跃度筛出几个能用的项目，再读 README、看源码、判断有没有人维护」，是 Orbit 想解决的全部问题。它不收集你的资料，也不需要你先注册。

如果这个项目对你有帮助，欢迎点一个 ⭐ Star。
