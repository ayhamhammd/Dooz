// DOOZ — a static menu. Rows of plates you swipe through; a plate you tap lifts off the row, turns over and settles mid-screen. No cart, no storage.
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const motionOK = !matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone = () => innerWidth < 1024;
const data = window.DOOZ_MENU || [];
const items = []; data.forEach(c => c.items.forEach((x, i) => items.push({ ...x, cat: c, i, n: c.items.length })));
const byId = new Map(items.map(x => [x.id, x]));
const money = n => n.toFixed(2);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const img = x => x.image_url || `assets/menu/${x.id}.webp`;
/* scroll a horizontal strip so `el` sits in its middle — the strip only, never the page */
function centerIn(strip, el, smooth) {
  const s = strip.getBoundingClientRect(), r = el.getBoundingClientRect();
  strip.scrollBy({ left: (r.left + r.width / 2) - (s.left + s.width / 2), behavior: smooth && motionOK ? 'smooth' : 'auto' });
}

/* the header: solid once the hero scrolls; on a phone it slides away while you browse the menu.
   the hero film drifts at a quarter of the page's speed. */
const top = $('.top'), film = $('.film'), hero = $('.hero');
let lastY = scrollY;
function away(v) { top.classList.toggle('away', v); document.documentElement.style.setProperty('--rail-top', v ? '0px' : getComputedStyle(top).height); }
function chrome() {
  const y = scrollY;
  if (pop.classList.contains('open')) { lastY = y; return; }
  top.classList.toggle('solid', y > 24);
  if (phone()) { if (y > 160 && y > lastY + 3) away(true); else if (y < lastY - 3 || y <= 160) away(false); }
  else away(false);
  if (motionOK && y < hero.offsetHeight) film.style.transform = `translateY(${y * 0.25}px)`;
  lastY = y;
}

/* the clock: Amman time, open 9:00 to 01:00 daily */
function hourInAmman() {
  const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Amman', hour: 'numeric', hour12: false }).formatToParts(new Date());
  return +p.find(x => x.type === 'hour').value % 24;
}
function clock() {
  const h = hourInAmman();
  const open = h >= 9 || h < 1;
  $$('[data-status]').forEach(el => {
    el.classList.toggle('closed', !open);
    $('span', el).textContent = open
      ? (h >= 23 || h < 1 ? 'مفتوح الآن · آخر طلب قبل 1:00' : 'مفتوح الآن · لغاية 1:00 بعد منتصف الليل')
      : 'مغلق حاليًا · نفتح 9:00 صباحًا';
  });
  const g = $('#greeting');
  if (g) g.textContent = h < 12 ? 'Good morning, Zarqa' : h < 17 ? 'Good afternoon, Zarqa' : h < 22 ? 'Good evening, Zarqa' : 'Late night at DOOZ';
}
clock(); setInterval(clock, 60000);

