const CatchHeartGame = {
    active: false,
    score: 0,
    timeLeft: 30,
    interval: null,
    spawnTimeout: null,
    isFrozen: false,
    freezeTimeout: null,
    area: null,

    start(area) {
        this.active = true;
        this.score = 0;
        this.timeLeft = 30;
        this.isFrozen = false;
        this.area = area;
        
        GameEngine.updateScore(0);
        GameEngine.updateTimer(30);
        
        this.interval = setInterval(() => {
            if (!this.isFrozen) {
                this.timeLeft--;
                GameEngine.updateTimer(this.timeLeft);
                if (this.timeLeft <= 0) {
                    this.stop();
                }
            }
        }, 1000);
        
        this.spawnLoop();
    },

    stop() {
        if (!this.active) return;
        this.active = false;
        clearInterval(this.interval);
        clearTimeout(this.spawnTimeout);
        clearTimeout(this.freezeTimeout);
        this.area.style.boxShadow = '';
        this.area.style.backgroundColor = '';
        GameEngine.endGame(this.score, 15);
    },

    spawnLoop() {
        if (!this.active) return;
        
        if (!this.isFrozen) {
            const rand = Math.random();
            if (rand < 0.7) {
                this.spawn('heart');
            } else if (rand < 0.9) {
                this.spawn('bomb');
            } else {
                this.spawn('snowflake');
            }
        }
        
        const nextSpawn = this.isFrozen ? 100 : (Math.random() * 600 + 300);
        this.spawnTimeout = setTimeout(() => this.spawnLoop(), nextSpawn);
    },

    spawn(type) {
        const item = document.createElement('div');
        const areaRect = this.area.getBoundingClientRect();
        
        if (type === 'heart') {
            item.className = 'minigame-target';
            item.innerHTML = '💖';
            item.onclick = (e) => {
                e.stopPropagation();
                this.score++;
                GameEngine.updateScore(this.score);
                playSound('click');
                item.remove();
            };
        } else if (type === 'bomb') {
            item.className = 'minigame-bomb';
            item.innerHTML = '💣';
            item.onclick = (e) => {
                e.stopPropagation();
                this.score = 0;
                GameEngine.updateScore(this.score);
                this.area.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
                setTimeout(() => { if(this.active) this.area.style.backgroundColor = ''; }, 200);
                item.remove();
            };
        } else if (type === 'snowflake') {
            item.className = 'minigame-snowflake';
            item.innerHTML = '❄️';
            item.onclick = (e) => {
                e.stopPropagation();
                this.freeze();
                item.remove();
            };
        }
        
        const x = Math.random() * (areaRect.width - 50);
        const y = Math.random() * (areaRect.height - 50);
        
        item.style.left = x + 'px';
        item.style.top = y + 'px';
        
        this.area.appendChild(item);
        
        const duration = this.isFrozen ? 5000 : 1500;
        setTimeout(() => {
            if (item.parentNode) item.remove();
        }, duration);
    },

    freeze() {
        this.isFrozen = true;
        this.area.style.boxShadow = 'inset 0 0 50px #00f2ff';
        
        if (this.freezeTimeout) clearTimeout(this.freezeTimeout);
        
        this.freezeTimeout = setTimeout(() => {
            if (this.active) {
                this.isFrozen = false;
                this.area.style.boxShadow = '';
            }
        }, 3000);
    }
};
