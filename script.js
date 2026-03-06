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
  '9146': 'Adana',         '9158': 'Adıyaman',      '9167': 'Afyonkarahisar',
  '9185': 'Ağrı',          '9193': 'Aksaray',        '9198': 'Amasya',
  '9206': 'Ankara',        '9225': 'Antalya',        '9238': 'Ardahan',
  '9246': 'Artvin',        '9252': 'Aydın',          '9270': 'Balıkesir',
  '9285': 'Bartın',        '9288': 'Batman',         '9295': 'Bayburt',
  '9297': 'Bilecik',       '9303': 'Bingöl',         '9311': 'Bitlis',
  '9315': 'Bolu',          '9327': 'Burdur',         '9335': 'Bursa',
  '9352': 'Çanakkale',     '9359': 'Çankırı',        '9370': 'Çorum',
  '9392': 'Denizli',       '9402': 'Diyarbakır',     '9414': 'Düzce',
  '9419': 'Edirne',        '9432': 'Elazığ',         '9440': 'Erzincan',
  '9451': 'Erzurum',       '9470': 'Eskişehir',      '9479': 'Gaziantep',
  '9494': 'Giresun',       '9501': 'Gümüşhane',      '9507': 'Hakkari',
  '20089': 'Hatay',        '9522': 'Iğdır',          '9528': 'Isparta',
  '9541': 'İstanbul',      '9560': 'İzmir',          '9577': 'Kahramanmaraş',
  '9581': 'Karabük',       '9587': 'Karaman',        '9594': 'Kars',
  '9609': 'Kastamonu',     '9620': 'Kayseri',        '9629': 'Kilis',
  '9635': 'Kırıkkale',     '9638': 'Kırklareli',     '9646': 'Kırşehir',
  '9654': 'Kocaeli',       '9676': 'Konya',          '9689': 'Kütahya',
  '9703': 'Malatya',       '9716': 'Manisa',         '9726': 'Mardin',
  '9737': 'Mersin',        '9747': 'Muğla',          '9755': 'Muş',
  '9760': 'Nevşehir',      '9766': 'Niğde',          '9782': 'Ordu',
  '9788': 'Osmaniye',      '9799': 'Rize',           '9807': 'Sakarya',
  '9819': 'Samsun',        '9831': 'Şanlıurfa',      '9839': 'Siirt',
  '9847': 'Sinop',         '9854': 'Şırnak',         '9868': 'Sivas',
  '9879': 'Tekirdağ',      '9887': 'Tokat',          '9905': 'Trabzon',
  '9914': 'Tunceli',       '9919': 'Uşak',           '9930': 'Van',
  '9935': 'Yalova',        '9949': 'Yozgat',         '9955': 'Zonguldak',
}


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
  // Önce vakitleri Erzincan ile yükle, arka planda konum al
  fetchPrayerTimes();
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      const nearest = findNearestCity(latitude, longitude);
      if (nearest && nearest !== currentCity && CITY_NAMES[nearest]) {
        currentCity = nearest;
        $('city-select').value = currentCity;
        localStorage.setItem('prayer-city', currentCity);
        fetchPrayerTimes(); // Doğru şehirle tekrar yükle
      }
    },
    () => { /* reddedildi, Erzincan ile devam */ },
    { timeout: 8000, maximumAge: 3600000 }
  );
}

