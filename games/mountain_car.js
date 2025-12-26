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
        mode: 'cube' // 'cube' or 'ship'
    },
    
    obstacles: [],
    particles: [],
    groundY: 0,
    speed: 5,
    distance: 0,
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.distance = 0;
        this.speed = 5;
        this.obstacles = [];
        this.particles = [];
        
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
        if (isDown && this.player.mode === 'cube' && this.player.y >= this.groundY - this.player.height - 2) {
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
        GameEngine.endGame(Math.floor(this.score), 10);
    },
    
    spawnObstacle() {
        if (this.obstacles.length === 0 || this.obstacles[this.obstacles.length - 1].x < this.canvas.width - 300) {
            const type = Math.random() < 0.3 ? 'portal' : 'spike';
            if (type === 'spike') {
                this.obstacles.push({
                    x: this.canvas.width + 100,
                    y: this.groundY,
                    width: 30,
                    height: 30,
                    type: 'spike'
                });
            } else {
                this.obstacles.push({
                    x: this.canvas.width + 100,
                    y: this.groundY - 100,
                    width: 40,
                    height: 80,
                    type: 'portal'
                });
            }
        }
    },
    
    update() {
        this.distance += this.speed;
        this.score = this.distance / 100;
        GameEngine.updateScore(Math.floor(this.score));
        
        // Mode specific physics
        if (this.player.mode === 'cube') {
            this.player.velocity += this.player.gravity;
            this.player.y += this.player.velocity;
            
            if (this.player.y > this.groundY - this.player.height) {
                this.player.y = this.groundY - this.player.height;
                this.player.velocity = 0;
                // Snap rotation to 90 degrees
                this.player.rotation = Math.round(this.player.rotation / (Math.PI/2)) * (Math.PI/2);
            } else {
                this.player.rotation += 0.15;
            }
        } else { // Ship mode
            if (this.isPressing) {
                this.player.velocity -= 0.5;
            } else {
                this.player.velocity += 0.5;
            }
            this.player.velocity *= 0.95; // Damping
            this.player.y += this.player.velocity;
            this.player.rotation = this.player.velocity * 0.05;
            
            if (this.player.y < 0) {
                this.player.y = 0;
                this.player.velocity = 0;
            }
            if (this.player.y > this.groundY - this.player.height) {
                this.player.y = this.groundY - this.player.height;
                this.player.velocity = 0;
            }
        }
        
        // Spawn and update obstacles
        this.spawnObstacle();
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const o = this.obstacles[i];
            o.x -= this.speed;
            
            // Collision detection
            if (this.player.x < o.x + o.width &&
                this.player.x + this.player.width > o.x &&
                this.player.y < o.y + o.height &&
                this.player.y + this.player.height > o.y) {
                
                if (o.type === 'spike') {
                    this.stop();
                    return;
                } else if (o.type === 'portal') {
                    this.player.mode = this.player.mode === 'cube' ? 'ship' : 'cube';
                    this.obstacles.splice(i, 1);
                    if (typeof playSound === 'function') playSound('buy');
                    continue;
                }
            }
            
            if (o.x < -100) this.obstacles.splice(i, 1);
        }
        
        // Particles for trail
        if (Math.random() < 0.5) {
            this.particles.push({
                x: this.player.x,
                y: this.player.y + this.player.height / 2,
                size: Math.random() * 5 + 2,
                life: 1.0
            });
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x -= this.speed * 0.5;
            p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
        
        this.speed += 0.001;
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#4f46e5');
        gradient.addColorStop(1, '#1e1b4b');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Ground
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, this.groundY, this.canvas.width, 2);
        
        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = '#38bdf8';
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
            // Eyes
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(2, -8, 4, 4);
            this.ctx.fillRect(8, -8, 4, 4);
        } else {
            // Ship
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
    },
    
    loop() {
        if (!this.active) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
};
