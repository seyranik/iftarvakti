/**
 * Namaz Vakti PWA — script.js
 * API: ezanvakti.emushaf.net
 * Push: Web Push VAPID → Cloudflare Worker → Firestore
 */

// ── Config ────────────────────────────────────────────
const API_BASE   = 'https://ezanvakti.emushaf.net';
const WORKER_URL = 'https://iftarvakti-worker.seyranikngr.workers.dev';
const VAPID_PUBLIC = 'BA2clnoFfnQUC2XzuAHaZtlAgVnV3LWtFVEcmfYfR6WDsbeOcaH_W15gHowhyAe2mnBHLjaUjvqEdxquFeOXI70';

// 81 il — ezanvakti.emushaf.net il merkezi kodları
const CITY_NAMES = {
  '9146': 'Adana',       '9158': 'Adıyaman',    '9168': 'Afyonkarahisar',
  '9954': 'Aksaray',     '9186': 'Amasya',       '9206': 'Ankara',
  '9225': 'Antalya',     '9994': 'Ardahan',      '9248': 'Artvin',
  '9258': 'Aydın',       '9178': 'Ağrı',         '9268': 'Balıkesir',
  '9990': 'Bartın',      '9979': 'Batman',        '9961': 'Bayburt',
  '9278': 'Bilecik',     '9288': 'Bingöl',        '9296': 'Bitlis',
  '9305': 'Bolu',        '9315': 'Burdur',        '9335': 'Bursa',
  '9347': 'Çanakkale',   '9358': 'Çankırı',       '9367': 'Çorum',
  '9377': 'Denizli',     '9381': 'Diyarbakır',    '17288': 'Düzce',
  '9390': 'Edirne',      '9399': 'Elazığ',        '9440': 'Erzincan',
  '9450': 'Erzurum',     '9470': 'Eskişehir',     '9479': 'Gaziantep',
  '9490': 'Giresun',     '9499': 'Gümüşhane',     '9507': 'Hakkari',
  '9516': 'Hatay',       '9998': 'Iğdır',         '9530': 'Isparta',
  '9541': 'İstanbul',    '9560': 'İzmir',         '9723': 'Kahramanmaraş',
  '17276': 'Karabük',    '9967': 'Karaman',       '9573': 'Kars',
  '9581': 'Kastamonu',   '9620': 'Kayseri',       '17280': 'Kilis',
  '9655': 'Kocaeli',     '9676': 'Konya',         '9688': 'Kütahya',
  '9635': 'Kırklareli',  '9973': 'Kırıkkale',     '9644': 'Kırşehir',
  '9703': 'Malatya',     '9713': 'Manisa',        '9737': 'Mardin',
  '9737': 'Mersin',      '9748': 'Muğla',         '9756': 'Muş',
  '9765': 'Nevşehir',    '9774': 'Niğde',         '9784': 'Ordu',
  '17284': 'Osmaniye',   '9793': 'Rize',          '9819': 'Samsun',
  '9829': 'Siirt',       '9836': 'Sinop',         '9844': 'Sivas',
  '9921': 'Şanlıurfa',   '9985': 'Şırnak',        '9854': 'Tekirdağ',
  '9863': 'Tokat',       '9901': 'Trabzon',       '9911': 'Tunceli',
  '9929': 'Van',         '17264': 'Yalova',       '9938': 'Yozgat',
  '9947': 'Zonguldak',
};

const PRAYER_NAMES = {
  Imsak:'İmsak', Gunes:'Güneş', Ogle:'Öğle',
  Ikindi:'İkindi', Aksam:'Akşam', Yatsi:'Yatsı'
};

