var Basic = require('./Basic');

function Twin() {
  Basic.apply(this, arguments);
}

Twin.prototype = Object.create(Basic.prototype);
Twin.prototype.constructor = Twin;
module.exports = Twin;
