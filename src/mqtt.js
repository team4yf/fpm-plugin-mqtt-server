'use strict';
const mosca = require('mosca');
const path = require('path');
const _ = require('lodash');
const debug = require('debug')('fpm-plugin-mqtt-server');
const fs = require('fs');

const createMqttServer = fpm =>{
  
  const clients = [];

  /* The Start: Create Mqtt Server */
  const { MQTT_PORT, MQTT_DEBUG, MQTT_AUTH, MQTT_LOG } = fpm.getEnv();

  const logPath = path.join(fpm.get('CWD'), 'logs', MQTT_LOG || 'log.log');
  if(!fs.existsSync(logPath)){
    // create the file;
    fs.copyFileSync(path.join( __dirname, 'log'), logPath);
    debug('create file %s', logPath);
  }
  const fileLogger = require('pino')({ enabled: MQTT_DEBUG !== '0' }, logPath);

  const config = fpm.getConfig('mqtt', {});
  const option = _.assign({ port: 1883, auth: { 'admin': '123123123' } }, config);
  const { port, auth } = Object.assign(option, {
    port: MQTT_PORT || option.port,
    auth: MQTT_AUTH === undefined? option.auth : (JSON.parse(MQTT_AUTH)),
  });
  debug('The Mosca Config: %O', { port, auth });
  const server = new mosca.Server({ port });

  server.on("clientConnected", (client) => {
    debug('New Client Connected: %s @ %o', client.id, new Date().toUTCString());
    fileLogger.info('New Client Connected: %s @ %o', client.id, new Date().toUTCString())
    clients.push(client.id);
  });

  server.on("clientDisconnected", (client) => {
    debug('A Client Disconnected: %s @ %o', client.id, new Date().toUTCString());
    fileLogger.info('A Client Disconnected: %s @ %o', client.id, new Date().toUTCString())
    _.remove(clients, (id) => client.id == id)
  });

  server.on('ready', () => {
    fpm.logger.info(`MQTT Server is running at mqtt:${port}`);
    server.authenticate = (client, username, password, callback) => {
      let flag = (auth[username] == password);
      if (flag) {
        client.user = username;
      }
      callback(null, flag);
    };
  });

  server.on("published",(packet, client) =>{
    if(_.startsWith(packet.topic, '$SYS/')){
      fileLogger.info(`From System: %O`, packet);
      debug(`From System: %O`, packet);
      return;
    }
    debug(`On Published Event: %O, From: %O`, packet, client.id);
    fileLogger.info(`On Published Event: %O, From: %O`, packet, client.id);
  });

  return server;
}

exports.createMqttServer = createMqttServer;
