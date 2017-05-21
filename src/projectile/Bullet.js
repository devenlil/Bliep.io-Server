function Bullet(tank) {
  this.id          = 1; // projectile type id
  this.tank        = tank;
  this.angle       = tank.owner.aimAngle;
  this.bulletLife  = 10000; // in millseconds
  this.elapsedTime = 0;
  this.active      = true;

  this.position    = {
    'x': tank.owner.position.x,
    'y': tank.owner.position.y
  };
  this.velocity = {
    'x': Math.cos(this.angle)*this.tank.getBulletSpeed(),
    'y': -Math.sin(this.angle)*this.tank.getBulletSpeed()
  };
  this.targetPosition = {
    'x': this.position.x + (this.bulletLife * this.velocity.x),
    'y': this.position.y + (this.bulletLife * this.velocity.y)
  };
}

module.exports = Bullet;

Bullet.prototype.fire = function() {
  // start loop
  this.bulletLoop = setInterval(this.update.bind(this), 1);
};

Bullet.prototype.update = function() {
  if (this.elapsedTime > this.bulletLife) {
    this.destroy();
    return;
  }

  // movement
  /*if (this.position.x + this.velocity.x > this.tank.owner.gameServer.config.worldSize) {
    this.position.x = this.tank.owner.gameServer.config.worldSize;
  } else if (this.position.x + this.velocity.x < 0) {
    this.position.x = 0;
  } else {
    this.position.x += this.velocity.x;
  }
  if (this.position.y + this.velocity.y > this.tank.owner.gameServer.config.worldSize) {
    this.position.y = this.tank.owner.gameServer.config.worldSize;
  } else if (this.position.y + this.velocity.y < 0) {
    this.position.y = 0;
  } else {
    this.position.y += this.velocity.y;
  }*/
  /*this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;*/

  this.elapsedTime++;
};

Bullet.prototype.destroy = function() {
  clearInterval(this.bulletLoop);
  this.active = false;
};
