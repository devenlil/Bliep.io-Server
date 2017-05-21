var Packet = require('./packet');

function PacketHandler(player) {
  this.player = player;
  player.socket.on('message', this.handleMessage.bind(this));
}

module.exports = PacketHandler;

PacketHandler.prototype.handleMessage = function(message) {
  // Function called when serverbound packet received from player
  function bufferToArrayBuffer(buffer) {
    var length = buffer.length;
    var arrayBuf = new ArrayBuffer(length);
    var view = new Uint8Array(arrayBuf);
    for (var i = 0; i < length; i++) {
      view[i] = buffer[i];
    }
    return view.buffer;
  }

  if (message.constructor != Buffer) {
    this.player.gameServer.logger.log("Client Sent Invalid Message Type ("
      + this.player.id + ':' + this.player.socket.remoteAddress + ")");
    return;
  }

  var data = new DataView(bufferToArrayBuffer(message));

  switch(data.getUint8(0)) {
    case 1: // handshake
      if (!this.player.handshake) return;
      if (data.getUint8(1) == this.player.gameServer.protocolVersion) {
        this.player.verified = true;
      } else {
        this.player.gameServer.logger.onClientDisconnect("Invalid Protocol Version");
        this.player.destroy();
      }
      break;
    case 10: // play
      var nick = "";
      for (var i = 1; data.getUint16(i) != 0; i+=2) {
        if (i > 50) break; // If packet is missing end byte
        nick += String.fromCharCode(data.getUint16(i));
      }
      this.player.play(nick);
      break;
    case 50: // mouse move (aim at)
      var angle = data.getUint16(1);
      this.player.setAimAngle(angle, true);
      break;
    case 51: // Move Keys Updated (WASD)
      var w = data.getUint8(1),
          a = data.getUint8(2),
          s = data.getUint8(3),
          d = data.getUint8(4);

      var angle = -1;
      if (w && !s) {
        if (a != d) {
          if (a) {
            angle = 135;
          } else if (d) {
            angle = 45;
          }
        } else {
          angle = 90;
        }
      } else if (!w && s) {
        if (a != d) {
          if (a) {
            angle = 225;
          } else if (d) {
            angle = 315;
          }
        } else {
          angle = 270;
        }
      } else if (a && !d) {
        angle = 180;
      } else if (!a && d) {
        angle = 0;
      }
      if (angle != -1) {
        angle = angle * Math.PI/180;
        /*this.player.targetVelocity.x = Math.cos(angle)*0.25;
        this.player.targetVelocity.y = -Math.sin(angle)*0.25;*/
        this.player.velocity.x = Math.cos(angle)*this.player.tank.getMovementSpeed();
        this.player.velocity.y = -Math.sin(angle)*this.player.tank.getMovementSpeed();
        this.player.stationary = false;
      } else {
        this.player.stationary = true;
      }
      break;
    case 52: // Fire bullets
      var fire = data.getUint8(1);
      this.player.tank.setFiring((fire == 1) ? true : false);
      break;
  }

}
