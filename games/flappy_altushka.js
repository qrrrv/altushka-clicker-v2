const FlappyGame = {
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    score: 0,
    
    bird: {
        x: 80,
        y: 150,
        velocity: 0,
        gravity: 0.3,
        jump: -6,
        radius: 18,
        rotation: 0
    },
    
    pipes: [],
    particles: [],
    pipeWidth: 60,
    pipeGap: 140,
    pipeSpeed: 3,
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.pipes = [];
        this.particles = [];
        this.bird.y = 150;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        this.pipeSpeed = 3;
        this.pipeGap = 140;
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        this.canvas.width = area.clientWidth;
        this.canvas.height = area.clientHeight;
        area.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        // Improved input handling
        this.inputHandler = (e) => {
            if (e.type === 'keydown' && e.code !== 'Space') return;
            e.preventDefault();
            this.jump();
        };
        
        this.canvas.onmousedown = this.inputHandler;
        window.addEventListener('keydown', this.inputHandler);
        
        this.loop();
    },
    
    jump() {
        if (this.active) {
            this.bird.velocity = this.bird.jump;
            if (typeof playSound === 'function') playSound('click');
            
            // Add some particles on jump
            for(let i=0; i<5; i++) {
                this.particles.push({
                    x: this.bird.x,
                    y: this.bird.y,
                    vx: -2 - Math.random() * 2,
                    vy: (Math.random() - 0.5) * 4,
                    life: 1.0,
                    size: Math.random() * 4 + 2
                });
            }
        }
    },
    
    stop() {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.inputHandler);
        GameEngine.endGame(this.score, 25);
    },
    
    update() {
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        this.bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.bird.velocity * 0.1));
        
        if (this.bird.y + this.bird.radius > this.canvas.height || this.bird.y - this.bird.radius < 0) {
            this.stop();
            return;
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.05;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
        
        // Spawn pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 250) {
            const minH = 50;
            const maxH = this.canvas.height - this.pipeGap - 50;
            const h = Math.random() * (maxH - minH) + minH;
            this.pipes.push({ x: this.canvas.width, top: h, passed: false });
        }
        
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const p = this.pipes[i];
            p.x -= this.pipeSpeed;
            
            // Score counting
            if (!p.passed && p.x + this.pipeWidth < this.bird.x) {
                p.passed = true;
                this.score++;
                GameEngine.updateScore(this.score);
                if (typeof playSound === 'function') playSound('buy');
                
                // Increase difficulty
                this.pipeSpeed += 0.1;
                this.pipeGap = Math.max(100, this.pipeGap - 1);
            }
            
            if (p.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
            
            // Collision
            const bx = this.bird.x;
            const by = this.bird.y;
            const br = this.bird.radius - 4; // Slightly smaller hitbox for fairness
            
            if (bx + br > p.x && bx - br < p.x + this.pipeWidth) {
                if (by - br < p.top || by + br > p.top + this.pipeGap) {
                    this.stop();
                    return;
                }
            }
        }
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Sky background with gradient
        const sky = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        sky.addColorStop(0, '#70c5ce');
        sky.addColorStop(1, '#94e2eb');
        this.ctx.fillStyle = sky;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw clouds (simple)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for(let i=0; i<5; i++) {
            const x = (Date.now() * 0.02 + i * 200) % (this.canvas.width + 100) - 50;
            this.ctx.beginPath();
            this.ctx.arc(x, 50 + i * 30, 20, 0, Math.PI * 2);
            this.ctx.arc(x + 15, 50 + i * 30, 15, 0, Math.PI * 2);
            this.ctx.arc(x - 15, 50 + i * 30, 15, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Particles
        this.particles.forEach(p => {
            this.ctx.globalAlpha = p.life;
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1.0;
        
        // Pipes
        this.pipes.forEach(p => {
            // Main pipe body
            const grad = this.ctx.createLinearGradient(p.x, 0, p.x + this.pipeWidth, 0);
            grad.addColorStop(0, '#22c55e');
            grad.addColorStop(0.5, '#4ade80');
            grad.addColorStop(1, '#16a34a');
            this.ctx.fillStyle = grad;
            
            // Top pipe
            this.ctx.fillRect(p.x, 0, this.pipeWidth, p.top);
            this.ctx.strokeStyle = '#14532d';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(p.x, 0, this.pipeWidth, p.top);
            
            // Bottom pipe
            this.ctx.fillRect(p.x, p.top + this.pipeGap, this.pipeWidth, this.canvas.height - (p.top + this.pipeGap));
            this.ctx.strokeRect(p.x, p.top + this.pipeGap, this.pipeWidth, this.canvas.height - (p.top + this.pipeGap));
            
            // Pipe caps
            this.ctx.fillStyle = '#16a34a';
            this.ctx.fillRect(p.x - 5, p.top - 20, this.pipeWidth + 10, 20);
            this.ctx.strokeRect(p.x - 5, p.top - 20, this.pipeWidth + 10, 20);
            this.ctx.fillRect(p.x - 5, p.top + this.pipeGap, this.pipeWidth + 10, 20);
            this.ctx.strokeRect(p.x - 5, p.top + this.pipeGap, this.pipeWidth + 10, 20);
        });
        
        // Bird (Altushka)
        this.ctx.save();
        this.ctx.translate(this.bird.x, this.bird.y);
        this.ctx.rotate(this.bird.rotation);
        
        // Body
        this.ctx.fillStyle = '#f472b6';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#db2777';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Eye
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(8, -5, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(10, -5, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Beak
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(25, 5);
        this.ctx.lineTo(15, 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.restore();
    },
    
    loop() {
        if (!this.active) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
};
