const path = require('path')
process.env['NODE_CONFIG_DIR'] = path.join(__dirname, '..', 'config')

const config = require('config')

module.exports = {
  privateScript: config.get('privateScript'),
  pk_stripe: config.get('pk_stripe'),
  secret_stripe_private: config.get('secret_stripe_private'),
  secret_stripe_public: config.get('secret_stripe_public'),
  googleAuth: config.get('googleAuth'),
  components_information: config.get('components_information'),
  engineUrl: config.get('engineUrl'),
  mlabDB: config.get('mlabDB'),
  socketClient: config.get('socketClient'),
  amqpHost: config.get('amqpHost'),
  socketServer: config.get('socketServer'),
  secret: config.get('secret'),
  timer: config.get('timer')
}