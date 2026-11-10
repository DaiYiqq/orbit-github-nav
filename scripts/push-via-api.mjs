/**
 * Orbit · 备用推送通道（GitHub REST Git Data API）
 * ------------------------------------------------------------
 * 当本机代理能访问 api.github.com 却访问不了 github.com 的 git 端点时，
 * 标准 `git push` 会失败。此脚本用已登录的 `gh` 直接创建 blobs → tree → commit，
 * 再更新 refs/heads/main，效果等同一次完整推送（含所有文本文件与二进制图标）。
 *
 * 用法：node scripts/push-via-api.mjs [owner/repo] ["提交信息"]
 * 不会打印任何令牌；认证完全交给本机已登录的 gh CLI。
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPO = process.argv[2] || 'DaiYiqq/orbit-github-nav';
const MESSAGE = process.argv[3] || 'Orbit: GitHub 导航站（整页版 · 云服务登录 · 源码浏览 · 站内文档 · 交互动画）';
const [OWNER, NAME] = REPO.split('/');
if (!OWNER || !NAME) { console.error('仓库格式应为 owner/repo'); process.exit(1); }

const SKIP_DIRS = new Set(['.git', 'node_modules', 'target', '.workbuddy', '.vscode', '.idea']);
const skipFile = (name) => name.endsWith('.genie') || name.endsWith('.log') || name === 'Thumbs.db'
  || name === '.DS_Store' || name.startsWith('.orbit-cdp-profile');

function ghApi(method, endpoint, body) {
  const args = ['api', '-X', method, endpoint];
  if (body !== undefined) args.push('--input', '-');
  const out = execFileSync('gh', args, {
    cwd: ROOT,
    input: body === undefined ? undefined : JSON.stringify(body),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, GH_PAGER: 'cat', NO_COLOR: '1' },
  });
  return out.trim() ? JSON.parse(out) : {};
}

function collect(dir, base = '', out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name) || skipFile(e.name)) continue;
    const rel = base ? `${base}/${e.name}` : e.name;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) collect(full, rel, out);
    else if (e.isFile()) out.push(rel);
  }
  return out;
}

// GitHub 要求修改 .github/workflows/ 的令牌带 workflow scope；
// 当前 gh 凭据只有 repo/gist/read:org，带 workflow 的提交会被拒绝（404/403）。
// 默认跳过工作流文件、Pages 用传统分支发布；授权后加 --with-workflows 即可补齐：
//   gh auth refresh -h github.com -s workflow
//   node scripts/push-via-api.mjs --with-workflows
const WITH_WORKFLOWS = process.argv.includes('--with-workflows');
const SKIP_PREFIXES = WITH_WORKFLOWS ? [] : ['.github/workflows/'];
const allFiles = collect(ROOT);
const files = allFiles.filter((f) => !SKIP_PREFIXES.some((p) => f.startsWith(p))).sort();
const skipped = allFiles.length - files.length;
console.log(`目标仓库：${REPO}`);
console.log(`待推送文件：${files.length} 个（.git / .workbuddy / *.genie 等已排除）`);
if (skipped) console.log(`跳过 ${skipped} 个 GitHub Actions 工作流文件（当前令牌缺 workflow scope）`);

// 若远端已有提交，作为父提交保持历史连续；完全空的仓库需先用 Contents API
// 放一个 README 建立初始提交，否则 Git Data API 会返回 409 "Git Repository is empty"。
let parent = null;
try { parent = ghApi('GET', `repos/${OWNER}/${NAME}/git/ref/heads/main`).object.sha; } catch (e) { /* 空仓库 */ }
if (!parent) {
  console.log('空仓库：先用 Contents API 写入 README 建立初始提交…');
  const readme = fs.readFileSync(path.join(ROOT, 'README.md'));
  ghApi('PUT', `repos/${OWNER}/${NAME}/contents/README.md`, {
    message: '初始化仓库：添加 README', content: readme.toString('base64'),
  });
  const branch = ghApi('GET', `repos/${OWNER}/${NAME}`).default_branch || 'main';
  parent = ghApi('GET', `repos/${OWNER}/${NAME}/git/ref/heads/${branch}`).object.sha;
  console.log(`初始化提交：${parent.slice(0, 8)}（${branch}）`);
}
console.log(`父提交：${parent.slice(0, 8)}`);

