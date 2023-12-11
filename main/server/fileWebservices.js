'use strict'

var user_lib = require('../../core/lib/user_lib')
var file_lib = require('../../core/lib/file_lib')

module.exports = function (router) {
  router.delete('/files/:fileId', async (req, res, next) => {
    try {
      let file = await file_lib.get(req.params.fileId);
      res.sendFile(file.pathFile);
    } catch (error) {
      next(error)
    }
  });
}
