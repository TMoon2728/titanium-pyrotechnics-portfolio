/* Main Application Coordinator and Initializer */

import { AmbientParticles } from './particles.js';
import { AudioSynth } from './audio.js';
import { LaunchPad } from './launchpad.js';
import { BookingPortal } from './booking.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize ambient canvas background sparks
    const ambient = new AmbientParticles('ambient-canvas');
    
    // 2. Initialize audio synthesizer engine
    const audio = new AudioSynth();
    
    // 3. Initialize interactive Pyro-Script simulator deck
    const launchpad = new LaunchPad(audio, ambient);
    
    // 4. Initialize scheduling calendar and multi-step intake form
    const booking = new BookingPortal();

    // 5. Setup mobile responsive navigation toggle menu
    const mobileToggle = document.querySelector('.mobile-toggle');
    const nav = document.querySelector('.nav');
    
    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close menu when clicking link
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('active');
                mobileToggle.classList.remove('active');
            });
        });
    }

    // Dynamic header styling on scroll
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '0.75rem 0';
            header.style.background = 'rgba(8, 9, 13, 0.95)';
            header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.padding = '1.25rem 0';
            header.style.background = 'rgba(8, 9, 13, 0.8)';
            header.style.boxShadow = 'none';
        }
    });

    console.log("Titanium Pyrotechnics Platform Engine Activated.");
});
