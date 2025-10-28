// Roulette wheel configuration
const canvas = document.getElementById('rouletteWheel');
const ctx = canvas.getContext('2d');
const spinButton = document.getElementById('spinButton');
const resultDiv = document.getElementById('result');

// Roulette numbers in European roulette order
const numbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

// Colors for numbers (0 is green, odd/even pattern for red/black)
const colors = {
    0: '#2ecc71',
    red: '#e74c3c',
    black: '#2c3e50'
};

const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

let currentRotation = 0;
let isSpinning = false;

// Draw the roulette wheel
function drawWheel() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;
    const sliceAngle = (2 * Math.PI) / numbers.length;

    numbers.forEach((number, index) => {
        const startAngle = index * sliceAngle + currentRotation;
        const endAngle = startAngle + sliceAngle;

        // Determine color
        let color;
        if (number === 0) {
            color = colors[0];
        } else if (redNumbers.includes(number)) {
            color = colors.red;
        } else {
            color = colors.black;
        }

        // Draw slice
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw number
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(number, radius * 0.75, 5);
        ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#f39c12';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Get the winning number based on rotation
function getWinningNumber(rotation) {
    const normalizedRotation = (rotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const sliceAngle = (2 * Math.PI) / numbers.length;
    // The pointer is at the top, so we need to find which slice is at the top
    const topAngle = (2 * Math.PI - normalizedRotation) % (2 * Math.PI);
    const index = Math.floor(topAngle / sliceAngle);
    return numbers[index];
}

// Spin the wheel
function spinWheel() {
    if (isSpinning) return;

    isSpinning = true;
    spinButton.disabled = true;
    resultDiv.textContent = '';
    resultDiv.classList.remove('show');

    // Random spin: 5-10 full rotations plus random position
    const spins = 5 + Math.random() * 5;
    const extraRotation = Math.random() * 2 * Math.PI;
    const totalRotation = spins * 2 * Math.PI + extraRotation;

    const duration = 4000; // 4 seconds
    const startTime = Date.now();
    const startRotation = currentRotation;

    function animate() {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);

        currentRotation = startRotation + totalRotation * easeOut;

        // Clear and redraw
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawWheel();

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Spin complete
            const winningNumber = getWinningNumber(currentRotation);
            resultDiv.textContent = `Winner: ${winningNumber}`;
            resultDiv.classList.add('show');
            isSpinning = false;
            spinButton.disabled = false;
        }
    }

    animate();
}

// Event listeners
spinButton.addEventListener('click', spinWheel);

// Initial draw
drawWheel();
