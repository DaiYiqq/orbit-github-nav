/**
 * Orbit · 性能与可访问性审计
 * 用法：node scripts/perf-audit.mjs [URL]
 * 用无头 Chrome 采集：冷启动 / 缓存后首屏指标、资源体积、控制台错误、
 * 以及可访问性快照（跳转链接、alt、按钮名称、aria-live）。结果写入 preview/audit.json。
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = process.argv[2] || process.env.ORBIT_URL || 'http://127.0.0.1:4173/#/discover';
const PORT = 9555;
const PROFILE = path.join(os.tmpdir(), `orbit-audit-${Date.now()}`);
const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
].find((p) => fs.existsSync(p));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!CHROME) { console.error('未找到 Chrome / Edge，无法审计'); process.exit(1); }
const proc = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
  `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
  `--user-data-dir=${PROFILE}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });

let ws, seq = 0;
const pending = new Map();
const consoleErrors = [];
async function cdp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq; pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expr) {
  const r = await cdp('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text);
  return r.result.value;
}
const SNAPSHOT = `(() => {
  const nav = performance.getEntriesByType('navigation')[0] || {};
  const paints = performance.getEntriesByType('paint') || [];
  const res = performance.getEntriesByType('resource') || [];
  const transfer = res.reduce((a, r) => a + (r.transferSize || 0), 0);
  const decoded = res.reduce((a, r) => a + (r.encodedBodySize || 0), 0);
  return {
    dcl: Math.round(nav.domContentLoadedEventEnd || 0),
    load: Math.round(nav.loadEventEnd || 0),
    fcp: Math.round((paints.find(p => p.name === 'first-contentful-paint') || {}).startTime || 0),
    resources: res.length,
    transferKB: Math.round(transfer / 1024),
    decodedKB: Math.round(decoded / 1024),
    biggest: res.map(r => ({ name: (r.name || '').split('/').pop().split('?')[0], kb: Math.round((r.encodedBodySize || 0) / 1024) }))
      .sort((a, b) => b.kb - a.kb).slice(0, 4),
  };
})()`;
const A11Y = `(() => {
  const imgs = Array.from(document.querySelectorAll('img'));
  const btns = Array.from(document.querySelectorAll('button'));
  const named = (el) => (el.getAttribute('aria-label') || el.getAttribute('title') || (el.textContent || '').trim()).length > 0;
  return {
    skipLink: !!document.querySelector('.skip-link'),
    images: imgs.length,
    imagesMissingAlt: imgs.filter(i => !i.hasAttribute('alt')).length,
    buttons: btns.length,
    buttonsMissingName: btns.filter(b => !named(b)).length,
    ariaLive: document.querySelectorAll('[aria-live], [role="status"]').length,
    description: (document.querySelector('meta[name="description"]') || {}).content || '',
    canonical: (document.querySelector('link[rel="canonical"]') || {}).href || '',
    ogTitle: (document.querySelector('meta[property="og:title"]') || {}).content || '',
    repoCount: (window.__GH_NAV_REPOS__ || []).length,
    rawHydrated: !window.__GH_NAV_REPOS_RAW__,
    errorBoundary: Array.isArray(window.__ORBIT_ERRORS__),
  };
})()`;

try {
  let version = null;
  for (let i = 0; i < 30; i++) {
    await sleep(400);
    try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) { version = await r.json(); break; } } catch (e) {}
  }
  if (!version) throw new Error('CDP 端口未就绪');
  const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  ws = new WebSocket(list.find((t) => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result); }
    if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails.text);
    if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') consoleErrors.push(m.params.args.map((a) => a.value || a.description).join(' '));
  };
  await cdp('Runtime.enable');
  await cdp('Page.enable');
  await cdp('Network.enable');

  // 冷启动：禁用缓存 + 强制刷新
  await cdp('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp('Page.navigate', { url: TARGET });
  await sleep(3500);
  await cdp('Page.reload', { ignoreCache: true });
  await sleep(3500);
  const cold = await evaluate(SNAPSHOT);

  // 等 Service Worker 就绪，再测缓存后的首屏
  await evaluate(`navigator.serviceWorker ? navigator.serviceWorker.ready.then(() => true) : false`).catch(() => false);
  await cdp('Network.setCacheDisabled', { cacheDisabled: false });
  await cdp('Page.reload', { ignoreCache: false });
  await sleep(3000);
  const warm = await evaluate(SNAPSHOT);
  const a11y = await evaluate(A11Y);

  const report = {
    target: TARGET,
    at: new Date().toISOString(),
    cold, warm,
    improvement: {
      fcpMs: cold.fcp - warm.fcp,
      loadMs: cold.load - warm.load,
      transferKB: cold.transferKB - warm.transferKB,
    },
    a11y,
    consoleErrors: consoleErrors.slice(0, 5),
    consoleErrorCount: consoleErrors.length,
  };
  fs.mkdirSync(path.join(ROOT, 'preview'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'preview', 'audit.json'), JSON.stringify(report, null, 2), 'utf8');

  console.log('\n── 性能审计 ─────────────────────────────');
  console.log(`冷启动  FCP ${cold.fcp}ms · DCL ${cold.dcl}ms · load ${cold.load}ms · ${cold.resources} 个资源 / ${cold.transferKB} KB`);
  console.log(`缓存后  FCP ${warm.fcp}ms · DCL ${warm.dcl}ms · load ${warm.load}ms · ${warm.resources} 个资源 / ${warm.transferKB} KB`);
  console.log(`体积最大: ${cold.biggest.map((x) => x.name + ' ' + x.kb + 'KB').join(' · ')}`);
  console.log('\n── 可访问性 ─────────────────────────────');
  console.log(`跳转链接 ${a11y.skipLink ? '✓' : '✗'} · 图片缺 alt ${a11y.imagesMissingAlt}/${a11y.images} · 按钮缺名称 ${a11y.buttonsMissingName}/${a11y.buttons} · aria-live ${a11y.ariaLive} 处`);
  console.log(`描述 ${a11y.description.slice(0, 36)}… · canonical ${a11y.canonical ? '✓' : '✗'} · OG 标题 ${a11y.ogTitle ? '✓' : '✗'}`);
  console.log(`仓库索引 ${a11y.repoCount} 条 · 列式还原 ${a11y.rawHydrated ? '✓' : '✗'} · 错误边界 ${a11y.errorBoundary ? '✓' : '✗'}`);
  console.log(`\n控制台错误 ${consoleErrors.length} 条${consoleErrors.length ? '：' + consoleErrors.slice(0, 2).join(' | ') : ''}`);
  console.log('报告已写入 preview/audit.json\n');

  const ok = a11y.skipLink && a11y.imagesMissingAlt === 0 && a11y.buttonsMissingName === 0
    && a11y.repoCount > 1000 && a11y.rawHydrated && consoleErrors.length === 0;
  ws.close();
  if (!ok) process.exitCode = 1;
} catch (e) {
  console.error('审计失败：' + e.message);
  process.exitCode = 1;
} finally {
  if (proc && proc.pid) {
    if (process.platform === 'win32') { try { spawnSync('taskkill', ['/PID', String(proc.pid), '/T', '/F'], { stdio: 'ignore' }); } catch (e) {} }
    else { try { proc.kill('SIGKILL'); } catch (e) {} }
  }
  await sleep(300);
  try { fs.rmSync(PROFILE, { recursive: true, force: true }); } catch (e) {}
}
