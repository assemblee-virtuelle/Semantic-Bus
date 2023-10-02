'use strict';
class Split {
    constructor () {
        this.objectTransformation = require('../utils/objectTransformationV2.js');
    }
    pull(data, flowData, pullParams) {
        return new Promise((resolve, reject) => {
            try {        
                var result = []

                let usableData = flowData[0].data

                let startIndex = data.specificData.startIndex ? data.specificData.startIndex : 0;
                // console.log("length of data : ",usableData.length);
                let endIndex = data.specificData.endIndex ? data.specificData.endIndex : usableData.length;

                if (Array.isArray(usableData)){
                    let jsString = `${flowData[0].data.slice(startIndex,endIndex)}`;
                    // console.log("jstring : ", jsString);
                    result = this.objectTransformation.execute(usableData,pullParams,jsString);
                }
                else{
                  throw new Error("Data are not in an array structure.")
                }

                resolve({
                    data: result
                })
            } catch (e) {
                reject(e)
            }
        })
    }
}
module.exports = new Split()