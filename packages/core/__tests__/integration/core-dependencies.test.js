const { describe, test, expect } = require('@jest/globals');

describe('Core Dependencies with Mocks', () => {
  test('should import core helpers without external dependencies', async () => {
    // Test import des helpers du core
    const ArraySegmentator = require('@semantic-bus/core/helpers/ArraySegmentator');
    expect(ArraySegmentator).toBeDefined();
    
    const segmentator = new ArraySegmentator();
    const result = segmentator.segment([1, 2, 3, 4, 5], 2);
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  test('should use mocked mongoose', async () => {
    const mongoose = require('mongoose');
    expect(mongoose).toBeDefined();
    expect(mongoose.model).toBeDefined();
    
    // Test que mongoose est bien mocké
    const TestModel = mongoose.model('Test', new mongoose.Schema({}));
    const instance = new TestModel({ name: 'test' });
    expect(instance._id).toMatch(/^mock-id-/);
  });

  test('should use mocked cassandra-driver', () => {
    const cassandra = require('cassandra-driver');
    expect(cassandra).toBeDefined();
    expect(cassandra.Client).toBeDefined();
    
    const client = new cassandra.Client({});
    expect(client.connect).toBeDefined();
    expect(typeof client.connect).toBe('function');
  });

  test('should use mocked AWS SDK', () => {
    const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
    const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
    
    expect(DynamoDBClient).toBeDefined();
    expect(DynamoDBDocumentClient).toBeDefined();
    
    const client = new DynamoDBClient({});
    expect(client.send).toBeDefined();
  });

  test('should use real JWT and BCrypt (no mocking needed)', async () => {
    // JWT-simple - librairie purement computationnelle
    const jwt = require('jwt-simple');
    expect(jwt.encode).toBeDefined();
    expect(jwt.decode).toBeDefined();
    
    // Test avec les vraies fonctions (pas de mock)
    const payload = { user: 'test', exp: Math.floor(Date.now() / 1000) + 3600 };
    const token = jwt.encode(payload, 'secret');
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    
    const decoded = jwt.decode(token, 'secret');
    expect(decoded.user).toBe('test');
    
    // BCrypt - librairie purement computationnelle
    const bcrypt = require('bcryptjs');
    expect(bcrypt.hash).toBeDefined();
    expect(bcrypt.compare).toBeDefined();
    
    // Test avec les vraies fonctions (pas de mock)
    const hash = await bcrypt.hash('password', 1); // saltRounds=1 pour rapidité
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
    
    const isValid = await bcrypt.compare('password', hash);
    expect(isValid).toBe(true);
    
    const isInvalid = await bcrypt.compare('wrongpassword', hash);
    expect(isInvalid).toBe(false);
  });

  test('should import core data treatment library', () => {
    const dataTraitment = require('@semantic-bus/core/dataTraitmentLibrary');
    expect(dataTraitment).toBeDefined();
    expect(dataTraitment.type).toBeDefined();
  });

  test('should import core lib modules without connecting to external services', () => {
    // Ces imports ne devraient pas déclencher de vraies connexions
    const authLib = require('@semantic-bus/core/lib/auth_lib');
    expect(authLib).toBeDefined();
    
    // Test que les méthodes sont disponibles
    expect(authLib.create).toBeDefined();
    expect(authLib.security_API).toBeDefined();
  });
}); 