const tree = [];
for (let i = 0; i < files.length; i++) {
  const rel = files[i];
  const buf = fs.readFileSync(path.join(ROOT, rel));
  const mode = rel === 'install.sh' ? '100755' : '100644';
  let blob;
  try {
    blob = ghApi('POST', `repos/${OWNER}/${NAME}/git/blobs`, {
      content: buf.toString('base64'), encoding: 'base64',
    });
  } catch (e) {
    console.error(`  blob 失败：${rel}（${buf.length} 字节）`);
    throw e;
  }
  if (!blob || !blob.sha) { console.error(`  blob 未返回 sha：${rel}`, blob); throw new Error('blob 创建异常'); }
  tree.push({ path: rel, mode, type: 'blob', sha: blob.sha });
  if ((i + 1) % 10 === 0 || i === files.length - 1) process.stdout.write(`  ${i + 1}/${files.length}\n`);
}

function postTree(entries, label) {
  try { return ghApi('POST', `repos/${OWNER}/${NAME}/git/trees`, { tree: entries }); }
  catch (e) {
    if (entries.length <= 1) {
      console.error(`  ✗ 问题条目（${label}）：`, JSON.stringify(entries[0]));
      throw e;
    }
    const mid = Math.ceil(entries.length / 2);
    postTree(entries.slice(0, mid), label + 'L');
    postTree(entries.slice(mid), label + 'R');
    throw e;
  }
}
// GitHub tree API 不允许在含 "/" 的 path 上引用已创建的 blob sha，
// 因此按标准 git 树结构自底向上构建：每个目录一个 tree，根 tree 用 type:"tree" 引用子目录。
function makeNode() { return { dirs: new Map(), files: [] }; }
const rootNode = makeNode();
for (const item of tree) {
  const parts = item.path.split('/');
  let node = rootNode;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node.dirs.has(parts[i])) node.dirs.set(parts[i], makeNode());
    node = node.dirs.get(parts[i]);
  }
  node.files.push({ path: parts[parts.length - 1], mode: item.mode, type: 'blob', sha: item.sha });
}
let treeCount = 0;
function buildTree(node, label) {
  const entries = node.files.slice();
  for (const [name, child] of Array.from(node.dirs).sort((a, b) => a[0].localeCompare(b[0]))) {
    const sub = buildTree(child, label + '/' + name);
    entries.push({ path: name, mode: '040000', type: 'tree', sha: sub.sha });
  }
  treeCount++;
  return postTree(entries, label);
}
const treeObj = buildTree(rootNode, 'root');
console.log(`tree：${treeObj.sha.slice(0, 8)}（${tree.length} 个文件 / ${treeCount} 棵树）`);

const now = new Date().toISOString();
const who = { name: 'DaiYi', email: `${OWNER}@users.noreply.github.com`, date: now };
const commit = ghApi('POST', `repos/${OWNER}/${NAME}/git/commits`, {
  message: MESSAGE, tree: treeObj.sha, parents: parent ? [parent] : [], author: who, committer: who,
});
console.log(`commit：${commit.sha}`);
try {
  const verify = ghApi('GET', `repos/${OWNER}/${NAME}/git/commits/${commit.sha}`);
  console.log(`commit 校验通过（tree ${verify.tree.sha.slice(0, 8)}）`);
} catch (e) {
  console.error('commit 校验失败，远端没有这个对象');
  throw e;
}

try {
  ghApi('PATCH', `repos/${OWNER}/${NAME}/git/refs/heads/main`, { sha: commit.sha, force: true });
} catch (e) {
  console.error('更新 main 失败：', String(e.message || e).slice(0, 160));
  throw e;
}

const ref = ghApi('GET', `repos/${OWNER}/${NAME}/git/ref/heads/main`);
const ok = ref.object.sha === commit.sha;
console.log(`\n${ok ? '✅ 推送成功' : '❌ 分支未指向新提交'}：https://github.com/${REPO}`);
if (!ok) process.exitCode = 1;
