import _ from 'lodash'

const { createMqttServer } = require('./mqtt.js');

export default {
  bind: (fpm) => {
    fpm.registerAction('BEFORE_SERVER_START', () => {
      createMqttServer(fpm);
    })

  }
}
