// App State
const state = {
    participants: [],
    penalties: [],
    history: [],
    currentMode: 'single', // 'single' or 'pairing'
    noRepeatMode: false,
    darkMode: false,
    isSpinning: false
};

// Default data in Japanese
const defaultParticipants = ['田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '山本', '中村'];
const defaultPenalties = ['腕立て伏せ10回', 'スクワット15回', '一発芸', '物まね', '早口言葉', 'ダンス30秒', '歌を歌う', 'なぞなぞを出す'];

// Canvas and Animation
let canvas, ctx;
let confettiCanvas, confettiCtx;
let rotation = 0;
let targetRotation = 0;
let animationId = null;

// Audio context for sound (created on user interaction)
let audioContext = null;

// DOM Elements
const elements = {
    participantInput: null,
    participantList: null,
    penaltyInput: null,
    penaltyList: null,
    historyList: null,
    resultDisplay: null,
    spinBtn: null,
    singleModeBtn: null,
    pairingModeBtn: null,
    noRepeatCheckbox: null,
    darkModeToggle: null,
    penaltyPanel: null
};

// Initialize App
function init() {
    // Get DOM elements
    elements.participantInput = document.getElementById('participantInput');
    elements.participantList = document.getElementById('participantList');
    elements.penaltyInput = document.getElementById('penaltyInput');
    elements.penaltyList = document.getElementById('penaltyList');
    elements.historyList = document.getElementById('historyList');
    elements.resultDisplay = document.getElementById('result');
    elements.spinBtn = document.getElementById('spinBtn');
    elements.singleModeBtn = document.getElementById('singleMode');
    elements.pairingModeBtn = document.getElementById('pairingMode');
    elements.noRepeatCheckbox = document.getElementById('noRepeatMode');
    elements.darkModeToggle = document.getElementById('darkModeToggle');
    elements.penaltyPanel = document.getElementById('penaltyPanel');

    // Initialize canvas
    canvas = document.getElementById('rouletteCanvas');
    ctx = canvas.getContext('2d');
    confettiCanvas = document.getElementById('confettiCanvas');
    confettiCtx = confettiCanvas.getContext('2d');
    
    // Set confetti canvas size
    resizeConfettiCanvas();
    window.addEventListener('resize', resizeConfettiCanvas);

    // Load state from localStorage
    loadState();

    // Set up event listeners
    setupEventListeners();

    // Initial render
    renderAll();
    drawWheel();
}

// Resize confetti canvas
function resizeConfettiCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

// Setup Event Listeners
function setupEventListeners() {
    // Participant controls
    document.getElementById('addParticipant').addEventListener('click', () => addItem('participant'));
    elements.participantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem('participant');
    });
    document.getElementById('resetParticipants').addEventListener('click', () => resetList('participants'));

    // Penalty controls
    document.getElementById('addPenalty').addEventListener('click', () => addItem('penalty'));
    elements.penaltyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addItem('penalty');
    });
    document.getElementById('resetPenalties').addEventListener('click', () => resetList('penalties'));

    // Spin button
    elements.spinBtn.addEventListener('click', spin);

    // Mode toggle
    elements.singleModeBtn.addEventListener('click', () => setMode('single'));
    elements.pairingModeBtn.addEventListener('click', () => setMode('pairing'));

    // Options
    elements.noRepeatCheckbox.addEventListener('change', (e) => {
        state.noRepeatMode = e.target.checked;
        saveState();
    });

    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);

    // History controls
    document.getElementById('undoBtn').addEventListener('click', undoLast);
    document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
}

// Add Item
function addItem(type) {
    const input = type === 'participant' ? elements.participantInput : elements.penaltyInput;
    const value = input.value.trim();
    
    if (!value) return;
    
    if (type === 'participant') {
        state.participants.push(value);
    } else {
        state.penalties.push(value);
    }
    
    input.value = '';
    saveState();
    renderLists();
    drawWheel();
}

// Remove Item
function removeItem(type, index) {
    if (type === 'participant') {
        state.participants.splice(index, 1);
    } else {
        state.penalties.splice(index, 1);
    }
    
    saveState();
    renderLists();
    drawWheel();
}

// Reset List
function resetList(type) {
    if (type === 'participants') {
        state.participants = [...defaultParticipants];
    } else {
        state.penalties = [...defaultPenalties];
    }
    
    saveState();
    renderLists();
    drawWheel();
}

