/* Orbit · 可访问性与健壮性层
 * - 弹层（模态框 / 抽屉 / 命令面板）焦点陷阱与焦点恢复
 * - 动态图片 alt 兜底
 * - 全局 error / unhandledrejection 边界（记录 + 限频提示，不刷屏）
 * 只做增强，不改变业务逻辑；不依赖任何第三方库。
 */
(function (w) {
  'use strict';
  const G = w.GH;
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let active = null, lastFocus = null;

  const isVisible = (el) => el && (el.offsetWidth > 0 || el.offsetHeight > 0 || el === document.activeElement);
  const focusables = (root) => Array.from(root.querySelectorAll(FOCUSABLE)).filter(isVisible);

  function trap(container) {
    if (active === container) return;
    lastFocus = document.activeElement;
    active = container;
    const items = focusables(container);
    if (items.length) {
      setTimeout(() => { if (active === container) items[0].focus({ preventScroll: true }); }, 40);
    }
  }
  function release(container) {
    if (active !== container) return;
    active = null;
    if (lastFocus && lastFocus.isConnected && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  document.addEventListener('keydown', (e) => {
    if (!active || e.key !== 'Tab') return;
    const items = focusables(active);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!active.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  });

  ['modalOverlay', 'drawer', 'cmdkOverlay'].forEach((id) => {
    const el = document.getElementById(id);
    if (!el || !('MutationObserver' in w)) return;
    new MutationObserver(() => {
      if (el.classList.contains('open')) trap(el);
      else release(el);
    }).observe(el, { attributes: true, attributeFilter: ['class'] });
  });

  // SPA 动态插入的图片统一补 alt，避免读屏器念出 URL
  function fixImages(root) {
    (root || document).querySelectorAll('img:not([alt])').forEach((img) => img.setAttribute('alt', ''));
  }
  const view = document.getElementById('view');
  if (view && 'MutationObserver' in w) {
    let t = null;
    new MutationObserver(() => { clearTimeout(t); t = setTimeout(() => fixImages(view), 120); })
      .observe(view, { childList: true, subtree: true });
  }
  fixImages(document);

  // 全局错误边界：记录最近 30 条，最多每 30 秒提示一次
  w.__ORBIT_ERRORS__ = [];
  let lastToast = 0;
  function record(kind, detail) {
    w.__ORBIT_ERRORS__.push({ kind, detail: String(detail || '').slice(0, 200), at: Date.now() });
    if (w.__ORBIT_ERRORS__.length > 30) w.__ORBIT_ERRORS__.shift();
    const now = Date.now();
    if (now - lastToast > 30000 && G && G.toast) {
      lastToast = now;
      G.toast('刚才有个小异常，页面仍可继续使用');
    }
  }
  w.addEventListener('error', (e) => { if (e && e.message) record('error', e.message); });
  w.addEventListener('unhandledrejection', (e) => {
    const reason = e && e.reason;
    record('rejection', (reason && (reason.message || reason)) || 'unknown');
  });
})(window);
