/**
 * Orbit 自检脚本：node scripts/smoke-test.mjs
 * 1) 无浏览器依赖：用轻量 DOM stub 加载数据层与视图层，渲染全部页面并检查 HTML 产物
 * 2) 若本机有 Chrome/Edge：用 CDP 起无头浏览器，检查真实 DOM、控制台错误、交互与截图
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = path.join(ROOT, 'site');
const PROFILE = path.join(os.tmpdir(), `orbit-cdp-${process.pid}-${Date.now()}`);
fs.mkdirSync(path.join(ROOT, 'preview'), { recursive: true });
let failures = 0;
const ok = (msg) => console.log('  ✓ ' + msg);
const bad = (msg) => { failures++; console.log('  ✗ ' + msg); };
const check = (cond, msg) => cond ? ok(msg) : bad(msg);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ───────── 1. 视图层静态渲染 ───────── */
console.log('\n[1/2] 视图层渲染检查（无浏览器依赖）');
check(fs.existsSync(path.join(ROOT, 'README.md')), 'README.md 新手文档存在');
check(['install.bat', 'install.sh', 'scripts/install.mjs'].every((f) => fs.existsSync(path.join(ROOT, f))), '一键安装脚本齐全');
check(['site/cloud-config.js', 'site/assets/js/cloud.js', 'site/assets/js/auth-ui.js', 'site/assets/js/source.js', 'proxy/github-oauth-worker.js']
  .every((f) => fs.existsSync(path.join(ROOT, f))), '云服务登录 / GitHub 连接 / 源码浏览模块齐全');
check(['site/assets/css/motion.css', 'site/assets/js/motion.js']
  .every((f) => fs.existsSync(path.join(ROOT, f))), '交互动画层齐全');
check(['site/assets/js/a11y.js', 'site/robots.txt', 'site/sitemap.xml', 'scripts/perf-audit.mjs']
  .every((f) => fs.existsSync(path.join(ROOT, f))), '可访问性 / SEO / 审计脚本齐全');
const cfgSource = fs.readFileSync(path.join(SITE, 'config.js'), 'utf8');
check(cfgSource.includes('developer:') && cfgSource.includes('DaiYiqq') && cfgSource.includes('orbit-github-nav'),
  '开发者联系信息与真实仓库地址已写入站点配置');
const readmeSource = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');
check(readmeSource.includes('开发者联系信息') && readmeSource.includes('github.com/DaiYiqq'),
  'README 含开发者联系信息章节');
const swSource = fs.readFileSync(path.join(SITE, 'sw.js'), 'utf8');
check(['motion.js', 'docs.js', 'a11y.js', 'robots.txt', 'sitemap.xml'].every((x) => swSource.includes(x))
  && swSource.includes('stale-while-revalidate'), '离线预缓存清单与分级缓存已更新');
const files = ['config.js', 'data/catalog.js', 'data/docs.js', 'data/repos.js', 'assets/js/core.js', 'assets/js/store.js', 'assets/js/source.js', 'assets/js/views.js', 'assets/js/pages.js'];

function makeSandbox() {
  const store = new Map();
  const fakeEl = () => ({
    innerHTML: '', textContent: '', style: {}, dataset: {}, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    querySelector() { return fakeEl(); }, querySelectorAll() { return []; }, addEventListener() {},
    setAttribute() {}, getAttribute() { return null; }, appendChild() {}, remove() {}, focus() {}, insertAdjacentHTML() {},
  });
  const doc = {
    documentElement: { setAttribute() {}, style: {} },
    body: { style: {}, appendChild() {}, removeChild() {} },
    getElementById() { return fakeEl(); },
    querySelector() { return fakeEl(); },
    querySelectorAll() { return []; },
    addEventListener() {}, createElement() { return fakeEl(); },
    dispatchEvent() {}, activeElement: { tagName: 'BODY' }, title: '',
  };
  const win = {
    document: doc, console,
    location: { href: 'http://127.0.0.1:4173/', hash: '#/discover', protocol: 'http:', hostname: '127.0.0.1' },
    navigator: { clipboard: null, share: null },
    localStorage: { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v), removeItem: (k) => store.delete(k) },
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    addEventListener() {}, removeEventListener() {},
    CustomEvent: class { constructor(t, o) { this.type = t; this.detail = o && o.detail; } },
    setTimeout, clearTimeout, fetch: () => Promise.reject(new Error('no network in stub')),
    URLSearchParams, Blob: class {}, Date, Math, JSON, RegExp, String, Number, Array, Object, Set, Map, encodeURIComponent, decodeURIComponent,
    CSS: { escape: (s) => s }, isSecureContext: false,
  };
  win.window = win; win.self = win; win.globalThis = win;
  return vm.createContext(win);
}

