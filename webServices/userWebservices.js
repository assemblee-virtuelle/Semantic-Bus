const User = require('./models/userModel');
const config = require('./models/configuration');
const mLabPromise = require('./mLabPromise');

module.exports = function(router) {

  router.get('/users', function(req, res) {
    console.log(req.params.id)
    User.all(function(err, users){
      res.send(users)
    }) 
  });

  router.get('/users/:id', function(req, res) {
    console.log(req.params.id)
    User.findOne({
      where: {
        _id: req.params.id
      }
    }, function(err, user) {
      console.log(user);
      if (user) {
        res.send({
          user: user,
        });
      }
    })
  });

  router.put('/users/:id', function(req, res) {
    User.findOne({
      where: {
        email: req.body.email
      }
    }, function(err, user) {
      if (user) {
        console.log("in false")
        console.log(user);
        res.send(false)
      } else {
        User.findOne({
          where: {
            _id: req.params.id
          }
        }, function(err, user) {
          if (user) {
            user.email = req.body.email
            user.save(function() {
              res.send({
                user: user,
              });
            })
          }
        })
      }
    })
  });

  router.get('/cloneDatabase', function(req, res) {
    mLabPromise.cloneDatabase().then(data => {
      res.json(data)
    });
  });
}
