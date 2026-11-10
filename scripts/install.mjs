/**
 * Orbit · 一键安装 / 一键启动
 * ------------------------------------------------------------
 * 最简单的用法：双击根目录的 install.bat（Windows）或运行 ./install.sh。
 * 它会：检查环境 → 启动本地站点 → 自动打开浏览器 → 告诉你下一步。
 *
 * 可选参数：
 *   --no-open      不自动打开浏览器（用于服务器/自动化）
 *   --port 4173    指定端口
 *   --build        额外构建桌面原生安装包（需要 Node + Rust 工具链）
 */
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const argVal = (flag, def) => {
  const i = args.indexOf(flag);
  return i > -1 && args[i + 1] ? args[i + 1] : def;
};
const PORT = Number(argVal('--port', 4173)) || 4173;
const NO_OPEN = has('--no-open');
const BUILD = has('--build');
const URL = `http://127.0.0.1:${PORT}/#/discover`;

const line = (s = '') => console.log(s);
const hr = () => line('─'.repeat(58));

function openBrowser(url) {
  const cmd = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  const opts = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  try { const p = spawn(cmd, opts, { stdio: 'ignore', detached: true }); p.unref(); } catch (e) { line('  请手动打开：' + url); }
}

async function waitServer(url, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { const r = await fetch(url); if (r.ok) return true; } catch (e) {}
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

function buildDesktop() {
  hr();
  line('  构建桌面安装包（首次需要几分钟）');
  hr();
  const cargo = spawnSync('cargo', ['--version'], { encoding: 'utf8' });
  if (cargo.status !== 0) {
    line('  ✗ 未检测到 Rust 工具链。请先安装： https://rustup.rs');
    line('    安装完成后重新运行： install.bat --build');
    return false;
  }
  line('  · Rust: ' + (cargo.stdout || '').trim());
  const desktop = path.join(ROOT, 'desktop');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const r1 = spawnSync(npmCmd, ['install'], { cwd: desktop, stdio: 'inherit' });
  if (r1.status !== 0) { line('  ✗ 依赖安装失败'); return false; }
  const r2 = spawnSync(npmCmd, ['run', 'build'], { cwd: desktop, stdio: 'inherit' });
  if (r2.status !== 0) { line('  ✗ 构建失败，请查看上方错误信息'); return false; }
  line('  ✓ 安装包已生成： desktop/src-tauri/target/release/bundle/');
  return true;
}

async function main() {
  line();
  hr();
  line('  Orbit · GitHub 导航站  —  一键安装');
  hr();
  line(`  Node.js  ${process.version}`);
  line(`  目录      ${ROOT}`);
  line(`  站点      ${URL}`);
  line();
  line('  [1/3] 检查文件…');
  const needed = ['site/index.html', 'site/data/repos.js', 'desktop/dev-server.mjs'];
  const missing = needed.filter((f) => !fs.existsSync(path.join(ROOT, f)));
  if (missing.length) {
    line('  ✗ 缺少文件：' + missing.join(', '));
    line('    请确认已完整下载项目，或运行 node scripts/fetch-repos.mjs 生成索引。');
    process.exit(1);
  }
  const meta = JSON.parse(fs.readFileSync(path.join(ROOT, 'site/data/meta.json'), 'utf8'));
  line(`  ✓ 已收录 ${meta.count} 个 GitHub 仓库，${meta.categories.length} 个分类`);

  line('  [2/3] 启动本地站点…');
  const server = spawn(process.execPath, [path.join(ROOT, 'desktop/dev-server.mjs')], {
    cwd: ROOT, env: { ...process.env, PORT: String(PORT) }, stdio: 'inherit',
  });
  server.on('error', (e) => { line('  ✗ 启动失败：' + e.message); process.exit(1); });

  const ready = await waitServer(`http://127.0.0.1:${PORT}/`);
  if (!ready) { line('  ✗ 站点未能在 15 秒内启动，请检查端口是否被占用（可加 --port 8080）'); server.kill(); process.exit(1); }
  line('  ✓ 站点已就绪');

  line('  [3/3] 打开浏览器…');
  if (!NO_OPEN) { openBrowser(URL); line('  ✓ 已打开（若没有自动弹出，请手动复制上面的网址）'); }
  else line('  · 已跳过（--no-open）');

  line();
  hr();
  line('  接下来可以做什么');
  hr();
  line('  · 网页版：现在就能用，搜索 / 筛选 / 收藏都不需要登录');
  line('  · 装到设备：右上角「一键安装」→ 安装到本机（PWA）');
  line('  · 手机：用同一网址打开，浏览器菜单里选「添加到主屏幕」');
  line('  · 原生安装包：install.bat --build（Windows）/ ./install.sh --build');
  line('  · 上线到 GitHub Pages：见 README.md 的「部署」章节');
  line();
  line('  按 Ctrl + C 可停止本地站点。');
  line();

  if (BUILD) buildDesktop();
}

main().catch((e) => { console.error(e); process.exit(1); });
