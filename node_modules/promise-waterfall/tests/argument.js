var waterfall = require("../index.js"),
    Promise = require("promise"),
    Q = require("q"),
    B = require("bluebird"),
    chai = require("chai"),
    expect = chai.expect;

describe("Malform argument - string", function() {
  it("should throw an Error", function(){
    waterfall("a")
    .catch(function(err){
      expect(err).to.be(String);
    })
  })
});

describe("Malform argument - empty array", function() {
  it("should throw an Error", function() {
    waterfall([])
    .catch(function(err){
      expect(err).to.be(String);
    });
  })
});

describe("Malform argument - first function doesn't return promise", function() {
  it("should throw an Error", function(){
    var queue = [
      function(){
        return 1;
      },
      function(){
        return 2;
      }
    ];
    waterfall(queue)
    .catch(function(err){
      expect(err).to.equal("Function return value should be a promise.");
    })
  })
});

describe("Malform argument - second function doesn't return promise", function() {
  it("should throw an Error", function(){
    var queue = [
      function(){
        return new Promise(function(resolve){
          resolve(1);
        })
      },
      function(){
        return "I want error.";
      },
      function(){
        return "should not reach here.";
      }
    ];
    waterfall(queue)
    .catch(function(err){
      console.log(err);
      expect(err).to.equal("Function return value should be a promise.");
    })
  })
});

describe("Normal argument - array with one function", function() {
  it("should be ok and log 'Test'", function() {
    waterfall([
      function(){
        console.log("Test"); 
        return "ok";
      }
    ]).then(function(res){
      expect(res).to.equal("ok");
    })
  })
})
