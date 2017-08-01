
var should = require('should');
var auth = require('../../../lib').authentification;
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

describe('Auth test', function () {
  var userId;
    it('should create a new authentification', function (done) {
        this.timeout(15000);
        auth.create({authentication : {email: 'user@semanticbus.com', password:'test1234'}}).then(function(result){
            should.exists(result);
            done();
        })
    })
    
})