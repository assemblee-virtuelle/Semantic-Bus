module.exports = function(router, amqpClient) {
  //TODO Ugly
  this.amqpClient = amqpClient;
  //this.stompClient = stompClient;
  var fragment_lib = require('../../core/lib/fragment_lib');
  var configuration = require('../configuration');

  router.get('/fragment/:id', function(req, res, next) {

    fragment_lib.get(req.params.id).then((frag) => {
      res.json(frag);
    }).catch(e => {
      next(e);
    });

  });


}
