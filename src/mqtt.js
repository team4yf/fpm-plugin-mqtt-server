'use strict';
const mosca = require('mosca');
const _ = require('lodash');

const createMqttServer = fpm =>{

  const clients = [];

  /* The Start: Create Mqtt Server */
  const { MQTT_PORT, MQTT_DEBUG, MQTT_AUTH } = fpm.getEnv();
  const config = fpm.getConfig('mqtt', {});
  const option = _.assign({ port: 1883, debug: true, auth: { 'admin': '123123123' } }, config);
  const { port, debug, auth } = Object.assign(option, {
    port: MQTT_PORT || option.port,
    debug: MQTT_DEBUG === undefined ? option.debug : (`${MQTT_DEBUG}` != '0'),
    auth: MQTT_AUTH === undefined? option.auth : (JSON.parse(MQTT_AUTH)),
  });
  const server = new mosca.Server({ port });

  server.on("clientConnected",function(client) {
    fpm.logger.info(client.id, ' connect', new Date().toUTCString());
    clients.push(client.id)
  // TODO: save the client
  });

  server.on("clientDisconnected",function(client) {
  // console.log("client clientDisconnected",client.id);
  // TODO: remove the client
    _.remove(clients, (id) => client.id == id)
    fpm.logger.error(client.id, ' disconnected', new Date().toUTCString());
  });

  server.on('ready',function() {
    fpm.logger.info(`MQTT Server is running at :${port}....`);
    server.authenticate = (client, username, password, callback) => {
      let flag = (auth[username] == password);
      if (flag) {
        client.user = username;
      }
      callback(null, flag);
    };
  });

  server.on("published",(packet,client) =>{
    if(debug){
      fpm.logger.info(`On Published Event: `, packet);
    }
  });

  return server;
}

exports.createMqttServer = createMqttServer;
