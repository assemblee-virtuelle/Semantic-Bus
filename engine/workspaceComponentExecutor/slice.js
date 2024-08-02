'use strict';
class Slice {
    constructor () {
        this.stringReplacer = require('../utils/stringReplacer.js');
    }
    pull(data, flowData, pullParams) {
        return new Promise((resolve, reject) => {
            try {
                var result;

                let usableData = flowData[0].data

                let startIndex = data.specificData.startIndex ? Number(this.stringReplacer.execute(data.specificData.startIndex, pullParams, usableData)) : 0;

                let endIndex = 0;
                if(data.specificData.endIndex){
                    endIndex =  Number(this.stringReplacer.execute(data.specificData.endIndex, pullParams, usableData));
                } else if (usableData.length && usableData.length > 0){
                    endIndex = usableData.length;
                }

                if(usableData == undefined){
                    result = undefined;
                }
                else {
                    console.log('usableData',usableData.length,startIndex,endIndex)
                    if (Array.isArray(usableData)){
                        result = usableData.slice(startIndex,endIndex);
                    }
                    else{
                        throw new Error("Data are not an array structure.")
                    }
                    console.log('result',result.length)
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
module.exports = new Slice()