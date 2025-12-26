const MountainCarGame = {
    active: false,
    canvas: null,
    ctx: null,
    animationId: null,
    score: 0,
    
    car: {
        x: 100,
        y: 0,
        width: 40,
        height: 20,
        rotation: 0,
        velocity: 0,
        rotationVelocity: 0
    },
    
    terrain: [],
    offset: 0,
    speed: 2,
    
    start(area) {
        this.active = true;
        this.score = 0;
        this.offset = 0;
        this.speed = 2;
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        this.canvas.width = area.clientWidth;
        this.canvas.height = area.clientHeight;
        area.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.generateTerrain();
        this.car.y = this.getTerrainHeight(this.car.x) - 20;
        this.car.rotation = 0;
        this.car.velocity = 0;
        this.car.rotationVelocity = 0;
        
        // Use both click and space for jump
        this.canvas.onclick = (e) => {
            e.preventDefault();
            this.jump();
        };
        
        this.keydownHandler = (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.jump();
            }
        };
        window.addEventListener('keydown', this.keydownHandler);
        
        this.loop();
    },
    
    jump() {
        if (this.active && this.car.y >= this.getTerrainHeight(this.car.x) - this.car.height - 5) {
            this.car.velocity = -6;
            playSound('click');
        }
    },
    
    generateTerrain() {
        this.terrain = [];
        let y = 250;
        for (let i = 0; i < 5000; i++) {
            y += (Math.random() - 0.5) * 30;
            y = Math.max(150, Math.min(350, y));
            this.terrain.push(y);
        }
    },
    
    getTerrainHeight(x) {
        const index = Math.floor((x + this.offset) / 10);
        return this.terrain[index % this.terrain.length];
    },
    
    stop() {
        if (!this.active) return;
        this.active = false;
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.keydownHandler);
        GameEngine.endGame(Math.floor(this.score), 5);
    },
    
    update() {
        this.offset += this.speed;
        this.score += 0.1;
        GameEngine.updateScore(Math.floor(this.score));
        
        const groundY = this.getTerrainHeight(this.car.x);
        const nextGroundY = this.getTerrainHeight(this.car.x + 10);
        const targetRotation = Math.atan2(nextGroundY - groundY, 10);
        
        // Physics
        this.car.velocity += 0.25; // Gravity
        this.car.y += this.car.velocity;
        
        if (this.car.y + this.car.height > groundY) {
            this.car.y = groundY - this.car.height;
            this.car.velocity = 0;
            
            // Align rotation to ground
            this.car.rotation += (targetRotation - this.car.rotation) * 0.15;
        } else {
            // In air rotation based on velocity
            this.car.rotation += 0.02;
        }
        
        // Check if flipped (game over)
        const normalizedRot = ((this.car.rotation + Math.PI) % (Math.PI * 2)) - Math.PI;
        if (Math.abs(normalizedRot) > 1.2) {
            // If car is too tilted on ground, it's a crash
            if (this.car.y + this.car.height >= groundY - 2) {
                this.stop();
            }
        }
        
        // Increase speed over time
        this.speed += 0.0005;
    },
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sky
        this.ctx.fillStyle = '#bae6fd';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw terrain
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.canvas.height);
        for (let i = 0; i <= this.canvas.width; i += 10) {
            this.ctx.lineTo(i, this.getTerrainHeight(i));
        }
        this.ctx.lineTo(this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#4ade80';
        this.ctx.fill();
        this.ctx.strokeStyle = '#166534';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw car
        this.ctx.save();
        this.ctx.translate(this.car.x, this.car.y + this.car.height);
        this.ctx.rotate(this.car.rotation);
        
        // Car body
        this.ctx.fillStyle = '#f43f5e';
        this.ctx.fillRect(-this.car.width / 2, -this.car.height, this.car.width, this.car.height);
        this.ctx.fillStyle = '#fb7185';
        this.ctx.fillRect(-this.car.width / 2, -this.car.height, this.car.width, this.car.height / 2);
        
        // Wheels
        this.ctx.fillStyle = '#334155';
        this.ctx.beginPath();
        this.ctx.arc(-12, 0, 6, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(12, 0, 6, 0, Math.PI * 2);
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
