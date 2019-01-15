"use strict";
class PromiseOrchestrator {
  constructor() {
  }

  execute(workFunction,paramArray,option){
    let executor= new PromiseExecutor();
    return executor.execute(workFunction,paramArray,option)
  }

}

//maxSametimeExecution,intervalBewtwenExecution,workFunction
class PromiseExecutor {
  constructor() {
    this.increment=0;
    this.globalOut=[];
  }

  execute(context,workFunction,paramArray,option){
    return new Promise((resolve,reject)=>{
      this.initialPromiseResolve=resolve;
      this.initialPromiseReject=reject;
      this.incrementExecute(context,workFunction,paramArray,option);
    });
  }
  incrementExecute(context,workFunction,paramArray,option){

    try{
      if(this.globalOut.length==paramArray.length){
        //console.log('END');
        this.initialPromiseResolve(this.globalOut);
      }else{
        //console.log('incrementExecute',this.globalOut.length,paramArray.length);
        let currentParams=paramArray[this.increment];
        //console.log('apply',currentParams);
        let currentOut= workFunction.apply(context,currentParams).then((currentOut)=>{
          //console.log('sucess exection');
          this.globalOut.push(currentOut);
          this.increment++;
          this.incrementExecute(context,workFunction,paramArray,option);
        }).catch((e)=>{
          // console.log('fail exection');
          this.globalOut.push({'$error':e});
          console.log('Orchestrator Error',e);
          this.increment++;
          this.incrementExecute(context,workFunction,paramArray,option);
        }).then(()=>{
          // this.increment++;
          // this.incrementExecute(context,workFunction,paramArray,option);
        })
      }
    }catch(e){
      //console.log(e);
      this.initialPromiseReject(e);
    }

  }
}

module.exports = PromiseOrchestrator;
