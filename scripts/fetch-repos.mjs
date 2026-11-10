/**
 * GitHub 导航站 · 自动收录脚本
 * ------------------------------------------------------------
 * 从 GitHub Search API 按「星标分层 + 语言 + 主题」抓取真实仓库，
 * 去重、精简字段、规则分类，生成静态索引：
 *   site/data/repos.js   —— 浏览器直接 <script> 加载（支持 file:// 与 Pages 子路径）
 *   site/data/repos.json —— 供其他工具消费
 *   site/data/meta.json  —— 索引元信息
 *
 * 用法：
 *   node scripts/fetch-repos.mjs                 # 全量抓取
 *   node scripts/fetch-repos.mjs --limit 6      # 只跑前 N 个查询（调试）
 *   GITHUB_TOKEN=xxx node scripts/fetch-repos.mjs   # 提高限流额度
 *
 * 说明：GitHub 有数亿仓库，任何客户端都不可能「全量下载」。
 * 本脚本自动收录「高价值 + 各分类头部」仓库形成离线索引，
 * 长尾仓库由前端的「GitHub 全站实时搜索」覆盖（走 Search API）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'site', 'data');
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const LIMIT = (() => {
  const i = process.argv.indexOf('--limit');
  return i > -1 ? Number(process.argv[i + 1]) || 6 : Infinity;
})();
const INTERVAL = TOKEN ? 2200 : 6800; // 匿名 10 次/分钟，带 token 30 次/分钟

// 主分类体系（与前端 site/assets/js/catalog-schema.js 保持一致）
export const CATEGORIES = [
  { slug: 'ai',         label: 'AI / 大模型',      icon: 'sparkles', color: '#7C5CFF', desc: 'LLM、多模态、训练与推理框架' },
  { slug: 'mcp',        label: 'MCP 生态',         icon: 'plug',     color: '#0A84FF', desc: 'Model Context Protocol 服务端与客户端' },
  { slug: 'agent',      label: 'AI Agent',         icon: 'bot',      color: '#FF7A45', desc: '自主智能体、编码代理、多智能体框架' },
  { slug: 'skills',     label: 'Skills 技能包',    icon: 'blocks',   color: '#30B0C7', desc: 'Claude Skills / Agent Skills / 提示词技能' },
  { slug: 'frontend',   label: '前端 & UI',         icon: 'layout',   color: '#FF375F', desc: '框架、组件库、设计系统与 CSS' },
  { slug: 'backend',    label: '后端 & 服务',       icon: 'server',   color: '#34C759', desc: 'Web 框架、API、微服务' },
  { slug: 'mobile',     label: '移动 & 桌面',       icon: 'phone',    color: '#FF9F0A', desc: 'iOS / Android / 跨平台 / 桌面应用' },
  { slug: 'devops',     label: 'DevOps & 云原生',   icon: 'cloud',    color: '#5E5CE6', desc: '容器、K8s、CI/CD、可观测性' },
  { slug: 'database',   label: '数据库 & 存储',     icon: 'database', color: '#00A6A6', desc: '关系型、NoSQL、向量与搜索引擎' },
  { slug: 'security',   label: '安全 & 逆向',       icon: 'shield',   color: '#FF453A', desc: '渗透、审计、加密与漏洞研究' },
  { slug: 'system',     label: '系统 & 底层',       icon: 'cpu',      color: '#8E8E93', desc: '操作系统、编译器、Rust/C++ 基础设施' },
  { slug: 'data',       label: '数据 & 可视化',     icon: 'chart',    color: '#AF52DE', desc: '数据分析、BI、图表与数据工程' },
  { slug: 'game',       label: '游戏 & 图形',       icon: 'gamepad',  color: '#FF2D55', desc: '引擎、渲染、游戏开发' },
  { slug: 'learning',   label: '学习 & 资源',       icon: 'book',     color: '#FFCC00', desc: 'Awesome 清单、教程、面试、路线图' },
  { slug: 'productivity', label: '效率 & 自托管',  icon: 'bolt',     color: '#00C7BE', desc: 'CLI 工具、自动化、self-hosted 应用' },
  { slug: 'opensource', label: '开源精选',         icon: 'heart',    color: '#FF6482', desc: '社区活跃、文档完善的高质量开源项目' },
];

// 抓取任务：q = GitHub 搜索语句，tag = 命中该查询时附加的分类
const QUERIES = [
  { q: 'stars:>80000', tag: 'opensource' },
  { q: 'stars:50000..80000', tag: 'opensource' },
  { q: 'stars:25000..50000', tag: 'opensource' },
  { q: 'stars:12000..25000', tag: 'opensource' },
  { q: 'stars:6000..12000', tag: 'opensource' },
  { q: 'topic:llm stars:>800', tag: 'ai' },
  { q: 'topic:large-language-model stars:>300', tag: 'ai' },
  { q: 'topic:chatgpt stars:>500', tag: 'ai' },
  { q: 'topic:openai stars:>500', tag: 'ai' },
  { q: 'topic:rag stars:>200', tag: 'ai' },
  { q: 'topic:stable-diffusion stars:>500', tag: 'ai' },
  { q: 'topic:machine-learning stars:>4000', tag: 'ai' },
  { q: 'topic:mcp stars:>20', tag: 'mcp' },
  { q: 'topic:model-context-protocol stars:>10', tag: 'mcp' },
  { q: 'mcp server in:name,description stars:>30', tag: 'mcp' },
  { q: 'topic:agent stars:>400', tag: 'agent' },
  { q: 'topic:ai-agent stars:>100', tag: 'agent' },
  { q: 'topic:autonomous-agents stars:>50', tag: 'agent' },
  { q: 'topic:agent-skills stars:>5', tag: 'skills' },
  { q: 'claude skills in:name,description stars:>20', tag: 'skills' },
  { q: 'topic:prompt-engineering stars:>500', tag: 'skills' },
  { q: 'topic:ai-coding stars:>100', tag: 'ai' },
  { q: 'language:python stars:>10000', tag: 'backend' },
  { q: 'language:typescript stars:>8000', tag: 'frontend' },
  { q: 'language:javascript stars:>15000', tag: 'frontend' },
  { q: 'language:go stars:>7000', tag: 'devops' },
  { q: 'language:rust stars:>4000', tag: 'system' },
  { q: 'language:java stars:>7000', tag: 'backend' },
  { q: 'language:swift stars:>4000', tag: 'mobile' },
  { q: 'language:kotlin stars:>2500', tag: 'mobile' },
  { q: 'language:cpp stars:>7000', tag: 'system' },
  { q: 'topic:react stars:>4000', tag: 'frontend' },
  { q: 'topic:css stars:>4000', tag: 'frontend' },
  { q: 'topic:self-hosted stars:>1500', tag: 'productivity' },
  { q: 'topic:cli stars:>2500', tag: 'productivity' },
  { q: 'topic:devops stars:>1500', tag: 'devops' },
  { q: 'topic:kubernetes stars:>1500', tag: 'devops' },
  { q: 'topic:security stars:>2500', tag: 'security' },
  { q: 'topic:reverse-engineering stars:>800', tag: 'security' },
  { q: 'topic:database stars:>2500', tag: 'database' },
  { q: 'topic:visualization stars:>1500', tag: 'data' },
  { q: 'topic:data-science stars:>2500', tag: 'data' },
  { q: 'topic:awesome stars:>8000', tag: 'learning' },
  { q: 'topic:interview stars:>4000', tag: 'learning' },
  { q: 'topic:game-engine stars:>1500', tag: 'game' },
  { q: 'topic:open-source stars:>4000', tag: 'opensource' },
  { q: 'topic:automation stars:>2000', tag: 'productivity' },
  { q: 'topic:tauri stars:>300', tag: 'mobile' },
  { q: 'topic:vscode-extension stars:>1000', tag: 'productivity' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q, page = 1, attempt = 0) {
  const url = new URL('https://api.github.com/search/repositories');
  url.searchParams.set('q', q);
  url.searchParams.set('sort', 'stars');
  url.searchParams.set('order', 'desc');
  url.searchParams.set('per_page', '100');
  url.searchParams.set('page', String(page));

  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'github-nav-station-indexer',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const res = await fetch(url, { headers });
  if (res.status === 403 || res.status === 429) {
    if (attempt >= 3) throw new Error(`限流，放弃查询: ${q}`);
    const retryAfter = Number(res.headers.get('retry-after')) || 0;
    const wait = retryAfter ? retryAfter * 1000 : 60000;
    console.warn(`  ⏳ 触发限流，等待 ${Math.round(wait / 1000)}s 后重试 (${attempt + 1}/3)`);
    await sleep(wait);
    return search(q, page, attempt + 1);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${q}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

function inferCategories(repo, tags) {
  const set = new Set(tags);
  const text = `${repo.full_name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
  const has = (...words) => words.some((w) => text.includes(w));

  if (has('mcp', 'model-context-protocol', 'model context protocol')) set.add('mcp');
  if (has('agent', 'autonomous', 'multi-agent', 'crewai', 'autogen')) set.add('agent');
  if (has('skill', 'prompt', 'copilot-instruction', 'agent.md', 'agents.md')) set.add('skills');
  if (has('llm', 'gpt', 'transformer', 'diffusion', 'machine-learning', 'deep-learning', 'neural', 'inference', 'rag', 'embedding', 'openai', 'claude', 'gemini', 'ai-', 'generative')) set.add('ai');
  if (has('react', 'vue', 'svelte', 'css', 'tailwind', 'frontend', 'ui-component', 'design-system', 'nextjs', 'angular', 'webgl', 'three.js')) set.add('frontend');
  if (has('framework', 'http', 'server', 'api', 'graphql', 'django', 'spring', 'rails', 'express')) set.add('backend');
  if (has('android', 'ios', 'swift', 'kotlin', 'flutter', 'electron', 'tauri', 'desktop', 'macos')) set.add('mobile');
  if (has('kubernetes', 'k8s', 'docker', 'ci/cd', 'devops', 'terraform', 'ansible', 'observability', 'monitoring', 'helm')) set.add('devops');
  if (has('database', 'sql', 'postgres', 'redis', 'vector-db', 'elasticsearch', 'storage')) set.add('database');
  if (has('security', 'pentest', 'exploit', 'malware', 'reverse-engineering', 'vulnerability', 'crypto', 'ctf')) set.add('security');
  if (has('compiler', 'kernel', 'operating-system', 'rust-lang', 'wasm', 'embedded', 'runtime', 'low-level')) set.add('system');
  if (has('data-visualization', 'chart', 'analytics', 'data-science', 'notebook', 'etl', 'pandas')) set.add('data');
  if (has('game', 'unity', 'godot', 'renderer', 'shader', 'graphics', 'vulkan')) set.add('game');
  if (has('awesome', 'tutorial', 'roadmap', 'interview', 'cheatsheet', 'learning', 'course', 'book', 'examples', 'guide')) set.add('learning');
  if (has('cli', 'terminal', 'self-hosted', 'automation', 'productivity', 'dotfiles', 'toolbox', 'extension')) set.add('productivity');

  if (!repo.archived && repo.stargazers_count >= 20000 && (repo.license?.spdx_id || '') !== 'NOASSERTION') set.add('opensource');
  if (set.size === 0) set.add('opensource');
  return [...set];
}

function slim(repo, tagMap) {
  const name = repo.full_name || '';
  const cats = inferCategories(repo, tagMap.get(repo.id) || []);
  return {
    id: repo.id,
    n: repo.name,
    f: name,
    o: repo.owner?.login || name.split('/')[0],
    d: (repo.description || '').slice(0, 260),
    s: repo.stargazers_count || 0,
    fk: repo.forks_count || 0,
    is: repo.open_issues_count || 0,
    l: repo.language || '',
    t: (repo.topics || []).slice(0, 10),
    lic: repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : '',
    p: (repo.pushed_at || '').slice(0, 10),
    c: (repo.created_at || '').slice(0, 10),
    h: repo.homepage ? String(repo.homepage).slice(0, 160) : '',
    a: repo.archived ? 1 : 0,
    cat: cats,
  };
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const byId = new Map();
  const tagMap = new Map();
  const tasks = QUERIES.slice(0, LIMIT);
  let ok = 0;

  console.log(`▶ 开始自动收录：${tasks.length} 个查询，间隔 ${INTERVAL}ms，${TOKEN ? '已使用 token' : '匿名模式'}`);

  for (let i = 0; i < tasks.length; i++) {
    const { q, tag } = tasks[i];
    try {
      const data = await search(q);
      for (const r of data.items || []) {
        byId.set(r.id, r);
        if (!tagMap.has(r.id)) tagMap.set(r.id, new Set());
        tagMap.get(r.id).add(tag);
      }
      ok++;
      console.log(`  [${String(i + 1).padStart(2, '0')}/${tasks.length}] ${q} → ${data.items?.length || 0} 条，累计 ${byId.size} 个仓库`);
    } catch (e) {
      console.warn(`  [${i + 1}/${tasks.length}] ✗ ${q}: ${e.message}`);
    }
    if (i < tasks.length - 1) await sleep(INTERVAL);
  }

  const repos = [...byId.values()]
    .map((r) => slim(r, tagMap))
    .sort((a, b) => b.s - a.s);

  const languages = {};
  const catCount = {};
  for (const r of repos) {
    if (r.l) languages[r.l] = (languages[r.l] || 0) + 1;
    for (const c of r.cat) catCount[c] = (catCount[c] || 0) + 1;
  }

  const meta = {
    updatedAt: new Date().toISOString(),
    count: repos.length,
    queryCount: ok,
    source: 'GitHub Search API',
    categories: CATEGORIES.map((c) => ({ ...c, count: catCount[c.slug] || 0 })),
    languages: Object.entries(languages).sort((a, b) => b[1] - a[1]).slice(0, 30),
    tiers: [
      { key: '100k', label: '10 万星以上', min: 100000 },
      { key: '50k', label: '5 万星以上', min: 50000 },
      { key: '10k', label: '1 万星以上', min: 10000 },
      { key: '5k', label: '5 千星以上', min: 5000 },
      { key: '1k', label: '1 千星以上', min: 1000 },
      { key: 'all', label: '全部', min: 0 },
    ],
  };

  // 列式存储：去掉每个仓库对象里重复的字段名，体积更小、解析更快。
  // 浏览器加载时由 core.js 的 hydrateRepos() 还原成对象数组，业务代码无需改动。
  // n（仓库名）与 o（owner）由 core.js 从 f 推导，不重复存储
  const COLS = ['id', 'f', 'd', 's', 'fk', 'is', 'l', 't', 'c', 'p', 'cat', 'lic', 'h', 'a'];
  const rows = repos.map((r) => COLS.map((k) => (r[k] === undefined ? null : r[k])));
  const jsBody = `/* 自动生成，请勿手工编辑。由 scripts/fetch-repos.mjs 产出 */
/* 列式索引：core.js 会还原为 window.__GH_NAV_REPOS__ 对象数组 */
window.__GH_NAV_REPOS_RAW__ = ${JSON.stringify({ cols: COLS, rows })};
window.__GH_NAV_META__ = ${JSON.stringify(meta)};
`;
  fs.writeFileSync(path.join(OUT_DIR, 'repos.js'), jsBody, 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'repos.json'), JSON.stringify(repos), 'utf8');
  fs.writeFileSync(path.join(OUT_DIR, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');

  console.log(`\n✅ 完成：${repos.length} 个真实仓库，成功 ${ok}/${tasks.length} 个查询`);
  console.log(`   → ${path.join(OUT_DIR, 'repos.js')} (${(fs.statSync(path.join(OUT_DIR, 'repos.js')).size / 1024).toFixed(0)} KB)`);
  console.log(`   分类统计：`, Object.entries(catCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join('  '));
}

main().catch((e) => {
  console.error('抓取失败：', e);
  process.exit(1);
});
