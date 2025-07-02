const config = require('../getConfiguration.js')(); // Loading configuration
const { DynamoDBClient, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

let dynamoDBClients = null; // Variable to store the initialized clients

// Function to initialize DynamoDB client
const initializeDynamoDB = async () => {
  // console.log('INIT initializeDynamoDB');
  if (dynamoDBClients) {
    // Return existing clients if already initialized
    return dynamoDBClients;
  }

  console.log('🔗 DynamoDB:', 'http://scylla:8000');

  try {
    // Initialize DynamoDB client
    const dynamodb = new DynamoDBClient({
      region: 'us-east-1',
      endpoint: 'http://scylla:8000',
      credentials: {
        accessKeyId: config.DYNAMODB.accessKeyId,
        secretAccessKey: config.DYNAMODB.secretAccessKey
      },
      maxAttempts: config.DYNAMODB.maxRetries || 3,
      requestTimeout: config.DYNAMODB.timeout || 5000
    });

    // Create DocumentClient for easier DynamoDB operations
    const docClient = DynamoDBDocumentClient.from(dynamodb, {
      marshallOptions: {
        convertEmptyValues: true
      }
    });

    // Test connection
    const data = await dynamodb.send(new ListTablesCommand({}));
    console.log('✅ Connected to DynamoDB');

    dynamoDBClients = { dynamodb, docClient };
    return dynamoDBClients;
  } catch (err) {
    console.error('❌ Failed to connect to DynamoDB', err);
    throw new Error('Failed to connect to DynamoDB');
  }
};

// Export a promise that resolves to the initialized clients
const dynamoDBClientsPromise = initializeDynamoDB();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('⚠️  DynamoDB connection closed');
  process.exit(0);
});

module.exports = dynamoDBClientsPromise; 