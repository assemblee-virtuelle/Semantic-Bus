// Mock de Mongoose pour les tests
const ObjectIdMock = class ObjectId {
  constructor(id) {
    this.id = id || 'mock-objectid-' + Math.random().toString(36).substr(2, 9);
  }
  toString() {
    return this.id;
  }
};

const SchemaMock = function(definition) {
  this.definition = definition;
};

SchemaMock.Types = {
  ObjectId: ObjectIdMock
};

const mongoose = {
  Schema: SchemaMock,
  
  model: jest.fn((name, schema) => {
    return class MockModel {
      constructor(data) {
        Object.assign(this, data);
        this._id = 'mock-id-' + Math.random().toString(36).substr(2, 9);
      }
      
      save() {
        return Promise.resolve(this);
      }
      
      static findOne() {
        return {
          lean: () => ({
            exec: () => Promise.resolve(null)
          }),
          exec: () => Promise.resolve(null)
        };
      }
      
      static find() {
        return {
          lean: () => ({
            exec: () => Promise.resolve([])
          }),
          exec: () => Promise.resolve([])
        };
      }
      
      static findById() {
        return {
          lean: () => ({
            exec: () => Promise.resolve(null)
          }),
          exec: () => Promise.resolve(null)
        };
      }
      
      static findByIdAndUpdate() {
        return {
          lean: () => ({
            exec: () => Promise.resolve(null)
          }),
          exec: () => Promise.resolve(null)
        };
      }
      
      static deleteOne() {
        return Promise.resolve({ deletedCount: 1 });
      }
      
      static deleteMany() {
        return Promise.resolve({ deletedCount: 0 });
      }
      
      static updateMany() {
        return Promise.resolve({ modifiedCount: 0 });
      }
      
      static create() {
        return Promise.resolve(new MockModel({}));
      }
    };
  }),
  
  createConnection: jest.fn(() => ({
    on: jest.fn(),
    model: jest.fn()
  })),
  
  connect: jest.fn(() => Promise.resolve()),
  
  Types: {
    ObjectId: ObjectIdMock
  },
  
  Promise: Promise
};

module.exports = mongoose; 