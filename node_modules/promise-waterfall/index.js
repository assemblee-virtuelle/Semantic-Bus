var Promise = require("promise");

function isPromise(obj) {
  return obj && typeof obj.then === 'function';
}

// return a rejected promise when error occurs
function reject(err) {
  return new Promise(function(resolve, reject){
    return reject(new Error("promise-waterfall: " + err));
  });
}

// if argument function doesn't return a promise
// return a promise resolving the return value
function resolve(val) {
  return new Promise(function(resolve, reject){
    return resolve(val);
  });
}

function waterfall(list) {
  // malformed argument
  list = Array.prototype.slice.call(list);
  if (!Array.isArray(list)                    // not an array
      || typeof list.reduce !== "function"    // update your javascript engine
      || list.length < 1                      // empty array
     ) {
    return reject("Array with reduce function is needed.");
  }

  if (list.length == 1) {
    if (typeof list[0] != "function")
      return reject("First element of the array should be a function, got " + typeof list[0]);
    return resolve(list[0]());
  }

  return list.reduce(function(l, r){
    // first round
    // execute function and return promise
    var isFirst = (l == list[0]);
    if (isFirst) {
      if (typeof l != "function")
        return reject("List elements should be function to call.");

      var lret = l();
      if (!isPromise(lret))
        return reject("Function return value should be a promise.");
      else
        return lret.then(r);
    }

    // other rounds
    // l is a promise now
    // priviousPromiseList.then(nextFunction)
    else {
      if (!isPromise(l))
        reject("Function return value should be a promise.");
      else 
        return l.then(r);
    }
  });
}

module.exports = waterfall;
