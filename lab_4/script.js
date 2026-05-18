document.addEventListener("DOMContentLoaded", function() {
    const data5 = [{x: 1, y: 5.2}, {x: 2, y: 4.8}, {x: 3, y: 4.5}, {x: 4, y: 4.1}, {x: 5, y: 3.8}];
    const data10 = [{x: 0, y: 5}, {x: 1, y: 4.8}, {x: 2, y: 4.5}, {x: 3, y: 4.1}, {x: 4, y: 3.6}, {x: 5, y: 3.0}, {x: 6, y: 2.2}, {x: 7, y: 1.3}, {x: 8, y: 0.2}];
    const data20 = [{x: 0, y: 5.0}, {x: 0.5, y: 4.9}, {x: 1.0, y: 4.7}, {x: 1.5, y: 4.4}, {x: 2.0, y: 4.1}, {x: 2.5, y: 3.8}, {x: 3.0, y: 3.2}, {x: 3.5, y: 2.7}, {x: 4.0, y: 2.1}, {x: 4.5, y: 1.4}, {x: 5.0, y: 0.6}, {x: 5.5, y: -0.3}, {x: 6.0, y: -1.2}, {x: 6.5, y: -2.1}, {x: 7.0, y: -3.2}, {x: 7.5, y: -4.3}, {x: 8.0, y: -5.5}, {x: 8.5, y: -6.8}, {x: 9.0, y: -8.1}, {x: 9.5, y: -9.5}];

    let currentData = data5;

    document.getElementById('pointSelector').addEventListener('change', function() {
        let val = this.value;
        if (val === '5') currentData = data5;
        else if (val === '10') currentData = data10;
        else if (val === '20') currentData = data20;
        console.log("Обрано масив точок:", currentData.length);
    });
});