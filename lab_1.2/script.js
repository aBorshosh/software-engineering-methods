const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let animationId;
let trajectories = []; 

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

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
    ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); 
    ctx.moveTo(centerX, 0); ctx.lineTo(centerX, canvas.height); 
    ctx.stroke();
}

function drawAllTrajectories(currentScale) {
    trajectories.forEach(traj => {
        ctx.strokeStyle = traj.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        if (traj.points.length > 0) {
            let startX = centerX + (traj.points[0].mathX * currentScale);
            let startY = centerY - (traj.points[0].mathY * currentScale);
            ctx.moveTo(startX, startY);
            
            for (let i = 1; i < traj.points.length; i++) {
                let cx = centerX + (traj.points[i].mathX * currentScale);
                let cy = centerY - (traj.points[i].mathY * currentScale);
                ctx.lineTo(cx, cy);
            }
        }
        ctx.stroke();
    }); 
}

function startSimulation() {
    cancelAnimationFrame(animationId);

    const x0 = parseFloat(document.getElementById('x0').value);
    const y0 = parseFloat(document.getElementById('y0').value);
    const v0 = parseFloat(document.getElementById('v0').value);
    const a = parseFloat(document.getElementById('a').value);
    const angleDeg = parseFloat(document.getElementById('angle').value);
    const scale = parseFloat(document.getElementById('scale').value); 
    const color = document.getElementById('color').value;

    const angleRad = angleDeg * (Math.PI / 180);
    let t = 0;
    const dt = 0.1;
    const tMax = 100;

    let currentTrajectory = {
        color: color,
        points: [] 
    };
    trajectories.push(currentTrajectory);

    function drawFrame() {
        if (t < tMax) {
            let S = (v0 * t) + (0.5 * a * t * t);
            let mathX = x0 + S * Math.cos(angleRad);
            let mathY = y0 + S * Math.sin(angleRad);

            currentTrajectory.points.push({ mathX: mathX, mathY: mathY });

            let canvasX = centerX + (mathX * scale);
            let canvasY = centerY - (mathY * scale);

            drawGrid();
            drawAllTrajectories(scale);

            if (canvasX > canvas.width || canvasY < 0 || canvasX < 0 || canvasY > canvas.height) {
                return; 
            }

            t += dt;
            animationId = requestAnimationFrame(drawFrame);
        }
    }

    drawFrame();
}

document.getElementById('startBtn').addEventListener('click', startSimulation);

document.getElementById('clearBtn').addEventListener('click', () => {
    cancelAnimationFrame(animationId);
    trajectories = []; 
    drawGrid(); 
});

drawGrid();