/* category icons — the owner's own line drawings — and the short names the phone strip uses */
const ICONS = {
  cup: '<path d="M25 40h49v22a24 24 0 0 1-49 0Z M74 44h8a12 12 0 0 1 0 24H73 M17 89h69 M38 30c-10-11 10-12 0-23 M54 30c-10-11 10-12 0-23"/>',
  glass: '<path d="M29 27h44l-7 62H36Z M22 27h58 M62 27l5-19h15 M33 48h36 M43 57l9-8 10 9-9 9Z"/><path d="M36 89h30"/>',
  dish: '<ellipse cx="52" cy="67" rx="40" ry="13"/><path d="M20 65c0-37 64-37 64 0 M46 33v-6h12v6 M22 87h60"/>',
  pizza: '<path d="m25 85 20-68 46 50Z M45 17c22 0 39 20 46 50 M43 26c20 1 30 16 38 39"/><circle cx="47" cy="48" r="5"/><circle cx="60" cy="66" r="5"/><circle cx="38" cy="69" r="3"/>',
  burger: '<path d="M18 45c0-34 68-34 68 0Z M18 64h68v8c0 10-68 10-68 0Z M15 55l13-5 15 8 16-8 13 7 17-6 M18 63h68"/><path d="m37 31 3-3 m16 0 2 3 m9 1 3-2"/>',
  cake: '<path d="M23 48h63v34H23Z M23 48l32-26 31 26 M23 66h63 M17 88h74"/><circle cx="57" cy="26" r="6"/><path d="M57 20c0-7 6-8 10-5"/>',
  leaf: '<path d="M28 82c-24-44 28-65 57-60 4 28-12 79-57 60Z M22 91l51-56 M39 72l-2-22 M48 64l23 1"/>',
  pasta: '<path d="M18 64h68c-5 33-63 33-68 0Z M23 90h58 M28 58c-15-25 20-40 22-19S27 52 37 58 M48 57c-8-23 19-36 21-16S50 48 60 58 M75 57c20-23-10-36-13-14"/>',
  shisha: '<path d="M39 77c-13 20 39 20 26 0l-9-13V35h7v-6H42v6h7v29Z M32 58h42 M52 27V15 M43 15h19 M67 75c27 15 29-8 21-24s3-26 6-17"/>'
};
const ICON_FOR = { hot: 'cup', coffee: 'cup', juice: 'glass', smoothie: 'glass', milkshake: 'glass', frappe: 'glass', refresh: 'glass', dessert: 'cake', breakfast: 'dish', pizza: 'pizza', burger: 'burger', pasta: 'pasta', snacks: 'dish', appetizer: 'dish', salad: 'leaf', shisha: 'shisha' };
const SHORT = { hot: 'ساخنة', coffee: 'قهوة', juice: 'عصائر', smoothie: 'سموذي', milkshake: 'ميلك شيك', frappe: 'فرابيه', refresh: 'موهيتو', dessert: 'حلويات', breakfast: 'فطور', pizza: 'بيتزا', burger: 'برجر', pasta: 'باستا', snacks: 'سناكات', appetizer: 'مقبلات', salad: 'سلطات', shisha: 'أراجيل' };
const icon = id => `<svg viewBox="0 0 104 104" aria-hidden="true">${ICONS[ICON_FOR[id]] || ICONS.dish}</svg>`;

/* render: the strip, then one chapter per category with its row of plates */
const railBox = $('#railbox'), rail = $('#rail'), q = $('#q');
rail.innerHTML = `<li><button type="button" class="find" data-find aria-label="بحث"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button></li>` +
  data.map(c => `<li><button type="button" data-jump="${c.id}" aria-current="false">${icon(c.id)}<span class="short">${esc(SHORT[c.id] || c.name)}</span><span class="full">${esc(c.name)}</span><span class="n">${c.items.length}</span></button></li>`).join('');
const plate = x => `<button type="button" class="plate" data-open="${x.id}" aria-label="${esc(x.name)}، ${money(x.price)} دينار">
  <img src="${img(x)}" alt="" loading="lazy" decoding="async" width="800" height="600">
  <span class="cap"><span class="name">${esc(x.name)}</span><span class="en" dir="ltr">${esc(x.en)}</span><span class="price">${money(x.price)}<small>JD</small></span></span>
</button>`;
$('#chapters').innerHTML = data.map((c, ci) => `<section class="chapter" id="cat-${c.id}" data-cat="${c.id}" aria-labelledby="h-${c.id}">
  <div class="chapter-head">${icon(c.id)}<div class="titles"><h3 id="h-${c.id}">${esc(c.name)}</h3><span class="meta">${esc(c.en)}</span></div><span class="count" data-count>1 / ${c.items.length}</span><span class="arrows"><button type="button" data-arrow="-1" aria-label="السابق">→</button><button type="button" data-arrow="1" aria-label="التالي">←</button></span></div>
  ${ci === 0 ? '<p class="swipe-hint" id="swipe-hint"><b aria-hidden="true">←</b> اسحب لتشوف باقي الأطباق</p>' : ''}
  <div class="plates" data-plates>${c.items.map(plate).join('')}</div>
  <div class="dots" data-dots aria-hidden="true">${c.items.map(() => '<i></i>').join('')}</div>
</section>`).join('');

