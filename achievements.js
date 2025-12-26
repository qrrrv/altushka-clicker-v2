const ACHIEVEMENTS = [
    { id: 'first_click', name: 'Первый шаг', desc: 'Сделать 1 клик', icon: '🖱️', condition: (s) => s.clicks >= 1 },
    { id: 'click_100', name: 'Кликер', desc: 'Сделать 100 кликов', icon: '⚡', condition: (s) => s.clicks >= 100 },
    { id: 'click_1000', name: 'Мастер клика', desc: 'Сделать 1000 кликов', icon: '🔥', condition: (s) => s.clicks >= 1000 },
    { id: 'vibes_1000', name: 'Первая тысяча', desc: 'Собрать 1,000 вайбов', icon: '💰', condition: (s) => s.totalVibes >= 1000 },
    { id: 'vibes_100k', name: 'Богач', desc: 'Собрать 100,000 вайбов', icon: '💎', condition: (s) => s.totalVibes >= 100000 },
    { id: 'level_5', name: 'Растущая популярность', desc: 'Достичь 5 уровня', icon: '📈', condition: (s) => s.level >= 5 },
    { id: 'level_10', name: 'Звезда', desc: 'Достичь 10 уровня', icon: '🌟', condition: (s) => s.level >= 10 },
    { id: 'upgrade_10', name: 'Техно-гик', desc: 'Купить 10 улучшений', icon: '🛠️', condition: (s) => Object.values(s.upgrades).reduce((a, b) => a + b, 0) >= 10 },
    { id: 'invest_5', name: 'Инвестор', desc: 'Купить 5 инвестиций', icon: '🏦', condition: (s) => Object.values(s.investments).reduce((a, b) => a + b, 0) >= 5 },
];

function checkAchievements(state) {
    if (!state.achievements) state.achievements = [];
    
    ACHIEVEMENTS.forEach(ach => {
        if (!state.achievements.includes(ach.id) && ach.condition(state)) {
            state.achievements.push(ach.id);
            showAchievementToast(ach);
        }
    });
}

function showAchievementToast(ach) {
    const toast = document.getElementById('achievement-toast');
    const icon = document.getElementById('toast-icon');
    const title = document.getElementById('toast-title');
    const desc = document.getElementById('toast-desc');
    
    icon.textContent = ach.icon;
    title.textContent = ach.name;
    desc.textContent = ach.desc;
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

function renderAchievements(state) {
    const list = document.getElementById('achievements-list');
    if (!list) return;
    
    list.innerHTML = '';
    ACHIEVEMENTS.forEach(ach => {
        const isUnlocked = state.achievements && state.achievements.includes(ach.id);
        const item = document.createElement('div');
        item.className = `shop-item ${isUnlocked ? '' : 'disabled'}`;
        item.style.cursor = 'default';
        item.innerHTML = `
            <div class="item-icon">${isUnlocked ? ach.icon : '❓'}</div>
            <div class="item-info">
                <span class="item-name">${isUnlocked ? ach.name : '???'}</span>
                <span class="item-desc">${ach.desc}</span>
            </div>
        `;
        list.appendChild(item);
    });
}

window.checkAchievements = checkAchievements;
window.renderAchievements = renderAchievements;
