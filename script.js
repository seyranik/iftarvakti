/**
 * IFTAR VAKTI - Prayer Times PWA
 * JavaScript Application with Daily Iftar Menu System
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
// MENU DATA - Traditional Turkish Iftar Items
// ============================================
const MENU_DATA = {
    // Çorbalar (Soups) - 50 items
    soups: [
        "Mercimek Çorbası", "Ezogelin Çorbası", "Tarhana Çorbası", "Yayla Çorbası",
        "Domates Çorbası", "Şehriye Çorbası", "Tavuk Suyu Çorbası", "Düğün Çorbası",
        "Paça Çorbası", "Işkembe Çorbası", "Sebze Çorbası", "Kremalı Mantar Çorbası",
        "Patates Çorbası", "Havuç Çorbası", "Brokoli Çorbası", "Karnabahar Çorbası",
        "Kabak Çorbası", "Bezelye Çorbası", "Yeşil Mercimek Çorbası", "Bulgur Çorbası",
        "Erişte Çorbası", "Analı Kızlı Çorbası", "Toyga Çorbası", "Süzme Mercimek",
        "Köfteli Şehriye Çorbası", "Pirinç Çorbası", "Un Çorbası", "Yoğurt Çorbası",
        "Kemik Suyu Çorbası", "Bamya Çorbası", "Lahana Çorbası", "Pazı Çorbası",
        "Semizotu Çorbası", "Ispanak Çorbası", "Kestane Çorbası", "Balkabağı Çorbası",
        "Soğan Çorbası", "Sarımsak Çorbası", "Enginar Çorbası", "Pırasa Çorbası",
        "Kereviz Çorbası", "Turp Çorbası", "Pancar Çorbası", "Fasulye Çorbası",
        "Nohut Çorbası", "Barbunya Çorbası", "Börülce Çorbası", "Arabaşı Çorbası",
        "Ekşili Köfte Çorbası", "Tutmaç Çorbası"
    ],
    
    // Ana Yemekler (Main Dishes) - 50 items
    mainDishes: [
        "Kuru Fasulye", "Nohutlu Pilav", "Etli Türlü", "Tavuk Sote",
        "İzmir Köfte", "Karnıyarık", "İmam Bayıldı", "Hünkar Beğendi",
        "Tas Kebabı", "Orman Kebabı", "Terbiyeli Köfte", "Kadınbudu Köfte",
        "Patlıcan Musakka", "Kabak Musakka", "Etli Kapuska", "Etli Lahana Sarması",
        "Yaprak Sarma", "Etli Biber Dolması", "Etli Patlıcan Dolması", "Etli Kabak Dolması",
        "Tavuk Tandır", "Fırın Tavuk", "Tavuklu Güveç", "Et Güveç",
        "Kuzu Tandır", "Kuzu Incik", "Dana Haşlama", "Et Kavurma",
        "Piliç Şnitzel", "Tavuk Pirzola", "Bonfile", "Antrikot",
        "Etli Taze Fasulye", "Etli Bezelye", "Etli Enginar", "Etli Kereviz",
        "Etli Pırasa", "Ciğer Tava", "Arnavut Ciğeri", "Sac Kavurma",
        "Mantarlı Tavuk", "Kremalı Tavuk", "Fırın Köfte", "Dalyan Köfte",
        "Sultanahmet Köfte", "Tekirdağ Köfte", "Akçaabat Köfte", "İnegöl Köfte",
        "Tepsi Kebabı", "Ali Nazik Kebabı"
    ],
    
    // Pilav/Makarna (Side Dishes) - 50 items
    sideDishes: [
        "Pirinç Pilavı", "Bulgur Pilavı", "Şehriyeli Pilav", "Tereyağlı Pilav",
        "İç Pilav", "Nohutlu Pilav", "Bademli Pilav", "Fıstıklı Pilav",
        "Domatesli Pilav", "Sebzeli Pilav", "Mantarlı Pilav", "Havuçlu Pilav",
        "Kestaneli Pilav", "Üzümlü Pilav", "Kuş Üzümlü Pilav", "Tavuklu Pilav",
        "Etli Pilav", "Midyeli Pilav", "Karides Pilav", "Balıklı Pilav",
        "Makarna", "Fiyonk Makarna", "Kalem Makarna", "Burgu Makarna",
        "Erişte", "Mantı", "Kayseri Mantısı", "Türk Raviolisi",
        "Fettuccine", "Penne", "Rigatoni", "Spagetti",
        "Lazanya", "Cannelloni", "Tortellini", "Gnocchi",
        "Domates Soslu Makarna", "Kremalı Makarna", "Bolonez Makarna", "Carbonara",
        "Peynirli Makarna", "Fırın Makarna", "Kıymalı Makarna", "Sebzeli Makarna",
        "Arpa Şehriye Pilavı", "Tel Şehriye Pilavı", "Kuskus", "Kinoa Pilavı",
        "Yeşil Mercimekli Bulgur", "Domatesli Bulgur"
    ],
    
    // Salatalar (Salads) - 50 items
    salads: [
        "Çoban Salata", "Mevsim Salata", "Akdeniz Salata", "Yeşil Salata",
        "Roka Salata", "Marul Salata", "Havuç Salata", "Lahana Salata",
        "Turp Salata", "Pancar Salata", "Patates Salata", "Makarna Salata",
        "Ton Balıklı Salata", "Tavuk Salata", "Sezar Salata", "Yunan Salata",
        "İtalyan Salata", "Rus Salata", "Amerikan Salata", "Waldorf Salata",
        "Coleslaw", "Kısır", "Gavurdağı Salata", "Piyaz",
        "Çingene Salata", "Karışık Salata", "Bahar Salata", "Yaz Salata",
        "Enginar Salata", "Semizotu Salata", "Nohut Salata", "Fasulye Salata",
        "Mercimek Salata", "Kinoa Salata", "Bulgur Salata", "Kuskus Salata",
        "Közlenmiş Biber Salata", "Közlenmiş Patlıcan Salata", "Avokado Salata", "Mango Salata",
        "Nar Ekşili Salata", "Limonlu Salata", "Yoğurtlu Salata", "Tahinli Salata",
        "Zeytinyağlı Salata", "Soğanlı Salata", "Sarımsaklı Salata", "Otlu Salata",
        "Dereotlu Salata", "Maydanozlu Salata"
    ],
    
    // Mezeler (Appetizers) - 60 items
    mezes: [
        "Humus", "Haydari", "Atom", "Acılı Ezme",
        "Muhammara", "Babaganuş", "Köpoğlu", "Patlıcan Salata",
        "Tarator", "Cacık", "Yoğurtlu Patlıcan", "Yoğurtlu Kabak",
        "Yoğurtlu Semizotu", "Yoğurtlu Havuç", "Yoğurtlu Ispanak", "Yoğurtlu Kereviz",
        "Zeytinyağlı Fasulye", "Zeytinyağlı Barbunya", "Zeytinyağlı Bakla", "Zeytinyağlı Enginar",
        "Zeytinyağlı Kereviz", "Zeytinyağlı Pırasa", "Zeytinyağlı Lahana", "Zeytinyağlı Bamya",
        "Turşu", "Zeytin", "Peynir Tabağı", "Beyaz Peynir",
        "Kaşar Peynir", "Lor Peynir", "Tulum Peynir", "Çökelek",
        "Fava", "Mercimek Köfte", "Patates Köfte", "Mücver",
        "Sigara Böreği", "Paçanga Böreği", "Lahmacun", "Pide",
        "Gözleme", "Katmer", "Simit", "Poğaça",
        "Açma", "Pişi", "Çiğ Köfte", "İçli Köfte",
        "Fellah Köfte", "Kısır", "Ezme", "Şakşuka",
        "Patlıcan Biber Kızartma", "Kabak Kızartma", "Havuç Tarator", "Kereviz Tarator",
        "Sarımsaklı Yoğurt", "Naneli Yoğurt", "Biber Turşusu", "Lahana Turşusu"
    ],
    
    // Tatlılar (Desserts) - 50 items
    desserts: [
        "Baklava", "Kadayıf", "Künefe", "Şöbiyet",
        "Sütlaç", "Muhallebi", "Kazandibi", "Tavuk Göğsü",
        "Keşkül", "Aşure", "Güllaç", "Lokma",
        "Tulumba", "Şekerpare", "Revani", "Kalburabasma",
        "Trileçe", "Tiramisu", "Profiterol", "Supangle",
        "Mozaik Pasta", "Cheesecake", "Brownie", "Magnolia",
        "San Sebastian", "Fırın Sütlaç", "Höşmerim", "Kabak Tatlısı",
        "Ayva Tatlısı", "Armut Tatlısı", "Elma Tatlısı", "Incir Tatlısı",
        "Kayısı Tatlısı", "Erik Tatlısı", "Şeftali Tatlısı", "Panna Cotta",
        "Crème Brûlée", "Mousse", "Puding", "Komposto",
        "Hoşaf", "Helva", "Tahin Helva", "Un Helva",
        "İrmik Helva", "Zerde", "Paluze", "Cevizli Sucuk",
        "Pestil", "Cezerye"
    ]
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
let ramadanMenus = null; // Cached menus for all 29 days

// ============================================
// DOM ELEMENTS
// ============================================
const elements = {
    ramadanProgress: document.getElementById('ramadan-progress'),
    progressFill: document.getElementById('progress-fill'),
    ramadanDayText: document.getElementById('ramadan-day-text'),
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
    scheduleBody: document.getElementById('schedule-body'),
    // Menu elements
    menuDayBadge: document.getElementById('menu-day-badge'),
    menuSoup: document.getElementById('menu-soup'),
    menuMain: document.getElementById('menu-main'),
    menuSide: document.getElementById('menu-side'),
    menuSalad: document.getElementById('menu-salad'),
    menuMeze1: document.getElementById('menu-meze1'),
    menuMeze2: document.getElementById('menu-meze2'),
    menuDessert: document.getElementById('menu-dessert'),
    menuNote: document.getElementById('menu-note')
};

// ============================================
// SEEDED RANDOM NUMBER GENERATOR
// ============================================
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }
    
    // Mulberry32 algorithm - deterministic PRNG
    next() {
        let t = this.seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    
    // Get random integer in range [0, max)
    nextInt(max) {
        return Math.floor(this.next() * max);
    }
    
    // Shuffle array using Fisher-Yates
    shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.nextInt(i + 1);
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

// ============================================
// MENU GENERATION SYSTEM
// ============================================
function generateAllRamadanMenus() {
    // Check localStorage first
    const cached = localStorage.getItem('ramadan-menus-2026');
    if (cached) {
        try {
            ramadanMenus = JSON.parse(cached);
            if (ramadanMenus && ramadanMenus.length === 29) {
                return ramadanMenus;
            }
        } catch (e) {
            localStorage.removeItem('ramadan-menus-2026');
        }
    }
    
    // Generate new menus using deterministic algorithm
    // Seed based on year to ensure consistency
    const baseSeed = 2026 * 1000;
    
    // Pre-shuffle all arrays to ensure no repeats
    const rng = new SeededRandom(baseSeed);
    
    const shuffledSoups = rng.shuffle(MENU_DATA.soups).slice(0, 29);
    const shuffledMains = rng.shuffle(MENU_DATA.mainDishes).slice(0, 29);
    const shuffledSides = rng.shuffle(MENU_DATA.sideDishes).slice(0, 29);
    const shuffledSalads = rng.shuffle(MENU_DATA.salads).slice(0, 29);
    const shuffledMezes = rng.shuffle(MENU_DATA.mezes);
    const shuffledDesserts = rng.shuffle(MENU_DATA.desserts).slice(0, 29);
    
    // Generate 29 unique menus
    ramadanMenus = [];
    
    for (let day = 1; day <= 29; day++) {
        const menu = {
            day: day,
            soup: shuffledSoups[day - 1],
            main: shuffledMains[day - 1],
            side: shuffledSides[day - 1],
            salad: shuffledSalads[day - 1],
            meze1: shuffledMezes[(day - 1) * 2],
            meze2: shuffledMezes[(day - 1) * 2 + 1],
            dessert: shuffledDesserts[day - 1]
        };
        ramadanMenus.push(menu);
    }
    
    // Cache in localStorage
    localStorage.setItem('ramadan-menus-2026', JSON.stringify(ramadanMenus));
    
    return ramadanMenus;
}

function getMenuForDay(dayNumber) {
    if (!ramadanMenus) {
        generateAllRamadanMenus();
    }
    
    if (dayNumber >= 1 && dayNumber <= 29) {
        return ramadanMenus[dayNumber - 1];
    }
    
    // Return sample menu for outside Ramadan
    return ramadanMenus[0]; // Day 1 menu as sample
}

function displayMenu(menu, isRamadan) {
    elements.menuSoup.textContent = menu.soup;
    elements.menuMain.textContent = menu.main;
    elements.menuSide.textContent = menu.side;
    elements.menuSalad.textContent = menu.salad;
    elements.menuMeze1.textContent = menu.meze1;
    elements.menuMeze2.textContent = menu.meze2;
    elements.menuDessert.textContent = menu.dessert;
    
    if (isRamadan) {
        elements.menuDayBadge.textContent = `${menu.day}. Gün`;
        elements.menuNote.classList.add('hidden');
    } else {
        elements.menuDayBadge.textContent = 'Örnek';
        elements.menuNote.classList.remove('hidden');
    }
}

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
    
    prayerTimes = null;
    monthlyData = [];
    fullRamadanData = [];
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    fetchPrayerTimes();
}

// ============================================
// RAMADAN PROGRESS & MENU
// ============================================
function updateRamadanProgress() {
    const info = getRamadanInfo();
    
    // Generate menus on first call
    if (!ramadanMenus) {
        generateAllRamadanMenus();
    }
    
    if (info.isRamadan) {
        elements.ramadanProgress.classList.remove('hidden');
        elements.progressFill.style.width = `${info.progress}%`;
        elements.ramadanDayText.textContent = `Ramazan'ın ${info.dayOfRamadan}. günü — %${Math.round(info.progress)}`;
        elements.scheduleBtnText.textContent = 'Ramazan İmsakiyesi';
        
        // Display today's menu
        const todayMenu = getMenuForDay(info.dayOfRamadan);
        displayMenu(todayMenu, true);
        
        // Add margin for fixed progress bar
        document.querySelector('.container').style.paddingTop = '4rem';
    } else {
        elements.ramadanProgress.classList.add('hidden');
        elements.scheduleBtnText.textContent = 'Aylık Takvim';
        
        // Display sample menu
        const sampleMenu = getMenuForDay(1);
        displayMenu(sampleMenu, false);
        
        document.querySelector('.container').style.paddingTop = '2rem';
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
    
    buildFullRamadanData(data);
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
            elements.countdownContent.classList.add('hidden');
            elements.iftarPassed.classList.remove('hidden');
        } else if (now >= yatsiTime) {
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
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    elements.citySelect.addEventListener('change', (e) => {
        changeCity(e.target.value);
    });
    
    elements.scheduleBtn.addEventListener('click', openModal);
    elements.modalClose.addEventListener('click', closeModal);
    
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target === elements.modalOverlay) {
            closeModal();
        }
    });
    
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
    lucide.createIcons();
    initTheme();
    initCity();
    
    // Generate menus first
    generateAllRamadanMenus();
    
    updateRamadanProgress();
    initEventListeners();
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
