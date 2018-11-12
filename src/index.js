const { createMqttServer } = require('./mqtt.js');

module.exports = {
  bind: (fpm) => {
    fpm.registerAction('BEFORE_SERVER_START', () => {
      createMqttServer(fpm);
    })

  }
}
