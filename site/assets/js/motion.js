/* Orbit · 交互动画
 * 七个克制的反馈：收藏粒子、卡片微倾、主题光波、数字滚动、
 * 搜索提示轮播、滚动进度条 / 回到顶部、页面淡入与 logo 彩蛋。
 * 只用事件委托 + rAF，不侵入业务代码；减少动态效果与触屏自动降级。
 */
(function (w) {
  'use strict';
  const G = w.GH;
  const reduce = !!(w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const finePointer = !!(w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const all = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ── 1. 粒子迸发 ─────────────────────────────────── */
  const WARM = ['#FF9F0A', '#FF6482', '#7C5CFF', '#0A84FF', '#FFD60A'];
  const COOL = ['#8E8E93', '#AEAEB2', '#64D2FF', '#5E5CE6'];

  function burst(x, y, adding) {
    if (reduce) return;
    const layer = document.createElement('div');
    layer.className = 'orbit-burst';
    const colors = adding ? WARM : COOL;
    const n = 11;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      const isStar = i % 3 === 0;
      p.className = 'orbit-particle' + (isStar ? ' star' : '');
      const angle = (Math.PI * 2 * i) / n + rnd(-0.28, 0.28);
      const dist = rnd(34, 82);
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--tx', (Math.cos(angle) * dist).toFixed(1) + 'px');
      p.style.setProperty('--ty', (Math.sin(angle) * dist).toFixed(1) + 'px');
      p.style.setProperty('--rot', rnd(-200, 200).toFixed(0) + 'deg');
      p.style.animationDelay = (i * 13) + 'ms';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1200);
  }

  function bounce(el) {
    if (reduce || !el || !el.animate || !el.isConnected) return;
    el.animate([
      { transform: 'scale(1)' }, { transform: 'scale(1.32)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' },
    ], { duration: 380, easing: 'cubic-bezier(.2,.8,.3,1)' });
  }

  /* ── 2. 主题切换光波 ─────────────────────────────── */
  function wave(x, y) {
    if (reduce) return;
    const el = document.createElement('span');
    el.className = 'orbit-wave';
    el.style.setProperty('--wx', x + 'px');
    el.style.setProperty('--wy', y + 'px');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 820);
  }

  /* ── 3. 彩蛋：连点左上角 logo ─────────────────────── */
  function starRain() {
    if (reduce) return;
    const glyphs = ['★', '✦', '✧', '⭐', '·'];
    const colors = ['#FF9F0A', '#7C5CFF', '#0A84FF', '#FF6482'];
    for (let i = 0; i < 28; i++) {
      const s = document.createElement('span');
      s.className = 'orbit-starry';
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = rnd(2, 97).toFixed(1) + 'vw';
      s.style.color = colors[i % colors.length];
      s.style.fontSize = rnd(12, 25).toFixed(0) + 'px';
      s.style.animationDuration = rnd(1.9, 3.5).toFixed(2) + 's';
      s.style.animationDelay = rnd(0, 0.9).toFixed(2) + 's';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 5000);
    }
  }

  let logoTaps = 0, logoTimer = null;
  document.addEventListener('click', (e) => {
    const fav = e.target.closest('[data-act="fav"]');
    if (fav) {
      const r = fav.getBoundingClientRect();
      const f = fav.dataset.f || '';
      const adding = f ? !!G.Store.isFav(f) : !fav.classList.contains('on');
      burst(r.left + r.width / 2, r.top + r.height / 2, adding);
      bounce(fav);
    }
    const themeBtn = e.target.closest('#themeBtn');
    if (themeBtn) {
      const r = themeBtn.getBoundingClientRect();
      wave(r.left + r.width / 2, r.top + r.height / 2);
      if (!reduce && themeBtn.animate) {
        themeBtn.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(180deg)' }],
          { duration: 520, easing: 'cubic-bezier(.2,.8,.3,1)' });
      }
    }
    if (e.target.closest('.brand')) {
      logoTaps++;
      clearTimeout(logoTimer);
      logoTimer = setTimeout(() => { logoTaps = 0; }, 1600);
      if (logoTaps >= 5) { logoTaps = 0; starRain(); G.toast('✨ 发现彩蛋：星星雨！'); }
    }
  });

  /* ── 4. 卡片跟随鼠标微倾 ─────────────────────────── */
  const TILT_SEL = '.repo-card, .mini-repo, .quick-card, .cat-card, .tool-card, .method-card, .glossary-card, .step-card';
  let tiltEl = null, rafId = null, lastX = 0, lastY = 0;

  function resetTilt() {
    if (tiltEl) { tiltEl.style.transform = ''; tiltEl.classList.remove('tilt'); tiltEl = null; }
  }
  function onPointerMove(e) {
    if (!finePointer || reduce || e.pointerType === 'touch') return;
    const el = e.target.closest ? e.target.closest(TILT_SEL) : null;
    if (el !== tiltEl) { resetTilt(); tiltEl = el; if (el) el.classList.add('tilt'); }
    if (!el) return;
    lastX = e.clientX; lastY = e.clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      if (!tiltEl || !tiltEl.isConnected) return;
      const r = tiltEl.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (lastX - r.left) / r.width));
      const py = Math.min(1, Math.max(0, (lastY - r.top) / r.height));
      const rx = ((0.5 - py) * 6).toFixed(2);
      const ry = ((px - 0.5) * 6).toFixed(2);
      tiltEl.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-3px)`;
      tiltEl.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      tiltEl.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
  }
  document.addEventListener('pointermove', onPointerMove, { passive: true });
  document.addEventListener('pointerleave', resetTilt);
  document.addEventListener('scroll', resetTilt, { passive: true });

  /* ── 5. 统计数字滚动 ─────────────────────────────── */
  let counterObserver = null;
  function countUp(el) {
    if (reduce || el.dataset.counted) return;
    el.dataset.counted = '1';
    const raw = el.textContent.trim();
    const m = raw.match(/^([\d.]+)\s*([kKmM]?)\s*([+]?)/);
    if (!m) return;
    const target = parseFloat(m[1]);
    const unit = m[2] || '';
    const plus = m[3] || '';
    if (!isFinite(target)) return;
    const fmt = (v) => (unit ? (Math.round(v * 10) / 10).toFixed(1) + unit : String(Math.round(v))) + plus;
    const start = performance.now();
    const dur = 950;
    el.classList.add('counting');
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else { el.textContent = raw; el.classList.remove('counting'); }
    };
    requestAnimationFrame(tick);
  }
  function bindCounters() {
    const els = all('.stat-row .stat b');
    if (!('IntersectionObserver' in w)) { els.forEach(countUp); return; }
    if (!counterObserver) {
      counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { countUp(en.target); counterObserver.unobserve(en.target); } });
      }, { threshold: 0.4 });
    }
    els.forEach((el) => { if (!el.dataset.counted) counterObserver.observe(el); });
  }

  /* ── 6. 搜索提示轮播 + 提示词交错入场 ─────────────── */
  const HINTS = [
    '搜索项目、话题、语言，或试试「本地大模型」',
    '试试搜「MCP」', '试试搜「Agent」', '试试搜「图表库」',
    '试试搜「self-hosted」', '试试搜「Rust」', '试试搜「论文」',
  ];
  let hintIdx = 0;
  setInterval(() => {
    const input = document.getElementById('heroSearch');
    if (!input || document.activeElement === input || input.value || reduce) return;
    hintIdx = (hintIdx + 1) % HINTS.length;
    input.classList.add('ph-fade');
    setTimeout(() => {
      if (document.getElementById('heroSearch') === input) {
        input.placeholder = HINTS[hintIdx];
        input.classList.remove('ph-fade');
      }
    }, 260);
  }, 3800);

  function bindStagger() {
    const targets = all('#view [data-act="hint"]');
    targets.forEach((el, i) => {
      if (el.dataset.stagger) return;
      el.dataset.stagger = '1';
      el.style.animationDelay = (i * 65) + 'ms';
      el.classList.add('orbit-stagger');
    });
  }

  /* ── 7. 滚动进度条 / 回到顶部 / 页面淡入 ─────────── */
  function createScrollChrome() {
    if (document.getElementById('orbitProgress')) return;
    const bar = document.createElement('div');
    bar.id = 'orbitProgress';
    document.body.appendChild(bar);

    const top = document.createElement('button');
    top.id = 'orbitTop';
    top.type = 'button';
    top.setAttribute('aria-label', '回到顶部');
    top.title = '回到顶部';
    top.textContent = '↑';
    document.body.appendChild(top);
    top.addEventListener('click', () => w.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

    const update = () => {
      const max = document.documentElement.scrollHeight - w.innerHeight;
      const p = max > 0 ? Math.min(1, w.scrollY / max) : 0;
      bar.style.width = (p * 100).toFixed(2) + '%';
      top.classList.toggle('show', w.scrollY > 520);
    };
    w.addEventListener('scroll', update, { passive: true });
    w.addEventListener('resize', update);
    update();
  }

  w.addEventListener('hashchange', () => {
    const v = document.getElementById('view');
    if (!v || reduce) return;
    v.classList.remove('orbit-enter');
    void v.offsetWidth;
    v.classList.add('orbit-enter');
    setTimeout(() => v.classList.remove('orbit-enter'), 320);
  });

  /* ── SPA 重渲染后重新绑定 ─────────────────────────── */
  function refresh() { bindCounters(); bindStagger(); }
  function init() {
    createScrollChrome();
    refresh();
    const view = document.getElementById('view');
    if (view && 'MutationObserver' in w) {
      let t = null;
      new MutationObserver(() => { clearTimeout(t); t = setTimeout(refresh, 80); })
        .observe(view, { childList: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})(window);