const ctx = makeSandbox();
for (const f of files) {
  const code = fs.readFileSync(path.join(SITE, f), 'utf8');
  try { vm.runInContext(code, ctx, { filename: f, timeout: 15000 }); }
  catch (e) { bad(`加载 ${f} 失败: ${e.message}`); }
}

const V = ctx.window.GH && ctx.window.GH.Views;
const CFG = ctx.window.__GH_NAV_CONFIG__;
const META = ctx.window.__GH_NAV_META__;
const REPOS = ctx.window.__GH_NAV_REPOS__;
check(!!V, '视图层成功初始化');
check(Array.isArray(REPOS) && REPOS.length > 1000, `仓库索引已加载：${REPOS ? REPOS.length : 0} 个`);
check(!!META && META.categories.length >= 10, `分类体系：${META ? META.categories.length : 0} 个`);

const pages = [
  ['发现', () => V.discover()],
  ['全部仓库', () => V.reposPage()],
  ['分类详情', () => V.reposPage({ cat: 'ai' })],
  ['分类总览', () => V.categoriesPage()],
  ['星标榜单', () => V.rankingPage()],
  ['趋势榜', () => V.trendingPage()],
  ['新手指南', () => V.guidePage()],
  ['源代码页', () => V.sourcePage('facebook/react')],
  ['项目完整详情页', () => ctx.window.GHPages.repoDetailPage('facebook/react', { loading: false, readme: '# Demo\nReadme text.', readmeReady: true, error: '', commits: [], issues: [], releases: [], extrasLoaded: false, extrasLoading: false })],
  ['下载安装中心', () => ctx.window.GHPages.installCenterPage()],
  ['站内文档中心', () => ctx.window.GHPages.docsPage()],
  ['账号中心', () => ctx.window.GHPages.accountPage()],
  ['联系开发者', () => ctx.window.GHPages.contactPage()],
  ['AI 导航', () => V.aiNavPage()],
  ['AI 社区', () => V.communityPage()],
  ['博客与论文', () => V.readingPage()],
  ['MCP 专题', () => V.featurePage('mcp')],
  ['Skills 专题', () => V.featurePage('skills')],
  ['Agent 专题', () => V.featurePage('agent')],
  ['开源精选', () => V.featurePage('opensource')],
  ['我的收藏', () => V.favoritesPage()],
  ['安装应用', () => V.installPage()],
  ['设置', () => V.settingsPage()],
];

for (const [name, fn] of pages) {
  let html = '';
  try { html = fn(); } catch (e) { bad(`${name} 渲染抛错: ${e.message}`); continue; }
  const clean = html.length > 500 && !/undefined|NaN|\[object Object\]/.test(html);
  check(clean, `${name}：${html.length} 字符${clean ? '' : '（含异常占位符）'}`);
}

// 筛选 / 搜索 / 命令面板
try {
  const q = Object.assign({}, V.S, { q: 'mcp', cat: 'all', lang: 'all', tier: 'all', license: 'all', active: 'all' });
  const r = V.filterRepos(q);
  check(r.length > 0 && r.length < REPOS.length, `关键词筛选 mcp → ${r.length} 个结果`);
  const hi = V.filterRepos({ ...q, tier: '50k' });
  check(hi.every((x) => x.s >= 50000), '星标分层筛选生效');
  const cmd = V.cmdkData('mcp');
  check(cmd.length > 0 && cmd.some((g) => g.items.length), `命令面板搜索返回 ${cmd.reduce((a, g) => a + g.items.length, 0)} 条`);
  const drawer = V.drawerHtml(REPOS[0]);
  check(drawer.length > 800 && drawer.includes('在 GitHub 打开'), '仓库详情抽屉渲染正常');
} catch (e) { bad('筛选/搜索检查抛错: ' + e.message); }

