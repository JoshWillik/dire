var net = require( 'net' )
var config = require( './config/server' )

var ClientConnection = require( './client-connection' )

var RPC_WELCOME_CODE = '001'

function IRCServer( options ){
  if( !( this instanceof IRCServer ) ){
    return new IRCServer( options )
  }

  options = options || {}
  this.hostname = options.hostname || config.hostname
  this.name = options.name || config.name
  this.port = options.port || config.port
  this.createdDate = options.createdDate || config.createdDate

  this.channels = []
  this.clients = []

  this.server = net.createServer( this.onConnect )
}

IRCServer.prototype.onConnect = function onConnect( socket ){
  var client = new ClientConnection( socket )
  this.clients.push( client )

  client.on( 'connect_success', function(){
    this.welcomeClient( client )
  }.bind( this ) )
  client.on( 'connect_error', function(){
    this.removeClient( client )
  })

  this.sendWelcome( client )
}

IRCServer.prototype.removeClient = function( client ){
  this.clients = this.clients.filter( function( c ){
    return c !== client
  })

  this.channels.forEach( function( channel ){
    channel.removeClient( client )
  })
}

IRCServer.prototype.welcomeClient = function( client ){
  client.send( this.RPL_WELCOME() )
  client.send( this.RPL_YOURHOST() )
}

IRCServer.prototype.messageTo = function( code, user ){
  return ':' + this.hostname + ' ' + code + ' ' + user
}

IRCServer.prototype.numUsers = function( fn ){
  return this.clients.filter( function( client ){
    if( client[ fn ] ){
      return client[ fn ]()
    }
    return false
  }).length
}

IRCServer.prototype.RPL_WELCOME = function( client ){
  return this.messageTo( RPC_WELCOME_CODE, client.nick ) +
    ' :Welcome to ' + this.name + ', ' +
    client.nick + '!' + client.name + '@' + client.host
}

IRCServer.prototype.RPL_LUSERCLIENT = function(){
  return ':There are ' + this.clients.length + ' users and ' +
    this.numUsers( 'hidden' ) + ' invisible on 1 servers'
}

IRCServer.prototype.RPL_LUSEROP = function(){
  return '' + this.numUsers( 'operator' ) + ' :Operators'
}

IRCServer.prototype.RPL_YOURHOST = function( client ){
  return ':Your host is {hostname}[{ip}/{port}], running'
}

IRCServer.prototype.listen = function serverListen( port ){
  this.server.listen( this.port )
}

module.exports = IRCServer
