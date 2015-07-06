var EventEmitter = require( 'events' ).EventEmitter

function ClientConnection( socket ){
  this.dataCache = ''

  this.socket = socket
  this.socket.on( 'data', this.onData.bind( this ) )
}

ClientConnection.prototype = Object.create( EventEmitter.prototype )
var C = ClientConnection.prototype

C.send = function( message ){
  console.log( 'SERVER MESSAGE', message )
  message += '\r\n'
  this.socket.write( message )
}

C.onData = function( data ){
  this.dataCache += data
  this.processMessages()
}

C.processMessages = function(){
  if( this.dataCache.indexOf( '\r\n' ) ){
    var messages = this.dataCache.split( '\r\n' )
    this.dataCache = messages.pop()
    while( messages.length ){
      this.processMessage( messages.pop() )
    }
  }
}

C.processMessage = function( message ){
  console.log( 'CLIENT MESSAGE', message )
  var parts = message.split( ' ' )
  if( !parts.length ){
    console.log( 'EMPTY MESSAGE' )
    return
  }

  switch( parts[0] ){
    case 'NICK':
      this.nickname = parts[1]
      this.attemptLogin()
      return
    break
    case 'PASS':
      this.password = parts[1]
      return
    break
    case 'USER':
      this.name  = parts[1]
      this.host = parts[3]
      return
    break
    case 'PING':
      this.pong()
      return
    break
  }
}

C.attemptLogin = function(){
  this.emit( 'connect_success' )
}

C.pong = function(){
  this.send( 'PONG ' + this.host )
}

module.exports = ClientConnection
