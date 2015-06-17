function Channel( name ){
  this.clients = []
  this.name = name
}

Channel.prototype.removeClient = function removeClient( client ){
  this.clients = this.clients.filter( function( c ){
    return c !== client
  })
}

Channel.prototype.broadcast = function broadcast( message ){
  this.users.forEach( function( user ){
    user.send( message )
  })
}

module.exports = Channel
