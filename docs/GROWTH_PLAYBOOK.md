# Orbit · 增长执行手册（Growth Playbook）

本手册只讲「做什么、什么时候做、怎么写、怎么量、怎么复盘」。所有对外文案都放在代码块里，可直接复制。

**事实边界（写文案前先读一遍）**：只能引用仓库里真实存在的内容 —— 项目名称、定位、功能、`preview/` 下已有的截图文件、仓库自带的两个在线地址。不编造用户评价、Demo 数据、收录链接、Star 数量或第三方平台的具体网址；平台一律写「类型 + 自己搜索」，不贴未经验证的链接。所有数字都用「填实测值」占位，发布前从 GitHub Insights 等处读取后填入。

---

## 1. Awesome Lists 提交清单

先用下面的关键词在 GitHub 搜索候选清单仓库，再按筛选标准决定是否提交。**这里只给关键词和筛选标准，不列举具体仓库链接** —— 清单变动很快，以你自己搜到的实时结果为准。

搜索关键词（8–12 个，直接复制到 GitHub 搜索框）：

```
github awesome chinese resources
awesome developer tools list
awesome ai tools curated
awesome open source discovery
github repo navigation list
awesome self-hosted tools
awesome mcp servers
awesome productivity tools
awesome web app directory
awesome beginner friendly repos
awesome curated list chinese
```

筛选标准（逐条打勾，满足 ≥6 条才提交）：

```
[ ] 最近 6 个月有提交，不是已归档/已停止维护
[ ] CONTRIBUTING 或 README 里写明了收录标准与 PR 格式
[ ] 接受外部 PR，且近期有合并过新条目的记录
[ ] 条目按主题分组，本站能落到明确的一节（导航 / 开发者工具 / AI 工具 / 中文资源）
[ ] 条目格式是「名称 + 一句话说明 + 链接」，不要求额外徽章或截图
[ ] 清单本身不要求被收录项目达到某个 Star 门槛（若有门槛，先记下门槛值，达标后再提）
[ ] 清单允许中文项目或中文说明
[ ] 维护者对 PR 有回应（看近 3 个月 PR 的响应时间）
[ ] 清单的 License 允许被 Fork / 引用
[ ] 提交前先搜过清单里是否已有同类条目，避免重复
```

提交 PR 的通用文案模板（把尖括号内容替换成实测值，不写编造数字）：

```
标题：Add Orbit — a Chinese GitHub repository navigation site

正文：
Hi, I'd like to add Orbit to <清单里的具体小节名>.

- What it is: Orbit is a Chinese-language GitHub navigation site that
  automatically collects, categorizes and star-tiers open-source
  repositories, plus AI tools, MCP/Skills/Agent resources, communities,
  blogs and papers.
- Why it fits this section: <用一句话说明与本节主题的关系>
- No account or build step is required to browse; all core features work
  anonymously.
- Repo: https://github.com/DaiYiqq/orbit-github-nav
- Live: https://DaiYiqq.github.io/orbit-github-nav/

The project is actively maintained and the index is refreshed on a weekly
schedule. Happy to adjust the wording or move it to another section.
```

---

## 2. 导航站 / 产品收录平台清单

按「平台类型」去找，**不写具体网址**（平台域名与提交入口会变，自行搜索确认后再提交）。每种类型给一段可直接复制的提交文案。

| 平台类型 | 找什么 | 提交前确认 |
| --- | --- | --- |
| 中文技术导航 / 网址导航站 | 「开发者资源」「开源项目」分类 | 是否收个人项目、是否需要备案域名 |
| 开源项目目录 / 工具目录站 | 按语言或主题分类的开源工具库 | 是否需要英文简介、是否自动同步 GitHub |
| AI 工具收录站 | AI 工具 / 开源模型分类 | 是否要求工具本身可在线试用 |
| PWA / Web App 展示目录 | 可安装的 Web 应用分类 | 是否要求 manifest 与截图 |
| 独立开发者作品社区 | 作品发布 / 作品集板块 | 是否接受社区维护、GPL-3.0 授权的项目 |
| 技术周刊 / 月刊的读者投稿 | 「项目推荐」栏目 | 投稿格式与截稿时间 |
| 产品发布 / 新品榜类平台 | 每日新产品发布 | 是否需要英文、是否要求首发 |
| 技术社区的 Show / 分享节点 | 自建项目展示帖 | 发帖规则、是否允许自荐 |

