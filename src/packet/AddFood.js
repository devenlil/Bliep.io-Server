function AddFood(food) {
  this.food = food;

  var byteLength = 3 + (food.length * 9);
  this.buffer = new ArrayBuffer(byteLength);
  this.data = new DataView(this.buffer);
  this.byteOffset = 0;
}

module.exports = AddFood;

AddFood.prototype.build = function() {
  // Packet Id
  this.data.setUint8(this.byteOffset++, 30);

  // Food Count
  this.data.setUint16(this.byteOffset, this.food.length);
  this.byteOffset += 2;

  this.food.forEach(function(food) {
    // Food Type Id
    var fid = food.getId();
    this.data.setUint8(this.byteOffset++, fid);

    // Food Position X
    this.data.setUint32(this.byteOffset, food.position.x);
    this.byteOffset += 4;

    // Food Position Y
    this.data.setUint32(this.byteOffset, food.position.y);
    this.byteOffset += 4;
  }.bind(this));

  return this.buffer;
}
