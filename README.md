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
        "debug": true,
        "auth": {
            "admin": "123123123"
        }
    }
}
```

### API

- mqtt.publish
{ topic, payload }