短版提交文案（100 字以内，用于表单的「一句话介绍」）：

```
Orbit · GitHub 导航站：自动收录并按星标分层整理开源项目，把 AI 工具、
MCP/Skills/Agent、技术社区、博客与论文放进同一个页面。免登录、免安装，
打开就能搜索、筛选、读 README 和浏览源码。
```

长版提交文案（用于「项目详情 / 介绍」字段）：

```
项目名：Orbit · GitHub 导航站
分类：开发者工具 / 开源项目导航
一句话定位：面向新手与开发者的中文 GitHub 导航站，解决「项目太多、
不知道从哪儿找起」的问题。

核心能力：
- 收录 3265 个真实仓库，按 16 个主题组织，支持分类、语言、星标区间、
  最近更新、许可证筛选与 6 种排序；
- 星标分层与近 7/30/90 天活跃趋势；
- 项目整页详情：README 渲染、统计、许可证、下载 ZIP、clone 命令、
  8 个 GitHub 深链、贡献步骤与同类项目；
- 站内源码浏览：分支切换、文件树、代码高亮、单文件复制 / 下载；
- AI 工具 / 社区 / MCP / Skills / Agent / 博客 / 论文导航；
- ⌘K 命令面板 + GitHub 全站实时搜索补齐长尾仓库；
- 收藏、分享、JSON 导入导出，可选登录后云同步；
- 网页 / PWA / Tauri 2 桌面端 / 手机共用一份代码，浅色 / 深色主题。

特点：全部浏览功能免登录；游客数据只留在本机浏览器；源码浏览只读，
Star / Fork / Issue / PR 一律回 GitHub 官网完成。

在线地址：https://DaiYiqq.github.io/orbit-github-nav/
应用镜像：https://orbit-github-nav.app.workbuddy.host/
仓库：https://github.com/DaiYiqq/orbit-github-nav
配图：preview/desktop.png、preview/mobile.png
```

---

## 3. 社区文案模板

发布前统一检查：把 `<...>` 占位内容替换成实测值；配图只用 `preview/` 下真实存在的截图；不写任何编造的用户数、评价、Star 数或第三方链接。

### 3.1 V2EX

```
标题：[分享创造] 写了个 GitHub 导航站，想让新手不用会命令行也能找到合适的项目

正文：
做一个小东西的动机很朴素：GitHub 上项目太多，想找个能用的库，
往往不知道从哪儿开始搜，搜出来也不知道有没有人维护。

Orbit 做的事：
1. 用 GitHub Search API 自动收录仓库，按主题分类、按星标分层，
   每周自动更新；索引外的长尾仓库可以走 GitHub 全站实时搜索。
2. 点开项目是一整页详情：README 直接渲染、Star/Fork/Issue、
   许可证、下载 ZIP、clone 命令，还有到 Issues / PR / 提交的深链。
3. 站内能直接看源码：切分支、点文件树、带行号高亮、单文件下载。
4. 顺手把 AI 工具、MCP / Skills / Agent、技术社区、博客和论文
   也放进了同一个导航里。
5. 全部浏览功能免登录，收藏只存在自己浏览器里；想跨设备同步
   才需要可选的验证码登录。

技术上没用框架和构建工具，原生 HTML/CSS/JS + Service Worker，
也可以装成 PWA，或用 Tauri 2 打桌面包。
有一个专门的「能力边界」章节写清楚了做不到的事，比如不会全量收录
GitHub，也不会代替大家在官网点 Star。

在线：https://DaiYiqq.github.io/orbit-github-nav/
仓库：https://github.com/DaiYiqq/orbit-github-nav
欢迎拍砖，尤其是筛选维度和分类规则上的建议。

标签：分享创造 / GitHub / 开源 / 开发者工具
配图建议：preview/desktop.png（桌面首页）；如节点允许补图，再加 preview/detail.png
发布注意事项：
- 发到「分享创造」节点，标题不要带宣传语或感叹号；
- 正文保持「我做了什么 / 为什么 / 怎么做」的叙述，不放求 Star 的话；
- 有人提问题就在楼里如实回答，不知道的直说不知道；
- 不要在同一节点重复开帖，也不要去无关帖子下面贴链接。
```

### 3.2 掘金

