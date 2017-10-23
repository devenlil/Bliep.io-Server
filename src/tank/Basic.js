var Projectile = require('../projectile');

function Basic(player) {
  this.id      = 1;
  this.owner   = player;
  this.bullets = [];

  // Upgrades
  this.healthRegen       = -1;
  this.maxHealth         = -1;
  this.bulletSpeed       = 0.3;
  this.bulletPenetration = -1;
  this.bulletDamage      = 5;
  this.reload            = 500; // in milliseconds
  this.movementSpeed     = 0.25;

  this.reloading = false; // True when tank is reloading.

  this.fireLoopId = null;
  this.bulletCleanupId = setInterval(this.bulletCleanup.bind(this), 1000);
}

module.exports = Basic;

/* Getters */

Basic.prototype.getHealthRegen = function() {
  return this.healthRegen;
};

Basic.prototype.getMaxHealth = function() {
  return this.getMaxHealth;
};

Basic.prototype.getBulletSpeed = function() {
  return this.bulletSpeed;
};

Basic.prototype.getBulletPenetration = function() {
  return this.bulletPenetration;
};

Basic.prototype.getBulletDamage = function() {
  return this.bulletDamage;
};

Basic.prototype.getReload = function() {
  return this.reload;
};

Basic.prototype.getMovementSpeed = function() {
  return this.movementSpeed;
};

// Functions

Basic.prototype.setFiring = function(mode) {
  if (mode && this.firingLoop == null) {
    // Start Firing
    this.fireLoop();
    this.fireLoopId = setInterval(this.fireLoop.bind(this), this.reload);
  } else if (!mode && this.fireLoopId != null) {
    // Stop Firing
    clearInterval(this.fireLoopId);
    this.fireLoopId = null;
  }
};

Basic.prototype.fireLoop = function() {
  // Check if reloading
  if (this.reloading) {
    return;
  }
  this.reloading = true;

  // Fire bullet
  var bullet = new Projectile.Bullet(this);
  bullet.fire();
  this.bullets.push(bullet);

  // Set reloading to false
  setTimeout(function() {
    this.reloading = false;
  }.bind(this), this.reload);
};

Basic.prototype.calcGunOffset = function() {
  return (this.owner.getLevel()/5.0)+40;
};

Basic.prototype.bulletCleanup = function() {
  var newBulletsArr = [];
  for (var i = 0; i < this.bullets.length; i++) {
    if (this.bullets[i].active) {
      newBulletsArr.push(this.bullets[i]);
    }
  }
  this.bullets = newBulletsArr;
};
