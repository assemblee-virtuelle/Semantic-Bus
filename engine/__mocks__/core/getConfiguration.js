// Mock pour core/getConfiguration.js
module.exports = () => ({
  CASSANDRA: {
    contactPoints: ['127.0.0.1'],
    localDataCenter: 'datacenter1',
    keyspace: 'test_keyspace',
    pooling: {
      maxRequestsPerConnection: 100,
      coreConnectionsPerHost: {
        local: 2,
        remote: 1
      }
    },
    socketOptions: {
      readTimeout: 5000
    },
    authProvider: {
      username: 'test_user',
      password: 'test_password'
    }
  },
  MONGODB: {
    url: 'mongodb://localhost:27017/test',
    database: 'test_db'
  },
  RABBITMQ: {
    url: 'amqp://localhost:5672',
    exchange: 'test_exchange'
  },
  SERVER: {
    port: 3000,
    host: 'localhost'
  }
});