```
标题：用原生 JS 做了一个 GitHub 导航站：把「找项目」这件事拆成 4 步

正文：
前言：新手找开源项目最常见的卡点不是不会用命令行，而是不知道该搜什么词、
搜出来之后怎么判断项目还活着、能不能商用。

一、整体结构
站点是纯静态 SPA，没有构建步骤：原生 HTML / CSS / JavaScript，
仓库索引由 scripts/fetch-repos.mjs 调用 GitHub Search API 生成，
按列式数组存成 site/data/repos.js，运行时再还原成对象数组。
服务工作线程负责离线缓存，代码走 network-first、数据走
stale-while-revalidate。

二、找项目的 4 步
1. 按想做的事搜，而不是按项目名搜（⌘K 命令面板跨仓库 / 分类 / 工具 / 论文）。
2. 用分类 + 语言 + 星标区间 + 最近更新 + 许可证缩小范围；
   星标高只代表人气，配合「最近有提交」一起看更准。
3. 进项目整页：README 渲染、统计、话题、许可证、8 个 GitHub 深链、
   贡献步骤、同类项目。
4. 想看实现就切到站内源码浏览：分支、文件树、语法高亮、单文件下载。

三、几个实现取舍
- 索引外的长尾仓库不做全量抓取，改用 GitHub 全站实时搜索补；
- 源码浏览全程只读，Star / Fork / Issue / PR 都回官网完成；
- 云服务 SDK 改成异步注入，不阻塞首屏；游客功能不依赖登录；
- 动效用事件委托挂在 document 上，跟随 SPA 重渲染，不侵入业务代码；
- prefers-reduced-motion 下全部关闭。

四、可复用的一点
把「说明文档」也做进站点里：站内文档中心 + 术语小抄 + 新手 5 分钟上手，
比让人跳去读 README 更容易留下来。

仓库：https://github.com/DaiYiqq/orbit-github-nav
在线：https://DaiYiqq.github.io/orbit-github-nav/

标签：前端 / JavaScript / GitHub / 开源 / PWA
配图建议：preview/desktop.png 作封面，正文插 preview/detail.png、preview/install.png
发布注意事项：
- 以技术取舍为主，先讲实现再提项目，不要写成产品介绍；
- 截图用仓库里真实存在的 preview/ 文件，不要放合成图或伪造数据图；
- 文章里出现的性能数字如需引用，请以 scripts/perf-audit.mjs 的实测输出为准；
- 评论区的技术问题当天回复，不删差评。
```

### 3.3 Reddit

```
Subreddit: r/opensource, r/webdev, or a relevant language community
(先读各版规则，只在允许 self-promotion 的版块 / 固定帖里发)

Title: I built a no-build, no-signup GitHub navigation site for finding repos

Body:
Hi all — I kept running into the same problem: searching GitHub for a
library gives you a wall of results, and it's hard to tell at a glance
whether something is maintained, licensed for your use, or even what it
does.

So I put together Orbit, a static site (vanilla HTML/CSS/JS, no framework,
no build step) that:

- indexes 3265 real repos with a script hitting the GitHub Search API,
  grouped into 16 topics, with star tiers and 7/30/90-day activity trends;
- lets you filter by category, language, star range, last update and
  license, with 6 sort orders;
- opens each project as a full page: rendered README, stars/forks/issues,
  license, ZIP download, clone command, deep links to issues/PRs/commits;
- includes an in-site source browser (branches, file tree, highlighting,
  per-file download);
- also covers AI tools, MCP/Skills/Agent resources, communities, blogs
  and papers;
- has a command palette plus live GitHub-wide search for repos outside
  the offline index.

Everything browseable works anonymously — no account, and guest data
stays in your local browser. Source browsing is read-only; starring,
forking and opening issues still happen on github.com. There's also a
page that spells out what the tool cannot do (it does not index every
repo on GitHub).

Repo: https://github.com/DaiYiqq/orbit-github-nav
Live: https://DaiYiqq.github.io/orbit-github-nav/

I'd appreciate feedback on the filtering dimensions and the taxonomy.
If self-promo isn't appropriate here, please let me know and I'll remove it.

Tags / flair: Show & Tell / Open Source / Tool
Image: preview/desktop.png (one screenshot only)
Notes:
- Read each subreddit's self-promotion rule first; many only allow it in
  a designated weekly thread.
- Disclose that you are the author in the first line.
- Answer technical questions in the thread; don't drop a link and leave.
- No vote asks, no cross-posting the same text to many subs on the same day.
```

### 3.4 X / Twitter

