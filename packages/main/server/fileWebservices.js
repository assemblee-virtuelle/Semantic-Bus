'use strict'

var user_lib = require('@semantic-bus/core/lib/user_lib')
var file_lib = require('@semantic-bus/core/lib/file_lib_scylla')


module.exports = function (router) {
  // router.delete('/files/:fileId', async (req, res, next) => {
  //   try {
  //     let file = await file_lib.get(req.params.fileId);
  //     res.sendFile(file.pathFile);
  //   } catch (error) {
  //     next(error)
  //   }
  // });

  router.get('/file/:fileId', async (req, res, next) => {
    try {
      let file = await file_lib.get(req.params.fileId)
      res.send(file);
    } catch (error) {
      next(error)
    }
  });
  router.get('/file/:fileId/download', async (req, res, next) => {
    try {
      let file = await file_lib.get(req.params.fileId);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(file.binary);
    } catch (error) {
      next(error);
    }
  });
}
