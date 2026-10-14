// 站点脚本（雏形）
// 1) details 深链展开  2) 滚动渐入（reduced-motion 用户直接跳过）
(function () {
  var id = location.hash.slice(1);
  if (id) {
    var el = document.getElementById(id);
    if (el && el.tagName === 'DETAILS') {
      el.open = true;
      el.scrollIntoView({ block: 'start' });
    }
  }

  // 深色 / 浅色切换（localStorage + prefers-color-scheme 兜底在 head 内联脚本里）
  var btn = document.getElementById('themeBtn');
  if (btn) {
    var label = function () {
      btn.textContent = document.documentElement.dataset.theme === 'dark' ? '浅色' : '深色';
    };
    label();
    btn.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) {}
      label();
    });
  }

  // ── 顶部阅读进度条（借鉴参照站）
  var bar = document.getElementById('progressBar');
  if (bar) {
    var updBar = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY || doc.scrollTop) / max : 0;
      bar.style.width = Math.min(Math.max(p, 0), 1) * 100 + '%';
    };
    window.addEventListener('scroll', updBar, { passive: true });
    window.addEventListener('resize', updBar);
    updBar();
  }

  var reduce = false;
  try {
    reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch (e) { /* 环境不支持就当不 reduce */ }

  // ── 聚光灯卡片（移植 reactbits Spotlight Card，纯 CSS 渐变 + JS 坐标）
  if (!reduce) {
    document.querySelectorAll('.proj').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });

    // ── Hero 名字逐字浮现（移植 Awwwards split-text 思路）
    document.querySelectorAll('.hero h1').forEach(function (h) {
      var node = h.firstChild;
      if (!node || node.nodeType !== 3) return; // 只拆第一个文本节点，保留 .hero-en
      var text = node.textContent;
      var frag = document.createDocumentFragment();
      for (var i = 0; i < text.length; i++) {
        var s = document.createElement('span');
        s.className = 'ch';
        s.style.animationDelay = (0.05 + i * 0.055) + 's';
        s.textContent = text[i];
        frag.appendChild(s);
      }
      h.replaceChild(frag, node);
    });
  }

  // ── 数字滚动（移植 reactbits Count Up）：reveal 时从 0 滚到目标值
  var countUp = function (strong) {
    var m = strong.textContent.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return; // “主赛道”“线上”这类非数字不动
    var end = parseFloat(m[1]);
    if (isNaN(end) || end === 0) return;
    var decimals = (m[1].split('.')[1] || '').length;
    var suffix = m[2];
    var t0 = null, dur = 900;
    var step = function (ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      p = 1 - Math.pow(1 - p, 3); // easeOutCubic
      strong.textContent = (end * p).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (reduce || !('IntersectionObserver' in window)) return;

  // scrollspy：滚动时高亮导航当前项（导航链接 + 右侧圆点同步）
  var navMap = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    navMap[a.getAttribute('href').slice(1)] = a;
  });
  var dotMap = {};
  document.querySelectorAll('.dots a').forEach(function (a) {
    dotMap[a.getAttribute('href').slice(1)] = a;
  });
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      Object.keys(navMap).forEach(function (id) {
        navMap[id].classList.toggle('active', id === en.target.id);
      });
      Object.keys(dotMap).forEach(function (id) {
        dotMap[id].classList.toggle('active', id === en.target.id);
      });
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  ['top'].concat(Object.keys(navMap), Object.keys(dotMap)).forEach(function (id) {
    var sec = document.getElementById(id);
    if (sec) spy.observe(sec);
  });

  var targets = document.querySelectorAll(
    '.section > .wrap > *, .proj, .asset-card, .tl-item, .org-card'
  );
  // 交错入场：同一批次滚进视野的元素按序错开 90ms（封顶 350ms），「一个接一个出来」
  var batches = {};
  targets.forEach(function (t) {
    var sec = t.closest('section') || document.body;
    var key = sec.id || '_';
    batches[key] = batches[key] || 0;
    t.style.transitionDelay = Math.min(batches[key] * 0.09, 0.35) + 's';
    batches[key]++;
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        en.target.querySelectorAll('.proj-metrics strong').forEach(countUp);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  targets.forEach(function (t) {
    t.classList.add('reveal');
    io.observe(t);
  });
})();