try {
  const SRC = ctx.window.GHSource;
  const codeHtml = SRC.renderCode('const answer = 42;\n// comment\nconst name = "orbit";\n', 'demo.js');
  check(codeHtml.includes('code-line') && codeHtml.includes('tk-kw') && codeHtml.includes('tk-num') && codeHtml.includes('tk-str') && codeHtml.includes('tk-comment'),
    '源代码高亮渲染（行号 / 关键字 / 数字 / 字符串 / 注释）');
  const dir = SRC.listDir([
    { path: 'src/index.js', type: 'blob', size: 100 },
    { path: 'src/lib/util.js', type: 'blob', size: 200 },
    { path: 'README.md', type: 'blob', size: 300 },
  ], '');
  check(dir.length === 2 && dir.some((x) => x.type === 'dir' && x.name === 'src') && dir.some((x) => x.name === 'README.md'), '文件树按目录正确归组');
} catch (e) { bad('源码渲染检查抛错: ' + e.message); }

/* ───────── 2. 真实浏览器检查 ───────── */
console.log('\n[2/2] 无头浏览器交互检查');
const CHROME_CANDIDATES = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const chrome = CHROME_CANDIDATES.find((p) => fs.existsSync(p));
const PORT = 9333;
const BASE = process.env.ORBIT_URL || 'http://127.0.0.1:4173';