```
Post (thread, 3 tweets):

1/
I built Orbit — a GitHub navigation site for people who don't know where
to start looking. 3265 repos, 16 topics, star tiers, README + source
browser in one page. No signup, no build step.
🧵

2/
What's inside: filters by language / stars / license / activity, a full
project page with 8 deep links into GitHub, a command palette, AI tools
and MCP/Skills/Agent picks, PWA + Tauri 2 desktop. Guest data stays local.

3/
It also has a page that honestly lists what it can't do (no full GitHub
mirror, no account write actions). Repo + live demo 👇
https://github.com/DaiYiqq/orbit-github-nav
https://DaiYiqq.github.io/orbit-github-nav/

Hashtags: #opensource #github #webdev #buildinpublic
Image: preview/desktop.png on tweet 1; preview/mobile.png on tweet 2
Notes:
- Disclose authorship; no engagement bait, no "RT if..." phrases.
- Don't tag large accounts that haven't asked; don't post the same thread
  multiple times a day.
- Keep the link in the last tweet of the thread, not in every tweet.
```

### 3.5 Product Hunt

```
Name: Orbit — GitHub Navigation
Tagline (≤60 chars): Find the right open-source project without guessing

First comment / maker note:
Hey PH 👋 I'm DaiYi, the maker of Orbit.

The problem I kept having: GitHub has hundreds of millions of repos, and
searching for a library gives you results but not context — is it
maintained, what's the license, what does it actually do.

Orbit indexes 3265 real repos via the GitHub Search API, groups them into
16 topics and star tiers, and adds 7/30/90-day activity trends. Each
project opens as a full page with a rendered README, stats, license, ZIP
download, clone command and 8 deep links into GitHub. There's also an
in-site source browser (branches, file tree, highlighting) and a command
palette; repos outside the index are covered by live GitHub-wide search.

It also collects AI tools, MCP/Skills/Agent resources, communities, blogs
and papers. Everything browseable works without an account, guest data
stays in the local browser, and it's a PWA you can install.

I'd love feedback on the taxonomy and the filtering dimensions. Happy to
answer anything about the no-build vanilla-JS setup or the weekly
auto-refresh pipeline.

Gallery: preview/desktop.png, preview/detail.png, preview/install.png,
         preview/mobile.png (all real screenshots from the repo)
Topics/tags: Developer Tools, Open Source, GitHub, Productivity
Notes:
- Use only real screenshots from preview/; don't mock up UI that doesn't exist.
- Don't ask for upvotes in the post or in comments; answer questions instead.
- Check the launch-day rules and disclose that you are the maker.
- Don't claim user counts, ratings or press mentions that don't exist.
```

### 3.6 Hacker News · Show HN

```
Title: Show HN: Orbit – a no-build GitHub navigation site with an in-site source browser

Text:
Hi HN, I built Orbit, a static navigation site for GitHub repos. It's
vanilla HTML/CSS/JS with no build step and no framework.

The part I spent the most time on isn't the list, it's the context around
each result. A script (scripts/fetch-repos.mjs) runs 49 GitHub Search API
queries, dedupes and classifies the results into a columnar offline index
(3265 repos, 16 topics), with star tiers and 7/30/90-day activity trends.
A weekly workflow refreshes it. Repos outside the index are covered by
live GitHub-wide search rather than pretending to be a full mirror.

Clicking a project opens a full page: rendered README, stars/forks/issues,
license, ZIP download, clone command, 8 deep links, contribution steps and
related projects. There's also an in-site source browser — branch switch,
file tree, lightweight syntax highlighting, per-file copy/download — and
commits/issues/releases load only on demand to save the anonymous API
quota.

Design choices that might be interesting:
- All browsing works anonymously; the optional sign-in exists only for
  cross-device sync of favorites.
- Source browsing is strictly read-only; Star/Fork/Issue/PR stay on github.com.
- The cloud SDK is injected async so it doesn't block first paint.
- Service worker: network-first for code, stale-while-revalidate for data.
- There's an explicit "what this cannot do" page instead of overclaiming.

Repo: https://github.com/DaiYiqq/orbit-github-nav
Live: https://DaiYiqq.github.io/orbit-github-nav/

I'd be glad to hear criticism on the ranking/taxonomy heuristics and on
whether an offline index plus live search is the right tradeoff.

Tags: Show HN (title prefix only; HN has no tags)
Image: HN is text-only — no image in the post; link preview/desktop.png in
       a comment only if someone asks for a screenshot.
Notes:
- Use the "Show HN" prefix and keep the title factual, no superlatives.
- Be transparent that you are the author; respond to technical criticism
  directly and don't argue about taste.
- Don't ask for votes, don't submit the same project twice within a short
  window, and don't solicit upvotes from friends or groups.
```

