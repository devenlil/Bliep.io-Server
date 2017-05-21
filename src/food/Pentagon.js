var Food = require('./Food');

function Pentagon() {
  Food.apply(this, arguments);
  this.id = 2;
  this.size = 100;
  this.health = 130;
}

Pentagon.prototype = Object.create(Food.prototype);
Pentagon.prototype.constructor = Pentagon;
module.exports = Pentagon;
