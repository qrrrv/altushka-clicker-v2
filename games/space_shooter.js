const SpaceShooterGame = {
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    score: 0,
    
    player: {
        x: 0,
        y: 0,
        width: 40,
        height: 40
    },
    
    bullets: [],
    enemies: [],
    powerups: [],
    
    lastEnemySpawn: 0,
    lastShoot: 0,
    shootDelay: 300,
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.shootDelay = 300;
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        this.canvas.width = area.clientWidth;
        this.canvas.height = area.clientHeight;
        area.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 60;
        
        this.mouseHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.player.x = e.clientX - rect.left;
            this.player.y = e.clientY - rect.top;
            
            // Keep player in bounds
            if (this.player.x < 20) this.player.x = 20;
            if (this.player.x > this.canvas.width - 20) this.player.x = this.canvas.width - 20;
            if (this.player.y < 20) this.player.y = 20;
            if (this.player.y > this.canvas.height - 20) this.player.y = this.canvas.height - 20;
        };
        
        this.canvas.addEventListener('mousemove', this.mouseHandler);
        
        this.loop();
    },
    
    stop() {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animationId);
        this.canvas.removeEventListener('mousemove', this.mouseHandler);
        GameEngine.endGame(this.score, 20);
    },
    
    spawnEnemy() {
        const now = Date.now();
        const spawnRate = Math.max(300, 1000 - this.score);
        if (now - this.lastEnemySpawn > spawnRate) {
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30) + 15,
                y: -30,
                width: 30,
                height: 30,
                speed: 2 + Math.random() * 2 + (this.score / 500)
            });
            this.lastEnemySpawn = now;
        }
    },
    
    shoot() {
        const now = Date.now();
        if (now - this.lastShoot > this.shootDelay) {
            this.bullets.push({
                x: this.player.x,
                y: this.player.y - 20,
                radius: 4,
                speed: 8
            });
            this.lastShoot = now;
            playSound('click');
        }
    },
    
    update() {
        this.shoot();
        this.spawnEnemy();
        
        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bullets[i].speed;
            if (this.bullets[i].y < -10) this.bullets.splice(i, 1);
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.y += e.speed;
            
            // Collision with player
            const dx = e.x - this.player.x;
            const dy = e.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 30) {
                this.stop();
                return;
            }
            
            // Collision with bullets
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const b = this.bullets[j];
                const bdx = e.x - b.x;
                const bdy = e.y - b.y;
                const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
                if (bdist < 20) {
                    this.enemies.splice(i, 1);
                    this.bullets.splice(j, 1);
                    this.score += 10;
                    GameEngine.updateScore(this.score);
                    
                    // Spawn powerup
                    if (Math.random() < 0.15) {
                        this.powerups.push({
                            x: e.x,
                            y: e.y,
                            radius: 12,
                            type: 'speed'
                        });
                    }
                    break;
                }
            }
            
            if (e.y > this.canvas.height + 30) this.enemies.splice(i, 1);
        }
        
        // Update powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            const p = this.powerups[i];
            p.y += 2;
            
            const dx = p.x - this.player.x;
            const dy = p.y - this.player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) {
                this.shootDelay = Math.max(80, this.shootDelay - 30);
                this.powerups.splice(i, 1);
                playSound('buy');
            } else if (p.y > this.canvas.height + 20) {
                this.powerups.splice(i, 1);
            }
        }
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = '#020617';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Stars
        this.ctx.fillStyle = 'white';
        for(let i=0; i<20; i++) {
            const x = (Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5) * this.canvas.width;
            const y = ((Date.now() * 0.1 + i * 100) % this.canvas.height);
            this.ctx.fillRect(x, y, 2, 2);
        }
        
        // Player
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x, this.player.y - 20);
        this.ctx.lineTo(this.player.x - 20, this.player.y + 20);
        this.ctx.lineTo(this.player.x + 20, this.player.y + 20);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#0ea5e9';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Bullets
        this.ctx.fillStyle = '#fbbf24';
        this.bullets.forEach(b => {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Enemies
        this.ctx.fillStyle = '#f43f5e';
        this.enemies.forEach(e => {
            this.ctx.beginPath();
            this.ctx.moveTo(e.x, e.y + 15);
            this.ctx.lineTo(e.x - 15, e.y - 15);
            this.ctx.lineTo(e.x + 15, e.y - 15);
            this.ctx.closePath();
            this.ctx.fill();
        });
        
        // Powerups
        this.powerups.forEach(p => {
            this.ctx.fillStyle = '#4ade80';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('⚡', p.x, p.y + 4);
        });
    },
    
    loop() {
        if (!this.active) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
};