---

## 4. 30 天推广日历（每周 ≤3 小时）

按周排块，每块都写清耗时上限。总原则：一次只做一个渠道，发完看数据再决定下周做不做第二个，避免同时铺开。

```
第 1 周（合计 ≤3h）：准备与收录清单
  - 0.5h  核对 README / README.en.md 的 Demo 链接与截图是否都真实可用
  - 0.5h  在仓库 Settings → Social preview → Edit → Upload an image 上传
          assets/social-preview.png（1280×640 PNG，<1MB；SVG 是设计源文件，
          GitHub 不接受 SVG 作为社交预览图，务必用 PNG）
  - 1.0h  用第 1 节的关键词搜候选 Awesome Lists，按筛选标准打分，
          选 2–3 个最匹配的
  - 1.0h  提交 1–2 个 PR，按模板写文案，记下提交日期与 PR 状态

第 2 周（合计 ≤3h）：中文社区
  - 0.5h  整理一次「本周动作 + 实测数据」记录（见第 6 节模板）
  - 1.0h  发 V2EX「分享创造」（用 3.1 文案），当天回复评论
  - 1.0h  发掘金技术文（用 3.2 文案），按评论补一段 FAQ
  - 0.5h  跟进去看第 1 周 PR 是否被合并；被拒就按反馈改文案，不重复提交

第 3 周（合计 ≤3h）：英文社区
  - 0.5h  读目标 subreddit / 社区的 self-promotion 规则，确认可发
  - 1.0h  Reddit 与 X/Twitter 各发一次（3.3 / 3.4），不同天发
  - 1.0h  Hacker News Show HN（3.6），发帖后 2 小时内守着回评论
  - 0.5h  记录每个渠道带来的 Referrers 与 Issues

第 4 周（合计 ≤3h）：目录平台与复盘
  - 1.0h  按第 2 节平台类型挑 2 个，用短版 / 长版文案提交
  - 0.5h  Product Hunt 素材准备（3.5，真实截图 + maker note）
  - 1.0h  汇总 30 天指标（第 5 节），写一次完整复盘（第 6 节）
  - 0.5h  决定下月：保留 1–2 个有效渠道，砍掉无转化的渠道

第 29–30 天（含在第 4 周内，不额外加时）
  - 更新 README 里过时的描述；把有效文案沉淀进本手册
  - 不做集中补发，不为了「凑满 30 天」而多发
```

---

## 5. 指标跟踪表

数据来源与口径（先确认能拿到再填，拿不到就写「未采集」，不要估算）：

```
Views        → 仓库 Insights → Traffic → Views（含 Unique visitors）
Clones       → 仓库 Insights → Traffic → Clones
Stars        → 仓库页 Star 数（记录期末值与周增量）
Forks        → 仓库页 Fork 数
Referrers    → 仓库 Insights → Traffic → Referring sites（判断哪个渠道有效）
Issues       → 本周新增 Issue 数 / 关闭数（区分真实反馈与无关内容）
Demo 点击来源 → 以 Referrers + 各平台自带的出站点击统计为准；
              若平台不提供，就写「未采集」，不要推算
```

每周记录表（复制后按周填实测值）：

```
| 周次 | Views | Unique | Clones | Stars(期末/周增) | Forks | Top Referrers | 新增 Issues | Demo 点击来源 | 本周主要动作 |
|------|-------|--------|--------|------------------|-------|---------------|-------------|---------------|--------------|
| W1   |       |        |        |                  |       |               |             |               |              |
| W2   |       |        |        |                  |       |               |             |               |              |
| W3   |       |        |        |                  |       |               |             |               |              |
| W4   |       |        |        |                  |       |               |             |               |              |
```

判断口径（避免自欺）：

```
- View 涨但 Star 不涨：先检查落地页是否把「项目能解决什么」说清楚了，
  再考虑换文案，不要靠多发帖解决。
- Referrer 集中在一个渠道：下周把时间压到这个渠道，其余先停。
- Issue 变多但都是无关内容：说明文案定位偏了，改标题而不是改功能。
- 任何指标都不要用「估算」「大约」填表；没数据就写「未采集」。
```

---

## 6. 每周复盘模板

复制整块，每周五花 20 分钟填完：

