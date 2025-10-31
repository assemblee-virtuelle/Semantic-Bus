'use strict';

module.exports = {
  execute: function (treeSource) {
    let out;

    if (Array.isArray(treeSource)) {
      out = treeSource.map(r => this.execute(r));
    } else if (treeSource instanceof Date) {
      out = treeSource;
    } else if (Buffer.isBuffer(treeSource)) {
      out = treeSource;
    } else if (treeSource instanceof RegExp) {
      out = treeSource;
    } else if (treeSource instanceof Map) {
      out = treeSource;
    } else if (treeSource instanceof Set) {
      out = treeSource;
    } else if (treeSource?.constructor?.name === 'ObjectID' || treeSource?.constructor?.name === 'ObjectId') {
      out = treeSource;
    } else if (treeSource instanceof Object) {
      out = {};
      for (const key in treeSource) {
        const newKey = key.replace(/\./g, '_');
        // console.log(key, newKey);
        out[newKey] = this.execute(treeSource[key]);
      }
    } else {
      out = treeSource;
    }
    // console.log(out);

    return out;
  }
};
