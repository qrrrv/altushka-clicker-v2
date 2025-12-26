const PHOTOS = [
    'assets/IMG_20251226_184854_485.jpg',
    'assets/IMG_20251226_184850_002.jpg',
    'assets/IMG_20251226_184848_452.jpg',
    'assets/IMG_20251226_184844_799.jpg',
    'assets/IMG_20251226_184834_086.jpg',
    'assets/IMG_20251226_184825_127.jpg',
];

const UPGRADES = [
    { id: 1, name: 'Мышка', icon: '🖱️', baseCost: 20, clickBonus: 1 },
    { id: 2, name: 'Коврик RGB', icon: '🌈', baseCost: 80, clickBonus: 2 },
    { id: 3, name: 'Энергетик', icon: '⚡', baseCost: 150, clickBonus: 4 },
    { id: 4, name: 'Наушники', icon: '🎧', baseCost: 300, clickBonus: 7 },
    { id: 5, name: 'Вебкамера', icon: '📹', baseCost: 500, clickBonus: 12 },
    { id: 6, name: 'Геймерский стул', icon: '🪑', baseCost: 800, clickBonus: 20 },
    { id: 7, name: 'Микрофон', icon: '🎙️', baseCost: 1200, clickBonus: 35 },
    { id: 8, name: 'LED лента', icon: '💡', baseCost: 1800, clickBonus: 55 },
    { id: 9, name: 'Механика', icon: '⌨️', baseCost: 2500, clickBonus: 85 },
    { id: 10, name: 'Второй монитор', icon: '🖥️', baseCost: 3500, clickBonus: 130 },
    { id: 11, name: 'Игровая консоль', icon: '🎮', baseCost: 5000, clickBonus: 200 },
    { id: 12, name: 'Кулер для ПК', icon: '❄️', baseCost: 7000, clickBonus: 300 },
    { id: 13, name: 'Графический планшет', icon: '✏️', baseCost: 10000, clickBonus: 450 },
    { id: 14, name: 'Профессиональное кресло', icon: '👑', baseCost: 15000, clickBonus: 650 },
    { id: 15, name: 'Смарт часы', icon: '⌚', baseCost: 20000, clickBonus: 900 },
    { id: 16, name: 'Голосовой помощник', icon: '🤖', baseCost: 30000, clickBonus: 1300 },
    { id: 17, name: 'VR Шлем', icon: '🥽', baseCost: 50000, clickBonus: 2000 },
    { id: 18, name: 'Игровой сервер', icon: '🖥️', baseCost: 100000, clickBonus: 5000 },
];

const INVESTMENTS = [
    { id: 1, name: 'Telegram канал', icon: '📱', baseCost: 150, income: 0.8 },
    { id: 2, name: 'VK паблик', icon: '🔵', baseCost: 350, income: 2 },
    { id: 3, name: 'TikTok аккаунт', icon: '🎵', baseCost: 700, income: 4.5 },
    { id: 4, name: 'YouTube канал', icon: '📺', baseCost: 1200, income: 9 },
    { id: 5, name: 'Twitch стрим', icon: '💜', baseCost: 2000, income: 17 },
    { id: 6, name: 'Интернет магазин', icon: '🛒', baseCost: 3500, income: 30 },
    { id: 7, name: 'Instagram аккаунт', icon: '📸', baseCost: 5000, income: 50 },
    { id: 8, name: 'Discord сервер', icon: '🎮', baseCost: 7500, income: 75 },
    { id: 9, name: 'Блог на Medium', icon: '📝', baseCost: 10000, income: 110 },
    { id: 10, name: 'Podcast', icon: '🎙️', baseCost: 15000, income: 160 },
    { id: 11, name: 'Онлайн курсы', icon: '🎓', baseCost: 20000, income: 230 },
    { id: 12, name: 'Мерч магазин', icon: '🛍️', baseCost: 30000, income: 330 },
    { id: 13, name: 'Криптоферма', icon: '⛏️', baseCost: 75000, income: 800 },
    { id: 14, name: 'Медиахолдинг', icon: '🏢', baseCost: 200000, income: 2500 },
];

