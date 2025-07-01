// Mock pour core/model_schemas/file_schema_scylla.js
module.exports = jest.fn().mockImplementation((data) => ({
  id: 'mock-schema-id-12345',
  filename: data?.filename || 'mock-schema.txt',
  content: data?.content || 'mock schema content',
  size: data?.size || 1024,
  mimetype: data?.mimetype || 'text/plain',
  created_at: new Date(),
  updated_at: new Date(),
  validate: jest.fn().mockReturnValue(true),
  toJSON: jest.fn().mockReturnValue({
    id: 'mock-schema-id-12345',
    ...data
  })
}));