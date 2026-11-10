/* Orbit · GitHub 源码浏览数据层
 * 只读使用 GitHub 公开 API（api.github.com 支持 CORS）。
 * 已连接 GitHub 账号时自动带上令牌，额度从 60 次/小时提升到 5000 次/小时。
 * 所有请求带内存缓存、超时、限流识别与明确的失败提示。
 */
(function (w) {
  'use strict';
  const G = w.GH;
  const { esc } = G;
  const API = 'https://api.github.com';
  const RAW = 'https://raw.githubusercontent.com';
  const cache = new Map();
  const TTL = 5 * 60 * 1000;

  function token() { return (w.GHCloud && w.GHCloud.githubToken) ? w.GHCloud.githubToken() : ''; }

  function headers() {
    const h = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const t = token();
    if (t) h.Authorization = 'Bearer ' + t;
    return h;
  }

  async function cached(key, loader) {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL) return hit.value;
    const value = await loader();
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  async function json(url) {
    let res;
    try {
      res = await fetch(url, { headers: headers(), signal: AbortSignal.timeout(15000) });
    } catch (e) {
      const raw = String((e && e.message) || '网络异常');
      throw new Error(/timed out|timeout|abort/i.test(raw) ? 'GitHub API 请求超时，可稍后重试或连接 GitHub 账号提升额度' : raw);
    }
    if (res.status === 403 || res.status === 429) {
      throw new Error('GitHub API 额度不足（' + res.status + '）。连接 GitHub 账号后可显著提升额度，或稍后再试。');
    }
    if (res.status === 404) throw new Error('没有找到这个仓库、分支或文件（404）');
    if (!res.ok) throw new Error('GitHub API 请求失败（HTTP ' + res.status + '）');
    return res.json();
  }

  const repoInfo = (f) => cached('info:' + f, () => json(`${API}/repos/${f}`));
  const branches = (f) => cached('branches:' + f, () => json(`${API}/repos/${f}/branches?per_page=40`));
  const tree = (f, ref) => cached(`tree:${f}:${ref}`, () => json(`${API}/repos/${f}/git/trees/${encodeURIComponent(ref)}?recursive=1`));
  const commits = (f, ref) => cached(`commits:${f}:${ref}`, () => json(`${API}/repos/${f}/commits?sha=${encodeURIComponent(ref)}&per_page=8`));
  const issues = (f) => cached('issues:' + f, () => json(`${API}/repos/${f}/issues?state=open&per_page=8`));
  const releases = (f) => cached('releases:' + f, () => json(`${API}/repos/${f}/releases?per_page=5`));

  async function file(f, ref, path) {
    return cached(`file:${f}:${ref}:${path}`, async () => {
      const encPath = path.split('/').map(encodeURIComponent).join('/');
      const headers = token() ? { Authorization: 'Bearer ' + token() } : {};
      // 主源 raw.githubusercontent.com，备用源 jsDelivr（同一份 GitHub 内容，网络更稳）
      const sources = [
        `${RAW}/${f}/${encodeURIComponent(ref)}/${encPath}`,
        `https://cdn.jsdelivr.net/gh/${f}@${encodeURIComponent(ref)}/${encPath}`,
      ];
      let lastErr = null;
      for (const url of sources) {
        try {
          const res = await fetch(url, { headers, signal: AbortSignal.timeout(9000) });
          if (res.status === 404) { lastErr = new Error('文件不存在或已被删除（404）'); continue; }
          if (!res.ok) { lastErr = new Error('HTTP ' + res.status); continue; }
          const text = await res.text();
          if (text.length > 400000) throw new Error('文件过大，建议直接在 GitHub 上查看');
          return text;
        } catch (e) { lastErr = e; }
      }
      const raw = String((lastErr && lastErr.message) || '网络异常');
      throw new Error(/timed out|timeout|abort/i.test(raw)
        ? '读取超时（网络较慢），可点「重试」或去 GitHub 查看'
        : raw);
    });
  }

  /* ── 轻量语法高亮（先转义，逐行处理，不引入外部依赖） ── */
  const KEYWORDS = {
    js: new Set(['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'extends', 'new', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'this', 'super', 'yield', 'switch', 'case', 'break', 'continue', 'delete', 'in', 'of', 'null', 'undefined', 'true', 'false']),
    py: new Set(['def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import', 'from', 'as', 'with', 'try', 'except', 'finally', 'raise', 'yield', 'lambda', 'async', 'await', 'pass', 'break', 'continue', 'global', 'nonlocal', 'assert', 'in', 'is', 'not', 'and', 'or', 'None', 'True', 'False', 'self']),
    rs: new Set(['fn', 'let', 'mut', 'pub', 'use', 'mod', 'struct', 'enum', 'impl', 'trait', 'match', 'if', 'else', 'for', 'while', 'loop', 'return', 'self', 'Self', 'where', 'async', 'await', 'const', 'static', 'type', 'crate', 'super', 'move', 'ref', 'Some', 'None', 'Ok', 'Err']),
    go: new Set(['func', 'package', 'import', 'return', 'if', 'else', 'for', 'range', 'var', 'const', 'type', 'struct', 'interface', 'map', 'chan', 'go', 'defer', 'select', 'case', 'switch', 'break', 'continue', 'nil', 'true', 'false']),
    java: new Set(['public', 'private', 'protected', 'class', 'interface', 'extends', 'implements', 'static', 'final', 'void', 'return', 'if', 'else', 'for', 'while', 'new', 'import', 'package', 'try', 'catch', 'throw', 'this', 'super', 'abstract', 'enum']),
    sh: new Set(['if', 'then', 'else', 'fi', 'for', 'in', 'do', 'done', 'while', 'case', 'esac', 'function', 'return', 'export', 'local', 'echo', 'cd', 'source']),
    json: new Set(['true', 'false', 'null']),
  };

  function langOf(name) {
    const ext = String(name || '').split('.').pop().toLowerCase();
    const map = {
      js: 'js', mjs: 'js', cjs: 'js', jsx: 'js', ts: 'js', tsx: 'js', vue: 'js',
      py: 'py', pyw: 'py', rs: 'rs', go: 'go', java: 'java', kt: 'java', swift: 'java',
      sh: 'sh', bash: 'sh', zsh: 'sh', yml: 'sh', yaml: 'sh', json: 'json',
      c: 'java', h: 'java', cpp: 'java', cc: 'java', hpp: 'java', cs: 'java', php: 'java', rb: 'py',
      css: 'js', scss: 'js', html: 'js', xml: 'js', sql: 'java',
    };
    return map[ext] || '';
  }

  function highlightLine(line, lang) {
    if (!lang) return esc(line);
    const kw = KEYWORDS[lang] || KEYWORDS.js;
    const parts = String(line).split(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|`[^`]*`|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|\b\d+(?:\.\d+)?\b|\b[A-Za-z_$][\w$]*\b)/g);
    return parts.map((t) => {
      if (!t) return '';
      if (/^\/\//.test(t) || /^\/\*/.test(t) || /^#/.test(t)) return `<span class="tk-comment">${esc(t)}</span>`;
      if (/^["'`]/.test(t)) return `<span class="tk-str">${esc(t)}</span>`;
      if (/^\d/.test(t)) return `<span class="tk-num">${esc(t)}</span>`;
      if (kw.has(t)) return `<span class="tk-kw">${esc(t)}</span>`;
      return esc(t);
    }).join('');
  }

  function renderCode(code, filename) {
    const lang = langOf(filename);
    const lines = String(code || '').replace(/\r\n/g, '\n').split('\n');
    return `<div class="code-view">${lines.map((line, i) =>
      `<div class="code-line"><span class="ln">${i + 1}</span><code>${highlightLine(line, lang)}</code></div>`
    ).join('')}</div>`;
  }

  function fileKind(name) {
    const ext = String(name || '').split('.').pop().toLowerCase();
    const images = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
    if (images.includes(ext)) return { kind: 'image', icon: 'image', color: '#FF6482' };
    if (ext === 'md' || ext === 'markdown' || ext === 'mdx') return { kind: 'markdown', icon: 'book', color: '#0A84FF' };
    if (['json', 'yml', 'yaml', 'toml', 'ini', 'env'].includes(ext)) return { kind: 'config', icon: 'sliders', color: '#FF9F0A' };
    if (['zip', 'gz', 'tar', 'pdf', 'woff', 'woff2', 'ttf', 'mp4', 'png'].includes(ext)) return { kind: 'binary', icon: 'archive', color: '#8E8E93' };
    return { kind: 'code', icon: 'code', color: '#7C5CFF' };
  }

  function formatSize(n) {
    n = Number(n) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1024 / 1024).toFixed(1) + ' MB';
  }

  /** 把扁平 git tree 整理成当前目录的一层节点 */
  function listDir(treeItems, dir) {
    const prefix = dir ? dir + '/' : '';
    const map = new Map();
    (treeItems || []).forEach((item) => {
      if (!item.path.startsWith(prefix)) return;
      const rest = item.path.slice(prefix.length);
      if (!rest || rest.includes('/')) {
        const folder = rest.split('/')[0];
        if (folder && !map.has(folder)) map.set(folder, { name: folder, path: prefix + folder, type: 'dir', size: 0 });
      } else if (!map.has(rest)) {
        map.set(rest, { name: rest, path: item.path, type: item.type === 'tree' ? 'dir' : 'file', size: item.size || 0, sha: item.sha });
      }
    });
    return Array.from(map.values()).sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'dir' ? -1 : 1));
  }

  w.GHSource = {
    repoInfo, branches, tree, file, commits, issues, releases,
    renderCode, fileKind, formatSize, listDir, langOf,
    clearCache: () => cache.clear(),
  };
})(window);
