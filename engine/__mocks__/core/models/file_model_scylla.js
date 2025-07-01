// Mock pour core/models/file_model_scylla.js
module.exports = jest.fn().mockImplementation((data) => ({
  id: 'mock-file-id-12345',
  filename: data?.filename || 'mock-file.txt',
  content: data?.content || 'mock content',
  size: data?.size || 1024,
  mimetype: data?.mimetype || 'text/plain',
  created_at: new Date(),
  updated_at: new Date(),
  save: jest.fn().mockResolvedValue({
    id: 'mock-file-id-12345',
    ...data
  }),
  delete: jest.fn().mockResolvedValue(),
  update: jest.fn().mockResolvedValue({
    id: 'mock-file-id-12345',
    ...data
  })
}));