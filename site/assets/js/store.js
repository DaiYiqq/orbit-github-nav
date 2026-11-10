/* Orbit · 数据层
 * 设计原则：游客优先 —— 不登录即可完整使用；收藏 / 主题 / 最近访问保存在本机。
 * 可选连接 GitHub 账号后，通过「私有 Gist」在网站、手机 PWA、桌面端之间同步。
 * 网站与安装包共用这一层，因此数据与体验完全一致。
 */
(function (w) {
  'use strict';
  const { LS, toast } = w.GH;

  const KEY = 'orbit:state:v1';
  const GIST_FILE = 'orbit-github-nav-sync.json';
  const GIST_DESC = 'orbit-github-nav-sync · GitHub 导航站跨端同步数据';

  const DEFAULT = {
    favorites: [],          // full_name 数组
    recent: [],             // { f, at }
    settings: { theme: 'light', view: 'grid', sort: 'stars', perPage: 24 },
    account: null,          // { login, avatar, token, gistId, mode }
    lastSync: null,
  };

  function load() {
    const raw = LS.get(KEY, {});
    const s = Object.assign({}, DEFAULT, raw);
    s.settings = Object.assign({}, DEFAULT.settings, raw.settings || {});
    // 兼容旧格式（曾存过数字 id）
    s.favorites = (s.favorites || []).map((x) => String(x));
    return s;
  }

  let state = load();
  let listeners = [];

  function save() { LS.set(KEY, state); }
  function emit(type) {
    save();
    listeners.forEach((fn) => { try { fn(type, state); } catch (e) { console.warn(e); } });
    document.dispatchEvent(new CustomEvent('orbit:change', { detail: { type } }));
  }
  function on(fn) { listeners.push(fn); }

  /* ── 收藏 ─────────────────────────────────────────── */
  function isFav(fullName) { return state.favorites.indexOf(fullName) > -1; }
  function toggleFav(fullName) {
    const i = state.favorites.indexOf(fullName);
    if (i > -1) { state.favorites.splice(i, 1); toast('已取消收藏'); }
    else { state.favorites.unshift(fullName); toast('已加入收藏'); }
    emit('favorites');
    cloudSchedule();
    return i === -1;
  }
  function removeFav(fullName) {
    state.favorites = state.favorites.filter((x) => x !== fullName);
    emit('favorites'); cloudSchedule();
  }
  function clearFavs() { state.favorites = []; emit('favorites'); cloudSchedule(); }

  /* ── 最近访问 ─────────────────────────────────────── */
  function addRecent(fullName) {
    state.recent = [{ f: fullName, at: Date.now() }].concat(state.recent.filter((x) => x.f !== fullName)).slice(0, 30);
    emit('recent');
  }

  /* ── 设置 / 主题 ─────────────────────────────────── */
  function setSetting(k, v) { state.settings[k] = v; emit('settings'); if (k === 'theme') applyTheme(); cloudSchedule(); }
  function applyTheme() {
    let t = state.settings.theme;
    if (t === 'auto') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', t);
    const meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0b0b0f' : '#f5f5f7');
  }

  /* ── 导入 / 导出 ─────────────────────────────────── */
  function exportData() {
    return JSON.stringify({
      app: 'Orbit · GitHub 导航站', version: 1,
      exportedAt: new Date().toISOString(),
      favorites: state.favorites, recent: state.recent, settings: state.settings,
    }, null, 2);
  }
  function importData(json) {
    const d = typeof json === 'string' ? JSON.parse(json) : json;
    if (!d || !Array.isArray(d.favorites)) throw new Error('文件格式不正确');
    state.favorites = Array.from(new Set(state.favorites.concat(d.favorites.map(String))));
    if (d.recent) state.recent = d.recent.slice(0, 30);
    if (d.settings) state.settings = Object.assign({}, state.settings, d.settings, { theme: state.settings.theme });
    emit('import'); applyTheme(); toast('导入成功');
  }

  /* ──────────────────────────────────────────────────────────
     可选云同步：GitHub 私有 Gist
     - 令牌只保存在本机，仅用于访问你自己的 Gist
     - 推荐 fine-grained PAT：只勾选 Gists 读写权限
     - 未登录时以下方法全部安全跳过
     ────────────────────────────────────────────────────────── */
  const API = 'https://api.github.com';

  function headers(token) {
    const t = token || (state.account && state.account.token);
    return {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(t ? { Authorization: 'Bearer ' + t } : {}),
    };
  }

  async function api(path, opts) {
    const res = await fetch(API + path, { ...opts, headers: headers((opts || {}).token) });
    if (!res.ok) {
      let msg = 'HTTP ' + res.status;
      try { const j = await res.json(); if (j.message) msg = j.message; } catch (e) {}
      throw new Error(msg);
    }
    return res.status === 204 ? null : res.json();
  }

  function syncStatus(text, syncing) {
    const el = document.getElementById('syncStatus');
    if (!el) return;
    el.classList.toggle('syncing', !!syncing);
    el.querySelector('span:last-child').textContent = text;
  }

  async function connectWithToken(token) {
    if (!token || !token.trim()) throw new Error('请填写令牌');
    const user = await api('/user', { token: token.trim() });
    state.account = {
      login: user.login, avatar: user.avatar_url, token: token.trim(),
      gistId: (state.account && state.account.gistId) || '', mode: 'token',
    };
    emit('account');
    syncStatus('已连接 @' + user.login);
    return user;
  }

  /**
   * 可选：GitHub Device Flow（需 OAuth App 开启 Device Flow）。
   * 部分浏览器会因 GitHub 登录端点不允许跨域而失败，失败时请改用个人访问令牌。
   * onCode(userCode, verificationUri) 用于把验证码展示给用户。
   */
  async function deviceFlow(clientId, onCode, proxy) {
    if (!clientId) throw new Error('尚未配置 OAuth Client ID，请使用个人访问令牌');
    const base = proxy ? proxy.replace(/\/$/, '') : 'https://github.com';
    const r1 = await fetch(base + '/login/device/code', {
      method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, scope: 'read:user gist' }),
    });
    if (!r1.ok) throw new Error('无法发起设备登录（浏览器跨域限制），请改用个人访问令牌');
    const d = await r1.json();
    onCode(d.user_code, d.verification_uri, d.verification_uri_complete);
    const deadline = Date.now() + (d.expires_in || 900) * 1000;
    const interval = (d.interval || 5) * 1000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, interval));
      const r2 = await fetch(base + '/login/oauth/access_token', {
        method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: clientId, device_code: d.device_code, grant_type: 'urn:ietf:params:oauth:grant-type:device_code' }),
      });
      const j = await r2.json();
      if (j.access_token) return connectWithToken(j.access_token);
      if (j.error && j.error !== 'authorization_pending') throw new Error(j.error_description || j.error);
    }
    throw new Error('登录超时，请重试');
  }

  function payload() {
    return {
      app: 'orbit', version: 1, updatedAt: new Date().toISOString(),
      favorites: state.favorites, recent: state.recent.slice(0, 20),
      settings: { theme: state.settings.theme, view: state.settings.view, sort: state.settings.sort },
    };
  }

  async function findGist() {
    if (state.account.gistId) return state.account.gistId;
    const list = await api('/gists?per_page=100');
    const found = (list || []).find((g) => g.description === GIST_DESC || (g.files && g.files[GIST_FILE]));
    if (found) { state.account.gistId = found.id; emit('account'); return found.id; }
    const created = await api('/gists', {
      method: 'POST',
      body: JSON.stringify({ description: GIST_DESC, public: false, files: { [GIST_FILE]: { content: JSON.stringify(payload(), null, 2) } } }),
    });
    state.account.gistId = created.id; state.lastSync = new Date().toISOString();
    emit('account');
    return created.id;
  }

  async function pull() {
    const id = await findGist();
    const gist = await api('/gists/' + id);
    const raw = gist.files && gist.files[GIST_FILE] && gist.files[GIST_FILE].content;
    if (!raw) return false;
    const remote = JSON.parse(raw);
    if (remote.favorites) state.favorites = Array.from(new Set(state.favorites.concat(remote.favorites)));
    if (remote.recent) {
      const map = new Map();
      remote.recent.concat(state.recent).forEach((r) => { if (r && r.f) map.set(r.f, r); });
      state.recent = Array.from(map.values()).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 30);
    }
    if (remote.settings) {
      // 本地主题优先，避免不同设备互相覆盖外观偏好
      const theme = state.settings.theme;
      state.settings = Object.assign({}, state.settings, remote.settings, { theme });
    }
    state.lastSync = new Date().toISOString();
    emit('sync-pull');
    return true;
  }

  async function push() {
    const id = await findGist();
    await api('/gists/' + id, {
      method: 'PATCH',
      body: JSON.stringify({ description: GIST_DESC, files: { [GIST_FILE]: { content: JSON.stringify(payload(), null, 2) } } }),
    });
    state.lastSync = new Date().toISOString();
    emit('sync-push');
    return true;
  }

  async function syncNow(silent) {
    if (!state.account || !state.account.token) { if (!silent) toast('当前是游客模式，无需同步'); return false; }
    try {
      syncStatus('正在同步…', true);
      await pull();
      await push();
      syncStatus('已同步 · @' + state.account.login);
      if (!silent) toast('同步完成，收藏已跨端更新');
      return true;
    } catch (e) {
      syncStatus('同步失败 · 本地可用');
      if (!silent) toast('同步失败：' + e.message);
      return false;
    }
  }

  let syncTimer = null;
  function cloudSchedule() {
    if (!state.account || !state.account.token) return;
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => syncNow(true), 4000);
  }

  function disconnect() {
    state.account = null;
    emit('account');
    syncStatus('本地模式 · 无需登录');
    toast('已退出，本地数据保留');
  }

  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.settings.theme === 'auto') applyTheme();
  });

  w.GH.Store = {
    get state() { return state; },
    on, emit, save, isFav, toggleFav, removeFav, clearFavs, addRecent,
    setSetting, applyTheme, exportData, importData, syncStatus,
  };
  w.GH.Cloud = { connectWithToken, deviceFlow, syncNow, pull, push, disconnect, findGist };
})(window);
