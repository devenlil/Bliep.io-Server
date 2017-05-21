function Logger() {
  this.prefix = '[BliepServer] ';
  this.verbose = false;
}

module.exports = Logger;

Logger.prototype.setVerbose = function(mode) {
  this.verbose = mode;
};

Logger.prototype.log = function(msg, override) {
  if (typeof override != 'boolean') {
    override = this.verbose;
  }
  if (override) {
    console.log(this.prefix + msg);
  }
  this.write(msg);
};

Logger.prototype.onClientConnect = function(client, note) {
  var cld = null;
  if (client.id) {
    cld = client.id + ':' + client.socket.remoteAddress;
  } else {
    cld = client.remoteAddress;
  }
  var msg = "Client Connected (" + cld + ")";
  msg += (typeof note != 'undefined') ? ': ' + note : "";
  if (this.verbose) {
    console.log(this.prefix + msg);
  }
  this.write(msg);
};

Logger.prototype.onClientDisconnect = function(client, note) {
  var cld = null;
  if (client.id) {
    cld = client.id + ':' + client.socket.remoteAddress;
  } else {
    cld = client.remoteAddress;
  }
  var msg = "Client Left (" + cld + ")";
  msg += (typeof note != 'undefined') ? ': ' + note : "";
  if (this.verbose) {
    console.log(this.prefix + msg);
  }
  this.write(msg);
};

Logger.prototype.write = function(data) {
  // [TODO] write to external file
};
