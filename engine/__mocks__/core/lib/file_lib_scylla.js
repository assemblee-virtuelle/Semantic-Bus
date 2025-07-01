// Mock pour core/lib/file_lib_scylla.js
module.exports = {
  create: jest.fn().mockResolvedValue({
    id: 'mock-file-id-12345',
    filename: 'mock-file.txt',
    content: 'mock content',
    size: 1024,
    mimetype: 'text/plain',
    created_at: new Date()
  }),
  get: jest.fn().mockResolvedValue({
    id: 'mock-file-id-12345',
    filename: 'mock-file.txt',
    content: 'mock content',
    size: 1024,
    mimetype: 'text/plain',
    created_at: new Date()
  }),
  update: jest.fn().mockResolvedValue({
    id: 'mock-file-id-12345',
    filename: 'updated-file.txt',
    content: 'updated content',
    size: 2048,
    mimetype: 'text/plain',
    updated_at: new Date()
  }),
  delete: jest.fn().mockResolvedValue(true),
  list: jest.fn().mockResolvedValue([
    {
      id: 'mock-file-id-1',
      filename: 'file1.txt',
      size: 1024
    },
    {
      id: 'mock-file-id-2',
      filename: 'file2.txt',
      size: 2048
    }
  ]),
  exists: jest.fn().mockResolvedValue(true)
};