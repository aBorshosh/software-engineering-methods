const sleep = ms => new Promise(r => setTimeout(r, ms));

document.getElementById('method').addEventListener('change', function() {
    document.getElementById('max-val').innerText = '0';
    document.getElementById('selected-items').innerText = '-';

    if (this.value === "4") {
        prepareEmptyTable();
    } else {
        document.getElementById('dp-visualization').innerHTML = '';
    }
});

function prepareEmptyTable() {
    const W = parseInt(document.getElementById('capacity').value);
    const wStr = document.getElementById('weights').value.split(',').map(n => parseInt(n.trim()));
    const vStr = document.getElementById('values').value.split(',').map(n => parseInt(n.trim()));
    const n = wStr.length;
    
    const visContainer = document.getElementById('dp-visualization');
    visContainer.innerHTML = '<h2>Таблиця станів алгоритму (dp[i][w])</h2>';
    
    let table = document.createElement('table');
    let thead = document.createElement('thead');
    let tbody = document.createElement('tbody');
    
    let trHead = document.createElement('tr');
    trHead.innerHTML = '<th>i \\ w</th>';
    for (let w = 0; w <= W; w++) trHead.innerHTML += `<th>${w}</th>`;
    thead.appendChild(trHead);
    table.appendChild(thead);

    for (let i = 0; i <= n; i++) {
        let tr = document.createElement('tr');
        
        let thTitle = i === 0 ? '0' : `Предмет ${i} (w:${wStr[i-1]}, v:${vStr[i-1]})`;
        tr.innerHTML = `<th>${thTitle}</th>`;
        
        for (let w = 0; w <= W; w++) {
            tr.innerHTML += `<td id="cell-${i}-${w}">-</td>`;
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    visContainer.appendChild(table);
}

document.getElementById('calculate-btn').addEventListener('click', async () => {
    const W = parseInt(document.getElementById('capacity').value);
    const weights = document.getElementById('weights').value.split(',').map(n => parseInt(n.trim()));
    const values = document.getElementById('values').value.split(',').map(n => parseInt(n.trim()));
    const method = parseInt(document.getElementById('method').value);
    const n = weights.length;

    let result = { maxVal: 0, items: [] };

    switch(method) {
        case 1: result = solveBruteForce(W, weights, values, n); break;
        case 2: result = solveRecursive(W, weights, values, n); break;
        case 3: result = solveGreedy(W, weights, values, n); break;
        case 4: 
            if (!document.querySelector('#dp-visualization table')) prepareEmptyTable();
            result = await runDPWithAnimation(W, weights, values, n); 
            break;
        case 5: result = solveBranchAndBound(W, weights, values, n); break;
    }

    document.getElementById('max-val').innerText = result.maxVal;
    document.getElementById('selected-items').innerText = result.items.length > 0 ? result.items.join(', ') : 'Нічого не помістилось';
});


function solveBruteForce(W, weights, values, n) {
    let maxVal = 0;
    let bestCombo = [];
    for (let i = 0; i < (1 << n); i++) {
        let currentW = 0, currentV = 0, combo = [];
        for (let j = 0; j < n; j++) {
            if ((i & (1 << j)) !== 0) {
                currentW += weights[j];
                currentV += values[j];
                combo.push(j + 1);
            }
        }
        if (currentW <= W && currentV > maxVal) {
            maxVal = currentV;
            bestCombo = combo;
        }
    }
    return { maxVal, items: bestCombo };
}

function solveRecursive(W, weights, values, n) {
    function rec(i, currentW) {
        if (i === 0 || currentW === 0) return { v: 0, items: [] };
        if (weights[i - 1] > currentW) return rec(i - 1, currentW);
        
        let withoutItem = rec(i - 1, currentW);
        let withItem = rec(i - 1, currentW - weights[i - 1]);
        withItem.v += values[i - 1];
        
        if (withItem.v > withoutItem.v) {
            return { v: withItem.v, items: [...withItem.items, i] };
        } else {
            return withoutItem;
        }
    }
    let res = rec(n, W);
    return { maxVal: res.v, items: res.items.reverse() };
}

function solveGreedy(W, weights, values, n) {
    let items = weights.map((w, i) => ({ w, v: values[i], id: i + 1, ratio: values[i] / w }));
    items.sort((a, b) => b.ratio - a.ratio); 
    
    let maxVal = 0, currentW = W, bestCombo = [];
    for (let item of items) {
        if (item.w <= currentW) {
            currentW -= item.w;
            maxVal += item.v;
            bestCombo.push(item.id);
        }
    }
    return { maxVal, items: bestCombo.sort((a,b) => a-b) };
}

async function runDPWithAnimation(W, weights, values, n) {
    let dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));

    for (let i = 0; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
            const cell = document.getElementById(`cell-${i}-${w}`);
            cell.classList.add('cell-processing');

            if (i === 0 || w === 0) {
                dp[i][w] = 0;
            } else if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }

            await sleep(20); 
            cell.innerText = dp[i][w];
            cell.classList.remove('cell-processing');
        }
    }

    let resItems = [];
    let currW = W;
    for (let i = n; i > 0 && currW > 0; i--) {
        if (dp[i][currW] !== dp[i - 1][currW]) {
            resItems.push(i);
            document.getElementById(`cell-${i}-${currW}`).classList.add('cell-optimal');
            currW -= weights[i - 1];
        } else {
            document.getElementById(`cell-${i}-${currW}`).style.backgroundColor = '#2c3e2c';
        }
    }
    document.getElementById(`cell-0-${currW}`).style.backgroundColor = '#2c3e2c';

    return { maxVal: dp[n][W], items: resItems.reverse() };
}

function solveBranchAndBound(W, weights, values, n) {
    let maxVal = 0;
    let bestCombo = [];
    
    function dfs(i, currentW, currentV, combo) {
        if (currentW <= W && currentV > maxVal) {
            maxVal = currentV;
            bestCombo = [...combo];
        }
        if (i === n) return;
        
        if (currentW + weights[i] <= W) {
            dfs(i + 1, currentW + weights[i], currentV + values[i], [...combo, i + 1]);
        }
        
        let remainingBound = currentV;
        for (let j = i + 1; j < n; j++) remainingBound += values[j];
        
        if (remainingBound > maxVal) {
            dfs(i + 1, currentW, currentV, combo);
        }
    }
    
    dfs(0, 0, 0, []);
    return { maxVal, items: bestCombo };
}