const LOYALTY_FOR_LEVEL_UP = 1200;
const LOYALTY_PER_CLICK = 8;

let state = {
    vibes: 0,
    totalVibes: 0,
    loyalty: 0,
    level: 1,
    clicks: 0,
    currentPhotoIndex: 0,
    upgrades: {}, // id: level
    investments: {}, // id: level
    achievements: [],
    theme: 'light',
    prestige: {
        points: 0,
        totalPoints: 0,
        count: 0,
        skills: {
            clickMaster: 0,
            passiveIncome: 0,
            luck: 0
        }
    },
    combo: {
        value: 0,
        multiplier: 1,
        lastClick: 0
    },
    settings: {
        volume: 50,
        particles: true,
        numbers: true,
        soundSet: 'classic'
    },
    stats: {
        timePlayed: 0,
        usedPromos: []
    }
};

// DOM Elements
const vibesDisplay = document.getElementById('vibes-count');
const vpcDisplay = document.getElementById('vpc-value');
const vpsDisplay = document.getElementById('vps-value');
const levelDisplay = document.getElementById('level-value');
const loyaltyPercentDisplay = document.getElementById('loyalty-percent');
const loyaltyFill = document.getElementById('loyalty-fill');
const clickButton = document.getElementById('click-button');
const altushkaImg = document.getElementById('altushka-img');
const floatingNumbersContainer = document.getElementById('floating-numbers');
const upgradesList = document.getElementById('upgrades-list');
const investmentsList = document.getElementById('investments-list');
const resetBtn = document.getElementById('reset-game');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// New DOM Elements
const statTotalClicks = document.getElementById('stat-total-clicks');
const statTotalVibes = document.getElementById('stat-total-vibes');
const statLevel = document.getElementById('stat-level');
const statUpgrades = document.getElementById('stat-upgrades');
const statInvestments = document.getElementById('stat-investments');
const statAchievements = document.getElementById('stat-achievements');
const statTime = document.getElementById('stat-time');
const profileRank = document.getElementById('profile-rank');

const settingsModal = document.getElementById('settings-modal');
const openSettingsBtn = document.getElementById('open-settings');
const closeSettingsBtn = document.getElementById('close-settings');
const themeSelect = document.getElementById('theme-select');

const volumeControl = document.getElementById('volume-control');
const particlesToggle = document.getElementById('particles-toggle');
const numbersToggle = document.getElementById('numbers-toggle');
const soundSetSelect = document.getElementById('sound-set-select');
const promoInput = document.getElementById('promo-input');
const applyPromoBtn = document.getElementById('apply-promo');
const exportBtn = document.getElementById('export-save');
const importBtn = document.getElementById('import-save');

// Audio Context
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    const volume = (state.settings?.volume || 50) / 500;
    const soundSet = state.settings.soundSet || 'classic';

    const playOsc = (freqs, duration, type = 'sine') => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        
        freqs.forEach((f, i) => {
            if (i === 0) osc.frequency.setValueAtTime(f, audioCtx.currentTime);
            else osc.frequency.exponentialRampToValueAtTime(f, audioCtx.currentTime + (duration * i / freqs.length));
        });

        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + duration);
    };

    if (soundSet === '8bit') {
        if (type === 'click') playOsc([150, 300, 100], 0.1, 'square');
        else if (type === 'buy') playOsc([200, 400, 600], 0.2, 'square');
        else if (type === 'levelup') playOsc([400, 600, 800, 1000], 0.4, 'square');
    } else if (soundSet === 'modern') {
        if (type === 'click') playOsc([1000, 800], 0.05, 'triangle');
        else if (type === 'buy') playOsc([600, 900], 0.15, 'triangle');
        else if (type === 'levelup') playOsc([300, 600, 900], 0.3, 'triangle');
    } else {
        // Classic
        if (type === 'click') playOsc([800, 400], 0.1);
        else if (type === 'buy') playOsc([400, 800], 0.1);
        else if (type === 'levelup') playOsc([500, 1000], 0.3);
    }
}

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toString();
}

