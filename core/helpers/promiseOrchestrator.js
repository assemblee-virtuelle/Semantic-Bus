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

  async incrementExecute() {
    try {
      // console.log(this.option);
      let continueChekresult= true;
      if(this.option && this.option.continueCheckFunction){
        // console.log('continueCheckFunction call');

        continueChekresult = await this.option.continueCheckFunction()
        // console.log(continueChekresult);
      }

      // console.log('continueChekresult',continueChekresult);
      if(continueChekresult){
        if (this.incrementResolved == this.paramArray.length) {
          // console.log('this.globalOut',this.globalOut);
          this.promiseResolved==true;
          this.initialPromiseResolve(this.globalOut);
        } else if (this.increment < this.paramArray.length) {
          //console.log('new PromiseExecutor',this.increment);
          if (this.config != undefined && this.config.quietLog != true) {
            // console.log(`promiseOrchestrator ${this.increment}/${this.paramArray.length}`);
          }
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
      }else{
        if(this.increment==this.incrementResolved && this.promiseResolved!=true){
          this.promiseResolved==true;
          // console.log('No Continue and resolve out',this.globalOut);
          this.initialPromiseResolve(this.globalOut);
        }

      }

    } catch (e) {
      //console.log(e);
      this.promiseResolved==true;
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
      console.log("index / length : ", this.index,'/',this.paramArray.length);
    }

    return new Promise(async (resolve, reject) => {
      let currentParams = this.paramArray[this.index];
      // console.log('apply',currentParams);
      try {
        let currentOut=  await this.workFunction.apply(this.context, currentParams);
        resolve({
          index: this.index,
          value: currentOut
        });
      } catch (e) {
        console.error(e);
        resolve({
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
