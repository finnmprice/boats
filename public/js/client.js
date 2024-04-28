const shipId = sessionStorage.getItem('shipId');
const socket = io('ws://localhost:3000');

console.log(shipId);

const gridImage = new Image();
gridImage.src = '/style/images/gridImage.png'

const boat = new Image();
boat.src = '/style/images/boat.png';

var playerConnected = false;

const canvasEl = document.getElementById("canvas");
canvasEl.width = window.innerWidth;
canvasEl.height = window.innerHeight;
const canvas = canvasEl.getContext("2d");

let players = [];
let projectiles = [];
let leaderboard = [];
let coins = 0;

const TILE_SIZE = 32;
const MAP_SIZE = 100;
const PLAYER_SIZE = TILE_SIZE * 3;

socket.on('connect', () => {
    socket.emit('updateId', shipId);
})

socket.on('no-player', () => {
    window.location.href = '/';
});

socket.on('id-updated', () => {
    playerConnected = true;
});

socket.on('players', (serverPlayers) => {
    players = serverPlayers;
})

socket.on('projectiles', (serverProjectiles) => {
    projectiles = serverProjectiles;
})

socket.on('coinUpdate', (coinsNew) => {
    coins = coinsNew;
})

window.addEventListener('click', () => {
    fireProjectile();
});

function fireProjectile() {
    socket.emit('fireProjectile', true);
}

