require("chai").should();

const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://localhost:1883', {
	username: 'admin',
	password: '123123123',
	clientId: 'test-client',
});

client.subscribe(['$test']);

describe('Function', function(){
  beforeEach(done => {
    done()
  })

  afterEach(done => {
    done()
  })

  it('Function A', function(done){
    this.timeout(10 * 1000);
    client.publish('$test', 'content');
    client.on('message', (topic, message) => {
      message.toString().should.equal('content');
      done();
    });
  })
})
