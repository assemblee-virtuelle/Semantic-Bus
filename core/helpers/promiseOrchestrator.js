"use strict";
class PromiseOrchestrator {
  constructor() {}

  execute(context, workFunction, paramArray, option, config) {
    // console.log('execute',paramArray);
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
    this.option.beamNb = parseInt(this.option.beamNb);
    if(isNaN(this.option.beamNb)){
      throw new Error("beamNb have to be a number")
    }
    this.config = config;
  }

  execute() {
    return new Promise((resolve, reject) => {
      this.initialPromiseResolve = resolve;
      this.initialPromiseReject = reject;
      // console.log("length",this.paramArray.length);
      try {
        if(this.paramArray.length==0){
          this.initialPromiseResolve([]);
        }else{
          for (let i = 0; i < Math.min(this.option.beamNb, this.paramArray.length); i++) {
            // console.log("i",i);
            this.incrementExecute();
          }
        }
      } catch (e) {
        this.initialPromiseReject(e);
      }
    });
  }

  incrementExecute() {
    try {
      if (this.incrementResolved == this.paramArray.length) {
        // console.log('this.globalOut',this.globalOut);
        this.initialPromiseResolve(this.globalOut);
      } else if (this.increment < this.paramArray.length) {
        //console.log('new PromiseExecutor',this.increment);
        let promiseExecutor = new PromiseExecutor(this.context, this.workFunction, this.paramArray, this.option, this.increment);
        this.increment++;
        promiseExecutor.execute().then((currentOut) => {
          //console.log("currentOut",currentOut);
          //console.log('Promise Sucess');
          this.globalOut[currentOut.index] = currentOut==undefined?undefined:currentOut.value;
          this.incrementResolved++;
          setTimeout(this.incrementExecute.bind(this),1)
          //this.incrementExecute();
        }).catch((e) => {
          console.error('Promise Orchestrator Error',e);
          //this.globalOut[currentOut.index]=currentOut.value;
          this.globalOut[e.index] = e.value;
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
    // console.log('PromiseExecutor : execute');
    if (this.config != undefined && this.config.quietLog != true) {
      // console.log("index / length : ", this.index,'/',this.paramArray.length);
    }

    return new Promise((resolve, reject) => {
      let currentParams = this.paramArray[this.index];
      // console.log('apply',currentParams);
      try {
        this.workFunction.apply(this.context, currentParams).then((currentOut) => {
          // console.log('Promise Executor resolve');
          //this.globalOut[this.index] = currentOut;
          resolve({
            index: this.index,
            value: currentOut
          });
        }).catch((e) => {
          // console.log('Promise Executor reject');
          resolve({
            index: this.index,
            value: {
              'error': e.message
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
            'error': e.message
          }
        });
      }
    });
  }
}

module.exports = PromiseOrchestrator;
