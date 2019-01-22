"use strict";
class PromiseOrchestrator {
  constructor() {}

  execute(context, workFunction, paramArray, option, config) {
    //console.log('execute',paramArray);
    let executor = new PromisesExecutor(context, workFunction, paramArray, option, config);
    return executor.execute();
  }

}

//maxSametimeExecution,intervalBewtwenExecution,workFunction
class PromisesExecutor {
  constructor(context, workFunction, paramArray, option, config) {
    this.increment = 0;
    this.incrementResolved = 0;
    this.globalOut = new Array(paramArray.length);
    this.context = context;
    this.workFunction = workFunction;
    this.paramArray = paramArray;
    this.option = option || {};
    this.option.beamNb = this.option.beamNb || 1;
    this.config = config;
  }

  execute() {
    return new Promise((resolve, reject) => {
      this.initialPromiseResolve = resolve;
      this.initialPromiseReject = reject;
      //console.log("length",this.paramArray.length);
      for (let i = 0; i < Math.min(this.option.beamNb, this.paramArray.length); i++) {
        //console.log("i",i);
        this.incrementExecute();
      }
    });
  }

  incrementExecute() {
    try {

      //if (this.config != undefined && this.config.quietLog != true) {
      //process.stdout.clearLine();
      //process.stdout.cursorTo(0);
      //process.stdout.write(this.incrementResolved,'/',this.increment); // end the line
      //}
      if (this.incrementResolved == this.paramArray.length) {
        //console.log('END',  this.globalOut);
        //console.log('END
        this.initialPromiseResolve(this.globalOut);
      } else if (this.increment < this.paramArray.length) {
        //console.log('new PromiseExecutor',this.increment);
        let promiseExecutor = new PromiseExecutor(this.context, this.workFunction, this.paramArray, this.option, this.increment);
        this.increment++;
        promiseExecutor.execute().then((currentOut) => {
          //console.log("currentOut",currentOut);
          //console.log('Promise Sucess');
          this.globalOut[currentOut.index] = currentOut.value;
          this.incrementResolved++;
          setTimeout(this.incrementExecute.bind(this),1)
          //this.incrementExecute();
        }).catch((e) => {
          //console.log('Promise Error');
          //this.globalOut[currentOut.index]=currentOut.value;
          this.globalOut[currentOut.index] = currentOut.value;
          this.incrementResolved++;

          setTimeout(this.incrementExecute.bind(this),1)
          //this.incrementExecute();

        }).then(() => {
          //console.log('XX');
          // this.increment++;
          // this.incrementExecute(context,workFunction,paramArray,option);
        });


      }
    } catch (e) {
      //console.log(e);
      this.initialPromiseReject(e);
    }

  }
}

class PromiseExecutor {
  constructor(context, workFunction, paramArray, option, index) {
    this.context = context;
    this.workFunction = workFunction;
    this.paramArray = paramArray;
    this.option = option;
    this.index = index;
  }

  execute() {
    if (this.config != undefined && this.config.quietLog != true) {
      console.log("index / length : ", this.index,'/',this.paramArray.length);
    }

    return new Promise((resolve, reject) => {
      let currentParams = this.paramArray[this.index];
      //console.log('apply',currentParams);
      try {
        this.workFunction.apply(this.context, currentParams).then((currentOut) => {
          //this.globalOut[this.index] = currentOut;
          resolve({
            index: this.index,
            value: currentOut
          });
        }).catch((e) => {

          resolve({
            index: this.index,
            value: {
              'error': e
            }
          });
        }).then(() => {
          // this.increment++;
          // this.incrementExecute(context,workFunction,paramArray,option);
        })
      } catch (e) {
        reject({
          index: this.index,
          value: {
            'error': e
          }
        });
      }
    });
  }
}

module.exports = PromiseOrchestrator;
