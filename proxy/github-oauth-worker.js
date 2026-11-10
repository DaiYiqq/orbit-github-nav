/**
 * Orbit · GitHub OAuth 交换代理（Cloudflare Worker 模板）
 * ------------------------------------------------------------
 * 为什么需要它：GitHub OAuth App 的「授权码 → access_token」交换必须带 client_secret，
 * 而浏览器前端不能保存任何密钥。这个免费 Worker 只做一件事：拿 code 换 token，
 * 立刻把 token 交还给浏览器，自己不存储、不记录。
 *
 * 部署步骤（约 3 分钟，免费额度足够个人站点）：
 *   1. dash.cloudflare.com → Workers & Pages → Create Worker → 粘贴本文件代码。
 *   2. Settings → Variables and Secrets 添加：
 *        GITHUB_CLIENT_ID         = 你的 OAuth App Client ID
 *        GITHUB_CLIENT_SECRET     = 你的 OAuth App Client Secret（务必用 Secret 类型）
 *        ALLOWED_ORIGIN           = https://orbit-github-nav.app.workbuddy.host
 *                                   （若同时用 GitHub Pages，可填多个，用英文逗号分隔）
 *        ALLOWED_REDIRECT_PREFIX = https://orbit-github-nav.app.workbuddy.host/
 *                                   （留空则只按 ALLOWED_ORIGIN 校验）
 *   3. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App：
 *        Homepage URL              = 你的站点根地址
 *        Authorization callback URL= 你的站点根地址 + "?github_oauth=1"
 *   4. 把 Worker 的公开地址（如 https://xxx.workers.dev）与 Client ID 填入
 *      site/cloud-config.js 的 githubOAuth.proxyUrl / githubOAuth.clientId。
 *
 * 安全约束：
 *   - 只接受来自 ALLOWED_ORIGIN 的请求（CORS + Origin 双重校验）。
 *   - 只接受白名单前缀内的 redirect_uri，避免被用作开放重定向。
 *   - 不记录 code / token / 用户信息，不写任何存储。
 */

const CORS_BASE = {
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
};

function corsFor(origin, allowed) {
  const list = String(allowed || '').split(',').map((s) => s.trim()).filter(Boolean);
  const ok = list.includes(origin);
  return { ok, headers: { ...CORS_BASE, ...(ok ? { 'Access-Control-Allow-Origin': origin } : {}) } };
}

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const { ok, headers } = corsFor(origin, env.ALLOWED_ORIGIN);

    if (request.method === 'OPTIONS') return new Response(null, { status: ok ? 204 : 403, headers });
    if (request.method !== 'POST') return json({ error: '仅支持 POST' }, 405, headers);
    if (!ok) return json({ error: '请求来源未被允许，请检查 Worker 的 ALLOWED_ORIGIN' }, 403, headers);
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
      return json({ error: 'Worker 尚未配置 GITHUB_CLIENT_ID / GITHUB_CLIENT_SECRET' }, 500, headers);
    }

    let payload;
    try { payload = await request.json(); } catch (e) { return json({ error: '请求体不是合法 JSON' }, 400, headers); }
    const code = String(payload.code || '');
    const redirectUri = String(payload.redirect_uri || '');
    if (!code || !/^[\w-]{10,120}$/.test(code)) return json({ error: '缺少有效的授权码' }, 400, headers);

    const prefixes = String(env.ALLOWED_REDIRECT_PREFIX || '').split(',').map((s) => s.trim()).filter(Boolean);
    const effective = prefixes.length ? prefixes : [String(env.ALLOWED_ORIGIN || '').split(',')[0].trim() + '/'];
    if (!effective.some((p) => p && redirectUri.startsWith(p))) {
      return json({ error: '回调地址不在白名单内' }, 400, headers);
    }

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'orbit-github-nav-oauth' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.access_token) {
      return json({ error: data.error_description || data.error || 'GitHub 授权码交换失败' }, 400, headers);
    }
    // token 只返回给发起请求的浏览器，Worker 不做任何持久化或日志
    return json({ access_token: data.access_token, token_type: data.token_type || 'bearer', scope: data.scope || '' }, 200, headers);
  },
};
