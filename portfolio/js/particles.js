/* Ambient Canvas Ember Sparks Generator */

export class AmbientParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.active = true;
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Spawn initial embers
        for (let i = 0; i < 40; i++) {
            this.particles.push(this.createParticle(true));
        }
        
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticle(randomY = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: randomY ? Math.random() * this.canvas.height : this.canvas.height + 10,
            size: Math.random() * 2.5 + 0.5,
            speedY: -(Math.random() * 0.8 + 0.2),
            speedX: (Math.random() - 0.5) * 0.4,
            alpha: Math.random() * 0.5 + 0.1,
            decay: Math.random() * 0.002 + 0.001,
            color: Math.random() > 0.4 ? '15, 82, 186' : '0, 210, 255' // Royal Blue vs Electric Cyan
        };
    }

    // Launch sparks at specific coordinates (e.g. background effects)
    triggerFlash(x, y, colorStr = '255, 255, 255', count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 3 + 1,
                speedY: Math.sin(angle) * speed,
                speedX: Math.cos(angle) * speed,
                alpha: 1,
                decay: Math.random() * 0.02 + 0.015,
                color: colorStr
            });
        }
    }

    animate() {
        if (!this.active) return;
        
        // Clear canvas with trace amount of alpha for faint trails
        this.ctx.fillStyle = 'rgba(8, 9, 13, 0.15)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            p.x += p.speedX;
            p.y += p.speedY;
            p.alpha -= p.decay;

            if (p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > this.canvas.width + 10) {
                // Replace general background drift particles; drop custom triggered sparks
                if (p.decay < 0.005) {
                    this.particles[i] = this.createParticle(false);
                } else {
                    this.particles.splice(i, 1);
                }
                continue;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
            
            // Add subtle glow
            this.ctx.shadowBlur = p.size * 2;
            this.ctx.shadowColor = `rgba(${p.color}, ${p.alpha})`;
            
            this.ctx.fill();
        }
        
        this.ctx.shadowBlur = 0; // Reset shadow glow
        
        requestAnimationFrame(() => this.animate());
    }
}
