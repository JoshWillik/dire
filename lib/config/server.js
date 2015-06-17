var os = require( 'os' )

var serverOptions = {
  port: 6667,
  version: '0.0.1',
  hostname: os.hostname(),
  name: 'Dire IRC Server'
}

module.exports = serverOptions
