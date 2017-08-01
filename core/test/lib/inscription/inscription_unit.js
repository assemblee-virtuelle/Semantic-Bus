var should = require('should');
var inscription = require('../../../lib').inscription;
var User = require('../../../models').user;


// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------    

describe('Inscription test', function () {
    it('should create a new inscription', function (done) {
        User.remove().exec();
        this.timeout(15000);
        inscription.create({
            user: {
                email: 'users21@semanticbus.com',
                password: "test1234",
                passwordConfirm: "test1234",
                name: 'semantic bus',
                job: 'developpeur',
                society: 'Together SAS',
                workspace: [],
            }
        }).then(function (result) {
            should.exists(result);
            done();
        })
    });

    it('should\'nt create a new inscription', function (done) {
        User.remove().exec();
        this.timeout(15000);
        inscription.create({}).then(function (result) {
            should.exists(result);
            done();
        })
    })
})