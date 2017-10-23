// Libraries
var Config = require('./config');
var Logger = require('./Logger');
var Player = require('./Player');
var Food = require('./food');
var Packet = require('./packet');

// Imports
var WebSocket = require('ws');

function GameServer() {
  this.config = Config;
  this.logger = new Logger();
  this.logger.setVerbose(this.config.verbose);
  this.protocolVersion = 1;

  this.socketServer = null;
  this.players = [];
  this.food = [];
  this.nextAvailablePid = 1;
  this.nextAvailableBid = 1;
  this.gameLoop = null;
  this.foodLoop = null;
  this.cleanupLoop = null;
}

module.exports = GameServer;

GameServer.prototype.start = function() {
  this.socketServer = WebSocket.Server({ port: this.config.serverPort }, function() {
    this.logger.log('Listening on port ' + this.config.serverPort, true);

    // Spawn initial food
    this.spawnFood();

    // Setup automatic loops
    this.gameLoop = setInterval(this.update.bind(this), 1);
    this.foodLoop = setInterval(this.spawnFood.bind(this), 30000); // every 30 seconds
    this.cleanupLoop = setInterval(this.cleanup.bind(this), 1000);
  }.bind(this));

  this.socketServer.on('error', function(error) {
    switch (error.code) {
      case 'EADDRINUSE':
        this.logger.log('Port already in use. Please change the port in config.');
        break;
      case 'EACCES':
        this.logger.log('Permissions require. Try to run as root with \'sudo\'.');
        break;
      default:
        this.logger.log('Unhandled Error: ' + error.code);
        break;
    }
  }.bind(this));

  this.socketServer.on('connection', handleConnection.bind(this));

  function handleConnection(ws) {
    // Just to make it neater
    ws.remoteAddress = ws._socket.remoteAddress;

    // Log Connection
    this.logger.onClientConnect(ws);

    // Check if server is full
    if (this.players.length >= this.config.maxPlayers) {
      ws.close();
      this.logger.onClientDisconnect(ws, "Server Full");
      return;
    }

    // Create the player obj
    var player = new Player(ws, this);

    // Add handlers for client disconnect / socket error
    var obj = {
      'socket': ws,
      'server': this
    };
    ws.on('error', function(error) {
      player.destroy();
      this.server.broadcastForgetPlayer([player]);
      this.server.logger.onClientDisconnect(this.socket, error);
    }.bind(obj));
    ws.on('close', function() {
      player.destroy();
      this.server.broadcastForgetPlayer([player]);
      this.server.logger.onClientDisconnect(this.socket);
    }.bind(obj));

    // Add player to players array
    this.players.push(player);
  }
}

GameServer.prototype.update = function() {
  this.players.forEach(function(player) {
    player.update();
  });
};

GameServer.prototype.spawnFood = function() {
  var squaresPending   = 0,
      trianglesPending = 0,
      pentagonsPending = 0;

  this.food.forEach(function(food) {
    switch(food.id) {
      case 0: // Square
        squaresPending++;
        break;
      case 1: // Triangle
        trianglesPending++;
        break;
      case 2: // Pentagon
        pentagonsPending++;
        break;
    }
  });

  squaresPending = this.config.maxSquareFood - squaresPending;
  trianglesPending = this.config.maxTriangleFood - trianglesPending;
  pentagonsPending = this.config.maxPentagonFood - pentagonsPending;

  if (squaresPending > this.config.perFoodtypeSpawnAmount)
    squaresPending = this.config.perFoodtypeSpawnAmount;
  if (trianglesPending > this.config.perFoodtypeSpawnAmount)
    trianglesPending = this.config.perFoodtypeSpawnAmount;
  if (pentagonsPending > this.config.perFoodtypeSpawnAmount)
    pentagonsPending = this.config.perFoodtypeSpawnAmount;

  // Spawn Squares
  for (var i = 0; i < squaresPending; i++) {
    var square = new Food.Square;
    square.setPosition(this.safePosition());
    this.food.push(square);
  }

  // Spawn Triangles
  for (var i = 0; i < trianglesPending; i++) {
    var triangle = new Food.Triangle;
    triangle.setPosition(this.safePosition());
    this.food.push(triangle);
  }

  // Spawn Pentagons
  for (var i = 0; i < pentagonsPending; i++) {
    var pentagon = new Food.Pentagon;
    pentagon.setPosition(this.safePosition());
    this.food.push(pentagon);
  }

  // Notify Players of newly added food
  this.players.forEach(function(player){
    player.updateFood();
  });
};

GameServer.prototype.cleanup = function() {
  // Called every 1 second
  var time = Date.now();
  this.players.forEach(function(player, index) {
    if (player.socket.readyState == WebSocket.CLOSED) {
      // Player has disconnected
      this.players.splice(index, 1);
    } else {
      // Cleanup each players old known bullets
      player.knownBullets.forEach(function(bullet, bindex) {
        if (time > bullet.eol) {
          player.knownBullets.splice(bindex, 1);
        }
      });
    }
  }.bind(this));
};

GameServer.prototype.getNextAvailablePid = function() {
  if (this.nextAvailablePid > 4294967295) {
    this.nextAvailablePid = 1;
  }
  return this.nextAvailablePid++;
};

// Generates new projectile id
GameServer.prototype.getNextAvailableBid = function() {
  if (this.nextAvailableBid > 4294967295) {
    this.nextAvailableBid = 1;
  }
  return this.nextAvailableBid++;
}

GameServer.prototype.randomPosition = function() {
  var position = {
    "x": Math.floor((Math.random() * this.config.worldSize) + 1),
    "y": Math.floor((Math.random() * this.config.worldSize) + 1)
  };
  return position;
};

GameServer.prototype.safePosition = function() {
  // [TODO] return random position where no player/food is closeby
  var attemptCounter = 0;
  var safe = false;
  var position;
  while (!safe) {
    position = this.randomPosition();
    if (attemptCounter > 500) {
      this.logger.log("Could not find a safe location in 500 tries. Giving up...");
      break;
    }
    attemptCounter++;
    safe = true;

    var i;
    for (i = 0; i < this.players.length; i++) {
      if (Math.abs(this.players[i].position.x - position.x) < 100 &&
          Math.abs(this.players[i].position.y - position.y) < 100) {
        safe = false;
        break;
      }
    }
    if (!safe) {
      continue;
    }

    for (i = 0; i < this.food.length; i++) {
      if (Math.abs(this.food[i].position.x - position.x) < 100 &&
          Math.abs(this.food[i].position.y - position.y) < 100) {
        safe = false;
        break;
      }
    }
  }
  return position;
};

GameServer.prototype.broadcastForgetPlayer = function(forgetPlayers) {
  var notifyPlayers = [];
  for (var i = 0; i < this.players.length; i++) {
    if (!this.players[i].playing) {
      continue;
    }
    for (var o = 0; o < forgetPlayers.length; o++) {
      if (this.players[i].knownPlayers.indexOf(forgetPlayers[o].id) > -1) {
        notifyPlayers.push(this.players[i]);
      }
    }
  }
  notifyPlayers.forEach(function(player) {
    player.socket.sendPacket(new Packet.ForgetPlayer(player.socket, forgetPlayers));
  });
};

WebSocket.prototype.sendPacket = function(packet, callback) {
  if (this.readyState == WebSocket.OPEN && packet.build) {
    var buffer = packet.build();
    this.send(buffer, { binary: true });
    if (typeof callback == 'function') callback(true);
  } else {
    if (typeof callback == 'function') callback(false);
  }
};
