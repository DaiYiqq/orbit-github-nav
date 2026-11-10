/* Orbit · 网站登录与账号中心 UI
 * 登录方式：邮箱验证码、手机短信验证码（真实云服务会话）。
 * GitHub 账号：在本站「连接」自己的 GitHub，用于识别身份、提升 API 额度与同步数据。
 * 游客模式始终可用，任何失败都明确展示，不伪造登录态。
 */
(function (w) {
  'use strict';
  const G = w.GH;
  const C = w.GHCloud;
  const { esc, icon, toast } = G;

  let tab = 'email';
  let msg = '';
  let msgKind = 'error';
  let codeSent = false;
  let cooldown = 0;
  let timer = null;
  let busy = false;

  const ui = () => w.GHApp;
  function modal(html) { if (ui()) ui().openModal(html); }
  function close() { if (ui()) ui().closeModal(); }

  function setMsg(text, kind) {
    msg = text || ''; msgKind = kind || 'error';
    const el = document.getElementById('authMsg');
    if (el) { el.textContent = msg; el.className = 'auth-msg ' + (msgKind === 'ok' ? 'ok' : ''); el.style.display = msg ? 'block' : 'none'; }
  }

  function clearTimer() { if (timer) { clearInterval(timer); timer = null; } }

  function startCooldown() {
    clearTimer(); cooldown = 60;
    const tick = () => {
      const btn = document.querySelector('[data-act="auth-send-code"]');
      if (btn) {
        btn.disabled = cooldown > 0;
        btn.textContent = cooldown > 0 ? `${cooldown}s 后重发` : '重新获取验证码';
      }
      if (cooldown <= 0) clearTimer();
      cooldown--;
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  function notice() {
    if (!C.state.sdkError) return '';
    return `<div class="auth-note warn">${icon('info', 15)} <span>${esc(C.state.sdkError)}</span></div>`;
  }

  function emailPanel() {
    return `<div class="auth-form">
      <label class="form-label">邮箱地址</label>
      <input id="authAccount" type="email" placeholder="you@example.com" autocomplete="email" ${codeSent ? 'readonly' : ''}>
      <div class="auth-code-row">
        <input id="authCode" type="text" inputmode="numeric" maxlength="8" placeholder="6 位验证码" autocomplete="one-time-code">
        <button class="btn btn-sm" type="button" data-act="auth-send-code" ${cooldown > 0 ? 'disabled' : ''}>${cooldown > 0 ? cooldown + 's 后重发' : codeSent ? '重新获取验证码' : '获取验证码'}</button>
      </div>
      <button class="btn btn-primary auth-submit" type="button" data-act="auth-submit">登录 / 注册</button>
      <p class="auth-hint">验证码由云端发送。新用户验证通过即自动注册，无需设置密码。</p>
    </div>`;
  }

  function phonePanel() {
    return `<div class="auth-form">
      <label class="form-label">手机号（中国大陆 11 位）</label>
      <input id="authAccount" type="tel" inputmode="numeric" maxlength="11" placeholder="13800138000" autocomplete="tel" ${codeSent ? 'readonly' : ''}>
      <div class="auth-code-row">
        <input id="authCode" type="text" inputmode="numeric" maxlength="8" placeholder="短信验证码" autocomplete="one-time-code">
        <button class="btn btn-sm" type="button" data-act="auth-send-code" ${cooldown > 0 ? 'disabled' : ''}>${cooldown > 0 ? cooldown + 's 后重发' : codeSent ? '重新获取验证码' : '获取验证码'}</button>
      </div>
      <button class="btn btn-primary auth-submit" type="button" data-act="auth-submit">登录 / 注册</button>
      <p class="auth-hint">短信由云端发送，验证码仅在本次发送中有效；输错可直接重试，不会重复发短信。</p>
    </div>`;
  }

  function githubPanel() {
    const gh = C.github();
    const cfgOk = C.githubOAuthConfigured();
    return `<div class="auth-form">
      <div class="auth-note">${icon('info', 16)} <span>「连接 GitHub」是把你的 GitHub 身份与数据接到本站：显示头像、提升源码接口额度、同步收藏。网站账号本身用邮箱或手机验证码登录。Star / Fork / 提 PR 等写操作仍在 GitHub 官网完成。</span></div>
      ${gh ? `<div class="auth-gh-card">
          ${gh.avatar ? `<img src="${esc(gh.avatar)}" alt="">` : `<span class="auth-gh-initial">${esc((gh.login || 'G').charAt(0).toUpperCase())}</span>`}
          <div><b>@${esc(gh.login)}</b><small>${gh.mode === 'oauth' ? 'OAuth 授权连接' : '访问令牌连接'} · ${new Date(gh.connectedAt || Date.now()).toLocaleDateString('zh-CN')}</small></div>
          <button class="btn btn-sm btn-ghost" data-act="auth-github-disconnect">断开</button>
        </div>` : ''}
      <label class="form-label">方式一 · GitHub 授权连接（OAuth）</label>
      <button class="btn auth-submit" type="button" data-act="auth-github-oauth">${icon('github', 15)} 使用 GitHub 账号连接</button>
      ${cfgOk ? '<p class="auth-hint">已配置授权代理，点击后会跳转到 GitHub 完成授权。</p>'
        : '<p class="auth-hint">需先在 <b>site/cloud-config.js</b> 填 <b>clientId / proxyUrl</b> 并部署 <b>proxy/github-oauth-worker.js</b>；未配置时可直接使用下面的访问令牌方式。</p>'}
      <div class="divider" style="margin:18px 0"></div>
      <label class="form-label">方式二 · 个人访问令牌（无需后端）</label>
      <input id="ghToken" type="password" placeholder="github_pat_… 或 ghp_…" autocomplete="off">
      <button class="btn auth-submit" type="button" data-act="auth-github-token">${icon('link', 15)} 用令牌连接</button>
      <p class="auth-hint">在 GitHub → Settings → Developer settings 创建 fine-grained token，授予 <b>只读</b> 的 Gists 与公开仓库权限即可。令牌只保存在本机浏览器，不会上传到本站服务器。</p>
    </div>`;
  }

  function renderPanel() {
    const box = document.getElementById('authPanel');
    if (!box) return;
    setMsg('');
    box.innerHTML = notice() + (tab === 'email' ? emailPanel() : tab === 'phone' ? phonePanel() : githubPanel())
      + '<div class="auth-msg" id="authMsg" style="display:none"></div>';
    document.querySelectorAll('.auth-tab').forEach((b) => b.classList.toggle('active', b.dataset.v === tab));
  }

  /** 把同一套登录表单挂进「账号与登录」整页（不再只是小弹窗） */
  function mountAccountPage(which) {
    const slot = document.getElementById('accountAuthSlot');
    if (!slot) return;
    tab = which || tab || 'email';
    codeSent = false; cooldown = 0; clearTimer();
    slot.innerHTML = `<div class="auth-tabs">
        <button class="auth-tab" data-act="auth-tab" data-v="email">邮箱验证码</button>
        <button class="auth-tab" data-act="auth-tab" data-v="phone">手机验证码</button>
        <button class="auth-tab" data-act="auth-tab" data-v="github">GitHub 账号</button>
      </div><div id="authPanel"></div>`;
    renderPanel();
  }

  function inPage() { return !!document.getElementById('accountAuthSlot'); }

  function loginModal(which) {
    tab = which || tab || 'email';
    codeSent = false; cooldown = 0; clearTimer();
    modal(`<h3>登录 / 注册 Orbit</h3>
      <p>不登录也能完整使用本站。登录后收藏、设置会自动同步到云端，换设备也不丢。</p>
      <div class="auth-tabs">
        <button class="auth-tab" data-act="auth-tab" data-v="email">邮箱验证码</button>
        <button class="auth-tab" data-act="auth-tab" data-v="phone">手机验证码</button>
        <button class="auth-tab" data-act="auth-tab" data-v="github">GitHub 账号</button>
      </div>
      <div id="authPanel"></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-act="auth-close">先不登录</button></div>`);
    renderPanel();
  }

  function accountModal() {
    const s = C.state;
    const user = s.user;
    const gh = C.github();
    const label = user ? (user.name || user.email || user.phone || '已登录用户') : '';
    modal(`<h3>账号中心</h3>
      <p>网站账号用邮箱或手机验证码登录；GitHub 连接用于读取你的 GitHub 身份与数据。两者彼此独立，也可以都不用。</p>
      <div class="auth-account-row">
        <span class="auth-avatar">${user && user.avatarUrl ? `<img src="${esc(user.avatarUrl)}" alt="">` : (user ? esc(label.charAt(0).toUpperCase()) : '游')}</span>
        <div><b>${user ? esc(label) : '游客模式'}</b>
          <small>${user ? '已登录 · 收藏与设置自动云同步' : '无需登录 · 数据保存在本机'}</small></div>
      </div>
      <div class="auth-account-row">
        <span class="auth-avatar gh">${gh ? (gh.avatar ? `<img src="${esc(gh.avatar)}" alt="">` : esc((gh.login || 'G').charAt(0).toUpperCase())) : icon('github', 18)}</span>
        <div><b>${gh ? '@' + esc(gh.login) : 'GitHub 未连接'}</b><small>${gh ? '已连接 · 源码接口额度更高' : '连接后可显示头像并使用更高 API 额度'}</small></div>
      </div>
      <div class="account-actions">
        ${user ? `<button class="btn btn-sm" data-act="auth-sync">${icon('sync', 14)} 立即同步</button>
          <button class="btn btn-sm btn-ghost" data-act="auth-logout">${icon('logout', 14)} 退出登录</button>`
        : `<button class="btn btn-primary btn-sm" data-act="auth-open-login">${icon('user', 14)} 登录 / 注册</button>`}
        <button class="btn btn-sm btn-ghost" data-act="auth-github">${icon('github', 14)} ${gh ? '管理 GitHub 连接' : '连接 GitHub'}</button>
      </div>
      <div class="auth-msg" id="authMsg" style="display:none"></div>
      <div class="modal-actions"><button class="btn btn-ghost" data-act="auth-close">关闭</button></div>`);
  }

  /* ── 事件处理（由 app.js 统一转发 auth-* 动作） ── */
  async function handle(act, el) {
    try {
      switch (act) {
        case 'auth-tab':
          tab = el.dataset.v; codeSent = false; cooldown = 0; clearTimer(); renderPanel(); break;
        case 'auth-close':
          if (inPage()) { if (ui()) ui().go('#/discover'); } else close();
          break;
        case 'auth-open-login':
          if (inPage()) { tab = 'email'; codeSent = false; cooldown = 0; clearTimer(); renderPanel(); }
          else { close(); loginModal('email'); }
          break;
        case 'auth-github':
          if (inPage()) { tab = 'github'; codeSent = false; cooldown = 0; clearTimer(); renderPanel(); }
          else { close(); loginModal('github'); }
          break;

        case 'auth-send-code': {
          if (busy) return;
          const account = (document.getElementById('authAccount') || {}).value || '';
          busy = true; setMsg('正在发送…', 'ok');
          try {
            if (tab === 'email') await C.sendEmailCode(account);
            else await C.sendPhoneCode(account);
            codeSent = true;
            setMsg('验证码已发送，请查收后填入（收不到可稍后重发）', 'ok');
            startCooldown();
          } finally { busy = false; }
          break;
        }

        case 'auth-submit': {
          if (busy) return;
          const account = (document.getElementById('authAccount') || {}).value || '';
          const code = (document.getElementById('authCode') || {}).value || '';
          busy = true; setMsg('正在验证…', 'ok');
          try {
            if (tab === 'email') await C.verifyEmailCode(account, code);
            else await C.verifyPhoneCode(account, code);
            clearTimer();
            close();
            toast('登录成功，正在同步你的收藏');
            if (w.GHApp && w.GHApp.afterLogin) w.GHApp.afterLogin();
          } finally { busy = false; }
          break;
        }

        case 'auth-github-oauth':
          C.githubStartOAuth();
          break;

        case 'auth-github-token': {
          if (busy) return;
          const token = (document.getElementById('ghToken') || {}).value || '';
          busy = true; setMsg('正在验证令牌…', 'ok');
          try {
            const account = await C.githubConnectWithToken(token, 'token');
            toast('已连接 GitHub @' + account.login);
            renderPanel();
            setMsg('连接成功，源码浏览将使用更高的 API 额度', 'ok');
            if (w.GHApp && w.GHApp.refreshAccount) w.GHApp.refreshAccount();
          } finally { busy = false; }
          break;
        }

        case 'auth-github-disconnect':
          C.githubDisconnect();
          renderPanel();
          toast('已断开 GitHub 连接');
          if (w.GHApp && w.GHApp.refreshAccount) w.GHApp.refreshAccount();
          break;

        case 'auth-sync':
          setMsg('正在同步…', 'ok');
          if (w.GHApp && w.GHApp.syncNow) {
            const ok = await w.GHApp.syncNow();
            setMsg(ok ? '同步完成' : '同步失败，请稍后重试', ok ? 'ok' : 'error');
          }
          break;

        case 'auth-logout':
          await C.signOut();
          close();
          toast('已退出登录，本机收藏仍保留');
          if (w.GHApp && w.GHApp.refreshAccount) w.GHApp.refreshAccount();
          break;

        default: break;
      }
    } catch (e) {
      setMsg(e.message || '操作失败，请重试', 'error');
    }
  }

  w.GHAuthUI = { loginModal, accountModal, mountAccountPage, handle, renderPanel };
})(window);