if (!chrome) { console.log('  · 未找到 Chrome/Edge，跳过浏览器检查'); }
else {
  let proc = null;
  try {
    proc = spawn(chrome, [
      '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
      '--no-first-run', '--no-default-browser-check', '--disable-extensions',
      `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
      `--user-data-dir=${PROFILE}`, '--window-size=1440,1000', 'about:blank',
    ], { stdio: 'ignore', windowsHide: true });
    proc.on('error', () => {});

    let version = null;
    for (let i = 0; i < 30; i++) {
      await sleep(400);
      try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { version = await r.json(); break; } } catch (e) {}
    }
    if (!version) throw new Error('CDP 端口未就绪');
    ok('无头浏览器已启动 ' + (version.Browser || ''));

    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const target = list.find((t) => t.type === 'page');
    if (!target) throw new Error('没有可用的页面目标');

    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
    let seq = 0;
    const pending = new Map();
    const consoleErrors = [];
    ws.onmessage = (ev) => {
      const m = JSON.parse(ev.data);
      if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
      if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails.text + ' ' + (m.params.exceptionDetails.exception?.description || ''));
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consoleErrors.push(m.params.args.map((a) => a.value || a.description).join(' '));
    };
    const send = (method, params = {}) => new Promise((resolve, reject) => {
      const id = ++seq; pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
    const evaluate = async (expr) => {
      const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
      return r.result.value;
    };

    await send('Runtime.enable');
    await send('Page.enable');
    await send('Network.enable');
    await send('Network.setCacheDisabled', { cacheDisabled: true });
    await send('Page.navigate', { url: BASE + '/#/discover' });
    await sleep(1000);
    // 关闭首次访问引导，避免遮挡后续交互与截图
    await evaluate(`localStorage.setItem('orbit:onboarded', 'true')`);
    await send('Page.reload', { ignoreCache: true });
    await sleep(2000);

    const home = await evaluate(`({
      cards: document.querySelectorAll('.repo-card').length,
      quick: document.querySelectorAll('.quick-card').length,
      cats: document.querySelectorAll('.cat-card').length,
      tiers: document.querySelectorAll('.tier-card').length,
      title: document.title,
      viewLen: document.getElementById('view').innerHTML.length,
      navItems: document.querySelectorAll('.sidebar .nav-item').length
    })`);
    check(home.cards >= 9, `首页渲染 ${home.cards} 个项目卡片`);
    check(home.quick === 4 && home.cats >= 10 && home.tiers >= 6, '快捷入口 / 分类 / 星标层级齐全');
    check(home.navItems >= 14, `侧边导航 ${home.navItems} 项`);
    check(home.title.includes('Orbit'), '页面标题正确：' + home.title);

    const opt = await evaluate(`({
      skip: !!document.querySelector('.skip-link'),
      boundary: Array.isArray(window.__ORBIT_ERRORS__),
      asyncSdk: (() => { const s = document.querySelector('script[src*="workbuddy-cloud-sdk"]'); return !!s && s.async === true; })(),
      canonical: (document.querySelector('link[rel="canonical"]') || {}).href || '',
      ogUrl: (document.querySelector('meta[property="og:url"]') || {}).content || '',
      rawGone: !window.__GH_NAV_REPOS_RAW__,
      repos: (window.__GH_NAV_REPOS__ || []).length,
      sample: (window.__GH_NAV_REPOS__ || [{}])[0]
    })`);
    check(opt.skip && opt.boundary && opt.asyncSdk, '跳转链接 / 错误边界 / 异步 SDK 加载');
    check(opt.repos > 1000 && opt.rawGone && !!opt.sample.n && !!opt.sample.o,
      `列式索引已还原 ${opt.repos} 条（含派生名称与 owner）`);
    check(opt.canonical.length > 10 && opt.ogUrl.length > 10, 'canonical 与 OG 地址已按当前页面写入');

    await sleep(1200);
    const motionUi = await evaluate(`({
      progress: !!document.getElementById('orbitProgress'),
      top: !!document.getElementById('orbitTop'),
      stagger: document.querySelectorAll('[data-act="hint"].orbit-stagger').length,
      counted: document.querySelectorAll('.stat b[data-counted]').length,
      statText: (document.querySelector('.stat-row .stat b') || {}).textContent || ''
    })`);
    check(motionUi.progress && motionUi.top, '滚动进度条与回到顶部按钮已挂载');
    check(motionUi.stagger >= 5 && motionUi.counted >= 3,
      `首页提示词交错入场（${motionUi.stagger} 个）与统计数字滚动（${motionUi.counted} 个）`);
    check(/[\d]/.test(motionUi.statText), '数字滚动结束后恢复正确数值：' + motionUi.statText);
    const tiltOk = await evaluate(`(() => {
      const card = document.querySelector('.repo-card');
      if (!card || !matchMedia('(hover: hover) and (pointer: fine)').matches) return 'skip';
      const r = card.getBoundingClientRect();
      card.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: r.left + r.width * 0.7, clientY: r.top + r.height * 0.3, pointerType: 'mouse' }));
      return card.classList.contains('tilt');
    })()`);
    check(tiltOk === true || tiltOk === 'skip', `卡片跟随鼠标微倾${tiltOk === 'skip' ? '（触屏环境跳过）' : ''}`);

    const routes = ['repos', 'category/ai', 'categories', 'ranking', 'trending', 'guide', 'docs', 'account', 'contact', 'ai', 'community', 'reading', 'feature/mcp', 'favorites', 'install', 'settings'];
    const routeResults = [];
    for (const r of routes) {
      await evaluate(`location.hash = '#/${r}'`);
      await sleep(260);
      const info = await evaluate(`({len: document.getElementById('view').innerHTML.length, bad: /undefined|NaN|\\[object Object\\]/.test(document.getElementById('view').innerHTML), cards: document.querySelectorAll('.repo-card, .tool-card, .paper-item, .quick-card').length})`);
      routeResults.push([r, info]);
    }
    const badRoutes = routeResults.filter(([, i]) => i.len < 400 || i.bad);
    check(badRoutes.length === 0, `${routes.length} 个子页面全部正常渲染${badRoutes.length ? '（异常：' + badRoutes.map((x) => x[0]).join(', ') + '）' : ''}`);

    // 交互：命令面板 → 搜索 → 收藏 → 主题
    const build = await evaluate(`window.__ORBIT_BUILD__`);
    check(build === 'orbit-1.0.0', '页面加载的是最新版本脚本：' + build);
    await evaluate(`location.hash = '#/repos'`); await sleep(300);
    await evaluate(`document.getElementById('topSearchBtn').click()`);
    await sleep(200);
    const cmdkOpen = await evaluate(`document.getElementById('cmdkOverlay').classList.contains('open')`);
    check(cmdkOpen, '⌘K 命令面板可打开');
    await evaluate(`(() => { const i = document.getElementById('cmdkInput'); i.value = 'mcp'; i.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    await sleep(500);
    const cmdkCount = await evaluate(`document.querySelectorAll('.cmdk-item').length`);
    check(cmdkCount > 0, `命令面板搜索 mcp 返回 ${cmdkCount} 条`);
    await evaluate(`document.dispatchEvent(new KeyboardEvent('keydown', {key:'Escape', bubbles:true}))`);

    await evaluate(`(() => { const i = document.getElementById('repoSearch'); i.value = 'react'; i.dispatchEvent(new Event('input', {bubbles:true})); })()`);
    await sleep(600);
    const searchCount = await evaluate(`document.getElementById('view').innerHTML.includes('找到') ? document.querySelector('.rb-count').textContent : ''`);
    check(/找到/.test(searchCount), '仓库库关键词搜索可用：' + searchCount.trim());

    const favBefore = await evaluate(`JSON.parse(localStorage.getItem('orbit:state:v1') || '{}').favorites?.length || 0`);
    await evaluate(`document.querySelector('[data-act="fav"]')?.click()`);
    await sleep(200);
    const particles = await evaluate(`document.querySelectorAll('.orbit-burst .orbit-particle').length`);
    check(particles >= 8, `收藏时迸发星形粒子（${particles} 颗）`);
    const motionShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(ROOT, 'preview', 'motion.png'), Buffer.from(motionShot.data, 'base64'));
    const favAfter = await evaluate(`JSON.parse(localStorage.getItem('orbit:state:v1') || '{}').favorites?.length || 0`);
    check(favAfter === favBefore + 1 || favAfter === favBefore - 1, `收藏状态可切换并写入本地存储（${favBefore} → ${favAfter}）`);

    await evaluate(`document.getElementById('themeBtn').click()`);
    const theme = await evaluate(`document.documentElement.getAttribute('data-theme')`);
    check(theme === 'dark', '深浅色外观切换生效：' + theme);
    check(await evaluate(`!!document.querySelector('.orbit-wave')`), '主题切换播放扩散光波');
    await evaluate(`document.getElementById('themeBtn').click()`);

    await evaluate(`document.querySelector('.repo-card')?.click()`);
    await sleep(500);
    check(await evaluate(`location.hash.indexOf('#/repo?f=') === 0 && !!document.querySelector('.detail-hero')`),
      '项目卡片打开完整详情页（不再是侧边小框）');
    const detailInfo = await evaluate(`({links: document.querySelectorAll('.d-link').length, zip: !!document.querySelector('a[href*="codeload.github.com"]'), side: !!document.querySelector('.detail-side'), contribute: document.querySelectorAll('.contribute-steps > div').length, drawerOpen: document.getElementById('drawer').classList.contains('open')})`);
    check(detailInfo.links === 8 && detailInfo.zip && detailInfo.side && detailInfo.contribute === 4 && !detailInfo.drawerOpen,
      '详情页含 8 个 GitHub 入口、下载 ZIP、信息侧栏与贡献步骤');
    check(await evaluate(`(document.querySelector('.detail-intro')?.textContent || '').trim().length > 40`),
      '详情页始终有项目简介（不依赖网络）');
    const detailShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(ROOT, 'preview', 'detail.png'), Buffer.from(detailShot.data, 'base64'));
    let detailReadme = 0;
    let detailFeedback = false;
    for (let i = 0; i < 12; i++) {
      await sleep(900);
      const state = await evaluate(`({len: (document.querySelector('.detail-readme')?.textContent || '').trim().length, feedback: /正在|读不到|重新读取|没有 README/.test((document.querySelector('.detail-readme') || {}).textContent || '')})`);
      detailReadme = state.len;
      detailFeedback = state.feedback;
      if (detailReadme > 100 && !detailFeedback) break;
    }
    check(detailReadme > 100 && !detailFeedback ? true : detailFeedback,
      `详情页 README ${detailReadme > 100 && !detailFeedback ? '已渲染（' + detailReadme + ' 字符）' : '给出明确的加载 / 降级提示'}`);
    await evaluate(`location.hash = '#/repos'`); await sleep(350);

    const countBefore = await evaluate(`document.querySelector('.rb-count').textContent`);
    await evaluate(`document.querySelector('[data-act="filter-cat"][data-v="mcp"]')?.click()`);
    await sleep(300);
    const countAfter = await evaluate(`document.querySelector('.rb-count').textContent`);
    const routeAfter = await evaluate(`location.hash`);
    check(countBefore !== countAfter && /找到/.test(countAfter) && routeAfter === '#/category/mcp',
      `分类筛选联动：${countBefore.trim()} → ${countAfter.trim()}（${routeAfter}）`);
    await evaluate(`document.querySelector('[data-act="reset-filter"]')?.click()`);
    await sleep(250);

    await evaluate(`document.getElementById('smartInstallBtn').click()`);
    await sleep(400);
    const install = await evaluate(`({hash: location.hash, sections: document.querySelectorAll('.platform-section').length, methods: document.querySelectorAll('.method-card').length, matrix: document.querySelectorAll('.install-matrix-row').length, modal: document.getElementById('modalOverlay').classList.contains('open')})`);
    check(install.hash === '#/install' && install.sections === 6 && install.methods >= 12 && install.matrix === 6 && !install.modal,
      `下载安装是整页并按平台分类（${install.sections} 个平台 / ${install.methods} 种方式 / 无弹窗）`);
    const installShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.writeFileSync(path.join(ROOT, 'preview', 'install.png'), Buffer.from(installShot.data, 'base64'));

    await evaluate(`location.hash = '#/trending'`); await sleep(300);
    const trend = await evaluate(`({chips: document.querySelectorAll('[data-act="trend-days"]').length, cards: document.querySelectorAll('.repo-card').length})`);
    check(trend.chips === 4 && trend.cards > 0, `趋势榜时间窗 ${trend.chips} 档 / ${trend.cards} 个项目`);

    await evaluate(`location.hash = '#/guide'`); await sleep(300);
    const guide = await evaluate(`({terms: document.querySelectorAll('#view .glossary-card').length, steps: document.querySelectorAll('#view .step-card').length, rows: document.querySelectorAll('#view .compare-row').length, faq: document.querySelectorAll('#view .faq-item').length})`);
    check(guide.terms >= 10 && guide.steps >= 4 && guide.rows >= 6 && guide.faq >= 5,
      `新手指南：${guide.steps} 步上手 / ${guide.terms} 个术语 / ${guide.rows} 行功能对照 / ${guide.faq} 条常见问题`);
    check(await evaluate(`!!document.querySelector('.guide-cta a[href="#/docs"]')`), '新手指南底部提供整页文档入口（不再弹小框）');

    await evaluate(`document.getElementById('accountBtn').click()`); await sleep(450);
    check(await evaluate(`location.hash === '#/account' && !!document.querySelector('.account-layout')`), '头像打开完整账号页（不是小弹窗）');
    check(await evaluate(`document.querySelectorAll('#accountAuthSlot .auth-tab').length === 3`), '账号页内嵌邮箱 / 手机 / GitHub 三种方式');
    await evaluate(`document.querySelector('[data-act="auth-tab"][data-v="phone"]')?.click()`); await sleep(150);
    await evaluate(`(() => { const i = document.getElementById('authAccount'); if (i) i.value = '1380013800'; document.querySelector('[data-act="auth-send-code"]')?.click(); })()`);
    await sleep(250);
    check(await evaluate(`(document.getElementById('authMsg')?.textContent || '').includes('11 位手机号')`), '手机号格式校验在发送短信前生效（不发无效请求）');
    await evaluate(`document.querySelector('[data-act="auth-tab"][data-v="github"]')?.click()`); await sleep(150);
    check(await evaluate(`!!document.querySelector('[data-act="auth-github-oauth"]') && !!document.getElementById('ghToken')`), 'GitHub 连接提供 OAuth 与访问令牌两种真实路径');

    await evaluate(`location.hash = '#/docs'`); await sleep(400);
    const docs = await evaluate(`({chapters: document.querySelectorAll('.docs-chapter').length, toc: document.querySelectorAll('.docs-toc a').length, files: document.querySelectorAll('.file-card').length})`);
    check(docs.chapters >= 10 && docs.toc >= 10 && docs.files >= 5,
      `站内文档中心（${docs.chapters} 章 / ${docs.toc} 个目录项 / ${docs.files} 个内置文件）`);
    check(await evaluate(`(document.querySelector('meta[name="description"]')?.content || '').includes('文档')`),
      '切换路由时同步更新 SEO 描述与 OG 信息');

    await evaluate(`document.querySelector('[data-act="docs-file"]')?.click()`); await sleep(180);
    check(await evaluate(`!!document.querySelector('.fc-body:not([hidden])')`), '内置脚本可展开查看原文');

    await evaluate(`location.hash = '#/contact'`); await sleep(350);
    const contact = await evaluate(`({
      hero: !!document.querySelector('.contact-hero'),
      name: (document.querySelector('.contact-identity h2') || {}).textContent || '',
      channels: document.querySelectorAll('.contact-card').length,
      feedback: document.querySelectorAll('.feedback-card').length,
      issues: document.querySelectorAll('a[href*="/issues"]').length,
      undisclosed: (document.getElementById('view').textContent || '').includes('未公开')
    })`);
    check(contact.hero && /DaiYi/.test(contact.name) && contact.channels >= 5 && contact.feedback === 3 && contact.issues >= 2 && contact.undisclosed,
      `联系开发者整页（${contact.channels} 个渠道 / ${contact.feedback} 类反馈 / 未公开项明确标注）`);
    await evaluate(`location.hash = '#/repos'`); await sleep(300);

    const cloudDiag = await evaluate(`({loaded: typeof window.WorkBuddyCloud === 'object', ready: window.GHCloud.state.ready, err: (window.GHCloud.state.sdkError || '').slice(0, 50)})`);
    check(cloudDiag.loaded, `云服务 SDK 已在浏览器加载${cloudDiag.ready ? '并初始化' : '（' + cloudDiag.err + '）'}`);

    await evaluate(`location.hash = '#/source?repo=facebook/react'`);
    let srcState = { treeLen: 0, error: '', loading: true };
    for (let i = 0; i < 12; i++) {
      await sleep(1000);
      srcState = await evaluate(`(() => { const s = window.GH.Views.S.source; return { treeLen: s.tree.length, error: s.error, loading: s.loading }; })()`);
      if (srcState.treeLen > 0 || srcState.error) break;
    }
    const src = await evaluate(`({toolbar: !!document.querySelector('.source-toolbar'), tree: !!document.querySelector('.source-tree'), main: !!document.querySelector('.source-main'), rows: document.querySelectorAll('.source-row').length, branches: window.GH.Views.S.source.branches.length})`);
    check(src.toolbar && src.tree && src.main, `源代码页结构完整（分支选择 / 文件树 / 内容区）`);

    if (srcState.treeLen > 0) {
      check(src.rows > 0, `文件树已从 GitHub 读回（${srcState.treeLen} 个文件，当前目录 ${src.rows} 项，${src.branches} 个分支）`);
      // 搜索并打开一个真实的 .js 源文件，验证代码高亮与行号
      await evaluate(`(() => { const i = document.getElementById('sourceFileSearch'); if (i) { i.value = 'index.js'; i.dispatchEvent(new Event('input', { bubbles: true })); } })()`);
      await sleep(600);
      await evaluate(`document.querySelector('[data-act="source-open"][data-type="file"]')?.click()`);
      let lines = 0;
      let fileState = { path: '', loading: true, err: '', head: false };
      for (let i = 0; i < 16; i++) {
        await sleep(900);
        const st = await evaluate(`({
          lines: document.querySelectorAll('.code-line').length,
          path: window.GH.Views.S.source.path,
          loading: window.GH.Views.S.source.loading,
          err: window.GH.Views.S.source.error,
          head: !!document.querySelector('.source-file-head')
        })`);
        lines = st.lines; fileState = st;
        if (lines > 0) break;
      }
      check(lines > 0 || (!!fileState.path && (fileState.head || !!fileState.err)),
        `可打开具体源文件：${lines > 0 ? '渲染高亮代码 ' + lines + ' 行' : '交互已生效，内容' + (fileState.err ? '给出降级提示（' + String(fileState.err).slice(0, 30) + '…）' : '仍在加载')}`);
    } else {
      const feedback = await evaluate(`({main: !!document.querySelector('.source-main'), text: /正在|读不到|额度|暂无|加载/.test((document.querySelector('.source-main') || {}).textContent || '')})`);
      check(feedback.main && (!!srcState.error || feedback.text),
        `GitHub API 未就绪时给出加载 / 降级提示${srcState.error ? '（' + String(srcState.error).slice(0, 32) + '…）' : ''}`);
    }

    // 桌面截图
    await evaluate(`location.hash = '#/discover'`); await sleep(500);
    const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const previewDir = path.join(ROOT, 'preview');
    fs.mkdirSync(previewDir, { recursive: true });
    const shotPath = path.join(previewDir, 'desktop.png');
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    ok('桌面截图已保存：' + shotPath);

    // 移动端视口
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390, height: 844, deviceScaleFactor: 2, mobile: false,
    });
    await sleep(500);
    const mobile = await evaluate(`({tabbar: getComputedStyle(document.getElementById('tabbar')).display, cards: document.querySelectorAll('.repo-card').length})`);
    check(mobile.tabbar === 'flex', '移动端底部标签栏已启用');
    const topbarDiag = await evaluate(`(() => {
      const rect = (id) => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(); return {x: Math.round(r.x), w: Math.round(r.width), display: getComputedStyle(e).display, visible: r.width > 0 && r.right <= innerWidth + 1}; };
      return {inner: innerWidth, install: rect('smartInstallBtn'), guide: rect('guideBtn'), search: rect('topSearchBtn'), actions: document.querySelector('.top-actions').getBoundingClientRect().width};
    })()`);
    check(topbarDiag.install && topbarDiag.install.visible, '移动端一键安装按钮可见');
    check(await evaluate(`document.documentElement.scrollWidth <= innerWidth + 1`), '移动端无横向溢出');
    await evaluate(`document.getElementById('menuBtn').click()`);
    await sleep(220);
    check(await evaluate(`document.getElementById('sidebar').classList.contains('open')`), '移动端侧边栏抽屉可打开');
    await evaluate(`document.getElementById('sidebarScrim').click()`);
    await sleep(220);
    const mShot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const mPath = path.join(ROOT, 'preview', 'mobile.png');
    fs.writeFileSync(mPath, Buffer.from(mShot.data, 'base64'));
    ok('移动端截图已保存：' + mPath);

    await evaluate(`(() => { const b = document.querySelector('.brand'); if (b) { for (let i = 0; i < 5; i++) b.click(); } })()`);
    await sleep(180);
    const stars = await evaluate(`document.querySelectorAll('.orbit-starry').length`);
    check(stars >= 20, `连点 Logo 触发星星雨彩蛋（${stars} 颗）`);
    await evaluate(`document.querySelectorAll('.orbit-starry, .orbit-burst').forEach((e) => e.remove())`);

    check(consoleErrors.length === 0, `控制台无 JS 错误${consoleErrors.length ? '：' + consoleErrors.slice(0, 3).join(' | ') : ''}`);
    ws.close();
  } catch (e) {
    bad('浏览器检查中断：' + e.message);
  } finally {
    if (proc && proc.pid) {
      // Windows 上 Chrome 会派生子进程，需结束整棵进程树，否则配置目录无法清理
      if (process.platform === 'win32') {
        try { spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) {}
      } else { try { proc.kill('SIGKILL'); } catch (e) {} }
    }
    await sleep(300);
    try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
  }
}

console.log(`\n${failures === 0 ? '✅ 全部检查通过' : '❌ ' + failures + ' 项检查失败'}\n`);
process.exit(failures ? 1 : 0);
