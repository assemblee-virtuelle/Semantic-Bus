module.exports = function (router, amqpClient) {
  this.amqpClient = amqpClient
  const fragment_lib = require('../../core/lib/fragment_lib')
  const fragment_lib_scylla = require('../../core/lib/fragment_lib_scylla')

  router.get('/fragment/:id', function (req, res, next) {
    // console.log('---------ALLLO')
    // const fragment_scylla= fragment_lib_scylla.get(req.params.id).then((frag)=>{
    //   // console.log('__________fragment', frag)
    //   // res.json(frag)
    // }).catch(e => {
    //   // next(e)
    // })
    // console.log('req.params.id',req.params.id)
    fragment_lib_scylla.get(req.params.id).then((frag) => {
      // console.log('__________fragment', frag)
      res.json(frag)
    }).catch(e => {
      next(e)
    })
  })
}
