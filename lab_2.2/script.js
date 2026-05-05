const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let animationId;
let trajectories = []; 

const g = 9.81;
const scale = 10; 
const originX = 20;
const originY = canvas.height - 20;

const bodyImg = new Image();
bodyImg.src = 'body.png';
const imgSize = 24;

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= canvas.width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
    }

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(originX, 0); ctx.lineTo(originX, canvas.height); 
    ctx.moveTo(0, originY); ctx.lineTo(canvas.width, originY); 
    ctx.stroke();
}

function drawAllTrajectories() {
    trajectories.forEach(traj => {
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        if (traj.points.length > 0) {
            let startX = originX + (traj.points[0].mathX * scale);
            let startY = originY - (traj.points[0].mathY * scale);
            ctx.moveTo(startX, startY);
            
            for (let i = 1; i < traj.points.length; i++) {
                let cx = originX + (traj.points[i].mathX * scale);
                let cy = originY - (traj.points[i].mathY * scale);
                ctx.lineTo(cx, cy);
            }
        }
        ctx.stroke();
    }); 
}

function startSimulation() {
    cancelAnimationFrame(animationId);

    const v0 = parseFloat(document.getElementById('v0').value);
    const angleDeg = parseFloat(document.getElementById('angle').value);
    const h0 = parseFloat(document.getElementById('h0').value);
    const color = document.getElementById('color').value;

    if (isNaN(v0) || isNaN(angleDeg) || isNaN(h0)) {
        alert("Будь ласка, введіть коректні числові значення.");
        return;
    }
    if (v0 < 0) {
        alert("Помилка: Швидкість не може бути від'ємною!");
        return;
    }
    if (angleDeg < 0 || angleDeg > 90) {
        alert("Помилка: Кут має бути в межах від 0 до 90 градусів!");
        return;
    }
    if (h0 < 0) {
        alert("Помилка: Початкова висота не може бути від'ємною!");
        return;
    }

    const angleRad = angleDeg * (Math.PI / 180);
    
    const a_eq = -0.5 * g;
    const b_eq = v0 * Math.sin(angleRad);
    const c_eq = h0;
    const discriminant = b_eq * b_eq - 4 * a_eq * c_eq;
    
    let tMax = 0;
    if (discriminant >= 0) {
        const t1 = (-b_eq + Math.sqrt(discriminant)) / (2 * a_eq);
        const t2 = (-b_eq - Math.sqrt(discriminant)) / (2 * a_eq);
        tMax = Math.max(t1, t2); 
    }

    const hMax = h0 + Math.pow(v0 * Math.sin(angleRad), 2) / (2 * g);
    const lMax = v0 * Math.cos(angleRad) * tMax;

    document.getElementById('resTime').innerText = tMax.toFixed(2);
    document.getElementById('resDist').innerText = lMax.toFixed(2);
    document.getElementById('resHeight').innerText = hMax.toFixed(2);

    let t = 0;
    
    const dt = 0.015; 

    let currentTrajectory = {
        color: color,
        points: [] 
    };
    trajectories.push(currentTrajectory);

    function drawFrame() {
        let mathX, mathY;

        if (t <= tMax) {
            mathX = v0 * Math.cos(angleRad) * t;
            mathY = h0 + v0 * Math.sin(angleRad) * t - (0.5 * g * t * t);
            if (mathY < 0) mathY = 0; 
            t += dt;
        } else {
            mathX = v0 * Math.cos(angleRad) * tMax;
            mathY = 0;
        }

        currentTrajectory.points.push({ mathX: mathX, mathY: mathY });

        drawGrid();
        drawAllTrajectories();

        let screenX = originX + (mathX * scale);
        let screenY = originY - (mathY * scale);

        if (bodyImg.complete && bodyImg.naturalWidth !== 0) {
            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.rotate(t * 8); 
            ctx.drawImage(bodyImg, -imgSize/2, -imgSize/2, imgSize, imgSize);
            ctx.restore();
        } else {
            ctx.fillStyle = color;
            ctx.beginPath(); ctx.arc(screenX, screenY, 5, 0, Math.PI * 2); ctx.fill();
        }

        if (t <= tMax) {
            animationId = requestAnimationFrame(drawFrame);
        }
    }

    drawFrame();
}

document.getElementById('startBtn').addEventListener('click', startSimulation);

document.getElementById('clearBtn').addEventListener('click', () => {
    cancelAnimationFrame(animationId);
    trajectories = []; 
    document.getElementById('resTime').innerText = "-";
    document.getElementById('resDist').innerText = "-";
    document.getElementById('resHeight').innerText = "-";
    drawGrid(); 
});

drawGrid();