```
【第 N 周复盘】

一、本周动作
- 做了什么（渠道 / 平台类型 / 发布时间）：
- 实际耗时（计划 vs 实际）：
- 有没有偏离第 4 节日历，为什么：

二、带来流量
- Views / Unique / Clones（填实测值）：
- Top Referrers 前 3 个：
- Demo 点击来源（有则填，无则写「未采集」）：

三、Star 转化
- 期末 Star 数 / 本周增量：
- 转化判断（哪个渠道带来了 Star，依据是什么）：
- 如果只是收藏没转化，原因猜测（待下周验证）：

四、有效渠道
- 有效（继续）：
- 待观察（再给一周）：
- 无效（停）：

五、收到的反馈
- Issues / 评论里最有价值的一条：
- 需要改仓库内容的地方（README / 文档 / 文案）：

六、下周决定
- 砍掉：
- 加上：
- 只做一件事的话，是：

七、事实核对
[ ] 本周对外内容没有出现编造的数字、评价、收录链接或截图
[ ] 引用的截图都来自 preview/ 下真实存在的文件
[ ] 没有刷 Star / 买 Star / 互星 / 群发 / 硬广行为
```

---

## 7. 禁止事项清单

以下任何一条都不要做，也不要外包给别人做：

```
[禁止] 刷 Star（脚本、小号、自动化、设备农场）
[禁止] 买 Star / 付费刷量 / 任何形式的 Star 交易
[禁止] 互星群、互赞群、互关群、互相点 Star 的「互助」安排
[禁止] 垃圾群发：批量私信、批量 @、无关帖子下贴链接、跨版重复刷帖
[禁止] 硬广：正文先喊「求 Star」「求支持」「求关注」，或把 CTA
       放在价值说明之前
[禁止] 编造数据：虚构用户数、下载量、Star 数、增长率、性能提升百分比
[禁止] 编造用户评价、推荐语、媒体报道、获奖或收录记录
[禁止] 编造或猜测第三方平台的收录链接、Demo 截图、界面效果图
[禁止] 使用伪造截图 / 合成 UI 冒充真实产品界面
[禁止] 冒充他人身份投稿，或在未披露作者身份的情况下自荐
[禁止] 为了让数据好看而 force push、改写历史、删除负面 Issue
```

替代做法：把时间放在「把 README 说清楚、把文案写具体、把真实反馈改掉」上。结尾 CTA 只在讲完价值之后出现一次，文案为「如果这个项目对你有帮助，欢迎点一个 ⭐ Star。」

---

## 8. 附：本手册引用的仓库事实（发布前核对）

```
项目名：Orbit · GitHub 导航站
仓库：https://github.com/DaiYiqq/orbit-github-nav
许可证：GPL-3.0（LICENSE，SPDX GPL-3.0-only）+ 可选商业许可（COMMERCIAL-LICENSE.md）
        注：GPL-3.0 已允许商用，商业许可仅为需要闭源/豁免 copyleft 的场景提供
维护方式：社区共同维护（CONTRIBUTING.md）
协作文档：CONTRIBUTING.md、COMMERCIAL-LICENSE.md
签署版模板：docs/COMMERCIAL_AGREEMENT_TEMPLATE.md（中文为准）、
          docs/COMMERCIAL_AGREEMENT_TEMPLATE.en.md（英文对照）
          注：模板为空白可填写格式，填写后的签署版属私密商业文件，不进公开仓库
在线地址：https://DaiYiqq.github.io/orbit-github-nav/
应用镜像：https://orbit-github-nav.app.workbuddy.host/
协作文档：CONTRIBUTING.md、README.md「贡献指南（社区共同维护）」
真实截图：preview/desktop.png、preview/mobile.png、preview/detail.png、
          preview/install.png、preview/motion.png
Social Preview：assets/social-preview.svg（设计源文件，1280×640）、
          assets/social-preview.png（由图渲染的上传用 PNG，GitHub 只接受
          PNG/JPG/GIF 且 <1MB，切勿直接上传 SVG）
技术栈：原生 HTML/CSS/JS（无构建）、GitHub Search API、PWA + Service Worker、
        Tauri 2、GitHub Pages / Actions
功能依据：README.md「核心功能」「这个站能做什么」「能力边界（说清楚）」
文档：docs/、站内文档中心
验证脚本：scripts/smoke-test.mjs、scripts/perf-audit.mjs
```

所有文案里的数字、链接、截图都以上面这份清单和仓库实际内容为准；清单里没有的，就不要写进去。