/* plates fade in as their photo arrives; the one in the middle of the row is lit */
document.addEventListener('load', e => { if (e.target.tagName === 'IMG') e.target.classList.add('in'); }, true);
$$('img').forEach(im => { if (im.complete && im.naturalWidth) im.classList.add('in'); });
const hint = $('#swipe-hint');
$$('[data-plates]').forEach(row => {
  const plates = $$('.plate', row), count = $('[data-count]', row.parentElement), dots = $$('[data-dots] i', row.parentElement);
  const lit = new IntersectionObserver(es => es.forEach(e => {
    e.target.classList.toggle('lit', e.isIntersecting);
    if (e.isIntersecting) { const k = plates.indexOf(e.target); count.textContent = `${k + 1} / ${plates.length}`; dots.forEach((d, i) => d.classList.toggle('on', i === k)); }
  }), { root: row, threshold: 0.6 });
  plates.forEach(p => lit.observe(p));
  row.addEventListener('scroll', () => hint && hint.classList.add('gone'), { passive: true, once: true });
});
function slide(row, dir) { row.scrollBy({ left: -dir * ($('.plate', row).offsetWidth + 12), behavior: motionOK ? 'smooth' : 'auto' }); }

/* the strip follows the scroll; a tap on it drives the scroll */
const chips = new Map($$('button[data-jump]', rail).map(b => [b.dataset.jump, b]));
const chapters = $$('.chapter');
let current = null, jumpingUntil = 0;
function setCurrent(id) {
  if (id === current) return; current = id;
  chips.forEach((b, k) => b.setAttribute('aria-current', String(k === id)));
  const b = chips.get(id);
  if (b && phone()) centerIn(rail, b, true);
}
function spy() {
  if (Date.now() < jumpingUntil) return;
  const offset = phone() ? railBox.getBoundingClientRect().bottom + 12 : parseInt(getComputedStyle(top).height) + 30;
  let hit = null;
  for (const s of chapters) { if (s.hidden) continue; if (s.getBoundingClientRect().top <= offset) hit = s; else break; }
  if (hit) setCurrent(hit.dataset.cat);
}
let ticking = false;
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; chrome(); spy(); pill(); }); } }, { passive: true });
addEventListener('scrollend', () => { jumpingUntil = 0; spy(); });
function jump(id) {
  const s = $('#cat-' + id); if (!s) return;
  setCurrent(id); jumpingUntil = Date.now() + 1200;
  if (phone()) away(true);
  s.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'start' });
}

/* search — lives in the strip; on a phone the chips step aside for it */
const norm = s => s.toLowerCase().normalize('NFKD').replace(/[ً-ٰٟ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');
q.addEventListener('input', () => {
  const s = norm(q.value.trim()); let shown = 0;
  chapters.forEach(sec => {
    let n = 0;
    $$('.plate', sec).forEach(el => { const x = byId.get(el.dataset.open); const ok = !s || norm(`${x.name} ${x.en} ${x.cat.name} ${x.cat.en}`).includes(s); el.hidden = !ok; if (ok) n++; });
    sec.hidden = n === 0; shown += n;
  });
  $('#empty').hidden = shown > 0;
});
q.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });
function openSearch() { railBox.classList.add('searching'); q.focus(); }
function closeSearch() { q.value = ''; q.dispatchEvent(new Event('input')); railBox.classList.remove('searching'); }

/* the flip: the plate you touched lifts off the row, turns over, and settles mid-screen.
   dismissing flies it straight back onto that same plate — the page never moves underneath. */
