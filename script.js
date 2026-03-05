// --- CONSTANTS & STATE ---
const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');

const GRAVITY = 9.81;
const SCALE = 6; // Pixels per meter
const GROUND_Y_PIXEL = canvas.height - 50;

let isFlying = false;
let time = 0;
let proj = { x: 0, y: 0, vx: 0, vy: 0 };
let trail = [];
let maxStats = { height: 0, dist: 0 };
let targetX = 0;

// --- INPUT ELEMENTS ---
const velInput = document.getElementById('velocity');
const angInput = document.getElementById('angle');
const dragInput = document.getElementById('drag');
const fireBtn = document.getElementById('fireBtn');

// --- INITIALIZATION ---
function resetTarget() {
    targetX = 80 + Math.random() * (canvas.width - 160);
}
resetTarget();

// --- PHYSICS ENGINE ---
function update() {
    if (!isFlying) return;

    const vMag = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
    const dragCoeff = parseFloat(dragInput.value) / 1000;

    // 1. Air Resistance (Drag)
    if (vMag > 0) {
        const dragForce = dragCoeff * vMag * vMag;
        const dragAx = (dragForce * proj.vx) / vMag;
        const dragAy = (dragForce * proj.vy) / vMag;

        proj.vx -= dragAx * 0.1;
        proj.vy -= dragAy * 0.1;
    }

    // 2. Gravity
    proj.vy -= GRAVITY * 0.1;

    // 3. Position Update
    proj.x += proj.vx * 0.1;
    proj.y += proj.vy * 0.1;

    // Stats & Trail
    if (proj.y > maxStats.height) maxStats.height = proj.y;
    
    trail.push({ x: proj.x, y: proj.y });
    if (trail.length > 50) trail.shift();

    // Collision Detection
    if (proj.y <= 0) {
        proj.y = 0;
        isFlying = false;
        maxStats.dist = proj.x;
        checkHit();
    }
    
    time += 0.1;
}

function checkHit() {
    const targetMeters = (targetX - 50) / SCALE;
    const distance = Math.abs(proj.x - targetMeters);
    console.log(`Landed ${distance.toFixed(1)}m from target`);
}

// --- RENDER ENGINE ---
function draw() {
    // 1. Clear & Draw Sky
    let skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#4a90e2');
    skyGrad.addColorStop(1, '#87ceeb');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Ground
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(0, GROUND_Y_PIXEL, canvas.width, 50);
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y_PIXEL);
    ctx.lineTo(canvas.width, GROUND_Y_PIXEL);
    ctx.stroke();

    // 3. Draw Target
    ctx.beginPath();
    ctx.arc(targetX, GROUND_Y_PIXEL, 10, 0, Math.PI * 2);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(targetX, GROUND_Y_PIXEL, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();

    // 4. Draw Cannon
    drawCannon();

    // 5. Physics Update
    if (isFlying) update();

    // 6. Draw Trail
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    if (trail.length > 0) {
        ctx.moveTo(50 + trail[0].x * SCALE, GROUND_Y_PIXEL - trail[0].y * SCALE);
        trail.forEach(p => {
            ctx.lineTo(50 + p.x * SCALE, GROUND_Y_PIXEL - p.y * SCALE);
        });
    }
    ctx.stroke();

    // 7. Draw Shadow
    if (proj.y > 0) {
        let shadowX = 50 + proj.x * SCALE;
        let shadowScale = 1 - (proj.y / 200);
        ctx.beginPath();
        ctx.ellipse(shadowX, GROUND_Y_PIXEL, 10 * shadowScale, 4 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();
    }

    // 8. Draw Ball
    if (isFlying || proj.y >= 0) {
        let px = 50 + proj.x * SCALE;
        let py = GROUND_Y_PIXEL - proj.y * SCALE;

        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#d32f2f';
        ctx.fill();
        ctx.strokeStyle = '#b71c1c';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // 9. Update HUD
    updateHUD();

    requestAnimationFrame(draw);
}

function drawCannon() {
    const angleRad = (parseFloat(angInput.value) * Math.PI) / 180;
    
    ctx.save();
    ctx.translate(50, GROUND_Y_PIXEL);
    
    ctx.fillStyle = '#555';
    ctx.fillRect(-15, -15, 30, 30);
    
    ctx.rotate(-angleRad);
    
    let grad = ctx.createLinearGradient(0, -8, 0, 8);
    grad.addColorStop(0, '#888');
    grad.addColorStop(0.5, '#ccc');
    grad.addColorStop(1, '#888');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, -8, 50, 16);
    
    ctx.restore();
}

function updateHUD() {
    const speed = Math.sqrt(proj.vx ** 2 + proj.vy ** 2).toFixed(1);
    if (isFlying) {
        hud.innerHTML = `
            Distance: ${proj.x.toFixed(1)} m<br>
            Height: ${proj.y.toFixed(1)} m<br>
            Speed: ${speed} m/s
        `;
    } else if (maxStats.dist > 0) {
        hud.innerHTML = `
            <span style="color:#4caf50">Landed!</span><br>
            Distance: ${maxStats.dist.toFixed(1)} m<br>
            Max Height: ${maxStats.height.toFixed(1)} m<br>
            Final Speed: ${speed} m/s
        `;
    }
}

// --- EVENT LISTENERS ---
velInput.oninput = () => document.getElementById('vVal').innerText = velInput.value;
angInput.oninput = () => document.getElementById('aVal').innerText = angInput.value;
dragInput.oninput = () => document.getElementById('dVal').innerText = (dragInput.value / 1000).toFixed(3);

fireBtn.addEventListener('click', () => {
    const v0 = parseFloat(velInput.value);
    const angleRad = (parseFloat(angInput.value) * Math.PI) / 180;
    
    proj = {
        x: 0, y: 0,
        vx: v0 * Math.cos(angleRad),
        vy: v0 * Math.sin(angleRad)
    };
    trail = [];
    maxStats = { height: 0, dist: 0 };
    time = 0;
    isFlying = true;
});

// Start the loop
draw();