// Yakın şehri bul (kaba koordinat eşleştirme)
const CITY_COORDS = {
  '9146': [37.00, 35.32],  // Adana
  '9158': [37.75, 38.27],  // Adıyaman
  '9185': [39.72, 43.05],  // Ağrı
  '9206': [39.92, 32.85],  // Ankara
  '9225': [36.90, 30.69],  // Antalya
  '9246': [41.18, 41.82],  // Artvin
  '9270': [39.64, 27.88],  // Balıkesir
  '9295': [40.26, 40.23],  // Bayburt
  '9303': [38.88, 40.50],  // Bingöl
  '9311': [38.40, 42.12],  // Bitlis
  '9315': [40.74, 31.61],  // Bolu
  '9335': [40.18, 29.06],  // Bursa
  '9352': [40.15, 26.41],  // Çanakkale
  '9392': [37.77, 29.08],  // Denizli
  '9402': [37.91, 40.22],  // Diyarbakır
  '9419': [41.68, 26.56],  // Edirne
  '9432': [38.68, 39.23],  // Elazığ
  '9440': [39.75, 39.49],  // Erzincan
  '9451': [39.90, 41.27],  // Erzurum
  '9470': [39.77, 30.52],  // Eskişehir
  '9479': [37.07, 37.38],  // Gaziantep
  '9494': [40.91, 38.39],  // Giresun
  '9507': [37.57, 43.74],  // Hakkari
  '20089':[36.20, 36.16],  // Hatay
  '9541': [41.01, 28.96],  // İstanbul
  '9560': [38.42, 27.14],  // İzmir
  '9577': [37.58, 36.94],  // Kahramanmaraş
  '9594': [40.60, 43.09],  // Kars
  '9620': [38.73, 35.49],  // Kayseri
  '9654': [40.76, 29.94],  // Kocaeli
  '9676': [37.87, 32.49],  // Konya
  '9703': [38.35, 38.31],  // Malatya
  '9716': [38.61, 27.42],  // Manisa
  '9726': [37.31, 40.73],  // Mardin
  '9737': [36.81, 34.63],  // Mersin
  '9747': [37.21, 28.36],  // Muğla
  '9819': [41.28, 36.33],  // Samsun
  '9831': [37.15, 38.79],  // Şanlıurfa
  '9868': [39.74, 37.01],  // Sivas
  '9879': [41.00, 27.51],  // Tekirdağ
  '9905': [41.00, 39.72],  // Trabzon
  '9930': [38.49, 43.38],  // Van
  '9955': [41.45, 31.79],  // Zonguldak
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

// ── Sayfa Yönetimi ─────────────────────────────────────
function showPage(name) {
  const mainContainer = document.querySelector('.container');
  const qiblaPage = document.getElementById('qibla-page');

  // Tüm sayfaları gizle
  mainContainer.style.display = 'none';
  qiblaPage.classList.remove('active');

  // İlgili sayfayı göster
  if (name === 'home') {
    mainContainer.style.display = '';
  } else if (name === 'qibla') {
    qiblaPage.classList.add('active');
    document.getElementById('qibla-city-label').textContent = `${CITY_NAMES[currentCity]} için Kıble Yönü`;
  } else if (name === 'takvim') {
    mainContainer.style.display = '';
    openModal(); // Mevcut takvim modalını aç
  } else if (name === 'bildirim') {
    mainContainer.style.display = '';
    toggleNotifPanel(); // Mevcut bildirim panelini aç
  } else {
    mainContainer.style.display = ''; // diğerleri şimdilik anasayfa
  }

  // Nav aktif durumu
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === name);
  });
}

// ── Kıble Pusulası ─────────────────────────────────────
let qiblaAngle = 0;

function calcQiblaAngle(lat, lon) {
  const kLat = 21.4225 * Math.PI / 180;
  const kLon = 39.8262 * Math.PI / 180;
  const uLat = lat * Math.PI / 180;
  const dLon = kLon - lon * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(kLat);
  const x = Math.cos(uLat) * Math.sin(kLat) - Math.sin(uLat) * Math.cos(kLat) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

async function startQibla() {
  // iOS izin
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const p = await DeviceOrientationEvent.requestPermission();
      if (p !== 'granted') { showQiblaError(); return; }
    } catch(e) { showQiblaError(); return; }
  }
  if (!navigator.geolocation) { showQiblaError(); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    qiblaAngle = calcQiblaAngle(pos.coords.latitude, pos.coords.longitude);
    document.getElementById('qibla-permission').classList.add('hidden');
    document.getElementById('qibla-compass').classList.remove('hidden');
    window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    window.addEventListener('deviceorientation', handleOrientation, true);
  }, showQiblaError, { timeout: 8000 });
}

function handleOrientation(e) {
  let heading = e.webkitCompassHeading ?? (e.absolute && e.alpha !== null ? 360 - e.alpha : null);
  if (heading === null) return;
  const arrow = qiblaAngle - heading;
  document.getElementById('qibla-arrow-wrap').style.transform = `rotate(${arrow}deg)`;
  document.getElementById('compass-rose').style.transform = `rotate(${-heading}deg)`;
  document.getElementById('qibla-degree').textContent = `${Math.round(qiblaAngle)}°`;
}

function showQiblaError() {
  document.getElementById('qibla-permission').classList.add('hidden');
  document.getElementById('qibla-compass').classList.add('hidden');
  document.getElementById('qibla-error').classList.remove('hidden');
}

// ── Bottom Nav Event Listeners ─────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.bottom-nav-item').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });
  document.getElementById('qibla-start-btn').addEventListener('click', startQibla);
  document.getElementById('qibla-retry-btn').addEventListener('click', () => {
    document.getElementById('qibla-error').classList.add('hidden');
    document.getElementById('qibla-permission').classList.remove('hidden');
  });
});