const PRAYER_ICONS = {
  Imsak:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  Gunes:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  Ogle:   `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  Ikindi: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  Aksam:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  Yatsi:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
};

// Ramazan 2026 — Diyanet resmi takvimi
const RAMADAN = {
  start:      new Date(2026, 1, 19),  // 19 Şubat 2026 - ilk imsak/oruç
  end:        new Date(2026, 2, 19),  // 19 Mart 2026 - son iftar (arefe)
  totalDays:  29,
  kadir:      new Date(2026, 2, 16),  // 16 Mart'ı 17'ye bağlayan gece (Kadir Gecesi)
  arefe:      new Date(2026, 2, 19),  // 19 Mart - Arefe
  bayram1:    new Date(2026, 2, 20),  // 20 Mart - Bayram 1. Gün
};

// ── State ─────────────────────────────────────────────
let currentCity       = '9440'; // Erzincan
let prayerTimes       = null;
let monthlyData       = [];
let countdownInterval = null;
let theme             = 'dark';
let swReg             = null;
let notifPrefs        = {};
let notifPanelOpen    = false;

const $ = id => document.getElementById(id);

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCity();
  buildCitySelect();
  loadNotifPrefs();
  initSW();
  updateRamadanProgress();

  $('theme-toggle').addEventListener('click', toggleTheme);
  $('city-select').addEventListener('change', e => changeCity(e.target.value));
  $('schedule-btn').addEventListener('click', openModal);
  $('modal-close').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => { if (e.target === $('modal-overlay')) closeModal(); });
  $('notif-btn').addEventListener('click', toggleNotifPanel);
  $('notif-bar-btn').addEventListener('click', requestNotifPermission);
  $('notif-bar-close').addEventListener('click', () => $('notif-bar').classList.add('hidden'));
  $('notif-panel-close').addEventListener('click', closeNotifPanel);
  $('notif-panel-overlay').addEventListener('click', e => { if (e.target === $('notif-panel-overlay')) closeNotifPanel(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); closeNotifPanel(); } });

  // Konum izni: sadece şehir manuel seçilmemişse sor
  if (!localStorage.getItem('prayer-city-manual')) {
    setTimeout(tryGeoLocation, 800);
  } else {
    fetchPrayerTimes();
  }
});

// ── Coğrafi konum ─────────────────────────────────────
function tryGeoLocation() {
  if (!('geolocation' in navigator)) {
    fetchPrayerTimes();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      const nearest = findNearestCity(latitude, longitude);
      if (nearest && nearest !== currentCity) {
        currentCity = nearest;
        $('city-select').value = currentCity;
        localStorage.setItem('prayer-city', currentCity);
      }
      fetchPrayerTimes();
    },
    () => {
      // Reddedildi veya hata — Erzincan ile devam
      fetchPrayerTimes();
    },
    { timeout: 5000, maximumAge: 3600000 }
  );
}

// Yakın şehri bul (kaba koordinat eşleştirme)
const CITY_COORDS = {
  '9440': [39.75, 39.49], // Erzincan
  '9206': [39.92, 32.85], // Ankara
  '9541': [41.01, 28.96], // İstanbul
  '9560': [38.42, 27.14], // İzmir
  '9225': [36.90, 30.69], // Antalya
  '9335': [40.18, 29.06], // Bursa
  '9146': [37.00, 35.32], // Adana
  '9479': [37.07, 37.38], // Gaziantep
  '9620': [38.73, 35.49], // Kayseri
  '9703': [38.35, 38.31], // Malatya
  '9450': [39.90, 41.27], // Erzurum
  '9819': [41.28, 36.33], // Samsun
  '9901': [41.00, 39.72], // Trabzon
  '9541': [41.01, 28.96], // İstanbul
  '9676': [37.87, 32.49], // Konya
  '9381': [37.91, 40.22], // Diyarbakır
  '9929': [38.49, 43.38], // Van
};

function findNearestCity(lat, lon) {
  let minDist = Infinity, nearest = null;
  for (const [code, [clat, clon]] of Object.entries(CITY_COORDS)) {
    const d = Math.sqrt((lat - clat) ** 2 + (lon - clon) ** 2);
    if (d < minDist) { minDist = d; nearest = code; }
  }
  return nearest;
}

// ── Şehir seçimi ──────────────────────────────────────
function buildCitySelect() {
  const sel = $('city-select');
  const sorted = Object.entries(CITY_NAMES).sort((a, b) => a[1].localeCompare(b[1], 'tr'));
  sorted.forEach(([id, name]) => {
    const opt = document.createElement('option');
    opt.value = id; opt.textContent = name;
    if (id === currentCity) opt.selected = true;
    sel.appendChild(opt);
  });
}

function initCity() {
  const saved = localStorage.getItem('prayer-city');
  if (saved && CITY_NAMES[saved]) currentCity = saved;
  // Konum izni ile değiştirilmişse manual flag'i temizle
}

function changeCity(cityId) {
  currentCity = cityId;
  localStorage.setItem('prayer-city', cityId);
  localStorage.setItem('prayer-city-manual', '1');
  fetchPrayerTimes();
}

// ── Tema ──────────────────────────────────────────────
function initTheme() {
  theme = localStorage.getItem('prayer-theme') || 'dark';
  applyTheme();
}

function applyTheme() {
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(theme);
  localStorage.setItem('prayer-theme', theme);
  const icon = $('theme-icon');
  if (theme === 'dark') {
    icon.innerHTML = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>`;
  } else {
    icon.innerHTML = `<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>`;
  }
}

