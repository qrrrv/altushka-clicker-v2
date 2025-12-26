const SpaceShooterGame = {
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    score: 0,
    level: 1,
    
    player: {
        x: 0,
        y: 0,
        width: 40,
        height: 40,
        shield: 0
    },
    
    bullets: [],
    enemies: [],
    powerups: [],
    particles: [],
    
    lastEnemySpawn: 0,
    lastShoot: 0,
    shootDelay: 300,
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.level = 1;
        this.bullets = [];
        this.enemies = [];
        this.powerups = [];
        this.particles = [];
        this.shootDelay = 300;
        this.player.shield = 0;
        
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
        GameEngine.endGame(this.score, 20 + (this.level * 5));
    },
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color
            });
        }
    },
    
    spawnEnemy() {
        const now = Date.now();
        // Difficulty increases with level
        const spawnRate = Math.max(150, 1000 - (this.score / 2) - (this.level * 100));
        if (now - this.lastEnemySpawn > spawnRate) {
            const type = Math.random() < (0.1 * this.level) ? 'fast' : 'normal';
            this.enemies.push({
                x: Math.random() * (this.canvas.width - 30) + 15,
                y: -30,
                width: 30,
                height: 30,
                type: type,
                speed: (type === 'fast' ? 5 : 2) + Math.random() * 2 + (this.score / 1000) + (this.level * 0.5),
                hp: type === 'fast' ? 1 : Math.floor(1 + this.level / 3)
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
                speed: 10
            });
            this.lastShoot = now;
            if (typeof playSound === 'function') playSound('click');
        }
    },
    
    update() {
        this.shoot();
        this.spawnEnemy();
        
        // Level up logic
        const nextLevelScore = this.level * 1000;
        if (this.score >= nextLevelScore) {
            this.level++;
            if (typeof playSound === 'function') playSound('buy');
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
        
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
                if (this.player.shield > 0) {
                    this.player.shield--;
                    this.enemies.splice(i, 1);
                    this.createExplosion(e.x, e.y, '#f43f5e');
                    continue;
                } else {
                    this.stop();
                    return;
                }
            }
            
            // Collision with bullets
            for (let j = this.bullets.length - 1; j >= 0; j--) {
                const b = this.bullets[j];
                const bdx = e.x - b.x;
                const bdy = e.y - b.y;
                const bdist = Math.sqrt(bdx * bdx + bdy * bdy);
                if (bdist < 20) {
                    e.hp--;
                    this.bullets.splice(j, 1);
                    if (e.hp <= 0) {
                        this.createExplosion(e.x, e.y, '#f43f5e');
                        this.enemies.splice(i, 1);
                        this.score += 10 * this.level;
                        GameEngine.updateScore(this.score);
                        
                        // Spawn powerup
                        if (Math.random() < 0.15) {
                            const types = ['speed', 'shield'];
                            this.powerups.push({
                                x: e.x,
                                y: e.y,
                                radius: 12,
                                type: types[Math.floor(Math.random() * types.length)]
                            });
                        }
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
                if (p.type === 'speed') {
                    this.shootDelay = Math.max(60, this.shootDelay - 40);
                } else if (p.type === 'shield') {
                    this.player.shield = Math.min(3, this.player.shield + 1);
                }
                this.powerups.splice(i, 1);
                if (typeof playSound === 'function') playSound('buy');
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
        for(let i=0; i<30; i++) {
            const x = (Math.sin(Date.now() * 0.001 + i * 5) * 0.5 + 0.5) * this.canvas.width;
            const y = ((Date.now() * (0.1 + (i%5)*0.05) + i * 100) % this.canvas.height);
            this.ctx.fillRect(x, y, 1 + i%3, 1 + i%3);
        }
        
        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
        });
        this.ctx.globalAlpha = 1.0;
        
        // Player Shield
        if (this.player.shield > 0) {
            this.ctx.strokeStyle = '#38bdf8';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(this.player.x, this.player.y, 35, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.globalAlpha = 0.2;
            this.ctx.fillStyle = '#38bdf8';
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
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
        this.enemies.forEach(e => {
            this.ctx.fillStyle = e.type === 'fast' ? '#f97316' : '#f43f5e';
            this.ctx.beginPath();
            this.ctx.moveTo(e.x, e.y + 15);
            this.ctx.lineTo(e.x - 15, e.y - 15);
            this.ctx.lineTo(e.x + 15, e.y - 15);
            this.ctx.closePath();
            this.ctx.fill();
            
            // HP bar for tough enemies
            if (e.hp > 1) {
                this.ctx.fillStyle = '#4ade80';
                this.ctx.fillRect(e.x - 15, e.y - 25, 30 * (e.hp / Math.floor(1 + this.level / 3)), 4);
            }
        });
        
        // Powerups
        this.powerups.forEach(p => {
            this.ctx.fillStyle = p.type === 'speed' ? '#4ade80' : '#38bdf8';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(p.type === 'speed' ? '⚡' : '🛡️', p.x, p.y + 4);
        });
        
        // Level Display
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Уровень: ${this.level}`, 20, 40);
    },
    
    loop() {
        if (!this.active) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
};
