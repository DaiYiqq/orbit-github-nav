/* Orbit · 云服务层
 * 一个 cloud 实例复用 Auth / Database；所有配置只来自 publicConfig（site/cloud-config.js）。
 * 登录方式：邮箱验证码、手机短信验证码（真实云服务会话）。
 * GitHub 账号连接：OAuth 授权码（经自建 Worker 代理）或个人访问令牌，凭证只留在本机。
 * 游客模式永远可用；SDK 未加载 / Origin 不匹配时给出明确错误，绝不伪造登录态。
 */
(function (w) {
  'use strict';
  const G = w.GH;
  const CFG = w.__ORBIT_CLOUD__ || {};
  const GH_KEY = 'orbit:github-account:v1';
  const DB_TABLE = 'orbit_profiles';

  const state = {
    ready: false,
    sdkError: '',
    cloud: null,
    session: null,
    user: null,
    github: G.LS.get(GH_KEY, null),
    profile: null,
  };
  const listeners = [];
  const on = (fn) => listeners.push(fn);
  const emit = (type) => listeners.forEach((fn) => { try { fn(type, state); } catch (e) { console.warn(e); } });

  // OTP challenge 保存在内存中：发码与校验必须是两个独立动作，错误码重试不重发
  let pendingEmail = null;
  let pendingPhone = null;

  function errMsg(e, fallback) {
    return (e && (e.message || e.msg)) || fallback || '操作失败，请重试';
  }

  let sdkListener = false;

  function init() {
    if (state.cloud) { emit('init'); return state.cloud; }
    const SDK = w.WorkBuddyCloud;
    if (!SDK || typeof SDK.createWorkBuddyCloud !== 'function') {
      if (w.__ORBIT_SDK_FAILED__) {
        state.sdkError = '云服务组件加载失败，登录暂不可用；其余功能正常。';
        emit('init');
        return null;
      }
      // SDK 异步注入：未就绪时等待事件，不阻塞首屏，也不伪造登录态
      state.sdkError = '云服务组件正在加载…（浏览与游客功能不受影响）';
      if (!sdkListener) {
        sdkListener = true;
        document.addEventListener('orbit:sdk-ready', () => init(), { once: true });
        document.addEventListener('orbit:sdk-failed', () => {
          state.sdkError = '云服务组件加载失败，登录暂不可用；其余功能正常。';
          emit('init');
        }, { once: true });
      }
      emit('init');
      return null;
    }
    if (!CFG.endpoint || !CFG.publishableKey) {
      state.sdkError = '缺少云服务公开配置，请检查 site/cloud-config.js。';
      emit('init');
      return null;
    }
    try {
      state.cloud = SDK.createWorkBuddyCloud({
        endpoint: CFG.endpoint,
        oauthRelayBaseUrl: CFG.oauthRelayBaseUrl,
        publishableKey: CFG.publishableKey,
      });
      state.ready = true;
      state.sdkError = '';
      if (typeof state.cloud.auth.onAuthStateChange === 'function') {
        state.cloud.auth.onAuthStateChange((event, session) => {
          state.session = session || null;
          state.user = session && session.user ? session.user : null;
          emit(event || 'auth');
        });
      }
      emit('init');
    } catch (e) {
      state.sdkError = '云服务初始化失败：' + errMsg(e);
      emit('init');
    }
    return state.cloud;
  }

  function requireCloud() {
    if (!state.ready || !state.cloud) throw new Error(state.sdkError || '云服务不可用，请稍后重试');
    return state.cloud;
  }

  async function getSession() {
    const cloud = requireCloud();
    const { data, error } = await cloud.auth.getSession();
    if (error) throw new Error(errMsg(error, '无法获取登录状态'));
    state.session = data || null;
    state.user = data && data.user ? data.user : null;
    return state.session;
  }

  async function signOut() {
    const cloud = requireCloud();
    const { error } = await cloud.auth.signOut();
    if (error) throw new Error(errMsg(error, '退出失败'));
    state.session = null; state.user = null; state.profile = null;
    emit('signed-out');
  }

  /* ── 邮箱验证码 ─────────────────────────────────── */
  async function sendEmailCode(email) {
    const value = String(email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error('请输入正确的邮箱地址');
    const cloud = requireCloud();
    const sent = await cloud.auth.sendOtp({ email: value });
    if (sent.error) throw new Error(errMsg(sent.error, '验证码发送失败'));
    pendingEmail = {
      email: value,
      verificationId: sent.data.verificationId,
      isExistingUser: sent.data.isExistingUser,
    };
    pendingPhone = null;
    return true;
  }

  async function verifyEmailCode(email, token) {
    const value = String(email || '').trim().toLowerCase();
    if (!pendingEmail || pendingEmail.email !== value) throw new Error('请先为当前邮箱获取验证码');
    if (!/^\d{4,8}$/.test(String(token || '').trim())) throw new Error('请输入收到的数字验证码');
    const cloud = requireCloud();
    const done = await cloud.auth.verifyOtp({
      email: pendingEmail.email,
      verificationId: pendingEmail.verificationId,
      isExistingUser: pendingEmail.isExistingUser,
      token: String(token).trim(),
    });
    if (done.error) throw new Error(errMsg(done.error, '验证码不正确或已过期'));
    pendingEmail = null;
    await getSession();
    emit('signed-in');
    return state.user;
  }

  /* ── 手机短信验证码 ─────────────────────────────── */
  async function sendPhoneCode(phone) {
    const value = String(phone || '').trim();
    if (!/^1\d{10}$/.test(value)) throw new Error('请输入正确的 11 位手机号');
    const cloud = requireCloud();
    const sent = await cloud.auth.sendOtp({ phone: value });
    if (sent.error) throw new Error(errMsg(sent.error, '短信发送失败'));
    pendingPhone = {
      phone: value,
      verificationId: sent.data.verificationId,
      isExistingUser: sent.data.isExistingUser,
    };
    pendingEmail = null;
    return true;
  }

  async function verifyPhoneCode(phone, token) {
    const value = String(phone || '').trim();
    if (!pendingPhone || pendingPhone.phone !== value) throw new Error('请先为当前手机号获取验证码');
    if (!/^\d{4,8}$/.test(String(token || '').trim())) throw new Error('请输入收到的数字验证码');
    const cloud = requireCloud();
    const done = await cloud.auth.verifyOtp({
      phone: pendingPhone.phone,
      verificationId: pendingPhone.verificationId,
      isExistingUser: pendingPhone.isExistingUser,
      token: String(token).trim(),
    });
    if (done.error) throw new Error(errMsg(done.error, '验证码不正确或已过期'));
    pendingPhone = null;
    await getSession();
    emit('signed-in');
    return state.user;
  }

  /* ── 用户数据（登录后自动带会话；表由云端 RLS 隔离） ── */
  async function loadProfile() {
    const cloud = requireCloud();
    const session = await getSession();
    if (!session) return null;                       // 未登录不触碰用户数据
    const { data, error } = await cloud.database.from(DB_TABLE).select('*').maybeSingle();
    if (error) throw new Error(errMsg(error, '读取云端数据失败'));
    state.profile = data || null;
    return state.profile;
  }

  async function saveProfile(patch) {
    const cloud = requireCloud();
    const session = await getSession();
    if (!session) return false;                     // 游客只写本机，不访问用户表
    const payload = Object.assign({}, patch, { updated_at: new Date().toISOString() });
    const { data: existing, error: readErr } = await cloud.database.from(DB_TABLE).select('id').maybeSingle();
    if (readErr) throw new Error(errMsg(readErr, '读取云端数据失败'));
    if (existing) {
      const { data, error } = await cloud.database.from(DB_TABLE).update(payload).eq('id', existing.id).select();
      if (error) throw new Error(errMsg(error, '同步失败'));
      if (!data || !data.length) throw new Error('同步失败：无权写入这条记录');
    } else {
      const { error } = await cloud.database.from(DB_TABLE).insert(Object.assign({}, payload, {
        owner_name: (session.user && session.user.name) || null,
      }));
      if (error) throw new Error(errMsg(error, '同步失败'));
    }
    return true;
  }

  /* ── GitHub 账号连接 ──────────────────────────────── */
  function github() { return state.github; }
  function githubToken() { return state.github && state.github.token ? state.github.token : ''; }

  function setGithub(account) {
    state.github = account;
    if (account) G.LS.set(GH_KEY, account); else G.LS.remove(GH_KEY);
    emit('github');
    document.dispatchEvent(new CustomEvent('orbit:github-change'));
  }

  async function githubConnectWithToken(token, mode) {
    const value = String(token || '').trim();
    if (!value) throw new Error('请填写访问令牌');
    const res = await fetch('https://api.github.com/user', {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        Authorization: 'Bearer ' + value,
      },
    });
    if (!res.ok) throw new Error('无法连接：令牌无效或缺少权限（HTTP ' + res.status + '）');
    const u = await res.json();
    setGithub({
      login: u.login, name: u.name || u.login, avatar: u.avatar_url || '',
      token: value, mode: mode || 'token', connectedAt: new Date().toISOString(),
    });
    return state.github;
  }

  function githubOAuthConfigured() {
    return !!(CFG.githubOAuth && CFG.githubOAuth.clientId && CFG.githubOAuth.proxyUrl);
  }

  function githubStartOAuth() {
    const o = CFG.githubOAuth || {};
    if (!o.clientId || !o.proxyUrl) {
      throw new Error('尚未配置 GitHub OAuth：请在 site/cloud-config.js 填 clientId / proxyUrl，并部署 proxy/github-oauth-worker.js。也可以直接用下方「访问令牌」方式连接。');
    }
    const st = (w.crypto && w.crypto.randomUUID) ? w.crypto.randomUUID() : String(Date.now());
    const back = new URL(location.href);
    back.hash = '';
    ['code', 'state', 'error', 'github_oauth'].forEach((k) => back.searchParams.delete(k));
    back.searchParams.set('github_oauth', '1');
    const redirectUri = back.toString();
    sessionStorage.setItem('orbit:gh-state', st);
    sessionStorage.setItem('orbit:gh-redirect', redirectUri);
    const auth = new URL('https://github.com/login/oauth/authorize');
    auth.searchParams.set('client_id', o.clientId);
    auth.searchParams.set('redirect_uri', redirectUri);
    auth.searchParams.set('scope', 'read:user gist');
    auth.searchParams.set('state', st);
    auth.searchParams.set('allow_signup', 'false');
    location.assign(auth.toString());
  }

  async function githubHandleCallback() {
    const u = new URL(location.href);
    if (u.searchParams.get('github_oauth') !== '1') return false;
    const code = u.searchParams.get('code');
    const st = u.searchParams.get('state');
    const deny = u.searchParams.get('error');
    const saved = sessionStorage.getItem('orbit:gh-state');
    const redirectUri = sessionStorage.getItem('orbit:gh-redirect') || '';
    ['code', 'state', 'error', 'github_oauth'].forEach((k) => u.searchParams.delete(k));
    history.replaceState(null, '', `${u.pathname}${u.search}${u.hash}`);
    sessionStorage.removeItem('orbit:gh-state');
    sessionStorage.removeItem('orbit:gh-redirect');
    if (deny) throw new Error('GitHub 授权已取消或失败：' + deny);
    if (!code) return false;
    if (!saved || st !== saved) throw new Error('授权状态校验失败，请重新连接 GitHub');
    const o = CFG.githubOAuth || {};
    const res = await fetch(String(o.proxyUrl).replace(/\/$/, '') + '/exchange', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirect_uri: redirectUri }),
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok || !j.access_token) throw new Error(j.error || '授权码交换失败，请检查代理服务');
    await githubConnectWithToken(j.access_token, 'oauth');
    return true;
  }

  function githubDisconnect() { setGithub(null); }

  w.GHCloud = {
    state, on, emit, init, getSession, signOut,
    sendEmailCode, verifyEmailCode, sendPhoneCode, verifyPhoneCode,
    loadProfile, saveProfile,
    github, githubToken, githubConnectWithToken, githubStartOAuth,
    githubHandleCallback, githubOAuthConfigured, githubDisconnect,
  };
})(window);
