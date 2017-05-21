var GameServer = require('./GameServer');
var memwatch = require('memwatch-next');

console.log("\n");
console.log("=== Bliep Server ===");
console.log("An open source diep.io node.js server.\n");
console.log("Made by: Enlil Odisho (devenlil)");
//console.log("Contributors:"); // Do you want to become the first contributor? :D
console.log("-----\n");

var gameServer = new GameServer();
gameServer.start();
memwatch.on('leak', function(info) {
  gameServer.logger.log("MEMORY LEAK");
  console.log(info);
});
