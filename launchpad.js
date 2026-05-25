/* Interactive Firing Console Simulator Deck */

export class LaunchPad {
    constructor(audioSynth, ambientParticles) {
        this.audio = audioSynth;
        this.ambient = ambientParticles;
        this.isArmed = false;
        
        // DOM References
        this.masterKeyBtn = document.getElementById('master-key-btn');
        this.statusIndicator = document.querySelector('.console-status .status-indicator');
        this.statusText = document.getElementById('system-status');
        this.cueButtons = document.querySelectorAll('.cue-btn');
        this.seqLaunchBtn = document.getElementById('seq-launch-btn');
        this.canvasOverlay = document.getElementById('visualizer-instruction');
        this.canvas = document.getElementById('launchpad-canvas');
        
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.shells = [];
        this.active = true;
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Interactive mappings
        this.cueConfig = [
            { id: 0, name: '3" Titanium Salute', color: '255, 255, 255', type: 'salute' },
            { id: 1, name: '4" Royal Blue Peony', color: '15, 82, 186', type: 'peony' },
            { id: 2, name: '5" Gold Willow Crown', color: '245, 158, 11', type: 'willow' },
            { id: 3, name: '6" Strobe Bouquet', color: '0, 210, 255', type: 'strobe' }
        ];

        this.initEventListeners();
        this.animate();
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    initEventListeners() {
        // Arming Mechanism
        this.masterKeyBtn.addEventListener('click', () => this.toggleSystemArmed());

        // Individual manual cues
        this.cueButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                if (!this.isArmed) return;
                this.launchCue(index);
            });
        });

        // Scripted Sequence Trigger
        this.seqLaunchBtn.addEventListener('click', () => {
            if (!this.isArmed) return;
            this.runAutoSequence();
        });
    }

    toggleSystemArmed() {
        this.isArmed = !this.isArmed;
        
        if (this.isArmed) {
            // Initialize/resume Audio Context
            this.audio.init();
            
            this.masterKeyBtn.textContent = 'SYSTEM ACTIVE (DISARM)';
            this.masterKeyBtn.classList.add('armed');
            
            this.statusIndicator.className = 'status-indicator green';
            this.statusText.innerHTML = '<span class="status-indicator green"></span> SYSTEM ARMED • ON-LINE';
            
            // Enable interactive elements
            this.cueButtons.forEach(btn => btn.disabled = false);
            this.seqLaunchBtn.disabled = false;
            
            // Hide visualizer placeholder prompt
            this.canvasOverlay.classList.add('fade-out');
        } else {
            this.masterKeyBtn.textContent = 'INSERT & TURN KEY';
            this.masterKeyBtn.classList.remove('armed');
            
            this.statusIndicator.className = 'status-indicator yellow';
            this.statusText.innerHTML = '<span class="status-indicator yellow"></span> KEY SWITCH DISARMED';
            
            // Disable interactive elements
            this.cueButtons.forEach(btn => {
                btn.disabled = true;
                btn.classList.remove('fired');
            });
            this.seqLaunchBtn.disabled = true;
            
            // Show visualizer placeholder prompt
            this.canvasOverlay.classList.remove('fade-out');
        }
    }

    // Manual Firing Routine
    launchCue(index) {
        const config = this.cueConfig[index];
        if (!config) return;
        
        const btn = this.cueButtons[index];
        btn.classList.add('fired');
        
        // Synthesize lift sound immediately
        this.audio.playLift();
        
        // Spawn visual lift shell
        const targetX = this.canvas.width * (0.2 + (index * 0.2));
        const targetY = this.canvas.height * (0.2 + Math.random() * 0.25);
        
        this.createShell(targetX, targetY, config);
        
        // Reset fired button glow indicator after delay
        setTimeout(() => {
            btn.classList.remove('fired');
        }, 1500);
    }

    // Scripted Choreography Timeline Routine
    runAutoSequence() {
        this.seqLaunchBtn.disabled = true;
        this.seqLaunchBtn.textContent = 'RUNNING PYRO-SCRIPT EXECUTION...';
        
        const delayTimes = [0, 800, 1600, 2400]; // 800ms intervals (Microsecond timing representation)
        
        delayTimes.forEach((delay, index) => {
            setTimeout(() => {
                if (this.isArmed) {
                    this.launchCue(index);
                }
            }, delay);
        });

        // Loop back and finish sequencies
        setTimeout(() => {
            if (this.isArmed) {
                // Finale split salute: Launch all 4 cues together for dramatic impact!
                this.audio.playLift();
                for (let i = 0; i < 4; i++) {
                    const config = this.cueConfig[i];
                    const targetX = this.canvas.width * (0.15 + (i * 0.23));
                    const targetY = this.canvas.height * (0.15 + Math.random() * 0.1);
                    this.createShell(targetX, targetY, config);
                }
            }
        }, 4000);

        // Restore trigger buttons
        setTimeout(() => {
            this.seqLaunchBtn.disabled = false;
            this.seqLaunchBtn.textContent = 'RUN SCRIPTED CHOREOGRAPHY SEQUENCE';
        }, 6000);
    }

    // Internal physics generator representing shells
    createShell(x, y, config) {
        // Initial shell moving upwards (the lift stage)
        const shell = {
            startX: x + (Math.random() - 0.5) * 40,
            startY: this.canvas.height,
            targetX: x,
            targetY: y,
            progress: 0,
            speed: 0.035 + Math.random() * 0.01,
            color: config.color,
            type: config.type,
            exploded: false,
            particles: []
        };
        
        this.shells.push(shell);
    }

    explodeShell(shell) {
        shell.exploded = true;
        
        // Trigger matching synthesized audio burst based on cue type
        this.audio.playBurst(shell.type);
        
        // Trigger page-wide background flashes aligned to the sound
        const rect = this.canvas.getBoundingClientRect();
        const pageX = rect.left + shell.targetX;
        const pageY = rect.top + shell.targetY;
        this.ambient.triggerFlash(pageX, pageY, shell.color, 25);
        
        // Generate internal visual particles inside visualizer deck
        const count = shell.type === 'salute' ? 60 : 120;
        const speedMultiplier = shell.type === 'salute' ? 6 : 4;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * speedMultiplier + 1;
            
            shell.particles.push({
                x: shell.targetX,
                y: shell.targetY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                alpha: 1,
                decay: shell.type === 'willow' ? 0.01 : 0.025,
                color: shell.color
            });
        }
    }

    animate() {
        if (!this.active) return;
        
        // Draw black translucent backdrop for trail effect
        this.ctx.fillStyle = 'rgba(2, 3, 5, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.shells.length - 1; i >= 0; i--) {
            const s = this.shells[i];
            
            if (!s.exploded) {
                // Lift Stage: Draw vertical lines heading up
                s.progress += s.speed;
                if (s.progress >= 1) {
                    this.explodeShell(s);
                } else {
                    const currentX = s.startX + (s.targetX - s.startX) * s.progress;
                    const currentY = s.startY + (s.targetY - s.startY) * s.progress;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(currentX, currentY, 2.5, 0, Math.PI * 2);
                    this.ctx.fillStyle = '#fff';
                    this.ctx.fill();
                    
                    // Trail
                    this.ctx.beginPath();
                    this.ctx.moveTo(currentX, currentY);
                    this.ctx.lineTo(currentX, currentY + 12);
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    this.ctx.stroke();
                }
            } else {
                // Burst Stage: Update and draw sub-particles
                let activeParticles = 0;
                
                s.particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    p.vy += 0.06; // Gravity drop
                    
                    // Willow drift effect
                    if (s.type === 'willow') {
                        p.vx *= 0.98;
                        p.vy *= 0.97;
                    }
                    
                    p.alpha -= p.decay;
                    
                    if (p.alpha > 0) {
                        activeParticles++;
                        
                        this.ctx.beginPath();
                        this.ctx.arc(p.x, p.y, s.type === 'salute' ? 2 : 1.5, 0, Math.PI * 2);
                        
                        // Strobe flash flicker effect
                        let drawAlpha = p.alpha;
                        if (s.type === 'strobe' && Math.random() > 0.5) {
                            drawAlpha = 0.1;
                        }
                        
                        this.ctx.fillStyle = `rgba(${p.color}, ${drawAlpha})`;
                        this.ctx.fill();
                    }
                });
                
                // Cleanup shells once all particles fade
                if (activeParticles === 0) {
                    this.shells.splice(i, 1);
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}
