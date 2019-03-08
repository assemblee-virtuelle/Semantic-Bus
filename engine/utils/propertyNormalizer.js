'use strict'

module.exports = {
  execute: function (treeSource) {
    let out

    if (Array.isArray(treeSource)) {
      out = treeSource.map(r => this.execute(r))
    } else if (treeSource instanceof Object) {
      out = {}
      for (let key in treeSource) {
        let newKey = key.replace(/\./g, '_')
        // console.log(key, newKey);
        out[newKey] = this.execute(treeSource[key])
      }
    } else {
      out = treeSource
    }
    // console.log(out);

    return out
  }
}
