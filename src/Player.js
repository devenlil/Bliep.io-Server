var WebSocket = require('ws');
var PacketHandler = require('./PacketHandler');
var Packet = require('./packet');
var Tank = require('./tank');

function Player(socket, gameServer) {
  this.socket = socket;
  this.gameServer = gameServer;
  this.packetHandler = new PacketHandler(this);
  this.deletable = false; // must be true for clean-up

  // Status Vars
  this.handshake = null; // time when sent
  this.verified = false;
  this.playing = false;
  this.liveLoop = null; // notifyUpdate loop

  this.id = gameServer.getNextAvailablePid();
  this.nick = null;
  this.tank = null;
  this.score = 0;
  this.position = { "x": null, "y": null };
  this.aimAngle = 0; // raidans
  this.stationary = true;
  this.velocity = { "x": 0, "y": 0 };
  this.targetVelocity = { "x": 0, "y": 0 };

  this.viewRadius = 1000;
  this.knownPlayers = []; // Array of player ids
  this.knownBullets = []; // Array of obj {"id": bullet_id, "time": eol_time }
  this.knownFood = [];
}

module.exports = Player;

// Logic Update
Player.prototype.update = function() {
  if (!this.verified) {
    if (!this.handshake) {
      this.socket.sendPacket(new Packet.Handshake(this.gameServer.config.worldSize),
      function(sent) {
        if (sent) {
          this.handshake = Date.now();
        }
      }.bind(this));
    } else {
      if (Date.now() - this.handshake > 10000) {
        this.gameServer.logger.onClientDisconnect(this, "No Handshake");
        this.destroy();
      }
    }
    return;
  }
  if (!this.playing || this.socket.readyState != WebSocket.OPEN) return;

  if (!this.stationary) {
    /*if (this.targetVelocity.x > this.velocity.x) {
      this.velocity.x += (this.targetVelocity.x-this.velocity.x)/5.0;
    } else if (this.targetVelocity.x < this.velocity.x) {
      this.velocity.x -= (this.targetVelocity.x-this.velocity.x)/5.0;
    }*/
    if (this.position.x + this.velocity.x > this.gameServer.config.worldSize) {
      this.position.x = this.gameServer.config.worldSize;
    } else if (this.position.x + this.velocity.x < 0) {
      this.position.x = 0;
    } else {
      this.position.x += this.velocity.x;
    }

    /*if (this.targetVelocity.y > this.velocity.y) {
      this.velocity.y += (this.targetVelocity.y-this.velocity.y)/5.0;
    } else if (this.targetVelocity.x < this.velocity.y) {
      this.velocity.y -= (this.targetVelocity.y-this.velocity.y)/5.0;
    }*/
    if (this.position.y + this.velocity.y > this.gameServer.config.worldSize) {
      this.position.y = this.gameServer.config.worldSize;
    } else if (this.position.y + this.velocity.y < 0) {
      this.position.y = 0;
    } else {
      this.position.y += this.velocity.y;
    }
  }
};

Player.prototype.notifyUpdate = function() {
  if (this.playing == false) {
    if (this.liveLoop != null) {
      clearInterval(this.liveLoop);
    }
    return;
  }

  // Initialize all unintialized players nearby
  var unknownPlayers = [];
  var nearbyPlayers = [];
  this.gameServer.players.forEach(function(player) {
    if (player.playing) {
      if (Math.abs(this.position.x - player.position.x) <= this.viewRadius &&
          Math.abs(this.position.y - player.position.y) <= this.viewRadius) {
          nearbyPlayers.push(player);
        if (this.knownPlayers.indexOf(player.id) == -1) {
          unknownPlayers.push(player);
        }
      }
    }
  }.bind(this));
  if (unknownPlayers.length > 0) {
    this.socket.sendPacket(new Packet.InitPlayer(this.socket, unknownPlayers), function(res) {
      if (res) {
        unknownPlayers.forEach(function(player) {
          this.knownPlayers.push(player.id);
        }.bind(this));
      }
    }.bind(this));
  }

  // Update all nearby players' position & score
  this.socket.sendPacket(new Packet.UpdatePlayer(this.socket, nearbyPlayers));
  // Update all nearby players' bullets
  var unknownNearbyBullets = []; // Stores actual bullet obj (not id)
  nearbyPlayers.forEach(function(nearbyPlayer) {
    nearbyPlayer.tank.bullets.forEach(function(bullet) {
      var index = this.knownBullets.findIndex(b => b.id == bullet.id);
      if (index == -1) {
        unknownNearbyBullets.push(bullet);
        this.knownBullets.push({
          "id": bullet.id,
          "eol": (Date.now() + bullet.bulletLife + 1000)
        });
      }
    }.bind(this));
  }.bind(this));
  if (unknownNearbyBullets.length > 0)
    this.socket.sendPacket(new Packet.SpawnBullet(this.id, unknownNearbyBullets));
};

Player.prototype.updateFood = function() {
  var addFood = [];
  this.gameServer.food.forEach(function(food) {
    if (Math.abs(this.position.x - food.position.x) <= this.viewRadius &&
        Math.abs(this.position.y - food.position.y) <= this.viewRadius) {
      if (this.knownFood.indexOf(food) == -1) {
        addFood.push(food);
      }
    }
  }.bind(this));
  if (addFood.length > 0) {
    this.socket.sendPacket(new Packet.AddFood(addFood), function(res){
      if (res) {
        addFood.forEach(function(food) {
          this.knownFood.push(food);
        }.bind(this));
      }
    }.bind(this));
  }
};

Player.prototype.setAimAngle = function(radians, isDegrees) {
  if (typeof isDegrees != 'boolean') {
    isDegrees = false;
  }
  if (isDegrees) {
    radians = radians * (Math.PI / 180.0);
  }
  this.aimAngle = radians;
}

Player.prototype.getAimAngle = function(inDegrees) {
  if (typeof inDegrees != 'boolean') {
    inDegrees = false;
  }
  var angle = this.aimAngle;
  if (inDegrees) {
    angle *= 180.0/Math.PI;
  }
  return angle;
}

Player.prototype.play = function(nick) {
  if (this.playing) return;
  //nick = nick.substr(0, this.gameServer.config.maxNickLength);
  //nick = nick.trim(); // remove whitespace before & after string
  this.nick = nick;

  this.tank = new Tank.Basic(this);
  this.score /= 2; // Keep half score from last game
  this.position = this.gameServer.safePosition();

  this.playing = true;

  //this.socket.sendPacket(new Packet.InitPlayer(this.socket, [this]));
  this.liveLoop = setInterval(this.notifyUpdate.bind(this), 1000/30.0);
  this.updateFood();
};

Player.prototype.getLevel = function() {
  // [TODO] Calculate player level from score
  return 1;
};

Player.prototype.destroy = function() {
  if (this.liveLoop != null) {
    clearInterval(this.liveLoop);
  }
  this.playing = false;
  if (this.socket.readyState != WebSocket.CLOSED) {
    this.socket.close();
  }
}
