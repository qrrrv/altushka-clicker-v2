const MemoryMatchGame = {
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    score: 0,
    
    cards: [],
    selected: [],
    matched: 0,
    gridSize: 4, // 4x4
    cardSize: 80,
    padding: 10,
    
    icons: ['❤️', '⭐', '🔥', '⚡', '💎', '🍀', '🌸', '🐱'],
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.matched = 0;
        this.selected = [];
        this.cards = [];
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        this.canvas.width = area.clientWidth;
        this.canvas.height = area.clientHeight;
        area.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.initCards();
        
        this.canvas.onclick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.handleClick(x, y);
        };
        
        this.loop();
    },
    
    initCards() {
        const pairs = [...this.icons, ...this.icons];
        pairs.sort(() => Math.random() - 0.5);
        
        const startX = (this.canvas.width - (this.gridSize * (this.cardSize + this.padding))) / 2;
        const startY = (this.canvas.height - (this.gridSize * (this.cardSize + this.padding))) / 2;
        
        for (let i = 0; i < pairs.length; i++) {
            const row = Math.floor(i / this.gridSize);
            const col = i % this.gridSize;
            this.cards.push({
                icon: pairs[i],
                x: startX + col * (this.cardSize + this.padding),
                y: startY + row * (this.cardSize + this.padding),
                flipped: false,
                matched: false
            });
        }
    },
    
    handleClick(x, y) {
        if (this.selected.length >= 2) return;
        
        for (let card of this.cards) {
            if (!card.flipped && !card.matched &&
                x > card.x && x < card.x + this.cardSize &&
                y > card.y && y < card.y + this.cardSize) {
                
                card.flipped = true;
                this.selected.push(card);
                if (typeof playSound === 'function') playSound('click');
                
                if (this.selected.length === 2) {
                    setTimeout(() => this.checkMatch(), 500);
                }
                break;
            }
        }
    },
    
    checkMatch() {
        const [c1, c2] = this.selected;
        if (c1.icon === c2.icon) {
            c1.matched = true;
            c2.matched = true;
            this.matched += 2;
            this.score += 100;
            GameEngine.updateScore(this.score);
            if (typeof playSound === 'function') playSound('buy');
            
            if (this.matched === this.cards.length) {
                setTimeout(() => this.stop(), 1000);
            }
        } else {
            c1.flipped = false;
            c2.flipped = false;
        }
        this.selected = [];
    },
    
    stop() {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animationId);
        GameEngine.endGame(this.score, 50);
    },
    
    update() {
        // No continuous update needed for memory game
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let card of this.cards) {
            if (card.matched) {
                this.ctx.globalAlpha = 0.3;
            }
            
            if (card.flipped || card.matched) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(card.x, card.y, this.cardSize, this.cardSize);
                this.ctx.fillStyle = '#000000';
                this.ctx.font = '40px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(card.icon, card.x + this.cardSize/2, card.y + this.cardSize/2);
            } else {
                this.ctx.fillStyle = '#3b82f6';
                this.ctx.fillRect(card.x, card.y, this.cardSize, this.cardSize);
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(card.x, card.y, this.cardSize, this.cardSize);
            }
            this.ctx.globalAlpha = 1.0;
        }
    },
    
    loop() {
        if (!this.active) return;
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
};
