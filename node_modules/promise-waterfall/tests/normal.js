var w = require("../index"),
    Q = require("q"),
    Promise = require("promise"),
    B = require("bluebird"),
    list = [];

var chai = require("chai"),
    expect = chai.expect,
    should = chai.should();

describe("Normal", function(){
  it("should log every 2 secs", function(done){
    // test compatibility with Q.js
    for (var i = 0; i < 2; i++) {
      list.push(function(params){
        var deferred = Q.defer();
        Q.delay(1000).then(
          function (){
            var k, time;
            if (!params) k = 0;
            else k = params.index;
            time = new Date();
            console.log("Executing function(with Q) " + k + " @ " + time.toString());
            deferred.resolve({
              index: ++k,
              time: time
            });
          }
        );
        return deferred.promise;
      })
    }

    // test compatibility for promise.js
    for (var i = 0; i < 3; i++) {
      list.push(function(params){
        return new B(function(resolve, reject){
          Q.delay(2000).then(
            function (){
              var k, time;
              if (!params) k = 0;
              else k = params.index;
              time = new Date();
              console.log("Executing function(with Promise) " + k + " @ " + time.toString());
              resolve({
                index: ++k,
                time: time
              });
            }
          )
        })
      })
    }
    w(list).then(function(params){
      params["index"].should.equal(list.length);
      done();
    })
    .catch(function(err){
      console.log(err);
      done(err);
    })

  })
})