const inputs = {
    left: false,
    right: false,
    e: false
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

window.addEventListener('keydown', (e) => {
    if(e.key === 'a' || e.key === 'ArrowLeft') {
        inputs.left = true;
    }
    if(e.key === 'd' || e.key === 'ArrowRight') {
        inputs.right = true;
    }
    if(e.key === 'e') {
        inputs.e = !inputs.e;
    }
    if(e.key === ' ') {
        fireProjectile();
    }
    if(e.key === 'c') {
        socket.emit('giveCoins', 100);
    }

    if (e.key >= '1' && e.key <= '7') {
        socket.emit('upgrade', e.key);
    }

    socket.emit('inputs', inputs);
});


window.addEventListener('keyup', (e) => {
    if(e.key === 'a' || e.key === 'ArrowLeft') {
        inputs.left = false;
    }
    if(e.key === 'd' || e.key === 'ArrowRight') {
        inputs.right = false;
    }
    socket.emit('inputs', inputs);
})


function loop() {
    canvas.clearRect(0, 0, canvasEl.width, canvasEl.height);
    
    canvas.fillStyle = '#adb4db';
    canvas.fillRect(0, 0, canvasEl.width, canvasEl.height);
    const myPlayer = players.find((player) => player.id === socket.id);
    let camX = 0;
    let camY = 0;
    if(myPlayer) {
        camX = myPlayer.x - canvasEl.width / 2;
        camY = myPlayer.y - canvasEl.height / 2;
    }
    for (let row = 0; row < MAP_SIZE; row++) {
        for (let col = 0; col < MAP_SIZE; col++) {
            canvas.drawImage(gridImage,
                col * TILE_SIZE - camX,
                row * TILE_SIZE - camY,
                TILE_SIZE,
                TILE_SIZE);
        }
    }

    drawProjectiles(camX, camY)
    drawPlayers(camX, camY)
    drawUI(myPlayer)

    // UI
    window.requestAnimationFrame(loop);
}

function drawProjectiles(camX, camY) {
    for(const projectile of projectiles) {
        canvas.save();
        canvas.translate(projectile.x - camX, projectile.y - camY);
        drawCircle(0, 0, projectile.size, '#6e6c6e', true);
        canvas.restore();
    };
}

function drawPlayers(camX, camY) {
    for(const player of players) {
        canvas.save();
        canvas.translate(player.x - camX, player.y - camY);
        canvas.rotate((player.rotation + 90) * Math.PI / 180);
        canvas.translate(-PLAYER_SIZE / 2, -PLAYER_SIZE / 2);
        canvas.drawImage(boat, 0, 0, PLAYER_SIZE, PLAYER_SIZE);
        canvas.restore();
        
        canvas.save();
        canvas.translate(player.x - camX, player.y - camY);
        canvas.font = "32px doblon";
        canvas.fillStyle = 'white';
        canvas.strokeStyle = 'black';
        canvas.lineWidth = 4;
        canvas.textAlign = 'center';
        var text = player.username;
        canvas.strokeText(text, 0, -55);
        canvas.fillText(text, 0, -55);
        canvas.restore();
        
        canvas.save();
        canvas.translate(player.x - camX, player.y - camY);
        canvas.fillStyle = '#4d4c4c';
        roundedRect(-75 / 2, 0 + 55, 75, 15, 6);
        canvas.fillStyle = '#79d544';
        roundedRect(-68 / 2, 0 + 55 + 7.5 / 2, player.health * 0.68, 7.5, 7.5/2);
        canvas.restore();
    }
}

function drawUI(myPlayer) {
    if(playerConnected && myPlayer) {
        roundedRect(20, 20, 190, 35, 5, 'rgba(0, 0, 0, 0.4)');
        roundedRect(20, 60, 190, 35, 5, 'rgba(0, 0, 0, 0.4)');
        
        // coins text
        canvas.font = "16px doblon";
        canvas.strokeStyle = 'black';
        canvas.textAlign = 'center'; 
        var coinsText = "coins";
        var coinsValueText = `$${myPlayer.coins}`;
        var coinsTextWidth = canvas.measureText(coinsText).width;
        var coinsValueTextWidth = canvas.measureText(coinsValueText).width;
        var totalWidth = coinsTextWidth + coinsValueTextWidth;
        var startX = 130 - (totalWidth / 2);
        canvas.fillStyle = 'white';
        canvas.fillText(coinsText, startX, 43);
        var coinsValueStartX = startX + coinsTextWidth - 15;
        canvas.fillStyle = 'rgba(255, 255, 255, 0.5)';
        canvas.textAlign = 'left'; 
        canvas.fillText(coinsValueText, coinsValueStartX, 43);
        
        // upgrade count
        canvas.font = "16px doblon";
        canvas.fillStyle = 'white';
        canvas.textAlign = 'center';
        canvas.fillText(`Upgrades ${myPlayer.upgradesCount}/75`, 115, 83);

        // upgrade bars
        for (let i = 0; i < 7; i++) {
            var upgrade = myPlayer.upgrades[i];
            var coins = upgrade.level < 10 ? '$' + (upgrade.level + 1) * 10: 'max';
            
            roundedRect(20, 10 * (i + 1) + i * 20 + 90, 160, 25, 5, 'rgba(0, 0, 0, 0.4)');
            if(upgrade.level > 0) {
                roundedRect(25, 10 * (i + 1) + i * 20 + 95, 150 * upgrade.level / 10, 15, 5, 'rgba(255, 255, 255, 0.4)');
            }
            
            canvas.font = "12px doblon";
            canvas.strokeStyle = 'black';
            canvas.lineWidth = 0;
            var nameText = upgrade.name;
            var levelText = ` ${coins}`;
            const nameWidth = canvas.measureText(nameText).width;
            const levelWidth = canvas.measureText(levelText).width;
            const totalWidth = nameWidth + levelWidth;
            const startX = 100 - (totalWidth / 2);
            canvas.fillStyle = 'white';
            canvas.textAlign = 'left';
            canvas.fillText(nameText, startX, 117 + i * 30);
            canvas.fillText(i + 1, 190, 117 + i * 30);
            canvas.fillStyle = 'rgba(255, 255, 255, 0.5)';
            canvas.fillText(levelText, startX + nameWidth, 117 + i * 30);
        }

        // minimap
        roundedRect(canvasEl.width - 110, canvasEl.height - 110, 100, 100, 5, 'rgba(0, 0, 0, 0.5)');
        drawCircle(canvasEl.width - 105 + (myPlayer.x / (MAP_SIZE * TILE_SIZE)) * 90, canvasEl.height - 105 + (myPlayer.y / (MAP_SIZE * TILE_SIZE)) * 90, 3, "rgba(255, 255, 255, 0.5)", false);
    }
}


function roundedRect(x, y, width, height, radius, color) {
    canvas.beginPath();
    canvas.moveTo(x + radius, y);
    canvas.lineTo(x + width - radius, y);
    canvas.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);
    canvas.lineTo(x + width, y + height - radius);
    canvas.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
    canvas.lineTo(x + radius, y + height);
    canvas.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
    canvas.lineTo(x, y + radius);
    canvas.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    canvas.closePath();
    canvas.fillStyle = color;
    canvas.fill();
}

function drawCircle(x, y, size, color, border) {
    canvas.beginPath();
    canvas.arc(x, y, size, 0, Math.PI * 2);
    canvas.fillStyle = color;
    canvas.fill();
    canvas.strokeStyle = 'black';
    canvas.lineWidth = 1.5;
    if(border) {canvas.stroke();}
    canvas.closePath();
  }

window.requestAnimationFrame(loop);