/* Orbit · Service Worker
 * 分级缓存：
 *  - 代码 / 页面：网络优先 + 缓存兜底 → 发版立即生效，离线仍可用。
 *  - data/ 数据索引：缓存优先 + 后台静默更新（stale-while-revalidate）→ 重复访问秒开。
 * 预缓存清单覆盖站点全部本地资源，首次安装后整个网站可离线打开。
 * 路径均相对 sw.js 所在目录，兼容 GitHub Pages 二级域名 /<repo>/ 子路径。
 */
const CACHE = 'orbit-shell-v3';
const INDEX_URL = new URL('./index.html', self.registration.scope).href;
const SHELL = [
  './', './index.html', './config.js', './cloud-config.js', './manifest.webmanifest',
  './robots.txt', './sitemap.xml',
  './assets/css/app.css', './assets/css/motion.css',
  './assets/js/core.js', './assets/js/cloud.js', './assets/js/auth-ui.js',
  './assets/js/store.js', './assets/js/source.js', './assets/js/views.js',
  './assets/js/pages.js', './assets/js/app.js', './assets/js/motion.js', './assets/js/a11y.js',
  './data/catalog.js', './data/docs.js', './data/repos.js',
  './assets/icons/favicon.svg', './assets/icons/icon.svg',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png', './assets/icons/icon-180.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()).catch(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // 外部 API / 头像 / 外链交给浏览器
  if (url.pathname.endsWith('/sw.js')) return;            // 不缓存自身

  const isNav = req.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');
  const cacheKey = isNav ? INDEX_URL : url.href;
  const isData = /\/data\//.test(url.pathname);

  // 数据索引体积大、更新频率低：先给缓存秒开，再后台拉新版本供下次使用
  if (isData && !isNav) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(cacheKey);
      const update = fetch(req).then((res) => {
        if (res && res.ok) caches.open(CACHE).then((c) => c.put(cacheKey, res.clone())).catch(() => {});
        return res;
      }).catch(() => null);
      if (cached) return cached;
      return (await update) || (await cache.match(INDEX_URL)) || Response.error();
    })());
    return;
  }

  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(cacheKey, copy)).catch(() => {});
      }
      return res;
    }).catch(async () => {
      const cache = await caches.open(CACHE);
      return (await cache.match(cacheKey)) || (isNav ? await cache.match(INDEX_URL) : null) || Response.error();
    })
  );
});
