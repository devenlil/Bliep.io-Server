function SpawnBullet(destinationId, bullets) {
  this.destinationId = destinationId;
  this.bullets = bullets;

  var bufferLength = 8 + (18 * bullets.length);
  this.buffer = new ArrayBuffer(bufferLength);
  this.data = new DataView(this.buffer);
  this.byteOffset = 0;
}

module.exports = SpawnBullet;

SpawnBullet.prototype.build = function() {
  // Packet Id
  this.data.setUint8(this.byteOffset++, 35);

  var timeOffset = this.byteOffset;
  this.byteOffset += 6;

  // Bullet Count
  this.data.setUint8(this.byteOffset++, this.bullets.length);

  this.bullets.forEach(function(bullet) {
    // Bullet Owner's Id (0=yours)
    this.data.setUint8(this.byteOffset++,
      (bullet.tank.owner.id == this.destinationId) ? 0 : bullet.tank.owner.id);

    // Bullet Type Id
    this.data.setUint8(this.byteOffset++, bullet.typeId);

    // Bullet Bullet Speed
    this.data.setFloat32(this.byteOffset, bullet.tank.bulletSpeed);
    this.byteOffset += 4;

    // Bullet Aim Angle (in degrees)
    this.data.setUint16(this.byteOffset, (bullet.angle*(180.0/Math.PI)));
    this.byteOffset += 2;

    // Bullet Start Position X
    this.data.setUint32(this.byteOffset, bullet.position.x);
    this.byteOffset += 4;

    // Bullet Start Position Y
    this.data.setUint32(this.byteOffset, bullet.position.y);
    this.byteOffset += 4;

    // Bullet Life
    this.data.setUint16(this.byteOffset, bullet.bulletLife);
    this.byteOffset += 2;
  }.bind(this));

  // Server Time in epoch
  var maxuint32 = 4294967295;
  var time = Date.now();
  this.data.setUint16(timeOffset, Math.floor(time/maxuint32));
  timeOffset += 2;
  this.data.setUint32(timeOffset, Math.round(time%maxuint32));

  return this.buffer;
};
