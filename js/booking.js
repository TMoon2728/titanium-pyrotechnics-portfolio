/* Interactive Booking Calendar and Multi-step Form Controller */

export class BookingPortal {
    constructor() {
        // --- GOOGLE CALENDAR CONFIGURATION ---
        // Replace with your Google API Key and public Google Calendar ID
        this.googleApiKey = "AIzaSyABq1tWbg4PkMTWUNMbg8UFwqNawMqf9XA";
        this.googleCalendarId = "fc9305b966e3e023fc052787a1a81daa02557cdcc0623f4351df620c834ed608@group.calendar.google.com";
        
        // Start calendar on today's current date
        this.currentDate = new Date(); 
        
        // Generate mock booked dates relative to the current month as fallback (arrays of bookings)
        const currentYear = this.currentDate.getFullYear();
        const currentMonthStr = String(this.currentDate.getMonth() + 1).padStart(2, '0');
        this.bookedEvents = {};
        this.bookedEvents[`${currentYear}-${currentMonthStr}-12`] = ['Topeka Country Club Gala'];
        this.bookedEvents[`${currentYear}-${currentMonthStr}-20`] = ['Lake Javaro Summer Display', 'Lakeside Wedding Ceremony'];

        // DOM Calendar elements
        this.calMonthYear = document.getElementById('calendar-month-year');
        this.calDaysGrid = document.getElementById('calendar-days-grid');
        this.calPrev = document.getElementById('cal-prev');
        this.calNext = document.getElementById('cal-next');
        
        // DOM Form elements
        this.form = document.getElementById('booking-inquiry-form');
        this.eventDateInput = document.getElementById('event-date');
        this.progressBar = document.getElementById('form-progress-bar');
        this.stepIndicatorNums = document.querySelectorAll('.progress-steps .step-num');
        
        // Success Overlay Elements
        this.successOverlay = document.getElementById('booking-success');
        this.btnResetForm = document.querySelector('.btn-reset-form');

        this.currentStep = 1;
        this.selectedDateStr = '';

        this.initCalendar();
        this.initFormControls();
        
        // Fetch events if calendar integration is configured
        this.loadGoogleCalendarEvents();
    }

    /* ---------------- CALENDAR CONTROLLER ---------------- */

    initCalendar() {
        if (!this.calDaysGrid) return;
        
        this.renderCalendar();
        
        this.calPrev.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        
        this.calNext.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
    }

    renderCalendar() {
        this.calDaysGrid.innerHTML = '';
        
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Month headers
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.calMonthYear.textContent = `${months[month]} ${year}`;
        
        // First day of month
        const firstDayIndex = new Date(year, month, 1).getDay();
        // Total days in month
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        // Generate empty padding slots
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day empty';
            this.calDaysGrid.appendChild(emptyDiv);
        }
        
