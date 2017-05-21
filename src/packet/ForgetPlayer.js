function ForgetPlayer(destination, players) {
  this.destination = destination;
  this.players = players;

  var byteLength = 2 + (players.length * 4);
  this.buffer = new ArrayBuffer(byteLength);
  this.data = new DataView(this.buffer);
  this.byteOffset = 0;
}

module.exports = ForgetPlayer;

ForgetPlayer.prototype.build = function() {
  // Packet Id
  this.data.setUint8(this.byteOffset++, 21);

  // Player Count
  this.data.setUint8(this.byteOffset++, this.players.length);

  this.players.forEach(function(player) {
    // Player Id
    this.data.setUint32(this.byteOffset, player.id);
    this.byteOffset += 4;
  }.bind(this));

  return this.buffer;
}
