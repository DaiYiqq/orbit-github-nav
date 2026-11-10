/**
 * Orbit · 线上站点验收
 * 用法：node scripts/check-live.mjs "<发布后的分享链接>"
 * 用无头浏览器真实打开线上地址，检查页面渲染、云服务 SDK、以及
 * 云服务数据面是否接受当前来源（Origin 校验通过才能真正收发验证码）。
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = process.argv[2] || process.env.ORBIT_SHARE_URL;
if (!TARGET) {
  console.error('用法: node scripts/check-live.mjs "https://<你的域名>/?sharecode=..."');
  process.exit(1);
}
const PORT = 9444;
const PROFILE = path.join(os.tmpdir(), `orbit-live-${Date.now()}`);
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!CHROME) { console.error('未找到 Chrome / Edge'); process.exit(1); }
const proc = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
  `--user-data-dir=${PROFILE}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });

let failures = 0;
const check = (ok, msg) => { console.log((ok ? '  ✓ ' : '  ✗ ') + msg); if (!ok) failures++; };

try {
  let version = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { version = await r.json(); break; } } catch (e) {}
  }
  if (!version) throw new Error('CDP 端口未就绪');

  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let seq = 0; const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || ''));
    return r.result.value;
  };

  await send('Runtime.enable');
  await send('Page.enable');
  await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Page.navigate', { url: TARGET });
  await sleep(3000);   // 等待分享链接跳转 + 静态资源
  // SDK 现在异步注入，轮询到就绪再验收（最多约 12 秒）
  for (let i = 0; i < 16; i++) {
    await sleep(750);
    const ready = await evaluate(`!!document.querySelector('.repo-card') && !!(window.GHCloud && window.GHCloud.state.ready)`).catch(() => false);
    if (ready) break;
  }

  const info = await evaluate(`({
    title: document.title,
    url: location.href,
    path: location.pathname,
    cards: document.querySelectorAll('.repo-card').length,
    nav: document.querySelectorAll('.sidebar .nav-item').length,
    sdk: typeof window.WorkBuddyCloud,
    cloudReady: window.GHCloud ? window.GHCloud.state.ready : false,
    sdkError: window.GHCloud ? window.GHCloud.state.sdkError : 'GHCloud 未加载',
    app: typeof window.GHApp
  })`);
  const sampleRepo = await evaluate(`document.querySelector('[data-act="repo"][data-f]')?.dataset.f || ''`);
  console.log('\n线上页面：' + info.url);
  check(info.title.includes('Orbit'), '页面标题：' + info.title);
  check(info.cards >= 6, `首页渲染 ${info.cards} 个项目卡片`);
  check(info.nav >= 14, `侧边导航 ${info.nav} 项`);
  check(info.sdk === 'object' && info.cloudReady, `云服务 SDK 已加载并初始化${info.sdkError ? '（' + info.sdkError + '）' : ''}`);

  const opt = await evaluate(`({
    repos: (window.__GH_NAV_REPOS__ || []).length,
    rawGone: !window.__GH_NAV_REPOS_RAW__,
    derived: (() => { const r = (window.__GH_NAV_REPOS__ || [])[0] || {}; return !!r.n && !!r.o; })(),
    asyncSdk: (() => { const s = document.querySelector('script[src*="workbuddy-cloud-sdk"]'); return !!s && s.async === true; })(),
    skip: !!document.querySelector('.skip-link'),
    boundary: Array.isArray(window.__ORBIT_ERRORS__),
    live: document.querySelectorAll('[aria-live], [role="status"]').length,
    imgsMissingAlt: Array.from(document.querySelectorAll('img')).filter(i => !i.hasAttribute('alt')).length,
    btnsMissingName: Array.from(document.querySelectorAll('button')).filter(b => !(b.getAttribute('aria-label') || b.getAttribute('title') || (b.textContent || '').trim())).length,
    canonical: (document.querySelector('link[rel="canonical"]') || {}).href || '',
    desc: (document.querySelector('meta[name="description"]') || {}).content || '',
    ldjson: !!document.querySelector('script[type="application/ld+json"]')
  })`);
  check(opt.repos > 1000 && opt.rawGone && opt.derived && opt.asyncSdk,
    `列式索引已还原 ${opt.repos} 条，云服务 SDK 异步加载`);
  check(opt.skip && opt.boundary && opt.live >= 1 && opt.imgsMissingAlt === 0 && opt.btnsMissingName === 0,
    `可访问性：跳转链接 / 错误边界 / aria-live / 图片 alt ${opt.imgsMissingAlt} 缺失 / 按钮名称 ${opt.btnsMissingName} 缺失`);
  check(opt.canonical.length > 10 && opt.desc.length > 20 && opt.ldjson,
    'SEO：canonical / 动态描述 / JSON-LD 已生效');
  const sw = await evaluate(`(async () => {
    if (!navigator.serviceWorker) return { ok: false };
    try { const r = await navigator.serviceWorker.ready; return { ok: !!r.active, scope: r.scope || '' }; }
    catch (e) { return { ok: false }; }
  })()`);
  check(sw.ok, '线上 Service Worker 已激活（' + (sw.scope || '无') + '）');

  const motionLayer = await evaluate(`({
    progress: !!document.getElementById('orbitProgress'),
    top: !!document.getElementById('orbitTop'),
    styled: (() => { const p = document.getElementById('orbitProgress'); return !!p && getComputedStyle(p).position === 'fixed'; })(),
    stagger: document.querySelectorAll('[data-act="hint"].orbit-stagger').length
  })`);
  check(motionLayer.progress && motionLayer.top && motionLayer.styled && motionLayer.stagger >= 5,
    '线上动画层已加载（进度条 / 回到顶部 / 提示词交错入场）');
  await evaluate(`(() => { const b = document.querySelector('[data-act="fav"]'); if (b) b.click(); })()`);
  await sleep(140);
  const particles = await evaluate(`document.querySelectorAll('.orbit-burst .orbit-particle').length`);
  check(particles >= 8, `线上收藏星形粒子动效（${particles} 颗）`);

  // 云服务数据面是否接受当前 Origin：不接受时 getSession 会抛 401/403
  const originCheck = await evaluate(`(async () => {
    try { await window.GHCloud.getSession(); return { ok: true, msg: '数据面接受当前来源' }; }
    catch (e) { return { ok: false, msg: String(e && e.message || e) }; }
  })()`);
  check(originCheck.ok, '云服务来源校验：' + originCheck.msg);

  const accountHash = await evaluate(`(() => { document.getElementById('accountBtn')?.click(); return location.hash; })()`);
  await sleep(500);
  const accountUi = await evaluate(`({page: !!document.querySelector('.account-layout'), tabs: document.querySelectorAll('#accountAuthSlot .auth-tab').length, modal: document.getElementById('modalOverlay')?.classList.contains('open')})`);
  check(accountHash === '#/account' && accountUi.page && accountUi.tabs === 3 && !accountUi.modal,
    '线上账号中心是整页，邮箱/手机/GitHub 三方式齐全');

  const installHash = await evaluate(`(() => { document.getElementById('smartInstallBtn')?.click(); return location.hash; })()`);
  await sleep(500);
  const installUi = await evaluate(`({sections: document.querySelectorAll('.platform-section').length, methods: document.querySelectorAll('.method-card').length, modal: document.getElementById('modalOverlay')?.classList.contains('open')})`);
  check(installHash === '#/install' && installUi.sections === 6 && installUi.methods >= 12 && !installUi.modal,
    `线上下载安装整页按 ${installUi.sections} 个平台分类（${installUi.methods} 种方式，无弹窗）`);

  await evaluate(`location.hash = '#/docs'`); await sleep(500);
  const docsUi = await evaluate(`({chapters: document.querySelectorAll('.docs-chapter').length, files: document.querySelectorAll('.file-card').length})`);
  check(docsUi.chapters >= 12 && docsUi.files >= 5, `线上站内文档中心（${docsUi.chapters} 章 / ${docsUi.files} 个内置文件）`);
  check(await evaluate(`(document.querySelector('meta[name="description"]')?.content || '').includes('文档')`),
    '线上切换路由时同步更新 SEO 描述');

  await evaluate(`location.hash = '#/repo?f=${encodeURIComponent(sampleRepo)}'`); await sleep(1200);
  const detailUi = await evaluate(`({page: !!document.querySelector('.detail-hero'), intro: (document.querySelector('.detail-intro')?.textContent || '').trim().length, drawer: document.getElementById('drawer')?.classList.contains('open')})`);
  check(detailUi.page && detailUi.intro > 40 && !detailUi.drawer, `线上项目详情是整页且始终有项目简介（${sampleRepo}）`);

  await evaluate(`location.hash = '#/discover'`); await sleep(500);
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.mkdirSync(path.join(ROOT, 'preview'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'preview', 'live.png'), Buffer.from(shot.data, 'base64'));
  ws.close();
} catch (e) {
  failures++;
  console.error('  ✗ 验收中断：' + e.message);
} finally {
  if (proc && proc.pid) {
    if (process.platform === 'win32') { try { spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) {} }
    else { try { proc.kill('SIGKILL'); } catch (e) {} }
  }
  await sleep(300);
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
}

console.log(`\n${failures ? '❌ ' + failures + ' 项未通过' : '✅ 线上验收全部通过'}\n`);
process.exit(failures ? 1 : 0);
