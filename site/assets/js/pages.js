/* Orbit · 整页视图层
 * 项目详情 / 下载安装中心 / 站内文档中心 / 账号中心
 * 这些页面全部渲染在主内容区，取代原先的侧边抽屉与小弹窗。
 */
(function (w) {
  'use strict';
  const G = w.GH;
  const V = w.GH.Views;
  const DOCS = w.__ORBIT_DOCS__ || { chapters: [], files: [] };
  const CFG = w.__GH_NAV_CONFIG__ || {};
  const DEV = CFG.developer || {};
  const CLOUD = w.GHCloud ? w.GHCloud.state : { user: null, github: null, sdkError: '' };
  const { icon, esc, fmtNum, fmtFull, timeAgo, langColor, highlight, domain, platform } = G;
  const REPOS = V.REPOS || [];
  const META = V.META || {};
  const CAT_MAP = V.CAT_MAP || {};
  const byFullName = V.byFullName || {};

  const pageHead = (eyebrow, title, desc) => `<div class="page-head">
    <div class="eyebrow">${esc(eyebrow)}</div><h1>${title}</h1><p>${esc(desc)}</p></div>`;
  const sectionHead = (title, sub) => `<div class="section-head"><div><h2 class="section-title">${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div></div>`;

  function ghLinks(f) {
    const u = 'https://github.com/' + f;
    return [
      ['Star 列表', u + '/stargazers', 'star'], ['Fork 列表', u + '/forks', 'git-fork'],
      ['Issues', u + '/issues', 'issue'], ['Pull requests', u + '/pulls', 'code'],
      ['提交记录', u + '/commits', 'clock'], ['Releases', u + '/releases', 'tag'],
      ['贡献者', u + '/graphs/contributors', 'users'], ['项目 Wiki', u + '/wiki', 'book'],
    ];
  }

  function miniRepo(r) {
    const c = CAT_MAP[(r.cat || [])[0]];
    return `<a class="mini-repo" href="#/repo?f=${encodeURIComponent(r.f)}">
      <div class="mr-top"><b>${esc(r.n)}</b><span>★ ${fmtNum(r.s)}</span></div>
      <p>${esc(r.d || '暂无描述')}</p>
      <div class="mr-foot">${c ? `<span class="tag" style="color:${c.color};border-color:${c.color}44">${esc(c.label)}</span>` : ''}
        ${r.l ? `<span class="tag"><i class="lang-dot" style="background:${langColor(r.l)}"></i>&nbsp;${esc(r.l)}</span>` : ''}</div>
    </a>`;
  }

  /* ═══════════════ 项目完整详情页 ═══════════════ */
  function repoDetailPage(f, d) {
    const r = byFullName[f];
    if (!r) {
      return `${pageHead('项目详情', esc(f || '未指定项目'), '这个项目不在本地索引里，仍可前往 GitHub 查看。')}
        <div class="empty-state"><div class="empty-icon">${icon('github', 44)}</div><h3>索引中没有这个项目</h3>
        <p>可以开启「GitHub 全站」实时搜索，或直接打开它的 GitHub 页面。</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <a class="btn btn-primary" href="https://github.com/${esc(f || '')}" target="_blank" rel="noopener noreferrer">在 GitHub 打开</a>
          <a class="btn" href="#/repos">返回仓库库</a></div></div>`;
    }
    const url = 'https://github.com/' + r.f;
    const zip = 'https://codeload.github.com/' + r.f + '/zip/HEAD';
    const cats = (r.cat || []).map((k) => CAT_MAP[k]).filter(Boolean);
    const faved = G.Store.isFav(r.f);
    const related = REPOS.filter((x) => x.f !== r.f && (x.cat || []).some((c) => (r.cat || []).includes(c))).slice(0, 6);

    const intro = `<div class="detail-intro">
        <h3>${icon('info', 17)} 项目简介</h3>
        <p>${esc(r.d || '这个项目没有填写描述，可以先看下方的信息栏与 GitHub 链接。')}</p>
        <div class="dh-badges">${cats.map((c) => `<a class="tag" style="color:${c.color};border-color:${c.color}44;background:${c.color}12" href="#/category/${c.slug}">${esc(c.label)}</a>`).join('')}
          ${r.l ? `<span class="tag"><i class="lang-dot" style="background:${langColor(r.l)}"></i>&nbsp;${esc(r.l)}</span>` : ''}
          <span class="tag">★ ${fmtNum(r.s)}</span><span class="tag">更新于 ${timeAgo(r.p)}</span></div>
      </div>`;

    const readme = intro + (d.loading
      ? `<div class="detail-loading">正在读取项目 README…</div>`
      : d.readme
        ? `<div class="md-source">${icon('book', 15)} README · <a href="${esc(url)}#readme" target="_blank" rel="noopener noreferrer">在 GitHub 查看原文 ↗</a></div>
           <div class="detail-md">${G.mdToHtml(d.readme)}</div>`
        : `<div class="empty-state" style="padding:46px 16px"><div class="empty-icon">${icon('book', 40)}</div>
           <h3>暂时没有读到 README</h3><p>${esc(d.error || '这个项目可能没有写 README，或网络暂时不可用。')}</p>
           <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
             <button class="btn btn-primary" data-act="detail-reload">重新读取</button>
             <a class="btn" href="${esc(url)}" target="_blank" rel="noopener noreferrer">去 GitHub 查看</a></div></div>`);

    const extras = !d.extrasLoaded
      ? `<div class="detail-extras-cta"><p>提交、Issues 与 Releases 按需加载，额外请求 3 个 GitHub 公开接口。</p>
          <button class="btn btn-sm" data-act="detail-extras" ${d.extrasLoading ? 'disabled' : ''}>${d.extrasLoading ? '加载中…' : '加载最近动态'}</button></div>`
      : `<div class="source-extra">${[
          { title: '最近提交', icon: 'clock', list: (d.commits || []).map((c) => ({ t: (c.commit && c.commit.message || '').split('\n')[0], u: c.html_url, sub: (c.commit && c.commit.author && c.commit.author.name) || (c.author && c.author.login) || '' })) },
          { title: '开放中的 Issues', icon: 'issue', list: (d.issues || []).map((i) => ({ t: i.title, u: i.html_url, sub: '#' + i.number + ' · ' + ((i.user && i.user.login) || '') })) },
          { title: 'Releases', icon: 'tag', list: (d.releases || []).map((x) => ({ t: x.name || x.tag_name, u: x.html_url, sub: (x.published_at || '').slice(0, 10) })) },
        ].map((g) => `<div class="source-panel"><h3>${icon(g.icon, 16)} ${esc(g.title)}</h3>
          ${g.list.length ? g.list.map((x) => `<a class="source-feed" href="${esc(x.u)}" target="_blank" rel="noopener noreferrer"><span>${esc(x.t)}</span><small>${esc(x.sub)}</small></a>`).join('') : '<p class="muted" style="font-size:11.5px">暂无数据或 API 额度不足</p>'}</div>`).join('')}</div>`;

    return `${pageHead('开源项目 · 完整详情', esc(r.f), r.d || '这个项目没有填写描述。')}
      <div class="detail-hero">
        <div class="dh-top">
          <img class="dh-avatar" src="https://github.com/${esc(r.o)}.png?size=120" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
          <div class="dh-title">
            <div class="dh-badges">
              ${cats.map((c) => `<a class="tag" style="color:${c.color};border-color:${c.color}44;background:${c.color}12" href="#/category/${c.slug}">${esc(c.label)}</a>`).join('')}
              ${r.l ? `<span class="tag"><i class="lang-dot" style="background:${langColor(r.l)}"></i>&nbsp;${esc(r.l)}</span>` : ''}
              ${r.lic ? `<span class="tag">${esc(r.lic)}</span>` : ''}
              ${r.a ? '<span class="tag tag-pink">已归档</span>' : ''}
            </div>
            <div class="dh-owner">由 <b>${esc(r.o)}</b> 维护 · 创建于 ${esc(r.c || '—')} · 最近提交 ${timeAgo(r.p)}</div>
          </div>
        </div>
        <div class="dh-stats">
          <div class="dh-stat"><b style="color:var(--orange)">${fmtNum(r.s)}</b><small>Stars</small></div>
          <div class="dh-stat"><b>${fmtNum(r.fk)}</b><small>Forks</small></div>
          <div class="dh-stat"><b>${fmtNum(r.is)}</b><small>Issues</small></div>
          <div class="dh-stat"><b>${esc(r.c ? r.c.slice(0, 4) : '—')}</b><small>创建年份</small></div>
        </div>
        <div class="dh-actions">
          <a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('github', 15)} 在 GitHub 打开</a>
          <a class="btn" href="#/source?repo=${encodeURIComponent(r.f)}">${icon('code', 15)} 浏览源代码</a>
          <button class="btn ${faved ? 'faved' : ''}" data-act="fav" data-f="${esc(r.f)}">${icon('heart', 15)} ${faved ? '已收藏' : '收藏'}</button>
          <button class="btn" data-act="share" data-f="${esc(r.f)}">${icon('share', 15)} 分享</button>
          <a class="btn btn-ghost" href="${esc(zip)}" target="_blank" rel="noopener noreferrer">${icon('download', 15)} 下载 ZIP</a>
          <button class="btn btn-ghost" data-act="copy" data-v="git clone ${esc(url)}.git">${icon('copy', 15)} 复制 clone</button>
        </div>
      </div>

      <div class="detail-layout">
        <div class="detail-main">
          <div class="panel detail-readme">${readme}</div>
          ${sectionHead('项目动态', '按需加载，节省 GitHub API 额度')}
          ${extras}
          ${related.length ? `${sectionHead('同类项目', '来自相同分类的其他高星项目')}
            <div class="mini-repo-grid">${related.map(miniRepo).join('')}</div>` : ''}
        </div>
        <aside class="detail-side">
          <div class="panel">
            <h3>项目信息</h3>
            <div class="d-meta">
              <div class="d-meta-row"><span>仓库</span><span style="color:var(--blue);word-break:break-all;text-align:right">${esc(r.f)}</span></div>
              <div class="d-meta-row"><span>主要语言</span><span>${esc(r.l || '未标注')}</span></div>
              <div class="d-meta-row"><span>许可证</span><span>${esc(r.lic || '未声明（商用前确认）')}</span></div>
              <div class="d-meta-row"><span>最近提交</span><span>${esc(r.p || '—')}</span></div>
              <div class="d-meta-row"><span>状态</span><span>${r.a ? '已归档（只读）' : '有近期提交'}</span></div>
              ${r.h ? `<div class="d-meta-row"><span>项目主页</span><a href="${esc(r.h)}" target="_blank" rel="noopener noreferrer" style="color:var(--blue)">${esc(domain(r.h))} ↗</a></div>` : ''}
            </div>
            ${r.l ? `<div class="lang-bar" style="margin-top:14px"><span style="width:100%;background:${langColor(r.l)}"></span></div><div class="lang-legend">主要语言：${esc(r.l)}</div>` : ''}
            <div class="dh-topics">${(r.t || []).map((t) => `<span class="tag">#${esc(t)}</span>`).join('') || '<span class="muted" style="font-size:11px">暂无话题标签</span>'}</div>
          </div>
          <div class="panel">
            <h3>像在 GitHub 里继续看</h3>
            <div class="d-links">${ghLinks(r.f).map(([label, href, ic]) => `<a class="d-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${icon(ic, 15)}<span>${esc(label)}</span>${icon('arrow-up-right', 12)}</a>`).join('')}</div>
            <div class="callout" style="margin-top:14px">${icon('info', 15)} <span>Star、Fork、提 Issue / PR 需要 GitHub 账号，点击上方入口到官网完成。</span></div>
          </div>
          <div class="panel">
            <h3>第一次做贡献？</h3>
            <div class="contribute-steps">
              ${[['01', '先读 README 与 CONTRIBUTING'], ['02', '找一张 good first issue'], ['03', 'Fork → 修改 → 提 PR'], ['04', '等反馈并继续迭代']].map(([n, t]) => `<div><b>${n}</b><span>${esc(t)}</span></div>`).join('')}
            </div>
            <a class="btn btn-sm" style="margin-top:14px" href="${esc(url)}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22" target="_blank" rel="noopener noreferrer">${icon('issue', 14)} 找新手任务</a>
          </div>
        </aside>
      </div>`;
  }

  /* ═══════════════ 下载安装中心（按平台分类） ═══════════════ */
  const PLATFORMS = [
    {
      id: 'windows', name: 'Windows', emoji: '🪟', color: '#0A84FF', req: 'Windows 10 / 11 · x64 / ARM64',
      methods: [
        { name: '网页版 PWA', badge: '推荐 · 30 秒', desc: '用 Edge 或 Chrome 打开本站，安装成独立窗口应用，有桌面图标、支持离线。', steps: ['用 Edge / Chrome 打开本站', '点地址栏右侧的「安装」图标，或菜单 →「安装 Orbit」', '确认后即可从开始菜单 / 桌面启动'], cmd: '', action: 'install', actionLabel: '立即安装到本机', artifact: '开始菜单 / 桌面快捷方式' },
        { name: '原生安装包', badge: 'Tauri 2 · 体积小', desc: '基于 Rust 的原生客户端，输出 .msi / .exe，不需要浏览器。', steps: ['安装 Node.js 18+ 与 Rust 工具链', '在项目根目录执行下方命令', '产物在 desktop/src-tauri/target/release/bundle/'], cmd: 'install.bat --build', action: 'copy', artifact: '.msi / .exe（约 5–10 MB）' },
        { name: '一键启动脚本', badge: '纯本地', desc: '不装应用也能用：脚本自动检查环境、启动本地站点、打开浏览器。', steps: ['确保已安装 Node.js 18+', '双击 install.bat', '浏览器会自动打开 http://127.0.0.1:4173/'], cmd: 'install.bat', action: 'copy', artifact: '本地站点（Ctrl + C 停止）' },
      ],
    },
    {
      id: 'macos', name: 'macOS', emoji: '🍎', color: '#8E8E93', req: 'macOS 10.15+ · Apple Silicon / Intel',
      methods: [
        { name: '网页版 PWA', badge: '推荐 · 30 秒', desc: 'Safari、Chrome 或 Edge 都可以装成独立应用，支持离线与全屏。', steps: ['用 Safari / Chrome 打开本站', 'Safari：分享 →「添加到程序坞」；Chrome：地址栏安装图标', '从程序坞 / 启动台打开'], cmd: '', action: 'install', actionLabel: '立即安装到本机', artifact: '程序坞 / 启动台图标' },
        { name: '原生安装包', badge: 'Universal', desc: '构建 .dmg 与 .app，Apple Silicon 与 Intel 都能用。', steps: ['安装 Xcode Command Line Tools 与 Rust', '在项目根目录执行下方命令', '打开生成的 .dmg 拖进应用程序'], cmd: './install.sh --build', action: 'copy', artifact: '.dmg / .app' },
        { name: '一键启动脚本', badge: '纯本地', desc: '终端里一条命令启动本地站点。', steps: ['打开终端并进入项目目录', '赋予执行权限并运行', '浏览器自动打开'], cmd: 'chmod +x install.sh && ./install.sh', action: 'copy', artifact: '本地站点' },
      ],
    },
    {
      id: 'linux', name: 'Linux', emoji: '🐧', color: '#FF9F0A', req: 'Ubuntu / Debian / Fedora · x64 / ARM64',
      methods: [
        { name: '网页版 PWA', badge: '推荐', desc: 'Chrome / Firefox 打开本站即可安装或添加到应用菜单。', steps: ['用 Chrome 打开本站', '地址栏安装图标 → 安装', '从应用菜单启动'], cmd: '', action: 'install', actionLabel: '立即安装到本机', artifact: '应用菜单入口' },
        { name: '原生安装包', badge: 'AppImage / deb', desc: '输出免安装的 .AppImage 与 .deb，需要先装系统依赖。', steps: ['安装 libwebkit2gtk-4.1-dev、libappindicator3-dev、librsvg2-dev、patchelf', '安装 Rust 工具链后执行下方命令', '运行 .AppImage 或安装 .deb'], cmd: './install.sh --build', action: 'copy', artifact: '.AppImage / .deb' },
        { name: '一键启动脚本', badge: '纯本地', desc: '不需要编译，直接起一个本地静态服务。', steps: ['打开终端并进入项目目录', '运行下方命令', '浏览器自动打开'], cmd: 'chmod +x install.sh && ./install.sh', action: 'copy', artifact: '本地站点' },
      ],
    },
    {
      id: 'android', name: 'Android', emoji: '🤖', color: '#34C759', req: 'Android 8+ · Chrome / Edge',
      methods: [
        { name: '网页版 PWA', badge: '推荐', desc: '安装后有独立图标、启动画面与离线缓存，和原生 App 体验接近。', steps: ['用 Chrome 打开本站', '右上角菜单 →「安装应用」或「添加到主屏幕」', '从桌面图标启动'], cmd: '', action: 'install', actionLabel: '立即安装', artifact: '主屏幕图标' },
        { name: '原生 APK', badge: 'Tauri 2', desc: '需要 Android SDK / NDK 与 Java 17，适合想深度定制的用户。', steps: ['配置 Android SDK / NDK 与 Java 17', '执行 npm run android:init', '运行下方命令构建 APK'], cmd: 'cd desktop && npm install && npm run android:build', action: 'copy', artifact: '.apk（需自行签名安装）' },
      ],
    },
    {
      id: 'ios', name: 'iOS / iPadOS', emoji: '📱', color: '#FF375F', req: 'iOS 14+ · Safari',
      methods: [
        { name: '添加到主屏幕', badge: '推荐', desc: 'Safari 里把网站装成独立图标，全屏运行、支持离线，无需 App Store。', steps: ['用 Safari 打开本站', '点底部「分享」按钮', '选「添加到主屏幕」→ 完成'], cmd: '', action: 'install', actionLabel: '查看安装步骤', artifact: '主屏幕图标' },
        { name: '原生 IPA', badge: '需 Apple 签名', desc: '需要 macOS + Xcode + 开发者账号，个人使用建议直接用 PWA。', steps: ['在 Mac 上准备 Xcode 与签名证书', '执行 npm run ios:init', '在 Xcode 里配置签名后构建'], cmd: 'cd desktop && npm install && npm run ios:build', action: 'copy', artifact: '.ipa / TestFlight' },
      ],
    },
    {
      id: 'web', name: '网页版', emoji: '🌐', color: '#7C5CFF', req: '任意现代浏览器 · 无需安装',
      methods: [
        { name: '直接访问', badge: '零安装', desc: '所有功能都不强制安装、不强制登录，打开网址即可使用。', steps: ['打开站点网址', '搜索 / 筛选 / 收藏 / 看源码', '想装到设备再去对应平台分区'], cmd: '', action: 'share-site', actionLabel: '复制网站地址', artifact: '网址' },
        { name: '部署到自己的 GitHub Pages', badge: '免费上线', desc: '把 site/ 目录推到自己的仓库，开启 Pages 后得到免费二级域名。', steps: ['改 site/config.js 里的用户名与仓库名', 'git push 到 GitHub', 'Settings → Pages → GitHub Actions'], cmd: 'git init && git add . && git commit -m "Orbit" && git push -u origin main', action: 'copy', artifact: 'https://<用户名>.github.io/<仓库名>/' },
      ],
    },
  ];

  function installCenterPage() {
    const p = platform();
    const current = /Win/.test(p.os) ? 'windows' : /macOS/.test(p.os) ? 'macos' : /iOS/.test(p.os) ? 'ios' : /Android/.test(p.os) ? 'android' : /Linux/.test(p.os) ? 'linux' : 'web';
    return `${pageHead('下载安装中心', '按你的设备挑一种', '网站、手机与电脑端共用同一套界面与数据。下面按 Windows、macOS、Linux、Android、iOS 与网页版分区，每个平台都列了系统要求、安装方式、详细步骤、命令和产物。')}
      <div class="feature-banner">
        <div class="eyebrow" style="color:rgba(255,255,255,.82)">检测到当前设备</div>
        <h2>${esc(p.os)} · ${esc(p.browser)}</h2>
        <p>推荐先看下方「${esc((PLATFORMS.find((x) => x.id === current) || {}).name || '网页版')}」分区。所有安装方式都不需要账号；原生安装包由命令本地构建或在 GitHub Actions 一键生成，本站不提供来路不明的下载文件。</p>
        <div class="fb-links">${PLATFORMS.map((x) => `<a href="#/install" data-act="install-scroll" data-v="platform-${x.id}">${esc(x.name)}</a>`).join('')}</div>
      </div>

      ${sectionHead('按平台速查', '每格是可用的获取方式', '')}
      <div class="panel" style="padding:0;overflow:hidden">
        <div class="compare-head install-matrix-head"><span>平台</span><span>系统要求</span><span>可用方式</span><span>推荐</span></div>
        ${PLATFORMS.map((x) => `<div class="compare-row install-matrix-row">
          <span><b>${x.emoji} ${esc(x.name)}</b></span><span class="muted">${esc(x.req)}</span>
          <span>${x.methods.map((m) => `<span class="tag" style="margin-right:4px">${esc(m.name)}</span>`).join('')}</span>
          <button class="btn btn-sm" data-act="install-scroll" data-v="platform-${x.id}">查看 →</button>
        </div>`).join('')}
      </div>

      ${PLATFORMS.map((x) => `<section class="platform-section" id="platform-${x.id}">
        <div class="platform-head">
          <span class="platform-emoji" style="background:${x.color}18;color:${x.color}">${x.emoji}</span>
          <div><h2>${esc(x.name)}</h2><p>${esc(x.req)}</p></div>
          ${x.id === current ? '<span class="tag tag-green">你当前的设备</span>' : ''}
        </div>
        <div class="platform-grid">
          ${x.methods.map((m) => `<div class="method-card">
            <div class="mc-head"><b>${esc(m.name)}</b><span class="tag tag-blue">${esc(m.badge)}</span></div>
            <p>${esc(m.desc)}</p>
            <ol class="method-steps">${m.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
            ${m.cmd ? `<div class="code-block">${esc(m.cmd)}</div>` : ''}
            <div class="mc-actions">
              <button class="btn btn-sm ${m.action === 'install' ? 'btn-primary' : ''}" ${m.action === 'copy' ? `data-act="copy" data-v="${esc(m.cmd)}"` : `data-act="${m.action}"`}>${m.action === 'copy' ? icon('copy', 13) : icon('download', 13)} ${esc(m.actionLabel || (m.action === 'copy' ? '复制命令' : '立即安装'))}</button>
              <a class="btn btn-sm btn-ghost" href="#/docs" >查看文档</a>
            </div>
            <div class="mc-artifact">产物：${esc(m.artifact)}</div>
          </div>`).join('')}
        </div>
      </section>`).join('')}

      ${sectionHead('关于下载', '为什么没有现成的 .exe 可点')}
      <div class="panel"><p>仓库里没有预编译的 .exe / .dmg / .apk 文件——这是刻意的：不同系统、不同架构的安装包应由你自己或 GitHub Actions 在受信任环境里构建，避免下载到被篡改的二进制文件。上面每个「原生安装包」卡片都给了可直接复制的构建命令；也可以在仓库的 Actions 里运行「构建全平台安装包」工作流，一次性得到 Windows / macOS / Linux / Android 产物。</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-primary" href="#/docs">打开站内完整文档</a><a class="btn" href="#/guide">新手指南</a></div>
      </div>`;
  }

  /* ═══════════════ 站内文档中心 ═══════════════ */
  function renderBlock(b) {
    switch (b.t) {
      case 'p': return `<p class="docs-p">${esc(b.text)}</p>`;
      case 'list': return `<ul class="docs-list">${b.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
      case 'steps': return `<div class="docs-steps">${b.items.map((x) => `<div class="docs-step"><b>${esc(x.n)}</b><div><strong>${esc(x.t)}</strong><p>${esc(x.d)}</p></div></div>`).join('')}</div>`;
      case 'code': return `<div class="code-block docs-code">${esc(b.text)}</div>`;
      case 'table': {
        const grid = `grid-template-columns:repeat(${b.head.length}, minmax(0, 1fr))`;
        return `<div class="panel" style="padding:0;overflow:hidden"><div class="compare-head" style="${grid}"><span>${b.head.map(esc).join('</span><span>')}</span></div>${b.rows.map((row) => `<div class="compare-row" style="${grid}"><span>${row.map(esc).join('</span><span>')}</span></div>`).join('')}</div>`;
      }
      case 'callout': return `<div class="callout">${icon('info', 16)} <span>${esc(b.text)}</span></div>`;
      case 'links': return `<div class="docs-links">${b.items.map((x) => `<a class="tool-card" href="${esc(x.u)}"><h4>${esc(x.n)} ${icon('arrow-up-right', 13)}</h4><p>${esc(x.d)}</p></a>`).join('')}</div>`;
      default: return '';
    }
  }

  function docsPage() {
    return `${pageHead('站内文档中心', '所有说明都在这里', '快速开始、登录与同步、GitHub 连接、源代码浏览、下载安装、部署上线、数据更新、常见问题、能力边界，以及项目自带脚本的原文——全部内置在网站里，不用翻外部文件。')}
      <div class="docs-layout">
        <aside class="docs-toc">
          <b>目录</b>
          ${DOCS.chapters.map((c) => `<a href="#/docs" data-act="docs-jump" data-v="${esc(c.id)}">${icon(c.icon || 'book', 14)} ${esc(c.title)}</a>`).join('')}
          <a href="#/docs" data-act="docs-jump" data-v="files">${icon('folder', 14)} 内置文件</a>
        </aside>
        <div class="docs-body">
          ${DOCS.chapters.map((c) => `<section class="docs-chapter" id="doc-${esc(c.id)}">
            <h2>${icon(c.icon || 'book', 20)} ${esc(c.title)}</h2>
            ${c.blocks.map(renderBlock).join('')}
          </section>`).join('')}
          <section class="docs-chapter" id="doc-files">
            <h2>${icon('folder', 20)} 内置文件</h2>
            <p class="docs-p">下面这些脚本与配置已内置在网站里，可以直接展开查看或复制到本地。完整的源文件仍然保存在项目目录中。</p>
            <div class="docs-files">
              ${DOCS.files.map((f) => `<div class="file-card">
                <div class="fc-head">
                  <div><b>${esc(f.name)}</b><span>${esc(f.desc)}</span></div>
                  <div class="fc-actions">
                    <button class="btn btn-sm" data-act="docs-file" data-v="${esc(f.key)}">查看内容</button>
                    <button class="btn btn-sm btn-ghost" data-act="copy-file" data-v="${esc(f.key)}">${icon('copy', 13)} 复制</button>
                  </div>
                </div>
                <pre class="fc-body" data-file="${esc(f.key)}" hidden>${esc(f.content)}</pre>
              </div>`).join('')}
            </div>
          </section>
        </div>
      </div>`;
  }

  /* ═══════════════ 账号中心（整页） ═══════════════ */
  function accountPage() {
    const user = CLOUD.user;
    const gh = CLOUD.github;
    const label = user ? (user.name || user.email || user.phone || '已登录用户') : '';
    return `${pageHead('账号与登录', '一个页面管好所有连接', '网站账号用邮箱或手机验证码登录；GitHub 连接用于读取你的 GitHub 身份与数据。两者彼此独立，也都可以不用。')}
      <div class="account-layout">
        <div class="account-main">
          <div class="panel account-status-card">
            <div class="auth-account-row" style="background:transparent;border:0;padding:0;margin-bottom:0">
              <span class="auth-avatar">${user && user.avatarUrl ? `<img src="${esc(user.avatarUrl)}" alt="">` : (user ? esc(label.charAt(0).toUpperCase()) : '游')}</span>
              <div><b>${user ? esc(label) : '游客模式'}</b><small>${user ? '已登录 · 收藏与设置自动云同步' : '无需登录 · 数据保存在本机'}</small></div>
              ${user ? `<button class="btn btn-sm btn-ghost" data-act="auth-logout">${icon('logout', 14)} 退出登录</button>` : ''}
            </div>
          </div>

          <div class="panel">
            <h3>${user ? '管理 GitHub 连接与登录方式' : '登录 / 注册'}</h3>
            <p>${user ? '已登录状态下仍可切换下方页签，连接或断开自己的 GitHub 账号，也可以退出后换一个网站账号。' : '不登录也能完整使用本站。登录后收藏与设置会自动同步到云端，换设备也不丢。'}</p>
            <div id="accountAuthSlot"></div>
          </div>
        </div>
        <aside class="account-side">
          <div class="panel">
            <h3>当前连接</h3>
            <div class="setting-line"><div class="sl-text"><b>网站账号</b><small>${user ? '已登录（云端会话）' : '游客模式'}</small></div><span class="tag ${user ? 'tag-green' : ''}">${user ? '已连接' : '未登录'}</span></div>
            <div class="setting-line"><div class="sl-text"><b>GitHub 账号</b><small>${gh ? '@' + esc(gh.login) + ' · 源码接口额度更高' : '未连接 · 可选'}</small></div><span class="tag ${gh ? 'tag-blue' : ''}">${gh ? '已连接' : '未连接'}</span></div>
            <div class="setting-line"><div class="sl-text"><b>云端收藏同步</b><small>${user ? '收藏与设置跨设备可用' : '登录后可开启'}</small></div>
              <button class="btn btn-sm" data-act="auth-sync-settings" ${user ? '' : 'disabled'}>立即同步</button></div>
          </div>
          <div class="panel">
            <h3>安全说明</h3>
            <ul class="docs-list">
              <li>验证码由云端发送，本站不会伪造发送成功或登录态。</li>
              <li>GitHub 访问令牌只保存在本机浏览器，不上传本站服务器。</li>
              <li>云端数据由行级安全策略按用户隔离，别人读不到你的记录。</li>
              <li>Star、Fork、提 Issue / PR 等写操作仍在 GitHub 官网完成。</li>
            </ul>
          </div>
          <div class="panel">
            <h3>需要帮助？</h3>
            <p>看不懂验证码、OAuth、PWA 这些词？站内文档和新手指南都有人话解释。</p>
            <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-sm" href="#/docs">站内文档</a><a class="btn btn-sm btn-ghost" href="#/guide">新手指南</a></div>
          </div>
        </aside>
      </div>`;
  }

  /* ═══════════════ 联系开发者 ═══════════════ */
  function contactPage() {
    const repo = DEV.repoUrl || 'https://github.com/';
    const issues = DEV.issuesUrl || repo + '/issues';
    const newIssue = (title, labels, body) => `${repo}/issues/new?title=${encodeURIComponent(title)}&labels=${encodeURIComponent(labels)}&body=${encodeURIComponent(body)}`;

    const channels = [
      { ic: 'github', label: 'GitHub 主页', value: '@' + (DEV.github || 'developer'), href: DEV.githubUrl || '', desc: '开发者主页与其它开源项目' },
      { ic: 'code', label: '项目仓库', value: (CFG.githubRepo || 'orbit-github-nav'), href: repo, desc: '源码、提交记录与发布' },
      { ic: 'info', label: 'Issues（推荐）', value: '反馈 / 建议 / 收录申请', href: issues, desc: '最稳妥的公开联系通道，回复可追踪' },
      DEV.email
        ? { ic: 'link', label: '邮箱', value: DEV.email, href: 'mailto:' + DEV.email, desc: '直接邮件联系' }
        : { ic: 'link', label: '邮箱', value: '未公开', href: '', desc: '账号未公开邮箱，请用 Issues 联系' },
      DEV.site
        ? { ic: 'link', label: '个人网站', value: DEV.site.replace(/^https?:\/\//, ''), href: DEV.site, desc: '开发者个人主页' }
        : { ic: 'link', label: '个人网站', value: '未公开', href: '', desc: '可在 site/config.js 里补充' },
    ];

    const feedback = [
      { ic: 'info', title: '报告问题', desc: '页面异常、搜索结果不对、安装失败等，请附环境与复现步骤。', url: newIssue('[Bug] 问题简述', 'bug', '**问题描述**\n\n**复现步骤**\n1.\n2.\n\n**环境**（系统 / 浏览器 / 访问地址）\n\n**截图**（可选）') },
      { ic: 'star', title: '功能建议', desc: '想加分类、筛选维度、动效或新的页面，欢迎提想法。', url: newIssue('[Feature] 建议简述', 'enhancement', '**想解决什么问题**\n\n**期望的效果**\n\n**其它补充**') },
      { ic: 'code', title: '申请收录', desc: '发现值得收录但索引里没有的仓库，贴链接与推荐理由。', url: newIssue('[Repo] owner/repo', 'data', '**仓库地址**\nhttps://github.com/owner/repo\n\n**推荐理由**\n\n**建议归类**') },
    ];

    return `${pageHead('联系开发者', '找到作者，也找到反馈入口', '这个页面只使用 GitHub 公开资料；未公开的联系方式会明确标注「未公开」，不会编造。')}
      <div class="contact-hero">
        <img class="contact-avatar" src="${esc(DEV.avatar || '')}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <div class="contact-identity">
          <div class="eyebrow">开发者</div>
          <h2>${esc(DEV.name || DEV.github || 'Orbit 开发者')}</h2>
          <p class="contact-handle">@${esc(DEV.github || '')} · GitHub</p>
          <p>${esc(DEV.note || '欢迎反馈问题与建议。')}</p>
          <div class="dh-actions" style="margin-top:14px">
            <a class="btn btn-primary" href="${esc(DEV.githubUrl || '#')}" target="_blank" rel="noopener noreferrer">${icon('github', 15)} 访问 GitHub 主页</a>
            <a class="btn" href="${esc(issues)}" target="_blank" rel="noopener noreferrer">${icon('info', 15)} 打开 Issues</a>
          </div>
        </div>
      </div>

      ${sectionHead('联系方式', '公开渠道优先', '')}
      <div class="contact-grid">
        ${channels.map((c) => `<${c.href ? 'a' : 'div'} class="contact-card" ${c.href ? `href="${esc(c.href)}" ${/^https?:/.test(c.href) ? 'target="_blank" rel="noopener noreferrer"' : ''}` : ''}>
          <span class="cc-icon">${icon(c.ic, 19)}</span>
          <b>${esc(c.label)}</b><strong>${esc(c.value)}</strong><small>${esc(c.desc)}</small>
        </${c.href ? 'a' : 'div'}>`).join('')}
      </div>

      ${sectionHead('按类型反馈', '点开就是填好模板的 Issue', '')}
      <div class="feedback-grid">
        ${feedback.map((f) => `<a class="feedback-card" href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">
          <span class="fb-icon">${icon(f.ic, 20)}</span><h3>${esc(f.title)}</h3><p>${esc(f.desc)}</p>
          <span class="link-more">去提 Issue ${icon('arrow-right', 13)}</span></a>`).join('')}
      </div>

      <div class="contact-notes">
        <div class="panel">
          <h3>项目信息</h3>
          <div class="d-meta">
            <div class="d-meta-row"><span>仓库</span><a href="${esc(repo)}" target="_blank" rel="noopener noreferrer" style="color:var(--blue)">${esc((CFG.githubUser || '') + '/' + (CFG.githubRepo || ''))} ↗</a></div>
            <div class="d-meta-row"><span>GitHub Pages</span><a href="https://${esc(CFG.githubUser || '')}.github.io/${esc(CFG.githubRepo || '')}/" target="_blank" rel="noopener noreferrer" style="color:var(--blue)">${esc(CFG.githubUser || '')}.github.io ↗</a></div>
            <div class="d-meta-row"><span>索引更新</span><span>${new Date((META.updatedAt || Date.now())).toLocaleDateString('zh-CN')}</span></div>
            <div class="d-meta-row"><span>许可证</span><span>未声明 · 商用前请先通过 Issues 联系</span></div>
          </div>
        </div>
        <div class="panel">
          <h3>隐私与数据</h3>
          <ul class="docs-list">
            <li>这里的联系信息全部来自 GitHub 公开资料，没有私人邮箱或手机号。</li>
            <li>本站不收集访客资料；游客的收藏与设置只保存在你自己的浏览器里。</li>
            <li>想补充邮箱 / 个人网站，改 <b>site/config.js</b> 的 <b>developer</b> 配置即可，页面会自动显示。</li>
          </ul>
          <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-sm" href="#/docs">站内文档</a><a class="btn btn-sm btn-ghost" href="#/settings">设置</a></div>
        </div>
      </div>`;
  }

  w.GHPages = { repoDetailPage, installCenterPage, docsPage, accountPage, contactPage, PLATFORMS };
})(window);
