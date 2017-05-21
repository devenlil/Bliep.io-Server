function UpdatePlayer(destination, players) {
  this.destination = destination;
  this.players = players;

  //this.buffer = new ArrayBuffer(2 + (18 * players.length)); // note: buffer bigger than actual
  var bufferLength = 2 + (19 * players.length);
  players.forEach(function(player) {
    bufferLength += player.tank.bullets.length * 9; // bullets length (disabled, use bullet packet instead)
  });
  this.buffer = new ArrayBuffer(bufferLength);
  this.data = new DataView(this.buffer);
  this.byteOffset = 0;
}

module.exports = UpdatePlayer;

UpdatePlayer.prototype.build = function() {
  // Packet Id
  this.data.setUint8(this.byteOffset++, 25);

  // Player Count
  this.data.setUint8(this.byteOffset++, this.players.length);

  this.players.forEach(function(player) {
    // Player Id
    var pid = (player.socket == this.destination) ? 0 : player.id;
    this.data.setUint32(this.byteOffset, pid);
    this.byteOffset += 4;

    // Player Score
    this.data.setUint32(this.byteOffset, player.score);
    this.byteOffset += 4;

    // Player Position X
    this.data.setUint32(this.byteOffset, player.position.x);
    this.byteOffset += 4;

    // Player Position Y
    this.data.setUint32(this.byteOffset, player.position.y);
    this.byteOffset += 4;

    // Player rotation
    if (pid != 0) {
      this.data.setUint16(this.byteOffset, player.getAimAngle(true));
      this.byteOffset += 2;
    }

    // Bullet Count
    this.data.setUint8(this.byteOffset++, player.tank.bullets.length);

    player.tank.bullets.forEach(function(bullet) {
      if (bullet.active) {
        // Bullet Type Id
        this.data.setUint8(this.byteOffset++, bullet.id);

        // Bullet Position X
        this.data.setUint32(this.byteOffset, bullet.position.x);
        this.byteOffset += 4;

        // Bullet Position Y
        this.data.setUint32(this.byteOffset, bullet.position.y);
        this.byteOffset += 4;
      }
    }.bind(this));
  }.bind(this));

  return this.buffer;
};
