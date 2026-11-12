/* Orbit · 应用控制器：路由、事件委托、命令面板、安装与同步交互 */
(function (w) {
  'use strict';
  w.__ORBIT_BUILD__ = 'orbit-1.0.0';   // 供自检脚本确认页面加载的是最新版本
  const G = w.GH;
  const V = G.Views;
  const S = V.S;
  const { $, $$, esc, icon, toast, copy, share, openUrl, debounce, siteUrl } = G;
  const CFG = w.__GH_NAV_CONFIG__ || {};
  const Store = G.Store;
  const Cloud = G.Cloud;
  const CS = w.GHCloud;
  const SRC = w.GHSource;
  const PAGES = w.GHPages;
  const DOCS = w.__ORBIT_DOCS__ || { files: [] };
  const PAGE_DESC = {
    discover: '自动收录 3265 个 GitHub 优质仓库，按分类与星标整理，发现值得用的开源项目。',
    repos: '搜索与筛选 GitHub 开源仓库：分类、语言、星标区间、更新时间与许可证。',
    categories: '按 16 个主题浏览 GitHub 开源项目。',
    ranking: '按星标分层浏览 GitHub 高星项目榜单。',
    trending: '查看最近仍有提交的高星 GitHub 项目。',
    guide: '第一次用 GitHub 导航站？四步上手、术语小抄与常见问题。',
    docs: 'Orbit 站内完整文档：登录、GitHub 连接、源码浏览、部署与内置脚本。',
    install: '按 Windows、macOS、Linux、Android、iOS 与网页版分类的下载安装指南。',
    account: '邮箱 / 手机验证码登录、云同步与 GitHub 账号连接。',
    source: '浏览 GitHub 仓库源代码、文件树、README、提交与 Releases。',
    repo: '查看开源项目完整详情、README、统计、许可证与 GitHub 入口。',
    ai: '精选 AI 工具导航：对话、编程、图像、开源模型与效率工具。',
    community: 'AI 与开源社区入口：论坛、讨论区与学术站点。',
    reading: '技术博客与经典论文，含 arXiv 原文链接。',
    favorites: '我收藏的 GitHub 开源项目。',
    settings: '外观、账号同步、数据与关于。',
    contact: '联系 Orbit 开发者：GitHub 主页、Issues 反馈、问题与功能建议入口。',
  };

  let currentRoute = { name: 'discover', param: '' };
  let sourceLoadingFor = '';
  let deferredInstallPrompt = null;
  let lastRemoteQuery = '';
  let cmdkActive = 0;
  let cmdkItems = [];

  /* ── 路由 ─────────────────────────────────────────── */
  function parseHash() {
    const raw = (location.hash || '#/discover').replace(/^#\/?/, '');
    const [pathPart, queryPart] = raw.split('?');
    const parts = pathPart.split('/').filter(Boolean);
    const name = parts[0] || 'discover';
    const param = parts[1] || '';
    const params = new URLSearchParams(queryPart || '');
    return { name, param, params };
  }

  function go(hash) {
    // 通过导航进入仓库库时清空分类筛选；页面内点击分类 chip 走 render()，保留筛选
    if (hash === '#/repos') S.cat = 'all';
    else if (hash.startsWith('#/category/')) S.cat = hash.split('/')[2];
    if (location.hash === hash) { render(); return; }
    location.hash = hash;
  }

  function navIdFor(route) {
    const map = {
      category: 'categories', ranking: 'discover', repos: 'discover', trending: 'discover',
      repo: 'discover', guide: 'settings', docs: 'settings', account: 'settings', contact: 'settings',
    };
    return map[route.name] || route.name;
  }

  function render(opts) {
    opts = opts || {};
    const focusId = opts.keepFocus ? document.activeElement && document.activeElement.id : null;
    const caret = focusId && document.activeElement.selectionStart;
    const scroll = opts.keepScroll ? window.scrollY : 0;

    currentRoute = parseHash();
    const r = currentRoute;
    let html = '', title = '发现', detailRepo = null;

    switch (r.name) {
      case 'discover': html = V.discover(); title = '发现'; break;
      case 'repos':
        S.cat = 'all';
        S.tier = S.tier || 'all';
        html = V.reposPage(); title = '全部仓库'; break;
      case 'category':
        S.cat = r.param; S.page = 1;
        html = V.reposPage({ cat: r.param }); title = (V.CAT_MAP[r.param] || {}).label || '分类'; break;
      case 'categories': html = V.categoriesPage(); title = '分类浏览'; break;
      case 'ranking': html = V.rankingPage(); title = '星标榜单'; break;
      case 'trending': html = V.trendingPage(); title = '趋势榜'; break;
      case 'guide': html = V.guidePage(); title = '新手指南'; break;
      case 'source': {
        const f = r.params.get('repo') || '';
        html = V.sourcePage(f); title = '源代码';
        // 延后到本次渲染结束后再加载，避免递归 render 的结果被外层 innerHTML 覆盖
        if (f && V.S.source.repo !== f && sourceLoadingFor !== f) setTimeout(() => loadSource(f), 0);
        break;
      }
      case 'repo': {
        detailRepo = r.params.get('f') || '';
        html = PAGES.repoDetailPage(detailRepo, V.S.detail); title = '项目详情';
        if (detailRepo && V.S.detail.repo !== detailRepo) setTimeout(() => loadDetail(detailRepo), 0);
        break;
      }
      case 'install': html = PAGES.installCenterPage(); title = '下载安装'; break;
      case 'docs': html = PAGES.docsPage(); title = '使用文档'; break;
      case 'account': html = PAGES.accountPage(); title = '账号与登录'; break;
      case 'contact': html = PAGES.contactPage(); title = '维护与联系'; break;
      case 'ai': html = V.aiNavPage(); title = 'AI 导航'; break;
      case 'community': html = V.communityPage(); title = 'AI 社区'; break;
      case 'reading': html = V.readingPage(); title = '博客 & 论文'; break;
      case 'feature': html = V.featurePage(r.param); title = (V.CATALOG.featured[r.param] || {}).title || '专题'; break;
      case 'favorites': html = V.favoritesPage(); title = '我的收藏'; break;
      case 'settings': html = V.settingsPage(); title = '设置'; break;
      default: html = V.notFound(); title = '页面不存在';
    }

    $('#view').innerHTML = html;
    // 账号页把登录表单挂进整页容器（不是弹窗）
    if (r.name === 'account' && w.GHAuthUI) {
      const initialTab = r.params.get('tab') || (CS.state.user ? 'github' : 'email');
      setTimeout(() => w.GHAuthUI.mountAccountPage(initialTab), 0);
    }
    $('#sidebarNav').innerHTML = V.navHtml(navIdFor(r));
    $('#tabbar').innerHTML = V.tabbarHtml(navIdFor(r));
    $('#footerMeta').textContent = `${G.fmtFull(V.META.count || V.REPOS.length)} 个仓库 · 更新于 ${V.META.updatedAt ? new Date(V.META.updatedAt).toLocaleDateString('zh-CN') : '—'}`;
    document.title = `${title} · Orbit GitHub 导航站`;
    // 每个路由更新描述与分享卡片信息（SPA 不会重新请求 HTML）
    const desc = PAGE_DESC[r.name] || 'Orbit · GitHub 导航站 —— 发现值得用的开源项目。';
    const setAttr = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    setAttr('meta[name="description"]', 'content', desc);
    setAttr('meta[property="og:title"]', 'content', `${title} · Orbit GitHub 导航站`);
    setAttr('meta[property="og:description"]', 'content', desc);
    setAttr('meta[property="og:url"]', 'content', siteUrl() + location.hash);
    setAttr('link[rel="canonical"]', 'href', siteUrl() + location.hash);

    if (opts.keepFocus && focusId) {
      const el = document.getElementById(focusId);
      if (el) { el.focus(); if (caret != null && el.setSelectionRange) { try { el.setSelectionRange(caret, caret); } catch (e) {} } }
    }
    if (opts.keepScroll) window.scrollTo(0, scroll);
    else window.scrollTo({ top: 0, behavior: 'instant' in document.documentElement.style ? 'instant' : 'auto' });

    if (r.name === 'repos' && S.remote && S.q.trim() && S.q.trim() !== lastRemoteQuery) doRemoteSearch(S.q.trim());
  }

  /* ── 抽屉 ─────────────────────────────────────────── */
  function openDrawer(fullName) {
    const r = V.byFullName[fullName] || S.remoteResults.find((x) => x.f === fullName);
    if (!r) {
      // 索引外的收藏：直接打开 GitHub
      openUrl('https://github.com/' + fullName); return;
    }
    S.drawerTab = 'overview';
    $('#drawer').innerHTML = V.drawerHtml(r);
    $('#drawer').classList.add('open');
    $('#drawerScrim').classList.add('open');
    document.body.style.overflow = 'hidden';
    Store.addRecent(fullName);
  }
  function closeDrawer() {
    $('#drawer').classList.remove('open');
    $('#drawerScrim').classList.remove('open');
    document.body.style.overflow = '';
  }

  /** 抽屉内 Tab 切换；切到 README 时才联网读取，避免无谓请求 */
  function switchDrawerTab(tab) {
    S.drawerTab = tab;
    $$('.d-tab').forEach((b) => b.classList.toggle('active', b.dataset.v === tab));
    const panels = { overview: 'dPanelOverview', readme: 'dPanelReadme', contribute: 'dPanelContribute' };
    Object.entries(panels).forEach(([k, id]) => {
      const el = document.getElementById(id);
      if (el) el.hidden = k !== tab;
    });
    if (tab === 'readme') {
      const root = $('#drawer .drawer-inner');
      if (root && root.dataset.repo) loadReadme(root.dataset.repo);
    }
  }

  const README_CACHE = new Map();
  const README_NAMES = ['HEAD/README.md', 'HEAD/readme.md', 'HEAD/README.MD', 'HEAD/README.rst', 'HEAD/README.txt', 'HEAD/README'];

  async function loadReadme(f) {
    const box = $('#dReadme');
    if (!box) return;
    if (README_CACHE.has(f)) { box.innerHTML = README_CACHE.get(f); return; }
    box.innerHTML = '<div class="md-loading">正在读取项目说明书…</div>';
    let html = '';
    for (const name of README_NAMES) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${f}/${name}`);
        if (!res.ok) continue;
        html = G.mdToHtml(await res.text());
        break;
      } catch (e) { /* 换下一个候选文件名 */ }
    }
    if (!html) {
      html = `<div class="empty-state" style="padding:36px 10px"><div class="empty-icon">${icon('book', 40)}</div>
        <h3>这个项目没有 README</h3><p>可以去 GitHub 看看文件列表和讨论区</p>
        <a class="btn btn-sm" href="https://github.com/${esc(f)}" target="_blank" rel="noopener noreferrer">去 GitHub 查看</a></div>`;
    }
    README_CACHE.set(f, html);
    const cur = $('#drawer .drawer-inner');
    const live = $('#dReadme');
    if (live && cur && cur.dataset.repo === f) live.innerHTML = html;
  }

  /* ── 源代码浏览：加载仓库、文件树、文件内容与附加信息 ── */
  async function loadSource(f, force, branchOverride) {
    const s = V.S.source;
    if (!f || !SRC) return;
    if (!force && s.repo === f && s.tree.length && (!branchOverride || branchOverride === s.branch)) return;
    sourceLoadingFor = f;
    Object.assign(s, {
      repo: f, loading: true, error: '', path: '', dir: '', content: '',
      tree: [], branches: [], commits: [], issues: [], releases: [], fileSearch: '',
      extrasLoaded: false, extrasLoading: false,
    });
    if (branchOverride) s.branch = branchOverride;
    if (currentRoute.name === 'source') render({ keepScroll: true });
    try {
      if (!branchOverride) {
        const info = await SRC.repoInfo(f);
        s.info = info;
        s.branch = info.default_branch || 'main';
      }
      const [br, tr] = await Promise.all([
        SRC.branches(f).catch(() => []),
        SRC.tree(f, s.branch),
      ]);
      s.branches = Array.isArray(br) ? br : (br && br.branches) || [];
      if (!s.branches.length) s.branches = [{ name: s.branch }];
      s.tree = (tr && tr.tree) || [];
      s.loading = false;
      sourceLoadingFor = '';
      if (currentRoute.name === 'source') render({ keepScroll: true });
      // 提交 / Issues / Releases 由用户点击「加载最近动态」时才请求，节省匿名额度
      const readme = s.tree.find((x) => x.type !== 'tree' && /^readme(\.(md|mdx|rst|txt))?$/i.test(x.path));
      if (readme) await openSourceFile(readme.path);
    } catch (e) {
      s.loading = false;
      s.error = e.message || '读取失败';
      sourceLoadingFor = '';
      if (currentRoute.name === 'source') render({ keepScroll: true });
    }
  }

  async function openSourceFile(path) {
    const s = V.S.source;
    if (!s.repo || !SRC) return;
    s.loading = true; s.path = path; s.content = ''; s.error = '';
    if (currentRoute.name === 'source') render({ keepScroll: true });
    try { s.content = await SRC.file(s.repo, s.branch, path); }
    catch (e) { s.error = e.message || '读取文件失败'; }
    s.loading = false;
    if (currentRoute.name === 'source') render({ keepScroll: true });
  }

  async function loadSourceExtras(f, branch) {
    const s = V.S.source;
    s.extrasLoading = true;
    if (currentRoute.name === 'source') render({ keepScroll: true });
    const [c, i, r] = await Promise.all([
      SRC.commits(f, branch).catch(() => []),
      SRC.issues(f).catch(() => []),
      SRC.releases(f).catch(() => []),
    ]);
    if (s.repo !== f) { s.extrasLoading = false; return; }
    s.commits = Array.isArray(c) ? c : [];
    s.issues = Array.isArray(i) ? i : [];
    s.releases = Array.isArray(r) ? r : [];
    s.extrasLoaded = true;
    s.extrasLoading = false;
    if (currentRoute.name === 'source') render({ keepScroll: true });
  }

  /* ── 项目完整详情页：README 与动态（按需） ────────── */
  const DETAIL_READMES = ['HEAD/README.md', 'HEAD/readme.md', 'HEAD/README.MD', 'HEAD/README.rst', 'HEAD/README.txt', 'HEAD/README'];

  async function loadDetail(f, force) {
    const d = V.S.detail;
    if (!f) return;
    if (!force && d.repo === f && d.readmeReady) return;
    Object.assign(d, {
      repo: f, loading: true, error: '', readme: '', readmeReady: false,
      commits: [], issues: [], releases: [], extrasLoaded: false, extrasLoading: false,
    });
    if (currentRoute.name === 'repo') render({ keepScroll: true });
    try {
      let text = '';
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        for (const name of DETAIL_READMES) {
          if (controller.signal.aborted) break;
          try {
            const res = await fetch(`https://raw.githubusercontent.com/${f}/${name}`, { signal: controller.signal });
            if (!res.ok) continue;
            text = await res.text();
            break;
          } catch (e) { if (controller.signal.aborted) break; }
        }
      } finally { clearTimeout(timer); }
      if (d.repo !== f) return;
      d.readme = text;
      d.readmeReady = true;
      if (!text) d.error = '读取超时，或这个项目没有 README。';
    } catch (e) {
      d.error = e.message || '读取失败';
    }
    d.loading = false;
    if (d.repo === f && currentRoute.name === 'repo') render({ keepScroll: true });
  }

  async function loadDetailExtras(f) {
    const d = V.S.detail;
    d.extrasLoading = true;
    if (currentRoute.name === 'repo') render({ keepScroll: true });
    const [c, i, r] = await Promise.all([
      SRC.commits(f, 'HEAD').catch(() => []),
      SRC.issues(f).catch(() => []),
      SRC.releases(f).catch(() => []),
    ]);
    if (d.repo !== f) { d.extrasLoading = false; return; }
    d.commits = Array.isArray(c) ? c : [];
    d.issues = Array.isArray(i) ? i : [];
    d.releases = Array.isArray(r) ? r : [];
    d.extrasLoaded = true;
    d.extrasLoading = false;
    if (currentRoute.name === 'repo') render({ keepScroll: true });
  }

  /* ── 云服务：会话、账号展示与收藏同步 ─────────────── */
  function mergeRemoteProfile(remote) {
    if (!remote) return;
    const st = Store.state;
    if (Array.isArray(remote.favorites)) {
      st.favorites = Array.from(new Set(st.favorites.concat(remote.favorites.map(String))));
    }
    if (remote.settings) {
      const theme = st.settings.theme;
      st.settings = Object.assign({}, st.settings, remote.settings, { theme });
    }
    Store.emit('sync-merge');
  }

  async function syncNow(silent) {
    if (!CS.state.user) { if (!silent) toast('请先登录网站账号'); return false; }
    try {
      const remote = await CS.loadProfile();
      mergeRemoteProfile(remote);
      const gh = CS.github();
      await CS.saveProfile({
        favorites: Store.state.favorites,
        settings: { theme: Store.state.settings.theme, view: Store.state.settings.view, sort: Store.state.settings.sort },
        github_login: gh ? gh.login : null,
        github_avatar: gh ? gh.avatar : null,
      });
      if (!silent) toast('云端同步完成');
      return true;
    } catch (e) {
      if (!silent) toast('云同步失败：' + (e.message || '请稍后重试'));
      return false;
    }
  }

  let cloudSyncTimer = null;
  function scheduleCloudSync() {
    if (!CS.state.user) return;
    clearTimeout(cloudSyncTimer);
    cloudSyncTimer = setTimeout(() => {
      CS.saveProfile({
        favorites: Store.state.favorites,
        settings: { theme: Store.state.settings.theme, view: Store.state.settings.view, sort: Store.state.settings.sort },
        github_login: CS.github() ? CS.github().login : null,
        github_avatar: CS.github() ? CS.github().avatar : null,
      }).catch((e) => console.warn('云同步失败', e.message));
    }, 3000);
  }

  function refreshAccount() {
    const user = CS.state.user;
    const gh = CS.github();
    const el = document.getElementById('avatarEl');
    if (el) {
      const pic = gh && gh.avatar ? gh.avatar : user && user.avatarUrl ? user.avatarUrl : '';
      const text = user ? String(user.name || user.email || user.phone || '我').charAt(0).toUpperCase() : gh ? gh.login.charAt(0).toUpperCase() : '游';
      if (pic) {
        if (el.tagName === 'IMG') el.src = pic;
        else el.outerHTML = `<img id="avatarEl" src="${esc(pic)}" alt="账号" style="width:30px;height:30px;border-radius:50%">`;
      } else {
        if (el.tagName === 'IMG') el.outerHTML = `<span class="avatar-guest" id="avatarEl">${esc(text)}</span>`;
        else el.textContent = text;
      }
    }
    Store.syncStatus(user ? '已登录 · 云端同步' : gh ? 'GitHub 已连接 · 本地模式' : '本地模式 · 无需登录');
    if (currentRoute.name === 'settings') render({ keepScroll: true });
  }

  async function afterLogin() {
    refreshAccount();
    await syncNow();
    render();
  }

  /* ── 模态框 ───────────────────────────────────────── */
  function openModal(html) {
    $('#modal').innerHTML = html;
    $('#modalOverlay').classList.add('open');
    const first = $('#modal input, #modal textarea');
    if (first) setTimeout(() => first.focus(), 60);
  }
  function closeModal() { $('#modalOverlay').classList.remove('open'); }

  /* ── 命令面板 ─────────────────────────────────────── */
  function openCmdk(prefill) {
    $('#cmdkOverlay').classList.add('open');
    const input = $('#cmdkInput');
    input.value = prefill || '';
    input.focus(); input.select();
    renderCmdk();
  }
  function closeCmdk() { $('#cmdkOverlay').classList.remove('open'); }

  function renderCmdk() {
    const q = $('#cmdkInput').value;
    const groups = V.cmdkData(q);
    cmdkItems = [];
    let idx = 0;
    const html = groups.map((g) => `<div class="cmdk-group">${esc(g.title)}</div>` + g.items.map((it) => {
      const i = idx++; cmdkItems.push(it);
      return `<div class="cmdk-item ${i === cmdkActive ? 'active' : ''}" data-ci="${i}">
        <span class="ci-icon">${icon(it.icon || 'grid', 15)}</span>
        <span class="ci-text"><b>${esc(it.name)}</b><small>${esc(it.sub || '')}</small></span>
        ${it.star ? `<span class="ci-star">${esc(it.star)}</span>` : ''}
        ${icon('chevron-right', 14)}
      </div>`;
    }).join('')).join('');
    $('#cmdkResults').innerHTML = html || '<div class="empty-state" style="padding:34px"><p>没有匹配结果</p></div>';
    cmdkActive = Math.min(cmdkActive, Math.max(0, cmdkItems.length - 1));
  }

  function execCmdkItem(it) {
    if (!it) return;
    closeCmdk();
    if (it.act === 'repo') { go('#/repo?f=' + encodeURIComponent(it.f)); return; }
    if (it.action === 'remote-search') {
      S.q = it.v; S.remote = true; S.page = 1;
      go('#/repos'); doRemoteSearch(it.v); return;
    }
    if (it.href && /^https?:/.test(it.href)) { openUrl(it.href); return; }
    if (it.href) { go(it.href); return; }
  }

  /* ── GitHub 全站实时搜索 ─────────────────────────── */
  const REMOTE_HEADERS = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'orbit-github-nav',
  };
  if (CFG.githubApiToken) REMOTE_HEADERS.Authorization = 'Bearer ' + CFG.githubApiToken;

  function slimRemote(x) {
    const topics = x.topics || [];
    const text = `${x.full_name} ${x.description || ''} ${topics.join(' ')}`.toLowerCase();
    const cat = [];
    if (/mcp|model-context-protocol/.test(text)) cat.push('mcp');
    if (/agent|autonomous/.test(text)) cat.push('agent');
    if (/skill|prompt/.test(text)) cat.push('skills');
    if (/llm|gpt|ai|machine-learning|diffusion|rag|inference|model/.test(text)) cat.push('ai');
    if (/awesome|tutorial|guide|learning/.test(text)) cat.push('learning');
    if (!cat.length) cat.push('opensource');
    return {
      id: x.id, n: x.name, f: x.full_name, o: x.owner && x.owner.login, d: (x.description || '').slice(0, 260),
      s: x.stargazers_count, fk: x.forks_count, is: x.open_issues_count,
      l: x.language || '', t: topics.slice(0, 10),
      lic: x.license && x.license.spdx_id !== 'NOASSERTION' ? x.license.spdx_id : '',
      p: (x.pushed_at || '').slice(0, 10), c: (x.created_at || '').slice(0, 10),
      h: '', a: x.archived ? 1 : 0, cat, remote: 1,
    };
  }

  async function doRemoteSearch(q) {
    if (!q) { S.remoteResults = []; return; }
    lastRemoteQuery = q;
    S.remoteLoading = true;
    if (currentRoute.name === 'repos' || currentRoute.name === 'category') render({ keepFocus: true, keepScroll: true });
    try {
      const query = `${q} in:name,description,readme stars:>30`;
      const url = 'https://api.github.com/search/repositories?q=' + encodeURIComponent(query) + '&sort=stars&order=desc&per_page=40';
      const res = await fetch(url, { headers: REMOTE_HEADERS });
      if (res.status === 403 || res.status === 429) throw new Error('GitHub API 限流，请稍后再试（匿名每分钟 10 次）');
      if (!res.ok) throw new Error('搜索失败 HTTP ' + res.status);
      const data = await res.json();
      S.remoteResults = (data.items || []).map(slimRemote);
      if (!S.remoteResults.length) toast('全站搜索没有找到相关仓库');
    } catch (e) {
      S.remoteResults = [];
      toast(e.message);
    } finally {
      S.remoteLoading = false;
      if (currentRoute.name === 'repos' || currentRoute.name === 'category') render({ keepFocus: true, keepScroll: true });
    }
  }

  /* ── 账号 / 同步模态框 ───────────────────────────── */
  function connectModal() {
    openModal(`<h3>连接 GitHub 账号</h3>
      <p>可选功能。不登录也完整可用；连接后收藏与偏好会同步到你自己的<b>私有 Gist</b>，网站、手机、桌面端共用。</p>
      <label class="form-label">方式一 · 个人访问令牌（推荐，纯前端可靠）</label>
      <input id="patInput" type="password" placeholder="github_pat_… 或 ghp_…" autocomplete="off">
      <div class="note">在 GitHub → Settings → Developer settings → Personal access tokens 创建 fine-grained token，仅授予 <b>Gists</b> 读写权限。令牌只保存在本机浏览器中，不会发送到除 GitHub API 之外的任何地方。</div>
      <div class="modal-actions"><button class="btn" data-act="close-modal">取消</button>
      <button class="btn btn-primary" data-act="submit-token">连接并同步</button></div>
      ${CFG.oauthClientId ? `<div class="divider"></div>
      <label class="form-label">方式二 · GitHub 设备登录</label>
      <div style="display:flex;gap:8px"><input id="proxyInput" type="text" placeholder="代理地址（可选，解决跨域）" style="flex:1">
      <button class="btn" data-act="device-login">开始登录</button></div>` : `<div class="divider"></div>
      <p style="margin:0;font-size:11px">想用 OAuth 设备登录？在 <b>site/config.js</b> 填写 <b>oauthClientId</b> 后即可启用。</p>`}
    `);
  }

  async function submitToken() {
    const val = ($('#patInput') || {}).value;
    const btn = $('[data-act="submit-token"]');
    if (btn) { btn.disabled = true; btn.textContent = '连接中…'; }
    try {
      await Cloud.connectWithToken(val);
      closeModal();
      updateAccountUI();
      await Cloud.syncNow(true);
      render();
    } catch (e) {
      toast('连接失败：' + e.message);
      if (btn) { btn.disabled = false; btn.textContent = '连接并同步'; }
    }
  }

  async function deviceLogin() {
    const proxy = ($('#proxyInput') || {}).value || '';
    const body = $('#modal');
    try {
      await Cloud.deviceFlow(CFG.oauthClientId, (code, uri, complete) => {
        body.innerHTML = `<h3>在 GitHub 上确认登录</h3>
          <p>打开下方链接，输入这个验证码（已尝试自动打开验证页）：</p>
          <div class="device-code">${esc(code)}</div>
          <button class="btn btn-primary" data-act="open-verify" data-v="${esc(complete || uri)}" style="width:100%">打开验证页面</button>
          <div class="note">确认授权后本页面会自动完成登录，请不要关闭窗口。</div>
          <div class="modal-actions"><button class="btn" data-act="close-modal">取消</button></div>`;
        openUrl(complete || uri);
      }, proxy);
      closeModal(); updateAccountUI(); await Cloud.syncNow(true); render();
      toast('登录成功，已开启跨端同步');
    } catch (e) {
      toast('设备登录失败：' + e.message);
      if (!$('#patInput')) connectModal();
    }
  }

  function importModal() {
    openModal(`<h3>导入收藏</h3>
      <p>粘贴此前导出的 JSON，或选择文件。收藏会与本机数据合并，不会覆盖现有条目。</p>
      <input type="file" id="importFile" accept="application/json,.json" style="height:auto;padding:8px">
      <label class="form-label">或粘贴 JSON</label>
      <textarea id="importText" placeholder='{"favorites":["owner/repo"], ...}'></textarea>
      <div class="modal-actions"><button class="btn" data-act="close-modal">取消</button>
      <button class="btn btn-primary" data-act="submit-import">导入</button></div>`);
    const file = $('#importFile');
    if (file) file.addEventListener('change', () => {
      const f = file.files && file.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => { $('#importText').value = reader.result; };
      reader.readAsText(f);
    });
  }

  function exportData() {
    const blob = new Blob([Store.exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'orbit-favorites-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('收藏已导出');
  }

  function installModal() {
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    openModal(`<h3>把 Orbit 装到设备</h3>
      <p>${standalone ? '当前已经在应用窗口中运行了 🎉' : '一份代码，网站与安装包完全一致。选择你的平台：'}</p>
      <div class="install-grid" style="grid-template-columns:1fr 1fr">
        <div class="install-card"><b>Windows / macOS / Linux</b><p>Chrome 或 Edge 地址栏右侧的「安装」图标；或运行桌面端 Tauri 安装包。</p></div>
        <div class="install-card"><b>Android</b><p>Chrome 菜单 → 安装应用 / 添加到主屏幕。</p></div>
        <div class="install-card"><b>iPhone / iPad</b><p>Safari 分享按钮 → 添加到主屏幕。</p></div>
        <div class="install-card"><b>桌面端原生包</b><p>仓库 desktop/ 目录下的 Tauri 工程，可构建 .msi / .dmg / .AppImage。</p></div>
      </div>
      <div class="modal-actions"><button class="btn" data-act="go-install">查看完整安装说明</button>
      <button class="btn btn-primary" data-act="close-modal">知道了</button></div>`);
  }

  /** 智能一键安装：识别设备，给出最短路径；能直接装就直接装 */
  function smartInstallModal() {
    const p = G.platform();
    const installed = p.standalone || p.tauri;
    const how = p.isIOS
      ? '在 Safari 里点底部「分享」按钮 → 选「添加到主屏幕」→ 完成。桌面图标会立刻出现。'
      : p.isAndroid
        ? '在 Chrome 里点右上角菜单 → 「安装应用」或「添加到主屏幕」。'
        : `在 ${p.browser} 里点地址栏右侧的安装图标，或在菜单里选「安装 Orbit / 保存并分享」。`;
    const buildCmd = buildCommand(p);
    const runCmd = p.os === 'Windows' ? 'install.bat' : './install.sh';
    openModal(`<h3>一键安装 Orbit</h3>
      <p>不用注册、不用编译。下面是根据你当前设备给出的最短路径。</p>
      <div class="smart-platform">
        <span class="sp-icon">${icon('download', 20)}</span>
        <div><b>检测到 ${esc(p.os)} · ${esc(p.browser)}</b>
          <small>${installed ? '当前已经在独立应用窗口中运行' : '安装后拥有独立图标、窗口与离线缓存'}</small></div>
      </div>
      ${installed ? `<div class="callout" style="margin-bottom:12px">${icon('check', 16)} <span>已经装好了 🎉 可以直接开始用，也可以在「安装应用」页看其他平台的方式。</span></div>` : ''}
      <div class="smart-option"><span class="so-num">1</span><div class="so-body"><b>装成 App（推荐）</b><p>${esc(how)}</p></div>
        <button class="btn btn-primary btn-sm" data-act="install-pwa">立即安装</button></div>
      <div class="smart-option"><span class="so-num">2</span><div class="so-body"><b>一键启动脚本（纯本地）</b><p>双击 <b>${esc(runCmd)}</b>，自动启动站点并打开浏览器。</p></div>
        <button class="btn btn-sm" data-act="copy" data-v="${esc(runCmd)}">复制命令</button></div>
      ${p.isMobile ? '' : `<div class="smart-option"><span class="so-num">3</span><div class="so-body"><b>原生桌面安装包</b><p>生成 .msi / .dmg / .AppImage，需要 Rust 工具链。</p></div>
        <button class="btn btn-sm" data-act="copy" data-v="${esc(buildCmd)}">复制命令</button></div>`}
      <div class="note">手机、平板、电脑用的都是同一个网址和同一套数据；收藏可选连接 GitHub 后跨设备同步。</div>
      <div class="modal-actions"><button class="btn" data-act="go-install">完整安装说明</button>
        <button class="btn btn-primary" data-act="close-modal">知道了</button></div>`);
  }

  function buildCommand(p) {
    return p.os === 'Windows' ? 'install.bat --build' : './install.sh --build';
  }

  /** 首次访问的新手引导；也可从「新手指南」页重新打开 */
  function onboardModal() {
    openModal(`<h3>欢迎来到 Orbit 👋</h3>
      <p>把 GitHub 上值得用的开源项目，整理成人能看懂的样子。不用登录，30 秒学会。</p>
      <div class="onboard-steps">
        <div class="onboard-step"><span class="os-n">1</span><div><b>搜想做的事</b><p>顶部搜索框或按 ⌘K，输入「本地大模型」「图表」「MCP」都行。</p></div></div>
        <div class="onboard-step"><span class="os-n">2</span><div><b>筛选 + 看详情</b><p>按分类 / 语言 / 星标 / 最近更新缩小范围，点卡片看 README 和许可证。</p></div></div>
        <div class="onboard-step"><span class="os-n">3</span><div><b>收藏或装到设备</b><p>点心形收藏（不用登录），点右上角「一键安装」把它装成 App。</p></div></div>
      </div>
      <div class="note">看不懂 Star、Fork、Issue、MCP 这些词？左侧「新手指南」里有一份人话术语小抄。</div>
      <div class="modal-actions"><button class="btn" data-act="show-guide">打开新手指南</button>
        <button class="btn btn-primary" data-act="onboard-done">开始逛 →</button></div>`);
  }

  function updateAccountUI() {
    const acc = Store.state.account;
    const el = $('#avatarEl');
    if (acc) {
      if (acc.avatar) { el.outerHTML = `<img id="avatarEl" src="${esc(acc.avatar)}" alt="@${esc(acc.login)}" style="width:30px;height:30px;border-radius:50%">`; }
      else el.textContent = acc.login.charAt(0).toUpperCase();
      Store.syncStatus('已连接 @' + acc.login);
    } else {
      const img = $('#avatarEl');
      if (img && img.tagName === 'IMG') img.outerHTML = '<span class="avatar-guest" id="avatarEl">游</span>';
      Store.syncStatus('本地模式 · 无需登录');
    }
  }

  /* ── 事件委托 ─────────────────────────────────────── */
  function handleAction(act, el, evt) {
    const v = el.dataset.v;
    const f = el.dataset.f;
    // 登录 / GitHub 连接相关动作交给独立的账号 UI 模块
    if (act.indexOf('auth-') === 0 && ['auth-account', 'auth-github-settings', 'auth-sync-settings'].indexOf(act) === -1) {
      return w.GHAuthUI.handle(act, el, evt);
    }
    switch (act) {
      case 'repo': go('#/repo?f=' + encodeURIComponent(f)); break;
      case 'fav': {
        Store.toggleFav(f);
        $$(`[data-act="fav"][data-f="${CSS.escape(f)}"]`).forEach((b) => {
          const on = Store.isFav(f);
          b.classList.toggle('on', on);
          if (b.classList.contains('btn')) {
            b.classList.toggle('faved', on);
            b.innerHTML = icon('heart', 15) + (on ? ' 已收藏' : ' 收藏');
          } else {
            const svg = b.querySelector('svg');
            if (svg) svg.setAttribute('fill', on ? 'currentColor' : 'none');
          }
        });
        if (currentRoute.name === 'favorites') render();
        break;
      }
      case 'share': {
        const r = V.byFullName[f];
        share(r ? r.f + ' · Orbit' : 'Orbit', r ? r.d : '', r ? 'https://github.com/' + r.f : siteUrl() + '/#/discover');
        break;
      }
      case 'copy': copy(v).then(() => toast('已复制到剪贴板')).catch(() => toast('复制失败')); break;
      case 'close-drawer': closeDrawer(); break;
      case 'close-modal': closeModal(); break;
      case 'open-verify': openUrl(v); break;
      case 'install': installPWA(); break;
      case 'share-site': share('Orbit · GitHub 导航站', '发现值得用的开源项目', siteUrl()); break;
      case 'connect': connectModal(); break;
      case 'connect-token': connectModal(); break;
      case 'submit-token': submitToken(); break;
      case 'device-login': deviceLogin(); break;
      case 'sync': Cloud.syncNow().then((ok) => { if (ok) render({ keepScroll: true }); }); break;
      case 'disconnect': Cloud.disconnect(); updateAccountUI(); render(); break;
      case 'export': exportData(); break;
      case 'import': importModal(); break;
      case 'submit-import': {
        const txt = ($('#importText') || {}).value;
        try { Store.importData(txt); closeModal(); render(); } catch (e) { toast('导入失败：' + e.message); }
        break;
      }
      case 'clear-favs':
        openModal(`<h3>清空全部收藏？</h3><p>将移除本机 ${Store.state.favorites.length} 个收藏，此操作不可撤销。建议先导出备份。</p>
          <div class="modal-actions"><button class="btn" data-act="close-modal">取消</button>
          <button class="btn btn-primary" data-act="confirm-clear">确认清空</button></div>`);
        break;
      case 'confirm-clear': Store.clearFavs(); closeModal(); render(); break;
      case 'clear-recent': Store.state.recent = []; Store.emit('recent'); toast('已清除最近浏览'); render(); break;
      case 'go-settings': go('#/settings'); break;
      case 'go-install': closeModal(); go('#/install'); break;
      case 'smart-install': go('#/install'); break;
      case 'install-pwa':
        if (deferredInstallPrompt) { closeModal(); installPWA(); }
        else toast('请按弹窗里的步骤，在浏览器菜单中点「安装 / 添加到主屏幕」');
        break;
      case 'show-onboard': onboardModal(); break;
      case 'onboard-done':
      case 'onboard-never': G.LS.set('orbit:onboarded', true); closeModal(); break;
      case 'show-guide': G.LS.set('orbit:onboarded', true); closeModal(); go('#/guide'); break;
      case 'drawer-tab': switchDrawerTab(v); break;
      case 'trend-days': S.trendDays = Number(v); S.page = 1; render({ keepScroll: true }); break;
      case 'auth-account': go('#/account'); break;
      case 'auth-github-settings': go('#/account?tab=github'); break;
      case 'auth-sync-settings': syncNow(); break;
      case 'dismiss-welcome': {
        G.LS.set('orbit:onboarded', true);
        const bar = document.getElementById('welcomeBar');
        if (bar) bar.remove();
        break;
      }
      case 'detail-reload': loadDetail(V.S.detail.repo, true); break;
      case 'detail-extras': loadDetailExtras(V.S.detail.repo); break;
      case 'install-scroll': {
        const el = document.getElementById(v);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'docs-jump': {
        const el = document.getElementById('doc-' + v);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      }
      case 'docs-file': {
        const pre = document.querySelector(`.fc-body[data-file="${v.replace(/"/g, '')}"]`);
        if (pre) pre.hidden = !pre.hidden;
        break;
      }
      case 'copy-file': {
        const item = (DOCS.files || []).find((x) => x.key === v);
        if (item) copy(item.content).then(() => toast('已复制 ' + item.name)).catch(() => toast('复制失败'));
        break;
      }

      case 'source-open': {
        const s = V.S.source;
        if (el.dataset.type === 'dir') {
          s.dir = v; s.path = ''; s.content = ''; s.error = ''; s.fileSearch = '';
          render({ keepScroll: true });
        } else openSourceFile(v);
        break;
      }
      case 'source-dir': {
        const s = V.S.source;
        s.dir = v; s.path = ''; s.content = ''; s.error = ''; s.fileSearch = '';
        render({ keepScroll: true });
        break;
      }
      case 'source-retry': loadSource(V.S.source.repo, true, V.S.source.branch); break;
      case 'source-extras': loadSourceExtras(V.S.source.repo, V.S.source.branch); break;
      case 'source-copy': copy(V.S.source.content || '').then(() => toast('源代码已复制')).catch(() => toast('复制失败')); break;

      case 'hero-search': {
        S.q = ($('#heroSearch') || {}).value || ''; S.page = 1; S.cat = 'all';
        go('#/repos'); break;
      }
      case 'hint': S.q = v; S.page = 1; S.cat = 'all'; go('#/repos'); break;
      case 'reset-filter':
        Object.assign(S, { q: '', cat: currentRoute.name === 'category' ? currentRoute.param : 'all', lang: 'all', tier: 'all', license: 'all', active: 'all', page: 1, remote: false, sort: 'stars' });
        lastRemoteQuery = ''; S.remoteResults = []; render(); break;
      // 分类用路由表达，避免切换页面后筛选条件残留
      case 'filter-cat':
        S.page = 1;
        if (v === 'all') go('#/repos'); else go('#/category/' + v);
        break;
      case 'filter-tier': S.tier = v; S.page = 1; render({ keepScroll: true }); break;
      case 'jump-tier': S.tier = v; S.cat = 'all'; S.q = ''; S.page = 1; go('#/repos'); break;
      case 'rank-tier': S.rankTier = v; S.page = 1; render({ keepScroll: true }); break;
      case 'reading-tab': S.readingTab = v; render({ keepScroll: true }); break;
      case 'load-more': S.page += 1; render({ keepScroll: true }); break;
      case 'filter-view':
        S.view = v; Store.setSetting('view', v); render({ keepScroll: true }); break;
      default: break;
    }
  }

  document.addEventListener('click', (e) => {
    const actEl = e.target.closest('[data-act]');
    if (actEl) {
      e.preventDefault();
      handleAction(actEl.dataset.act, actEl, e);
      return;
    }
    const ci = e.target.closest('[data-ci]');
    if (ci) { execCmdkItem(cmdkItems[Number(ci.dataset.ci)]); return; }
    if (e.target.id === 'cmdkOverlay') closeCmdk();
    if (e.target.id === 'modalOverlay') closeModal();
    if (e.target.id === 'drawerScrim') closeDrawer();
    if (e.target.id === 'sidebarScrim' || e.target.id === 'menuBtn') toggleSidebar();
    if (e.target.closest('#topSearchBtn')) openCmdk();
    if (e.target.closest('#smartInstallBtn')) go('#/install');
    if (e.target.closest('#guideBtn')) go('#/guide');
    if (e.target.closest('#themeBtn')) {
      const next = Store.state.settings.theme === 'dark' ? 'light' : 'dark';
      Store.setSetting('theme', next);
      if (currentRoute.name === 'settings') render({ keepScroll: true });
    }
    if (e.target.closest('#shareSiteBtn')) share('Orbit · GitHub 导航站', '发现值得用的开源项目', siteUrl());
    if (e.target.closest('#installBtn')) go('#/install');
    if (e.target.closest('#accountBtn')) go('#/account');
    // 移动端点击导航后收起侧栏
    if (e.target.closest('.sidebar .nav-item')) closeSidebar();
  });

  function toggleSidebar() {
    $('#sidebar').classList.toggle('open');
    $('#sidebarScrim').classList.toggle('open');
  }
  function closeSidebar() {
    $('#sidebar').classList.remove('open');
    $('#sidebarScrim').classList.remove('open');
  }

  /* 输入与选择 */
  const onSearchInput = debounce((id, value) => {
    if (id === 'cmdkInput') { cmdkActive = 0; renderCmdk(); return; }
    if (id === 'aiSearch') { filterAiTools(value); return; }
    if (id === 'sourceFileSearch') { V.S.source.fileSearch = value; render({ keepFocus: true, keepScroll: true }); return; }
    if (id === 'repoSearch') {
      S.q = value; S.page = 1;
      render({ keepFocus: true, keepScroll: true });
      if (S.remote && value.trim()) doRemoteSearch(value.trim());
    }
  }, 260);

  document.addEventListener('input', (e) => {
    const id = e.target.id;
    if (['cmdkInput', 'repoSearch', 'aiSearch', 'sourceFileSearch'].includes(id)) onSearchInput(id, e.target.value);
  });

  function filterAiTools(q) {
    const query = q.trim().toLowerCase();
    const groups = $$('#aiGroups > *');
    // 结构为 section-head, tool-grid 交替
    for (let i = 0; i < groups.length; i += 2) {
      const head = groups[i], grid = groups[i + 1];
      if (!grid || !grid.classList.contains('tool-grid')) continue;
      let visible = 0;
      $$('.tool-card', grid).forEach((card) => {
        const ok = !query || card.textContent.toLowerCase().includes(query);
        card.style.display = ok ? '' : 'none';
        if (ok) visible++;
      });
      head.style.display = visible ? '' : 'none';
      grid.style.display = visible ? '' : 'none';
    }
  }

  document.addEventListener('change', (e) => {
    const el = e.target;
    if (el.id === 'remoteToggle') {
      S.remote = el.checked; S.page = 1;
      if (S.remote && S.q.trim()) doRemoteSearch(S.q.trim());
      else if (!S.remote) { S.remoteResults = []; lastRemoteQuery = ''; }
      render({ keepScroll: true });
      return;
    }
    const act = el.dataset.act;
    if (act === 'source-branch') { loadSource(V.S.source.repo, true, el.value); return; }
    if (act === 'filter-lang') { S.lang = el.value; S.page = 1; render({ keepScroll: true }); }
    if (act === 'filter-active') { S.active = el.value; S.page = 1; render({ keepScroll: true }); }
    if (act === 'filter-license') { S.license = el.value; S.page = 1; render({ keepScroll: true }); }
    if (act === 'filter-sort') { S.sort = el.value; Store.setSetting('sort', el.value); S.page = 1; render({ keepScroll: true }); }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmdk(); return; }
    if (e.key === 'Escape') {
      if ($('#cmdkOverlay').classList.contains('open')) closeCmdk();
      else if ($('#modalOverlay').classList.contains('open')) closeModal();
      else if ($('#drawer').classList.contains('open')) closeDrawer();
      else closeSidebar();
      return;
    }
    if ($('#cmdkOverlay').classList.contains('open')) {
      if (e.key === 'ArrowDown') { e.preventDefault(); cmdkActive = Math.min(cmdkActive + 1, cmdkItems.length - 1); renderCmdk(); scrollCmdk(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); cmdkActive = Math.max(cmdkActive - 1, 0); renderCmdk(); scrollCmdk(); }
      if (e.key === 'Enter') { e.preventDefault(); execCmdkItem(cmdkItems[cmdkActive]); }
      return;
    }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault(); openCmdk(); return;
    }
    if (e.key === 'Enter' && document.activeElement.id === 'heroSearch') {
      e.preventDefault(); S.q = document.activeElement.value; S.page = 1; go('#/repos'); return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.classList.contains('repo-card')) {
      e.preventDefault(); openDrawer(document.activeElement.dataset.f);
    }
  });

  function scrollCmdk() {
    const el = $('.cmdk-item.active');
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  /* ── PWA ─────────────────────────────────────────── */
  function installPWA() {
    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      deferredInstallPrompt.userChoice.then((c) => {
        if (c.outcome === 'accepted') toast('安装成功，可从桌面 / 主屏幕打开');
        deferredInstallPrompt = null;
      });
    } else toast('当前浏览器请在菜单里选「安装应用 / 添加到主屏幕」，步骤就在本页');
  }
  w.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstallPrompt = e; });
  w.addEventListener('appinstalled', () => { deferredInstallPrompt = null; toast('Orbit 已安装'); });

  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) {
    w.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch((e) => console.warn('SW 注册失败', e));
    });
  }

  /* ── 启动 ─────────────────────────────────────────── */
  w.GHApp = { openModal, closeModal, afterLogin, refreshAccount, syncNow, render, go };

  w.addEventListener('hashchange', () => {
    // 路由级别的跳转统一重置分类条件，避免从分类页带来残留筛选
    const next = parseHash();
    if (next.name === 'repos') S.cat = 'all';
    else if (next.name === 'category') S.cat = next.param;
    if ($('#drawer').classList.contains('open')) closeDrawer();
    render();
  });
  Store.on((type) => {
    if (type === 'favorites' || type === 'sync-pull' || type === 'import') {
      const nav = $('.nav-item[href="#/favorites"] .nav-count');
      const n = Store.state.favorites.length;
      if (nav) nav.textContent = n;
      else if (n) { const a = $('.nav-item[href="#/favorites"]'); if (a) a.insertAdjacentHTML('beforeend', `<span class="nav-count">${n}</span>`); }
    }
    if (type === 'favorites' || type === 'settings' || type === 'import') scheduleCloudSync();
  });
  CS.on((type) => {
    if (type === 'signed-in' || type === 'signed-out' || type === 'SIGNED_OUT') refreshAccount();
  });
  document.addEventListener('orbit:github-change', () => refreshAccount());

  S.view = Store.state.settings.view || 'grid';
  S.sort = Store.state.settings.sort || 'stars';
  Store.applyTheme();
  CS.init();
  // SDK 异步加载完成后再恢复会话（cloud.js 的同名监听先注册，已完成初始化）
  document.addEventListener('orbit:sdk-ready', () => {
    CS.getSession().then((session) => { if (session) { refreshAccount(); syncNow(true); } }).catch(() => {});
  });
  updateAccountUI();
  refreshAccount();
  if (Store.state.account) Cloud.syncNow(true);
  render();

  // 处理 GitHub OAuth 回调（若本次访问是授权后跳回）
  CS.githubHandleCallback().then((ok) => {
    if (ok) { toast('GitHub 账号已连接'); refreshAccount(); }
  }).catch((e) => toast('GitHub 连接失败：' + (e.message || '请重试')));

  // 恢复云服务会话；游客或 SDK 未加载时静默跳过，绝不伪造登录态
  CS.getSession().then((session) => {
    if (session) { refreshAccount(); syncNow(true); }
  }).catch(() => {});

  // 第一次来时在首页显示一条内联欢迎提示（不是弹窗），点开进入完整的新手指南页
})(window);
