const FlappyGame = {
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    score: 0,
    
    bird: {
        x: 50,
        y: 150,
        velocity: 0,
        gravity: 0.25,
        jump: -5,
        radius: 15
    },
    
    pipes: [],
    pipeWidth: 50,
    pipeGap: 120,
    pipeSpeed: 2,
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.pipes = [];
        this.bird.y = 150;
        this.bird.velocity = 0;
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        this.canvas.width = area.clientWidth;
        this.canvas.height = area.clientHeight;
        area.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.onclick = () => this.bird.velocity = this.bird.jump;
        
        this.loop();
    },
    
    stop() {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animationId);
        GameEngine.endGame(this.score, 25);
    },
    
    update() {
        this.bird.velocity += this.bird.gravity;
        this.bird.y += this.bird.velocity;
        
        if (this.bird.y + this.bird.radius > this.canvas.height || this.bird.y - this.bird.radius < 0) {
            this.stop();
        }
        
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 200) {
            const h = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({ x: this.canvas.width, top: h });
        }
        
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const p = this.pipes[i];
            p.x -= this.pipeSpeed;
            
            if (p.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
                this.score++;
                GameEngine.updateScore(this.score);
                playSound('buy');
            }
            
            // Collision
            if (this.bird.x + this.bird.radius > p.x && this.bird.x - this.bird.radius < p.x + this.pipeWidth) {
                if (this.bird.y - this.bird.radius < p.top || this.bird.y + this.bird.radius > p.top + this.pipeGap) {
                    this.stop();
                }
            }
        }
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#70c5ce';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#f472b6';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#4ade80';
        this.pipes.forEach(p => {
            this.ctx.fillRect(p.x, 0, this.pipeWidth, p.top);
            this.ctx.fillRect(p.x, p.top + this.pipeGap, this.pipeWidth, this.canvas.height);
        });
    },
    
    loop() {
        if (!this.active) return;
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.loop());
    }
};
