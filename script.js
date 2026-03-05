/**
 * Namaz Vakti PWA — script.js
 * API: ezanvakti.emushaf.net
 * Push: Web Push VAPID → Cloudflare Worker → Firestore
 */

// ── Config ────────────────────────────────────────────
const API_BASE       = 'https://ezanvakti.emushaf.net';
const WORKER_URL     = 'https://iftarvakti-worker.seyranikngr.workers.dev';
const VAPID_PUBLIC   = 'BA2clnoFfnQUC2XzuAHaZtlAgVnV3LWtFVEcmfYfR6WDsbeOcaH_W15gHowhyAe2mnBHLjaUjvqEdxquFeOXI70'; // Worker deploy sonrası güncellenecek

const CITY_NAMES = {
  '9146':'Adana','9206':'Ankara','9225':'Antalya','9335':'Bursa',
  '9381':'Diyarbakır','9440':'Erzincan','9450':'Erzurum','9470':'Eskişehir',
  '9479':'Gaziantep','9541':'İstanbul','9560':'İzmir','9620':'Kayseri',
  '9676':'Konya','9703':'Malatya','9737':'Mersin','9819':'Samsun',
  '9901':'Trabzon','9929':'Van'
};

const PRAYER_NAMES = {
  Imsak:'İmsak', Gunes:'Güneş', Ogle:'Öğle',
  Ikindi:'İkindi', Aksam:'Akşam', Yatsi:'Yatsı'
};

const PRAYER_ICONS = {
  Imsak: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  Gunes: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  Ogle:  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  Ikindi:`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
  Aksam: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
  Yatsi: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`,
};

// Ramazan 2026: 2 Mart - 30 Mart
const RAMADAN_2026 = {
  start: new Date(2026, 2, 2),
  end:   new Date(2026, 2, 30),
  totalDays: 29
};

// ── State ─────────────────────────────────────────────
let currentCity    = '9440';
let prayerTimes    = null;
let monthlyData    = [];
let countdownInterval = null;
let theme          = 'dark';
let swReg          = null;
let notifPrefs     = {}; // { Imsak: true, Ogle: false, ... }

// ── DOM ───────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCity();
  buildCitySelect();
  loadNotifPrefs();
  initSW();
  fetchPrayerTimes();
  updateRamadanProgress();

  $('theme-toggle').addEventListener('click', toggleTheme);
  $('city-select').addEventListener('change', e => changeCity(e.target.value));
  $('schedule-btn').addEventListener('click', openModal);
  $('modal-close').addEventListener('click', closeModal);
  $('modal-overlay').addEventListener('click', e => { if(e.target === $('modal-overlay')) closeModal(); });
  $('notif-btn').addEventListener('click', () => $('notif-settings').classList.toggle('hidden'));
  $('notif-bar-btn').addEventListener('click', requestNotifPermission);
  $('notif-bar-close').addEventListener('click', () => $('notif-bar').classList.add('hidden'));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Her dakika kontrol
  setInterval(() => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      fetchPrayerTimes();
      updateRamadanProgress();
    }
  }, 60000);
});

// ── Şehir seçimi ──────────────────────────────────────
function buildCitySelect() {
  const sel = $('city-select');
  Object.entries(CITY_NAMES).sort((a,b) => a[1].localeCompare(b[1], 'tr')).forEach(([id, name]) => {
    const opt = document.createElement('option');
    opt.value = id; opt.textContent = name;
    if (id === currentCity) opt.selected = true;
    sel.appendChild(opt);
  });
}

function initCity() {
  const saved = localStorage.getItem('prayer-city');
  if (saved && CITY_NAMES[saved]) currentCity = saved;
}

function changeCity(cityId) {
  currentCity = cityId;
  localStorage.setItem('prayer-city', cityId);
  if (prayerTimes) syncToWorker(); // Firestore'u güncelle
  fetchPrayerTimes();
}

// ── Tema ──────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('prayer-theme');
  theme = saved || 'dark';
  applyTheme();
}

