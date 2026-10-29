(function () {
  if (!document.getElementById('chainBlocks')) return;
  /* Hash chain demo (SHA-256 via Web Crypto, with a pure-JS fallback) */
  function sha256js(ascii) {
    function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
    var mp = Math.pow, maxWord = mp(2, 32), result = '', words = [], bitLen = ascii.length * 8, hash = [], k = [], pc = 0, isC = {};
    for (var c = 2; pc < 64; c++) { if (!isC[c]) { for (var i = 0; i < 313; i += c) isC[i] = c; hash[pc] = (mp(c, .5) * maxWord) | 0; k[pc++] = (mp(c, 1 / 3) * maxWord) | 0; } }
    hash = hash.slice(0, 8); ascii += '\x80';
    while (ascii.length % 64 - 56) ascii += '\x00';
    for (i = 0; i < ascii.length; i++) { var j = ascii.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
    words[words.length] = ((bitLen / maxWord) | 0); words[words.length] = bitLen;
    for (j = 0; j < words.length;) {
      var w = words.slice(j, j += 16), oh = hash; hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
        var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
        var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
        hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0; hash.length = 8;
      }
      for (i = 0; i < 8; i++) hash[i] = (hash[i] + oh[i]) | 0;
    }
    for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; result += ((b < 16) ? 0 : '') + b.toString(16); }
    return result;
  }
  function sha256(str) {
    var bytes = new TextEncoder().encode(str);
    if (window.crypto && crypto.subtle && crypto.subtle.digest) {
      return crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
        return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      }).catch(function () { return sha256js(unescape(encodeURIComponent(str))); });
    }
    return Promise.resolve(sha256js(unescape(encodeURIComponent(str))));
  }
  var GENESIS = '0'.repeat(64);
  var initial = [
    'model registered: onset ensemble, fold-trained · weights sha256 recorded',
    'forecast 2018-02-14 10:15 UTC · P(attack within 5 min) 0.91 · tactic: Credential Access',
    'report signed: daily detection summary · 3 alerts · thresholds set without test labels'
  ];
  var sealed = [];
  var box = document.getElementById('chainBlocks'), msg = document.getElementById('chainMsg');
  function short(h) { return h.slice(0, 16) + '…' + h.slice(-6); }
  function build() {
    box.innerHTML = '';
    initial.forEach(function (txt, i) {
      var b = document.createElement('div'); b.className = 'block';
      b.innerHTML = '<div class="bh"><span>entry #' + (i + 1) + '</span><span class="verdict">verified</span></div>' +
        '<label for="blk' + i + '">data</label><textarea id="blk' + i + '" spellcheck="false" rows="3"></textarea>' +
        '<div class="hashrow prev"><span class="k">prev </span><span class="v"></span></div>' +
        '<div class="hashrow cur"><span class="k">hash </span><span class="v"></span></div>';
      b.querySelector('textarea').value = txt;
      b.querySelector('textarea').addEventListener('input', verify);
      box.appendChild(b);
    });
    seal();
  }
  function seal() {
    var prev = GENESIS, chainP = Promise.resolve();
    sealed = [];
    initial.forEach(function (txt) {
      chainP = chainP.then(function () { return sha256(prev + '|' + txt); }).then(function (h) { sealed.push({ prev: prev, hash: h }); prev = h; });
    });
    chainP.then(verify);
  }
  function verify() {
    var blocks = [].slice.call(box.querySelectorAll('.block'));
    var p = Promise.resolve(), broken = 0, firstBad = -1, running = GENESIS;
    blocks.forEach(function (b, i) {
      p = p.then(function () {
        var data = b.querySelector('textarea').value, prevUsed = running;
        return sha256(prevUsed + '|' + data).then(function (h) {
          running = h;
          var ok = h === sealed[i].hash;
          if (!ok && firstBad < 0) firstBad = i;
          if (!ok) broken++;
          b.classList.toggle('broken', !ok);
          b.querySelector('.verdict').textContent = ok ? 'verified' : (i === firstBad ? 'data changed' : 'prev link broken');
          b.querySelector('.prev .v').textContent = short(prevUsed);
          b.querySelector('.cur .v').textContent = short(h);
        });
      });
    });
    p.then(function () {
      if (broken) { msg.textContent = 'Tampering detected at entry #' + (firstBad + 1) + ' · ' + broken + ' of ' + blocks.length + ' entries fail'; msg.className = 'demo-msg bad'; }
      else { msg.textContent = 'Chain verified · ' + blocks.length + ' of ' + blocks.length + ' entries intact'; msg.className = 'demo-msg'; }
    });
  }
  document.getElementById('chainReset').addEventListener('click', build);
  build();

})();
