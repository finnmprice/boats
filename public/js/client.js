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

socket.on('coinUpdate', (coinsNew) => {
    coins = coinsNew;
    console.log(coins)
})

const inputs = {
    left: false,
    right: false
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
        canvas.lineWidth = 3;
        canvas.textAlign = 'center';
        var text = player.username;
        canvas.strokeText(text, 0, -55);
        canvas.fillText(text, 0, -55);
        canvas.restore();
        
        canvas.save();
        canvas.translate(player.x - camX, player.y - camY);
        canvas.fillStyle = '#4d4c4c';
        roundedRect(canvas, -75 / 2, 0 + 55, 75, 15, 6);
        canvas.fillStyle = '#79d544';
        roundedRect(canvas, -68 / 2, 0 + 55 + 7.5 / 2, player.health * 0.68, 7.5, 7.5/2);
        canvas.restore();
    }

    window.requestAnimationFrame(loop);
}


function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arc(x + width - radius, y + radius, radius, Math.PI * 1.5, Math.PI * 2);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI * 0.5);
    ctx.lineTo(x + radius, y + height);
    ctx.arc(x + radius, y + height - radius, radius, Math.PI * 0.5, Math.PI);
    ctx.lineTo(x, y + radius);
    ctx.arc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
}

window.requestAnimationFrame(loop);