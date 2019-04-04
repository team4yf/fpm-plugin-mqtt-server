## FPM-PLUGIN-MQTT-SERVER
用于 MQTT-Server 的插件

### Install
```bash
yarn add fpm-plugin-mqtt-server
```

### Useage

Config Define

```javascript
{
  "mqtt":{
    "port": 1883,
    "auth": { "admin": '123123123'},
    "http": {
      "enable": true
    },
    "mongo": {
      "enable": true
    }
  },
  "mongodb": {
    "host": "localhost",
    "port": 27017,
    "poolSize": 5,
    "auth": {
      "user": "admin",
      "password": "admin"
    },
    "default": "mqtt"
  }
}
```

### Env config
```
MQTT_PORT = 1883, 
MQTT_AUTH = {\"admin\":\"123123123\"}, 
MONGO_URL = mongodb://mongoserver:27017,
MONGO_DB = mqtt,
ENABLE_MONGO = 0, 
ENABLE_HTTP = 1 
```
