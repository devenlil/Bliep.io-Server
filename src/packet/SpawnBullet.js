function SpawnBullet(bullet) {
  this.bullet = bullet;

  var bufferLength = 2 + (4*3);
  this.buffer = new ArrayBuffer(bufferLength);
  this.data = new DataView(this.buffer);
  this.byteOffset = 0;
}

module.exports = SpawnBullet;

SpawnBullet.prototype.build = function() {
  // Packet Id
  this.data.setUint8(this.byteOffset++, 35);

  // Bullet Owner ID
  this.data.setUint32(this.byteOffset, this.bullet.tank.owner.id);
  this.byteOffset += 4;

  // Bullet Target X
  this.data.setUint32(this.byteOffset, this.bullet.targetPosition.x);
  this.byteOffset += 4;

  // Bullet Target Y
  this.data.setUint32(this.byteOffset, this.bullet.targetPosition.y);
  this.byteOffset += 4;

  return this.buffer;
};
