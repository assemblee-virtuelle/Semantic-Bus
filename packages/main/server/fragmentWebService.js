module.exports = function (router, amqpClient) {
  this.amqpClient = amqpClient
  const fragment_lib = require('@semantic-bus/core/lib/fragment_lib_scylla')

  router.get('/fragment/:id', function (req, res, next) {
    fragment_lib.get(req.params.id).then((frag) => {
      res.json(frag)
    }).catch(e => {
      res.status(500).json({
        error: e.message
      })
    })
  })
}
