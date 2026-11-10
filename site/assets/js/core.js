/* Orbit · 基础工具层：图标、格式化、DOM、交互反馈 */
(function (w) {
  'use strict';

  const ICONS = {
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
    star: '<path d="m12 3.4 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.9l6.1-.9L12 3.4Z"/>',
    sparkles: '<path d="m12 3 1.8 4.6L18.5 9.5l-4.7 1.9L12 16l-1.8-4.6L5.5 9.5l4.7-1.9L12 3Z"/><path d="m18.5 15.5.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2ZM5 15l.6 1.5L7 17l-1.4.6L5 19l-.6-1.4L3 17l1.4-.5L5 15Z"/>',
    users: '<circle cx="9" cy="8" r="3.1"/><path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 5.4a3.1 3.1 0 0 1 0 5.9M17.5 14.9c2 .6 3.3 2.2 3.3 4.6"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20"/>',
    heart: '<path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.7a4.1 4.1 0 0 1 7.5 2.9C19.5 15.4 12 20 12 20Z"/>',
    plug: '<path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8ZM12 17v4"/>',
    blocks: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M17 13.5v7M13.5 17h7"/>',
    bot: '<rect x="4" y="7.5" width="16" height="12" rx="3"/><path d="M12 3.5v4M8.5 13h.01M15.5 13h.01M9 16.5h6"/><circle cx="12" cy="3.5" r="1"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3.5 12h17M12 3c2.4 2.4 3.5 5.5 3.5 9s-1.1 6.6-3.5 9c-2.4-2.4-3.5-5.5-3.5-9S9.6 5.4 12 3Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.3 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1-2.1 2.1-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2h-3v-.2a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1-2.1-2.1.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1h-.2v-3h.2a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1 2.1-2.1.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5v-.2h3v.2a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1 2.1 2.1-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1h.2v3h-.2a1.6 1.6 0 0 0-1.5 1Z" transform="translate(0 -1) scale(.96)"/>',
    search: '<circle cx="11" cy="11" r="6.6"/><path d="m16 16 4.2 4.2"/>',
    'arrow-right': '<path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"/>',
    'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
    'chevron-right': '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    'git-fork': '<circle cx="6" cy="5" r="2.2"/><circle cx="18" cy="5" r="2.2"/><circle cx="12" cy="19" r="2.2"/><path d="M6 7.2v2.3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V7.2M12 12.5v4.3"/>',
    issue: '<circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.2h.01"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.4l3.3 2"/>',
    code: '<path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.5 4.5l-3 15"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.7 3.2 8 7.5 9.5 4.3-1.5 7.5-4.8 7.5-9.5V6L12 3Z"/><path d="m9 12 2 2 4-4"/>',
    cloud: '<path d="M7 18.5h10.2a3.8 3.8 0 0 0 .3-7.6A5.6 5.6 0 0 0 6.8 9.5 4.5 4.5 0 0 0 7 18.5Z"/>',
    database: '<ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v13c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-13M4.5 12c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-4M12.5 16V7M17 16v-6"/>',
    gamepad: '<path d="M7 8h10a4.5 4.5 0 0 1 4.4 3.6l.8 4.2A2.6 2.6 0 0 1 19.6 19c-.9 0-1.7-.4-2.2-1.1L16 16H8l-1.4 1.9c-.5.7-1.3 1.1-2.2 1.1a2.6 2.6 0 0 1-2.6-3.2l.8-4.2A4.5 4.5 0 0 1 7 8Z"/><path d="M7.5 11v3M6 12.5h3M16 12h.01M18 14h.01"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 5.5h3M11 18.8h2"/>',
    layout: '<rect x="3.5" y="4" width="17" height="16" rx="2.2"/><path d="M3.5 9h17M9 9v11"/>',
    server: '<rect x="3.5" y="4" width="17" height="7" rx="2"/><rect x="3.5" y="13" width="17" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
    bolt: '<path d="M13.5 2.5 5 13.5h6l-.5 8 8.5-11h-6l.5-8Z"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.4"/><circle cx="8.5" cy="10" r="1.6"/><path d="m4 17 4.5-4.5 3.2 3.2 3-3L20 17"/>',
    graduation: '<path d="m2.5 9 9.5-4.5L21.5 9l-9.5 4.5L2.5 9Z"/><path d="M6.5 11v4.5c0 1.5 2.5 3 5.5 3s5.5-1.5 5.5-3V11M21.5 9v6"/>',
    chat: '<path d="M20.5 12a8 8 0 0 1-8 8 8.6 8.6 0 0 1-3.5-.7L4 20.5l1.3-4.4A8 8 0 1 1 20.5 12Z"/>',
    cube: '<path d="m12 2.8 8 4.6v9.2l-8 4.6-8-4.6V7.4l8-4.6Z"/><path d="m4 7.4 8 4.6 8-4.6M12 12v9.2"/>',
    external: '<path d="M13 4.5h6.5V11M19 5l-8.5 8.5M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18.5V7A1.5 1.5 0 0 1 5 5.5h4"/>',
    link: '<path d="M10 13.5a4 4 0 0 0 5.7 0l2.5-2.5a4 4 0 0 0-5.7-5.7l-1.2 1.2M14 10.5a4 4 0 0 0-5.7 0l-2.5 2.5a4 4 0 0 0 5.7 5.7l1.2-1.2"/>',
    copy: '<rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    share: '<path d="M12 15.5V3.8m0 0L8.2 7.6M12 3.8l3.8 3.8"/><path d="M5 13.6v4.7A2.7 2.7 0 0 0 7.7 21h8.6a2.7 2.7 0 0 0 2.7-2.7v-4.7"/>',
    download: '<path d="M12 3.5v11m0 0 4-4m-4 4-4-4M4.5 17.5v1A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5v-1"/>',
    check: '<path d="m4.5 12.5 5 5 10-11"/>',
    x: '<path d="m5.5 5.5 13 13M18.5 5.5l-13 13"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    home: '<path d="m3.5 10.5 8.5-7 8.5 7V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19v-8.5Z"/><path d="M9.5 20.5v-7h5v7"/>',
    user: '<circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c0-3.6 3.3-6 7.5-6s7.5 2.4 7.5 6"/>',
    terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2.4"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15h4"/>',
    filter: '<path d="M3.5 5.5h17l-6.5 7.5V20l-4-2v-5L3.5 5.5Z"/>',
    list: '<path d="M8 6.5h12M8 12h12M8 17.5h12M4 6.5h.01M4 12h.01M4 17.5h.01"/>',
    sync: '<path d="M20 11a8 8 0 0 0-14-4.5L4 8.5M4 4.5v4h4M4 13a8 8 0 0 0 14 4.5l2-2M20 19.5v-4h-4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.8h.01"/>',
    flame: '<path d="M12 21c3.9 0 6.5-2.6 6.5-6 0-2.6-1.5-4.4-3-6-.3 1.6-1.2 2.4-2 2.6.3-3.4-1.4-6.1-3.5-8.1.2 3-1.3 4.6-2.8 6.3C5.7 11.4 5.5 13 5.5 15c0 3.4 2.6 6 6.5 6Z"/>',
    tag: '<path d="M11 3.5H5A1.5 1.5 0 0 0 3.5 5v6a2 2 0 0 0 .6 1.4l7.5 7.5a1.5 1.5 0 0 0 2.1 0l6-6a1.5 1.5 0 0 0 0-2.1l-7.5-7.5a2 2 0 0 0-1.2-.8Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/>',
    archive: '<rect x="3.5" y="4" width="17" height="4.5" rx="1.4"/><path d="M5 8.5v10A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5v-10M10 12.5h4"/>',
    eye: '<path d="M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="2.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4.5 7h15M9 7V4.5h6V7M6.5 7l.8 12.5a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7M10 11v6M14 11v6"/>',
    upload: '<path d="M12 16V4.5m0 0L8 8.5m4-4 4 4M4.5 16v2.5A2 2 0 0 0 6.5 20.5h11a2 2 0 0 0 2-2V16"/>',
    github: '<path d="M12 2.5a9.5 9.5 0 0 0-3 18.5c.5.1.6-.2.6-.5v-1.8c-2.7.6-3.3-1.2-3.3-1.2-.4-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A9.5 9.5 0 0 0 12 2.5Z"/>',
    logout: '<path d="M9 4.5H6A1.5 1.5 0 0 0 4.5 6v12A1.5 1.5 0 0 0 6 19.5h3M14 8l4 4-4 4M18 12H9"/>',
    command: '<path d="M8 7.5a2.5 2.5 0 1 0-2.5 2.5H18a2.5 2.5 0 1 0-2.5-2.5v9a2.5 2.5 0 1 0 2.5-2.5H5.5A2.5 2.5 0 1 0 8 16.5v-9Z"/>',
    folder: '<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v9A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18v-11.5Z"/>',
    moon: '<path d="M20.2 14.6A8.6 8.6 0 0 1 9.4 3.8 8.6 8.6 0 1 0 20.2 14.6Z"/>',
    sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2M12 19.4v2M2.6 12h2M19.4 12h2M5.4 5.4l1.4 1.4M17.2 17.2l1.4 1.4M18.6 5.4l-1.4 1.4M6.8 17.2l-1.4 1.4"/>',
    telegram: '<path d="M21 4 3 11l6 2 2 6 3-4 5 4 2-15Z"/>',
    qq: '<path d="M19 4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h2v4l4-4h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z"/><circle cx="9" cy="10" r="1.1"/><circle cx="15" cy="10" r="1.1"/>',
  };

  function icon(name, size, extra) {
    const body = ICONS[name] || ICONS.grid;
    const s = size || 18;
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" ${extra || ''}>${body}</svg>`;
  }

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fmtNum(n) {
    n = Number(n) || 0;
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
    return String(n);
  }
  function fmtFull(n) { return (Number(n) || 0).toLocaleString('en-US'); }

  function timeAgo(dateStr) {
    if (!dateStr) return '未知';
    const d = new Date(dateStr.length === 10 ? dateStr + 'T00:00:00Z' : dateStr);
    const days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (isNaN(days)) return '未知';
    if (days < 0) return '最近';
    if (days === 0) return '今天';
    if (days < 30) return days + ' 天前';
    if (days < 365) return Math.floor(days / 30) + ' 个月前';
    return Math.floor(days / 365) + ' 年前';
  }

  const LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Go: '#00ADD8',
    Rust: '#dea584', Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
    Ruby: '#701516', PHP: '#4F5D95', Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB',
    Shell: '#89e051', HTML: '#e34c26', CSS: '#563d7c', Vue: '#41b883', Lua: '#000080',
    Jupyter: '#DA5B0B', Mathematica: '#dd1100', Zig: '#ec915c', Scala: '#c22d40',
    Objective: '#438eff', Perl: '#0298c3', Haskell: '#5e5086', Elixir: '#6e4a7e', Solidity: '#AA6746',
  };
  function langColor(l) { return LANG_COLORS[l] || '#8e8e93'; }

  function debounce(fn, ms) {
    let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 200); };
  }

  function copy(text) {
    if (navigator.clipboard && w.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function toast(msg) {
    const stack = $('#toastStack');
    if (!stack) return;
    const el = document.createElement('div');
    el.className = 'toast'; el.textContent = msg;
    stack.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; el.style.transition = 'all .25s'; }, 2200);
    setTimeout(() => el.remove(), 2600);
  }

  function openUrl(url) {
    if (!url) return;
    // Tauri 桌面端：外链交给系统默认浏览器，而不是在应用窗口里打开
    const tauri = w.__TAURI_INTERNALS__;
    if (tauri && typeof tauri.invoke === 'function') {
      tauri.invoke('open_external', { url }).catch(() => {
        const a = document.createElement('a');
        a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        document.body.appendChild(a); a.click(); a.remove();
      });
      return;
    }
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    document.body.appendChild(a); a.click(); a.remove();
  }

  async function share(title, text, url) {
    const full = url || location.href;
    if (navigator.share) {
      try { await navigator.share({ title: title || 'Orbit', text: text || '', url: full }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    try { await copy(full); toast('链接已复制，去分享给朋友吧'); }
    catch (e) { toast('分享失败：' + full); }
  }

  function highlight(text, q) {
    const s = esc(text || '');
    if (!q) return s;
    const qq = esc(q.trim());
    if (!qq) return s;
    try {
      const re = new RegExp('(' + qq.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig');
      return s.replace(re, '<mark style="background:rgba(255,214,0,.4);color:inherit;border-radius:3px;padding:0 1px">$1</mark>');
    } catch (e) { return s; }
  }

  function domain(url) {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url || ''; }
  }

  /** 识别当前设备 / 浏览器，用于一键安装引导 */
  function platform() {
    const ua = navigator.userAgent || '';
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/.test(ua);
    const isMobile = isIOS || isAndroid || /Mobile|Windows Phone/.test(ua);
    let os = '未知系统';
    if (/Win/.test(ua)) os = 'Windows';
    else if (isAndroid) os = 'Android';
    else if (isIOS) os = 'iOS / iPadOS';
    else if (/Mac/.test(ua)) os = 'macOS';
    else if (/Linux/.test(ua)) os = 'Linux';
    const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera'
      : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome'
      : /Safari\//.test(ua) ? 'Safari' : '浏览器';
    const standalone = !!(matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    return { os, browser, isIOS, isAndroid, isMobile, standalone, tauri: !!w.__TAURI_INTERNALS__ };
  }

  /** 轻量 Markdown 渲染（用于仓库 README 预览）：先转义再解析，避免注入 */
  function mdToHtml(md) {
    const src = String(md || '').slice(0, 80000).replace(/\r\n/g, '\n');
    const codes = [];
    let text = src.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, code) => {
      const i = codes.push('<pre class="md-code"><code>' + esc(code) + '</code></pre>') - 1;
      return `\n@@ORBITCODE${i}@@\n`;
    });
    const safeUrl = (u) => /^(https?:\/\/|mailto:|#|\/|\.\/)/i.test(u) ? u : '#';
    const inline = (t) => esc(t)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, u) => `<img class="md-img" src="${safeUrl(u)}" alt="${alt}" loading="lazy">`)
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, u) => `<a href="${safeUrl(u)}" target="_blank" rel="noopener noreferrer">${label}</a>`)
      .replace(/`([^`]+)`/g, '<code class="md-inline">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1<em>$2</em>');

    const out = [];
    let inList = false;
    const closeList = () => { if (inList) { out.push('</ul>'); inList = false; } };
    for (const raw of text.split('\n')) {
      const l = raw.trimEnd();
      const codeMatch = l.trim().match(/^@@ORBITCODE(\d+)@@$/);
      if (codeMatch) { closeList(); out.push(codes[Number(codeMatch[1])] || ''); continue; }
      if (!l.trim()) { closeList(); continue; }
      let m;
      if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
        closeList();
        const h = Math.min(m[1].length + 2, 6);
        out.push(`<h${h} class="md-h">${inline(m[2])}</h${h}>`); continue;
      }
      if (/^\s*(---|\*\*\*|___)\s*$/.test(l)) { closeList(); out.push('<hr class="md-hr">'); continue; }
      if (/^\s*[-*+]\s+/.test(l)) {
        if (!inList) { out.push('<ul class="md-ul">'); inList = true; }
        out.push(`<li>${inline(l.replace(/^\s*[-*+]\s+/, ''))}</li>`); continue;
      }
      if (/^\s*>\s?/.test(l)) { closeList(); out.push(`<blockquote class="md-quote">${inline(l.replace(/^\s*>\s?/, ''))}</blockquote>`); continue; }
      closeList();
      out.push(`<p class="md-p">${inline(l)}</p>`);
    }
    closeList();
    return `<div class="md-body">${out.join('')}</div>`;
  }

  function siteUrl() {
    const c = w.__GH_NAV_CONFIG__ || {};
    if (c.siteUrl) return c.siteUrl.replace(/\/$/, '');
    const loc = location;
    if (/^https?:/.test(loc.protocol) && c.githubUser && loc.hostname.endsWith('.github.io')) {
      return `https://${c.githubUser}.github.io${c.githubRepo ? '/' + c.githubRepo : ''}`;
    }
    return loc.href.split('#')[0].replace(/\/$/, '');
  }

  // 本地存储的安全封装（隐私模式 / file:// 下不抛错）
  const memoryStore = {};
  const LS = {
    get(k, def) {
      try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); }
      catch (e) { return memoryStore[k] === undefined ? def : memoryStore[k]; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { memoryStore[k] = v; }
    },
    remove(k) { try { localStorage.removeItem(k); } catch (e) { delete memoryStore[k]; } }
  };

  /** 把列式仓库索引还原成对象数组；兼容旧版对象数组格式 */
  (function hydrateRepos() {
    const raw = w.__GH_NAV_REPOS_RAW__;
    if (!raw || !Array.isArray(raw.rows)) return;
    if (Array.isArray(w.__GH_NAV_REPOS__) && w.__GH_NAV_REPOS__.length) return;
    const cols = raw.cols;
    const out = new Array(raw.rows.length);
    for (let i = 0; i < raw.rows.length; i++) {
      const row = raw.rows[i], item = {};
      for (let j = 0; j < cols.length; j++) {
        const v = row[j];
        if (v !== null && v !== undefined) item[cols[j]] = v;
      }
      // 名称与 owner 可由 full name 推导，生成端不再重复存储
      if (item.f) {
        if (!item.n) item.n = item.f.split('/')[1] || item.f;
        if (!item.o) item.o = item.f.split('/')[0] || '';
      }
      out[i] = item;
    }
    w.__GH_NAV_REPOS__ = out;
    try { delete w.__GH_NAV_REPOS_RAW__; } catch (e) { w.__GH_NAV_REPOS_RAW__ = null; }
  })();

  w.GH = { icon, ICONS, $, $$, esc, fmtNum, fmtFull, timeAgo, langColor, debounce, copy, toast, openUrl, share, highlight, domain, siteUrl, platform, mdToHtml, LS };
})(window);
