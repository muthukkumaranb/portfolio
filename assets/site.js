(function () {
  var root = document.documentElement;
  try { var saved = localStorage.getItem('mb-theme'); if (saved) root.setAttribute('data-theme', saved); } catch (e) {}
  var tb = document.getElementById('theme');
  if (tb) tb.addEventListener('click', function () {
    var cur = root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    var next = cur === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('mb-theme', next); } catch (e) {}
  });

  var btn = document.getElementById('copy-email');
  if (btn) btn.addEventListener('click', function () {
    var addr = 'mailtomuthukkumaranb@gmail.com';
    var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy email'; }, 1800); };
    var fallback = function () { var r = document.createRange(); r.selectNodeContents(document.getElementById('email')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = 'Press Ctrl+C'; };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(addr).then(done, fallback); else fallback(); } catch (e) { fallback(); }
  });

  var chips = [].slice.call(document.querySelectorAll('.chip'));
  var cards = [].slice.call(document.querySelectorAll('[data-tags]'));
  var count = document.getElementById('pcount');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-filter'), n = 0;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      cards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-tags').split(' ').indexOf(f) > -1;
        card.classList.toggle('hide', !show); if (show) n++;
      });
      if (count) count.textContent = n + (n === 1 ? ' project' : ' projects');
    });
  });

  var links = [].slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if (links.length) {
    var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var onScroll = function () {
      var cur = -1;
      secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < innerHeight * 0.3) cur = i; });
      links.forEach(function (a, i) { a.classList.toggle('active', i === cur); });
    };
    addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }
})();
