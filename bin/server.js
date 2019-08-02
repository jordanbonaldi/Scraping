#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('scrapping:server');
const http = require('http');
const config = require('../config/config');
const {log} = require('../src/utils/utils');

/**
 * Get port from environment and store in Express.
 */

/**
 *
 * @type {string}
 */
const port = normalizePort(config.server.port);
app.set('port', port);


/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  let bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening(server) {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  log('Listening on ' + bind);
}

/**
 * Create HTTP server.
 */

let create = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const server = http.createServer(app);

      server.listen(port);
      server.on('error', onError);
      server.on('listening', () => onListening(server));

      resolve(server)

    }, 1000)
  }).then(() => log("Server started"));
};

/**
 *
 * @type {function(): Promise<void | never>}
 */
module.exports = create;
