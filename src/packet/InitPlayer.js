function InitPlayer(destination, players) {
  this.destination = destination;
  this.players = players;

  var byteLength = 2 + (players.length * 11);
  players.forEach(function(player) {
    byteLength += player.nick.length * 2;
  });
  this.buffer = new ArrayBuffer(byteLength);
  this.data = new DataView(this.buffer);
  this.byteOffset = 0;
}

module.exports = InitPlayer;

InitPlayer.prototype.build = function() {
  // Packet Id
  this.data.setUint8(this.byteOffset++, 20);

  // Player Count
  this.data.setUint8(this.byteOffset++, this.players.length);

  this.players.forEach(function(player) {
    // Player Id
    var pid = (player.socket == this.destination) ? 0 : player.id;
    this.data.setUint32(this.byteOffset, pid);
    this.byteOffset += 4;

    // Nick
    for (var i = 0; i < player.nick.length; i++) {
      this.data.setUint16(this.byteOffset, player.nick.charCodeAt(i));
      this.byteOffset += 2;
    }
    this.data.setUint16(this.byteOffset, 0);
    this.byteOffset += 2;

    // Player Score
    this.data.setUint32(this.byteOffset, player.score);
    this.byteOffset += 4;

    // Tank Id
    this.data.setUint8(this.byteOffset++, player.tank.id);
  }.bind(this));

  return this.buffer;
}
