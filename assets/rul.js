(function () {
  var svg = document.getElementById('rulChart');
  if (!svg) return;
  var DATA = window.RUL_DATA;
  if (!DATA) return;
  var RSTAR = 5, CAP = 125;
  var sel = document.getElementById('engine'), slider = document.getElementById('cycle');
  var W = 720, H = 300, m = { l: 44, r: 14, t: 18, b: 34 }, iw, ih;
  function dims() { W = Math.round(Math.max(320, Math.min(720, svg.clientWidth || 720))); H = W < 520 ? 240 : 300; iw = W - m.l - m.r; ih = H - m.t - m.b; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); }
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }

  function draw() {
    dims();
    var d = DATA[sel.value], n = d.c.length;
    var x = function (c) { return m.l + (c - 1) / Math.max(1, d.c[n - 1] - 1) * iw; };
    var y = function (v) { return m.t + ih - Math.max(0, Math.min(140, v)) / 140 * ih; };
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var acc = css('--accent'), mut = css('--muted'), rule = css('--rule'), fg = css('--fg'), bad = css('--bad');

    [0, 25, 50, 75, 100, 125].forEach(function (v) {
      svg.appendChild(el('line', { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), stroke: rule, 'stroke-width': 1 }));
      var t = el('text', { x: m.l - 8, y: y(v) + 4, 'text-anchor': 'end' }); t.textContent = v; svg.appendChild(t);
    });
    var step = (d.c[n - 1] > 200 || W < 520) ? 50 : 25;
    for (var c = 0; c <= d.c[n - 1]; c += step) {
      var tx = el('text', { x: x(Math.max(1, c)), y: H - 12, 'text-anchor': 'middle' }); tx.textContent = c; svg.appendChild(tx);
    }
    var xl = el('text', { x: W - m.r, y: H - 12, 'text-anchor': 'end' }); xl.textContent = 'cycle'; svg.appendChild(xl);
    var yl = el('text', { x: m.l, y: m.t - 2 }); yl.textContent = 'RUL (cycles)'; svg.appendChild(yl);

    var top = '', bot = '';
    for (var i = 0; i < n; i++) { top += (i ? 'L' : 'M') + x(d.c[i]) + ' ' + y(d.hi[i]); }
    for (i = n - 1; i >= 0; i--) { bot += 'L' + x(d.c[i]) + ' ' + y(d.lo[i]); }
    svg.appendChild(el('path', { d: top + bot + 'Z', fill: acc, 'fill-opacity': 0.18, stroke: 'none' }));
    var md = '', tr = '';
    for (i = 0; i < n; i++) { md += (i ? 'L' : 'M') + x(d.c[i]) + ' ' + y(d.md[i]); tr += (i ? 'L' : 'M') + x(d.c[i]) + ' ' + y(Math.min(CAP, d.t[i])); }
    svg.appendChild(el('path', { d: md, fill: 'none', stroke: acc, 'stroke-width': 1.6 }));
    svg.appendChild(el('path', { d: tr, fill: 'none', stroke: fg, 'stroke-width': 1.4, 'stroke-dasharray': '4 3' }));
    svg.appendChild(el('line', { x1: m.l, x2: W - m.r, y1: y(RSTAR), y2: y(RSTAR), stroke: bad, 'stroke-width': 1.2, 'stroke-dasharray': '2 3' }));
    var rs = el('text', { x: W - m.r - 4, y: y(RSTAR) - 5, 'text-anchor': 'end' }); rs.textContent = 'R* = 5'; rs.setAttribute('style', 'fill:' + bad); svg.appendChild(rs);

    var k = Math.min(n - 1, Math.max(0, +slider.value - 1));
    var cx = x(d.c[k]);
    svg.appendChild(el('line', { x1: cx, x2: cx, y1: m.t, y2: m.t + ih, stroke: mut, 'stroke-width': 1 }));
    svg.appendChild(el('circle', { cx: cx, cy: y(d.md[k]), r: 4, fill: acc }));
    svg.appendChild(el('circle', { cx: cx, cy: y(Math.min(CAP, d.t[k])), r: 3.5, fill: fg }));

    document.getElementById('rCycle').textContent = d.c[k] + ' / ' + d.life;
    document.getElementById('rTrue').textContent = d.t[k];
    document.getElementById('rBand').textContent = Math.round(d.lo[k]) + '–' + Math.round(d.hi[k]);
    var remove = d.lo[k] <= RSTAR;
    var adv = document.getElementById('rAdvice');
    adv.textContent = remove ? 'remove' : 'keep flying';
    adv.parentElement.classList.toggle('remove', remove);
    var inside = Math.min(CAP, d.t[k]) >= d.lo[k] && Math.min(CAP, d.t[k]) <= d.hi[k];
    document.getElementById('rNote').textContent = inside ? 'True RUL is inside the 80% band at this cycle.' : 'True RUL is outside the band here; at 80% coverage that should happen about 1 time in 5.';
  }
  function reset() { var d = DATA[sel.value]; slider.max = d.c.length; slider.value = Math.round(d.c.length * 0.6); draw(); }
  sel.addEventListener('change', reset);
  slider.addEventListener('input', draw);
  var obs = new MutationObserver(draw); obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', draw);
  addEventListener('resize', draw);
  reset();
})();
