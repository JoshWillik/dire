var EventEmitter = require( 'events' ).EventEmitter

function ClientConnection( socket ){
  this.socket = socket
}
ClientConnection.prototype = Object.create( EventEmitter.prototype )

ClientConnection.prototype.sendWelcome = function sendClientWelcome(){
  this.socket.write
}

module.exports = ClientConnection
