function Bullet(tank) {
  this.id          = tank.owner.gameServer.getNextAvailableBid();
  this.typeId      = 1; // projectile type id
  this.tank        = tank;
  this.angle       = tank.owner.aimAngle;
  this.bulletLife  = 3000; // in millseconds
  this.lastMoved   = -1;
  this.active      = true;

  this.position    = {
    'x': tank.owner.position.x+Math.cos(this.angle)*this.tank.calcGunOffset(),
    'y': tank.owner.position.y+Math.sin(this.angle)*this.tank.calcGunOffset()
  };
  this.velocity = {
    'x': Math.cos(this.angle)*this.tank.getBulletSpeed(),
    'y': Math.sin(this.angle)*this.tank.getBulletSpeed()
  };
  /*this.targetPosition = {
    'x': this.position.x + (this.bulletLife * this.velocity.x),
    'y': this.position.y + (this.bulletLife * this.velocity.y)
  };*/
}

module.exports = Bullet;

Bullet.prototype.fire = function() {
  // start loop
  this.lastMoved = Date.now();
  this.bulletLoop = setInterval(this.update.bind(this), 1);
};

Bullet.prototype.update = function() {
  if (this.bulletLife <= 0) {
    this.destroy();
    return;
  }

  // Bullet Movement
  var elapsed = (Date.now() - this.lastMoved);
  this.position.x += this.velocity.x * elapsed;
  this.position.y += this.velocity.y * elapsed;

  // Check if bullet is out-of-bounds
  if (this.position.x < 0 || this.position.y < 0
    || this.position.x > this.tank.owner.gameServer.config.worldSize
    || this.position.y > this.tank.owner.gameServer.config.worldSize) {
      this.destroy();
      return;
  }

  this.bulletLife -= elapsed;
  this.lastMoved = Date.now();
};

Bullet.prototype.destroy = function() {
  clearInterval(this.bulletLoop);
  this.active = false;
};