        // Populate days
        for (let day = 1; day <= totalDays; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.className = 'cal-day';
            dayDiv.textContent = day;
            
            // Format ISO date string
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const dateKey = `${year}-${monthStr}-${dayStr}`;
            
            // Check status against bookings
            const bookings = this.bookedEvents[dateKey] || [];
            const count = bookings.length;
            
            if (count >= 2) {
                dayDiv.classList.add('booked-full');
                dayDiv.title = `Fully Booked (No slots remaining):\n` + bookings.map(b => `• ${b}`).join('\n');
            } else if (count === 1) {
                dayDiv.classList.add('booked-limited');
                dayDiv.title = `Limited Availability (1 Show Confirmed):\n• ${bookings[0]}`;
                
                if (this.selectedDateStr === dateKey) {
                    dayDiv.classList.add('selected');
                }
                dayDiv.addEventListener('click', () => {
                    this.selectDate(dateKey, dayDiv);
                });
            } else {
                dayDiv.classList.add('available');
                
                if (this.selectedDateStr === dateKey) {
                    dayDiv.classList.add('selected');
                }
                dayDiv.addEventListener('click', () => {
                    this.selectDate(dateKey, dayDiv);
                });
            }
            
            this.calDaysGrid.appendChild(dayDiv);
        }
    }

    selectDate(dateKey, dayElement) {
        // Clear old selections
        const oldSelected = this.calDaysGrid.querySelector('.cal-day.selected');
        if (oldSelected) oldSelected.classList.remove('selected');
        
        // Select new date
        dayElement.classList.add('selected');
        this.selectedDateStr = dateKey;
        
        // Populate form field
        this.eventDateInput.value = dateKey;
        this.eventDateInput.classList.add('valid');
    }

    /* ---------------- FORM MULTI-STEP CONTROLLER ---------------- */

    initFormControls() {
        if (!this.form) return;

        // Next buttons
        const btnNexts = this.form.querySelectorAll('.btn-next');
        btnNexts.forEach(btn => {
            btn.addEventListener('click', () => this.navigateStep(1));
        });

        // Prev buttons
        const btnPrevs = this.form.querySelectorAll('.btn-prev');
        btnPrevs.forEach(btn => {
            btn.addEventListener('click', () => this.navigateStep(-1));
        });

        // Form Submit interception
        this.form.addEventListener('submit', (e) => {
            // All basic validation passes
            if (this.validateStep(this.currentStep)) {
                // Submit occurs inside iframe, we transition UI instantly
                this.showSuccessScreen();
            } else {
                e.preventDefault();
            }
        });

        // Reset form controls
        if (this.btnResetForm) {
            this.btnResetForm.addEventListener('click', () => this.resetBookingForm());
        }
    }

    navigateStep(direction) {
        const nextStep = this.currentStep + direction;
        
        // If proceeding forwards, validate inputs
        if (direction > 0 && !this.validateStep(this.currentStep)) {
            return;
        }

        // Hide current step, show next step
        document.getElementById(`form-step-${this.currentStep}`).classList.remove('active');
        document.getElementById(`form-step-${nextStep}`).classList.add('active');
        
        // Update indicators
        if (direction > 0) {
            this.stepIndicatorNums[this.currentStep - 1].classList.add('completed');
        } else {
            this.stepIndicatorNums[nextStep - 1].classList.remove('completed');
        }
        
        this.stepIndicatorNums[this.currentStep - 1].classList.remove('active');
        this.stepIndicatorNums[nextStep - 1].classList.add('active');
        
        this.currentStep = nextStep;
        
        // Update bar width: Step 1 = 0%, Step 2 = 50%, Step 3 = 100%
        const percent = ((this.currentStep - 1) / 2) * 100;
        this.progressBar.style.width = `${percent}%`;
    }

    validateStep(stepIndex) {
        const container = document.getElementById(`form-step-${stepIndex}`);
        if (!container) return false;
        
        const inputs = container.querySelectorAll('input[required], select[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ef4444'; // Red error outline
                isValid = false;
            } else {
                input.style.borderColor = 'rgba(255, 255, 255, 0.08)'; // Reset
            }
        });
        
        // Special case: check selected calendar date
        if (stepIndex === 1 && !this.selectedDateStr) {
            this.eventDateInput.style.borderColor = '#ef4444';
            isValid = false;
        }

        return isValid;
    }

    showSuccessScreen() {
        this.successOverlay.classList.add('active');
    }

    resetBookingForm() {
        this.form.reset();
        this.selectedDateStr = '';
        this.eventDateInput.value = '';
        this.currentStep = 1;
        
        // Reset steps DOM
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.classList.remove('active');
            if (index === 0) step.classList.add('active');
        });
        
        this.stepIndicatorNums.forEach((num, index) => {
            num.classList.remove('active', 'completed');
            if (index === 0) num.classList.add('active');
        });
        
        this.progressBar.style.width = '0%';
        this.successOverlay.classList.remove('active');
        this.renderCalendar(); // Redraw calendar to clear highlights
    }

    async loadGoogleCalendarEvents() {
        if (this.googleApiKey === "YOUR_API_KEY_HERE" || this.googleCalendarId === "YOUR_CALENDAR_ID_HERE") {
            console.warn("Google Calendar integration variables not set. Using mock local data fallback.");
            return;
        }

        // Fetch events starting from 2 months ago up to 1 year in the future
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        const timeMin = start.toISOString();
        
        const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(this.googleCalendarId)}/events?key=${this.googleApiKey}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=250`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Google Calendar API response error: ${response.status}`);
            }
            const data = await response.json();
            
            // Clear default mock bookings and populate with actual calendar entries (group by date)
            this.bookedEvents = {};
            if (data.items && data.items.length > 0) {
                data.items.forEach(event => {
                    let dateKey = "";
                    if (event.start.date) {
                        dateKey = event.start.date; // All-day events are already YYYY-MM-DD
                    } else if (event.start.dateTime) {
                        // Parse timed events to get the date in the local timezone
                        const d = new Date(event.start.dateTime);
                        const yr = d.getFullYear();
                        const mo = String(d.getMonth() + 1).padStart(2, '0');
                        const dy = String(d.getDate()).padStart(2, '0');
                        dateKey = `${yr}-${mo}-${dy}`;
                    }
                    
                    if (dateKey) {
                        if (!this.bookedEvents[dateKey]) {
                            this.bookedEvents[dateKey] = [];
                        }
                        this.bookedEvents[dateKey].push(event.summary || "Booked Display Slot");
                    }
                });
            }
            
            // Redraw calendar to apply live dates
            this.renderCalendar();
            console.log("Google Calendar loaded successfully. Booked slots updated.");
        } catch (error) {
            console.error("Failed to load Google Calendar events, keeping mock fallbacks:", error);
        }
    }
}
