/**
 * Orbit · 站点配置
 * ------------------------------------------------------------
 * 网站、PWA、桌面端共用同一份代码与同一份配置。
 * 部署到 GitHub Pages 二级域名时，只需把 githubUser / githubRepo 改成你自己的。
 * 生成的地址： https://<githubUser>.github.io/<githubRepo>/
 * 若使用自定义域名，把 siteUrl 改成你的域名即可。
 */
window.__GH_NAV_CONFIG__ = {
  siteName: 'Orbit',
  siteSubtitle: 'GitHub 导航站',
  slogan: '发现值得用的开源项目',

  // ── GitHub Pages ────────────────────────────────────────────
  githubUser: 'DaiYiqq',            // GitHub 用户名
  githubRepo: 'orbit-github-nav',   // 仓库名（与 Pages 二级域名一致）
  siteUrl: '',                     // 自定义域名；留空时按当前站点自动推断

  // ── 开发者联系信息 ─────────────────────────────────
  // 取自 GitHub 公开资料；账号未公开邮箱 / 个人主页，所以留空，
  // 站内「联系开发者」页会明确显示「未公开」并引导使用 Issues。
  // 想补充时直接填 email / site，页面与 README 会自动带上。
  developer: {
    name: '戴亿',
    github: 'DaiYiqq',
    githubUrl: 'https://github.com/DaiYiqq',
    avatar: 'https://avatars.githubusercontent.com/u/238861530?v=4',
    repoUrl: 'https://github.com/DaiYiqq/orbit-github-nav',
    issuesUrl: 'https://github.com/DaiYiqq/orbit-github-nav/issues',
    telegram: 'daiyi520',
    telegramUrl: 'https://t.me/daiyi520',
    telegramChannel: 'rootlover52',
    telegramChannelUrl: 'https://t.me/rootlover52',
    qq: '1703205607',
    email: '',
    site: '',
    note: '欢迎通过 Issues、Telegram 或 QQ 反馈问题、提出建议或申请收录项目。',
  },

  // ── 可选登录 / 跨端同步 ─────────────────────────────────────
  // 完全可选：不填也能正常使用（收藏、主题、最近访问保存在本机）。
  // 填写 GitHub OAuth App 的 Client ID 后，可用 Device Flow 登录，
  // 通过私有 Gist 在网站 / 手机 PWA / 桌面端之间同步收藏与设置。
  // 创建方式：GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
  //   Authorization callback URL 可填站点首页，并勾选 "Enable Device Flow"。
  oauthClientId: '',

  // GitHub Search API 实时全站搜索（可选，匿名 10 次/分钟）。
  // 填入只读 token 可提高额度；不填时匿名调用，长尾仓库仍可搜索。
  githubApiToken: '',

  // 数据自动更新周期（由 .github/workflows/update-data.yml 保证）
  refreshDays: 7,
  version: '1.0.0',
};
