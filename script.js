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

    // Lightning & Rain Effect
    const canvas = document.getElementById('lightning-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resizeCanvas() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Ripple {
        constructor() {
            this.active = false;
        }

        init(x, y, isBottom = false) {
            this.x = x;
            this.y = y;
            this.radius = 1;
            this.maxRadius = isBottom ? 15 + Math.random() * 20 : 5 + Math.random() * 10;
            this.opacity = isBottom ? 0.3 : 0.2;
            this.speed = isBottom ? 0.5 + Math.random() * 0.5 : 0.3 + Math.random() * 0.3;
            this.isBottom = isBottom;
            this.active = true;
        }

        update() {
            this.radius += this.speed;
            this.opacity -= 0.005;
            if (this.opacity <= 0 || this.radius >= this.maxRadius) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active) return;
            ctx.strokeStyle = `rgba(0, 180, 255, ${this.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (this.isBottom) {
                ctx.ellipse(this.x, this.y, this.radius * 2, this.radius * 0.5, 0, 0, Math.PI * 2);
            } else {
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            }
            ctx.stroke();
        }
    }

    class Raindrop {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // Initial random position
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * -height;
            this.length = 10 + Math.random() * 20;
            this.speed = 10 + Math.random() * 15;
            this.opacity = 0.1 + Math.random() * 0.3;
        }

        update() {
            this.y += this.speed;
            if (this.y > height) {
                if (weatherMode === 'rainy') {
                    if (Math.random() < 0.4) {
                        const ripple = getFromPool(ripplePool);
                        if (ripple) ripple.init(this.x, height - 5, true);
                    }
                    this.reset();
                } else {
                    // When in flower mode, rain doesn't reset to the top
                    this.y = -100; // Park it off-screen
                }
            }
        }

        draw() {
            if (this.y < 0 || this.y > height) return;
            ctx.strokeStyle = `rgba(0, 180, 255, ${this.opacity})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.length);
            ctx.stroke();
        }
    }

    class Flower {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // Initial random position
        }

        reset() {
            this.x = Math.random() * width;
            this.y = -20 - (Math.random() * height);
            this.size = 6 + Math.random() * 8;
            this.speedY = 1 + Math.random() * 2;
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
            this.opacity = 0.4 + Math.random() * 0.4;
            this.drift = Math.random() * Math.PI * 2;
        }

        update() {
            this.y += this.speedY;
            this.drift += 0.01;
            this.x += this.speedX + Math.sin(this.drift) * 0.8;
            this.rotation += this.rotationSpeed;

            if (this.y > height + 20) {
                if (weatherMode === 'flowers') {
                    this.reset();
                } else {
                    this.y = -100; // Park it off-screen
                }
            }
        }

        draw() {
            if (this.y < -20 || this.y > height + 20) return;
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = `rgba(0, 180, 255, ${this.opacity})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00b4ff';

            // Draw 5 petals
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.rotate((Math.PI * 2) / 5);
                ctx.ellipse(0, -this.size / 2, this.size / 3, this.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            // Center
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    class Lightning {
        constructor() {
            this.segments = [];
            this.active = false;
        }

        init() {
            this.segments = [];
            let x = Math.random() * width;
            let y = 0;
            let segmentCount = 15 + Math.random() * 20;

            for (let i = 0; i < segmentCount; i++) {
                let nextX = x + (Math.random() - 0.5) * 80;
                let nextY = y + height / segmentCount;
                this.segments.push({ x1: x, y1: y, x2: nextX, y2: nextY });
                x = nextX;
                y = nextY;

                if (Math.random() < 0.1) {
                    this.createBranch(x, y, 5);
                }
            }
            this.opacity = 1;
            this.active = true;
        }

        createBranch(x, y, count) {
            for (let i = 0; i < count; i++) {
                let nextX = x + (Math.random() - 0.5) * 60;
                let nextY = y + (Math.random() * 40);
                this.segments.push({ x1: x, y1: y, x2: nextX, y2: nextY });
                x = nextX;
                y = nextY;
            }
        }

        draw() {
            if (!this.active) return;
            ctx.strokeStyle = `rgba(0, 180, 255, ${this.opacity})`;
            ctx.lineWidth = 2;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00b4ff';

            ctx.beginPath();
            this.segments.forEach(seg => {
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
            });
            ctx.stroke();

            // Core glow
            ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.lineWidth = 0.5;
            ctx.shadowBlur = 0;
            ctx.beginPath();
            this.segments.forEach(seg => {
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
            });
            ctx.stroke();
        }

        update() {
            if (!this.active) return;
            this.opacity -= 0.05;
            if (this.opacity <= 0) {
                this.active = false;
            }
        }
    }

    const ripplePool = Array.from({ length: 50 }, () => new Ripple());
    const lightningPool = Array.from({ length: 5 }, () => new Lightning());
    let weatherMode = 'rainy';
    let modeTimer = 20000; // Start with 20s of rain

    const raindrops = Array.from({ length: 150 }, () => new Raindrop());
    const flowers = Array.from({ length: 40 }, () => {
        const f = new Flower();
        f.y = -100; // Start flowers off-screen
        return f;
    });

    function getFromPool(pool) {
        return pool.find(item => !item.active);
    }

    function switchWeather() {
        if (weatherMode === 'rainy') {
            weatherMode = 'flowers';
            modeTimer = 15000 + Math.random() * 10000; // 15-25s of flowers
            // Reactivate flowers
            flowers.forEach(f => f.reset());
        } else {
            weatherMode = 'rainy';
            modeTimer = 25000 + Math.random() * 15000; // 25-40s of rain
            // Reactivate rain
            raindrops.forEach(d => d.reset());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update mode timer
        modeTimer -= 16;
        if (modeTimer <= 0) {
            switchWeather();
        }

        // Water effect on screen (random hits)
        if (weatherMode === 'rainy' && Math.random() < 0.05) {
            const ripple = getFromPool(ripplePool);
            if (ripple) ripple.init(Math.random() * width, Math.random() * height, false);
        }

        // Draw and update ripples
        ripplePool.forEach(r => {
            if (r.active) {
                r.draw();
                r.update();
            }
        });

        // Draw and update rain
        raindrops.forEach(drop => {
            drop.draw();
            drop.update();
        });

        // Draw and update flowers
        flowers.forEach(flower => {
            flower.draw();
            flower.update();
        });

        // Randomly add lightning (only in rainy mode)
        if (weatherMode === 'rainy' && Math.random() < 0.01) {
            const lightning = getFromPool(lightningPool);
            if (lightning) lightning.init();
        }

        lightningPool.forEach(l => {
            if (l.active) {
                l.draw();
                l.update();
            }
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Initialization
    initWorldClocks();
    updateClock();
    setInterval(updateClock, 1000);
});
