// Mock pour core/dataTraitmentLibrary/file_convertor.js
module.exports = {
  data_from_file: jest.fn().mockResolvedValue({
    content: 'mock file content',
    type: 'text/plain',
    size: 1024
  })
};