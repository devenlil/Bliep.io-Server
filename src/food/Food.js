function Food() {
  this.id = -1;
  this.position = {
    'x': 0,
    'y': 0
  };
  this.size = 0;
  this.health = 0;
}

module.exports = Food;

Food.prototype.getId = function() {
  return this.id;
};

Food.prototype.setPosition = function(pos) {
  if (pos.x && pos.y) {
    this.position = pos;
    return true;
  } else {
    return false;
  }
};
