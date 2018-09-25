const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883', {
	username: 'admin',
	password: '123123123',
});

setInterval(function() {
	client.publish('$s2d/nb/youren/push', Buffer.from('000000010000000200000002ffffffff01020304', 'hex'), { qos: 1, retain: true});
},10000);

client.subscribe(['$s2d/nb/youren/push', '$s2d/nb/youren/push', '$d2s/offline/tcp']);
client.on('message', (topic, message) => {
    console.log(topic, message);
});