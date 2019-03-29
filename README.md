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
        "auth": {
            "admin": "123123123"
        }
    }
}
```

### Env config
```
MQTT_PORT: 1883
MQTT_DEBUG: 1
MQTT_LOG: log.log
MQTT_AUTH: "{\"admin\":\"123123123\"}"
```
