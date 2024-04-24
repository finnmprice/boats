const express = require('express');
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer);

const TICK_RATE = 90;

let players = [];
let projectiles = [];
let inputsMap = {};

const moveSpeed = 125;

const upgrade = {
  hullStrength: 0,
  autoRepair: 1,
  cannonRange: 2,
  cannonDamage: 3,
  reloadSpeed: 4,
  turnSpeed: 5,
  viewDistance: 6
}

const baseRotSpeed = 90;

let lastTickTime = Date.now();

const upgradeMultipliers = {
  turnSpeed: 5
}

function tick() {
  const now = Date.now();
  const deltaTime = (now - lastTickTime) / 1000;
  lastTickTime = now;

  for (let i = projectiles.length - 1; i >= 0; i--) {
    const projectile = projectiles[i];
    
    const angleInRadians = projectile.rotation * Math.PI / 180;
    const dy = Math.sin(angleInRadians) * 300 * deltaTime;
    const dx = Math.cos(angleInRadians) * 300 * deltaTime;
    projectile.x += dx;
    projectile.y += dy;
    
    const currentTime = Date.now();
    if (currentTime - projectile.creationTime >= projectile.duration) {
      projectiles.splice(i, 1);
    }

    io.emit('projectiles', projectiles);
  }

  for (const player of players) {
    const inputs = inputsMap[player.id];
    if (inputs) {
      if (inputs.right) {
        player.rotation += (baseRotSpeed + upgradeMultipliers.turnSpeed * player.upgrades[upgrade.turnSpeed].level) * deltaTime;
        player.rotation %= 360;
      }
  
      if (inputs.left) {
        player.rotation -= (baseRotSpeed + upgradeMultipliers.turnSpeed * player.upgrades[upgrade.turnSpeed].level) * deltaTime;
        if (player.rotation < 0) {
          player.rotation += 360;
        }
      }
  
      if (inputs.e) {
        fireProjectile(player)
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

    socket.on('player-join', (shipInfo) => {
      console.log(shipInfo.shipId)
      players.push({
        id: shipInfo.shipId,
        x: 100 * 32 / 2,
        y: 100 * 32 / 2,
        rotation: 0,
        health: 100,
        upgrades: [
          { name: "Hull Strength", level: 0 },
          { name: "Auto Repair", level: 0 },
          { name: "Cannon range", level: 0 },
          { name: "Cannon Damage", level: 0 },
          { name: "Reload Speed", level: 0 },
          { name: "Turn Speed", level: 0 },
          { name: "View Distance", level: 0 }
        ],
        upgradesCount: 0,
        lastShotTime: 500,
        fireCooldown: 400,
        coins: 0,
        username: shipInfo.username
      });
      socket.emit('player-joined')
    }); 

    socket.on('updateId', (shipId) => {
      var player = players.find((player) => player.id === shipId);
      if (player) {
        player.id = socket.id;
        socket.emit('id-updated');
      }
      else {
        socket.emit('no-player');
      }
    });
    
    socket.on('inputs', (inputs) => {
      inputsMap[socket.id] = inputs;
    });

    socket.on('giveCoins', (coins) => {
      var player = players.find((player) => player.id === socket.id);
      player.coins += coins;
    });

    socket.on('fireProjectile', (projectile) => {
      var player = players.find((player) => player.id === socket.id);
      fireProjectile(player);
    });    

    socket.on('upgrade', (toUpgrade) => {
      var player = players.find((player) => player.id === socket.id);

      var toUpgrade = player.upgrades[upgrade[toUpgrade]]
      
      if(toUpgrade.level < 10 && player.coins >= 10 * (toUpgrade.level + 1) && player.upgradesCount <= 75) {
        toUpgrade.level++;
        player.coins -= 10 * toUpgrade.level;
        player.upgradesCount++;
        socket.emit('coinUpdate', player.coins)
      }
    })

    socket.on('disconnect', () => {
      players = players.filter((player) => player.id !== socket.id)
    })
  })

  setInterval(tick, 1000 / TICK_RATE);
}

function fireProjectile(player) {
  const currentTime = Date.now();

  if (currentTime - player.lastShotTime >= player.fireCooldown) {
    var rotationRad = player.rotation * Math.PI / 180;

    var duration = 1400;

    projectiles.push({
      id: player.id,
      x: player.x + 35 * Math.sin(-rotationRad),
      y: player.y + 35 * Math.cos(rotationRad),
      rotation: player.rotation + 90,
      size: 12,
      creationTime: currentTime,
      duration: duration
    });

    projectiles.push({
      id: player.id,
      x: player.x - 35 * Math.sin(-rotationRad),
      y: player.y - 35 * Math.cos(rotationRad),
      rotation: player.rotation - 90,
      size: 12,
      creationTime: currentTime,
      duration: duration
    });


    player.lastShotTime = currentTime;
  }
}


app.use(express.static("public"));

httpServer.listen(3000);

main();