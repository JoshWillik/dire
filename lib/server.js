var net = require( 'net' )
var config = require( './config/server' )

var ClientConnection = require( './client-connection' )

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
  this.services = []
  this.servers = [ this ]

  this.server = net.createServer( this.onConnect.bind( this ) )
}

var I = IRCServer.prototype

I.onConnect = function onConnect( socket ){
  var client = new ClientConnection( socket )
  this.clients.push( client )

  client.on( 'connect_success', function(){
    this.welcomeClient( client )
  }.bind( this ) )

  client.on( 'connect_error', function(){
    this.removeClient( client )
  }.bind( this ) )

  client.on( 'message', this.processMessage.bind( this ) )
}

I.removeClient = function( client ){
  this.clients = this.clients.filter( function( c ){
    return c !== client
  })

  this.channels.forEach( function( channel ){
    channel.removeClient( client )
  })
}

I.welcomeClient = function( client ){
  console.log( 'CLIENT', client.nickname, client.name, client.host )
  client.send( this.RPL_WELCOME( client.nickname, client.name, client.host ) )
  client.send( this.RPL_YOURHOST( client.nickname, client.hostname ) )
  client.send( this.RPL_CREATED( client.nickname ) )
  client.send( this.RPL_MYINFO( client.nickname ) )
  client.send( this.RPL_LUSERCLIENT( client.nickname ) )
}

I.messageTo = function( code, username ){
  return ':' + this.hostname + ' ' + code + ' ' + username
}

I.numUsers = function( fn ){
  if( !fn ){
    return this.clients.length
  }

  function clientFilter( client ){
    if( client[ fn ] ){
      return client[ fn ]()
    }
    return false
  }

  return this.clients.filter( clientFilter ).length
}

I.RPL_WELCOME = function( nickname, name, host ){
  var message = this.messageTo( '001', nickname )
  message += ' :Welcome to {server-name}, {nickname}!{name}@{host}'
    .replace( '{server-name}', this.name )
    .replace( '{nickname}', nickname )
    .replace( '{name}', name )
    .replace( '{host}', host )
  return message
}

I.RPL_YOURHOST = function( nickname ){
  var message = this.messageTo( '002', nickname )
  message += ' :Your host is {hostname}[{ip}/{port}], running'
    .replace( '{hostname}', this.hostname )
    .replace( '{ip}', this.ip )
    .replace( '{port}', this.port )
  return message
}

I.RPL_CREATED = function( nickname ){
  var message = this.messageTo( '003', nickname )
  message += ' :This server was created {date}'
    .replace( '{date}', this.createdDate )
  return message
}

I.RPL_MYINFO = function( nickname ){
  var message = this.messageTo( '004', nickname )
  message += ' :{name} {version} {user-modes} {channel-modes}'
    .replace( '{name}', this.name )
    .replace( '{version}', config.version )
    .replace( '{user-modes}', '' )
    .replace( '{channel-modes}', '' )
  return message
}

I.RPL_BOUNCE = function( serverName, port ){
  var message = this.messageTo( '005', nickname )
  message += ' :Try server {serverName}, port {port}'
    .replace( '{serverName}', serverName )
    .replace( '{port}', port )
  return message
}

I.RPL_LUSER = function(){

}

I.RPL_LUSERCLIENT = function( nickname ){
  var message = this.messageTo( '251', nickname )
  message += ' :There are {numUsers} users and {numServices} services on {numServers} servers'
    .replace( '{numUsers}', this.clients.length )
    .replace( '{numServices}', this.services.length )
    .replace( '{numServers}', this.servers.length )
  return message


  return ':There are ' + this.clients.length + ' users and ' +
    this.numUsers( 'hidden' ) + ' invisible on 1 servers'
}

I.RPL_LUSEROP = function(){
  return '' + this.numUsers( 'operator' ) + ' :Operators'
}

I.processMessage = function( message ){
  console.log( message )
}

I.listen = function serverListen( port ){
  this.server.listen( this.port )
}

module.exports = IRCServer
