const cassandra = require('cassandra-driver');
// const fs = require('fs');

const client = new cassandra.Client({
  contactPoints: ['scylla'],
  localDataCenter: 'datacenter1',
  keyspace: 'mykeyspace',
  pooling: {
    maxRequestsPerConnection: 32768,
    coreConnectionsPerHost: {
      [cassandra.types.distance.local]: 5,
      [cassandra.types.distance.remote]: 1
    }
  },
  socketOptions: {
    readTimeout: 600000
  },
  authProvider: new cassandra.auth.PlainTextAuthProvider('username', 'password'),
//   sslOptions: {
//     cert: fs.readFileSync('path/to/cert.pem'),
//     key: fs.readFileSync('path/to/key.pem'),
//     ca: [fs.readFileSync('path/to/ca.pem')],
//     rejectUnauthorized: true
//   },
  policies: {
    loadBalancing: new cassandra.policies.loadBalancing.RoundRobinPolicy()
  }
});

client.connect()
  .then(() => {
    console.log('Connected to Cassandra');
  })
  .catch(err => {
    console.error('Failed to connect to Cassandra', err);
    process.exit(1);
  });

process.on('SIGINT', () => {
  client.shutdown()
    .then(() => {
      console.log('Cassandra connection closed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Error shutting down Cassandra connection', err);
      process.exit(1);
    });
});

module.exports = client;
