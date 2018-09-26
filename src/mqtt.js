'use strict';
const mosca = require('mosca');
const _ = require('lodash');

const createMqttServer = fpm =>{

  const clients = [];

  /* The Start: Create Mqtt Server */
  const { port, debug, auth } = _.assign({ port: 1883, debug: true, auth: { admin: '123123123' } }, fpm.getConfig('mqtt'));
  
  const server = new mosca.Server({ port });

  server.on("clientConnected",function(client) {
    fpm.logger.info(client.id, ' connect');
    clients.push(client.id)
  // TODO: save the client
  });

  server.on("clientDisconnected",function(client) {
  // console.log("client clientDisconnected",client.id);
  // TODO: remove the client
    _.remove(clients, (id) => client.id == id)
    fpm.logger.error(client.id, ' disconnected');
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

  fpm.extendModule('mqtt', {
    clients: args => {
      return {
        total: clients.length,
        rows: clients,
      };
    },
    publish: args => {
        const { topic = '$SYS/UNDEFINED', payload = '00' } = args;
        server.publish({ topic, payload })
        return 1;
    }
  })

  return server;
}

exports.createMqttServer = createMqttServer;
