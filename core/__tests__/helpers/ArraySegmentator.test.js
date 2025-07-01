const ArraySegmentator = require('../../helpers/ArraySegmentator.js');

describe('ArraySegmentator', () => {
  let segmentator;

  beforeEach(() => {
    segmentator = new ArraySegmentator();
  });

  describe('segment method', () => {
    test('should create segments of specified length', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const segmentLength = 3;
      
      const result = segmentator.segment(input, segmentLength);
      
      expect(result).toEqual([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [10]
      ]);
    });

    test('should handle empty array', () => {
      const input = [];
      const segmentLength = 3;
      
      const result = segmentator.segment(input, segmentLength);
      
      expect(result).toEqual([]);
    });

    test('should handle array smaller than segment length', () => {
      const input = [1, 2];
      const segmentLength = 5;
      
      const result = segmentator.segment(input, segmentLength);
      
      expect(result).toEqual([[1, 2]]);
    });

    test('should handle segment length of 1', () => {
      const input = [1, 2, 3];
      const segmentLength = 1;
      
      const result = segmentator.segment(input, segmentLength);
      
      expect(result).toEqual([[1], [2], [3]]);
    });
  });
}); 