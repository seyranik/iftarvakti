/**
 * IFTAR VAKTI - Prayer Times PWA
 * JavaScript Application
 */

// ============================================
// CONFIGURATION
// ============================================
const API_BASE = 'https://ezanvakti.emushaf.net';

const CITY_NAMES = {
    '9146': 'Adana',
    '9206': 'Ankara',
    '9225': 'Antalya',
    '9335': 'Bursa',
    '9381': 'Diyarbakır',
    '9440': 'Erzincan',
    '9450': 'Erzurum',
    '9470': 'Eskişehir',
    '9479': 'Gaziantep',
    '9541': 'İstanbul',
    '9560': 'İzmir',
    '9620': 'Kayseri',
    '9676': 'Konya',
    '9703': 'Malatya',
    '9737': 'Mersin',
    '9819': 'Samsun',
    '9901': 'Trabzon',
    '9929': 'Van'
};

// Ramadan 2026: Feb 19 - Mar 19 (29 days)
const RAMADAN_2026 = {
    start: new Date(2026, 1, 19),
    end: new Date(2026, 2, 19),
    totalDays: 29
};

// ============================================
// STATE
// ============================================
let currentCity = '9440'; // Erzincan default
let prayerTimes = null;
let monthlyData = [];
let fullRamadanData = [];
let countdownInterval = null;
let theme = 'dark';

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    ramadanProgress: document.getElementById('ramadan-progress'),
    progressFill: document.getElementById('progress-fill'),
    ramadanDayText: document.getElementById('ramadan-day-text'),
    adContainer: document.getElementById('ad-container'),
    citySelect: document.getElementById('city-select'),
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    loading: document.getElementById('loading'),
    countdownContent: document.getElementById('countdown-content'),
    iftarPassed: document.getElementById('iftar-passed'),
    hours: document.getElementById('hours'),
    minutes: document.getElementById('minutes'),
    seconds: document.getElementById('seconds'),
    iftarTime: document.getElementById('iftar-time'),
    prayerGrid: document.getElementById('prayer-grid'),
    scheduleBtn: document.getElementById('schedule-btn'),
    scheduleBtnText: document.getElementById('schedule-btn-text'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalClose: document.getElementById('modal-close'),
    modalTitleText: document.getElementById('modal-title-text'),
    modalSubtitle: document.getElementById('modal-subtitle'),
    scheduleBody: document.getElementById('schedule-body')
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function parseTimeToDate(timeStr) {
    if (!timeStr || timeStr === '--:--') return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function formatCountdown(ms) {
    if (ms <= 0) return { hours: '00', minutes: '00', seconds: '00' };
    
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return {
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
    };
}

function isDateInRamadan(date) {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const start = new Date(RAMADAN_2026.start);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(RAMADAN_2026.end);
    end.setHours(23, 59, 59, 999);
    
    return checkDate >= start && checkDate <= end;
}

function getRamadanDayNumber(date) {
    if (!isDateInRamadan(date)) return null;
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const start = new Date(RAMADAN_2026.start);
    start.setHours(0, 0, 0, 0);
    
    const diffTime = checkDate - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays + 1;
}

function getRamadanInfo() {
    const today = new Date();
    
    if (!isDateInRamadan(today)) {
        return { isRamadan: false };
    }
    
    const dayOfRamadan = getRamadanDayNumber(today);
    const totalDays = RAMADAN_2026.totalDays;
    const progress = (dayOfRamadan / totalDays) * 100;
    
    return { isRamadan: true, dayOfRamadan, totalDays, progress };
}

function generateAllRamadanDates() {
    const dates = [];
    const start = new Date(RAMADAN_2026.start);
    const end = new Date(RAMADAN_2026.end);
    
    let current = new Date(start);
    while (current <= end) {
        const dateStr = `${current.getDate().toString().padStart(2, '0')}.${(current.getMonth() + 1).toString().padStart(2, '0')}.${current.getFullYear()}`;
        dates.push({
            date: new Date(current),
            dateStr: dateStr,
            dayNumber: Math.floor((current - start) / (1000 * 60 * 60 * 24)) + 1
        });
        current.setDate(current.getDate() + 1);
    }
    
    return dates;
}

function getTodayStr() {
    const today = new Date();
    return `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
}

// ============================================
// THEME
// ============================================
function initTheme() {
    const savedTheme = localStorage.getItem('prayer-theme');
    theme = savedTheme || 'dark';
    applyTheme();
}

function applyTheme() {
    document.body.classList.remove('dark', 'light');
    document.body.classList.add(theme);
    localStorage.setItem('prayer-theme', theme);
    
    // Update icon
    if (elements.themeIcon) {
        elements.themeIcon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    applyTheme();
}

// ============================================
// CITY
// ============================================
function initCity() {
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlCity = urlParams.get('city');
    
    if (urlCity) {
        const cityId = Object.keys(CITY_NAMES).find(id => 
            CITY_NAMES[id].toLowerCase() === urlCity.toLowerCase()
        );
        if (cityId) {
            currentCity = cityId;
        }
    } else {
        // Check localStorage
        const savedCity = localStorage.getItem('prayer-city');
        if (savedCity && CITY_NAMES[savedCity]) {
            currentCity = savedCity;
        }
    }
    
    elements.citySelect.value = currentCity;
    localStorage.setItem('prayer-city', currentCity);
}

function changeCity(cityId) {
    currentCity = cityId;
    localStorage.setItem('prayer-city', cityId);
    
    // Clear existing data
    prayerTimes = null;
    monthlyData = [];
    fullRamadanData = [];
    
    // Stop countdown
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // Fetch new data
    fetchPrayerTimes();
}

// ============================================
// RAMADAN PROGRESS
// ============================================
function updateRamadanProgress() {
    const info = getRamadanInfo();
    
    if (info.isRamadan) {
        elements.ramadanProgress.classList.remove('hidden');
        elements.progressFill.style.width = `${info.progress}%`;
        elements.ramadanDayText.textContent = `Ramazan'ın ${info.dayOfRamadan}. günü — %${Math.round(info.progress)}`;
        
        elements.scheduleBtnText.textContent = 'Ramazan İmsakiyesi';
        
        // Adjust container margin
        if (elements.adContainer) {
            elements.adContainer.style.marginTop = '52px';
        }
    } else {
        elements.ramadanProgress.classList.add('hidden');
        elements.scheduleBtnText.textContent = 'Aylık Takvim';
    }
}

// ============================================
// API
// ============================================
async function fetchPrayerTimes() {
    showLoading();
    
    try {
        const today = new Date();
        const cacheKey = `diyanet-times-${currentCity}-${today.toDateString()}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
            try {
                const data = JSON.parse(cached);
                processApiData(data);
                return;
            } catch (e) {
                localStorage.removeItem(cacheKey);
            }
        }
        
        const response = await fetch(`${API_BASE}/vakitler/${currentCity}`);
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error('No data received');
        }
        
        localStorage.setItem(cacheKey, JSON.stringify(data));
        processApiData(data);
        
    } catch (error) {
        console.error('Failed to fetch prayer times:', error);
        showError();
    }
}

function processApiData(data) {
    monthlyData = data;
    
    // Find today's times
    const todayStr = getTodayStr();
    const todayData = data.find(day => day.MiladiTarihKisa === todayStr);
    
    if (todayData) {
        prayerTimes = {
            Imsak: todayData.Imsak,
            Gunes: todayData.Gunes,
            Ogle: todayData.Ogle,
            Ikindi: todayData.Ikindi,
            Aksam: todayData.Aksam,
            Yatsi: todayData.Yatsi
        };
    } else if (data.length > 0) {
        const first = data[0];
        prayerTimes = {
            Imsak: first.Imsak,
            Gunes: first.Gunes,
            Ogle: first.Ogle,
            Ikindi: first.Ikindi,
            Aksam: first.Aksam,
            Yatsi: first.Yatsi
        };
    }
    
    // Build full Ramadan data
    buildFullRamadanData(data);
    
    // Update UI
    updatePrayerGrid();
    updateRamadanProgress();
    startCountdown();
    hideLoading();
}

function buildFullRamadanData(apiData) {
    const allDates = generateAllRamadanDates();
    const apiMap = {};
    
    apiData.forEach(day => {
        apiMap[day.MiladiTarihKisa] = day;
    });
    
    fullRamadanData = allDates.map(ramadanDate => {
        const apiDay = apiMap[ramadanDate.dateStr];
        
        if (apiDay) {
            return {
                ...apiDay,
                ramadanDay: ramadanDate.dayNumber
            };
        } else {
            return {
                MiladiTarihKisa: ramadanDate.dateStr,
                Imsak: '--:--',
                Gunes: '--:--',
                Ogle: '--:--',
                Ikindi: '--:--',
                Aksam: '--:--',
                Yatsi: '--:--',
                ramadanDay: ramadanDate.dayNumber,
                isPlaceholder: true
            };
        }
    });
}

// ============================================
// UI UPDATES
// ============================================
function showLoading() {
    elements.loading.classList.remove('hidden');
    elements.countdownContent.classList.add('hidden');
    elements.iftarPassed.classList.add('hidden');
    elements.prayerGrid.classList.add('hidden');
}

function hideLoading() {
    elements.loading.classList.add('hidden');
    elements.prayerGrid.classList.remove('hidden');
}

function showError() {
    elements.loading.innerHTML = '<p style="color: var(--accent);">Veriler yüklenemedi. Lütfen sayfayı yenileyin.</p>';
}

function updatePrayerGrid() {
    if (!prayerTimes) return;
    
    document.getElementById('time-imsak').textContent = prayerTimes.Imsak;
    document.getElementById('time-gunes').textContent = prayerTimes.Gunes;
    document.getElementById('time-ogle').textContent = prayerTimes.Ogle;
    document.getElementById('time-ikindi').textContent = prayerTimes.Ikindi;
    document.getElementById('time-aksam').textContent = prayerTimes.Aksam;
    document.getElementById('time-yatsi').textContent = prayerTimes.Yatsi;
    
    elements.iftarTime.textContent = prayerTimes.Aksam;
}

// ============================================
// COUNTDOWN
// ============================================
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    if (!prayerTimes || !prayerTimes.Aksam) return;
    
    function updateCountdown() {
        const now = new Date();
        const aksamTime = parseTimeToDate(prayerTimes.Aksam);
        const yatsiTime = parseTimeToDate(prayerTimes.Yatsi);
        
        if (!aksamTime || !yatsiTime) return;
        
        let diff = aksamTime - now;
        
        if (diff <= 0 && now < yatsiTime) {
            // Iftar passed
            elements.countdownContent.classList.add('hidden');
            elements.iftarPassed.classList.remove('hidden');
        } else if (now >= yatsiTime) {
            // After Yatsi - countdown to tomorrow
            elements.countdownContent.classList.remove('hidden');
            elements.iftarPassed.classList.add('hidden');
            
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = `${tomorrow.getDate().toString().padStart(2, '0')}.${(tomorrow.getMonth() + 1).toString().padStart(2, '0')}.${tomorrow.getFullYear()}`;
            
            const tomorrowData = monthlyData.find(day => day.MiladiTarihKisa === tomorrowStr);
            
            if (tomorrowData) {
                const tomorrowAksam = parseTimeToDate(tomorrowData.Aksam);
                if (tomorrowAksam) {
                    tomorrowAksam.setDate(tomorrow.getDate());
                    tomorrowAksam.setMonth(tomorrow.getMonth());
                    tomorrowAksam.setFullYear(tomorrow.getFullYear());
                    diff = tomorrowAksam - now;
                }
            } else {
                const nextAksam = new Date(aksamTime);
                nextAksam.setDate(nextAksam.getDate() + 1);
                diff = nextAksam - now;
            }
            
            const countdown = formatCountdown(diff);
            elements.hours.textContent = countdown.hours;
            elements.minutes.textContent = countdown.minutes;
            elements.seconds.textContent = countdown.seconds;
        } else {
            // Before Iftar
            elements.countdownContent.classList.remove('hidden');
            elements.iftarPassed.classList.add('hidden');
            
            const countdown = formatCountdown(diff);
            elements.hours.textContent = countdown.hours;
            elements.minutes.textContent = countdown.minutes;
            elements.seconds.textContent = countdown.seconds;
        }
    }
    
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

// ============================================
// MODAL
// ============================================
function openModal() {
    const info = getRamadanInfo();
    const cityName = CITY_NAMES[currentCity];
    
    if (info.isRamadan) {
        elements.modalTitleText.textContent = `${cityName} — Ramazan İmsakiyesi 2026`;
        elements.modalSubtitle.textContent = '19 Şubat - 19 Mart 2026 (29 gün)';
        renderRamadanSchedule();
    } else {
        elements.modalTitleText.textContent = `${cityName} — Aylık Namaz Vakitleri`;
        elements.modalSubtitle.textContent = `${cityName} için aylık namaz vakitleri`;
        renderMonthlySchedule();
    }
    
    elements.modalOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
}

function renderRamadanSchedule() {
    const todayStr = getTodayStr();
    let html = '';
    
    fullRamadanData.forEach(day => {
        const isToday = day.MiladiTarihKisa === todayStr;
        const isPlaceholder = day.isPlaceholder;
        
        html += `
            <tr class="${isToday ? 'today' : ''} ${isPlaceholder ? 'placeholder' : ''}">
                <td class="col-day">${day.ramadanDay}</td>
                <td class="col-date">${day.MiladiTarihKisa}</td>
                <td>${day.Imsak}</td>
                <td>${day.Gunes}</td>
                <td>${day.Ogle}</td>
                <td>${day.Ikindi}</td>
                <td class="col-aksam">${day.Aksam}</td>
                <td>${day.Yatsi}</td>
            </tr>
        `;
    });
    
    elements.scheduleBody.innerHTML = html;
}

function renderMonthlySchedule() {
    const todayStr = getTodayStr();
    let html = '';
    
    monthlyData.forEach((day, index) => {
        const isToday = day.MiladiTarihKisa === todayStr;
        
        html += `
            <tr class="${isToday ? 'today' : ''}">
                <td class="col-day">${index + 1}</td>
                <td class="col-date">${day.MiladiTarihKisa}</td>
                <td>${day.Imsak}</td>
                <td>${day.Gunes}</td>
                <td>${day.Ogle}</td>
                <td>${day.Ikindi}</td>
                <td class="col-aksam">${day.Aksam}</td>
                <td>${day.Yatsi}</td>
            </tr>
        `;
    });
    
    elements.scheduleBody.innerHTML = html;
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // City change
    elements.citySelect.addEventListener('change', (e) => {
        changeCity(e.target.value);
    });
    
    // Schedule button
    elements.scheduleBtn.addEventListener('click', openModal);
    
    // Modal close
    elements.modalClose.addEventListener('click', closeModal);
    
    // Click outside modal to close
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            closeModal();
        }
    });
    
    // ESC to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !elements.modalOverlay.classList.contains('hidden')) {
            closeModal();
        }
    });
}

// ============================================
// INITIALIZE
// ============================================
function init() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize theme
    initTheme();
    
    // Initialize city
    initCity();
    
    // Update Ramadan progress
    updateRamadanProgress();
    
    // Set up event listeners
    initEventListeners();
    
    // Fetch prayer times
    fetchPrayerTimes();
    
    // Check for date change every minute
    setInterval(() => {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
            fetchPrayerTimes();
            updateRamadanProgress();
        }
    }, 60000);
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}
