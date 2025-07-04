'use strict';

class IncrementTable {
    constructor () {
        this.stringReplacer = require('../utils/stringReplacer.js');
    }
    pull(data, flowData, pullParams) {
        return new Promise((resolve, reject) => {
            try {
                var result = []

                let usableData = flowData ? flowData[0].data : [];

                let startIndex = data.specificData.startIndex ? Number(this.stringReplacer.execute(data.specificData.startIndex, pullParams, usableData)) : 0;

                let endIndex = 0;
                if(data.specificData.endIndex){
                    endIndex =  Number(this.stringReplacer.execute(data.specificData.endIndex, pullParams, usableData));
                } 

                let stepIndex = data.specificData.range ? Number(this.stringReplacer.execute(data.specificData.range, pullParams, usableData)) : 1;

                const arrayRange = (start, end, step) => {
                    let output = [];
 
                    for (let i = start; i <= end; i += step) {
                        output.push(i);
                    }

                    return output;
                };

                result = arrayRange(startIndex,endIndex,stepIndex);
                
                resolve({
                    data: result
                })
            } catch (e) {
                reject(e)
            }
        })
    }
}
module.exports = new IncrementTable()