function toggleTheme() {
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme();
}

// ── Ramazan bilgisi ───────────────────────────────────
function isRamadan(date = new Date()) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const s = new Date(RAMADAN.start); s.setHours(0, 0, 0, 0);
  const e = new Date(RAMADAN.end); e.setHours(23, 59, 59, 999);
  return d >= s && d <= e;
}

function ramadanDay(date = new Date()) {
  if (!isRamadan(date)) return null;
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const s = new Date(RAMADAN.start); s.setHours(0, 0, 0, 0);
  return Math.floor((d - s) / 86400000) + 1;
}

function isKadirGecesi(date = new Date()) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const k = new Date(RAMADAN.kadir); k.setHours(0, 0, 0, 0);
  return d.getTime() === k.getTime();
}

function isArefe(date = new Date()) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const a = new Date(RAMADAN.arefe); a.setHours(0, 0, 0, 0);
  return d.getTime() === a.getTime();
}

function isBayram(date = new Date()) {
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const b = new Date(RAMADAN.bayram1); b.setHours(0, 0, 0, 0);
  const b3 = new Date(b); b3.setDate(b3.getDate() + 2);
  return d >= b && d <= b3;
}

function updateRamadanProgress() {
  const prog = $('ramadan-progress');
  const today = new Date();

  if (isBayram()) {
    prog.classList.remove('hidden');
    $('progress-fill').style.width = '100%';
    $('ramadan-day-text').textContent = `🎉 Ramazan Bayramı Mübarek Olsun!`;
    return;
  }

  if (!isRamadan()) { prog.classList.add('hidden'); return; }

  prog.classList.remove('hidden');
  const day = ramadanDay();
  const pct = (day / RAMADAN.totalDays) * 100;
  $('progress-fill').style.width = pct + '%';

  const pct2 = Math.round((day / RAMADAN.totalDays) * 100);
  let text = `Ramazan'ın ${day}. günü · %${pct2}`;
  if (isKadirGecesi()) {
    text += ` · 🌙 Kadir Gecesi`;
  } else if (isArefe()) {
    text += ` · Arefe Günü`;
  } else {
    const kalan = RAMADAN.totalDays - day;
    text += kalan > 0 ? ` · ${kalan} gün kaldı` : ` · Son gün`;
  }
  $('ramadan-day-text').textContent = text;
}

