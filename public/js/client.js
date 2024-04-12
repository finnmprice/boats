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

const TILE_SIZE = 32;
const MAP_SIZE = 100;
const PLAYER_SIZE = TILE_SIZE * 3;

socket.on('connect', () => {
    console.log('connected')
})

socket.on('players', (serverPlayers) => {
    players = serverPlayers;
})

const inputs = {
    left: false,
    right: false
}

window.addEventListener('keydown', (e) => {
    if(e.key === 'a') {
        inputs.left = true;
    }
    if(e.key === 'd') {
        inputs.right = true;
    }
    socket.emit('inputs', inputs);
})

window.addEventListener('keyup', (e) => {
    if(e.key === 'a') {
        inputs.left = false;
    }
    if(e.key === 'd') {
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
    }

    window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);