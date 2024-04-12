const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);

const TICK_RATE = 90;

let players = [];
let inputsMap = {};

const moveSpeed = 100;

const baseRotSpeed = 90;

let lastTickTime = Date.now();

function tick() {
  const now = Date.now();
  const deltaTime = (now - lastTickTime) / 1000;
  lastTickTime = now;

  for (const player of players) {
    const inputs = inputsMap[player.id];

    if (inputs.right) {
      player.rotation += baseRotSpeed * deltaTime;
      player.rotation %= 360;
    }
    if (inputs.left) {
      player.rotation -= baseRotSpeed * deltaTime;
      if (player.rotation < 0) {
        player.rotation += 360;
      }
    }

    const angleInRadians = player.rotation * Math.PI / 180;
    const dx = Math.cos(angleInRadians) * moveSpeed * deltaTime;
    const dy = Math.sin(angleInRadians) * moveSpeed * deltaTime;

    player.x += dx;
    player.y += dy;

    let maxBounds = 100 * 32;

    if (player.x < 0) player.x = 0;
    if (player.y < 0) player.y = 0;
    if (player.x > maxBounds) player.x = maxBounds;
    if (player.y > maxBounds) player.y = maxBounds;
  }

  io.emit('players', players);
}

async function main() {
  io.on('connect', (socket) => {
    console.log("user connected", socket.id);

    inputsMap[socket.id] = {
      right: false,
      left: false
    }

    players.push({
      id: socket.id,
      x: 100 * 32 / 2,
      y: 100 * 32 / 2,
      rotation: 0
    });
  
    socket.on('inputs', (inputs) => {
      inputsMap[socket.id] = inputs;
    })

    socket.on('disconnect', () => {
      players = players.filter((player) => player.id !== socket.id)
    })
  })

  setInterval(tick, 1000 / TICK_RATE);
}

app.use(express.static("public"));

httpServer.listen(3000);

main();