function getVibesPerClick() {
    let bonus = 1;
    for (const id in state.upgrades) {
        const upgrade = UPGRADES.find(u => u.id == id);
        if (upgrade) bonus += state.upgrades[id] * upgrade.clickBonus;
    }
    
    // Prestige bonuses
    const skillBonus = 1 + (state.prestige.skills.clickMaster * 0.5);
    const comboBonus = state.combo.multiplier;
    
    return bonus * skillBonus * comboBonus;
}

function getVibesPerSecond() {
    let income = 0;
    for (const id in state.investments) {
        const investment = INVESTMENTS.find(i => i.id == id);
        if (investment) income += state.investments[id] * investment.income;
    }
    
    // Prestige bonuses
    const skillBonus = 1 + (state.prestige.skills.passiveIncome * 0.5);
    
    return income * skillBonus;
}

function performPrestige() {
    if (state.level < 50) {
        alert('Нужен как минимум 50 уровень для перерождения!');
        return;
    }
    
    const pointsToGain = Math.floor(state.level / 10);
    if (confirm(`Вы получите ${pointsToGain} Очков Харизмы. Весь прогресс (кроме достижений и навыков) будет сброшен. Продолжить?`)) {
        state.prestige.points += pointsToGain;
        state.prestige.totalPoints += pointsToGain;
        state.prestige.count++;
        
        // Reset progress
        state.vibes = 0;
        state.totalVibes = 0;
        state.loyalty = 0;
        state.level = 1;
        state.clicks = 0;
        state.upgrades = {};
        state.investments = {};
        
        saveGame();
        location.reload();
    }
}

function buySkill(skillId) {
    const costs = {
        clickMaster: 1,
        passiveIncome: 1,
        luck: 2
    };
    
    const cost = costs[skillId];
    if (state.prestige.points >= cost) {
        state.prestige.points -= cost;
        state.prestige.skills[skillId]++;
        playSound('buy');
        saveGame();
        updateUI();
    } else {
        alert('Недостаточно Очков Харизмы!');
    }
}

function updateUI() {
    vibesDisplay.textContent = formatNumber(state.vibes);
    vpcDisplay.textContent = formatNumber(getVibesPerClick());
    vpsDisplay.textContent = formatNumber(getVibesPerSecond());
    levelDisplay.textContent = state.level;
    
    const loyaltyPercent = (state.loyalty / LOYALTY_FOR_LEVEL_UP) * 100;
    loyaltyPercentDisplay.textContent = Math.floor(loyaltyPercent) + '%';
    loyaltyFill.style.width = loyaltyPercent + '%';

    // Update Prestige & Skills
    const prestigePointsEl = document.getElementById('prestige-points');
    if (prestigePointsEl) prestigePointsEl.textContent = state.prestige.points;
    
    const prestigeBtn = document.getElementById('prestige-btn');
    if (prestigeBtn) {
        prestigeBtn.disabled = state.level < 50;
        prestigeBtn.className = state.level >= 50 ? 'prestige-btn active' : 'prestige-btn';
    }

    for (const skillId in state.prestige.skills) {
        const el = document.getElementById(`skill-${skillId}-lvl`);
        if (el) el.textContent = state.prestige.skills[skillId];
    }
    
    // Проверяем, что индекс фото в пределах массива
    if (state.currentPhotoIndex >= PHOTOS.length) {
        state.currentPhotoIndex = state.currentPhotoIndex % PHOTOS.length;
    }
    altushkaImg.src = PHOTOS[state.currentPhotoIndex];
    
    renderShop();
    if (window.renderAchievements) window.renderAchievements(state);
    updateStatsUI();
}