const pop = $('#pop'), popCard = $('.pop-card', pop), backdrop = $('#pop-backdrop'), tray = $('.tray');
const FLY = { duration: 640, easing: 'cubic-bezier(.2,.8,.2,1)' }, FLIP = { duration: 640, easing: 'cubic-bezier(.35,.7,.25,1)', fill: 'forwards' };
let at = -1, origin = null, originAt = -1, hiddenPlate = null, busy = false, closing = false;
function targetRect() {
  const w = Math.min(innerWidth * 0.9, 420), h = Math.min(w * 1.3, innerHeight * 0.82);
  return { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h };
}
function fillFront(x) {
  $('.front-img', pop).src = img(x);
  $('.pop-front .name', pop).textContent = x.name; $('.pop-front .en', pop).textContent = x.en; $('.pop-front .price', pop).innerHTML = `${money(x.price)}<small>JD</small>`;
}
function fill(x) {
  fillFront(x); $('.back-bg', pop).src = img(x);
  $('.back-content .eyebrow', pop).textContent = x.cat.en; $('#pop-name').textContent = x.name; $('.back-content .en', pop).textContent = x.en;
  $('.back-content .detail', pop).textContent = x.detail; $('.back-content .price', pop).innerHTML = `${money(x.price)}<small>JD</small>`;
  $('.pop-bar .count', pop).innerHTML = `${x.i + 1} / ${x.n}<small>${esc(x.cat.name)}</small>`;
  $('[data-step="-1"]', pop).disabled = at === 0; $('[data-step="1"]', pop).disabled = at === items.length - 1;
}
function hidePlate(el) { if (hiddenPlate) hiddenPlate.style.visibility = ''; hiddenPlate = el; if (el) el.style.visibility = 'hidden'; }
function inView(r) { return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth; }
const box = r => ({ left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
function openFrom(el, k) {
  if (busy || closing || pop.classList.contains('open')) return;
  at = originAt = k; origin = el; fill(items[k]);
  if (!el.classList.contains('lit')) {   /* a tapped neighbour becomes the centred, lit plate before the card lifts */
    centerIn(el.closest('[data-plates]'), el, false);
    el.style.transition = 'none'; el.classList.add('lit'); void el.offsetWidth; el.style.transition = '';
  }
  const first = el.getBoundingClientRect(), last = targetRect();
  Object.assign(pop.style, box(last));
  pop.hidden = false; backdrop.hidden = false; pop.classList.add('open'); hidePlate(el);
  pop.getAnimations().forEach(a => a.cancel()); popCard.getAnimations().forEach(a => a.cancel()); backdrop.getAnimations().forEach(a => a.cancel());
  if (motionOK) {
    busy = true;
    pop.animate([box(first), box(last)], FLY);
    popCard.animate([{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(180deg)' }], FLIP);
    backdrop.animate([{ opacity: 0, backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)' }, { opacity: 1, backdropFilter: 'blur(10px)', webkitBackdropFilter: 'blur(10px)' }], { duration: 480, fill: 'forwards' });
    setTimeout(() => { busy = false; }, FLY.duration);
  } else popCard.style.transform = 'rotateY(180deg)';
  pop.focus({ preventScroll: true });
}
function close() {
  if (!pop.classList.contains('open') || closing) return;
  closing = true;
  const el = origin;
  let dest = null;
  if (el) { const r = el.getBoundingClientRect(); if (inView(r)) dest = r; }
  if (at !== originAt) fillFront(items[originAt]);   /* the card turns back over showing the plate it came from */
  hidePlate(dest ? el : null);
  let done = false;
  const finish = () => {
    if (done) return; done = true; busy = false; closing = false;
    pop.classList.remove('open'); pop.hidden = true; backdrop.hidden = true;
    pop.getAnimations().forEach(a => a.cancel()); popCard.getAnimations().forEach(a => a.cancel()); backdrop.getAnimations().forEach(a => a.cancel());
    popCard.style.transform = ''; pop.style.opacity = ''; pop.style.transform = '';
    hidePlate(null);
    if (el) el.focus({ preventScroll: true });
  };
  if (!motionOK) return finish();
  /* pick the card up from exactly where it is, even mid-flight */
  const cur = pop.getBoundingClientRect();
  let angle = 180;
  if (busy) { const m = new DOMMatrix(getComputedStyle(popCard).transform); angle = Math.round(Math.acos(Math.max(-1, Math.min(1, m.m11))) * 180 / Math.PI); }
  const shade = parseFloat(getComputedStyle(backdrop).opacity) || 1;
  pop.getAnimations().forEach(a => a.cancel()); popCard.getAnimations().forEach(a => a.cancel()); backdrop.getAnimations().forEach(a => a.cancel());
  busy = true;
  const ease = 'cubic-bezier(.3,.7,.2,1)', dur = Math.max(260, Math.round(520 * angle / 180));
  let a;
  if (dest) { Object.assign(pop.style, box(dest)); a = pop.animate([box(cur), box(dest)], { duration: dur, easing: ease }); }
  else { Object.assign(pop.style, box(cur)); a = pop.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.94)' }], { duration: dur, easing: ease, fill: 'forwards' }); }
  popCard.animate([{ transform: `rotateY(${angle}deg)` }, { transform: 'rotateY(0deg)' }], { duration: dur, easing: ease, fill: 'forwards' });
  backdrop.animate([{ opacity: shade, backdropFilter: `blur(${10 * shade}px)`, webkitBackdropFilter: `blur(${10 * shade}px)` }, { opacity: 0, backdropFilter: 'blur(0px)', webkitBackdropFilter: 'blur(0px)' }], { duration: dur, easing: 'ease-in', fill: 'forwards' });
  a.onfinish = finish; setTimeout(finish, dur + 100);
}
function step(d) {
  const k = at + d; if (k < 0 || k >= items.length || busy || closing) return;
  at = k;
  const content = $('.back-content', pop);
  if (!motionOK) return fill(items[k]);
  const out = content.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateX(${-d * 16}px)` }], { duration: 140, fill: 'forwards' });
  let swapped = false;
  const swap = () => { if (swapped) return; swapped = true; out.cancel(); fill(items[k]); content.animate([{ opacity: 0, transform: `translateX(${d * 16}px)` }, { opacity: 1, transform: 'none' }], { duration: 240, easing: 'ease-out' }); };
  out.onfinish = swap; setTimeout(swap, 200);
}
/* nothing behind the card may scroll: the backdrop eats touches and wheel, the card only lets its text panel scroll */
backdrop.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
backdrop.addEventListener('wheel', e => e.preventDefault(), { passive: false });
pop.addEventListener('touchmove', e => { if (!e.target.closest('.back-content')) e.preventDefault(); }, { passive: false });
pop.addEventListener('wheel', e => { if (!e.target.closest('.back-content')) e.preventDefault(); }, { passive: false });
let tx = 0, ty = 0;
pop.addEventListener('touchstart', e => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
pop.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
  if (Math.abs(dx) > 60 && Math.abs(dy) < 70) step(dx < 0 ? 1 : -1);
  else if (dy > 90 && Math.abs(dx) < 60 && $('.back-content', pop).scrollTop === 0) close();
}, { passive: true });
document.addEventListener('keydown', e => {
  if (!pop.classList.contains('open')) return;
  if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') step(1); else if (e.key === 'ArrowRight') step(-1);
  else if ([' ', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) e.preventDefault();
});
backdrop.addEventListener('click', close);

/* one listener for every control */
document.addEventListener('click', e => {
  const t = e.target;
  const o = t.closest('[data-open]'); if (o) return openFrom(o, items.findIndex(x => x.id === o.dataset.open));
  const st = t.closest('[data-step]'); if (st) return step(+st.dataset.step);
  if (t.closest('[data-pop-close]')) return close();
  if (t.closest('[data-flipback]') && !t.closest('button, a')) return close();
  const ar = t.closest('[data-arrow]'); if (ar) return slide($('[data-plates]', ar.closest('.chapter')), +ar.dataset.arrow);
  const j = t.closest('[data-jump]'); if (j) return jump(j.dataset.jump);
  if (t.closest('[data-find]')) return openSearch();
  if (t.closest('[data-find-close]')) return closeSearch();
  const c = t.closest('[data-close]'); if (c) return c.closest('dialog').close();
  if (t.closest('[data-privacy]')) return $('#privacy').showModal();
});
$$('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));

/* the menu pill hides while any of the menu is on screen — decided every scroll frame, so it can never be left behind */
const menuSec = $('#menu');
function pill() { const r = menuSec.getBoundingClientRect(); tray.classList.toggle('hide', r.top < innerHeight - 140 && r.bottom > 160); }

/* films: honour Reduce Motion */
if (!motionOK) $$('video').forEach(v => v.pause());

$('#year').textContent = new Date().getFullYear();
chrome(); spy(); pill();
if (location.hash === '#menu') requestAnimationFrame(() => $('#menu').scrollIntoView({ behavior: 'instant' }));
})();
