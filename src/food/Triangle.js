var Food = require('./Food');

function Triangle() {
  Food.apply(this, arguments);
  this.id = 1;
  this.size = 50;
  this.health = 25;
}

Triangle.prototype = Object.create(Food.prototype);
Triangle.prototype.constructor = Triangle;
module.exports = Triangle;
