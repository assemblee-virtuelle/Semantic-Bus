module.exports = function (router, amqpClient) {
  this.amqpClient = amqpClient
  const fragment_lib = require('../../core/lib/fragment_lib_scylla')

  router.get('/fragment/:id', function (req, res, next) {
    console.log('req.params.id',req.params.id)
    fragment_lib.get(req.params.id).then((frag) => {
      res.json(frag)
    }).catch(e => {
      next(e)
    })
  })
}
