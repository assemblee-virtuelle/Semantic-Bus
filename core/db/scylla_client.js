const cassandra = require('cassandra-driver');
const config = require('../getConfiguration.js')(); // Chargement de la configuration

// const fs = require('fs');

const client = new cassandra.Client({
  contactPoints: config.CASSANDRA.contactPoints, // Utilisation des points de contact de la config
  localDataCenter: config.CASSANDRA.localDataCenter, // Centre de données local de la config
  keyspace: config.CASSANDRA.keyspace, // Espace de clés de la config
  pooling: {
    maxRequestsPerConnection: config.CASSANDRA.pooling.maxRequestsPerConnection, // Max requêtes par connexion
    coreConnectionsPerHost: {
      [cassandra.types.distance.local]: config.CASSANDRA.pooling.coreConnectionsPerHost.local, // Connexions locales
      [cassandra.types.distance.remote]: config.CASSANDRA.pooling.coreConnectionsPerHost.remote // Connexions distantes
    }
  },
  socketOptions: {
    readTimeout: config.CASSANDRA.socketOptions.readTimeout // Durée d'attente pour une réponse
  },
  authProvider: new cassandra.auth.PlainTextAuthProvider(config.CASSANDRA.authProvider.username, config.CASSANDRA.authProvider.password), // Authentification
//   sslOptions: { // Options SSL pour sécuriser la connexion
//     cert: fs.readFileSync('path/to/cert.pem'),
//     key: fs.readFileSync('path/to/key.pem'),
//     ca: [fs.readFileSync('path/to/ca.pem')],
//     rejectUnauthorized: true
//   },
  policies: {
    loadBalancing: new cassandra.policies.loadBalancing.RoundRobinPolicy() // Politique de répartition de charge
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