// ── API ───────────────────────────────────────────────
async function fetchPrayerTimes() {
  $('loading').classList.remove('hidden');
  $('countdown-content').classList.add('hidden');
  $('iftar-passed').classList.add('hidden');

  try {
    const res = await fetch(`${API_BASE}/vakitler/${currentCity}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    monthlyData = await res.json();

    const todayStr  = getTodayStr();
    const todayData = monthlyData.find(d => d.MiladiTarihKisa === todayStr);
    if (!todayData) throw new Error('Bugünkü veri bulunamadı');
    prayerTimes = todayData;

    renderPrayerGrid();
    renderNotifToggles();
    startCountdown();
    $('loading').classList.add('hidden');
    checkNotifBar();
    syncToWorker();
  } catch (e) {
    $('loading').querySelector('p').textContent = 'Vakitler yüklenemedi. Lütfen tekrar deneyin.';
    console.error('fetchPrayerTimes:', e);
  }
}

function getTodayStr() {
  const t = new Date();
  return `${t.getDate().toString().padStart(2,'0')}.${(t.getMonth()+1).toString().padStart(2,'0')}.${t.getFullYear()}`;
}

// ── Namaz kartları ────────────────────────────────────
function renderPrayerGrid() {
  if (!prayerTimes) return;
  const nextKey = getNextPrayerKey();
  $('prayer-grid').innerHTML = ['Imsak','Gunes','Ogle','Ikindi','Aksam','Yatsi'].map(key => `
    <div class="prayer-card ${key === nextKey ? 'highlighted' : ''}">
      <div class="prayer-notif-dot ${notifPrefs[key] ? 'active' : ''}" id="dot-${key}"></div>
      <div class="prayer-icon">${PRAYER_ICONS[key]}</div>
      <div class="prayer-name">${PRAYER_NAMES[key].toUpperCase()}</div>
      <div class="prayer-time">${prayerTimes[key] || '--:--'}</div>
    </div>
  `).join('');
}

function getNextPrayerKey() {
  if (!prayerTimes) return null;
  const now = new Date();
  for (const key of ['Imsak','Gunes','Ogle','Ikindi','Aksam','Yatsi']) {
    const t = parseTime(prayerTimes[key]);
    if (t && t > now) return key;
  }
  return 'Imsak';
}

function parseTime(str) {
  if (!str || str === '--:--') return null;
  const [h, m] = str.split(':').map(Number);
  const d = new Date(); d.setHours(h, m, 0, 0);
  return d;
}

// ── Geri sayım ────────────────────────────────────────
function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);
  updateCountdown();
  countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  if (!prayerTimes) return;
  const now    = new Date();
  const aksamT = parseTime(prayerTimes.Aksam);
  const yatsiT = parseTime(prayerTimes.Yatsi);
  const nextKey = getNextPrayerKey();
  const nextT   = nextKey ? parseTime(prayerTimes[nextKey]) : null;

  if (isRamadan()) {
    if (!aksamT) return;
    const diff = aksamT - now;

    if (diff > 0) {
      // İftara sayıyoruz
      show('countdown-content'); hide('iftar-passed');
      const label = isKadirGecesi() ? 'KADİR GECESİ — İFTARA KALAN'
                  : isArefe()       ? 'AREFE — İFTARA KALAN'
                  :                   'İFTARA KALAN SÜRE';
      $('countdown-label').textContent = label;
      $('next-prayer-label').textContent = 'İftar Vakti';
      $('next-prayer-time').textContent  = prayerTimes.Aksam;
      setDigits('hours','minutes','seconds', diff);
    } else if (yatsiT && now < yatsiT) {
      hide('countdown-content'); show('iftar-passed');
      $('iftar-message').textContent    = 'Hayırlı İftarlar 🌙';
      $('iftar-submessage').textContent = 'Yatsı namazına kalan süre';
      setDigits('hours2','minutes2','seconds2', yatsiT - now);
    } else {
      // Yarınki iftara
      show('countdown-content'); hide('iftar-passed');
      $('countdown-label').textContent   = 'YARIN İFTARA KALAN';
      $('next-prayer-label').textContent = 'Yarın İftar';
      const tomorrowAksam = new Date(aksamT);
      tomorrowAksam.setDate(tomorrowAksam.getDate() + 1);
      setDigits('hours','minutes','seconds', tomorrowAksam - now);
    }
  } else {
    // Normal mod
    if (isBayram()) {
      show('countdown-content'); hide('iftar-passed');
      $('countdown-label').textContent   = '🎉 RAMAZAN BAYRAMI';
      $('next-prayer-label').textContent = 'Bayramınız Mübarek Olsun';
      $('next-prayer-time').textContent  = '';
      setDigits('hours','minutes','seconds', 0);
      return;
    }
    hide('iftar-passed'); show('countdown-content');
    if (nextKey && nextT) {
      $('countdown-label').textContent   = 'BİR SONRAKİ NAMAZA KALAN';
      $('next-prayer-label').textContent = PRAYER_NAMES[nextKey];
      $('next-prayer-time').textContent  = prayerTimes[nextKey];
      let diff = nextT - now;
      if (diff < 0) {
        const d2 = new Date(nextT); d2.setDate(d2.getDate() + 1);
        diff = d2 - now;
      }
      setDigits('hours','minutes','seconds', diff);
    }
  }
}

function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }

function setDigits(hId, mId, sId, ms) {
  if (ms < 0) ms = 0;
  const t = Math.floor(ms / 1000);
  $(hId).textContent = Math.floor(t / 3600).toString().padStart(2,'0');
  $(mId).textContent = Math.floor((t % 3600) / 60).toString().padStart(2,'0');
  $(sId).textContent = (t % 60).toString().padStart(2,'0');
}

// ── Bildirim tercihleri ───────────────────────────────
function loadNotifPrefs() {
  try {
    const saved = localStorage.getItem('prayer-notif-prefs');
    notifPrefs = saved ? JSON.parse(saved) : {};
  } catch { notifPrefs = {}; }
  if (!Object.keys(notifPrefs).length) {
    notifPrefs = { Imsak:false, Gunes:false, Ogle:false, Ikindi:false, Aksam:true, Yatsi:false };
  }
}

function saveNotifPrefs() {
  localStorage.setItem('prayer-notif-prefs', JSON.stringify(notifPrefs));
}

function toggleNotifForPrayer(key) {
  if (Notification?.permission !== 'granted') {
    requestNotifPermission().then(() => {
      if (Notification?.permission === 'granted') {
        notifPrefs[key] = !notifPrefs[key];
        saveNotifPrefs(); renderNotifToggles(); renderPrayerGrid(); syncToWorker();
      }
    });
    return;
  }
  notifPrefs[key] = !notifPrefs[key];
  saveNotifPrefs(); renderNotifToggles(); renderPrayerGrid(); syncToWorker();
}

function renderNotifToggles() {
  const container = $('notif-toggles');
  if (!container) return;
  container.innerHTML = ['Imsak','Gunes','Ogle','Ikindi','Aksam','Yatsi'].map(key => `
    <div class="notif-toggle-row">
      <div class="notif-toggle-label">
        <span class="notif-toggle-name">${PRAYER_NAMES[key]}</span>
        <span class="notif-toggle-time">${prayerTimes?.[key] || '--:--'} · 5 dk önce bildirim</span>
      </div>
      <label class="toggle-switch">
        <input type="checkbox" ${notifPrefs[key] ? 'checked' : ''} onchange="toggleNotifForPrayer('${key}')">
        <span class="toggle-slider"></span>
      </label>
    </div>
  `).join('');
  const anyActive = Object.values(notifPrefs).some(v => v);
  const nb = $('notif-btn');
  if (nb) nb.style.color = anyActive ? 'var(--accent)' : '';
}

// ── Bildirim paneli (modal) ────────────────────────────
function toggleNotifPanel() {
  notifPanelOpen ? closeNotifPanel() : openNotifPanel();
}

function openNotifPanel() {
  notifPanelOpen = true;
  $('notif-panel-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeNotifPanel() {
  notifPanelOpen = false;
  $('notif-panel-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Service Worker & Web Push ─────────────────────────
function initSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => {
      swReg = reg;
      if (Notification?.permission === 'granted') syncToWorker();
    })
    .catch(e => console.warn('SW registration failed:', e));
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    $('notif-bar').classList.add('hidden');
    await syncToWorker();
    return;
  }
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    $('notif-bar').classList.add('hidden');
    await syncToWorker();
  }
  checkNotifBar();
}

function checkNotifBar() {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'default') {
    $('notif-bar').classList.remove('hidden');
  } else {
    $('notif-bar').classList.add('hidden');
  }
}

async function getWebPushSubscription() {
  if (!swReg) return null;
  try {
    let sub = await swReg.pushManager.getSubscription();
    if (!sub) {
      sub = await swReg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
      });
    }
    return sub;
  } catch (e) { console.warn('Web Push subscribe:', e); return null; }
}

async function syncToWorker() {
  if (Notification?.permission !== 'granted') return;
  if (!prayerTimes) return;
  try {
    const sub = await getWebPushSubscription();
    if (!sub) return;
    const enabledPrayers = Object.entries(notifPrefs)
      .filter(([,v]) => v)
      .map(([k]) => ({ key: k, time: prayerTimes[k] }));
    await fetch(WORKER_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        city:      currentCity,
        cityName:  CITY_NAMES[currentCity],
        prayers:   enabledPrayers,
        date:      getTodayStr(),
      }),
    });
  } catch (e) { console.warn('syncToWorker:', e); }
}

function urlBase64ToUint8Array(b64) {
  const pad = '='.repeat((4 - b64.length % 4) % 4);
  const raw = atob((b64 + pad).replace(/-/g,'+').replace(/_/g,'/'));
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

// ── Modal / Takvim ────────────────────────────────────
function openModal() {
  const city = CITY_NAMES[currentCity];
  const now  = new Date();
  if (isRamadan()) {
    $('modal-title-text').textContent = `${city} — Ramazan İmsakiyesi 2026`;
    $('modal-subtitle').textContent   = '19 Şubat - 19 Mart 2026 · 29 gün · Kadir Gecesi: 16 Mart';
    renderSchedule(true); // sadece ramazan günlerini göster
  } else {
    $('modal-title-text').textContent = `${city} — ${now.toLocaleString('tr-TR',{month:'long',year:'numeric'})}`;
    $('modal-subtitle').textContent   = `${monthlyData.length} günlük namaz vakitleri`;
    renderSchedule(false);
  }
  $('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderSchedule(ramadanOnly = false) {
  const todayStr = getTodayStr();
  let data = monthlyData;
  if (ramadanOnly) {
    // Ramazan günleri + Bayram 1. günü
    data = monthlyData.filter(d => {
      const dt = parseTableDate(d.MiladiTarihKisa);
      if (!dt) return false;
      if (isRamadan(dt)) return true;
      // Bayram 1. günü de ekle
      const b = new Date(RAMADAN.bayram1); b.setHours(0,0,0,0);
      const dt2 = new Date(dt); dt2.setHours(0,0,0,0);
      return dt2.getTime() === b.getTime();
    });
  }
  $('schedule-body').innerHTML = data.map((day, i) => {
    const isToday   = day.MiladiTarihKisa === todayStr;
    const dateObj   = parseTableDate(day.MiladiTarihKisa);
    const isKadir   = dateObj && isKadirGecesi(dateObj);
    const isArefeD  = dateObj && isArefe(dateObj);
    const isBayramD = dateObj && isBayram(dateObj);
    let rowClass = isToday ? 'today' : '';
    let badge = '';
    if (isKadir)   badge = ' <span style="font-size:0.7rem;color:var(--accent)">Kadir Gecesi 🌙</span>';
    if (isArefeD)  badge = ' <span style="font-size:0.7rem;color:var(--accent)">Arefe</span>';
    if (isBayramD) badge = ' <span style="font-size:0.7rem;color:var(--accent)">Ramazan Bayramı 🎉</span>';
    return `
      <tr class="${rowClass}">
        <td class="col-day">${i+1}</td>
        <td class="col-date">${day.MiladiTarihKisa}${badge}</td>
        <td>${day.Imsak}</td>
        <td>${day.Gunes}</td>
        <td>${day.Ogle}</td>
        <td>${day.Ikindi}</td>
        <td class="col-aksam">${day.Aksam}</td>
        <td>${day.Yatsi}</td>
      </tr>
    `;
  }).join('');
}

function parseTableDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split('.').map(Number);
  return new Date(y, m-1, d);
}
