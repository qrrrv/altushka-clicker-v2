const GameEngine = {
    activeGame: null,
    
    init() {
        const backBtn = document.getElementById('back-to-menu');
        if (backBtn) {
            backBtn.onclick = () => this.showMenu();
        }
    },
    
    showMenu() {
        if (this.activeGame && this.activeGame.stop) {
            this.activeGame.stop();
        }
        document.getElementById('game-selection').style.display = 'block';
        document.getElementById('game-container').style.display = 'none';
        document.getElementById('minigame-area').innerHTML = '';
        this.activeGame = null;
    },
    
    start(gameId) {
        document.getElementById('game-selection').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
        
        const area = document.getElementById('minigame-area');
        area.innerHTML = '';
        
        const title = document.getElementById('current-game-title');
        
        if (gameId === 'catch_heart') {
            title.textContent = 'Поймай Альтушку';
            this.activeGame = CatchHeartGame;
        } else if (gameId === 'mountain_car') {
            title.textContent = 'Горная Машина';
            this.activeGame = MountainCarGame;
        } else if (gameId === 'space_shooter') {
            title.textContent = 'Космический Бой';
            this.activeGame = SpaceShooterGame;
        } else if (gameId === 'flappy') {
            title.textContent = 'Летающая Альтушка';
            this.activeGame = FlappyGame;
        }
        
        if (this.activeGame && this.activeGame.start) {
            this.activeGame.start(area);
        }
    },
    
    updateScore(score) {
        const scoreEl = document.getElementById('minigame-score');
        if (scoreEl) scoreEl.textContent = score;
    },
    
    updateTimer(time) {
        const timerEl = document.getElementById('minigame-timer');
        if (timerEl) timerEl.textContent = time;
    },
    
    endGame(score, bonusMultiplier = 10) {
        const bonus = Math.floor(score * (getVibesPerSecond() * bonusMultiplier + 100));
        state.vibes += bonus;
        state.totalVibes += bonus;
        
        alert(`Игра окончена! Ваш счет: ${score}. Вы заработали ${formatNumber(bonus)} вайбов!`);
        
        updateUI();
        saveGame();
        this.showMenu();
    }
};

function selectGame(gameId) {
    GameEngine.start(gameId);
}

// Initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => GameEngine.init());
} else {
    GameEngine.init();
}