function applyTheme() {
  document.body.classList.remove('dark', 'light');
  document.body.classList.add(theme);
  localStorage.setItem('prayer-theme', theme);
  // İkon güncelle
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

// ── Ramazan progress ──────────────────────────────────
function isRamadan(date = new Date()) {
  const d = new Date(date); d.setHours(0,0,0,0);
  const s = new Date(RAMADAN_2026.start); s.setHours(0,0,0,0);
  const e = new Date(RAMADAN_2026.end); e.setHours(23,59,59,999);
  return d >= s && d <= e;
}

function ramadanDay(date = new Date()) {
  if (!isRamadan(date)) return null;
  const d = new Date(date); d.setHours(0,0,0,0);
  const s = new Date(RAMADAN_2026.start); s.setHours(0,0,0,0);
  return Math.floor((d - s) / 86400000) + 1;
}

function updateRamadanProgress() {
  const prog = $('ramadan-progress');
  if (!isRamadan()) { prog.classList.add('hidden'); return; }
  prog.classList.remove('hidden');
  const day = ramadanDay();
  const pct = (day / RAMADAN_2026.totalDays) * 100;
  $('progress-fill').style.width = pct + '%';
  $('ramadan-day-text').textContent = `Ramazan'ın ${day}. günü · ${RAMADAN_2026.totalDays - day} gün kaldı`;
}

// ── API ───────────────────────────────────────────────
async function fetchPrayerTimes() {
  $('loading').classList.remove('hidden');
  $('countdown-content').classList.add('hidden');
  $('iftar-passed').classList.add('hidden');

  try {
    const today = new Date();
    const month = today.getMonth() + 1;
    const year  = today.getFullYear();
    const url   = `${API_BASE}/vakitler/${currentCity}/${year}/${month}`;
    const res   = await fetch(url);
    monthlyData = await res.json();

    const todayStr = getTodayStr();
    const todayData = monthlyData.find(d => d.MiladiTarihKisa === todayStr);
    if (!todayData) throw new Error('Bugünkü veri bulunamadı');
    prayerTimes = todayData;

    renderPrayerGrid();
    renderNotifToggles();
    startCountdown();
    $('loading').classList.add('hidden');
    syncToWorker();
    checkNotifBar();
  } catch (e) {
    $('loading').querySelector('p').textContent = 'Vakitler yüklenemedi. İnternet bağlantınızı kontrol edin.';
    console.error(e);
  }
}

function getTodayStr() {
  const t = new Date();
  return `${t.getDate().toString().padStart(2,'0')}.${(t.getMonth()+1).toString().padStart(2,'0')}.${t.getFullYear()}`;
}

// ── Namaz kartları ────────────────────────────────────
function renderPrayerGrid() {
  if (!prayerTimes) return;
  const grid = $('prayer-grid');
  const prayers = ['Imsak','Gunes','Ogle','Ikindi','Aksam','Yatsi'];
  const nextKey  = getNextPrayerKey();
  grid.innerHTML = prayers.map(key => `
    <div class="prayer-card ${key === nextKey ? 'highlighted' : ''}" onclick="toggleNotifForPrayer('${key}')">
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
  const prayers = ['Imsak','Gunes','Ogle','Ikindi','Aksam','Yatsi'];
  for (const key of prayers) {
    const t = parseTime(prayerTimes[key]);
    if (t && t > now) return key;
  }
  return 'Imsak'; // Ertesi gün
}

function parseTime(str) {
  if (!str || str === '--:--') return null;
  const [h, m] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
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
  const now      = new Date();
  const aksamT   = parseTime(prayerTimes.Aksam);
  const yatsiT   = parseTime(prayerTimes.Yatsi);
  const nextKey  = getNextPrayerKey();
  const nextT    = nextKey ? parseTime(prayerTimes[nextKey]) : null;

  if (isRamadan()) {
    // Ramazan modunda: iftar geri sayımı
    if (!aksamT) return;
    const diff = aksamT - now;

    if (diff > 0) {
      // İftara sayıyoruz
      $('countdown-content').classList.remove('hidden');
      $('iftar-passed').classList.add('hidden');
      $('countdown-label').textContent = 'İFTARA KALAN SÜRE';
      $('next-prayer-label').textContent = 'İftar Vakti';
      $('next-prayer-time').textContent = prayerTimes.Aksam;
      setDigits('hours','minutes','seconds', diff);
    } else if (yatsiT && now < yatsiT) {
      // İftar geçti, yatsıya sayıyoruz
      $('countdown-content').classList.add('hidden');
      $('iftar-passed').classList.remove('hidden');
      setDigits('hours2','minutes2','seconds2', yatsiT - now);
    } else {
      // Yarınki iftara
      $('countdown-content').classList.remove('hidden');
      $('iftar-passed').classList.add('hidden');
      $('countdown-label').textContent = 'YARIN İFTARA KALAN';
      const tomorrow = new Date(aksamT);
      tomorrow.setDate(tomorrow.getDate() + 1);
      setDigits('hours','minutes','seconds', tomorrow - now);
    }
  } else {
    // Normal mod: bir sonraki namaza sayıyoruz
    $('iftar-passed').classList.add('hidden');
    $('countdown-content').classList.remove('hidden');
    if (nextKey && nextT) {
      $('countdown-label').textContent = 'BİR SONRAKİ NAMAZA KALAN';
      $('next-prayer-label').textContent = PRAYER_NAMES[nextKey];
      $('next-prayer-time').textContent  = prayerTimes[nextKey];
      let diff = nextT - now;
      if (diff < 0) {
        // Sabah İmsak için ertesi gün
        const nextDay = new Date(nextT);
        nextDay.setDate(nextDay.getDate() + 1);
        diff = nextDay - now;
      }
      setDigits('hours','minutes','seconds', diff);
    }
  }
  // Prayer grid highlighted güncelle
  renderPrayerGrid();
}

function setDigits(hId, mId, sId, ms) {
  if (ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  $(hId).textContent = h.toString().padStart(2,'0');
  $(mId).textContent = m.toString().padStart(2,'0');
  $(sId).textContent = s.toString().padStart(2,'0');
}

// ── Bildirim tercihleri ───────────────────────────────
function loadNotifPrefs() {
  const saved = localStorage.getItem('prayer-notif-prefs');
  if (saved) {
    try { notifPrefs = JSON.parse(saved); } catch { notifPrefs = {}; }
  }
  // Default: Akşam ve Yatsı açık
  if (Object.keys(notifPrefs).length === 0) {
    notifPrefs = { Imsak:false, Gunes:false, Ogle:false, Ikindi:false, Aksam:true, Yatsi:false };
  }
}

function saveNotifPrefs() {
  localStorage.setItem('prayer-notif-prefs', JSON.stringify(notifPrefs));
}

function toggleNotifForPrayer(key) {
  if (Notification.permission !== 'granted') {
    requestNotifPermission();
    return;
  }
  notifPrefs[key] = !notifPrefs[key];
  saveNotifPrefs();
  renderNotifToggles();
  renderPrayerGrid();
  syncToWorker();
}

function renderNotifToggles() {
  const prayers = ['Imsak','Gunes','Ogle','Ikindi','Aksam','Yatsi'];
  $('notif-toggles').innerHTML = prayers.map(key => `
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

  // Bildirim butonu göster
  const notifBtn = $('notif-btn');
  notifBtn.style.display = 'flex';
  const anyActive = Object.values(notifPrefs).some(v => v);
  notifBtn.style.color = anyActive ? 'var(--accent)' : '';
  $('notif-settings').classList.remove('hidden');
}

// ── Service Worker & Web Push ─────────────────────────
function initSW() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./service-worker.js')
    .then(reg => {
      swReg = reg;
      // PWA açılınca bildirim izni iste
      if (Notification.permission === 'default') {
        setTimeout(() => requestNotifPermission(), 1500);
      } else if (Notification.permission === 'granted') {
        syncToWorker();
      }
    })
    .catch(err => console.warn('SW registration failed:', err));
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
  } else {
    checkNotifBar();
  }
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
  if (Notification.permission !== 'granted') return;
  if (!prayerTimes) return;
  try {
    const sub = await getWebPushSubscription();
    if (!sub) return;

    // Hangi vakitler için bildirim aktif?
    const enabledPrayers = Object.entries(notifPrefs)
      .filter(([,v]) => v)
      .map(([k]) => ({ key: k, time: prayerTimes[k] }));

    await fetch(WORKER_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription: sub.toJSON(),
        city: currentCity,
        cityName: CITY_NAMES[currentCity],
        prayers: enabledPrayers,
        date: getTodayStr(),
      }),
    });
    localStorage.setItem('pv_registered', '1');
  } catch (e) { console.warn('syncToWorker:', e); }
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g,'+').replace(/_/g,'/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

// ── Modal / Takvim ────────────────────────────────────
function openModal() {
  const cityName = CITY_NAMES[currentCity];
  const now = new Date();
  if (isRamadan()) {
    $('modal-title-text').textContent = `${cityName} — Ramazan İmsakiyesi 2026`;
    $('modal-subtitle').textContent = '2 Mart - 30 Mart 2026 (29 gün)';
  } else {
    $('modal-title-text').textContent = `${cityName} — ${now.toLocaleString('tr-TR',{month:'long',year:'numeric'})} Namaz Vakitleri`;
    $('modal-subtitle').textContent = `${monthlyData.length} günlük veri`;
  }
  renderSchedule();
  $('modal-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  $('modal-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

function renderSchedule() {
  const todayStr = getTodayStr();
  $('schedule-body').innerHTML = monthlyData.map((day, i) => `
    <tr class="${day.MiladiTarihKisa === todayStr ? 'today' : ''}">
      <td class="col-day">${i+1}</td>
      <td class="col-date">${day.MiladiTarihKisa}</td>
      <td>${day.Imsak}</td>
      <td>${day.Gunes}</td>
      <td>${day.Ogle}</td>
      <td>${day.Ikindi}</td>
      <td class="col-aksam">${day.Aksam}</td>
      <td>${day.Yatsi}</td>
    </tr>
  `).join('');
}
