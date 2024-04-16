const socket = io('ws://localhost:3000');

const gridImage = new Image();
gridImage.src = '/style/images/gridImage.png'

const boat = new Image();
boat.src = '/style/images/boat.png'

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
    console.log('connected')
})

socket.on('players', (serverPlayers) => {
    players = serverPlayers;
})

socket.on('projectiles', (serverProjectiles) => {
    projectiles = serverProjectiles;
})

socket.on('coinUpdate', (coinsNew) => {
    coins = coinsNew;
    console.log(coins)
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
    if(e.key === 'v') {
        socket.emit('upgrade', 'turnSpeed');
    }
    if(e.key === 'c') {
        socket.emit('giveCoins', 100);
    }
    socket.emit('inputs', inputs);
})

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
    
    for(const projectile of projectiles) {
        canvas.save();
        canvas.translate(projectile.x - camX, projectile.y - camY);
        drawCircle(0, 0, projectile.size, '#6e6c6e');
        canvas.restore();
    };
    
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
    
    
    window.requestAnimationFrame(loop);
}


function roundedRect(x, y, width, height, radius) {
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
    canvas.fill();
}

function drawCircle(x, y, size, color) {
    canvas.beginPath();
    canvas.arc(x, y, size, 0, Math.PI * 2);
    canvas.fillStyle = color;
    canvas.fill();
    canvas.strokeStyle = 'black';
    canvas.lineWidth = 1.5;
    canvas.stroke();
    canvas.closePath();
  }

window.requestAnimationFrame(loop);