function updateStatsUI() {
    if (!statTotalClicks) return;
    statTotalClicks.textContent = formatNumber(state.clicks);
    statTotalVibes.textContent = formatNumber(state.totalVibes);
    statLevel.textContent = state.level;
    statUpgrades.textContent = Object.values(state.upgrades).reduce((a, b) => a + b, 0);
    statInvestments.textContent = Object.values(state.investments).reduce((a, b) => a + b, 0);
    statAchievements.textContent = state.achievements?.length || 0;
    
    const hours = Math.floor(state.stats.timePlayed / 3600);
    const mins = Math.floor((state.stats.timePlayed % 3600) / 60);
    const secs = state.stats.timePlayed % 60;
    statTime.textContent = `${hours > 0 ? hours + 'ч ' : ''}${mins > 0 ? mins + 'м ' : ''}${secs}с`;

    // Update Rank
    if (profileRank) {
        let rank = 'Новичок';
        if (state.level >= 50) rank = 'Легенда';
        else if (state.level >= 30) rank = 'Мастер';
        else if (state.level >= 20) rank = 'Профи';
        else if (state.level >= 10) rank = 'Опытный';
        else if (state.level >= 5) rank = 'Любитель';
        profileRank.textContent = rank;
    }
}

function renderShop() {
    upgradesList.innerHTML = '';
    UPGRADES.forEach(upgrade => {
        const level = state.upgrades[upgrade.id] || 0;
        const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
        const canAfford = state.vibes >= cost;
        
        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? '' : 'disabled'}`;
        item.innerHTML = `
            <div class="item-icon">${upgrade.icon}</div>
            <div class="item-info">
                <span class="item-name">${upgrade.name} <span class="item-level">Lvl ${level}</span></span>
                <span class="item-desc">+${upgrade.clickBonus} за клик</span>
            </div>
            <div class="item-cost">${formatNumber(cost)}</div>
        `;
        item.onclick = () => buyUpgrade(upgrade.id);
        upgradesList.appendChild(item);
    });

    investmentsList.innerHTML = '';
    INVESTMENTS.forEach(inv => {
        const level = state.investments[inv.id] || 0;
        const cost = Math.floor(inv.baseCost * Math.pow(1.15, level));
        const canAfford = state.vibes >= cost;
        
        const item = document.createElement('div');
        item.className = `shop-item ${canAfford ? '' : 'disabled'}`;
        item.innerHTML = `
            <div class="item-icon">${inv.icon}</div>
            <div class="item-info">
                <span class="item-name">${inv.name} <span class="item-level">Lvl ${level}</span></span>
                <span class="item-desc">+${inv.income.toFixed(1)} в сек</span>
            </div>
            <div class="item-cost">${formatNumber(cost)}</div>
        `;
        item.onclick = () => buyInvestment(inv.id);
        investmentsList.appendChild(item);
    });
}

function buyUpgrade(id) {
    const upgrade = UPGRADES.find(u => u.id === id);
    const level = state.upgrades[id] || 0;
    const cost = Math.floor(upgrade.baseCost * Math.pow(1.15, level));
    
    if (state.vibes >= cost) {
        state.vibes -= cost;
        state.upgrades[id] = level + 1;
        playSound('buy');
        saveGame();
        updateUI();
    }
}

function buyInvestment(id) {
    const inv = INVESTMENTS.find(i => i.id === id);
    const level = state.investments[id] || 0;
    const cost = Math.floor(inv.baseCost * Math.pow(1.15, level));
    
    if (state.vibes >= cost) {
        state.vibes -= cost;
        state.investments[id] = level + 1;
        playSound('buy');
        saveGame();
        updateUI();
    }
}

function createFloatingNumber(x, y, val) {
    if (state.settings && !state.settings.numbers) return;
    const el = document.createElement('div');
    el.className = 'floating-number';
    el.textContent = '+' + formatNumber(val);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    floatingNumbersContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

function createParticles(x, y) {
    if (state.settings && !state.settings.particles) return;
    for (let i = 0; i < 8; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 10 + 5;
        p.style.width = size + 'px';
        p.style.height = size + 'px';
        p.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        p.style.left = x + 'px';
        p.style.top = y + 'px';
        
        const dx = (Math.random() - 0.5) * 200;
        const dy = (Math.random() - 0.5) * 200;
        p.style.setProperty('--dx', dx + 'px');
        p.style.setProperty('--dy', dy + 'px');
        
        floatingNumbersContainer.appendChild(p);
        setTimeout(() => p.remove(), 600);
    }
}

function addClickAnimation() {
    clickButton.style.transform = 'scale(0.95)';
    setTimeout(() => {
        clickButton.style.transform = 'scale(1)';
    }, 100);
}

function updateCombo() {
    const now = Date.now();
    const diff = now - state.combo.lastClick;
    
    if (diff < 1000) {
        state.combo.value = Math.min(state.combo.value + 2, 100);
    } else {
        state.combo.value = Math.max(state.combo.value - 1, 0);
    }
    
    state.combo.multiplier = 1 + Math.floor(state.combo.value / 20);
    
    const comboFill = document.getElementById('combo-fill');
    const comboText = document.getElementById('combo-text');
    if (comboFill) comboFill.style.width = state.combo.value + '%';
    if (comboText) comboText.textContent = 'x' + state.combo.multiplier;
    
    if (state.combo.value >= 100) {
        document.getElementById('combo-meter').classList.add('frenzy');
        document.getElementById('altushka-img').style.filter = `hue-rotate(${now % 360}deg) brightness(1.2)`;
    } else {
        document.getElementById('combo-meter').classList.remove('frenzy');
        document.getElementById('altushka-img').style.filter = 'none';
    }
}

function spawnGoldenAltushka() {
    const golden = document.createElement('div');
    golden.className = 'golden-altushka';
    golden.innerHTML = '✨👧✨';
    golden.style.left = Math.random() * 80 + 10 + '%';
    golden.style.top = Math.random() * 80 + 10 + '%';
    
    golden.onclick = () => {
        const bonus = getVibesPerSecond() * 60 + 1000;
        state.vibes += bonus;
        state.totalVibes += bonus;
        createFloatingNumber(window.innerWidth/2, window.innerHeight/2, bonus);
        golden.remove();
        playSound('levelup');
    };
    
    document.body.appendChild(golden);
    setTimeout(() => golden.remove(), 5000);
}

clickButton.onclick = (e) => {
    initAudio();
    
    // Luck check
    let multiplier = 1;
    if (state.prestige.skills.luck > 0) {
        if (Math.random() < (state.prestige.skills.luck * 0.05)) {
            multiplier = 10;
        }
    }

    const vpc = getVibesPerClick() * multiplier;
    state.vibes += vpc;
    state.totalVibes += vpc;
    state.clicks++;
    state.loyalty += LOYALTY_PER_CLICK;
    
    state.combo.lastClick = Date.now();
    updateCombo();
    
    if (state.loyalty >= LOYALTY_FOR_LEVEL_UP) {
        state.loyalty %= LOYALTY_FOR_LEVEL_UP;
        state.level++;
        state.currentPhotoIndex = (state.currentPhotoIndex + 1) % PHOTOS.length;
        playSound('levelup');
        addClickAnimation();
    } else {
        playSound('click');
        addClickAnimation();
    }
    
    const rect = clickButton.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    createFloatingNumber(x, y, vpc);
    createParticles(x, y);
    
    if (window.checkAchievements) window.checkAchievements(state);
    updateUI();
    saveGame();
};

// Game loop (1s)
setInterval(() => {
    state.stats.timePlayed++;
    
    // Combo decay
    if (Date.now() - state.combo.lastClick > 1000) {
        updateCombo();
    }

    // Random events
    if (Math.random() < 0.01) { // 1% chance every second
        spawnGoldenAltushka();
    }

    const vps = getVibesPerSecond();
    if (vps > 0) {
        state.vibes += vps;
        state.totalVibes += vps;
        
        // Loyalty also grows slowly from auto-clicks
        state.loyalty += (vps * LOYALTY_PER_CLICK) / 10;
        if (state.loyalty >= LOYALTY_FOR_LEVEL_UP) {
            state.loyalty %= LOYALTY_FOR_LEVEL_UP;
            state.level++;
            state.currentPhotoIndex = (state.currentPhotoIndex + 1) % PHOTOS.length;
        }
        
        if (window.checkAchievements) window.checkAchievements(state);
        updateUI();
        saveGame();
    }
}, 1000);

// Tabs
tabBtns.forEach(btn => {
    btn.onclick = () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab + '-tab').classList.add('active');
    };
});

// Modal Logic
openSettingsBtn.onclick = () => settingsModal.style.display = 'block';
closeSettingsBtn.onclick = () => settingsModal.style.display = 'none';
window.onclick = (e) => {
    if (e.target === settingsModal) settingsModal.style.display = 'none';
};

// Theme
themeSelect.onchange = (e) => {
    state.theme = e.target.value;
    document.body.className = state.theme;
    saveGame();
};

// Settings Handlers
volumeControl.oninput = (e) => {
    state.settings.volume = e.target.value;
    saveGame();
};

particlesToggle.onchange = (e) => {
    state.settings.particles = e.target.checked;
    saveGame();
};

numbersToggle.onchange = (e) => {
    state.settings.numbers = e.target.checked;
    saveGame();
};

soundSetSelect.onchange = (e) => {
    state.settings.soundSet = e.target.value;
    saveGame();
};

const PROMOS = {
    'MANUS': { vibes: 5000, desc: 'Подарок от Manus!' },
    'ALTUSHKA': { vibes: 1000, desc: 'Бонус для новичков' },
    'BEBRA': { vibes: 228, desc: 'Чисто на чил' }
};

applyPromoBtn.onclick = () => {
    const code = promoInput.value.toUpperCase();
    if (state.stats.usedPromos.includes(code)) {
        alert('Вы уже использовали этот код!');
        return;
    }
    if (PROMOS[code]) {
        state.vibes += PROMOS[code].vibes;
        state.totalVibes += PROMOS[code].vibes;
        state.stats.usedPromos.push(code);
        alert(`Успешно! ${PROMOS[code].desc}: +${PROMOS[code].vibes} вайбов`);
        promoInput.value = '';
        updateUI();
        saveGame();
    } else {
        alert('Неверный промокод!');
    }
};

exportBtn.onclick = () => {
    const data = btoa(JSON.stringify(state));
    navigator.clipboard.writeText(data).then(() => {
        alert('Код сохранения скопирован в буфер обмена!');
    });
};

importBtn.onclick = () => {
    const code = prompt('Вставьте код сохранения:');
    if (code) {
        try {
            const decoded = JSON.parse(atob(code));
            state = decoded;
            saveGame();
            location.reload();
        } catch (e) {
            alert('Ошибка при импорте!');
        }
    }
};

// Reset
resetBtn.onclick = () => {
    if (confirm('Вы уверены? Это удалит весь прогресс!')) {
        localStorage.removeItem('altushka_save');
        location.reload();
    }
};

function saveGame() {
    localStorage.setItem('altushka_save', JSON.stringify(state));
}

function loadGame() {
    const saved = localStorage.getItem('altushka_save');
    if (saved) {
        const loadedState = JSON.parse(saved);
        // Deep merge for settings and stats
        state = { 
            ...state, 
            ...loadedState,
            settings: { ...state.settings, ...loadedState.settings },
            stats: { ...state.stats, ...loadedState.stats }
        };
        document.body.className = state.theme;
        if (themeSelect) themeSelect.value = state.theme;
        
        // Update UI elements to match state
        if (volumeControl) volumeControl.value = state.settings.volume;
        if (particlesToggle) particlesToggle.checked = state.settings.particles;
        if (numbersToggle) numbersToggle.checked = state.settings.numbers;
        if (soundSetSelect) soundSetSelect.value = state.settings.soundSet || 'classic';
    }
    updateUI();
}

loadGame();
