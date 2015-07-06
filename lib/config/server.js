var os = require( 'os' )

var serverOptions = {
  ip: '127.0.0.1',
  port: 6667,
  version: '0.0.1',
  hostname: os.hostname(),
  name: 'Dire IRC Server',
  createdDate: new Date()
}

module.exports = serverOptions
