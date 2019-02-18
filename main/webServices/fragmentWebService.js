module.exports = function (router, amqpClient) {
  this.amqpClient = amqpClient
  const fragment_lib = require('../../core/lib/fragment_lib')
  const errorHandling = require('./errorHandling')
  
  router.get('/fragment/:id', function (req, res, next) {
    fragment_lib.get(req.params.id).then((frag) => {
      res.json(frag)
    }).catch(e => {
      errorHandling(e, res)
    })
  })
}
