document.addEventListener("DOMContentLoaded", function() {
    const data5 = [{x: 1, y: 5.2}, {x: 2, y: 4.8}, {x: 3, y: 4.5}, {x: 4, y: 4.1}, {x: 5, y: 3.8}];
    const data10 = [{x: 0, y: 5}, {x: 1, y: 4.8}, {x: 2, y: 4.5}, {x: 3, y: 4.1}, {x: 4, y: 3.6}, {x: 5, y: 3.0}, {x: 6, y: 2.2}, {x: 7, y: 1.3}, {x: 8, y: 0.2}];
    const data20 = [{x: 0, y: 5.0}, {x: 0.5, y: 4.9}, {x: 1.0, y: 4.7}, {x: 1.5, y: 4.4}, {x: 2.0, y: 4.1}, {x: 2.5, y: 3.8}, {x: 3.0, y: 3.2}, {x: 3.5, y: 2.7}, {x: 4.0, y: 2.1}, {x: 4.5, y: 1.4}, {x: 5.0, y: 0.6}, {x: 5.5, y: -0.3}, {x: 6.0, y: -1.2}, {x: 6.5, y: -2.1}, {x: 7.0, y: -3.2}, {x: 7.5, y: -4.3}, {x: 8.0, y: -5.5}, {x: 8.5, y: -6.8}, {x: 9.0, y: -8.1}, {x: 9.5, y: -9.5}];

    let currentData = data5;
    let currentMethod = null;
    let chartInstance = null;

    function calcLagrange(x, points) {
        let result = 0;
        for (let i = 0; i < points.length; i++) {
            let term = points[i].y;
            for (let j = 0; j < points.length; j++) {
                if (j !== i) term = term * (x - points[j].x) / (points[i].x - points[j].x);
            }
            result += term;
        }
        return result;
    }

    function calcMNK(points) {
        let n = points.length;
        let sumX = 0, sumX2 = 0, sumX3 = 0, sumX4 = 0, sumY = 0, sumXY = 0, sumX2Y = 0;
        points.forEach(p => {
            sumX += p.x; sumX2 += p.x*p.x; sumX3 += Math.pow(p.x, 3); sumX4 += Math.pow(p.x, 4);
            sumY += p.y; sumXY += p.x*p.y; sumX2Y += p.x*p.x*p.y;
        });
        
        const A = [
            [sumX4, sumX3, sumX2], 
            [sumX3, sumX2, sumX], 
            [sumX2, sumX, n]
        ];
        const B = [[sumX2Y], [sumXY], [sumY]];
        
        try {
            const sol = math.lusolve(A, B);
            return { a: sol[0][0], b: sol[1][0], c: sol[2][0] };
        } catch(e) { 
            return { a: 0, b: 0, c: 0 }; 
        }
    }

    function getFullCurvePoints() {
        let minX = Math.min(...currentData.map(p => p.x));
        let maxX = Math.max(...currentData.map(p => p.x));
        let step = (maxX - minX) / 80;
        
        let xValues = new Set();
        for (let x = minX; x <= maxX; x += step) xValues.add(Number(x.toFixed(4)));
        currentData.forEach(p => xValues.add(p.x));
        
        let sortedX = Array.from(xValues).sort((a, b) => a - b);
        let points = [];
        let mnkCoeffs = currentMethod === 'mnk' ? calcMNK(currentData) : null;

        sortedX.forEach(x => {
            let y = currentMethod === 'lagrange' 
                ? calcLagrange(x, currentData) 
                : mnkCoeffs.a * x * x + mnkCoeffs.b * x + mnkCoeffs.c;
            points.push({x: x, y: y});
        });
        return points;
    }

    function renderCurve() {
        if (!currentMethod) return;
        const targetPoints = getFullCurvePoints();
        chartInstance.data.datasets[1].data = targetPoints;
        chartInstance.update();
    }

    function renderBaseChart() {
        const ctx = document.getElementById('mainCanvas').getContext('2d');
        if (chartInstance) chartInstance.destroy();

        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [
                    { label: 'Вузли', data: currentData, backgroundColor: '#ffffff', borderColor: '#ffffff', pointRadius: 6, showLine: false, order: 1 },
                    { label: 'Крива', data: [], borderColor: '#888888', borderWidth: 2, fill: false, pointRadius: 0, tension: 0.35, order: 2 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, animation: false, layout: { padding: 20 },
                scales: {
                    x: { type: 'linear', position: 'bottom', grid: { color: '#333333' }, ticks: { color: '#aaaaaa' } },
                    y: { grid: { color: '#333333' }, ticks: { color: '#aaaaaa' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    document.getElementById('pointSelector').addEventListener('change', function() {
        let val = this.value;
        if (val === '5') currentData = data5; 
        else if (val === '10') currentData = data10; 
        else currentData = data20;
        
        currentMethod = null;
        document.getElementById('btnLagrange').classList.remove('active');
        document.getElementById('btnMNK').classList.remove('active');
        renderBaseChart();
    });

    document.getElementById('btnLagrange').addEventListener('click', function() {
        currentMethod = 'lagrange';
        this.classList.add('active');
        document.getElementById('btnMNK').classList.remove('active');
        renderCurve();
    });

    document.getElementById('btnMNK').addEventListener('click', function() {
        currentMethod = 'mnk';
        this.classList.add('active');
        document.getElementById('btnLagrange').classList.remove('active');
        renderCurve();
    });

    renderBaseChart();
});