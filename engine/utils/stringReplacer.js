'use strict'
module.exports = {
  dotProp: require('dot-prop'),
  execute: function (rawString, params, flow, stringifyOption) {
    // console.log("stringReplacer",rawString, params,flow,stringifyOption);
    let processingRawString = rawString
    if (params != undefined) {
      const regex = /{(\£.*?)}/g
      const elementsRaw = processingRawString.match(regex)
      if (elementsRaw != null) {
        for (let match of elementsRaw) {
          const objectKey = match.slice(3, -1)
          let value = this.dotProp.get(params, objectKey)
          // console.log(value);
          // console.log(JSON.stringify(value));
          // processingRawString = processingRawString.replace(match, JSON.stringify(this.dotProp.get(params, objectKey)));
          if (stringifyOption == true) {
            try {
              if (typeof value !== 'string') {
                value = JSON.stringify(value)
              }
            } catch (e) {

            }
          }

          processingRawString = processingRawString.replace(match, value)
        }
      }
    }
    if (flow != undefined) {
      // console.log('flow',flow);
      const regex = /{(\$.*?)}/g
      const elementsRaw = processingRawString.match(regex)
      if (elementsRaw != null) {
        for (let match of elementsRaw) {
          const objectKey = match.slice(3, -1)
          let value = this.dotProp.get(flow, objectKey)
          if (stringifyOption == true) {
            try {
              if (typeof value !== 'string') {
                value = JSON.stringify(value)
              }
            } catch (e) {

            }
          }
          processingRawString = processingRawString.replace(match, value)
        }
      }
    }
    return processingRawString
  }
}
