let isMuted = false;
let audioCtx = null;
let currentGlowColor = '#fbbf24';

// Starfield Canvas Background
const bgCanvas = document.getElementById('starfieldCanvas');
const bgCtx = bgCanvas.getContext('2d');
let stars = [];

function resizeBg() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
    initStars();
}

function initStars() {
    stars = [];
    for (let i = 0; i < 90; i++) {
        stars.push({
            x: Math.random() * bgCanvas.width,
            y: Math.random() * bgCanvas.height,
            size: Math.random() * 2,
            alpha: Math.random(),
            speed: 0.02 + Math.random() * 0.03
        });
    }
}

function renderStars() {
    bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
    stars.forEach(s => {
        s.alpha += s.speed;
        if (s.alpha > 1 || s.alpha < 0) s.speed = -s.speed;
        bgCtx.fillStyle = `rgba(255, 255, 255, ${Math.abs(s.alpha)})`;
        bgCtx.beginPath();
        bgCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        bgCtx.fill();
    });
    requestAnimationFrame(renderStars);
}

window.addEventListener('resize', resizeBg);
resizeBg();
renderStars();

// Interactive Sparkle Trail Layer
const spCanvas = document.getElementById('sparkleCanvas');
const spCtx = spCanvas.getContext('2d');
let sparkles = [];

function resizeSp() {
    spCanvas.width = window.innerWidth;
    spCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeSp);
resizeSp();

window.addEventListener('mousemove', (e) => {
    if (Math.random() < 0.4) {
        sparkles.push({
            x: e.clientX,
            y: e.clientY,
            size: Math.random() * 4 + 2,
            life: 1,
            color: ['#A23B5A', '#E58C73', '#fbbf24'][Math.floor(Math.random() * 3)]
        });
    }
});

function renderSparkles() {
    spCtx.clearRect(0, 0, spCanvas.width, spCanvas.height);
    sparkles.forEach((p, index) => {
        p.life -= 0.03;
        p.y -= 0.5;
        if (p.life <= 0) {
            sparkles.splice(index, 1);
        } else {
            spCtx.fillStyle = p.color;
            spCtx.globalAlpha = p.life;
            spCtx.beginPath();
            spCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            spCtx.fill();
        }
    });
    requestAnimationFrame(renderSparkles);
}
renderSparkles();

// Web Audio API Synthesizer with AudioContext Auto-Resume Fix
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playFrequency(freq) {
    if (isMuted) return;
    initAudio();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
}

document.querySelectorAll('.synth-pad').forEach(pad => {
    pad.addEventListener('click', () => {
        const note = parseFloat(pad.dataset.note);
        playFrequency(note);
        pad.classList.add('active');
        setTimeout(() => pad.classList.remove('active'), 200);
    });
});

document.getElementById('playFullLullaby').addEventListener('click', () => {
    const notes = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63];
    notes.forEach((note, index) => {
        setTimeout(() => playFrequency(note), index * 350);
    });
});

// Nightlight Lantern Color & Intensity Control
const glowSlider = document.getElementById('glowSlider');
const lanternImg = document.getElementById('lanternImg');
const lanternBox = document.getElementById('lanternMediaBox');

glowSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    lanternBox.style.boxShadow = `0 0 ${val}px ${currentGlowColor}`;
});

document.getElementById('cycleLanternColor').addEventListener('click', () => {
    const colors = ['#fbbf24', '#38bdf8', '#f43f5e', '#34d399', '#a855f7'];
    currentGlowColor = colors[(colors.indexOf(currentGlowColor) + 1) % colors.length];
    lanternBox.style.boxShadow = `0 0 40px ${currentGlowColor}`;
    lanternImg.style.filter = `drop-shadow(0 0 12px ${currentGlowColor})`;
});

// SVG Path Exact Coordinates Tracking (`getPointAtLength`)
document.getElementById('dispatchRouteBtn').addEventListener('click', () => {
    const sprite = document.getElementById('deliverySprite');
    const path = document.getElementById('routePath');
    const pathLength = path.getTotalLength();
    let progress = 0;

    const interval = setInterval(() => {
        progress += 0.015;
        if (progress > 1) {
            clearInterval(interval);
        } else {
            const point = path.getPointAtLength(progress * pathLength);
            sprite.setAttribute('cx', point.x);
            sprite.setAttribute('cy', point.y);
        }
    }, 20);
});

// Dynamic Day/Night Toggle (Sun/Moon Icons & Text Update)
const moodBtn = document.getElementById('moodBtn');
moodBtn.addEventListener('click', () => {
    document.body.classList.toggle('day-mode');
    const isDay = document.body.classList.contains('day-mode');
    
    // Update Odometer Mood Label
    document.getElementById('moodLabel').textContent = isDay ? 'Golden Twilight' : 'Cozy Midnight';
    
    // Dynamic Button Text & Sun/Moon Icon Update[cite: 28, 29]
    moodBtn.textContent = isDay ? '☀️ Day Mode' : '🌙 Night Mode';
});

// Audio Mute Toggle
const muteBtn = document.getElementById('muteBtn');
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇 Audio: OFF' : '🔊 Audio: ON';
});

// Chaos Mode Toggle
document.getElementById('chaosBtn').addEventListener('click', () => {
    document.querySelector('.nursery-wrapper').classList.toggle('chaos-mode');
});

// Easter Egg Nap Box
const eggBox = document.getElementById('secretEggBox');
const eggIcon = document.getElementById('eggIcon');
const eggText = document.getElementById('eggText');

eggBox.addEventListener('click', () => {
    playFrequency(523.25);
    eggIcon.textContent = '🌟';
    eggText.textContent = 'Pip woke up, gave you a warm cozy wave, and tossed a stardust wish!';
    incrementOdometer();
    setTimeout(() => {
        eggIcon.textContent = '💤';
        eggText.textContent = 'Pip is currently taking a power nap. Tap softly to wake them up!';
    }, 4000);
});

function incrementOdometer() {
    const odo = document.getElementById('odometer');
    let current = parseInt(odo.textContent.replace(',', ''));
    odo.textContent = (current + 1).toLocaleString('en-US', {minimumIntegerDigits: 5});
}

// Character Sheet Modal Event Listeners
const modal = document.getElementById('characterModal');
document.getElementById('aboutBtn').addEventListener('click', () => modal.classList.add('active'));
document.getElementById('closeModal').addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
});