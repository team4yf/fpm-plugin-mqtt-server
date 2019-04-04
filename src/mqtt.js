'use strict';
const mosca = require('mosca');
const _ = require('lodash');
const debug = require('debug')('fpm-plugin-mqtt-server');

const createMqttServer = fpm =>{
  
  const clients = [];

  /* The Start: Create Mqtt Server */
  /*
    ENV:
    - MQTT_PORT:  integer?1883
    - MQTT_AUTH:  object?'{"admin":"123123123"}'
    - MONGO_URL:  string?'mongodb://mongoserver:27017'
    - MONGO_DB: string?'mqtt'
    - ENABLE_MONGO: boolean?false/0
    - ENABLE_HTTP: boolean?false/0
  */
  // const { 
  //   MQTT_PORT = 1883, 
  //   MQTT_AUTH = '{"admin":"123123123"}', 
  //   MONGO_URL = 'mongodb://mongoserver:27017',
  //   MONGO_DB = 'mqtt',
  //   ENABLE_MONGO = false, 
  //   ENABLE_HTTP = false 
  // } = fpm.getEnv();
  const { 
    MQTT_PORT, 
    MQTT_AUTH,
    MONGO_URL = 'mongodb://admin:admin@mongo_server:27017',
    MONGO_DB = 'mqtt',
    ENABLE_MONGO,
    ENABLE_HTTP,
  } = fpm.getEnv();
  const envConfig = {};
  if(!!MQTT_PORT){
    envConfig.port = parseInt(MQTT_PORT);
  }
  if(!!ENABLE_MONGO){
    envConfig.mongo = {
      enable: ENABLE_MONGO === '1'
    }
  }
  if(!!ENABLE_HTTP){
    envConfig.http = {
      enable: ENABLE_HTTP === '1'
    }
  }
  try {
    if(!!MQTT_AUTH){
      envConfig.auth = JSON.parse(MQTT_AUTH);
    }
    
    if(envConfig.mongo && envConfig.mongo.enable){
      envConfig.mongo.url = MONGO_URL;
      envConfig.mongo.db = MONGO_DB;
    }
    if(envConfig.http && envConfig.http.enable){
      envConfig.http.port = 8001,
      envConfig.http.bundle = true,
      envConfig.http.static = './'
    }
  } catch (error) {
    debug('Parse Env Config Error: %O', error)
  }

  debug('The Parsed Env Config: %O', envConfig);
  /*
    Config:
    - port: integer?1883
    - auth: object?'{"admin":"123123123"}'
    - mongo:
     - enable: boolean?false
     - url: string?'mongodb://mongoserver:27017/mqtt'
     - auth: object: 
     - collection: string?'ascoltatori'
    - http:
     - enable: boolean?false
     - port: 8001
  */
  const projConfig = fpm.getConfig('mqtt', {});

  // define a default config
  const defaultConfig = {
    port: 1883,
    auth: { admin: '123123123'},
    mongo: { enable: false },
    http: { enable: false },
  }
  // assign the config.json to override
  const option = _.assign(defaultConfig, projConfig);

  debug('The Parsed Project Config: %O', projConfig);
  // assign the ENV to override

  const config = _.assign(option, envConfig);

  const setting = { port: config.port, auth: config.auth };
  
  if(config.http.enable){
    setting.http = {
      port: 8001,
      bundle: true,
      static: './',
    }
  }
  
  debug('The Mosca Final Config: %O', setting);
  
  const server = new mosca.Server(setting);

  // startup mongo if enable it
  if(config.mongo && config.mongo.enable){
    fpm.execute('mongo.connect', {
      connstr: config.mongo.url,
      db: config.mongo.db
    })
    .catch(error => {
      debug('Mongo connect error: %O', error);
      fpm.logger.error('Mongo connect error:', error);
    })
  }

  const { auth, port } = setting;

  server.on("clientConnected", (client) => {
    debug('New Client Connected: %s @ %o', client.id, new Date().toUTCString());
    clients.push(client.id);
  });

  server.on("clientDisconnected", (client) => {
    debug('A Client Disconnected: %s @ %o', client.id, new Date().toUTCString());
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
    if(config.mongo && config.mongo.enable){
      fpm.execute('mongo.create', {
        collection: 'message',
        dbname: 'mqtt',
        row: packet,
      })
        .catch(error => {
          debug('Save message error: %O', error)
        })
    }

    if(_.startsWith(packet.topic, '$SYS/')){
      debug(`From System: %O`, packet);
      return;
    }
    debug(`On Published Event: %O, From: %O`, packet, client.id);
  });

  return server;
}

exports.createMqttServer = createMqttServer;
