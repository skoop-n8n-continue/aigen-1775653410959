document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // Clock Logic
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        document.getElementById('digital-clock').textContent = `${hours}:${minutes}:${seconds}`;

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('date-display').textContent = now.toLocaleDateString('en-US', options);

        updateWorldClocks(now);
    }

    const worldCities = [
        { name: 'London', tz: 'Europe/London' },
        { name: 'New York', tz: 'America/New_York' },
        { name: 'Tokyo', tz: 'Asia/Tokyo' },
        { name: 'Sydney', tz: 'Australia/Sydney' }
    ];

    function initWorldClocks() {
        const grid = document.getElementById('world-clock-list');
        grid.innerHTML = worldCities.map(city => `
            <div class="clock-card" id="city-${city.name.replace(' ', '-')}">
                <div class="city">${city.name}</div>
                <div class="city-time">00:00</div>
            </div>
        `).join('');
    }

    function updateWorldClocks(now) {
        worldCities.forEach(city => {
            const timeStr = now.toLocaleTimeString('en-US', {
                timeZone: city.tz,
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            const el = document.querySelector(`#city-${city.name.replace(' ', '-')} .city-time`);
            if (el) el.textContent = timeStr;
        });
    }

    // Stopwatch Logic
    let swInterval;
    let swStartTime;
    let swElapsedTime = 0;
    let swIsRunning = false;

    const swDisplay = document.getElementById('stopwatch-time');
    const swStartBtn = document.getElementById('sw-start');
    const swLapBtn = document.getElementById('sw-lap');
    const swResetBtn = document.getElementById('sw-reset');
    const swClearBtn = document.getElementById('sw-clear');
    const swLapList = document.getElementById('lap-list');

    function formatTime(ms) {
        const date = new Date(ms);
        const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
        const m = String(date.getUTCMinutes()).padStart(2, '0');
        const s = String(date.getUTCSeconds()).padStart(2, '0');
        const msPart = String(Math.floor((ms % 1000) / 10)).padStart(2, '0');
        return `${h}:${m}:${s}.${msPart}`;
    }

    swStartBtn.addEventListener('click', () => {
        if (!swIsRunning) {
            swStartTime = Date.now() - swElapsedTime;
            swInterval = setInterval(() => {
                swElapsedTime = Date.now() - swStartTime;
                swDisplay.textContent = formatTime(swElapsedTime);
            }, 10);
            swStartBtn.textContent = 'Pause';
            swStartBtn.classList.replace('primary', 'secondary');
            swLapBtn.disabled = false;
            swIsRunning = true;
        } else {
            clearInterval(swInterval);
            swStartBtn.textContent = 'Resume';
            swStartBtn.classList.replace('secondary', 'primary');
            swIsRunning = false;
        }
    });

    swResetBtn.addEventListener('click', () => {
        clearInterval(swInterval);
        swElapsedTime = 0;
        swIsRunning = false;
        swDisplay.textContent = '00:00:00.00';
        swStartBtn.textContent = 'Start';
        swStartBtn.className = 'btn primary';
        swLapBtn.disabled = true;
    });

    swClearBtn.addEventListener('click', () => {
        swLapList.innerHTML = '';
    });

    swLapBtn.addEventListener('click', () => {
        const lapItem = document.createElement('li');
        lapItem.className = 'lap-item';
        const lapNum = swLapList.children.length + 1;
        lapItem.innerHTML = `<span class="lap-number">Lap ${lapNum}</span> <span>${formatTime(swElapsedTime)}</span>`;
        swLapList.prepend(lapItem);
    });

    // Timer Logic
    let timerInterval;
    let timerTotalSeconds = 0;
    let timerRemainingSeconds = 0;

    const timerH = document.getElementById('timer-h');
    const timerM = document.getElementById('timer-m');
    const timerS = document.getElementById('timer-s');
    const timerDisplay = document.getElementById('timer-display');
    const timerInputs = document.querySelector('.timer-inputs');
    const timerStartBtn = document.getElementById('timer-start');
    const timerCancelBtn = document.getElementById('timer-cancel');
    const timerSound = document.getElementById('timer-sound');

    // Modal Logic
    const modal = document.getElementById('notification-modal');
    const modalClose = document.getElementById('modal-close');

    function showNotification(title, message) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        modal.classList.remove('hidden');
    }

    modalClose.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    function formatTimerTime(totalSeconds) {
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    timerStartBtn.addEventListener('click', () => {
        if (timerInterval) return; // Already running

        const h = parseInt(timerH.value) || 0;
        const m = parseInt(timerM.value) || 0;
        const s = parseInt(timerS.value) || 0;

        timerRemainingSeconds = h * 3600 + m * 60 + s;

        if (timerRemainingSeconds <= 0) return;

        timerInputs.classList.add('hidden');
        timerDisplay.classList.remove('hidden');
        timerCancelBtn.classList.remove('hidden');
        timerStartBtn.classList.add('hidden');

        timerDisplay.textContent = formatTimerTime(timerRemainingSeconds);

        timerInterval = setInterval(() => {
            timerRemainingSeconds--;
            timerDisplay.textContent = formatTimerTime(timerRemainingSeconds);

            if (timerRemainingSeconds <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerSound.play().catch(() => {});
                showNotification('Time is up!', 'Your countdown timer has finished.');
                resetTimerUI();
            }
        }, 1000);
    });

    timerCancelBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        resetTimerUI();
    });

    function resetTimerUI() {
        timerInputs.classList.remove('hidden');
        timerDisplay.classList.add('hidden');
        timerCancelBtn.classList.add('hidden');
        timerStartBtn.classList.remove('hidden');
    }

    // Initialization
    initWorldClocks();
    updateClock();
    setInterval(updateClock, 1000);
});
