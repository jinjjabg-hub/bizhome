/*!
 * TM LINK 비즈홈 '내 소식판' (news-board.js) — 프리미엄 기능 1단계
 *
 * 붙이는 법 (카드 index.html):
 *   1) 배너를 넣을 자리에   <div id="news-board"></div>
 *   2) </body> 바로 위에    <script src="../news-board.js" data-src="news.json" defer></script>
 *      (선택) data-log="통계 웹앱 URL"  → 글 열람·버튼 클릭을 방문 통계에 함께 기록
 *
 * 글은 같은 폴더의 news.json 에 둡니다. 다국어 칸은 {"kr":"…","en":"…"} 형식이며,
 * 카드의 언어 버튼(switchLang)이 data-lang 으로 함께 전환합니다.
 *
 * 부하 설계: 배너는 최대 3장, 첫 장만 즉시 로드·나머지 이미지는 지연 로드,
 *           동영상은 누르기 전까지 썸네일만, news.json 은 페이지 로드 후 1회만 요청.
 */
(function () {
  'use strict';
  var script = document.currentScript;
  var SRC = (script && script.getAttribute('data-src')) || 'news.json';
  var LOG = script && script.getAttribute('data-log');
  var TARGET = (script && script.getAttribute('data-target')) || '#news-board';
  var BANNER_MAX = 3, NEW_DAYS = 7, AUTO_MS = 5000;
  var LANGS = ['kr', 'en', 'jp', 'cn', 'hi', 'ru', 'th', 'vi'];

  var UI = {
    head:   { kr: '새 소식', en: 'News', jp: 'お知らせ', cn: '最新动态', hi: 'नई खबरें' },
    all:    { kr: '전체 보기', en: 'See all', jp: 'すべて見る', cn: '查看全部', hi: 'सभी देखें' },
    close:  { kr: '닫기', en: 'Close', jp: '閉じる', cn: '关闭', hi: 'बंद करें' },
    play:   { kr: '영상 재생', en: 'Play video', jp: '動画を再生', cn: '播放视频', hi: 'वीडियो चलाएं' },
    links:  { kr: '관련 링크', en: 'Links', jp: '関連リンク', cn: '相关链接', hi: 'लिंक' },
    type: {
      product: { kr: '상품', en: 'Product', jp: '商品', cn: '产品', hi: 'प्रोडक्ट' },
      event:   { kr: '이벤트', en: 'Event', jp: 'イベント', cn: '活动', hi: 'इवेंट' },
      'case':  { kr: '사례', en: 'Case', jp: '事例', cn: '案例', hi: 'केस' },
      news:    { kr: '소식', en: 'News', jp: 'お知らせ', cn: '动态', hi: 'खबर' }
    }
  };

  function currentLang() {
    var on = document.querySelector('.lang-btn.on');
    var l = on ? on.textContent.trim().toLowerCase() : 'kr';
    return LANGS.indexOf(l) > -1 ? l : 'kr';
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // 다국어 값 → 언어별 span (카드의 switchLang 이 전환). 줄바꿈 유지.
  function ml(v) {
    if (v == null) return '';
    if (typeof v === 'string') return esc(v).replace(/\n/g, '<br>');
    var cur = currentLang(), out = '';
    var fallback = v.kr || v[Object.keys(v)[0]];
    LANGS.forEach(function (l) {
      if (!document.querySelector('.lang-btn') && l !== 'kr') return;
      var t = v[l] != null ? v[l] : fallback;
      out += '<span data-lang="' + l + '"' + (l === cur ? ' class="active"' : '') + '>' +
        esc(t).replace(/\n/g, '<br>') + '</span>';
    });
    return out;
  }
  function log(ev, id) {
    if (!LOG) return;
    try {
      fetch(LOG + '?slug=' + encodeURIComponent(document.title) + '&event=' + ev + '&item=' + encodeURIComponent(id), { mode: 'no-cors' });
    } catch (e) {}
  }
  function isNew(it) {
    var d = Date.parse(it.date);
    return d && (Date.now() - d) / 864e5 < NEW_DAYS;
  }
  function youtubeId(url) {
    var m = String(url || '').match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    return m ? m[1] : null;
  }
  function safeUrl(u) {
    return /^(https?:|tel:|sms:|mailto:|kakaotalk:)/i.test(u || '') ? u : '#';
  }
  function hostOf(u) {
    try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; }
  }

  var CSS = [
    '.nb{margin:6px 0 4px;padding:0 0 18px}',
    '.nb-head{display:flex;align-items:center;justify-content:space-between;padding:0 24px;margin-bottom:10px}',
    '.nb-title{font-size:12px;font-weight:900;letter-spacing:.18em;color:var(--gold-soft,#e8c877)}',
    '.nb-title b{display:inline-block;width:7px;height:7px;border-radius:50%;background:#ff5a4f;margin-right:7px;vertical-align:1px;box-shadow:0 0 0 3px rgba(255,90,79,.25)}',
    '.nb-all{background:none;border:0;color:rgba(255,255,255,.75);font:inherit;font-size:12.5px;font-weight:700;padding:10px 0 10px 10px;cursor:pointer}',
    '.nb-track{display:flex;gap:12px;overflow-x:auto;scroll-snap-type:x mandatory;padding:2px 24px 6px;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
    '.nb-track::-webkit-scrollbar{display:none}',
    '.nb-card{flex:0 0 86%;scroll-snap-align:center;background:rgba(255,255,255,.06);border:1px solid rgba(212,165,55,.35);border-radius:16px;overflow:hidden;cursor:pointer;text-align:left;color:inherit;font:inherit;padding:0;position:relative}',
    '.nb-card:only-child{flex-basis:100%}',
    '.nb-img{display:block;width:100%;height:auto;aspect-ratio:40/21;object-fit:cover;background:rgba(0,0,0,.25)}',
    '.nb-body{padding:12px 14px 14px}',
    '.nb-chips{display:flex;gap:6px;margin-bottom:6px}',
    '.nb-chip{font-size:10.5px;font-weight:900;padding:3px 8px;border-radius:99px;background:rgba(212,165,55,.18);color:var(--gold-soft,#e8c877)}',
    '.nb-chip.new{background:#ff5a4f;color:#fff}',
    '.nb-chip.pin{background:rgba(255,255,255,.14);color:#fff}',
    '.nb-ct{font-size:15px;font-weight:900;line-height:1.35;color:#fff}',
    '.nb-cp{font-size:12.5px;color:var(--gold,#d4a537);font-weight:700;margin-top:4px}',
    '.nb-dots{display:flex;justify-content:center;gap:6px;margin-top:10px}',
    '.nb-dots i{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.3);transition:all .25s}',
    '.nb-dots i.on{width:18px;border-radius:3px;background:var(--gold,#d4a537)}',
    /* 시트 (dialog) */
    '.nb-sheet{border:0;padding:0;margin:auto auto 0;width:100%;max-width:430px;max-height:92vh;border-radius:22px 22px 0 0;background:#fbfaf7;color:#1c2b26;overflow:hidden}',
    '.nb-sheet::backdrop{background:rgba(0,0,0,.55)}',
    '.nb-sheet[open]{animation:nbUp .28s cubic-bezier(.2,.7,.2,1)}',
    '@keyframes nbUp{from{transform:translateY(100%)}to{transform:none}}',
    '.nb-in{max-height:92vh;overflow-y:auto;padding-bottom:calc(22px + env(safe-area-inset-bottom))}',
    '.nb-x{position:absolute;top:10px;right:10px;z-index:3;width:44px;height:44px;border:0;border-radius:50%;background:rgba(0,0,0,.45);color:#fff;font-size:22px;line-height:44px;cursor:pointer}',
    '.nb-gal{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;background:#0f2a23}',
    '.nb-gal::-webkit-scrollbar{display:none}',
    '.nb-gal>*{flex:0 0 100%;scroll-snap-align:center;width:100%;height:auto;aspect-ratio:40/21;object-fit:cover;display:block}',
    '.nb-cnt{position:absolute;top:14px;left:14px;z-index:2;font-size:11.5px;font-weight:700;color:#fff;background:rgba(0,0,0,.45);padding:3px 9px;border-radius:99px}',
    '.nb-vid{position:relative;background:#000;aspect-ratio:16/9}',
    '.nb-vid img,.nb-vid iframe,.nb-vid video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;border:0}',
    '.nb-vbtn{position:absolute;inset:0;border:0;background:rgba(0,0,0,.2);cursor:pointer;display:grid;place-items:center}',
    '.nb-vbtn span{width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,.92);display:grid;place-items:center}',
    '.nb-vbtn span::after{content:"";border-left:20px solid #1c2b26;border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:5px}',
    '.nb-dbody{padding:18px 20px 4px}',
    '.nb-dbody .nb-chip{background:rgba(39,97,82,.12);color:#276152}',
    '.nb-dbody .nb-chip.new{background:#ff5a4f;color:#fff}',
    '.nb-dt{font-size:20px;font-weight:900;line-height:1.35;margin-top:4px}',
    '.nb-dp{font-size:14px;font-weight:900;color:#a8801e;margin-top:6px}',
    '.nb-dd{font-size:14.5px;line-height:1.75;color:#3b4a45;margin-top:12px}',
    '.nb-lh{font-size:12px;font-weight:900;letter-spacing:.06em;color:#8a8a92;margin:18px 0 6px}',
    '.nb-link{display:flex;align-items:center;gap:10px;min-height:52px;padding:10px 14px;border:1px solid #e6e2d8;border-radius:12px;text-decoration:none;color:#1c2b26;margin-bottom:8px;background:#fff}',
    '.nb-link small{display:block;font-size:11.5px;color:#8a8a92}',
    '.nb-link::after{content:"↗";margin-left:auto;color:#a8801e;font-weight:900}',
    '.nb-cta{display:flex;align-items:center;justify-content:center;min-height:52px;margin:16px 20px 0;border-radius:12px;background:#276152;color:#fff;font-weight:900;font-size:15px;text-decoration:none}',
    '.nb-list{padding:58px 16px 8px}',
    '.nb-lt{font-size:18px;font-weight:900;margin:0 4px 12px}',
    '.nb-row{display:flex;gap:12px;align-items:center;width:100%;padding:10px;border:0;border-radius:12px;background:#fff;margin-bottom:8px;text-align:left;font:inherit;color:inherit;cursor:pointer;box-shadow:0 1px 3px rgba(0,0,0,.06)}',
    '.nb-row img{width:84px;height:auto;aspect-ratio:40/21;object-fit:cover;border-radius:8px;flex-shrink:0;background:#e9e6de}',
    '.nb-row b{display:block;font-size:14px;line-height:1.4}',
    '.nb-row small{font-size:11.5px;color:#8a8a92}',
    '@media (prefers-reduced-motion:reduce){.nb-sheet[open]{animation:none}.nb-dots i{transition:none}}'
  ].join('\n');

  function start() {
    var host = document.querySelector(TARGET);
    if (!host) return;
    fetch(SRC, { cache: 'no-cache' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (data) {
      if (!data || !data.items) return;
      var today = new Date().toISOString().slice(0, 10);
      var items = data.items.filter(function (it) { return !it.hidden && (!it.until || it.until >= today); });
      items.sort(function (a, b) { return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || String(b.date).localeCompare(String(a.date)); });
      items = items.slice(0, data.maxVisible || 10);
      if (!items.length) return;
      render(host, items);
    }).catch(function () { /* 소식이 없으면 영역을 비워 둠 */ });
  }

  function chips(it) {
    var h = '<span class="nb-chip">' + ml(UI.type[it.type] || UI.type.news) + '</span>';
    if (isNew(it)) h += '<span class="nb-chip new">NEW</span>';
    return h;
  }

  function render(host, items) {
    var st = el('style'); st.textContent = CSS; document.head.appendChild(st);
    var wrap = el('section', 'nb');
    wrap.setAttribute('aria-label', 'News');
    var head = el('div', 'nb-head', '<span class="nb-title"><b></b>' + ml(UI.head) + '</span>');
    var allBtn = el('button', 'nb-all', ml(UI.all) + ' (' + items.length + ') ›');
    allBtn.type = 'button';
    head.appendChild(allBtn);
    var track = el('div', 'nb-track');
    var banner = items.slice(0, BANNER_MAX);
    banner.forEach(function (it, i) {
      var c = el('button', 'nb-card');
      c.type = 'button';
      var img = (it.images && it.images[0]) || (youtubeId(it.video) ? 'https://i.ytimg.com/vi/' + youtubeId(it.video) + '/hqdefault.jpg' : (it.poster || ''));
      c.innerHTML = (img ? '<img class="nb-img" src="' + esc(img) + '" alt="" width="400" height="210"' + (i ? ' loading="lazy"' : '') + ' decoding="async">' : '') +
        '<div class="nb-body"><div class="nb-chips">' + chips(it) + '</div><div class="nb-ct">' + ml(it.title) + '</div>' +
        (it.price ? '<div class="nb-cp">' + ml(it.price) + '</div>' : '') + '</div>';
      c.addEventListener('click', function () { openDetail(it); });
      track.appendChild(c);
    });
    wrap.appendChild(head);
    wrap.appendChild(track);
    var dots = null;
    if (banner.length > 1) {
      dots = el('div', 'nb-dots', banner.map(function (_, i) { return '<i' + (i ? '' : ' class="on"') + '></i>'; }).join(''));
      wrap.appendChild(dots);
    }
    host.appendChild(wrap);

    // 점 표시 + 자동 넘김 (화면에 보일 때만, 손대면 멈춤, 동작 줄이기 존중)
    var idx = 0, userTouched = false, visible = false;
    function cardW() { var f = track.children[0]; return f ? f.getBoundingClientRect().width + 12 : 1; }
    track.addEventListener('scroll', function () {
      idx = Math.round(track.scrollLeft / cardW());
      if (dots) [].forEach.call(dots.children, function (d, i) { d.classList.toggle('on', i === idx); });
    }, { passive: true });
    ['pointerdown', 'touchstart', 'wheel'].forEach(function (ev) { track.addEventListener(ev, function () { userTouched = true; }, { passive: true }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(track);
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (banner.length > 1 && !reduce) setInterval(function () {
      if (userTouched || !visible || document.hidden || sheet.open) return;
      idx = (idx + 1) % banner.length;
      track.scrollTo({ left: idx * cardW(), behavior: 'smooth' });
    }, AUTO_MS);

    // 시트(상세·전체 목록 공용)
    var sheet = el('dialog', 'nb-sheet');
    var inner = el('div', 'nb-in');
    var x = el('button', 'nb-x', '×'); x.type = 'button';
    x.setAttribute('aria-label', 'Close');
    sheet.appendChild(x); sheet.appendChild(inner);
    document.body.appendChild(sheet);
    x.addEventListener('click', function () { sheet.close(); });
    sheet.addEventListener('click', function (e) { if (e.target === sheet) sheet.close(); });
    sheet.addEventListener('close', function () { inner.innerHTML = ''; });
    function show() {
      if (typeof sheet.showModal === 'function') { if (!sheet.open) sheet.showModal(); } else sheet.setAttribute('open', '');
      inner.scrollTop = 0;
    }

    function openDetail(it) {
      log('news_open', it.id);
      var h = '';
      var imgs = it.images || [];
      if (imgs.length) {
        h += '<div style="position:relative">' + (imgs.length > 1 ? '<span class="nb-cnt">1 / ' + imgs.length + '</span>' : '') +
          '<div class="nb-gal">' + imgs.map(function (s, i) { return '<img src="' + esc(s) + '" alt="" width="400" height="210"' + (i ? ' loading="lazy"' : '') + '>'; }).join('') + '</div></div>';
      }
      var yt = youtubeId(it.video);
      if (yt || (it.video && /\.(mp4|webm|mov)(\?|$)/i.test(it.video))) {
        h += '<div class="nb-vid">' + (yt
          ? '<img src="https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg" alt="" loading="lazy"><button type="button" class="nb-vbtn" data-yt="' + yt + '" aria-label="Play"><span></span></button>'
          : '<video src="' + esc(it.video) + '"' + (it.poster ? ' poster="' + esc(it.poster) + '"' : '') + ' controls playsinline preload="none"></video>') + '</div>';
      }
      h += '<div class="nb-dbody"><div class="nb-chips">' + chips(it) + '</div><div class="nb-dt">' + ml(it.title) + '</div>' +
        (it.price ? '<div class="nb-dp">' + ml(it.price) + '</div>' : '') +
        (it.desc ? '<div class="nb-dd">' + ml(it.desc) + '</div>' : '');
      if (it.links && it.links.length) {
        h += '<div class="nb-lh">' + ml(UI.links) + '</div>' + it.links.slice(0, 3).map(function (k, i) {
          return '<a class="nb-link" href="' + esc(safeUrl(k.url)) + '" target="_blank" rel="noopener" data-i="' + i + '"><span>' + ml(k.label || k.url) + '<small>' + esc(hostOf(k.url)) + '</small></span></a>';
        }).join('');
      }
      h += '</div>';
      if (it.button && it.button.url) h += '<a class="nb-cta" href="' + esc(safeUrl(it.button.url)) + '" target="_blank" rel="noopener">' + ml(it.button.label) + '</a>';
      inner.innerHTML = h;
      var gal = inner.querySelector('.nb-gal'), cnt = inner.querySelector('.nb-cnt');
      if (gal && cnt) gal.addEventListener('scroll', function () { cnt.textContent = (Math.round(gal.scrollLeft / gal.clientWidth) + 1) + ' / ' + imgs.length; }, { passive: true });
      var vb = inner.querySelector('.nb-vbtn');
      if (vb) vb.addEventListener('click', function () {
        vb.parentNode.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + vb.getAttribute('data-yt') + '?autoplay=1&playsinline=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="video"></iframe>';
      });
      [].forEach.call(inner.querySelectorAll('.nb-link,.nb-cta'), function (a) { a.addEventListener('click', function () { log('news_click', it.id); }); });
      show();
    }

    allBtn.addEventListener('click', function () {
      var h = '<div class="nb-list"><div class="nb-lt">' + ml(UI.head) + '</div>';
      items.forEach(function (it, i) {
        var img = (it.images && it.images[0]) || (youtubeId(it.video) ? 'https://i.ytimg.com/vi/' + youtubeId(it.video) + '/mqdefault.jpg' : '');
        h += '<button type="button" class="nb-row" data-i="' + i + '">' + (img ? '<img src="' + esc(img) + '" alt="" loading="lazy">' : '') +
          '<span><small>' + ml((UI.type[it.type] || UI.type.news)) + (isNew(it) ? ' · NEW' : '') + '</small><b>' + ml(it.title) + '</b></span></button>';
      });
      inner.innerHTML = h + '</div>';
      [].forEach.call(inner.querySelectorAll('.nb-row'), function (b) {
        b.addEventListener('click', function () { openDetail(items[+b.getAttribute('data-i')]); });
      });
      show();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
