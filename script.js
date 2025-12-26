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
];

const INVESTMENTS = [
    { id: 1, name: 'Telegram канал', icon: '📱', baseCost: 150, income: 0.8 },
    { id: 2, name: 'VK паблик', icon: '🔵', baseCost: 350, income: 2 },
    { id: 3, name: 'TikTok аккаунт', icon: '🎵', baseCost: 700, income: 4.5 },
    { id: 4, name: 'YouTube канал', icon: '📺', baseCost: 1200, income: 9 },
    { id: 5, name: 'Twitch стрим', icon: '💜', baseCost: 2000, income: 17 },
    { id: 6, name: 'Интернет магазин', icon: '🛒', baseCost: 3500, income: 30 },
];

const LOYALTY_FOR_LEVEL_UP = 1500;
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
    theme: 'light'
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
const themeToggle = document.getElementById('theme-toggle');
const resetBtn = document.getElementById('reset-game');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Audio Context
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(type) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);

    if (type === 'click') {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'buy') {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'levelup') {
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
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
    return bonus;
}

function getVibesPerSecond() {
    let income = 0;
    for (const id in state.investments) {
        const investment = INVESTMENTS.find(i => i.id == id);
        if (investment) income += state.investments[id] * investment.income;
    }
    return income;
}

function updateUI() {
    vibesDisplay.textContent = formatNumber(state.vibes);
    vpcDisplay.textContent = formatNumber(getVibesPerClick());
    vpsDisplay.textContent = formatNumber(getVibesPerSecond());
    levelDisplay.textContent = state.level;
    
    const loyaltyPercent = (state.loyalty / LOYALTY_FOR_LEVEL_UP) * 100;
    loyaltyPercentDisplay.textContent = Math.floor(loyaltyPercent) + '%';
    loyaltyFill.style.width = loyaltyPercent + '%';
    
    altushkaImg.src = PHOTOS[state.currentPhotoIndex];
    
    renderShop();
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
                <span class="item-desc">+${inv.income} в сек</span>
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
    const el = document.createElement('div');
    el.className = 'floating-number';
    el.textContent = '+' + formatNumber(val);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    floatingNumbersContainer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

clickButton.onclick = (e) => {
    initAudio();
    const vpc = getVibesPerClick();
    state.vibes += vpc;
    state.totalVibes += vpc;
    state.clicks++;
    state.loyalty += LOYALTY_PER_CLICK;
    
    if (state.loyalty >= LOYALTY_FOR_LEVEL_UP) {
        state.loyalty %= LOYALTY_FOR_LEVEL_UP;
        state.level++;
        state.currentPhotoIndex = (state.currentPhotoIndex + 1) % PHOTOS.length;
        playSound('levelup');
    } else {
        playSound('click');
    }
    
    const rect = clickButton.getBoundingClientRect();
    createFloatingNumber(e.clientX - rect.left, e.clientY - rect.top, vpc);
    
    updateUI();
    saveGame();
};

// Auto-click loop
setInterval(() => {
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

// Theme
themeToggle.onclick = () => {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    document.body.className = state.theme;
    saveGame();
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
        state = { ...state, ...JSON.parse(saved) };
        document.body.className = state.theme;
    }
    updateUI();
}

loadGame();
