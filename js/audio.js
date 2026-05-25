/* Procedural Firework Audio Synthesizer using Web Audio API */

export class AudioSynth {
    constructor() {
        this.ctx = null;
        this.masterVolume = null;
    }

    // Initialize/resume the AudioContext after a user gesture
    init() {
        if (this.ctx) return;
        
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContextClass();
        
        // Setup master gain node
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.setValueAtTime(0.3, this.ctx.currentTime); // Limit max volume
        this.masterVolume.connect(this.ctx.destination);
    }

    // Synthesize low-frequency lift launch thud
    playLift() {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // Sweep frequency downwards to simulate a deep launch pop
        osc.frequency.setValueAtTime(140, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    // Synthesize shell explosion based on cue specifications
    playBurst(type) {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        // 1. Create a deep sub-bass impact for the explosion core
        this.playExplosionCore();

        // 2. Play secondary textures based on type
        switch (type) {
            case 'salute':
                this.playSaluteCrack();
                break;
            case 'peony':
                this.playPeonyBurst();
                break;
            case 'willow':
                this.playWillowFringe();
                break;
            case 'strobe':
                this.playStrobeCrackles();
                break;
        }
    }

    // Deep boom for all explosions
    playExplosionCore() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(1.0, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

        osc.connect(gain);
        gain.connect(this.masterVolume);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.5);
    }

    // Helper: Generate White Noise Node
    createNoiseBuffer() {
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        return buffer;
    }

    // cue 1: Titanium Salute - sharp, loud high-frequency shockwave
    playSaluteCrack() {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1.0;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.3);
    }

    // cue 2: Royal Blue Peony - expansive mid-frequency rush
    playPeonyBurst() {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.6);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noise.start();
        noise.stop(this.ctx.currentTime + 0.8);
    }

    // cue 3: Gold Willow - long trailing crackles and swishes
    playWillowFringe() {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 1.2);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noise.start();
        noise.stop(this.ctx.currentTime + 1.5);
    }

    // cue 4: Strobe Bouquet - rapid pops / gated crackle sparks
    playStrobeCrackles() {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 1800;

        // Construct a rapid gain modulator (strobe gate)
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);

        const duration = 1.0;
        const speed = 0.06; // Trigger envelope points every 60ms
        for (let time = 0; time < duration; time += speed) {
            const level = Math.random() * 0.4 + 0.05;
            gain.gain.setValueAtTime(level, this.ctx.currentTime + time);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + time + speed * 0.8);
        }

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterVolume);

        noise.start();
        noise.stop(this.ctx.currentTime + duration);
    }
}
