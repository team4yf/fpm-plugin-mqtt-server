const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883', {
	username: 'admin',
	password: '123123123',
	clientId: 'test-client',
});

client.subscribe(['$s2d/nb/youren/push', '$s2d/nb/youren/push', '$d2s/offline/tcp']);
client.on('message', (topic, message) => {
    console.log(topic, message);
});