
var should = require('should');
var user = require('../../../lib').user;
var User = require('../../../models').user;
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

describe('User test', function () {
  // User.remove().exec();
  var userId;
  it('should create a new user', function (done) {
    this.timeout(15000);
    user.create({
      user: {
        email: 'user@semanticbusss.com',
        password: "test1234",
        passwordConfirm : "test1234",
        name: 'semantic bus',
        job: 'developpeur',
        society: 'Together SAS',
        workspace: [],

      }
    }).then(function(user) {
      should.exists(user);
      userId = user._id;
      done()
    })
  })

  // should fail if uncomment 
  // it('should create a new user', function (done) {
  //   this.timeout(15000);
  //   user.create({
  //     user: {
  //       email: 'user@semanticbus.com',
  //       password: "test1234",
  //       passwordConfirm : "test1234",
  //       name: 'semantic bus',
  //       job: 'developpeur',
  //       society: 'Together SAS',
  //       workspace: [],

  //     }
  //   }).then(function(user) {
  //     should.exists(user);
  //     userId = user._id;
  //     done()
  //   })
  // })

  it('list all user', function (done) {
    this.timeout(15000);
    user.get_all({}).then(function(users) {
      should.exists(users);
      done()
    })
  })

  it('get one user', function (done) {
    this.timeout(15000);
    user.get({filter: {email: 'user@semanticbus.com'}}).then(function(user) {
      should.exists(user);
      console.log(user)
      done()
    })
  })

   it('get update one user', function (done) {
    this.timeout(15000);
    user.update(userId, {user: {job: 'CTO/CEO Together',email:'user@semanticbus.fr' }}).then(function(user) {
      should.exists(user);
      done()
    }).catch(function(err){
      done(err)
    })
  })

});
