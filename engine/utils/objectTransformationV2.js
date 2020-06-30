'use strict'
// need NodeJs >=12

module.exports = {
  Intl: require('intl'),
  dotProp: require('dot-prop'),
  executeWithParams: function(source, pullParams, jsonTransformPattern, options) {
    let out = this.execute(source, pullParams, jsonTransformPattern, options)
    return out
  },

  execute: function(source, pullParams, jsonTransformPattern, options) {
    console.log('jsonTransformPattern',jsonTransformPattern);
    if (source == undefined) {
      return undefined;
    } else if (typeof jsonTransformPattern === 'string' || jsonTransformPattern instanceof String) {
      const regexpeEval = /^\=(.*)/gm;
      const arrayRegexEval = [...jsonTransformPattern.matchAll(regexpeEval)]
      if (arrayRegexEval.length > 0) {
        let patternEval = arrayRegexEval[0][1];
        const regexpeDot = /{(.*?)}/gm;
        const arrayRegexDot = [...patternEval.matchAll(regexpeDot)];
        for (const valueDot of arrayRegexDot) {
          let sourceDotValue = this.getValueFromSource(source,pullParams, valueDot[1]);
          if(typeof sourceDotValue === 'string' || sourceDotValue instanceof String){
            sourceDotValue = `'${sourceDotValue}'`
          }else if (typeof sourceDotValue === 'object') {
            sourceDotValue = 'JSON.parse(`' + JSON.stringify(sourceDotValue) + '`)';
          }
          patternEval = patternEval.replace(valueDot[0], sourceDotValue);
        }
        try {
          const evalResult = eval(patternEval);
          if(options  && options.evaluationDetail==true){
            return {eval:evalResult};
          }else{
            return evalResult;
          }
        } catch (e) {
          if(options  && options.evaluationDetail==true){
            // console.log('ERROR:',javascriptEvalString);
            return {
              error: 'Javascript Eval failed',
              errorDetail: {
                evalString: patternEval,
                cause: e.message
              }
            }
          }
        }
      } else {
        return this.getValueFromSource(source,pullParams, jsonTransformPattern);
      }
    } else if (Array.isArray(jsonTransformPattern)) {
      return sourceValue.map((r, i) => this.execute(r, jsonTransformPattern, options))
    } else {
      let out = {};
      for (const jsonTransformPatternKey in jsonTransformPattern) {
        // const jsonTransformPatternValue = jsonTransformPattern[jsonTransformPatternKey]
        out[jsonTransformPatternKey] = this.execute(source, pullParams, jsonTransformPattern[jsonTransformPatternKey], options)
      }
      return out
    }
  },
  getValueFromSource(source,pullParams, pattern) {
    if (pattern.localeCompare('$..') == 0) {
      return source;
    } else {
      let regexp = /\$\.(.*)/gm;
      let arrayRegex = [...pattern.matchAll(regexp)];
      let regexpPull = /\£\.(.*)/gm;
      let arrayRegexPull = [...pattern.matchAll(regexpPull)];
      if (arrayRegex.length > 0) {
        const dotPath = arrayRegex[0][1];
        return this.dotProp.get(source, dotPath);
      }else if (arrayRegexPull.length > 0) {
        const dotPath = arrayRegexPull[0][1];
        return this.dotProp.get(pullParams, dotPath);
      } else {
        return pattern;
      }
    }
  }
}
