'use strict'

var user_lib = require('@semantic-bus/core/lib/user_lib')
var file_lib = require('@semantic-bus/core/lib/file_lib_scylla')
var processModel = require('@semantic-bus/core/models').process
var auth_lib_jwt = require('@semantic-bus/core/lib/auth_lib')
var config = require('../config.json')

// SÉCURITÉ : vérifie que le user (token) a accès au fichier.
// Le fichier porte un processId → process → workflowId (workspace) ; on autorise
// si le user est admin, ou owner/editor de ce workspace. Ferme l'IDOR de lecture
// (tout user authentifié pouvait lire n'importe quel fichier par id).
async function assertFileAccess(req, file) {
  if (!file || !file.processId) return true // fichier cache sans process : accès JWT
  const token = req.body.token || req.query.token || req.headers['authorization']
  if (!token) return false
  const decoded = auth_lib_jwt.get_decoded_jwt(token.substring(4, token.length))
  if (!decoded || !decoded.iss) return false

  const process = await processModel.getInstance().model
    .findOne({ _id: file.processId })
    .select('workflowId')
    .lean()
    .exec()
    .catch(() => null)
  if (!process || !process.workflowId) return false

  const result = await user_lib.getWithRelations(decoded.iss, config)
  if (!result) return false
  if (result.admin) return true
  const workspaceId = process.workflowId.toString()
  // Accès réservé aux owners/editors du workspace du workflow lié au fichier.
  return (result.workspaces || []).some(w =>
    w.workspace && w.workspace._id &&
    w.workspace._id.toString() === workspaceId &&
    (w.role === 'owner' || w.role === 'editor')
  )
}

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
      const allowed = await assertFileAccess(req, file)
      if (!allowed) {
        return res.status(403).send({ success: false, message: 'No right' })
      }
      res.send(file);
    } catch (error) {
      next(error)
    }
  });
  router.get('/file/:fileId/download', async (req, res, next) => {
    try {
      let file = await file_lib.get(req.params.fileId);
      const allowed = await assertFileAccess(req, file)
      if (!allowed) {
        return res.status(403).send({ success: false, message: 'No right' })
      }
      res.setHeader('Content-Type', 'application/octet-stream');
      res.send(file.binary);
    } catch (error) {
      next(error);
    }
  });
}
