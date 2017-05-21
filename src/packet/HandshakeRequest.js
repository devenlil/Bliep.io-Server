function HandshakeRequest(worldSize) {
  this.buffer = new ArrayBuffer(3); // buffer length
  this.data = new DataView(this.buffer);
  this.worldSize = worldSize;
}

module.exports = HandshakeRequest;

HandshakeRequest.prototype.build = function() {
  this.data.setUint8(0, 0);

  this.data.setUint16(1, this.worldSize);

  return this.buffer;
}
