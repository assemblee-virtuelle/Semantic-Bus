// Mock pour core/lib/fragment_lib_scylla.js
module.exports = {
  create: jest.fn().mockResolvedValue({
    id: 'mock-fragment-id-12345',
    content: 'mock fragment content',
    type: 'text',
    created_at: new Date()
  }),
  get: jest.fn().mockResolvedValue({
    id: 'mock-fragment-id-12345',
    content: 'mock fragment content',
    type: 'text',
    created_at: new Date()
  }),
  update: jest.fn().mockResolvedValue({
    id: 'mock-fragment-id-12345',
    content: 'updated fragment content',
    type: 'text',
    updated_at: new Date()
  }),
  delete: jest.fn().mockResolvedValue(true),
  list: jest.fn().mockResolvedValue([]),
  exists: jest.fn().mockResolvedValue(true)
};