// Set Mode
function setMode(mode) {
    state.currentMode = mode;
    
    // Update button states
    elements.singleModeBtn.classList.toggle('active', mode === 'single');
    elements.pairingModeBtn.classList.toggle('active', mode === 'pairing');
    
    // Show/hide penalty panel based on mode
    elements.penaltyPanel.style.display = mode === 'pairing' ? 'block' : 'none';
    
    saveState();
    drawWheel();
}

// Toggle Dark Mode
function toggleDarkMode() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode', state.darkMode);
    elements.darkModeToggle.textContent = state.darkMode ? '☀️' : '🌙';
    saveState();
    drawWheel();
}

// Render Lists
function renderLists() {
    // Render participants
    elements.participantList.innerHTML = '';
    state.participants.forEach((participant, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${participant}</span>
            <button onclick="removeItem('participant', ${index})">×</button>
        `;
        elements.participantList.appendChild(li);
    });

    // Render penalties
    elements.penaltyList.innerHTML = '';
    state.penalties.forEach((penalty, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${penalty}</span>
            <button onclick="removeItem('penalty', ${index})">×</button>
        `;
        elements.penaltyList.appendChild(li);
    });
}

// Render History
function renderHistory() {
    elements.historyList.innerHTML = '';
    
    // Show most recent first
    [...state.history].reverse().forEach((entry, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="history-item-content">
                <div class="history-item-text">${entry.text}</div>
                <div class="history-item-time">${entry.time}</div>
            </div>
        `;
        elements.historyList.appendChild(li);
    });
}

// Render All
function renderAll() {
    renderLists();
    renderHistory();
    elements.noRepeatCheckbox.checked = state.noRepeatMode;
    document.body.classList.toggle('dark-mode', state.darkMode);
    elements.darkModeToggle.textContent = state.darkMode ? '☀️' : '🌙';
    elements.singleModeBtn.classList.toggle('active', state.currentMode === 'single');
    elements.pairingModeBtn.classList.toggle('active', state.currentMode === 'pairing');
    elements.penaltyPanel.style.display = state.currentMode === 'pairing' ? 'block' : 'none';
}

// Draw Roulette Wheel
function drawWheel() {
    const items = state.currentMode === 'pairing' 
        ? state.participants.map(p => `${p}`)
        : state.participants;
    
    if (items.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary');
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('参加者を追加してください', canvas.width / 2, canvas.height / 2);
        return;
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const sliceAngle = (2 * Math.PI) / items.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    // Draw slices
    items.forEach((item, i) => {
        const startAngle = i * sliceAngle;
        const endAngle = (i + 1) * sliceAngle;
        
        // Slice
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();
        
        // Color
        const hue = (i * 360) / items.length;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fill();
        ctx.strokeStyle = state.darkMode ? '#1e293b' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        
        const text = item.length > 12 ? item.substring(0, 10) + '...' : item;
        ctx.fillText(text, radius * 0.65, 5);
        ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, 2 * Math.PI);
    ctx.fillStyle = state.darkMode ? '#1e293b' : '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX - 15, 50);
    ctx.lineTo(centerX + 15, 50);
    ctx.closePath();
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = state.darkMode ? '#1e293b' : '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Spin the wheel
function spin() {
    if (state.isSpinning) return;
    
    const items = state.currentMode === 'pairing' 
        ? state.participants 
        : state.participants;
    
    if (items.length === 0) {
        alert('参加者を追加してください！');
        return;
    }

    if (state.currentMode === 'pairing' && state.penalties.length === 0) {
        alert('ペナルティを追加してください！');
        return;
    }

    state.isSpinning = true;
    elements.spinBtn.disabled = true;
    elements.resultDisplay.classList.remove('show');

    // Initialize audio context on first interaction
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Random spins
    const spins = 5 + Math.random() * 5;
    const randomAngle = Math.random() * 2 * Math.PI;
    targetRotation = rotation + spins * 2 * Math.PI + randomAngle;

    animateWheel();
}

// Animate wheel rotation
function animateWheel() {
    const diff = targetRotation - rotation;
    const speed = diff * 0.05; // Easing
    
    rotation += speed;

    drawWheel();

    if (Math.abs(diff) > 0.01) {
        animationId = requestAnimationFrame(animateWheel);
    } else {
        rotation = targetRotation;
        drawWheel();
        onSpinComplete();
    }
}

// On spin complete
function onSpinComplete() {
    state.isSpinning = false;
    elements.spinBtn.disabled = false;

    // Calculate winner
    const items = state.currentMode === 'pairing' 
        ? state.participants 
        : state.participants;
    
    const normalizedRotation = rotation % (2 * Math.PI);
    const sliceAngle = (2 * Math.PI) / items.length;
    
    // The pointer is at the top, so we need to find which slice is at the top
    // Adjust for rotation direction
    let winnerIndex = Math.floor(((2 * Math.PI - normalizedRotation) + Math.PI / 2) / sliceAngle) % items.length;
    
    let resultText;
    let participant = items[winnerIndex];
    
    let penalty = null;
    let penaltyIndex = -1;
    
    if (state.currentMode === 'pairing') {
        penaltyIndex = Math.floor(Math.random() * state.penalties.length);
        penalty = state.penalties[penaltyIndex];
        resultText = `${participant} が ${penalty} をやる`;
        
        // Remove items if no-repeat mode
        if (state.noRepeatMode) {
            state.participants.splice(winnerIndex, 1);
            state.penalties.splice(penaltyIndex, 1);
        }
    } else {
        resultText = participant;
        
        // Remove item if no-repeat mode
        if (state.noRepeatMode) {
            state.participants.splice(winnerIndex, 1);
        }
    }

    // Show result
    elements.resultDisplay.textContent = resultText;
    elements.resultDisplay.classList.add('show');

    // Add to history
    const now = new Date();
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    state.history.push({
        text: resultText,
        time: timeStr,
        participant: participant,
        participantIndex: winnerIndex,
        penalty: penalty,
        mode: state.currentMode
    });

    saveState();
    renderLists();
    renderHistory();
    drawWheel();

    // Play sound and show confetti
    playSuccessSound();
    showConfetti();
}

// Play success sound
function playSuccessSound() {
    if (!audioContext) return;
    
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio playback failed:', e);
    }
}

// Show confetti
function showConfetti() {
    const particles = [];
    const particleCount = 150;
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: confettiCanvas.width / 2,
            y: confettiCanvas.height / 2,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 5 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }

    function animateConfetti() {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        
        let activeParticles = 0;
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2; // Gravity
            p.rotation += p.rotationSpeed;
            
            if (p.y < confettiCanvas.height) {
                activeParticles++;
                
                confettiCtx.save();
                confettiCtx.translate(p.x, p.y);
                confettiCtx.rotate(p.rotation * Math.PI / 180);
                confettiCtx.fillStyle = p.color;
                confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                confettiCtx.restore();
            }
        });
        
        if (activeParticles > 0) {
            requestAnimationFrame(animateConfetti);
        }
    }
    
    animateConfetti();
}

// Undo last
function undoLast() {
    if (state.history.length === 0) return;
    
    const lastEntry = state.history.pop();
    
    // If no-repeat mode was active, restore the item
    if (state.noRepeatMode) {
        if (lastEntry.mode === 'pairing') {
            // Restore participant and penalty
            state.participants.splice(lastEntry.participantIndex, 0, lastEntry.participant);
            if (lastEntry.penalty) {
                state.penalties.push(lastEntry.penalty);
            }
        } else {
            // Restore participant
            state.participants.splice(lastEntry.participantIndex, 0, lastEntry.participant);
        }
    }
    
    saveState();
    renderAll();
    drawWheel();
    elements.resultDisplay.classList.remove('show');
}

// Clear history
function clearHistory() {
    if (confirm('履歴をクリアしますか？')) {
        state.history = [];
        saveState();
        renderHistory();
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('rouletteAppState', JSON.stringify(state));
}

// Load state from localStorage
function loadState() {
    const saved = localStorage.getItem('rouletteAppState');
    
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.participants = parsed.participants || [];
            state.penalties = parsed.penalties || [];
            state.history = parsed.history || [];
            state.currentMode = parsed.currentMode || 'single';
            state.noRepeatMode = parsed.noRepeatMode || false;
            state.darkMode = parsed.darkMode || false;
        } catch (e) {
            console.error('Failed to load state:', e);
            resetToDefaults();
        }
    } else {
        resetToDefaults();
    }
}

// Reset to defaults
function resetToDefaults() {
    state.participants = [...defaultParticipants];
    state.penalties = [...defaultPenalties];
    state.history = [];
    state.currentMode = 'single';
    state.noRepeatMode = false;
    state.darkMode = false;
    saveState();
}

// Make removeItem available globally
window.removeItem = removeItem;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
