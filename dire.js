var Server = require( './lib/server.js' )

var server = new Server({
  port: 6667
})
server.listen()
