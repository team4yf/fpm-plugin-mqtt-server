const assert = require('assert');

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883', {
	username: 'admin',
	password: '123123123',
	clientId: 'test-client',
});

client.subscribe(['$test']);

describe('Function', function(){

  it('Function A', function(done){
    this.timeout(10 * 1000);
    client.publish('$test', 'content');
    client.on('message', (topic, message) => {
      assert(message.toString(), 'content');
      done();
    });
  })
})
