const MountainCarGame = {
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    score: 0,
    
    player: {
        x: 100,
        y: 0,
        width: 30,
        height: 30,
        velocity: 0,
        gravity: 0.4,
        jump: -8,
        rotation: 0,
        mode: 'cube'
    },
    
    obstacles: [],
    particles: [],
    groundY: 0,
    speed: 5,
    distance: 0,
    level: 1,
    theme: {
        bg: '#4f46e5',
        ground: '#0f172a',
        accent: '#38bdf8'
    },
    
    themes: [
        { bg: '#4f46e5', ground: '#0f172a', accent: '#38bdf8' }, // Blue
        { bg: '#7c3aed', ground: '#2e1065', accent: '#c084fc' }, // Purple
        { bg: '#059669', ground: '#064e3b', accent: '#34d399' }, // Green
        { bg: '#dc2626', ground: '#450a0a', accent: '#f87171' }  // Red
    ],
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.distance = 0;
        this.speed = 5;
        this.level = 1;
        this.obstacles = [];
        this.particles = [];
        this.theme = this.themes[0];
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        this.canvas.width = area.clientWidth;
        this.canvas.height = area.clientHeight;
        area.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.groundY = this.canvas.height - 60;
        this.player.y = this.groundY - this.player.height;
        this.player.velocity = 0;
        this.player.rotation = 0;
        this.player.mode = 'cube';
        
        this.inputHandler = (e) => {
            if (e.type === 'keydown' && e.code !== 'Space') return;
            e.preventDefault();
            this.handleInput(true);
        };
        
        this.inputUpHandler = (e) => {
            if (e.type === 'keyup' && e.code !== 'Space') return;
            this.handleInput(false);
        };
        
        this.canvas.onmousedown = this.inputHandler;
        this.canvas.onmouseup = this.inputUpHandler;
        window.addEventListener('keydown', this.inputHandler);
        window.addEventListener('keyup', this.inputUpHandler);
        
        this.isPressing = false;
        this.loop();
    },
    
    handleInput(isDown) {
        this.isPressing = isDown;
        if (isDown && this.player.mode === 'cube' && this.player.y >= this.groundY - this.player.height - 5) {
            this.player.velocity = this.player.jump;
            if (typeof playSound === 'function') playSound('click');
        }
    },
    
    stop() {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.inputHandler);
        window.removeEventListener('keyup', this.inputUpHandler);
        GameEngine.endGame(Math.floor(this.score), 15);
    },
    
    spawnObstacle() {
        const minSpacing = 300 - (this.level * 20);
        if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].x < this.canvas.width - Math.max(150, minSpacing)) {
            const rand = Math.random();
            let type = 'spike';
            
            if (rand < 0.15) type = 'portal';
            else if (rand < 0.3) type = 'block';
            else if (rand < 0.4) type = 'double_spike';
            
            if (type === 'spike') {
                this.obstacles.push({ x: this.canvas.width + 50, y: this.groundY, width: 30, height: 30, type: 'spike' });
            } else if (type === 'double_spike') {
                this.obstacles.push({ x: this.canvas.width + 50, y: this.groundY, width: 60, height: 30, type: 'spike' });
            } else if (type === 'block') {
                this.obstacles.push({ x: this.canvas.width + 50, y: this.groundY - 30, width: 30, height: 30, type: 'block' });
            } else if (type === 'portal') {
                const portalY = this.player.mode === 'cube' ? this.groundY - 120 : this.groundY - 80;
                this.obstacles.push({ x: this.canvas.width + 50, y: portalY, width: 40, height: 80, type: 'portal' });
            }
        }
    },
    
    update() {
        this.distance += this.speed;
        this.score = this.distance / 100;
        GameEngine.updateScore(Math.floor(this.score));
        
        // Level up and theme change
        const newLevel = Math.floor(this.score / 50) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.theme = this.themes[this.level % this.themes.length];
            this.speed += 0.5;
        }
        
        // Mode specific physics
        if (this.player.mode === 'cube') {
            this.player.velocity += this.player.gravity;
            this.player.y += this.player.velocity;
            
            if (this.player.y > this.groundY - this.player.height) {
                this.player.y = this.groundY - this.player.height;
                this.player.velocity = 0;
                this.player.rotation = Math.round(this.player.rotation / (Math.PI/2)) * (Math.PI/2);
            } else {
                this.player.rotation += 0.15;
            }
        } else { // Ship mode
            if (this.isPressing) this.player.velocity -= 0.6;
            else this.player.velocity += 0.6;
            
            this.player.velocity *= 0.95;
            this.player.y += this.player.velocity;
            this.player.rotation = this.player.velocity * 0.05;
            
            if (this.player.y < 0) { this.player.y = 0; this.player.velocity = 0; }
            if (this.player.y > this.groundY - this.player.height) { this.player.y = this.groundY - this.player.height; this.player.velocity = 0; }
        }
        
        this.spawnObstacle();
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.x -= this.speed;
            
            // Precise collision detection
            const px = this.player.x + 2;
            const py = this.player.y + 2;
            const pw = this.player.width - 4;
            const ph = this.player.height - 4;
            
            // For spikes, we use a smaller triangle-based hitbox
            if (o.type === 'spike') {
                if (px < o.x + o.width && px + pw > o.x && py + ph > o.y - o.height) {
                    this.stop();
                    return;
                }
            } else if (o.type === 'block') {
                if (px < o.x + o.width && px + pw > o.x && py < o.y + o.height && py + ph > o.y) {
                    this.stop();
                    return;
                }
            } else if (o.type === 'portal') {
                if (px < o.x + o.width && px + pw > o.x && py < o.y + o.height && py + ph > o.y) {
                    this.player.mode = this.player.mode === 'cube' ? 'ship' : 'cube';
                    this.obstacles.splice(i, 1);
                    if (typeof playSound === 'function') playSound('buy');
                    continue;
                }
            }
            
            if (o.x < -100) this.obstacles.splice(i, 1);
        }
        
        if (Math.random() < 0.5) {
            this.particles.push({ x: this.player.x, y: this.player.y + this.player.height / 2, size: Math.random() * 5 + 2, life: 1.0 });
        }
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x -= this.speed * 0.5;
            p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.theme.bg);
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ground
        this.ctx.fillStyle = this.theme.ground;
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        this.ctx.strokeStyle = this.theme.accent;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, this.groundY, this.canvas.width, 2);
        
        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = this.theme.accent;
            this.ctx.fillRect(p.x, p.y, p.size, p.size);
        });
        this.ctx.globalAlpha = 1.0;
        
        // Obstacles
        this.obstacles.forEach(o => {
            if (o.type === 'spike') {
                this.ctx.fillStyle = '#f43f5e';
                this.ctx.beginPath();
                this.ctx.moveTo(o.x, o.y);
                this.ctx.lineTo(o.x + o.width / 2, o.y - o.height);
                this.ctx.lineTo(o.x + o.width, o.y);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.strokeStyle = 'white';
                this.ctx.stroke();
            } else if (o.type === 'block') {
                this.ctx.fillStyle = '#94a3b8';
                this.ctx.fillRect(o.x, o.y, o.width, o.height);
                this.ctx.strokeStyle = 'white';
                this.ctx.strokeRect(o.x, o.y, o.width, o.height);
            } else if (o.type === 'portal') {
                this.ctx.fillStyle = '#a855f7';
                this.ctx.beginPath();
                this.ctx.ellipse(o.x + o.width/2, o.y + o.height/2, o.width/2, o.height/2, 0, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.strokeStyle = 'white';
                this.ctx.stroke();
            }
        });
        
        // Player
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        this.ctx.rotate(this.player.rotation);
        
        if (this.player.mode === 'cube') {
            this.ctx.fillStyle = '#4ade80';
            this.ctx.fillRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(-this.player.width / 2, -this.player.height / 2, this.player.width, this.player.height);
        } else {
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.beginPath();
            this.ctx.moveTo(-15, 10);
            this.ctx.lineTo(15, 0);
            this.ctx.lineTo(-15, -10);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.stroke();
        }
        this.ctx.restore();
        
        // UI
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Уровень: ${this.level}`, 20, 40);
    },
    
    loop() {
        if (!this.active) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
};
