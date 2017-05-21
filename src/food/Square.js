var Food = require('./Food');

function Square() {
  Food.apply(this, arguments);
  this.id = 0;
  this.size = 50;
  this.health = 10;
}

Square.prototype = Object.create(Food.prototype);
Square.prototype.constructor = Square;
module.exports = Square;
