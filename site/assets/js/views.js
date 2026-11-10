/* Orbit · 视图渲染层：所有页面都产出 HTML 字符串，事件由 app.js 统一委托 */
(function (w) {
  'use strict';
  const G = w.GH;
  const { icon, esc, fmtNum, fmtFull, timeAgo, langColor, highlight, domain } = G;
  const CFG = w.__GH_NAV_CONFIG__ || {};
  const CATALOG = w.__GH_NAV_CATALOG__ || {};
  const SRC = w.GHSource || {
    listDir: () => [], formatSize: (n) => String(n || 0) + ' B',
    fileKind: () => ({ kind: 'code', icon: 'code', color: '#7C5CFF' }),
    renderCode: (c) => `<pre>${esc(c)}</pre>`,
  };
  const CLOUD = w.GHCloud ? w.GHCloud.state : { user: null, github: null, sdkError: '' };
  const REPOS = w.__GH_NAV_REPOS__ || [];
  const META = w.__GH_NAV_META__ || { categories: [], languages: [], count: 0, updatedAt: new Date().toISOString() };
  const CATEGORIES = (META.categories && META.categories.length ? META.categories : CATALOG.categories) || [];
  const TIERS = CATALOG.tiers || [];
  const CAT_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));
  const byFullName = Object.fromEntries(REPOS.map((r) => [r.f, r]));

  const S = {
    q: '', cat: 'all', lang: 'all', tier: 'all', sort: 'stars', view: 'grid',
    page: 1, perPage: 24, license: 'all', active: 'all', remote: false,
    rankTier: '100k', readingTab: 'papers', remoteResults: [], remoteLoading: false,
    trendDays: 30, drawerTab: 'overview',
    source: {
      repo: '', branch: '', branches: [], tree: [], dir: '', path: '', content: '',
      loading: false, error: '', info: null, commits: [], issues: [], releases: [], fileSearch: '',
      extrasLoaded: false, extrasLoading: false,
    },
    detail: {
      repo: '', readme: '', readmeReady: false, loading: false, error: '',
      commits: [], issues: [], releases: [], extrasLoaded: false, extrasLoading: false,
    },
  };

  const NAV = [
    { group: '发现', items: [
      { id: 'discover', label: '发现', icon: 'compass', href: '#/discover' },
      { id: 'repos', label: '全部仓库', icon: 'grid', href: '#/repos' },
      { id: 'categories', label: '分类浏览', icon: 'layers', href: '#/categories' },
      { id: 'ranking', label: '星标榜单', icon: 'star', href: '#/ranking' },
      { id: 'trending', label: '趋势榜', icon: 'flame', href: '#/trending' },
    ]},
    { group: 'AI 专区', items: [
      { id: 'ai', label: 'AI 导航', icon: 'sparkles', href: '#/ai', badge: 'AI' },
      { id: 'community', label: 'AI 社区', icon: 'users', href: '#/community' },
      { id: 'reading', label: '博客 & 论文', icon: 'book', href: '#/reading' },
    ]},
    { group: '专题', items: [
      { id: 'mcp', label: 'MCP 生态', icon: 'plug', href: '#/feature/mcp' },
      { id: 'skills', label: 'Skills 技能包', icon: 'blocks', href: '#/feature/skills' },
      { id: 'agent', label: 'AI Agent', icon: 'bot', href: '#/feature/agent' },
      { id: 'opensource', label: '开源精选', icon: 'heart', href: '#/feature/opensource' },
    ]},
    { group: '新手上路', items: [
      { id: 'guide', label: '新手指南', icon: 'info', href: '#/guide' },
      { id: 'install', label: '下载安装', icon: 'download', href: '#/install' },
      { id: 'docs', label: '使用文档', icon: 'book', href: '#/docs' },
    ]},
    { group: '我的', items: [
      { id: 'account', label: '账号与登录', icon: 'user', href: '#/account' },
      { id: 'favorites', label: '我的收藏', icon: 'heart', href: '#/favorites', count: true },
      { id: 'settings', label: '设置', icon: 'settings', href: '#/settings' },
      { id: 'contact', label: '联系开发者', icon: 'link', href: '#/contact' },
    ]},
  ];

  const TABS = [
    { id: 'discover', label: '发现', icon: 'compass', href: '#/discover' },
    { id: 'categories', label: '分类', icon: 'layers', href: '#/categories' },
    { id: 'ai', label: 'AI', icon: 'sparkles', href: '#/ai' },
    { id: 'favorites', label: '收藏', icon: 'heart', href: '#/favorites' },
    { id: 'settings', label: '我的', icon: 'user', href: '#/settings' },
  ];

  /* ── 通用片段 ─────────────────────────────────────── */
  function navHtml(active) {
    const favCount = w.GH.Store.state.favorites.length;
    return NAV.map((g) => `
      <div class="nav-group">
        <div class="nav-group-title">${esc(g.group)}</div>
        ${g.items.map((it) => `
          <a class="nav-item ${active === it.id ? 'active' : ''}" href="${it.href}">
            <span class="nav-icon">${icon(it.icon)}</span>
            <span>${esc(it.label)}</span>
            ${it.badge ? `<span class="nav-badge">${esc(it.badge)}</span>` : ''}
            ${it.count && favCount ? `<span class="nav-count">${favCount}</span>` : ''}
          </a>`).join('')}
      </div>`).join('');
  }

  function tabbarHtml(active) {
    const map = { repos: 'discover', ranking: 'discover', category: 'categories', community: 'ai', reading: 'ai', feature: 'ai' };
    const cur = map[active] || active;
    return TABS.map((t) => `
      <a href="${t.href}" class="${cur === t.id ? 'active' : ''}">
        ${icon(t.icon, 21)}<span>${esc(t.label)}</span>
      </a>`).join('');
  }

  function pageHead(eyebrow, title, desc, extra) {
    return `<div class="page-head">
      <div class="eyebrow">${esc(eyebrow)}</div>
      <h1>${title}</h1>
      <p>${esc(desc)}</p>
      ${extra || ''}
    </div>`;
  }

  function sectionHead(title, sub, moreHref, moreLabel) {
    return `<div class="section-head">
      <div><h2 class="section-title">${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ''}</div>
      ${moreHref ? `<a class="link-more" href="${moreHref}">${esc(moreLabel || '查看全部')} ${icon('arrow-right', 13)}</a>` : ''}
    </div>`;
  }

  function repoAvatar(r, size) {
    return `<img class="repo-avatar" src="https://github.com/${esc(r.o)}.png?size=80" alt="" loading="lazy" ${size ? `style="width:${size}px;height:${size}px"` : ''} onerror="this.style.visibility='hidden'">`;
  }

  function starHtml(n) { return `<span class="rc-star">★ ${fmtNum(n)}</span>`; }

  function repoCard(r, opts) {
    opts = opts || {};
    const faved = G.Store.isFav(r.f);
    const cat = r.cat && r.cat[0];
    const c = CAT_MAP[cat];
    return `<div class="repo-card" role="button" tabindex="0" data-act="repo" data-f="${esc(r.f)}" style="${opts.delay ? `animation-delay:${opts.delay}ms` : ''}">
      ${opts.rank ? `<span class="rank-badge ${opts.rank <= 3 ? 'top' + opts.rank : ''}">${opts.rank}</span>` : ''}
      <button class="rc-fav ${faved ? 'on' : ''}" data-act="fav" data-f="${esc(r.f)}" title="${faved ? '取消收藏' : '收藏'}" aria-label="收藏">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="${faved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.5 2.9C19.5 15.4 12 20 12 20Z"/></svg>
      </button>
      <div class="rc-head">
        ${repoAvatar(r)}
        <div class="repo-title"><b>${highlight(r.n, S.q)}</b><span>${esc(r.o)}</span></div>
      </div>
      <p class="repo-desc">${highlight(r.d || '暂无描述', S.q)}</p>
      <div class="rc-tags">
        ${c ? `<span class="tag" style="color:${c.color};border-color:${c.color}33;background:${c.color}12">${esc(c.label)}</span>` : ''}
        ${r.l ? `<span class="tag"><i class="lang-dot" style="background:${langColor(r.l)}"></i>&nbsp;${esc(r.l)}</span>` : ''}
        ${(r.t || []).slice(0, 2).map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}
      </div>
      <div class="rc-foot">
        ${starHtml(r.s)}
        <span>${icon('git-fork', 13)} ${fmtNum(r.fk)}</span>
        <span>${icon('clock', 13)} ${timeAgo(r.p)}</span>
        ${r.lic ? `<span style="margin-left:auto">${esc(r.lic)}</span>` : ''}
      </div>
    </div>`;
  }

  function repoRow(r, rank) {
    return `<div class="repo-row" role="button" tabindex="0" data-act="repo" data-f="${esc(r.f)}">
      ${rank ? `<b style="color:var(--text-4);min-width:22px;font-variant-numeric:tabular-nums">${rank}</b>` : ''}
      ${repoAvatar(r, 30)}
      <div class="rr-main"><b>${highlight(r.f, S.q)}</b><p>${highlight(r.d || '暂无描述', S.q)}</p></div>
      <div class="rr-stats">${starHtml(r.s)}<span>${icon('git-fork', 12)} ${fmtNum(r.fk)}</span><span>${timeAgo(r.p)}</span></div>
      <button class="icon-btn rc-fav ${G.Store.isFav(r.f) ? 'on' : ''}" style="opacity:1" data-act="fav" data-f="${esc(r.f)}" title="收藏">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="${G.Store.isFav(r.f) ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.5 2.9C19.5 15.4 12 20 12 20Z"/></svg>
      </button>
    </div>`;
  }

  function toolCard(item, color, idx) {
    const initial = (item.n || '?').trim().charAt(0).toUpperCase();
    return `<a class="tool-card" href="${esc(item.u)}" target="_blank" rel="noopener noreferrer">
      <span class="tc-icon" style="background:linear-gradient(135deg, ${color || '#7C5CFF'}, ${color || '#0A84FF'}cc)">${esc(initial)}</span>
      <h4>${esc(item.n)} ${item.b ? `<span class="badge-new">${esc(item.b)}</span>` : ''}</h4>
      <p>${esc(item.d)}</p>
      <div class="tc-foot"><span class="tc-url">${esc(domain(item.u))}</span><span class="tc-go">${icon('arrow-up-right', 15)}</span></div>
      ${item.t ? `<span class="tag" style="position:absolute;right:14px;top:14px">${esc(item.t)}</span>` : ''}
    </a>`;
  }

  /* ── 筛选与排序 ─────────────────────────────────── */
  function tierMin(key) { const t = TIERS.find((x) => x.key === key); return t ? t.min : 0; }

  function filterRepos(opts) {
    const o = Object.assign({}, S, opts || {});
    const q = (o.q || '').trim().toLowerCase();
    const min = tierMin(o.tier);
    const now = Date.now();
    const activeDays = { '1m': 30, '3m': 90, '1y': 365, '3y': 1095 }[o.active] || 0;
    let list = REPOS.concat(o.remote ? S.remoteResults : []);

    list = list.filter((r) => {
      if (o.cat !== 'all' && !(r.cat || []).includes(o.cat)) return false;
      if (o.lang !== 'all' && r.l !== o.lang) return false;
      if (min && (r.s || 0) < min) return false;
      if (o.license === 'yes' && !r.lic) return false;
      if (o.license === 'no-archived' && r.a) return false;
      if (activeDays && r.p && (now - new Date(r.p + 'T00:00:00Z').getTime()) / 86400000 > activeDays) return false;
      if (q) {
        const hay = `${r.f} ${r.d} ${(r.t || []).join(' ')} ${r.l}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const cmp = {
      stars: (a, b) => b.s - a.s,
      forks: (a, b) => b.fk - a.fk,
      updated: (a, b) => (b.p || '').localeCompare(a.p || ''),
      created: (a, b) => (b.c || '').localeCompare(a.c || ''),
      name: (a, b) => a.f.localeCompare(b.f),
      issues: (a, b) => b.is - a.is,
    }[o.sort] || ((a, b) => b.s - a.s);
    return list.sort(cmp);
  }

  function filterPanel(opts) {
    opts = opts || {};
    const langs = (META.languages || []).slice(0, 18);
    return `<div class="filter-panel">
      <div class="filter-row">
        <div class="search-inline">
          ${icon('search', 16)}
          <input id="repoSearch" type="search" placeholder="在 ${fmtFull(META.count)} 个仓库里搜索名称、描述、话题…" value="${esc(S.q)}" autocomplete="off">
        </div>
        <label class="switch" title="开启后可搜索 GitHub 全站（覆盖索引外的长尾仓库）">
          <input type="checkbox" id="remoteToggle" ${S.remote ? 'checked' : ''}><span class="track"></span>
          <span>GitHub 全站</span>
        </label>
        <button class="btn btn-ghost btn-sm" data-act="reset-filter">重置</button>
      </div>
      ${opts.hideCats ? '' : `<div class="filter-row">
        <span class="filter-label">分类</span>
        <div class="chip-scroll">
          <button class="chip ${S.cat === 'all' ? 'active' : ''}" data-act="filter-cat" data-v="all">全部</button>
          ${CATEGORIES.map((c) => `<button class="chip ${S.cat === c.slug ? 'active' : ''}" data-act="filter-cat" data-v="${c.slug}">${esc(c.label)}</button>`).join('')}
        </div>
      </div>`}
      <div class="filter-row">
        <span class="filter-label">星标</span>
        <div class="chip-scroll">
          ${TIERS.map((t) => `<button class="chip ${S.tier === t.key ? 'active' : ''}" data-act="filter-tier" data-v="${t.key}">${esc(t.label)}</button>`).join('')}
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">语言</span>
        <select class="mini-select" id="langSelect" data-act="filter-lang">
          <option value="all">全部语言</option>
          ${langs.map(([l, n]) => `<option value="${esc(l)}" ${S.lang === l ? 'selected' : ''}>${esc(l)} (${n})</option>`).join('')}
        </select>
        <select class="mini-select" id="activeSelect" data-act="filter-active">
          <option value="all">不限更新时间</option>
          <option value="1m" ${S.active === '1m' ? 'selected' : ''}>近 1 个月有提交</option>
          <option value="3m" ${S.active === '3m' ? 'selected' : ''}>近 3 个月有提交</option>
          <option value="1y" ${S.active === '1y' ? 'selected' : ''}>近 1 年有提交</option>
          <option value="3y" ${S.active === '3y' ? 'selected' : ''}>近 3 年有提交</option>
        </select>
        <select class="mini-select" id="licenseSelect" data-act="filter-license">
          <option value="all">全部许可证</option>
          <option value="yes" ${S.license === 'yes' ? 'selected' : ''}>仅含明确许可证</option>
          <option value="no-archived" ${S.license === 'no-archived' ? 'selected' : ''}>排除已归档项目</option>
        </select>
      </div>
    </div>`;
  }

  function resultsBar(total) {
    return `<div class="results-bar">
      <div class="rb-count">找到 <b>${fmtFull(total)}</b> 个项目${S.remote ? ' · 含 GitHub 全站实时结果' : ''}</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <select class="mini-select" data-act="filter-sort">
          <option value="stars" ${S.sort === 'stars' ? 'selected' : ''}>按 Star 排序</option>
          <option value="updated" ${S.sort === 'updated' ? 'selected' : ''}>按最近更新</option>
          <option value="forks" ${S.sort === 'forks' ? 'selected' : ''}>按 Fork 排序</option>
          <option value="created" ${S.sort === 'created' ? 'selected' : ''}>按创建时间</option>
          <option value="issues" ${S.sort === 'issues' ? 'selected' : ''}>按 Issue 数</option>
          <option value="name" ${S.sort === 'name' ? 'selected' : ''}>按名称</option>
        </select>
        <div class="segmented">
          <button class="${S.view === 'grid' ? 'active' : ''}" data-act="filter-view" data-v="grid">${icon('grid', 13)} 网格</button>
          <button class="${S.view === 'list' ? 'active' : ''}" data-act="filter-view" data-v="list">${icon('list', 13)} 列表</button>
        </div>
      </div>
    </div>`;
  }

  function repoGridHtml(list, opts) {
    opts = opts || {};
    const shown = list.slice(0, S.page * S.perPage);
    if (!shown.length) {
      return `<div class="empty-state"><div class="empty-icon">${icon('search', 44)}</div>
        <h3>没有找到匹配的项目</h3><p>试试放宽筛选条件，或开启「GitHub 全站」搜索更多仓库</p>
        <button class="btn btn-primary" data-act="reset-filter">重置筛选</button></div>`;
    }
    const body = S.view === 'list'
      ? `<div class="repo-list">${shown.map((r, i) => repoRow(r, opts.rank ? i + 1 : 0)).join('')}</div>`
      : `<div class="repo-grid">${shown.map((r, i) => repoCard(r, { rank: opts.rank ? i + 1 : 0, delay: Math.min(i, 12) * 24 })).join('')}</div>`;
    return body + (shown.length < list.length
      ? `<div class="load-more"><button class="btn" data-act="load-more">加载更多（还有 ${fmtFull(list.length - shown.length)} 个）${icon('chevron-right', 14)}</button></div>`
      : '');
  }

  /* ── 页面：发现 ─────────────────────────────────── */
  function discover() {
    const top = REPOS.slice(0, 9);
    const active = REPOS.filter((r) => r.p >= new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10)).slice(0, 6);
    const quick = [
      { id: 'ai', icon: 'sparkles', color: '#7C5CFF', title: 'AI 导航', sub: '精选 AI 工具与平台', href: '#/ai' },
      { id: 'mcp', icon: 'plug', color: '#0A84FF', title: 'MCP 生态', sub: '协议、服务端与目录', href: '#/feature/mcp' },
      { id: 'skills', icon: 'blocks', color: '#30B0C7', title: 'Skills 技能包', sub: '让 Agent 学会新本领', href: '#/feature/skills' },
      { id: 'agent', icon: 'bot', color: '#FF7A45', title: 'AI Agent', sub: '开源智能体框架', href: '#/feature/agent' },
    ];
    const aiTools = (CATALOG.aiNav[0]?.items || []).slice(0, 8);
    return `
      <section class="hero">
        <div class="eyebrow">${esc(CFG.slogan || '发现值得用的开源项目')}</div>
        <h1 class="display">GitHub 上不缺好项目，<br><span class="gradient-text">缺的是找到它的方式。</span></h1>
        <p class="hero-lede">Orbit 自动收录 GitHub 优质仓库，按主题分类、按星标分层，并把 AI 工具、社区、博客与论文放在同一个地方。免登录使用，收藏可选跨端同步。</p>
        <div class="hero-search">
          ${icon('search', 21)}
          <input id="heroSearch" type="search" placeholder="搜索项目、话题、语言，或试试「本地大模型」" autocomplete="off">
          <button class="btn btn-primary" data-act="hero-search">搜索 ${icon('arrow-right', 15)}</button>
        </div>
        <div class="hero-hints">大家都在找：
          ${['LLM', 'MCP', 'Agent', 'Rust', 'self-hosted', 'Awesome', 'React'].map((t) => `<button data-act="hint" data-v="${esc(t)}">${esc(t)}</button>`).join('')}
        </div>
        <div class="stat-row">
          <div class="stat"><b>${fmtNum(META.count || REPOS.length)}</b><span>已收录开源仓库</span></div>
          <div class="stat"><b>${CATEGORIES.length || 16}</b><span>主题分类</span></div>
          <div class="stat"><b>${countAllLinks()}</b><span>AI 工具 / 社区 / 论文</span></div>
          <div class="stat"><b>${fmtNum(REPOS.filter((r) => r.s >= 10000).length)}</b><span>万星以上项目</span></div>
        </div>
      </section>

      ${!G.LS.get('orbit:onboarded', false) ? `<div class="welcome-bar" id="welcomeBar">
        <span class="wb-emoji">👋</span>
        <div><b>第一次来？3 分钟就能看懂</b><small>不用登录、不用会写代码，跟着新手指南走一遍就会用。</small></div>
        <a class="btn btn-sm btn-primary" href="#/guide">打开新手指南 ${icon('arrow-right', 13)}</a>
        <button class="icon-btn" data-act="dismiss-welcome" aria-label="不再显示">${icon('x', 15)}</button>
      </div>` : ''}

      ${sectionHead('从哪儿开始', '为你整理好的四个入口', '')}
      <div class="quick-grid">
        ${quick.map((q) => `<a class="quick-card" href="${q.href}">
          <span class="qc-arrow">${icon('arrow-up-right', 17)}</span>
          <span class="qc-icon" style="background:linear-gradient(135deg, ${q.color}, ${q.color}aa)">${icon(q.icon, 20)}</span>
          <h3>${esc(q.title)}</h3><p>${esc(q.sub)}</p>
        </a>`).join('')}
      </div>

      ${sectionHead('按主题浏览', '从你熟悉的领域开始翻', '#/categories', '全部分类')}
      <div class="cat-scroll">
        ${CATEGORIES.map((c) => `<a class="cat-card" href="#/category/${c.slug}">
          <div class="cc-top"><span class="cc-icon" style="background:${c.color}1c;color:${c.color}">${icon(c.icon, 17)}</span>
          <span style="font-size:10.5px;color:var(--text-4)">${fmtNum(c.count || 0)} 个</span></div>
          <b>${esc(c.label)}</b><small>${esc(c.desc || '')}</small>
        </a>`).join('')}
      </div>

      ${sectionHead('按星标找', '一个粗略但好用的质量信号', '#/ranking', '完整榜单')}
      <div class="tier-grid">
        ${TIERS.slice(0, 6).map((t) => `<button class="tier-card" data-act="jump-tier" data-v="${t.key}">
          <div class="tier-num" style="color:${t.color}">${t.key === 'all' ? '★' : t.key}</div>
          <div class="tier-label">${esc(t.label)}</div>
          <div class="tier-desc">${esc(t.desc)}</div>
        </button>`).join('')}
      </div>

      ${sectionHead('热门项目', '按 Star 排序的全站 Top 9', '#/repos', '查看全部仓库')}
      <div class="repo-grid">${top.map((r, i) => repoCard(r, { rank: i + 1, delay: i * 30 })).join('')}</div>

      ${sectionHead('最近依然活跃', '45 天内有提交的高星项目', '#/repos', '按更新时间看')}
      <div class="repo-grid">${(active.length ? active : REPOS.slice(9, 15)).map((r, i) => repoCard(r, { delay: i * 30 })).join('')}</div>

      ${sectionHead('AI 导航精选', '不用翻收藏夹，常用的都在这', '#/ai', '打开 AI 导航')}
      <div class="tool-grid">${aiTools.map((t) => toolCard(t, '#7C5CFF')).join('')}</div>
    `;
  }

  function countAllLinks() {
    const c = CATALOG;
    return (c.aiNav || []).reduce((a, g) => a + g.items.length, 0)
      + (c.community || []).reduce((a, g) => a + g.items.length, 0)
      + (c.blogs || []).length + (c.papers || []).length
      + Object.values(c.featured || {}).reduce((a, f) => a + (f.links || []).length, 0);
  }

  /* ── 页面：仓库库 / 分类 ─────────────────────────── */
  function reposPage(opts) {
    opts = opts || {};
    const cat = opts.cat && opts.cat !== 'all' ? CAT_MAP[opts.cat] : null;
    const list = filterRepos(opts);
    return `
      ${pageHead(cat ? '主题分类' : '仓库库',
        cat ? `${esc(cat.label)}` : '浏览全部仓库',
        cat ? (cat.desc || '') : '自动收录的 GitHub 仓库索引，支持分类、语言、星标、许可证、活跃度组合筛选。索引之外的长尾仓库可用「GitHub 全站」实时搜索。')}
      ${cat ? `<div class="feature-banner" style="background:linear-gradient(120deg,${cat.color}cc,${cat.color}77 55%,#1d1d2b)">
        <div class="eyebrow" style="color:rgba(255,255,255,.8)">${fmtNum(cat.count || 0)} 个项目</div>
        <h2>${esc(cat.label)}</h2><p>${esc(cat.desc || '')}。数据由 GitHub Search API 自动收录并按规则归类，每周更新。</p>
        <div class="fb-links"><a href="#/repos">查看全部仓库</a><a href="#/ranking">星标榜单</a><a href="https://github.com/topics" target="_blank" rel="noopener">GitHub Topics ↗</a></div>
      </div>` : ''}
      ${filterPanel()}
      ${resultsBar(list.length)}
      ${S.remote && S.remoteLoading ? '<div class="empty-state"><p>正在搜索 GitHub 全站…</p></div>' : ''}
      ${repoGridHtml(list, {})}
    `;
  }

  /* ── 页面：分类总览 ─────────────────────────────── */
  function categoriesPage() {
    return `${pageHead('分类浏览', '按主题找到对的工具', '每个分类都由自动抓取 + 规则归类生成，点进去可以继续按语言、星标与活跃度筛选。')}
      <div class="quick-grid" style="grid-template-columns:repeat(4,1fr)">
        ${CATEGORIES.map((c) => `<a class="quick-card" href="#/category/${c.slug}">
          <span class="qc-arrow">${icon('arrow-up-right', 16)}</span>
          <span class="qc-icon" style="background:linear-gradient(135deg, ${c.color}, ${c.color}aa)">${icon(c.icon, 20)}</span>
          <h3>${esc(c.label)}</h3><p>${fmtNum(c.count || 0)} 个项目 · ${esc(c.desc || '')}</p>
        </a>`).join('')}
      </div>
      ${sectionHead('星标分层', '按量级快速定位', '#/ranking', '打开榜单')}
      <div class="tier-grid">${TIERS.map((t) => `<button class="tier-card" data-act="jump-tier" data-v="${t.key}">
        <div class="tier-num" style="color:${t.color}">${t.key === 'all' ? '★' : t.key}</div>
        <div class="tier-label">${esc(t.label)}</div><div class="tier-desc">${esc(t.desc)}</div></button>`).join('')}</div>`;
  }

  /* ── 页面：星标榜单 ─────────────────────────────── */
  function rankingPage() {
    const min = tierMin(S.rankTier);
    const list = REPOS.filter((r) => r.s >= min).slice(0, 60);
    return `${pageHead('星标榜单', '被多少人认可过', 'Star 不等于好用，但它是最快的初筛信号。结合最近更新时间与许可证一起看，判断会更准。')}
      <div class="rank-hero">${TIERS.map((t) => {
        const n = REPOS.filter((r) => r.s >= t.min).length;
        return `<button class="rank-tab ${S.rankTier === t.key ? 'active' : ''}" data-act="rank-tier" data-v="${t.key}">
          <b>${esc(t.label)}</b><small>${fmtFull(n)} 个项目</small></button>`;
      }).join('')}</div>
      <div class="results-bar" style="margin-top:14px"><div class="rb-count">Top <b>${Math.min(list.length, 60)}</b> · 按 Star 降序</div>
        <div class="segmented"><button class="${S.view === 'grid' ? 'active' : ''}" data-act="filter-view" data-v="grid">${icon('grid', 13)} 网格</button>
        <button class="${S.view === 'list' ? 'active' : ''}" data-act="filter-view" data-v="list">${icon('list', 13)} 列表</button></div></div>
      ${repoGridHtml(list, { rank: true })}`;
  }

  /* ── 页面：AI 导航 / 社区 ───────────────────────── */
  function aiNavPage() {
    return `${pageHead('AI 导航', '常用 AI 工具，一页直达', '按使用场景人工整理，覆盖对话、搜索、编程、多模态、开源模型与效率工具。所有链接直达官网。')}
      <div class="search-inline" style="margin-bottom:24px;max-width:420px">${icon('search', 16)}<input id="aiSearch" type="search" placeholder="筛选本站 AI 工具…" autocomplete="off"></div>
      <div id="aiGroups">
      ${(CATALOG.aiNav || []).map((g) => `
        ${sectionHead(g.title, `${g.items.length} 个站点`, '')}
        <div class="tool-grid">${g.items.map((it) => toolCard(it, g.color)).join('')}</div>`).join('')}
      </div>`;
  }

  function communityPage() {
    return `${pageHead('AI 社区', '去有人讨论的地方', '从模型社区、论坛到中文媒体与学术会议，按语言与场景分组。')}
      ${(CATALOG.community || []).map((g) => `
        ${sectionHead(g.title, `${g.items.length} 个社区`, '')}
        <div class="tool-grid">${g.items.map((it) => toolCard(it, g.color)).join('')}</div>`).join('')}`;
  }

  /* ── 页面：博客 & 论文 ─────────────────────────── */
  function readingPage() {
    const tab = S.readingTab;
    const papers = CATALOG.papers || [], blogs = CATALOG.blogs || [];
    const sites = (CATALOG.community || []).find((g) => g.title === '学术与会议');
    return `${pageHead('博客 & 论文', '从一线实践读到原始论文', '先读工程博客建立直觉，再回到论文看清楚边界条件。中文与英文资源都有。')}
      <div class="segmented" style="margin-bottom:22px">
        <button class="${tab === 'papers' ? 'active' : ''}" data-act="reading-tab" data-v="papers">经典论文 ${papers.length}</button>
        <button class="${tab === 'blogs' ? 'active' : ''}" data-act="reading-tab" data-v="blogs">技术博客 ${blogs.length}</button>
        <button class="${tab === 'sites' ? 'active' : ''}" data-act="reading-tab" data-v="sites">学术站点</button>
      </div>
      ${tab === 'papers' ? `
        <div class="paper-list">${papers.map((p) => `<a class="paper-item" href="${esc(p.u)}" target="_blank" rel="noopener noreferrer">
          <span class="paper-year">${esc(p.y)}</span>
          <div class="paper-body"><b>${esc(p.n)}</b><p>${esc(p.d)}</p>
            <div style="display:flex;gap:6px;align-items:center"><span class="tag tag-blue">${esc(p.t)}</span>
            ${p.b ? `<span class="tag tag-pink">${esc(p.b)}</span>` : ''}
            <span style="font-size:10.5px;color:var(--text-4);margin-left:auto">arXiv ↗</span></div></div>
        </a>`).join('')}</div>`
      : tab === 'blogs' ? `<div class="blog-grid">${blogs.map((b) => `<a class="tool-card" href="${esc(b.u)}" target="_blank" rel="noopener noreferrer">
          <span class="tc-icon" style="background:linear-gradient(135deg,#AF52DE,#0A84FF)">${icon('book', 18)}</span>
          <h4>${esc(b.n)} <span class="tag" style="font-size:9px">${esc(b.lang)}</span></h4><p>${esc(b.d)}</p>
          <div class="tc-foot"><span class="tc-url">${esc(domain(b.u))}</span><span class="tc-go">${icon('arrow-up-right', 15)}</span></div>
          <span class="tag" style="position:absolute;right:14px;top:14px">${esc(b.t)}</span></a>`).join('')}</div>`
      : `<div class="tool-grid">${(sites?.items || []).map((x) => toolCard(x, '#AF52DE')).join('')}</div>`}
    `;
  }

  /* ── 页面：专题（MCP / Skills / Agent / 开源） ───── */
  function featurePage(key) {
    const f = (CATALOG.featured || {})[key];
    if (!f) return notFound();
    const c = CAT_MAP[key] || { color: '#7C5CFF', icon: 'sparkles', label: f.title, count: 0 };
    const list = filterRepos({ cat: key, q: '', page: 1 }).slice(0, 12);
    return `${pageHead('专题', esc(f.title), esc(f.subtitle))}
      <div class="feature-banner">
        <div class="eyebrow" style="color:rgba(255,255,255,.8)">${fmtNum(c.count || 0)} 个相关仓库 · 持续自动收录</div>
        <h2>${esc(f.title)}</h2><p>${esc(f.intro)}</p>
        <div class="fb-links"><a href="#/category/${key}">浏览全部相关仓库 ↗</a><a href="#/ranking">星标榜单 ↗</a></div>
      </div>
      ${sectionHead('导航与资源', '精选入口，直达官方与社区', '')}
      <div class="tool-grid">${(f.links || []).map((x) => toolCard(x, c.color)).join('')}</div>
      ${sectionHead('相关开源仓库', `按 Star 排序的 ${key} 项目`, `#/category/${key}`, '查看全部')}
      <div class="repo-grid">${list.map((r, i) => repoCard(r, { delay: i * 25 })).join('')}</div>
      ${!list.length ? `<div class="empty-state"><p>该分类暂无索引仓库，试试开启全站搜索。</p></div>` : ''}`;
  }

  /* ── 页面：收藏 ─────────────────────────────────── */
  function favoritesPage() {
    const favs = w.GH.Store.state.favorites;
    const list = favs.map((f) => byFullName[f]).filter(Boolean);
    const missing = favs.filter((f) => !byFullName[f]);
    const recent = w.GH.Store.state.recent.slice(0, 8).map((x) => byFullName[x.f]).filter(Boolean);
    return `${pageHead('我的收藏', `${favs.length} 个项目`, '收藏默认保存在本机，无需登录。连接 GitHub 账号后自动同步到你的私有 Gist，网站、手机与桌面端共用。')}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px">
        <button class="btn" data-act="sync">${icon('sync', 15)} 立即同步</button>
        <button class="btn" data-act="export">${icon('download', 15)} 导出收藏</button>
        <button class="btn" data-act="import">${icon('upload', 15)} 导入收藏</button>
        ${favs.length ? `<button class="btn btn-ghost" data-act="clear-favs">${icon('trash', 15)} 清空</button>` : ''}
      </div>
      ${list.length ? `<div class="repo-grid">${list.map((r, i) => repoCard(r, { delay: i * 25 })).join('')}</div>`
        : `<div class="empty-state"><div class="empty-icon">${icon('heart', 44)}</div><h3>还没有收藏</h3>
        <p>在任意项目卡片右上角点心形即可收藏，不用登录也能用。</p>
        <a class="btn btn-primary" href="#/repos">去逛逛仓库</a></div>`}
      ${missing.length ? `${sectionHead('索引外的收藏', '这些项目来自其他设备或历史版本')}
        <div class="repo-list">${missing.map((f) => `<a class="repo-row" href="https://github.com/${esc(f)}" target="_blank" rel="noopener noreferrer">
          <div class="rr-main"><b>${esc(f)}</b><p>在 GitHub 上打开</p></div>${icon('arrow-up-right', 16)}
          <button class="icon-btn" data-act="fav" data-f="${esc(f)}">${icon('x', 15)}</button></a>`).join('')}</div>` : ''}
      ${recent.length ? `${sectionHead('最近浏览', '', '')}<div class="repo-grid">${recent.slice(0, 6).map((r) => repoCard(r)).join('')}</div>` : ''}`;
  }

  /* ── 页面：安装（全平台） ───────────────────────── */
  function installPage() {
    const pagesUrl = `https://${CFG.githubUser || '<你的用户名>'}.github.io/${CFG.githubRepo || '<仓库名>'}/`;
    return `${pageHead('安装应用', '一份代码，全平台可用', '网站、手机与电脑端共用同一套界面与数据层。不强制登录，收藏与设置默认本机保存，可选 GitHub 账号跨端同步。')}
      <div class="panel" style="margin-bottom:16px">
        <h3>① 一键装成 App（推荐，30 秒）</h3>
        <p>点下面的按钮，会自动识别你的设备并给出最短安装路径。安装后有独立图标与窗口、支持离线，界面与网站完全一致。不需要账号、不需要编译。</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-primary" data-act="smart-install">${icon('bolt', 15)} 一键安装</button>
          <button class="btn" data-act="install">${icon('download', 15)} 浏览器安装</button>
          <button class="btn btn-ghost" data-act="share-site">${icon('share', 15)} 分享网站</button>
        </div>
      </div>
      <div class="panel" style="margin-bottom:20px">
        <h3>② 双击一键启动脚本（完全本地运行）</h3>
        <p>不想用在线网址？项目根目录自带脚本：自动检查环境、启动本地站点、打开浏览器。停掉窗口里的服务即可退出。</p>
        <div class="install-grid" style="grid-template-columns:repeat(3,1fr)">
          <div class="install-card"><div class="ic-icon">🪟</div><b>Windows</b><p>双击 <b>install.bat</b></p><button class="btn btn-sm" data-act="copy" data-v="install.bat">复制命令</button></div>
          <div class="install-card"><div class="ic-icon">🍎</div><b>macOS / Linux</b><p>终端运行 <b>./install.sh</b></p><button class="btn btn-sm" data-act="copy" data-v="chmod +x install.sh && ./install.sh">复制命令</button></div>
          <div class="install-card"><div class="ic-icon">⌘</div><b>手动 / 无界面</b><p><b>node scripts/install.mjs --no-open</b></p><button class="btn btn-sm" data-act="copy" data-v="node scripts/install.mjs --no-open">复制命令</button></div>
        </div>
        <div class="code-block" style="margin-top:12px">install.bat --build        # Windows 额外构建原生安装包
./install.sh --build       # macOS / Linux 额外构建原生安装包</div>
      </div>
      ${sectionHead('全平台安装包', '构建方式与入口', '')}
      <div class="install-grid">
        <div class="install-card"><div class="ic-icon">🪟</div><b>Windows</b><p>桌面端基于 Tauri 2 打包为 .msi / .exe，体积约 5–10 MB；也可直接用 Edge 安装 PWA。</p><span class="tag tag-blue">x64 / ARM64</span></div>
        <div class="install-card"><div class="ic-icon">🍎</div><b>macOS</b><p>输出 .dmg 与 .app，支持 Apple Silicon 与 Intel；Safari 也可「添加到程序坞」。</p><span class="tag tag-purple">Universal</span></div>
        <div class="install-card"><div class="ic-icon">🐧</div><b>Linux</b><p>输出 .AppImage / .deb，适用于 Ubuntu、Debian、Fedora 等主流发行版。</p><span class="tag tag-green">AppImage / deb</span></div>
        <div class="install-card"><div class="ic-icon">🤖</div><b>Android</b><p>Chrome 打开网站 → 菜单 → 「安装应用 / 添加到主屏幕」，支持离线与全屏。</p><span class="tag">PWA</span></div>
        <div class="install-card"><div class="ic-icon">📱</div><b>iOS / iPadOS</b><p>Safari 打开网站 → 分享 → 「添加到主屏幕」，获得独立图标与启动画面。</p><span class="tag">PWA</span></div>
        <div class="install-card"><div class="ic-icon">🌐</div><b>网页版</b><p>GitHub Pages 二级域名，零安装、随时访问，与客户端数据互通。</p><span class="tag">无需登录</span></div>
      </div>
      ${sectionHead('桌面端构建', '在本地或 GitHub Actions 中执行', '')}
      <div class="panel"><div class="code-block">cd desktop
npm install
npm run tauri dev       # 开发预览
npm run tauri build     # 生成各平台安装包
# 产物：desktop/src-tauri/target/release/bundle/</div>
        <p style="margin-top:14px">也可直接使用仓库内置的 <b>.github/workflows/build-desktop.yml</b>，在 Actions 里一键构建 Windows / macOS / Linux 三平台安装包并下载 Artifact。</p>
      </div>
      ${sectionHead('部署到 GitHub Pages 二级域名', '网站与客户端保持一致', '')}
      <div class="panel">
        <p>1. 把本目录推送到你的 GitHub 仓库（例如 <b>github-nav</b>）。<br>
        2. 修改 <b>site/config.js</b> 中的 <b>githubUser</b> / <b>githubRepo</b>。<br>
        3. 仓库 Settings → Pages → Build and deployment 选择 <b>GitHub Actions</b>。<br>
        4. 内置工作流会自动部署，并每周自动重新收录仓库数据。</p>
        <div class="code-block">${esc(pagesUrl)}</div>
      </div>
      ${sectionHead('登录与数据', '像 GitHub 一样，游客也能用', '')}
      <div class="panel"><p>不登录：搜索、筛选、收藏、分享、主题、最近浏览全部可用，数据存在本机。<br>
      登录（可选）：连接 GitHub 账号后写入你自己的私有 Gist，网站 / 手机 / 桌面端自动同步收藏与偏好。令牌只保存在本机，可随时退出清除。</p>
      <button class="btn" data-act="go-settings">前往账号设置 ${icon('arrow-right', 15)}</button></div>`;
  }

  /* ── 页面：设置 ─────────────────────────────────── */
  function settingsPage() {
    const st = w.GH.Store.state;
    const acc = st.account;
    const theme = st.settings.theme;
    return `${pageHead('设置', '让它按你的习惯工作', '外观、网站账号、GitHub 连接、数据同步与关于。所有改动立即生效。')}
      <div class="settings-grid">
        <div class="panel">
          <h3>网站账号（云服务）</h3>
          <p>用邮箱或手机短信验证码登录。登录后收藏、设置会自动同步到云端；不登录也能完整使用本站。</p>
          <div class="setting-line"><div class="sl-text"><b>登录状态</b>
            <small>${CLOUD.user ? '已登录 · ' + esc(CLOUD.user.name || CLOUD.user.email || CLOUD.user.phone || '云账号') : CLOUD.sdkError ? esc(CLOUD.sdkError) : '游客模式 · 数据保存在本机'}</small></div>
            <button class="btn btn-sm ${CLOUD.user ? '' : 'btn-primary'}" data-act="auth-account">${CLOUD.user ? '账号中心' : '登录 / 注册'}</button></div>
          <div class="setting-line"><div class="sl-text"><b>GitHub 账号</b>
            <small>${CLOUD.github ? '已连接 @' + esc(CLOUD.github.login) + ' · 源码接口额度更高' : '未连接 · 可选'}</small></div>
            <button class="btn btn-sm" data-act="auth-github-settings">${CLOUD.github ? '管理连接' : '连接 GitHub'}</button></div>
          <div class="setting-line"><div class="sl-text"><b>云端同步</b><small>${CLOUD.user ? '收藏与设置跨设备可用' : '登录后可开启'}</small></div>
            <button class="btn btn-sm" data-act="auth-sync-settings" ${CLOUD.user ? '' : 'disabled'}>立即同步</button></div>
        </div>

        <div class="panel">
          <h3>外观</h3><p>Apple 风格设计，浅色 / 深色都做了完整适配。</p>
          <div class="setting-line"><div class="sl-text"><b>主题</b><small>跟随系统会随设备自动切换</small></div>
            <div class="segmented">
              <button class="${theme === 'light' ? 'active' : ''}" data-act="theme" data-v="light">浅色</button>
              <button class="${theme === 'dark' ? 'active' : ''}" data-act="theme" data-v="dark">深色</button>
              <button class="${theme === 'auto' ? 'active' : ''}" data-act="theme" data-v="auto">自动</button>
            </div></div>
          <div class="setting-line"><div class="sl-text"><b>默认展示方式</b><small>仓库列表的呈现形式</small></div>
            <div class="segmented"><button class="${st.settings.view === 'grid' ? 'active' : ''}" data-act="filter-view" data-v="grid">网格</button>
            <button class="${st.settings.view === 'list' ? 'active' : ''}" data-act="filter-view" data-v="list">列表</button></div></div>
        </div>

        <div class="panel">
          <h3>GitHub 数据同步（Gist）</h3><p>另一条可选的同步通道：用 GitHub 令牌把收藏写进你自己的私有 Gist。与上方「网站账号」的云同步互不冲突，不需要同时开启。</p>
          ${acc ? `<div class="account-card"><span class="ac-avatar">${acc.avatar ? `<img src="${esc(acc.avatar)}" alt="">` : esc(acc.login.charAt(0).toUpperCase())}</span>
            <div><b style="font-size:14px">@${esc(acc.login)}</b><div style="font-size:11px;color:var(--text-3)">${st.lastSync ? '上次同步 ' + timeAgo(st.lastSync) : '尚未同步'}</div></div></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
              <button class="btn btn-primary" data-act="sync">${icon('sync', 15)} 立即同步</button>
              <button class="btn btn-ghost" data-act="disconnect">退出登录</button></div>`
          : `<div class="account-card"><span class="ac-avatar">游</span>
            <div><b style="font-size:14px">游客模式</b><div style="font-size:11px;color:var(--text-3)">数据保存在本机 · 无需登录</div></div></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
              <button class="btn btn-primary" data-act="connect">${icon('github', 15)} 连接 GitHub 账号</button>
              <button class="btn" data-act="connect-token">使用访问令牌</button></div>`}
        </div>

        <div class="panel">
          <h3>数据管理</h3><p>你的数据始终可导出、可迁移、可删除。</p>
          <div class="setting-line"><div class="sl-text"><b>收藏</b><small>当前 ${st.favorites.length} 个项目</small></div>
            <button class="btn btn-sm" data-act="export">导出 JSON</button></div>
          <div class="setting-line"><div class="sl-text"><b>导入</b><small>合并其他设备导出的收藏</small></div>
            <button class="btn btn-sm" data-act="import">导入 JSON</button></div>
          <div class="setting-line"><div class="sl-text"><b>最近浏览</b><small>${st.recent.length} 条记录</small></div>
            <button class="btn btn-sm" data-act="clear-recent">清除</button></div>
        </div>

        <div class="panel">
          <h3>关于 Orbit</h3><p>一个把 GitHub 变好逛的导航站。</p>
          <div class="setting-line"><div class="sl-text"><b>数据来源</b><small>GitHub Search API 自动收录 + 人工精选导航</small></div><span class="tag tag-green">公开数据</span></div>
          <div class="setting-line"><div class="sl-text"><b>索引规模</b><small>${fmtFull(META.count || REPOS.length)} 个真实仓库 · ${CATEGORIES.length} 个分类</small></div></div>
          <div class="setting-line"><div class="sl-text"><b>最近更新</b><small>${META.updatedAt ? new Date(META.updatedAt).toLocaleString('zh-CN') : '—'}</small></div></div>
          <div class="setting-line"><div class="sl-text"><b>版本</b><small>Orbit ${esc(CFG.version || '1.0.0')} · 每 ${CFG.refreshDays || 7} 天自动更新</small></div></div>
          <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
            <a class="btn btn-sm" href="#/install">安装应用</a>
            <a class="btn btn-sm" href="#/contact">联系开发者</a>
            <a class="btn btn-sm btn-ghost" href="${esc((CFG.developer && CFG.developer.repoUrl) || 'https://github.com')}" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
        </div>
      </div>
      <div class="panel" style="margin-top:16px">
        <h3>部署信息</h3>
        <p>网站与安装包共用同一份代码。若部署在 GitHub Pages 二级域名下，请在 <b>site/config.js</b> 填写 GitHub 用户名与仓库名，用于生成正确的分享链接与作用域。</p>
        <div class="code-block">${esc(G.siteUrl())}/</div>
      </div>`;
  }

  /* ── 页面：趋势榜 ───────────────────────────────── */
  function trendingPage() {
    const cutoff = new Date(Date.now() - S.trendDays * 86400000).toISOString().slice(0, 10);
    const list = REPOS.filter((r) => r.p && r.p >= cutoff && !r.a).slice(0, 60);
    return `${pageHead('趋势榜', '最近还在动的项目', 'GitHub 官方 Trending 看的是「今天谁涨得快」，这里看的是「最近还有提交的高星项目」——更适合判断一个项目是不是还活着。')}
      <div class="filter-panel" style="margin-bottom:18px">
        <div class="filter-row"><span class="filter-label">时间窗</span>
          <div class="chip-scroll">
            ${[7, 30, 90, 365].map((d) => `<button class="chip ${S.trendDays === d ? 'active' : ''}" data-act="trend-days" data-v="${d}">近 ${d === 365 ? '1 年' : d + ' 天'}</button>`).join('')}
          </div>
          <a class="btn btn-sm btn-ghost" href="https://github.com/trending" target="_blank" rel="noopener noreferrer">GitHub 官方 Trending ↗</a>
        </div>
      </div>
      <div class="results-bar"><div class="rb-count">近 <b>${S.trendDays === 365 ? '1 年' : S.trendDays + ' 天'}</b> 内有提交的高星项目 · <b>${fmtFull(list.length)}</b> 个</div></div>
      ${repoGridHtml(list, { rank: true })}`;
  }

  /* ── 页面：新手指南 ─────────────────────────────── */
  function guidePage() {
    const steps = [
      { n: '01', icon: 'search', title: '先搜你想做的事', text: '顶部搜索框或按 ⌘K / Ctrl+K，输入「本地大模型」「图表」「MCP」这类词就行，不用记项目名。', link: '#/repos', linkText: '去仓库库试试' },
      { n: '02', icon: 'sliders', title: '用筛选缩小范围', text: '左侧选分类，再按语言、星标、最近更新过滤。星标高 ≠ 一定好用，配合「最近有提交」一起看更靠谱。', link: '#/categories', linkText: '看看有哪些分类' },
      { n: '03', icon: 'eye', title: '点开卡片看详情', text: '能看到项目说明、README、许可证、下载 ZIP，以及 Issues / PR / 提交记录的直达入口。', link: '#/ranking', linkText: '从榜单挑一个' },
      { n: '04', icon: 'heart', title: '收下它，不用登录', text: '点卡片右上角的心形即可收藏；想换设备用，再去「设置」里可选连接 GitHub 同步。', link: '#/favorites', linkText: '打开我的收藏' },
    ];
    const glossary = [
      ['Star ★', '给别人项目点个赞。粗略代表人气，不等于质量。'],
      ['Fork', '把项目复制一份到自己账号下，方便改着玩。'],
      ['Issue', '问题或建议的记录。看看回复快不快，能判断项目有没有人管。'],
      ['Pull Request', '你改了代码，请作者合并回去，简称 PR。'],
      ['README', '项目说明书。用之前先读它，能省半小时。'],
      ['License', '许可证。决定能不能商用、要不要开源你的修改。'],
      ['Clone', '把项目代码下载到自己电脑上。'],
      ['Topic', '项目贴的标签，本站靠它自动分类。'],
      ['Archived', '已归档，作者基本不再维护了，慎用。'],
      ['MCP', '让 AI 统一连接外部工具 / 数据的开放协议。'],
      ['Skills', '写给 AI Agent 的能力包，一份 SKILL.md 就是一个技能。'],
      ['Agent', '会自己规划、调用工具、把事情做完的 AI 程序。'],
      ['PWA', '网页也能装成 App，有独立图标、可离线打开。'],
    ];
    const compare = [
      ['搜索、筛选、分类、星标榜单', '本站直接可用', '不需要账号'],
      ['收藏、分享、深浅色、最近浏览', '本站直接可用', '数据存在本机'],
      ['README 预览、下载 ZIP、项目详情', '本站直接可用', '读取公开内容'],
      ['AI 导航、社区、博客与论文', '本站直接可用', '人工整理'],
      ['Star / Fork / Watch', '跳转 GitHub', '写入操作需要账号'],
      ['提 Issue / 提 PR / Code / Actions', '跳转 GitHub', '需要账号与仓库权限'],
      ['登录、通知、个人主页、CI', '跳转 GitHub', '属于 GitHub 账号体系'],
      ['收藏跨设备同步', '可选开启', '连接 GitHub 后写入你的私有 Gist'],
    ];
    const faq = [
      ['需要登录吗？', '完全不用。搜索、筛选、收藏、分享、切换主题都能直接用。只有「多设备同步收藏」才需要可选连接 GitHub。'],
      ['星标准不准？', '是抓取时的快照，会随时间变化，以 GitHub 页面为准。索引每 7 天由自动任务更新一次。'],
      ['为什么有的项目搜不到？', '离线索引收录的是各分类的高价值项目。打开筛选栏的「GitHub 全站」开关，可以实时搜索索引之外的长尾仓库（匿名调用每分钟约 10 次）。'],
      ['收藏会丢吗？', '存在当前浏览器里，不清理浏览器数据就不会丢；换设备前可在「我的收藏」导出 JSON，或开启云同步。'],
      ['手机 / 平板能用吗？', '能。用同一网址打开，界面会自动变成底部导航；浏览器菜单里选「添加到主屏幕」即可当 App 用。'],
      ['数据从哪来？会不会爬取隐私？', '只使用 GitHub 公开 API 的仓库信息（名称、描述、星标、话题等），不读取任何私有内容，也不需要你的账号。'],
    ];
    return `${pageHead('新手指南', '第一次来？3 分钟看懂', '不用懂 Git，不用会写代码，也不用登录。这里把 GitHub 上值得用的项目，整理成人能看懂的样子。')}
      <div class="feature-banner">
        <div class="eyebrow" style="color:rgba(255,255,255,.82)">给第一次逛 GitHub 的你</div>
        <h2>你不需要「会用 GitHub」，<br>也能找到好工具。</h2>
        <p>把它当成一个开源项目的「应用商店」：搜想做的事 → 用筛选缩小范围 → 看详情判断靠不靠谱 → 收藏起来。下面按这个顺序讲一遍。</p>
        <div class="fb-links"><a href="#/repos">直接开始逛 ↗</a><a href="#/install">装到我的设备 ↗</a></div>
      </div>

      ${sectionHead('四步上手', '照着点一遍就会了', '')}
      <div class="step-grid">
        ${steps.map((s) => `<div class="step-card">
          <div class="step-num">${s.n}</div>
          <div class="step-icon">${icon(s.icon, 20)}</div>
          <h3>${esc(s.title)}</h3><p>${esc(s.text)}</p>
          <a class="link-more" href="${s.link}">${esc(s.linkText)} ${icon('arrow-right', 13)}</a>
        </div>`).join('')}
      </div>

      ${sectionHead('挑项目的三个信号', '别只看星标', '')}
      <div class="tip-grid">
        <div class="tip-card"><b>⭐ 星标</b><p>人气初筛。10k 以上通常经过了大量用户检验，但老项目也可能只是「历史上很火」。</p></div>
        <div class="tip-card"><b>🕒 最近提交</b><p>比星标更重要。半年以上没动静，遇到 bug 大概率没人修。本站可以按「近 1 / 3 个月」过滤。</p></div>
        <div class="tip-card"><b>📄 许可证 + Issues</b><p>商用要看 License；Issue 有没有人回复，能看出维护者是否还在用心。</p></div>
      </div>

      ${sectionHead('术语小抄', '看不懂的词，这里都有人话解释', '')}
      <div class="glossary-grid">
        ${glossary.map(([t, d]) => `<div class="glossary-card"><b>${esc(t)}</b><p>${esc(d)}</p></div>`).join('')}
      </div>

      ${sectionHead('和 GitHub 官网的功能对照', '哪些这里能做，哪些要去官网', '')}
      <div class="panel" style="padding:0;overflow:hidden">
        <div class="compare-head"><span>能力</span><span>在哪里用</span><span>说明</span></div>
        ${compare.map(([a, b, c]) => `<div class="compare-row"><span>${esc(a)}</span>
          <span class="tag ${b.indexOf('本站') > -1 || b.indexOf('可选') > -1 ? 'tag-green' : 'tag-blue'}">${esc(b)}</span>
          <span class="muted">${esc(c)}</span></div>`).join('')}
      </div>
      <div class="callout" style="margin-top:14px">${icon('info', 17)} <span>本站是纯静态网站，没有服务器替你保存账号数据。凡是「写入 GitHub」的操作（Star、Fork、提 Issue、提 PR）都会安全地跳转到 GitHub 官方页面完成——这也正好是新手练习这些操作的最好方式。</span></div>

      ${sectionHead('常见问题', '', '')}
      <div class="faq-list">
        ${faq.map(([q, a], i) => `<details class="faq-item" ${i === 0 ? 'open' : ''}><summary>${esc(q)} ${icon('chevron-right', 14)}</summary><p>${esc(a)}</p></details>`).join('')}
      </div>

      <div class="guide-cta">
        <div><h3>想看更完整的说明？</h3><p class="muted">站内文档把部署、登录、源码浏览、常见问题都写全了，不用翻外部文件。</p></div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn" href="#/docs">${icon('book', 15)} 打开站内文档</a>
          <button class="btn btn-primary" data-act="smart-install">${icon('download', 15)} 下载安装</button>
        </div>
      </div>`;
  }

  /* ── 页面：源代码浏览（GitHub 风格代码页） ─────────── */
  function sourcePage(f) {
    const s = S.source;
    const gh = 'https://github.com/' + f;
    const q = (s.fileSearch || '').trim().toLowerCase();
    let items = SRC.listDir(s.tree, s.dir);
    if (q) items = (s.tree || []).filter((x) => x.type !== 'tree' && x.path.toLowerCase().includes(q)).slice(0, 60)
      .map((x) => ({ name: x.path.split('/').pop(), path: x.path, type: 'file', size: x.size || 0 }));

    const crumbs = [{ label: f.split('/').pop(), path: '' }].concat(
      s.dir ? s.dir.split('/').map((part, i, arr) => ({ label: part, path: arr.slice(0, i + 1).join('/') })) : []
    );
    const bread = crumbs.map((c, i) =>
      `${i ? '<span class="crumb-sep">/</span>' : ''}<button data-act="source-dir" data-v="${esc(c.path)}">${esc(c.label)}</button>`
    ).join('');

    const treeHtml = items.length ? items.map((it) => {
      const k = SRC.fileKind(it.name);
      const active = it.path === s.path ? ' active' : '';
      return `<button class="source-row${active}" data-act="source-open" data-v="${esc(it.path)}" data-type="${it.type}">
        <span class="sr-icon" style="color:${k.color}">${icon(it.type === 'dir' ? 'folder' : k.icon, 15)}</span>
        <span class="sr-name">${esc(it.name)}</span>
        ${it.type === 'file' ? `<span class="sr-size">${esc(SRC.formatSize(it.size))}</span>` : `<span class="sr-arrow">${icon('chevron-right', 12)}</span>`}
      </button>`;
    }).join('') : `<div class="source-empty">${q ? '没有匹配的文件' : s.loading ? '正在读取文件列表…' : '这个目录是空的'}</div>`;

    let contentHtml = '';
    if (s.error) {
      contentHtml = `<div class="empty-state"><div class="empty-icon">${icon('info', 40)}</div>
        <h3>暂时读不到内容</h3><p>${esc(s.error)}</p>
        <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">
          <button class="btn btn-primary" data-act="source-retry">重试</button>
          <a class="btn" href="${esc(gh)}" target="_blank" rel="noopener noreferrer">去 GitHub 查看</a></div></div>`;
    } else if (s.loading) {
      contentHtml = `<div class="source-loading">正在从 GitHub 读取${s.path ? '文件' : '仓库'}…</div>`;
    } else if (s.path) {
      const name = s.path.split('/').pop();
      const k = SRC.fileKind(name);
      const rawUrl = `https://raw.githubusercontent.com/${f}/${encodeURIComponent(s.branch || 'HEAD')}/${s.path.split('/').map(encodeURIComponent).join('/')}`;
      const body = k.kind === 'markdown' ? `<div class="source-md">${G.mdToHtml(s.content)}</div>`
        : k.kind === 'image' ? `<div class="source-img"><img src="${esc(rawUrl)}" alt="${esc(name)}"></div>`
        : k.kind === 'binary' ? `<div class="empty-state"><p>这个二进制文件不适合在网页里预览</p><a class="btn btn-sm" href="${esc(rawUrl)}" target="_blank" rel="noopener">下载 / 打开</a></div>`
        : SRC.renderCode(s.content, name);
      contentHtml = `<div class="source-file-head">
          <div><b>${icon('code', 15)} ${esc(s.path)}</b><small>${esc(SRC.formatSize((s.content || '').length))} · ${esc(s.branch)}</small></div>
          <div class="source-file-actions">
            <button class="btn btn-sm" data-act="source-copy">${icon('copy', 13)} 复制</button>
            <a class="btn btn-sm" href="${esc(rawUrl)}" target="_blank" rel="noopener noreferrer">${icon('download', 13)} 下载</a>
            <a class="btn btn-sm btn-ghost" href="${esc(gh)}/blob/${esc(s.branch)}/${esc(s.path)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          </div></div>${body}`;
    } else {
      contentHtml = `<div class="source-dir-view">
        <h3>${icon('folder', 18)} ${esc(s.dir || f.split('/').pop())}</h3>
        <p>左侧是文件树，点文件即可查看源代码、复制或下载。默认会打开项目的 README。</p>
        <div class="source-dir-list">${items.length ? items.map((it) => `<button data-act="source-open" data-v="${esc(it.path)}" data-type="${it.type}">
          ${icon(it.type === 'dir' ? 'folder' : 'code', 14)} <span>${esc(it.name)}</span></button>`).join('') : '<p class="muted">暂无内容</p>'}</div></div>`;
    }

    const branchOptions = (s.branches || []).map((b) =>
      `<option value="${esc(b.name)}" ${b.name === s.branch ? 'selected' : ''}>${esc(b.name)}</option>`).join('');

    return `${pageHead('源代码', esc(f), '像在 GitHub 里一样浏览文件树、源代码、README、提交、Issues 与 Releases。数据实时来自 GitHub 公开 API。')}
      <div class="source-toolbar">
        <div class="source-breadcrumb">${bread}</div>
        <div class="source-tools">
          <select class="mini-select" data-act="source-branch" title="切换分支">${branchOptions || `<option>${esc(s.branch || 'main')}</option>`}</select>
          <a class="btn btn-sm" href="https://codeload.github.com/${esc(f)}/zip/HEAD" target="_blank" rel="noopener noreferrer">${icon('download', 13)} ZIP</a>
          <a class="btn btn-sm btn-ghost" href="${esc(gh)}" target="_blank" rel="noopener noreferrer">${icon('github', 13)} GitHub</a>
        </div>
      </div>
      <div class="source-layout">
        <div class="source-tree">
          <div class="source-tree-head"><b>文件</b><span>${(s.tree || []).filter((x) => x.type !== 'tree').length} 个</span></div>
          <div class="search-inline" style="margin:0 10px 10px;min-width:0;height:32px">
            ${icon('search', 14)}<input id="sourceFileSearch" type="search" placeholder="按文件名搜索…" value="${esc(s.fileSearch || '')}" autocomplete="off">
          </div>
          <div class="source-tree-list">${treeHtml}</div>
        </div>
        <div class="source-main">${contentHtml}</div>
      </div>
      <div class="source-extra">
        ${!s.extrasLoaded ? `<div class="source-panel source-extra-cta">
          <h3>${icon('clock', 16)} 提交 / Issues / Releases</h3>
          <p class="muted" style="font-size:11.5px;margin:0 0 12px">为节省 GitHub API 匿名额度，这部分按需加载（额外 3 个公开接口）。</p>
          <button class="btn btn-sm" data-act="source-extras" ${s.extrasLoading ? 'disabled' : ''}>${s.extrasLoading ? '加载中…' : '加载最近动态'}</button>
        </div>` : [
          { title: '最近提交', icon: 'clock', list: (s.commits || []).map((c) => ({ t: (c.commit && c.commit.message || '').split('\n')[0], u: c.html_url, sub: (c.commit && c.commit.author && c.commit.author.name) || (c.author && c.author.login) || '' })) },
          { title: '开放中的 Issues', icon: 'issue', list: (s.issues || []).map((i) => ({ t: i.title, u: i.html_url, sub: '#' + i.number + ' · ' + ((i.user && i.user.login) || '') })) },
          { title: 'Releases', icon: 'tag', list: (s.releases || []).map((r) => ({ t: r.name || r.tag_name, u: r.html_url, sub: (r.published_at || '').slice(0, 10) })) },
        ].map((g) => `<div class="source-panel">
          <h3>${icon(g.icon, 16)} ${esc(g.title)}</h3>
          ${g.list.length ? g.list.map((x) => `<a class="source-feed" href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">
            <span>${esc(x.t)}</span><small>${esc(x.sub)}</small></a>`).join('') : '<p class="muted" style="font-size:11.5px">暂无数据或 API 额度不足</p>'}
        </div>`).join('')}
      </div>
      <div class="callout" style="margin-top:16px">${icon('info', 16)} <span>源码读取走 GitHub 公开 API：匿名每小时约 60 次。连接 GitHub 账号后额度提升到每小时 5000 次，也能读取你有权限的私有仓库。</span></div>`;
  }

  function notFound() {
    return `<div class="empty-state"><h3>页面不存在</h3><p>换个入口试试吧</p><a class="btn btn-primary" href="#/discover">回到发现</a></div>`;
  }

  /* ── 仓库详情抽屉（GitHub 风格：概览 / README / 参与贡献） ── */
  function drawerHtml(r) {
    if (!r) return '';
    const url = 'https://github.com/' + r.f;
    const zip = 'https://codeload.github.com/' + r.f + '/zip/HEAD';
    const faved = G.Store.isFav(r.f);
    const cats = (r.cat || []).map((k) => CAT_MAP[k]).filter(Boolean);
    const tab = S.drawerTab || 'overview';
    const links = [
      ['Star 列表', url + '/stargazers', 'star'],
      ['Fork 列表', url + '/forks', 'git-fork'],
      ['Issues', url + '/issues', 'issue'],
      ['Pull requests', url + '/pulls', 'code'],
      ['提交记录', url + '/commits', 'clock'],
      ['Releases', url + '/releases', 'tag'],
      ['贡献者', url + '/graphs/contributors', 'users'],
      ['项目 Wiki', url + '/wiki', 'book'],
    ];
    return `<div class="drawer-inner" data-repo="${esc(r.f)}">
      <button class="drawer-close" data-act="close-drawer" aria-label="关闭">${icon('x', 16)}</button>
      <div class="eyebrow" style="margin-top:6px">开源项目详情</div>
      <div class="d-owner">${repoAvatar(r, 42)}<div><b style="font-size:13px">${esc(r.o)}</b>
        <div style="font-size:11px;color:var(--text-3)">创建于 ${esc(r.c || '—')} · ${timeAgo(r.c)}</div></div></div>
      <h2 class="d-title">${esc(r.n)}</h2>
      <p class="d-desc">${esc(r.d || '这个项目没有填写描述。')}</p>
      <div class="d-stats">
        <div class="d-stat"><b style="color:var(--orange)">${fmtNum(r.s)}</b><small>Stars</small></div>
        <div class="d-stat"><b>${fmtNum(r.fk)}</b><small>Forks</small></div>
        <div class="d-stat"><b>${fmtNum(r.is)}</b><small>Issues</small></div>
        <div class="d-stat"><b>${esc(r.c ? r.c.slice(0, 4) : '—')}</b><small>创建年份</small></div>
      </div>
      <div class="d-tabs" role="tablist">
        <button class="d-tab ${tab === 'overview' ? 'active' : ''}" data-act="drawer-tab" data-v="overview">概览</button>
        <button class="d-tab ${tab === 'readme' ? 'active' : ''}" data-act="drawer-tab" data-v="readme">README</button>
        <button class="d-tab ${tab === 'contribute' ? 'active' : ''}" data-act="drawer-tab" data-v="contribute">参与贡献</button>
      </div>

      <div class="d-panel" id="dPanelOverview" ${tab !== 'overview' ? 'hidden' : ''}>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px">
          ${cats.map((c) => `<a class="tag" style="color:${c.color};border-color:${c.color}44" href="#/category/${c.slug}">${esc(c.label)}</a>`).join('')}
          ${r.l ? `<span class="tag"><i class="lang-dot" style="background:${langColor(r.l)}"></i>&nbsp;${esc(r.l)}</span>` : ''}
          ${(r.t || []).map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}
        </div>
        ${r.l ? `<div class="lang-bar" title="主要语言 ${esc(r.l)}"><span style="width:100%;background:${langColor(r.l)}"></span></div>
          <div class="lang-legend">主要语言：${esc(r.l)}</div>` : ''}
        <div class="d-meta">
          <div class="d-meta-row"><span>仓库地址</span><span style="color:var(--blue);word-break:break-all;text-align:right">${esc(r.f)}</span></div>
          <div class="d-meta-row"><span>最近提交</span><span>${esc(r.p || '—')} · ${timeAgo(r.p)}</span></div>
          <div class="d-meta-row"><span>开源许可证</span><span>${esc(r.lic || '未声明（商用前请确认）')}</span></div>
          <div class="d-meta-row"><span>维护状态</span><span>${r.a ? '已归档（只读）' : '有近期提交'}</span></div>
          ${r.h ? `<div class="d-meta-row"><span>项目主页</span><a href="${esc(r.h)}" target="_blank" rel="noopener noreferrer" style="color:var(--blue)">${esc(domain(r.h))} ↗</a></div>` : ''}
        </div>
        ${sectionHead('像在 GitHub 里一样继续看', '这些入口会跳到 GitHub 官方页面', '')}
        <div class="d-links">
          ${links.map(([label, href, ic]) => `<a class="d-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${icon(ic, 15)}<span>${esc(label)}</span>${icon('arrow-up-right', 12)}</a>`).join('')}
        </div>
        <div class="callout" style="margin-top:16px">${icon('info', 16)} <span>Star、Fork、提 Issue、提 PR 都需要 GitHub 账号，点击上方入口到官网完成，本站不代你操作账号。</span></div>
      </div>

      <div class="d-panel" id="dPanelReadme" ${tab !== 'readme' ? 'hidden' : ''}>
        <div class="md-source">${icon('book', 15)} README · <a href="${esc(url)}#readme" target="_blank" rel="noopener noreferrer">在 GitHub 查看原文 ↗</a></div>
        <div id="dReadme"><div class="md-loading">正在读取项目说明书…</div></div>
      </div>

      <div class="d-panel" id="dPanelContribute" ${tab !== 'contribute' ? 'hidden' : ''}>
        <div class="callout">${icon('graduation', 17)} <span>第一次给开源项目做贡献？按下面四步走，全程在 GitHub 官网完成，本站只负责帮你找到合适的项目。</span></div>
        <div class="step-grid" style="margin-top:16px">
          ${[['01', '先读 README 和 CONTRIBUTING', '了解项目怎么跑起来、有什么约定。'], ['02', '找一张「good first issue」', '维护者专门留给新人的简单任务。'], ['03', 'Fork → 改 → 提 PR', '在自己账号下改，再请求合并回去。'], ['04', '等反馈、继续迭代', '维护者可能会提修改意见，很正常。']].map(([n, t, d]) => `<div class="step-card"><div class="step-num">${n}</div><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`).join('')}
        </div>
        <div class="d-actions" style="margin-top:18px">
          <a class="btn btn-primary" href="${esc(url)}/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22" target="_blank" rel="noopener noreferrer">${icon('issue', 15)} 找新手任务</a>
          <a class="btn" href="${esc(url)}/fork" target="_blank" rel="noopener noreferrer">${icon('git-fork', 15)} Fork 项目</a>
          <a class="btn btn-ghost" href="https://docs.github.com/zh/get-started" target="_blank" rel="noopener noreferrer">${icon('book', 15)} GitHub 官方入门文档</a>
        </div>
      </div>

      <div class="divider"></div>
      <div class="d-actions">
        <a class="btn btn-primary" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${icon('github', 15)} 在 GitHub 打开</a>
        <a class="btn" href="#/source?repo=${encodeURIComponent(r.f)}">${icon('code', 15)} 浏览源代码</a>
        <button class="btn ${faved ? 'faved' : ''}" data-act="fav" data-f="${esc(r.f)}">${icon('heart', 15)} ${faved ? '已收藏' : '收藏'}</button>
        <button class="btn" data-act="share" data-f="${esc(r.f)}">${icon('share', 15)} 分享</button>
        <a class="btn" href="${esc(zip)}" target="_blank" rel="noopener noreferrer">${icon('download', 15)} 下载 ZIP</a>
        <button class="btn btn-ghost" data-act="copy" data-v="git clone ${esc(url)}.git">${icon('copy', 15)} 复制 clone</button>
      </div>
      <div style="font-size:11px;color:var(--text-4);line-height:1.7;margin-top:16px">数据由 GitHub 公开 API 自动收录，索引更新于 ${new Date(META.updatedAt || Date.now()).toLocaleDateString('zh-CN')}。Star 数为抓取时快照，以 GitHub 页面为准。</div>
    </div>`;
  }

  /* ── 命令面板数据 ───────────────────────────────── */
  function cmdkData(q) {
    const query = (q || '').trim().toLowerCase();
    const groups = [];
    const match = (text) => !query || String(text || '').toLowerCase().includes(query);

    if (!query) {
      groups.push({ title: '快速前往', items: [
        { icon: 'compass', name: '发现', sub: '首页推荐与热门项目', href: '#/discover' },
        { icon: 'grid', name: '全部仓库', sub: '搜索与筛选', href: '#/repos' },
        { icon: 'sparkles', name: 'AI 导航', sub: '精选 AI 工具', href: '#/ai' },
        { icon: 'plug', name: 'MCP 生态', sub: '协议与服务端', href: '#/feature/mcp' },
        { icon: 'book', name: '博客 & 论文', sub: '经典论文与技术博客', href: '#/reading' },
        { icon: 'flame', name: '趋势榜', sub: '最近还在维护的高星项目', href: '#/trending' },
        { icon: 'info', name: '新手指南', sub: '3 分钟看懂怎么用', href: '#/guide' },
        { icon: 'download', name: '一键安装', sub: '装到手机或电脑', href: '#/install' },
      ]});
      groups.push({ title: '热门项目', items: REPOS.slice(0, 5).map((r) => ({ icon: 'github', name: r.f, sub: r.d, star: '★ ' + fmtNum(r.s), act: 'repo', f: r.f })) });
      return groups;
    }

    const repos = REPOS.filter((r) => match(`${r.f} ${r.d} ${(r.t || []).join(' ')} ${r.l}`)).slice(0, 7)
      .map((r) => ({ icon: 'github', name: r.f, sub: r.d, star: '★ ' + fmtNum(r.s), act: 'repo', f: r.f }));
    if (repos.length) groups.push({ title: '开源仓库', items: repos });

    const cats = CATEGORIES.filter((c) => match(`${c.label} ${c.slug} ${c.desc}`)).slice(0, 4)
      .map((c) => ({ icon: c.icon, name: c.label, sub: c.desc, href: '#/category/' + c.slug }));
    if (cats.length) groups.push({ title: '分类', items: cats });

    const pages = [
      { icon: 'info', name: '新手指南', sub: '3 分钟看懂、术语小抄、常见问题', href: '#/guide', kw: '新手 指南 帮助 教程 help 入门' },
      { icon: 'flame', name: '趋势榜', sub: '最近还在维护的高星项目', href: '#/trending', kw: '趋势 trending 热门 活跃' },
      { icon: 'download', name: '下载安装', sub: '按 Windows / macOS / Linux / Android / iOS 分类', href: '#/install', kw: '安装 install 下载 客户端 pwa windows mac' },
      { icon: 'book', name: '使用文档', sub: '全部说明与内置脚本', href: '#/docs', kw: '文档 readme 帮助 说明 docs' },
      { icon: 'user', name: '账号与登录', sub: '邮箱 / 手机验证码、GitHub 连接', href: '#/account', kw: '登录 账号 验证码 注册 login' },
      { icon: 'star', name: '星标榜单', sub: '按 Star 分层', href: '#/ranking', kw: '榜单 排名 star 排行' },
      { icon: 'users', name: 'AI 社区', sub: '去有人讨论的地方', href: '#/community', kw: '社区 论坛 讨论' },
    ].filter((p) => match(`${p.name} ${p.sub} ${p.kw}`));
    if (pages.length) groups.push({ title: '页面', items: pages });

    const tools = [];
    (CATALOG.aiNav || []).forEach((g) => g.items.forEach((it) => { if (match(`${it.n} ${it.d} ${it.t}`)) tools.push({ icon: 'sparkles', name: it.n, sub: it.d, href: it.u, external: true }); }));
    (CATALOG.community || []).forEach((g) => g.items.forEach((it) => { if (match(`${it.n} ${it.d}`)) tools.push({ icon: 'users', name: it.n, sub: it.d, href: it.u, external: true }); }));
    if (tools.length) groups.push({ title: 'AI 导航 / 社区', items: tools.slice(0, 5) });

    const reads = [];
    (CATALOG.papers || []).forEach((p) => { if (match(`${p.n} ${p.d} ${p.t}`)) reads.push({ icon: 'book', name: p.n, sub: p.d, href: p.u, external: true }); });
    (CATALOG.blogs || []).forEach((b) => { if (match(`${b.n} ${b.d}`)) reads.push({ icon: 'book', name: b.n, sub: b.d, href: b.u, external: true }); });
    if (reads.length) groups.push({ title: '博客 / 论文', items: reads.slice(0, 4) });

    Object.entries(CATALOG.featured || {}).forEach(([k, f]) => {
      if (match(`${f.title} ${f.subtitle} ${k}`)) groups.push({ title: '专题', items: [{ icon: 'layers', name: f.title, sub: f.subtitle, href: '#/feature/' + k }] });
    });

    if (!groups.length) groups.push({ title: '没有匹配结果', items: [{ icon: 'search', name: '在 GitHub 全站搜索「' + q + '」', sub: '打开仓库库并启用实时搜索', action: 'remote-search', v: q }] });
    return groups;
  }

  w.GH.Views = {
    S, NAV, TABS, REPOS, META, CATEGORIES, CAT_MAP, TIERS, CATALOG, byFullName,
    navHtml, tabbarHtml, filterRepos, repoGridHtml, drawerHtml, cmdkData, toolCard,
    discover, reposPage, categoriesPage, rankingPage, trendingPage, guidePage, sourcePage,
    aiNavPage, communityPage, readingPage, featurePage, favoritesPage,
    installPage, settingsPage, notFound,
  };
})(window);
